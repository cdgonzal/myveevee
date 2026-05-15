# SWCA SMS Reward Communication Plan

## Objective

Add text-message reward delivery for users who choose phone after spinning the SWCA reward wheel.

Email remains the production path. SMS must stay disabled until AWS End User Messaging SMS has an approved origination identity, opt-out handling, spend controls, and a verified test send.

## Current AWS Status

Checked in `us-east-1` on 2026-05-15:

- Phone numbers: none
- Pools: none
- Configuration sets: none
- Opt-out lists: default opt-out list exists
- Account tier: SMS sandbox
- Toll-free registration draft: `registration-5b8f8b5311c4442f904051be74635331`

This means SMS sending cannot be enabled yet. The registration is tracked in [SMS_REGISTRATION_RUNBOOK.md](SMS_REGISTRATION_RUNBOOK.md).

## Delivery Design

The reward contact endpoint will keep one contact-save path:

1. Validate reward token and claimed reward.
2. Create the secure certificate link.
3. Save contact details and certificate fields to DynamoDB.
4. If contact method is email, send SES email.
5. If contact method is phone and SMS is enabled, send SMS through AWS End User Messaging SMS.
6. If contact method is phone and SMS is disabled, save the phone contact as manual follow-up with `messageStatus=not_supported`.

SMS sends must use the same secure certificate link as email. Raw S3 paths, raw tokens, wellness concern details, and raw phone numbers must not appear in logs or the admin dashboard.

## AWS Setup Required Before Enabling

- Register or request an approved SMS origination identity:
  - 10DLC, toll-free, or short code depending on campaign needs.
- Confirm the identity can send to US mobile numbers.
- Confirm opt-out handling and keyword behavior.
- Set account spend limits and per-message max price.
- Optionally create a configuration set for SMS events.
- Verify a test SMS send to an approved test number.

## Environment Switches

SMS delivery is controlled by backend environment variables:

- `SMS_DELIVERY_ENABLED`: `true` only after AWS setup is approved.
- `SMS_ORIGINATION_IDENTITY`: phone number id, phone number ARN, sender id, sender id ARN, pool id, or pool ARN.
- `SMS_CONFIGURATION_SET_NAME`: optional AWS End User Messaging SMS configuration set.

## SMS Copy

Initial copy:

```text
SWCA: Your wellness reward is ready: <reward>. View your certificate: <link> Create your free VeeVee profile: https://veevee.io Reply STOP to opt out.
```

Acceptance criteria:

- Includes `SWCA`.
- Includes the reward label.
- Includes the secure certificate link.
- Includes the VeeVee CTA.
- Includes opt-out language.
- Does not include wellness concerns or raw backend data.

## Implementation Phases

### Phase 1: Disabled-By-Default Code Path

Status: complete and deployed with SMS disabled.

Tasks:

- Add AWS SDK support for End User Messaging SMS.
- Add CDK parameters and Lambda environment variables.
- Add IAM permission for `sms-voice:SendTextMessage`.
- Add Lambda SMS send function behind `SMS_DELIVERY_ENABLED`.
- Store SMS status on the existing reward claim record.
- Emit `swca_reward_sms_sent` and `swca_reward_sms_failed` events.

Acceptance criteria:

- Phone contacts still save when SMS is disabled.
- Disabled SMS returns `messageStatus=not_supported`.
- Email behavior is unchanged.
- Build, Lambda syntax checks, CDK synth, and live disabled-SMS smoke test pass.

### Phase 2: AWS SMS Resource Setup

Status: started. Toll-free registration draft exists; business/compliance fields and toll-free number association are still pending.

Tasks:

- Fill out the toll-free registration with verified business, contact, opt-in, and message sample details.
- Request or associate the SMS origination identity.
- Confirm compliance registration state.
- Request SMS production access because the account is currently in sandbox.
- Configure spend controls.
- Optionally create a configuration set.
- Record the chosen identity in the deployment runbook.

Acceptance criteria:

- AWS account has an approved origination identity in `us-east-1`.
- AWS account is out of SMS sandbox for production SMS.
- A test number can receive SMS.
- Opt-out behavior is confirmed.

### Phase 3: Controlled Enablement

Status: blocked by Phase 2.

Tasks:

- Deploy with `SMS_DELIVERY_ENABLED=true`.
- Set `SMS_ORIGINATION_IDENTITY`.
- Run one phone-contact end-to-end test.
- Confirm DynamoDB message status, campaign events, and CloudWatch logs.

Acceptance criteria:

- Phone contact sends one SMS.
- Certificate link opens the correct reward.
- Dashboard still hides raw phone data.
- Failure path records `messageStatus=failed` without losing saved contact details.

## Backlog

- Add per-row SMS sent/failed details to the admin dashboard if management needs it.
- Add delivery event ingestion if AWS SMS event destinations are configured.
- Add SMS resend/manual retry workflow if clinic operations need it.
