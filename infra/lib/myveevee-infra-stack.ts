import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { PartnerIntakeForm, repoPath } from "./partner-intake-form";

export class MyVeeVeeInfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const sesFromEmail = new cdk.CfnParameter(this, "SwcaSesFromEmail", {
      type: "String",
      description: "Verified SES sender email for SWCA intake notifications.",
    });

    const sesToEmails = new cdk.CfnParameter(this, "SwcaSesToEmails", {
      type: "CommaDelimitedList",
      description: "Comma-separated recipient emails for SWCA intake notifications.",
    });

    const allowedOrigins = new cdk.CfnParameter(this, "SwcaAllowedOrigins", {
      type: "CommaDelimitedList",
      default: "https://myveevee.com,https://main.dc8zya6af7720.amplifyapp.com",
      description: "Comma-separated browser origins allowed to submit the SWCA intake form.",
    });

    new PartnerIntakeForm(this, "SwcaIntakeForm", {
      partnerKey: "swca",
      formId: "swca-wellness-priority-intake",
      apiPath: "/forms/swca-intake",
      lambdaEntry: repoPath("aws", "swca-intake", "handler.mjs"),
      submissionsPrefix: "forms/swca-wellness-priority-intake",
      allowedOrigins: allowedOrigins.valueAsList,
      sesFromEmail: sesFromEmail.valueAsString,
      sesToEmails: sesToEmails.valueAsList,
    });
  }
}
