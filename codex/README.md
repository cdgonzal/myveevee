# Codex Notes for `myveevee`

## Overview

This repository is the public-facing marketing site for `myveevee.com`.

- Framework: React 18 + TypeScript + Vite
- UI system: Chakra UI
- Routing: `react-router-dom`
- Animation: Framer Motion
- Deployment target: static `dist/` output via Amplify
- Backend infrastructure: AWS CDK under `infra/`
- Current SEO model:
  - route metadata is still applied client-side during SPA navigation
  - build-time prerender files are generated for public routes
  - live hosting still needs route-level serving verification for non-root prerendered pages
- Current partner-form model:
  - `/swca/rewards` is the QR-facing reward-wheel teaser route
  - `/swca/intake` is a direct-link campaign route, not a menu route
  - form submission is live through API Gateway, Lambda, S3, and SES
  - CDK stack `MyVeeVeeInfraStack` owns the deployed backend resources

## Current Route Surface

### Core marketing routes

- `/`
- `/features`
- `/technology`
- `/simulator`
- `/testimonials`
- `/contact`
- `/terms`

### SEO acquisition routes

- `/caregivers`
- `/medicare-guidance`
- `/hospital-to-home`

### Internal or restricted route

- `/briefs/swca-4821.html`
  - internal brief
  - should remain `noindex`
- `/avatar-playback-test`
  - hidden avatar video diagnostic page
  - should remain `noindex`
  - not linked from nav, footer, or sitemap

### Campaign/direct-link route

- `/swca/rewards`
  - Spine and Wellness Centers of America reward-wheel teaser page
  - intended for QR codes and shared links before the intake form
  - not linked from the header, footer, sitemap, or primary marketing pages
  - `noindex`
  - CTA destination is `/swca/intake`
- `/swca/intake`
  - Spine and Wellness Centers of America wellness priority intake form
  - intended for QR codes and shared links
  - not linked from the header, footer, sitemap, or primary marketing pages
  - `noindex`
  - submits to API Gateway endpoint `https://6o3st0r6ee.execute-api.us-east-1.amazonaws.com/forms/swca-intake`

## Page Inventory

- `src/pages/Home.tsx`
  - homepage hero, payor logo strip, crawlable patient/hospital/technology sections, modal experiences
- `src/pages/Features.tsx`
  - feature overview plus internal links into the SEO acquisition pages
- `src/pages/Technology.tsx`
  - technology and infrastructure story
- `src/pages/Simulator.tsx`
  - interactive simulator preview experience
- `src/pages/Testimonials.tsx`
  - interactive testimonials plus crawlable summaries
- `src/pages/Contact.tsx`
  - public contact and press route
- `src/pages/Terms.tsx`
  - legal and disclaimer route
- `src/pages/Caregivers.tsx`
  - SEO landing page for caregiver-support discovery
- `src/pages/MedicareGuidance.tsx`
  - SEO landing page for Medicare-related guidance and coverage discovery
- `src/pages/HospitalToHome.tsx`
  - SEO landing page for discharge follow-up and continuity discovery
- `src/pages/SwcaBrief.tsx`
  - standalone internal SWCA brief page
- `src/swca/rewardsTeaser/SwcaRewardsTeaser.tsx`
  - standalone reward-wheel teaser for Spine and Wellness Centers of America
  - uses the campaign flyer wheel asset and routes the primary CTA to `/swca/intake`
- `src/swca/intakeForm/SpineWellnessIntakeForm.tsx`
  - standalone campaign intake form for Spine and Wellness Centers of America
  - supports multi-select, ranking, honeypot, loading, error, and success states
- `src/swca/intakeForm/api.ts`
  - submits to `VITE_SWCA_INTAKE_API_URL`; falls back to local mock mode only when the env var is absent
- `src/pages/AvatarPlaybackTest.tsx`
  - hidden video playback diagnostic page for `/avatar/*` assets
- `src/pages/SeoLandingPage.tsx`
  - shared layout scaffold for the SEO landing pages

## Partner Intake Implementation State

### Live

- Frontend route: `https://myveevee.com/swca/intake`
- Teaser route: `https://myveevee.com/swca/rewards`
- API endpoint: `https://6o3st0r6ee.execute-api.us-east-1.amazonaws.com/forms/swca-intake`
- CDK stack: `MyVeeVeeInfraStack`
- S3 bucket: `myveevee-swca-intake-767828748348-us-east-1`
- Lambda function: `myveevee-swca-intake-handler`
- SES sender and recipient: `info@veevee.io`
- Amplify `main` env var: `VITE_SWCA_INTAKE_API_URL`

### Verified

- Amplify release job `203` succeeded after the env var was added.
- Live API test returned submission id `4951deed-8fc7-4c9e-86db-b0f7cd40ee02`.
- S3 object was created at `forms/swca-wellness-priority-intake/year=2026/month=05/day=14/4951deed-8fc7-4c9e-86db-b0f7cd40ee02.json`.
- Lambda logs confirmed `SWCA intake submission stored and emailed`.
- Invalid payload testing returned `400` and did not create a second S3 object.

### Next

- Deploy and smoke-test the new `/swca/rewards` teaser route.
- Decide whether marketing needs CSV export, a dashboard, or email-only operations.
- Decide whether the email should keep full ranked concern detail or move toward a lighter notification with S3/admin lookup.
- Add monitoring or alarms for Lambda errors and unusual API volume.
- If more clinics are added, create new `PartnerIntakeForm` instances from config instead of copying console resources.

## SEO Implementation State

### Completed

- Route metadata hardening in `src/seo/routeMeta.ts` and `src/seo/applyRouteSeo.ts`
- `Contact & Press` routed and added to the sitemap
- Crawlable homepage and testimonial content added
- Route-specific OG images added under `public/og/`
- Build-time prerender generation added through `scripts/prerender-static-routes.mjs`
- SEO verification script added through `scripts/verify-prerender-static-routes.mjs`
- Initial Phase 5 landing pages shipped:
  - caregivers
  - Medicare guidance
  - hospital to home

### Still open

- Production verification that non-root routes are served with their prerendered HTML by the hosting layer
- Real social-preview validation on X and other link-preview surfaces
- Sitemap automation
- Search Console / Bing Webmaster submission and monitoring
- Additional acquisition clusters beyond the first three landing pages

## Key Files

- `src/App.tsx`
  - app shell, route registration, analytics lifecycle, footer/header links
- `src/config/links.ts`
  - central route and external-link constants
- `src/seo/routeMeta.ts`
  - per-route SEO metadata
- `src/seo/applyRouteSeo.ts`
  - client-side head mutation for route changes
- `aws/swca-intake/handler.mjs`
  - Lambda handler for SWCA intake validation, S3 persistence, and SES notification
- `infra/lib/partner-intake-form.ts`
  - reusable CDK construct for partner intake backends
- `infra/lib/myveevee-infra-stack.ts`
  - deployed CDK stack currently instantiating the SWCA intake backend
- `scripts/prerender-static-routes.mjs`
  - build-time route HTML generation for public pages
- `scripts/verify-prerender-static-routes.mjs`
  - validates prerendered route output
- `public/robots.txt`
  - crawl policy
- `public/sitemap.xml`
  - public indexable route list

## Commands

- `npm run dev`
  - local dev server
- `npm run build`
  - production build plus prerender generation
- `npm run preview`
  - local preview of the built site
- `npm run typecheck`
  - TypeScript validation
- `npm run test`
  - Vitest suite
- `npm run verify:seo`
  - full build plus prerender verification
- `npm run normalize:payors`
  - payor-logo normalization utility
- `cd infra; npm run build`
  - TypeScript validation for CDK infrastructure
- `cd infra; npx cdk synth --profile glue-admin --region us-east-1 --parameters SwcaSesFromEmail=info@veevee.io --parameters SwcaSesToEmails=info@veevee.io`
  - synthesizes the deployed backend template

## Validation Baseline

Current validation state:

- `npm run test`
- `npm run build`
- `npm run verify:seo`
- `cd infra; npm run build`
- `cd infra; npx cdk synth ...`

Known baseline issue:

- `npm run typecheck` currently fails on pre-existing unrelated issues in `src/pages/AvatarPlaybackTest.tsx` and `src/pages/HealthTwinFunnel.tsx`.
- The SWCA intake deploy path was validated through `npm run build`, `npm test`, CDK synth/deploy, Amplify release job `203`, live API submission, S3 object verification, and Lambda log verification.

## Related Docs

- `_sandbox/codex/seo/SEO_ROLLOUT_PLAN.md`
  - phased SEO rollout plan
- `_sandbox/codex/seo/SEO_BASELINE_AUDIT.md`
  - historical pre-change audit snapshot
- `_sandbox/codex/seo/SEO_PHASE5_CONTENT_MAP.md`
  - current Phase 5 audience and intent map
- `codex/readme_avatar_playback_test.md`
  - hidden playback-test page notes and Amplify hosting-rule diagnosis
- `aws/swca-intake/README.md`
  - SWCA intake Lambda contract, S3 object shape, and SES notification details
- `infra/README.md`
  - CDK setup, deploy commands, live resource names, and follow-on operations
