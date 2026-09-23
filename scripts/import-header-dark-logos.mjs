import { copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const sourceRoot = process.argv[2];
if (!sourceRoot) throw new Error("Pass the VeeVee Logo Files directory as the first argument.");
const target = new URL("../public/brand/2026/", import.meta.url);
const assets = [
  {
    folder: "VeeVee Icon Logo/Dark Mode - Icon Logo - VeeVee",
    file: "VeeVee_IconLogo_DarkMode_TransparentBG.png",
    output: "icon-dark.webp", width: 256,
  },
  {
    folder: "VeeVee Wordmark Logo/Dark Mode - Wordmark Logo - VeeVee",
    file: "VeeVee_WordmarkLogo_DarkMode TransparentBG.png",
    output: "wordmark-dark.webp", width: 512,
  },
];

for (const asset of assets) {
  const source = path.join(sourceRoot, asset.folder, asset.file);
  // Keep supplied originals beside the existing logos; serve small transparent copies.
  await copyFile(source, new URL(asset.file, target));
  const info = await sharp(source).trim({ threshold: 1 }).resize({ width: asset.width })
    .webp({ lossless: true, effort: 6 }).toFile(fileURLToPath(new URL(asset.output, target)));
  console.log(`${asset.output}: ${info.width}x${info.height}, ${info.size} bytes`);
}
