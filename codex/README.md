# Codex Notes for `myveevee`

## Overview
This repository is the public-facing marketing site for `myveevee.com`.

- Framework: React + TypeScript + Vite
- UI system: Chakra UI
- Routing: `react-router-dom` (client-side SPA routing)
- Animation: Framer Motion + Emotion keyframes
- Deployment output: `dist/` (AWS Amplify config included)

## App Structure

### Entry and App Shell
- `src/main.tsx`
  - Bootstraps React, Chakra theme provider, and browser router.
- `src/App.tsx`
  - Defines global layout shell (header, footer, main container).
  - Registers site routes.
  - Includes mobile drawer navigation and `ScrollToTop` route behavior.
- `src/theme/index.ts`
  - Chakra theme config (colors, typography, global styles, button/card defaults).

### Pages (Routed)
- `src/pages/Home.tsx` mapped to `/`
  - Hero, core value proposition, payor logo marquee, CTA to `https://veevee.io`.
- `src/pages/Features.tsx` mapped to `/features`
  - Feature cards with desktop hover and mobile tap-to-reveal behavior.
- `src/pages/HowItWorks.tsx` mapped to `/how-it-works`
  - AI guide tiers and funnel CTA.
- `src/pages/Testimonials.tsx` mapped to `/testimonials`
  - Testimonial voice selector with animated content transitions.
- `src/pages/Terms.tsx` mapped to `/terms`
  - Terms and disclaimers content page.

### Pages (Currently Unused in Routes)
- `src/pages/Contact.tsx`
  - Contact/press component exists but is not currently linked in `src/App.tsx`.

## Static Files and Assets

### Public Assets
- `public/`
  - Favicons, manifest, robots/sitemap metadata files.
  - Hero images and logo assets.
  - Feature imagery under `public/images/features/`.
  - Payor logo sets under `public/payors/` (`normalized`, `archive`, `duplicate`).
  - Legal PDF: `public/VeeVee Business Associate Addendum.pdf`.

### HTML/SEO/Tracking
- `index.html`
  - SEO metadata (Open Graph, Twitter).
  - JSON-LD structured data.
  - Google Analytics `gtag` snippet.
  - Loads `src/main.tsx`.

## Build, Scripts, and Tooling
- `package.json`
  - `npm run dev`: start Vite dev server.
  - `npm run build`: production build to `dist/`.
  - `npm run preview`: preview built app.
  - `npm run typecheck`: TypeScript no-emit check.
  - `npm run normalize:payors`: logo normalization utility via `_sandbox/tools/normalizePayorLogos.cjs`.
- `vite.config.ts`
  - React plugin, dev port `5173`, output directory `dist`.
- `tsconfig.json`
  - TypeScript project config.

## Deployment
- `amplify.yml`
  - CI/CD steps for AWS Amplify:
  - `npm ci` in prebuild.
  - `npm run build` in build.
  - Publishes artifacts from `dist/`.

## Repository Notes
- Root `README.md` is currently minimal.
- `node_modules/` and `dist/` are present locally.
- `_sandbox/` contains utilities, including payor logo processing scripts.

## Messaging Pivot Checklist

- [x] Confirm final value proposition language and legal-safe claim boundaries for:
  - instant triage and live-doctor pathways
  - digital twin simulation
  - unified health profile (history + genetics + wearables)
  - benefits and coverage optimization
- [x] Define canonical homepage narrative order and section hierarchy.
- [x] Keep and preserve current payor logo marquee pill on landing page.

### Home Page (`src/pages/Home.tsx`)
- [x] Rewrite hero copy to focus on "why use VeeVee" and immediate outcomes.
- [x] Add/replace core content with the 4 key pillars.
- [x] Ensure CTAs are consistent and route to the right destination (`veevee.io`).
- [x] Keep high trust signals near CTA (privacy, encryption, clinical alignment language).
- [ ] Validate mobile and desktop layout quality after content rewrite.

### Features Page (`src/pages/Features.tsx`)
- [x] Reframe page around the same 4 pillars with deeper explanation.
- [x] Replace or update card copy, labels, and images to match new positioning.
- [x] Ensure hover/tap reveal still works and does not hide critical copy on mobile.
- [x] Align wording with homepage terminology to avoid mixed messaging.

### How It Works (`src/pages/HowItWorks.tsx`)
- [x] Redesign into a simple 3-step flow:
  - input (photo/voice/text)
  - triage + simulation
  - action via care + benefits optimization
- [x] Keep legal disclaimers concise and aligned with approved language.
- [x] Verify CTA flow is clear and conversion-focused.

### Navigation and Site-Wide Consistency
- [x] Update nav labels/order in `src/App.tsx` if needed for new story flow.
- [ ] Ensure footer links and wording reflect updated messaging.
- [x] Check page metadata in `index.html` (title, description, OG/Twitter) for consistency.
- [x] Sync codex docs after implementation so architecture and messaging notes stay accurate.

### QA and Review Passes
- [ ] Pass 1: Content QA (clarity, consistency, tone, legal-safe language).
- [ ] Pass 2: UX QA (desktop/mobile responsiveness, interaction behavior, readability).
- [ ] Pass 3: Conversion QA (CTA prominence, funnel continuity, page-to-page flow).
- [ ] Pass 4: Accessibility QA (heading order, contrast, keyboard navigation, link clarity).

### Optimization and Performance
- [x] Run build and type checks (`npm run typecheck`, `npm run build`).
- [ ] Optimize heavy images (hero/feature assets) and confirm lazy-loading behavior.
- [ ] Check for layout shift and oversized media in Lighthouse/PageSpeed.
- [ ] Trim unused assets/copy blocks where practical.

### Security, Logging, and Observability
- [ ] Review outbound links and target attributes (`rel`, `noopener`, `noreferrer` where applicable).
- [ ] Verify no sensitive data is exposed in static assets, metadata, or client code.
- [ ] Audit analytics usage (`gtag`) to avoid accidental PII collection in events.
- [ ] Define/confirm a minimal event taxonomy for funnel tracking (page view, CTA click, route step).
- [ ] Add/confirm error visibility strategy (frontend error logging/reporting approach).
- [ ] Confirm `robots.txt`, `sitemap.xml`, and legal pages are correct for production indexing.

### Finalization
- [ ] Run a final end-to-end manual walkthrough of all routes.
- [ ] Capture a change log summary of what was updated and why.
- [ ] Prepare a second-pass backlog (copy refinements, design polish, new proof assets).
