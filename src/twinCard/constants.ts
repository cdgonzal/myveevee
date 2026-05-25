import type { TwinCardInterestId } from "./types";

export const TWIN_CARD_EVENT_NAME = "4th SWCA Medical Summit";
export const TWIN_CARD_EVENT_DATE = "May 29, 2026";
export const TWIN_CARD_EVENT_LOCATION = "The Sacred Space, Miami";

export const TWIN_CARD_INTERESTS: Array<{ id: TwinCardInterestId; label: string }> = [
  { id: "prepare_for_care", label: "Prepare for a doctor visit" },
  { id: "understand_symptoms", label: "Understand symptoms" },
  { id: "organize_records", label: "Organize health records" },
  { id: "track_goals", label: "Track wellness goals" },
  { id: "understand_benefits", label: "Understand benefits" },
  { id: "support_loved_one", label: "Support a loved one" },
  { id: "just_exploring", label: "Just exploring" },
];

export function getTwinCardInterestLabel(interestId: TwinCardInterestId) {
  return TWIN_CARD_INTERESTS.find((interest) => interest.id === interestId)?.label ?? "Just exploring";
}
