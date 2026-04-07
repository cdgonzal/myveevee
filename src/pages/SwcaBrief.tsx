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
            <h3>Readout</h3>
            <ul>
              <li>Timeline is set and the pilot is still in setup.</li>
              <li>The funnel is moving at contact, but not yet at registration.</li>
              <li>This week matters because first registrations should start before soft launch.</li>
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
          Prove that SWCA can turn a targeted patient list into registrations, activation, and early engagement without adding avoidable staff burden.
        </p>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Measure</th>
                <th>Baseline</th>
                <th>Current</th>
                <th>Target</th>
                <th>Why It Matters</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Patients identified</td><td>25 in first wave</td><td>25</td><td>25</td><td>Confirms the starting cohort and outreach scope</td></tr>
              <tr><td>Patients reached</td><td>Not tracked before pilot</td><td>4</td><td>20+</td><td>Shows whether contact data and outreach are working</td></tr>
              <tr><td>Registrations</td><td>No VeeVee registrations yet</td><td>0</td><td>12-15</td><td>This is the first hard proof of conversion</td></tr>
              <tr><td>Activated patients</td><td>No activation baseline yet</td><td>0</td><td>8-10</td><td>Shows whether the product gets patients to first value</td></tr>
              <tr><td>7-day engaged patients</td><td>No engagement baseline yet</td><td>0</td><td>6+</td><td>Shows whether use continues beyond signup</td></tr>
              <tr><td>Staff touches per registration</td><td>Unknown today</td><td>Not yet tracked</td><td>Trend down over time</td><td>Tests whether this scales without extra staff drag</td></tr>
            </tbody>
          </table>
        </div>

        <div class="section-title">Pilot Success</div>
        <p class="section-copy">
          What has to be true for this pilot to count as a win.
        </p>

        <div class="cards">
          <div class="card">
            <h3>By Soft Launch</h3>
            <p>Show the motion works.</p>
            <ul>
              <li>Outreach ownership and scripts are locked</li>
              <li>Most of the first-wave cohort has been reached</li>
              <li>First registrations have started</li>
              <li>Activation definition is set and measurable</li>
            </ul>
          </div>
          <div class="card">
            <h3>By Day 60</h3>
            <p>Show early value.</p>
            <ul>
              <li>Registration and activation are both moving</li>
              <li>7-day engagement is visible for early users</li>
              <li>First workflow pain points are known</li>
              <li>Staff effort per registration is being tracked</li>
            </ul>
          </div>
          <div class="card">
            <h3>By Day 90</h3>
            <p>Make the next decision.</p>
            <ul>
              <li>Targets are compared against actual results</li>
              <li>ROI has enough data for leadership review</li>
              <li>Dashboard handoff is clear for system-generated metrics</li>
              <li>SWCA chooses expand, adjust, or stop</li>
            </ul>
          </div>
          <div class="card closing">
            <h3>Reset Trigger</h3>
            <p>Do not wait until Day 90 if the top of funnel never converts.</p>
            <ul>
              <li>If registration remains flat after first outreach wave, rewrite the handoff</li>
              <li>If activation is weak, tighten the first-use flow before scaling</li>
              <li>If staff burden climbs, simplify workflow before expanding</li>
            </ul>
          </div>
        </div>

        <div class="section-title">Ownership</div>
        <p class="section-copy">
          Leadership should be able to see who owns each move.
        </p>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Area</th>
                <th>Owner</th>
                <th>Support</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Patient list and contact readiness</td><td>SWCA</td><td>Michael</td><td>In progress</td></tr>
              <tr><td>Outreach script and sequence</td><td>Michael + SWCA</td><td>VeeVee</td><td>Decision needed</td></tr>
              <tr><td>Registration handoff</td><td>SWCA</td><td>VeeVee</td><td>Not proven yet</td></tr>
              <tr><td>Activation definition and reporting</td><td>VeeVee</td><td>Michael</td><td>In progress</td></tr>
              <tr><td>Weekly KPI update</td><td>Michael</td><td>VeeVee</td><td>Needs cadence</td></tr>
              <tr><td>Go / no-go recommendation</td><td>SWCA leadership</td><td>Michael + VeeVee</td><td>Day 90 decision</td></tr>
            </tbody>
          </table>
        </div>

        <div class="section-title">Workflow Impact</div>
        <p class="section-copy">
          This has to help operations, not create extra chasing.
        </p>

        <div class="cards">
          <div class="card">
            <h3>Today</h3>
            <ul>
              <li>SWCA identifies who should be contacted</li>
              <li>Staff manually reach out and explain next steps</li>
              <li>Follow-up depends on consistency and time available</li>
            </ul>
          </div>
          <div class="card">
            <h3>With VeeVee</h3>
            <ul>
              <li>Patients get a clearer path into registration</li>
              <li>First-use guidance is more consistent</li>
              <li>Follow-up can shift from ad hoc to structured</li>
            </ul>
          </div>
          <div class="card">
            <h3>What Should Improve</h3>
            <ul>
              <li>Fewer manual touches per successful registration</li>
              <li>Faster movement from outreach to first use</li>
              <li>Better visibility into who is stuck and why</li>
            </ul>
          </div>
          <div class="card closing">
            <h3>Where It Can Fail</h3>
            <ul>
              <li>Contact details are wrong</li>
              <li>Message framing is weak</li>
              <li>Registration handoff is unclear</li>
              <li>Patients do not see value after signup</li>
            </ul>
          </div>
        </div>

        <div class="section-title">Patient Value</div>
        <p class="section-copy">
          This should read like patient benefit, not product features.
        </p>

        <div class="cards">
          <div class="card">
            <h3>Why This Helps Patients</h3>
            <ul>
              <li>Easier start into the program</li>
              <li>Clearer next steps after registration</li>
              <li>Less confusion between touchpoints</li>
              <li>Better follow-through in the first 30 days</li>
            </ul>
          </div>
          <div class="card">
            <h3>Why This Helps SWCA</h3>
            <ul>
              <li>Less manual chasing</li>
              <li>Better visibility into who is moving or stalled</li>
              <li>More consistent follow-up</li>
              <li>Stronger proof before broader rollout</li>
            </ul>
          </div>
          <div class="card">
            <h3>Clinical Fit</h3>
            <ul>
              <li>Supports patient onboarding and follow-through</li>
              <li>Improves continuity between staff touchpoints</li>
              <li>Does not replace clinician judgment or urgent follow-up</li>
            </ul>
          </div>
          <div class="card closing">
            <h3>What Patients Get First</h3>
            <ul>
              <li>Simple registration</li>
              <li>Guided onboarding</li>
              <li>Check-ins and reminders</li>
              <li>Clear next-step guidance</li>
            </ul>
          </div>
        </div>

        <div class="section-title">ROI</div>
        <p class="section-copy">
          This needs to support a business decision, not just show activity.
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
              <tr><td>Outreach to registration conversion</td><td>Not yet measured</td><td>0%</td><td>50%+</td><td>Shows whether the outreach and handoff are worth scaling</td></tr>
              <tr><td>Registration to activation conversion</td><td>Not yet measured</td><td>0%</td><td>70%+</td><td>Shows whether patients reach first value fast enough</td></tr>
              <tr><td>Average staff touches per registration</td><td>Unknown</td><td>Not yet tracked</td><td>Declining trend</td><td>Tests whether labor burden goes down, not up</td></tr>
              <tr><td>Time from first outreach to registration</td><td>Unknown</td><td>Not yet tracked</td><td>Under 7 days</td><td>Shows whether the process is simple enough to move quickly</td></tr>
              <tr><td>7-day patient engagement</td><td>No pilot baseline</td><td>0%</td><td>65%+</td><td>Shows whether value continues after signup</td></tr>
              <tr><td>Estimated cost per enrolled patient</td><td>Unknown</td><td>Not yet tracked</td><td>Visible by Day 90</td><td>Supports the leadership decision on expansion</td></tr>
            </tbody>
          </table>
        </div>

        <div class="section-title">Decision Points</div>
        <p class="section-copy">
          Leadership should know when to expand, adjust, or stop.
        </p>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Decision Point</th>
                <th>Trigger Date</th>
                <th>Owner</th>
                <th>Action If Missed</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>First registrations should appear</td><td>By April 15, 2026</td><td>Michael + SWCA</td><td>Rewrite outreach framing and tighten registration handoff</td></tr>
              <tr><td>Activation should be measurable</td><td>By Day 60</td><td>VeeVee</td><td>Simplify first-use flow and redefine first value</td></tr>
              <tr><td>ROI review should be credible</td><td>By Day 90</td><td>SWCA leadership</td><td>Hold expansion and keep pilot in adjustment mode</td></tr>
              <tr><td>Dashboard handoff should be clear</td><td>By broader rollout</td><td>VeeVee</td><td>Keep the brief as the source until system reporting is ready</td></tr>
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
            <h3>Top Risks</h3>
            <ul>
              <li>Contact details may be incomplete or outdated.</li>
              <li>Patients may not understand why they should register now.</li>
              <li>The registration handoff may still rely too much on staff follow-up.</li>
            </ul>
          </div>
          <div class="panel closing">
            <h3>Assumptions</h3>
            <p>This pilot assumes the first-wave list is valid, outreach ownership is consistent, and patient value is clear enough to drive first-use behavior.</p>
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
              <tr><td>Outreach</td><td>Early contact is happening, but scale is still limited.</td><td>Reach is not yet high enough to judge conversion.</td><td>Finalize channel ownership and execution order.</td></tr>
              <tr><td>Registration</td><td>No one has converted yet.</td><td>The pilot still lacks first proof that the handoff works.</td><td>Tighten invite message and first signup path.</td></tr>
              <tr><td>Operations</td><td>Tracking needs weekly discipline.</td><td>Without cadence, leadership loses trust in the readout.</td><td>Update counts, tracker, and decisions at each review.</td></tr>
              <tr><td>Clinical fit</td><td>The brief needs to stay clear about what VeeVee supports.</td><td>Doctors will want patient value, not only activity metrics.</td><td>Keep patient outcome language visible in the brief.</td></tr>
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
              <tr><td>Definition of activation</td><td>This sets what counts as first value after signup.</td><td>VeeVee</td><td>Pick one clear first-value action.</td></tr>
              <tr><td>Weekly review owner</td><td>The brief needs one clear owner to stay current.</td><td>Michael / SWCA</td><td>Confirm who updates counts and risks each week.</td></tr>
              <tr><td>Expansion threshold</td><td>Leadership needs a clear rule before broader rollout.</td><td>SWCA leadership</td><td>Set the minimum result needed by Day 90.</td></tr>
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

