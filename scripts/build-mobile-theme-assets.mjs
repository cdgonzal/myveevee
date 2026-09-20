import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { writeFile } from "node:fs/promises";

const root = new URL("../public/brand/2026/futuristic/", import.meta.url);
const variants = [];
// Delivery copies only: the approved full-resolution masters remain unchanged.
for (const name of ["nia-results", "theo-results", "theo-input"]) {
  for (const width of [384, 768]) {
    const file = `${name}-${width}.webp`;
    const info = await sharp(fileURLToPath(new URL(`${name}.webp`, root)))
      .resize({ width }).webp({ quality: 88, alphaQuality: 100, effort: 6 })
      .toFile(fileURLToPath(new URL(file, root)));
    variants.push({ file, source: `${name}.webp`, ...info });
  }
}
// Scene 2 in the library's continuity proof: the middle third of 1942 x 809.
const officeFile = "future-office-mobile.webp";
const info = await sharp(fileURLToPath(new URL("future-office.webp", root)))
  .extract({ left: 647, top: 0, width: 648, height: 809 })
  .webp({ quality: 88, effort: 6 })
  .toFile(fileURLToPath(new URL(officeFile, root)));
variants.push({ file: officeFile, source: "future-office.webp", crop: { left: 647, top: 0, width: 648, height: 809 }, ...info });
await writeFile(new URL("mobile-manifest.json", root), JSON.stringify({ quality: 88, variants }, null, 2) + "\n");
console.log(variants.map(({ file, size }) => `${file}: ${(size / 1024).toFixed(1)} KiB`).join("\n"));
