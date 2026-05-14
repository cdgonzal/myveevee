# SWCA Intake AWS Backend

This folder contains the AWS-native backend source for the campaign-only SWCA intake form at `/swca/intake` and the post-intake reward wheel at `/swca/wheel`.

Current deployed intake endpoint:

```text
https://6o3st0r6ee.execute-api.us-east-1.amazonaws.com/forms/swca-intake
```

Current deployed reward spin endpoint:

```text
https://6o3st0r6ee.execute-api.us-east-1.amazonaws.com/forms/swca-reward-spin
```

Current deployed reward contact endpoint:

```text
https://6o3st0r6ee.execute-api.us-east-1.amazonaws.com/forms/swca-reward-contact
```

Current deployed storage bucket:

```text
myveevee-swca-intake-767828748348-us-east-1
```

## Runtime Path

`Amplify-hosted React form -> API Gateway HTTP API -> Lambda -> S3 + SES`

The browser should call API Gateway only. It should never call SES directly and should never carry AWS credentials.

Planned reward-wheel extension:

`Amplify-hosted React form -> intake API -> S3 + SES + DynamoDB reward eligibility -> spin API -> DynamoDB reward claim`

The frontend may animate the wheel, but Lambda owns the reward assignment and DynamoDB enforces one spin per valid intake submission.

Admin/reporting extension:

`SWCA campaign pages -> event API -> DynamoDB campaign events`

`/swca/admin -> admin session API -> Secrets Manager passcode check -> admin report API -> redacted DynamoDB report`

The admin report returns abbreviated names and contact method only. It does not return raw email addresses or phone numbers.

## Lambda Environment

Required:

- `SUBMISSIONS_BUCKET`: private S3 bucket for intake submissions.
- `SES_FROM_EMAIL`: verified SES sender identity.
- `SES_TO_EMAILS`: comma-separated recipient list.
- `ALLOWED_ORIGINS`: comma-separated allowed browser origins.
- `REWARD_CLAIMS_TABLE`: DynamoDB table for reward eligibility and one-time claim state.
- `CAMPAIGN_EVENTS_TABLE`: DynamoDB table for first-party campaign events.
- `ADMIN_PASSCODE_SECRET_NAME`: Secrets Manager secret name for the shared SWCA admin passcode.
- `ADMIN_TOKEN_SECRET_NAME`: Secrets Manager secret name for the admin session signing key.

Optional:

- `SUBMISSIONS_PREFIX`: S3 key prefix. Defaults to `forms/swca-wellness-priority-intake`.

Example `ALLOWED_ORIGINS`:

```text
https://myveevee.com,https://main.dc8zya6af7720.amplifyapp.com,http://127.0.0.1:5173,http://127.0.0.1:5174
```

## Frontend Environment

This value is configured in the Amplify `main` branch environment:

```text
VITE_SWCA_INTAKE_API_URL=https://6o3st0r6ee.execute-api.us-east-1.amazonaws.com/forms/swca-intake
```

The reward spin endpoint is configured in the Amplify `main` branch environment:

```text
VITE_SWCA_REWARD_SPIN_API_URL=https://6o3st0r6ee.execute-api.us-east-1.amazonaws.com/forms/swca-reward-spin
```

Without these values in a local or future branch environment, the React form and wheel stay in local mock mode and do not send network requests.

These additional values are configured in the Amplify `main` branch environment:

```text
VITE_SWCA_EVENT_API_URL=https://6o3st0r6ee.execute-api.us-east-1.amazonaws.com/forms/swca-event
VITE_SWCA_ADMIN_SESSION_API_URL=https://6o3st0r6ee.execute-api.us-east-1.amazonaws.com/forms/swca-admin-session
VITE_SWCA_ADMIN_REPORT_API_URL=https://6o3st0r6ee.execute-api.us-east-1.amazonaws.com/forms/swca-admin-report
```

## API Contract

Request:

```json
{
  "formId": "swca-wellness-priority-intake",
  "sourcePath": "/swca/intake",
  "pageUrl": "https://myveevee.com/swca/intake",
  "clientSubmittedAt": "2026-05-13T00:00:00.000Z",
  "userAgent": "...",
  "selectedConcernIds": ["poor-sleep-insomnia", "stress-anxiety-burnout"],
  "rankedConcernIds": ["stress-anxiety-burnout", "poor-sleep-insomnia"],
  "concernsSnapshot": [],
  "honeypot": ""
}
```

Success response after the next backend deploy:

```json
{
  "ok": true,
  "submissionId": "<uuid>",
  "wheelUrl": "/swca/wheel?sid=<uuid>&token=<one-time-token>"
}
```

Validation failures return `400` with a safe `message`.

The token is returned to the browser once and stored only as a hash in DynamoDB.

## Reward Spin API Contract

Request:

```json
{
  "submissionId": "<uuid>",
  "token": "<one-time-token>"
}
```

First valid spin response:

```json
{
  "ok": true,
  "alreadySpun": false,
  "submissionId": "<uuid>",
  "reward": {
    "id": "wellness-credit-25",
    "label": "$25 Wellness Credit",
    "version": "2026-05-v1"
  }
}
```

Repeated valid spin response returns the same reward with `alreadySpun: true`.

Invalid or missing tokens return a safe error and do not create a reward claim.

## Reward Contact API Contract

Request:

```json
{
  "submissionId": "<uuid>",
  "token": "<one-time-token>",
  "firstName": "Jane",
  "lastName": "Example",
  "contactMethod": "email",
  "email": "jane@example.com"
}
```

For phone contact:

```json
{
  "submissionId": "<uuid>",
  "token": "<one-time-token>",
  "firstName": "Jane",
  "lastName": "Example",
  "contactMethod": "phone",
  "phone": "555-555-5555"
}
```

The contact endpoint only saves details for a valid token after a reward has already been claimed.

## Campaign Event API Contract

Request:

```json
{
  "eventName": "swca_intake_submit_success",
  "pagePath": "/swca/intake",
  "pageUrl": "https://myveevee.com/swca/intake",
  "sessionId": "<browser-session-id>",
  "submissionId": "<uuid>",
  "rewardId": "wellness-gift",
  "contactMethod": "email",
  "mode": "live",
  "params": {
    "selected_count": 3
  }
}
```

The endpoint rejects event names that do not start with `swca_`. It stores hashed request context and does not accept raw contact details.

## Admin API Contract

Create session:

```json
{
  "passcode": "<shared-admin-passcode>"
}
```

Success response:

```json
{
  "ok": true,
  "token": "<signed-session-token>",
  "expiresAt": 1770000000
}
```

Fetch report:

```text
GET /forms/swca-admin-report
Authorization: Bearer <signed-session-token>
```

The report includes aggregate counts, event counts, reward distribution, contact-method distribution, and recent redacted rows.

## S3 Object Shape

Objects are written as JSON under:

```text
forms/swca-wellness-priority-intake/year=YYYY/month=MM/day=DD/<submissionId>.json
```

The object contains:

- `formId`
- `submissionId`
- `submittedAt`
- `clientSubmittedAt`
- `sourcePath`
- `pageUrl`
- `selectedConcernIds`
- `rankedConcernIds`
- `selectedConcerns`
- `rankedConcerns`
- limited request context

## DynamoDB Reward Claim Shape

Reward eligibility and claim records are keyed by `submissionId` and contain:

- `submissionId`
- `campaignId`
- `formId`
- `status`
- `tokenHash`
- `createdAt`
- `spunAt` after claim
- `rewardId` after claim
- `rewardLabel` after claim
- `rewardVersion` after claim
- `contactFirstName` after winner contact submission
- `contactLastName` after winner contact submission
- `contactMethod` after winner contact submission
- `contactEmail` after winner contact submission when email is selected
- `contactPhone` after winner contact submission when phone is selected
- `contactSavedAt` after winner contact submission
- hashed request context for basic abuse review

The raw token is never stored.

## DynamoDB Campaign Event Shape

Campaign events are keyed by `eventId` and contain:

- `eventId`
- `campaignId`
- `formId`
- `eventName`
- `occurredAt`
- `pagePath`
- `pageUrl`
- `sessionId`
- `submissionId`
- `rewardId`
- `contactMethod`
- `mode`
- sanitized primitive `params`
- hashed request context
- `expiresAtEpoch` TTL value

## Marketing Reward Config

Reward slots are configured in:

```text
src/swca/rewardWheel/reward-wheel-config.json
```

Marketing can edit:

- `totalSlots`
- `slotNumber`
- `label`
- `shortLabel`
- `description`
- `estimatedValue`
- `weight`
- `color`

`totalSlots` must match the number of objects in `slots`. `weight` controls odds and is used by the backend, not the browser.

## SES Notification

The email contains:

- submission id
- submitted timestamp
- source path and page URL
- S3 object location
- ranked priorities

The S3 object remains the durable record.

Current SES values:

- sender: `info@veevee.io`
- recipient: `info@veevee.io`
- SES account status: production access enabled in `us-east-1`

## CloudWatch Alarms

CDK manages operational alarms for the live SWCA backend:

- SNS topic: `myveevee-swca-intake-operational-alerts`
- Default alert recipient: `info@veevee.io`
- Lambda error alarms for intake, reward spin/contact, and admin/event handlers
- API Gateway 5xx alarm
- API Gateway high-volume alarm at 250 requests in five minutes

The SNS email subscription for `info@veevee.io` is confirmed.

## Minimum IAM

Lambda execution role:

- `s3:PutObject` on the target bucket/prefix.
- `dynamodb:PutItem` on the reward claims table for intake eligibility creation.
- `ses:SendEmail` on the verified sender identity or account-level SES scope selected for launch.
- CloudWatch Logs permissions.

Reward spin Lambda execution role:

- `dynamodb:GetItem` and `dynamodb:UpdateItem` on the reward claims table.
- CloudWatch Logs permissions.

Admin/event Lambda execution role:

- `dynamodb:Scan` on the reward claims table for redacted reporting.
- `dynamodb:PutItem` and `dynamodb:Scan` on the campaign events table.
- `secretsmanager:GetSecretValue` on the configured passcode and signing-key secrets.
- read access to the S3 submission prefix for future report enrichment.
- CloudWatch Logs permissions.

Keep the S3 bucket private with public access blocked and server-side encryption enabled.

## Current Verification

- Live API test returned submission id `4951deed-8fc7-4c9e-86db-b0f7cd40ee02`.
- S3 object was created at `forms/swca-wellness-priority-intake/year=2026/month=05/day=14/4951deed-8fc7-4c9e-86db-b0f7cd40ee02.json`.
- Lambda log group `/aws/lambda/myveevee-swca-intake-handler` confirmed `SWCA intake submission stored and emailed`.
- Invalid payload testing returned `400` and did not create another S3 object.
- Reward backend CDK deployment completed successfully.
- Amplify release job `207` succeeded after setting `VITE_SWCA_REWARD_SPIN_API_URL`.
- Live reward smoke test returned submission id `fdf214c6-2251-4267-8982-a99c635215a2`.
- Reward spin returned reward `wellness-gift`.
- Duplicate spin returned the same reward with `alreadySpun: true`.
- Reward contact endpoint saved winner contact fields to DynamoDB.
- Admin/event backend source validates with `node --check aws/swca-intake/admin-handler.mjs`.
- CDK synth bundles the admin Lambda and emits the campaign event, admin session, and admin report outputs.
- Admin/event backend is deployed and the Amplify `main` branch has the live event, admin session, and admin report endpoint env vars.
- Live admin/event smoke test confirmed the passcode session route, event write route, and redacted report route.
- Operational alarm CDK deploy completed successfully; AWS CLI verification found five CloudWatch alarms under the `myveevee-swca-intake` prefix.
- SNS subscription for `info@veevee.io` is confirmed.

## What Is Next

- Ask marketing to finalize `src/swca/rewardWheel/reward-wheel-config.json` before campaign traffic.
- Rotate the SWCA admin passcode before broad team sharing.
- Add a short admin runbook for passcode sharing, manual rotation, report refresh, CSV export, and stale-count troubleshooting.
- Decide whether the email should include full ranked priorities long term or only a summary plus S3 submission id.
