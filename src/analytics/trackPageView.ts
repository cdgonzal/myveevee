import { getRouteAnalytics } from "./analyticsSchema";
import { trackEvent } from "./trackEvent";

let lastPageViewSignature: string | null = null;
let lastPageViewAt = 0;

function getReferrerDomain(): string | undefined {
  if (typeof document === "undefined" || !document.referrer) {
    return undefined;
  }

  try {
    return new URL(document.referrer).hostname;
  } catch {
    return undefined;
  }
}

function getLandingPage(currentPath: string): string {
  if (typeof window === "undefined") {
    return currentPath;
  }

  try {
    const existing = window.sessionStorage.getItem("vv_landing_page");
    if (existing) {
      return existing;
    }

    window.sessionStorage.setItem("vv_landing_page", currentPath);
  } catch {
    return currentPath;
  }

  return currentPath;
}

export function trackPageView(pathname: string, search: string): void {
  const pagePath = `${pathname}${search}`;
  const signature = `${pathname}|${search}`;
  const now = Date.now();

  if (lastPageViewSignature === signature && now - lastPageViewAt < 500) {
    return;
  }

  lastPageViewSignature = signature;
  lastPageViewAt = now;

  const metadata = getRouteAnalytics(pathname);
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams(search);

  trackEvent("page_view", {
    page_title: typeof document !== "undefined" ? document.title : undefined,
    page_location: typeof window !== "undefined" ? window.location.href : pagePath,
    page_path: pagePath,
    landing_page: getLandingPage(pagePath),
    source: searchParams.get("utm_source") ?? undefined,
    medium: searchParams.get("utm_medium") ?? undefined,
    campaign: searchParams.get("utm_campaign") ?? undefined,
    term: searchParams.get("utm_term") ?? undefined,
    content: searchParams.get("utm_content") ?? undefined,
    referrer_domain: getReferrerDomain(),
    ...metadata,
  });
}

