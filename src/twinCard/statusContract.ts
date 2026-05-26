import statusContract from "./statusContract.json";
import type { TwinCardFulfillmentStatus, TwinCardGenerationStatus, TwinCardRenderStatus } from "./types";

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

export function getTwinCardRenderStatusLabel(status: TwinCardRenderStatus | string | undefined) {
  return readRenderStatus(status ?? "not_started").dashboardLabel;
}

export function isTwinCardRenderStatusPrintReady(status: TwinCardRenderStatus | string | undefined) {
  return Boolean(readRenderStatus(status ?? "not_started").printReady);
}

export function getTwinCardRenderStatusColorScheme(status: TwinCardRenderStatus | string | undefined) {
  if (status === "rendered") return "green";
  if (status === "render_failed") return "red";
  if (status === "rendering") return "blue";
  return "gray";
}

export function getTwinCardFulfillmentStatusLabel(status: TwinCardFulfillmentStatus | string | undefined) {
  return readFulfillmentStatus(status ?? "not_printed").dashboardLabel;
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

function readRenderStatus(status: TwinCardRenderStatus | string) {
  const statuses = TWIN_CARD_STATUS_CONTRACT.renderStatuses as Record<
    string,
    {
      dashboardLabel: string;
      printReady: boolean;
    }
  >;
  return statuses[status] ?? { dashboardLabel: status, printReady: false };
}

function readFulfillmentStatus(status: TwinCardFulfillmentStatus | string) {
  const statuses = TWIN_CARD_STATUS_CONTRACT.fulfillmentStatuses as Record<
    string,
    {
      dashboardLabel: string;
    }
  >;
  return statuses[status] ?? { dashboardLabel: status };
}
