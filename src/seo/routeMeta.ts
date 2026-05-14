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

export const NOT_FOUND_ROUTE_SEO: RouteSeoMeta = {
  title: "Page Not Found | VeeVee",
  description: "The page you requested could not be found. Continue to How VeeVee Works to learn the strongest next step.",
  canonicalPath: APP_LINKS.internal.howItWorks,
  robots: "noindex, follow, noarchive",
  ogType: "website",
  ogImage: DEFAULT_OG_IMAGE,
  twitterImage: DEFAULT_OG_IMAGE,
};

export const ROUTE_SEO: Record<string, RouteSeoMeta> = {
  [APP_LINKS.internal.home]: {
    ...DEFAULT_ROUTE_SEO,
    ogType: "website",
  },
  [APP_LINKS.internal.healthTwin]: {
    title: "Create Your Health Twin | Guided VeeVee Funnel Preview",
    description:
      "Walk through a four-step VeeVee funnel: simulate health data input, evolve the twin with more context, review insights, and then create your own.",
    canonicalPath: APP_LINKS.internal.healthTwin,
    robots: DEFAULT_ROBOTS,
    ogType: "website",
    ogImage: DEFAULT_OG_IMAGE,
    twitterImage: DEFAULT_OG_IMAGE,
  },
  [APP_LINKS.internal.avatarPlaybackTest]: {
    title: "Avatar Playback Test | VeeVee",
    description: "Hidden VeeVee avatar video playback diagnostic page.",
    canonicalPath: APP_LINKS.internal.avatarPlaybackTest,
    robots: "noindex, nofollow, noarchive, nosnippet",
    ogType: "website",
    ogImage: DEFAULT_OG_IMAGE,
    twitterImage: DEFAULT_OG_IMAGE,
  },
  [APP_LINKS.internal.howItWorks]: {
    title: "How VeeVee Works | 3 Simple Steps for Health Questions",
    description:
      "See how VeeVee helps people describe what is happening, get calmer next-step guidance, and decide what to do next in three simple steps.",
    canonicalPath: APP_LINKS.internal.howItWorks,
    robots: DEFAULT_ROBOTS,
    ogType: "website",
    ogImage: DEFAULT_OG_IMAGE,
    twitterImage: DEFAULT_OG_IMAGE,
  },
  [APP_LINKS.internal.hospitalValue]: {
    title: "VeeVee Hospital Value | Revenue, Labor Savings, and Risk Reduction",
    description:
      "Review the VeeVee hospital value story, including revenue support, labor efficiency, risk mitigation, and illustrative rollout math.",
    canonicalPath: APP_LINKS.internal.hospitalValue,
    robots: DEFAULT_ROBOTS,
    ogType: "website",
    ogImage: "https://myveevee.com/og/technology.svg",
    twitterImage: "https://myveevee.com/og/technology.svg",
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
  [APP_LINKS.internal.caregivers]: {
    title: "Caregiver Support App | VeeVee for Families and Daily Care Coordination",
    description:
      "Explore how VeeVee supports caregivers with clearer updates, benefits context, family visibility, and calmer next steps after appointments or during recovery.",
    canonicalPath: APP_LINKS.internal.caregivers,
    robots: DEFAULT_ROBOTS,
    ogType: "website",
    ogImage: "https://myveevee.com/og/features.svg",
    twitterImage: "https://myveevee.com/og/features.svg",
  },
  [APP_LINKS.internal.medicare]: {
    title: "Medicare Guidance App | VeeVee for Coverage Questions and Next Steps",
    description:
      "See how VeeVee helps Medicare users and families understand coverage context, follow-up questions, and calmer next steps after appointments.",
    canonicalPath: APP_LINKS.internal.medicare,
    robots: DEFAULT_ROBOTS,
    ogType: "website",
    ogImage: "https://myveevee.com/og/simulator.svg",
    twitterImage: "https://myveevee.com/og/simulator.svg",
  },
  [APP_LINKS.internal.hospitalToHome]: {
    title: "Hospital to Home Care Support | VeeVee for Discharge Follow-Up",
    description:
      "Learn how VeeVee supports hospital-to-home continuity with discharge follow-up, family visibility, and connected care after the visit.",
    canonicalPath: APP_LINKS.internal.hospitalToHome,
    robots: DEFAULT_ROBOTS,
    ogType: "website",
    ogImage: "https://myveevee.com/og/technology.svg",
    twitterImage: "https://myveevee.com/og/technology.svg",
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
  [APP_LINKS.internal.swcaRewards]: {
    title: "Spin for a Reward | Spine and Wellness Centers of America",
    description:
      "Complete the Spine and Wellness Centers of America wellness intake, then follow the clinic instructions to spin the reward wheel.",
    canonicalPath: APP_LINKS.internal.swcaRewards,
    robots: "noindex, nofollow, noarchive, nosnippet",
    ogType: "website",
    ogImage: DEFAULT_OG_IMAGE,
    twitterImage: DEFAULT_OG_IMAGE,
  },
  [APP_LINKS.internal.swcaTeaserAlias]: {
    title: "Spin for a Reward | Spine and Wellness Centers of America",
    description:
      "Complete the Spine and Wellness Centers of America wellness intake, then follow the clinic instructions to spin the reward wheel.",
    canonicalPath: APP_LINKS.internal.swcaRewards,
    robots: "noindex, nofollow, noarchive, nosnippet",
    ogType: "website",
    ogImage: DEFAULT_OG_IMAGE,
    twitterImage: DEFAULT_OG_IMAGE,
  },
  [APP_LINKS.internal.swcaIntake]: {
    title: "Spine and Wellness Intake Form",
    description: "Spine and Wellness Centers of America wellness priority intake form.",
    canonicalPath: APP_LINKS.internal.swcaIntake,
    robots: "noindex, nofollow, noarchive, nosnippet",
    ogType: "website",
    ogImage: DEFAULT_OG_IMAGE,
    twitterImage: DEFAULT_OG_IMAGE,
  },
  [APP_LINKS.internal.swcaWheel]: {
    title: "SWCA Reward Wheel",
    description: "Spine and Wellness Centers of America post-intake reward wheel.",
    canonicalPath: APP_LINKS.internal.swcaWheel,
    robots: "noindex, nofollow, noarchive, nosnippet",
    ogType: "website",
    ogImage: DEFAULT_OG_IMAGE,
    twitterImage: DEFAULT_OG_IMAGE,
  },
  [APP_LINKS.internal.swcaCertificate]: {
    title: "SWCA Reward Certificate",
    description: "Spine and Wellness Centers of America reward certificate.",
    canonicalPath: APP_LINKS.internal.swcaCertificate,
    robots: "noindex, nofollow, noarchive, nosnippet",
    ogType: "website",
    ogImage: DEFAULT_OG_IMAGE,
    twitterImage: DEFAULT_OG_IMAGE,
  },
  [APP_LINKS.internal.swcaFunnel]: {
    title: "Create a Free VeeVee Profile | SWCA",
    description: "Spine and Wellness Centers of America recommended next step to create a free VeeVee profile.",
    canonicalPath: APP_LINKS.internal.swcaFunnel,
    robots: "noindex, nofollow, noarchive, nosnippet",
    ogType: "website",
    ogImage: DEFAULT_OG_IMAGE,
    twitterImage: DEFAULT_OG_IMAGE,
  },
  [APP_LINKS.internal.swcaAdmin]: {
    title: "SWCA Campaign Admin",
    description: "Private SWCA campaign reporting dashboard.",
    canonicalPath: APP_LINKS.internal.swcaAdmin,
    robots: "noindex, nofollow, noarchive, nosnippet",
    ogType: "website",
    ogImage: DEFAULT_OG_IMAGE,
    twitterImage: DEFAULT_OG_IMAGE,
  },
};
