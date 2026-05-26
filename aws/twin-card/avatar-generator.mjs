import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import {
  DEFAULT_BEDROCK_IMAGE_MODEL_ID,
  DEFAULT_CARDS_PREFIX,
  GOAL_ASPIRATIONS,
  INTEREST_LABELS,
  buildRunArtifact,
  keyForFailure,
  keyForGenerated,
  parseCardKey,
} from "./common.mjs";

const s3 = new S3Client({});
const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const bedrock = new BedrockRuntimeClient({});

const {
  CARDS_BUCKET,
  CARDS_TABLE,
  CARDS_PREFIX = DEFAULT_CARDS_PREFIX,
} = process.env;
const BEDROCK_IMAGE_MODEL_ID = process.env.BEDROCK_IMAGE_MODEL_ID || DEFAULT_BEDROCK_IMAGE_MODEL_ID;

export async function handler(event) {
  validateConfig();

  for (const record of event.Records ?? []) {
    const bucket = record.s3?.bucket?.name;
    const key = decodeURIComponent((record.s3?.object?.key ?? "").replace(/\+/g, " "));

    if (bucket !== CARDS_BUCKET || !key.includes(`/${"source"}/`)) {
      continue;
    }

    await processSourceImage(key);
  }
}

async function processSourceImage(sourceImageS3Key) {
  const parsedKey = parseCardKey(sourceImageS3Key);
  if (!parsedKey || parsedKey.stage !== "source" || !parsedKey.runPrefix.startsWith(CARDS_PREFIX)) {
    return;
  }

  const card = await loadCard(parsedKey.cardId);
  if (!card) {
    throw new Error(`Twin Card record not found for ${parsedKey.cardId}`);
  }

  await updateCard(parsedKey.cardId, {
    generationStatus: "generating",
    generationProvider: "nova_canvas",
    generationMessage: "Creating your VeeVee Twin Card image.",
    updatedAt: new Date().toISOString(),
  });

  const sourceImage = await readObject(sourceImageS3Key);
  let generated;

  try {
    generated = await invokeNovaCanvas(card, sourceImage);
  } catch (error) {
    console.error("Twin Card Nova Canvas generation failed; using source-photo fallback", {
      cardId: parsedKey.cardId,
      modelId: BEDROCK_IMAGE_MODEL_ID,
      message: error instanceof Error ? error.message : String(error),
    });
    await writeFailure(parsedKey.runPrefix, "avatar-generation", {
      cardId: parsedKey.cardId,
      modelId: BEDROCK_IMAGE_MODEL_ID,
      message: error instanceof Error ? error.message : String(error),
      failedAt: new Date().toISOString(),
    });
    generated = {
      buffer: sourceImage.buffer,
      contentType: sourceImage.contentType,
      extension: sourceImage.contentType === "image/png" ? "png" : "jpg",
      usedFallback: true,
    };
  }

  const generatedAvatarS3Key = keyForGenerated(parsedKey.runPrefix, generated.extension);
  await s3.send(
    new PutObjectCommand({
      Bucket: CARDS_BUCKET,
      Key: generatedAvatarS3Key,
      Body: generated.buffer,
      ContentType: generated.contentType,
      ServerSideEncryption: "AES256",
    })
  );

  const now = new Date().toISOString();
  const updates = {
    generationStatus: generated.usedFallback ? "fallback_used" : "completed",
    generationProvider: generated.usedFallback ? "fallback" : "nova_canvas",
    generationMessage: generated.usedFallback
      ? "We created your Twin Card using your uploaded photo."
      : "Your VeeVee Twin Card image is ready.",
    bedrockModelId: BEDROCK_IMAGE_MODEL_ID,
    generatedAvatarS3Key,
    generatedAvatarBytes: generated.buffer.length,
    generatedAvatarContentType: generated.contentType,
    generatedAt: now,
    updatedAt: now,
  };

  const updatedCard = await updateCard(parsedKey.cardId, updates);
  await writeRunArtifact(updatedCard);
}

async function invokeNovaCanvas(card, sourceImage) {
  const prompt = buildPrompt(card);
  const payload = {
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
    throw new Error("Nova Canvas response did not include an image.");
  }

  return {
    buffer: Buffer.from(imageBase64, "base64"),
    contentType: "image/png",
    extension: "png",
    usedFallback: false,
  };
}

function buildPrompt(card) {
  const interest = card.wellnessInterest ?? "just_exploring";
  const focus = INTEREST_LABELS[interest] ?? INTEREST_LABELS.just_exploring;
  const aspiration = GOAL_ASPIRATIONS[interest] ?? GOAL_ASPIRATIONS.just_exploring;
  return [
    "Create a polished, optimistic 2D wellness avatar inspired by the reference photo.",
    "Friendly expression, clean healthcare-friendly style, warm lighting, modern blue and white palette.",
    "Premium event card look, no text, no logos, no diagnosis, no medical equipment, no exaggerated features.",
    `Wellness focus: ${focus}.`,
    `Aspirational tone: ${aspiration}`,
    "The image should feel positive for a 3-6 month wellness journey.",
  ].join(" ");
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
    contentType: result.ContentType ?? "image/jpeg",
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

function validateConfig() {
  const missing = [];
  if (!CARDS_BUCKET) missing.push("CARDS_BUCKET");
  if (!CARDS_TABLE) missing.push("CARDS_TABLE");
  if (missing.length) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }
}
