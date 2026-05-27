# Twin Card Provider Connections

Source of truth for external image-provider connection status, required credentials, working commands, and next setup steps.

Last updated: 2026-05-26

## Connection Matrix

| Status | Provider path | Credential | Current model / endpoint | How we call it | Cost tracking | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Working | Hugging Face Inference Providers -> Replicate | `HF_TOKEN` | `Qwen/Qwen-Image-Edit` routed to Replicate endpoint `qwen/qwen-image-edit` | `aws/twin-card/replay-huggingface-avatar.mjs --model Qwen/Qwen-Image-Edit --hfProvider replicate` | `src/twinCard/huggingFaceImageProviderContract.json` known rate: `$0.03` per output image | Current preferred model/provider pair. Force `--hfProvider replicate`; do not rely on HF `auto` because it may route to blocked `fal-ai`. |
| Working | Hugging Face Inference Providers -> Replicate | `HF_TOKEN` | `black-forest-labs/FLUX.2-dev` | `aws/twin-card/replay-huggingface-avatar.mjs --model black-forest-labs/FLUX.2-dev --hfProvider replicate` | Not configured yet; reports as `provider_defined` / `unpriced` | Recommended next non-Qwen comparison candidate. One-card probe completed. |
| Blocked | Hugging Face Inference Providers -> fal.ai | `HF_TOKEN` plus Hugging Face pay-as-you-go enabled for `fal-ai` | `lightx2v/Qwen-Image-Edit-2511-Lightning` routed by HF to `fal-ai/qwen-image-edit-2511/lora` | `aws/twin-card/replay-huggingface-avatar.mjs --model lightx2v/Qwen-Image-Edit-2511-Lightning --hfProvider fal-ai` | Not configured yet | HF routes to fal.ai, but returns HTTP `402`: `Pay-as-you go is not enabled for provider fal-ai yet.` |
| Working | Direct fal.ai | `FAL_KEY` | `fal-ai/nano-banana-2/edit` | Direct `POST https://fal.run/fal-ai/nano-banana-2/edit`; reusable script `aws/twin-card/replay-qwen-fal-comparison.mjs` | Captures `x-fal-billable-units`; unit price still needs verification | This bypasses Hugging Face. Direct probe returned HTTP 200 with generated PNG and `x-fal-billable-units: 1.0`. |

## Working Hugging Face + Replicate Qwen Setup

Environment:

```powershell
$env:HF_TOKEN="<hugging-face-token-with-inference-providers-permission>"
$env:AWS_PROFILE="glue-admin"
$env:AWS_REGION="us-east-1"
```

Run current preferred Qwen replay:

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

Direct fal.ai is separate from Hugging Face. It requires a fal.ai API key:

```powershell
$env:FAL_KEY="<fal-ai-api-key>"
```

Target model:

- Endpoint id: `fal-ai/nano-banana-2/edit`
- HTTP endpoint: `POST https://fal.run/fal-ai/nano-banana-2/edit`
- fal docs: `https://fal.ai/models/fal-ai/nano-banana-2/edit/api`

Confirmed direct fal probe:

- Status: HTTP 200
- Response header: `x-fal-billable-units: 1.0`
- Response header: `x-fal-request-id: 019e670c-0e82-7593-b08a-d93606bcd086`
- Response body included `images[0].url` pointing to a generated PNG.

Reusable Qwen vs Nano Banana 2 replay:

```powershell
node aws/twin-card/replay-qwen-fal-comparison.mjs `
  --limit=3
```

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
- Add direct fal cost fields to the same manifest shape used by Hugging Face replays before running comparisons at scale.
- Direct fal provider calls must use the same consent/legal constraints as Hugging Face external-provider replays.
