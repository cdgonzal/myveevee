import { TWIN_CARD_EVENT_DATE, TWIN_CARD_EVENT_NAME } from "./constants";
import { TWIN_CARD_PRINT_CONTRACT } from "./printContract";
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
  const { widthPx, heightPx } = TWIN_CARD_PRINT_CONTRACT.artwork;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${widthPx}" height="${heightPx}" viewBox="0 0 ${widthPx} ${heightPx}">
  <rect width="${widthPx}" height="${heightPx}" rx="28" fill="#ffffff"/>
  <rect width="${widthPx}" height="280" fill="#06254C"/>
  <text x="72" y="92" fill="#9CE7FF" font-family="Inter, Arial, sans-serif" font-size="38" font-weight="900" letter-spacing="7">VEEVEE</text>
  <text x="72" y="174" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="82" font-weight="900">VeeVee Twin Card</text>
  <text x="72" y="232" fill="#d7f6ff" font-family="Inter, Arial, sans-serif" font-size="32">${escapeXml(TWIN_CARD_EVENT_NAME)} · ${escapeXml(TWIN_CARD_EVENT_DATE)}</text>
  <rect x="186" y="385" width="828" height="828" rx="28" fill="#eefaff" stroke="#c9eaf5" stroke-width="5"/>
  ${
    avatar
      ? `<image x="186" y="385" width="828" height="828" preserveAspectRatio="xMidYMid slice" href="${avatar}"/>`
      : `<text x="600" y="900" text-anchor="middle" fill="#1177BA" font-family="Inter, Arial, sans-serif" font-size="300" font-weight="900">${escapeXml(lead.firstName.slice(0, 1).toUpperCase())}</text>`
  }
  <text x="600" y="1342" text-anchor="middle" fill="#061b38" font-family="Inter, Arial, sans-serif" font-size="112" font-weight="900">${escapeXml(lead.firstName)}</text>
  <text x="600" y="1415" text-anchor="middle" fill="#1177BA" font-family="Inter, Arial, sans-serif" font-size="48" font-weight="900">Health Twin Activated</text>
  <text x="600" y="1480" text-anchor="middle" fill="#35445d" font-family="Inter, Arial, sans-serif" font-size="38">Focus: ${escapeXml(lead.wellnessInterestLabel)}</text>
  <rect x="276" y="1588" width="648" height="76" rx="38" fill="#e9fbff" stroke="#c9eaf5" stroke-width="4"/>
  <text x="600" y="1638" text-anchor="middle" fill="#06254C" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="800">${escapeXml(lead.cardResultUrl)}</text>
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
