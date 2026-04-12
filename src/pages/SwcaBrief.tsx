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
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 20px;
      padding: 16px 18px;
      backdrop-filter: blur(6px);
      align-self: start;
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

    .launch-command {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 18px;
      margin-top: 18px;
      margin-bottom: 18px;
    }

    .hero-summary {
      display: grid;
      gap: 12px;
    }

    .phase-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      width: fit-content;
      padding: 8px 12px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.14);
      border: 1px solid rgba(255, 255, 255, 0.16);
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #ffffff;
    }

    .phase-dot {
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: var(--green);
      box-shadow: 0 0 12px rgba(83, 215, 105, 0.8);
    }

    .hero-note {
      margin: 0;
      font-size: 14px;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.86);
      max-width: 680px;
    }

    .countdown-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }

    .countdown-card {
      padding: 16px;
      border-radius: 18px;
      background: linear-gradient(180deg, #ffffff 0%, #f7fbff 100%);
      border: 1px solid var(--border);
      box-shadow: 0 8px 20px rgba(6, 37, 76, 0.05);
    }

    .countdown-label {
      margin: 0 0 8px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--blue-800);
    }

    .countdown-value {
      margin: 0 0 6px;
      font-size: 34px;
      line-height: 1;
      font-weight: 800;
      color: var(--blue-900);
    }

    .countdown-date {
      margin: 0;
      font-size: 13px;
      line-height: 1.5;
      color: var(--muted);
    }

    .metric-strip {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 12px;
      margin-bottom: 18px;
    }

    .metric-card {
      padding: 16px;
      border-radius: 16px;
      background: linear-gradient(180deg, #ffffff 0%, #f7fbff 100%);
      border: 1px solid var(--border);
      box-shadow: 0 8px 20px rgba(6, 37, 76, 0.04);
    }

    .metric-card .label {
      margin: 0 0 8px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--blue-800);
    }

    .metric-card .value {
      margin: 0 0 4px;
      font-size: 28px;
      line-height: 1;
      font-weight: 800;
      color: var(--blue-900);
    }

    .metric-card .help {
      margin: 0;
      font-size: 12px;
      line-height: 1.5;
      color: var(--muted);
    }

    .hero-metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-top: 16px;
    }

    .hero-metric {
      padding: 14px 16px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.16);
    }

    .hero-metric .label {
      margin: 0 0 8px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.74);
    }

    .hero-metric .value {
      margin: 0 0 4px;
      font-size: 28px;
      line-height: 1;
      font-weight: 800;
      color: #ffffff;
    }

    .hero-metric .help {
      margin: 0;
      font-size: 12px;
      line-height: 1.45;
      color: rgba(255, 255, 255, 0.8);
    }

    .progress-strip {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 18px;
    }

    .progress-card {
      padding: 14px 16px;
      border-radius: 16px;
      background: linear-gradient(180deg, #ffffff 0%, #f7fbff 100%);
      border: 1px solid var(--border);
      box-shadow: 0 8px 20px rgba(6, 37, 76, 0.04);
    }

    .progress-card .label {
      margin: 0 0 8px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--blue-800);
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      border-radius: 999px;
      overflow: hidden;
      background: #d9e6f5;
    }

    .progress-fill {
      height: 100%;
      border-radius: 999px;
      background: linear-gradient(90deg, #6ee7f2 0%, #53d769 100%);
    }

    .progress-meta {
      margin: 8px 0 0;
      font-size: 12px;
      color: var(--muted);
    }

    .weekly-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }

    .weekly-card {
      padding: 16px;
      border-radius: 18px;
      background: linear-gradient(180deg, #ffffff 0%, #f7fbff 100%);
      border: 1px solid var(--border);
      box-shadow: 0 8px 20px rgba(6, 37, 76, 0.04);
    }

    .weekly-card h3 {
      margin: 0 0 10px;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--blue-800);
    }

    .weekly-card p,
    .weekly-card li {
      font-size: 13px;
      line-height: 1.55;
      color: var(--muted);
    }

    .weekly-card ul {
      margin: 0;
      padding-left: 18px;
    }

    .story-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 28px;
    }

    .story-card {
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 20px 22px;
      background: linear-gradient(180deg, #ffffff 0%, #f7fbff 100%);
      box-shadow: 0 8px 20px rgba(6, 37, 76, 0.04);
    }

    .story-card h3 {
      margin: 0 0 10px;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--blue-800);
    }

    .story-card p,
    .story-card li {
      font-size: 14px;
      line-height: 1.6;
      color: var(--muted);
    }

    .story-card ul {
      margin: 0;
      padding-left: 18px;
    }

    .funnel-row {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 12px;
      margin-bottom: 18px;
    }

    .funnel-card {
      position: relative;
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 16px;
      background: linear-gradient(180deg, #ffffff 0%, #f7fbff 100%);
      box-shadow: 0 8px 20px rgba(6, 37, 76, 0.04);
    }

    .funnel-stage {
      margin: 0 0 8px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--blue-800);
    }

    .funnel-value {
      margin: 0 0 4px;
      font-size: 30px;
      line-height: 1;
      font-weight: 800;
      color: var(--blue-900);
    }

    .funnel-meta {
      margin: 0 0 8px;
      font-size: 12px;
      line-height: 1.45;
      color: var(--muted);
    }

    .funnel-tip {
      margin: 0;
      padding-top: 8px;
      border-top: 1px solid var(--border);
      font-size: 12px;
      line-height: 1.5;
      color: var(--muted);
    }

    .driver-list {
      display: grid;
      gap: 10px;
    }

    .driver-item {
      display: grid;
      grid-template-columns: 1.2fr 0.7fr 1.6fr;
      gap: 12px;
      align-items: start;
      padding: 12px 0;
      border-top: 1px solid var(--border);
    }

    .driver-item:first-child {
      border-top: 0;
      padding-top: 0;
    }

    .driver-name {
      margin: 0;
      font-size: 13px;
      font-weight: 700;
      color: var(--blue-900);
    }

    .driver-status {
      width: fit-content;
      padding: 5px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      background: var(--blue-100);
      color: var(--blue-800);
    }

    .driver-note {
      margin: 0;
      font-size: 12px;
      line-height: 1.5;
      color: var(--muted);
    }

    .tabs {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-top: 8px;
      width: 100%;
      padding: 10px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.14);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
    }

    .tabs-label {
      margin: 22px 0 8px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.74);
    }

    .tab-btn {
      appearance: none;
      width: 100%;
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.92);
      border-radius: 999px;
      padding: 13px 16px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
    }

    .tab-btn:hover {
      background: rgba(255, 255, 255, 0.18);
      border-color: rgba(255, 255, 255, 0.24);
    }

    .tab-btn.active {
      background: linear-gradient(135deg, #9ce7ff 0%, #ffffff 100%);
      color: var(--blue-900);
      border-color: rgba(255, 255, 255, 0.92);
      box-shadow: 0 10px 22px rgba(6, 37, 76, 0.24);
    }

    .content {
      padding: 34px 44px 42px;
      border-top: 1px solid #dce6f5;
      background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
    }

    .tab-panel { display: none; }
    .tab-panel.active { display: block; }

    .patient-filter-tabs {
      display: inline-flex;
      gap: 10px;
      margin: 0 0 18px;
      padding: 8px;
      border-radius: 999px;
      background: #edf4ff;
      border: 1px solid #d8e5fb;
    }

    .patient-filter-btn {
      appearance: none;
      border: 0;
      background: transparent;
      color: var(--blue-800);
      border-radius: 999px;
      padding: 10px 16px;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.01em;
      cursor: pointer;
      transition: background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
    }

    .patient-filter-btn.active {
      background: linear-gradient(135deg, #163d74 0%, #245aa1 100%);
      color: #ffffff;
      box-shadow: 0 10px 22px rgba(6, 37, 76, 0.18);
    }

    .patient-row-hidden {
      display: none;
    }

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
      .launch-command,
      .countdown-grid,
      .hero-metrics,
      .metric-strip,
      .progress-strip,
      .weekly-grid,
      .story-grid,
      .funnel-row,
      .tabs,
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
      <div class="launch-command">
        <div class="hero-summary">
          <div class="phase-pill"><span class="phase-dot"></span> Current Phase: Planning and Outreach Readiness</div>
          <div>
            <h1>SWCA Pilot Brief</h1>
            <p class="hero-note">A simpler working brief for what is happening now, what this pilot must prove, and which younger patients are in motion.</p>
          </div>
          <div class="hero-metrics">
            <div class="hero-metric">
              <p class="label">Younger Cohort</p>
              <p class="value">7</p>
              <p class="help">Current active focus</p>
            </div>
            <div class="hero-metric">
              <p class="label">Reached</p>
              <p class="value">3</p>
              <p class="help">Younger patients contacted</p>
            </div>
            <div class="hero-metric">
              <p class="label">Registered</p>
              <p class="value">1</p>
              <p class="help">Younger patients registered</p>
            </div>
          </div>
        </div>
        <div class="mini-panel">
          <h3>Current Focus</h3>
          <p>Work the younger cohort first, get registrations moving, and keep the brief limited to current status, pilot rules, and patient actions.</p>
        </div>
      </div>

      <div class="tabs-label">Sections</div>
      <div class="tabs">
        <button class="tab-btn active" data-tab="now">Now</button>
        <button class="tab-btn" data-tab="plan">Plan</button>
        <button class="tab-btn" data-tab="patients">Patients</button>
      </div>
    </section>

    <section class="content">
      <div id="now" class="tab-panel active">
        <div class="section-title">Current Status</div>
        <p class="section-copy">
          One-page readout of where the pilot stands right now, what is blocked, and what has to happen next.
        </p>

        <div class="bottom">
          <div class="panel">
            <h3>Status</h3>
            <p>The pilot is still in setup. The younger cohort is the active workstream, first contact has started, and registration has only begun for one patient.</p>
          </div>
          <div class="panel closing">
            <h3>Review Cadence</h3>
            <p>Last updated: April 6, 2026</p>
            <p>Next review: April 8, 2026</p>
          </div>
        </div>

        <div class="section-title">Key Numbers</div>
        <p class="section-copy">
          These are the only numbers that matter on this page.
        </p>

        <div class="funnel-row">
          <div class="funnel-card">
            <p class="funnel-stage">Young Cohort</p>
            <p class="funnel-value">7</p>
            <p class="funnel-meta">Current working group.</p>
            <p class="funnel-tip">This is the list the team should be working first.</p>
          </div>
          <div class="funnel-card">
            <p class="funnel-stage">Reached</p>
            <p class="funnel-value">3</p>
            <p class="funnel-meta">3 of 7 reached.</p>
            <p class="funnel-tip">Shows whether the first outreach wave is landing.</p>
          </div>
          <div class="funnel-card">
            <p class="funnel-stage">Registered</p>
            <p class="funnel-value">1</p>
            <p class="funnel-meta">1 of 7 registered.</p>
            <p class="funnel-tip">This is the first proof the handoff can work.</p>
          </div>
          <div class="funnel-card">
            <p class="funnel-stage">Activated</p>
            <p class="funnel-value">0</p>
            <p class="funnel-meta">No younger activations yet.</p>
            <p class="funnel-tip">Activation stays at zero until a patient completes first value.</p>
          </div>
          <div class="funnel-card">
            <p class="funnel-stage">Next Review</p>
            <p class="funnel-value" data-countdown-value-hero="soft">--</p>
            <p class="funnel-meta">Days until April 8.</p>
            <p class="funnel-tip">This is the next date for decisions on message, ownership, and follow-up.</p>
          </div>
        </div>

        <div class="section-title">What Is Blocked</div>
        <p class="section-copy">
          Keep this limited to the few blockers that actually slow movement right now.
        </p>

        <div class="cards">
          <div class="card">
            <h3>Blockers</h3>
            <ul>
              <li>Only one younger patient is registered.</li>
              <li>Contact details still need validation for part of the list.</li>
              <li>The registration handoff is not standardized yet.</li>
            </ul>
          </div>
          <div class="card closing">
            <h3>Decision Needed</h3>
            <ul>
              <li>Lock one standard outreach message for the younger cohort.</li>
              <li>Agree on one definition of activation.</li>
              <li>Confirm who owns weekly tracker updates.</li>
            </ul>
          </div>
        </div>

        <div class="section-title">What Happens Next</div>
        <p class="section-copy">
          This page should make the next move obvious.
        </p>

        <div class="bottom">
          <div class="panel">
            <h3>Next Actions</h3>
            <ul>
              <li>Work the seven younger patients before broadening the list.</li>
              <li>Follow up the three already reached.</li>
              <li>Push the remaining younger patients into first registration attempts.</li>
            </ul>
          </div>
          <div class="panel closing">
            <h3>Upcoming Dates</h3>
            <ul>
              <li>April 8: lock ownership, script, and tracker cadence</li>
              <li>April 15: show that registrations are moving</li>
              <li>Day 60: show first activation and early engagement</li>
            </ul>
          </div>
        </div>
      </div>

      <div id="plan" class="tab-panel">
        <div class="section-title">Pilot Objective</div>
        <p class="section-copy">
          Prove that SWCA can convert a focused younger cohort into registrations, activation, and early engagement without creating extra staff burden.
        </p>

        <div class="cards">
          <div class="card">
            <h3>Target Cohort</h3>
            <ul>
              <li>Use the younger age group as the first focused workstream.</li>
              <li>Keep the younger list small enough to manage tightly.</li>
              <li>Do not expand focus until the handoff is working.</li>
            </ul>
          </div>
          <div class="card closing">
            <h3>Why Start Here</h3>
            <ul>
              <li>This cohort is easier to concentrate on immediately.</li>
              <li>It gives SWCA a cleaner signal on outreach and conversion.</li>
              <li>It reduces noise while the workflow is still being proven.</li>
            </ul>
          </div>
        </div>

        <div class="section-title">Success Metrics</div>
        <p class="section-copy">
          This page should define what success means and how each stage is measured.
        </p>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Metric</th>
                <th>Definition</th>
                <th>Current</th>
                <th>Target</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Reached</td><td>Patient was successfully contacted</td><td>3</td><td>6 of 7</td></tr>
              <tr><td>Registered</td><td>Patient completed signup</td><td>1</td><td>4+</td></tr>
              <tr><td>Activated</td><td>Patient completed first meaningful action</td><td>0</td><td>3+</td></tr>
              <tr><td>7-day engaged</td><td>Patient is still active after first week</td><td>0</td><td>2+</td></tr>
              <tr><td>Staff touches</td><td>Manual follow-ups needed per registration</td><td>Not tracked</td><td>Visible by Day 60</td></tr>
            </tbody>
          </table>
        </div>

        <div class="section-title">Definitions</div>
        <p class="section-copy">
          Keep the stage definitions fixed so the tracker can be trusted.
        </p>

        <div class="cards">
          <div class="card">
            <h3>Reached</h3>
            <ul>
              <li>Confirmed by phone, text, or email.</li>
              <li>Patient knows why SWCA is contacting them.</li>
              <li>Next step is assigned.</li>
            </ul>
          </div>
          <div class="card">
            <h3>Registered</h3>
            <ul>
              <li>Signup is complete.</li>
              <li>Patient can enter the product.</li>
              <li>No longer counted as outreach-only.</li>
            </ul>
          </div>
          <div class="card">
            <h3>Activated</h3>
            <ul>
              <li>Patient completes first check-in, onboarding, or first use of chat.</li>
              <li>This is the first proof of value.</li>
              <li>Activation must be counted the same way every week.</li>
            </ul>
          </div>
          <div class="card closing">
            <h3>Engaged</h3>
            <ul>
              <li>Patient returns after first week.</li>
              <li>Use continues beyond signup.</li>
              <li>This separates curiosity from real adoption.</li>
            </ul>
          </div>
        </div>

        <div class="section-title">Owners</div>
        <p class="section-copy">
          Limit ownership to the workstreams that matter to this pilot.
        </p>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Workstream</th>
                <th>Owner</th>
                <th>Support</th>
                <th>Output</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Younger patient list</td><td>SWCA</td><td>Michael</td><td>Validated list with owners</td></tr>
              <tr><td>Outreach message</td><td>Michael + SWCA</td><td>VeeVee</td><td>One standard script</td></tr>
              <tr><td>Registration handoff</td><td>SWCA</td><td>VeeVee</td><td>Working signup path</td></tr>
              <tr><td>Activation definition</td><td>VeeVee</td><td>Michael</td><td>One measurable first-value action</td></tr>
              <tr><td>Weekly tracker update</td><td>Michael</td><td>VeeVee</td><td>Trusted counts and next actions</td></tr>
            </tbody>
          </table>
        </div>

        <div class="section-title">Decision Rules</div>
        <p class="section-copy">
          Keep the decision rules short and explicit.
        </p>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Checkpoint</th>
                <th>Date</th>
                <th>Required Result</th>
                <th>If Missed</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Wave one setup</td><td>April 8</td><td>Owners, script, and definitions are locked</td><td>Do not broaden the cohort yet</td></tr>
              <tr><td>Early conversion</td><td>April 15</td><td>Registrations are moving in the younger cohort</td><td>Rewrite the handoff before expanding</td></tr>
              <tr><td>Pilot proof</td><td>Day 60</td><td>Activation and early engagement are visible</td><td>Simplify workflow and keep pilot in adjustment mode</td></tr>
              <tr><td>Go / adjust / stop</td><td>Day 90</td><td>Results are strong enough for leadership review</td><td>Hold expansion until proof is credible</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div id="patients" class="tab-panel">
        <div class="section-title">Younger Cohort Tracker</div>
        <p class="section-copy">
          Working list for the current younger cohort. This page should stay focused on actual patient movement, not strategy notes.
        </p>
        <div class="bottom">
          <div class="panel">
            <h3>Working Rules</h3>
            <ul>
              <li>Default view is the younger cohort.</li>
              <li>Each row needs one owner and one next action.</li>
              <li>Notes stay short and operational.</li>
            </ul>
          </div>
          <div class="panel closing">
            <h3>Immediate Goal</h3>
            <p>Move the younger cohort from identified to reached, then from reached to registered, before broadening attention back to the full list.</p>
          </div>
        </div>

        <div class="funnel-row">
          <div class="funnel-card">
            <p class="funnel-stage">Young Patients</p>
            <p class="funnel-value">7</p>
            <p class="funnel-meta">Current focused list.</p>
            <p class="funnel-tip">These are the patients the team should work first.</p>
          </div>
          <div class="funnel-card">
            <p class="funnel-stage">Reached</p>
            <p class="funnel-value">3</p>
            <p class="funnel-meta">Already contacted.</p>
            <p class="funnel-tip">These should move to follow-up or registration immediately.</p>
          </div>
          <div class="funnel-card">
            <p class="funnel-stage">Registered</p>
            <p class="funnel-value">1</p>
            <p class="funnel-meta">Signup complete.</p>
            <p class="funnel-tip">This is the current proof point.</p>
          </div>
          <div class="funnel-card">
            <p class="funnel-stage">Pending Contact</p>
            <p class="funnel-value">4</p>
            <p class="funnel-meta">Still needs first touch.</p>
            <p class="funnel-tip">This is the immediate outreach queue.</p>
          </div>
        </div>

        <div class="table-wrap">
          <div class="patient-filter-tabs" aria-label="Patient age filters">
            <button class="patient-filter-btn active" data-patient-filter="younger">Younger Cohort</button>
            <button class="patient-filter-btn" data-patient-filter="all">All Patients</button>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Patient Alias</th>
                <th>Age Group</th>
                <th>Owner</th>
                <th>Last Touch</th>
                <th>Contact Status</th>
                <th>Registration Status</th>
                <th>Activation Status</th>
                <th>Next Action</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr data-age-group="younger"><td>1</td><td>Jorge W.</td><td>46-65</td><td>SWCA Team</td><td>Apr 6</td><td><span class="status">Reached</span></td><td><span class="status">Registered</span></td><td><span class="status">Pending</span></td><td>Complete first check-in</td><td>First confirmed contact</td></tr>
              <tr data-age-group="older"><td>2</td><td>Guillermo F.</td><td>65-72</td><td>SWCA Team</td><td>-</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr data-age-group="younger"><td>3</td><td>Vanessa L.</td><td>33-45</td><td>SWCA Team</td><td>Apr 5</td><td><span class="status">Reached</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Follow-up registration</td><td>Confirmed contact</td></tr>
              <tr data-age-group="younger"><td>4</td><td>Jacqueline Q.</td><td>46-65</td><td>SWCA Team</td><td>Apr 5</td><td><span class="status">Reached</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Follow-up registration</td><td>Confirmed contact</td></tr>
              <tr data-age-group="unknown"><td>5</td><td>William B.</td><td>Unknown</td><td>SWCA Team</td><td>-</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Validate contact detail</td><td></td></tr>
              <tr data-age-group="older"><td>6</td><td>Rebecca R.</td><td>Older than 72</td><td>SWCA Team</td><td>-</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr data-age-group="older"><td>7</td><td>Augustine N.</td><td>65-72</td><td>SWCA Team</td><td>-</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr data-age-group="older"><td>8</td><td>James H.</td><td>65-72</td><td>SWCA Team</td><td>-</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr data-age-group="younger"><td>9</td><td>Karli Z.</td><td>33-45</td><td>SWCA Team</td><td>-</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr data-age-group="older"><td>10</td><td>William K.</td><td>65-72</td><td>SWCA Team</td><td>-</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr data-age-group="older"><td>11</td><td>Laurie B.</td><td>65-72</td><td>SWCA Team</td><td>-</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr data-age-group="older"><td>12</td><td>Wendy O.</td><td>65-72</td><td>SWCA Team</td><td>-</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr data-age-group="younger"><td>13</td><td>Michael C.</td><td>33-45</td><td>SWCA Team</td><td>-</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr data-age-group="older"><td>14</td><td>Sue C.</td><td>Older than 72</td><td>SWCA Team</td><td>-</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr data-age-group="older"><td>15</td><td>Sandy L.</td><td>65-72</td><td>SWCA Team</td><td>-</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr data-age-group="older"><td>16</td><td>Steven D.</td><td>65-72</td><td>SWCA Team</td><td>-</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr data-age-group="older"><td>17</td><td>Beth D.</td><td>65-72</td><td>SWCA Team</td><td>-</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr data-age-group="older"><td>18</td><td>Gail L.</td><td>Older than 72</td><td>SWCA Team</td><td>-</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr data-age-group="unknown"><td>19</td><td>Bill M.</td><td>Unknown</td><td>SWCA Team</td><td>-</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Validate contact detail</td><td></td></tr>
              <tr data-age-group="unknown"><td>20</td><td>Julie M.</td><td>Unknown</td><td>SWCA Team</td><td>-</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Validate contact detail</td><td></td></tr>
              <tr data-age-group="younger"><td>21</td><td>Jerry W.</td><td>46-65</td><td>SWCA Team</td><td>-</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr data-age-group="older"><td>22</td><td>Richard M.</td><td>Older than 72</td><td>SWCA Team</td><td>-</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr data-age-group="younger"><td>23</td><td>Guillermo S.</td><td>46-65</td><td>SWCA Team</td><td>-</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr data-age-group="older"><td>24</td><td>Berry C.</td><td>Older than 72</td><td>SWCA Team</td><td>-</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr data-age-group="older"><td>25</td><td>Helen S.</td><td>Older than 72</td><td>SWCA Team</td><td>Apr 4</td><td><span class="status">Reached</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Follow-up registration</td><td>Confirmed contact</td></tr>
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
    const patientFilterButtons = document.querySelectorAll("[data-patient-filter]");
    const patientRows = document.querySelectorAll("#patients tbody tr");
    const countdownCards = document.querySelectorAll("[data-countdown]");

    function sendHeight() {
      const height = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );
      window.parent.postMessage({ type: "swca-brief-height", height }, "*");
    }

    function updateCountdowns() {
      const now = new Date();
      const heroSoftLaunch = document.querySelector("[data-countdown-value-hero='soft']");

      if (heroSoftLaunch) {
        const nextReview = new Date("2026-04-08T09:00:00-04:00");
        const diff = nextReview.getTime() - now.getTime();
        const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
        heroSoftLaunch.textContent = diff <= 0 ? "Live" : String(days);
      }

      countdownCards.forEach((card) => {
        const target = new Date(card.getAttribute("data-countdown"));
        const valueNode = card.querySelector("[data-countdown-value]");

        if (!valueNode || Number.isNaN(target.getTime())) {
          return;
        }

        const diff = target.getTime() - now.getTime();
        const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
        valueNode.textContent = diff <= 0 ? "Live" : String(days);

      });
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

    function applyPatientFilter(filter) {
      patientFilterButtons.forEach((btn) => {
        btn.classList.toggle("active", btn.getAttribute("data-patient-filter") === filter);
      });

      patientRows.forEach((row) => {
        const ageGroup = row.getAttribute("data-age-group");
        const isVisible = filter === "all" || ageGroup === filter;
        row.classList.toggle("patient-row-hidden", !isVisible);
      });

      sendHeight();
    }

    patientFilterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        applyPatientFilter(button.getAttribute("data-patient-filter"));
      });
    });

    updateCountdowns();
    applyPatientFilter("younger");
    setInterval(updateCountdowns, 60000);
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

