import { DEFAULT_ROUTE_SEO, type RouteSeoMeta } from "./routeMeta";

const SITE_ORIGIN = "https://myveevee.com";
const SITE_NAME = "My VeeVee";
const DEFAULT_TWITTER_CARD = "summary_large_image";

function ensureMeta(selector: string, create: () => HTMLMetaElement): HTMLMetaElement {
  const existing = document.head.querySelector<HTMLMetaElement>(selector);
  if (existing) {
    return existing;
  }

  const meta = create();
  document.head.appendChild(meta);
  return meta;
}

function ensureLink(selector: string, create: () => HTMLLinkElement): HTMLLinkElement {
  const existing = document.head.querySelector<HTMLLinkElement>(selector);
  if (existing) {
    return existing;
  }

  const link = create();
  document.head.appendChild(link);
  return link;
}

export function applyRouteSeo(meta: RouteSeoMeta) {
  const resolvedTitle = meta.title || DEFAULT_ROUTE_SEO.title;
  const resolvedDescription = meta.description || DEFAULT_ROUTE_SEO.description;
  const resolvedRobots = meta.robots || DEFAULT_ROUTE_SEO.robots || "index, follow";
  const canonicalUrl = new URL(meta.canonicalPath || DEFAULT_ROUTE_SEO.canonicalPath, SITE_ORIGIN).toString();
  const ogType = meta.ogType || "website";
  const ogImage = meta.ogImage || DEFAULT_ROUTE_SEO.ogImage || "https://myveevee.com/og/home.svg";
  const ogTitle = meta.ogTitle || resolvedTitle;
  const ogDescription = meta.ogDescription || resolvedDescription;
  const twitterImage = meta.twitterImage || ogImage;
  const twitterTitle = meta.twitterTitle || ogTitle;
  const twitterDescription = meta.twitterDescription || ogDescription;

  document.title = resolvedTitle;

  ensureMeta('meta[name="description"]', () => {
    const tag = document.createElement("meta");
    tag.name = "description";
    return tag;
  }).content = resolvedDescription;

  ensureMeta('meta[name="robots"]', () => {
    const tag = document.createElement("meta");
    tag.name = "robots";
    return tag;
  }).content = resolvedRobots;

  ensureLink('link[rel="canonical"]', () => {
    const tag = document.createElement("link");
    tag.rel = "canonical";
    return tag;
  }).href = canonicalUrl;

  ensureMeta('meta[property="og:title"]', () => {
    const tag = document.createElement("meta");
    tag.setAttribute("property", "og:title");
    return tag;
  }).content = ogTitle;

  ensureMeta('meta[property="og:type"]', () => {
    const tag = document.createElement("meta");
    tag.setAttribute("property", "og:type");
    return tag;
  }).content = ogType;

  ensureMeta('meta[property="og:site_name"]', () => {
    const tag = document.createElement("meta");
    tag.setAttribute("property", "og:site_name");
    return tag;
  }).content = SITE_NAME;

  ensureMeta('meta[property="og:description"]', () => {
    const tag = document.createElement("meta");
    tag.setAttribute("property", "og:description");
    return tag;
  }).content = ogDescription;

  ensureMeta('meta[property="og:url"]', () => {
    const tag = document.createElement("meta");
    tag.setAttribute("property", "og:url");
    return tag;
  }).content = canonicalUrl;

  ensureMeta('meta[property="og:image"]', () => {
    const tag = document.createElement("meta");
    tag.setAttribute("property", "og:image");
    return tag;
  }).content = ogImage;

  ensureMeta('meta[name="twitter:title"]', () => {
    const tag = document.createElement("meta");
    tag.name = "twitter:title";
    return tag;
  }).content = twitterTitle;

  ensureMeta('meta[name="twitter:card"]', () => {
    const tag = document.createElement("meta");
    tag.name = "twitter:card";
    return tag;
  }).content = DEFAULT_TWITTER_CARD;

  ensureMeta('meta[name="twitter:description"]', () => {
    const tag = document.createElement("meta");
    tag.name = "twitter:description";
    return tag;
  }).content = twitterDescription;

  ensureMeta('meta[name="twitter:image"]', () => {
    const tag = document.createElement("meta");
    tag.name = "twitter:image";
    return tag;
  }).content = twitterImage;
}
