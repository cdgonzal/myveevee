import goalContentContract from "../../src/twinCard/goalContentContract.json";
import avatarProviderContract from "../../src/twinCard/avatarProviderContract.json";

export const DEFAULT_CARDS_PREFIX = "twin-card";
export const FALLBACK_ORIGINAL_PHOTO_PROVIDER_ID = "fallback_original_photo_card";
export const DEFAULT_BEDROCK_IMAGE_PROVIDER_PRIORITY = avatarProviderContract.avatarProviderPriority ?? [
  "us.stability.stable-image-control-structure-v1:0",
  "us.stability.stable-style-transfer-v1:0",
  "us.stability.stable-image-style-guide-v1:0",
  FALLBACK_ORIGINAL_PHOTO_PROVIDER_ID,
];
export const DEFAULT_BEDROCK_IMAGE_MODEL_ID = DEFAULT_BEDROCK_IMAGE_PROVIDER_PRIORITY[0];

const CONTRACT_GOALS = goalContentContract.goals ?? {};

export const INTEREST_LABELS = {
  prepare_for_care: CONTRACT_GOALS.prepare_for_care?.goalTitle ?? "Get Back To Life",
  understand_symptoms: "Understand symptoms",
  organize_records: "Organize health records",
  track_goals: CONTRACT_GOALS.track_goals?.goalTitle ?? "Move With Less Pain",
  understand_benefits: "Understand benefits",
  support_loved_one: CONTRACT_GOALS.support_loved_one?.goalTitle ?? "Explore Advanced Care",
  just_exploring: "Just exploring",
};

export const GOAL_ASPIRATIONS = {
  prepare_for_care: CONTRACT_GOALS.prepare_for_care?.cardHeadline ?? "Daily Life Comeback Focus",
  understand_symptoms: "Turn questions into calm next steps.",
  organize_records: "Keep your health story close at hand.",
  track_goals: CONTRACT_GOALS.track_goals?.cardHeadline ?? "Comfort + Mobility Focus",
  understand_benefits: "Move forward with more confidence.",
  support_loved_one: CONTRACT_GOALS.support_loved_one?.cardHeadline ?? "Advanced Wellness Options",
  just_exploring: "Start your wellness journey with confidence.",
};

export const GOAL_CONTENT = {
  ...CONTRACT_GOALS,
  just_exploring: {
    goalTitle: "Wellness Journey",
    cardHeadline: "Personal Wellness Focus",
    finding: "Your Health Twin is focused on helping you take the next positive step in your wellness journey.",
    recommendations: ["Ask clear questions", "Explore your options", "Choose one next step"],
    cta: "Start a wellness conversation with SWCA.",
  },
};

export function buildRunPrefix({ cardsPrefix = DEFAULT_CARDS_PREFIX, cardId, createdAt = new Date().toISOString() }) {
  const date = new Date(createdAt);
  const yyyy = String(date.getUTCFullYear());
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${cardsPrefix}/${yyyy}/${mm}/${dd}/${cardId}`;
}

export function keyForRun(prefix) {
  return `${prefix}/run.json`;
}

export function keyForSource(prefix) {
  return `${prefix}/source/normalized.jpg`;
}

export function keyForGenerated(prefix, extension = "png") {
  return `${prefix}/generated/avatar.${extension}`;
}

export function keyForPrint(prefix, extension = "svg") {
  return `${prefix}/print/selphy-cp1500-4x6.${extension}`;
}

export function keyForFailure(prefix, stage) {
  return `${prefix}/failures/${stage}.json`;
}

export function parseCardKey(key) {
  if (typeof key !== "string") return null;
  const parts = key.split("/");
  const stageIndex = parts.findIndex((part) => part === "source" || part === "generated" || part === "print" || part === "failures");
  if (stageIndex < 4) return null;
  const stage = parts[stageIndex];
  const cardId = parts[stageIndex - 1];
  const prefix = parts.slice(0, stageIndex - 1).join("/");
  const runS3Key = keyForRun(`${prefix}/${cardId}`);
  return {
    cardId,
    stage,
    runPrefix: `${prefix}/${cardId}`,
    runS3Key,
  };
}

export function sanitizeString(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

export function readInterest(value) {
  return Object.hasOwn(INTEREST_LABELS, value) ? value : "just_exploring";
}

export function inferContactType(contact) {
  if (/@/.test(contact)) return "email";
  if (/\d/.test(contact)) return "phone";
  return "unknown";
}

export function parseDataUrl(value) {
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

export function normalizeImageUpload(value, sourceImage) {
  const upload = typeof value === "object" && value ? value : {};
  return {
    originalFileName: sanitizeString(upload.originalFileName, 180),
    originalFileType: sanitizeString(upload.originalFileType, 80),
    originalFileBytes: safeNumber(upload.originalFileBytes),
    originalWidthPx: safeNumber(upload.originalWidthPx),
    originalHeightPx: safeNumber(upload.originalHeightPx),
    normalizedWidthPx: safeNumber(upload.normalizedWidthPx) || 1024,
    normalizedHeightPx: safeNumber(upload.normalizedHeightPx) || 1024,
    normalizedMimeType: sanitizeString(upload.normalizedMimeType, 80) || sourceImage?.contentType || "image/jpeg",
    normalizedBytesEstimate: safeNumber(upload.normalizedBytesEstimate) || sourceImage?.buffer.length || 0,
    contractId: sanitizeString(upload.contractId, 80) || "twin-card-ai-avatar-upload-v1",
  };
}

export function buildRunArtifact(record) {
  return {
    schema: "twin-card-run-v1",
    cardId: record.cardId,
    capturedAt: record.updatedAt,
    lead: {
      firstName: record.firstName,
      contact: record.contact,
      contactType: record.contactType,
      language: record.language,
      wellnessInterest: record.wellnessInterest,
      wellnessInterestLabel: record.wellnessInterestLabel,
      consentAccepted: record.consentAccepted,
      betaInterest: record.betaInterest,
    },
    event: {
      eventName: record.eventName,
      boothDeviceId: record.boothDeviceId,
      deviceMetadata: record.deviceMetadata,
      cardResultUrl: record.cardResultUrl,
    },
    image: {
      upload: record.imageUpload,
      sourceImageS3Key: record.sourceImageS3Key,
      sourceImageBytes: record.sourceImageBytes,
      sourceImageContentType: record.sourceImageContentType,
      generatedAvatarS3Key: record.generatedAvatarS3Key,
      generatedAvatarBytes: record.generatedAvatarBytes,
      generatedAvatarContentType: record.generatedAvatarContentType,
      printLayoutS3Key: record.printLayoutS3Key,
      printLayoutBytes: record.printLayoutBytes,
      printLayoutContentType: record.printLayoutContentType,
      printImageS3Key: record.printImageS3Key,
      printImageBytes: record.printImageBytes,
      printImageContentType: record.printImageContentType,
    },
    generation: {
      status: record.generationStatus,
      provider: record.generationProvider,
      message: record.generationMessage,
      bedrockModelId: record.bedrockModelId || null,
      bedrockProviderPriority: record.bedrockProviderPriority || null,
      bedrockProviderAttempts: record.bedrockProviderAttempts || null,
    },
    render: {
      status: record.renderStatus,
      renderedAt: record.renderedAt,
    },
    fulfillment: {
      status: record.fulfillmentStatus,
    },
  };
}
