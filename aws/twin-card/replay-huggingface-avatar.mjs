import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
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
const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const args = parseArgs(process.argv.slice(2));
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const CARDS_BUCKET = args.bucket ?? process.env.CARDS_BUCKET ?? "myveevee-twin-card-767828748348-us-east-1";
const CARDS_TABLE = args.table ?? process.env.CARDS_TABLE ?? "myveevee-twin-card-cards";
const CARDS_PREFIX = args.cardsPrefix ?? process.env.CARDS_PREFIX ?? DEFAULT_CARDS_PREFIX;
const LIMIT = Number(args.limit ?? 3);
const MODEL_ID = args.model ?? process.env.HF_IMAGE_MODEL_ID ?? CONTRACT.candidateModels?.[0]?.modelId;
const HF_PROVIDER = args.hfProvider ?? process.env.HF_PROVIDER ?? CONTRACT.defaultProvider ?? "auto";
const HF_TOKEN = process.env.HF_TOKEN;
const WRITE_S3 = args.writeS3 !== false;
const MOCK = Boolean(args.mock);
const RUN_ID = args.runId ?? new Date().toISOString().replace(/[:.]/g, "-");
const LOCAL_DIR = path.resolve(args.outDir ?? path.join(repoRoot, "_sandbox", "twin-card-huggingface-replays", RUN_ID));
const REPLAY_PREFIX = args.replayPrefix ?? `twin-card-replay/huggingface/${slugifyModelId(MODEL_ID)}/${RUN_ID}`;

await main();

async function main() {
  if (!Number.isFinite(LIMIT) || LIMIT < 1) {
    throw new Error("--limit must be a positive number.");
  }
  if (!MODEL_ID) {
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
    hfProvider: HF_PROVIDER,
    modelId: MODEL_ID,
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
    modelId: MODEL_ID,
    hfProvider: HF_PROVIDER,
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
  const negativePrompt = args.negativePrompt ?? CONTRACT.defaultNegativePrompt;
  const startedAt = new Date();
  const result = MOCK
    ? {
      buffer: source.buffer,
      contentType: source.contentType,
      status: "mock_completed",
      message: "Mock replay copied the source image without calling Hugging Face.",
      responseMetadata: null,
    }
    : await invokeHuggingFaceImageToImage(source.buffer, prompt, negativePrompt);
  const endedAt = new Date();
  const generatedMetrics = await imageMetrics(result.buffer, result.contentType);

  const safeCardId = String(card.cardId).replace(/[^A-Za-z0-9-]/g, "");
  const localStem = `${String(ordinal).padStart(2, "0")}-${safeCardId}`;
  const localSourcePath = path.join(LOCAL_DIR, `${localStem}-source.jpg`);
  const localGeneratedPath = path.join(LOCAL_DIR, `${localStem}-huggingface.png`);
  const localRequestPath = path.join(LOCAL_DIR, `${localStem}-request.json`);

  await writeFile(localSourcePath, source.buffer);
  await writeFile(localGeneratedPath, result.buffer);

  const attempt = {
    sequence: 1,
    providerId: MODEL_ID,
    provider: `huggingface:${HF_PROVIDER}`,
    status: result.status,
    startedAt: startedAt.toISOString(),
    endedAt: endedAt.toISOString(),
    durationMs: endedAt.getTime() - startedAt.getTime(),
    message: result.message ?? "Hugging Face image-to-image replay completed.",
    requestMetadata: {
      task: "image-to-image",
      modelId: MODEL_ID,
      hfProvider: HF_PROVIDER,
      promptChars: prompt.length,
      negativePromptChars: negativePrompt.length,
      sourceBytes: source.buffer.length,
    },
    responseMetadata: result.responseMetadata,
  };

  await writeFile(localRequestPath, JSON.stringify({
    cardId: card.cardId,
    createdAt: card.createdAt,
    firstName: card.firstName,
    wellnessInterest: card.wellnessInterest,
    wellnessInterestLabel: card.wellnessInterestLabel,
    sourceImageS3Key: card.sourceImageS3Key,
    provider: "huggingface_inference_providers",
    hfProvider: HF_PROVIDER,
    modelId: MODEL_ID,
    prompt,
    negativePrompt,
    attempt,
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
    providerId: MODEL_ID,
    providerAttempts: [attempt],
    prompt,
    negativePrompt,
    sourceMetrics: {
      contentType: source.contentType,
      bytes: source.buffer.length,
      ...sourceMetrics,
    },
    generatedMetrics: {
      contentType: result.contentType,
      bytes: result.buffer.length,
      ...generatedMetrics,
    },
    localSourcePath,
    localGeneratedPath,
    localRequestPath,
  };

  if (WRITE_S3) {
    const prefix = `${REPLAY_PREFIX}/${localStem}`;
    item.replaySourceS3Key = `${prefix}/source.jpg`;
    item.replayGeneratedS3Key = `${prefix}/huggingface.png`;
    item.replayRequestS3Key = `${prefix}/request.json`;
    await putObject(item.replaySourceS3Key, source.buffer, source.contentType);
    await putObject(item.replayGeneratedS3Key, result.buffer, result.contentType);
    await putObject(item.replayRequestS3Key, Buffer.from(await readFile(localRequestPath, "utf8")), "application/json");
    item.replaySourceUrl = await presign(item.replaySourceS3Key);
    item.replayGeneratedUrl = await presign(item.replayGeneratedS3Key);
  }

  return item;
}

async function invokeHuggingFaceImageToImage(sourceBuffer, prompt, negativePrompt) {
  const client = new InferenceClient(HF_TOKEN);
  const blob = await client.imageToImage({
    provider: HF_PROVIDER,
    model: MODEL_ID,
    inputs: sourceBuffer,
    parameters: {
      prompt,
      negative_prompt: negativePrompt,
      target_size: CONTRACT.defaultTargetSize,
    },
  });
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

function buildPrompt(card) {
  const focus = card.wellnessInterestLabel ?? "Personal Wellness Focus";
  return [
    CONTRACT.defaultPromptSuffix,
    `Wellness focus: ${focus}.`,
  ].join(" ");
}

function buildHtmlReport(manifest, options = {}) {
  const useS3Urls = Boolean(options.useS3Urls);
  const rows = manifest.items.map((item) => {
    const source = useS3Urls ? item.replaySourceUrl : path.basename(item.localSourcePath);
    const generated = useS3Urls ? item.replayGeneratedUrl : path.basename(item.localGeneratedPath);
    const attempt = item.providerAttempts?.[0] ?? {};
    return `
      <section class="item">
        <div class="item-header">
          <div class="meta">
            <strong>${escapeHtml(item.firstName ?? "Guest")}</strong>
            <span>${escapeHtml(item.cardId)}</span>
            <span>${escapeHtml(item.wellnessInterestLabel ?? "")}</span>
          </div>
          <div class="model-banner">
            <span class="model-label">Hugging Face model</span>
            <strong>${escapeHtml(manifest.modelId)}</strong>
            <span>${escapeHtml(manifest.hfProvider)}</span>
            <span>${escapeHtml(attempt.status ?? "-")} | ${formatMs(attempt.durationMs)}</span>
          </div>
        </div>
        <div class="grid">
          <figure>
            <img src="${escapeHtml(source)}" alt="Source image">
            <figcaption>Raw Source | ${formatImageMetric(item.sourceMetrics)}</figcaption>
          </figure>
          <figure>
            <img src="${escapeHtml(generated)}" alt="Generated avatar">
            <figcaption>Generated | ${escapeHtml(manifest.modelId)} | ${formatImageMetric(item.generatedMetrics)}</figcaption>
          </figure>
          <div class="flow">
            <h2>Attempt Details</h2>
            <div class="kv">
              <div><strong>Task</strong>image-to-image</div>
              <div><strong>Provider</strong>${escapeHtml(attempt.provider ?? "-")}</div>
              <div><strong>Duration</strong>${formatMs(attempt.durationMs)}</div>
              <div><strong>Prompt Chars</strong>${escapeHtml(attempt.requestMetadata?.promptChars ?? "-")}</div>
              <div><strong>Source Bytes</strong>${formatBytes(attempt.requestMetadata?.sourceBytes)}</div>
              <div><strong>Output Bytes</strong>${formatBytes(item.generatedMetrics?.bytes)}</div>
              <div><strong>Message</strong>${escapeHtml(attempt.message ?? "-")}</div>
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
    .grid { display: grid; grid-template-columns: repeat(2, minmax(220px, 320px)) minmax(0, 1fr); gap: 12px; align-items: start; }
    figure { margin: 0; background: #eef4f8; border: 1px solid #d5e5f0; border-radius: 8px; overflow: hidden; }
    img { display: block; width: 100%; height: 260px; object-fit: contain; background: #f8fbfd; }
    figcaption { padding: 10px 12px; font-size: 13px; font-weight: 700; color: #516176; }
    .flow { grid-column: 3; grid-row: 1; border-left: 1px solid #dbeaf5; padding-left: 12px; }
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
