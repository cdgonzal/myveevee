import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const DEFAULT_CARDS_PREFIX = "twin-card";
const DEFAULT_PROVIDER_ID = "us.stability.stable-image-control-structure-v1:0";
const INTEREST_LABELS = {
  prepare_for_care: "Get Back To Life",
  track_goals: "Move With Less Pain",
  support_loved_one: "Explore Advanced Care",
  just_exploring: "Wellness Journey",
};
const GOAL_ASPIRATIONS = {
  prepare_for_care: "Daily Life Comeback Focus",
  track_goals: "Comfort + Mobility Focus",
  support_loved_one: "Advanced Wellness Options",
  just_exploring: "Personal Wellness Focus",
};
const avatarRecipeContract = JSON.parse(
  await readFile(new URL("../../src/twinCard/avatarRecipeContract.json", import.meta.url), "utf8")
);
const avatarProviderContract = JSON.parse(
  await readFile(new URL("../../src/twinCard/avatarProviderContract.json", import.meta.url), "utf8")
);
const bedrockUsageContract = JSON.parse(
  await readFile(new URL("../../src/twinCard/bedrockUsageContract.json", import.meta.url), "utf8")
);

const s3 = new S3Client({});
const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const bedrock = new BedrockRuntimeClient({});

const args = parseArgs(process.argv.slice(2));
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const CARDS_BUCKET = args.bucket ?? process.env.CARDS_BUCKET ?? "myveevee-twin-card-767828748348-us-east-1";
const CARDS_TABLE = args.table ?? process.env.CARDS_TABLE ?? "myveevee-twin-card-cards";
const CARDS_PREFIX = args.cardsPrefix ?? process.env.CARDS_PREFIX ?? DEFAULT_CARDS_PREFIX;
const LIMIT = Number(args.limit ?? 3);
const PROVIDER_PRIORITY = readProviderPriority(args.provider ?? process.env.BEDROCK_IMAGE_MODEL_ID);
const MOCK = Boolean(args.mock);
const WRITE_S3 = args.writeS3 !== false;
const RUN_ID = args.runId ?? new Date().toISOString().replace(/[:.]/g, "-");
const LOCAL_DIR = path.resolve(args.outDir ?? path.join(repoRoot, "_sandbox", "twin-card-avatar-replays", RUN_ID));
const REPLAY_PREFIX = args.replayPrefix ?? `twin-card-replay/${avatarRecipeContract.version}/${RUN_ID}`;

await main();

async function main() {
  if (!Number.isFinite(LIMIT) || LIMIT < 1) {
    throw new Error("--limit must be a positive number.");
  }

  await mkdir(LOCAL_DIR, { recursive: true });
  const cards = await fetchRecentCards(LIMIT);

  if (!cards.length) {
    throw new Error(`No recent Twin Card rows with sourceImageS3Key found in ${CARDS_TABLE}.`);
  }

  const manifest = {
    schema: "twin-card-avatar-replay-v1",
    runId: RUN_ID,
    mock: MOCK,
    bucket: CARDS_BUCKET,
    table: CARDS_TABLE,
    replayPrefix: WRITE_S3 ? REPLAY_PREFIX : null,
    providerPriority: MOCK ? ["mock_copy_source"] : PROVIDER_PRIORITY,
    avatarRecipeId: avatarRecipeContract.id,
    avatarRecipeVersion: avatarRecipeContract.version,
    usageMetricsNote: "Bedrock Stability image InvokeModel responses do not include token usage. AWS prices these Stability Image Services per generation; replay captures estimated billable generations, estimated model cost, request/response metadata, latency, bytes, dimensions, and model settings.",
    bedrockUsageContract,
    createdAt: new Date().toISOString(),
    items: [],
  };

  for (const [index, card] of cards.entries()) {
    const item = await replayCard(card, index + 1);
    manifest.items.push(item);
  }

  const manifestPath = path.join(LOCAL_DIR, "manifest.json");
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  const reportPath = path.join(LOCAL_DIR, "index.html");
  await writeFile(reportPath, buildHtmlReport(manifest));

  if (WRITE_S3) {
    await putObject(`${REPLAY_PREFIX}/manifest.json`, Buffer.from(JSON.stringify(manifest, null, 2)), "application/json");
    await putObject(`${REPLAY_PREFIX}/index.html`, Buffer.from(buildHtmlReport(manifest, { useS3Urls: true })), "text/html; charset=utf-8");
  }

  console.log(JSON.stringify({
    ok: true,
    localDir: LOCAL_DIR,
    manifestPath,
    reportPath,
    replayPrefix: WRITE_S3 ? `s3://${CARDS_BUCKET}/${REPLAY_PREFIX}/` : null,
    count: manifest.items.length,
    mock: MOCK,
  }, null, 2));
}

async function replayCard(card, ordinal) {
  const source = await readObject(card.sourceImageS3Key);
  const sourceMetrics = await imageMetrics(source.buffer, source.contentType);
  const prompt = buildPrompt(card);
  const negativePrompt = buildNegativePrompt();
  const generated = MOCK
    ? {
      buffer: source.buffer,
      contentType: source.contentType,
      providerId: "mock_copy_source",
      attempts: [
        {
          sequence: 1,
          providerId: "mock_copy_source",
          provider: "mock",
          status: "completed",
          message: "Mock replay copied the raw source image without calling Bedrock.",
          startedAt: new Date().toISOString(),
          endedAt: new Date().toISOString(),
          durationMs: 0,
          tokenMetrics: unavailableTokenMetrics(),
        },
      ],
      usage: summarizeBedrockUsage([
        {
          usage: buildBedrockUsage("mock_copy_source", "mock"),
        },
      ]),
    }
    : await invokeProviderChain(source, prompt, negativePrompt);
  const generatedMetrics = await imageMetrics(generated.buffer, generated.contentType);
  const bedrockUsage = generated.usage ?? summarizeBedrockUsage(generated.attempts);

  const safeCardId = String(card.cardId).replace(/[^A-Za-z0-9-]/g, "");
  const localStem = `${String(ordinal).padStart(2, "0")}-${safeCardId}`;
  const localSourcePath = path.join(LOCAL_DIR, `${localStem}-source.jpg`);
  const localGeneratedPath = path.join(LOCAL_DIR, `${localStem}-generated.png`);
  const localRequestPath = path.join(LOCAL_DIR, `${localStem}-request.json`);
  await writeFile(localSourcePath, source.buffer);
  await writeFile(localGeneratedPath, generated.buffer);
  await writeFile(localRequestPath, JSON.stringify({
    cardId: card.cardId,
    createdAt: card.createdAt,
    firstName: card.firstName,
    wellnessInterest: card.wellnessInterest,
    wellnessInterestLabel: card.wellnessInterestLabel,
    sourceImageS3Key: card.sourceImageS3Key,
    providerId: generated.providerId,
    avatarRecipeId: avatarRecipeContract.id,
    avatarRecipeVersion: avatarRecipeContract.version,
    prompt,
    negativePrompt,
    providerPriority: MOCK ? ["mock_copy_source"] : PROVIDER_PRIORITY,
    providerAttempts: generated.attempts,
    bedrockUsage,
  }, null, 2));

  const item = {
    ordinal,
    cardId: card.cardId,
    createdAt: card.createdAt,
    firstName: card.firstName,
    wellnessInterest: card.wellnessInterest,
    wellnessInterestLabel: card.wellnessInterestLabel,
    sourceImageS3Key: card.sourceImageS3Key,
    providerId: generated.providerId,
    providerAttempts: generated.attempts,
    bedrockUsage,
    prompt,
    negativePrompt,
    flowSteps: [
      {
        type: "raw_source",
        label: "Raw source image",
        fileName: path.basename(localSourcePath),
        s3Key: card.sourceImageS3Key,
        localPath: localSourcePath,
        contentType: source.contentType,
        bytes: source.buffer.length,
        ...sourceMetrics,
      },
      ...generated.attempts.map((attempt) => ({
        type: "model_attempt",
        label: `Model attempt ${attempt.sequence}`,
        ...attempt,
      })),
      {
        type: "generated_output",
        label: "Replay generated output",
        fileName: path.basename(localGeneratedPath),
        localPath: localGeneratedPath,
        contentType: generated.contentType,
        bytes: generated.buffer.length,
        ...generatedMetrics,
      },
    ],
    sourceMetrics: {
      contentType: source.contentType,
      bytes: source.buffer.length,
      ...sourceMetrics,
    },
    generatedMetrics: {
      contentType: generated.contentType,
      bytes: generated.buffer.length,
      ...generatedMetrics,
    },
    localSourcePath,
    localGeneratedPath,
    localRequestPath,
  };

  if (WRITE_S3) {
    const prefix = `${REPLAY_PREFIX}/${localStem}`;
    item.replaySourceS3Key = `${prefix}/source.jpg`;
    item.replayGeneratedS3Key = `${prefix}/generated.png`;
    item.replayRequestS3Key = `${prefix}/request.json`;
    await putObject(item.replaySourceS3Key, source.buffer, source.contentType);
    await putObject(item.replayGeneratedS3Key, generated.buffer, generated.contentType);
    await putObject(item.replayRequestS3Key, Buffer.from(await readFile(localRequestPath, "utf8")), "application/json");
    item.replaySourceUrl = await presign(item.replaySourceS3Key);
    item.replayGeneratedUrl = await presign(item.replayGeneratedS3Key);
  }

  return item;
}

async function invokeProviderChain(source, prompt, negativePrompt) {
  const attempts = [];
  const errors = [];

  for (const providerId of PROVIDER_PRIORITY) {
    const sequence = attempts.length + 1;
    if (providerId === "fallback_original_photo_card") {
      const attempt = {
        sequence,
        providerId,
        provider: "fallback_original_photo_card",
        status: "completed",
        startedAt: new Date().toISOString(),
        endedAt: new Date().toISOString(),
        durationMs: 0,
        message: "Provider chain reached fallback; replay copied the source image.",
        usage: buildBedrockUsage(providerId, "completed"),
        tokenMetrics: unavailableTokenMetrics(),
      };
      attempts.push(attempt);
      return {
        buffer: source.buffer,
        contentType: source.contentType,
        providerId,
        attempts,
        usage: summarizeBedrockUsage(attempts),
      };
    }

    if (providerId === "us.stability.stable-style-transfer-v1:0" && !process.env.AVATAR_STYLE_REFERENCE_S3_KEY) {
      attempts.push({
        sequence,
        providerId,
        provider: providerNameFor(providerId),
        status: "skipped",
        startedAt: new Date().toISOString(),
        endedAt: new Date().toISOString(),
        durationMs: 0,
        message: "Style Transfer requires AVATAR_STYLE_REFERENCE_S3_KEY.",
        usage: buildBedrockUsage(providerId, "skipped"),
        tokenMetrics: unavailableTokenMetrics(),
      });
      continue;
    }

    try {
      const result = await invokeStabilityProvider(providerId, source, prompt, negativePrompt, sequence);
      attempts.push(result.attempt);
      return {
        buffer: result.buffer,
        contentType: result.contentType,
        providerId,
        attempts,
        usage: summarizeBedrockUsage(attempts),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${providerId}: ${message}`);
      attempts.push({
        sequence,
        providerId,
        provider: providerNameFor(providerId),
        status: "failed",
        startedAt: new Date().toISOString(),
        endedAt: new Date().toISOString(),
        durationMs: 0,
        message,
        usage: buildBedrockUsage(providerId, "failed"),
        tokenMetrics: unavailableTokenMetrics(),
      });
    }
  }

  throw new Error(errors.length ? errors.join(" | ") : "No replay provider was attempted.");
}

async function invokeStabilityProvider(providerId, source, prompt, negativePrompt, sequence) {
  const startedAt = new Date();
  const payload = await buildProviderPayload(providerId, source, prompt, negativePrompt);
  const requestBytes = Buffer.byteLength(JSON.stringify(payload));
  const promptChars = prompt.length;
  const negativePromptChars = negativePrompt.length;

  const result = await bedrock.send(
    new InvokeModelCommand({
      modelId: providerId,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(payload),
    })
  );
  const endedAt = new Date();
  const parsed = JSON.parse(new TextDecoder().decode(result.body));
  const imageBase64 = parsed.images?.[0] ?? parsed.image;
  if (!imageBase64) {
    const finishReason = parsed.finish_reasons?.[0] ?? parsed.finishReason ?? "unknown";
    throw new Error(`Replay Stability response did not include an image. finishReason=${finishReason}`);
  }

  const buffer = Buffer.from(imageBase64, "base64");
  const contentType = "image/png";
  const attempt = {
    sequence,
    providerId,
    provider: providerNameFor(providerId),
    status: "completed",
    startedAt: startedAt.toISOString(),
    endedAt: endedAt.toISOString(),
    durationMs: endedAt.getTime() - startedAt.getTime(),
    modelSettings: summarizeProviderSettings(providerId),
    promptChars,
    negativePromptChars,
    requestBytes,
    outputBytes: buffer.length,
    outputContentType: contentType,
    usage: buildBedrockUsage(providerId, "completed"),
    responseMetadata: {
      requestId: result.$metadata?.requestId ?? null,
      httpStatusCode: result.$metadata?.httpStatusCode ?? null,
      attempts: result.$metadata?.attempts ?? null,
      totalRetryDelay: result.$metadata?.totalRetryDelay ?? null,
    },
    tokenMetrics: unavailableTokenMetrics(),
  };

  return {
    buffer,
    contentType,
    attempt,
  };
}

async function buildProviderPayload(providerId, source, prompt, negativePrompt) {
  const payload = {
    image: source.buffer.toString("base64"),
    prompt,
    negative_prompt: negativePrompt,
    output_format: "png",
  };

  if (providerId === "us.stability.stable-image-control-structure-v1:0") {
    const settings = avatarRecipeContract.providerSettings?.stabilityControlStructure ?? {};
    payload.control_strength = settings.controlStrength ?? 0.9;
    payload.output_format = settings.outputFormat ?? "png";
    if (settings.stylePreset) {
      payload.style_preset = settings.stylePreset;
    }
    return payload;
  }

  if (providerId === "us.stability.stable-image-style-guide-v1:0") {
    const settings = avatarRecipeContract.providerSettings?.stabilityStyleGuide ?? {};
    payload.fidelity = settings.fidelity ?? 0.82;
    payload.output_format = settings.outputFormat ?? "png";
    if (settings.stylePreset) {
      payload.style_preset = settings.stylePreset;
    }
    return payload;
  }

  if (providerId === "us.stability.stable-style-transfer-v1:0") {
    const settings = avatarRecipeContract.providerSettings?.stabilityStyleTransfer ?? {};
    const styleImage = await readObject(process.env.AVATAR_STYLE_REFERENCE_S3_KEY);
    delete payload.image;
    payload.init_image = source.buffer.toString("base64");
    payload.style_image = styleImage.buffer.toString("base64");
    payload.output_format = settings.outputFormat ?? "png";
    payload.composition_fidelity = settings.compositionFidelity ?? 0.86;
    payload.style_strength = settings.styleStrength ?? 0.42;
    payload.change_strength = settings.changeStrength ?? 0.38;
    return payload;
  }

  throw new Error(`Unsupported replay provider: ${providerId}`);
}

function summarizeProviderSettings(providerId) {
  if (providerId === "us.stability.stable-image-control-structure-v1:0") {
    const settings = avatarRecipeContract.providerSettings?.stabilityControlStructure ?? {};
    return {
      controlStrength: settings.controlStrength ?? 0.9,
      outputFormat: settings.outputFormat ?? "png",
      stylePreset: settings.stylePreset ?? null,
    };
  }
  if (providerId === "us.stability.stable-style-transfer-v1:0") {
    const settings = avatarRecipeContract.providerSettings?.stabilityStyleTransfer ?? {};
    return {
      compositionFidelity: settings.compositionFidelity ?? 0.86,
      styleStrength: settings.styleStrength ?? 0.42,
      changeStrength: settings.changeStrength ?? 0.38,
      outputFormat: settings.outputFormat ?? "png",
    };
  }
  if (providerId === "us.stability.stable-image-style-guide-v1:0") {
    const settings = avatarRecipeContract.providerSettings?.stabilityStyleGuide ?? {};
    return {
      fidelity: settings.fidelity ?? 0.82,
      outputFormat: settings.outputFormat ?? "png",
      stylePreset: settings.stylePreset ?? null,
    };
  }
  return {};
}

function providerNameFor(providerId) {
  if (providerId === "us.stability.stable-image-control-structure-v1:0") return "stability_control_structure";
  if (providerId === "us.stability.stable-style-transfer-v1:0") return "stability_style_transfer";
  if (providerId === "us.stability.stable-image-style-guide-v1:0") return "stability_style_guide";
  if (providerId === "fallback_original_photo_card") return "fallback_original_photo_card";
  return "bedrock";
}

function readProviderPriority(providerOverride) {
  if (providerOverride) return [providerOverride];
  return avatarProviderContract.avatarProviderPriority?.length
    ? avatarProviderContract.avatarProviderPriority
    : [DEFAULT_PROVIDER_ID, "fallback_original_photo_card"];
}

async function imageMetrics(buffer, contentType) {
  const metadata = await sharp(buffer).metadata().catch(() => null);
  return {
    widthPx: metadata?.width ?? null,
    heightPx: metadata?.height ?? null,
    format: metadata?.format ?? null,
    colorSpace: metadata?.space ?? null,
    hasAlpha: metadata?.hasAlpha ?? null,
    density: metadata?.density ?? null,
    contentType,
  };
}

function unavailableTokenMetrics() {
  return {
    inputTokens: null,
    outputTokens: null,
    totalTokens: null,
    note: "Not returned by Bedrock Stability image InvokeModel responses.",
  };
}

function buildBedrockUsage(providerId, status = "completed") {
  const unitPriceUsd = bedrockUsageContract.unitPricesUsd?.[providerId] ?? null;
  const billableUnits = status === "completed" && Number.isFinite(unitPriceUsd) && unitPriceUsd > 0 ? 1 : 0;
  const estimatedCostUsd = Number.isFinite(unitPriceUsd) ? Number((billableUnits * unitPriceUsd).toFixed(4)) : null;

  return {
    contractId: bedrockUsageContract.id,
    contractVersion: bedrockUsageContract.version,
    billingProvider: "aws_bedrock",
    serviceTier: bedrockUsageContract.serviceTier,
    pricingRegion: bedrockUsageContract.pricingRegion,
    modelId: providerId,
    billingUnit: bedrockUsageContract.billingUnit,
    billableUnits,
    unitPriceUsd,
    estimatedCostUsd,
    currency: bedrockUsageContract.currency,
    pricingSource: bedrockUsageContract.pricingSource,
    pricingLastVerified: bedrockUsageContract.pricingLastVerified,
    note: "Estimated Bedrock Stability image model cost only.",
  };
}

function summarizeBedrockUsage(attempts = []) {
  const lineItems = attempts.map((attempt) => attempt.usage).filter(Boolean);
  const totalBillableUnits = lineItems.reduce((sum, usage) => sum + Number(usage.billableUnits ?? 0), 0);
  const totalEstimatedCostUsd = lineItems.reduce((sum, usage) => sum + Number(usage.estimatedCostUsd ?? 0), 0);

  return {
    contractId: bedrockUsageContract.id,
    contractVersion: bedrockUsageContract.version,
    billingProvider: "aws_bedrock",
    billingUnit: bedrockUsageContract.billingUnit,
    currency: bedrockUsageContract.currency,
    totalBillableUnits,
    totalEstimatedCostUsd: Number(totalEstimatedCostUsd.toFixed(4)),
    pricingSource: bedrockUsageContract.pricingSource,
    pricingLastVerified: bedrockUsageContract.pricingLastVerified,
    lineItems,
    note: "Estimated Bedrock model inference cost only. Excludes S3, Lambda, DynamoDB, API Gateway, CloudWatch, and data-transfer charges.",
  };
}

async function fetchRecentCards(limit) {
  const result = await dynamo.send(
    new ScanCommand({
      TableName: CARDS_TABLE,
      Limit: 100,
    })
  );

  return (result.Items ?? [])
    .filter((card) => typeof card.sourceImageS3Key === "string" && card.sourceImageS3Key.startsWith(`${CARDS_PREFIX}/`))
    .sort((left, right) => Date.parse(right.createdAt ?? "") - Date.parse(left.createdAt ?? ""))
    .slice(0, limit);
}

async function readObject(key) {
  const result = await s3.send(
    new GetObjectCommand({
      Bucket: CARDS_BUCKET,
      Key: key,
    })
  );
  const bytes = await result.Body.transformToByteArray();
  return {
    buffer: Buffer.from(bytes),
    contentType: result.ContentType ?? "image/jpeg",
  };
}

async function putObject(key, body, contentType) {
  await s3.send(
    new PutObjectCommand({
      Bucket: CARDS_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      ServerSideEncryption: "AES256",
    })
  );
}

async function presign(key) {
  return getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: CARDS_BUCKET,
      Key: key,
    }),
    { expiresIn: 3600 }
  );
}

function buildPrompt(card) {
  const interest = card.wellnessInterest ?? "just_exploring";
  const focus = INTEREST_LABELS[interest] ?? INTEREST_LABELS.just_exploring;
  const aspiration = GOAL_ASPIRATIONS[interest] ?? GOAL_ASPIRATIONS.just_exploring;
  return (avatarRecipeContract.promptTemplate ?? [])
    .join(" ")
    .replaceAll("{{focus}}", focus)
    .replaceAll("{{aspiration}}", aspiration);
}

function buildNegativePrompt() {
  return (avatarRecipeContract.negativePromptTerms ?? []).join(", ");
}

function buildHtmlReport(manifest, options = {}) {
  const useS3Urls = Boolean(options.useS3Urls);
  const rows = manifest.items
    .map((item) => {
      const source = useS3Urls ? item.replaySourceUrl : path.basename(item.localSourcePath);
      const generated = useS3Urls ? item.replayGeneratedUrl : path.basename(item.localGeneratedPath);
      const flowSteps = buildFlowStepsHtml(item);
      const winningAttempt = getWinningAttempt(item);
      return `
        <section class="item">
          <div class="item-header">
            <div class="meta">
              <strong>${escapeHtml(item.firstName ?? "Guest")}</strong>
              <span>${escapeHtml(item.cardId)}</span>
              <span>${escapeHtml(item.wellnessInterestLabel ?? "")}</span>
            </div>
            <div class="model-banner">
              <span class="model-label">Winning model</span>
              <strong>${escapeHtml(winningAttempt?.providerId ?? item.providerId ?? "-")}</strong>
              <span>${escapeHtml(winningAttempt?.provider ?? "-")}</span>
              <span>${formatUsageUnits(item.bedrockUsage)} / ${formatCost(item.bedrockUsage?.totalEstimatedCostUsd)}</span>
            </div>
          </div>
          <div class="grid">
            <figure>
              <img src="${escapeHtml(source)}" alt="Source image">
              <figcaption>Raw Source | ${escapeHtml(item.flowSteps?.[0]?.fileName)} | ${formatImageMetric(item.sourceMetrics)}</figcaption>
            </figure>
            <figure>
              <img src="${escapeHtml(generated)}" alt="Generated avatar">
              <figcaption>Generated | ${escapeHtml(winningAttempt?.providerId ?? item.providerId ?? "-")} | ${formatImageMetric(item.generatedMetrics)}</figcaption>
            </figure>
            <div class="flow">
              <h2>Attempt Details</h2>
              ${flowSteps}
            </div>
          </div>
        </section>`;
    })
    .join("");
  const recipePanel = buildRecipePanelHtml(manifest);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Twin Card Avatar Replay ${escapeHtml(manifest.avatarRecipeVersion)}</title>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; background: #f6f9fc; color: #061b38; }
    main { max-width: 1240px; margin: 0 auto; padding: 28px; }
    h1 { margin: 0 0 8px; font-size: 28px; }
    .summary { color: #516176; margin-bottom: 24px; }
    .tabs { display: flex; gap: 8px; margin: 0 0 18px; border-bottom: 1px solid #dbeaf5; }
    .tabs button { appearance: none; border: 1px solid #c9ddeb; border-bottom: 0; border-radius: 8px 8px 0 0; background: #edf5fb; color: #26445f; padding: 10px 14px; font-weight: 800; cursor: pointer; }
    .tabs button.active { background: white; color: #061b38; }
    .tab-panel { display: none; }
    .tab-panel.active { display: block; }
    .item { background: white; border: 1px solid #dbeaf5; border-radius: 8px; padding: 14px; margin-bottom: 14px; }
    .item-header { display: grid; grid-template-columns: minmax(0, 1fr) minmax(360px, 0.95fr); gap: 12px; align-items: start; margin-bottom: 12px; }
    .meta { display: flex; gap: 10px; flex-wrap: wrap; color: #516176; }
    .meta strong { color: #061b38; }
    .model-banner { border: 1px solid #b7d6e8; border-radius: 8px; background: #f3faff; padding: 10px 12px; display: grid; gap: 3px; font-size: 13px; color: #516176; }
    .model-banner strong { color: #061b38; font-size: 15px; word-break: break-word; }
    .model-label { color: #0a6ea8; font-size: 11px; font-weight: 900; text-transform: uppercase; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(220px, 320px)) minmax(0, 1fr); gap: 12px; align-items: start; }
    figure { margin: 0; background: #eef4f8; border: 1px solid #d5e5f0; border-radius: 8px; overflow: hidden; }
    img { display: block; width: 100%; height: 260px; object-fit: contain; background: #f8fbfd; }
    figcaption { padding: 10px 12px; font-size: 13px; font-weight: 700; color: #516176; }
    .flow { grid-column: 3; grid-row: 1; border-left: 1px solid #dbeaf5; padding-left: 12px; }
    .flow h2 { margin: 0 0 12px; font-size: 18px; }
    .steps { display: grid; gap: 10px; }
    .step { border: 1px solid #dbeaf5; border-radius: 8px; padding: 12px; background: #fbfdff; }
    .step-title { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; font-weight: 800; margin-bottom: 8px; }
    .badge { display: inline-block; border-radius: 999px; padding: 3px 9px; font-size: 12px; background: #e9fbff; color: #1177ba; }
    .badge.failed { background: #fff0ef; color: #b42318; }
    .badge.skipped { background: #fff8e5; color: #8a5a00; }
    .kv { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px 14px; font-size: 13px; color: #516176; }
    .kv div { word-break: break-word; }
    .kv strong { color: #061b38; display: block; font-size: 11px; text-transform: uppercase; margin-bottom: 2px; }
    .panel-card { background: white; border: 1px solid #dbeaf5; border-radius: 8px; padding: 18px; margin-bottom: 18px; }
    .panel-card h2 { margin: 0 0 12px; font-size: 20px; }
    .panel-card h3 { margin: 18px 0 10px; font-size: 16px; }
    .note { color: #516176; line-height: 1.45; }
    pre { white-space: pre-wrap; overflow-wrap: anywhere; background: #f8fbfd; border: 1px solid #dbeaf5; border-radius: 8px; padding: 12px; color: #17324d; font-size: 13px; line-height: 1.45; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; background: white; }
    th, td { border: 1px solid #dbeaf5; padding: 9px 10px; text-align: left; vertical-align: top; }
    th { background: #edf5fb; color: #17324d; }
    td { color: #516176; }
    td strong { color: #061b38; }
    .source-links { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; }
    .source-links a { color: #0a6ea8; font-weight: 800; }
    @media (max-width: 980px) { .item-header { grid-template-columns: 1fr; } .grid { grid-template-columns: 1fr 1fr; } .flow { grid-column: 1 / -1; grid-row: auto; border-left: 0; border-top: 1px solid #dbeaf5; padding: 12px 0 0; } }
    @media (max-width: 760px) { main { padding: 16px; } .grid { grid-template-columns: 1fr; } img { height: 260px; } }
    @media (max-width: 900px) { .kv { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <main>
    <h1>Twin Card Avatar Replay</h1>
    <div class="summary">
      Recipe ${escapeHtml(manifest.avatarRecipeVersion)} | Provider priority ${escapeHtml((manifest.providerPriority ?? []).join(" -> "))} | ${escapeHtml(manifest.createdAt)}
      <br>${escapeHtml(manifest.usageMetricsNote)}
    </div>
    <div class="tabs" role="tablist" aria-label="Replay report sections">
      <button class="active" type="button" data-tab="flow" role="tab" aria-selected="true">Flow Review</button>
      <button type="button" data-tab="recipe" role="tab" aria-selected="false">Recipe / Instructions</button>
    </div>
    <section id="tab-flow" class="tab-panel active" role="tabpanel">
      ${rows}
    </section>
    <section id="tab-recipe" class="tab-panel" role="tabpanel">
      ${recipePanel}
    </section>
  </main>
  <script>
    for (const button of document.querySelectorAll("[data-tab]")) {
      button.addEventListener("click", () => {
        const tab = button.getAttribute("data-tab");
        for (const tabButton of document.querySelectorAll("[data-tab]")) {
          const active = tabButton === button;
          tabButton.classList.toggle("active", active);
          tabButton.setAttribute("aria-selected", String(active));
        }
        for (const panel of document.querySelectorAll(".tab-panel")) {
          panel.classList.toggle("active", panel.id === "tab-" + tab);
        }
      });
    }
  </script>
</body>
</html>`;
}

function buildFlowStepsHtml(item) {
  const html = (item.flowSteps ?? [])
    .filter((step) => step.type === "model_attempt")
    .map((step, index) => {
    if (step.type === "raw_source" || step.type === "generated_output") {
      return `
        <div class="step">
          <div class="step-title">
            <span>${index + 1}. ${escapeHtml(step.label)}</span>
            <span class="badge">${escapeHtml(step.type)}</span>
          </div>
          <div class="kv">
            <div><strong>File</strong>${escapeHtml(step.fileName ?? "-")}</div>
            <div><strong>S3 Key</strong>${escapeHtml(step.s3Key ?? "-")}</div>
            <div><strong>Image</strong>${formatImageMetric(step)}</div>
            <div><strong>Bytes</strong>${formatBytes(step.bytes)}</div>
            <div><strong>Color</strong>${escapeHtml(step.colorSpace ?? "-")}</div>
            <div><strong>Density</strong>${escapeHtml(step.density ?? "-")}</div>
          </div>
        </div>`;
    }

    const statusClass = step.status === "failed" ? "failed" : step.status === "skipped" ? "skipped" : "";
    return `
      <div class="step">
        <div class="step-title">
          <span>${index + 1}. ${escapeHtml(step.label)}</span>
          <span class="badge ${statusClass}">${escapeHtml(step.status)}</span>
        </div>
        <div class="kv">
          <div><strong>Model</strong>${escapeHtml(step.providerId ?? "-")}</div>
          <div><strong>Provider</strong>${escapeHtml(step.provider ?? "-")}</div>
          <div><strong>Duration</strong>${formatMs(step.durationMs)}</div>
          <div><strong>HTTP</strong>${escapeHtml(step.responseMetadata?.httpStatusCode ?? "-")}</div>
          <div><strong>Request ID</strong>${escapeHtml(step.responseMetadata?.requestId ?? "-")}</div>
          <div><strong>Prompt Chars</strong>${escapeHtml(step.promptChars ?? "-")}</div>
          <div><strong>Negative Chars</strong>${escapeHtml(step.negativePromptChars ?? "-")}</div>
          <div><strong>Request Bytes</strong>${formatBytes(step.requestBytes)}</div>
          <div><strong>Output Bytes</strong>${formatBytes(step.outputBytes)}</div>
          <div><strong>Billable Units</strong>${formatUsageUnits(step.usage)}</div>
          <div><strong>Estimated Cost</strong>${formatCost(step.usage?.estimatedCostUsd)}</div>
          <div><strong>Tokens</strong>${escapeHtml(step.tokenMetrics?.note ?? "Unavailable")}</div>
          <div><strong>Settings</strong>${escapeHtml(JSON.stringify(step.modelSettings ?? {}))}</div>
          <div><strong>Message</strong>${escapeHtml(step.message ?? "-")}</div>
        </div>
      </div>`;
  }).join("");

  return html ? `<div class="steps">${html}</div>` : `<p class="note">No model attempts recorded.</p>`;
}

function getWinningAttempt(item) {
  return (item.providerAttempts ?? []).find((attempt) => attempt.status === "completed") ?? null;
}

function buildRecipePanelHtml(manifest) {
  const sampleItem = manifest.items?.[0] ?? {};
  const promptTemplate = (avatarRecipeContract.promptTemplate ?? []).join("\n");
  const negativePromptTerms = (avatarRecipeContract.negativePromptTerms ?? []).join(", ");
  const providerRows = buildProviderDocsRows(manifest);
  const perCardRows = (manifest.items ?? []).map((item) => `
    <tr>
      <td><strong>${escapeHtml(item.firstName ?? "Guest")}</strong><br>${escapeHtml(item.cardId)}</td>
      <td>${escapeHtml(item.wellnessInterestLabel ?? item.wellnessInterest ?? "-")}</td>
      <td>${escapeHtml(item.providerId ?? "-")}</td>
      <td>${formatUsageUnits(item.bedrockUsage)}</td>
      <td>${formatCost(item.bedrockUsage?.totalEstimatedCostUsd)}</td>
      <td>${escapeHtml(item.localRequestPath ? path.basename(item.localRequestPath) : "-")}</td>
    </tr>`).join("");

  return `
    <section class="panel-card">
      <h2>Recipe Contract</h2>
      <p class="note">${escapeHtml(avatarRecipeContract.purpose ?? "")}</p>
      <div class="kv">
        <div><strong>Recipe ID</strong>${escapeHtml(avatarRecipeContract.id)}</div>
        <div><strong>Version</strong>${escapeHtml(avatarRecipeContract.version)}</div>
        <div><strong>Provider Priority</strong>${escapeHtml((manifest.providerPriority ?? []).join(" -> "))}</div>
        <div><strong>Billing Unit</strong>${escapeHtml(bedrockUsageContract.billingUnit)}</div>
        <div><strong>Pricing Source</strong>${escapeHtml(bedrockUsageContract.pricingSource)}</div>
        <div><strong>Pricing Verified</strong>${escapeHtml(bedrockUsageContract.pricingLastVerified)}</div>
      </div>
      <h3>Prompt Template</h3>
      <pre>${escapeHtml(promptTemplate)}</pre>
      <h3>Negative Prompt Terms</h3>
      <pre>${escapeHtml(negativePromptTerms)}</pre>
      <h3>Sample Rendered Prompt</h3>
      <pre>${escapeHtml(sampleItem.prompt ?? "No prompt captured.")}</pre>
      <h3>Sample Rendered Negative Prompt</h3>
      <pre>${escapeHtml(sampleItem.negativePrompt ?? "No negative prompt captured.")}</pre>
    </section>
    <section class="panel-card">
      <h2>Bedrock Docs Alignment</h2>
      <p class="note">This section maps the Stability Image Services fields documented by AWS to the request fields used by this replay tool and the production avatar worker contract.</p>
      <table>
        <thead>
          <tr>
            <th>Provider</th>
            <th>Documented Pattern</th>
            <th>Our Current Request</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>${providerRows}</tbody>
      </table>
      <div class="source-links">
        <a href="https://docs.aws.amazon.com/bedrock/latest/userguide/stable-image-services.html" target="_blank" rel="noreferrer">AWS Bedrock Stability Image Services</a>
      </div>
    </section>
    <section class="panel-card">
      <h2>Replay Requests</h2>
      <p class="note">Each row has a matching request JSON file beside the replay images. That file contains the exact rendered prompt, negative prompt, provider priority, and provider attempts for that card.</p>
      <table>
        <thead>
          <tr>
            <th>Card</th>
            <th>Goal</th>
            <th>Winning Provider</th>
            <th>Usage</th>
            <th>Estimated Cost</th>
            <th>Request JSON</th>
          </tr>
        </thead>
        <tbody>${perCardRows}</tbody>
      </table>
    </section>
    <section class="panel-card">
      <h2>Operator Notes</h2>
      <pre>${escapeHtml((avatarRecipeContract.operatorNotes ?? []).join("\n"))}</pre>
    </section>`;
}

function buildProviderDocsRows(manifest) {
  const priority = manifest.providerPriority ?? [];
  const rows = [
    {
      provider: "Control Structure",
      modelId: "us.stability.stable-image-control-structure-v1:0",
      documented: "Required: image, prompt. Optional: control_strength, negative_prompt, seed, output_format, style_preset.",
      current: JSON.stringify({
        image: "source/normalized.jpg as base64",
        prompt: "rendered from avatarRecipeContract.promptTemplate",
        negative_prompt: "avatarRecipeContract.negativePromptTerms",
        control_strength: avatarRecipeContract.providerSettings?.stabilityControlStructure?.controlStrength ?? 0.9,
        output_format: avatarRecipeContract.providerSettings?.stabilityControlStructure?.outputFormat ?? "png",
        style_preset: avatarRecipeContract.providerSettings?.stabilityControlStructure?.stylePreset ?? null,
      }, null, 2),
      notes: "Primary engine. High control_strength is intentional because the booth problem is identity drift, not pure style exploration.",
    },
    {
      provider: "Style Transfer",
      modelId: "us.stability.stable-style-transfer-v1:0",
      documented: "Required: init_image, style_image. Optional: prompt, negative_prompt, seed, output_format, composition_fidelity, style_strength, change_strength.",
      current: JSON.stringify({
        init_image: "source/normalized.jpg as base64",
        style_image: "AVATAR_STYLE_REFERENCE_S3_KEY as base64",
        prompt: "rendered from avatarRecipeContract.promptTemplate",
        negative_prompt: "avatarRecipeContract.negativePromptTerms",
        composition_fidelity: avatarRecipeContract.providerSettings?.stabilityStyleTransfer?.compositionFidelity ?? 0.86,
        style_strength: avatarRecipeContract.providerSettings?.stabilityStyleTransfer?.styleStrength ?? 0.42,
        change_strength: avatarRecipeContract.providerSettings?.stabilityStyleTransfer?.changeStrength ?? 0.38,
        output_format: avatarRecipeContract.providerSettings?.stabilityStyleTransfer?.outputFormat ?? "png",
      }, null, 2),
      notes: "Skipped unless a VeeVee style reference image is configured. Useful once identity quality is acceptable and we want consistent brand styling.",
    },
    {
      provider: "Style Guide",
      modelId: "us.stability.stable-image-style-guide-v1:0",
      documented: "Required: image, prompt. Optional: negative_prompt, seed, output_format, fidelity, style_preset.",
      current: JSON.stringify({
        image: "source/normalized.jpg as base64",
        prompt: "rendered from avatarRecipeContract.promptTemplate",
        negative_prompt: "avatarRecipeContract.negativePromptTerms",
        fidelity: avatarRecipeContract.providerSettings?.stabilityStyleGuide?.fidelity ?? 0.82,
        output_format: avatarRecipeContract.providerSettings?.stabilityStyleGuide?.outputFormat ?? "png",
        style_preset: avatarRecipeContract.providerSettings?.stabilityStyleGuide?.stylePreset ?? null,
      }, null, 2),
      notes: "Tertiary fallback. AWS positions it around style guidance, so it should not be the first choice for likeness preservation.",
    },
    {
      provider: "Fallback Original Photo Card",
      modelId: "fallback_original_photo_card",
      documented: "Internal fallback, not a Bedrock model.",
      current: "Copies the normalized source photo into the generated-image slot when every Bedrock provider fails or is unavailable.",
      notes: "Keeps the booth flow from blocking, but dashboard/status must show fallback_used so operators know it was not a generated avatar.",
    },
  ];

  return rows.map((row) => {
    const configured = priority.includes(row.modelId) ? "Configured in current priority" : "Not in current priority";
    return `
      <tr>
        <td><strong>${escapeHtml(row.provider)}</strong><br>${escapeHtml(row.modelId)}<br>${escapeHtml(configured)}</td>
        <td>${escapeHtml(row.documented)}</td>
        <td><pre>${escapeHtml(row.current)}</pre></td>
        <td>${escapeHtml(row.notes)}</td>
      </tr>`;
  }).join("");
}

function formatImageMetric(metrics = {}) {
  const size = metrics.widthPx && metrics.heightPx ? `${metrics.widthPx}x${metrics.heightPx}` : "unknown size";
  const format = metrics.format ?? metrics.contentType ?? "unknown";
  return `${size}, ${format}`;
}

function formatBytes(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return "-";
  if (number < 1024) return `${number} B`;
  if (number < 1024 * 1024) return `${(number / 1024).toFixed(1)} KB`;
  return `${(number / 1024 / 1024).toFixed(1)} MB`;
}

function formatMs(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "-";
  return `${number} ms`;
}

function formatUsageUnits(usage = {}) {
  const units = Number(usage.totalBillableUnits ?? usage.billableUnits);
  const unit = usage.billingUnit ?? bedrockUsageContract.billingUnit ?? "generation";
  if (!Number.isFinite(units)) return "-";
  return `${units} ${unit}${units === 1 ? "" : "s"}`;
}

function formatCost(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "-";
  return `$${number.toFixed(4)}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseArgs(rawArgs) {
  const parsed = {};
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (!arg.startsWith("--")) continue;
    const [key, inlineValue] = arg.slice(2).split("=", 2);
    if (key === "mock") {
      parsed.mock = true;
      continue;
    }
    if (key === "no-write-s3") {
      parsed.writeS3 = false;
      continue;
    }
    if (typeof inlineValue !== "undefined") {
      parsed[key] = inlineValue;
    } else {
      parsed[key] = rawArgs[index + 1];
      index += 1;
    }
  }
  return parsed;
}
