# SWCA Reward Communication Plan

## Objective

After a user completes the intake form, spins the wheel, and saves their name plus preferred contact method, send a clear reward communication and nudge them toward creating a free VeeVee profile.

The first production path should use SES email because the repo already uses SES and email is the cleanest channel for a branded reward certificate. SMS should follow after AWS End User Messaging SMS setup, registration, opt-out handling, and spend controls are confirmed.

## Product Principles

- Keep the user message simple: reward, redemption note, and VeeVee profile CTA.
- Do not include wellness concern details in customer-facing reward messages.
- Do not expose raw S3 object paths to users.
- Store durable records in AWS; show only redacted operational data in the dashboard.
- Track message sent, certificate viewed, and VeeVee CTA clicked as first-party campaign events.

## Phase 1: Reward Message Decision and Copy

Status: implemented for the email-first launch copy; SMS copy remains backlog-ready.

Goal: lock the exact customer communication before building.

Tasks:

- Confirm the email-first launch path.
- Confirm SMS is a follow-up phase, not the day-one blocker.
- Draft customer email subject, headline, reward body, redemption note, and VeeVee CTA.
- Draft short SMS copy for the later SMS phase.
- Confirm sender identity and reply-to handling.
- Confirm whether rewards need expiration language.

Acceptance criteria:

- Approved email copy exists in the repo.
- Approved SMS copy exists as backlog-ready copy.
- Copy includes reward name and VeeVee profile CTA.
- Copy does not include raw wellness concerns, phone number, email address, token, or S3 path.

## Phase 2: Reward Certificate Data Model

Status: implemented on the reward claim record.

Goal: create a durable reward certificate record without exposing S3 directly to the user.

Tasks:

- Add certificate fields to the reward claim record:
  - `certificateId`
  - `certificateTokenHash`
  - `certificateCreatedAt`
  - `certificateExpiresAt`
  - `messageChannel`
  - `messageStatus`
  - `messageSentAt`
  - `messageError`
- Store a private certificate JSON record in S3 or keep certificate data in DynamoDB and render it from the secure route.
- Decide token lifetime for certificate access.
- Keep the token out of logs.

Acceptance criteria:

- Contact save creates or updates one certificate record.
- Certificate token is returned or used only once for message-link creation.
- Raw S3 keys are not sent to the customer.
- Admin/reporting can identify whether a certificate was created.

## Phase 3: SES Email Reward Certificate

Status: implemented for `contactMethod=email`.

Goal: send the first customer reward message by email after contact details are saved.

Tasks:

- Extend the reward contact Lambda flow to send SES email when `contactMethod=email`.
- Build the email body with SWCA reward language and VeeVee profile CTA.
- Include a secure certificate link, not a raw S3 link.
- Record message status on the reward claim.
- Emit campaign events for email sent and email failure.
- Add CloudWatch logs without printing raw token or sensitive content.

Acceptance criteria:

- A valid email contact save sends one reward email.
- The email includes reward label, redemption note, secure certificate link, and VeeVee CTA.
- Duplicate contact save does not send duplicate emails unless explicitly allowed.
- SES failure is recorded without losing the saved contact data.
- Admin dashboard can show whether the reward message was sent.

## Phase 4: Secure Certificate Page

Status: implemented as `/swca/certificate` plus the reward certificate API.

Goal: let users view a branded reward certificate from a secure, trackable web route.

Tasks:

- Add a route such as `/swca/certificate`.
- Validate `certificateId` and token through a backend endpoint.
- Render SWCA branding, reward name, redemption note, and VeeVee profile CTA.
- Track certificate view and CTA click through the existing event endpoint.
- Show a friendly expired or invalid-link state.

Acceptance criteria:

- Valid certificate link renders the correct reward.
- Invalid or expired token does not reveal reward details.
- Certificate page never displays raw intake concerns, raw S3 paths, or backend tokens.
- Certificate view and VeeVee CTA click are visible in first-party event counts.

## Phase 5: Admin Dashboard Message Status

Status: mostly implemented. Admin report, dashboard rows, and CSV include message status. Certificate-view tracking is captured as a first-party event, but the dashboard does not yet join that event back into each row as a viewed/not-viewed indicator.

Goal: make reward communication status visible to management and operators.

Tasks:

- Add message status fields to the admin report payload.
- Add dashboard indicators for certificate created and message sent.
- Add a future dashboard indicator for certificate viewed by joining certificate-view events back to recent reward rows.
- Add CSV columns for message channel and status.
- Keep raw phone and email hidden from the dashboard.

Acceptance criteria:

- Admin dashboard shows reward communication progress without raw contact details.
- CSV export includes message status.
- A manager can identify users needing manual follow-up.

## Phase 6: SMS Follow-Up

Goal: add text messaging only after email launch is stable.

Status: code path is complete and disabled by default; AWS registration and production enablement remain pending. See `codex/swca/SMS_IMPLEMENTATION_PLAN.md`.

## Current Verification

- CDK deploy added the reward certificate API route and reward Lambda SES permissions.
- Amplify deploy published `/swca/certificate`.
- Live smoke test submission `731a0f54-9537-4715-a658-7c49ded7029d` completed intake, spin, email contact save, and reward message send.
- DynamoDB reward claim shows `messageStatus=sent`, `messageChannel=email`, `messageSentAt`, `certificateId`, `certificateCreatedAt`, and `certificateExpiresAt`.
- Campaign event table contains `swca_reward_email_sent` for the smoke-test submission.
- `/swca/certificate` serves from the live Amplify site.
- Certificate lookup was fixed to scan until the matching certificate id is found before validating the secure token hash.
- API Gateway CORS was corrected for `https://myveevee.com`, `https://www.myveevee.com`, and the Amplify branch URL after mobile/incognito submit failures.
- One-reward-per-contact enforcement is live for normalized email or phone values. Duplicate contacts show a clear denial message and redirect users to their assigned Health Twin CTA variant so the campaign still moves them toward VeeVee.
- Post-reward funnel competition is live in code: `/swca/funnel` is the avatar variant and `/swca/funnel-visual` is the visual/function variant. Assignment uses `submissionId` to keep traffic close to 50/50.
- Latest end-to-end verification on 2026-05-15 used submission `7db059ef-eca9-439b-a398-e0ebd413b15d`: intake succeeded, wheel selected `Wellness Gift`, reward contact saved by email, SES message status was `sent`, certificate `f0c9ee71-11f8-4341-9948-b6f085a68a04` was created, and `swca_reward_certificate_view` was captured for the same submission and reward id.

Tasks:

- Configure AWS End User Messaging SMS resources.
- Confirm origination identity, spend limits, opt-out behavior, and message type.
- Add SMS send path for `contactMethod=phone`, gated by `SMS_DELIVERY_ENABLED`.
- Use the same secure certificate link and VeeVee CTA.
- Store SMS sent/failure status on the reward claim.

Acceptance criteria:

- SMS can be sent to a verified test number.
- Message includes reward link, VeeVee CTA, and opt-out language.
- SMS failures are visible in logs and admin message status.
- Phone numbers are not exposed in the admin dashboard.

## Current Operations Track

Customer reward communication is complete for the email-first launch path. Current operations work is handoff and readiness:

- Rotate the shared SWCA admin passcode before broad team sharing.
- Use `codex/swca/ADMIN_RUNBOOK.md` for passcode handling, report refresh, CSV export, alarm handling, and stale-count troubleshooting.
- Decide who receives operational alerts and whether `info@veevee.io` remains the SNS destination.
- Confirm the admin dashboard report answers the first management questions after the live pilot starts.
- Continue SMS registration, but keep SMS disabled until AWS approval and a controlled test send are complete.

## Backlog

- Finalize marketing reward labels, descriptions, values, and odds in `src/swca/rewardWheel/reward-wheel-config.json`.
- Add per-row certificate viewed status to the admin report.
- Add deeper operations reporting that joins S3 intake records with DynamoDB reward records.
- Add the GA4 dashboard tab through a server-side Google Analytics Data API integration.
- Enable SMS reward delivery after AWS End User Messaging SMS setup, registration, opt-out handling, and spend controls are confirmed.
- Create the next partner/clinic form by adding a new `PartnerIntakeForm` configuration.
