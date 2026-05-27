import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { InferenceClient } from "@huggingface/inference";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const args = parseArgs(process.argv.slice(2));
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const CONTRACT = JSON.parse(await readFile(new URL("../../src/twinCard/huggingFaceImageProviderContract.json", import.meta.url), "utf8"));
const s3 = new S3Client({});
const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

const CARDS_BUCKET = args.bucket ?? process.env.CARDS_BUCKET ?? "myveevee-twin-card-767828748348-us-east-1";
const CARDS_TABLE = args.table ?? process.env.CARDS_TABLE ?? "myveevee-twin-card-cards";
const LIMIT = Number(args.limit ?? 3);
const CARD_ID = args.cardId ?? process.env.REPLAY_CARD_ID ?? null;
const RUN_ID = args.runId ?? new Date().toISOString().replace(/[:.]/g, "-");
const LOCAL_DIR = path.resolve(args.outDir ?? path.join(repoRoot, "_sandbox", "twin-card-provider-comparisons", RUN_ID));
const REPLAY_PREFIX = args.replayPrefix ?? `twin-card-replay/provider-comparison/qwen-vs-nano-banana-2/${RUN_ID}`;
const WRITE_S3 = args.writeS3 !== false;
const WRITE_DDB = args.writeDdb !== false;
const HF_TOKEN = process.env.HF_TOKEN;
const FAL_KEY = process.env.FAL_KEY;
const PROMPT = "Transform the reference photo into a clean, polished 2D wellness avatar while preserving the same person's visible identity, face, face features, face shape, hair, skin tone, pose, framing, and natural expression. Keep it healthcare-friendly, premium, simple background, no text, no logos.";
const NEGATIVE_PROMPT = "text, letters, numbers, words, caption, label, logo, badge, sign, watermark, UI, typography, writing, different person, changed identity, changed face, changed hair, changed expression, changed glasses, beauty filter, glam retouch, distorted face, extra limbs";

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

  if (!HF_TOKEN) throw new Error("HF_TOKEN is required.");
  if (!FAL_KEY) throw new Error("FAL_KEY is required.");
  await mkdir(LOCAL_DIR, { recursive: true });

  const cards = await fetchRecentCards(LIMIT);
  if (!cards.length) throw new Error(`No source images found in ${CARDS_TABLE}.`);

  const manifest = {
    schema: "twin-card-qwen-fal-comparison-v1",
    runId: RUN_ID,
    createdAt: new Date().toISOString(),
    bucket: CARDS_BUCKET,
    table: CARDS_TABLE,
    replayPrefix: WRITE_S3 ? REPLAY_PREFIX : null,
    prompt: PROMPT,
    negativePrompt: NEGATIVE_PROMPT,
    outputs: [
      { label: "Output #1 Qwen", provider: "huggingface:replicate", modelId: "Qwen/Qwen-Image-Edit", recipeId: "qwen_image_edit_replicate_no_text_avatar_v1" },
      { label: "Output #2 Nano Banana 2 Edit", provider: "fal.ai", modelId: "fal-ai/nano-banana-2/edit", recipeId: "fal_nano_banana_2_edit_avatar_v1" },
    ],
    items: [],
  };

  for (const [index, card] of cards.entries()) {
    manifest.items.push(await replayCard(card, index + 1));
  }
  manifest.billingSummary = summarizeUsage(manifest.items);

  const manifestPath = path.join(LOCAL_DIR, "manifest.json");
  const reportPath = path.join(LOCAL_DIR, "index.html");
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
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
    localDir: LOCAL_DIR,
    manifestPath,
    reportPath,
    replayPrefix: WRITE_S3 ? `s3://${CARDS_BUCKET}/${REPLAY_PREFIX}/` : null,
    ddbIndexed: WRITE_S3 && WRITE_DDB,
    count: manifest.items.length,
    billingSummary: manifest.billingSummary,
  }, null, 2));
}

async function writeReplayRowsToDynamo(manifest) {
  const reportS3Key = manifest.reportS3Key ?? `${manifest.replayPrefix}/index.html`;
  const manifestS3Key = manifest.manifestS3Key ?? `${manifest.replayPrefix}/manifest.json`;
  const now = new Date().toISOString();
  const writes = [];

  for (const item of manifest.items ?? []) {
    for (const output of item.outputs ?? []) {
      const replayCardId = `replay#${manifest.runId}#${sanitizeId(item.cardId)}#${output.sequence}`;
      writes.push(dynamo.send(new PutCommand({
        TableName: CARDS_TABLE,
        Item: {
          cardId: replayCardId,
          recordType: "replay",
          replayRunId: manifest.runId,
          replaySourceCardId: item.cardId,
          replayOutputSequence: output.sequence,
          replayModelId: output.modelId,
          replayProvider: output.provider,
          replayManifestS3Key: manifestS3Key,
          replayReportS3Key: reportS3Key,
          firstName: item.firstName,
          contact: `replay:${manifest.runId}`,
          contactType: "unknown",
          wellnessInterest: "just_exploring",
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
            provider: output.provider,
            status: output.status,
            message: output.message,
            durationMs: output.durationMs,
            requestId: output.requestId,
            usage: output.usage,
          }],
          avatarRecipeId: output.sequence === 1 ? "qwen_image_edit_replicate_no_text_avatar_v1" : "fal_nano_banana_2_edit_avatar_v1",
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
  const sourceUrl = await presign(card.sourceImageS3Key, 900);
  const safeCardId = String(card.cardId).replace(/[^A-Za-z0-9-]/g, "");
  const localStem = `${String(ordinal).padStart(2, "0")}-${safeCardId}`;
  const localSourcePath = path.join(LOCAL_DIR, `${localStem}-source.jpg`);
  await writeFile(localSourcePath, source.buffer);

  const qwen = await runQwen(source.buffer);
  const nano = await runNanoBanana(sourceUrl);
  const outputs = [];

  for (const [index, result] of [qwen, nano].entries()) {
    const sequence = index + 1;
    const generatedMetrics = await imageMetrics(result.buffer, result.contentType);
    const localGeneratedPath = path.join(LOCAL_DIR, `${localStem}-output-${sequence}.png`);
    await writeFile(localGeneratedPath, result.buffer);
    const output = {
      sequence,
      label: sequence === 1 ? "Output #1 Qwen" : "Output #2 Nano Banana 2 Edit",
      provider: result.provider,
      modelId: result.modelId,
      status: result.status,
      message: result.message,
      durationMs: result.durationMs,
      requestId: result.requestId,
      usage: result.usage,
      generatedMetrics: {
        contentType: result.contentType,
        bytes: result.buffer.length,
        ...generatedMetrics,
      },
      localGeneratedPath,
    };
    outputs.push(output);
  }

  const item = {
    ordinal,
    cardId: card.cardId,
    firstName: card.firstName,
    createdAt: card.createdAt,
    wellnessInterestLabel: card.wellnessInterestLabel,
    sourceImageS3Key: card.sourceImageS3Key,
    sourceMetrics: {
      contentType: source.contentType,
      bytes: source.buffer.length,
      ...sourceMetrics,
    },
    localSourcePath,
    outputs,
  };

  if (WRITE_S3) {
    const prefix = `${REPLAY_PREFIX}/${localStem}`;
    item.replaySourceS3Key = `${prefix}/source.jpg`;
    await putObject(item.replaySourceS3Key, source.buffer, source.contentType);
    item.replaySourceUrl = await presign(item.replaySourceS3Key);
    for (const output of outputs) {
      output.replayGeneratedS3Key = `${prefix}/output-${output.sequence}.png`;
      await putObject(output.replayGeneratedS3Key, await readFile(output.localGeneratedPath), output.generatedMetrics.contentType);
      output.replayGeneratedUrl = await presign(output.replayGeneratedS3Key);
    }
  }

  return item;
}

async function runQwen(sourceBuffer) {
  const started = Date.now();
  try {
    const client = new InferenceClient(HF_TOKEN);
    const blob = await client.imageToImage({
      provider: "replicate",
      model: "Qwen/Qwen-Image-Edit",
      inputs: new Blob([sourceBuffer]),
      parameters: {
        prompt: PROMPT,
        negative_prompt: NEGATIVE_PROMPT,
        target_size: CONTRACT.defaultTargetSize,
      },
    });
    const arrayBuffer = await blob.arrayBuffer();
    return {
      provider: "huggingface:replicate",
      modelId: "Qwen/Qwen-Image-Edit",
      status: "completed",
      message: "Qwen replay completed.",
      durationMs: Date.now() - started,
      contentType: blob.type || "image/png",
      buffer: Buffer.from(arrayBuffer),
      usage: {
        billingProvider: "huggingface_inference_providers",
        billingUnit: "output_image",
        billableUnits: 1,
        unitPriceUsd: 0.03,
        estimatedCostUsd: 0.03,
        currency: "USD",
      },
    };
  } catch (error) {
    return failedResult("huggingface:replicate", "Qwen/Qwen-Image-Edit", sourceBuffer, Date.now() - started, error);
  }
}

async function runNanoBanana(sourceUrl) {
  const started = Date.now();
  const response = await fetch("https://fal.run/fal-ai/nano-banana-2/edit", {
    method: "POST",
    headers: {
      Authorization: `Key ${FAL_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: PROMPT,
      image_urls: [sourceUrl],
      num_images: 1,
      aspect_ratio: "1:1",
      output_format: "png",
      resolution: "1K",
      limit_generations: true,
      safety_tolerance: "4",
    }),
  });
  const text = await response.text();
  const body = JSON.parse(text);
  if (!response.ok) {
    throw new Error(body?.detail ?? body?.error ?? response.statusText);
  }
  const imageUrl = body.images?.[0]?.url;
  if (!imageUrl) throw new Error("fal.ai response did not include images[0].url.");
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) throw new Error(`Unable to download fal.ai output: ${imageResponse.status}`);
  const arrayBuffer = await imageResponse.arrayBuffer();
  const billableUnits = Number(response.headers.get("x-fal-billable-units") ?? 1);
  return {
    provider: "fal.ai",
    modelId: "fal-ai/nano-banana-2/edit",
    status: "completed",
    message: "Nano Banana 2 Edit replay completed.",
    durationMs: Date.now() - started,
    requestId: response.headers.get("x-fal-request-id"),
    contentType: imageResponse.headers.get("content-type") ?? body.images?.[0]?.content_type ?? "image/png",
    buffer: Buffer.from(arrayBuffer),
    usage: {
      billingProvider: "fal.ai",
      billingUnit: "fal_billable_unit",
      billableUnits,
      unitPriceUsd: null,
      estimatedCostUsd: null,
      currency: "USD",
      pricingSourceUrl: "https://fal.ai/models/fal-ai/nano-banana-2/edit/api",
    },
  };
}

function failedResult(provider, modelId, sourceBuffer, durationMs, error) {
  return {
    provider,
    modelId,
    status: "failed",
    message: String(error?.message ?? error).slice(0, 500),
    durationMs,
    contentType: "image/jpeg",
    buffer: sourceBuffer,
    usage: {
      billingProvider: provider,
      billingUnit: "none",
      billableUnits: 0,
      unitPriceUsd: null,
      estimatedCostUsd: null,
      currency: "USD",
    },
  };
}

async function fetchRecentCards(limit) {
  const result = await dynamo.send(new ScanCommand({ TableName: CARDS_TABLE, Limit: 100 }));
  return (result.Items ?? [])
    .filter((card) => typeof card.sourceImageS3Key === "string" && card.sourceImageS3Key.startsWith("twin-card/"))
    .filter((card) => !CARD_ID || card.cardId === CARD_ID)
    .sort((left, right) => Date.parse(right.createdAt ?? "") - Date.parse(left.createdAt ?? ""))
    .slice(0, limit);
}

async function readObject(key) {
  const result = await s3.send(new GetObjectCommand({ Bucket: CARDS_BUCKET, Key: key }));
  const bytes = await result.Body.transformToByteArray();
  return { buffer: Buffer.from(bytes), contentType: result.ContentType ?? "image/jpeg" };
}

async function putObject(key, body, contentType) {
  await s3.send(new PutObjectCommand({ Bucket: CARDS_BUCKET, Key: key, Body: body, ContentType: contentType, ServerSideEncryption: "AES256" }));
}

async function presign(key, expiresIn = 3600) {
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: CARDS_BUCKET, Key: key }), { expiresIn });
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

function summarizeUsage(items) {
  const lineItems = items.flatMap((item) => item.outputs.map((output) => output.usage));
  const estimated = lineItems.map((usage) => usage.estimatedCostUsd).filter((value) => Number.isFinite(Number(value)));
  return {
    currency: "USD",
    totalBillableUnits: lineItems.reduce((sum, usage) => sum + Number(usage.billableUnits ?? 0), 0),
    totalEstimatedCostUsd: estimated.length === lineItems.length ? estimated.reduce((sum, value) => sum + Number(value), 0) : null,
    lineItems,
  };
}

function buildHtmlReport(manifest, options = {}) {
  const useS3Urls = Boolean(options.useS3Urls);
  const rows = manifest.items.map((item) => {
    const source = useS3Urls ? item.replaySourceUrl : path.basename(item.localSourcePath);
    const outputFigures = item.outputs.map((output) => {
      const generated = useS3Urls ? output.replayGeneratedUrl : path.basename(output.localGeneratedPath);
      return `<figure><img src="${escapeHtml(generated)}" alt="${escapeHtml(output.label)}"><figcaption><strong>${escapeHtml(output.label)}</strong><br>${escapeHtml(output.modelId)}<br>${escapeHtml(output.provider)} | ${escapeHtml(output.status)} | ${formatMs(output.durationMs)}<br>${formatImageMetric(output.generatedMetrics)} | ${formatBytes(output.generatedMetrics.bytes)}<br>${formatUsageUnits(output.usage)} | ${formatCost(output.usage.estimatedCostUsd)}<br>${escapeHtml(output.requestId ?? "")}</figcaption></figure>`;
    }).join("");
    return `<section class="item"><div class="meta"><strong>${escapeHtml(item.firstName ?? "Guest")}</strong><span>${escapeHtml(item.cardId)}</span><span>${escapeHtml(item.wellnessInterestLabel ?? "")}</span></div><div class="grid"><figure><img src="${escapeHtml(source)}" alt="Source"><figcaption><strong>Raw Source</strong><br>${formatImageMetric(item.sourceMetrics)} | ${formatBytes(item.sourceMetrics.bytes)}</figcaption></figure>${outputFigures}</div></section>`;
  }).join("");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Qwen vs Nano Banana 2</title><style>body{margin:0;font-family:Arial,sans-serif;background:#f6f9fc;color:#061b38}main{max-width:1280px;margin:0 auto;padding:28px}h1{margin:0 0 8px;font-size:28px}.summary{color:#516176;margin-bottom:18px;line-height:1.45}.item{background:#fff;border:1px solid #dbeaf5;border-radius:8px;padding:14px;margin-bottom:14px}.meta{display:flex;gap:10px;flex-wrap:wrap;color:#516176;margin-bottom:12px}.meta strong{color:#061b38}.grid{display:grid;grid-template-columns:repeat(3,minmax(220px,1fr));gap:12px}figure{margin:0;background:#eef4f8;border:1px solid #d5e5f0;border-radius:8px;overflow:hidden}img{display:block;width:100%;height:300px;object-fit:contain;background:#f8fbfd}figcaption{padding:10px 12px;font-size:13px;font-weight:700;color:#516176;line-height:1.35}figcaption strong{color:#061b38}@media(max-width:860px){main{padding:16px}.grid{grid-template-columns:1fr}img{height:260px}}</style></head><body><main><h1>Qwen vs Nano Banana 2 Edit</h1><div class="summary">Created ${escapeHtml(manifest.createdAt)}<br>Prompt: ${escapeHtml(manifest.prompt)}<br>Total estimated cost: ${formatCost(manifest.billingSummary?.totalEstimatedCostUsd)} / ${formatUsageUnits(manifest.billingSummary)}</div>${rows}</main></body></html>`;
}

function formatImageMetric(metrics = {}) {
  const size = metrics.widthPx && metrics.heightPx ? `${metrics.widthPx}x${metrics.heightPx}` : "unknown size";
  return `${size}, ${metrics.format ?? metrics.contentType ?? "unknown"}`;
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
  return Number.isFinite(number) ? `${number} ms` : "-";
}

function formatUsageUnits(usage = {}) {
  const units = Number(usage.totalBillableUnits ?? usage.billableUnits);
  return Number.isFinite(units) ? `${units} ${escapeHtml(usage.billingUnit ?? "unit")}` : "-";
}

function formatCost(value) {
  const number = Number(value);
  return Number.isFinite(number) ? `$${number.toFixed(4)}` : "unpriced";
}

function sanitizeId(value) {
  return String(value ?? "unknown").replace(/[^A-Za-z0-9-]/g, "");
}

function escapeHtml(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function parseArgs(rawArgs) {
  const parsed = {};
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (!arg.startsWith("--")) continue;
    const [key, inlineValue] = arg.slice(2).split("=", 2);
    if (key === "no-write-s3") {
      parsed.writeS3 = false;
    } else if (key === "no-write-ddb") {
      parsed.writeDdb = false;
    } else if (typeof inlineValue !== "undefined") {
      parsed[key] = inlineValue;
    } else {
      parsed[key] = rawArgs[index + 1];
      index += 1;
    }
  }
  return parsed;
}
