# Phase 5 Content Expansion Map

## Goal

Launch a small first set of acquisition pages tied to real product claims and real site language, not speculative SEO pages.

## Audience and intent map

### Caregiver support

- Primary audience: adult children, spouses, and family caregivers
- Search intent:
  - caregiver support app
  - help managing care for parent
  - family care coordination after hospital visit
  - benefits questions for caregiver
- Live route:
  - `/caregivers`
- Page goal:
  - show that VeeVee helps families stay involved, understand next steps, and reduce confusion after visits or during recovery
- Acceptance criteria:
  - route is live, indexable, and in the sitemap
  - metadata is unique and tied to caregiver intent
  - page contains substantive crawlable copy, FAQs, and internal links

### Medicare guidance

- Primary audience: Medicare users and their families
- Search intent:
  - Medicare guidance app
  - understand Medicare coverage after visit
  - Medicare next steps after appointment
  - benefits questions Medicare family support
- Live route:
  - `/medicare-guidance`
- Page goal:
  - frame VeeVee as a calmer support layer for benefits context, follow-up questions, and post-visit confidence
- Acceptance criteria:
  - route is live, indexable, and in the sitemap
  - copy stays truthful about coverage limits
  - page links to testimonials and simulator as proof and next step

### Hospital to home continuity

- Primary audience: patients, families, and hospital-connected operators
- Search intent:
  - hospital to home care support
  - discharge follow-up support
  - post discharge patient engagement
  - bedside to home continuity
- Live route:
  - `/hospital-to-home`
- Page goal:
  - focus the existing continuity story into one dedicated route for discharge and recovery related discoverability
- Acceptance criteria:
  - route is live, indexable, and in the sitemap
  - page links back to features, contact, caregiver, and Medicare pages
  - claims stay aligned with the current hospital and family support copy

## Deferred clusters

- Benefits and coverage guidance hub beyond Medicare-specific framing
- Dedicated RPM and RTM hospital value page
- Dedicated fall-risk monitoring page
- Health-record understanding page

These should wait until the first three pages are validated in production and their routing, indexing, and share behavior are confirmed.

## Regression checklist for this phase

- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run verify:seo`
- Verify new routes exist in `dist/<route>/index.html`
- Verify sitemap includes only intended public routes
- Verify internal links connect the new pages to the existing marketing surface
