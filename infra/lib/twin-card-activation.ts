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
import * as s3Notifications from "aws-cdk-lib/aws-s3-notifications";
import * as sns from "aws-cdk-lib/aws-sns";
import * as subscriptions from "aws-cdk-lib/aws-sns-subscriptions";
import { Construct } from "constructs";

export type TwinCardActivationProps = {
  allowedOrigins: string[];
  publicBaseUrl: string;
  alertEmail: string;
  bedrockImageModelId: string;
  bedrockImageProviderPriority: string;
  avatarStyleReferenceS3Key: string;
};

export class TwinCardActivation extends Construct {
  readonly api: apigatewayv2.HttpApi;
  readonly bucket: s3.Bucket;
  readonly cardsTable: dynamodb.Table;
  readonly function: nodejs.NodejsFunction;
  readonly avatarGeneratorFunction: nodejs.NodejsFunction;
  readonly printComposerFunction: nodejs.NodejsFunction;

  constructor(scope: Construct, id: string, props: TwinCardActivationProps) {
    super(scope, id);

    const resourcePrefix = "myveevee-twin-card";
    const functionName = `${resourcePrefix}-handler`;
    const avatarGeneratorFunctionName = `${resourcePrefix}-avatar-generator`;
    const printComposerFunctionName = `${resourcePrefix}-print-composer`;
    const falKeySecretName = "/myveevee/twin-card/fal-key";

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
        commandHooks: {
          beforeBundling() {
            return [];
          },
          beforeInstall() {
            return [];
          },
          afterBundling(_inputDir, outputDir) {
            return [
              `npm install --prefix "${outputDir}" --os=linux --cpu=arm64 --libc=glibc sharp@0.34.5`,
            ];
          },
        },
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
        DASHBOARD_PIN: "5353",
      },
    });

    this.bucket.grantReadWrite(this.function, "twin-card/*");
    this.bucket.grantRead(this.function, "twin-card-replay/*");
    this.cardsTable.grantReadWriteData(this.function);

    const avatarGeneratorLogGroup = new logs.LogGroup(this, "AvatarGeneratorLogGroup", {
      logGroupName: `/aws/lambda/${avatarGeneratorFunctionName}`,
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.avatarGeneratorFunction = new nodejs.NodejsFunction(this, "AvatarGenerator", {
      functionName: avatarGeneratorFunctionName,
      entry: repoPath("aws", "twin-card", "avatar-generator.mjs"),
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      projectRoot: repoPath(),
      timeout: cdk.Duration.seconds(90),
      memorySize: 1536,
      logGroup: avatarGeneratorLogGroup,
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
        BEDROCK_IMAGE_MODEL_ID: props.bedrockImageModelId,
        BEDROCK_IMAGE_PROVIDER_PRIORITY: props.bedrockImageProviderPriority,
        AVATAR_STYLE_REFERENCE_S3_KEY: props.avatarStyleReferenceS3Key,
        FAL_KEY_SECRET_NAME: falKeySecretName,
      },
    });

    const printComposerLogGroup = new logs.LogGroup(this, "PrintComposerLogGroup", {
      logGroupName: `/aws/lambda/${printComposerFunctionName}`,
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.printComposerFunction = new nodejs.NodejsFunction(this, "PrintComposer", {
      functionName: printComposerFunctionName,
      entry: repoPath("aws", "twin-card", "print-composer.mjs"),
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      depsLockFilePath: repoPath("aws", "twin-card", "package-lock.json"),
      projectRoot: repoPath(),
      timeout: cdk.Duration.seconds(30),
      memorySize: 1024,
      logGroup: printComposerLogGroup,
      bundling: {
        commandHooks: {
          beforeBundling() {
            return [];
          },
          beforeInstall() {
            return [];
          },
          afterBundling(_inputDir, outputDir) {
            return [
              `npm install --prefix "${outputDir}" --os=linux --cpu=arm64 --libc=glibc sharp@0.34.5`,
            ];
          },
        },
        format: nodejs.OutputFormat.ESM,
        loader: {
          ".png": "dataurl",
          ".svg": "text",
          ".ttf": "dataurl",
        },
        mainFields: ["module", "main"],
        minify: true,
        nodeModules: ["sharp"],
        sourceMap: true,
        target: "node20",
      },
      environment: {
        CARDS_BUCKET: this.bucket.bucketName,
        CARDS_TABLE: this.cardsTable.tableName,
        CARDS_PREFIX: "twin-card",
      },
    });

    this.bucket.grantReadWrite(this.avatarGeneratorFunction, "twin-card/*");
    this.bucket.grantReadWrite(this.printComposerFunction, "twin-card/*");
    this.cardsTable.grantReadWriteData(this.avatarGeneratorFunction);
    this.cardsTable.grantReadWriteData(this.printComposerFunction);
    this.avatarGeneratorFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["bedrock:InvokeModel"],
        resources: ["*"],
      })
    );
    this.avatarGeneratorFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["aws-marketplace:ViewSubscriptions", "aws-marketplace:Subscribe", "aws-marketplace:Unsubscribe"],
        resources: ["*"],
      })
    );
    this.avatarGeneratorFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["secretsmanager:GetSecretValue"],
        resources: [
          cdk.Fn.sub("arn:${AWS::Partition}:secretsmanager:${AWS::Region}:${AWS::AccountId}:secret:${SecretName}*", {
            SecretName: falKeySecretName,
          }),
        ],
      })
    );

    this.bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3Notifications.LambdaDestination(this.avatarGeneratorFunction),
      { prefix: "twin-card/", suffix: "/source/normalized.jpg" }
    );

    this.bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3Notifications.LambdaDestination(this.printComposerFunction),
      { prefix: "twin-card/", suffix: "/generated/avatar.png" }
    );

    this.bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3Notifications.LambdaDestination(this.printComposerFunction),
      { prefix: "twin-card/", suffix: "/generated/avatar.jpg" }
    );

    this.api = new apigatewayv2.HttpApi(this, "HttpApi", {
      apiName: `${resourcePrefix}-api`,
      corsPreflight: {
        allowHeaders: ["authorization", "content-type", "x-twin-dashboard-pin"],
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

    this.api.addRoutes({
      path: "/twin-card/admin/cards/{cardId}/printed",
      methods: [apigatewayv2.HttpMethod.POST],
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

    const avatarGeneratorErrors = new cloudwatch.Alarm(this, "AvatarGeneratorErrorsAlarm", {
      alarmName: `${resourcePrefix}-avatar-generator-errors`,
      alarmDescription: "Twin Card avatar generator Lambda errors detected.",
      metric: this.avatarGeneratorFunction.metricErrors({
        period: cdk.Duration.minutes(5),
        statistic: "sum",
      }),
      threshold: 1,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    avatarGeneratorErrors.addAlarmAction(alarmAction);

    const printComposerErrors = new cloudwatch.Alarm(this, "PrintComposerErrorsAlarm", {
      alarmName: `${resourcePrefix}-print-composer-errors`,
      alarmDescription: "Twin Card print composer Lambda errors detected.",
      metric: this.printComposerFunction.metricErrors({
        period: cdk.Duration.minutes(5),
        statistic: "sum",
      }),
      threshold: 1,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    printComposerErrors.addAlarmAction(alarmAction);

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
