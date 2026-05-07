import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SITE_ORIGIN = "https://myveevee.com";
const DIST_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const BASE_HTML_PATH = path.join(DIST_DIR, "index.html");

const ROUTES = [
  {
    path: "/",
    title: "VeeVee | Meet Your Health Twin",
    description:
      "VEEVEE is a digital version of your health that brings your records, habits, and care into one place so you can understand your body and make decisions with confidence.",
    robots: "index, follow",
    body: `
      <main data-prerendered-route="/" style="font-family:Inter,Arial,sans-serif;max-width:1040px;margin:0 auto;padding:48px 24px;color:#0b2341;">
        <p style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#1177BA;margin:0 0 12px;">Private. Secure. Yours.</p>
        <h1 style="font-size:48px;line-height:1.1;margin:0 0 16px;">Meet your digital Health Twin</h1>
        <p style="font-size:18px;line-height:1.6;max-width:760px;margin:0 0 24px;">
          VeeVee brings your records, habits, and care into one place so you can understand your body, follow changes over time, and make decisions with confidence.
        </p>
        <h2 style="font-size:28px;margin:40px 0 12px;">How VeeVee works across connected care</h2>
        <p style="font-size:16px;line-height:1.6;max-width:820px;">
          VeeVee helps people describe what is happening, get calmer next-step guidance, and understand how benefits, family support, care-team visibility, and hospital-to-home continuity fit together in one connected experience.
        </p>
        <h3 style="font-size:22px;margin:28px 0 12px;">For everyday users</h3>
        <ul style="line-height:1.7;padding-left:20px;">
          <li>Tell VeeVee what is happening.</li>
          <li>Get clear guidance and questions to ask next.</li>
          <li>Understand how your plan or benefits may shape the next step.</li>
        </ul>
        <h3 style="font-size:22px;margin:28px 0 12px;">For hospitals</h3>
        <p style="line-height:1.7;">
          VeeVee frames hospital value around new revenue support, labor efficiency, lower operational risk, and better visibility from bedside to home.
        </p>
        <h3 style="font-size:22px;margin:28px 0 12px;">Technology backbone</h3>
        <p style="line-height:1.7;">
          VeeVee is built to keep data private, respond quickly, and support both hospital workflows and the broader app experience with a responsive, connected care model.
        </p>
      </main>
    `,
  },
  {
    path: "/features",
    title: "VeeVee Features | Connected Care, Guidance, and Family Support",
    description:
      "Explore VeeVee features for connected care, everyday guidance, family support, care-team visibility, and hospital-to-home continuity.",
    robots: "index, follow",
    body: `
      <main data-prerendered-route="/features" style="font-family:Inter,Arial,sans-serif;max-width:1040px;margin:0 auto;padding:48px 24px;color:#0b2341;">
        <p style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#1177BA;margin:0 0 12px;">Features</p>
        <h1 style="font-size:42px;line-height:1.1;margin:0 0 16px;">Digital health twin features for connected care.</h1>
        <p style="font-size:18px;line-height:1.6;max-width:800px;margin:0 0 28px;">
          Explore the VeeVee features that bring health records, family support, care-team visibility, and hospital-to-home continuity into one connected experience.
        </p>
        <ul style="line-height:1.8;padding-left:20px;">
          <li>Guidance people can actually use.</li>
          <li>VeeVee Simulator for simple what-if scenarios.</li>
          <li>Family engagement without more confusion.</li>
          <li>Better visibility for care teams.</li>
          <li>Hospital-to-home connection after discharge.</li>
        </ul>
      </main>
    `,
  },
  {
    path: "/technology",
    title: "VeeVee Technology | Private, Fast Infrastructure for Connected Care",
    description:
      "See how VeeVee is built for connected care with privacy-minded architecture, fast alerts, unit-ready scale, and a responsive app experience.",
    robots: "index, follow",
    body: `
      <main data-prerendered-route="/technology" style="font-family:Inter,Arial,sans-serif;max-width:1040px;margin:0 auto;padding:48px 24px;color:#0b2341;">
        <p style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#76B900;margin:0 0 12px;">Technology</p>
        <h1 style="font-size:42px;line-height:1.1;margin:0 0 16px;">Private, fast technology for connected care.</h1>
        <p style="font-size:18px;line-height:1.6;max-width:820px;margin:0 0 28px;">
          VeeVee is built to support a digital health twin experience with privacy-minded infrastructure, faster response times, and technology that can support both hospital workflows and the app experience.
        </p>
        <ul style="line-height:1.8;padding-left:20px;">
          <li>Private-by-design bedside processing.</li>
          <li>Fast alerts when seconds matter.</li>
          <li>Unit-ready scale across many rooms and streams.</li>
          <li>Simulation and personalized guidance backed by the same foundation.</li>
        </ul>
      </main>
    `,
  },
  {
    path: "/simulator",
    title: "VeeVee Simulator | Explore Health and Coverage Scenarios",
    description:
      "Try the VeeVee Simulator to explore health, routine, and coverage scenarios with clearer next steps and a more personal picture of your care story.",
    robots: "index, follow",
    body: `
      <main data-prerendered-route="/simulator" style="font-family:Inter,Arial,sans-serif;max-width:1040px;margin:0 auto;padding:48px 24px;color:#0b2341;">
        <p style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#1177BA;margin:0 0 12px;">Simulator</p>
        <h1 style="font-size:42px;line-height:1.1;margin:0 0 16px;">Try a health and coverage scenario with VeeVee Simulator.</h1>
        <p style="font-size:18px;line-height:1.6;max-width:820px;margin:0 0 28px;">
          VeeVee Simulator gives people a quick preview of what may matter, what questions to ask, and what next steps may help based on a simple health and insurance scenario.
        </p>
        <ol style="line-height:1.8;padding-left:20px;">
          <li>Pick a scenario.</li>
          <li>Adjust payer, severity, duration, and sleep inputs.</li>
          <li>Review outcome, signals, recommendations, benefits, and follow-up questions.</li>
        </ol>
      </main>
    `,
  },
  {
    path: "/testimonials",
    title: "VeeVee Testimonials | Stories from Patients, Caregivers, and Clinicians",
    description:
      "Read how patients, caregivers, Medicare users, and clinicians describe VeeVee as a simpler, clearer, and more connected health experience.",
    robots: "index, follow",
    body: `
      <main data-prerendered-route="/testimonials" style="font-family:Inter,Arial,sans-serif;max-width:1040px;margin:0 auto;padding:48px 24px;color:#0b2341;">
        <p style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#1177BA;margin:0 0 12px;">Testimonials</p>
        <h1 style="font-size:42px;line-height:1.1;margin:0 0 16px;">VeeVee testimonials from patients, caregivers, and clinicians.</h1>
        <p style="font-size:18px;line-height:1.6;max-width:820px;margin:0 0 28px;">
          Read how different people describe the VeeVee experience, what they were dealing with before, and what changed after using the platform.
        </p>
        <ul style="line-height:1.8;padding-left:20px;">
          <li>A caregiver who wanted help without medical-language overload.</li>
          <li>A working adult who wanted healthcare to feel smarter and more responsive.</li>
          <li>A Medicare user who wanted a calmer, simpler way to follow care.</li>
          <li>A physician who wanted patients and families more aligned before and after visits.</li>
        </ul>
      </main>
    `,
  },
  {
    path: "/contact",
    title: "Contact VeeVee | Press, Partnerships, and Support",
    description:
      "Contact VeeVee for press inquiries, partnerships, investor information, or support questions.",
    robots: "index, follow",
    body: `
      <main data-prerendered-route="/contact" style="font-family:Inter,Arial,sans-serif;max-width:1040px;margin:0 auto;padding:48px 24px;color:#0b2341;">
        <p style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#1177BA;margin:0 0 12px;">Contact</p>
        <h1 style="font-size:42px;line-height:1.1;margin:0 0 16px;">Contact VeeVee for press, partnerships, and support.</h1>
        <p style="font-size:18px;line-height:1.6;max-width:820px;margin:0 0 28px;">
          Reach out if you are covering VeeVee, exploring a partnership, looking for investor information, or need help getting to the right team.
        </p>
        <ul style="line-height:1.8;padding-left:20px;">
          <li>Press: press@veevee.io</li>
          <li>Partnerships: press@veevee.io</li>
          <li>Investors: investveevee.com</li>
        </ul>
      </main>
    `,
  },
  {
    path: "/terms",
    title: "VeeVee Terms and Disclaimers",
    description:
      "Review VeeVee terms, disclaimers, wellness guidance limits, data notes, and hospital-use conditions in plain English.",
    robots: "index, follow",
    body: `
      <main data-prerendered-route="/terms" style="font-family:Inter,Arial,sans-serif;max-width:1040px;margin:0 auto;padding:48px 24px;color:#0b2341;">
        <p style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#1177BA;margin:0 0 12px;">Terms</p>
        <h1 style="font-size:42px;line-height:1.1;margin:0 0 16px;">Terms and Disclaimers</h1>
        <p style="font-size:18px;line-height:1.6;max-width:820px;margin:0 0 28px;">
          Review plain-English terms, disclaimers, privacy notes, and usage limits for people, hospitals, and care teams using VeeVee.
        </p>
        <ul style="line-height:1.8;padding-left:20px;">
          <li>VeeVee is a wellness and planning tool, not medical diagnosis or treatment.</li>
          <li>Benefits and coverage are not guaranteed and depend on the underlying plan.</li>
          <li>Hospitals and care teams remain responsible for clinical judgment, staffing, workflows, and compliance.</li>
        </ul>
      </main>
    `,
  },
];

function escapeAttribute(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function updateTag(html, pattern, replacement) {
  if (!pattern.test(html)) {
    throw new Error(`Unable to update expected tag: ${pattern}`);
  }
  return html.replace(pattern, replacement);
}

function applyRouteHead(baseHtml, route) {
  const canonicalUrl = new URL(route.path, SITE_ORIGIN).toString();
  let html = baseHtml;
  html = updateTag(html, /<title>[\s\S]*?<\/title>/, `<title>${escapeAttribute(route.title)}</title>`);
  html = updateTag(
    html,
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${escapeAttribute(route.description)}" />`
  );
  html = updateTag(
    html,
    /<link rel="canonical" href="[^"]*" \/>/,
    `<link rel="canonical" href="${canonicalUrl}" />`
  );
  html = updateTag(
    html,
    /<meta name="robots" content="[^"]*" \/>/,
    `<meta name="robots" content="${escapeAttribute(route.robots)}" />`
  );
  html = updateTag(
    html,
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${escapeAttribute(route.title)}" />`
  );
  html = updateTag(
    html,
    /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${escapeAttribute(route.description)}" />`
  );
  html = updateTag(
    html,
    /<meta property="og:url" content="[^"]*" \/>/,
    `<meta property="og:url" content="${canonicalUrl}" />`
  );
  html = updateTag(
    html,
    /<meta name="twitter:title" content="[^"]*" \/>/,
    `<meta name="twitter:title" content="${escapeAttribute(route.title)}" />`
  );
  html = updateTag(
    html,
    /<meta name="twitter:description" content="[^"]*" \/>/,
    `<meta name="twitter:description" content="${escapeAttribute(route.description)}" />`
  );
  html = updateTag(
    html,
    /<div id="root"><\/div>/,
    `<div id="root">${route.body}</div>`
  );
  return html;
}

const baseHtml = await readFile(BASE_HTML_PATH, "utf8");

for (const route of ROUTES) {
  const html = applyRouteHead(baseHtml, route);
  const routeDir = route.path === "/" ? DIST_DIR : path.join(DIST_DIR, route.path.replace(/^\/+/, ""));
  await mkdir(routeDir, { recursive: true });
  const outputPath = route.path === "/" ? BASE_HTML_PATH : path.join(routeDir, "index.html");
  await writeFile(outputPath, html, "utf8");
}
