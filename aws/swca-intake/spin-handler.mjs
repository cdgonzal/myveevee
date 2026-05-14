import {
  ConditionalCheckFailedException,
  GetItemCommand,
  PutItemCommand,
  ScanCommand,
  UpdateItemCommand,
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses";
import { createHash, randomBytes, randomInt, randomUUID } from "node:crypto";
import rewardWheelConfig from "../../src/swca/rewardWheel/reward-wheel-config.json";

const FORM_ID = "swca-wellness-priority-intake";
const CAMPAIGN_ID = rewardWheelConfig.campaignId;
const REWARD_VERSION = rewardWheelConfig.rewardVersion;
const JSON_CONTENT_TYPE = "application/json";
const CERTIFICATE_TTL_DAYS = 30;
const DEFAULT_PUBLIC_BASE_URL = "https://myveevee.com";

const REWARDS = normalizeRewards(rewardWheelConfig);
const rewardsById = new Map(REWARDS.map((reward) => [reward.id, reward]));
const dynamodb = new DynamoDBClient({});
const ses = new SESClient({});

export async function handler(event) {
  const origin = getRequestOrigin(event);
  const path = event.rawPath ?? event.requestContext?.http?.path ?? "";

  if (event.requestContext?.http?.method === "OPTIONS") {
    return response(204, {}, origin);
  }

  const configError = validateConfig();
  if (configError) {
    console.error("SWCA reward spin Lambda configuration error", { configError });
    return response(500, { message: "The reward endpoint is not configured." }, origin);
  }

  if (event.requestContext?.http?.method === "GET" && path.endsWith("/forms/swca-reward-certificate")) {
    return handleCertificateRequest(event, origin);
  }

  if (event.requestContext?.http?.method !== "POST") {
    return response(405, { message: "Method not allowed." }, origin);
  }

  if (path.endsWith("/forms/swca-reward-contact")) {
    return handleContactRequest(event, origin);
  }

  let payload;
  try {
    payload = parseBody(event);
  } catch (error) {
    return response(400, { message: "Request body must be valid JSON." }, origin);
  }

  const validationError = validateSpinRequest(payload);
  if (validationError) {
    return response(400, { message: validationError }, origin);
  }

  const tokenHash = hashToken(payload.token);
  const reward = selectReward();
  const spunAt = new Date().toISOString();

  try {
    const updateResult = await dynamodb.send(
      new UpdateItemCommand({
        TableName: process.env.REWARD_CLAIMS_TABLE,
        Key: {
          submissionId: { S: payload.submissionId },
        },
        ConditionExpression:
          "tokenHash = :tokenHash AND campaignId = :campaignId AND formId = :formId AND attribute_not_exists(rewardId)",
        UpdateExpression:
          "SET #status = :status, spunAt = :spunAt, rewardId = :rewardId, rewardLabel = :rewardLabel, rewardVersion = :rewardVersion, requestUserAgentHash = :userAgentHash, sourceIpHash = :sourceIpHash",
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":tokenHash": { S: tokenHash },
          ":campaignId": { S: CAMPAIGN_ID },
          ":formId": { S: FORM_ID },
          ":status": { S: "claimed" },
          ":spunAt": { S: spunAt },
          ":rewardId": { S: reward.id },
          ":rewardLabel": { S: reward.label },
          ":rewardVersion": { S: REWARD_VERSION },
          ":userAgentHash": { S: hashValue(event.headers?.["user-agent"] ?? event.headers?.["User-Agent"] ?? "") },
          ":sourceIpHash": { S: hashValue(event.requestContext?.http?.sourceIp ?? "") },
        },
        ReturnValues: "ALL_NEW",
      })
    );

    const claimedReward = itemToReward(updateResult.Attributes);

    console.info("SWCA reward claimed", {
      submissionId: payload.submissionId,
      rewardId: claimedReward.id,
    });

    return response(
      200,
      {
        ok: true,
        alreadySpun: false,
        submissionId: payload.submissionId,
        reward: claimedReward,
      },
      origin
    );
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException || error?.name === "ConditionalCheckFailedException") {
      return getExistingRewardResponse(payload.submissionId, tokenHash, origin);
    }

    console.error("SWCA reward spin failed", {
      submissionId: payload.submissionId,
      error: error instanceof Error ? error.message : String(error),
    });

    return response(500, { message: "The reward spin could not be completed." }, origin);
  }
}

async function handleContactRequest(event, origin) {
  let payload;
  try {
    payload = parseBody(event);
  } catch (error) {
    return response(400, { message: "Request body must be valid JSON." }, origin);
  }

  const validationError = validateContactRequest(payload);
  if (validationError) {
    return response(400, { message: validationError }, origin);
  }

  const tokenHash = hashToken(payload.token);
  const savedAt = new Date().toISOString();
  const currentClaim = await getRewardClaim(payload.submissionId);

  if (
    !currentClaim ||
    currentClaim.tokenHash?.S !== tokenHash ||
    currentClaim.campaignId?.S !== CAMPAIGN_ID ||
    currentClaim.formId?.S !== FORM_ID ||
    !currentClaim.rewardId?.S
  ) {
    return response(403, { message: "This reward contact link is not valid." }, origin);
  }

  if (currentClaim.messageStatus?.S === "sent" && currentClaim.messageSentAt?.S) {
    await saveContactDetails(payload, savedAt);
    return response(
      200,
      {
        ok: true,
        submissionId: payload.submissionId,
        messageStatus: "sent",
        messageAlreadySent: true,
      },
      origin
    );
  }

  const certificateToken = createCertificateToken();
  const certificateId = currentClaim.certificateId?.S || randomUUID();
  const certificateExpiresAt = new Date(Date.now() + CERTIFICATE_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const certificateUrl = buildCertificateUrl(certificateId, certificateToken);

  try {
    await dynamodb.send(
      new UpdateItemCommand({
        TableName: process.env.REWARD_CLAIMS_TABLE,
        Key: {
          submissionId: { S: payload.submissionId },
        },
        ConditionExpression:
          "tokenHash = :tokenHash AND campaignId = :campaignId AND formId = :formId AND attribute_exists(rewardId)",
        UpdateExpression:
          "SET contactFirstName = :firstName, contactLastName = :lastName, contactMethod = :contactMethod, contactEmail = :email, contactPhone = :phone, contactSavedAt = :savedAt, certificateId = :certificateId, certificateTokenHash = :certificateTokenHash, certificateCreatedAt = :certificateCreatedAt, certificateExpiresAt = :certificateExpiresAt, messageChannel = :messageChannel, messageStatus = :messageStatus REMOVE messageError",
        ExpressionAttributeValues: {
          ":tokenHash": { S: tokenHash },
          ":campaignId": { S: CAMPAIGN_ID },
          ":formId": { S: FORM_ID },
          ":firstName": { S: payload.firstName.trim() },
          ":lastName": { S: payload.lastName.trim() },
          ":contactMethod": { S: payload.contactMethod },
          ":email": { S: payload.contactMethod === "email" ? payload.email.trim() : "" },
          ":phone": { S: payload.contactMethod === "phone" ? payload.phone.trim() : "" },
          ":savedAt": { S: savedAt },
          ":certificateId": { S: certificateId },
          ":certificateTokenHash": { S: hashCertificateToken(certificateToken) },
          ":certificateCreatedAt": { S: savedAt },
          ":certificateExpiresAt": { S: certificateExpiresAt },
          ":messageChannel": { S: payload.contactMethod },
          ":messageStatus": { S: payload.contactMethod === "email" ? "pending" : "not_supported" },
        },
      })
    );

    if (payload.contactMethod === "email") {
      await sendRewardEmail({
        toEmail: payload.email.trim(),
        firstName: payload.firstName.trim(),
        rewardLabel: currentClaim.rewardLabel?.S || itemToReward(currentClaim).label,
        rewardDescription: rewardsById.get(currentClaim.rewardId?.S)?.description ?? "",
        certificateUrl,
      });

      await markMessageSent(payload.submissionId, new Date().toISOString());
      await writeCampaignEvent({
        eventName: "swca_reward_email_sent",
        submissionId: payload.submissionId,
        rewardId: currentClaim.rewardId?.S ?? "",
        contactMethod: payload.contactMethod,
      });
    }

    console.info("SWCA reward contact saved", {
      submissionId: payload.submissionId,
      contactMethod: payload.contactMethod,
      messageChannel: payload.contactMethod,
      messageStatus: payload.contactMethod === "email" ? "sent" : "not_supported",
    });

    return response(
      200,
      {
        ok: true,
        submissionId: payload.submissionId,
        messageStatus: payload.contactMethod === "email" ? "sent" : "not_supported",
      },
      origin
    );
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException || error?.name === "ConditionalCheckFailedException") {
      return response(403, { message: "This reward contact link is not valid." }, origin);
    }

    if (payload.contactMethod === "email") {
      await markMessageFailed(payload.submissionId, error);
      await writeCampaignEvent({
        eventName: "swca_reward_email_failed",
        submissionId: payload.submissionId,
        rewardId: currentClaim.rewardId?.S ?? "",
        contactMethod: payload.contactMethod,
        params: {
          reason: error instanceof Error ? error.message.slice(0, 120) : String(error).slice(0, 120),
        },
      });
    }

    console.error("SWCA reward contact save failed", {
      submissionId: payload.submissionId,
      error: error instanceof Error ? error.message : String(error),
    });

    return response(500, { message: "The reward contact details could not be saved." }, origin);
  }
}

async function handleCertificateRequest(event, origin) {
  const certificateId = event.queryStringParameters?.certificateId ?? "";
  const token = event.queryStringParameters?.token ?? "";

  if (!certificateId || token.length < 20) {
    return response(400, { message: "Certificate link is incomplete." }, origin);
  }

  const item = await findRewardClaimByCertificateId(certificateId);
  if (!item || item.certificateTokenHash?.S !== hashCertificateToken(token)) {
    console.warn("SWCA reward certificate lookup rejected", {
      certificateId,
      foundCertificate: Boolean(item),
    });
    return response(403, { message: "This certificate link is not valid." }, origin);
  }

  if (item.certificateExpiresAt?.S && new Date(item.certificateExpiresAt.S).getTime() < Date.now()) {
    return response(410, { message: "This certificate link has expired." }, origin);
  }

  return response(
    200,
    {
      ok: true,
      certificate: {
        certificateId,
        submissionId: item.submissionId?.S ?? "",
        rewardId: item.rewardId?.S ?? "",
        rewardLabel: item.rewardLabel?.S ?? "Wellness Reward",
        rewardDescription: rewardsById.get(item.rewardId?.S)?.description ?? "",
        estimatedValue: rewardsById.get(item.rewardId?.S)?.estimatedValue ?? "",
        issuedTo: abbreviateName(item.contactFirstName?.S ?? "", item.contactLastName?.S ?? ""),
        issuedAt: item.certificateCreatedAt?.S ?? item.contactSavedAt?.S ?? "",
        expiresAt: item.certificateExpiresAt?.S ?? "",
      },
    },
    origin
  );
}

async function findRewardClaimByCertificateId(certificateId) {
  let exclusiveStartKey;

  do {
    const result = await dynamodb.send(
      new ScanCommand({
        TableName: process.env.REWARD_CLAIMS_TABLE,
        FilterExpression: "certificateId = :certificateId",
        ExpressionAttributeValues: {
          ":certificateId": { S: certificateId },
        },
        ExclusiveStartKey: exclusiveStartKey,
      })
    );

    if (result.Items?.[0]) {
      return result.Items[0];
    }

    exclusiveStartKey = result.LastEvaluatedKey;
  } while (exclusiveStartKey);

  return undefined;
}

function validateConfig() {
  const missing = ["REWARD_CLAIMS_TABLE", "SES_FROM_EMAIL", "PUBLIC_BASE_URL", "CAMPAIGN_EVENTS_TABLE"].filter(
    (name) => !process.env[name]
  );
  return missing.length > 0 ? `Missing environment variables: ${missing.join(", ")}` : null;
}

function parseBody(event) {
  const body = event.isBase64Encoded ? Buffer.from(event.body ?? "", "base64").toString("utf8") : event.body;
  return JSON.parse(body ?? "{}");
}

function validateSpinRequest(payload) {
  if (!payload || typeof payload !== "object") {
    return "Reward spin payload is required.";
  }

  if (typeof payload.submissionId !== "string" || payload.submissionId.length < 8) {
    return "Submission id is required.";
  }

  if (typeof payload.token !== "string" || payload.token.length < 20) {
    return "Reward token is required.";
  }

  return null;
}

function validateContactRequest(payload) {
  const spinError = validateSpinRequest(payload);
  if (spinError) {
    return spinError;
  }

  if (typeof payload.firstName !== "string" || payload.firstName.trim().length === 0 || payload.firstName.length > 80) {
    return "First name is required.";
  }

  if (typeof payload.lastName !== "string" || payload.lastName.trim().length === 0 || payload.lastName.length > 80) {
    return "Last name is required.";
  }

  if (payload.contactMethod !== "email" && payload.contactMethod !== "phone") {
    return "Contact method must be email or phone.";
  }

  if (payload.contactMethod === "email") {
    if (typeof payload.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email.trim())) {
      return "A valid email address is required.";
    }
  }

  if (payload.contactMethod === "phone") {
    if (typeof payload.phone !== "string" || payload.phone.replace(/\D/g, "").length < 10) {
      return "A valid phone number is required.";
    }
  }

  return null;
}

async function getExistingRewardResponse(submissionId, tokenHash, origin) {
  const item = await getRewardClaim(submissionId);
  if (!item || item.tokenHash?.S !== tokenHash) {
    return response(403, { message: "This reward link is not valid." }, origin);
  }

  if (!item.rewardId?.S) {
    return response(409, { message: "This reward is not ready to spin yet." }, origin);
  }

  const reward = itemToReward(item);
  return response(
    200,
    {
      ok: true,
      alreadySpun: true,
      submissionId,
      reward,
    },
    origin
  );
}

async function getRewardClaim(submissionId) {
  const result = await dynamodb.send(
    new GetItemCommand({
      TableName: process.env.REWARD_CLAIMS_TABLE,
      Key: {
        submissionId: { S: submissionId },
      },
      ConsistentRead: true,
    })
  );

  return result.Item;
}

async function saveContactDetails(payload, savedAt) {
  await dynamodb.send(
    new UpdateItemCommand({
      TableName: process.env.REWARD_CLAIMS_TABLE,
      Key: {
        submissionId: { S: payload.submissionId },
      },
      UpdateExpression:
        "SET contactFirstName = :firstName, contactLastName = :lastName, contactMethod = :contactMethod, contactEmail = :email, contactPhone = :phone, contactSavedAt = :savedAt",
      ExpressionAttributeValues: {
        ":firstName": { S: payload.firstName.trim() },
        ":lastName": { S: payload.lastName.trim() },
        ":contactMethod": { S: payload.contactMethod },
        ":email": { S: payload.contactMethod === "email" ? payload.email.trim() : "" },
        ":phone": { S: payload.contactMethod === "phone" ? payload.phone.trim() : "" },
        ":savedAt": { S: savedAt },
      },
    })
  );
}

async function sendRewardEmail({ toEmail, firstName, rewardLabel, rewardDescription, certificateUrl }) {
  await ses.send(
    new SendEmailCommand({
      Source: process.env.SES_FROM_EMAIL,
      Destination: {
        ToAddresses: [toEmail],
      },
      Message: {
        Subject: {
          Charset: "UTF-8",
          Data: "Your SWCA wellness reward is ready",
        },
        Body: {
          Text: {
            Charset: "UTF-8",
            Data: buildRewardEmailText({ firstName, rewardLabel, rewardDescription, certificateUrl }),
          },
          Html: {
            Charset: "UTF-8",
            Data: buildRewardEmailHtml({ firstName, rewardLabel, rewardDescription, certificateUrl }),
          },
        },
      },
    })
  );
}

async function markMessageSent(submissionId, sentAt) {
  await dynamodb.send(
    new UpdateItemCommand({
      TableName: process.env.REWARD_CLAIMS_TABLE,
      Key: {
        submissionId: { S: submissionId },
      },
      UpdateExpression: "SET messageStatus = :status, messageSentAt = :sentAt REMOVE messageError",
      ExpressionAttributeValues: {
        ":status": { S: "sent" },
        ":sentAt": { S: sentAt },
      },
    })
  );
}

async function markMessageFailed(submissionId, error) {
  try {
    await dynamodb.send(
      new UpdateItemCommand({
        TableName: process.env.REWARD_CLAIMS_TABLE,
        Key: {
          submissionId: { S: submissionId },
        },
        UpdateExpression: "SET messageStatus = :status, messageError = :messageError",
        ExpressionAttributeValues: {
          ":status": { S: "failed" },
          ":messageError": { S: error instanceof Error ? error.message.slice(0, 300) : String(error).slice(0, 300) },
        },
      })
    );
  } catch (updateError) {
    console.error("SWCA reward message failure status could not be saved", {
      submissionId,
      error: updateError instanceof Error ? updateError.message : String(updateError),
    });
  }
}

async function writeCampaignEvent({ eventName, submissionId, rewardId, contactMethod, params = {} }) {
  if (!process.env.CAMPAIGN_EVENTS_TABLE) return;

  await dynamodb.send(
    new PutItemCommand({
      TableName: process.env.CAMPAIGN_EVENTS_TABLE,
      Item: {
        eventId: { S: randomUUID() },
        campaignId: { S: CAMPAIGN_ID },
        formId: { S: FORM_ID },
        eventName: { S: eventName },
        occurredAt: { S: new Date().toISOString() },
        pagePath: { S: "/swca/wheel" },
        pageUrl: { S: `${String(process.env.PUBLIC_BASE_URL ?? DEFAULT_PUBLIC_BASE_URL).replace(/\/+$/, "")}/swca/wheel` },
        sessionId: { S: "" },
        submissionId: { S: submissionId },
        rewardId: { S: rewardId },
        contactMethod: { S: contactMethod },
        mode: { S: "backend" },
        params: { M: normalizeEventParams(params) },
        userAgentHash: { S: "" },
        sourceIpHash: { S: "" },
        expiresAtEpoch: { N: String(Math.floor(Date.now() / 1000) + 400 * 24 * 60 * 60) },
      },
    })
  );
}

function normalizeEventParams(params) {
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

function buildRewardEmailText({ firstName, rewardLabel, rewardDescription, certificateUrl }) {
  return [
    `Hi ${firstName},`,
    "",
    "Thank you for completing the Spine and Wellness Centers of America wellness intake.",
    "",
    `Your reward: ${rewardLabel}`,
    rewardDescription ? `Reward note: ${rewardDescription}` : "",
    "",
    `View your reward certificate: ${certificateUrl}`,
    "",
    "Next step: create your free VeeVee profile so your wellness journey is easier to organize and continue.",
    "Create your free profile: https://veevee.io",
    "",
    "Spine and Wellness Centers of America",
  ]
    .filter((line) => line !== "")
    .join("\n");
}

function buildRewardEmailHtml({ firstName, rewardLabel, rewardDescription, certificateUrl }) {
  const safeFirstName = escapeHtml(firstName);
  const safeRewardLabel = escapeHtml(rewardLabel);
  const safeRewardDescription = escapeHtml(rewardDescription);
  const safeCertificateUrl = escapeHtml(certificateUrl);

  return `<!doctype html>
<html>
  <body style="margin:0;background:#f8fafc;font-family:Arial,sans-serif;color:#071A3A;">
    <div style="max-width:640px;margin:0 auto;padding:28px 18px;">
      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:28px;">
        <p style="margin:0 0 16px;font-size:16px;">Hi ${safeFirstName},</p>
        <h1 style="margin:0 0 14px;font-size:28px;line-height:1.15;color:#071A3A;">Your SWCA wellness reward is ready</h1>
        <p style="margin:0 0 18px;font-size:16px;line-height:1.5;">Thank you for completing the Spine and Wellness Centers of America wellness intake.</p>
        <div style="border:1px solid #f0d2a4;background:#fff7ec;border-radius:8px;padding:18px;margin:20px 0;">
          <p style="margin:0 0 6px;font-size:13px;font-weight:700;text-transform:uppercase;color:#b65f13;">Your reward</p>
          <p style="margin:0;font-size:22px;font-weight:800;">${safeRewardLabel}</p>
          ${safeRewardDescription ? `<p style="margin:8px 0 0;font-size:14px;line-height:1.45;color:#526071;">${safeRewardDescription}</p>` : ""}
        </div>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.5;">Open your reward certificate and keep it available for follow-up.</p>
        <p style="margin:0 0 24px;">
          <a href="${safeCertificateUrl}" style="display:inline-block;background:#F39A25;color:#ffffff;text-decoration:none;font-weight:800;border-radius:6px;padding:12px 18px;">View reward certificate</a>
        </p>
        <p style="margin:0 0 18px;font-size:15px;line-height:1.5;">Next step: create your free VeeVee profile so your wellness journey is easier to organize and continue.</p>
        <p style="margin:0;">
          <a href="https://veevee.io" style="color:#071A3A;font-weight:800;">Create your free VeeVee profile</a>
        </p>
      </div>
    </div>
  </body>
</html>`;
}

function selectReward() {
  const totalWeight = REWARDS.reduce((total, reward) => total + reward.weight, 0);
  let cursor = randomInt(totalWeight);

  for (const reward of REWARDS) {
    if (cursor < reward.weight) {
      return reward;
    }
    cursor -= reward.weight;
  }

  return REWARDS[0];
}

function itemToReward(item) {
  const id = item?.rewardId?.S ?? REWARDS[0].id;
  const catalogReward = rewardsById.get(id);

  return {
    id,
    label: item?.rewardLabel?.S ?? catalogReward?.label ?? "Wellness Reward",
    description: catalogReward?.description ?? "",
    estimatedValue: catalogReward?.estimatedValue ?? "",
    version: item?.rewardVersion?.S ?? REWARD_VERSION,
  };
}

function normalizeRewards(config) {
  if (!Array.isArray(config.slots) || config.slots.length === 0) {
    throw new Error("Reward wheel config must include at least one slot.");
  }

  if (config.totalSlots !== config.slots.length) {
    throw new Error("Reward wheel totalSlots must match slots length.");
  }

  return config.slots.map((slot) => ({
    id: String(slot.id),
    label: String(slot.label),
    description: String(slot.description ?? ""),
    estimatedValue: String(slot.estimatedValue ?? ""),
    weight: Number(slot.weight) > 0 ? Number(slot.weight) : 1,
  }));
}

function hashToken(token) {
  return createHash("sha256").update(`swca-reward-token:${token}`).digest("hex");
}

function createCertificateToken() {
  return randomBytes(32).toString("base64url");
}

function hashCertificateToken(token) {
  return createHash("sha256").update(`swca-certificate-token:${token}`).digest("hex");
}

function buildCertificateUrl(certificateId, token) {
  const baseUrl = String(process.env.PUBLIC_BASE_URL ?? DEFAULT_PUBLIC_BASE_URL).replace(/\/+$/, "");
  return `${baseUrl}/swca/certificate?certificateId=${encodeURIComponent(certificateId)}&token=${encodeURIComponent(token)}`;
}

function hashValue(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}

function abbreviateName(firstName, lastName) {
  const first = firstName.trim();
  const last = lastName.trim();

  if (!first && !last) return "";
  if (!last) return `${first.slice(0, 1).toUpperCase()}.`;
  if (!first) return `${last.slice(0, 1).toUpperCase()}.`;
  return `${first.slice(0, 1).toUpperCase()}. ${last.slice(0, 1).toUpperCase()}.`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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
    "Access-Control-Allow-Headers": "content-type",
    "Vary": "Origin",
  };
}
