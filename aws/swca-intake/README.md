# SWCA Intake AWS Backend

This folder contains the first AWS-native backend source for the campaign-only SWCA intake form at `/swca/intake`.

## Runtime Path

`Amplify-hosted React form -> API Gateway HTTP API -> Lambda -> S3 + SES`

The browser should call API Gateway only. It should never call SES directly and should never carry AWS credentials.

## Lambda Environment

Required:

- `SUBMISSIONS_BUCKET`: private S3 bucket for intake submissions.
- `SES_FROM_EMAIL`: verified SES sender identity.
- `SES_TO_EMAILS`: comma-separated recipient list.
- `ALLOWED_ORIGINS`: comma-separated allowed browser origins.

Optional:

- `SUBMISSIONS_PREFIX`: S3 key prefix. Defaults to `forms/swca-wellness-priority-intake`.

Example `ALLOWED_ORIGINS`:

```text
https://myveevee.com,https://main.dc8zya6af7720.amplifyapp.com,http://127.0.0.1:5173,http://127.0.0.1:5174
```

## Frontend Environment

Configure this value in Amplify after API Gateway is created:

```text
VITE_SWCA_INTAKE_API_URL=https://<api-id>.execute-api.us-east-1.amazonaws.com/forms/swca-intake
```

Without this value, the React form stays in local mock mode and does not send a network request.

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

Success response:

```json
{
  "ok": true,
  "submissionId": "<uuid>"
}
```

Validation failures return `400` with a safe `message`.

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

## SES Notification

The email contains:

- submission id
- submitted timestamp
- source path and page URL
- S3 object location
- ranked priorities

The S3 object remains the durable record.

## Minimum IAM

Lambda execution role:

- `s3:PutObject` on the target bucket/prefix.
- `ses:SendEmail` on the verified sender identity or account-level SES scope selected for launch.
- CloudWatch Logs permissions.

Keep the S3 bucket private with public access blocked and server-side encryption enabled.
