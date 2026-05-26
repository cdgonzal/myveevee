import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import {
  DEFAULT_BEDROCK_IMAGE_PROVIDER_PRIORITY,
  DEFAULT_CARDS_PREFIX,
  FALLBACK_ORIGINAL_PHOTO_PROVIDER_ID,
  GOAL_ASPIRATIONS,
  INTEREST_LABELS,
  buildRunArtifact,
  keyForFailure,
  keyForGenerated,
  parseCardKey,
} from "./common.mjs";
import avatarRecipeContract from "../../src/twinCard/avatarRecipeContract.json";

const s3 = new S3Client({});
const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const bedrock = new BedrockRuntimeClient({});

const {
  CARDS_BUCKET,
  CARDS_TABLE,
  CARDS_PREFIX = DEFAULT_CARDS_PREFIX,
  BEDROCK_IMAGE_PROVIDER_PRIORITY,
  AVATAR_STYLE_REFERENCE_S3_KEY,
} = process.env;
const BEDROCK_IMAGE_MODEL_ID_OVERRIDE = process.env.BEDROCK_IMAGE_MODEL_ID?.trim();
const PROVIDER_PRIORITY = parseProviderPriority(BEDROCK_IMAGE_PROVIDER_PRIORITY, BEDROCK_IMAGE_MODEL_ID_OVERRIDE);

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
    generationProvider: "bedrock",
    generationMessage: "Creating your VeeVee Twin Card image.",
    bedrockProviderPriority: PROVIDER_PRIORITY,
    avatarRecipeId: avatarRecipeContract.id,
    avatarRecipeVersion: avatarRecipeContract.version,
    updatedAt: new Date().toISOString(),
  });

  const sourceImage = await readObject(sourceImageS3Key);
  let generated;
  const attempts = [];

  try {
    generated = await generateAvatar(card, sourceImage, attempts);
  } catch (error) {
    console.error("Twin Card Bedrock avatar generation failed; using original-photo fallback", {
      cardId: parsedKey.cardId,
      providerPriority: PROVIDER_PRIORITY,
      message: error instanceof Error ? error.message : String(error),
    });
    await writeFailure(parsedKey.runPrefix, "avatar-generation", {
      cardId: parsedKey.cardId,
      providerPriority: PROVIDER_PRIORITY,
      attempts,
      message: error instanceof Error ? error.message : String(error),
      failedAt: new Date().toISOString(),
    });
    generated = {
      buffer: sourceImage.buffer,
      contentType: sourceImage.contentType,
      extension: sourceImage.contentType === "image/png" ? "png" : "jpg",
      usedFallback: true,
      providerId: FALLBACK_ORIGINAL_PHOTO_PROVIDER_ID,
      provider: FALLBACK_ORIGINAL_PHOTO_PROVIDER_ID,
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
    generationProvider: generated.provider,
    generationMessage: generated.usedFallback
      ? "We created your Twin Card using your uploaded photo."
      : "Your VeeVee Twin Card image is ready.",
    bedrockModelId: generated.providerId,
    bedrockProviderPriority: PROVIDER_PRIORITY,
    bedrockProviderAttempts: attempts,
    avatarRecipeId: avatarRecipeContract.id,
    avatarRecipeVersion: avatarRecipeContract.version,
    generatedAvatarS3Key,
    generatedAvatarBytes: generated.buffer.length,
    generatedAvatarContentType: generated.contentType,
    generatedAt: now,
    updatedAt: now,
  };

  const updatedCard = await updateCard(parsedKey.cardId, updates);
  await writeRunArtifact(updatedCard);
}

async function generateAvatar(card, sourceImage, attempts) {
  const providers = PROVIDER_PRIORITY.length ? PROVIDER_PRIORITY : DEFAULT_BEDROCK_IMAGE_PROVIDER_PRIORITY;
  const errors = [];

  for (const providerId of providers) {
    if (providerId === FALLBACK_ORIGINAL_PHOTO_PROVIDER_ID) {
      throw new Error(`Reached ${FALLBACK_ORIGINAL_PHOTO_PROVIDER_ID} after provider failures: ${errors.join(" | ")}`);
    }

    if (providerId === "us.stability.stable-style-transfer-v1:0" && !AVATAR_STYLE_REFERENCE_S3_KEY) {
      attempts.push({
        providerId,
        status: "skipped",
        message: "Style Transfer requires AVATAR_STYLE_REFERENCE_S3_KEY.",
        attemptedAt: new Date().toISOString(),
      });
      continue;
    }

    try {
      const result = await invokeStabilityProvider(providerId, card, sourceImage);
      attempts.push({
        providerId,
        provider: result.provider,
        status: "completed",
        attemptedAt: new Date().toISOString(),
      });
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      attempts.push({
        providerId,
        provider: providerNameFor(providerId),
        status: "failed",
        message,
        attemptedAt: new Date().toISOString(),
      });
      errors.push(`${providerId}: ${message}`);
    }
  }

  throw new Error(errors.length ? errors.join(" | ") : "No Bedrock avatar provider was attempted.");
}

async function invokeStabilityProvider(providerId, card, sourceImage) {
  if (providerId === "amazon.nova-canvas-v1:0") {
    return invokeNovaCanvas(providerId, card, sourceImage);
  }

  if (!providerId.startsWith("us.stability.")) {
    throw new Error(`Unsupported Twin Card avatar provider: ${providerId}`);
  }

  const payload = await buildStabilityPayload(providerId, card, sourceImage);
  const result = await bedrock.send(
    new InvokeModelCommand({
      modelId: providerId,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(payload),
    })
  );
  const parsed = JSON.parse(new TextDecoder().decode(result.body));
  const imageBase64 = parsed.images?.[0] ?? parsed.image;

  if (!imageBase64) {
    const finishReason = parsed.finish_reasons?.[0] ?? parsed.finishReason ?? "unknown";
    throw new Error(`Stability response did not include an image. finishReason=${finishReason}`);
  }

  return {
    buffer: Buffer.from(imageBase64, "base64"),
    contentType: "image/png",
    extension: "png",
    usedFallback: false,
    providerId,
    provider: providerNameFor(providerId),
  };
}

async function buildStabilityPayload(providerId, card, sourceImage) {
  const base64Image = sourceImage.buffer.toString("base64");
  const prompt = buildPrompt(card);
  const negativePrompt = buildNegativePrompt();
  const settings = avatarRecipeContract.providerSettings ?? {};

  if (providerId === "us.stability.stable-image-control-structure-v1:0") {
    const controlSettings = settings.stabilityControlStructure ?? {};
    const payload = {
      image: base64Image,
      prompt,
      negative_prompt: negativePrompt,
      control_strength: controlSettings.controlStrength ?? 0.9,
      output_format: controlSettings.outputFormat ?? "png",
    };
    if (controlSettings.stylePreset) {
      payload.style_preset = controlSettings.stylePreset;
    }
    return payload;
  }

  if (providerId === "us.stability.stable-style-transfer-v1:0") {
    const styleImage = await readObject(AVATAR_STYLE_REFERENCE_S3_KEY);
    const transferSettings = settings.stabilityStyleTransfer ?? {};
    return {
      init_image: base64Image,
      style_image: styleImage.buffer.toString("base64"),
      prompt,
      negative_prompt: negativePrompt,
      output_format: transferSettings.outputFormat ?? "png",
      composition_fidelity: transferSettings.compositionFidelity ?? 0.86,
      style_strength: transferSettings.styleStrength ?? 0.42,
      change_strength: transferSettings.changeStrength ?? 0.38,
    };
  }

  if (providerId === "us.stability.stable-image-style-guide-v1:0") {
    const guideSettings = settings.stabilityStyleGuide ?? {};
    const payload = {
      image: base64Image,
      prompt,
      negative_prompt: negativePrompt,
      output_format: guideSettings.outputFormat ?? "png",
      fidelity: guideSettings.fidelity ?? 0.82,
    };
    if (guideSettings.stylePreset) {
      payload.style_preset = guideSettings.stylePreset;
    }
    return payload;
  }

  throw new Error(`No Stability payload builder for ${providerId}`);
}

async function invokeNovaCanvas(providerId, card, sourceImage) {
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
      modelId: providerId,
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
    providerId,
    provider: "nova_canvas",
  };
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

function parseProviderPriority(value, legacyModelOverride) {
  const raw = typeof value === "string" ? value : "";
  const providers = raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  if (!providers.length && legacyModelOverride) {
    providers.push(legacyModelOverride);
  }
  return providers.length ? providers : DEFAULT_BEDROCK_IMAGE_PROVIDER_PRIORITY;
}

function providerNameFor(providerId) {
  if (providerId === "us.stability.stable-image-control-structure-v1:0") return "stability_control_structure";
  if (providerId === "us.stability.stable-style-transfer-v1:0") return "stability_style_transfer";
  if (providerId === "us.stability.stable-image-style-guide-v1:0") return "stability_style_guide";
  if (providerId === "amazon.nova-canvas-v1:0") return "nova_canvas";
  if (providerId === FALLBACK_ORIGINAL_PHOTO_PROVIDER_ID) return FALLBACK_ORIGINAL_PHOTO_PROVIDER_ID;
  return "bedrock";
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
