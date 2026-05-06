import type { AnalyticsParams } from "./analyticsSchema";
import { trackEvent } from "./trackEvent";

type TrackCtaClickArgs = {
  ctaName: string;
  ctaText: string;
  placement: string;
  destinationType: "internal" | "external";
  destinationUrl: string;
  pagePath?: string;
  extraParams?: AnalyticsParams;
};

export function trackCtaClick({
  ctaName,
  ctaText,
  placement,
  destinationType,
  destinationUrl,
  pagePath,
  extraParams,
}: TrackCtaClickArgs): void {
  trackEvent("cta_click", {
    cta_name: ctaName,
    cta_text: ctaText,
    placement,
    destination_type: destinationType,
    destination_url: destinationUrl,
    page_path: pagePath ?? (typeof window !== "undefined" ? window.location.pathname : undefined),
    ...extraParams,
  });
}

