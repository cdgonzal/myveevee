import * as path from "node:path";
import * as cdk from "aws-cdk-lib";
import * as apigatewayv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as nodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as logs from "aws-cdk-lib/aws-logs";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export type PartnerIntakeFormProps = {
  partnerKey: string;
  formId: string;
  apiPath: string;
  lambdaEntry: string;
  rewardSpinApiPath: string;
  rewardContactApiPath: string;
  rewardSpinLambdaEntry: string;
  submissionsPrefix: string;
  allowedOrigins: string[];
  sesFromEmail: string;
  sesToEmails: string[];
};

export class PartnerIntakeForm extends Construct {
  readonly api: apigatewayv2.HttpApi;
  readonly bucket: s3.Bucket;
  readonly function: nodejs.NodejsFunction;
  readonly rewardClaimsTable: dynamodb.Table;
  readonly rewardSpinFunction: nodejs.NodejsFunction;

  constructor(scope: Construct, id: string, props: PartnerIntakeFormProps) {
    super(scope, id);

    const resourcePrefix = `myveevee-${props.partnerKey}-intake`;
    const functionName = `${resourcePrefix}-handler`;
    const rewardSpinFunctionName = `${resourcePrefix}-reward-spin-handler`;

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
        ALLOWED_ORIGINS: cdk.Fn.join(",", props.allowedOrigins),
      },
    });

    this.rewardClaimsTable.grantReadWriteData(this.rewardSpinFunction);

    this.api = new apigatewayv2.HttpApi(this, "HttpApi", {
      apiName: `${resourcePrefix}-api`,
      corsPreflight: {
        allowHeaders: ["content-type"],
        allowMethods: [apigatewayv2.CorsHttpMethod.POST, apigatewayv2.CorsHttpMethod.OPTIONS],
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

    new cdk.CfnOutput(this, "RewardClaimsTableName", {
      value: this.rewardClaimsTable.tableName,
      description: `${props.partnerKey} reward eligibility and claim table`,
    });
  }
}

export function repoPath(...segments: string[]) {
  return path.join(__dirname, "..", "..", ...segments);
}
