# Twin Card Operations Runbook

This is the booth-support source of truth for checking the Twin Card AWS backend after Amplify deploys the frontend from `main`.

## Live Surfaces

- Funnel: `https://myveevee.com/swca/funnel`
- Twin Card page: `https://myveevee.com/twin-card`
- Operations dashboard: `https://myveevee.com/twin-dashboard`
- Dashboard PIN: `5353`

## AWS Baseline

Use the repo AWS baseline before running AWS commands:

```powershell
$env:AWS_CONFIG_FILE="$env:USERPROFILE\.aws\config"
$env:AWS_SHARED_CREDENTIALS_FILE="$env:USERPROFILE\.aws\credentials"
$env:AWS_PROFILE="glue-admin"
$env:AWS_REGION="us-east-1"
```

Confirm the account before changing or inspecting production resources:

```powershell
aws sts get-caller-identity --profile glue-admin --region us-east-1
```

Expected production account: `767828748348`.

Do not use default AWS credentials for CDK. The local default account has previously resolved to `449164402570`, which is not the production Twin Card target. `infra/bin/myveevee-infra.ts` now refuses to synth/deploy this stack for any account other than `767828748348` unless `MYVEEVEE_AWS_ACCOUNT` is intentionally overridden.

## CDK Outputs

The stack is `MyVeeVeeInfraStack`.

List the Twin Card outputs:

```powershell
aws cloudformation describe-stacks `
  --stack-name MyVeeVeeInfraStack `
  --profile glue-admin `
  --region us-east-1 `
  --query "Stacks[0].Outputs[?contains(OutputKey, 'TwinCard')].[OutputKey,OutputValue]" `
  --output table
```

Important outputs:

- `TwinCardActivationTwinCardApiEndpoint...`: set as Amplify `main` env var `VITE_TWIN_CARD_API_URL`.
- `TwinCardActivationTwinCardAdminApiEndpoint...`: backend admin-list endpoint used by `/twin-dashboard`.
- `TwinCardActivationTwinCardCardsBucketName...`: private S3 image bucket.
- `TwinCardActivationTwinCardCardsTableName...`: DynamoDB run table.

Current production endpoint:

```text
VITE_TWIN_CARD_API_URL=https://kt51f0edy2.execute-api.us-east-1.amazonaws.com/twin-card/cards
```

If `TwinCardApiEndpoint` changes, update `VITE_TWIN_CARD_API_URL` in Amplify `main`, then redeploy Amplify.

## Lambda Logs

Tail the API Lambda while submitting the form:

```powershell
aws logs tail /aws/lambda/myveevee-twin-card-handler `
  --since 30m `
  --follow `
  --profile glue-admin `
  --region us-east-1
```

Tail the avatar-generation worker after the source image lands in S3:

```powershell
aws logs tail /aws/lambda/myveevee-twin-card-avatar-generator `
  --since 30m `
  --follow `
  --profile glue-admin `
  --region us-east-1
```

Tail the print-composition worker after the generated avatar lands in S3:

```powershell
aws logs tail /aws/lambda/myveevee-twin-card-print-composer `
  --since 30m `
  --follow `
  --profile glue-admin `
  --region us-east-1
```

Recent log events without following:

```powershell
aws logs filter-log-events `
  --log-group-name /aws/lambda/myveevee-twin-card-avatar-generator `
  --start-time ([DateTimeOffset]::UtcNow.AddMinutes(-30).ToUnixTimeMilliseconds()) `
  --profile glue-admin `
  --region us-east-1 `
  --query "events[].message" `
  --output text
```

## Alarms

Check Twin Card alarm state:

```powershell
aws cloudwatch describe-alarms `
  --alarm-names `
    myveevee-twin-card-handler-errors `
    myveevee-twin-card-avatar-generator-errors `
    myveevee-twin-card-print-composer-errors `
    myveevee-twin-card-api-5xx `
  --profile glue-admin `
  --region us-east-1 `
  --query "MetricAlarms[].{Name:AlarmName,State:StateValue,Reason:StateReason}" `
  --output table
```

Any `ALARM` state during an expo test means check the matching Lambda log group first.

## Run Storage Contract

Each card run is stored under:

```text
twin-card/{yyyy}/{mm}/{dd}/{cardId}/
```

Expected objects:

- `run.json`
- `source/normalized.jpg`
- `generated/avatar.png` or `generated/avatar.jpg`
- `print/selphy-cp1500-4x6.svg`
- `print/selphy-cp1500-4x6.png`
- `failures/{stage}.json`, only when a stage fails

The DynamoDB table is:

```text
myveevee-twin-card-cards
```

The S3 bucket name is account and region specific:

```text
myveevee-twin-card-767828748348-us-east-1
```

## Check S3 For A Run

If the dashboard shows a `cardId`, use the date and card id to inspect its prefix:

```powershell
$cardId="<card-id>"
$date="2026/05/29"
$bucket="myveevee-twin-card-767828748348-us-east-1"
$prefix="twin-card/$date/$cardId/"

aws s3 ls "s3://$bucket/$prefix" `
  --recursive `
  --profile glue-admin `
  --region us-east-1
```

Fetch the run JSON:

```powershell
aws s3 cp "s3://$bucket/$prefix/run.json" - `
  --profile glue-admin `
  --region us-east-1
```

Check for failure artifacts:

```powershell
aws s3 ls "s3://$bucket/$prefix/failures/" `
  --profile glue-admin `
  --region us-east-1
```

## Check DynamoDB

Fetch one known card:

```powershell
aws dynamodb get-item `
  --table-name myveevee-twin-card-cards `
  --key "{\"cardId\":{\"S\":\"<card-id>\"}}" `
  --profile glue-admin `
  --region us-east-1 `
  --output json
```

Scan recent records when a card id is unknown:

```powershell
aws dynamodb scan `
  --table-name myveevee-twin-card-cards `
  --limit 20 `
  --profile glue-admin `
  --region us-east-1 `
  --query "Items[].{cardId:cardId.S,createdAt:createdAt.S,firstName:firstName.S,contactType:contactType.S,generation:generationStatus.S,render:renderStatus.S,fulfillment:fulfillmentStatus.S,email:emailStatus.S,betaSurvey:betaSurveyStatus.S,betaAnswers:betaSurveyAnswerCount.N,source:sourceImageS3Key.S,avatar:generatedAvatarS3Key.S,layout:printLayoutS3Key.S,print:printImageS3Key.S}" `
  --output table
```

Use `/twin-dashboard` first during booth operations. Use DynamoDB directly only when the dashboard looks stale or incomplete.

## Dashboard Review Surface

`/twin-dashboard` is the current operations review surface after entering PIN `5353`.

The header shows:

- Run counts: total runs, replays, print-ready rows, AI-complete rows, photo fallback rows, and consented rows.
- `Tracked Cost`: separate Bedrock model cost, fal.ai replay/model cost, and the combined tracked model total.

The `Runs` tab shows recent DDB rows and S3/presigned artifact links. The `Image Review` tab shows the latest three replay source images in one row each, with columns for:

- Raw Capture
- Nano Banana 2 Edit
- GPT Image 2 Edit

Each image column shows brief cost/time metrics by default. Open the details chevron for model id, provider, request id, usage, bytes, and S3 key. Replay rows are marked by `recordType = replay` and `cardId` values that start with `replay#`; do not treat them as booth participant runs.

## Avatar Provider Contract

Source of truth: `src/twinCard/avatarProviderContract.json`.
Avatar recipe source of truth: `src/twinCard/avatarRecipeContract.json`.
Bedrock usage/cost source of truth: `src/twinCard/bedrockUsageContract.json`.

Default provider priority:

```text
fal-ai/nano-banana-2/edit
openai/gpt-image-2/edit
us.stability.stable-image-control-structure-v1:0
us.stability.stable-style-transfer-v1:0
us.stability.stable-image-style-guide-v1:0
fallback_original_photo_card
```

Nano Banana 2 Edit and GPT Image 2 Edit are approved production providers through direct fal.ai. The avatar-generator Lambda reads the fal key from Secrets Manager secret `/myveevee/twin-card/fal-key`; do not hardcode or commit this key.

The `us.*` Stability IDs are active Bedrock inference profile IDs used as fallback providers. The Lambda must call the inference profile ID, not the raw `stability.*` model ID.

## Model Usage And Cost Contract

Image models do not return text-token counts for these image calls. Twin Card records the provider's billing unit instead of token counts.

Production fal.ai usage:

- `fal-ai/nano-banana-2/edit`: currently `$0.08` per `images` unit from fal pricing API.
- `openai/gpt-image-2/edit`: currently `$1` per `units` unit from fal pricing API.
- The Lambda records `x-fal-request-id`, `x-fal-billable-units`, latency, unit price, estimated cost, provider audit metadata, generated bytes, and model id in the DDB row/run JSON.

Current standard on-demand prices verified from the AWS Bedrock pricing page on 2026-05-26:

- Stable Image Control Structure: `$0.07` per generation.
- Stable Image Style Guide: `$0.07` per generation.
- Stable Image Style Transfer: `$0.08` per generation.
- `fallback_original_photo_card`: `$0.00` Bedrock model cost because no Bedrock call is made.

Production stores this on each completed run:

- `bedrockProviderAttempts[].usage`: per-attempt model id, billing unit, billable units, unit price, estimated cost, pricing source, and verification date.
- `bedrockUsage`: legacy field name for run-level model usage. For production fal.ai runs, this stores fal.ai billing provider, units, and estimated cost. For Bedrock fallback runs, it stores Bedrock billing provider, generations, and estimated cost.

This is an estimate for image model inference only. It intentionally excludes Lambda, S3, DynamoDB, API Gateway, CloudWatch, Secrets Manager, and data-transfer charges.

Use `/twin-dashboard` to see per-run model usage and the header split for Bedrock, fal.ai, and total tracked model cost. Use the DDB row or `run.json` when auditing exact stored values.

Provider behavior:

- Nano Banana 2 Edit is the primary avatar engine.
- GPT Image 2 Edit is the secondary avatar engine.
- Control Structure is the first Bedrock fallback avatar engine.
- Style Transfer is skipped unless `AVATAR_STYLE_REFERENCE_S3_KEY` is configured by CDK parameter `TwinCardAvatarStyleReferenceS3Key`.
- Style Guide is the tertiary Bedrock provider.
- `fallback_original_photo_card` copies the normalized uploaded photo into the generated-image prefix and sets `generationStatus=fallback_used`.

Do not default back to `amazon.nova-canvas-v1:0`; Bedrock denied it in production because it is legacy for this account. Do not move to `amazon.titan-image-generator-v2:0` as the next default; it is also legacy in the production model list.

The avatar-generator Lambda role must keep these permissions:

```text
secretsmanager:GetSecretValue on /myveevee/twin-card/fal-key
bedrock:InvokeModel
aws-marketplace:ViewSubscriptions
aws-marketplace:Subscribe
aws-marketplace:Unsubscribe
```

If Control Structure returns a Marketplace subscription or authorization error, confirm the deployed Lambda role still has the Marketplace actions and retry after a short propagation delay.

Current avatar recipe:

- `avatarRecipeId`: `twin-card-avatar-recipe-v2`
- `avatarRecipeVersion`: `identity-preserving-v2`

The recipe prioritizes likeness over heavy restyling. It tells the model to preserve the same person's face shape, hair, skin tone, eyewear, facial hair, pose, framing, and expression. Control Structure uses higher structure control and no aggressive style preset. If marketing reports that avatars still do not resemble the uploaded photo, first inspect `bedrockProviderAttempts`, `avatarRecipeVersion`, and the source/generated image pair in `/twin-dashboard`, then tune the recipe contract before changing the print frame.

## Expected Status Flow

Normal async path:

```text
submitted -> generating -> completed
renderStatus: not_started -> rendering -> rendered
fulfillmentStatus: not_printed
emailStatus: pending -> sent
```

The print-composer Lambda sends the customer SES email only after it creates the Canon-ready PNG. The email contains the durable result-page link, not a presigned S3 URL or attachment. Delivery is skipped when consent is missing, `SES_FROM_EMAIL` is not configured, or the contact is not a valid email address. Email audit fields are `emailStatus`, `emailChannel`, `emailQueuedAt`, `emailSentAt`, `emailMessageId`, `emailFailedAt`, `emailSkippedAt`, and `emailSkipReason`.

Fallback path:

```text
fallback_used
renderStatus: rendered
```

For `fallback_used`, check the DDB fields `bedrockProviderPriority`, `bedrockProviderAttempts`, and the S3 artifact `failures/avatar-generation.json` to see which providers failed or were skipped.

Failure path:

```text
generationStatus: failed
or
renderStatus: render_failed
```

If a record is stuck at `submitted`, check whether `source/normalized.jpg` exists and then check the avatar-generator Lambda logs.

If a record is stuck at `completed` with `renderStatus=not_started`, check whether `generated/avatar.*` exists and then check the print-composer Lambda logs.

## Live Smoke Test

1. Open `https://myveevee.com/swca/funnel`.
2. Complete the one-way funnel with a real camera capture.
3. Open `https://myveevee.com/twin-dashboard`.
4. Enter PIN `5353`.
5. Confirm the new row appears.
6. Confirm source image, generated avatar, run JSON, print layout SVG, and Canon print PNG links populate.
7. Confirm S3 contains the expected prefix and objects.
8. Confirm DynamoDB has the same `cardId` and final statuses.
9. Confirm `emailStatus=sent` for an email contact and confirm the email opens the `/twin-card/result/{cardId}` page.
10. Confirm all Twin Card alarms are `OK`.

## Beta Survey Follow-Up

The emailed result page sends `Get More Personalized` clicks to `/twin-card/personalize/{cardId}`. The survey is progressive:

- Core beta/contact/health signal block.
- Optional product/AI trust block.
- Optional pricing/access block.

Each completed block writes to the same DynamoDB card row and refreshes `run.json` under `betaSurvey*` fields. Operators can check `betaSurveyStatus`, `betaSurveyStage`, `betaSurveyAnswerCount`, `betaSurveyUpdatedAt`, `betaSurveySubmittedAt`, `betaSurveyResponses`, and `betaSurveyContact`. The final survey action routes the participant to `/swca/funnel`.

## Avatar Recipe Replay

Use replay when marketing wants to compare avatar recipes without repeating the whole iPad/mobile funnel. The replay tool takes the latest existing `source/normalized.jpg` images from DynamoDB/S3, invokes the current avatar recipe, and writes outputs under `twin-card-replay/` so it does not trigger print composition or alter participant runs.

```powershell
$env:AWS_CONFIG_FILE="$env:USERPROFILE\.aws\config"
$env:AWS_SHARED_CREDENTIALS_FILE="$env:USERPROFILE\.aws\credentials"
$env:AWS_PROFILE="glue-admin"
$env:AWS_REGION="us-east-1"
node aws/twin-card/replay-avatar-recipe.mjs --limit=3
```

Output locations:

- Local comparison files: `_sandbox/twin-card-avatar-replays/{timestamp}/`
- Local side-by-side report: `_sandbox/twin-card-avatar-replays/{timestamp}/index.html`
- S3 replay files: `s3://myveevee-twin-card-767828748348-us-east-1/twin-card-replay/{avatarRecipeVersion}/{timestamp}/`
- `manifest.json` includes source keys, generated replay keys, provider id, and recipe version.

The HTML report has two tabs:

- `Flow Review`: compact source/generated thumbnails, the winning model ID, provider name, billable generation count, estimated cost, and attempt details for each card.
- `Recipe / Instructions`: the active recipe contract, rendered prompt/negative prompt, provider priority, provider settings, and a Bedrock docs-alignment table that maps AWS Stability Image Services request fields to our current payloads.

The flow tab is designed for model bakeoffs. The winning model ID is shown above each source/output pair so reviewers can quickly decide whether a provider is worth tuning or should be abandoned.

```text
raw source image -> model attempt(s) -> replay generated output
```

Each model step includes the model id, provider name, attempt status, latency, request id, HTTP status, prompt/negative-prompt character counts, request bytes, output bytes, and model settings. Bedrock Stability image responses do not return token usage, so token fields are recorded as unavailable rather than estimated.

Use the recipe tab before tuning likeness. The current expected alignment is:

- Control Structure sends `image`, `prompt`, `negative_prompt`, `control_strength`, and `output_format`.
- Style Transfer sends `init_image`, `style_image`, `prompt`, `negative_prompt`, `composition_fidelity`, `style_strength`, `change_strength`, and `output_format`; it is skipped unless `AVATAR_STYLE_REFERENCE_S3_KEY` is configured.
- Style Guide sends `image`, `prompt`, `negative_prompt`, `fidelity`, and `output_format`.

These field names intentionally match the AWS Bedrock Stability Image Services docs. If a provider starts failing with validation errors, compare the request JSON in the replay folder against the recipe tab first.

For a wiring-only dry run that does not call Bedrock:

```powershell
node aws/twin-card/replay-avatar-recipe.mjs --limit=3 --mock --no-write-s3
```

To force a single provider during model evaluation:

```powershell
node aws/twin-card/replay-avatar-recipe.mjs --limit=3 --provider us.stability.stable-image-control-structure-v1:0
```

Use single-provider replays when comparing candidates. Do not keep fighting a model that repeatedly loses identity/likeness after the request payload has been verified against the recipe tab.

## External Provider Replay And Production Use

Hugging Face replay remains model exploration only. Direct fal.ai Nano Banana 2 Edit and GPT Image 2 Edit are now approved for the production avatar-generation path through `src/twinCard/avatarProviderContract.json`.

Source of truth: `src/twinCard/huggingFaceImageProviderContract.json`.

Connection registry: `codex/twin-card/PROVIDER_CONNECTIONS.md`. Use that file to see which provider paths are working, which credentials are required, known blockers, and the next direct-provider setup target.

The Twin Card funnel consent copy in `src/pages/TwinCardPage.tsx` explicitly covers AI, image-generation, image-editing, model-evaluation, quality-review, replay, testing, cloud hosting, storage, email, printing, and operations providers. Keep that consent language aligned before changing external model providers.

The Hugging Face contract currently targets image-to-image candidates such as:

- `black-forest-labs/FLUX.1-Kontext-dev`
- `Qwen/Qwen-Image-Edit`
- `Qwen/Qwen-Image-Edit-2509`
- `black-forest-labs/FLUX.2-dev`

Current top candidate model/provider strategy is stored in `src/twinCard/huggingFaceImageProviderContract.json` under `topCandidateStrategy`.

As of 2026-05-27:

1. Primary: `fal-ai/nano-banana-2/edit` direct through fal.ai.
   - This is the current top candidate after the Qwen vs Nano Banana replay produced the preferred avatar outputs.
   - The replay manifest stores `x-fal-request-id`, `x-fal-billable-units`, pricing API result, billing-events lookup result, output metadata, and estimated cost.
2. Secondary: `openai/gpt-image-2/edit` direct through fal.ai.
   - This is the preferred #2 model behind Nano Banana 2 Edit. The Nano Banana 2 Edit vs GPT Image 2 Edit comparison has been run and indexed into DynamoDB replay rows for `/twin-dashboard` review.
3. Last fallback: `fallback_original_photo_card`.
   - Use the normalized raw source image in the card frame when external generation is unavailable or quality is unacceptable.

Keep model rankings tied to provider names. The same model through different providers can have different availability, pricing, request behavior, and output consistency.

Previous non-Qwen comparison candidate: `black-forest-labs/FLUX.2-dev` via `replicate`. It completed a one-card probe through Hugging Face on 2026-05-26. The current direct fal.ai comparison is `openai/gpt-image-2/edit` against `fal-ai/nano-banana-2/edit`.

fal.ai pricing/audit check:

```powershell
node aws/twin-card/fal-platform-audit.mjs `
  --endpoints fal-ai/nano-banana-2/edit,openai/gpt-image-2/edit
```

The current fal inference key can read pricing. It returned `$0.08` per `images` for `fal-ai/nano-banana-2/edit` and `$1` per `units` for `openai/gpt-image-2/edit` on 2026-05-27. The same key returned `403` for `GET /v1/models/billing-events`, so exact request-level billing-events require an admin fal key. Until then, per-run estimated cost is `x-fal-billable-units * pricing API unit_price`.

Hugging Face two-model comparison replay:

```powershell
node aws/twin-card/replay-huggingface-avatar.mjs `
  --limit=3 `
  --compareTop2 `
  --promptVariant baseline `
  --hfTimeoutMs=180000
```

The comparison report renders one row per source image with raw image, primary output, and fallback output side by side. It stores per-output model id, provider, status, latency, dimensions, bytes, billing unit, estimated cost, prompt variant, and provider response metadata.

Direct fal.ai Nano vs GPT Image 2 replay:

```powershell
node aws/twin-card/replay-qwen-fal-comparison.mjs `
  --comparison nano-gpt `
  --limit=3 `
  --gptQuality medium
```

Current completed comparison run:

- Run id: `2026-05-27T02-01-33-789Z`
- S3 prefix: `s3://myveevee-twin-card-767828748348-us-east-1/twin-card-replay/provider-comparison/nano-banana-2-vs-gpt-image-2/2026-05-27T02-01-33-789Z/`
- DDB replay rows: six rows, one Nano and one GPT output for each of three source images.
- Estimated model cost: Nano `$0.24`, GPT `$0.1839`, total `$0.4239`.
- Local replay output folders were cleaned on 2026-05-27; use S3, DDB, and `/twin-dashboard` as the durable review record.

Model-specific recipes are decoupled in `src/twinCard/huggingFaceImageProviderContract.json` under `modelRecipes`. Do not assume FLUX and Qwen should receive the same language:

- FLUX Kontext uses the primary wellness-avatar transformation recipe.
- Qwen Image Edit uses a shorter edit-only recipe that avoids card/banner wording and explicitly forbids text, letters, numbers, labels, logos, badges, signs, captions, watermarks, UI, and typography. Qwen's model card and Replicate page both emphasize text editing/rendering strength, so the prompt should be cautious when the desired output has no text.

The replay report shows each output's recipe id, exact prompt, exact negative prompt, model/provider, latency, dimensions, bytes, status, and cost fields. Use that report as the recipe tab/source of truth during model review.

Hugging Face Inference Providers are a unified proxy/client layer across providers such as fal.ai and Replicate. The image-to-image API accepts an input image plus prompt parameters and returns image bytes. The script uses the official `@huggingface/inference` client.

Billing source of truth: `src/twinCard/huggingFaceImageProviderContract.json`.

Hugging Face Inference Providers use provider-pass-through billing. Hugging Face states that it charges the same rates as the selected provider with no extra fee. For `black-forest-labs/FLUX.1-Kontext-dev` routed to `fal-ai`, the known fal endpoint is `fal-ai/flux-kontext/dev`, priced at `$0.025` per output megapixel, rounded up to the nearest megapixel. Replay reports store this as `output_megapixel_rounded_up` and include estimated cost per card plus a replay-level billing summary.

If a model/provider pair does not have a rate in the contract, the replay report marks cost as `unpriced`. Add the provider endpoint id, billing unit, unit price, source URL, and verification date to the contract before using that model for cost comparisons.

Required environment:

```powershell
$env:HF_TOKEN="<hugging-face-token-with-inference-providers-permission>"
```

Wiring-only dry run that does not call Hugging Face:

```powershell
node aws/twin-card/replay-huggingface-avatar.mjs --limit=3 --mock --no-write-s3
```

Real replay example:

```powershell
node aws/twin-card/replay-huggingface-avatar.mjs `
  --limit=3 `
  --model black-forest-labs/FLUX.1-Kontext-dev `
  --hfProvider fal-ai
```

Single-card prompt-variant replay example:

```powershell
node aws/twin-card/replay-huggingface-avatar.mjs `
  --limit=1 `
  --cardId 0a0ffaf8-6235-4b12-bf13-7816e88bdc13 `
  --promptVariant identity_lock `
  --model black-forest-labs/FLUX.1-Kontext-dev `
  --hfProvider replicate
```

Prompt variants live in `src/twinCard/huggingFaceImageProviderContract.json`. Use this path when comparing likeness changes so every replay stores the exact prompt variant, prompt text, negative prompt, model, provider, and billing metadata.

Output locations:

- Local comparison files: `_sandbox/twin-card-huggingface-replays/{timestamp}/`
- Local report: `_sandbox/twin-card-huggingface-replays/{timestamp}/index.html`
- S3 replay files: `s3://myveevee-twin-card-767828748348-us-east-1/twin-card-replay/huggingface/{model}/{timestamp}/`
- DynamoDB replay rows: `cardId` starts with `replay#`, `recordType` is `replay`, and `/twin-dashboard` labels them with a Replay badge. These rows point to replay S3 artifacts and must not be treated as participant booth runs.

Do not put Hugging Face results under `generated/avatar.*` or `print/*` for real participant runs during exploration.

The Twin Card handler Lambda must have read permission for `twin-card-replay/*` so `/twin-dashboard` can create valid presigned S3 URLs for replay images, manifests, and reports. If replay links exist but images return S3 `AccessDenied`, deploy the CDK stack and confirm the handler role includes `s3:GetObject` for the replay prefix.

By default, real replay scripts write both S3 artifacts and DDB dashboard rows. Use `--no-write-s3` for local-only dry runs, and `--no-write-ddb` only when the output should not appear in `/twin-dashboard`.

To publish an already-generated replay manifest to the dashboard without paying to regenerate images:

```powershell
node aws/twin-card/replay-huggingface-avatar.mjs --indexManifest C:\path\to\manifest.json
node aws/twin-card/replay-qwen-fal-comparison.mjs --indexManifest C:\path\to\manifest.json
```

## Print Artifact Contract

The print composer intentionally writes two print-stage artifacts:

- `print/selphy-cp1500-4x6.svg`: deterministic layout source for audit, dashboard review, and rerendering.
- `print/selphy-cp1500-4x6.png`: Canon SELPHY CP1500-ready 4x6/Postcard portrait raster at 1200x1800 px, sRGB.

The generated avatar remains separate under `generated/avatar.*`. Do not overwrite or collapse these stages: the generated avatar is the AI output, the SVG is the print recipe/layout, and the PNG is the booth-ready print file.
