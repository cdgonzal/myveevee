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
  avatarRecipeId?: string;
  avatarRecipeVersion?: string;
  renderStatus?: TwinCardLead["renderStatus"];
  fulfillmentStatus?: TwinCardLead["fulfillmentStatus"];
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
    avatarRecipeId: card.avatarRecipeId ?? fallback?.avatarRecipeId,
    avatarRecipeVersion: card.avatarRecipeVersion ?? fallback?.avatarRecipeVersion,
    renderStatus: card.renderStatus ?? fallback?.renderStatus,
    fulfillmentStatus: card.fulfillmentStatus ?? fallback?.fulfillmentStatus,
    eventName: card.eventName,
    boothDeviceId: card.boothDeviceId ?? fallback?.boothDeviceId,
    deviceMetadata: card.deviceMetadata ?? fallback?.deviceMetadata,
    language: card.language ?? fallback?.language,
    imageUpload: card.imageUpload ?? fallback?.imageUpload,
    runS3Key: card.runS3Key ?? fallback?.runS3Key,
    runJsonUrl: card.runJsonUrl ?? fallback?.runJsonUrl,
    printLayoutS3Key: card.printLayoutS3Key ?? fallback?.printLayoutS3Key,
    printLayoutUrl: card.printLayoutUrl ?? fallback?.printLayoutUrl,
    printLayoutContentType: card.printLayoutContentType ?? fallback?.printLayoutContentType,
    printImageContentType: card.printImageContentType ?? fallback?.printImageContentType,
    printImageS3Key: card.printImageS3Key ?? fallback?.printImageS3Key,
    printImageUrl: card.printImageUrl ?? fallback?.printImageUrl,
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
  };
}
