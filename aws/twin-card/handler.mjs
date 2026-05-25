import crypto from "node:crypto";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutObjectCommand, GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({});
const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const bedrock = new BedrockRuntimeClient({});

const {
  CARDS_BUCKET,
  CARDS_TABLE,
  CARDS_PREFIX = "twin-card",
  ALLOWED_ORIGINS = "",
  PUBLIC_BASE_URL = "https://myveevee.com",
  BEDROCK_IMAGE_MODEL_ID = "",
} = process.env;

const INTEREST_LABELS = {
  prepare_for_care: "Prepare for a doctor visit",
  understand_symptoms: "Understand symptoms",
  organize_records: "Organize health records",
  track_goals: "Track wellness goals",
  understand_benefits: "Understand benefits",
  support_loved_one: "Support a loved one",
  just_exploring: "Just exploring",
};

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
      return await listCards(origin);
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

  if (!firstName || !contact || !consentAccepted || !sourceImage) {
    return response(400, { message: "First name, contact, consent, and photo are required." }, origin);
  }

  const sourceImageS3Key = `${CARDS_PREFIX}/source/${cardId}.${sourceImage.extension}`;
  await s3.send(
    new PutObjectCommand({
      Bucket: CARDS_BUCKET,
      Key: sourceImageS3Key,
      Body: sourceImage.buffer,
      ContentType: sourceImage.contentType,
      ServerSideEncryption: "AES256",
    })
  );

  const baseRecord = {
    cardId,
    firstName,
    contact,
    contactType: inferContactType(contact),
    wellnessInterest,
    wellnessInterestLabel: INTEREST_LABELS[wellnessInterest],
    consentAccepted,
    betaInterest,
    sourceImageS3Key,
    cardResultUrl: `${PUBLIC_BASE_URL.replace(/\/+$/, "")}/twin-card/result/${cardId}`,
    generationStatus: "generating",
    generationProvider: "bedrock",
    eventName: "4th SWCA Medical Summit",
    boothDeviceId: sanitizeString(payload.boothDeviceId, 80),
    createdAt: now,
    updatedAt: now,
  };

  const generated = await tryGenerateAvatar({ sourceImage, firstName, wellnessInterest });
  const generatedAvatarS3Key = `${CARDS_PREFIX}/generated/${cardId}.${generated.extension}`;
  await s3.send(
    new PutObjectCommand({
      Bucket: CARDS_BUCKET,
      Key: generatedAvatarS3Key,
      Body: generated.buffer,
      ContentType: generated.contentType,
      ServerSideEncryption: "AES256",
    })
  );

  const record = {
    ...baseRecord,
    generatedAvatarS3Key,
    generationStatus: generated.usedFallback ? "fallback_used" : "completed",
    generationProvider: generated.usedFallback ? "fallback" : "bedrock",
    generationMessage: generated.usedFallback
      ? "We created your Twin Card using your uploaded photo."
      : "Your VeeVee Twin Card is ready.",
    updatedAt: new Date().toISOString(),
  };

  await dynamo.send(
    new PutCommand({
      TableName: CARDS_TABLE,
      Item: record,
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

async function listCards(origin) {
  const result = await dynamo.send(
    new ScanCommand({
      TableName: CARDS_TABLE,
      Limit: 50,
    })
  );
  const cards = [...(result.Items ?? [])].sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));

  return response(200, { ok: true, cards: await Promise.all(cards.map(serializeCard)) }, origin);
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

async function serializeCard(card) {
  return {
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
    eventName: card.eventName,
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
    sourceImageUrl: await presign(card.sourceImageS3Key),
    generatedAvatarUrl: await presign(card.generatedAvatarS3Key),
  };
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

async function tryGenerateAvatar({ sourceImage, firstName, wellnessInterest }) {
  if (!BEDROCK_IMAGE_MODEL_ID) {
    return { ...sourceImage, usedFallback: true };
  }

  try {
    const prompt = `Create a premium wellness digital avatar inspired by the uploaded user photo. Use a clean healthcare-friendly aesthetic, warm expression, soft modern lighting, subtle blue and white background, polished but not cartoonish, no text, no logos, no medical equipment, no diagnosis, no exaggerated features. First name context: ${firstName}. Wellness focus: ${INTEREST_LABELS[wellnessInterest]}.`;
    const payload = buildTitanImagePayload(prompt, sourceImage);
    const result = await bedrock.send(
      new InvokeModelCommand({
        modelId: BEDROCK_IMAGE_MODEL_ID,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify(payload),
      })
    );
    const parsed = JSON.parse(new TextDecoder().decode(result.body));
    const imageBase64 = parsed.images?.[0] ?? parsed.image;

    if (!imageBase64) {
      throw new Error("Bedrock response did not include an image.");
    }

    return {
      buffer: Buffer.from(imageBase64, "base64"),
      contentType: "image/png",
      extension: "png",
      usedFallback: false,
    };
  } catch (error) {
    console.error("Twin Card Bedrock generation failed; using fallback", {
      modelId: BEDROCK_IMAGE_MODEL_ID,
      message: error instanceof Error ? error.message : String(error),
    });
    return { ...sourceImage, usedFallback: true };
  }
}

function buildTitanImagePayload(prompt, sourceImage) {
  return {
    taskType: "IMAGE_VARIATION",
    imageVariationParams: {
      text: prompt,
      images: [sourceImage.buffer.toString("base64")],
      similarityStrength: 0.45,
    },
    imageGenerationConfig: {
      numberOfImages: 1,
      quality: "premium",
      height: 1024,
      width: 1024,
      cfgScale: 7.5,
    },
  };
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

function parseDataUrl(value) {
  if (typeof value !== "string") return null;
  const match = value.match(/^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return null;

  const contentType = match[1] === "image/jpg" ? "image/jpeg" : match[1];
  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length < 100 || buffer.length > 7_500_000) return null;

  return {
    buffer,
    contentType,
    extension: contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg",
  };
}

function readInterest(value) {
  return Object.hasOwn(INTEREST_LABELS, value) ? value : "just_exploring";
}

function inferContactType(contact) {
  if (/@/.test(contact)) return "email";
  if (/\d/.test(contact)) return "phone";
  return "unknown";
}

function sanitizeString(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
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
    "access-control-allow-headers": "content-type,authorization",
    "vary": "Origin",
  };
}
