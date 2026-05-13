#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { MyVeeVeeInfraStack } from "../lib/myveevee-infra-stack";

const app = new cdk.App();

new MyVeeVeeInfraStack(app, "MyVeeVeeInfraStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? "us-east-1",
  },
});
