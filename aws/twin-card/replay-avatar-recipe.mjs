import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

const s3 = new S3Client({});
const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const bedrock = new BedrockRuntimeClient({});

const args = parseArgs(process.argv.slice(2));
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const CARDS_BUCKET = args.bucket ?? process.env.CARDS_BUCKET ?? "myveevee-twin-card-767828748348-us-east-1";
const CARDS_TABLE = args.table ?? process.env.CARDS_TABLE ?? "myveevee-twin-card-cards";
const CARDS_PREFIX = args.cardsPrefix ?? process.env.CARDS_PREFIX ?? DEFAULT_CARDS_PREFIX;
const LIMIT = Number(args.limit ?? 3);
const PROVIDER_ID = args.provider ?? process.env.BEDROCK_IMAGE_MODEL_ID ?? DEFAULT_PROVIDER_ID;
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
    providerId: MOCK ? "mock_copy_source" : PROVIDER_ID,
    avatarRecipeId: avatarRecipeContract.id,
    avatarRecipeVersion: avatarRecipeContract.version,
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
  const prompt = buildPrompt(card);
  const negativePrompt = buildNegativePrompt();
  const generated = MOCK
    ? { buffer: source.buffer, contentType: source.contentType, providerId: "mock_copy_source", requestPayload: null }
    : await invokeStabilityControlStructure(source, prompt, negativePrompt);

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
    providerSettings: avatarRecipeContract.providerSettings?.stabilityControlStructure ?? null,
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

async function invokeStabilityControlStructure(source, prompt, negativePrompt) {
  const settings = avatarRecipeContract.providerSettings?.stabilityControlStructure ?? {};
  const payload = {
    image: source.buffer.toString("base64"),
    prompt,
    negative_prompt: negativePrompt,
    control_strength: settings.controlStrength ?? 0.9,
    output_format: settings.outputFormat ?? "png",
  };
  if (settings.stylePreset) {
    payload.style_preset = settings.stylePreset;
  }

  const result = await bedrock.send(
    new InvokeModelCommand({
      modelId: PROVIDER_ID,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(payload),
    })
  );
  const parsed = JSON.parse(new TextDecoder().decode(result.body));
  const imageBase64 = parsed.images?.[0] ?? parsed.image;
  if (!imageBase64) {
    const finishReason = parsed.finish_reasons?.[0] ?? parsed.finishReason ?? "unknown";
    throw new Error(`Replay Stability response did not include an image. finishReason=${finishReason}`);
  }

  return {
    buffer: Buffer.from(imageBase64, "base64"),
    contentType: "image/png",
    providerId: PROVIDER_ID,
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
      return `
        <section class="item">
          <div class="meta">
            <strong>${escapeHtml(item.firstName ?? "Guest")}</strong>
            <span>${escapeHtml(item.cardId)}</span>
            <span>${escapeHtml(item.wellnessInterestLabel ?? "")}</span>
          </div>
          <div class="grid">
            <figure>
              <img src="${escapeHtml(source)}" alt="Source image">
              <figcaption>Raw Source</figcaption>
            </figure>
            <figure>
              <img src="${escapeHtml(generated)}" alt="Generated avatar">
              <figcaption>Replay Generated</figcaption>
            </figure>
          </div>
        </section>`;
    })
    .join("");

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
    .item { background: white; border: 1px solid #dbeaf5; border-radius: 8px; padding: 18px; margin-bottom: 18px; }
    .meta { display: flex; gap: 14px; flex-wrap: wrap; color: #516176; margin-bottom: 14px; }
    .meta strong { color: #061b38; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
    figure { margin: 0; background: #eef4f8; border: 1px solid #d5e5f0; border-radius: 8px; overflow: hidden; }
    img { display: block; width: 100%; height: 520px; object-fit: contain; background: #f8fbfd; }
    figcaption { padding: 10px 12px; font-size: 13px; font-weight: 700; color: #516176; }
    @media (max-width: 760px) { main { padding: 16px; } .grid { grid-template-columns: 1fr; } img { height: 360px; } }
  </style>
</head>
<body>
  <main>
    <h1>Twin Card Avatar Replay</h1>
    <div class="summary">
      Recipe ${escapeHtml(manifest.avatarRecipeVersion)} | Provider ${escapeHtml(manifest.providerId)} | ${escapeHtml(manifest.createdAt)}
    </div>
    ${rows}
  </main>
</body>
</html>`;
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
