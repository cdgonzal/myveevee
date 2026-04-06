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
      --blue-100: #eaf2ff;
      --cyan: #6ee7f2;
      --green: #53d769;
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
      padding: 40px 44px 28px;
      background: linear-gradient(135deg, rgba(6, 37, 76, 0.98) 0%, rgba(25, 37, 134, 0.96) 55%, rgba(14, 58, 115, 0.94) 100%);
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
      max-width: 760px;
    }

    .subtitle {
      margin: 0;
      font-size: 17px;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.86);
      max-width: 760px;
    }

    .mini-panel {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 20px;
      padding: 18px;
      backdrop-filter: blur(8px);
    }

    .mini-panel h3,
    .panel h3,
    .card h3 {
      margin: 0 0 10px;
      font-size: 20px;
      color: var(--blue-900);
    }

    .mini-panel h3 {
      font-size: 14px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--cyan);
    }

    .mini-panel p,
    .panel p,
    .card p {
      margin: 0;
      font-size: 14px;
      line-height: 1.65;
    }

    .mini-panel p {
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

    .cards,
    .bottom {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 32px;
    }

    .card,
    .panel,
    .flow-step {
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 22px;
      background: linear-gradient(180deg, #ffffff 0%, #f7fbff 100%);
    }

    .closing {
      background: linear-gradient(135deg, rgba(83, 215, 105, 0.1), rgba(110, 231, 242, 0.12));
      border-color: rgba(83, 215, 105, 0.28);
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
      min-height: 190px;
    }

    .num {
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
      .cards,
      .bottom,
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
          <h1>SWCA pilot brief: drive registration, prove patient utility, and show measurable business value.</h1>
          <p class="subtitle">
            This page is now the working brief for the SWCA rollout. It should help Michael and the VeeVee team track registration progress, patient value delivered, ROI signals, and milestone decisions until those metrics are stable enough to live inside the platform dashboards.
          </p>
        </div>
        <div class="mini-panel">
          <h3>Current Focus</h3>
          <p>
            Convert identified patients into registered users, get them to first meaningful use quickly, and document what workflow and product utilities actually move conversion and engagement.
          </p>
        </div>
      </div>

      <div class="tabs">
        <button class="tab-btn active" data-tab="overview">Executive Brief</button>
        <button class="tab-btn" data-tab="patients">Rollout Tracker</button>
        <button class="tab-btn" data-tab="learnings">Learnings &amp; Decisions</button>
      </div>
    </section>

    <section class="content">
      <div id="overview" class="tab-panel active">
        <div class="section-title">Program Objective</div>
        <p class="section-copy">
          The immediate objective is to help SWCA increase patient registration, clarify what utility patients will receive in this rollout, and create a simple operating model with clear metrics, ROI, and milestone accountability.
        </p>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Headline KPI</th>
                <th>Current</th>
                <th>Target</th>
                <th>Why It Matters</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Patients identified</td><td>25</td><td>25</td><td>Confirms the initial cohort for SWCA outreach</td></tr>
              <tr><td>Registrations</td><td>0</td><td>15+</td><td>Measures whether outreach is converting into accounts</td></tr>
              <tr><td>Activated patients</td><td>0</td><td>10+</td><td>Shows whether registered patients reach first value</td></tr>
              <tr><td>ROI review checkpoint</td><td>Not started</td><td>Day 90</td><td>Sets the decision window for expansion and dashboard transition</td></tr>
            </tbody>
          </table>
        </div>

        <div class="section-title">30 / 60 / 90 Day Milestones</div>
        <p class="section-copy">
          The brief should align the team on what success looks like at each stage, what Michael is helping shape, and what business signals are expected before the work moves into the platform dashboards.
        </p>

        <div class="cards">
          <div class="card">
            <h3>Day 30</h3>
            <p>Build and stabilize the registration push.</p>
            <ul>
              <li>Finalize outreach workflow, scripts, and owners</li>
              <li>Reach the majority of the identified cohort</li>
              <li>Show first registrations and first activations</li>
              <li>Identify the features patients respond to first</li>
            </ul>
          </div>
          <div class="card">
            <h3>Day 60</h3>
            <p>Prove early patient utility and engagement.</p>
            <ul>
              <li>Track 7-day and 30-day engagement for registered patients</li>
              <li>Measure time to first meaningful action</li>
              <li>Refine onboarding, prompts, and follow-up based on patient behavior</li>
              <li>Show where staff effort is creating lift or drag</li>
            </ul>
          </div>
          <div class="card">
            <h3>Day 90</h3>
            <p>Review ROI and decide how the pilot should expand.</p>
            <ul>
              <li>Compare targets against actual conversion and activation</li>
              <li>Estimate cost per enrolled patient and staff time saved</li>
              <li>Determine what reporting can move into platform dashboards</li>
              <li>Decide on broader rollout, feature changes, or cohort expansion</li>
            </ul>
          </div>
          <div class="card closing">
            <h3>Decision Rule</h3>
            <p>Keep this brief as the working document while the pilot is still changing weekly and while key metrics are still partly manual.</p>
            <ul>
              <li>Stay here during alignment and experimentation</li>
              <li>Move to dashboards when KPI reporting is system-generated</li>
              <li>Use the brief later as executive summary only</li>
            </ul>
          </div>
        </div>

        <div class="section-title">What Patients Get In This Rollout</div>
        <p class="section-copy">
          This section should stay concrete. The value proposition for Michael is not generic platform capability. It is the set of patient-facing utilities that help drive registration, activation, and repeat engagement in this pilot.
        </p>

        <div class="cards">
          <div class="card">
            <h3>Simple Registration &amp; Onboarding</h3>
            <p>Make account creation and first entry into the platform easy enough to complete without friction.</p>
            <ul>
              <li>Guided onboarding path</li>
              <li>Simple explanation of why the patient was invited</li>
              <li>Low-friction setup for first use</li>
            </ul>
          </div>
          <div class="card">
            <h3>Personalized Check-Ins</h3>
            <p>Give patients a reason to come back by making follow-up feel relevant and lightweight.</p>
            <ul>
              <li>Structured prompts and check-ins</li>
              <li>Capture changing needs over time</li>
              <li>Create engagement beyond the first visit</li>
            </ul>
          </div>
          <div class="card">
            <h3>VeeVee Chat &amp; Guidance</h3>
            <p>Help patients ask questions and move to the next step with less confusion.</p>
            <ul>
              <li>Clear next-step guidance</li>
              <li>Ongoing touchpoint between formal interactions</li>
              <li>More confidence after onboarding</li>
            </ul>
          </div>
          <div class="card">
            <h3>Reminders, Feed, and Support</h3>
            <p>Turn registration into ongoing utility by surfacing reminders, content, and support that matter to the patient.</p>
            <ul>
              <li>Relevant follow-up nudges</li>
              <li>Personalized feed and content</li>
              <li>Benefits or care-navigation support as applicable</li>
            </ul>
          </div>
        </div>

        <div class="section-title">Business Value and ROI Scoreboard</div>
        <p class="section-copy">
          These measures should become the bridge between the operating brief and the eventual admin dashboards. Early on, they may be partly manual. Over time, most of them should become system-derived.
        </p>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Metric</th>
                <th>Baseline</th>
                <th>Current</th>
                <th>Target</th>
                <th>Business Meaning</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Outreach to registration conversion</td><td>Not yet measured</td><td>In progress</td><td>60% of engaged patients</td><td>Shows whether the registration motion is working</td></tr>
              <tr><td>Registration to activation conversion</td><td>Not yet measured</td><td>In progress</td><td>70% of registered patients</td><td>Shows whether patients get to first value fast enough</td></tr>
              <tr><td>Average staff touches per registration</td><td>Unknown</td><td>Track weekly</td><td>Reduce over time</td><td>Indicates operational efficiency and scalability</td></tr>
              <tr><td>Time from first outreach to registration</td><td>Unknown</td><td>Track weekly</td><td>Under 7 days</td><td>Measures funnel speed and process friction</td></tr>
              <tr><td>7-day patient engagement</td><td>0%</td><td>Track after launch</td><td>65%+</td><td>Signals whether the product is useful beyond signup</td></tr>
              <tr><td>Estimated cost per enrolled patient</td><td>Unknown</td><td>Track monthly</td><td>Declining trend</td><td>Creates the ROI case for broader deployment</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div id="patients" class="tab-panel">
        <div class="section-title">Rollout Tracker</div>
        <p class="section-copy">
          This tab should function as the short-term operating tracker for the initial 25 patients. It should help the team manage the funnel from identified patient to registration, activation, and early engagement.
        </p>
        <div class="bottom">
          <div class="panel">
            <h3>Weekly Operating Cadence</h3>
            <ul>
              <li>Monday: review funnel counts, owners, and blockers</li>
              <li>Midweek: execute outreach and follow-up</li>
              <li>Friday: update KPIs, learnings, and next decisions</li>
            </ul>
          </div>
          <div class="panel closing">
            <h3>Operational Goal</h3>
            <p>Move from identified candidates to contacted patients, then to registered users, activated users, and early engagement. The goal is measurable movement through the funnel, not just outreach volume.</p>
          </div>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Patient Name</th>
                <th>Contact Detail</th>
                <th>Owner</th>
                <th>Contact Status</th>
                <th>Registration Status</th>
                <th>Activation Status</th>
                <th>Next Action</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>1</td><td>Wolf, Jorge</td><td>DOB: 11/15/1967</td><td>SWCA Team</td><td><span class="status">Reached</span></td><td><span class="status">Registered</span></td><td><span class="status">Pending</span></td><td>Complete first check-in</td><td>First confirmed contact</td></tr>
              <tr><td>2</td><td>Freile, Guillermo</td><td>DOB: 10/06/1957</td><td>SWCA Team</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr><td>3</td><td>Landivar, Vanessa</td><td>DOB: 09/20/1983</td><td>SWCA Team</td><td><span class="status">Reached</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Follow-up registration</td><td>Confirmed contact</td></tr>
              <tr><td>4</td><td>Quiroga, Jacqueline</td><td>DOB: 11/29/1962</td><td>SWCA Team</td><td><span class="status">Reached</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Follow-up registration</td><td>Confirmed contact</td></tr>
              <tr><td>5</td><td>Brown, William</td><td>DOB: -</td><td>SWCA Team</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Validate contact detail</td><td></td></tr>
              <tr><td>6</td><td>Rankin, Rebecca</td><td>DOB: 01/25/1948</td><td>SWCA Team</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr><td>7</td><td>Natale, Augustine</td><td>DOB: 06/11/1954</td><td>SWCA Team</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr><td>8</td><td>Hodge, James</td><td>DOB: 12/09/1959</td><td>SWCA Team</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr><td>9</td><td>Zwade, Karli</td><td>DOB: 03/01/1993</td><td>SWCA Team</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr><td>10</td><td>Klein, William</td><td>DOB: 02/25/1954</td><td>SWCA Team</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr><td>11</td><td>Blum, Laurie</td><td>DOB: 07/27/1959</td><td>SWCA Team</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr><td>12</td><td>Owens, Wendy</td><td>DOB: 12/08/1955</td><td>SWCA Team</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr><td>13</td><td>Cimino, Michael B</td><td>DOB: 02/05/1987</td><td>SWCA Team</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr><td>14</td><td>Cohen, Sue</td><td>DOB: 05/06/1948</td><td>SWCA Team</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr><td>15</td><td>Labaton, Sandy</td><td>DOB: 08/30/1956</td><td>SWCA Team</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr><td>16</td><td>Dorfman, Steven</td><td>DOB: 08/21/1957</td><td>SWCA Team</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr><td>17</td><td>Dorfman, Beth</td><td>DOB: 10/06/1959</td><td>SWCA Team</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr><td>18</td><td>Labaton, Gail</td><td>DOB: 03/14/1951</td><td>SWCA Team</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr><td>19</td><td>Moore, Bill</td><td>DOB: -</td><td>SWCA Team</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Validate contact detail</td><td></td></tr>
              <tr><td>20</td><td>Moore, Julie</td><td>DOB: -</td><td>SWCA Team</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Validate contact detail</td><td></td></tr>
              <tr><td>21</td><td>Weisman, Jerry</td><td>DOB: 08/05/1962</td><td>SWCA Team</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr><td>22</td><td>Meier, Richard</td><td>DOB: 10/12/1934</td><td>SWCA Team</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr><td>23</td><td>Socarras, Guillermo</td><td>DOB: 07/04/1975</td><td>SWCA Team</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr><td>24</td><td>Chase, Berry</td><td>DOB: 12/12/1945</td><td>SWCA Team</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr><td>25</td><td>Shinners, Helen</td><td>DOB: 08/28/1952</td><td>SWCA Team</td><td><span class="status">Reached</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Follow-up registration</td><td>Confirmed contact</td></tr>
            </tbody>
          </table>
        </div>

        <div class="section-title">Milestones and Timeline</div>
        <p class="section-copy">
          These phases should stay visible until the pilot is mature enough that the admin dashboards can fully own the live reporting.
        </p>

        <div class="flow">
          <div class="flow-step">
            <div class="date-pill">Phase 0</div>
            <div class="num">1</div>
            <h4>Setup</h4>
            <p>Finalize cohort, owners, scripts, patient value proposition, and pilot definitions for registration, activation, and engagement.</p>
          </div>
          <div class="flow-step">
            <div class="date-pill">Phase 1</div>
            <div class="num">2</div>
            <h4>Registration Push</h4>
            <p>Move identified patients into registered users through a simple, measurable outreach process with clear follow-up ownership.</p>
          </div>
          <div class="flow-step">
            <div class="date-pill">Phase 2</div>
            <div class="num">3</div>
            <h4>Activation</h4>
            <p>Get registered patients to complete a first meaningful action such as onboarding completion, a check-in, or first use of chat.</p>
          </div>
          <div class="flow-step">
            <div class="date-pill">Phase 3</div>
            <div class="num">4</div>
            <h4>Engagement Proof</h4>
            <p>Measure which patient utilities drive repeat use, what follow-up is still manual, and where workflow or product changes are needed.</p>
          </div>
          <div class="flow-step">
            <div class="date-pill">Phase 4</div>
            <div class="num">5</div>
            <h4>ROI Review</h4>
            <p>Compare targets against actual conversion, engagement, staff time, and cost per enrolled patient to determine next rollout decisions.</p>
          </div>
        </div>
      </div>
      <div id="learnings" class="tab-panel">
        <div class="section-title">Learnings and Decisions</div>
        <p class="section-copy">
          This tab should become the running memory for the pilot. Use it to record what patients respond to, what creates friction, what Michael and SWCA need next, and what decisions should migrate into product and dashboard work.
        </p>

        <div class="bottom">
          <div class="panel">
            <h3>What We Need To Learn</h3>
            <ul>
              <li>What outreach framing gets the highest registration conversion</li>
              <li>Which features patients use first after registration</li>
              <li>Where patients stall in onboarding or activation</li>
              <li>How much staff follow-up is required per successful registration</li>
              <li>What metrics should later be pulled directly from admin reporting</li>
            </ul>
          </div>
          <div class="panel closing">
            <h3>When To Move Into Dashboards</h3>
            <p>Shift from this brief to in-platform dashboards when most KPI reporting is system-generated, the cohort tracker is managed inside the product, and the leadership audience no longer needs narrative context to interpret progress.</p>
          </div>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Area</th>
                <th>Current Observation</th>
                <th>Action</th>
                <th>Owner</th>
                <th>Decision Needed</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Registration messaging</td><td>Need to validate what invitation framing converts best</td><td>Test outreach script variants</td><td>SWCA + VeeVee</td><td>Standardize one outreach approach</td></tr>
              <tr><td>Patient utility</td><td>Need to confirm which feature creates first clear value</td><td>Track first-use behavior after signup</td><td>VeeVee</td><td>Prioritize feature emphasis in onboarding</td></tr>
              <tr><td>ROI reporting</td><td>Manual tracking still required</td><td>Define dashboard-source metrics now</td><td>VeeVee</td><td>Set threshold for dashboard handoff</td></tr>
              <tr><td>Operational workflow</td><td>Owner and follow-up cadence must stay explicit</td><td>Review weekly and tighten handoffs</td><td>Michael / SWCA</td><td>Confirm pilot operating cadence</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <div class="footer">
      VeeVee · Working brief for SWCA registration, activation, ROI, and milestone review
    </div>
  </div>

  <script>
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabPanels = document.querySelectorAll(".tab-panel");

    function sendHeight() {
      const height = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );
      window.parent.postMessage({ type: "swca-brief-height", height }, "*");
    }

    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const tab = button.dataset.tab;
        tabButtons.forEach((btn) => btn.classList.remove("active"));
        tabPanels.forEach((panel) => panel.classList.remove("active"));
        button.classList.add("active");
        document.getElementById(tab).classList.add("active");
        sendHeight();
      });
    });

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
