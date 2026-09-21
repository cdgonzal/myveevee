# Provider inquiries

The providers CTAs lead to `/contact?topic=providers`. The public page keeps the provider story brief; implementation and commercial details belong in follow-up conversations.

The form posts name, practice, work email, optional phone/message, a honeypot and a UUID request ID to the endpoint in `src/config/providerInquiry.json`. `VITE_PROVIDER_INQUIRY_API_URL` can override it for testing. Missing configuration is an error, never mock success.

## Delivery

- Separate CloudFormation stack: `MyVeeVeeProviderInquiryStack`, account `767828748348`, `us-east-1`.
- API Gateway → `myveevee-provider-inquiry` Lambda → DynamoDB `myveevee-provider-inquiries` and SES.
- Sender and recipient are `info@veevee.io`; Reply-To is the submitter's email. IAM restricts sending to that recipient.
- Contact fields and free text are stored in DynamoDB with a 90-day expiry. Rate-limit rows expire after 30 minutes. DynamoDB TTL deletion is asynchronous.
- Only submission IDs, SES message IDs and error names are logged. Form contents never enter analytics.
- Server validation, origin checks, a honeypot, API throttling and five attempts per IP per 15-minute window limit abuse. Rate-limit keys hash the IP with the time window; raw IPs are not stored.
- A request ID and payload hash prevent ordinary retries or concurrent submissions from sending duplicate email. SES failures remain retryable. As with any synchronous email system, a process crash after SES accepts mail but before the status write can leave delivery ambiguous; inspect logs before manually replaying such a request.
- A success response means SES accepted the email. It does not independently confirm inbox delivery. `SENT` records contain the SES message ID. Replies from the inbox go directly to the submitter.

## Checks

From the repository root:

```powershell
npm run typecheck
npm test
npm run test:provider-inquiry
npm run verify:seo
```

From `infra`, use the dedicated app so campaign infrastructure is not part of this deployment:

```powershell
npm run build
node node_modules/aws-cdk/bin/cdk synth --app 'npx ts-node --prefer-ts-exts bin/provider-inquiry.ts' --profile glue-admin --output cdk.out-provider --quiet
node node_modules/aws-cdk/bin/cdk diff --app cdk.out-provider --profile glue-admin
node node_modules/aws-cdk/bin/cdk deploy --app cdk.out-provider --profile glue-admin --require-approval never --outputs-file cdk.out-provider/outputs.json
```

Copy the `ProviderInquiryEndpoint` output to `src/config/providerInquiry.json` before the Amplify frontend release. The endpoint is public configuration, not a credential. Use a clearly labeled verification message for any end-to-end production email test.
