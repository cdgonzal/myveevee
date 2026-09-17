# Marketing funnel simplification

## Consolidated site

The consumer path is **Home → How It Works → account creation at veevee.io**.
There are five core pages: Home, How It Works, For Providers, Contact, and Terms.

- Home has one static Health Twin illustration, three core benefits, and one repeated action: See How It Works. The rotating hero, insurance-logo ticker, and interactive preview prompts are removed.
- How It Works explains account creation, bringing health context together, and using the Health Twin. It includes concise account/privacy questions and a direct account-creation CTA.
- For Providers combines the former hospital value and technology content at `/providers`. Technical details and illustrative economics are expandable. Its action is Discuss a Partnership, leading to Contact.
- Desktop and mobile primary navigation show Home, How It Works, and For Providers. Log In stays available in the header. The footer adds Contact and Terms.
- Features, Technology, Testimonials, and Hospital Value no longer have separate page implementations. Legacy URLs redirect as listed below.
- Caregivers, Medicare Guidance, and Hospital to Home remain searchable supporting pages outside primary navigation. Traffic and assisted-signup evidence is needed before retiring those search entry points.
- `/simulator`, `/health-twin`, `/health-twin/create`, and `/create` remain available by direct link for review, with `noindex, nofollow` and no sitemap entries. Hidden does not mean access-controlled.
- SWCA, Twin Card, tools, and admin routes retain their separate campaign/operational purposes.

The existing named testimonials had no source or approval records in the repository. The consolidated pages use benefits rather than presenting those quotes as verified customer proof, pending confirmation. No new customer outcomes, privacy guarantees, or measured ROI claims were added.

## Route migration

| Retired URL | Destination |
| --- | --- |
| `/features` | `/how-it-works` |
| `/technology` | `/providers` |
| `/testimonials` | `/` |
| `/hospital-value` | `/providers` |

The shared mapping is `src/config/marketingRedirects.json`. React navigation preserves query parameters and fragments. The static build also emits redirect fallback pages with destination canonicals and `noindex, follow`, plus `dist/amplify-marketing-rules.json` containing HTTP 301 rules and exact rewrites to each generated page, for both slash and non-slash variants. The rewrites ensure the broad SPA fallback does not replace page-specific metadata with homepage metadata.

### Amplify deployment step

`amplify.yml` does not automatically load the generated custom-rules file. Apply the generated rules when deploying this route migration.

1. Run `npm run verify:seo` and deploy the resulting site so `/providers` and the consolidated destinations are available.
2. In the existing Amplify app, open Hosting → Rewrites and redirects. Save a copy of the current rules.
3. Prepend the rules from `dist/amplify-marketing-rules.json` to the current rules, replacing any existing exact rules for those sources. Preserve domain redirects, static asset handling, campaign routes, and the SPA fallback; the new path rules must run before the broad SPA rewrite.
4. Verify each retired URL returns HTTP 301 with the expected Location. Check a query such as `?utm_source=migration-check`, the trailing-slash forms, `/providers`, `/swca`, and an `/avatar/` static asset. Confirm there are no redirect loops.

Until hosting rules are applied, the client/static fallback navigates to the replacement page but is not an HTTP 301. AWS documents the rule ordering and query forwarding behavior in [Redirects and rewrites](https://docs.aws.amazon.com/amplify/latest/userguide/redirects.html).

## Conversion measurement

CTA events describe the current labels and destinations. Home's goal is reaching How It Works; How It Works' goal is account creation; Providers' goal is partnership contact.

Measure Home → How It Works visits, How It Works → VeeVee clicks, and completed accounts per marketing visitor. Segment by acquisition source and mobile/desktop. A marketing click is not a completed signup: confirm cross-domain attribution and an account-completion event in the product before claiming improvement. The product signup implementation is outside this repository.

Compare against a baseline with enough comparable traffic before deciding whether to merge Home and How It Works into a single page. The two-page structure is a starting hypothesis for this site, not a universal conversion rule. [Nielsen Norman Group](https://www.nngroup.com/articles/3-ia-mistakes/) explains why competing actions can reduce the visibility of each action.

## Verification

Run `npm run typecheck`, `npm test`, and `npm run verify:seo`.
The integration checks cover Home → How It Works → the signup link, provider contact, focused navigation, and legacy redirects preserving campaign parameters. SEO verification checks canonical metadata, hidden previews, retired sitemap entries, and generated hosting rules.
