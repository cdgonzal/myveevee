import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import {
  DEFAULT_CARDS_PREFIX,
  GOAL_CONTENT,
  buildRunArtifact,
  keyForFailure,
  keyForPrint,
  parseCardKey,
} from "./common.mjs";

const s3 = new S3Client({});
const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const { CARDS_BUCKET, CARDS_TABLE, CARDS_PREFIX = DEFAULT_CARDS_PREFIX } = process.env;

export async function handler(event) {
  validateConfig();

  for (const record of event.Records ?? []) {
    const bucket = record.s3?.bucket?.name;
    const key = decodeURIComponent((record.s3?.object?.key ?? "").replace(/\+/g, " "));

    if (bucket !== CARDS_BUCKET || !key.includes(`/${"generated"}/`)) {
      continue;
    }

    await processGeneratedImage(key);
  }
}

async function processGeneratedImage(generatedAvatarS3Key) {
  const parsedKey = parseCardKey(generatedAvatarS3Key);
  if (!parsedKey || parsedKey.stage !== "generated" || !parsedKey.runPrefix.startsWith(CARDS_PREFIX)) {
    return;
  }

  const card = await loadCard(parsedKey.cardId);
  if (!card) {
    throw new Error(`Twin Card record not found for ${parsedKey.cardId}`);
  }

  await updateCard(parsedKey.cardId, {
    renderStatus: "rendering",
    updatedAt: new Date().toISOString(),
  });

  try {
    const image = await readObject(generatedAvatarS3Key);
    const printSvg = buildPrintSvg(card, image);
    const printImageS3Key = keyForPrint(parsedKey.runPrefix, "svg");
    const body = Buffer.from(printSvg, "utf8");

    await s3.send(
      new PutObjectCommand({
        Bucket: CARDS_BUCKET,
        Key: printImageS3Key,
        Body: body,
        ContentType: "image/svg+xml",
        ServerSideEncryption: "AES256",
      })
    );

    const now = new Date().toISOString();
    const updatedCard = await updateCard(parsedKey.cardId, {
      renderStatus: "rendered",
      printImageS3Key,
      printImageBytes: body.length,
      printImageContentType: "image/svg+xml",
      renderedAt: now,
      updatedAt: now,
    });
    await writeRunArtifact(updatedCard);
  } catch (error) {
    console.error("Twin Card print composition failed", {
      cardId: parsedKey.cardId,
      message: error instanceof Error ? error.message : String(error),
    });
    await writeFailure(parsedKey.runPrefix, "print-composition", {
      cardId: parsedKey.cardId,
      generatedAvatarS3Key,
      message: error instanceof Error ? error.message : String(error),
      failedAt: new Date().toISOString(),
    });
    const updatedCard = await updateCard(parsedKey.cardId, {
      renderStatus: "render_failed",
      updatedAt: new Date().toISOString(),
    });
    await writeRunArtifact(updatedCard);
  }
}

function buildPrintSvg(card, image) {
  const firstName = escapeXml(card.firstName || "VeeVee Guest");
  const focus = escapeXml(card.wellnessInterestLabel || "Wellness journey");
  const goalContent = GOAL_CONTENT[card.wellnessInterest] ?? GOAL_CONTENT.just_exploring;
  const headline = escapeXml(goalContent.cardHeadline);
  const findingLines = wrapText(goalContent.finding, 68)
    .slice(0, 2)
    .map(escapeXml);
  const recommendations = goalContent.recommendations.slice(0, 3).map(escapeXml);
  const cta = escapeXml(goalContent.cta);
  const eventName = escapeXml(card.eventName || "4th SWCA Medical Summit");
  const imageDataUri = `data:${image.contentType};base64,${image.buffer.toString("base64")}`;
  const findingText = findingLines
    .map(
      (line, index) => `
  <text x="180" y="${1574 + index * 34}" fill="#35445D" font-family="Inter, Arial, sans-serif" font-size="25" font-weight="700">${line}</text>`
    )
    .join("");
  const recommendationItems = recommendations
    .map(
      (recommendation, index) => `
  <circle cx="${202 + index * 292}" cy="1662" r="7" fill="#62B879"/>
  <text x="${222 + index * 292}" y="1671" fill="#26364F" font-family="Inter, Arial, sans-serif" font-size="25" font-weight="800">${recommendation}</text>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1800" viewBox="0 0 1200 1800">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#06254C"/>
      <stop offset="45%" stop-color="#1177BA"/>
      <stop offset="100%" stop-color="#9CE7FF"/>
    </linearGradient>
    <linearGradient id="panel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#EEF9FF"/>
    </linearGradient>
    <clipPath id="avatarClip">
      <rect x="150" y="260" width="900" height="900" rx="58" ry="58"/>
    </clipPath>
  </defs>
  <rect width="1200" height="1800" fill="url(#bg)"/>
  <circle cx="1060" cy="170" r="220" fill="#FFFFFF" opacity="0.14"/>
  <circle cx="110" cy="1530" r="260" fill="#FFFFFF" opacity="0.10"/>
  <rect x="76" y="78" width="1048" height="1644" rx="68" fill="url(#panel)" opacity="0.98"/>
  <text x="150" y="170" fill="#1177BA" font-family="Inter, Arial, sans-serif" font-size="42" font-weight="900" letter-spacing="4">VEEVEE</text>
  <text x="150" y="222" fill="#44556F" font-family="Inter, Arial, sans-serif" font-size="30" font-weight="700">${eventName}</text>
  <rect x="140" y="250" width="920" height="920" rx="66" fill="#FFFFFF"/>
  <image x="150" y="260" width="900" height="900" href="${imageDataUri}" preserveAspectRatio="xMidYMid slice" clip-path="url(#avatarClip)"/>
  <rect x="150" y="260" width="900" height="900" rx="58" fill="none" stroke="#9CE7FF" stroke-width="10"/>
  <text x="600" y="1274" text-anchor="middle" fill="#061B38" font-family="Inter, Arial, sans-serif" font-size="92" font-weight="900">${firstName}</text>
  <text x="600" y="1342" text-anchor="middle" fill="#1177BA" font-family="Inter, Arial, sans-serif" font-size="42" font-weight="900">Health Twin Activated</text>
  <text x="600" y="1406" text-anchor="middle" fill="#35445D" font-family="Inter, Arial, sans-serif" font-size="32" font-weight="700">Focus: ${focus}</text>
  <rect x="140" y="1440" width="920" height="246" rx="34" fill="#E9FBFF"/>
  <text x="180" y="1488" fill="#1177BA" font-family="Inter, Arial, sans-serif" font-size="25" font-weight="900" letter-spacing="2">YOUR HEALTH TWIN FINDING</text>
  <text x="180" y="1530" fill="#061B38" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="900">${headline}</text>${findingText}
  <text x="180" y="1640" fill="#1177BA" font-family="Inter, Arial, sans-serif" font-size="23" font-weight="900" letter-spacing="2">NEXT BEST STEPS</text>${recommendationItems}
  <text x="600" y="1718" text-anchor="middle" fill="#1177BA" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="900">${cta}</text>
  <text x="600" y="1742" text-anchor="middle" fill="#6B7890" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="600">Wellness identity card. Educational only. Not medical advice or a medical record.</text>
</svg>`;
}

function wrapText(text, maxChars) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
      return;
    }
    current = next;
  });

  if (current) {
    lines.push(current);
  }

  return lines;
}

async function loadCard(cardId) {
  const result = await dynamo.send(
    new GetCommand({
      TableName: CARDS_TABLE,
      Key: { cardId },
    })
  );
  return result.Item ?? null;
}

async function updateCard(cardId, attributes) {
  const names = {};
  const values = {};
  const assignments = [];

  Object.entries(attributes).forEach(([key, value]) => {
    if (typeof value === "undefined") return;
    const nameKey = `#${key}`;
    const valueKey = `:${key}`;
    names[nameKey] = key;
    values[valueKey] = value;
    assignments.push(`${nameKey} = ${valueKey}`);
  });

  const result = await dynamo.send(
    new UpdateCommand({
      TableName: CARDS_TABLE,
      Key: { cardId },
      UpdateExpression: `SET ${assignments.join(", ")}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ReturnValues: "ALL_NEW",
    })
  );
  return result.Attributes;
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
    contentType: result.ContentType ?? "image/png",
  };
}

async function writeFailure(runPrefix, stage, payload) {
  await s3.send(
    new PutObjectCommand({
      Bucket: CARDS_BUCKET,
      Key: keyForFailure(runPrefix, stage),
      Body: JSON.stringify(payload, null, 2),
      ContentType: "application/json",
      ServerSideEncryption: "AES256",
    })
  );
}

async function writeRunArtifact(card) {
  if (!card?.runS3Key) return;
  await s3.send(
    new PutObjectCommand({
      Bucket: CARDS_BUCKET,
      Key: card.runS3Key,
      Body: JSON.stringify(buildRunArtifact(card), null, 2),
      ContentType: "application/json",
      ServerSideEncryption: "AES256",
    })
  );
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function validateConfig() {
  const missing = [];
  if (!CARDS_BUCKET) missing.push("CARDS_BUCKET");
  if (!CARDS_TABLE) missing.push("CARDS_TABLE");
  if (missing.length) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }
}
