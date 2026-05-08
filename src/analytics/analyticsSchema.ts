import { APP_LINKS } from "../config/links";

export type AnalyticsPrimitive = string | number | boolean | null | undefined;

export type AnalyticsParams = Record<string, AnalyticsPrimitive>;

export type RouteAnalyticsMetadata = {
  page_name: string;
  page_section: string;
  page_type: string;
  primary_goal: string;
};

export const ROUTE_ANALYTICS: Record<string, RouteAnalyticsMetadata> = {
  [APP_LINKS.internal.home]: {
    page_name: "home",
    page_section: "marketing",
    page_type: "marketing_landing",
    primary_goal: "drive_account_creation",
  },
  [APP_LINKS.internal.howItWorks]: {
    page_name: "how_it_works",
    page_section: "marketing",
    page_type: "marketing_detail",
    primary_goal: "drive_simulator_or_login",
  },
  [APP_LINKS.internal.hospitalValue]: {
    page_name: "hospital_value",
    page_section: "marketing",
    page_type: "marketing_detail",
    primary_goal: "build_trust",
  },
  [APP_LINKS.internal.whyVeeVee]: {
    page_name: "features",
    page_section: "marketing",
    page_type: "marketing_detail",
    primary_goal: "drive_simulator_or_login",
  },
  [APP_LINKS.internal.technology]: {
    page_name: "technology",
    page_section: "marketing",
    page_type: "marketing_detail",
    primary_goal: "build_trust",
  },
  [APP_LINKS.internal.simulator]: {
    page_name: "simulator",
    page_section: "marketing",
    page_type: "interactive_preview",
    primary_goal: "drive_activation",
  },
  [APP_LINKS.internal.testimonials]: {
    page_name: "testimonials",
    page_section: "marketing",
    page_type: "marketing_detail",
    primary_goal: "build_trust",
  },
  [APP_LINKS.internal.terms]: {
    page_name: "terms",
    page_section: "legal",
    page_type: "legal_page",
    primary_goal: "inform_usage_terms",
  },
  [APP_LINKS.internal.swcaBrief]: {
    page_name: "swca_brief",
    page_section: "brief",
    page_type: "standalone_brief",
    primary_goal: "support_brief_review",
  },
};

export function getRouteAnalytics(pathname: string): RouteAnalyticsMetadata {
  return (
    ROUTE_ANALYTICS[pathname] ?? {
      page_name: "unknown",
      page_section: "unknown",
      page_type: "unknown",
      primary_goal: "unknown",
    }
  );
}
