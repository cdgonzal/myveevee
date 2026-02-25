# Asset Inventory and Size Review

## Summary
- Inventory scope: assets currently referenced by app code, `index.html`, and `public/site.webmanifest`.
- Total referenced local assets: `22`
- Total referenced local size: `226,465 bytes` (`~221 KB`)
- Largest active asset: `/images/marketing/hero-2026.webp` (`68,050 bytes`, `~66.5 KB`)

## Active Assets (Used by Site)
| Path | Type | Size (KB) | Used By |
|---|---:|---:|---|
| `/images/marketing/hero-2026.webp` | webp | 66.5 | `src/pages/Home.tsx` |
| `/images/features/benefits.webp` | webp | 27.6 | `src/pages/Features.tsx` |
| `/images/features/support.webp` | webp | 21.8 | `src/pages/Features.tsx` |
| `/images/features/health-story.webp` | webp | 20.8 | `src/pages/Features.tsx` |
| `/images/features/trajectory.webp` | webp | 17.6 | `src/pages/Features.tsx` |
| `/android-chrome-512x512.png` | png | 14.1 | `public/site.webmanifest` |
| `/payors/normalized/florida2.png` | png | 10.2 | `src/pages/Home.tsx` |
| `/payors/normalized/kaiser44.png` | png | 8.1 | `src/pages/Home.tsx` |
| `/payors/normalized/aetna2.png` | png | 4.9 | `src/pages/Home.tsx` |
| `/payors/normalized/molina3.png` | png | 4.1 | `src/pages/Home.tsx` |
| `/payors/normalized/united.png` | png | 3.7 | `src/pages/Home.tsx` |
| `/android-chrome-192x192.png` | png | 3.6 | `public/site.webmanifest` |
| `/apple-touch-icon.png` | png | 3.4 | `index.html` |
| `/payors/normalized/cvs.png` | png | 3.2 | `src/pages/Home.tsx` |
| `/payors/normalized/centene.png` | png | 2.8 | `src/pages/Home.tsx` |
| `/payors/normalized/cigna.png` | png | 2.2 | `src/pages/Home.tsx` |
| `/payors/normalized/elevance2.png` | png | 1.6 | `src/pages/Home.tsx` |
| `/payors/normalized/humana99.png` | png | 1.6 | `src/pages/Home.tsx` |
| `/payors/normalized/medicare1.png` | png | 1.1 | `src/pages/Home.tsx` |
| `/brand/2026/combined.svg` | svg | 1.0 | `src/App.tsx`, `src/pages/Home.tsx` |
| `/site.webmanifest` | webmanifest | 0.8 | `index.html` |
| `/favicon.svg` | svg | 0.3 | `index.html`, `public/site.webmanifest` |

## Optimization Results (Completed)
- Converted and switched runtime hero and feature images from PNG to WebP.
- Savings achieved on converted runtime images:
- `hero-2026.png` -> `hero-2026.webp`: `1,671,015` -> `68,050` bytes (`95.9%` smaller)
- `benefits.png` -> `benefits.webp`: `113,477` -> `28,224` bytes (`75.1%` smaller)
- `support.png` -> `support.webp`: `101,625` -> `22,370` bytes (`78.0%` smaller)
- `health-story.png` -> `health-story.webp`: `97,952` -> `21,340` bytes (`78.2%` smaller)
- `trajectory.png` -> `trajectory.webp`: `88,524` -> `18,066` bytes (`79.6%` smaller)

## Second-Pass Review (Unused Asset Inventory)
- Unreferenced files under `public/`: `74`
- Total unreferenced size: `17,717,893 bytes` (`~16.9 MB`)

## Safe-To-Archive Candidates (Largest Unused)
These are not currently referenced in runtime pages, SEO metadata, or manifest.

| Path | Size (MB) | Notes |
|---|---:|---|
| `public/images/marketing/Ad 13.png` | 2.05 | Alternate marketing creative, currently unused |
| `public/hero_33.png` | 1.87 | Legacy hero asset |
| `public/hero_44.png` | 1.86 | Legacy hero asset |
| `public/hero_22.png` | 1.75 | Legacy hero asset |
| `public/hero_1.png` | 1.73 | Legacy hero asset |
| `public/images/marketing/Ad 18.png` | 1.59 | Original source now replaced by `hero-2026.webp` in runtime |
| `public/images/marketing/hero-2026.png` | 1.59 | PNG source version; runtime now uses `.webp` |
| `public/logo_44.png` | 1.36 | Legacy logo asset |
| `public/hero-image.jpg` | 0.50 | Legacy hero image |
| `public/og-image.jpg` | 0.38 | Unused SEO image (current SEO points to new brand asset) |

## Archival Strategy
- Recommended: move safe-to-archive assets to an external archive bucket or `/_archive` outside `public/`.
- Keep if needed for design history:
- `public/images/marketing/Ad 13.png`
- `public/images/marketing/Ad 18.png`
- `public/images/marketing/hero-2026.png` (source-of-truth PNG)
- If preserving source-of-truth policy, keep originals but do not ship them from `public/` in production.
