import intakeConfig from "./swca-intake-config.json";
import type { SwcaIntakeConfig } from "./types";

const typedIntakeConfig = intakeConfig as SwcaIntakeConfig;

export const SWCA_INTAKE_CONFIG = typedIntakeConfig;
export const SWCA_INTAKE_FORM_ID = typedIntakeConfig.formId;
export const SWCA_CONCERNS = typedIntakeConfig.concerns;
export const SWCA_FOLLOW_UP_TOP_RANKED_COUNT = typedIntakeConfig.followUpTopRankedCount;
export const SWCA_INTENT_QUESTIONS = typedIntakeConfig.intentQuestions;
