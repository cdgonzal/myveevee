#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { MyVeeVeeInfraStack } from "../lib/myveevee-infra-stack";

const app = new cdk.App();
const expectedAccount = process.env.MYVEEVEE_AWS_ACCOUNT ?? "767828748348";
const expectedRegion = process.env.MYVEEVEE_AWS_REGION ?? "us-east-1";
const actualAccount = process.env.CDK_DEFAULT_ACCOUNT;
const actualRegion = process.env.CDK_DEFAULT_REGION ?? expectedRegion;

// Production infra belongs in the glue-admin AWS account. Fail fast if CDK is
// pointed at a different account so default credentials cannot deploy by mistake.
if (actualAccount && actualAccount !== expectedAccount) {
  throw new Error(
    `Refusing to synth/deploy MyVeeVeeInfraStack for AWS account ${actualAccount}. ` +
      `Use --profile glue-admin for ${expectedAccount}, or set MYVEEVEE_AWS_ACCOUNT to an intentional override.`
  );
}

new MyVeeVeeInfraStack(app, "MyVeeVeeInfraStack", {
  env: {
    account: expectedAccount,
    region: actualRegion,
  },
});
