# SWCA Mobile Funnel UX Plan

## Goal

Make the SWCA reward path feel like a forward-moving mobile campaign instead of a set of long pages. Users should be able to tap through the path with minimal reading, minimal scrolling, and clear next steps.

Desktop should remain mostly unchanged. Improvements should be mobile-first through responsive layout, mobile-only sticky actions, mobile-only modals or bottom sheets, and auto-scroll behavior.

## Current Problem

Marketing feedback:

- Mobile pages feel too text-heavy.
- Users should be able to click, click, click without thinking or scrolling much.
- `/swca/rewards` should get users to the CTA faster.
- `/swca/wheel` spins nicely, but after the spin the user remains visually anchored on the wheel and must scroll to find the reward and contact form.
- Mobile should feel like a guided forward process.

## Principles

- Keep provider trust, but compress it on mobile.
- One primary action per mobile viewport.
- Move the user forward after every meaningful tap.
- Do not require the user to discover the next step by scrolling.
- Keep desktop behavior stable unless a shared improvement is obviously safe.
- Continue avoiding PHI collection in the public campaign flow.

## Recommended Implementation Order

1. Mobile-only `/swca/rewards` simplification.
2. Mobile `/swca/wheel` post-spin reward/result handoff.
3. Mobile `/swca/intake` step guidance and sticky action improvements.
4. End-to-end mobile QA and production smoke test.

## Phase 1: Mobile Teaser One-Screen CTA

Status: complete. `/swca/rewards` now uses mobile-specific compact provider identity, short reward copy, a full-width above-the-fold CTA, compact trust text, and a smaller mobile reward-wheel visual while preserving the desktop layout.

Goal: make `/swca/rewards` a fast mobile conversion page.

Tasks:

- Keep desktop layout as-is.
- On mobile, compress the header:
  - smaller logo
  - provider short name
  - "Rewards powered by VeeVee" or equivalent short trust line
- Keep only the essential hero:
  - `Unlock your wellness reward.`
  - one short support line
  - one primary CTA
- Keep CTA above the fold on common mobile sizes.
- Shrink and reposition the reward-wheel visual on mobile so it supports the CTA without competing with it.
- Move privacy/reward eligibility text below the first viewport on mobile, or reduce it to a single compact line.
- Preserve CTA tracking.

Acceptance Criteria:

- On a 390 x 844 viewport, the user sees provider trust, headline, support line, and CTA without scrolling.
- The primary CTA remains `/swca/intake`.
- The mobile first viewport has no long paragraphs.
- Desktop screenshot remains visually close to the current provider-sponsored teaser.
- `npm run build` passes.
- Browser check confirms `/swca/rewards` mobile has one obvious CTA above the fold.

Regression Checks:

- `/swca/rewards` route remains `noindex`.
- `/swca/teaser` still redirects to `/swca/rewards`.
- CTA event `swca_rewards_start_intake` still fires.

## Phase 2: Mobile Wheel Result Handoff

Status: complete. `/swca/wheel` now opens a mobile-only reward claim sheet after the spin completes. The sheet shows the backend-assigned reward and the contact capture form immediately, while the existing desktop wheel/result layout remains in place.

Goal: after the user spins, immediately move them to the reward result and contact capture without manual scrolling.

Preferred UX:

- Desktop can keep the current two-column or scrollable layout.
- Mobile should show the reward result in a modal or bottom sheet after the spin completes.
- The bottom sheet should include:
  - reward label
  - short reward description
  - first name / last name
  - contact method
  - email or phone field
  - `Send my reward`
- If a modal/bottom sheet is too much for the first pass, implement smooth auto-scroll to the reward/contact section when the spin completes.

Tasks:

- Add a mobile viewport check with Chakra responsive display or a media-query hook.
- After spin success and animation completion, open a mobile reward claim panel or scroll the result section into view.
- Keep the wheel visible enough to confirm the spin happened, but do not make the user search for the next form.
- Keep contact-save validation and one-reward-per-contact behavior unchanged.
- Keep the existing spam-folder toast copy.
- Preserve existing reward events:
  - `swca_reward_spin_success`
  - `swca_reward_contact_saved`
  - `swca_reward_contact_error`

Acceptance Criteria:

- On mobile, after tapping the wheel or spin button, the user sees the reward result/contact capture without manually scrolling.
- The reward selected by the backend is the reward shown to the user.
- Contact form remains reachable with one obvious action.
- Existing desktop wheel behavior remains usable and visually close to current.
- Repeat-spin behavior still returns the same reward.
- `npm run build` and `npm test -- --run` pass.

Regression Checks:

- Invalid wheel links still show the invalid-link state.
- Already-spun links still show the assigned reward.
- Contact save still redirects to `/swca/funnel` after success.
- Email reward delivery remains unchanged.

## Phase 3: Mobile Intake Step Guidance

Status: complete. `/swca/intake` now uses mobile-gated steps without the old progress pills: users select concerns, tap the bottom action to rank, tap `Ready!`, then consent and answer the one-question-at-a-time follow-up modal.

Goal: make `/swca/intake` feel like a guided sequence rather than a long form.

Tasks:

- Keep desktop layout as-is.
- On mobile, reduce explanatory copy above the concern list.
- Do not show the old `1 Select / 2 Rank / 3 Agree / 4 Answer` pills; marketing asked to remove them.
- After the first concern selection, make the next action visually obvious.
- After ranking is complete, scroll or focus the user toward the large consent card.
- Keep the large full-card consent control.
- Consider a mobile sticky bottom CTA once selection/ranking requirements are satisfied.
- Keep the follow-up modal one-question-at-a-time and auto-advance behavior.

Acceptance Criteria:

- On mobile, users can understand the current step from the visible question and bottom CTA, without the old progress pills.
- Consent card is easy to tap and remains visually prominent.
- The Continue CTA is visible or quickly reachable after the user completes required selections/ranking.
- Follow-up modal remains one question at a time.
- Required answers still block submission until complete.
- `npm run build` and `npm test -- --run` pass.

Regression Checks:

- S3 intake payload still includes selected concerns, ranked concerns, follow-up answers, intent answers, and consent evidence.
- Admin report still shows redacted signal summaries.
- No raw email or phone appears in admin report output.

## Phase 4: Mobile End-To-End QA

Goal: verify the full path as a real user on mobile.

Test path:

1. Open `/swca`.
2. Tap `Claim a reward`.
3. Confirm `/swca/rewards` first viewport is CTA-forward.
4. Tap CTA to `/swca/intake`.
5. Select concerns by tapping rows.
6. Rank choices.
7. Tap the large consent card.
8. Complete follow-up questions.
9. Submit intake.
10. Spin wheel.
11. Confirm reward/contact capture appears without manual scrolling.
12. Save email contact.
13. Confirm redirect to `/swca/funnel`.
14. Confirm reward email arrives and certificate link opens.

Acceptance Criteria:

- The mobile path can be completed with minimal manual scrolling.
- No step leaves the user wondering where to tap next.
- Reward result is visible immediately after spin completion.
- Contact save succeeds.
- Email and certificate path still work.
- Campaign events are captured for page views, intake success, spin success, contact saved, and certificate view.

Validation Commands:

```text
npm run build
npm test -- --run
npm run typecheck
```

Known baseline:

- `npm run typecheck` currently fails on unrelated pre-existing issues in `src/pages/AvatarPlaybackTest.tsx` and `src/pages/HealthTwinFunnel.tsx`.

## Future Enhancements

- Add a mobile-only progress tracker across the full SWCA funnel.
- Add a brief haptic-style visual response to important taps.
- Add analytics for mobile scroll depth and post-spin result visibility.
- Build a generic provider mobile-funnel component once SWCA mobile UX is validated.
- Add automated Playwright checks for mobile first-viewport CTA visibility.

## Latest Mobile Outcome

- The reward teaser follows the provider-sponsored mobile mockup with SWCA identity, a dominant `Start now` CTA, compact reassurance copy, and the wheel visible lower on the screen.
- The intake removes progress pills and uses bottom actions to force the next mobile step instead of allowing users to scroll past the intended flow.
- The wheel opens the reward/contact capture on mobile after spin completion.
- Duplicate reward contacts show the rejection toast and then redirect to the assigned Health Twin CTA variant, keeping the funnel moving.
- Reward completion now runs a funnel competition: `/swca/funnel` is the avatar variant and `/swca/funnel-visual` is the visual/function variant. Assignment is deterministic from `submissionId` so traffic stays close to 50/50.
