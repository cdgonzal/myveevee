import { useEffect } from "react";
import { trackEvent } from "./trackEvent";

const DEPTH_THRESHOLDS = [25, 50, 75, 90] as const;
const sentScrollDepthKeys = new Set<string>();

export function useScrollDepth(pathname: string): void {
  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    const onScroll = () => {
      const scrollTop = window.scrollY;
      const viewportHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollableHeight = documentHeight - viewportHeight;
      if (scrollableHeight <= 0) {
        return;
      }
      const scrollPercent = Math.min(100, Math.round((scrollTop / scrollableHeight) * 100));

      DEPTH_THRESHOLDS.forEach((threshold) => {
        if (scrollPercent < threshold) {
          return;
        }

        const key = `${pathname}:${threshold}`;
        if (sentScrollDepthKeys.has(key)) {
          return;
        }

        sentScrollDepthKeys.add(key);
        trackEvent("scroll_depth", {
          page_path: pathname,
          scroll_percent: threshold,
        });
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);
}
