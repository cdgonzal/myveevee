# MyVeeVee Infrastructure

This package is the CDK source of truth for AWS resources that sit behind the static Amplify marketing site.

## Current Stack

`MyVeeVeeInfraStack` currently creates and manages the live SWCA intake and reward-wheel backend:

- private encrypted S3 submissions bucket
- bundled Lambda handler from `../aws/swca-intake/handler.mjs`
- HTTP API Gateway route at `/forms/swca-intake`
- CORS allowlist
- SES send permissions
- one-month CloudWatch log retention
- DynamoDB reward eligibility/claim table for SWCA wheel spins
- bundled reward spin Lambda handler from `../aws/swca-intake/spin-handler.mjs`
- reward spin Lambda/API route with conditional one-spin enforcement
- DynamoDB campaign events table for first-party SWCA funnel events
- bundled admin/event Lambda handler from `../aws/swca-intake/admin-handler.mjs`
- admin passcode session route, redacted report route, and public campaign event route
- Secrets Manager secret lookups for the shared admin passcode and token signing key
- SNS topic and CloudWatch alarms for Lambda errors, API 5xx responses, and unusual API volume
- frontend environment variable for the spin endpoint

## Live SWCA Intake Resources

- Stack: `MyVeeVeeInfraStack`
- API endpoint: `https://6o3st0r6ee.execute-api.us-east-1.amazonaws.com/forms/swca-intake`
- S3 bucket: `myveevee-swca-intake-767828748348-us-east-1`
- Lambda function: `myveevee-swca-intake-handler`
- SES sender: `info@veevee.io`
- SES recipient: `info@veevee.io`
- Frontend route: `https://myveevee.com/swca/intake`
- Amplify `main` environment variable: `VITE_SWCA_INTAKE_API_URL`

## Live SWCA Reward Wheel Resources

- DynamoDB table: `myveevee-swca-intake-reward-claims`
- Lambda function: `myveevee-swca-intake-reward-spin-handler`
- Reward spin endpoint: `https://6o3st0r6ee.execute-api.us-east-1.amazonaws.com/forms/swca-reward-spin`
- Reward contact endpoint: `https://6o3st0r6ee.execute-api.us-east-1.amazonaws.com/forms/swca-reward-contact`
- Frontend route: `https://myveevee.com/swca/wheel`
- Amplify `main` environment variable: `VITE_SWCA_REWARD_SPIN_API_URL`

## SWCA Admin and Campaign Event Resources

- DynamoDB campaign events table: `myveevee-swca-intake-campaign-events`
- Lambda function: `myveevee-swca-intake-admin-handler`
- Campaign event endpoint: `https://6o3st0r6ee.execute-api.us-east-1.amazonaws.com/forms/swca-event`
- Admin session endpoint: `https://6o3st0r6ee.execute-api.us-east-1.amazonaws.com/forms/swca-admin-session`
- Admin report endpoint: `https://6o3st0r6ee.execute-api.us-east-1.amazonaws.com/forms/swca-admin-report`
- Frontend route: `https://myveevee.com/swca/admin`
- Amplify `main` environment variables: `VITE_SWCA_EVENT_API_URL`, `VITE_SWCA_ADMIN_SESSION_API_URL`, `VITE_SWCA_ADMIN_REPORT_API_URL`
- Secrets Manager secrets: `/myveevee/swca/admin-passcode`, `/myveevee/swca/admin-token-signing-key`

The report endpoint returns abbreviated names and contact method only. It does not return raw email or phone values.

## SWCA Operational Alarms

- SNS topic: `myveevee-swca-intake-operational-alerts`
- Default alert recipient: `info@veevee.io`
- Lambda error alarms: `myveevee-swca-intake-IntakeHandlerErrorsAlarm`, `myveevee-swca-intake-RewardSpinHandlerErrorsAlarm`, `myveevee-swca-intake-AdminHandlerErrorsAlarm`
- API alarms: `myveevee-swca-intake-api-5xx`, `myveevee-swca-intake-api-high-volume`
- High-volume threshold: 250 API Gateway requests in five minutes

The SNS email subscription must be confirmed from the recipient inbox before email alarm delivery starts.

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
npx cdk synth --profile glue-admin --region us-east-1 --parameters SwcaSesFromEmail=sender@example.com --parameters SwcaSesToEmails=recipient@example.com --parameters SwcaAlertEmail=alerts@example.com
```

## Deploy

Use real, verified SES identities. The current deployed values are `info@veevee.io` for both sender and recipient:

```powershell
npx cdk deploy MyVeeVeeInfraStack --profile glue-admin --region us-east-1 --parameters SwcaSesFromEmail=info@veevee.io --parameters SwcaSesToEmails=info@veevee.io --parameters SwcaAlertEmail=info@veevee.io
```

Optional admin secret-name overrides:

```powershell
--parameters SwcaAdminPasscodeSecretName=/myveevee/swca/admin-passcode --parameters SwcaAdminTokenSecretName=/myveevee/swca/admin-token-signing-key
```

Optional allowed origins override:

```powershell
--parameters SwcaAllowedOrigins=https://myveevee.com,https://main.dc8zya6af7720.amplifyapp.com
```

## Follow-On Step

After a future stack change deploys:

1. Confirm whether the `SwcaIntakeFormApiEndpoint...` output changed.
2. If it changed, update `VITE_SWCA_INTAKE_API_URL` in the Amplify `main` branch environment.
3. Confirm `VITE_SWCA_REWARD_SPIN_API_URL` still points to the `SwcaIntakeFormRewardSpinApiEndpoint...` output in the Amplify `main` branch environment.
4. Confirm `VITE_SWCA_EVENT_API_URL`, `VITE_SWCA_ADMIN_SESSION_API_URL`, and `VITE_SWCA_ADMIN_REPORT_API_URL` still point to the current CDK outputs.
5. Confirm the SNS subscription is confirmed if `SwcaAlertEmail` changed.
6. Redeploy Amplify `main` if any frontend env var changed.
7. Submit one live test from `https://myveevee.com/swca/intake`.
8. Confirm one S3 object, one SES email, one DynamoDB eligibility record, one reward claim after spinning, contact fields after the winner form is submitted, one campaign event row, and one redacted admin report row.

## Current Verification

- CDK deploy completed successfully for `MyVeeVeeInfraStack`.
- Amplify release job `203` succeeded after setting `VITE_SWCA_INTAKE_API_URL`.
- Live API smoke test returned submission id `4951deed-8fc7-4c9e-86db-b0f7cd40ee02`.
- S3 object exists at `forms/swca-wellness-priority-intake/year=2026/month=05/day=14/4951deed-8fc7-4c9e-86db-b0f7cd40ee02.json`.
- Lambda logs confirmed the submission was stored and emailed.
- Invalid payload smoke test returned `400` and did not create a second S3 object.
- Reward-wheel CDK deploy completed successfully.
- Amplify release job `207` succeeded after adding `VITE_SWCA_REWARD_SPIN_API_URL`.
- Live reward smoke test returned submission id `fdf214c6-2251-4267-8982-a99c635215a2`.
- S3 object exists at `forms/swca-wellness-priority-intake/year=2026/month=05/day=14/fdf214c6-2251-4267-8982-a99c635215a2.json`.
- DynamoDB reward claim exists with `status=claimed`, reward `wellness-gift`, and winner contact fields.
- Admin/event backend CDK deploy completed successfully.
- Amplify release job `210` succeeded after adding admin/event API env vars.
- Live admin/event smoke test confirmed the passcode session route, event write route, and redacted report route.
- App 404 recovery and `/swca/teaser` alias deployed through Amplify release jobs `211`, `212`, and `213`.
- Operational alarm CDK deploy completed successfully.
- AWS CLI verification found five CloudWatch alarms under the `myveevee-swca-intake` prefix.
- SNS subscription for `info@veevee.io` is pending recipient confirmation.

## What Is Next

- Ask marketing to finalize `src/swca/rewardWheel/reward-wheel-config.json` before campaign traffic.
- Confirm the SNS subscription email for operational alarms after deploy.
- Rotate the SWCA admin passcode before broad team sharing.
- Add a short admin runbook covering passcode sharing, manual rotation, report refresh, CSV export, and stale-count troubleshooting.
- Add a second `PartnerIntakeForm` config when the next clinic/form is ready.
