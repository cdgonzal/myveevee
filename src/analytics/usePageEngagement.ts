import { useEffect } from "react";
import { getRouteAnalytics } from "./analyticsSchema";
import { trackEvent } from "./trackEvent";

const engagedPages = new Set<string>();

export function usePageEngagement(pathname: string): void {
  useEffect(() => {
    const key = `${pathname}:10s`;
    if (engagedPages.has(key)) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      engagedPages.add(key);
      trackEvent("page_engaged", {
        page_path: pathname,
        engagement_type: "time_on_page",
        engagement_seconds: 10,
        ...getRouteAnalytics(pathname),
      });
    }, 10000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [pathname]);
}
