import {
  ConditionalCheckFailedException,
  GetItemCommand,
  UpdateItemCommand,
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import { createHash, randomInt } from "node:crypto";
import rewardWheelConfig from "../../src/swca/rewardWheel/reward-wheel-config.json";

const FORM_ID = "swca-wellness-priority-intake";
const CAMPAIGN_ID = rewardWheelConfig.campaignId;
const REWARD_VERSION = rewardWheelConfig.rewardVersion;
const JSON_CONTENT_TYPE = "application/json";

const REWARDS = normalizeRewards(rewardWheelConfig);
const rewardsById = new Map(REWARDS.map((reward) => [reward.id, reward]));
const dynamodb = new DynamoDBClient({});

export async function handler(event) {
  const origin = getRequestOrigin(event);
  const path = event.rawPath ?? event.requestContext?.http?.path ?? "";

  if (event.requestContext?.http?.method === "OPTIONS") {
    return response(204, {}, origin);
  }

  if (event.requestContext?.http?.method !== "POST") {
    return response(405, { message: "Method not allowed." }, origin);
  }

  const configError = validateConfig();
  if (configError) {
    console.error("SWCA reward spin Lambda configuration error", { configError });
    return response(500, { message: "The reward endpoint is not configured." }, origin);
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
          "SET contactFirstName = :firstName, contactLastName = :lastName, contactMethod = :contactMethod, contactEmail = :email, contactPhone = :phone, contactSavedAt = :savedAt",
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
        },
      })
    );

    console.info("SWCA reward contact saved", {
      submissionId: payload.submissionId,
      contactMethod: payload.contactMethod,
    });

    return response(200, { ok: true, submissionId: payload.submissionId }, origin);
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException || error?.name === "ConditionalCheckFailedException") {
      return response(403, { message: "This reward contact link is not valid." }, origin);
    }

    console.error("SWCA reward contact save failed", {
      submissionId: payload.submissionId,
      error: error instanceof Error ? error.message : String(error),
    });

    return response(500, { message: "The reward contact details could not be saved." }, origin);
  }
}

function validateConfig() {
  const missing = ["REWARD_CLAIMS_TABLE"].filter((name) => !process.env[name]);
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
  const result = await dynamodb.send(
    new GetItemCommand({
      TableName: process.env.REWARD_CLAIMS_TABLE,
      Key: {
        submissionId: { S: submissionId },
      },
      ConsistentRead: true,
    })
  );

  const item = result.Item;
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

function hashValue(value) {
  return createHash("sha256").update(String(value)).digest("hex");
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
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Vary": "Origin",
  };
}
