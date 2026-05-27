import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { InferenceClient } from "@huggingface/inference";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const DEFAULT_CARDS_PREFIX = "twin-card";
const CONTRACT = JSON.parse(
  await readFile(new URL("../../src/twinCard/huggingFaceImageProviderContract.json", import.meta.url), "utf8")
);

const s3 = new S3Client({});
const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

const args = parseArgs(process.argv.slice(2));
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const CARDS_BUCKET = args.bucket ?? process.env.CARDS_BUCKET ?? "myveevee-twin-card-767828748348-us-east-1";
const CARDS_TABLE = args.table ?? process.env.CARDS_TABLE ?? "myveevee-twin-card-cards";
const CARDS_PREFIX = args.cardsPrefix ?? process.env.CARDS_PREFIX ?? DEFAULT_CARDS_PREFIX;
const LIMIT = Number(args.limit ?? 3);
const MODEL_ID = args.model ?? process.env.HF_IMAGE_MODEL_ID ?? CONTRACT.candidateModels?.[0]?.modelId;
const HF_PROVIDER = args.hfProvider ?? process.env.HF_PROVIDER ?? CONTRACT.defaultProvider ?? "auto";
const MODEL_CONFIGS = buildModelConfigs();
const HF_TOKEN = process.env.HF_TOKEN;
const HF_TIMEOUT_MS = Number(args.hfTimeoutMs ?? process.env.HF_TIMEOUT_MS ?? 180_000);
const CARD_ID = args.cardId ?? process.env.REPLAY_CARD_ID ?? null;
const PROMPT_VARIANT_ID = args.promptVariant ?? process.env.HF_PROMPT_VARIANT ?? "baseline";
const WRITE_S3 = args.writeS3 !== false;
const WRITE_DDB = args.writeDdb !== false;
const MOCK = Boolean(args.mock);
const RUN_ID = args.runId ?? new Date().toISOString().replace(/[:.]/g, "-");
const LOCAL_DIR = path.resolve(args.outDir ?? path.join(repoRoot, "_sandbox", "twin-card-huggingface-replays", RUN_ID));
const REPLAY_PREFIX = args.replayPrefix ?? `twin-card-replay/huggingface/${MODEL_CONFIGS.length > 1 ? "comparison" : slugifyModelId(MODEL_CONFIGS[0]?.modelId)}/${RUN_ID}`;

await main();

async function main() {
  if (args.indexManifest) {
    const manifest = JSON.parse(await readFile(path.resolve(args.indexManifest), "utf8"));
    await writeReplayRowsToDynamo(manifest);
    console.log(JSON.stringify({
      ok: true,
      indexedManifest: path.resolve(args.indexManifest),
      table: CARDS_TABLE,
      count: manifest.items?.flatMap((item) => item.outputs ?? []).length ?? 0,
    }, null, 2));
    return;
  }

  if (!Number.isFinite(LIMIT) || LIMIT < 1) {
    throw new Error("--limit must be a positive number.");
  }
  if (!MODEL_CONFIGS.length || MODEL_CONFIGS.some((config) => !config.modelId)) {
    throw new Error("No Hugging Face model configured. Pass --model or set HF_IMAGE_MODEL_ID.");
  }
  if (!MOCK && !HF_TOKEN) {
    throw new Error("HF_TOKEN is required for real Hugging Face replay. Use --mock for a wiring-only dry run.");
  }

  await mkdir(LOCAL_DIR, { recursive: true });
  const cards = await fetchRecentCards(LIMIT);
  if (!cards.length) {
    throw new Error(`No recent Twin Card rows with sourceImageS3Key found in ${CARDS_TABLE}.`);
  }

  const manifest = {
    schema: "twin-card-huggingface-replay-v1",
    runId: RUN_ID,
    mock: MOCK,
    provider: "huggingface_inference_providers",
    hfProvider: MODEL_CONFIGS[0].hfProvider,
    modelId: MODEL_CONFIGS[0].modelId,
    modelConfigs: MODEL_CONFIGS,
    comparisonMode: MODEL_CONFIGS.length > 1,
    promptVariant: getPromptVariant(),
    bucket: CARDS_BUCKET,
    table: CARDS_TABLE,
    replayPrefix: WRITE_S3 ? REPLAY_PREFIX : null,
    contract: CONTRACT,
    createdAt: new Date().toISOString(),
    items: [],
  };

  for (const [index, card] of cards.entries()) {
    manifest.items.push(await replayCard(card, index + 1));
  }
  manifest.billingSummary = summarizeHuggingFaceUsage(manifest.items);

  const manifestPath = path.join(LOCAL_DIR, "manifest.json");
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  const reportPath = path.join(LOCAL_DIR, "index.html");
  await writeFile(reportPath, buildHtmlReport(manifest));

  if (WRITE_S3) {
    manifest.manifestS3Key = `${REPLAY_PREFIX}/manifest.json`;
    manifest.reportS3Key = `${REPLAY_PREFIX}/index.html`;
    await putObject(manifest.manifestS3Key, Buffer.from(JSON.stringify(manifest, null, 2)), "application/json");
    await putObject(manifest.reportS3Key, Buffer.from(buildHtmlReport(manifest, { useS3Urls: true })), "text/html; charset=utf-8");
    if (WRITE_DDB) {
      await writeReplayRowsToDynamo(manifest);
    }
  }

  console.log(JSON.stringify({
    ok: true,
    modelId: MODEL_CONFIGS[0].modelId,
    hfProvider: MODEL_CONFIGS[0].hfProvider,
    modelConfigs: MODEL_CONFIGS,
    localDir: LOCAL_DIR,
    manifestPath,
    reportPath,
    replayPrefix: WRITE_S3 ? `s3://${CARDS_BUCKET}/${REPLAY_PREFIX}/` : null,
    ddbIndexed: WRITE_S3 && WRITE_DDB,
    count: manifest.items.length,
    mock: MOCK,
  }, null, 2));
}

async function writeReplayRowsToDynamo(manifest) {
  const reportS3Key = manifest.reportS3Key ?? `${manifest.replayPrefix}/index.html`;
  const manifestS3Key = manifest.manifestS3Key ?? `${manifest.replayPrefix}/manifest.json`;
  const now = new Date().toISOString();
  const writes = [];

  for (const item of manifest.items ?? []) {
    for (const output of item.outputs ?? []) {
      writes.push(dynamo.send(new PutCommand({
        TableName: CARDS_TABLE,
        Item: {
          cardId: `replay#${manifest.runId}#${sanitizeId(item.cardId)}#${output.sequence}`,
          recordType: "replay",
          replayRunId: manifest.runId,
          replaySourceCardId: item.cardId,
          replayOutputSequence: output.sequence,
          replayModelId: output.modelId,
          replayProvider: `huggingface:${output.hfProvider}`,
          replayManifestS3Key: manifestS3Key,
          replayReportS3Key: reportS3Key,
          firstName: item.firstName,
          contact: `replay:${manifest.runId}`,
          contactType: "unknown",
          wellnessInterest: item.wellnessInterest ?? "just_exploring",
          wellnessInterestLabel: item.wellnessInterestLabel ?? "Replay",
          consentAccepted: true,
          betaInterest: false,
          sourceImageS3Key: item.replaySourceS3Key ?? item.sourceImageS3Key,
          sourceImageBytes: item.sourceMetrics?.bytes,
          sourceImageContentType: item.sourceMetrics?.contentType,
          generatedAvatarS3Key: output.replayGeneratedS3Key,
          generatedAvatarBytes: output.generatedMetrics?.bytes,
          generatedAvatarContentType: output.generatedMetrics?.contentType,
          imageUpload: {
            originalFileName: "replay-source.jpg",
            originalFileType: item.sourceMetrics?.contentType ?? "image/jpeg",
            originalFileBytes: item.sourceMetrics?.bytes ?? 0,
            originalWidthPx: item.sourceMetrics?.widthPx ?? 0,
            originalHeightPx: item.sourceMetrics?.heightPx ?? 0,
            normalizedWidthPx: item.sourceMetrics?.widthPx ?? 0,
            normalizedHeightPx: item.sourceMetrics?.heightPx ?? 0,
            normalizedMimeType: item.sourceMetrics?.contentType ?? "image/jpeg",
            normalizedBytesEstimate: item.sourceMetrics?.bytes ?? 0,
            contractId: "twin-card-replay-dashboard-v1",
          },
          runS3Key: manifestS3Key,
          cardResultUrl: "https://myveevee.com/twin-dashboard",
          generationStatus: output.status === "completed" ? "completed" : "failed",
          generationProvider: "manual",
          generationMessage: output.message,
          bedrockUsage: {
            billingProvider: output.usage?.billingProvider,
            billingUnit: output.usage?.billingUnit,
            currency: output.usage?.currency ?? "USD",
            totalBillableUnits: Number(output.usage?.billableUnits ?? 0),
            totalEstimatedCostUsd: Number.isFinite(Number(output.usage?.estimatedCostUsd)) ? Number(output.usage.estimatedCostUsd) : null,
            lineItems: [output.usage].filter(Boolean),
            note: "Replay-only external model test. Excludes storage, Lambda, DynamoDB, API Gateway, CloudWatch, and transfer charges.",
          },
          bedrockProviderAttempts: [{
            providerId: output.modelId,
            provider: `huggingface:${output.hfProvider}`,
            status: output.status,
            message: output.message,
            usage: output.usage,
          }],
          avatarRecipeId: output.recipe?.id,
          avatarRecipeVersion: manifest.schema,
          renderStatus: "not_started",
          fulfillmentStatus: "not_printed",
          eventName: "Replay Model Evaluation",
          boothDeviceId: "replay",
          deviceMetadata: {
            deviceType: "desktop",
            deviceFamily: "desktop",
            platform: "replay",
            userAgent: "replay-script",
            maxTouchPoints: 0,
            viewportWidth: 0,
            viewportHeight: 0,
            devicePixelRatio: 1,
          },
          language: "en",
          createdAt: manifest.createdAt ?? now,
          updatedAt: now,
        },
      })));
    }
  }

  await Promise.all(writes);
}

async function replayCard(card, ordinal) {
  const source = await readObject(card.sourceImageS3Key);
  const sourceMetrics = await imageMetrics(source.buffer, source.contentType);
  const promptVariant = getPromptVariant();

  const safeCardId = String(card.cardId).replace(/[^A-Za-z0-9-]/g, "");
  const localStem = `${String(ordinal).padStart(2, "0")}-${safeCardId}`;
  const localSourcePath = path.join(LOCAL_DIR, `${localStem}-source.jpg`);
  const localRequestPath = path.join(LOCAL_DIR, `${localStem}-request.json`);

  await writeFile(localSourcePath, source.buffer);
  const outputs = [];
  const attempts = [];

  for (const [index, modelConfig] of MODEL_CONFIGS.entries()) {
    const sequence = index + 1;
    const recipe = getModelRecipe(modelConfig);
    const prompt = buildPrompt(card, modelConfig);
    const negativePrompt = args.negativePrompt ?? recipe.negativePrompt ?? promptVariant.negativePrompt ?? CONTRACT.defaultNegativePrompt;
    const startedAt = new Date();
    const result = await runHuggingFaceAttempt(source, prompt, negativePrompt, modelConfig, recipe);
    const endedAt = new Date();
    const generatedMetrics = await imageMetrics(result.buffer, result.contentType);
    const usage = buildHuggingFaceUsage(result.status, generatedMetrics, modelConfig);
    const outputSlug = `${String(sequence).padStart(2, "0")}-${slugifyModelId(modelConfig.modelId)}-${slugifyModelId(modelConfig.hfProvider)}`;
    const localGeneratedPath = path.join(LOCAL_DIR, `${localStem}-${outputSlug}.png`);

    await writeFile(localGeneratedPath, result.buffer);

    const attempt = {
      sequence,
      label: modelConfig.label ?? `Output #${sequence}`,
      role: modelConfig.role ?? null,
      recipeId: recipe.id,
      providerId: modelConfig.modelId,
      provider: `huggingface:${modelConfig.hfProvider}`,
      status: result.status,
      startedAt: startedAt.toISOString(),
      endedAt: endedAt.toISOString(),
      durationMs: endedAt.getTime() - startedAt.getTime(),
      message: result.message ?? "Hugging Face image-to-image replay completed.",
      usage,
      requestMetadata: {
        task: "image-to-image",
        modelId: modelConfig.modelId,
        hfProvider: modelConfig.hfProvider,
        promptChars: prompt.length,
        negativePromptChars: negativePrompt.length,
        sourceBytes: source.buffer.length,
        parameters: recipe.parameters ?? CONTRACT.defaultTargetSize,
      },
      responseMetadata: result.responseMetadata,
    };

    attempts.push(attempt);
    outputs.push({
      sequence,
      label: attempt.label,
      role: attempt.role,
      modelId: modelConfig.modelId,
      hfProvider: modelConfig.hfProvider,
      recipe,
      prompt,
      negativePrompt,
      status: result.status,
      message: attempt.message,
      attempt,
      usage,
      generatedMetrics: {
        contentType: result.contentType,
        bytes: result.buffer.length,
        ...generatedMetrics,
      },
      localGeneratedPath,
    });
  }

  await writeFile(localRequestPath, JSON.stringify({
    cardId: card.cardId,
    createdAt: card.createdAt,
    firstName: card.firstName,
    wellnessInterest: card.wellnessInterest,
    wellnessInterestLabel: card.wellnessInterestLabel,
    sourceImageS3Key: card.sourceImageS3Key,
    provider: "huggingface_inference_providers",
    modelConfigs: MODEL_CONFIGS,
    recipes: outputs.map((output) => ({
      label: output.label,
      modelId: output.modelId,
      hfProvider: output.hfProvider,
      recipeId: output.recipe?.id,
      prompt: output.prompt,
      negativePrompt: output.negativePrompt,
      parameters: output.recipe?.parameters,
    })),
    promptVariant,
    attempts,
    contractId: CONTRACT.id,
    contractVersion: CONTRACT.version,
  }, null, 2));

  const item = {
    ordinal,
    cardId: card.cardId,
    createdAt: card.createdAt,
    firstName: card.firstName,
    wellnessInterest: card.wellnessInterest,
    wellnessInterestLabel: card.wellnessInterestLabel,
    sourceImageS3Key: card.sourceImageS3Key,
    providerId: MODEL_CONFIGS[0].modelId,
    providerAttempts: attempts,
    huggingFaceUsage: summarizeHuggingFaceUsageFromLineItems(outputs.map((output) => output.usage)),
    prompt: outputs[0]?.prompt,
    negativePrompt: outputs[0]?.negativePrompt,
    promptVariant,
    sourceMetrics: {
      contentType: source.contentType,
      bytes: source.buffer.length,
      ...sourceMetrics,
    },
    generatedMetrics: outputs[0]?.generatedMetrics,
    outputs,
    localSourcePath,
    localGeneratedPath: outputs[0]?.localGeneratedPath,
    localRequestPath,
  };

  if (WRITE_S3) {
    const prefix = `${REPLAY_PREFIX}/${localStem}`;
    item.replaySourceS3Key = `${prefix}/source.jpg`;
    item.replayRequestS3Key = `${prefix}/request.json`;
    await putObject(item.replaySourceS3Key, source.buffer, source.contentType);
    for (const output of outputs) {
      output.replayGeneratedS3Key = `${prefix}/output-${String(output.sequence).padStart(2, "0")}-${slugifyModelId(output.modelId)}-${slugifyModelId(output.hfProvider)}.png`;
      await putObject(output.replayGeneratedS3Key, await readFile(output.localGeneratedPath), output.generatedMetrics.contentType);
      output.replayGeneratedUrl = await presign(output.replayGeneratedS3Key);
    }
    item.replayGeneratedS3Key = outputs[0]?.replayGeneratedS3Key;
    await putObject(item.replayRequestS3Key, Buffer.from(await readFile(localRequestPath, "utf8")), "application/json");
    item.replaySourceUrl = await presign(item.replaySourceS3Key);
    item.replayGeneratedUrl = outputs[0]?.replayGeneratedUrl;
  }

  return item;
}

async function runHuggingFaceAttempt(source, prompt, negativePrompt, modelConfig, recipe) {
  if (MOCK) {
    return {
      buffer: source.buffer,
      contentType: source.contentType,
      status: "mock_completed",
      message: "Mock replay copied the source image without calling Hugging Face.",
      responseMetadata: null,
    };
  }

  try {
    return await invokeHuggingFaceImageToImage(source.buffer, prompt, negativePrompt, modelConfig, recipe);
  } catch (error) {
    return {
      buffer: source.buffer,
      contentType: source.contentType,
      status: "failed",
      message: sanitizeProviderError(error),
      responseMetadata: {
        status: error?.httpResponse?.status ?? null,
        requestId: error?.httpResponse?.requestId ?? error?.httpRequest?.requestId ?? null,
        error: error?.httpResponse?.body?.error ?? error?.message ?? "Unknown Hugging Face provider error.",
      },
    };
  }
}

function sanitizeProviderError(error) {
  const providerMessage = error?.httpResponse?.body?.error ?? error?.message;
  if (!providerMessage) return "Hugging Face provider request failed.";
  return String(providerMessage).slice(0, 500);
}

function buildHuggingFaceUsage(status, generatedMetrics = {}, modelConfig = MODEL_CONFIGS[0]) {
  const rate = findHuggingFaceRate(modelConfig);
  const outputMegapixels = Number(generatedMetrics.widthPx) > 0 && Number(generatedMetrics.heightPx) > 0
    ? (Number(generatedMetrics.widthPx) * Number(generatedMetrics.heightPx)) / 1_000_000
    : null;
  const billableUnits = status === "completed" ? calculateBillableUnits(rate, outputMegapixels) : 0;
  const estimatedCostUsd = rate?.unitPriceUsd !== undefined
    ? Number((billableUnits * Number(rate.unitPriceUsd)).toFixed(6))
    : null;

  return {
    contractId: CONTRACT.id,
    contractVersion: CONTRACT.version,
    billingProvider: CONTRACT.billing?.billingProvider ?? "huggingface_inference_providers",
    hfProvider: modelConfig.hfProvider,
    modelId: modelConfig.modelId,
    providerEndpointId: rate?.providerEndpointId ?? null,
    billingUnit: rate?.billingUnit ?? "provider_defined",
    outputMegapixels,
    billableUnits,
    unitPriceUsd: rate?.unitPriceUsd ?? null,
    estimatedCostUsd,
    currency: CONTRACT.billing?.currency ?? "USD",
    pricingMode: CONTRACT.billing?.pricingMode ?? "provider_pass_through",
    pricingSource: CONTRACT.billing?.pricingSource ?? null,
    pricingSourceUrl: rate?.pricingSourceUrl ?? null,
    pricingLastVerified: CONTRACT.billing?.pricingLastVerified ?? null,
    note: rate
      ? "Estimated Hugging Face provider-pass-through inference cost only."
      : "No known rate configured for this Hugging Face model/provider pair; cost must be checked in the provider billing dashboard.",
  };
}

function summarizeHuggingFaceUsage(items = []) {
  const lineItems = items.flatMap((item) => item.outputs?.map((output) => output.usage).filter(Boolean) ?? [item.huggingFaceUsage].filter(Boolean));
  return summarizeHuggingFaceUsageFromLineItems(lineItems);
}

function summarizeHuggingFaceUsageFromLineItems(lineItems = []) {
  const totalBillableUnits = lineItems.reduce((sum, usage) => sum + Number(usage.billableUnits ?? 0), 0);
  const pricedItems = lineItems.filter((usage) => Number.isFinite(Number(usage.estimatedCostUsd)));
  const totalEstimatedCostUsd = pricedItems.length === lineItems.length
    ? Number(lineItems.reduce((sum, usage) => sum + Number(usage.estimatedCostUsd ?? 0), 0).toFixed(6))
    : null;

  return {
    contractId: CONTRACT.id,
    contractVersion: CONTRACT.version,
    billingProvider: CONTRACT.billing?.billingProvider ?? "huggingface_inference_providers",
    hfProvider: lineItems.map((usage) => usage.hfProvider).filter(Boolean).join(", "),
    modelId: lineItems.map((usage) => usage.modelId).filter(Boolean).join(", "),
    billingUnit: lineItems[0]?.billingUnit ?? "provider_defined",
    currency: CONTRACT.billing?.currency ?? "USD",
    totalBillableUnits,
    totalEstimatedCostUsd,
    lineItems,
    note: "Estimated external model inference cost only. Excludes storage, Lambda, DynamoDB, API Gateway, CloudWatch, and transfer charges.",
  };
}

function calculateBillableUnits(rate, outputMegapixels) {
  if (!rate) return outputMegapixels === null ? 0 : Math.ceil(outputMegapixels);
  if (rate.billingUnit === "output_image") return 1;
  if (rate.billingUnit === "output_megapixel_rounded_up") return outputMegapixels === null ? 0 : Math.ceil(outputMegapixels);
  return outputMegapixels === null ? 0 : Math.ceil(outputMegapixels);
}

function findHuggingFaceRate(modelConfig = MODEL_CONFIGS[0]) {
  return (CONTRACT.billing?.knownRates ?? []).find((rate) =>
    rate.modelId === modelConfig.modelId && String(rate.hfProvider ?? "").toLowerCase() === String(modelConfig.hfProvider).toLowerCase()
  ) ?? null;
}

async function invokeHuggingFaceImageToImage(sourceBuffer, prompt, negativePrompt, modelConfig, recipe) {
  const client = new InferenceClient(HF_TOKEN);
  const blob = await withTimeout(
    client.imageToImage({
      provider: modelConfig.hfProvider,
      model: modelConfig.modelId,
      inputs: new Blob([sourceBuffer]),
      parameters: {
        prompt,
        negative_prompt: negativePrompt,
        target_size: recipe?.parameters?.target_size ?? CONTRACT.defaultTargetSize,
      },
    }),
    HF_TIMEOUT_MS,
    `Hugging Face image-to-image request timed out after ${HF_TIMEOUT_MS} ms.`
  );
  const arrayBuffer = await blob.arrayBuffer();
  return {
    buffer: Buffer.from(arrayBuffer),
    contentType: blob.type || "image/png",
    status: "completed",
    responseMetadata: {
      contentType: blob.type || null,
      size: blob.size || null,
    },
  };
}

function withTimeout(promise, timeoutMs, message) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
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
    .filter((card) => !CARD_ID || card.cardId === CARD_ID)
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

function buildPrompt(card, modelConfig) {
  const focus = card.wellnessInterestLabel ?? "Personal Wellness Focus";
  const recipe = getModelRecipe(modelConfig);
  const variant = getPromptVariant();
  if (recipe.prompt) {
    return recipe.prompt;
  }
  const promptSuffix = recipe.promptSuffix ?? variant.promptSuffix;
  return [
    promptSuffix,
    `Wellness focus: ${focus}.`,
  ].join(" ");
}

function getModelRecipe(modelConfig) {
  return (CONTRACT.modelRecipes ?? []).find((recipe) =>
    recipe.modelId === modelConfig.modelId
    && String(recipe.hfProvider ?? "").toLowerCase() === String(modelConfig.hfProvider ?? "").toLowerCase()
  ) ?? {
    id: `default_${slugifyModelId(modelConfig.modelId)}_${slugifyModelId(modelConfig.hfProvider)}`,
    promptSuffix: getPromptVariant().promptSuffix ?? CONTRACT.defaultPromptSuffix,
    negativePrompt: getPromptVariant().negativePrompt ?? CONTRACT.defaultNegativePrompt,
    parameters: {
      target_size: CONTRACT.defaultTargetSize,
    },
  };
}

function buildModelConfigs() {
  if (Boolean(args.compareTop2)) {
    return (CONTRACT.topCandidateStrategy?.rankedCandidates ?? [])
      .filter((candidate) => candidate.rank === 1 || candidate.rank === 2)
      .sort((left, right) => Number(left.rank) - Number(right.rank))
      .map((candidate) => ({
        label: candidate.rank === 1 ? "Output #1 Primary" : "Output #2 Fallback",
        role: candidate.role,
        modelId: candidate.modelId,
        hfProvider: candidate.hfProvider,
      }));
  }

  const models = splitList(args.compareModels ?? process.env.HF_COMPARE_MODELS);
  if (models.length) {
    const providers = splitList(args.compareProviders ?? process.env.HF_COMPARE_PROVIDERS);
    return models.map((modelId, index) => ({
      label: `Output #${index + 1}`,
      role: index === 0 ? "primary" : "comparison",
      modelId,
      hfProvider: providers[index] ?? providers[0] ?? HF_PROVIDER,
    }));
  }

  return [{
    label: "Output #1",
    role: "primary",
    modelId: MODEL_ID,
    hfProvider: HF_PROVIDER,
  }];
}

function splitList(value) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getPromptVariant() {
  return (CONTRACT.promptVariants ?? []).find((variant) => variant.id === PROMPT_VARIANT_ID)
    ?? {
      id: "custom",
      label: "Custom/default prompt",
      promptSuffix: CONTRACT.defaultPromptSuffix,
      negativePrompt: CONTRACT.defaultNegativePrompt,
    };
}

function buildHtmlReport(manifest, options = {}) {
  const useS3Urls = Boolean(options.useS3Urls);
  const rows = manifest.items.map((item) => {
    const source = useS3Urls ? item.replaySourceUrl : path.basename(item.localSourcePath);
    const outputFigures = (item.outputs ?? []).map((output) => {
      const generated = useS3Urls ? output.replayGeneratedUrl : path.basename(output.localGeneratedPath);
      return `
          <figure>
            <img src="${escapeHtml(generated)}" alt="${escapeHtml(output.label)}">
            <figcaption>
              <strong>${escapeHtml(output.label)}</strong><br>
              ${escapeHtml(output.modelId)}<br>
              Recipe: ${escapeHtml(output.recipe?.id ?? "-")}<br>
              ${escapeHtml(output.hfProvider)} | ${escapeHtml(output.status)} | ${formatMs(output.attempt?.durationMs)}<br>
              ${formatImageMetric(output.generatedMetrics)} | ${formatBytes(output.generatedMetrics?.bytes)}<br>
              ${formatUsageUnits(output.usage)} | ${formatCost(output.usage?.estimatedCostUsd)}
            </figcaption>
          </figure>`;
    }).join("");
    const detailRows = (item.outputs ?? []).map((output) => `
              <div><strong>${escapeHtml(output.label)}</strong>${escapeHtml(output.modelId)} via ${escapeHtml(output.hfProvider)}</div>
              <div><strong>Recipe</strong>${escapeHtml(output.recipe?.id ?? "-")}</div>
              <div><strong>Status / Latency</strong>${escapeHtml(output.status)} / ${formatMs(output.attempt?.durationMs)}</div>
              <div><strong>Dimensions / Bytes</strong>${formatImageMetric(output.generatedMetrics)} / ${formatBytes(output.generatedMetrics?.bytes)}</div>
              <div><strong>Cost</strong>${formatUsageUnits(output.usage)} / ${formatCost(output.usage?.estimatedCostUsd)}</div>
              <div><strong>Prompt</strong>${escapeHtml(output.prompt ?? "-")}</div>
              <div><strong>Negative Prompt</strong>${escapeHtml(output.negativePrompt ?? "-")}</div>
              <div><strong>Message</strong>${escapeHtml(output.message ?? "-")}</div>
              <div><strong>Pricing Source</strong>${escapeHtml(output.usage?.pricingSourceUrl ?? output.usage?.note ?? "-")}</div>
    `).join("");
    return `
      <section class="item">
        <div class="item-header">
          <div class="meta">
            <strong>${escapeHtml(item.firstName ?? "Guest")}</strong>
            <span>${escapeHtml(item.cardId)}</span>
            <span>${escapeHtml(item.wellnessInterestLabel ?? "")}</span>
          </div>
          <div class="model-banner">
            <span class="model-label">Hugging Face comparison</span>
            <strong>${escapeHtml((manifest.modelConfigs ?? []).map((config) => `${config.label}: ${config.modelId}`).join(" | "))}</strong>
            <span>Prompt: ${escapeHtml(item.promptVariant?.label ?? manifest.promptVariant?.label ?? "-")}</span>
            <span>Total: ${formatUsageUnits(item.huggingFaceUsage)} | ${formatCost(item.huggingFaceUsage?.totalEstimatedCostUsd)}</span>
          </div>
        </div>
        <div class="grid">
          <figure>
            <img src="${escapeHtml(source)}" alt="Source image">
            <figcaption>Raw Source | ${formatImageMetric(item.sourceMetrics)}</figcaption>
          </figure>
          ${outputFigures}
          <div class="flow">
            <h2>Attempt Details</h2>
            <div class="kv">
              <div><strong>Task</strong>image-to-image</div>
              <div><strong>Prompt Variant</strong>${escapeHtml(item.promptVariant?.id ?? "-")}</div>
              <div><strong>Source Bytes</strong>${formatBytes(item.sourceMetrics?.bytes)}</div>
              <div><strong>Prompt Chars</strong>${escapeHtml(item.providerAttempts?.[0]?.requestMetadata?.promptChars ?? "-")}</div>
              ${detailRows}
            </div>
          </div>
        </div>
      </section>`;
  }).join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Hugging Face Avatar Replay ${escapeHtml(manifest.modelId)}</title>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; background: #f6f9fc; color: #061b38; }
    main { max-width: 1240px; margin: 0 auto; padding: 28px; }
    h1 { margin: 0 0 8px; font-size: 28px; }
    .summary { color: #516176; margin-bottom: 24px; line-height: 1.45; }
    .item { background: white; border: 1px solid #dbeaf5; border-radius: 8px; padding: 14px; margin-bottom: 14px; }
    .item-header { display: grid; grid-template-columns: minmax(0, 1fr) minmax(360px, 0.95fr); gap: 12px; align-items: start; margin-bottom: 12px; }
    .meta { display: flex; gap: 10px; flex-wrap: wrap; color: #516176; }
    .meta strong { color: #061b38; }
    .model-banner { border: 1px solid #b7d6e8; border-radius: 8px; background: #f3faff; padding: 10px 12px; display: grid; gap: 3px; font-size: 13px; color: #516176; }
    .model-banner strong { color: #061b38; font-size: 15px; word-break: break-word; }
    .model-label { color: #0a6ea8; font-size: 11px; font-weight: 900; text-transform: uppercase; }
    .grid { display: grid; grid-template-columns: repeat(3, minmax(190px, 1fr)); gap: 12px; align-items: start; }
    figure { margin: 0; background: #eef4f8; border: 1px solid #d5e5f0; border-radius: 8px; overflow: hidden; }
    img { display: block; width: 100%; height: 260px; object-fit: contain; background: #f8fbfd; }
    figcaption { padding: 10px 12px; font-size: 13px; font-weight: 700; color: #516176; }
    .flow { grid-column: 1 / -1; border-top: 1px solid #dbeaf5; padding-top: 12px; }
    .flow h2 { margin: 0 0 12px; font-size: 18px; }
    .kv { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 14px; font-size: 13px; color: #516176; }
    .kv div { word-break: break-word; }
    .kv strong { color: #061b38; display: block; font-size: 11px; text-transform: uppercase; margin-bottom: 2px; }
    .warning { background: #fff8e5; border: 1px solid #f3d27a; border-radius: 8px; padding: 12px; margin-bottom: 18px; color: #6b4600; }
    @media (max-width: 980px) { .item-header { grid-template-columns: 1fr; } .grid { grid-template-columns: 1fr 1fr; } .flow { grid-column: 1 / -1; grid-row: auto; border-left: 0; border-top: 1px solid #dbeaf5; padding: 12px 0 0; } }
    @media (max-width: 760px) { main { padding: 16px; } .grid { grid-template-columns: 1fr; } img { height: 260px; } }
  </style>
</head>
<body>
  <main>
    <h1>Hugging Face Avatar Replay</h1>
    <div class="summary">
      Model ${escapeHtml(manifest.modelId)} | Provider ${escapeHtml(manifest.hfProvider)} | ${escapeHtml(manifest.createdAt)}
      <br>Prompt variant: ${escapeHtml(manifest.promptVariant?.id ?? "-")} - ${escapeHtml(manifest.promptVariant?.label ?? "-")}
      <br>Estimated provider-pass-through cost: ${formatCost(manifest.billingSummary?.totalEstimatedCostUsd)} / ${formatUsageUnits(manifest.billingSummary)}
      <br>Replay-only external-provider test. Review model license, consent, privacy, retention, and commercial rights before production use.
    </div>
    <div class="warning">${escapeHtml((manifest.contract?.safetyRules ?? []).join(" "))}</div>
    ${rows}
  </main>
</body>
</html>`;
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
  if (!Number.isFinite(units)) return "-";
  return `${units} ${escapeHtml(usage.billingUnit ?? "unit")}`;
}

function formatCost(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "unpriced";
  return `$${number.toFixed(4)}`;
}

function slugifyModelId(modelId) {
  return String(modelId).replace(/[^A-Za-z0-9._-]+/g, "-").replace(/-+/g, "-");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sanitizeId(value) {
  return String(value ?? "unknown").replace(/[^A-Za-z0-9-]/g, "");
}

function parseArgs(rawArgs) {
  const parsed = {};
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (!arg.startsWith("--")) continue;
    const [key, inlineValue] = arg.slice(2).split("=", 2);
    if (key === "mock" || key === "compareTop2") {
      parsed[key] = true;
      continue;
    }
    if (key === "no-write-s3") {
      parsed.writeS3 = false;
      continue;
    }
    if (key === "no-write-ddb") {
      parsed.writeDdb = false;
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
