# SWCA SMS Registration Runbook

## Current Status

AWS End User Messaging SMS toll-free registration has been started in `us-east-1`.

- Registration id: `registration-5b8f8b5311c4442f904051be74635331`
- Registration type: `US_TOLL_FREE_REGISTRATION`
- Status: `CREATED`
- AWS account tier: `SANDBOX`
- Created: `2026-05-15`

No SMS sending is enabled in production yet. The reward Lambda remains deployed with `SMS_DELIVERY_ENABLED=false`.

## Why Toll-Free First

Toll-free is the simplest first origination path for this campaign because the expected volume is low and the use case is narrow: send a reward certificate link to users who completed the SWCA reward flow and chose phone contact.

The registration still needs complete business, contact, opt-in, and message-sample details before it can be submitted.

## Information Needed From Business

Company info:

- Legal company name
- Business type: `PRIVATE_PROFIT`, `PUBLIC_PROFIT`, `NON_PROFIT`, `SOLE_PROPRIETOR`, or `GOVERNMENT`
- EIN or other company identification number, unless sole proprietor
- Identification type, usually `EIN`
- Identification country, usually `US`
- Public company website
- Physical street address
- City, state, ZIP, and country code
- Optional business registration document

Contact info:

- First name
- Last name
- Support email
- Support phone number in `+12065550100` format

Messaging use case:

- Expected monthly SMS volume, likely `100` or `1,000`
- Use case category, likely `PROMOTIONS_AND_MARKETING` or `CUSTOMER_CARE`
- Use case details
- Opt-in type, likely `DIGITAL_FORM` or `QR_CODE`
- Opt-in workflow description
- Opt-in screenshot image, PNG under 400 KB

Current opt-in surface:

- Route: `/swca/intake`
- Placement: required checkbox below the intake submit button, with expandable consent details.
- Stored evidence: S3 intake submission includes `consentAgreement.rewardCommunicationConsent=true`, consent version, consent timestamp, source path, and exact consent copy.
- Reward claim record stores `communicationConsent=true`, `communicationConsentVersion`, and `communicationConsentedAt`.

Suggested opt-in workflow description:

```text
Users visit the SWCA reward intake page from a clinic link or QR code. Before submitting the intake form and continuing to the reward wheel, users must check a consent box agreeing that Spine and Wellness Centers of America and VeeVee may use the contact information provided in the reward flow to send the reward certificate and related follow-up by email or text message. The consent details are expandable on the page and include message/data rate and STOP opt-out language. The application stores the consent version, timestamp, source path, and exact consent copy with the intake submission.
```

Message sample:

```text
SWCA: Your wellness reward is ready: Healthy Snacks Reward. View your certificate: https://myveevee.com/swca/certificate?certificateId=example&token=example Create your free VeeVee profile: https://veevee.io Reply STOP to opt out.
```

## Required AWS Steps

1. Fill out the registration fields.
2. Request or associate a toll-free number with the registration.
3. Submit the registration for review.
4. Request SMS production access because the account is currently in sandbox.
5. Wait for AWS/carrier approval.
6. Run a controlled test send.
7. Deploy the reward Lambda with:
   - `SwcaSmsDeliveryEnabled=true`
   - `SwcaSmsOriginationIdentity=<approved toll-free phone number id or ARN>`
   - `SwcaSmsConfigurationSetName=<optional config set>`

## AWS CLI Baseline

Set profile paths first:

```powershell
$env:AWS_CONFIG_FILE='C:\Users\cdgon\.aws\config'
$env:AWS_SHARED_CREDENTIALS_FILE='C:\Users\cdgon\.aws\credentials'
```

Check registration:

```powershell
aws pinpoint-sms-voice-v2 describe-registrations `
  --profile glue-admin `
  --region us-east-1 `
  --registration-ids registration-5b8f8b5311c4442f904051be74635331
```

Check required fields:

```powershell
aws pinpoint-sms-voice-v2 describe-registration-field-definitions `
  --profile glue-admin `
  --region us-east-1 `
  --registration-type US_TOLL_FREE_REGISTRATION
```

## Guardrails

- Do not submit the registration with placeholder legal, EIN, contact, or opt-in data.
- Do not enable `SMS_DELIVERY_ENABLED` until the toll-free number is approved and the account is out of SMS sandbox.
- Do not send wellness concern details by SMS.
- Keep SMS copy short and focused on reward delivery plus the VeeVee profile CTA.
- Include opt-out language.
