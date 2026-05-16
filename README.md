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
- `/swca/admin`
  - private SWCA campaign dashboard for redacted traffic, reward, and contact-method reporting
  - intended for direct admin access only, not site navigation
  - `noindex`
- `/swca/certificate`
  - secure reward certificate page linked from customer reward email
  - intended for direct customer access only, not site navigation
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
- The SWCA post-reward funnel route is `/swca/funnel`; it sells the user's free Health Twin with minimal text and one dominant CTA to `veevee.io`.
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
- More detailed repo notes live in [codex/README.md](/C:/w/myveevee/codex/README.md:1).
