import contract from "./printContract.json";

export const TWIN_CARD_PRINT_CONTRACT = contract;

export const TWIN_CARD_PREVIEW_WIDTH_PX = 360;
export const TWIN_CARD_PREVIEW_HEIGHT_PX =
  (TWIN_CARD_PREVIEW_WIDTH_PX * TWIN_CARD_PRINT_CONTRACT.artwork.heightPx) /
  TWIN_CARD_PRINT_CONTRACT.artwork.widthPx;

export function buildTwinCardPrintCss() {
  const { widthIn, heightIn } = TWIN_CARD_PRINT_CONTRACT.paper;

  return `
@media print {
  body * { visibility: hidden !important; }
  .twin-card-print-area, .twin-card-print-area * { visibility: visible !important; }
  .twin-card-print-area {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: ${widthIn}in !important;
    height: ${heightIn}in !important;
    box-shadow: none !important;
  }
  @page { size: ${widthIn}in ${heightIn}in; margin: 0; }
}
`;
}
