import type { AnalyticsParams, AnalyticsPrimitive } from "../analytics/analyticsSchema";

type SwcaCampaignEventPayload = {
  eventName: string;
  pagePath?: string;
  pageUrl?: string;
  sessionId?: string;
  submissionId?: string;
  rewardId?: string;
  contactMethod?: string;
  mode?: string;
  params?: AnalyticsParams;
};

const SWCA_EVENT_API_URL = import.meta.env.VITE_SWCA_EVENT_API_URL as string | undefined;
const SESSION_STORAGE_KEY = "swca-campaign-session-id";

export function trackSwcaCampaignEvent(payload: SwcaCampaignEventPayload): void {
  const endpoint = SWCA_EVENT_API_URL?.trim();
  if (!endpoint || typeof window === "undefined") {
    return;
  }

  const body: SwcaCampaignEventPayload = {
    ...payload,
    pagePath: payload.pagePath ?? window.location.pathname,
    pageUrl: payload.pageUrl ?? `${window.location.origin}${window.location.pathname}`,
    sessionId: payload.sessionId ?? getCampaignSessionId(),
    params: normalizeParams(payload.params ?? {}),
  };

  window.setTimeout(() => {
    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => undefined);
  }, 0);
}

function getCampaignSessionId() {
  const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const next = window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  window.sessionStorage.setItem(SESSION_STORAGE_KEY, next);
  return next;
}

function normalizeParams(params: AnalyticsParams): Record<string, AnalyticsPrimitive> {
  return Object.entries(params).reduce<Record<string, AnalyticsPrimitive>>((acc, [key, value]) => {
    if (typeof value === "string" || typeof value === "boolean" || (typeof value === "number" && Number.isFinite(value))) {
      acc[key] = value;
    }
    return acc;
  }, {});
}
