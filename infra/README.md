# MyVeeVee Infrastructure

This package is the CDK source of truth for AWS resources that sit behind the static Amplify marketing site.

## Current Stack

`MyVeeVeeInfraStack` currently creates and manages the live SWCA intake backend:

- private encrypted S3 submissions bucket
- bundled Lambda handler from `../aws/swca-intake/handler.mjs`
- HTTP API Gateway route at `/forms/swca-intake`
- CORS allowlist
- SES send permissions
- one-month CloudWatch log retention

## Live SWCA Intake Resources

- Stack: `MyVeeVeeInfraStack`
- API endpoint: `https://6o3st0r6ee.execute-api.us-east-1.amazonaws.com/forms/swca-intake`
- S3 bucket: `myveevee-swca-intake-767828748348-us-east-1`
- Lambda function: `myveevee-swca-intake-handler`
- SES sender: `info@veevee.io`
- SES recipient: `info@veevee.io`
- Frontend route: `https://myveevee.com/swca/intake`
- Amplify `main` environment variable: `VITE_SWCA_INTAKE_API_URL`

The frontend route remains `/swca/intake`. The deployed CDK output endpoint is configured in Amplify as:

```text
VITE_SWCA_INTAKE_API_URL=https://6o3st0r6ee.execute-api.us-east-1.amazonaws.com/forms/swca-intake
```

## Setup

Install dependencies from this folder:

```powershell
npm install
```

Use the repo AWS query baseline before AWS commands:

```powershell
$env:AWS_CONFIG_FILE="$env:USERPROFILE\.aws\config"
$env:AWS_SHARED_CREDENTIALS_FILE="$env:USERPROFILE\.aws\credentials"
```

## Validate

```powershell
npm run build
npx cdk synth --profile glue-admin --region us-east-1 --parameters SwcaSesFromEmail=sender@example.com --parameters SwcaSesToEmails=recipient@example.com
```

## Deploy

Use real, verified SES identities. The current deployed values are `info@veevee.io` for both sender and recipient:

```powershell
npx cdk deploy MyVeeVeeInfraStack --profile glue-admin --region us-east-1 --parameters SwcaSesFromEmail=info@veevee.io --parameters SwcaSesToEmails=info@veevee.io
```

Optional allowed origins override:

```powershell
--parameters SwcaAllowedOrigins=https://myveevee.com,https://main.dc8zya6af7720.amplifyapp.com
```

## Follow-On Step

After a future stack change deploys:

1. Confirm whether the `SwcaIntakeFormApiEndpoint...` output changed.
2. If it changed, update `VITE_SWCA_INTAKE_API_URL` in the Amplify `main` branch environment.
3. Redeploy Amplify `main` if the frontend env var changed.
4. Submit one live test from `https://myveevee.com/swca/intake`.
5. Confirm one S3 object and one SES email.

## Current Verification

- CDK deploy completed successfully for `MyVeeVeeInfraStack`.
- Amplify release job `203` succeeded after setting `VITE_SWCA_INTAKE_API_URL`.
- Live API smoke test returned submission id `4951deed-8fc7-4c9e-86db-b0f7cd40ee02`.
- S3 object exists at `forms/swca-wellness-priority-intake/year=2026/month=05/day=14/4951deed-8fc7-4c9e-86db-b0f7cd40ee02.json`.
- Lambda logs confirmed the submission was stored and emailed.
- Invalid payload smoke test returned `400` and did not create a second S3 object.

## What Is Next

- Add CloudWatch alarms for Lambda errors and unusual API volume.
- Decide whether marketing needs a CSV export script or dashboard.
- Add a second `PartnerIntakeForm` config when the next clinic/form is ready.
