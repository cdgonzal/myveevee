import { PutItemCommand, ScanCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

const JSON_CONTENT_TYPE = "application/json";
const CAMPAIGN_ID = "swca-reward-wheel-v1";
const TOKEN_TTL_SECONDS = 60 * 60 * 8;
const EVENT_TTL_DAYS = 400;
const MAX_REPORT_ITEMS = 1000;

const dynamodb = new DynamoDBClient({});
const secrets = new SecretsManagerClient({});
const secretCache = new Map();

export async function handler(event) {
  const origin = getRequestOrigin(event);
  const method = event.requestContext?.http?.method ?? "";
  const path = event.rawPath ?? event.requestContext?.http?.path ?? "";

  if (method === "OPTIONS") {
    return response(204, {}, origin);
  }

  const configError = validateConfig();
  if (configError) {
    console.error("SWCA admin Lambda configuration error", { configError });
    return response(500, { message: "The SWCA admin endpoint is not configured." }, origin);
  }

  try {
    if (method === "POST" && path.endsWith("/forms/swca-event")) {
      return handleCampaignEvent(event, origin);
    }

    if (method === "POST" && path.endsWith("/forms/swca-admin-session")) {
      return handleAdminSession(event, origin);
    }

    if (method === "GET" && path.endsWith("/forms/swca-admin-report")) {
      return handleAdminReport(event, origin);
    }

    return response(405, { message: "Method not allowed." }, origin);
  } catch (error) {
    console.error("SWCA admin handler failed", {
      path,
      method,
      error: error instanceof Error ? error.message : String(error),
    });

    return response(500, { message: "The SWCA admin request could not be completed." }, origin);
  }
}

async function handleCampaignEvent(event, origin) {
  let payload;
  try {
    payload = parseBody(event);
  } catch (error) {
    return response(400, { message: "Request body must be valid JSON." }, origin);
  }

  const validationError = validateCampaignEvent(payload);
  if (validationError) {
    return response(400, { message: validationError }, origin);
  }

  const occurredAt = new Date().toISOString();
  const eventId = randomUUID();
  const eventName = payload.eventName.trim();

  await dynamodb.send(
    new PutItemCommand({
      TableName: process.env.CAMPAIGN_EVENTS_TABLE,
      Item: {
        eventId: { S: eventId },
        campaignId: { S: CAMPAIGN_ID },
        formId: { S: process.env.FORM_ID },
        eventName: { S: eventName },
        occurredAt: { S: occurredAt },
        pagePath: { S: sanitizeString(payload.pagePath, 240) },
        pageUrl: { S: sanitizeString(payload.pageUrl, 500) },
        sessionId: { S: sanitizeString(payload.sessionId, 120) },
        submissionId: { S: sanitizeString(payload.submissionId, 120) },
        rewardId: { S: sanitizeString(payload.rewardId, 120) },
        contactMethod: { S: sanitizeString(payload.contactMethod, 20) },
        mode: { S: sanitizeString(payload.mode, 20) },
        params: { M: normalizeEventParams(payload.params) },
        userAgentHash: { S: hashLike(event.headers?.["user-agent"] ?? event.headers?.["User-Agent"] ?? "") },
        sourceIpHash: { S: hashLike(event.requestContext?.http?.sourceIp ?? "") },
        expiresAtEpoch: { N: String(Math.floor(Date.now() / 1000) + EVENT_TTL_DAYS * 24 * 60 * 60) },
      },
    })
  );

  return response(200, { ok: true, eventId }, origin);
}

async function handleAdminSession(event, origin) {
  let payload;
  try {
    payload = parseBody(event);
  } catch (error) {
    return response(400, { message: "Request body must be valid JSON." }, origin);
  }

  if (!payload || typeof payload.passcode !== "string" || payload.passcode.length === 0) {
    return response(400, { message: "Passcode is required." }, origin);
  }

  const expectedPasscode = await getSecret(process.env.ADMIN_PASSCODE_SECRET_NAME);

  if (!safeEqual(payload.passcode, expectedPasscode)) {
    console.warn("SWCA admin passcode rejected", {
      sourceIpHash: hashLike(event.requestContext?.http?.sourceIp ?? ""),
    });
    return response(401, { message: "Invalid passcode." }, origin);
  }

  const tokenSecret = await getSecret(process.env.ADMIN_TOKEN_SECRET_NAME);
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + TOKEN_TTL_SECONDS;
  const token = signToken(
    {
      sub: "swca-admin",
      campaignId: CAMPAIGN_ID,
      iat: issuedAt,
      exp: expiresAt,
    },
    tokenSecret
  );

  return response(200, {
    ok: true,
    token,
    expiresAt,
  }, origin);
}

async function handleAdminReport(event, origin) {
  const token = getBearerToken(event);
  const tokenSecret = await getSecret(process.env.ADMIN_TOKEN_SECRET_NAME);

  if (!verifyToken(token, tokenSecret)) {
    return response(401, { message: "Admin session is invalid or expired." }, origin);
  }

  const [rewardItems, eventItems] = await Promise.all([scanTable(process.env.REWARD_CLAIMS_TABLE), scanTable(process.env.CAMPAIGN_EVENTS_TABLE)]);
  const claims = rewardItems.map(normalizeClaim).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const events = eventItems.map(normalizeEvent).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));

  return response(200, {
    ok: true,
    generatedAt: new Date().toISOString(),
    metrics: buildMetrics(claims, events),
    rewardDistribution: countBy(claims.filter((claim) => claim.rewardId), "rewardLabel"),
    contactMethodDistribution: countBy(claims.filter((claim) => claim.contactSavedAt), "contactMethod"),
    eventCounts: countBy(events, "eventName"),
    recentClaims: claims.slice(0, 250),
    recentEvents: events.slice(0, 250),
  }, origin);
}

function validateConfig() {
  const missing = [
    "ADMIN_PASSCODE_SECRET_NAME",
    "ADMIN_TOKEN_SECRET_NAME",
    "CAMPAIGN_EVENTS_TABLE",
    "FORM_ID",
    "REWARD_CLAIMS_TABLE",
  ].filter((name) => !process.env[name]);
  return missing.length > 0 ? `Missing environment variables: ${missing.join(", ")}` : null;
}

function parseBody(event) {
  const body = event.isBase64Encoded ? Buffer.from(event.body ?? "", "base64").toString("utf8") : event.body;
  return JSON.parse(body ?? "{}");
}

function validateCampaignEvent(payload) {
  if (!payload || typeof payload !== "object") {
    return "Campaign event payload is required.";
  }

  if (typeof payload.eventName !== "string" || !/^swca_[a-z0-9_]{3,80}$/.test(payload.eventName.trim())) {
    return "Campaign event name is invalid.";
  }

  if (payload.pagePath && typeof payload.pagePath !== "string") {
    return "Page path must be a string.";
  }

  if (payload.params && (typeof payload.params !== "object" || Array.isArray(payload.params))) {
    return "Event params must be an object.";
  }

  return null;
}

async function scanTable(tableName) {
  const items = [];
  let ExclusiveStartKey;

  do {
    const result = await dynamodb.send(
      new ScanCommand({
        TableName: tableName,
        Limit: 200,
        ExclusiveStartKey,
      })
    );

    items.push(...(result.Items ?? []));
    ExclusiveStartKey = result.LastEvaluatedKey;
  } while (ExclusiveStartKey && items.length < MAX_REPORT_ITEMS);

  return items.slice(0, MAX_REPORT_ITEMS);
}

function normalizeClaim(item) {
  return {
    submissionId: readString(item.submissionId),
    status: readString(item.status),
    createdAt: readString(item.createdAt),
    spunAt: readString(item.spunAt),
    contactSavedAt: readString(item.contactSavedAt),
    sourcePath: readString(item.sourcePath),
    rewardId: readString(item.rewardId),
    rewardLabel: readString(item.rewardLabel),
    contactMethod: readString(item.contactMethod),
    contactName: abbreviateName(readString(item.contactFirstName), readString(item.contactLastName)),
    certificateId: readString(item.certificateId),
    certificateCreatedAt: readString(item.certificateCreatedAt),
    certificateExpiresAt: readString(item.certificateExpiresAt),
    messageChannel: readString(item.messageChannel),
    messageStatus: readString(item.messageStatus),
    messageSentAt: readString(item.messageSentAt),
    messageError: readString(item.messageError),
  };
}

function normalizeEvent(item) {
  return {
    eventId: readString(item.eventId),
    eventName: readString(item.eventName),
    occurredAt: readString(item.occurredAt),
    pagePath: readString(item.pagePath),
    sessionId: readString(item.sessionId),
    submissionId: readString(item.submissionId),
    rewardId: readString(item.rewardId),
    contactMethod: readString(item.contactMethod),
    mode: readString(item.mode),
  };
}

function buildMetrics(claims, events) {
  return {
    totalIntakes: claims.length,
    rewardsClaimed: claims.filter((claim) => Boolean(claim.rewardId)).length,
    rewardContactsSaved: claims.filter((claim) => Boolean(claim.contactSavedAt)).length,
    uniqueCampaignSessions: new Set(events.map((event) => event.sessionId).filter(Boolean)).size,
    firstPartyEvents: events.length,
    funnelProfileClicks: events.filter((event) => event.eventName === "swca_profile_funnel_create_free_profile").length,
  };
}

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] || "Unspecified";
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
}

function normalizeEventParams(params) {
  if (!params || typeof params !== "object" || Array.isArray(params)) {
    return {};
  }

  return Object.entries(params).reduce((acc, [key, value]) => {
    const safeKey = key.replace(/[^A-Za-z0-9_]/g, "").slice(0, 80);
    if (!safeKey) return acc;

    if (typeof value === "string") {
      acc[safeKey] = { S: value.slice(0, 300) };
    } else if (typeof value === "boolean") {
      acc[safeKey] = { BOOL: value };
    } else if (typeof value === "number" && Number.isFinite(value)) {
      acc[safeKey] = { N: String(value) };
    }

    return acc;
  }, {});
}

async function getSecret(secretName) {
  if (secretCache.has(secretName)) {
    return secretCache.get(secretName);
  }

  const result = await secrets.send(new GetSecretValueCommand({ SecretId: secretName }));
  const value = result.SecretString ?? Buffer.from(result.SecretBinary ?? "").toString("utf8");
  secretCache.set(secretName, value);
  return value;
}

function signToken(payload, secret) {
  const payloadSegment = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret).update(payloadSegment).digest("base64url");
  return `${payloadSegment}.${signature}`;
}

function verifyToken(token, secret) {
  if (typeof token !== "string" || !token.includes(".")) {
    return false;
  }

  const [payloadSegment, signature] = token.split(".");
  const expectedSignature = createHmac("sha256", secret).update(payloadSegment).digest("base64url");

  if (!safeEqual(signature, expectedSignature)) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadSegment, "base64url").toString("utf8"));
    return payload.sub === "swca-admin" && payload.campaignId === CAMPAIGN_ID && Number(payload.exp) > Math.floor(Date.now() / 1000);
  } catch (error) {
    return false;
  }
}

function getBearerToken(event) {
  const header = event.headers?.authorization ?? event.headers?.Authorization ?? "";
  return header.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : "";
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  const leftHash = createHmac("sha256", "swca-admin-compare").update(leftBuffer).digest();
  const rightHash = createHmac("sha256", "swca-admin-compare").update(rightBuffer).digest();
  return timingSafeEqual(leftHash, rightHash);
}

function abbreviateName(firstName, lastName) {
  const first = firstName.trim();
  const last = lastName.trim();

  if (!first && !last) return "";
  if (!last) return `${first.slice(0, 1).toUpperCase()}.`;
  if (!first) return `${last.slice(0, 1).toUpperCase()}.`;
  return `${first.slice(0, 1).toUpperCase()}. ${last.slice(0, 1).toUpperCase()}.`;
}

function sanitizeString(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function readString(value) {
  return value?.S ?? "";
}

function hashLike(value) {
  return createHmac("sha256", "swca-campaign-event").update(String(value)).digest("hex");
}

function getRequestOrigin(event) {
  return event.headers?.origin ?? event.headers?.Origin ?? "";
}

function response(statusCode, body, origin) {
  return {
    statusCode,
    headers: {
      "Content-Type": JSON_CONTENT_TYPE,
      ...corsHeaders(origin),
    },
    body: statusCode === 204 ? "" : JSON.stringify(body),
  };
}

function corsHeaders(origin) {
  const allowedOrigins = String(process.env.ALLOWED_ORIGINS ?? "https://myveevee.com")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const isAllowed = origin && allowedOrigins.includes(origin);

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : allowedOrigins[0] ?? "https://myveevee.com",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "authorization,content-type",
    "Vary": "Origin",
  };
}
