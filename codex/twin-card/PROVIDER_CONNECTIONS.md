# Twin Card Provider Connections

Source of truth for external image-provider connection status, required credentials, working commands, and next setup steps.

Last updated: 2026-05-27

Production provider priority source of truth: `src/twinCard/avatarProviderContract.json`.

Approved production order:

1. `fal-ai/nano-banana-2/edit` through direct fal.ai.
2. `openai/gpt-image-2/edit` through direct fal.ai.
3. Bedrock Stability fallback providers.
4. `fallback_original_photo_card`.

The production Lambda reads the fal.ai API key from Secrets Manager secret `/myveevee/twin-card/fal-key`. Do not commit or hardcode provider keys.

## Connection Matrix

| Status | Provider path | Credential | Current model / endpoint | How we call it | Cost tracking | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Working | Hugging Face Inference Providers -> Replicate | `HF_TOKEN` | `Qwen/Qwen-Image-Edit` routed to Replicate endpoint `qwen/qwen-image-edit` | `aws/twin-card/replay-huggingface-avatar.mjs --model Qwen/Qwen-Image-Edit --hfProvider replicate` | `src/twinCard/huggingFaceImageProviderContract.json` known rate: `$0.03` per output image | Previous top candidate. Force `--hfProvider replicate`; do not rely on HF `auto` because it may route to blocked `fal-ai`. |
| Working | Hugging Face Inference Providers -> Replicate | `HF_TOKEN` | `black-forest-labs/FLUX.2-dev` | `aws/twin-card/replay-huggingface-avatar.mjs --model black-forest-labs/FLUX.2-dev --hfProvider replicate` | Not configured yet; reports as `provider_defined` / `unpriced` | Recommended next non-Qwen comparison candidate. One-card probe completed. |
| Blocked | Hugging Face Inference Providers -> fal.ai | `HF_TOKEN` plus Hugging Face pay-as-you-go enabled for `fal-ai` | `lightx2v/Qwen-Image-Edit-2511-Lightning` routed by HF to `fal-ai/qwen-image-edit-2511/lora` | `aws/twin-card/replay-huggingface-avatar.mjs --model lightx2v/Qwen-Image-Edit-2511-Lightning --hfProvider fal-ai` | Not configured yet | HF routes to fal.ai, but returns HTTP `402`: `Pay-as-you go is not enabled for provider fal-ai yet.` |
| Working | Direct fal.ai | `FAL_KEY` | `fal-ai/nano-banana-2/edit` | Direct `POST https://fal.run/fal-ai/nano-banana-2/edit`; reusable script `aws/twin-card/replay-qwen-fal-comparison.mjs` | Captures `x-fal-billable-units`, `x-fal-request-id`, pricing API result, and billing-events permission status. Current pricing API: `$0.08` per `images` unit. | Current primary candidate. Billing-events returned `403` with the current key, so request-level billing events require an admin fal key. |
| Working | Direct fal.ai | `FAL_KEY` | `openai/gpt-image-2/edit` | `aws/twin-card/replay-qwen-fal-comparison.mjs --comparison nano-gpt --limit=3 --gptQuality medium` | Captures response headers, pricing API result, billing-events permission status, output metadata, estimated cost, and DDB replay rows. fal pricing API reports `$1` per `units`. | Preferred #2 model behind Nano Banana 2 Edit. Comparison completed on 2026-05-27 and is visible in `/twin-dashboard` Image Review. |

## Working Hugging Face + Replicate Qwen Setup

Environment:

```powershell
$env:HF_TOKEN="<hugging-face-token-with-inference-providers-permission>"
$env:AWS_PROFILE="glue-admin"
$env:AWS_REGION="us-east-1"
```

Run Qwen replay:

```powershell
node aws/twin-card/replay-huggingface-avatar.mjs `
  --limit=3 `
  --model Qwen/Qwen-Image-Edit `
  --hfProvider replicate `
  --hfTimeoutMs=180000
```

Confirmed current preferred recipe:

- Recipe id: `qwen_image_edit_replicate_no_text_avatar_v1`
- Contract: `src/twinCard/huggingFaceImageProviderContract.json`
- Prompt:

```text
Transform the reference photo into a clean, polished 2D wellness avatar while preserving the same person's visible identity, face, face features, face shape, hair, skin tone, pose, framing, and natural expression. Keep it healthcare-friendly, premium, simple background, no text, no logos.
```

## Hugging Face + fal.ai Blocker

Direct error captured from the Hugging Face client when routing to fal.ai:

```json
{
  "name": "ProviderApiError",
  "message": "Failed to perform inference: Pay-as-you go is not enabled for provider fal-ai yet.",
  "httpRequest": {
    "url": "https://router.huggingface.co/fal-ai/fal-ai/qwen-image-edit-2511/lora?_subdomain=queue",
    "method": "POST",
    "headers": {
      "Authorization": "[redacted]",
      "Content-Type": "application/json",
      "User-Agent": "@huggingface/inference/4.13.18 Node.js/22"
    },
    "body": "[omitted image payload]"
  },
  "httpResponse": {
    "requestId": "Root=1-6a160e4e-25d9c8a13c50aad7067e1929",
    "status": 402,
    "body": {
      "error": "Pay-as-you go is not enabled for provider fal-ai yet."
    }
  }
}
```

Fix needed in Hugging Face:

1. Enable pay-as-you-go for Inference Providers.
2. Confirm `fal-ai` is allowed/enabled as a provider.
3. Confirm payment method or credits are active.
4. Rerun the fal.ai probe through Hugging Face.

## Direct fal.ai Setup Target

Direct fal.ai is separate from Hugging Face. In production the avatar-generator Lambda reads the fal.ai API key from Secrets Manager. For local replay only, it can be exported as:

```powershell
$env:FAL_KEY="<fal-ai-api-key>"
```

Target model:

- Endpoint id: `fal-ai/nano-banana-2/edit`
- HTTP endpoint: `POST https://fal.run/fal-ai/nano-banana-2/edit`
- fal docs: `https://fal.ai/models/fal-ai/nano-banana-2/edit/api`
- Current role: approved production primary provider for VeeVee health-twin avatar generation.
- Preferred #2 model: `openai/gpt-image-2/edit`.

Confirmed direct fal probe:

- Status: HTTP 200
- Response header: `x-fal-billable-units: 1.0`
- Response header: `x-fal-request-id: 019e670c-0e82-7593-b08a-d93606bcd086`
- Response body included `images[0].url` pointing to a generated PNG.

Current pricing API check:

```powershell
node aws/twin-card/fal-platform-audit.mjs `
  --endpoints fal-ai/nano-banana-2/edit,openai/gpt-image-2/edit
```

Observed on 2026-05-27:

- `fal-ai/nano-banana-2/edit`: `$0.08` per `images`.
- `openai/gpt-image-2/edit`: `$1` per `units`.
- `GET /v1/models/billing-events` returned `403` for the current key: `This API key is not permitted to perform this action.`

Implication: with the current key, per-run cost should be estimated from the synchronous response header `x-fal-billable-units` multiplied by `GET /v1/models/pricing`. Exact request-level billing-events require an admin fal key.

Reusable Qwen vs Nano Banana 2 replay:

```powershell
node aws/twin-card/replay-qwen-fal-comparison.mjs `
  --limit=3
```

Reusable Nano Banana 2 vs GPT Image 2 replay:

```powershell
node aws/twin-card/replay-qwen-fal-comparison.mjs `
  --comparison nano-gpt `
  --limit=3 `
  --gptQuality medium
```

Current completed Nano vs GPT comparison:

- Run id: `2026-05-27T02-01-33-789Z`
- S3 prefix: `s3://myveevee-twin-card-767828748348-us-east-1/twin-card-replay/provider-comparison/nano-banana-2-vs-gpt-image-2/2026-05-27T02-01-33-789Z/`
- Dashboard: `/twin-dashboard` Image Review groups the latest three source images into Raw Capture, Nano Banana 2 Edit, and GPT Image 2 Edit columns.
- Estimated model cost: Nano `$0.24`, GPT `$0.1839`, total `$0.4239`.
- Local replay output folders were cleaned on 2026-05-27; use S3, DDB, and `/twin-dashboard` as the durable review record.

Expected direct fal payload shape from fal docs:

```json
{
  "prompt": "Transform the reference photo into a clean, polished 2D wellness avatar while preserving the same person's visible identity, face, face features, face shape, hair, skin tone, pose, framing, and natural expression. Keep it healthcare-friendly, premium, simple background, no text, no logos.",
  "image_urls": [
    "https://..."
  ]
}
```

Implementation notes:

- fal accepts file URLs for image inputs. For Twin Card replay, prefer a short-lived S3 presigned URL for the normalized source image.
- Do not put fal outputs under participant `generated/` or `print/` paths during exploration. Store them under `twin-card-replay/fal/{endpoint}/{runId}/`.
- Store direct fal response headers, summarized response body, pricing API result, billing-events lookup result, output fetch metadata, request id, billable units, unit price, and estimated cost in the replay manifest before running comparisons at scale.
- Direct fal provider calls must use the same consent/legal constraints as Hugging Face external-provider replays.
