import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// Delivery copies of SC-056. The design library master remains unchanged.
const sourceRoot = path.resolve(process.argv[2] ?? "../vv-designs");
const source = "2026/ads/013-environment-backgrounds/provider-telepresence-v1/assets/provider-desktop-health-twin-v1.png";
const target = new URL("../public/brand/2026/futuristic/", import.meta.url);
const original = await readFile(path.join(sourceRoot, source));
const variants = [];
for (const [file, width] of [["provider-desktop-health-twin-v1.webp", 1774], ["provider-desktop-health-twin-v1-mobile.webp", 1100]]) {
  const encoded = await sharp(original).resize({ width }).webp({ quality: 88, effort: 6 }).toBuffer();
  await writeFile(new URL(file, target), encoded);
  const metadata = await sharp(encoded).metadata();
  variants.push({ file, width: metadata.width, height: metadata.height, bytes: encoded.length,
    sha256: createHash("sha256").update(encoded).digest("hex") });
}
await writeFile(new URL("provider-consultation-manifest.json", target), JSON.stringify({
  id: "SC-056", name: "Provider consultation — Desktop Health Twin", sourceRepository: "vv-designs", source,
  sourceSha256: createHash("sha256").update(original).digest("hex"),
  encoding: "WebP quality 88, complete source canvas; responsive CSS preserves the physician, both hands, full Health Twin and projection device; mobile frames the right 60% of the scene",
  variants,
}, null, 2) + "\n");
console.log(variants);
