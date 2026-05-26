export type TwinCardContactType = "email" | "phone" | "unknown";

// Keep this union aligned with src/twinCard/statusContract.json.
export type TwinCardGenerationStatus = "not_started" | "submitted" | "generating" | "completed" | "failed" | "fallback_used";

export type TwinCardGenerationProvider =
  | "bedrock"
  | "nova_canvas"
  | "stability_control_structure"
  | "stability_style_transfer"
  | "stability_style_guide"
  | "fallback"
  | "fallback_original_photo_card"
  | "manual";

export type TwinCardRenderStatus = "not_started" | "rendering" | "rendered" | "render_failed";

export type TwinCardFulfillmentStatus = "not_printed" | "printed" | "email_pending" | "emailed" | "email_failed";

export type TwinCardLanguage = "en" | "es";

export type TwinCardDeviceType = "ipad" | "iphone" | "android_phone" | "tablet" | "desktop" | "unknown";

export type TwinCardDeviceMetadata = {
  deviceType: TwinCardDeviceType;
  deviceFamily: "booth_tablet" | "mobile_phone" | "desktop" | "unknown";
  platform: string;
  userAgent: string;
  maxTouchPoints: number;
  viewportWidth: number;
  viewportHeight: number;
  devicePixelRatio: number;
};

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
  renderStatus?: TwinCardRenderStatus;
  fulfillmentStatus?: TwinCardFulfillmentStatus;
  eventName: string;
  boothDeviceId?: string;
  deviceMetadata?: TwinCardDeviceMetadata;
  language?: TwinCardLanguage;
  imageUpload?: {
    originalFileName: string;
    originalFileType: string;
    originalFileBytes: number;
    originalWidthPx: number;
    originalHeightPx: number;
    normalizedWidthPx: number;
    normalizedHeightPx: number;
    normalizedMimeType: string;
    normalizedBytesEstimate: number;
    contractId: string;
  };
  runS3Key?: string;
  runJsonUrl?: string;
  printImageS3Key?: string;
  printImageUrl?: string;
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
