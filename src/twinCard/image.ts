import { TWIN_CARD_UPLOAD_CONTRACT, type TwinCardImageUpload } from "./uploadContract";

export type TwinCardPreparedImage = {
  dataUrl: string;
  upload: TwinCardImageUpload;
};

export async function fileToTwinCardImageDataUrl(file: File) {
  const prepared = await fileToTwinCardPreparedImage(file);
  return prepared.dataUrl;
}

export async function fileToTwinCardPreparedImage(file: File): Promise<TwinCardPreparedImage> {
  if (file.size > TWIN_CARD_UPLOAD_CONTRACT.sourceUpload.maxOriginalFileBytes) {
    throw new Error("Image file is too large.");
  }

  const rawDataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(rawDataUrl);
  const width = TWIN_CARD_UPLOAD_CONTRACT.normalizedImage.widthPx;
  const height = TWIN_CARD_UPLOAD_CONTRACT.normalizedImage.heightPx;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Image canvas could not be created.");
  }

  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  const drawX = (width - drawWidth) / 2;
  const drawY = (height - drawHeight) / 2;

  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  const dataUrl = canvas.toDataURL(
    TWIN_CARD_UPLOAD_CONTRACT.normalizedImage.mimeType,
    TWIN_CARD_UPLOAD_CONTRACT.normalizedImage.jpegQuality
  );

  if (dataUrl.length > TWIN_CARD_UPLOAD_CONTRACT.normalizedImage.maxDataUrlBytes) {
    throw new Error("Normalized image payload is too large.");
  }

  return {
    dataUrl,
    upload: {
      originalFileName: file.name,
      originalFileType: file.type,
      originalFileBytes: file.size,
      originalWidthPx: image.naturalWidth,
      originalHeightPx: image.naturalHeight,
      normalizedWidthPx: width,
      normalizedHeightPx: height,
      normalizedMimeType: TWIN_CARD_UPLOAD_CONTRACT.normalizedImage.mimeType,
      normalizedBytesEstimate: Math.ceil((dataUrl.length * 3) / 4),
      contractId: TWIN_CARD_UPLOAD_CONTRACT.id,
    },
  };
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}
