import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// Re-run explicitly when adopting new library revisions. Never edits the source library.
const sourceRoot = path.resolve(process.argv[2] ?? "../vv-designs");
const target = path.resolve("public/brand/2026/futuristic");
const theme = "2026/branding/themes/health-twin-2026/assets";
const avatars = "2026/asset-library/futuristic/nia-v2/assets";
const sources = [
  ["TH26-BG-01", `${theme}/master-background.png`, "luminous.webp"],
  ["TH26-BG-02", `${theme}/master-with-shadow.png`, "shadow.webp"],
  ["TH26-LOGO-01", `${theme}/veevee-futuristic-logo-v1.png`, "logo.webp"],
  ["AV-037", `${avatars}/pair-nia-futuristic-s1-v2.png`, "nia-input.webp"],
  ["AV-038", `${avatars}/single-avatar-nia-futuristic-s2-v2.png`, "nia-simulation.webp"],
  ["AV-039", `${avatars}/single-avatar-nia-futuristic-s3-v2.png`, "nia-results.webp"],
  ["TH26-ENV-03", "2026/ads/013-environment-backgrounds/futuristic-v1/assets/future-office-panorama-v1.png", "future-office.webp"],
  ["AV-047", "2026/asset-library/futuristic/theo-v2/assets/single-avatar-theo-futuristic-s3-v2.png", "theo-results.webp"],
];
const hash = (buffer) => createHash("sha256").update(buffer).digest("hex");
await mkdir(target, { recursive: true });
const assets = [];
for (const [id, source, filename] of sources) {
  const original = await readFile(path.join(sourceRoot, source));
  // Lossless encoding, full source dimensions, no crop, recoloring or new effects.
  const encoded = await sharp(original).webp({ lossless: true, effort: 6 }).toBuffer();
  const before = await sharp(original).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const after = await sharp(encoded).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  // Encoders may canonicalize RGB under fully transparent pixels; visible pixels must match exactly.
  if (before.data.length !== after.data.length) throw new Error(`${id}: dimensions changed`);
  for (let i = 0; i < before.data.length; i += 4) {
    if (before.data[i + 3] !== after.data[i + 3] || (before.data[i + 3] && !before.data.subarray(i, i + 3).equals(after.data.subarray(i, i + 3)))) {
      throw new Error(`${id}: visible pixel changed at ${i / 4}`);
    }
  }
  await writeFile(path.join(target, filename), encoded);
  assets.push({ id, source, file: filename, width: before.info.width, height: before.info.height,
    sourceSha256: hash(original), outputSha256: hash(encoded), bytes: encoded.length, visiblePixelsPreserved: true });
}
await writeFile(path.join(target, "manifest.json"), JSON.stringify({
  theme: "health-twin-2026", sourceRepository: "vv-designs", encoding: "lossless WebP, original dimensions and complete canvases",
  assets,
}, null, 2) + "\n");
console.log(assets.map(({ id, bytes }) => `${id}: ${Math.round(bytes / 1024)} KiB, visible pixels verified`).join("\n"));
