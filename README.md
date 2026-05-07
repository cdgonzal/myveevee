# myveevee

Public-facing marketing site for `myveevee.com`.

## Stack

- React 18
- TypeScript
- Vite
- Chakra UI
- React Router

## Main Routes

- `/`
- `/features`
- `/technology`
- `/simulator`
- `/testimonials`
- `/contact`
- `/terms`
- `/caregivers`
- `/medicare-guidance`
- `/hospital-to-home`

Internal route:

- `/briefs/swca-4821.html`

## Scripts

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run typecheck`
- `npm run test`
- `npm run verify:seo`

## Notes

- `npm run build` generates the static site and route-level prerendered HTML for public routes.
- `npm run verify:seo` rebuilds the site and verifies prerendered SEO output.
- The internal SWCA brief should remain non-indexable.
- More detailed repo notes live in [codex/README.md](/C:/w/myveevee/codex/README.md:1).
