import * as path from "node:path";
import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigatewayv2";
import * as integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as nodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as logs from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";

export class ProviderInquiryStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const origins = ["https://myveevee.com", "https://www.myveevee.com", "https://main.dc8zya6af7720.amplifyapp.com"];
    const table = new dynamodb.Table(this, "Inquiries", {
      tableName: "myveevee-provider-inquiries", partitionKey: { name: "submissionId", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, timeToLiveAttribute: "expiresAt",
      encryption: dynamodb.TableEncryption.AWS_MANAGED, removalPolicy: cdk.RemovalPolicy.RETAIN,
    });
    const logGroup = new logs.LogGroup(this, "Logs", { logGroupName: "/aws/lambda/myveevee-provider-inquiry",
      retention: logs.RetentionDays.ONE_MONTH, removalPolicy: cdk.RemovalPolicy.RETAIN });
    const handler = new nodejs.NodejsFunction(this, "Handler", {
      functionName: "myveevee-provider-inquiry", entry: path.resolve(__dirname, "../../aws/provider-inquiry/handler.mjs"),
      projectRoot: path.resolve(__dirname, "../.."), handler: "handler", runtime: lambda.Runtime.NODEJS_22_X,
      architecture: lambda.Architecture.ARM_64, timeout: cdk.Duration.seconds(20), memorySize: 256, logGroup,
      bundling: { format: nodejs.OutputFormat.ESM, target: "node22", minify: true, externalModules: ["@aws-sdk/*"] },
      environment: { SUBMISSIONS_TABLE: table.tableName, SES_FROM_EMAIL: "info@veevee.io", ALLOWED_ORIGINS: origins.join(",") },
    });
    table.grantReadWriteData(handler);
    handler.addToRolePolicy(new iam.PolicyStatement({ actions: ["ses:SendEmail"],
      resources: [this.formatArn({ service: "ses", resource: "identity", resourceName: "veevee.io" }),
        this.formatArn({ service: "ses", resource: "identity", resourceName: "info@veevee.io" })],
      conditions: { StringEquals: { "ses:FromAddress": "info@veevee.io" }, "ForAllValues:StringEquals": { "ses:Recipients": ["info@veevee.io"] } },
    }));
    const api = new apigateway.HttpApi(this, "Api", { apiName: "myveevee-provider-inquiry",
      corsPreflight: { allowOrigins: origins, allowHeaders: ["content-type"],
        allowMethods: [apigateway.CorsHttpMethod.POST, apigateway.CorsHttpMethod.OPTIONS], maxAge: cdk.Duration.hours(1) },
    });
    api.addRoutes({ path: "/forms/provider-inquiry", methods: [apigateway.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration("InquiryIntegration", handler) });
    const stage = api.defaultStage!.node.defaultChild as apigateway.CfnStage;
    stage.defaultRouteSettings = { throttlingBurstLimit: 10, throttlingRateLimit: 2 };
    new cdk.CfnOutput(this, "ProviderInquiryEndpoint", { value: `${api.apiEndpoint}/forms/provider-inquiry` });
  }
}
