import { trackEvent } from "../analytics/trackEvent";
import type { TwinCardLead } from "./types";

export function trackTwinCardEvent(eventName: string, lead?: Pick<TwinCardLead, "cardId" | "wellnessInterest" | "generationProvider" | "generationStatus">) {
  trackEvent(eventName, {
    cardId: lead?.cardId,
    wellnessInterest: lead?.wellnessInterest,
    generationProvider: lead?.generationProvider,
    generationStatus: lead?.generationStatus,
    eventName: "4th SWCA Medical Summit",
  });
}
