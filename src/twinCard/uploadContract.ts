import contract from "./uploadContract.json";

export const TWIN_CARD_UPLOAD_CONTRACT = contract;

export type TwinCardImageUpload = {
  originalFileName: string;
  originalFileType: string;
  originalFileBytes: number;
  originalWidthPx: number;
  originalHeightPx: number;
  normalizedWidthPx: number;
  normalizedHeightPx: number;
  normalizedMimeType: string;
  normalizedBytesEstimate: number;
  contractId: string;
};
