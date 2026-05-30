import crypto from "node:crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutObjectCommand, GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
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
const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

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

    if ((event.requestContext?.http?.method ?? "") === "POST" && (event.rawPath ?? "").startsWith("/twin-card/cards/") && (event.rawPath ?? "").endsWith("/beta-survey")) {
      return await saveBetaSurvey(event, origin);
    }

    if ((event.requestContext?.http?.method ?? "") === "POST" && (event.rawPath ?? "").startsWith("/twin-card/cards/") && (event.rawPath ?? "").endsWith("/engagement")) {
      return await recordEngagement(event, origin);
    }

    if (route.endsWith("GET /twin-card/admin/cards")) {
      return await listCards(event, origin);
    }

    if ((event.requestContext?.http?.method ?? "") === "POST" && (event.rawPath ?? "").startsWith("/twin-card/admin/cards/") && (event.rawPath ?? "").endsWith("/printed")) {
      return await markCardPrinted(event, origin);
    }

    if ((event.requestContext?.http?.method ?? "") === "POST" && (event.rawPath ?? "").startsWith("/twin-card/admin/cards/") && (event.rawPath ?? "").endsWith("/fulfillment")) {
      return await updateCardFulfillment(event, origin);
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
  const requestStartedAtMs = Date.now();
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

  const sourceUploadedAt = new Date().toISOString();
  const uploadedRecord = await updateCard(cardId, {
    sourceUploadedAt,
    uploadDurationMs: Date.now() - requestStartedAtMs,
    updatedAt: sourceUploadedAt,
  });
  await s3.send(
    new PutObjectCommand({
      Bucket: CARDS_BUCKET,
      Key: runS3Key,
      Body: JSON.stringify(buildRunArtifact(uploadedRecord), null, 2),
      ContentType: "application/json",
      ServerSideEncryption: "AES256",
    })
  );

  return response(200, { ok: true, card: await serializeCard(uploadedRecord) }, origin);
}

async function getCard(event, origin) {
  const cardId = decodeURIComponent((event.rawPath ?? "").split("/").pop() ?? "");
  const card = await loadCard(cardId);

  if (!card) {
    return response(404, { message: "Twin Card not found." }, origin);
  }

  return response(200, { ok: true, card: await serializeCard(card) }, origin);
}

async function saveBetaSurvey(event, origin) {
  const match = (event.rawPath ?? "").match(/\/twin-card\/cards\/([^/]+)\/beta-survey$/);
  const cardId = decodeURIComponent(match?.[1] ?? "");
  if (!cardId) {
    return response(400, { message: "Card ID required." }, origin);
  }

  const existing = await loadCard(cardId);
  if (!existing) {
    return response(404, { message: "Twin Card not found." }, origin);
  }

  const payload = parseBody(event);
  const survey = normalizeBetaSurvey(payload);
  const now = new Date().toISOString();
  const updatedCard = await updateCard(cardId, {
    betaSurveyStatus: survey.stage === "completed" ? "completed" : "partial",
    betaSurveySource: survey.source,
    betaSurveyStage: survey.stage,
    betaSurveyCompletedSections: survey.completedSections,
    betaSurveyResponses: survey.responses,
    betaSurveyContact: survey.contact,
    betaSurveyAnswerCount: Object.keys(survey.responses).filter((key) => hasSurveyAnswer(survey.responses[key])).length,
    betaSurveyUpdatedAt: now,
    betaSurveySubmittedAt: survey.stage === "completed" ? now : existing.betaSurveySubmittedAt,
    updatedAt: now,
  });
  await writeRunArtifact(updatedCard);

  return response(200, { ok: true, card: await serializeCard(updatedCard) }, origin);
}

async function recordEngagement(event, origin) {
  const match = (event.rawPath ?? "").match(/\/twin-card\/cards\/([^/]+)\/engagement$/);
  const cardId = decodeURIComponent(match?.[1] ?? "");
  if (!cardId) {
    return response(400, { message: "Card ID required." }, origin);
  }

  const existing = await loadCard(cardId);
  if (!existing) {
    return response(404, { message: "Twin Card not found." }, origin);
  }

  const payload = parseBody(event);
  const eventName = normalizeEngagementEventName(payload.eventName);
  const source = sanitizeString(payload.source, 40);
  const pagePath = sanitizeString(payload.pagePath, 160);
  const now = new Date().toISOString();
  const updates = {
    engagementUpdatedAt: now,
    lastEngagementEvent: eventName,
    lastEngagementSource: source,
    lastEngagementPagePath: pagePath,
    updatedAt: now,
  };

  if (eventName === "result_view" || eventName === "email_result_view") {
    updates.resultViewCount = Number(existing.resultViewCount ?? 0) + 1;
    updates.firstResultViewedAt = existing.firstResultViewedAt ?? now;
    updates.lastResultViewedAt = now;
  }

  if (eventName === "email_result_view" || source === "email") {
    updates.emailClickCount = Number(existing.emailClickCount ?? 0) + 1;
    updates.firstEmailClickedAt = existing.firstEmailClickedAt ?? now;
    updates.lastEmailClickedAt = now;
  }

  if (eventName === "personalize_click") {
    updates.personalizeClickCount = Number(existing.personalizeClickCount ?? 0) + 1;
    updates.firstPersonalizeClickedAt = existing.firstPersonalizeClickedAt ?? now;
    updates.lastPersonalizeClickedAt = now;
  }

  const updatedCard = await updateCard(cardId, updates);
  await writeRunArtifact(updatedCard);

  return response(200, { ok: true, card: await serializeCard(updatedCard) }, origin);
}

async function listCards(event, origin) {
  if (!isDashboardAuthorized(event)) {
    return response(403, { message: "Dashboard PIN required." }, origin);
  }

  const items = [];
  let ExclusiveStartKey;
  do {
    const result = await dynamo.send(
      new ScanCommand({
        TableName: CARDS_TABLE,
        Limit: 100,
        ExclusiveStartKey,
      })
    );
    items.push(...(result.Items ?? []));
    ExclusiveStartKey = result.LastEvaluatedKey;
  } while (ExclusiveStartKey);
  const cards = items.sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));

  return response(200, { ok: true, cards: await Promise.all(cards.map((card) => serializeCard(card, { includePrivateFields: true }))) }, origin);
}

async function markCardPrinted(event, origin) {
  if (!isDashboardAuthorized(event)) {
    return response(403, { message: "Dashboard PIN required." }, origin);
  }

  const match = (event.rawPath ?? "").match(/\/twin-card\/admin\/cards\/([^/]+)\/printed$/);
  const cardId = decodeURIComponent(match?.[1] ?? "");
  if (!cardId) {
    return response(400, { message: "Card ID required." }, origin);
  }

  const existing = await loadCard(cardId);
  if (!existing) {
    return response(404, { message: "Twin Card not found." }, origin);
  }

  const now = new Date().toISOString();
  const payload = parseBody(event);
  const printedBy = sanitizeString(payload.printedBy ?? payload.updatedBy, 120) || "booth-dashboard";
  let result;
  try {
    result = await dynamo.send(
      new UpdateCommand({
        TableName: CARDS_TABLE,
        Key: { cardId },
        ConditionExpression: "attribute_exists(cardId)",
        UpdateExpression: "SET fulfillmentStatus = :printed, printedAt = if_not_exists(printedAt, :now), lastPrintedAt = :now, printedBy = :printedBy, updatedAt = :now ADD printedCount :one",
        ExpressionAttributeValues: {
          ":printed": "printed",
          ":now": now,
          ":printedBy": printedBy,
          ":one": 1,
        },
        ReturnValues: "ALL_NEW",
      })
    );
  } catch (error) {
    if (error?.name === "ConditionalCheckFailedException") {
      return response(404, { message: "Twin Card not found." }, origin);
    }
    throw error;
  }

  if (!result.Attributes) {
    return response(404, { message: "Twin Card not found." }, origin);
  }

  await writeRunArtifact(result.Attributes);

  return response(200, { ok: true, card: await serializeCard(result.Attributes, { includePrivateFields: true }) }, origin);
}

async function updateCardFulfillment(event, origin) {
  if (!isDashboardAuthorized(event)) {
    return response(403, { message: "Dashboard PIN required." }, origin);
  }

  const match = (event.rawPath ?? "").match(/\/twin-card\/admin\/cards\/([^/]+)\/fulfillment$/);
  const cardId = decodeURIComponent(match?.[1] ?? "");
  if (!cardId) {
    return response(400, { message: "Card ID required." }, origin);
  }

  const existing = await loadCard(cardId);
  if (!existing) {
    return response(404, { message: "Twin Card not found." }, origin);
  }

  const payload = parseBody(event);
  const fulfillmentStatus = normalizeFulfillmentStatus(payload.fulfillmentStatus);
  if (!fulfillmentStatus) {
    return response(400, { message: "Valid fulfillment status required." }, origin);
  }

  const now = new Date().toISOString();
  const updatedBy = sanitizeString(payload.updatedBy ?? payload.printedBy, 120) || "booth-dashboard";
  const attributes = {
    fulfillmentStatus,
    updatedAt: now,
  };

  if (fulfillmentStatus === "printed") {
    attributes.printedAt = existing.printedAt ?? now;
    attributes.lastPrintedAt = now;
    attributes.printedBy = updatedBy;
    attributes.printedCount = Math.max(Number(existing.printedCount ?? 0), 1);
  }

  if (fulfillmentStatus === "issue") {
    attributes.issueAt = now;
    attributes.issueBy = updatedBy;
  }

  const updatedCard = await updateCard(cardId, attributes);
  await writeRunArtifact(updatedCard);

  return response(200, { ok: true, card: await serializeCard(updatedCard, { includePrivateFields: true }) }, origin);
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

  if (!assignments.length) return loadCard(cardId);

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

async function serializeCard(card, options = {}) {
  const publicCard = {
    cardId: card.cardId,
    recordType: card.recordType,
    replayRunId: card.replayRunId,
    replaySourceCardId: card.replaySourceCardId,
    replayOutputSequence: card.replayOutputSequence,
    replayModelId: card.replayModelId,
    replayProvider: card.replayProvider,
    replayReportUrl: await presign(card.replayReportS3Key),
    firstName: card.firstName,
    contactType: card.contactType,
    wellnessInterest: card.wellnessInterest,
    wellnessInterestLabel: card.wellnessInterestLabel,
    betaInterest: Boolean(card.betaInterest),
    cardResultUrl: card.cardResultUrl,
    generationStatus: card.generationStatus,
    generationProvider: card.generationProvider,
    generationMessage: card.generationMessage,
    bedrockUsage: card.bedrockUsage,
    avatarRecipeId: card.avatarRecipeId,
    avatarRecipeVersion: card.avatarRecipeVersion,
    renderStatus: card.renderStatus,
    fulfillmentStatus: card.fulfillmentStatus,
    emailStatus: card.emailStatus,
    emailChannel: card.emailChannel,
    emailQueuedAt: card.emailQueuedAt,
    emailSentAt: card.emailSentAt,
    emailMessageId: card.emailMessageId,
    emailFailedAt: card.emailFailedAt,
    emailSkippedAt: card.emailSkippedAt,
    emailSkipReason: card.emailSkipReason,
    betaSurveyStatus: card.betaSurveyStatus,
    betaSurveyStage: card.betaSurveyStage,
    betaSurveyAnswerCount: card.betaSurveyAnswerCount,
    betaSurveyUpdatedAt: card.betaSurveyUpdatedAt,
    betaSurveySubmittedAt: card.betaSurveySubmittedAt,
    resultViewCount: Number(card.resultViewCount ?? 0),
    firstResultViewedAt: card.firstResultViewedAt,
    lastResultViewedAt: card.lastResultViewedAt,
    emailClickCount: Number(card.emailClickCount ?? 0),
    firstEmailClickedAt: card.firstEmailClickedAt,
    lastEmailClickedAt: card.lastEmailClickedAt,
    personalizeClickCount: Number(card.personalizeClickCount ?? 0),
    firstPersonalizeClickedAt: card.firstPersonalizeClickedAt,
    lastPersonalizeClickedAt: card.lastPersonalizeClickedAt,
    engagementUpdatedAt: card.engagementUpdatedAt,
    lastEngagementEvent: card.lastEngagementEvent,
    lastEngagementSource: card.lastEngagementSource,
    printedAt: card.printedAt,
    lastPrintedAt: card.lastPrintedAt,
    printedBy: card.printedBy,
    issueAt: card.issueAt,
    issueBy: card.issueBy,
    printedCount: Number(card.printedCount ?? 0),
    eventName: card.eventName,
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
    sourceUploadedAt: card.sourceUploadedAt,
    generatedAt: card.generatedAt,
    renderedAt: card.renderedAt,
    avatarGenerationStartedAt: card.avatarGenerationStartedAt,
    printCompositionStartedAt: card.printCompositionStartedAt,
    uploadDurationMs: card.uploadDurationMs,
    avatarGenerationDurationMs: card.avatarGenerationDurationMs,
    printCompositionDurationMs: card.printCompositionDurationMs,
    totalRunDurationMs: card.totalRunDurationMs,
    sourceImageUrl: await presign(card.sourceImageS3Key),
    generatedAvatarUrl: await presign(card.generatedAvatarS3Key),
    printImageContentType: card.printImageContentType,
    printImageUrl: await presign(card.printImageS3Key),
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
    betaSurveySource: card.betaSurveySource,
    betaSurveyCompletedSections: card.betaSurveyCompletedSections,
    betaSurveyResponses: card.betaSurveyResponses,
    betaSurveyContact: card.betaSurveyContact,
    runS3Key: card.runS3Key,
    sourceImageS3Key: card.sourceImageS3Key,
    generatedAvatarS3Key: card.generatedAvatarS3Key,
    printLayoutS3Key: card.printLayoutS3Key,
    printImageS3Key: card.printImageS3Key,
    bedrockProviderAttempts: card.bedrockProviderAttempts,
    sourceImageBytes: card.sourceImageBytes,
    generatedAvatarBytes: card.generatedAvatarBytes,
    printLayoutBytes: card.printLayoutBytes,
    printImageBytes: card.printImageBytes,
    printLayoutContentType: card.printLayoutContentType,
    printImageContentType: card.printImageContentType,
    runJsonUrl: await presign(card.runS3Key),
    replayManifestS3Key: card.replayManifestS3Key,
    replayReportS3Key: card.replayReportS3Key,
    replayManifestUrl: await presign(card.replayManifestS3Key),
    replayReportUrl: await presign(card.replayReportS3Key),
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

function normalizeFulfillmentStatus(value) {
  const status = sanitizeString(value, 40);
  if (status === "ready_to_print" || status === "to_print" || status === "not_printed") return "not_printed";
  if (status === "printed") return "printed";
  if (status === "issue" || status === "problem") return "issue";
  return "";
}

function normalizeBetaSurvey(payload) {
  const body = typeof payload === "object" && payload ? payload : {};
  return {
    source: sanitizeString(body.source, 80) || "twin_card_result",
    stage: sanitizeString(body.stage, 80) || "partial",
    completedSections: Array.isArray(body.completedSections)
      ? body.completedSections.map((value) => sanitizeString(value, 80)).filter(Boolean).slice(0, 10)
      : [],
    responses: normalizeSurveyMap(body.responses, 60, 1000),
    contact: normalizeSurveyMap(body.contact, 12, 240),
  };
}

function normalizeSurveyMap(value, maxKeys, maxValueLength) {
  const object = typeof value === "object" && value && !Array.isArray(value) ? value : {};
  return Object.fromEntries(
    Object.entries(object)
      .slice(0, maxKeys)
      .map(([key, entry]) => [sanitizeString(key, 80), normalizeSurveyValue(entry, maxValueLength)])
      .filter(([key, entry]) => key && hasSurveyAnswer(entry))
  );
}

function normalizeSurveyValue(value, maxValueLength) {
  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeString(entry, maxValueLength)).filter(Boolean).slice(0, 20);
  }
  return sanitizeString(value, maxValueLength);
}

function hasSurveyAnswer(value) {
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(String(value ?? "").trim());
}

function normalizeEngagementEventName(value) {
  const normalized = sanitizeString(value, 80);
  if (normalized === "email_result_view" || normalized === "personalize_click") return normalized;
  return "result_view";
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
