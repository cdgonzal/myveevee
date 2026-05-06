import type { AnalyticsParams, AnalyticsPrimitive } from "./analyticsSchema";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function isFiniteNumber(value: AnalyticsPrimitive): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function normalizeParams(params: AnalyticsParams): Record<string, string | number | boolean> {
  return Object.entries(params).reduce<Record<string, string | number | boolean>>((acc, [key, value]) => {
    if (typeof value === "string" || typeof value === "boolean" || isFiniteNumber(value)) {
      acc[key] = value;
    }
    return acc;
  }, {});
}

export function trackEvent(eventName: string, params: AnalyticsParams = {}): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", eventName, normalizeParams(params));
}

