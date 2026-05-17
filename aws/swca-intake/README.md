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

Current deployed reward certificate endpoint:

```text
https://6o3st0r6ee.execute-api.us-east-1.amazonaws.com/forms/swca-reward-certificate
```

Current deployed storage bucket:

```text
myveevee-swca-intake-767828748348-us-east-1
```

## Runtime Path

`Amplify-hosted React form -> API Gateway HTTP API -> Lambda -> S3 + SES`

The browser should call API Gateway only. It should never call SES directly and should never carry AWS credentials.

Reward-wheel path:

`Amplify-hosted React form -> intake API -> S3 + SES + DynamoDB reward eligibility -> spin API -> DynamoDB reward claim`

The frontend may animate the wheel, but Lambda owns the reward assignment and DynamoDB enforces one spin per valid intake submission.

Admin/reporting extension:

`SWCA campaign pages -> event API -> DynamoDB campaign events`

`/swca/admin -> admin session API -> Secrets Manager passcode check -> admin report API -> redacted DynamoDB + S3 report`

The admin report returns abbreviated names, contact method, reward status, and structured intake signal summaries. It does not return raw email addresses, phone numbers, or full sensitive intake notes.

## Lambda Environment

Required:

- `SUBMISSIONS_BUCKET`: private S3 bucket for intake submissions.
- `SES_FROM_EMAIL`: verified SES sender identity.
- `SES_TO_EMAILS`: comma-separated recipient list.
- `ALLOWED_ORIGINS`: comma-separated allowed browser origins.
- `REWARD_CLAIMS_TABLE`: DynamoDB table for reward eligibility and one-time claim state.
- `REWARD_CONTACT_CLAIMS_TABLE`: DynamoDB table for one-reward-per-contact enforcement.
- `CAMPAIGN_EVENTS_TABLE`: DynamoDB table for first-party campaign events.
- `CONTACT_DEDUPE_SECRET_NAME`: Secrets Manager secret name for the HMAC key used to hash reward contact values.
- `ADMIN_PASSCODE_SECRET_NAME`: Secrets Manager secret name for the shared SWCA admin passcode.
- `ADMIN_TOKEN_SECRET_NAME`: Secrets Manager secret name for the admin session signing key.
- `PUBLIC_BASE_URL`: public site base URL used in customer reward links.
- `SMS_DELIVERY_ENABLED`: set to `true` only after AWS End User Messaging SMS setup is approved.
- `SMS_ORIGINATION_IDENTITY`: AWS End User Messaging SMS phone number, sender id, pool id, or ARN used for reward SMS.
- `SMS_CONFIGURATION_SET_NAME`: optional AWS End User Messaging SMS configuration set.

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

The certificate endpoint can be configured explicitly or derived from the reward spin endpoint:

```text
VITE_SWCA_REWARD_CERTIFICATE_API_URL=https://6o3st0r6ee.execute-api.us-east-1.amazonaws.com/forms/swca-reward-certificate
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
  "topRankedConcernIds": ["stress-anxiety-burnout", "poor-sleep-insomnia"],
  "followUpAnswers": {
    "stress-anxiety-burnout": {
      "stress_driver": "work_pressure",
      "stress_goal": "calmer"
    },
    "poor-sleep-insomnia": {
      "sleep_problem": "staying_asleep",
      "sleep_priority": "more_restful_sleep"
    }
  },
  "intentAnswers": {
    "care_interest": "very_interested",
    "move_forward_factor": "insurance_coverage"
  },
  "concernsSnapshot": [],
  "consentAgreement": {
    "rewardCommunicationConsent": true,
    "consentVersion": "swca-reward-communication-v1",
    "consentCopy": "I agree that Spine and Wellness Centers of America and VeeVee may use the contact information I provide in this reward flow to send my reward certificate and related follow-up by email or text message. Message and data rates may apply. Reply STOP to opt out of text messages.",
    "consentedAt": "2026-05-15T00:00:00.000Z",
    "consentSourcePath": "/swca/intake"
  },
  "honeypot": ""
}
```

Success response:

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

The contact endpoint only saves details for a valid token after a reward has already been claimed. It enforces one reward per normalized email or phone value by writing an HMAC-hashed contact key to DynamoDB before delivery. The dedupe table does not store raw email addresses or phone numbers.

For email contacts, the endpoint also creates a certificate token, sends the customer reward email through SES, and records message status on the reward claim. Phone contacts are saved for follow-up. SMS delivery is implemented behind `SMS_DELIVERY_ENABLED` and remains off until AWS End User Messaging SMS setup is approved.

Duplicate contact response:

```json
{
  "ok": false,
  "duplicateContact": true,
  "message": "This email or phone has already claimed a campaign reward."
}
```

## Reward Certificate API Contract

Request:

```text
GET /forms/swca-reward-certificate?certificateId=<certificate-id>&token=<certificate-token>
```

Success response:

```json
{
  "ok": true,
  "certificate": {
    "certificateId": "<certificate-id>",
    "submissionId": "<submission-id>",
    "rewardId": "wellness-gift",
    "rewardLabel": "Wellness Gift",
    "rewardDescription": "...",
    "estimatedValue": "$25 value",
    "issuedTo": "J. E.",
    "issuedAt": "2026-05-14T00:00:00.000Z",
    "expiresAt": "2026-06-13T00:00:00.000Z"
  }
}
```

Invalid or expired tokens do not return reward details.

The certificate lookup scans until the matching certificate id is found, then validates the secure token hash before returning reward details. A future higher-volume version should add a DynamoDB index on `certificateId`.

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

The report includes aggregate counts, event counts, reward distribution, contact-method distribution, top-concern distribution, care-interest distribution, move-forward-factor distribution, and recent redacted rows.

Recent rows include these non-PII signal fields when the matching S3 intake record is available:

- `topConcern1`
- `topConcern2`
- `careInterest`
- `moveForwardFactor`

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
- `topRankedConcernIds`
- `followUpAnswers`
- `intentAnswers`
- `selectedConcerns`
- `rankedConcerns`
- `consentAgreement`
- limited request context

## DynamoDB Reward Claim Shape

Reward eligibility and claim records are keyed by `submissionId` and contain:

- `submissionId`
- `campaignId`
- `formId`
- `status`
- `tokenHash`
- `createdAt`
- `communicationConsent`
- `communicationConsentVersion`
- `communicationConsentedAt`
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
- `certificateId` after reward communication setup
- `certificateTokenHash` after reward communication setup
- `certificateCreatedAt` after reward communication setup
- `certificateExpiresAt` after reward communication setup
- `messageChannel`
- `messageStatus`
- `messageSentAt`
- `messageProviderMessageId` after customer messaging succeeds
- `messageError` when customer messaging fails
- `contactDuplicateAt` and `messageStatus = duplicate_contact` when a different submission tries to claim a reward with an already-used contact
- hashed request context for basic abuse review
- `spinTelemetry` after the first reward spin:
  - hashed source IP
  - hashed coarse IP prefix
  - hashed user agent
  - device/browser summary
  - accepted language and origin
  - sanitized referrer path
  - client hints such as timezone, language, screen size, viewport size, device pixel ratio, touch support, platform, and page path
- `lastSpinAttemptAt`, `lastSpinTelemetry`, and `spinAttemptCount` when an already-spun link is clicked again

The raw token is never stored.
Raw IP addresses and raw user-agent strings are not stored in the reward claim record.

## DynamoDB Reward Contact Claim Shape

Reward contact uniqueness records are keyed by `contactKey`, an HMAC hash over campaign id, contact method, and normalized contact value. The table contains:

- `contactKey`
- `campaignId`
- `formId`
- `contactType`
- `contactHash`
- `submissionId`
- `rewardId`
- `rewardLabel`
- `firstClaimedAt`
- `updatedAt`

The table does not store raw email addresses or phone numbers.

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

## Internal SES Notification

The internal intake notification email contains:

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

## Customer Reward Communication

The email-first customer reward communication path is live after a user saves reward contact details.

Source-of-truth plan:

```text
codex/swca/REWARD_COMMUNICATION_PLAN.md
```

Implementation status:

- SES reward email for email contacts is implemented.
- Secure `/swca/certificate` page and certificate API are implemented.
- Admin report includes message status fields.
- Certificate-view events are captured in the campaign event table.
- SMS send code is implemented behind `SMS_DELIVERY_ENABLED=false`; no SMS origination identity is configured yet.

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

- Intake API is live and writes S3 plus internal SES notification.
- Reward wheel API is live and enforces one reward per valid submission.
- Reward contact API is live and saves winner contact fields.
- Reward email and certificate fields were verified with smoke-test submission `731a0f54-9537-4715-a658-7c49ded7029d`.
- Campaign event `swca_reward_email_sent` was captured for the smoke-test submission.
- Latest end-to-end verification on 2026-05-15 used submission `7db059ef-eca9-439b-a398-e0ebd413b15d`: the wheel selected `Wellness Gift`, SES sent the reward email, certificate `f0c9ee71-11f8-4341-9948-b6f085a68a04` was created, and `swca_reward_certificate_view` was captured for the same submission and reward id.
- API Gateway CORS is corrected and verified for `https://myveevee.com`, `https://www.myveevee.com`, and the Amplify branch URL.
- Admin/event API is live and feeds the redacted dashboard.
- CloudWatch alarms are deployed and SNS email is confirmed.
- One-reward-per-contact enforcement is live for email and phone values through the HMAC contact dedupe table.
- Reward spin telemetry is stored as hashed request context and sanitized client hints for abuse review; raw IP addresses and raw user-agent strings are not stored in the reward claim record.
- Frontend deploy checkpoint: Amplify job `254` succeeded on 2026-05-17 for the current SWCA Health Twin visual funnel variant.

## What Is Next

- Operational handoff: rotate/share the admin passcode through a secure channel before broad staff rollout, use `codex/swca/ADMIN_RUNBOOK.md`, and keep alert recipients current.
- SMS remains disabled until AWS End User Messaging SMS registration, sandbox exit, opt-out behavior, and a controlled test send are complete. See `codex/swca/SMS_IMPLEMENTATION_PLAN.md`.
- Keep GA4 dashboard integration, deeper S3 plus DynamoDB reporting, and next-clinic provider config extraction in backlog until requested.
