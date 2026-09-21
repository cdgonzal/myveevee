import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const source = "codex/creative/nia-simulation/vitruvian-nia-v1.png";
const root = new URL("../public/brand/2026/futuristic/", import.meta.url);
const original = await readFile(new URL(`../${source}`, import.meta.url));
const metadata = await sharp(original).metadata();
if (!metadata.hasAlpha) throw new Error("Nia simulation artwork must preserve transparency");
const variants = [];
for (const width of [null, 384, 768]) {
  const file = `vitruvian-nia-v1${width ? `-${width}` : ""}.webp`;
  let pipeline = sharp(original);
  if (width) pipeline = pipeline.resize({ width });
  const output = await pipeline.webp(width ? { quality: 88, alphaQuality: 100, effort: 6 } : { lossless: true, effort: 6 }).toBuffer();
  await writeFile(new URL(file, root), output);
  variants.push({ file, width: width ?? metadata.width, bytes: output.length, sha256: createHash("sha256").update(output).digest("hex") });
}
await writeFile(new URL("vitruvian-nia-v1-manifest.json", root), JSON.stringify({
  source, sourceSha256: createHash("sha256").update(original).digest("hex"),
  generator: "built-in image_gen", prompt: "codex/creative/nia-simulation/prompt-v1.txt",
  width: metadata.width, height: metadata.height, alphaPreserved: true,
  description: "Nia in an anatomical Vitruvian simulation pose, complete figure and ring on transparency; conceptual artwork.",
  variants,
}, null, 2) + "\n");
console.log(variants);
