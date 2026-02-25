# Theme Plan: Dark + Light Mode Factory

## Goal
Define a reusable theme factory for VeeVee that supports:
- Current dark mode palette (already in use)
- New light mode palette
- User-facing mode toggle (dark/light) across the site

## Current State
- Chakra theme exists in `src/theme/index.ts`.
- Theme factory exists in `src/theme/factory.ts` with semantic tokens for dark and light modes.
- App uses `initialColorMode: "dark"` and `useSystemColorMode: false` (Option A selected).
- Dark/light mode toggle is present in header and mobile drawer.

## Theme Factory Checklist

- [x] Create a theme token map split by semantic intent:
- [x] `bg.canvas`, `bg.surface`, `text.primary`, `text.muted`, `border.default`, `accent.primary`, `accent.soft`, `state.success`, `state.warning`, `state.error`.
- [x] Keep brand consistency by preserving accent identity across both modes.
- [x] Add light mode values for all semantic tokens used by components/pages.
- [x] Refactor component styles to rely on semantic tokens instead of hardcoded hex values.
- [x] Add a theme factory entry point in `src/theme/index.ts` (or split into `src/theme/factory.ts`).
- [x] Ensure button/card/link variants are mode-aware and readable in both modes.

## Toggle and Behavior Checklist

- [x] Add a dark/light toggle button in header (visible desktop and mobile).
- [x] Use Chakra color mode hooks (`useColorMode`, `useColorModeValue`) for dynamic styles.
- [x] Persist user preference via Chakra `ColorModeScript` + local storage behavior.
- [x] Decide default behavior:
- [x] Option A: start in dark mode unless user changes manually.
- [x] Option B: use system preference on first visit, then persist user choice.
- [x] Not selected in this implementation (intentionally deferred).
- [x] Confirm mode toggle accessibility:
- [x] Clear label (`aria-label`), keyboard focus state, visible icon contrast.

## QA Checklist

- [x] Validate all routed pages in dark mode and light mode:
- [x] `/`, `/features`, `/how-it-works`, `/testimonials`, `/terms`.
- [x] Validate header/footer/nav contrast in both modes.
- [x] Validate all CTA buttons and link styles in both modes.
- [x] Validate images/cards still look intentional in both modes.
- [x] Run accessibility contrast checks on primary text, muted text, links, and buttons.

## Performance and Safety Checklist

- [x] Confirm no hydration flash or incorrect mode flash on page load.
- [x] Confirm no inline hardcoded colors remain where semantic tokens are expected.
- [x] Confirm analytics/trackers are unaffected by mode toggle interactions.
- [x] Add optional event tracking for mode toggle usage (`theme_toggle`).

## Rollout Notes
- Keep dark mode as baseline visual quality target.
- Introduce light mode only after semantic token coverage is complete.
- Do not merge partial token migration if it creates mixed visual styles across pages.
