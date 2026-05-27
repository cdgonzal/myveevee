const FAL_KEY = process.env.FAL_KEY;

const args = parseArgs(process.argv.slice(2));
const endpoints = splitList(args.endpoints ?? args.endpoint ?? "fal-ai/nano-banana-2/edit,openai/gpt-image-2/edit");
const requestIds = splitList(args.requestIds ?? args.requestId);

if (!FAL_KEY) {
  throw new Error("FAL_KEY is required.");
}

const pricing = await fetchFalPricing(endpoints);
const billingEvents = requestIds.length ? await fetchFalBillingEvents({ endpoints, requestIds }) : null;
const usage = args.usage ? await fetchFalUsage(endpoints) : null;

console.log(JSON.stringify({
  ok: true,
  checkedAt: new Date().toISOString(),
  endpoints,
  requestIds,
  pricing,
  billingEvents,
  usage,
}, null, 2));

async function fetchFalPricing(endpointIds) {
  const params = new URLSearchParams();
  for (const endpointId of endpointIds) params.append("endpoint_id", endpointId);
  const response = await fetch(`https://api.fal.ai/v1/models/pricing?${params}`, {
    headers: { Authorization: `Key ${FAL_KEY}` },
  });
  return await readFalResponse(response);
}

async function fetchFalBillingEvents({ endpoints: endpointIds, requestIds: ids }) {
  const params = new URLSearchParams();
  for (const endpointId of endpointIds) params.append("endpoint_id", endpointId);
  for (const requestId of ids.slice(0, 50)) params.append("request_id", requestId);
  params.set("limit", String(Math.min(ids.length, 50)));
  params.set("expand", "auth_method");
  const response = await fetch(`https://api.fal.ai/v1/models/billing-events?${params}`, {
    headers: { Authorization: `Key ${FAL_KEY}` },
  });
  return await readFalResponse(response);
}

async function fetchFalUsage(endpointIds) {
  const params = new URLSearchParams();
  for (const endpointId of endpointIds) params.append("endpoint_id", endpointId);
  params.set("limit", "50");
  params.set("expand", "summary");
  params.set("timezone", "America/New_York");
  const response = await fetch(`https://api.fal.ai/v1/models/usage?${params}`, {
    headers: { Authorization: `Key ${FAL_KEY}` },
  });
  return await readFalResponse(response);
}

async function readFalResponse(response) {
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text.slice(0, 2000) };
  }
  return {
    ok: response.ok,
    status: response.status,
    body,
    note: response.ok
      ? "fal Platform API request succeeded."
      : "fal Platform API request failed. Billing-events and usage usually require an admin API key.",
  };
}

function splitList(value) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseArgs(rawArgs) {
  const parsed = {};
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (!arg.startsWith("--")) continue;
    const [key, inlineValue] = arg.slice(2).split("=", 2);
    if (key === "usage") {
      parsed.usage = true;
      continue;
    }
    if (typeof inlineValue !== "undefined") {
      parsed[key] = inlineValue;
    } else {
      parsed[key] = rawArgs[index + 1];
      index += 1;
    }
  }
  return parsed;
}
