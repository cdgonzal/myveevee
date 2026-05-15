import { PutItemCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import intakeConfig from "../../src/swca/intakeForm/swca-intake-config.json";
import rewardWheelConfig from "../../src/swca/rewardWheel/reward-wheel-config.json";

const FORM_ID = "swca-wellness-priority-intake";
const CAMPAIGN_ID = rewardWheelConfig.campaignId;
const DEFAULT_PREFIX = "forms/swca-wellness-priority-intake";
const JSON_CONTENT_TYPE = "application/json";

const CONCERNS = intakeConfig.concerns;
const TOP_RANKED_FOLLOW_UP_COUNT = intakeConfig.followUpTopRankedCount;
const concernIds = new Set(CONCERNS.map((concern) => concern.id));
const concernsById = new Map(CONCERNS.map((concern) => [concern.id, concern]));
const followUpQuestionsByConcernId = new Map(CONCERNS.map((concern) => [concern.id, concern.followUpQuestions ?? []]));
const intentQuestions = intakeConfig.intentQuestions ?? [];
const dynamodb = new DynamoDBClient({});
const s3 = new S3Client({});
const ses = new SESClient({});

export async function handler(event) {
  const origin = getRequestOrigin(event);

  if (event.requestContext?.http?.method === "OPTIONS") {
    return response(204, {}, origin);
  }

  if (event.requestContext?.http?.method !== "POST") {
    return response(405, { message: "Method not allowed." }, origin);
  }

  const configError = validateConfig();
  if (configError) {
    console.error("SWCA intake Lambda configuration error", { configError });
    return response(500, { message: "The intake endpoint is not configured." }, origin);
  }

  let payload;
  try {
    payload = parseBody(event);
  } catch (error) {
    return response(400, { message: "Request body must be valid JSON." }, origin);
  }

  const validationError = validateSubmission(payload);
  if (validationError) {
    return response(400, { message: validationError }, origin);
  }

  if (payload.honeypot) {
    return response(200, { ok: true, ignored: true }, origin);
  }

  const submittedAt = new Date().toISOString();
  const submissionId = randomUUID();
  const rewardToken = createRewardToken();
  const wheelUrl = buildWheelUrl(submissionId, rewardToken);
  const normalizedSubmission = normalizeSubmission(payload, submissionId, submittedAt, event);
  const objectKey = buildObjectKey(submittedAt, submissionId);

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.SUBMISSIONS_BUCKET,
        Key: objectKey,
        Body: JSON.stringify(normalizedSubmission, null, 2),
        ContentType: JSON_CONTENT_TYPE,
        ServerSideEncryption: "AES256",
      })
    );

    await createRewardEligibility({
      submissionId,
      token: rewardToken,
      createdAt: submittedAt,
      sourcePath: normalizedSubmission.sourcePath,
      pageUrl: normalizedSubmission.pageUrl,
      consentAgreement: normalizedSubmission.consentAgreement,
      event,
    });

    await ses.send(
      new SendEmailCommand({
        Source: process.env.SES_FROM_EMAIL,
        Destination: {
          ToAddresses: getEmailList(process.env.SES_TO_EMAILS),
        },
        Message: {
          Subject: {
            Charset: "UTF-8",
            Data: `SWCA wellness priorities: ${submissionId}`,
          },
          Body: {
            Text: {
              Charset: "UTF-8",
              Data: buildEmailBody(normalizedSubmission, objectKey),
            },
          },
        },
      })
    );
  } catch (error) {
    console.error("SWCA intake submission failed", {
      submissionId,
      objectKey,
      error: error instanceof Error ? error.message : String(error),
    });

    return response(500, { message: "The intake form could not be submitted." }, origin);
  }

  console.info("SWCA intake submission stored and emailed", {
    submissionId,
    objectKey,
  });

  return response(200, { ok: true, submissionId, wheelUrl }, origin);
}

function validateConfig() {
  const missing = ["SUBMISSIONS_BUCKET", "SES_FROM_EMAIL", "SES_TO_EMAILS", "REWARD_CLAIMS_TABLE"].filter(
    (name) => !process.env[name]
  );
  return missing.length > 0 ? `Missing environment variables: ${missing.join(", ")}` : null;
}

function parseBody(event) {
  const body = event.isBase64Encoded ? Buffer.from(event.body ?? "", "base64").toString("utf8") : event.body;
  return JSON.parse(body ?? "{}");
}

function validateSubmission(payload) {
  if (!payload || typeof payload !== "object") {
    return "Submission payload is required.";
  }

  if (payload.formId !== FORM_ID) {
    return "Unknown form id.";
  }

  if (typeof payload.sourcePath !== "string" || !payload.sourcePath.startsWith("/")) {
    return "Source path is required.";
  }

  if (!Array.isArray(payload.selectedConcernIds) || payload.selectedConcernIds.length === 0) {
    return "At least one selected concern is required.";
  }

  if (!Array.isArray(payload.rankedConcernIds) || payload.rankedConcernIds.length !== payload.selectedConcernIds.length) {
    return "Ranked concerns must match selected concerns.";
  }

  const selectedSet = new Set(payload.selectedConcernIds);
  const rankedSet = new Set(payload.rankedConcernIds);

  if (selectedSet.size !== payload.selectedConcernIds.length || rankedSet.size !== payload.rankedConcernIds.length) {
    return "Concern selections and rankings must not contain duplicates.";
  }

  for (const concernId of [...payload.selectedConcernIds, ...payload.rankedConcernIds]) {
    if (typeof concernId !== "string" || !concernIds.has(concernId)) {
      return "Submission contains an unknown concern id.";
    }
  }

  for (const selectedId of selectedSet) {
    if (!rankedSet.has(selectedId)) {
      return "Every selected concern must be ranked.";
    }
  }

  const expectedTopRankedConcernIds = payload.rankedConcernIds.slice(
    0,
    Math.min(TOP_RANKED_FOLLOW_UP_COUNT, payload.rankedConcernIds.length)
  );

  if (!Array.isArray(payload.topRankedConcernIds) || payload.topRankedConcernIds.length !== expectedTopRankedConcernIds.length) {
    return "Top ranked concerns must match the configured follow-up count.";
  }

  for (let index = 0; index < expectedTopRankedConcernIds.length; index += 1) {
    if (payload.topRankedConcernIds[index] !== expectedTopRankedConcernIds[index]) {
      return "Top ranked concerns must match the ranking order.";
    }
  }

  const followUpValidationError = validateFollowUpAnswers(payload.topRankedConcernIds, payload.followUpAnswers);
  if (followUpValidationError) {
    return followUpValidationError;
  }

  const intentValidationError = validateQuestionAnswers(intentQuestions, payload.intentAnswers, "Intent answers");
  if (intentValidationError) {
    return intentValidationError;
  }

  if (payload.pageUrl && typeof payload.pageUrl !== "string") {
    return "Page URL must be a string.";
  }

  if (payload.clientSubmittedAt && typeof payload.clientSubmittedAt !== "string") {
    return "Client submitted timestamp must be a string.";
  }

  if (payload.userAgent && typeof payload.userAgent !== "string") {
    return "User agent must be a string.";
  }

  if (!payload.consentAgreement || typeof payload.consentAgreement !== "object") {
    return "Reward communication consent is required.";
  }

  if (payload.consentAgreement.rewardCommunicationConsent !== true) {
    return "Reward communication consent is required.";
  }

  for (const fieldName of ["consentVersion", "consentCopy", "consentedAt", "consentSourcePath"]) {
    if (typeof payload.consentAgreement[fieldName] !== "string" || !payload.consentAgreement[fieldName].trim()) {
      return "Reward communication consent details are required.";
    }
  }

  return null;
}

function validateFollowUpAnswers(topRankedConcernIds, followUpAnswers) {
  if (!followUpAnswers || typeof followUpAnswers !== "object" || Array.isArray(followUpAnswers)) {
    return "Follow-up answers are required.";
  }

  const expectedConcernIds = new Set(topRankedConcernIds);
  for (const concernId of Object.keys(followUpAnswers)) {
    if (!expectedConcernIds.has(concernId)) {
      return "Follow-up answers contain an unexpected concern.";
    }
  }

  for (const concernId of topRankedConcernIds) {
    const validationError = validateQuestionAnswers(
      followUpQuestionsByConcernId.get(concernId) ?? [],
      followUpAnswers[concernId],
      `Follow-up answers for ${concernId}`
    );
    if (validationError) {
      return validationError;
    }
  }

  return null;
}

function validateQuestionAnswers(questions, answers, label) {
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
    return `${label} are required.`;
  }

  const questionById = new Map(questions.map((question) => [question.id, question]));
  for (const questionId of Object.keys(answers)) {
    if (!questionById.has(questionId)) {
      return `${label} contain an unexpected question.`;
    }
  }

  for (const question of questions) {
    const answer = answers[question.id];
    if (question.required && !isAnswerPresent(answer)) {
      return `${label} are incomplete.`;
    }

    if (answer === undefined) {
      continue;
    }

    const allowedOptionIds = new Set((question.options ?? []).map((option) => option.id));
    if (question.type === "single_select") {
      if (typeof answer !== "string" || !allowedOptionIds.has(answer)) {
        return `${label} contain an invalid answer.`;
      }
      continue;
    }

    if (question.type === "multi_select") {
      if (!Array.isArray(answer) || answer.length === 0) {
        return `${label} contain an invalid answer.`;
      }

      const seenOptionIds = new Set();
      for (const optionId of answer) {
        if (typeof optionId !== "string" || !allowedOptionIds.has(optionId) || seenOptionIds.has(optionId)) {
          return `${label} contain an invalid answer.`;
        }
        seenOptionIds.add(optionId);
      }
      continue;
    }

    return `${label} contain an unsupported question type.`;
  }

  return null;
}

function isAnswerPresent(answer) {
  if (Array.isArray(answer)) {
    return answer.length > 0;
  }

  return typeof answer === "string" && answer.length > 0;
}

function normalizeSubmission(payload, submissionId, submittedAt, event) {
  const rankedConcerns = payload.rankedConcernIds.map((id, index) => ({
    rank: index + 1,
    ...concernsById.get(id),
  }));

  return {
    formId: FORM_ID,
    submissionId,
    submittedAt,
    clientSubmittedAt: payload.clientSubmittedAt ?? null,
    sourcePath: payload.sourcePath,
    pageUrl: payload.pageUrl ?? null,
    selectedConcernIds: payload.selectedConcernIds,
    rankedConcernIds: payload.rankedConcernIds,
    topRankedConcernIds: payload.topRankedConcernIds,
    rankedConcerns,
    selectedConcerns: payload.selectedConcernIds.map((id) => concernsById.get(id)),
    followUpAnswers: payload.followUpAnswers,
    intentAnswers: payload.intentAnswers,
    consentAgreement: {
      rewardCommunicationConsent: true,
      consentVersion: payload.consentAgreement.consentVersion,
      consentCopy: payload.consentAgreement.consentCopy,
      consentedAt: payload.consentAgreement.consentedAt,
      consentSourcePath: payload.consentAgreement.consentSourcePath,
    },
    request: {
      origin: getRequestOrigin(event),
      userAgent: payload.userAgent ?? event.headers?.["user-agent"] ?? event.headers?.["User-Agent"] ?? null,
      sourceIp: event.requestContext?.http?.sourceIp ?? null,
    },
  };
}

function buildObjectKey(submittedAt, submissionId) {
  const date = new Date(submittedAt);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const prefix = (process.env.SUBMISSIONS_PREFIX ?? DEFAULT_PREFIX).replace(/\/+$/, "");
  return `${prefix}/year=${year}/month=${month}/day=${day}/${submissionId}.json`;
}

async function createRewardEligibility({ submissionId, token, createdAt, sourcePath, pageUrl, consentAgreement, event }) {
  await dynamodb.send(
    new PutItemCommand({
      TableName: process.env.REWARD_CLAIMS_TABLE,
      ConditionExpression: "attribute_not_exists(submissionId)",
      Item: {
        submissionId: { S: submissionId },
        campaignId: { S: CAMPAIGN_ID },
        formId: { S: FORM_ID },
        status: { S: "eligible" },
        tokenHash: { S: hashToken(token) },
        createdAt: { S: createdAt },
        sourcePath: { S: sourcePath },
        communicationConsent: { BOOL: true },
        communicationConsentVersion: { S: consentAgreement.consentVersion },
        communicationConsentedAt: { S: consentAgreement.consentedAt },
        ...(pageUrl ? { pageUrl: { S: pageUrl } } : {}),
        requestUserAgentHash: { S: hashValue(event.headers?.["user-agent"] ?? event.headers?.["User-Agent"] ?? "") },
        sourceIpHash: { S: hashValue(event.requestContext?.http?.sourceIp ?? "") },
      },
    })
  );
}

function createRewardToken() {
  return randomBytes(32).toString("base64url");
}

function buildWheelUrl(submissionId, token) {
  return `/swca/wheel?sid=${encodeURIComponent(submissionId)}&token=${encodeURIComponent(token)}`;
}

function hashToken(token) {
  return createHash("sha256").update(`swca-reward-token:${token}`).digest("hex");
}

function hashValue(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}

function buildEmailBody(submission, objectKey) {
  const rankedLines = submission.rankedConcerns
    .map((concern) => `${concern.rank}. ${concern.title}`)
    .join("\n");

  return [
    "A new Spine and Wellness priority intake form was submitted.",
    "",
    `Submission ID: ${submission.submissionId}`,
    `Submitted at: ${submission.submittedAt}`,
    `Source path: ${submission.sourcePath}`,
    `Page URL: ${submission.pageUrl ?? "-"}`,
    `S3 object: s3://${process.env.SUBMISSIONS_BUCKET}/${objectKey}`,
    "",
    "Ranked priorities:",
    rankedLines,
    "",
    "This email is an operational notification. The S3 object is the durable record.",
  ].join("\n");
}

function getEmailList(value) {
  return String(value)
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
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
  const allowedOrigins = getEmailList(process.env.ALLOWED_ORIGINS);
  const isAllowed = origin && allowedOrigins.includes(origin);

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : allowedOrigins[0] ?? "https://myveevee.com",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Vary": "Origin",
  };
}
