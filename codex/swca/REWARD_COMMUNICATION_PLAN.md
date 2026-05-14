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

Status: partially implemented. Admin report and CSV include message status; the dashboard row shows basic message status.

Goal: make reward communication status visible to management and operators.

Tasks:

- Add message status fields to the admin report payload.
- Add dashboard indicators for certificate created, message sent, and certificate viewed.
- Add CSV columns for message channel and status.
- Keep raw phone and email hidden from the dashboard.

Acceptance criteria:

- Admin dashboard shows reward communication progress without raw contact details.
- CSV export includes message status and certificate status.
- A manager can identify users needing manual follow-up.

## Phase 6: SMS Follow-Up

Goal: add text messaging only after email launch is stable.

Status: backlog.

Tasks:

- Configure AWS End User Messaging SMS resources.
- Confirm origination identity, spend limits, opt-out behavior, and message type.
- Add SMS send path for `contactMethod=phone`.
- Use the same secure certificate link and VeeVee CTA.
- Store SMS sent/failure status on the reward claim.

Acceptance criteria:

- SMS can be sent to a verified test number.
- Message includes reward link, VeeVee CTA, and opt-out language.
- SMS failures are visible in logs and admin message status.
- Phone numbers are not exposed in the admin dashboard.

## Post-Communication Backlog

Move these items back to active work only after the customer reward communication path is complete:

- Rotate the shared SWCA admin passcode before broad team sharing.
- Finalize marketing reward labels, descriptions, values, and odds in `src/swca/rewardWheel/reward-wheel-config.json`.
- Add an admin runbook for passcode sharing, report refresh, CSV export, alarm handling, and stale-count troubleshooting.
- Add deeper operations reporting that joins S3 intake records with DynamoDB reward records.
- Add the GA4 dashboard tab through a server-side Google Analytics Data API integration.
- Create the next partner/clinic form by adding a new `PartnerIntakeForm` configuration.
