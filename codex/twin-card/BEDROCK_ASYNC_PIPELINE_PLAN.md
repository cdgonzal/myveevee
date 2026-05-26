# Twin Card Async Bedrock Pipeline Plan

## Implementation State

Initial implementation is in place:

- API Lambda stores the run row and run JSON, then writes the source image to trigger the worker pipeline.
- S3 source-image events invoke `aws/twin-card/avatar-generator.mjs`.
- Avatar generator invokes the active Bedrock Stability provider-priority chain and writes a generated image, or writes a normalized-photo fallback image.
- S3 generated-image events invoke `aws/twin-card/print-composer.mjs`.
- Print composer writes a deterministic SVG print-frame artifact today.
- CDK wires both worker Lambdas, S3 event notifications, permissions, and CloudWatch alarms.

Current hardening gap: final Canon-native PNG/JPEG rendering is still a follow-up. The current compositor writes `selphy-cp1500-4x6.svg` so the print frame is deterministic without native Lambda image-rendering dependencies. Move to `sharp` or another Lambda-safe renderer when we need direct PNG/JPEG output from the worker.

## Decision

Move Twin Card image generation from the current synchronous API Lambda path to an event-driven AWS pipeline:

1. API Lambda validates the lead, stores the normalized source image, creates the DynamoDB run row, writes the run JSON, and returns quickly.
2. S3 `ObjectCreated` on the source image prefix invokes an avatar-generation Lambda.
3. The avatar-generation Lambda calls Amazon Bedrock with the configured Stability inference-profile provider priority and writes the generated image output back to S3.
4. S3 `ObjectCreated` on the generated-image prefix invokes a print-composition Lambda.
5. The print-composition Lambda frames/masks the generated image into the Canon SELPHY CP1500 print contract and writes the final print asset back to S3.

Use "generated image" or "model output image" for the Bedrock image result. Reserve "completion" for text/LLM-style responses.

## AWS Model Baseline

Use active Stability AI Image Services inference profiles through Amazon Bedrock Runtime `InvokeModel`.

Provider priority source of truth: `src/twinCard/avatarProviderContract.json`.

Default priority:

```text
us.stability.stable-image-control-structure-v1:0
us.stability.stable-style-transfer-v1:0
us.stability.stable-image-style-guide-v1:0
fallback_original_photo_card
```

Implementation notes:

- Use the `us.*` inference profile IDs. Do not call raw `stability.*` model IDs for this stack.
- Control Structure is the V1 primary avatar engine because it preserves source-photo structure while restyling the image.
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
- Call Bedrock Runtime `InvokeModel` with the provider priority chain.
- Save generated image output to `twin-card/{yyyy}/{mm}/{dd}/{cardId}/generated/avatar.png`.
- Update DDB:
  - `generationStatus = "completed"` on Bedrock success
  - `generationProvider = "stability_control_structure"` or the successful provider
  - `bedrockModelId = "<successful-provider-inference-profile-id>"`
  - `bedrockProviderPriority`
  - `bedrockProviderAttempts`
  - `generatedAvatarS3Key`
  - `generatedAvatarBytes`
  - `generatedAt`
- On recoverable Bedrock failure, write a failure artifact and either:
  - set `generationStatus = "fallback_used"`, `generationProvider = "fallback_original_photo_card"`, and copy the normalized photo to the generated prefix so print composition can continue, or
  - set `generationStatus = "failed"` if no usable image should be printed.

Expo recommendation: preserve the current resilient behavior and use `fallback_used` so booth printing continues when Bedrock fails.

### 3. Print Composition Lambda

New source path: `aws/twin-card/print-composer.mjs`.

Trigger:

- S3 `ObjectCreated` for `twin-card/generated/`.

Responsibilities:

- Load generated image output.
- Apply the print frame/mask contract.
- Export the final card to:
  - current MVP: `twin-card/{yyyy}/{mm}/{dd}/{cardId}/print/selphy-cp1500-4x6.svg`
  - next hardening pass: PNG/JPEG siblings for workflows that require raster files
- Update DDB:
  - `renderStatus = "rendered"`
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

Recommended print composition:

- Full-bleed branded background that can tolerate slight borderless crop.
- Avatar image masked into a consistent hero shape.
- VeeVee logo.
- SWCA brand/event line.
- Event text: `4th SWCA Medical Summit`.
- Findings, recommendations, doctor questions, and CTA selected from `src/twinCard/goalContentContract.json`.
- CTA: `Visit myveevee.com`.
- Optional QR code to `https://myveevee.com/swca/funnel` or the participant result page.
- No diagnosis, risk score, medical claim, or clinical interpretation.

## Prompt Contract

Bedrock avatar prompts should be generated server-side from controlled templates, not raw user text.

Example prompt shape:

```text
Create a polished, optimistic 2D wellness avatar inspired by the reference photo.
Friendly expression, clean healthcare-friendly style, warm lighting, modern blue
and white palette, premium event card look, no text, no logos, no diagnosis, no
medical equipment, no exaggerated features. The image should feel aspirational
and positive for a pain management and whole-body wellness experience.
```

Negative prompt themes:

```text
text, logo, watermark, medical diagnosis, hospital equipment, injury, illness,
scary, distorted face, extra limbs, low resolution, harsh shadows
```

## Status Alignment

Current source of truth: `src/twinCard/statusContract.json`.

Recommended additions before implementation:

- Add `submitted` to `generationStatus` for API-accepted source images waiting on the S3 trigger.
- Keep `generating` for the avatar-generation Lambda while Bedrock is running.
- Keep `completed` for Bedrock/Nova Canvas success.
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
- Final print image link
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
6. Partial: deterministic SVG frame is implemented in `aws/twin-card/print-composer.mjs`; source-of-truth goal content is now in `src/twinCard/goalContentContract.json`; a standalone visual frame/mask JSON contract is still recommended.
7. Done: add dashboard links/statuses for generated and print assets.
8. Deploy CDK.
9. Run one live booth test and verify:
   - DDB row moves through expected statuses
   - source image lands in S3
   - generated image lands in S3
   - final print asset lands in S3
   - dashboard shows all links and statuses

## Open Decisions

- Whether the final print QR points to the participant result page or `https://myveevee.com/swca/funnel`.
- Whether fallback should always proceed to print composition, or whether staff should explicitly approve fallback prints.
- Whether to render with `sharp` inside Lambda or a pure SVG/canvas renderer. Current MVP uses pure SVG output. Recommendation for final Canon-native files: use `sharp` in the print-composer Lambda for reliable 1200x1800 PNG/JPEG output.
- Whether to include an SWCA logo asset. If yes, store it as a static repo asset and package it with the print-composer Lambda.
- Whether to use direct S3 notifications only, or S3 notifications into SQS for better retry/backlog visibility. Recommendation for expo reliability: S3 -> SQS -> Lambda if time allows; direct S3 -> Lambda is acceptable for MVP.
