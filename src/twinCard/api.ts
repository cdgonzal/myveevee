import type { TwinCardGenerationProvider, TwinCardGenerationStatus, TwinCardLead } from "./types";

type GenerateTwinCardResponse = {
  ok?: boolean;
  card?: TwinCardApiCard;
  generatedAvatarDataUrl?: string;
  generationStatus?: TwinCardGenerationStatus;
  generationProvider?: TwinCardGenerationProvider;
  generationMessage?: string;
};

export type TwinCardApiCard = {
  cardId: string;
  recordType?: "card" | "replay" | string;
  replayRunId?: string;
  replaySourceCardId?: string;
  replayOutputSequence?: number;
  replayModelId?: string;
  replayProvider?: string;
  replayManifestS3Key?: string;
  replayReportS3Key?: string;
  replayManifestUrl?: string;
  replayReportUrl?: string;
  firstName: string;
  contact?: string;
  contactType: "email" | "phone" | "unknown";
  wellnessInterest: TwinCardLead["wellnessInterest"];
  wellnessInterestLabel: string;
  consentAccepted?: boolean;
  betaInterest: boolean;
  cardResultUrl: string;
  generationStatus: TwinCardGenerationStatus;
  generationProvider: TwinCardGenerationProvider;
  generationMessage?: string;
  bedrockUsage?: TwinCardLead["bedrockUsage"];
  bedrockProviderAttempts?: TwinCardLead["bedrockProviderAttempts"];
  avatarRecipeId?: string;
  avatarRecipeVersion?: string;
  renderStatus?: TwinCardLead["renderStatus"];
  fulfillmentStatus?: TwinCardLead["fulfillmentStatus"];
  emailStatus?: TwinCardLead["emailStatus"];
  emailChannel?: TwinCardLead["emailChannel"];
  emailQueuedAt?: string;
  emailSentAt?: string;
  emailMessageId?: string;
  emailFailedAt?: string;
  emailSkippedAt?: string;
  emailSkipReason?: string;
  printedAt?: string;
  lastPrintedAt?: string;
  printedBy?: string;
  issueAt?: string;
  issueBy?: string;
  printedCount?: number;
  eventName: string;
  createdAt: string;
  updatedAt: string;
  boothDeviceId?: string;
  deviceMetadata?: TwinCardLead["deviceMetadata"];
  language?: TwinCardLead["language"];
  imageUpload?: TwinCardLead["imageUpload"];
  runS3Key?: string;
  sourceImageS3Key?: string;
  generatedAvatarS3Key?: string;
  printLayoutS3Key?: string;
  printImageS3Key?: string;
  sourceImageBytes?: number;
  generatedAvatarBytes?: number;
  printLayoutBytes?: number;
  printImageBytes?: number;
  printLayoutContentType?: string;
  printImageContentType?: string;
  betaSurveyStatus?: TwinCardLead["betaSurveyStatus"];
  betaSurveySource?: string;
  betaSurveyStage?: string;
  betaSurveyCompletedSections?: string[];
  betaSurveyResponses?: TwinCardLead["betaSurveyResponses"];
  betaSurveyContact?: TwinCardLead["betaSurveyContact"];
  betaSurveyAnswerCount?: number;
  betaSurveyUpdatedAt?: string;
  betaSurveySubmittedAt?: string;
  resultViewCount?: number;
  firstResultViewedAt?: string;
  lastResultViewedAt?: string;
  emailClickCount?: number;
  firstEmailClickedAt?: string;
  lastEmailClickedAt?: string;
  personalizeClickCount?: number;
  firstPersonalizeClickedAt?: string;
  lastPersonalizeClickedAt?: string;
  engagementUpdatedAt?: string;
  lastEngagementEvent?: string;
  lastEngagementSource?: string;
  sourceUploadedAt?: string;
  generatedAt?: string;
  renderedAt?: string;
  avatarGenerationStartedAt?: string;
  printCompositionStartedAt?: string;
  uploadDurationMs?: number;
  avatarGenerationDurationMs?: number;
  printCompositionDurationMs?: number;
  totalRunDurationMs?: number;
  runJsonUrl?: string;
  sourceImageUrl?: string;
  generatedAvatarUrl?: string;
  printLayoutUrl?: string;
  printImageUrl?: string;
};

const TWIN_CARD_API_URL = import.meta.env.VITE_TWIN_CARD_API_URL as string | undefined;

export async function generateTwinCardAvatar(lead: TwinCardLead): Promise<TwinCardLead> {
  const endpoint = TWIN_CARD_API_URL?.trim();
  const now = new Date().toISOString();

  if (!endpoint) {
    return {
      ...lead,
      generatedAvatarDataUrl: lead.sourceImageDataUrl,
      generationStatus: "fallback_used",
      generationProvider: "fallback",
      generationMessage: "We created your Twin Card using your uploaded photo.",
      renderStatus: "rendered",
      fulfillmentStatus: lead.fulfillmentStatus ?? "not_printed",
      updatedAt: now,
    };
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cardId: lead.cardId,
        firstName: lead.firstName,
        contact: lead.contact,
        wellnessInterest: lead.wellnessInterest,
        consentAccepted: lead.consentAccepted,
        betaInterest: lead.betaInterest,
        eventName: lead.eventName,
        boothDeviceId: lead.boothDeviceId,
        deviceMetadata: lead.deviceMetadata,
        language: lead.language,
        imageUpload: lead.imageUpload,
        sourceImageDataUrl: lead.sourceImageDataUrl,
      }),
    });

    const payload = (await response.json().catch(() => ({}))) as GenerateTwinCardResponse;

    if (!response.ok || (!payload.card && !payload.generatedAvatarDataUrl)) {
      throw new Error(payload.generationMessage ?? "Avatar generation failed.");
    }

    return payload.card
      ? apiCardToLead(payload.card, lead)
      : {
        ...lead,
        generatedAvatarDataUrl: payload.generatedAvatarDataUrl,
        generationStatus: payload.generationStatus ?? "completed",
        generationProvider: payload.generationProvider ?? "bedrock",
        generationMessage: payload.generationMessage,
        renderStatus: lead.renderStatus,
        fulfillmentStatus: lead.fulfillmentStatus,
        updatedAt: now,
      };
  } catch {
    return {
      ...lead,
      generatedAvatarDataUrl: lead.sourceImageDataUrl,
      generationStatus: "fallback_used",
      generationProvider: "fallback",
      generationMessage: "We created your Twin Card using your uploaded photo.",
      renderStatus: "rendered",
      fulfillmentStatus: lead.fulfillmentStatus ?? "not_printed",
      updatedAt: now,
    };
  }
}

export async function createTwinCard(lead: TwinCardLead): Promise<TwinCardLead> {
  return generateTwinCardAvatar(lead);
}

export async function fetchTwinCard(cardId: string): Promise<TwinCardApiCard | null> {
  const endpoint = TWIN_CARD_API_URL?.trim();
  if (!endpoint) return null;

  const response = await fetch(`${endpoint.replace(/\/+$/, "")}/${encodeURIComponent(cardId)}`);
  const payload = (await response.json().catch(() => ({}))) as GenerateTwinCardResponse;

  if (!response.ok || !payload.card) {
    return null;
  }

  return payload.card;
}

export async function fetchRecentTwinCards(dashboardPin?: string): Promise<TwinCardApiCard[] | null> {
  const endpoint = TWIN_CARD_API_URL?.trim();
  if (!endpoint) return null;

  const adminEndpoint = endpoint.replace(/\/twin-card\/cards\/?$/, "/twin-card/admin/cards");
  const response = await fetch(adminEndpoint, {
    headers: dashboardPin ? { "x-twin-dashboard-pin": dashboardPin } : undefined,
  });
  const payload = (await response.json().catch(() => ({}))) as { cards?: TwinCardApiCard[] };

  if (!response.ok || !Array.isArray(payload.cards)) {
    return null;
  }

  return payload.cards;
}

export async function markTwinCardPrinted(cardId: string, dashboardPin?: string): Promise<TwinCardApiCard | null> {
  const endpoint = TWIN_CARD_API_URL?.trim();
  if (!endpoint) return null;

  const adminEndpoint = endpoint.replace(/\/twin-card\/cards\/?$/, `/twin-card/admin/cards/${encodeURIComponent(cardId)}/printed`);
  const response = await fetch(adminEndpoint, {
    method: "POST",
    headers: dashboardPin ? { "x-twin-dashboard-pin": dashboardPin } : undefined,
  });
  const payload = (await response.json().catch(() => ({}))) as { card?: TwinCardApiCard };

  if (!response.ok || !payload.card) {
    return null;
  }

  return payload.card;
}

export async function updateTwinCardFulfillmentStatus(
  cardId: string,
  fulfillmentStatus: "not_printed" | "printed" | "issue",
  dashboardPin?: string,
  updatedBy?: string
): Promise<TwinCardApiCard | null> {
  const endpoint = TWIN_CARD_API_URL?.trim();
  if (!endpoint) return null;

  const adminEndpoint = endpoint.replace(/\/twin-card\/cards\/?$/, `/twin-card/admin/cards/${encodeURIComponent(cardId)}/fulfillment`);
  const response = await fetch(adminEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(dashboardPin ? { "x-twin-dashboard-pin": dashboardPin } : {}),
    },
    body: JSON.stringify({ fulfillmentStatus, updatedBy }),
  });
  const payload = (await response.json().catch(() => ({}))) as { card?: TwinCardApiCard };

  if (!response.ok || !payload.card) {
    return null;
  }

  return payload.card;
}

export type TwinCardBetaSurveyPayload = {
  source?: string;
  stage: string;
  completedSections: string[];
  responses: Record<string, string | string[]>;
  contact: Record<string, string | string[]>;
};

export async function submitTwinCardBetaSurvey(
  cardId: string,
  survey: TwinCardBetaSurveyPayload
): Promise<TwinCardApiCard | null> {
  const endpoint = TWIN_CARD_API_URL?.trim();
  if (!endpoint) return null;

  const surveyEndpoint = endpoint.replace(/\/twin-card\/cards\/?$/, `/twin-card/cards/${encodeURIComponent(cardId)}/beta-survey`);
  const response = await fetch(surveyEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(survey),
  });
  const payload = (await response.json().catch(() => ({}))) as { card?: TwinCardApiCard };

  if (!response.ok || !payload.card) {
    return null;
  }

  return payload.card;
}

export type TwinCardEngagementPayload = {
  eventName: "result_view" | "email_result_view" | "personalize_click";
  source?: string;
  pagePath?: string;
};

export async function recordTwinCardEngagement(
  cardId: string,
  engagement: TwinCardEngagementPayload
): Promise<TwinCardApiCard | null> {
  const endpoint = TWIN_CARD_API_URL?.trim();
  if (!endpoint) return null;

  const engagementEndpoint = endpoint.replace(/\/twin-card\/cards\/?$/, `/twin-card/cards/${encodeURIComponent(cardId)}/engagement`);
  const response = await fetch(engagementEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(engagement),
  });
  const payload = (await response.json().catch(() => ({}))) as { card?: TwinCardApiCard };

  if (!response.ok || !payload.card) {
    return null;
  }

  return payload.card;
}

export function apiCardToLead(card: TwinCardApiCard, fallback?: TwinCardLead): TwinCardLead {
  return {
    id: fallback?.id ?? card.cardId,
    cardId: card.cardId,
    firstName: card.firstName,
    contact: card.contact ?? fallback?.contact ?? "",
    contactType: card.contactType,
    wellnessInterest: card.wellnessInterest,
    wellnessInterestLabel: card.wellnessInterestLabel,
    consentAccepted: card.consentAccepted ?? fallback?.consentAccepted ?? true,
    betaInterest: card.betaInterest,
    sourceImageDataUrl: fallback?.sourceImageDataUrl,
    generatedAvatarDataUrl: fallback?.generatedAvatarDataUrl,
    sourceImageUrl: card.sourceImageUrl,
    generatedAvatarUrl: card.generatedAvatarUrl,
    cardResultUrl: card.cardResultUrl,
    generationStatus: card.generationStatus,
    generationProvider: card.generationProvider,
    generationMessage: card.generationMessage,
    bedrockUsage: card.bedrockUsage ?? fallback?.bedrockUsage,
    bedrockProviderAttempts: card.bedrockProviderAttempts ?? fallback?.bedrockProviderAttempts,
    avatarRecipeId: card.avatarRecipeId ?? fallback?.avatarRecipeId,
    avatarRecipeVersion: card.avatarRecipeVersion ?? fallback?.avatarRecipeVersion,
    renderStatus: card.renderStatus ?? fallback?.renderStatus,
    fulfillmentStatus: card.fulfillmentStatus ?? fallback?.fulfillmentStatus,
    emailStatus: card.emailStatus ?? fallback?.emailStatus,
    emailChannel: card.emailChannel ?? fallback?.emailChannel,
    emailQueuedAt: card.emailQueuedAt ?? fallback?.emailQueuedAt,
    emailSentAt: card.emailSentAt ?? fallback?.emailSentAt,
    emailMessageId: card.emailMessageId ?? fallback?.emailMessageId,
    emailFailedAt: card.emailFailedAt ?? fallback?.emailFailedAt,
    emailSkippedAt: card.emailSkippedAt ?? fallback?.emailSkippedAt,
    emailSkipReason: card.emailSkipReason ?? fallback?.emailSkipReason,
    printedAt: card.printedAt ?? fallback?.printedAt,
    lastPrintedAt: card.lastPrintedAt ?? fallback?.lastPrintedAt,
    printedBy: card.printedBy ?? fallback?.printedBy,
    issueAt: card.issueAt ?? fallback?.issueAt,
    issueBy: card.issueBy ?? fallback?.issueBy,
    printedCount: card.printedCount ?? fallback?.printedCount,
    eventName: card.eventName,
    boothDeviceId: card.boothDeviceId ?? fallback?.boothDeviceId,
    deviceMetadata: card.deviceMetadata ?? fallback?.deviceMetadata,
    language: card.language ?? fallback?.language,
    imageUpload: card.imageUpload ?? fallback?.imageUpload,
    betaSurveyStatus: card.betaSurveyStatus ?? fallback?.betaSurveyStatus,
    betaSurveySource: card.betaSurveySource ?? fallback?.betaSurveySource,
    betaSurveyStage: card.betaSurveyStage ?? fallback?.betaSurveyStage,
    betaSurveyCompletedSections: card.betaSurveyCompletedSections ?? fallback?.betaSurveyCompletedSections,
    betaSurveyResponses: card.betaSurveyResponses ?? fallback?.betaSurveyResponses,
    betaSurveyContact: card.betaSurveyContact ?? fallback?.betaSurveyContact,
    betaSurveyAnswerCount: card.betaSurveyAnswerCount ?? fallback?.betaSurveyAnswerCount,
    betaSurveyUpdatedAt: card.betaSurveyUpdatedAt ?? fallback?.betaSurveyUpdatedAt,
    betaSurveySubmittedAt: card.betaSurveySubmittedAt ?? fallback?.betaSurveySubmittedAt,
    resultViewCount: card.resultViewCount ?? fallback?.resultViewCount,
    firstResultViewedAt: card.firstResultViewedAt ?? fallback?.firstResultViewedAt,
    lastResultViewedAt: card.lastResultViewedAt ?? fallback?.lastResultViewedAt,
    emailClickCount: card.emailClickCount ?? fallback?.emailClickCount,
    firstEmailClickedAt: card.firstEmailClickedAt ?? fallback?.firstEmailClickedAt,
    lastEmailClickedAt: card.lastEmailClickedAt ?? fallback?.lastEmailClickedAt,
    personalizeClickCount: card.personalizeClickCount ?? fallback?.personalizeClickCount,
    firstPersonalizeClickedAt: card.firstPersonalizeClickedAt ?? fallback?.firstPersonalizeClickedAt,
    lastPersonalizeClickedAt: card.lastPersonalizeClickedAt ?? fallback?.lastPersonalizeClickedAt,
    engagementUpdatedAt: card.engagementUpdatedAt ?? fallback?.engagementUpdatedAt,
    lastEngagementEvent: card.lastEngagementEvent ?? fallback?.lastEngagementEvent,
    lastEngagementSource: card.lastEngagementSource ?? fallback?.lastEngagementSource,
    runS3Key: card.runS3Key ?? fallback?.runS3Key,
    runJsonUrl: card.runJsonUrl ?? fallback?.runJsonUrl,
    printLayoutS3Key: card.printLayoutS3Key ?? fallback?.printLayoutS3Key,
    printLayoutUrl: card.printLayoutUrl ?? fallback?.printLayoutUrl,
    printLayoutContentType: card.printLayoutContentType ?? fallback?.printLayoutContentType,
    printImageContentType: card.printImageContentType ?? fallback?.printImageContentType,
    printImageS3Key: card.printImageS3Key ?? fallback?.printImageS3Key,
    printImageUrl: card.printImageUrl ?? fallback?.printImageUrl,
    sourceUploadedAt: card.sourceUploadedAt ?? fallback?.sourceUploadedAt,
    generatedAt: card.generatedAt ?? fallback?.generatedAt,
    renderedAt: card.renderedAt ?? fallback?.renderedAt,
    avatarGenerationStartedAt: card.avatarGenerationStartedAt ?? fallback?.avatarGenerationStartedAt,
    printCompositionStartedAt: card.printCompositionStartedAt ?? fallback?.printCompositionStartedAt,
    uploadDurationMs: card.uploadDurationMs ?? fallback?.uploadDurationMs,
    avatarGenerationDurationMs: card.avatarGenerationDurationMs ?? fallback?.avatarGenerationDurationMs,
    printCompositionDurationMs: card.printCompositionDurationMs ?? fallback?.printCompositionDurationMs,
    totalRunDurationMs: card.totalRunDurationMs ?? fallback?.totalRunDurationMs,
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
  };
}
