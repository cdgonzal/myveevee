# Twin Card Operations Runbook

This is the booth-support source of truth for checking the Twin Card AWS backend after Amplify deploys the frontend from `main`.

## Live Surfaces

- Funnel: `https://myveevee.com/swca/funnel`
- Twin Card page: `https://myveevee.com/twin-card`
- Operations dashboard: `https://myveevee.com/twin-dashboard`
- Dashboard PIN: `5353`

## AWS Baseline

Use the repo AWS baseline before running AWS commands:

```powershell
$env:AWS_CONFIG_FILE="$env:USERPROFILE\.aws\config"
$env:AWS_SHARED_CREDENTIALS_FILE="$env:USERPROFILE\.aws\credentials"
$env:AWS_PROFILE="glue-admin"
$env:AWS_REGION="us-east-1"
```

Confirm the account before changing or inspecting production resources:

```powershell
aws sts get-caller-identity --profile glue-admin --region us-east-1
```

Expected production account: `767828748348`.

Do not use default AWS credentials for CDK. The local default account has previously resolved to `449164402570`, which is not the production Twin Card target. `infra/bin/myveevee-infra.ts` now refuses to synth/deploy this stack for any account other than `767828748348` unless `MYVEEVEE_AWS_ACCOUNT` is intentionally overridden.

## CDK Outputs

The stack is `MyVeeVeeInfraStack`.

List the Twin Card outputs:

```powershell
aws cloudformation describe-stacks `
  --stack-name MyVeeVeeInfraStack `
  --profile glue-admin `
  --region us-east-1 `
  --query "Stacks[0].Outputs[?contains(OutputKey, 'TwinCard')].[OutputKey,OutputValue]" `
  --output table
```

Important outputs:

- `TwinCardActivationTwinCardApiEndpoint...`: set as Amplify `main` env var `VITE_TWIN_CARD_API_URL`.
- `TwinCardActivationTwinCardAdminApiEndpoint...`: backend admin-list endpoint used by `/twin-dashboard`.
- `TwinCardActivationTwinCardCardsBucketName...`: private S3 image bucket.
- `TwinCardActivationTwinCardCardsTableName...`: DynamoDB run table.

Current production endpoint:

```text
VITE_TWIN_CARD_API_URL=https://kt51f0edy2.execute-api.us-east-1.amazonaws.com/twin-card/cards
```

If `TwinCardApiEndpoint` changes, update `VITE_TWIN_CARD_API_URL` in Amplify `main`, then redeploy Amplify.

## Lambda Logs

Tail the API Lambda while submitting the form:

```powershell
aws logs tail /aws/lambda/myveevee-twin-card-handler `
  --since 30m `
  --follow `
  --profile glue-admin `
  --region us-east-1
```

Tail the avatar-generation worker after the source image lands in S3:

```powershell
aws logs tail /aws/lambda/myveevee-twin-card-avatar-generator `
  --since 30m `
  --follow `
  --profile glue-admin `
  --region us-east-1
```

Tail the print-composition worker after the generated avatar lands in S3:

```powershell
aws logs tail /aws/lambda/myveevee-twin-card-print-composer `
  --since 30m `
  --follow `
  --profile glue-admin `
  --region us-east-1
```

Recent log events without following:

```powershell
aws logs filter-log-events `
  --log-group-name /aws/lambda/myveevee-twin-card-avatar-generator `
  --start-time ([DateTimeOffset]::UtcNow.AddMinutes(-30).ToUnixTimeMilliseconds()) `
  --profile glue-admin `
  --region us-east-1 `
  --query "events[].message" `
  --output text
```

## Alarms

Check Twin Card alarm state:

```powershell
aws cloudwatch describe-alarms `
  --alarm-names `
    myveevee-twin-card-handler-errors `
    myveevee-twin-card-avatar-generator-errors `
    myveevee-twin-card-print-composer-errors `
    myveevee-twin-card-api-5xx `
  --profile glue-admin `
  --region us-east-1 `
  --query "MetricAlarms[].{Name:AlarmName,State:StateValue,Reason:StateReason}" `
  --output table
```

Any `ALARM` state during an expo test means check the matching Lambda log group first.

## Run Storage Contract

Each card run is stored under:

```text
twin-card/{yyyy}/{mm}/{dd}/{cardId}/
```

Expected objects:

- `run.json`
- `source/normalized.jpg`
- `generated/avatar.png` or `generated/avatar.jpg`
- `print/selphy-cp1500-4x6.svg`
- `failures/{stage}.json`, only when a stage fails

The DynamoDB table is:

```text
myveevee-twin-card-cards
```

The S3 bucket name is account and region specific:

```text
myveevee-twin-card-767828748348-us-east-1
```

## Check S3 For A Run

If the dashboard shows a `cardId`, use the date and card id to inspect its prefix:

```powershell
$cardId="<card-id>"
$date="2026/05/29"
$bucket="myveevee-twin-card-767828748348-us-east-1"
$prefix="twin-card/$date/$cardId/"

aws s3 ls "s3://$bucket/$prefix" `
  --recursive `
  --profile glue-admin `
  --region us-east-1
```

Fetch the run JSON:

```powershell
aws s3 cp "s3://$bucket/$prefix/run.json" - `
  --profile glue-admin `
  --region us-east-1
```

Check for failure artifacts:

```powershell
aws s3 ls "s3://$bucket/$prefix/failures/" `
  --profile glue-admin `
  --region us-east-1
```

## Check DynamoDB

Fetch one known card:

```powershell
aws dynamodb get-item `
  --table-name myveevee-twin-card-cards `
  --key "{\"cardId\":{\"S\":\"<card-id>\"}}" `
  --profile glue-admin `
  --region us-east-1 `
  --output json
```

Scan recent records when a card id is unknown:

```powershell
aws dynamodb scan `
  --table-name myveevee-twin-card-cards `
  --limit 20 `
  --profile glue-admin `
  --region us-east-1 `
  --query "Items[].{cardId:cardId.S,createdAt:createdAt.S,firstName:firstName.S,email:email.S,generation:generationStatus.S,render:renderStatus.S,fulfillment:fulfillmentStatus.S,source:sourceImageS3Key.S,avatar:generatedImageS3Key.S,print:printImageS3Key.S}" `
  --output table
```

Use `/twin-dashboard` first during booth operations. Use DynamoDB directly only when the dashboard looks stale or incomplete.

## Avatar Provider Contract

Source of truth: `src/twinCard/avatarProviderContract.json`.

Default provider priority:

```text
us.stability.stable-image-control-structure-v1:0
us.stability.stable-style-transfer-v1:0
us.stability.stable-image-style-guide-v1:0
fallback_original_photo_card
```

These `us.*` Stability IDs are active Bedrock inference profile IDs. The Lambda must call the inference profile ID, not the raw `stability.*` model ID.

Provider behavior:

- Control Structure is the V1 primary avatar engine.
- Style Transfer is skipped unless `AVATAR_STYLE_REFERENCE_S3_KEY` is configured by CDK parameter `TwinCardAvatarStyleReferenceS3Key`.
- Style Guide is the tertiary Bedrock provider.
- `fallback_original_photo_card` copies the normalized uploaded photo into the generated-image prefix and sets `generationStatus=fallback_used`.

Do not default back to `amazon.nova-canvas-v1:0`; Bedrock denied it in production because it is legacy for this account. Do not move to `amazon.titan-image-generator-v2:0` as the next default; it is also legacy in the production model list.

The avatar-generator Lambda role must keep these permissions:

```text
bedrock:InvokeModel
aws-marketplace:ViewSubscriptions
aws-marketplace:Subscribe
aws-marketplace:Unsubscribe
```

If Control Structure returns a Marketplace subscription or authorization error, confirm the deployed Lambda role still has the Marketplace actions and retry after a short propagation delay.

## Expected Status Flow

Normal async path:

```text
submitted -> generating -> completed
renderStatus: not_started -> rendering -> rendered
fulfillmentStatus: not_printed
```

Fallback path:

```text
fallback_used
renderStatus: rendered
```

For `fallback_used`, check the DDB fields `bedrockProviderPriority`, `bedrockProviderAttempts`, and the S3 artifact `failures/avatar-generation.json` to see which providers failed or were skipped.

Failure path:

```text
generationStatus: failed
or
renderStatus: render_failed
```

If a record is stuck at `submitted`, check whether `source/normalized.jpg` exists and then check the avatar-generator Lambda logs.

If a record is stuck at `completed` with `renderStatus=not_started`, check whether `generated/avatar.*` exists and then check the print-composer Lambda logs.

## Live Smoke Test

1. Open `https://myveevee.com/swca/funnel`.
2. Complete the one-way funnel with a real camera capture.
3. Open `https://myveevee.com/twin-dashboard`.
4. Enter PIN `5353`.
5. Confirm the new row appears.
6. Confirm source image, generated avatar, run JSON, and print asset links populate.
7. Confirm S3 contains the expected prefix and objects.
8. Confirm DynamoDB has the same `cardId` and final statuses.
9. Confirm all Twin Card alarms are `OK`.

## Known Current Gap

The current print composer writes `print/selphy-cp1500-4x6.svg`. The printer contract targets Canon SELPHY CP1500 4x6/Postcard portrait output at 300 DPI, 1200x1800 px, sRGB. The next hardening pass should render a Canon-ready PNG or JPEG from the print-composer Lambda, likely with `sharp`.
