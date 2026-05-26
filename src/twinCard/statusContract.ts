import statusContract from "./statusContract.json";
import type { TwinCardGenerationStatus } from "./types";

export const TWIN_CARD_STATUS_CONTRACT = statusContract;

export function getTwinCardGenerationStatusLabel(status: TwinCardGenerationStatus | string) {
  return readGenerationStatus(status).dashboardLabel;
}

export function isTwinCardGenerationStatusPrintable(status: TwinCardGenerationStatus | string) {
  return Boolean(readGenerationStatus(status).printable);
}

export function getTwinCardGenerationStatusColorScheme(status: TwinCardGenerationStatus | string) {
  if (status === "completed") return "green";
  if (status === "fallback_used") return "orange";
  if (status === "failed") return "red";
  return "blue";
}

function readGenerationStatus(status: TwinCardGenerationStatus | string) {
  const statuses = TWIN_CARD_STATUS_CONTRACT.generationStatuses as Record<
    string,
    {
      dashboardLabel: string;
      printable: boolean;
    }
  >;
  return statuses[status] ?? { dashboardLabel: status, printable: false };
}
