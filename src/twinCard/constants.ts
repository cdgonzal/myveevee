import type { TwinCardInterestId } from "./types";

export const TWIN_CARD_EVENT_NAME = "4th SWCA Medical Summit";
export const TWIN_CARD_EVENT_DATE = "May 29, 2026";
export const TWIN_CARD_EVENT_LOCATION = "The Sacred Space, Miami";

export const TWIN_CARD_INTERESTS: Array<{ id: TwinCardInterestId; label: string }> = [
  { id: "track_goals", label: "Feel Stronger" },
  { id: "prepare_for_care", label: "Feel Prepared" },
  { id: "support_loved_one", label: "Support My Family" },
];

export function getTwinCardInterestLabel(interestId: TwinCardInterestId) {
  return TWIN_CARD_INTERESTS.find((interest) => interest.id === interestId)?.label ?? "Just exploring";
}
