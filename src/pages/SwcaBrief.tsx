import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";

const ACCESS_PIN = "5353";
const ACCESS_KEY = "veevee-soft-gate:swca-4821";

const ONE_PAGER_HTML = String.raw`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex,nofollow,noarchive,nosnippet,noimageindex" />
  <style>
    :root {
      --blue-900: #06254c;
      --blue-800: #0e3a73;
      --blue-700: #192586;
      --blue-100: #eaf2ff;
      --green: #53d769;
      --cyan: #6ee7f2;
      --text: #0e1726;
      --muted: #5b6780;
      --border: #dce6f5;
      --white: #ffffff;
      --shadow: 0 18px 45px rgba(6, 37, 76, 0.1);
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      font-family: Inter, Arial, Helvetica, sans-serif;
      color: var(--text);
      background:
        radial-gradient(circle at top right, rgba(110, 231, 242, 0.18), transparent 28%),
        linear-gradient(180deg, #f8fbff 0%, #eef5ff 100%);
      padding: 28px;
    }

    .page {
      max-width: 1180px;
      margin: 0 auto;
      background: var(--white);
      border: 1px solid var(--border);
      border-radius: 26px;
      overflow: hidden;
      box-shadow: var(--shadow);
    }

    .hero {
      position: relative;
      padding: 40px 44px 28px;
      background:
        linear-gradient(135deg, rgba(6, 37, 76, 0.98) 0%, rgba(25, 37, 134, 0.96) 55%, rgba(14, 58, 115, 0.94) 100%);
      color: var(--white);
    }

    .eyebrow {
      display: inline-block;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--cyan);
      margin-bottom: 14px;
    }

    .hero-grid {
      display: grid;
      grid-template-columns: 1.5fr 0.95fr;
      gap: 28px;
      align-items: end;
    }

    h1 {
      margin: 0 0 12px;
      font-size: 42px;
      line-height: 1.03;
      letter-spacing: -0.03em;
      max-width: 700px;
    }

    .subtitle {
      margin: 0;
      font-size: 17px;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.86);
      max-width: 720px;
    }

    .mini-panel {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 20px;
      padding: 18px 18px 16px;
      backdrop-filter: blur(8px);
    }

    .mini-panel h3 {
      margin: 0 0 8px;
      font-size: 14px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--cyan);
    }

    .mini-panel p {
      margin: 0;
      font-size: 14px;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.88);
    }

    .tabs {
      display: flex;
      gap: 10px;
      margin-top: 22px;
      flex-wrap: wrap;
    }

    .tab-btn {
      appearance: none;
      border: 1px solid rgba(255, 255, 255, 0.18);
      background: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.9);
      border-radius: 999px;
      padding: 11px 16px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: 0.2s ease;
    }

    .tab-btn.active {
      background: var(--white);
      color: var(--blue-900);
      border-color: var(--white);
    }

    .content {
      padding: 34px 44px 42px;
    }

    .tab-panel { display: none; }
    .tab-panel.active { display: block; }

    .section-title {
      margin: 0 0 8px;
      font-size: 15px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--blue-800);
    }

    .section-copy {
      margin: 0 0 22px;
      font-size: 16px;
      line-height: 1.7;
      color: var(--muted);
      max-width: 980px;
    }

    .loop {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
      margin-bottom: 34px;
    }

    .loop-step {
      position: relative;
      padding: 18px;
      background: linear-gradient(180deg, #ffffff 0%, #f7fbff 100%);
      border: 1px solid var(--border);
      border-radius: 18px;
      min-height: 170px;
    }

    .loop-step .num,
    .flow-step .num {
      width: 32px;
      height: 32px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--blue-100);
      color: var(--blue-800);
      font-weight: 800;
      font-size: 14px;
      margin-bottom: 14px;
    }

    .loop-step h4,
    .flow-step h4 {
      margin: 0 0 8px;
      font-size: 20px;
      color: var(--blue-900);
    }

    .loop-step p,
    .flow-step p {
      margin: 0;
      font-size: 14px;
      line-height: 1.6;
      color: var(--muted);
    }

    .cards {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 32px;
    }

    .card {
      padding: 22px;
      border-radius: 20px;
      border: 1px solid var(--border);
      background: linear-gradient(180deg, #ffffff 0%, #f9fbff 100%);
      box-shadow: 0 8px 20px rgba(6, 37, 76, 0.04);
    }

    .card h3 {
      margin: 0 0 10px;
      font-size: 22px;
      color: var(--blue-900);
      letter-spacing: -0.02em;
    }

    .card p {
      margin: 0 0 12px;
      color: var(--muted);
      line-height: 1.65;
      font-size: 15px;
    }

    .card ul,
    .panel ul {
      margin: 0;
      padding-left: 18px;
      color: var(--text);
    }

    .card li,
    .panel li {
      margin: 0 0 8px;
      line-height: 1.5;
      font-size: 14px;
    }

    .bottom,
    .patient-top {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 18px;
    }

    .panel {
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 22px;
      background: linear-gradient(180deg, #ffffff 0%, #f7fbff 100%);
    }

    .panel h3 {
      margin: 0 0 12px;
      font-size: 20px;
      color: var(--blue-900);
    }

    .panel p {
      font-size: 14px;
      line-height: 1.65;
      color: var(--muted);
      margin: 0 0 12px;
    }

    .closing {
      background: linear-gradient(135deg, rgba(83, 215, 105, 0.1), rgba(110, 231, 242, 0.12));
      border-color: rgba(83, 215, 105, 0.28);
    }

    .table-wrap {
      margin: 18px 0 24px;
      border: 1px solid var(--border);
      border-radius: 18px;
      overflow: hidden;
      background: #fff;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }

    thead {
      background: linear-gradient(180deg, #eff5ff 0%, #e8f1ff 100%);
    }

    th, td {
      padding: 12px 14px;
      text-align: left;
      border-bottom: 1px solid var(--border);
      vertical-align: top;
    }

    th {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--blue-800);
    }

    tbody tr:last-child td {
      border-bottom: none;
    }

    .status {
      display: inline-block;
      padding: 6px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      background: var(--blue-100);
      color: var(--blue-800);
    }

    .flow {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 14px;
      margin-top: 16px;
    }

    .flow-step {
      padding: 18px;
      border-radius: 18px;
      border: 1px solid var(--border);
      background: linear-gradient(180deg, #ffffff 0%, #f9fbff 100%);
      min-height: 190px;
    }

    .date-pill {
      display: inline-block;
      margin-bottom: 12px;
      padding: 7px 10px;
      border-radius: 999px;
      background: rgba(83, 215, 105, 0.12);
      color: #1d7a2f;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .footer {
      padding: 0 44px 34px;
      font-size: 12px;
      color: #77829b;
    }

    @media (max-width: 980px) {
      .hero-grid,
      .loop,
      .cards,
      .bottom,
      .patient-top,
      .flow {
        grid-template-columns: 1fr;
      }

      h1 { font-size: 34px; }
      .hero, .content, .footer { padding-left: 24px; padding-right: 24px; }
      body { padding: 14px; }
    }
  </style>
</head>
<body>
  <div class="page">
    <section class="hero">
      <div class="eyebrow">For Michael Segura · Head of Operations · SWCA</div>
      <div class="hero-grid">
        <div>
          <h1>VeeVee creates a feedback loop that helps capture what matters and guide the next step.</h1>
          <p class="subtitle">
            VeeVee continuously captures patient input, interprets it in context, and adapts the experience over time, supporting engagement, clearer decisions, and better operational visibility.
          </p>
        </div>
        <div class="mini-panel">
          <h3>Operational Value</h3>
          <p>
            Reduce blind spots between visits, surface changing patient needs earlier, and create a system that improves as more feedback is captured.
          </p>
        </div>
      </div>

      <div class="tabs">
        <button class="tab-btn active" data-tab="overview">Overview</button>
        <button class="tab-btn" data-tab="patients">Initial 25 Patients</button>
      </div>
    </section>

    <section class="content">
      <div id="overview" class="tab-panel active">
        <div class="section-title">The Loop</div>
        <p class="section-copy">
          The core idea is simple: every patient interaction becomes signal. VeeVee captures it, structures it, uses it to guide the next action, and then learns from the response. This creates a living loop of feedback rather than a one-time intake event.
        </p>

        <div class="loop">
          <div class="loop-step">
            <div class="num">1</div>
            <h4>Capture</h4>
            <p>Patients share symptoms, goals, concerns, updates, and preferences through prompts, check-ins, and everyday interactions.</p>
          </div>
          <div class="loop-step">
            <div class="num">2</div>
            <h4>Interpret</h4>
            <p>VeeVee organizes this feedback in context, connecting it to prior inputs, patterns, history, and what is changing over time.</p>
          </div>
          <div class="loop-step">
            <div class="num">3</div>
            <h4>Guide</h4>
            <p>The platform responds with the next best step, personalized content, or targeted follow-up based on what the user needs right now.</p>
          </div>
          <div class="loop-step">
            <div class="num">4</div>
            <h4>Adapt</h4>
            <p>Each new interaction sharpens the system, improving relevance, refining recommendations, and supporting more personalized care over time.</p>
          </div>
        </div>

        <div class="section-title">Core VeeVee Experiences</div>
        <p class="section-copy">
          These product surfaces sit on top of the loop and turn captured feedback into visible action for the user.
        </p>

        <div class="cards">
          <div class="card">
            <h3>Feed</h3>
            <p>A daily intelligence layer that surfaces what matters right now.</p>
            <ul>
              <li>Personalized timeline of relevant signals and prompts</li>
              <li>Keeps users engaged between visits</li>
              <li>Supports habit formation and timely follow-up</li>
            </ul>
          </div>

          <div class="card">
            <h3>Goals &amp; Adaptive Experience</h3>
            <p>The experience changes based on what the user shares and what they are working toward.</p>
            <ul>
              <li>Adjusts prompts, recommendations, and support based on input</li>
              <li>Aligns the experience to active goals and needs</li>
              <li>Helps keep care personalized over time</li>
            </ul>
          </div>

          <div class="card">
            <h3>VeeVee Chat</h3>
            <p>A conversational interface that helps users ask questions and get guided next steps.</p>
            <ul>
              <li>Always-available touchpoint between visits</li>
              <li>Supports triage, follow-up, and ongoing engagement</li>
              <li>Transforms uncertainty into a clearer next action</li>
            </ul>
          </div>

          <div class="card">
            <h3>MyTwin</h3>
            <p>A digital twin and simulation layer that reflects the user's full context.</p>
            <ul>
              <li>Brings history, behavior, and patient inputs into one view</li>
              <li>Helps model what-if scenarios before decisions are made</li>
              <li>Supports smarter, more individualized care planning</li>
            </ul>
          </div>
        </div>

        <div class="bottom">
          <div class="panel">
            <h3>Why This Matters for SWCA Operations</h3>
            <ul>
              <li>Creates a structured way to capture patient feedback outside the visit window</li>
              <li>Improves visibility into what patients are experiencing in real time</li>
              <li>Helps identify changing needs and gaps earlier</li>
              <li>Supports better engagement without adding unnecessary staff burden</li>
              <li>Builds a system that gets smarter as usage grows</li>
            </ul>
          </div>

          <div class="panel closing">
            <h3>Bottom Line</h3>
            <p>
              VeeVee is not just a communication tool. It is a feedback system that continuously captures patient signal, turns it into structured insight, and helps guide the next step.
            </p>
            <p>
              The more feedback it captures, the more adaptive, relevant, and operationally useful it becomes.
            </p>
          </div>
        </div>
      </div>

      <div id="patients" class="tab-panel">
        <div class="section-title">Initial 25 Patients Identified</div>
        <p class="section-copy">
          This tab is designed to support operational outreach planning for the first 25 identified patients. It provides a simple roster view and a structured rollout flow beginning on <strong>April 20</strong>.
        </p>

        <div class="patient-top">
          <div class="panel">
            <h3>Patient Roster</h3>
            <p>Replace the placeholder names below with the finalized list. This structure is intentionally simple so the team can track outreach readiness and status at a glance.</p>
          </div>
          <div class="panel closing">
            <h3>Operational Goal</h3>
            <p>Move from identified candidates to contacted patients, then to active responses and onboarding. The focus is not just outreach volume, but measurable response and engagement.</p>
          </div>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Patient Name</th>
                <th>Primary Contact</th>
                <th>Assigned Owner</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>1</td><td>Wolf, Jorge</td><td>DOB: 11/15/1967</td><td>SWCA Team</td><td><span class="status">Confirmed</span></td><td>Confirmed</td></tr>
              <tr><td>2</td><td>Freile, Guillermo</td><td>DOB: 10/06/1957</td><td>SWCA Team</td><td><span class="status">Pending</span></td><td></td></tr>
              <tr><td>3</td><td>Landivar, Vanessa</td><td>DOB: 09/20/1983</td><td>SWCA Team</td><td><span class="status">Confirmed</span></td><td>Confirmed</td></tr>
              <tr><td>4</td><td>Quiroga, Jacqueline</td><td>DOB: 11/29/1962</td><td>SWCA Team</td><td><span class="status">Confirmed</span></td><td>Confirmed</td></tr>
              <tr><td>5</td><td>Brown, William</td><td>DOB: -</td><td>SWCA Team</td><td><span class="status">Pending</span></td><td></td></tr>
              <tr><td>6</td><td>Rankin, Rebecca</td><td>DOB: 01/25/1948</td><td>SWCA Team</td><td><span class="status">Pending</span></td><td></td></tr>
              <tr><td>7</td><td>Natale, Augustine</td><td>DOB: 06/11/1954</td><td>SWCA Team</td><td><span class="status">Pending</span></td><td></td></tr>
              <tr><td>8</td><td>Hodge, James</td><td>DOB: 12/09/1959</td><td>SWCA Team</td><td><span class="status">Pending</span></td><td></td></tr>
              <tr><td>9</td><td>Zwade, Karli</td><td>DOB: 03/01/1993</td><td>SWCA Team</td><td><span class="status">Pending</span></td><td></td></tr>
              <tr><td>10</td><td>Klein, William</td><td>DOB: 02/25/1954</td><td>SWCA Team</td><td><span class="status">Pending</span></td><td></td></tr>
              <tr><td>11</td><td>Blum, Laurie</td><td>DOB: 07/27/1959</td><td>SWCA Team</td><td><span class="status">Pending</span></td><td></td></tr>
              <tr><td>12</td><td>Owens, Wendy</td><td>DOB: 12/08/1955</td><td>SWCA Team</td><td><span class="status">Pending</span></td><td></td></tr>
              <tr><td>13</td><td>Cimino, Michael B</td><td>DOB: 02/05/1987</td><td>SWCA Team</td><td><span class="status">Pending</span></td><td></td></tr>
              <tr><td>14</td><td>Cohen, Sue</td><td>DOB: 05/06/1948</td><td>SWCA Team</td><td><span class="status">Pending</span></td><td></td></tr>
              <tr><td>15</td><td>Labaton, Sandy</td><td>DOB: 08/30/1956</td><td>SWCA Team</td><td><span class="status">Pending</span></td><td></td></tr>
              <tr><td>16</td><td>Dorfman, Steven</td><td>DOB: 08/21/1957</td><td>SWCA Team</td><td><span class="status">Pending</span></td><td></td></tr>
              <tr><td>17</td><td>Dorfman, Beth</td><td>DOB: 10/06/1959</td><td>SWCA Team</td><td><span class="status">Pending</span></td><td></td></tr>
              <tr><td>18</td><td>Labaton, Gail</td><td>DOB: 03/14/1951</td><td>SWCA Team</td><td><span class="status">Pending</span></td><td></td></tr>
              <tr><td>19</td><td>Moore, Bill</td><td>DOB: -</td><td>SWCA Team</td><td><span class="status">Pending</span></td><td></td></tr>
              <tr><td>20</td><td>Moore, Julie</td><td>DOB: -</td><td>SWCA Team</td><td><span class="status">Pending</span></td><td></td></tr>
              <tr><td>21</td><td>Weisman, Jerry</td><td>DOB: 08/05/1962</td><td>SWCA Team</td><td><span class="status">Pending</span></td><td></td></tr>
              <tr><td>22</td><td>Meier, Richard</td><td>DOB: 10/12/1934</td><td>SWCA Team</td><td><span class="status">Pending</span></td><td></td></tr>
              <tr><td>23</td><td>Socarras, Guillermo</td><td>DOB: 07/04/1975</td><td>SWCA Team</td><td><span class="status">Pending</span></td><td></td></tr>
              <tr><td>24</td><td>Chase, Berry</td><td>DOB: 12/12/1945</td><td>SWCA Team</td><td><span class="status">Pending</span></td><td></td></tr>
              <tr><td>25</td><td>Shinners, Helen</td><td>DOB: 08/28/1952</td><td>SWCA Team</td><td><span class="status">Confirmed</span></td><td>Confirmed</td></tr>
            </tbody>
          </table>
        </div>

        <div class="section-title">Outreach Flow Starting April 20</div>
        <p class="section-copy">
          The recommended approach is a simple staged flow: prepare, contact, follow up, onboard, and review results. This creates accountability and keeps the team aligned on movement through the funnel.
        </p>

        <div class="flow">
          <div class="flow-step">
            <div class="date-pill">April 20</div>
            <div class="num">1</div>
            <h4>Finalize Roster</h4>
            <p>Confirm the 25 names, validate contact details, assign an owner, and note any scheduling or communication considerations before outreach begins.</p>
          </div>
          <div class="flow-step">
            <div class="date-pill">April 21-22</div>
            <div class="num">2</div>
            <h4>Initial Reach Out</h4>
            <p>Begin first-touch outreach by phone, text, or email using a clear invitation and simple explanation of what VeeVee is and why they were selected.</p>
          </div>
          <div class="flow-step">
            <div class="date-pill">April 23-25</div>
            <div class="num">3</div>
            <h4>Track Responses</h4>
            <p>Log who answered, who needs another attempt, and who expressed interest. Separate non-responders from interested candidates quickly.</p>
          </div>
          <div class="flow-step">
            <div class="date-pill">April 26-29</div>
            <div class="num">4</div>
            <h4>Second Follow-Up</h4>
            <p>Re-contact non-responders and help interested patients complete onboarding steps. Keep messaging brief, clear, and action-oriented.</p>
          </div>
          <div class="flow-step">
            <div class="date-pill">April 30+</div>
            <div class="num">5</div>
            <h4>Review &amp; Activate</h4>
            <p>Review outreach conversion, identify active participants, and move engaged patients into the first wave of VeeVee usage and feedback capture.</p>
          </div>
        </div>
      </div>
    </section>

    <div class="footer">
      VeeVee · One-page overview prepared for SWCA operations discussion
    </div>
  </div>

  <script>
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabPanels = document.querySelectorAll(".tab-panel");

    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const tab = button.dataset.tab;
        tabButtons.forEach((btn) => btn.classList.remove("active"));
        tabPanels.forEach((panel) => panel.classList.remove("active"));
        button.classList.add("active");
        document.getElementById(tab).classList.add("active");
      });
    });

    function sendHeight() {
      const height = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );
      window.parent.postMessage({ type: "swca-brief-height", height }, "*");
    }

    window.addEventListener("load", sendHeight);
    window.addEventListener("resize", sendHeight);
    setTimeout(sendHeight, 50);
    setTimeout(sendHeight, 250);
  </script>
</body>
</html>`;

export default function SwcaBrief() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [frameHeight, setFrameHeight] = useState(2600);

  useEffect(() => {
    if (window.sessionStorage.getItem(ACCESS_KEY) === "ok") {
      setUnlocked(true);
    }
  }, []);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.data?.type === "swca-brief-height" && typeof event.data.height === "number") {
        setFrameHeight(Math.max(1400, event.data.height + 8));
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const documentHtml = useMemo(() => ONE_PAGER_HTML, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (pin.trim() !== ACCESS_PIN) {
      setError("Incorrect PIN. Check the shared code and try again.");
      return;
    }

    window.sessionStorage.setItem(ACCESS_KEY, "ok");
    setError("");
    setUnlocked(true);
  };

  if (!unlocked) {
    return (
      <Box minH="100vh" px={{ base: 4, md: 6 }} py={{ base: 10, md: 16 }}>
        <Box
          maxW="420px"
          mx="auto"
          bg="rgba(255,255,255,0.96)"
          border="1px solid"
          borderColor="border.default"
          borderRadius="24px"
          boxShadow="0 18px 45px rgba(6, 37, 76, 0.10)"
          px={{ base: 6, md: 8 }}
          py={{ base: 7, md: 8 }}
        >
          <Stack spacing={4}>
            <Text fontSize="12px" fontWeight="800" letterSpacing="0.12em" textTransform="uppercase" color="accent.primary">
              Shared Access
            </Text>
            <Heading as="h1" size="lg" color="text.primary">
              Enter 4-digit PIN
            </Heading>
            <Text fontSize="sm" color="text.muted">
              This page is intentionally unlisted. Enter the shared code to view the SWCA onboarding brief.
            </Text>
            <Box as="form" onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="700" color="text.primary">
                    Access code
                  </FormLabel>
                  <Input
                    value={pin}
                    onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="0000"
                    autoFocus
                    textAlign="center"
                    fontSize="2xl"
                    letterSpacing="0.35em"
                    borderRadius="14px"
                    bg="white"
                  />
                </FormControl>
                <Button type="submit" borderRadius="14px" fontWeight="800">
                  Enter
                </Button>
                <Text minH="20px" fontSize="sm" fontWeight="700" color={error ? "red.600" : "transparent"}>
                  {error || "ok"}
                </Text>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Box>
    );
  }

  return (
    <Box minH="100vh">
      <Box
        as="iframe"
        title="SWCA onboarding brief"
        srcDoc={documentHtml}
        w="100%"
        h={`${frameHeight}px`}
        border="0"
        sandbox="allow-scripts allow-same-origin"
      />
    </Box>
  );
}
