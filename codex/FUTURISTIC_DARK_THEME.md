# Futuristic 2026 dark theme

Implemented on 2026-09-20. Production releases follow the connected Amplify `main` branch; deployment status and commit are recorded in its job history.

## Review and adaptation

The live homepage and local React code used midnight #030725, teal-blue #011E48 surfaces, a midnight-to-teal page gradient, #1177BA blue accents/actions, and the older car0 illustration. Inter was already loaded from Google Fonts (400/600/800). The runtime default was light despite the historical dark-default plan in readme_theme.md.

The dark theme now adopts the supplied Health Twin 2026 direction and is always dark (`SiteProvider`, `initialColorMode: "dark"`, `useSystemColorMode: false`), regardless of operating system appearance or an older saved light preference. The fixed color-mode manager never reads browser storage; the forced dark context also ignores mode changes. The HTML shell and prerendered copy are dark before JavaScript loads. The browser theme color is midnight #030725. Existing copy, navigation, account destinations and analytics are retained.

| Role | Dark theme |
| --- | --- |
| Canvas and long reading | Midnight #030725, opaque |
| Content cards | Indigo #192586, opaque |
| Primary text | White #FFFFFF |
| Supporting text, links, heading emphasis | Cyan #9CE7FF |
| Primary actions | Green #16734B with white labels |
| Hero artwork | TH26-ENV-03 Future Office — Connected skyline workspace, full browser width, with separate AV-039 Nia v2 and AV-047 Theo v2 digital avatars |
| Closing invitation | TH26-BG-02 Shadow surrounding an opaque midnight copy panel |
| How It Works | AV-045 in Future City Park / AV-040 seated in Future Home studying the IT-023 miniature hologram / AV-033 walking in Future City Park, Input / Simulate / Results |
| Footer signature | TH26-LOGO-01, complete stacked logo and original glow |
| Typography | Locally hosted Inter Variable, weights 100–900, font-display swap |

The original compact header logo remains readable at navigation size. The stacked futuristic mark is used at a larger size in the dark footer. The library's retro lettering is bespoke raster copy for particular posters, not a new website font; live HTML headings use Inter for responsiveness and accessibility.

The public provider, contact, terms and audience landing pages share the revised dark surfaces. Artwork is concentrated in the consumer story rather than put behind long text. Shared semantic tokens also reach internal consumers; the HealthTwinFunnel selected checkmark now uses accent.on so it remains visible against cyan. The theme switches have been removed from the header and phone drawer.

## Source preservation

Source repository: `C:/w/vv-designs`. Design references: `CODEX.md`, `2026/branding/campaign-palette.css`, `2026/branding/themes/health-twin-2026/README.md` and `2026/asset-library/avatar-casting.json`.

`node scripts/import-futuristic-theme.mjs [source-root]` imports fourteen specific assets without changing the design library. The checked-in manifest at `public/brand/2026/futuristic/manifest.json` records IDs, paths, dimensions, SHA-256 hashes and sizes. Lossless WebP encoding preserves every visible source pixel, all alpha values and full source dimensions; the importer verifies these against decoded originals. The masters have no resizing, cropped subjects, recoloring or added glow. Responsive delivery copies are documented below. The font and its license are copied from the library's guide-v1 fonts directory.

The user-endorsed simulation composition adds IT-023 from `2026/ads/017-while-you-wait/assets/vitruvian-theo-telepresence-v2.png` to Nia's left at roughly half her height. The complete model, rings and console remain one contained image, with a separate soft cyan floor glow. Nia stays on the right, fully visible. This illustrates simulation exploration rather than a real patient scan or product interface. The combined image description includes both subjects; the decorative projection layer has empty alt text to avoid a duplicate announcement.

Backgrounds use centered cover crops. The office hero reaches both browser edges immediately below the header; on phones its background is anchored to the lower avatar region at a readable scene scale. Nia and Theo use separate complete digital-only sources, aligned to the floor with contain and padding. The copy sits over a midnight radial backdrop with feathered edges that blend into the office. The dark center keeps copy readable; both avatars sit above the backdrop so it never dims their figures. How It Works retains 6% stage padding and its complete Input pair. No UI or text covers a person. The avatar illustrations are conceptual artwork, not product screenshots or clinical evidence.

## Composition record

| Required field | Homepage | How It Works |
| --- | --- | --- |
| Avatar | AV-047 Theo v2 on the left, centered copy, AV-039 Nia v2 on the right; complete digital singles. At phone/tablet widths, centered copy sits above Theo (left) and Nia (right). | AV-045 Theo discomfort/concern pair, AV-040 Nia seated Thinker with its stool, AV-033 Rosa walking roadmap single with bottle bag |
| Scene | TH26-ENV-03 office hero; TH26-BG-02 closing invitation | TH26-ENV-02 first park crop for Input; TH26-ENV-04 open central area for Simulate; TH26-ENV-02 third park crop for Results |
| Mirror | None | None |
| Text | Hero: “Your twin. Your simulation. All free.” with emphasized free offering. Benefits: “Your twin. Real possibilities.” plus the supplied campaign poster's guidance, recommendations, and offers language; retained 01, 02, 03 markers. | Existing PATIENT_STEPS, MOBILITY_EXAMPLE_STEPS, FAQs retained |
| Logo count | Original header icon/wordmark placement plus one combined futuristic footer mark; no logos embedded in avatar sources | Same header/footer; no embedded logos in the three avatar sources |
| Duplicate words | Existing repeated “See How It Works” CTA and header/footer navigation are intentional | Existing repeated step labels in the explanatory example and header/footer navigation are intentional |

## Validation

Typecheck, production build, 15 tests (including saved light/system preferences, forced context, and unavailable storage) and the prerender verifier (12 routes and four redirects) passed. Vite reports its existing large UI vendor chunk advisory.

Measured text contrast: white/midnight 19.79:1; cyan/midnight 14.41:1; white/indigo 12.73:1; cyan/indigo 9.26:1; white/green actions 5.85:1. These apply to the opaque content surfaces, not arbitrary background artwork pixels. Default and hover actions retain readable labels.

Browser review covers desktop and phone consumer layouts, complete image loading, horizontal overflow, navigation and FAQ interaction, always-dark appearance, and reloads. Mobile checks cover 320, 390 and 430 CSS-pixel widths, plus tablet and desktop breakpoints. No animations added. The original theme masters remain available. Thirteen full-resolution lossless master assets are retained; only artwork used by the current page is requested. The office hero's two digital avatars have high priority, while How It Works subject images and the footer mark load lazily.

## Mobile refinement, 2026-09-20

The phone hero uses tighter copy spacing, 16px body text, a full-width 48px primary action, and a 260px stage that keeps both avatars complete. Theo remains left and Nia right below the centered message; desktop retains the approved three-column composition. The office image fades into the midnight copy area. Header, drawer and footer navigation targets are at least 44px high. Contact and Terms lose redundant phone gutters; the closing homepage button also fits a 320px viewport.

The library's three office scenes are CSS windows in `continuity-proof-v1.html`, not separate source images. `node scripts/build-mobile-theme-assets.mjs` derives the central window (x647, y0, 648×809) for phones below 480px and complete 384/768px avatar copies from the checked-in masters. The originals are unchanged. The delivery variants use WebP quality 88 with full alpha quality; `mobile-manifest.json` records their dimensions and sizes. A native picture source and responsive avatar srcsets avoid requesting desktop masters on small screens. The background plus both 384px avatars total about 172 KiB; 768px avatar selections total about 343 KiB, versus about 3.2 MiB for the three masters. Device pixel ratio determines which avatar sizes are selected.

## Hero copy integration

The desktop copy panel has been replaced by a CSS radial backdrop: an opaque midnight center transitions through four opacity stops into the office scene. The gradient extends beyond the copy without a border or hard rectangular edge. Desktop copy padding and vertical spacing provide more breathing room. Phones and tablets use a longer, 96px fade between the midnight copy area and the office image. The gradient is decorative and ignores pointer events. Browser review covers 320/390px phones and 1024/1440px desktop widths, including full avatars and horizontal overflow.

## How It Works Input pair

The first image now uses AV-045 / S1-Theo-future-v2: the complete human Theo bends forward with hands bracing his knees in discomfort, while his concerned digital twin reaches out to help. It replaces the AV-037 wellness pair for this pain-specific Input story. Nia appears in exploration and Rosa in results; the steps represent people using the product, not one person changing identity. Original source: `2026/asset-library/futuristic/theo-v2/assets/pair-theo-futuristic-s1-v2.png`. The importer verifies lossless visible-pixel preservation; 384/768px delivery copies keep phone downloads small. Contain sizing and stage padding preserve both complete figures. The accessible description reflects the new pose. No embedded text or logos; page copy, shared header/footer branding, background and other two images retain their existing composition.

## Seated Nia in Future Home

The second How It Works image uses AV-040 / S2-Nia-future-thinker-v1 over TH26-ENV-04 Future Home. Both source masters are preserved and imported losslessly. The background delivery crop uses the open central area at x720/y0/648x809, beyond the sofa, with the illuminated wall and open floor behind Nia. This supersedes the first carousel window after the user rejected the empty couch. Nia is a separate transparent image, fitted with contain, positioned toward the right and floor, and given the existing 6% stage padding. Her full canvas, embedded faceted stool, hands and shoes remain visible. No new raster effects, embedded copy, logos or UI are added. Scene 2 copy and shared header/footer logo placements remain as recorded in the composition table. Responsive 384/768px avatar files and the optimized open-area crop serve the card without requiring full-size masters.

## Rosa on the City Park promenade

The Results image uses AV-033 / S3-Rosa-future-v1, walking right with an open palm presenting next steps. Her signature glasses and crossbody water-bottle purse stay visible as part of the original asset. This pose fits the Results narrative without adding a literal roadmap interface or implying a guaranteed health outcome. The background is TH26-ENV-02 Future City Park, using the third carousel window from the supplied continuity proof (rounded to x1294/y0/648x809). Full source masters are retained; responsive 384/768px Rosa images and an optimized background crop are delivery copies. Contain sizing, 6% padding and bottom-aligned scenery preserve her full silhouette and place her feet on the promenade. No embedded copy or logos were added. Existing Results copy and shared header/footer branding remain unchanged. The homepage continues to use Nia and Theo.

## Input in Future City Park

Scene 1 now places the complete AV-045 Theo discomfort/concern duo over the first TH26-ENV-02 carousel window (rounded to x0/y0/648x809). The left park view complements the third park window behind Rosa in Results, while Nia remains in Future Home. Background placement anchors the promenade to the bottom of the image stage. Pair spacing, complete figures, 6% padding, Input copy and shared branding remain unchanged. The crop is a delivery variant of the preserved park master and is recorded in the mobile manifest.
