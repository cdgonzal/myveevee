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
    image: "https://myveevee.com/og/home.svg",
    body: `
      <main data-prerendered-route="/" style="font-family:Inter,Arial,sans-serif;max-width:1040px;margin:0 auto;padding:48px 24px;color:#0b2341;">
        <p style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#1177BA;margin:0 0 12px;">Private. Secure. Yours.</p>
        <h1 style="font-size:48px;line-height:1.1;margin:0 0 16px;">Meet your digital Health Twin</h1>
        <p style="font-size:18px;line-height:1.6;max-width:760px;margin:0 0 24px;">
          VeeVee brings your records, habits, and care into one place so you can understand your body, follow changes over time, and make decisions with confidence.
        </p>
        <h2 style="font-size:28px;margin:40px 0 12px;">Start with a guided Health Twin funnel</h2>
        <p style="font-size:16px;line-height:1.6;max-width:820px;">
          The homepage now points visitors into a four-step walkthrough: simulate bringing in sample health data, evolve the twin with more context, see insights and simulations, and then decide whether to create a real VeeVee account.
        </p>
        <ol style="line-height:1.8;padding-left:20px;">
          <li>Data In: choose a sample asset like an MRI, health record, injury image, or lab panel.</li>
          <li>Your Twin Evolves: add context such as symptom history, sleep routine, medication history, or care goals.</li>
          <li>Insights and Simulations: review the simulated signals, recommendations, and next questions.</li>
          <li>Better Decisions: continue to the real VeeVee experience.</li>
        </ol>
      </main>
    `,
  },
  {
    path: "/health-twin",
    title: "Create Your Health Twin | Guided VeeVee Funnel Preview",
    description:
      "Walk through a four-step VeeVee funnel: simulate health data input, evolve the twin with more context, review insights, and then create your own.",
    robots: "index, follow",
    image: "https://myveevee.com/og/home.svg",
    body: `
      <main data-prerendered-route="/health-twin" style="font-family:Inter,Arial,sans-serif;max-width:1040px;margin:0 auto;padding:48px 24px;color:#0b2341;">
        <p style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#1177BA;margin:0 0 12px;">Health Twin Funnel</p>
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
    path: "/how-it-works",
    title: "How VeeVee Works | 3 Simple Steps for Health Questions",
    description:
      "See how VeeVee helps people describe what is happening, get calmer next-step guidance, and decide what to do next in three simple steps.",
    robots: "index, follow",
    image: "https://myveevee.com/og/home.svg",
    body: `
      <main data-prerendered-route="/how-it-works" style="font-family:Inter,Arial,sans-serif;max-width:1040px;margin:0 auto;padding:48px 24px;color:#0b2341;">
        <p style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#1177BA;margin:0 0 12px;">How it works</p>
        <h1 style="font-size:42px;line-height:1.1;margin:0 0 16px;">Your health questions answered in 3 simple steps.</h1>
        <p style="font-size:18px;line-height:1.6;max-width:820px;margin:0 0 28px;">
          This page explains the simple VeeVee journey: tell VeeVee what is happening, get clear guidance, and take the next step with more confidence.
        </p>
        <ol style="line-height:1.8;padding-left:20px;">
          <li>Tell VeeVee what is happening.</li>
          <li>Get clearer next-step guidance.</li>
          <li>Decide what to do next with better context.</li>
        </ol>
      </main>
    `,
  },
  {
    path: "/hospital-value",
    title: "VeeVee Hospital Value | Revenue, Labor Savings, and Risk Reduction",
    description:
      "Review the VeeVee hospital value story, including revenue support, labor efficiency, risk mitigation, and illustrative rollout math.",
    robots: "index, follow",
    image: "https://myveevee.com/og/technology.svg",
    body: `
      <main data-prerendered-route="/hospital-value" style="font-family:Inter,Arial,sans-serif;max-width:1040px;margin:0 auto;padding:48px 24px;color:#0b2341;">
        <p style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#1177BA;margin:0 0 12px;">Hospital value</p>
        <h1 style="font-size:42px;line-height:1.1;margin:0 0 16px;">A simple way to think about VeeVee value for hospitals.</h1>
        <p style="font-size:18px;line-height:1.6;max-width:820px;margin:0 0 28px;">
          VeeVee frames hospital value around new revenue support, labor efficiency, risk mitigation, and clearer visibility from bedside to home.
        </p>
        <ul style="line-height:1.8;padding-left:20px;">
          <li>Revenue support through RPM and RTM-aligned workflows.</li>
          <li>Labor savings from reduced manual coverage dependence.</li>
          <li>Risk reduction from earlier signals and better follow-through.</li>
        </ul>
      </main>
    `,
  },
  {
    path: "/features",
    title: "VeeVee Features | Connected Care, Guidance, and Family Support",
    description:
      "Explore VeeVee features for connected care, everyday guidance, family support, care-team visibility, and hospital-to-home continuity.",
    robots: "index, follow",
    image: "https://myveevee.com/og/features.svg",
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
    image: "https://myveevee.com/og/technology.svg",
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
    image: "https://myveevee.com/og/simulator.svg",
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
    image: "https://myveevee.com/og/testimonials.svg",
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
    path: "/caregivers",
    title: "Caregiver Support App | VeeVee for Families and Daily Care Coordination",
    description:
      "Explore how VeeVee supports caregivers with clearer updates, benefits context, family visibility, and calmer next steps after appointments or during recovery.",
    robots: "index, follow",
    image: "https://myveevee.com/og/features.svg",
    body: `
      <main data-prerendered-route="/caregivers" style="font-family:Inter,Arial,sans-serif;max-width:1040px;margin:0 auto;padding:48px 24px;color:#0b2341;">
        <p style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#1177BA;margin:0 0 12px;">Caregiver support</p>
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
      <main data-prerendered-route="/medicare-guidance" style="font-family:Inter,Arial,sans-serif;max-width:1040px;margin:0 auto;padding:48px 24px;color:#0b2341;">
        <p style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#1177BA;margin:0 0 12px;">Medicare guidance</p>
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
      <main data-prerendered-route="/hospital-to-home" style="font-family:Inter,Arial,sans-serif;max-width:1040px;margin:0 auto;padding:48px 24px;color:#0b2341;">
        <p style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#1177BA;margin:0 0 12px;">Hospital to home</p>
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
    image: "https://myveevee.com/og/terms.svg",
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
