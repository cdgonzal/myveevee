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
      grid-template-columns: repeat(4, 1fr);
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
            <h1>SWCA Launch Tracker</h1>
            <p class="hero-note">Pilot status for registration, activation, and launch readiness.</p>
          </div>
          <div class="hero-metrics">
            <div class="hero-metric">
              <p class="label">Soft Launch</p>
              <p class="value" data-countdown-value-hero="soft">--</p>
              <p class="help">Days until April 15</p>
            </div>
            <div class="hero-metric">
              <p class="label">Reached</p>
              <p class="value">4</p>
              <p class="help">Patients contacted so far</p>
            </div>
            <div class="hero-metric">
              <p class="label">Registered</p>
              <p class="value">0</p>
              <p class="help">Target: 12-15</p>
            </div>
          </div>
        </div>
        <div class="mini-panel">
          <h3>Current Focus</h3>
          <p>Finalize the outreach plan, start converting the first patient wave into registrations, and use the April 15 launch event to create early activation momentum.</p>
        </div>
      </div>

      <div class="tabs-label">Sections</div>
      <div class="tabs">
        <button class="tab-btn active" data-tab="dashboard">Dashboard</button>
        <button class="tab-btn" data-tab="overview">Executive Brief</button>
        <button class="tab-btn" data-tab="patients">Rollout Tracker</button>
        <button class="tab-btn" data-tab="learnings">Learnings &amp; Decisions</button>
      </div>
    </section>

    <section class="content">
      <div id="dashboard" class="tab-panel active">
        <div class="section-title">Launch Dashboard</div>
        <p class="section-copy">
          Where we are, what is stuck, and what happens next.
        </p>

        <div class="story-grid">
          <div class="story-card">
            <h3>Launch Status</h3>
            <div class="countdown-grid">
              <div class="countdown-card" data-countdown="2026-04-08T09:00:00-04:00">
                <p class="countdown-label">Planning Meeting</p>
                <p class="countdown-value" data-countdown-value>--</p>
                <p class="countdown-date">Days until Michael and Charlie finalize outreach ownership, channels, and tracking.</p>
              </div>
              <div class="countdown-card" data-countdown="2026-04-15T18:00:00-04:00">
                <p class="countdown-label">Soft Launch</p>
                <p class="countdown-value" data-countdown-value>--</p>
                <p class="countdown-date">Days until the first activation moment for early patients.</p>
              </div>
              <div class="countdown-card" data-countdown="2026-05-29T18:00:00-04:00">
                <p class="countdown-label">Formal Launch</p>
                <p class="countdown-value" data-countdown-value>--</p>
                <p class="countdown-date">Days until broader launch based on what this pilot proves.</p>
              </div>
            </div>
          </div>
          <div class="story-card">
            <h3>What The Dashboard Is Saying</h3>
            <ul>
              <li>Dates are set.</li>
              <li>The funnel is stuck before registration.</li>
              <li>Next goal: turn first contacts into first registrations before April 15.</li>
            </ul>
          </div>
        </div>

        <div class="bottom">
          <div class="panel">
            <h3>Current Bottleneck</h3>
            <p>Contact-to-registration conversion.</p>
          </div>
          <div class="panel closing">
            <h3>Review Cadence</h3>
            <p>Last updated: April 6, 2026</p>
            <p>Next review: April 8, 2026</p>
          </div>
        </div>

        <div class="section-title">Funnel Story</div>
        <p class="section-copy">
          This shows where patients are stopping.
        </p>

        <div class="funnel-row">
          <div class="funnel-card">
            <p class="funnel-stage">Identified</p>
            <p class="funnel-value">25</p>
            <p class="funnel-meta">Starting pool.</p>
            <p class="funnel-tip">This is the total first-wave opportunity.</p>
          </div>
          <div class="funnel-card">
            <p class="funnel-stage">Reached</p>
            <p class="funnel-value">4</p>
            <p class="funnel-meta">4 of 20+ target reached.</p>
            <p class="funnel-tip">This shows whether outreach is landing.</p>
          </div>
          <div class="funnel-card">
            <p class="funnel-stage">Registered</p>
            <p class="funnel-value">0</p>
            <p class="funnel-meta">Target: 12-15.</p>
            <p class="funnel-tip">This is the first real conversion point.</p>
          </div>
          <div class="funnel-card">
            <p class="funnel-stage">Activated</p>
            <p class="funnel-value">0</p>
            <p class="funnel-meta">Target: 8-10.</p>
            <p class="funnel-tip">This shows first real product value.</p>
          </div>
          <div class="funnel-card">
            <p class="funnel-stage">7-Day Engaged</p>
            <p class="funnel-value">0</p>
            <p class="funnel-meta">Target: 6+.</p>
            <p class="funnel-tip">This shows repeat use, not just signup.</p>
          </div>
        </div>

        <div class="section-title">What Is Driving Movement</div>
        <p class="section-copy">
          These are the key drivers right now.
        </p>

        <div class="story-card">
          <div class="driver-list">
            <div class="driver-item">
              <p class="driver-name">Contact readiness</p>
              <div class="driver-status">Watch</div>
              <p class="driver-note">Some contact details still need validation.</p>
            </div>
            <div class="driver-item">
              <p class="driver-name">Outreach ownership</p>
              <div class="driver-status">Good</div>
              <p class="driver-note">April 8 should lock owners, channels, and sequence.</p>
            </div>
            <div class="driver-item">
              <p class="driver-name">Registration conversion</p>
              <div class="driver-status">Blocked</div>
              <p class="driver-note">No registrations yet. This is the main blocker.</p>
            </div>
            <div class="driver-item">
              <p class="driver-name">Staff efficiency</p>
              <div class="driver-status">Watch</div>
              <p class="driver-note">Track touches per registration now so scaling is easier later.</p>
            </div>
          </div>
        </div>

        <div class="section-title">This Week</div>
        <p class="section-copy">
          This should make the next move obvious.
        </p>

        <div class="weekly-grid">
          <div class="weekly-card">
            <h3>What Happened</h3>
            <ul>
              <li>Initial cohort is identified</li>
              <li>Some patients have been reached</li>
              <li>No registrations have happened yet</li>
            </ul>
          </div>
          <div class="weekly-card">
            <h3>What Happens Next</h3>
            <ul>
              <li>Finalize the April 8 planning meeting agenda</li>
              <li>Confirm contact sequencing and message ownership</li>
              <li>Execute the first organized outreach wave</li>
            </ul>
          </div>
          <div class="weekly-card">
            <h3>Decision Needed</h3>
            <ul>
              <li>Which outreach framing should be standard for wave one</li>
              <li>What counts as first meaningful activation for this pilot</li>
              <li>Which dashboard metrics should become source-of-truth later</li>
            </ul>
          </div>
        </div>
      </div>

      <div id="overview" class="tab-panel">
        <div class="section-title">Goal</div>
        <p class="section-copy">
          Get registrations moving, get patients to first value fast, and show enough proof to expand.
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
              <tr><td>Patients reached</td><td>4</td><td>20+</td><td>Shows whether the outreach motion is getting real contact</td></tr>
              <tr><td>Registrations</td><td>0</td><td>12-15</td><td>Measures whether outreach is converting into accounts</td></tr>
              <tr><td>Activated patients</td><td>0</td><td>8-10</td><td>Shows whether registered patients reach first value</td></tr>
              <tr><td>7-day engaged patients</td><td>0</td><td>6+</td><td>Tests whether the product keeps patients engaged after signup</td></tr>
              <tr><td>ROI review checkpoint</td><td>Not started</td><td>Day 90</td><td>Sets the decision window for expansion and dashboard transition</td></tr>
            </tbody>
          </table>
        </div>

        <div class="section-title">30 / 60 / 90</div>
        <p class="section-copy">
          What success should look like at each stage.
        </p>

        <div class="cards">
          <div class="card">
            <h3>Day 30</h3>
            <p>Get the registration push working.</p>
            <ul>
              <li>Finalize outreach workflow, scripts, and owners</li>
              <li>Reach the majority of the identified cohort</li>
              <li>Show first registrations and first activations</li>
              <li>Identify the features patients respond to first</li>
            </ul>
          </div>
          <div class="card">
            <h3>Day 60</h3>
            <p>Show early patient use and engagement.</p>
            <ul>
              <li>Track 7-day and 30-day engagement for registered patients</li>
              <li>Measure time to first meaningful action</li>
              <li>Refine onboarding, prompts, and follow-up based on patient behavior</li>
              <li>Show where staff effort is creating lift or drag</li>
            </ul>
          </div>
          <div class="card">
            <h3>Day 90</h3>
            <p>Review ROI and decide whether to expand.</p>
            <ul>
              <li>Compare targets against actual conversion and activation</li>
              <li>Estimate cost per enrolled patient and staff time saved</li>
              <li>Determine what reporting can move into platform dashboards</li>
              <li>Decide on broader rollout, feature changes, or cohort expansion</li>
            </ul>
          </div>
          <div class="card closing">
            <h3>Decision Rule</h3>
            <p>Use this brief while the pilot is still changing and metrics are still partly manual.</p>
            <ul>
              <li>Stay here during alignment and experimentation</li>
              <li>Move to dashboards when KPI reporting is system-generated</li>
              <li>Use the brief later as executive summary only</li>
            </ul>
          </div>
        </div>

        <div class="section-title">Patient Value</div>
        <p class="section-copy">
          Patient-facing value in this phase.
        </p>

        <div class="cards">
          <div class="card">
            <h3>Simple Registration &amp; Onboarding</h3>
            <p>Make signup and first use easy.</p>
            <ul>
              <li>Guided invite-to-registration flow</li>
              <li>Simple explanation of why the patient was invited</li>
              <li>Low-friction setup for first use on mobile</li>
            </ul>
          </div>
          <div class="card">
            <h3>Personalized Check-Ins</h3>
            <p>Make follow-up simple enough that patients return.</p>
            <ul>
              <li>Structured prompts and check-ins</li>
              <li>Capture changing needs over time</li>
              <li>Create an early repeat-use habit after registration</li>
            </ul>
          </div>
          <div class="card">
            <h3>VeeVee Chat &amp; Guidance</h3>
            <p>Help patients get answers and move forward with less confusion.</p>
            <ul>
              <li>Clear next-step guidance</li>
              <li>Ongoing touchpoint between formal interactions</li>
              <li>More confidence after onboarding and first use</li>
            </ul>
          </div>
          <div class="card">
            <h3>Reminders, Feed, and Support</h3>
            <p>Keep the first 30 days useful after signup.</p>
            <ul>
              <li>Relevant follow-up nudges</li>
              <li>Personalized feed and educational content</li>
              <li>Benefits or care-navigation support where appropriate</li>
            </ul>
          </div>
        </div>

        <div class="section-title">ROI</div>
        <p class="section-copy">
          The few metrics that matter for ROI.
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
          Working tracker for the first 25 patients.
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
              <tr><td>1</td><td>Jorge W.</td><td>46-65</td><td>SWCA Team</td><td>Apr 6</td><td><span class="status">Reached</span></td><td><span class="status">Registered</span></td><td><span class="status">Pending</span></td><td>Complete first check-in</td><td>First confirmed contact</td></tr>
              <tr><td>2</td><td>Guillermo F.</td><td>65-72</td><td>SWCA Team</td><td>-</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr><td>3</td><td>Vanessa L.</td><td>33-45</td><td>SWCA Team</td><td>Apr 5</td><td><span class="status">Reached</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Follow-up registration</td><td>Confirmed contact</td></tr>
              <tr><td>4</td><td>Jacqueline Q.</td><td>46-65</td><td>SWCA Team</td><td>Apr 5</td><td><span class="status">Reached</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Follow-up registration</td><td>Confirmed contact</td></tr>
              <tr><td>5</td><td>William B.</td><td>Unknown</td><td>SWCA Team</td><td>-</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Validate contact detail</td><td></td></tr>
              <tr><td>6</td><td>Rebecca R.</td><td>Older than 72</td><td>SWCA Team</td><td>-</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr><td>7</td><td>Augustine N.</td><td>65-72</td><td>SWCA Team</td><td>-</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr><td>8</td><td>James H.</td><td>65-72</td><td>SWCA Team</td><td>-</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr><td>9</td><td>Karli Z.</td><td>33-45</td><td>SWCA Team</td><td>-</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr><td>10</td><td>William K.</td><td>65-72</td><td>SWCA Team</td><td>-</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr><td>11</td><td>Laurie B.</td><td>65-72</td><td>SWCA Team</td><td>-</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr><td>12</td><td>Wendy O.</td><td>65-72</td><td>SWCA Team</td><td>-</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr><td>13</td><td>Michael C.</td><td>33-45</td><td>SWCA Team</td><td>-</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr><td>14</td><td>Sue C.</td><td>Older than 72</td><td>SWCA Team</td><td>-</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr><td>15</td><td>Sandy L.</td><td>65-72</td><td>SWCA Team</td><td>-</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr><td>16</td><td>Steven D.</td><td>65-72</td><td>SWCA Team</td><td>-</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr><td>17</td><td>Beth D.</td><td>65-72</td><td>SWCA Team</td><td>-</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr><td>18</td><td>Gail L.</td><td>Older than 72</td><td>SWCA Team</td><td>-</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr><td>19</td><td>Bill M.</td><td>Unknown</td><td>SWCA Team</td><td>-</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Validate contact detail</td><td></td></tr>
              <tr><td>20</td><td>Julie M.</td><td>Unknown</td><td>SWCA Team</td><td>-</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Validate contact detail</td><td></td></tr>
              <tr><td>21</td><td>Jerry W.</td><td>46-65</td><td>SWCA Team</td><td>-</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr><td>22</td><td>Richard M.</td><td>Older than 72</td><td>SWCA Team</td><td>-</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr><td>23</td><td>Guillermo S.</td><td>46-65</td><td>SWCA Team</td><td>-</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr><td>24</td><td>Berry C.</td><td>Older than 72</td><td>SWCA Team</td><td>-</td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Initial outreach</td><td></td></tr>
              <tr><td>25</td><td>Helen S.</td><td>Older than 72</td><td>SWCA Team</td><td>Apr 4</td><td><span class="status">Reached</span></td><td><span class="status">Pending</span></td><td><span class="status">Pending</span></td><td>Follow-up registration</td><td>Confirmed contact</td></tr>
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
        <div class="section-title">Learnings</div>
        <p class="section-copy">
          Running notes on what is working, what is blocked, and what needs a decision.
        </p>

        <div class="bottom">
          <div class="panel">
            <h3>This Week</h3>
            <ul>
              <li>First contacts are happening, but they are not turning into registrations yet.</li>
              <li>The main pressure point is still outreach and signup, not engagement.</li>
              <li>The April 8 meeting is the main chance to tighten ownership and message flow.</li>
            </ul>
          </div>
          <div class="panel closing">
            <h3>When To Move Into Dashboards</h3>
            <p>Move into dashboards when most KPI reporting is system-generated and this brief starts repeating what the product already shows.</p>
          </div>
        </div>

        <div class="section-title">What We Learned</div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Area</th>
                <th>Observation</th>
                <th>Impact</th>
                <th>Next Step</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Outreach</td><td>Early contact is happening, but scale is still limited.</td><td>The top of funnel is moving slowly.</td><td>Finalize channel ownership and execution order.</td></tr>
              <tr><td>Registration</td><td>No one has converted yet.</td><td>The pilot still lacks first proof of conversion.</td><td>Tighten invite message and first signup path.</td></tr>
              <tr><td>Operations</td><td>Tracking needs weekly discipline.</td><td>Without cadence, the story gets stale fast.</td><td>Update counts, tracker, and decisions at each review.</td></tr>
            </tbody>
          </table>
        </div>

        <div class="section-title">Decisions Needed</div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Decision</th>
                <th>Why It Matters</th>
                <th>Owner</th>
                <th>Next Action</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Standard outreach script</td><td>Without one message, conversion testing stays noisy.</td><td>SWCA + VeeVee</td><td>Lock a wave-one script after April 8.</td></tr>
              <tr><td>Definition of activation</td><td>This determines what success means after signup.</td><td>VeeVee</td><td>Pick one clear first-value action.</td></tr>
              <tr><td>Dashboard handoff threshold</td><td>This decides when the brief stops being the main source.</td><td>VeeVee</td><td>Define what must be automated first.</td></tr>
              <tr><td>Weekly review owner</td><td>The brief needs one clear owner to stay current.</td><td>Michael / SWCA</td><td>Confirm who updates it each week.</td></tr>
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

      countdownCards.forEach((card) => {
        const target = new Date(card.getAttribute("data-countdown"));
        const valueNode = card.querySelector("[data-countdown-value]");

        if (!valueNode || Number.isNaN(target.getTime())) {
          return;
        }

        const diff = target.getTime() - now.getTime();
        const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
        valueNode.textContent = diff <= 0 ? "Live" : String(days);

        if (
          heroSoftLaunch &&
          card.getAttribute("data-countdown") === "2026-04-15T18:00:00-04:00"
        ) {
          heroSoftLaunch.textContent = diff <= 0 ? "Live" : String(days);
        }
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

    updateCountdowns();
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

