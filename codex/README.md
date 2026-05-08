# Codex Notes for `myveevee`

## Overview

This repository is the public-facing marketing site for `myveevee.com`.

- Framework: React 18 + TypeScript + Vite
- UI system: Chakra UI
- Routing: `react-router-dom`
- Animation: Framer Motion
- Deployment target: static `dist/` output via Amplify
- Current SEO model:
  - route metadata is still applied client-side during SPA navigation
  - build-time prerender files are generated for public routes
  - live hosting still needs route-level serving verification for non-root prerendered pages

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
- `src/pages/AvatarPlaybackTest.tsx`
  - hidden video playback diagnostic page for `/avatar/*` assets
- `src/pages/SeoLandingPage.tsx`
  - shared layout scaffold for the SEO landing pages

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

## Validation Baseline

The current SEO work has been validated locally with:

- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run verify:seo`

## Related Docs

- `_sandbox/codex/seo/SEO_ROLLOUT_PLAN.md`
  - phased SEO rollout plan
- `_sandbox/codex/seo/SEO_BASELINE_AUDIT.md`
  - historical pre-change audit snapshot
- `_sandbox/codex/seo/SEO_PHASE5_CONTENT_MAP.md`
  - current Phase 5 audience and intent map
- `codex/readme_avatar_playback_test.md`
  - hidden playback-test page notes and Amplify hosting-rule diagnosis
