import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SITE_ORIGIN = "https://myveevee.com";
const DIST_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const BASE_HTML_PATH = path.join(DIST_DIR, "index.html");
const corePageMeta = JSON.parse(await readFile(new URL("../src/seo/corePageMeta.json", import.meta.url), "utf8"));
const marketingRedirects = JSON.parse(await readFile(new URL("../src/config/marketingRedirects.json", import.meta.url), "utf8"));

const ROUTES = [
  {
    path: "/health-twin",
    title: "Create Your Health Twin | Guided VeeVee Funnel Preview",
    description:
      "Walk through a four-step VeeVee funnel: simulate health data input, evolve the twin with more context, review insights, and then create your own.",
    robots: "noindex, nofollow",
    image: "https://myveevee.com/og/home.svg",
    body: `
      <main data-prerendered-route="/health-twin" style="font-family:Inter,Arial,sans-serif;max-width:1040px;margin:0 auto;padding:48px 24px;color:#FFFFFF;">
        <p style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#9CE7FF;margin:0 0 12px;">Health Twin Funnel</p>
        <h1 style="font-size:42px;line-height:1.1;margin:0 0 16px;">Create a Health Twin in four guided steps.</h1>
        <p style="font-size:18px;line-height:1.6;max-width:820px;margin:0 0 28px;">
          This public funnel simulates what VeeVee does: bring in sample health data, evolve the twin with more context, review insights, and then continue to the real experience.
        </p>
        <ol style="line-height:1.8;padding-left:20px;">
          <li>Choose a sample upload such as an MRI, health record, injury image, or lab panel.</li>
          <li>Add context such as symptom history, medication history, sleep patterns, or care goals.</li>
          <li>Review simulated insights, signals, recommendations, and follow-up questions.</li>
          <li>Continue to veevee.io if you want to create your own Health Twin.</li>
        </ol>
      </main>
    `,
  },
  {
    path: "/health-twin/create",
    title: "Create Your Health Twin | VeeVee",
    description:
      "Create a free personalized VeeVee Health Twin and turn your health signals into a clearer next step.",
    robots: "noindex, nofollow",
    image: "https://myveevee.com/og/home.svg",
    body: `
      <main data-prerendered-route="/health-twin/create" style="font-family:Inter,Arial,sans-serif;max-width:1040px;margin:0 auto;padding:48px 24px;color:#FFFFFF;">
        <p style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#9CE7FF;margin:0 0 12px;">Create your free Health Twin</p>
        <h1 style="font-size:42px;line-height:1.1;margin:0 0 16px;">Create your digital twin.</h1>
        <p style="font-size:18px;line-height:1.6;max-width:820px;margin:0 0 28px;">
          Turn your health signals into a personalized Health Twin inside VeeVee.
        </p>
      </main>
    `,
  },
  {
    path: "/simulator",
    title: "VeeVee Simulator | Explore Health and Coverage Scenarios",
    description:
      "Try the VeeVee Simulator to explore health, routine, and coverage scenarios with clearer next steps and a more personal picture of your care story.",
    robots: "noindex, nofollow",
    image: "https://myveevee.com/og/simulator.svg",
    body: `
      <main data-prerendered-route="/simulator" style="font-family:Inter,Arial,sans-serif;max-width:1040px;margin:0 auto;padding:48px 24px;color:#FFFFFF;">
        <p style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#9CE7FF;margin:0 0 12px;">Simulator</p>
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
    path: "/caregivers",
    title: "Caregiver Support App | VeeVee for Families and Daily Care Coordination",
    description:
      "Explore how VeeVee supports caregivers with clearer updates, benefits context, family visibility, and calmer next steps after appointments or during recovery.",
    robots: "index, follow",
    image: "https://myveevee.com/og/features.svg",
    body: `
      <main data-prerendered-route="/caregivers" style="font-family:Inter,Arial,sans-serif;max-width:1040px;margin:0 auto;padding:48px 24px;color:#FFFFFF;">
        <p style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#9CE7FF;margin:0 0 12px;">Caregiver support</p>
        <h1 style="font-size:42px;line-height:1.1;margin:0 0 16px;">Caregiver support that keeps family, questions, and next steps in one place.</h1>
        <p style="font-size:18px;line-height:1.6;max-width:820px;margin:0 0 28px;">
          VeeVee is positioned to help caregivers follow updates, understand benefits and coverage questions more clearly, and stay involved after appointments or during recovery without adding more confusion.
        </p>
        <ul style="line-height:1.8;padding-left:20px;">
          <li>A shared view of updates and next steps.</li>
          <li>Benefits and coverage context that is easier to understand.</li>
          <li>More confidence after the visit or during recovery at home.</li>
        </ul>
      </main>
    `,
  },
  {
    path: "/medicare-guidance",
    title: "Medicare Guidance App | VeeVee for Coverage Questions and Next Steps",
    description:
      "See how VeeVee helps Medicare users and families understand coverage context, follow-up questions, and calmer next steps after appointments.",
    robots: "index, follow",
    image: "https://myveevee.com/og/simulator.svg",
    body: `
      <main data-prerendered-route="/medicare-guidance" style="font-family:Inter,Arial,sans-serif;max-width:1040px;margin:0 auto;padding:48px 24px;color:#FFFFFF;">
        <p style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#9CE7FF;margin:0 0 12px;">Medicare guidance</p>
        <h1 style="font-size:42px;line-height:1.1;margin:0 0 16px;">A simpler way to understand Medicare-related next steps, questions, and coverage context.</h1>
        <p style="font-size:18px;line-height:1.6;max-width:820px;margin:0 0 28px;">
          VeeVee is positioned for people who want a calmer way to understand what may matter after a visit, what questions to ask, and how benefits or coverage may shape the next step.
        </p>
        <ul style="line-height:1.8;padding-left:20px;">
          <li>Simple setup and easy questions.</li>
          <li>Coverage context connected to the health story.</li>
          <li>More confidence after appointments.</li>
        </ul>
      </main>
    `,
  },
  {
    path: "/hospital-to-home",
    title: "Hospital to Home Care Support | VeeVee for Discharge Follow-Up",
    description:
      "Learn how VeeVee supports hospital-to-home continuity with discharge follow-up, family visibility, and connected care after the visit.",
    robots: "index, follow",
    image: "https://myveevee.com/og/technology.svg",
    body: `
      <main data-prerendered-route="/hospital-to-home" style="font-family:Inter,Arial,sans-serif;max-width:1040px;margin:0 auto;padding:48px 24px;color:#FFFFFF;">
        <p style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#9CE7FF;margin:0 0 12px;">Hospital to home</p>
        <h1 style="font-size:42px;line-height:1.1;margin:0 0 16px;">Hospital-to-home support for discharge follow-up, family visibility, and connected care.</h1>
        <p style="font-size:18px;line-height:1.6;max-width:820px;margin:0 0 28px;">
          VeeVee repeatedly positions its value around continuity after the visit. This page focuses that story for people searching around discharge follow-up, home recovery, and staying connected once someone leaves the hospital.
        </p>
        <ul style="line-height:1.8;padding-left:20px;">
          <li>People stay connected after they go home.</li>
          <li>Families can stay informed and involved.</li>
          <li>Care teams get a clearer view of progress.</li>
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
    image: "https://myveevee.com/og/contact.svg",
    body: `
      <main data-prerendered-route="/contact" style="font-family:Inter,Arial,sans-serif;max-width:1040px;margin:0 auto;padding:48px 24px;color:#FFFFFF;">
        <p style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#9CE7FF;margin:0 0 12px;">Contact</p>
        <h1 style="font-size:42px;line-height:1.1;margin:0 0 16px;">Contact VeeVee for press, partnerships, and support.</h1>
        <p style="font-size:18px;line-height:1.6;max-width:820px;margin:0 0 28px;">
          Reach out if you are covering VeeVee, exploring a partnership, looking for investor information, or need help getting to the right team.
        </p>
        <ul style="line-height:1.8;padding-left:20px;">
          <li>Press: info@veevee.io</li>
          <li>Partnerships: info@veevee.io</li>
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
    image: "https://myveevee.com/og/terms.svg",
    body: `
      <main data-prerendered-route="/terms" style="font-family:Inter,Arial,sans-serif;max-width:1040px;margin:0 auto;padding:48px 24px;color:#FFFFFF;">
        <p style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#9CE7FF;margin:0 0 12px;">Terms</p>
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

const coreBodies = {
  "/": `
    <p>Your health, connected</p>
    <h1>Meet your digital Health Twin</h1>
    <p>Your twin. Your simulation. <strong>All free.</strong></p>
    <p><a href="https://veevee.io">Start free</a></p>
    <p><a href="/how-it-works">See How It Works</a></p>
    <h2>Your twin. Real possibilities.</h2>
    <h3>Personalized guidance</h3>
    <h3>Products &amp; services</h3>
    <h3>Coupons &amp; discounts</h3>
    <h2>Meet your free twin.</h2>
    <p><a href="https://veevee.io">Start free</a></p>
  `,
  "/how-it-works": `
    <h1>More of the life you want.</h1>
    <p>Your twin. Three simple steps.</p>
    <h2>1. Input</h2><p><strong>Tell your story</strong></p><p>Add records, photos, or videos. Set your goal.</p>
    <h2>2. Simulate</h2><p><strong>Explore your possibilities</strong></p><p>Compare approaches with your digital twin.</p>
    <h2>3. Results</h2><p><strong>Take an informed next step</strong></p><p>Review results and explore relevant options.</p>
    <p><a href="https://veevee.io">Start free</a></p>
    <p>Your twin. Your simulation. All free.</p>
    <section aria-labelledby="patient-story-heading">
      <p>Patient story</p>
      <h2 id="patient-story-heading">“I want the freedom to move again.”</h2>
      <p>— Liam</p>
      <ol>
        <li><h3>Input</h3><p>Added his records and a movement video.</p></li>
        <li><h3>Simulate</h3><p>Compared options with his digital twin.</p></li>
        <li><h3>Results</h3><p>Found solutions and a roadmap to discuss with his wellness team.</p></li>
      </ol>
      <p><a href="https://veevee.io">Start free</a></p>
    </section>
    <h2>A few things to know</h2>
    <h3>What is a Health Twin?</h3><p>A digital version of you that helps you explore possibilities and find a path toward your wellness goals.</p>
    <h3>Where do I get started?</h3><p>Choose Start to create your free account or sign in.</p>
    <h3>Does VeeVee replace my wellness team?</h3><p>Not a doctor. VeeVee is for entertainment and educational purposes only. VeeVee gives you lifestyle tips, wellness prompts, and benefit reminders. We do not provide medical advice. Always talk to a licensed healthcare professional for medical decisions.</p>
    <p><a href="/terms">Terms &amp; Disclaimers</a> · <a href="/contact">Contact our team</a></p>
  `,
  "/providers": `
    <p>For clinics &amp; practices</p>
    <h1>More context. Better conversations.</h1>
    <p>VeeVee is designed to bring patient updates into a clearer view, helping your team prepare for more informed conversations.</p>
    <p><a href="/contact?topic=providers">Connect With Our Team</a> · <a href="/how-it-works">See the Patient Experience</a></p>
    <h2>A clearer view of the person in front of you.</h2>
    <p>Patient updates are part of a bigger story. VeeVee is designed to help bring that story into focus.</p>
    <h3>See the bigger picture</h3><p>Bring patient information and updates together.</p>
    <h3>Understand what’s changed</h3><p>Follow the patient’s story over time.</p>
    <h3>Focus on the conversation</h3><p>Come prepared with useful context.</p>
    <h2>A few things your team may ask.</h2>
    <h3>Who is VeeVee for?</h3><p>VeeVee connects the patient’s Health Twin story with the conversations they have with their care team. Contact us to learn more about VeeVee for your clinic or practice.</p>
    <h3>How can our practice learn more?</h3><p>Use the short inquiry form to tell us about your practice. Our team will follow up to discuss your questions and next steps.</p>
    <h3>Does VeeVee replace our care team?</h3><p>No. VeeVee supports more informed conversations. Patients should continue to discuss medical decisions with a licensed healthcare professional.</p>
    <h2>Explore VeeVee for your practice.</h2>
    <p>Tell us a little about your practice. Our team will follow up to answer your questions and discuss next steps.</p>
    <p><a href="/contact?topic=providers">Connect With Our Team</a></p>
  `,
};
ROUTES.push(...Object.entries(corePageMeta).map(([path, meta]) => ({
  path, ...meta, robots: "index, follow",
  body: `<main data-prerendered-route="${path}" style="font-family:Inter,Arial,sans-serif;max-width:1040px;margin:0 auto;padding:48px 24px;color:#FFFFFF;">${coreBodies[path]}</main>`,
})));

// Preserve the legacy direct-link creation URL with the same noindex policy.
const creationPreview = ROUTES.find((route) => route.path === "/health-twin/create");
ROUTES.push({
  ...creationPreview,
  path: "/create",
  body: creationPreview.body.replace('data-prerendered-route="/health-twin/create"', 'data-prerendered-route="/create"'),
});

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
  const canonicalUrl = new URL(route.canonicalPath ?? route.path, SITE_ORIGIN).toString();
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
    /<meta property="og:image" content="[^"]*" \/>/,
    `<meta property="og:image" content="${route.image}" />`
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
    /<meta name="twitter:image" content="[^"]*" \/>/,
    `<meta name="twitter:image" content="${route.image}" />`
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

// Static fallback for hosts without redirect rules; Amplify 301 rules take precedence.
for (const redirect of marketingRedirects) {
  const route = {
    path: redirect.source,
    canonicalPath: redirect.target,
    ...corePageMeta[redirect.target],
    robots: "noindex, follow",
    body: `<main><p>This page has moved. <a href="${redirect.target}">Continue to VeeVee</a>.</p></main>`,
  };
  const html = applyRouteHead(baseHtml, route).replace("</head>",
    `<script>window.location.replace(${JSON.stringify(redirect.target)} + window.location.search + window.location.hash);</script></head>`);
  const routeDir = path.join(DIST_DIR, redirect.source.slice(1));
  await mkdir(routeDir, { recursive: true });
  await writeFile(path.join(routeDir, "index.html"), html, "utf8");
}
// Prepend these rules to existing Amplify customRules when deploying this migration.
const hostingRules = marketingRedirects.flatMap((rule) => [rule, { ...rule, source: `${rule.source}/` }]);
await writeFile(path.join(DIST_DIR, "amplify-marketing-redirects.json"), JSON.stringify(hostingRules, null, 2) + "\n", "utf8");
const pageRewrites = ROUTES.filter((route) => route.path !== "/").flatMap((route) =>
  [route.path, `${route.path}/`].map((source) => ({ source, target: `${route.path}/index.html`, status: "200" }))
);
await writeFile(path.join(DIST_DIR, "amplify-marketing-rules.json"), JSON.stringify([...hostingRules, ...pageRewrites], null, 2) + "\n", "utf8");
