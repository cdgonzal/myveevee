import { createHash } from "node:crypto";

const LIMITS = { name: 100, practice: 160, email: 254, phone: 40, message: 2000 };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function createInquiryHandler({ store, sendEmail, allowedOrigins, logger = console, now = Date.now }) {
  return async (event) => {
    const origin = event.headers?.origin ?? event.headers?.Origin;
    const respond = (statusCode, body) => ({ statusCode,
      headers: { "content-type": "application/json", "cache-control": "no-store",
        ...(allowedOrigins.includes(origin) ? { "access-control-allow-origin": origin, vary: "Origin" } : {}) },
      body: JSON.stringify(body),
    });
    if (!allowedOrigins.includes(origin)) return respond(403, { message: "This form must be submitted from the VeeVee website." });
    if (event.requestContext?.http?.method !== "POST") return respond(405, { message: "Method not allowed." });
    if (!(event.headers?.["content-type"] ?? event.headers?.["Content-Type"] ?? "").toLowerCase().startsWith("application/json")) {
      return respond(415, { message: "Please submit the form as JSON." });
    }
    let payload;
    try {
      if (typeof event.body !== "string" || event.body.length > 22000) return respond(413, { message: "The submission is too large." });
      const body = event.isBase64Encoded ? Buffer.from(event.body, "base64").toString("utf8") : event.body;
      if (Buffer.byteLength(body) > 16000) return respond(413, { message: "The submission is too large." });
      payload = JSON.parse(body);
      if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("Invalid body");
    } catch {
      return respond(400, { message: "Please check your form and try again." });
    }
    if (!UUID.test(payload.requestId ?? "")) return respond(400, { message: "Please refresh the page and try again." });
    if (payload.website) return respond(200, { ok: true, submissionId: payload.requestId });
    const data = {};
    for (const [key, limit] of Object.entries(LIMITS)) {
      const value = payload[key] ?? "";
      if (typeof value !== "string" || value.length > limit || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)) {
        return respond(400, { message: "Please check the length and format of your form fields." });
      }
      if (key !== "message" && /[\r\n]/.test(value)) return respond(400, { message: "Please use a single line for your contact details." });
      data[key] = value.trim();
    }
    data.email = data.email.toLowerCase();
    if (!data.name || !data.practice || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return respond(400, { message: "Please enter your name, practice, and a valid work email." });
    }
    const submissionId = payload.requestId;
    const timestamp = Math.floor(now() / 1000);
    const payloadHash = createHash("sha256").update(JSON.stringify(data)).digest("hex");
    try {
      const ip = event.requestContext?.http?.sourceIp;
      if (!ip || !await store.allowRequest(createHash("sha256").update(`${Math.floor(timestamp / 900)}:${ip}`).digest("hex"), timestamp)) {
        return respond(429, { message: "Too many attempts. Please wait a few minutes before trying again." });
      }
      const claim = await store.claim(submissionId, payloadHash, data, timestamp);
      if (claim === "sent") return respond(200, { ok: true, submissionId });
      if (claim === "mismatch") return respond(409, { message: "Your form changed. Please refresh and submit again." });
      if (claim === "busy") return respond(409, { message: "Your inquiry is still being processed. Please wait a minute and try again." });
      let messageId;
      try {
        messageId = await sendEmail(data, submissionId);
      } catch (error) {
        await store.fail(submissionId);
        throw error;
      }
      try {
        await store.complete(submissionId, messageId);
      } catch {
        // SES accepted the message. Do not tell the visitor to send it again.
        logger.error("Provider inquiry accepted by SES; status update failed", { submissionId, messageId });
      }
      logger.info("Provider inquiry sent", { submissionId, messageId });
      return respond(200, { ok: true, submissionId });
    } catch (error) {
      logger.error("Provider inquiry submission failed", { submissionId, errorName: error?.name ?? "Error" });
      return respond(503, { message: "We couldn’t send your inquiry. Please try again, or email info@veevee.io." });
    }
  };
}
