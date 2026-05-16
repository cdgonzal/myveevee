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
- DynamoDB hashed reward contact claims table for one-reward-per-contact enforcement
- Secrets Manager generated HMAC key for reward contact dedupe hashing
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
- DynamoDB contact dedupe table: `myveevee-swca-intake-reward-contact-claims`
- Secrets Manager contact dedupe key: `/myveevee/swca/reward-contact-dedupe-key`
- Lambda function: `myveevee-swca-intake-reward-spin-handler`
- Reward spin endpoint: `https://6o3st0r6ee.execute-api.us-east-1.amazonaws.com/forms/swca-reward-spin`
- Reward contact endpoint: `https://6o3st0r6ee.execute-api.us-east-1.amazonaws.com/forms/swca-reward-contact`
- Reward certificate endpoint: `https://6o3st0r6ee.execute-api.us-east-1.amazonaws.com/forms/swca-reward-certificate`
- Frontend route: `https://myveevee.com/swca/wheel`
- Amplify `main` environment variable: `VITE_SWCA_REWARD_SPIN_API_URL`

The contact dedupe table stores hashed contact keys only. It enforces one reward per normalized email or phone value without exposing raw contact values in the dedupe index.

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

The SNS email subscription for `info@veevee.io` is confirmed.

The frontend route remains `/swca/intake`. The deployed CDK output endpoint is configured in Amplify as:

```text
VITE_SWCA_INTAKE_API_URL=https://6o3st0r6ee.execute-api.us-east-1.amazonaws.com/forms/swca-intake
```

SMS reward delivery is disabled until AWS End User Messaging SMS setup is complete:

```text
SwcaSmsDeliveryEnabled=false
SwcaSmsOriginationIdentity=
SwcaSmsConfigurationSetName=
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
npx cdk synth --profile glue-admin --region us-east-1 --parameters SwcaSesFromEmail=sender@example.com --parameters SwcaSesToEmails=recipient@example.com --parameters SwcaAlertEmail=alerts@example.com --parameters SwcaPublicBaseUrl=https://myveevee.com
```

## Deploy

Use real, verified SES identities. The current deployed values are `info@veevee.io` for both sender and recipient:

```powershell
npx cdk deploy MyVeeVeeInfraStack --profile glue-admin --region us-east-1 --parameters SwcaSesFromEmail=info@veevee.io --parameters SwcaSesToEmails=info@veevee.io --parameters SwcaAlertEmail=info@veevee.io --parameters SwcaPublicBaseUrl=https://myveevee.com
```

Include the allowed origins parameter when deploying SWCA stack changes. In PowerShell, keep the comma-separated value in quotes so CloudFormation receives separate origins instead of one malformed space-joined origin:

```powershell
--parameters "SwcaAllowedOrigins=https://myveevee.com,https://www.myveevee.com,https://main.dc8zya6af7720.amplifyapp.com"
```

Optional admin secret-name overrides:

```powershell
--parameters SwcaAdminPasscodeSecretName=/myveevee/swca/admin-passcode --parameters SwcaAdminTokenSecretName=/myveevee/swca/admin-token-signing-key
```

Optional allowed origins override:

```powershell
--parameters "SwcaAllowedOrigins=https://myveevee.com,https://www.myveevee.com,https://main.dc8zya6af7720.amplifyapp.com"
```

## Follow-On Step

After a future stack change deploys:

1. Confirm whether the `SwcaIntakeFormApiEndpoint...` output changed.
2. If it changed, update `VITE_SWCA_INTAKE_API_URL` in the Amplify `main` branch environment.
3. Confirm `VITE_SWCA_REWARD_SPIN_API_URL` still points to the `SwcaIntakeFormRewardSpinApiEndpoint...` output in the Amplify `main` branch environment.
4. Confirm `VITE_SWCA_EVENT_API_URL`, `VITE_SWCA_ADMIN_SESSION_API_URL`, and `VITE_SWCA_ADMIN_REPORT_API_URL` still point to the current CDK outputs.
5. Confirm the SNS subscription status if `SwcaAlertEmail` changed.
6. Redeploy Amplify `main` if any frontend env var changed.
7. Submit one live test from `https://myveevee.com/swca/intake`.
8. Confirm one S3 object, one SES email, one DynamoDB eligibility record, one reward claim after spinning, contact fields after the winner form is submitted, one campaign event row, and one redacted admin report row.

## Current Verification

- CDK stack is deployed.
- Intake, reward wheel, reward contact, reward certificate, admin/event, and alarm resources are live.
- Amplify `main` has the required SWCA environment variables.
- Live smoke tests confirmed S3 storage, internal SES notification, reward claim, contact save, redacted admin report, and alarm subscription.
- Reward email, certificate fields, and `swca_reward_email_sent` event were verified with smoke-test submission `731a0f54-9537-4715-a658-7c49ded7029d`.
- Latest end-to-end verification on 2026-05-15 confirmed intake, wheel, email, certificate, and certificate-view tracking for submission `7db059ef-eca9-439b-a398-e0ebd413b15d`.
- API Gateway CORS is corrected and verified for `https://myveevee.com`, `https://www.myveevee.com`, and the Amplify branch URL.
- Contact dedupe enforcement and reward spin telemetry are deployed. Duplicate contact attempts do not issue a second reward, and spin telemetry stores hashed request context plus sanitized browser hints for abuse review.
- Amplify job `249` deployed the streamlined `/swca/funnel` Health Twin CTA on 2026-05-16.

## What Is Next

- Operational handoff: rotate/share the admin passcode through a secure channel, use `codex/swca/ADMIN_RUNBOOK.md`, and confirm alert recipients.
- SMS plan: continue `codex/swca/SMS_IMPLEMENTATION_PLAN.md`; do not enable SMS until registration and sandbox exit are complete.
- Keep GA4 dashboard integration, deeper operations reporting, and next-clinic provider config extraction in backlog until requested.
