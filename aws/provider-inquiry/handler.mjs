import { DynamoDBClient, GetItemCommand, PutItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { createInquiryHandler } from "./core.mjs";

const db = new DynamoDBClient({});
const ses = new SESClient({});
const TableName = process.env.SUBMISSIONS_TABLE;
const key = (id) => ({ submissionId: { S: `inquiry:${id}` } });
const conditionalFailure = (error) => error?.name === "ConditionalCheckFailedException";

const store = {
  async allowRequest(hash, timestamp) {
    try {
      await db.send(new UpdateItemCommand({ TableName, Key: { submissionId: { S: `rate:${hash}` } },
        UpdateExpression: "SET expiresAt = :expiry ADD attempts :one",
        ConditionExpression: "attribute_not_exists(attempts) OR attempts < :limit",
        ExpressionAttributeValues: { ":expiry": { N: String(timestamp + 1800) }, ":one": { N: "1" }, ":limit": { N: "5" } },
      }));
      return true;
    } catch (error) {
      if (conditionalFailure(error)) return false;
      throw error;
    }
  },
  async claim(id, hash, data, timestamp) {
    const { Item } = await db.send(new GetItemCommand({ TableName, Key: key(id), ConsistentRead: true }));
    if (Item && Item.payloadHash.S !== hash) return "mismatch";
    if (Item?.status.S === "SENT") return "sent";
    try {
      await db.send(new PutItemCommand({ TableName, Item: {
        ...key(id), payloadHash: { S: hash }, status: { S: "SENDING" },
        createdAt: { S: new Date(timestamp * 1000).toISOString() },
        leaseUntil: { N: String(timestamp + 60) }, expiresAt: { N: String(timestamp + 90 * 86400) },
        ...Object.fromEntries(Object.entries(data).map(([name, value]) => [name, { S: value }])),
      }, ConditionExpression: "attribute_not_exists(submissionId) OR (payloadHash = :hash AND (#status = :failed OR (#status = :sending AND leaseUntil <= :now)))",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: { ":hash": { S: hash }, ":failed": { S: "FAILED" }, ":sending": { S: "SENDING" }, ":now": { N: String(timestamp) } },
      }));
      return "claimed";
    } catch (error) {
      if (conditionalFailure(error)) return "busy";
      throw error;
    }
  },
  async complete(id, messageId) {
    await db.send(new UpdateItemCommand({ TableName, Key: key(id),
      UpdateExpression: "SET #status = :sent, messageId = :messageId REMOVE leaseUntil",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: { ":sent": { S: "SENT" }, ":messageId": { S: messageId } },
    }));
  },
  async fail(id) {
    await db.send(new UpdateItemCommand({ TableName, Key: key(id), UpdateExpression: "SET #status = :failed REMOVE leaseUntil",
      ExpressionAttributeNames: { "#status": "status" }, ExpressionAttributeValues: { ":failed": { S: "FAILED" } },
    }));
  },
};

export const handler = createInquiryHandler({ store,
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? "").split(","),
  async sendEmail(data, submissionId) {
    const result = await ses.send(new SendEmailCommand({ Source: process.env.SES_FROM_EMAIL,
      Destination: { ToAddresses: ["info@veevee.io"] }, ReplyToAddresses: [data.email],
      Message: { Subject: { Charset: "UTF-8", Data: "VeeVee provider inquiry" }, Body: { Text: { Charset: "UTF-8",
        Data: ["New inquiry from myveevee.com/providers", "", `Name: ${data.name}`, `Practice: ${data.practice}`,
          `Work email: ${data.email}`, `Phone: ${data.phone || "Not provided"}`, "", "Message:", data.message || "Not provided",
          "", `Reference: ${submissionId}`].join("\n"),
      } } },
    }));
    return result.MessageId;
  },
});
