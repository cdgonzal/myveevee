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

export type TwinCardActivationProps = {
  allowedOrigins: string[];
  publicBaseUrl: string;
  alertEmail: string;
  bedrockImageModelId: string;
};

export class TwinCardActivation extends Construct {
  readonly api: apigatewayv2.HttpApi;
  readonly bucket: s3.Bucket;
  readonly cardsTable: dynamodb.Table;
  readonly function: nodejs.NodejsFunction;

  constructor(scope: Construct, id: string, props: TwinCardActivationProps) {
    super(scope, id);

    const resourcePrefix = "myveevee-twin-card";
    const functionName = `${resourcePrefix}-handler`;

    this.bucket = new s3.Bucket(this, "CardsBucket", {
      bucketName: `${resourcePrefix}-${cdk.Stack.of(this).account}-${cdk.Stack.of(this).region}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET],
          allowedOrigins: props.allowedOrigins,
          allowedHeaders: ["*"],
          maxAge: 3600,
        },
      ],
    });

    this.cardsTable = new dynamodb.Table(this, "CardsTable", {
      tableName: `${resourcePrefix}-cards`,
      partitionKey: {
        name: "cardId",
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
      entry: repoPath("aws", "twin-card", "handler.mjs"),
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      projectRoot: repoPath(),
      timeout: cdk.Duration.seconds(45),
      memorySize: 1024,
      logGroup,
      bundling: {
        format: nodejs.OutputFormat.ESM,
        mainFields: ["module", "main"],
        minify: true,
        sourceMap: true,
        target: "node20",
      },
      environment: {
        CARDS_BUCKET: this.bucket.bucketName,
        CARDS_TABLE: this.cardsTable.tableName,
        CARDS_PREFIX: "twin-card",
        PUBLIC_BASE_URL: props.publicBaseUrl,
        ALLOWED_ORIGINS: cdk.Fn.join(",", props.allowedOrigins),
        BEDROCK_IMAGE_MODEL_ID: props.bedrockImageModelId,
      },
    });

    this.bucket.grantReadWrite(this.function, "twin-card/*");
    this.cardsTable.grantReadWriteData(this.function);
    this.function.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["bedrock:InvokeModel"],
        resources: ["*"],
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

    const integration = new integrations.HttpLambdaIntegration("TwinCardLambdaIntegration", this.function);

    this.api.addRoutes({
      path: "/twin-card/cards",
      methods: [apigatewayv2.HttpMethod.POST],
      integration,
    });

    this.api.addRoutes({
      path: "/twin-card/cards/{cardId}",
      methods: [apigatewayv2.HttpMethod.GET],
      integration,
    });

    this.api.addRoutes({
      path: "/twin-card/admin/cards",
      methods: [apigatewayv2.HttpMethod.GET],
      integration,
    });

    const alertTopic = new sns.Topic(this, "OperationalAlertsTopic", {
      topicName: `${resourcePrefix}-operational-alerts`,
      displayName: "Twin Card operational alerts",
    });
    alertTopic.addSubscription(new subscriptions.EmailSubscription(props.alertEmail));
    const alarmAction = new cloudwatchActions.SnsAction(alertTopic);

    const lambdaErrors = new cloudwatch.Alarm(this, "HandlerErrorsAlarm", {
      alarmName: `${resourcePrefix}-handler-errors`,
      alarmDescription: "Twin Card Lambda errors detected.",
      metric: this.function.metricErrors({
        period: cdk.Duration.minutes(5),
        statistic: "sum",
      }),
      threshold: 1,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    lambdaErrors.addAlarmAction(alarmAction);

    const api5xx = new cloudwatch.Alarm(this, "Api5xxAlarm", {
      alarmName: `${resourcePrefix}-api-5xx`,
      alarmDescription: "Twin Card API Gateway 5xx responses detected.",
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
    api5xx.addAlarmAction(alarmAction);

    new cdk.CfnOutput(this, "TwinCardApiEndpoint", {
      value: `${this.api.apiEndpoint}/twin-card/cards`,
      description: "Twin Card create-card API endpoint for VITE_TWIN_CARD_API_URL",
    });

    new cdk.CfnOutput(this, "TwinCardAdminApiEndpoint", {
      value: `${this.api.apiEndpoint}/twin-card/admin/cards`,
      description: "Twin Card admin-list endpoint.",
    });

    new cdk.CfnOutput(this, "TwinCardCardsBucketName", {
      value: this.bucket.bucketName,
      description: "Private Twin Card image bucket.",
    });

    new cdk.CfnOutput(this, "TwinCardCardsTableName", {
      value: this.cardsTable.tableName,
      description: "Twin Card lead and generation record table.",
    });
  }
}

function repoPath(...segments: string[]) {
  return path.join(__dirname, "..", "..", ...segments);
}
