import { TWIN_CARD_EVENT_DATE, TWIN_CARD_EVENT_NAME } from "./constants";
import type { TwinCardLead } from "./types";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function downloadTwinCardSvg(lead: TwinCardLead) {
  const avatar = lead.generatedAvatarDataUrl ?? lead.sourceImageDataUrl;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1500" height="2100" viewBox="0 0 1500 2100">
  <rect width="1500" height="2100" rx="36" fill="#ffffff"/>
  <rect width="1500" height="360" fill="#06254C"/>
  <text x="90" y="115" fill="#9CE7FF" font-family="Inter, Arial, sans-serif" font-size="48" font-weight="900" letter-spacing="8">VEEVEE</text>
  <text x="90" y="220" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="104" font-weight="900">VeeVee Twin Card</text>
  <text x="90" y="292" fill="#d7f6ff" font-family="Inter, Arial, sans-serif" font-size="40">${escapeXml(TWIN_CARD_EVENT_NAME)} · ${escapeXml(TWIN_CARD_EVENT_DATE)}</text>
  <rect x="245" y="500" width="1010" height="1010" rx="34" fill="#eefaff" stroke="#c9eaf5" stroke-width="6"/>
  ${
    avatar
      ? `<image x="245" y="500" width="1010" height="1010" preserveAspectRatio="xMidYMid slice" href="${avatar}"/>`
      : `<text x="750" y="1120" text-anchor="middle" fill="#1177BA" font-family="Inter, Arial, sans-serif" font-size="360" font-weight="900">${escapeXml(lead.firstName.slice(0, 1).toUpperCase())}</text>`
  }
  <text x="750" y="1658" text-anchor="middle" fill="#061b38" font-family="Inter, Arial, sans-serif" font-size="138" font-weight="900">${escapeXml(lead.firstName)}</text>
  <text x="750" y="1740" text-anchor="middle" fill="#1177BA" font-family="Inter, Arial, sans-serif" font-size="56" font-weight="900">Health Twin Activated</text>
  <text x="750" y="1812" text-anchor="middle" fill="#35445d" font-family="Inter, Arial, sans-serif" font-size="44">Focus: ${escapeXml(lead.wellnessInterestLabel)}</text>
  <rect x="390" y="1900" width="720" height="92" rx="46" fill="#e9fbff" stroke="#c9eaf5" stroke-width="4"/>
  <text x="750" y="1959" text-anchor="middle" fill="#06254C" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="800">${escapeXml(lead.cardResultUrl)}</text>
</svg>`;

  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = `veevee-twin-card-${lead.cardId}.svg`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}
