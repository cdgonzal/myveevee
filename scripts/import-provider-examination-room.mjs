import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const sourceRoot = path.resolve(process.argv[2] ?? "../vv-designs");
const source = "2026/ads/013-environment-backgrounds/healthcare-futuristic-v1/assets/future-examination-room-panorama-v3.png";
const target = new URL("../public/brand/2026/futuristic/", import.meta.url);
const original = await readFile(path.join(sourceRoot, source));
const file = "future-examination-room.webp";
const encoded = await sharp(original).webp({ quality: 88, effort: 6 }).toBuffer();
await writeFile(new URL(file, target), encoded);
const metadata = await sharp(encoded).metadata();
await writeFile(new URL("examination-room-manifest.json", target), JSON.stringify({
  name: "Future Examination Room",
  sourceRepository: "vv-designs", source,
  sourceSha256: createHash("sha256").update(original).digest("hex"),
  encoding: "WebP quality 88, complete source canvas; CSS crops to cover the provider contact section",
  variants: [{ file, width: metadata.width, height: metadata.height, bytes: encoded.length,
    sha256: createHash("sha256").update(encoded).digest("hex") }],
}, null, 2) + "\n");
console.log(`${file}: ${metadata.width}x${metadata.height}, ${encoded.length} bytes`);
