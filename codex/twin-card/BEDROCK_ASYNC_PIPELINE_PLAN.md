# Twin Card Async Bedrock Pipeline Plan

## Implementation State

Initial implementation is in place:

- API Lambda stores the run row and run JSON, then writes the source image to trigger the worker pipeline.
- S3 source-image events invoke `aws/twin-card/avatar-generator.mjs`.
- Avatar generator invokes the active provider-priority chain, starting with approved direct fal.ai image-edit providers, and writes a generated image or normalized-photo fallback image.
- S3 generated-image events invoke `aws/twin-card/print-composer.mjs`.
- Print composer writes a deterministic SVG print-frame artifact and a Canon SELPHY-ready PNG raster artifact.
- CDK wires both worker Lambdas, S3 event notifications, permissions, and CloudWatch alarms.

Current artifact split: `generated/avatar.*` is the AI avatar-generation output; `print/selphy-cp1500-4x6.svg` is the deterministic print-layout source; `print/selphy-cp1500-4x6.png` is the Canon SELPHY-ready 4x6 raster output. Keep these stages decoupled so avatar tuning does not require print-layout changes, and print-layout tuning does not require rerunning avatar generation.

## Decision

Move Twin Card image generation from the current synchronous API Lambda path to an event-driven AWS pipeline:

1. API Lambda validates the lead, stores the normalized source image, creates the DynamoDB run row, writes the run JSON, and returns quickly.
2. S3 `ObjectCreated` on the source image prefix invokes an avatar-generation Lambda.
3. The avatar-generation Lambda calls the configured provider priority, starting with direct fal.ai Nano Banana 2 Edit, and writes the generated image output back to S3.
4. S3 `ObjectCreated` on the generated-image prefix invokes a print-composition Lambda.
5. The print-composition Lambda frames/masks the generated image into the Canon SELPHY CP1500 print contract, saves the deterministic layout SVG, then renders the final 1200x1800 sRGB PNG for booth printing.

Use "generated image" or "model output image" for the avatar model result. Reserve "completion" for text/LLM-style responses.

## Production Avatar Model Baseline

Use the production provider priority in `src/twinCard/avatarProviderContract.json`.

Provider priority source of truth: `src/twinCard/avatarProviderContract.json`.
Avatar recipe source of truth: `src/twinCard/avatarRecipeContract.json`.

Default priority:

```text
fal-ai/nano-banana-2/edit
openai/gpt-image-2/edit
us.stability.stable-image-control-structure-v1:0
us.stability.stable-style-transfer-v1:0
us.stability.stable-image-style-guide-v1:0
fallback_original_photo_card
```

Implementation notes:

- `fal-ai/nano-banana-2/edit` is the approved production primary avatar engine as of 2026-05-27.
- `openai/gpt-image-2/edit` through fal.ai is the approved production secondary provider.
- The avatar Lambda reads the fal.ai API key from Secrets Manager secret `/myveevee/twin-card/fal-key`; do not hardcode or commit provider keys.
- fal.ai calls use a short-lived presigned S3 URL for `source/normalized.jpg` and save the generated output to the existing `generated/avatar.png` path.
- Use the `us.*` inference profile IDs. Do not call raw `stability.*` model IDs for this stack.
- Bedrock Control Structure is now a fallback avatar engine because it preserves source-photo structure while restyling the image.
- Style Transfer requires a configured VeeVee style reference image in S3.
- Style Guide is tertiary for brand consistency.
- `amazon.nova-canvas-v1:0` and `amazon.titan-image-generator-v2:0` are legacy in the production model list; Nova Canvas was denied during live testing.

Reference:

- https://docs.aws.amazon.com/bedrock/latest/userguide/stable-image-services.html

## Proposed S3 Partition Contract

All objects stay under the existing private Twin Card bucket and `twin-card/` prefix.

```text
twin-card/
  {yyyy}/{mm}/{dd}/{cardId}/
    run.json
    source/
      normalized.jpg
    generated/
      avatar.png
      avatar.jpg
    print/
      selphy-cp1500-4x6.svg
      selphy-cp1500-4x6.png
      selphy-cp1500-4x6.jpg
    failures/
      {stage}.json
```

Use date partitions for booth operations and future lifecycle policies. Keep each card run in a stable `{cardId}` folder so dashboard links, support review, and cleanup are simple.

Important trigger rule: S3 triggers must avoid recursion. The source trigger watches `twin-card/` with suffix `/source/normalized.jpg`; the print composer watches `twin-card/` with suffix `/generated/avatar.png` and `/generated/avatar.jpg`. Neither Lambda writes back into the suffix that triggered it.

## Lambda Responsibilities

### 1. API Lambda

Current file: `aws/twin-card/handler.mjs`.

Future behavior:

- Validate lead, consent, source image payload, and upload contract.
- Write source image to `twin-card/{yyyy}/{mm}/{dd}/{cardId}/source/normalized.jpg`.
- Write run JSON to `twin-card/{yyyy}/{mm}/{dd}/{cardId}/run.json`.
- Create/update DynamoDB row:
  - `generationStatus = "submitted"`
  - `renderStatus = "not_started"`
  - `fulfillmentStatus = "not_printed"`
  - `sourceImageS3Key`
  - `runS3Key`
  - lead/contact/consent/goal/language/upload metadata
- Return accepted run details to the frontend.

### 2. Avatar Generation Lambda

New source path: `aws/twin-card/avatar-generator.mjs`.

Trigger:

- S3 `ObjectCreated` for `twin-card/source/`.

Responsibilities:

- Parse `{cardId}` from the S3 key or load the run JSON by convention.
- Load DDB row and source object.
- Update DDB `generationStatus = "generating"`.
- Call the provider priority chain:
  - direct fal.ai Nano Banana 2 Edit
  - direct fal.ai GPT Image 2 Edit
  - Bedrock Stability fallback providers
  - normalized-photo fallback
- Save generated image output to `twin-card/{yyyy}/{mm}/{dd}/{cardId}/generated/avatar.png`.
- Update DDB:
  - `generationStatus = "completed"` on model success
  - `generationProvider = "fal_ai"`, `stability_control_structure`, or the successful provider
  - `bedrockModelId = "<successful-provider-id>"` for legacy dashboard/run compatibility
  - `bedrockProviderPriority`
  - `bedrockProviderAttempts`
  - `generatedAvatarS3Key`
  - `generatedAvatarBytes`
  - `generatedAt`
- On recoverable model failure, write a failure artifact and either:
  - set `generationStatus = "fallback_used"`, `generationProvider = "fallback_original_photo_card"`, and copy the normalized photo to the generated prefix so print composition can continue, or
  - set `generationStatus = "failed"` if no usable image should be printed.

Expo recommendation: preserve the current resilient behavior and use `fallback_used` so booth printing continues when model generation fails.

### 3. Print Composition Lambda

New source path: `aws/twin-card/print-composer.mjs`.

Trigger:

- S3 `ObjectCreated` for `twin-card/generated/`.

Responsibilities:

- Load generated image output.
- Apply the print frame/mask contract.
- Export the print artifacts to:
  - `twin-card/{yyyy}/{mm}/{dd}/{cardId}/print/selphy-cp1500-4x6.svg` as the deterministic layout/review source
  - `twin-card/{yyyy}/{mm}/{dd}/{cardId}/print/selphy-cp1500-4x6.png` as the Canon SELPHY-ready raster print output
- Update DDB:
  - `renderStatus = "rendered"`
  - `printLayoutS3Key`
  - `printLayoutBytes`
  - `printImageS3Key`
  - `printImageBytes`
  - `renderedAt`
- On render failure, write `twin-card/{yyyy}/{mm}/{dd}/{cardId}/failures/render.json` and set `renderStatus = "render_failed"`.

## Print Frame Contract

The final print asset must remain aligned with `src/twinCard/printContract.json`:

- 4x6 / Postcard portrait
- 1200x1800 px
- 300 DPI
- sRGB
- Borderless
- 60 px safe margin

Frame composition should be deterministic and not model-generated. The AI model should generate only the avatar/image. The renderer owns all print-safe text, branding, QR, and layout.

Current renderer note: `aws/twin-card/print-composer.mjs` uses `sharp` to render the SVG layout into the 1200x1800 PNG. The CDK construct installs the Linux ARM64 `sharp` package during bundling so local Windows synth output does not accidentally ship a Windows-native `sharp` binary to Lambda.

Current print composition:

- White 4x6 portrait frame matching the marketing sample direction.
- Top event line: `2026 • 4th SWCA Medical Summit Edition`.
- Large title treatment: `Meet Your Digital Health Twin`.
- Generated avatar masked into the left image well, with participant first name overlaid at the bottom-left of the image.
- Provided VeeVee SVG logo assets below the avatar well. The assets live in `aws/twin-card/assets/` and are embedded into the bundled print Lambda so production rendering does not depend on desktop file paths.
- Right column with `GOAL`, the selected goal title, one short wellness finding, and two short next steps from `src/twinCard/goalContentContract.json`.
- Footer line with the provided SWCA vector logo asset and `Spine and Wellness Centers of America` wordmark treatment.
- No custom font files, no diagnosis, no risk score, no medical claim, and no clinical interpretation.

## Prompt Contract

Bedrock avatar prompts should be generated server-side from controlled templates, not raw user text.

Current recipe: `twin-card-avatar-recipe-v2` / `identity-preserving-v2`.

The recipe now optimizes for likeness before style:

- Say "same person shown in the reference photo," not merely "inspired by the reference photo."
- Preserve face shape, hair color/style, skin tone, age impression, eyewear, facial hair, head angle, pose, framing, and expression.
- Explicitly reject changed identity, changed face, changed hairstyle, removed/added glasses, and overly glam beauty-filter output.
- Keep marketing copy out of the avatar prompt; final text belongs in the print-composer frame.
- Record `avatarRecipeId` and `avatarRecipeVersion` in the DynamoDB row and run JSON for traceability.
- Use `aws/twin-card/replay-avatar-recipe.mjs` to replay the latest existing source photos through the current recipe without submitting the full expo funnel again.

Prompt shape:

```text
Create a polished 2D wellness avatar of the same person shown in the reference photo.
Preserve recognizable identity and likeness: face shape, hair color, hair style,
skin tone, age impression, eyewear, facial hair if present, head angle, pose,
framing, and natural expression. Do not invent a new person.
```

Negative prompt themes:

```text
different person, changed identity, changed face, changed hairstyle,
different hair color, removed glasses, added glasses, different age,
beauty filter, overly glam, text, logo, watermark, distorted face
```

## Status Alignment

Current source of truth: `src/twinCard/statusContract.json`.

Recommended additions before implementation:

- Add `submitted` to `generationStatus` for API-accepted source images waiting on the S3 trigger.
- Keep `generating` for the avatar-generation Lambda while Bedrock is running.
- Keep `completed` for Bedrock/Stability success.
- Keep `fallback_used` for printable normalized-photo fallback.
- Keep `failed` for no usable card.
- Add `renderStatus` as a separate field:
  - `not_started`
  - `rendering`
  - `rendered`
  - `render_failed`
- Keep `fulfillmentStatus` as the separate booth/email field:
  - `not_printed`
  - `printed`
  - `email_pending`
  - `emailed`
  - `email_failed`

This separation matters because avatar generation, print rendering, and booth fulfillment are different stages. Do not overload `generationStatus` to mean printed or framed.

## CDK Resources To Add

In `infra/lib/twin-card-activation.ts`:

- Keep the existing API Lambda.
- Add `avatarGeneratorFunction`.
- Add `printComposerFunction`.
- Add S3 event notifications:
  - `source/` prefix to avatar generator
  - `generated/` prefix to print composer
- Grant:
  - source read to avatar generator
  - generated write to avatar generator
  - generated read to print composer
  - print write to print composer
  - DDB read/write to both worker Lambdas
  - `bedrock:InvokeModel` to avatar generator only
- Add CloudWatch alarms for each worker Lambda.
- Consider DLQ/SQS if we need retry visibility beyond Lambda async retry behavior.

## Dashboard Updates

The dashboard should show each stage separately:

- Lead captured
- Source image stored
- Avatar generation status
- Print render status
- Fulfillment status
- Source image link
- Generated image link
- Print layout SVG link
- Final Canon print PNG link
- Run JSON link
- Failure artifact link, if present

Operational badge rule:

- Printable when `generationStatus` is `completed` or `fallback_used` and `renderStatus` is `rendered`.
- Needs attention when `generationStatus` is `failed` or `renderStatus` is `render_failed`.

## Implementation Order

1. Done: update `statusContract.json` with `submitted` and `renderStatus`.
2. Done: update DDB/API serialization and dashboard to show generation, render, and fulfillment separately.
3. Done: change API Lambda to source-write plus accepted response; remove inline Bedrock call.
4. Done: add avatar-generator Lambda and S3 trigger.
5. Done: add print-composer Lambda and S3 trigger.
6. Done: deterministic SVG frame and Canon-ready PNG raster output are implemented in `aws/twin-card/print-composer.mjs`; source-of-truth goal content is in `src/twinCard/goalContentContract.json`; the printer artifact contract is in `src/twinCard/printContract.json`.
7. Done: add dashboard links/statuses for generated and print assets.
8. Done: deploy CDK to production account `767828748348` / `us-east-1`.
9. Done: run live booth tests from iPad and mobile and verify:
   - DDB row moves through expected statuses
   - source image lands in S3
   - generated image lands in S3
   - final print asset lands in S3
   - dashboard shows all links and statuses
10. Done: add replay/model-evaluation visibility for external providers without altering participant runs:
   - replay artifacts write under `twin-card-replay/`
   - replay rows write to DynamoDB with `recordType = replay` and `cardId` starting with `replay#`
   - `/twin-dashboard` Image Review groups the latest three replay sources into Raw Capture, Nano Banana 2 Edit, and GPT Image 2 Edit columns
   - dashboard cost summary separates Bedrock, fal.ai, and total tracked model costs

## Open Decisions

- Whether the final print QR points to the participant result page or `https://myveevee.com/swca/funnel`.
- Whether fallback should always proceed to print composition, or whether staff should explicitly approve fallback prints.
- Whether to include an SWCA logo asset. Resolved: the provided SWCA Illustrator/PDF-compatible source was converted into `aws/twin-card/assets/swca-logo-vector-whitebg.svg` and embedded into the print-composer Lambda bundle.
- Whether to use direct S3 notifications only, or S3 notifications into SQS for better retry/backlog visibility. Recommendation for expo reliability: S3 -> SQS -> Lambda if time allows; direct S3 -> Lambda is acceptable for MVP.
- Whether to keep Bedrock Stability fallbacks in the production priority after Nano/GPT reliability is proven under booth traffic.
