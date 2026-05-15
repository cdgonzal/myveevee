import * as path from "node:path";
import * as cdk from "aws-cdk-lib";
import * as apigatewayv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as cloudwatchActions from "aws-cdk-lib/aws-cloudwatch-actions";
import * as integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as nodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as logs from "aws-cdk-lib/aws-logs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as sns from "aws-cdk-lib/aws-sns";
import * as subscriptions from "aws-cdk-lib/aws-sns-subscriptions";
import { Construct } from "constructs";

export type PartnerIntakeFormProps = {
  partnerKey: string;
  formId: string;
  apiPath: string;
  lambdaEntry: string;
  rewardSpinApiPath: string;
  rewardContactApiPath: string;
  rewardCertificateApiPath: string;
  rewardSpinLambdaEntry: string;
  eventApiPath: string;
  adminSessionApiPath: string;
  adminReportApiPath: string;
  adminLambdaEntry: string;
  adminPasscodeSecretName: string;
  adminTokenSecretName: string;
  submissionsPrefix: string;
  allowedOrigins: string[];
  sesFromEmail: string;
  sesToEmails: string[];
  alertEmail: string;
  publicBaseUrl: string;
  smsDeliveryEnabled: string;
  smsOriginationIdentity: string;
  smsConfigurationSetName: string;
};

export class PartnerIntakeForm extends Construct {
  readonly api: apigatewayv2.HttpApi;
  readonly bucket: s3.Bucket;
  readonly function: nodejs.NodejsFunction;
  readonly rewardClaimsTable: dynamodb.Table;
  readonly campaignEventsTable: dynamodb.Table;
  readonly rewardSpinFunction: nodejs.NodejsFunction;
  readonly adminFunction: nodejs.NodejsFunction;

  constructor(scope: Construct, id: string, props: PartnerIntakeFormProps) {
    super(scope, id);

    const resourcePrefix = `myveevee-${props.partnerKey}-intake`;
    const functionName = `${resourcePrefix}-handler`;
    const rewardSpinFunctionName = `${resourcePrefix}-reward-spin-handler`;
    const adminFunctionName = `${resourcePrefix}-admin-handler`;

    this.bucket = new s3.Bucket(this, "SubmissionsBucket", {
      bucketName: `${resourcePrefix}-${cdk.Stack.of(this).account}-${cdk.Stack.of(this).region}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
    });

    this.rewardClaimsTable = new dynamodb.Table(this, "RewardClaimsTable", {
      tableName: `${resourcePrefix}-reward-claims`,
      partitionKey: {
        name: "submissionId",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecoverySpecification: {
        pointInTimeRecoveryEnabled: true,
      },
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    this.campaignEventsTable = new dynamodb.Table(this, "CampaignEventsTable", {
      tableName: `${resourcePrefix}-campaign-events`,
      partitionKey: {
        name: "eventId",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: "expiresAtEpoch",
      pointInTimeRecoverySpecification: {
        pointInTimeRecoveryEnabled: true,
      },
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const logGroup = new logs.LogGroup(this, "HandlerLogGroup", {
      logGroupName: `/aws/lambda/${functionName}`,
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.function = new nodejs.NodejsFunction(this, "Handler", {
      functionName,
      entry: props.lambdaEntry,
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      projectRoot: repoPath(),
      timeout: cdk.Duration.seconds(15),
      memorySize: 256,
      logGroup,
      bundling: {
        format: nodejs.OutputFormat.ESM,
        mainFields: ["module", "main"],
        minify: true,
        sourceMap: true,
        target: "node20",
      },
      environment: {
        FORM_ID: props.formId,
        SUBMISSIONS_BUCKET: this.bucket.bucketName,
        SUBMISSIONS_PREFIX: props.submissionsPrefix,
        SES_FROM_EMAIL: props.sesFromEmail,
        SES_TO_EMAILS: cdk.Fn.join(",", props.sesToEmails),
        ALLOWED_ORIGINS: cdk.Fn.join(",", props.allowedOrigins),
        REWARD_CLAIMS_TABLE: this.rewardClaimsTable.tableName,
      },
    });

    this.bucket.grantPut(this.function, `${props.submissionsPrefix.replace(/\/+$/, "")}/*`);
    this.rewardClaimsTable.grantWriteData(this.function);
    this.function.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["ses:SendEmail", "ses:SendRawEmail"],
        resources: ["*"],
      })
    );

    const rewardSpinLogGroup = new logs.LogGroup(this, "RewardSpinHandlerLogGroup", {
      logGroupName: `/aws/lambda/${rewardSpinFunctionName}`,
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.rewardSpinFunction = new nodejs.NodejsFunction(this, "RewardSpinHandler", {
      functionName: rewardSpinFunctionName,
      entry: props.rewardSpinLambdaEntry,
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      projectRoot: repoPath(),
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
      logGroup: rewardSpinLogGroup,
      bundling: {
        format: nodejs.OutputFormat.ESM,
        mainFields: ["module", "main"],
        minify: true,
        sourceMap: true,
        target: "node20",
      },
      environment: {
        REWARD_CLAIMS_TABLE: this.rewardClaimsTable.tableName,
        CAMPAIGN_EVENTS_TABLE: this.campaignEventsTable.tableName,
        SES_FROM_EMAIL: props.sesFromEmail,
        PUBLIC_BASE_URL: props.publicBaseUrl,
        ALLOWED_ORIGINS: cdk.Fn.join(",", props.allowedOrigins),
        SMS_DELIVERY_ENABLED: props.smsDeliveryEnabled,
        SMS_ORIGINATION_IDENTITY: props.smsOriginationIdentity,
        SMS_CONFIGURATION_SET_NAME: props.smsConfigurationSetName,
      },
    });

    this.rewardClaimsTable.grantReadWriteData(this.rewardSpinFunction);
    this.campaignEventsTable.grantWriteData(this.rewardSpinFunction);
    this.rewardSpinFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["ses:SendEmail", "ses:SendRawEmail"],
        resources: ["*"],
      })
    );
    this.rewardSpinFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["sms-voice:SendTextMessage"],
        resources: ["*"],
      })
    );

    const adminLogGroup = new logs.LogGroup(this, "AdminHandlerLogGroup", {
      logGroupName: `/aws/lambda/${adminFunctionName}`,
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.adminFunction = new nodejs.NodejsFunction(this, "AdminHandler", {
      functionName: adminFunctionName,
      entry: props.adminLambdaEntry,
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      projectRoot: repoPath(),
      timeout: cdk.Duration.seconds(15),
      memorySize: 256,
      logGroup: adminLogGroup,
      bundling: {
        format: nodejs.OutputFormat.ESM,
        mainFields: ["module", "main"],
        minify: true,
        sourceMap: true,
        target: "node20",
      },
      environment: {
        FORM_ID: props.formId,
        SUBMISSIONS_BUCKET: this.bucket.bucketName,
        SUBMISSIONS_PREFIX: props.submissionsPrefix,
        REWARD_CLAIMS_TABLE: this.rewardClaimsTable.tableName,
        CAMPAIGN_EVENTS_TABLE: this.campaignEventsTable.tableName,
        ADMIN_PASSCODE_SECRET_NAME: props.adminPasscodeSecretName,
        ADMIN_TOKEN_SECRET_NAME: props.adminTokenSecretName,
        ALLOWED_ORIGINS: cdk.Fn.join(",", props.allowedOrigins),
      },
    });

    this.rewardClaimsTable.grantReadData(this.adminFunction);
    this.campaignEventsTable.grantReadWriteData(this.adminFunction);
    this.bucket.grantRead(this.adminFunction, `${props.submissionsPrefix.replace(/\/+$/, "")}/*`);
    this.adminFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["secretsmanager:GetSecretValue"],
        resources: [
          cdk.Fn.sub("arn:${AWS::Partition}:secretsmanager:${AWS::Region}:${AWS::AccountId}:secret:${SecretName}*", {
            SecretName: props.adminPasscodeSecretName,
          }),
          cdk.Fn.sub("arn:${AWS::Partition}:secretsmanager:${AWS::Region}:${AWS::AccountId}:secret:${SecretName}*", {
            SecretName: props.adminTokenSecretName,
          }),
        ],
      })
    );

    this.api = new apigatewayv2.HttpApi(this, "HttpApi", {
      apiName: `${resourcePrefix}-api`,
      corsPreflight: {
        allowHeaders: ["authorization", "content-type"],
        allowMethods: [
          apigatewayv2.CorsHttpMethod.GET,
          apigatewayv2.CorsHttpMethod.POST,
          apigatewayv2.CorsHttpMethod.OPTIONS,
        ],
        allowOrigins: props.allowedOrigins,
      },
    });

    this.api.addRoutes({
      path: props.apiPath,
      methods: [apigatewayv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration("LambdaIntegration", this.function),
    });

    this.api.addRoutes({
      path: props.rewardSpinApiPath,
      methods: [apigatewayv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration("RewardSpinLambdaIntegration", this.rewardSpinFunction),
    });

    this.api.addRoutes({
      path: props.rewardContactApiPath,
      methods: [apigatewayv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration("RewardContactLambdaIntegration", this.rewardSpinFunction),
    });

    this.api.addRoutes({
      path: props.rewardCertificateApiPath,
      methods: [apigatewayv2.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration("RewardCertificateLambdaIntegration", this.rewardSpinFunction),
    });

    this.api.addRoutes({
      path: props.eventApiPath,
      methods: [apigatewayv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration("CampaignEventLambdaIntegration", this.adminFunction),
    });

    this.api.addRoutes({
      path: props.adminSessionApiPath,
      methods: [apigatewayv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration("AdminSessionLambdaIntegration", this.adminFunction),
    });

    this.api.addRoutes({
      path: props.adminReportApiPath,
      methods: [apigatewayv2.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration("AdminReportLambdaIntegration", this.adminFunction),
    });

    const alertTopic = new sns.Topic(this, "OperationalAlertsTopic", {
      topicName: `${resourcePrefix}-operational-alerts`,
      displayName: `${props.partnerKey.toUpperCase()} intake operational alerts`,
    });
    alertTopic.addSubscription(new subscriptions.EmailSubscription(props.alertEmail));

    const alarmAction = new cloudwatchActions.SnsAction(alertTopic);

    for (const [alarmId, handlerFunction] of [
      ["IntakeHandlerErrorsAlarm", this.function],
      ["RewardSpinHandlerErrorsAlarm", this.rewardSpinFunction],
      ["AdminHandlerErrorsAlarm", this.adminFunction],
    ] as const) {
      const alarm = new cloudwatch.Alarm(this, alarmId, {
        alarmName: `${resourcePrefix}-${alarmId}`,
        alarmDescription: `${props.partnerKey} Lambda errors detected for ${handlerFunction.functionName}.`,
        metric: handlerFunction.metricErrors({
          period: cdk.Duration.minutes(5),
          statistic: "sum",
        }),
        threshold: 1,
        evaluationPeriods: 1,
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      });
      alarm.addAlarmAction(alarmAction);
    }

    const api5xxAlarm = new cloudwatch.Alarm(this, "Api5xxAlarm", {
      alarmName: `${resourcePrefix}-api-5xx`,
      alarmDescription: `${props.partnerKey} intake API Gateway 5xx responses detected.`,
      metric: new cloudwatch.Metric({
        namespace: "AWS/ApiGateway",
        metricName: "5xx",
        dimensionsMap: {
          ApiId: this.api.apiId,
          Stage: "$default",
        },
        statistic: "sum",
        period: cdk.Duration.minutes(5),
      }),
      threshold: 1,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    api5xxAlarm.addAlarmAction(alarmAction);

    const apiHighVolumeAlarm = new cloudwatch.Alarm(this, "ApiHighVolumeAlarm", {
      alarmName: `${resourcePrefix}-api-high-volume`,
      alarmDescription: `${props.partnerKey} intake API request volume is above the expected campaign baseline.`,
      metric: new cloudwatch.Metric({
        namespace: "AWS/ApiGateway",
        metricName: "Count",
        dimensionsMap: {
          ApiId: this.api.apiId,
          Stage: "$default",
        },
        statistic: "sum",
        period: cdk.Duration.minutes(5),
      }),
      threshold: 250,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    apiHighVolumeAlarm.addAlarmAction(alarmAction);

    new cdk.CfnOutput(this, "ApiEndpoint", {
      value: `${this.api.apiEndpoint}${props.apiPath}`,
      description: `${props.partnerKey} intake API endpoint for VITE_SWCA_INTAKE_API_URL`,
    });

    new cdk.CfnOutput(this, "SubmissionsBucketName", {
      value: this.bucket.bucketName,
      description: `${props.partnerKey} intake S3 submissions bucket`,
    });

    new cdk.CfnOutput(this, "RewardSpinApiEndpoint", {
      value: `${this.api.apiEndpoint}${props.rewardSpinApiPath}`,
      description: `${props.partnerKey} reward spin API endpoint for VITE_SWCA_REWARD_SPIN_API_URL`,
    });

    new cdk.CfnOutput(this, "RewardContactApiEndpoint", {
      value: `${this.api.apiEndpoint}${props.rewardContactApiPath}`,
      description: `${props.partnerKey} reward contact API endpoint derived from VITE_SWCA_REWARD_SPIN_API_URL`,
    });

    new cdk.CfnOutput(this, "RewardCertificateApiEndpoint", {
      value: `${this.api.apiEndpoint}${props.rewardCertificateApiPath}`,
      description: `${props.partnerKey} reward certificate API endpoint for VITE_SWCA_REWARD_CERTIFICATE_API_URL`,
    });

    new cdk.CfnOutput(this, "RewardClaimsTableName", {
      value: this.rewardClaimsTable.tableName,
      description: `${props.partnerKey} reward eligibility and claim table`,
    });

    new cdk.CfnOutput(this, "CampaignEventsTableName", {
      value: this.campaignEventsTable.tableName,
      description: `${props.partnerKey} first-party campaign events table`,
    });

    new cdk.CfnOutput(this, "CampaignEventApiEndpoint", {
      value: `${this.api.apiEndpoint}${props.eventApiPath}`,
      description: `${props.partnerKey} campaign event API endpoint for VITE_SWCA_EVENT_API_URL`,
    });

    new cdk.CfnOutput(this, "AdminSessionApiEndpoint", {
      value: `${this.api.apiEndpoint}${props.adminSessionApiPath}`,
      description: `${props.partnerKey} admin session API endpoint for VITE_SWCA_ADMIN_SESSION_API_URL`,
    });

    new cdk.CfnOutput(this, "AdminReportApiEndpoint", {
      value: `${this.api.apiEndpoint}${props.adminReportApiPath}`,
      description: `${props.partnerKey} admin report API endpoint for VITE_SWCA_ADMIN_REPORT_API_URL`,
    });

    new cdk.CfnOutput(this, "OperationalAlertsTopicArn", {
      value: alertTopic.topicArn,
      description: `${props.partnerKey} operational alerts SNS topic ARN`,
    });
  }
}

export function repoPath(...segments: string[]) {
  return path.join(__dirname, "..", "..", ...segments);
}
