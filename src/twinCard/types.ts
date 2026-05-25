export type TwinCardContactType = "email" | "phone" | "unknown";

export type TwinCardGenerationStatus = "not_started" | "generating" | "completed" | "failed" | "fallback_used";

export type TwinCardGenerationProvider = "bedrock" | "fallback" | "manual";

export type TwinCardInterestId =
  | "prepare_for_care"
  | "understand_symptoms"
  | "organize_records"
  | "track_goals"
  | "understand_benefits"
  | "support_loved_one"
  | "just_exploring";

export type TwinCardLead = {
  id: string;
  cardId: string;
  firstName: string;
  contact: string;
  contactType: TwinCardContactType;
  wellnessInterest: TwinCardInterestId;
  wellnessInterestLabel: string;
  consentAccepted: boolean;
  betaInterest: boolean;
  sourceImageDataUrl?: string;
  generatedAvatarDataUrl?: string;
  sourceImageUrl?: string;
  generatedAvatarUrl?: string;
  cardResultUrl: string;
  generationStatus: TwinCardGenerationStatus;
  generationProvider: TwinCardGenerationProvider;
  generationMessage?: string;
  eventName: string;
  boothDeviceId?: string;
  createdAt: string;
  updatedAt: string;
};

export type TwinCardFormValues = {
  firstName: string;
  contact: string;
  wellnessInterest: TwinCardInterestId;
  consentAccepted: boolean;
  betaInterest: boolean;
};
