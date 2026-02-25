# Theme Plan: Dark + Light Mode Factory

## Goal
Define a reusable theme factory for VeeVee that supports:
- Current dark mode palette (already in use)
- New light mode palette
- User-facing mode toggle (dark/light) across the site

## Current State
- Chakra theme exists in `src/theme/index.ts`.
- The active palette is dark-mode-first (`surface.900`, `surface.800`, accent greens).
- App currently sets `initialColorMode: "dark"` and `useSystemColorMode: false`.
- No explicit dark/light mode toggle is present in header/footer.

## Theme Factory Checklist

- [x] Create a theme token map split by semantic intent:
- [x] `bg.canvas`, `bg.surface`, `text.primary`, `text.muted`, `border.default`, `accent.primary`, `accent.soft`, `state.success`, `state.warning`, `state.error`.
- [x] Keep brand consistency by preserving accent identity across both modes.
- [x] Add light mode values for all semantic tokens used by components/pages.
- [ ] Refactor component styles to rely on semantic tokens instead of hardcoded hex values.
- [x] Add a theme factory entry point in `src/theme/index.ts` (or split into `src/theme/factory.ts`).
- [x] Ensure button/card/link variants are mode-aware and readable in both modes.

## Toggle and Behavior Checklist

- [x] Add a dark/light toggle button in header (visible desktop and mobile).
- [x] Use Chakra color mode hooks (`useColorMode`, `useColorModeValue`) for dynamic styles.
- [x] Persist user preference via Chakra `ColorModeScript` + local storage behavior.
- [ ] Decide default behavior:
- [x] Option A: start in dark mode unless user changes manually.
- [ ] Option B: use system preference on first visit, then persist user choice.
- [ ] Confirm mode toggle accessibility:
- [x] Clear label (`aria-label`), keyboard focus state, visible icon contrast.

## QA Checklist

- [ ] Validate all routed pages in dark mode and light mode:
- [ ] `/`, `/features`, `/how-it-works`, `/testimonials`, `/terms`.
- [ ] Validate header/footer/nav contrast in both modes.
- [ ] Validate all CTA buttons and link styles in both modes.
- [ ] Validate images/cards still look intentional in both modes.
- [ ] Run accessibility contrast checks on primary text, muted text, links, and buttons.

## Performance and Safety Checklist

- [ ] Confirm no hydration flash or incorrect mode flash on page load.
- [ ] Confirm no inline hardcoded colors remain where semantic tokens are expected.
- [ ] Confirm analytics/trackers are unaffected by mode toggle interactions.
- [ ] Add optional event tracking for mode toggle usage (`theme_toggle`).

## Rollout Notes
- Keep dark mode as baseline visual quality target.
- Introduce light mode only after semantic token coverage is complete.
- Do not merge partial token migration if it creates mixed visual styles across pages.
