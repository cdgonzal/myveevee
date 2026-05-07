import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SITE_ORIGIN = "https://myveevee.com";
const DIST_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");

const ROUTES = [
  {
    path: "/",
    title: "VeeVee | Meet Your Health Twin",
    description:
      "VEEVEE is a digital version of your health that brings your records, habits, and care into one place so you can understand your body and make decisions with confidence.",
    image: "https://myveevee.com/og/home.svg",
  },
  {
    path: "/features",
    title: "VeeVee Features | Connected Care, Guidance, and Family Support",
    description:
      "Explore VeeVee features for connected care, everyday guidance, family support, care-team visibility, and hospital-to-home continuity.",
    image: "https://myveevee.com/og/features.svg",
  },
  {
    path: "/technology",
    title: "VeeVee Technology | Private, Fast Infrastructure for Connected Care",
    description:
      "See how VeeVee is built for connected care with privacy-minded architecture, fast alerts, unit-ready scale, and a responsive app experience.",
    image: "https://myveevee.com/og/technology.svg",
  },
  {
    path: "/simulator",
    title: "VeeVee Simulator | Explore Health and Coverage Scenarios",
    description:
      "Try the VeeVee Simulator to explore health, routine, and coverage scenarios with clearer next steps and a more personal picture of your care story.",
    image: "https://myveevee.com/og/simulator.svg",
  },
  {
    path: "/testimonials",
    title: "VeeVee Testimonials | Stories from Patients, Caregivers, and Clinicians",
    description:
      "Read how patients, caregivers, Medicare users, and clinicians describe VeeVee as a simpler, clearer, and more connected health experience.",
    image: "https://myveevee.com/og/testimonials.svg",
  },
  {
    path: "/contact",
    title: "Contact VeeVee | Press, Partnerships, and Support",
    description:
      "Contact VeeVee for press inquiries, partnerships, investor information, or support questions.",
    image: "https://myveevee.com/og/contact.svg",
  },
  {
    path: "/terms",
    title: "VeeVee Terms and Disclaimers",
    description:
      "Review VeeVee terms, disclaimers, wellness guidance limits, data notes, and hospital-use conditions in plain English.",
    image: "https://myveevee.com/og/terms.svg",
  },
];

function routeHtmlPath(routePath) {
  return routePath === "/"
    ? path.join(DIST_DIR, "index.html")
    : path.join(DIST_DIR, routePath.replace(/^\/+/, ""), "index.html");
}

function requireContains(html, needle, label) {
  if (!html.includes(needle)) {
    throw new Error(`Missing ${label}: ${needle}`);
  }
}

for (const route of ROUTES) {
  const htmlPath = routeHtmlPath(route.path);
  const html = await readFile(htmlPath, "utf8");
  const canonicalUrl = new URL(route.path, SITE_ORIGIN).toString();

  requireContains(html, `<title>${route.title}</title>`, `${route.path} title`);
  requireContains(
    html,
    `<meta name="description" content="${route.description}" />`,
    `${route.path} description`
  );
  requireContains(html, `<link rel="canonical" href="${canonicalUrl}" />`, `${route.path} canonical`);
  requireContains(html, `<meta property="og:url" content="${canonicalUrl}" />`, `${route.path} og:url`);
  requireContains(html, `<meta property="og:image" content="${route.image}" />`, `${route.path} og:image`);
  requireContains(html, `<meta name="robots" content="index, follow" />`, `${route.path} robots`);
  requireContains(html, `<meta name="twitter:image" content="${route.image}" />`, `${route.path} twitter:image`);
  requireContains(html, `data-prerendered-route="${route.path}"`, `${route.path} prerender marker`);
}

console.log(`Verified prerendered SEO output for ${ROUTES.length} public routes.`);
