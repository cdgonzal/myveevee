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

- `/swca/rewards`
  - Spine and Wellness Centers of America reward-wheel teaser page
  - intended for QR codes and shared links before the intake form
  - `noindex`
- `/swca/intake`
  - Spine and Wellness Centers of America intake form
  - intended for QR codes and shared links, not site navigation
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
- The internal SWCA brief should remain non-indexable.
- The SWCA intake form is live and submits through API Gateway, Lambda, S3, and SES.
- The SWCA reward teaser is a campaign page that motivates users to start the intake form before the reward-wheel step.
- CDK infrastructure lives under `infra/`; the SWCA Lambda source lives under `aws/swca-intake/`.
- More detailed repo notes live in [codex/README.md](/C:/w/myveevee/codex/README.md:1).
