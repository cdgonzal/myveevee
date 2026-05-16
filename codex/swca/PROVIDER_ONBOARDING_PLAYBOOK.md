# Provider Reward Campaign Onboarding Playbook

## Purpose

Make the second provider/clinic easier to launch by treating SWCA as the first reference implementation, then separating what is reusable from what must be customized for each new clinic.

The reward path should stay consistent:

1. Provider-sponsored reward landing page
2. General-interest intake form
3. Reward wheel
4. Winner contact capture
5. Reward email and secure certificate
6. Post-reward VeeVee profile CTA
7. Redacted admin dashboard and operational alerts

The page should feel like the clinic's campaign, with VeeVee as the quiet technology layer.

## Current SWCA Campaign Pages

| Route | Current page | Purpose | Reusable for new providers? | Clinic-specific inputs |
| --- | --- | --- | --- | --- |
| `/swca` | `src/swca/providerHub/SwcaProviderHub.tsx` | Lean provider hub for public reward, interest, and Health Twin account-creation paths | Mostly reusable | Provider name, logo, location, specialty, optional trust image, slug, action destinations |
| `/swca/rewards` | `src/swca/rewardsTeaser/SwcaRewardsTeaser.tsx` | QR/link landing page that motivates the user to start | Mostly reusable | Provider name, logo, colors, reward category, slug, CTA destination |
| `/swca/teaser` | client redirect in `src/App.tsx` | Compatibility alias to `/swca/rewards` | Reusable pattern | Alias path if the clinic needs one |
| `/swca/intake` | `src/swca/intakeForm/SpineWellnessIntakeForm.tsx` | General-interest selection, ranking, follow-up questions, consent, submit | Reusable after provider config extraction | Provider copy, logo, concern list, follow-up questions, consent copy, form id, API env var |
| `/swca/wheel` | `src/swca/rewardWheel/SwcaRewardWheel.tsx` | Validates intake token, spins reward wheel, collects winner contact | Reusable after provider config extraction | Logo, colors, reward slots, reward API env vars, contact wording |
| `/swca/certificate` | `src/swca/certificate/SwcaRewardCertificate.tsx` | Secure reward certificate linked from customer email | Reusable after provider config extraction | Provider name/logo/colors, redemption text, CTA copy, certificate API env var |
| `/swca/funnel` | `src/swca/profileFunnel/SwcaProfileFunnel.tsx` | Post-reward Health Twin CTA avatar variant | Reusable after provider config extraction | Provider trust copy, Health Twin CTA copy, redirect destination |
| `/swca/funnel-visual` | `src/swca/profileFunnel/SwcaProfileFunnelVisual.tsx` | Post-reward Health Twin CTA visual/function variant for funnel competition | Reusable after provider config extraction | Provider trust copy, visual/function card copy, redirect destination |
| `/swca/admin` | `src/swca/admin/SwcaAdminDashboard.tsx` | Redacted campaign reporting and executive summary | Reusable after provider config extraction | Provider name, admin passcode secret, report API env vars, exported report label |
| `/briefs/swca-4821.html` | `src/pages/SwcaBrief.tsx` plus static brief | Internal SWCA brief | Not part of the repeatable reward path | Only create if the new clinic needs an internal brief |

## Current SWCA Configuration Files

| File | What it controls | Reuse status |
| --- | --- | --- |
| `src/swca/rewardsTeaser/SwcaRewardsTeaser.tsx` | Provider-sponsored landing config is currently inline in `providerCampaign` | Good first extraction target |
| `src/swca/intakeForm/swca-intake-config.json` | Form id, concern options, top-ranked follow-up questions, generic intent questions | Should become provider-specific JSON |
| `src/swca/rewardWheel/reward-wheel-config.json` | Reward campaign id, reward version, slot count, labels, descriptions, values, colors, odds | Already marketing-editable; should become provider-specific JSON |
| `src/swca/profileFunnel/provider-comments.json` | Post-reward provider recommendation copy used by the desktop Health Twin CTA page | Should become provider-specific JSON or folded into the provider campaign registry |
| `src/swca/profileFunnel/variant.ts` | Deterministic A/B assignment between Health Twin CTA variants | Should become provider/campaign configurable |
| `src/config/links.ts` | Public route constants | Needs new provider route constants |
| `src/App.tsx` | Route registration and SWCA page-view tracking | Needs provider route registration and generic campaign tracking |
| `src/seo/routeMeta.ts` | Noindex metadata for campaign routes | Needs new provider route metadata |

## Current AWS Pieces

| Area | Current SWCA resource | Reuse status |
| --- | --- | --- |
| CDK construct | `infra/lib/partner-intake-form.ts` | Reusable backend construct |
| Stack instance | `infra/lib/myveevee-infra-stack.ts` creates `SwcaIntakeForm` | Add one construct instance per provider |
| Lambda source | `aws/swca-intake/handler.mjs`, `spin-handler.mjs`, `admin-handler.mjs` | Functionally reusable, but currently SWCA-named and copy contains SWCA assumptions |
| S3 | `myveevee-swca-intake-...` | One private bucket per provider is the cleanest pattern |
| DynamoDB | reward claims, contact dedupe, campaign events | One set per provider through CDK |
| Secrets Manager | admin passcode, admin token signing key, contact dedupe key | One secret set per provider |
| SES | verified sender and notification recipients | Reuse sender if approved; recipients vary by provider |
| SMS | disabled-by-default path | Enable only after AWS End User Messaging registration and opt-out controls |
| Amplify env vars | `VITE_SWCA_*` API URLs | Add provider-specific env vars or move to a generic provider config map |

## What Should Be Built Once Before Clinic 2

These are not blockers for SWCA, but they will make the second clinic much faster and less error-prone.

1. Create a `providerCampaigns` config layer.
   - Provider key, slug, display name, short name, logo path, colors, reward category, route paths, noindex flag, and API env var names.
   - Acceptance: the rewards teaser renders from config, not SWCA-only constants.

2. Extract reusable page components.
   - `ProviderRewardsTeaser`
   - `ProviderIntakeForm`
   - `ProviderRewardWheel`
   - `ProviderRewardCertificate`
   - `ProviderProfileFunnel`
   - `ProviderAdminDashboard`
   - Acceptance: SWCA still works while a second provider can be added mostly by config plus route registration.

3. Generalize event names and payloads.
   - Keep provider key in every event.
   - Avoid hardcoding `swca_` in future provider events.
   - Acceptance: admin reporting can filter by provider without changing the event table shape.

4. Decide backend source strategy.
   - Short term: instantiate `PartnerIntakeForm` per provider and reuse Lambda source where copy is safe.
   - Better next step: rename `aws/swca-intake` to a partner-neutral folder after SWCA is stable.
   - Acceptance: new provider deploy does not require copy/pasting three Lambda files unless provider-specific behavior truly differs.

## New Clinic Information Packet

Send this section to the clinic or internal owner. The goal is to receive everything needed to configure the campaign without repeated follow-up.

### 1. Clinic Identity

- Legal clinic/provider name:
- Public display name:
- Short name or abbreviation:
- Preferred URL slug:
  - Example: `/swca/rewards`
- Website:
- Main phone number:
- Main address or market:
- Primary operational contact name:
- Primary operational contact email:
- Escalation contact for reward issues:

### 2. Brand Assets

- Logo file:
  - Preferred: transparent PNG or SVG
  - Minimum width: 800 px
- Optional provider trust image:
  - Example: physician/team overview, clinic brochure panel, or approved profile graphic
  - Preferred: PNG or WebP, at least 1200 px wide
  - Use only on the provider hub, not on the reward CTA page, unless marketing explicitly approves that extra friction
- Primary brand color:
- Secondary brand color:
- Accent color:
- Any brand restrictions:
- Should VeeVee be shown as:
  - `Rewards powered by VeeVee`
  - another approved phrase:

### 3. Campaign Goal

- Main campaign goal:
  - Examples: weight loss consults, wellness plans, aesthetics consults, chiropractic follow-up, hormone services, new patient leads
- Reward category word:
  - Examples: wellness, aesthetics, recovery, weight loss, dental
- Desired CTA wording:
  - Recommended default: `Start now`
- Preferred campaign start date:
- Preferred campaign end date, if any:
- Expected traffic source:
  - QR code
  - email
  - SMS
  - front desk handout
  - social media
  - event booth
- Expected volume:
  - daily
  - weekly
  - total campaign

### 4. Form Content

The form must collect general interest signals only. Do not ask patients to enter private medical details.

- Top-level options users can select:
  - Option title:
  - Short description:
  - Follow-up question 1:
  - Answer options:
  - Follow-up question 2:
  - Answer options:
- Number of top-ranked options that should trigger follow-up questions:
  - Recommended default: 2
- Generic intent questions:
  - Recommended default: level of interest, timing, budget/payment preference, preferred next step
- Anything the clinic does not want asked:
- Required consent wording changes, if any:

### 5. Rewards

Provide one row per wheel slot.

| Slot | Reward label | Short wheel label | Description | Estimated value | Eligibility limits | Odds weight | Expiration |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 |  |  |  |  |  |  |  |
| 2 |  |  |  |  |  |  |  |
| 3 |  |  |  |  |  |  |  |
| 4 |  |  |  |  |  |  |  |
| 5 |  |  |  |  |  |  |  |

Reward rules to confirm:

- Can one person claim more than one reward?
- Should we enforce one reward per email or phone?
- Are rewards transferable?
- Are rewards limited to new patients, existing patients, or both?
- Are rewards subject to provider approval?
- Should certificate links expire?
- Who fulfills the reward at the clinic?

### 6. Customer Communication

- Customer reward email sender name:
- Reply-to email:
- Clinic inbox for internal notifications:
- Clinic inbox for reward exceptions:
- Email subject line preference:
- Reward redemption instructions:
- Required legal/disclaimer language:
- Should SMS be enabled later?
  - If yes, collect AWS SMS registration details separately.

### 7. Admin Dashboard Access

- Admin users who need access:
- Shared passcode owner:
- Who can receive exported CSV reports:
- Report cadence:
  - daily
  - weekly
  - campaign end
- Management questions the dashboard must answer:
- Any fields that should not appear even in redacted admin reporting:

### 8. Compliance And Data Boundaries

Confirm these rules with the clinic:

- The form is for general interest only.
- Users should not enter private medical details.
- Admin dashboard shows redacted reporting only.
- Raw contact details stay in AWS operational storage.
- Reward emails should not include selected wellness concerns.
- Clinic is responsible for reward eligibility and fulfillment.

## Implementation Checklist For Clinic 2

### Phase 1: Intake Packet Complete

Tasks:

- Receive clinic identity, logo, colors, and slug.
- Receive reward slot table.
- Receive form options and follow-up questions.
- Confirm admin contacts and notification inboxes.
- Confirm reward rules and privacy copy.

Acceptance:

- No placeholder reward labels, values, or eligibility rules remain.
- The campaign slug and provider display name are approved.
- The clinic confirms the form does not request private medical details.

### Phase 2: Frontend Campaign Setup

Tasks:

- Add provider assets under `public/<provider-key>/`.
- Add provider route constants.
- Add provider campaign config.
- Register noindex direct-link routes.
- Configure teaser, intake, wheel, certificate, Health Twin funnel, and admin pages.
- Add provider-specific JSON for form, rewards, and profile-funnel copy.

Acceptance:

- `/provider-key/rewards` loads with clinic branding.
- CTA goes to `/provider-key/intake`.
- Intake submits in local mock mode when API env vars are absent.
- Wheel and certificate pages do not expose reward details without valid tokens.

### Phase 3: AWS Backend Setup

Tasks:

- Add a `PartnerIntakeForm` instance for the provider.
- Create or reuse SES verified sender.
- Set recipient notification emails.
- Create provider admin passcode and token signing secrets.
- Deploy CDK.
- Add Amplify environment variables for the new API endpoints.

Acceptance:

- API Gateway routes exist for intake, reward spin, reward contact, certificate, events, admin session, and admin report.
- S3 bucket, DynamoDB tables, Lambda log groups, secrets, and alarms exist for the provider.
- Browser CORS allows `https://myveevee.com` and the Amplify branch URL.

### Phase 4: End-To-End Smoke Test

Tasks:

- Open rewards page from the public route.
- Complete intake with test values.
- Confirm S3 intake object exists.
- Spin reward once.
- Confirm repeat spin returns the same assigned reward.
- Save email contact.
- Confirm reward email arrives.
- Open certificate link.
- Confirm certificate-view event is captured.
- Open admin dashboard and confirm redacted report updates.

Acceptance:

- One end-to-end test succeeds from public route to certificate.
- Admin dashboard shows counts, reward status, message status, and abbreviated contact identity.
- No raw email or phone appears in dashboard output.

### Phase 5: Launch Handoff

Tasks:

- Provide final URLs to clinic:
  - rewards landing page
  - intake page if direct link is needed
  - admin dashboard
- Provide QR destination.
- Share admin passcode through an approved secure channel.
- Confirm alarm recipient and escalation process.
- Document campaign start date.

Acceptance:

- Clinic confirms the public URL and QR code.
- Clinic confirms reward fulfillment instructions.
- Operations knows where to check dashboard and what to do if alarms fire.

## Recommended Next Engineering Step

Extract the SWCA campaign config into a provider-neutral campaign registry before adding clinic 2. The current rewards teaser already has an inline `providerCampaign` object, which makes it the best first extraction point. After that, move intake, wheel, certificate, Health Twin funnel, and admin pages toward the same pattern.
