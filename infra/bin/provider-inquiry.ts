#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { ProviderInquiryStack } from "../lib/provider-inquiry-stack";

const account = "767828748348";
if (process.env.CDK_DEFAULT_ACCOUNT && process.env.CDK_DEFAULT_ACCOUNT !== account) {
  throw new Error("Use --profile glue-admin for the production VeeVee account.");
}
new ProviderInquiryStack(new cdk.App(), "MyVeeVeeProviderInquiryStack", { env: { account, region: "us-east-1" } });
