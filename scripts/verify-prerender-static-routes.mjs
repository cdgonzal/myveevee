import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SITE_ORIGIN = "https://myveevee.com";
const DIST_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const corePageMeta = JSON.parse(await readFile(new URL("../src/seo/corePageMeta.json", import.meta.url), "utf8"));
const marketingRedirects = JSON.parse(await readFile(new URL("../src/config/marketingRedirects.json", import.meta.url), "utf8"));

const ROUTES = [
  {
    path: "/health-twin",
    title: "Create Your Health Twin | Guided VeeVee Funnel Preview",
    description:
      "Walk through a four-step VeeVee funnel: simulate health data input, evolve the twin with more context, review insights, and then create your own.",
    robots: "noindex, nofollow",
    image: "https://myveevee.com/og/home.svg",
  },
  {
    path: "/health-twin/create",
    title: "Create Your Health Twin | VeeVee",
    description:
      "Create a free personalized VeeVee Health Twin and turn your health signals into a clearer next step.",
    robots: "noindex, nofollow",
    image: "https://myveevee.com/og/home.svg",
  },
  {
    path: "/simulator",
    title: "VeeVee Simulator | Explore Health and Coverage Scenarios",
    description:
      "Try the VeeVee Simulator to explore health, routine, and coverage scenarios with clearer next steps and a more personal picture of your care story.",
    robots: "noindex, nofollow",
    image: "https://myveevee.com/og/simulator.svg",
  },
  {
    path: "/caregivers",
    title: "Caregiver Support App | VeeVee for Families and Daily Care Coordination",
    description:
      "Explore how VeeVee supports caregivers with clearer updates, benefits context, family visibility, and calmer next steps after appointments or during recovery.",
    image: "https://myveevee.com/og/features.svg",
  },
  {
    path: "/medicare-guidance",
    title: "Medicare Guidance App | VeeVee for Coverage Questions and Next Steps",
    description:
      "See how VeeVee helps Medicare users and families understand coverage context, follow-up questions, and calmer next steps after appointments.",
    image: "https://myveevee.com/og/simulator.svg",
  },
  {
    path: "/hospital-to-home",
    title: "Hospital to Home Care Support | VeeVee for Discharge Follow-Up",
    description:
      "Learn how VeeVee supports hospital-to-home continuity with discharge follow-up, family visibility, and connected care after the visit.",
    image: "https://myveevee.com/og/technology.svg",
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

ROUTES.push(...Object.entries(corePageMeta).map(([path, meta]) => ({ path, ...meta })));

// The legacy creation URL remains available only by direct link.
ROUTES.push({ ...ROUTES.find((route) => route.path === "/health-twin/create"), path: "/create" });

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
  requireContains(html, `<meta name="robots" content="${route.robots ?? "index, follow"}" />`, `${route.path} robots`);
  requireContains(html, `<meta name="twitter:image" content="${route.image}" />`, `${route.path} twitter:image`);
  requireContains(html, `data-prerendered-route="${route.path}"`, `${route.path} prerender marker`);
  requireContains(html, 'data-theme="dark"', `${route.path} initial dark appearance`);
  requireContains(html, 'color-scheme:dark', `${route.path} browser color scheme`);
  requireContains(html, 'color:#FFFFFF;', `${route.path} readable prerendered copy`);
  if (html.includes("color:#0b2341")) throw new Error(`Light fallback text on ${route.path}`);
}

const sitemap = await readFile(path.join(DIST_DIR, "sitemap.xml"), "utf8");
for (const route of ROUTES.filter((route) => route.robots?.includes("noindex"))) {
  if (sitemap.includes(`<loc>${SITE_ORIGIN}${route.path}</loc>`)) {
    throw new Error(`Hidden preview must not appear in the sitemap: ${route.path}`);
  }
}
for (const redirect of marketingRedirects) {
  const html = await readFile(routeHtmlPath(redirect.source), "utf8");
  requireContains(html, `<link rel="canonical" href="${SITE_ORIGIN}${redirect.target}" />`, "redirect canonical");
  requireContains(html, 'content="noindex, follow"', "redirect robots");
  requireContains(html, 'window.location.search + window.location.hash', "redirect attribution preservation");
  if (sitemap.includes(`<loc>${SITE_ORIGIN}${redirect.source}</loc>`)) throw new Error(`Retired page remains in sitemap: ${redirect.source}`);
  if (!corePageMeta[redirect.target]) throw new Error(`Missing redirect destination: ${redirect.target}`);
}
const hostingRules = JSON.parse(await readFile(path.join(DIST_DIR, "amplify-marketing-rules.json"), "utf8"));
for (const redirect of marketingRedirects) {
  for (const source of [redirect.source, `${redirect.source}/`]) {
    if (!hostingRules.some((rule) => rule.source === source && rule.target === redirect.target && rule.status === "301")) {
      throw new Error(`Missing permanent hosting redirect: ${source}`);
    }
  }
}
for (const route of ROUTES.filter((route) => route.path !== "/")) {
  for (const source of [route.path, `${route.path}/`]) {
    if (!hostingRules.some((rule) => rule.source === source && rule.target === `${route.path}/index.html` && rule.status === "200")) {
      throw new Error(`Missing prerendered-page hosting rewrite: ${source}`);
    }
  }
}
console.log(`Verified SEO output for ${ROUTES.length} routes and ${marketingRedirects.length} retired-page redirects.`);
