import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import opentype from "opentype.js";
import sharp from "sharp";
import liberationSansBoldItalicFont from "./assets/LiberationSans-BoldItalic.ttf";
import liberationSansBoldFont from "./assets/LiberationSans-Bold.ttf";
import liberationSansItalicFont from "./assets/LiberationSans-Italic.ttf";
import liberationSansRegularFont from "./assets/LiberationSans-Regular.ttf";
import swcaLogoSvg from "./assets/swca-logo-vector-whitebg.svg";
import veeveeIconLogoSvg from "./assets/veevee-icon-lightmode-transparent.svg";
import veeveeWordmarkLogoSvg from "./assets/veevee-wordmark-lightmode-transparent.svg";
import {
  DEFAULT_CARDS_PREFIX,
  GOAL_CONTENT,
  buildRunArtifact,
  keyForFailure,
  keyForPrint,
  parseCardKey,
} from "./common.mjs";
import printContract from "../../src/twinCard/printContract.json";

const s3 = new S3Client({});
const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});
const SWCA_LOGO_DATA_URI = svgAssetDataUri(swcaLogoSvg);
const VEEVEE_ICON_LOGO_DATA_URI = svgAssetDataUri(veeveeIconLogoSvg);
const VEEVEE_WORDMARK_LOGO_DATA_URI = svgAssetDataUri(veeveeWordmarkLogoSvg);
const FONTS = {
  regular: parseFont(liberationSansRegularFont),
  bold: parseFont(liberationSansBoldFont),
  italic: parseFont(liberationSansItalicFont),
  boldItalic: parseFont(liberationSansBoldItalicFont),
};

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
    const printLayoutS3Key = keyForPrint(parsedKey.runPrefix, "svg");
    const printLayoutBody = Buffer.from(printSvg, "utf8");
    const printImageS3Key = keyForPrint(parsedKey.runPrefix, "png");
    const printImageBody = await renderCanonReadyPng(printLayoutBody);

    await s3.send(
      new PutObjectCommand({
        Bucket: CARDS_BUCKET,
        Key: printLayoutS3Key,
        Body: printLayoutBody,
        ContentType: "image/svg+xml",
        ServerSideEncryption: "AES256",
      })
    );

    await s3.send(
      new PutObjectCommand({
        Bucket: CARDS_BUCKET,
        Key: printImageS3Key,
        Body: printImageBody,
        ContentType: "image/png",
        ServerSideEncryption: "AES256",
      })
    );

    const now = new Date().toISOString();
    const updatedCard = await updateCard(parsedKey.cardId, {
      renderStatus: "rendered",
      printLayoutS3Key,
      printLayoutBytes: printLayoutBody.length,
      printLayoutContentType: "image/svg+xml",
      printImageS3Key,
      printImageBytes: printImageBody.length,
      printImageContentType: "image/png",
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

async function renderCanonReadyPng(svgBody) {
  const width = printContract.artwork?.widthPx ?? 1200;
  const height = printContract.artwork?.heightPx ?? 1800;

  return sharp(svgBody, { density: printContract.artwork?.dpi ?? 300 })
    .resize(width, height, { fit: "fill" })
    .toColorspace("srgb")
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

export function buildPrintSvg(card, image) {
  const firstName = card.firstName || "VeeVee Guest";
  const goalContent = GOAL_CONTENT[card.wellnessInterest] ?? GOAL_CONTENT.just_exploring;
  const goalTitleLines = wrapText(goalContent.goalTitle || card.wellnessInterestLabel || "Wellness Journey", 10)
    .slice(0, 3);
  const findingLines = wrapText(goalContent.finding, 25)
    .slice(0, 4);
  const recommendations = goalContent.recommendations.slice(0, 2).map((recommendation) => wrapText(recommendation, 26));
  const imageDataUri = `data:${image.contentType};base64,${image.buffer.toString("base64")}`;
  const goalTitle = goalTitleLines
    .map(
      (line, index) =>
        textPath(line, { x: 750, y: 930 + index * 72, fill: "#061B38", size: 66, font: "bold" })
    )
    .join("");
  const findingText = findingLines
    .map(
      (line, index) =>
        textPath(line, { x: 750, y: 1160 + index * 38, fill: "#13233D", size: 28 })
    )
    .join("");
  let nextStepY = 1370;
  const nextSteps = recommendations
    .map((lines) => {
      const bulletY = nextStepY - 8;
      const text = lines
        .map((line, lineIndex) => {
          const y = nextStepY + lineIndex * 36;
          return textPath(line, { x: 785, y, fill: "#13233D", size: 28 });
        })
        .join("");
      nextStepY += Math.max(lines.length, 1) * 36 + 28;
      return `<circle cx="756" cy="${bulletY}" r="7" fill="#D98A00"/>${text}`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1800" viewBox="0 0 1200 1800">
  <defs>
    <linearGradient id="avatarFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#061B38" stop-opacity="0"/>
      <stop offset="100%" stop-color="#061B38" stop-opacity="0.78"/>
    </linearGradient>
    <clipPath id="avatarClip">
      <rect x="65" y="790" width="575" height="590" rx="18" ry="18"/>
    </clipPath>
  </defs>
  <rect width="1200" height="1800" fill="#FFFDF8"/>

  ${textPath("2026", { x: 245, y: 112, fill: "#D98A00", size: 40, font: "bold" })}
  <circle cx="395" cy="96" r="8" fill="#D98A00"/>
  ${textPath("4th SWCA Medical Summit Edition", { x: 445, y: 112, fill: "#061B38", size: 40 })}

  <path d="M112 156 L148 224" stroke="#D98A00" stroke-width="4" stroke-linecap="round"/>
  <path d="M76 196 L132 232" stroke="#D98A00" stroke-width="4" stroke-linecap="round"/>
  <path d="M62 252 L126 264" stroke="#D98A00" stroke-width="4" stroke-linecap="round"/>
  ${textPath("Meet Your", { x: 160, y: 300, fill: "#061B38", size: 102, font: "italic" })}
  <path d="M70 406 C155 286 330 304 250 470 C220 530 156 522 174 456 C190 400 260 372 365 386" fill="none" stroke="#D98A00" stroke-width="4"/>
  ${textPath("Digital", { x: 235, y: 505, fill: "#D98A00", size: 210, font: "italic" })}
  <path d="M92 612 C230 500 468 520 690 552" fill="none" stroke="#D98A00" stroke-width="4"/>
  ${textPath("Health Twin", { x: 240, y: 680, fill: "#061B38", size: 152, font: "italic" })}
  <path d="M600 724 C730 690 895 690 1160 720" fill="none" stroke="#061B38" stroke-width="4"/>
  <path d="M1016 410 L1026 436 L1052 446 L1026 456 L1016 482 L1006 456 L980 446 L1006 436 Z" fill="#D98A00"/>
  <path d="M1080 375 L1096 418 L1138 434 L1096 450 L1080 493 L1064 450 L1022 434 L1064 418 Z" fill="#D98A00"/>
  <path d="M1136 452 L1144 472 L1164 480 L1144 488 L1136 508 L1128 488 L1108 480 L1128 472 Z" fill="#D98A00"/>

  <rect x="65" y="790" width="575" height="590" rx="18" fill="#FFFFFF" stroke="#D98A00" stroke-width="2"/>
  <image x="65" y="790" width="575" height="590" href="${imageDataUri}" preserveAspectRatio="xMidYMid slice" clip-path="url(#avatarClip)"/>
  <rect x="65" y="1225" width="575" height="155" rx="18" fill="url(#avatarFade)" clip-path="url(#avatarClip)"/>
  ${textPath(firstName, { x: 95, y: 1340, fill: "#FFFFFF", size: 38, font: "bold" })}

  <image x="272" y="1398" width="150" height="78" href="${VEEVEE_ICON_LOGO_DATA_URI}" preserveAspectRatio="xMidYMid meet"/>
  <image x="188" y="1468" width="315" height="74" href="${VEEVEE_WORDMARK_LOGO_DATA_URI}" preserveAspectRatio="xMidYMid meet"/>

  <line x1="690" y1="790" x2="690" y2="1600" stroke="#D98A00" stroke-width="2"/>
  ${textPath("GOAL", { x: 750, y: 845, fill: "#D98A00", size: 36, font: "bold" })}
  <line x1="885" y1="832" x2="1140" y2="832" stroke="#D98A00" stroke-width="2"/>
  ${goalTitle}
  <line x1="750" y1="1105" x2="1130" y2="1105" stroke="#D98A00" stroke-width="2"/>
  ${findingText}
  ${textPath("NEXT STEPS", { x: 750, y: 1305, fill: "#D98A00", size: 36, font: "bold", letterSpacing: 4 })}
  <line x1="970" y1="1292" x2="1130" y2="1292" stroke="#D98A00" stroke-width="2"/>
  ${nextSteps}

  <rect x="205" y="1572" width="790" height="68" fill="#FFFDF8"/>
  ${textPath("Visit myveevee.com to learn more", { x: 600, y: 1618, fill: "#061B38", size: 42, font: "boldItalic", anchor: "middle" })}
  <line x1="80" y1="1668" x2="1135" y2="1668" stroke="#D98A00" stroke-width="2"/>
  <g transform="translate(620 1695)">
    <image x="0" y="-8" width="84" height="84" href="${SWCA_LOGO_DATA_URI}" preserveAspectRatio="xMidYMid meet"/>
    <line x1="108" y1="0" x2="108" y2="68" stroke="#D98A00" stroke-width="2"/>
    ${textPath("SPINE AND WELLNESS", { x: 138, y: 30, fill: "#061B38", size: 30, letterSpacing: 4 })}
    ${textPath("CENTERS OF AMERICA", { x: 158, y: 62, fill: "#061B38", size: 20, letterSpacing: 6 })}
    <line x1="138" y1="44" x2="165" y2="44" stroke="#0D9BD7" stroke-width="2"/>
    <line x1="440" y1="44" x2="468" y2="44" stroke="#0D9BD7" stroke-width="2"/>
  </g>
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

function textPath(text, options) {
  const value = String(text || "");
  const font = FONTS[options.font || "regular"] ?? FONTS.regular;
  const size = options.size;
  const fill = options.fill;
  const letterSpacing = options.letterSpacing ?? 0;
  let x = options.x;

  if (options.anchor === "middle") {
    x -= measureText(font, value, size, letterSpacing) / 2;
  } else if (options.anchor === "end") {
    x -= measureText(font, value, size, letterSpacing);
  }

  if (!letterSpacing) {
    const path = font.getPath(value, x, options.y, size, { kerning: true });
    return `<path d="${path.toPathData(2)}" fill="${fill}"/>`;
  }

  let cursor = x;
  const paths = [];
  for (const char of value) {
    if (char !== " ") {
      const path = font.getPath(char, cursor, options.y, size, { kerning: true });
      paths.push(`<path d="${path.toPathData(2)}" fill="${fill}"/>`);
    }
    cursor += font.getAdvanceWidth(char, size, { kerning: true }) + letterSpacing;
  }
  return paths.join("");
}

function measureText(font, text, size, letterSpacing = 0) {
  const value = String(text || "");
  if (!value) return 0;
  if (!letterSpacing) return font.getAdvanceWidth(value, size, { kerning: true });
  return Array.from(value).reduce((total, char, index) => {
    const spacing = index === value.length - 1 ? 0 : letterSpacing;
    return total + font.getAdvanceWidth(char, size, { kerning: true }) + spacing;
  }, 0);
}

function parseFont(fontDataUrl) {
  const [, base64] = String(fontDataUrl).split(",");
  if (!base64) {
    throw new Error("Bundled font asset was not loaded as a data URL.");
  }
  const buffer = Buffer.from(base64, "base64");
  return opentype.parse(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
}

function svgAssetDataUri(svgText) {
  return `data:image/svg+xml;base64,${Buffer.from(svgText, "utf8").toString("base64")}`;
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
