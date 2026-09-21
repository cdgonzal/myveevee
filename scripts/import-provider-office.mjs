import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// Delivery copies of TH26-ENV-09. The design library master remains unchanged.
const sourceRoot = path.resolve(process.argv[2] ?? "../vv-designs");
const source = "2026/ads/013-environment-backgrounds/healthcare-futuristic-v1/assets/future-doctors-office-panorama-v3.png";
const target = new URL("../public/brand/2026/futuristic/", import.meta.url);
const original = await readFile(path.join(sourceRoot, source));
const variants = [];
for (const [file, width] of [["future-medical-office.webp", 1942], ["future-medical-office-mobile.webp", 1100]]) {
  const encoded = await sharp(original).resize({ width }).webp({ quality: 88, effort: 6 }).toBuffer();
  await writeFile(new URL(file, target), encoded);
  const metadata = await sharp(encoded).metadata();
  variants.push({ file, width: metadata.width, height: metadata.height, bytes: encoded.length,
    sha256: createHash("sha256").update(encoded).digest("hex") });
}
await writeFile(new URL("medical-office-manifest.json", target), JSON.stringify({
  id: "TH26-ENV-09", name: "Future Doctor’s Office — Central Park", sourceRepository: "vv-designs", source,
  sourceSha256: createHash("sha256").update(original).digest("hex"),
  encoding: "WebP quality 88, complete source canvas; responsive CSS frames the medical desk on the right",
  variants,
}, null, 2) + "\n");
console.log(variants);
