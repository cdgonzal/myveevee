import crypto from "node:crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutObjectCommand, GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  DEFAULT_CARDS_PREFIX,
  INTEREST_LABELS,
  buildRunArtifact,
  buildRunPrefix,
  inferContactType,
  keyForRun,
  keyForSource,
  normalizeImageUpload,
  parseDataUrl,
  readInterest,
  sanitizeString,
} from "./common.mjs";

const s3 = new S3Client({});
const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const {
  CARDS_BUCKET,
  CARDS_TABLE,
  CARDS_PREFIX = DEFAULT_CARDS_PREFIX,
  ALLOWED_ORIGINS = "",
  PUBLIC_BASE_URL = "https://myveevee.com",
  DASHBOARD_PIN = "5353",
} = process.env;

export async function handler(event) {
  const origin = getRequestOrigin(event);

  try {
    validateConfig();
    const route = `${event.requestContext?.http?.method ?? ""} ${event.rawPath ?? ""}`;

    if (route.endsWith("POST /twin-card/cards")) {
      return await createCard(event, origin);
    }

    if ((event.requestContext?.http?.method ?? "") === "GET" && (event.rawPath ?? "").startsWith("/twin-card/cards/")) {
      return await getCard(event, origin);
    }

    if (route.endsWith("GET /twin-card/admin/cards")) {
      return await listCards(event, origin);
    }

    return response(404, { message: "Not found." }, origin);
  } catch (error) {
    console.error("Twin Card Lambda failure", {
      message: error instanceof Error ? error.message : String(error),
    });
    return response(500, { message: "The Twin Card request could not be completed." }, origin);
  }
}

async function createCard(event, origin) {
  const payload = parseBody(event);
  const now = new Date().toISOString();
  const cardId = crypto.randomUUID();
  const firstName = sanitizeString(payload.firstName, 48);
  const contact = sanitizeString(payload.contact, 160);
  const wellnessInterest = readInterest(payload.wellnessInterest);
  const consentAccepted = payload.consentAccepted === true;
  const betaInterest = payload.betaInterest === true;
  const sourceImage = parseDataUrl(payload.sourceImageDataUrl);
  const language = sanitizeString(payload.language, 8) || "en";
  const imageUpload = normalizeImageUpload(payload.imageUpload, sourceImage);

  if (!firstName || !contact || !consentAccepted || !sourceImage) {
    return response(400, { message: "First name, contact, consent, and photo are required." }, origin);
  }

  const runPrefix = buildRunPrefix({ cardsPrefix: CARDS_PREFIX, cardId, createdAt: now });
  const sourceImageS3Key = keyForSource(runPrefix);
  const runS3Key = keyForRun(runPrefix);

  const baseRecord = {
    cardId,
    runPrefix,
    firstName,
    contact,
    contactType: inferContactType(contact),
    wellnessInterest,
    wellnessInterestLabel: INTEREST_LABELS[wellnessInterest],
    consentAccepted,
    betaInterest,
    sourceImageS3Key,
    sourceImageBytes: sourceImage.buffer.length,
    sourceImageContentType: sourceImage.contentType,
    imageUpload,
    runS3Key,
    cardResultUrl: `${PUBLIC_BASE_URL.replace(/\/+$/, "")}/twin-card/result/${cardId}`,
    generationStatus: "submitted",
    generationProvider: "stability_control_structure",
    generationMessage: "Your Twin Card image is being created.",
    renderStatus: "not_started",
    fulfillmentStatus: "not_printed",
    eventName: "4th SWCA Medical Summit",
    boothDeviceId: sanitizeString(payload.boothDeviceId, 80),
    deviceMetadata: normalizeDeviceMetadata(payload.deviceMetadata),
    language,
    createdAt: now,
    updatedAt: now,
  };

  const record = {
    ...baseRecord,
  };

  await s3.send(
    new PutObjectCommand({
      Bucket: CARDS_BUCKET,
      Key: runS3Key,
      Body: JSON.stringify(buildRunArtifact(record), null, 2),
      ContentType: "application/json",
      ServerSideEncryption: "AES256",
    })
  );

  await dynamo.send(
    new PutCommand({
      TableName: CARDS_TABLE,
      Item: record,
    })
  );

  await s3.send(
    new PutObjectCommand({
      Bucket: CARDS_BUCKET,
      Key: sourceImageS3Key,
      Body: sourceImage.buffer,
      ContentType: sourceImage.contentType,
      ServerSideEncryption: "AES256",
    })
  );

  return response(200, { ok: true, card: await serializeCard(record) }, origin);
}

async function getCard(event, origin) {
  const cardId = decodeURIComponent((event.rawPath ?? "").split("/").pop() ?? "");
  const card = await loadCard(cardId);

  if (!card) {
    return response(404, { message: "Twin Card not found." }, origin);
  }

  return response(200, { ok: true, card: await serializeCard(card) }, origin);
}

async function listCards(event, origin) {
  if (!isDashboardAuthorized(event)) {
    return response(403, { message: "Dashboard PIN required." }, origin);
  }

  const result = await dynamo.send(
    new ScanCommand({
      TableName: CARDS_TABLE,
      Limit: 50,
    })
  );
  const cards = [...(result.Items ?? [])].sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));

  return response(200, { ok: true, cards: await Promise.all(cards.map((card) => serializeCard(card, { includePrivateFields: true }))) }, origin);
}

async function loadCard(cardId) {
  if (!cardId) return null;
  const result = await dynamo.send(
    new GetCommand({
      TableName: CARDS_TABLE,
      Key: { cardId },
    })
  );
  return result.Item ?? null;
}

async function serializeCard(card, options = {}) {
  const publicCard = {
    cardId: card.cardId,
    firstName: card.firstName,
    contactType: card.contactType,
    wellnessInterest: card.wellnessInterest,
    wellnessInterestLabel: card.wellnessInterestLabel,
    betaInterest: Boolean(card.betaInterest),
    cardResultUrl: card.cardResultUrl,
    generationStatus: card.generationStatus,
    generationProvider: card.generationProvider,
    generationMessage: card.generationMessage,
    avatarRecipeId: card.avatarRecipeId,
    avatarRecipeVersion: card.avatarRecipeVersion,
    renderStatus: card.renderStatus,
    fulfillmentStatus: card.fulfillmentStatus,
    eventName: card.eventName,
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
    sourceImageUrl: await presign(card.sourceImageS3Key),
    generatedAvatarUrl: await presign(card.generatedAvatarS3Key),
  };

  if (!options.includePrivateFields) {
    return publicCard;
  }

  return {
    ...publicCard,
    contact: card.contact,
    consentAccepted: Boolean(card.consentAccepted),
    boothDeviceId: card.boothDeviceId,
    deviceMetadata: card.deviceMetadata,
    language: card.language,
    imageUpload: card.imageUpload,
    runS3Key: card.runS3Key,
    sourceImageS3Key: card.sourceImageS3Key,
    generatedAvatarS3Key: card.generatedAvatarS3Key,
    printLayoutS3Key: card.printLayoutS3Key,
    printImageS3Key: card.printImageS3Key,
    sourceImageBytes: card.sourceImageBytes,
    generatedAvatarBytes: card.generatedAvatarBytes,
    printLayoutBytes: card.printLayoutBytes,
    printImageBytes: card.printImageBytes,
    printLayoutContentType: card.printLayoutContentType,
    printImageContentType: card.printImageContentType,
    runJsonUrl: await presign(card.runS3Key),
    printLayoutUrl: await presign(card.printLayoutS3Key),
    printImageUrl: await presign(card.printImageS3Key),
  };
}

function normalizeDeviceMetadata(value) {
  const device = typeof value === "object" && value ? value : {};
  return {
    deviceType: sanitizeString(device.deviceType, 40) || "unknown",
    deviceFamily: sanitizeString(device.deviceFamily, 40) || "unknown",
    platform: sanitizeString(device.platform, 80),
    userAgent: sanitizeString(device.userAgent, 512),
    maxTouchPoints: safeFiniteNumber(device.maxTouchPoints, 20),
    viewportWidth: safeFiniteNumber(device.viewportWidth, 10000),
    viewportHeight: safeFiniteNumber(device.viewportHeight, 10000),
    devicePixelRatio: safeFiniteNumber(device.devicePixelRatio, 10) || 1,
  };
}

function safeFiniteNumber(value, maxValue) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return 0;
  return Math.min(number, maxValue);
}

async function presign(key) {
  if (!key) return undefined;
  return getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: CARDS_BUCKET,
      Key: key,
    }),
    { expiresIn: 3600 }
  );
}

function validateConfig() {
  const missing = [];
  if (!CARDS_BUCKET) missing.push("CARDS_BUCKET");
  if (!CARDS_TABLE) missing.push("CARDS_TABLE");
  if (missing.length) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }
}

function parseBody(event) {
  const raw = event.isBase64Encoded ? Buffer.from(event.body ?? "", "base64").toString("utf8") : event.body ?? "{}";
  return JSON.parse(raw);
}

function isDashboardAuthorized(event) {
  const suppliedPin = event.headers?.["x-twin-dashboard-pin"] ?? event.headers?.["X-Twin-Dashboard-Pin"] ?? "";
  return suppliedPin === DASHBOARD_PIN;
}

function getRequestOrigin(event) {
  return event.headers?.origin ?? event.headers?.Origin ?? "";
}

function response(statusCode, body, origin) {
  return {
    statusCode,
    headers: corsHeaders(origin),
    body: JSON.stringify(body),
  };
}

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.split(",").map((item) => item.trim()).filter(Boolean);
  const allowOrigin = allowed.includes(origin) ? origin : allowed[0] ?? "https://myveevee.com";
  return {
    "content-type": "application/json",
    "access-control-allow-origin": allowOrigin,
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,authorization,x-twin-dashboard-pin",
    "vary": "Origin",
  };
}
