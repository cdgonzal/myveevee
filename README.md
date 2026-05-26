# myveevee

Public-facing marketing site for `myveevee.com`.

## Stack

- React 18
- TypeScript
- Vite
- Chakra UI
- React Router
- AWS CDK for backend infrastructure

## Main Routes

- `/`
- `/features`
- `/technology`
- `/simulator`
- `/testimonials`
- `/contact`
- `/terms`
- `/caregivers`
- `/medicare-guidance`
- `/hospital-to-home`

Internal route:

- `/briefs/swca-4821.html`

Campaign/direct-link route:

- `/swca`
  - Spine and Wellness Centers of America provider hub
  - public provider network entry point for rewards, general interest, and Health Twin account creation
  - `noindex`
- `/swca/rewards`
  - Spine and Wellness Centers of America reward-wheel teaser page
  - intended for QR codes and shared links before the intake form
  - `noindex`
- `/swca/intake`
  - Spine and Wellness Centers of America intake form
  - intended for QR codes and shared links, not site navigation
  - `noindex`
- `/swca/wheel`
  - post-intake reward wheel and contact capture route
  - reached from a valid intake response
  - `noindex`
- `/swca/funnel`
  - post-reward Health Twin CTA route
  - conversion-focused final step after reward/contact completion
  - `noindex`
- `/swca/funnel-visual`
  - visual-function Health Twin CTA test route
  - used as the B variant for post-reward funnel competition
  - desktop uses a two-column CTA plus Health Twin visual; mobile uses compact icon cards and short labels
  - `noindex`
- `/swca/admin`
  - private SWCA campaign dashboard for redacted traffic, reward, and contact-method reporting
  - intended for direct admin access only, not site navigation
  - `noindex`
- `/swca/certificate`
  - secure reward certificate page linked from customer reward email
  - intended for direct customer access only, not site navigation
  - `noindex`
- `/twin-card`
  - SWCA Medical Summit expo activation flow for lead capture, photo capture, Twin Card generation, and booth printing
  - print output is governed by [printContract.json](/C:/w/myveevee/src/twinCard/printContract.json:1) for Canon SELPHY CP1500 4x6 postcard output
  - photo upload normalization is governed by [uploadContract.json](/C:/w/myveevee/src/twinCard/uploadContract.json:1): accept large camera files up to 25 MB, immediately center-crop to a 1024x1024 JPEG at quality 0.88, then send that normalized image to the backend and AI avatar model
  - backed by native AWS API Gateway, Lambda, S3, DynamoDB, and optional Bedrock image generation
  - `noindex`
- `/twin-card/result/:cardId`
  - public Twin Card result page with card preview and beta CTA
  - `noindex`
- `/twin-card/admin`
  - staff view for recent Twin Cards and quick printing
  - hidden direct-access route
  - `noindex`
- `/twin-dashboard`
  - PIN-gated Twin Card run dashboard for expo operations
  - PIN: `5353`
  - shows all recent runs, responses, consent, contact, image normalization metadata, DDB-backed fields, and S3/presigned artifact links
  - hidden direct-access route
  - `noindex`

## Scripts

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run typecheck`
- `npm run test`
- `npm run verify:seo`
- `cd infra; npm run build`
- `cd infra; npx cdk synth`

## Notes

- `npm run build` generates the static site and route-level prerendered HTML for public routes.
- `npm run verify:seo` rebuilds the site and verifies prerendered SEO output.
- Unknown app routes render a tracked `noindex` recovery page with a primary CTA to `/how-it-works`.
- The internal SWCA brief should remain non-indexable.
- The SWCA intake, teaser, wheel, Health Twin funnel, admin dashboard, first-party events, and CloudWatch alarms are live.
- `/swca` is the lean provider hub for SWCA's public VeeVee network paths, including the direct Health Twin CTA to `veevee.io`.
- The SWCA provider hub uses the clinic-provided trust image at `/swca/provider-trust-profile.webp`.
- The SWCA email-first reward communication path is live: reward email, secure certificate link, certificate page, and certificate-view tracking.
- `/swca/teaser` is a compatibility alias that redirects to `/swca/rewards`.
- The reward teaser now uses a provider-sponsored landing pattern with SWCA branding, a reusable reward-wheel visual, and one CTA to `/swca/intake`.
- The SWCA reward wheel is live as a post-intake route backed by DynamoDB one-spin enforcement and reward-contact capture.
- The SWCA post-reward funnel competition uses `/swca/funnel` as the avatar variant and `/swca/funnel-visual` as the visual/function variant. Reward completion assigns traffic deterministically from `submissionId` to keep the split close to 50/50. The visual variant is optimized for short-copy mobile cards and a two-column desktop CTA.
- The SWCA admin dashboard route is `/swca/admin`; it uses a backend passcode session and returns abbreviated names plus contact method only.
- Reward slots are configured in `src/swca/rewardWheel/reward-wheel-config.json` so marketing can edit labels, descriptions, estimated values, colors, odds, and total slots.
- Intake concern options, top-ranked follow-up questions, and generic intent questions are configured in `src/swca/intakeForm/swca-intake-config.json`.
- The completed SWCA mobile UX rollout lives at [MOBILE_FUNNEL_UX_PLAN.md](/C:/w/myveevee/codex/swca/MOBILE_FUNNEL_UX_PLAN.md:1).
- The completed SWCA marketing signal follow-up work lives at [MARKETING_SIGNAL_FOLLOWUP_PLAN.md](/C:/w/myveevee/codex/swca/MARKETING_SIGNAL_FOLLOWUP_PLAN.md:1).
- Reward communication and admin handoff notes live in [REWARD_COMMUNICATION_PLAN.md](/C:/w/myveevee/codex/swca/REWARD_COMMUNICATION_PLAN.md:1).
- The SWCA admin runbook lives at [ADMIN_RUNBOOK.md](/C:/w/myveevee/codex/swca/ADMIN_RUNBOOK.md:1).
- The provider onboarding playbook lives at [PROVIDER_ONBOARDING_PLAYBOOK.md](/C:/w/myveevee/codex/swca/PROVIDER_ONBOARDING_PLAYBOOK.md:1).
- The SWCA SMS delivery plan lives at [SMS_IMPLEMENTATION_PLAN.md](/C:/w/myveevee/codex/swca/SMS_IMPLEMENTATION_PLAN.md:1).
- The AWS toll-free registration runbook lives at [SMS_REGISTRATION_RUNBOOK.md](/C:/w/myveevee/codex/swca/SMS_REGISTRATION_RUNBOOK.md:1).
- CDK infrastructure lives under `infra/`; the SWCA Lambda source lives under `aws/swca-intake/`.
- Twin Card backend source lives under `aws/twin-card/`; CDK outputs `TwinCardActivationTwinCardApiEndpoint...` for `VITE_TWIN_CARD_API_URL`.
- Twin Card print sizing is contracted in [printContract.json](/C:/w/myveevee/src/twinCard/printContract.json:1): Canon SELPHY CP1500, 4x6/Postcard portrait, 300 DPI, 1200x1800 px, sRGB, borderless, 60 px safe margin.
- Twin Card upload sizing is contracted in [uploadContract.json](/C:/w/myveevee/src/twinCard/uploadContract.json:1): max original upload 25 MB, normalized AI input 1024x1024 JPEG, normalized payload max 7.5 MB.
- Twin Card run status semantics are contracted in [statusContract.json](/C:/w/myveevee/src/twinCard/statusContract.json:1). `completed` means Bedrock returned an AI avatar. `fallback_used` means the card is still complete and printable, but uses the normalized uploaded photo because Bedrock was not configured or failed. Staff views label this as `Photo fallback`.
- Each live Twin Card run writes private S3 image objects under `twin-card/source/` and `twin-card/generated/`, a private JSON run artifact under `twin-card/runs/{cardId}.json`, and a DynamoDB row in `myveevee-twin-card-cards` containing the full run details.
- More detailed repo notes live in [codex/README.md](/C:/w/myveevee/codex/README.md:1).
