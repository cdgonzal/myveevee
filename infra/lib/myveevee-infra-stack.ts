import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { PartnerIntakeForm, repoPath } from "./partner-intake-form";
import { TwinCardActivation } from "./twin-card-activation";

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

    const adminPasscodeSecretName = new cdk.CfnParameter(this, "SwcaAdminPasscodeSecretName", {
      type: "String",
      default: "/myveevee/swca/admin-passcode",
      description: "Secrets Manager secret name containing the shared SWCA admin passcode.",
    });

    const adminTokenSecretName = new cdk.CfnParameter(this, "SwcaAdminTokenSecretName", {
      type: "String",
      default: "/myveevee/swca/admin-token-signing-key",
      description: "Secrets Manager secret name containing the SWCA admin token signing key.",
    });

    const alertEmail = new cdk.CfnParameter(this, "SwcaAlertEmail", {
      type: "String",
      default: "info@veevee.io",
      description: "Email address to subscribe to SWCA operational CloudWatch alarm notifications.",
    });

    const publicBaseUrl = new cdk.CfnParameter(this, "SwcaPublicBaseUrl", {
      type: "String",
      default: "https://myveevee.com",
      description: "Public site base URL used in customer-facing SWCA reward links.",
    });

    const smsDeliveryEnabled = new cdk.CfnParameter(this, "SwcaSmsDeliveryEnabled", {
      type: "String",
      default: "false",
      allowedValues: ["true", "false"],
      description: "Enable SWCA SMS reward delivery after AWS End User Messaging SMS setup is approved.",
    });

    const smsOriginationIdentity = new cdk.CfnParameter(this, "SwcaSmsOriginationIdentity", {
      type: "String",
      default: "",
      description: "AWS End User Messaging SMS origination identity for SWCA reward SMS.",
    });

    const smsConfigurationSetName = new cdk.CfnParameter(this, "SwcaSmsConfigurationSetName", {
      type: "String",
      default: "",
      description: "Optional AWS End User Messaging SMS configuration set for SWCA reward SMS.",
    });

    const twinCardBedrockImageModelId = new cdk.CfnParameter(this, "TwinCardBedrockImageModelId", {
      type: "String",
      default: "",
      description:
        "Legacy optional Bedrock image model ID override for Twin Card avatar generation. Leave blank to use the provider-priority contract.",
    });

    const twinCardBedrockImageProviderPriority = new cdk.CfnParameter(this, "TwinCardBedrockImageProviderPriority", {
      type: "String",
      default: "",
      description:
        "Optional comma-separated Twin Card avatar provider priority. Leave blank to use src/twinCard/avatarProviderContract.json.",
    });

    const twinCardAvatarStyleReferenceS3Key = new cdk.CfnParameter(this, "TwinCardAvatarStyleReferenceS3Key", {
      type: "String",
      default: "",
      description:
        "Optional S3 key in the Twin Card bucket for a VeeVee style reference image used by Stable Style Transfer.",
    });

    new PartnerIntakeForm(this, "SwcaIntakeForm", {
      partnerKey: "swca",
      formId: "swca-wellness-priority-intake",
      apiPath: "/forms/swca-intake",
      lambdaEntry: repoPath("aws", "swca-intake", "handler.mjs"),
      rewardSpinApiPath: "/forms/swca-reward-spin",
      rewardContactApiPath: "/forms/swca-reward-contact",
      rewardCertificateApiPath: "/forms/swca-reward-certificate",
      rewardSpinLambdaEntry: repoPath("aws", "swca-intake", "spin-handler.mjs"),
      eventApiPath: "/forms/swca-event",
      adminSessionApiPath: "/forms/swca-admin-session",
      adminReportApiPath: "/forms/swca-admin-report",
      adminLambdaEntry: repoPath("aws", "swca-intake", "admin-handler.mjs"),
      adminPasscodeSecretName: adminPasscodeSecretName.valueAsString,
      adminTokenSecretName: adminTokenSecretName.valueAsString,
      submissionsPrefix: "forms/swca-wellness-priority-intake",
      allowedOrigins: allowedOrigins.valueAsList,
      sesFromEmail: sesFromEmail.valueAsString,
      sesToEmails: sesToEmails.valueAsList,
      alertEmail: alertEmail.valueAsString,
      publicBaseUrl: publicBaseUrl.valueAsString,
      smsDeliveryEnabled: smsDeliveryEnabled.valueAsString,
      smsOriginationIdentity: smsOriginationIdentity.valueAsString,
      smsConfigurationSetName: smsConfigurationSetName.valueAsString,
    });

    new TwinCardActivation(this, "TwinCardActivation", {
      allowedOrigins: allowedOrigins.valueAsList,
      publicBaseUrl: publicBaseUrl.valueAsString,
      alertEmail: alertEmail.valueAsString,
      sesFromEmail: sesFromEmail.valueAsString,
      bedrockImageModelId: twinCardBedrockImageModelId.valueAsString,
      bedrockImageProviderPriority: twinCardBedrockImageProviderPriority.valueAsString,
      avatarStyleReferenceS3Key: twinCardAvatarStyleReferenceS3Key.valueAsString,
    });
  }
}
