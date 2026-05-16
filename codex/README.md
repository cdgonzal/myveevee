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
  - `/swca/teaser` redirects to `/swca/rewards` as a compatibility alias
  - `/swca/intake` is a direct-link campaign route, not a menu route
  - form submission, reward wheel, admin reporting, first-party events, and alarms are live
  - customer reward email, secure certificate links, and certificate-view tracking are live
  - `/swca` is the lean provider hub for public SWCA reward, interest, and Health Twin account-creation paths
  - completed mobile funnel UX pass: reward teaser, intake, wheel, duplicate-contact redirect, and final Health Twin CTA now move users forward with less reading and less scrolling
  - CDK stack `MyVeeVeeInfraStack` owns the deployed backend resources
- Unknown app routes render a tracked `noindex` recovery page with a primary CTA to `/how-it-works`.

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

- `/swca`
  - Spine and Wellness Centers of America provider hub
  - public entry point for rewards, general interest, and Health Twin account creation
  - not linked from the header, footer, sitemap, or primary marketing pages
  - `noindex`
- `/swca/rewards`
  - Spine and Wellness Centers of America reward-wheel teaser page
  - intended for QR codes and shared links before the intake form
  - not linked from the header, footer, sitemap, or primary marketing pages
  - `noindex`
  - CTA destination is `/swca/intake`
- `/swca/teaser`
  - compatibility alias for `/swca/rewards`
  - redirects client-side and remains out of navigation
- `/swca/intake`
  - Spine and Wellness Centers of America wellness priority intake form
  - intended for QR codes and shared links
  - not linked from the header, footer, sitemap, or primary marketing pages
  - `noindex`
  - submits to API Gateway endpoint `https://6o3st0r6ee.execute-api.us-east-1.amazonaws.com/forms/swca-intake`
- `/swca/wheel`
  - live post-intake reward-wheel route
  - stays direct-link only and `noindex`
  - should be reached from a successful intake response using `submissionId` plus a one-time token
- `/swca/certificate`
  - secure post-reward certificate route linked from customer reward email
  - not linked from the header, footer, sitemap, or primary marketing pages
  - `noindex`
- `/swca/funnel`
  - post-reward SWCA-branded Health Twin CTA route
  - reached after winner contact details are saved from `/swca/wheel`
  - not linked from the header, footer, sitemap, or primary marketing pages
  - `noindex`
  - CTA destination is `https://veevee.io`
- `/swca/admin`
  - private SWCA campaign dashboard route
  - passcode-gated through the backend admin session endpoint
  - not linked from the header, footer, sitemap, or primary marketing pages
  - `noindex`
  - shows redacted reporting only: abbreviated names and contact method, not raw email or phone

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
- `src/pages/NotFoundPage.tsx`
  - tracked recovery page for unknown app paths
  - primary CTA points to `/how-it-works`
- `src/pages/SwcaBrief.tsx`
  - standalone internal SWCA brief page
- `src/swca/providerHub/SwcaProviderHub.tsx`
  - standalone SWCA provider hub for public reward, interest, and Health Twin account-creation paths
  - uses the clinic-provided trust image at `/swca/provider-trust-profile.webp`
- `src/swca/rewardsTeaser/SwcaRewardsTeaser.tsx`
  - standalone reward-wheel teaser for Spine and Wellness Centers of America
  - uses an inline provider campaign config for SWCA branding, colors, CTA destination, and reward category
  - routes the primary CTA to `/swca/intake`
- `src/swca/intakeForm/SpineWellnessIntakeForm.tsx`
  - standalone campaign intake form for Spine and Wellness Centers of America
  - supports multi-select, ranking, honeypot, loading, error, and success states
- `src/swca/intakeForm/swca-intake-config.json`
  - editable SWCA concern options plus follow-up and intent question configuration
- `src/swca/intakeForm/api.ts`
  - submits to `VITE_SWCA_INTAKE_API_URL`; falls back to local mock mode only when the env var is absent
- `src/swca/rewardWheel/SwcaRewardWheel.tsx`
  - standalone post-intake reward wheel for Spine and Wellness Centers of America
  - validates a `sid` and `token` query string before allowing a spin
  - collects winner first name, last name, and email or phone after the reward is revealed
- `src/swca/rewardWheel/api.ts`
  - submits to `VITE_SWCA_REWARD_SPIN_API_URL`; falls back to local mock mode only when the env var is absent
- `src/swca/rewardWheel/reward-wheel-config.json`
  - marketing-editable reward slot config for labels, descriptions, estimated values, colors, weights, and total slot count
- `src/swca/certificate/SwcaRewardCertificate.tsx`
  - secure customer reward certificate page with VeeVee profile CTA tracking
- `src/swca/certificate/api.ts`
  - calls `VITE_SWCA_REWARD_CERTIFICATE_API_URL`; derives from the reward spin endpoint if the explicit env var is absent
- `src/swca/profileFunnel/SwcaProfileFunnel.tsx`
  - standalone SWCA-branded final CTA page selling the free Health Twin after reward completion
- `src/swca/profileFunnel/provider-comments.json`
  - editable provider recommendation copy for the post-reward funnel page
- `src/swca/admin/SwcaAdminDashboard.tsx`
  - private SWCA campaign dashboard with passcode entry, executive summary tab, metrics, distributions, redacted recent submissions, and CSV export
- `src/swca/admin/api.ts`
  - calls `VITE_SWCA_ADMIN_SESSION_API_URL` and `VITE_SWCA_ADMIN_REPORT_API_URL`; falls back to mock report mode when env vars are absent
- `src/swca/campaignEvents.ts`
  - sends first-party SWCA funnel events to `VITE_SWCA_EVENT_API_URL` when configured
- `src/pages/AvatarPlaybackTest.tsx`
  - hidden video playback diagnostic page for `/avatar/*` assets
- `src/pages/SeoLandingPage.tsx`
  - shared layout scaffold for the SEO landing pages

## Partner Intake Implementation State

### Live

- Frontend route: `https://myveevee.com/swca/intake`
- Provider hub route: `https://myveevee.com/swca`
- Teaser route: `https://myveevee.com/swca/rewards`
- Wheel route: `https://myveevee.com/swca/wheel`
- API endpoint: `https://6o3st0r6ee.execute-api.us-east-1.amazonaws.com/forms/swca-intake`
- Reward spin endpoint: `https://6o3st0r6ee.execute-api.us-east-1.amazonaws.com/forms/swca-reward-spin`
- Reward contact endpoint: `https://6o3st0r6ee.execute-api.us-east-1.amazonaws.com/forms/swca-reward-contact`
- Reward certificate endpoint: `https://6o3st0r6ee.execute-api.us-east-1.amazonaws.com/forms/swca-reward-certificate`
- Campaign event endpoint: `https://6o3st0r6ee.execute-api.us-east-1.amazonaws.com/forms/swca-event`
- Admin session endpoint: `https://6o3st0r6ee.execute-api.us-east-1.amazonaws.com/forms/swca-admin-session`
- Admin report endpoint: `https://6o3st0r6ee.execute-api.us-east-1.amazonaws.com/forms/swca-admin-report`
- CDK stack: `MyVeeVeeInfraStack`
- S3 bucket: `myveevee-swca-intake-767828748348-us-east-1`
- DynamoDB reward table: `myveevee-swca-intake-reward-claims`
- DynamoDB campaign event table: `myveevee-swca-intake-campaign-events`
- Lambda function: `myveevee-swca-intake-handler`
- Reward Lambda function: `myveevee-swca-intake-reward-spin-handler`
- Admin/event Lambda function: `myveevee-swca-intake-admin-handler`
- SES sender and recipient: `info@veevee.io`
- Amplify `main` env vars: `VITE_SWCA_INTAKE_API_URL`, `VITE_SWCA_REWARD_SPIN_API_URL`, `VITE_SWCA_EVENT_API_URL`, `VITE_SWCA_ADMIN_SESSION_API_URL`, `VITE_SWCA_ADMIN_REPORT_API_URL`
- Operational alerts SNS topic: `myveevee-swca-intake-operational-alerts`
- Operational alarms: Lambda errors, API Gateway 5xx responses, and API Gateway high request volume

### Verified

- SWCA intake, teaser, wheel, Health Twin funnel, admin dashboard, first-party events, and alarms are live.
- Customer reward email, secure certificate page, certificate API, and admin message status fields are implemented.
- Marketing signal follow-up questions after ranking are implemented and documented in `codex/swca/MARKETING_SIGNAL_FOLLOWUP_PLAN.md`.
- Live smoke tests confirmed S3 storage, internal SES notification, one-spin reward claim, contact save, redacted admin report, and alarm subscription.
- Reward email and certificate status were verified with smoke-test submission `731a0f54-9537-4715-a658-7c49ded7029d`.
- Latest end-to-end reward communication verification used submission `7db059ef-eca9-439b-a398-e0ebd413b15d`: intake, wheel, email, secure certificate link, and certificate-view event all matched `rewardId=wellness-gift`.
- API Gateway CORS is verified for `https://myveevee.com`, `https://www.myveevee.com`, and the Amplify branch URL.
- App 404 recovery, `/swca/teaser`, and timed `/how-it-works` redirect are deployed.
- Latest frontend deploy checkpoint: Amplify job `249` succeeded on 2026-05-16 for the streamlined `/swca/funnel` Health Twin CTA.

### Backlog

- Complete AWS End User Messaging SMS registration before enabling text reward delivery.
- Rotate/share the SWCA admin passcode through a secure channel before broad staff rollout.
- Add deeper operations reporting only if management outgrows the redacted dashboard and CSV.
- Extract provider-neutral campaign config before adding clinic 2.

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
  - Lambda handler for SWCA intake validation, S3 persistence, SES notification, and reward eligibility creation
- `aws/swca-intake/spin-handler.mjs`
  - Lambda handler for one-time SWCA reward spin claims and post-win contact capture
- `aws/swca-intake/admin-handler.mjs`
  - Lambda handler for SWCA campaign events, passcode-backed admin sessions, and redacted admin reports
- `infra/lib/partner-intake-form.ts`
  - reusable CDK construct for partner intake, reward-wheel, campaign-event, and redacted admin-report backends
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
- The SWCA deploy path has been validated through `npm run build`, `npm test`, CDK synth/deploy, Amplify deploys, live API submission, S3 object verification, DynamoDB reward/contact records, certificate-view events, and Lambda log verification.

## Related Docs

- `_sandbox/codex/seo/SEO_ROLLOUT_PLAN.md`
  - phased SEO rollout plan
- `_sandbox/codex/seo/SEO_BASELINE_AUDIT.md`
  - historical pre-change audit snapshot
- `_sandbox/codex/seo/SEO_PHASE5_CONTENT_MAP.md`
  - current Phase 5 audience and intent map
- `codex/readme_avatar_playback_test.md`
  - hidden playback-test page notes and Amplify hosting-rule diagnosis
- `codex/swca/REWARD_COMMUNICATION_PLAN.md`
  - completed email-first SWCA customer reward communication tracker plus operations/admin backlog
- `codex/swca/MARKETING_SIGNAL_FOLLOWUP_PLAN.md`
  - completed plan for top-ranked concern follow-up questions and generic purchase-intent signals
- `codex/swca/MOBILE_FUNNEL_UX_PLAN.md`
  - completed mobile-first SWCA funnel improvements without disrupting desktop
- `codex/swca/PROVIDER_ONBOARDING_PLAYBOOK.md`
  - repeatable provider/clinic onboarding packet, SWCA page inventory, reusable surfaces, and clinic information request checklist
- `codex/swca/ADMIN_RUNBOOK.md`
  - SWCA admin dashboard, reporting, CSV export, alarm response, and troubleshooting runbook
- `codex/swca/SMS_IMPLEMENTATION_PLAN.md`
  - disabled-by-default SWCA SMS reward delivery plan and AWS setup checklist
- `codex/swca/SMS_REGISTRATION_RUNBOOK.md`
  - AWS toll-free registration id, required business fields, and enablement guardrails
- `aws/swca-intake/README.md`
  - SWCA intake Lambda contract, S3 object shape, and SES notification details
- `infra/README.md`
  - CDK setup, deploy commands, live resource names, and follow-on operations
- `_sandbox/codex/spine-wellness-intake-form/PLAN.md`
  - historical SWCA intake, teaser, reward-wheel, admin, alarm, mobile, and marketing-signal implementation plan
