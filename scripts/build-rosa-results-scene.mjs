import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const source = "codex/creative/rosa-results/rosa-roadmap-scene-v3.png";
const root = new URL("../public/brand/2026/futuristic/", import.meta.url);
const original = await readFile(new URL(`../${source}`, import.meta.url));
const metadata = await sharp(original).metadata();
const variants = [];
for (const width of [null, 384, 768]) {
  const file = `rosa-roadmap-scene-v3${width ? `-${width}` : ""}.webp`;
  let pipeline = sharp(original);
  if (width) pipeline = pipeline.resize({ width });
  const output = await pipeline.webp({ quality: width ? 88 : 94, effort: 6 }).toBuffer();
  await writeFile(new URL(file, root), output);
  variants.push({ file, width: width ?? metadata.width, bytes: output.length, sha256: createHash("sha256").update(output).digest("hex") });
}
await writeFile(new URL("rosa-roadmap-scene-v3-manifest.json", root), JSON.stringify({
  source, sourceSha256: createHash("sha256").update(original).digest("hex"),
  generator: "built-in image_gen", prompt: "codex/creative/rosa-results/prompt-v3.txt",
  references: ["codex/creative/rosa-results/rosa-roadmap-scene-v2.png", "public/brand/2026/futuristic/rosa-results.webp"],
  width: metadata.width, height: metadata.height,
  description: "Rebuilt conceptual Results scene: Rosa walks forward across violet and cyan tiles toward a gold next step. The three glass tiles match the colors of her palm-projected roadmap.",
  variants,
}, null, 2) + "\n");
console.log({ width: metadata.width, height: metadata.height, variants });
