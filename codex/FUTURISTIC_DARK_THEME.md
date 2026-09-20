# Futuristic 2026 dark theme

Implemented on 2026-09-20. Production releases follow the connected Amplify `main` branch; deployment status and commit are recorded in its job history.

## Review and adaptation

The live homepage and local React code used midnight #030725, teal-blue #011E48 surfaces, a midnight-to-teal page gradient, #1177BA blue accents/actions, and the older car0 illustration. Inter was already loaded from Google Fonts (400/600/800). The runtime default was light despite the historical dark-default plan in readme_theme.md.

The dark theme now adopts the supplied Health Twin 2026 direction and is the default for new visitors (`initialColorMode: "dark"`, `useSystemColorMode: false`), regardless of their operating system appearance. Visitors can still select light mode; Chakra preserves their saved preference on subsequent visits. The browser theme color is midnight #030725. Existing copy, navigation, account destinations and analytics are retained.

| Role | Dark theme |
| --- | --- |
| Canvas and long reading | Midnight #030725, opaque |
| Content cards | Indigo #192586, opaque |
| Primary text | White #FFFFFF |
| Supporting text, links, heading emphasis | Cyan #9CE7FF |
| Primary actions | Green #16734B with white labels |
| Hero artwork | TH26-BG-01 Luminous + AV-037 Nia v2 pair |
| Closing invitation | TH26-BG-02 Shadow surrounding an opaque midnight copy panel |
| How It Works | TH26-BG-02 + AV-037 / AV-038 / AV-039, Input / Simulate / Results |
| Footer signature | TH26-LOGO-01, complete stacked logo and original glow |
| Typography | Locally hosted Inter Variable, weights 100–900, font-display swap |

The original compact header logo remains readable at navigation size. The stacked futuristic mark is used at a larger size in the dark footer. The library's retro lettering is bespoke raster copy for particular posters, not a new website font; live HTML headings use Inter for responsiveness and accessibility.

The public provider, contact, terms and audience landing pages share the revised dark surfaces. Artwork is concentrated in the consumer story rather than put behind long text. Shared semantic tokens also reach internal consumers; the HealthTwinFunnel selected checkmark now uses accent.on so it remains visible against cyan. The theme switch is available on tablet navigation as well as desktop and the phone drawer.

## Source preservation

Source repository: `C:/w/vv-designs`. Design references: `CODEX.md`, `2026/branding/campaign-palette.css`, `2026/branding/themes/health-twin-2026/README.md` and `2026/asset-library/avatar-casting.json`.

`node scripts/import-futuristic-theme.mjs [source-root]` imports six specific assets without changing the design library. The checked-in manifest at `public/brand/2026/futuristic/manifest.json` records IDs, paths, dimensions, SHA-256 hashes and sizes. Lossless WebP encoding preserves every visible source pixel, all alpha values and full source dimensions; the importer verifies these against decoded originals. No resizing, cropped subjects, recoloring or added glow. The font and its license are copied from the library's guide-v1 fonts directory.

Backgrounds use centered cover crops. Foreground figures use contain with 6% stage padding and separate copy regions. No UI or text covers a person; both members of the Input pair remain complete. The avatar illustrations are conceptual artwork, not product screenshots or clinical evidence.

## Composition record

| Required field | Homepage | How It Works |
| --- | --- | --- |
| Avatar | Complete AV-037 Nia v2 human/twin pair | AV-037 pair, AV-038 exploration single, AV-039 roadmap single |
| Scene | TH26-BG-01 hero; TH26-BG-02 closing invitation | TH26-BG-02 behind each complete subject |
| Mirror | None | None |
| Text | Existing Home.tsx copy and HEALTH_TWIN_BENEFITS retained; added 01, 02, 03 markers | Existing PATIENT_STEPS, MOBILITY_EXAMPLE_STEPS, FAQs retained |
| Logo count | Original header icon/wordmark placement plus one combined futuristic footer mark; no logos embedded in avatar sources | Same header/footer; no embedded logos in the three avatar sources |
| Duplicate words | Existing repeated “See How It Works” CTA and header/footer navigation are intentional | Existing repeated step labels in the explanatory example and header/footer navigation are intentional |

## Validation

Typecheck, production build, 11 existing tests and the prerender verifier (12 routes and four redirects) passed. Vite reports its existing large UI vendor chunk advisory.

Measured text contrast: white/midnight 19.79:1; cyan/midnight 14.41:1; white/indigo 12.73:1; cyan/indigo 9.26:1; white/green actions 5.85:1. These apply to the opaque content surfaces, not arbitrary background artwork pixels. Default and hover actions retain readable labels.

Browser review covers desktop and phone consumer layouts, complete image loading, horizontal overflow, navigation, dark/light switching and persistence on reload. No animations added. Six full-resolution lossless images total approximately 5 MiB; lazy subject images and the footer mark defer loading, while the hero pair has high priority. The two original background masters retain their full resolution for fidelity.
