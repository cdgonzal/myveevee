# SWCA Intake AWS Backend

This folder contains the AWS-native backend source for the campaign-only SWCA intake form at `/swca/intake` and the post-intake reward wheel at `/swca/wheel`.

Current deployed endpoint:

```text
https://6o3st0r6ee.execute-api.us-east-1.amazonaws.com/forms/swca-intake
```

Pending reward spin endpoint after the next CDK deploy:

```text
<CDK output>/forms/swca-reward-spin
```

Pending reward contact endpoint after the next CDK deploy:

```text
<CDK output>/forms/swca-reward-contact
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

## Lambda Environment

Required:

- `SUBMISSIONS_BUCKET`: private S3 bucket for intake submissions.
- `SES_FROM_EMAIL`: verified SES sender identity.
- `SES_TO_EMAILS`: comma-separated recipient list.
- `ALLOWED_ORIGINS`: comma-separated allowed browser origins.
- `REWARD_CLAIMS_TABLE`: DynamoDB table for reward eligibility and one-time claim state.

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

After the reward backend deploys, add the CDK reward spin endpoint output to the Amplify `main` branch environment:

```text
VITE_SWCA_REWARD_SPIN_API_URL=<CDK reward spin endpoint output>
```

Without these values in a local or future branch environment, the React form and wheel stay in local mock mode and do not send network requests.

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

## Minimum IAM

Lambda execution role:

- `s3:PutObject` on the target bucket/prefix.
- `dynamodb:PutItem` on the reward claims table for intake eligibility creation.
- `ses:SendEmail` on the verified sender identity or account-level SES scope selected for launch.
- CloudWatch Logs permissions.

Reward spin Lambda execution role:

- `dynamodb:GetItem` and `dynamodb:UpdateItem` on the reward claims table.
- CloudWatch Logs permissions.

Keep the S3 bucket private with public access blocked and server-side encryption enabled.

## Current Verification

- Live API test returned submission id `4951deed-8fc7-4c9e-86db-b0f7cd40ee02`.
- S3 object was created at `forms/swca-wellness-priority-intake/year=2026/month=05/day=14/4951deed-8fc7-4c9e-86db-b0f7cd40ee02.json`.
- Lambda log group `/aws/lambda/myveevee-swca-intake-handler` confirmed `SWCA intake submission stored and emailed`.
- Invalid payload testing returned `400` and did not create another S3 object.

## What Is Next

- Deploy the CDK stack so reward eligibility storage and the spin endpoint become live.
- Add the reward spin endpoint output to `VITE_SWCA_REWARD_SPIN_API_URL` in Amplify `main`.
- Smoke-test one intake, one spin, one winner contact submission, one duplicate spin, and one invalid token.
- Add CloudWatch alarms for Lambda errors and API abuse signals.
- Decide whether the email should include full ranked priorities long term or only a summary plus S3 submission id.
- Build an export path if marketing needs CSV or reporting beyond email notifications.
