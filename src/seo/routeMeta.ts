import { APP_LINKS } from "../config/links";

export type RouteSeoMeta = {
  title: string;
  description: string;
  canonicalPath: string;
  robots?: string;
  ogType?: "website" | "article";
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  twitterImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
};

const DEFAULT_ROBOTS = "index, follow";
const DEFAULT_OG_IMAGE = "https://myveevee.com/og/home.svg";

export const DEFAULT_ROUTE_SEO: RouteSeoMeta = {
  title: "VeeVee | Meet Your Health Twin",
  description:
    "VEEVEE is a digital version of your health that brings your records, habits, and care into one place so you can understand your body and make decisions with confidence.",
  canonicalPath: APP_LINKS.internal.home,
  robots: DEFAULT_ROBOTS,
  ogImage: DEFAULT_OG_IMAGE,
  twitterImage: DEFAULT_OG_IMAGE,
};

export const ROUTE_SEO: Record<string, RouteSeoMeta> = {
  [APP_LINKS.internal.home]: {
    ...DEFAULT_ROUTE_SEO,
    ogType: "website",
  },
  [APP_LINKS.internal.whyVeeVee]: {
    title: "VeeVee Features | Connected Care, Guidance, and Family Support",
    description:
      "Explore VeeVee features for connected care, everyday guidance, family support, care-team visibility, and hospital-to-home continuity.",
    canonicalPath: APP_LINKS.internal.whyVeeVee,
    robots: DEFAULT_ROBOTS,
    ogType: "website",
    ogImage: "https://myveevee.com/og/features.svg",
    twitterImage: "https://myveevee.com/og/features.svg",
  },
  [APP_LINKS.internal.technology]: {
    title: "VeeVee Technology | Private, Fast Infrastructure for Connected Care",
    description:
      "See how VeeVee is built for connected care with privacy-minded architecture, fast alerts, unit-ready scale, and a responsive app experience.",
    canonicalPath: APP_LINKS.internal.technology,
    robots: DEFAULT_ROBOTS,
    ogType: "website",
    ogImage: "https://myveevee.com/og/technology.svg",
    twitterImage: "https://myveevee.com/og/technology.svg",
  },
  [APP_LINKS.internal.simulator]: {
    title: "VeeVee Simulator | Explore Health and Coverage Scenarios",
    description:
      "Try the VeeVee Simulator to explore health, routine, and coverage scenarios with clearer next steps and a more personal picture of your care story.",
    canonicalPath: APP_LINKS.internal.simulator,
    robots: DEFAULT_ROBOTS,
    ogType: "website",
    ogImage: "https://myveevee.com/og/simulator.svg",
    twitterImage: "https://myveevee.com/og/simulator.svg",
  },
  [APP_LINKS.internal.testimonials]: {
    title: "VeeVee Testimonials | Stories from Patients, Caregivers, and Clinicians",
    description:
      "Read how patients, caregivers, Medicare users, and clinicians describe VeeVee as a simpler, clearer, and more connected health experience.",
    canonicalPath: APP_LINKS.internal.testimonials,
    robots: DEFAULT_ROBOTS,
    ogType: "website",
    ogImage: "https://myveevee.com/og/testimonials.svg",
    twitterImage: "https://myveevee.com/og/testimonials.svg",
  },
  [APP_LINKS.internal.contact]: {
    title: "Contact VeeVee | Press, Partnerships, and Support",
    description:
      "Contact VeeVee for press inquiries, partnerships, investor information, or support questions.",
    canonicalPath: APP_LINKS.internal.contact,
    robots: DEFAULT_ROBOTS,
    ogType: "website",
    ogImage: "https://myveevee.com/og/contact.svg",
    twitterImage: "https://myveevee.com/og/contact.svg",
  },
  [APP_LINKS.internal.terms]: {
    title: "VeeVee Terms and Disclaimers",
    description:
      "Review VeeVee terms, disclaimers, wellness guidance limits, data notes, and hospital-use conditions in plain English.",
    canonicalPath: APP_LINKS.internal.terms,
    robots: DEFAULT_ROBOTS,
    ogType: "website",
    ogImage: "https://myveevee.com/og/terms.svg",
    twitterImage: "https://myveevee.com/og/terms.svg",
  },
  [APP_LINKS.internal.swcaBrief]: {
    title: "SWCA Brief",
    description: "Internal SWCA brief.",
    canonicalPath: APP_LINKS.internal.swcaBrief,
    robots: "noindex, nofollow, noarchive, nosnippet",
    ogType: "website",
    ogImage: DEFAULT_OG_IMAGE,
    twitterImage: DEFAULT_OG_IMAGE,
  },
};
