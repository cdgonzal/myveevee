# SWCA Admin Runbook

## Purpose

Use this runbook to operate the SWCA reward campaign without querying AWS manually for routine questions.

The admin dashboard is for campaign visibility and management reporting. It shows redacted data only: abbreviated names, selected contact method, reward status, message status, and aggregate counts. Raw email addresses, phone numbers, and full intake payloads stay in AWS operational storage.

## Live Links

- Teaser page: `https://myveevee.com/swca/rewards`
- Intake form: `https://myveevee.com/swca/intake`
- Admin dashboard: `https://myveevee.com/swca/admin`
- Reward certificate route: `https://myveevee.com/swca/certificate`

## Access

- Admin users open `/swca/admin`.
- The dashboard requires the shared SWCA admin passcode.
- Do not put the passcode in Slack channels, email threads, documents, screenshots, or this repo.
- Credential rotation is intentionally deferred. Rotate the passcode before broad team sharing or whenever access should be revoked.

If access fails:

1. Confirm the user is on `https://myveevee.com/swca/admin`.
2. Confirm they are using the current passcode.
3. Try a private/incognito browser window.
4. If still failing, check the admin session endpoint and CloudWatch alarms.

## Daily Campaign Check

Open `/swca/admin` and confirm:

- Total submissions are increasing when traffic is expected.
- Intake completions roughly match QR/link campaign activity.
- Reward spins are present after submissions.
- Contact saves are present after spins.
- Email message status is mostly `sent`.
- Reward distribution looks reasonable.
- Recent rows show abbreviated names only and no raw contact details.
- Duplicate-contact attempts are not treated as system failures; they are expected to deny a second reward and push the user to the assigned Health Twin CTA variant.

If the counts are flat during an active campaign:

- Confirm the public QR/link points to `/swca/rewards` or `/swca/intake`.
- Confirm the intake form can submit from a fresh mobile browser.
- Confirm CloudWatch alarms are `OK`.
- Check whether API Gateway CORS still allows `https://myveevee.com` and `https://www.myveevee.com`.

## Management Report

Use the dashboard for the current management snapshot:

- Total intake submissions
- Reward spins
- Reward contact saves
- Email message status
- Reward distribution
- Contact-method distribution
- Recent redacted submissions
- Executive summary tab

For a management update, lead with:

- How many people started or completed the campaign path
- How many reached the reward step
- Which rewards were assigned
- How many users provided a contact method
- Whether messages are being sent successfully
- Any operational issue that needs follow-up

## CSV Export

Use CSV export when management wants a spreadsheet-style snapshot.

Before sharing:

- Confirm the export contains abbreviated names only.
- Confirm it does not include raw email or phone values.
- Confirm message status and reward label are present.
- Treat the file as operational campaign data and share only with approved staff.

## Reward Follow-Up

For email contacts:

- The system sends the reward email through SES after contact details are saved.
- The email includes a secure certificate link.
- The certificate page confirms the assigned reward and nudges the user toward the VeeVee profile CTA.

For phone contacts:

- SMS is not active yet. The disabled-by-default implementation plan is `codex/swca/SMS_IMPLEMENTATION_PLAN.md`.
- Phone contacts require manual follow-up until SMS delivery is implemented.
- Do not export or distribute raw phone data through the admin dashboard.

## Alarm Response

Operational alerts currently go to the configured SNS email recipient.

If an alarm fires:

1. Identify the alarm name.
2. Check whether the issue is Lambda errors, API Gateway 5xx responses, or high request volume.
3. Check the matching CloudWatch log group:
   - `/aws/lambda/myveevee-swca-intake-handler`
   - `/aws/lambda/myveevee-swca-intake-reward-spin-handler`
   - `/aws/lambda/myveevee-swca-intake-admin-handler`
4. Confirm whether users are blocked or whether the issue is isolated.
5. Record the time window, error message, and affected route.

Common checks:

- Intake failures: validate the intake API, S3 write, SES internal notification, and reward eligibility creation.
- Reward failures: validate the reward token, DynamoDB reward claim, and SES reward email status.
- Admin failures: validate the admin passcode secret, token signing secret, and report endpoint.
- CORS failures: validate API Gateway allowed origins include `https://myveevee.com` and `https://www.myveevee.com` as separate entries.

## Stale Count Troubleshooting

If dashboard counts look stale:

1. Refresh the dashboard after logging in again.
2. Confirm new submissions exist by running a fresh end-to-end test.
3. Confirm the admin report endpoint responds.
4. Check recent campaign events for page views, intake success, reward spin success, contact saved, email sent, and certificate viewed.
5. Check whether the admin report is missing S3, DynamoDB, or event-table data.

Current durable sources:

- S3 intake archive: `myveevee-swca-intake-767828748348-us-east-1`
- DynamoDB reward claims: `myveevee-swca-intake-reward-claims`
- DynamoDB campaign events: `myveevee-swca-intake-campaign-events`

## Abuse Review Notes

The reward claim record stores hashed request context and spin telemetry for basic abuse review. This includes hashed IP signals, hashed user-agent data, browser/device summary fields, and sanitized client hints. Raw IP addresses, raw user-agent strings, raw emails, and raw phone numbers are not exposed in the admin dashboard.

## Known Backlog

- Rotate the shared admin passcode before broad team sharing.
- Confirm final operational alert recipients.
- Add per-row certificate viewed status to the admin report.
- Add deeper S3 plus DynamoDB joined reporting.
- Add GA4 dashboard integration later through a server-side Google Analytics Data API path.
- Enable SMS reward delivery after AWS End User Messaging SMS setup is complete.
- Add a dashboard funnel-variant comparison if management wants conversion reporting directly in `/swca/admin`.
