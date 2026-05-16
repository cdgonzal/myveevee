import { APP_LINKS } from "../../config/links";

export type SwcaProfileFunnelVariant = "avatar" | "visual";

export function getSwcaProfileFunnelVariant(submissionId: string): SwcaProfileFunnelVariant {
  const trimmed = submissionId.trim();
  if (!trimmed) {
    return Math.random() < 0.5 ? "avatar" : "visual";
  }

  return hashString(trimmed) % 2 === 0 ? "avatar" : "visual";
}

export function getSwcaProfileFunnelPath(submissionId: string) {
  return getSwcaProfileFunnelVariant(submissionId) === "avatar"
    ? APP_LINKS.internal.swcaFunnel
    : APP_LINKS.internal.swcaFunnelVisual;
}

function hashString(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}
