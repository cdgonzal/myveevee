import { test } from "node:test";
import assert from "node:assert/strict";
import { createInquiryHandler } from "./core.mjs";

const requestId = "de75ec68-a61c-44bc-99a8-1c3edb80ce88";
const fields = { requestId, name: "Test Contact", practice: "Example Practice", email: "person@example.com", phone: "", message: "Please share more information." };
const event = (payload = fields, overrides = {}) => ({
  headers: { origin: "https://myveevee.com", "content-type": "application/json" },
  requestContext: { http: { method: "POST", sourceIp: "192.0.2.1" } }, body: JSON.stringify(payload), ...overrides,
});
function setup({ claim = "claimed", sendFails = false, rateAllowed = true, completeFails = false } = {}) {
  const calls = [];
  const handle = createInquiryHandler({ allowedOrigins: ["https://myveevee.com"], now: () => 1000000,
    logger: { info() {}, error() {} },
    store: {
      async allowRequest(hash) { calls.push(["rate", hash]); return rateAllowed; },
      async claim(id, hash, data) { calls.push(["claim", id, data]); return claim; },
      async complete() { calls.push(["complete"]); if (completeFails) throw new Error("db failure"); },
      async fail() { calls.push(["fail"]); },
    },
    async sendEmail(data, id) { calls.push(["email", data, id]); if (sendFails) throw new Error("SES unavailable"); return "ses-message-id"; },
  });
  return { handle, calls };
}

test("saves the normalized inquiry before emailing, and confirms successful delivery to SES", async () => {
  const { handle, calls } = setup();
  const result = await handle(event({ ...fields, name: " Test Contact ", email: "PERSON@EXAMPLE.COM" }));
  assert.equal(result.statusCode, 200);
  assert.deepEqual(JSON.parse(result.body), { ok: true, submissionId: requestId });
  assert.deepEqual(calls.map(([name]) => name), ["rate", "claim", "email", "complete"]);
  assert.equal(calls[1][2].email, "person@example.com");
  assert.equal(result.headers["access-control-allow-origin"], "https://myveevee.com");
  assert.doesNotMatch(calls[0][1], /192\.0\.2\.1/);
});

test("rejects malformed, missing, oversized and header-injected fields without sending", async () => {
  for (const payload of [null, [], { ...fields, name: " " }, { ...fields, email: "bad" }, { ...fields, practice: 4 },
    { ...fields, message: "x".repeat(2001) }, { ...fields, email: "a@example.com\r\nBcc: x@example.com" }, { ...fields, requestId: "invalid" }]) {
    const { handle, calls } = setup();
    assert.equal((await handle(event(payload))).statusCode, 400);
    assert.equal(calls.length, 0);
  }
});

test("rejects unknown origins, non-POST requests, invalid JSON and excessive bodies", async () => {
  for (const [request, status] of [
    [event(fields, { headers: { origin: "https://example.com" } }), 403],
    [event(fields, { requestContext: { http: { method: "GET" } } }), 405],
    [event(fields, { body: "{" }), 400], [event(fields, { body: "x".repeat(22001) }), 413],
  ]) {
    const { handle, calls } = setup();
    assert.equal((await handle(request)).statusCode, status);
    assert.equal(calls.length, 0);
  }
});

test("honeypot submissions do not write data or send mail", async () => {
  const { handle, calls } = setup();
  assert.equal((await handle(event({ ...fields, website: "spam" }))).statusCode, 200);
  assert.equal(calls.length, 0);
});

test("throttles abusive submissions before storing or sending", async () => {
  const { handle, calls } = setup({ rateAllowed: false });
  assert.equal((await handle(event())).statusCode, 429);
  assert.deepEqual(calls.map(([name]) => name), ["rate"]);
});

test("a retry after success never sends a second email", async () => {
  const { handle, calls } = setup({ claim: "sent" });
  assert.equal((await handle(event())).statusCode, 200);
  assert.equal(calls.some(([name]) => name === "email"), false);
});

test("concurrent or changed submissions using the same ID do not send", async () => {
  for (const claim of ["busy", "mismatch"]) {
    const { handle, calls } = setup({ claim });
    assert.equal((await handle(event())).statusCode, 409);
    assert.equal(calls.some(([name]) => name === "email"), false);
  }
});

test("email failure records a retryable failure and never reports success", async () => {
  const { handle, calls } = setup({ sendFails: true });
  assert.equal((await handle(event())).statusCode, 503);
  assert.equal(calls.at(-1)[0], "fail");
  assert.equal(calls.some(([name]) => name === "complete"), false);
});

test("accepted email is still acknowledged if the final status update fails", async () => {
  const { handle, calls } = setup({ completeFails: true });
  assert.equal((await handle(event())).statusCode, 200);
  assert.equal(calls.some(([name]) => name === "fail"), false);
});
