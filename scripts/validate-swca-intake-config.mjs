import fs from "node:fs";
import path from "node:path";

const configPath = path.join(process.cwd(), "src", "swca", "intakeForm", "swca-intake-config.json");
const allowedQuestionTypes = new Set(["single_select", "multi_select"]);
const allowedConcernIds = new Set([
  "chronic-fatigue-low-energy",
  "weight-gain-metabolic-dysfunction",
  "hormonal-imbalance",
  "chronic-pain-inflammation",
  "poor-sleep-insomnia",
  "brain-fog-cognitive-decline",
  "stress-anxiety-burnout",
  "gut-health-issues",
  "immune-dysfunction-frequent-illness",
  "aging-longevity-optimization",
]);

function fail(message) {
  throw new Error(`Invalid SWCA intake config: ${message}`);
}

function requireString(value, fieldPath) {
  if (typeof value !== "string" || !value.trim()) {
    fail(`${fieldPath} must be a non-empty string.`);
  }
}

function validateQuestion(question, fieldPath) {
  requireString(question?.id, `${fieldPath}.id`);
  requireString(question?.label, `${fieldPath}.label`);

  if (!allowedQuestionTypes.has(question?.type)) {
    fail(`${fieldPath}.type must be one of ${[...allowedQuestionTypes].join(", ")}.`);
  }

  if (typeof question?.required !== "boolean") {
    fail(`${fieldPath}.required must be a boolean.`);
  }

  if (!Array.isArray(question?.options) || question.options.length < 2) {
    fail(`${fieldPath}.options must contain at least two options.`);
  }

  const optionIds = new Set();
  question.options.forEach((option, optionIndex) => {
    const optionPath = `${fieldPath}.options[${optionIndex}]`;
    requireString(option?.id, `${optionPath}.id`);
    requireString(option?.label, `${optionPath}.label`);
    if (optionIds.has(option.id)) {
      fail(`${optionPath}.id duplicates another option id in the same question.`);
    }
    optionIds.add(option.id);
  });
}

const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

if (config.formId !== "swca-wellness-priority-intake") {
  fail("formId must be swca-wellness-priority-intake.");
}

if (!Number.isInteger(config.followUpTopRankedCount) || config.followUpTopRankedCount < 1 || config.followUpTopRankedCount > 3) {
  fail("followUpTopRankedCount must be an integer from 1 to 3.");
}

if (!Array.isArray(config.concerns) || config.concerns.length !== allowedConcernIds.size) {
  fail(`concerns must include exactly ${allowedConcernIds.size} entries.`);
}

const concernIds = new Set();
config.concerns.forEach((concern, concernIndex) => {
  const concernPath = `concerns[${concernIndex}]`;
  requireString(concern?.id, `${concernPath}.id`);
  requireString(concern?.title, `${concernPath}.title`);
  requireString(concern?.description, `${concernPath}.description`);

  if (!allowedConcernIds.has(concern.id)) {
    fail(`${concernPath}.id is not a recognized concern id.`);
  }

  if (concernIds.has(concern.id)) {
    fail(`${concernPath}.id duplicates another concern id.`);
  }
  concernIds.add(concern.id);

  if (!Number.isInteger(concern.number) || concern.number < 1 || concern.number > allowedConcernIds.size) {
    fail(`${concernPath}.number must be an integer from 1 to ${allowedConcernIds.size}.`);
  }

  if (!Array.isArray(concern.followUpQuestions) || concern.followUpQuestions.length < 1) {
    fail(`${concernPath}.followUpQuestions must include at least one question.`);
  }

  const questionIds = new Set();
  concern.followUpQuestions.forEach((question, questionIndex) => {
    const questionPath = `${concernPath}.followUpQuestions[${questionIndex}]`;
    validateQuestion(question, questionPath);
    if (questionIds.has(question.id)) {
      fail(`${questionPath}.id duplicates another question id in the same concern.`);
    }
    questionIds.add(question.id);
  });
});

if (!Array.isArray(config.intentQuestions) || config.intentQuestions.length < 1) {
  fail("intentQuestions must include at least one question.");
}

const intentQuestionIds = new Set();
config.intentQuestions.forEach((question, questionIndex) => {
  const questionPath = `intentQuestions[${questionIndex}]`;
  validateQuestion(question, questionPath);
  if (intentQuestionIds.has(question.id)) {
    fail(`${questionPath}.id duplicates another intent question id.`);
  }
  intentQuestionIds.add(question.id);
});

console.log("SWCA intake config validated.");
