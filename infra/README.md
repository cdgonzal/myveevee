# MyVeeVee Infrastructure

This package is the CDK source of truth for AWS resources that sit behind the static Amplify marketing site.

## Current Stack

`MyVeeVeeInfraStack` currently creates the SWCA intake backend:

- private encrypted S3 submissions bucket
- bundled Lambda handler from `../aws/swca-intake/handler.mjs`
- HTTP API Gateway route at `/forms/swca-intake`
- CORS allowlist
- SES send permissions
- one-month CloudWatch log retention

The frontend route remains `/swca/intake`. After deploying this stack, use the CDK output endpoint as:

```text
VITE_SWCA_INTAKE_API_URL=<ApiEndpoint output>
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

Use real, verified SES identities:

```powershell
npx cdk deploy MyVeeVeeInfraStack --profile glue-admin --region us-east-1 --parameters SwcaSesFromEmail=<verified-sender@example.com> --parameters SwcaSesToEmails=<recipient@example.com>
```

Optional allowed origins override:

```powershell
--parameters SwcaAllowedOrigins=https://myveevee.com,https://main.dc8zya6af7720.amplifyapp.com
```

## Follow-On Step

After the stack deploys:

1. Copy the `SwcaIntakeFormApiEndpoint...` output.
2. Set it as `VITE_SWCA_INTAKE_API_URL` in the Amplify app/branch environment.
3. Redeploy Amplify `main`.
4. Submit one live test from `https://myveevee.com/swca/intake`.
5. Confirm one S3 object and one SES email.
