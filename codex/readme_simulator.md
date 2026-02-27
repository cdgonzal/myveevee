# Wellness Mirror Technical Reference

## Overview
`Wellness Mirror®` is a scenario simulator that takes structured health/benefits inputs, runs a deterministic + reasoning engine, and returns traceable outputs for user exploration.

Primary implementation files:
- UI page: `src/pages/Simulator.tsx:40`
- Input schema + starter scenarios: `src/simulator/schema.ts:4`
- Simulation engine + output contract: `src/simulator/engine.ts:26`
- Audit logging + privacy redaction: `src/simulator/logging.ts:4`

## Routing And Navigation Integration
The simulator is wired as a first-class route and appears in both header and footer navigation.

- Route path definition: `src/config/links.ts:6`
- Route registration: `src/App.tsx:69`
- Lazy-loaded page chunk: `src/App.tsx:30`
- Header nav link (desktop): `src/App.tsx:136`
- Header nav link (mobile drawer): `src/App.tsx:190`
- Footer nav link: `src/App.tsx:238`

## UI Composition (Simulator Page)
The page is a structured, section-based workflow:

- Page shell + accessible region label: `src/pages/Simulator.tsx:124`
- Intro badge/title/summary copy: `src/pages/Simulator.tsx:134`
- Input/Output capability summary cards: `src/pages/Simulator.tsx:145`
- Starter scenario picker: `src/pages/Simulator.tsx:175`
- Main scenario form section: `src/pages/Simulator.tsx:200`
- Run button + loading state: `src/pages/Simulator.tsx:332`
- Error alert state: `src/pages/Simulator.tsx:347`
- Risk summary panel: `src/pages/Simulator.tsx:358`
- Twin-state deltas panel: `src/pages/Simulator.tsx:378`
- Ranked recommendations panel: `src/pages/Simulator.tsx:397`
- Follow-up questions panel: `src/pages/Simulator.tsx:418`
- “Under The Hood” input + decision trace rendering: `src/pages/Simulator.tsx:430`
- Safety messaging: `src/pages/Simulator.tsx:450`
- Audit/redaction status messaging: `src/pages/Simulator.tsx:457`

## Input Data Contract
All simulator inputs are strongly typed and normalized in a single model:

- Root input contract: `src/simulator/schema.ts:4`
- Severity/plan types: `src/simulator/schema.ts:1`
- Default baseline input: `src/simulator/schema.ts:46`
- Starter scenario set: `src/simulator/schema.ts:81`

Covered input domains:
- Profile
- Insurance
- Symptom
- Behavior change
- Medication
- Labs
- Lifestyle event

## Simulation Engine Design
The core engine computes score, prioritization, recommendations, and traceability in one call.

- Engine entry point: `src/simulator/engine.ts:47`
- Output contract (`SimulationResult`): `src/simulator/engine.ts:26`
- Risk normalization helper: `src/simulator/engine.ts:40`

Rule domains implemented:
- Symptom severity and duration rules: `src/simulator/engine.ts:61`
- Medication adherence rules: `src/simulator/engine.ts:115`
- Sleep behavior rule: `src/simulator/engine.ts:139`
- Lab guardrails (A1c, BP): `src/simulator/engine.ts:155`
- Chronic condition and PCP coverage routing: `src/simulator/engine.ts:190`

Recommendation logic:
- Base care recommendation: `src/simulator/engine.ts:213`
- Coverage navigation recommendation: `src/simulator/engine.ts:221`
- Adherence and sleep recommendations: `src/simulator/engine.ts:231`
- Priority sort: `src/simulator/engine.ts:251`

Traceability:
- Trace event model: `src/simulator/engine.ts:19`
- Ingest/policy/guardrail/coverage/reasoning/output trace writes: `src/simulator/engine.ts:54`
- Versioned pipeline metadata in output: `src/simulator/engine.ts:273`

## Runtime Flow In The Page
The page orchestrates state and runs the engine with controlled telemetry:

- Draft vs simulated input state: `src/pages/Simulator.tsx:54`
- Result state initialization from engine: `src/pages/Simulator.tsx:56`
- Analytics wrapper: `src/pages/Simulator.tsx:75`
- Input analytics throttling (800ms): `src/pages/Simulator.tsx:82`
- Async simulation execution path: `src/pages/Simulator.tsx:90`
- Scenario selection trigger: `src/pages/Simulator.tsx:115`
- Manual run trigger from button: `src/pages/Simulator.tsx:337`

## Analytics Events
Current events emitted via `window.gtag`:

- Page view: `wm_view` at `src/pages/Simulator.tsx:112`
- Scenario selected: `wm_start_scenario` at `src/pages/Simulator.tsx:119`
- Input changed: `wm_input_change` at `src/pages/Simulator.tsx:87`
- Simulation success: `wm_run_simulation` at `src/pages/Simulator.tsx:102`
- Simulation error: `wm_run_simulation_error` at `src/pages/Simulator.tsx:105`
- CTA clicks: `wm_cta_click` at `src/pages/Simulator.tsx:472` and `src/pages/Simulator.tsx:485`

## Audit Logging And Privacy Model
Audit records are intentionally summary-only and redact free text by design.

- Audit record contract: `src/simulator/logging.ts:4`
- Redaction marker (`freeTextRedacted: true`): `src/simulator/logging.ts:60`
- Record creation helper: `src/simulator/logging.ts:39`
- Session storage persistence: `src/simulator/logging.ts:73`
- Retention limit (last 25): `src/simulator/logging.ts:33`
- Storage key: `src/simulator/logging.ts:32`

Page integration:
- Audit record creation on successful run: `src/pages/Simulator.tsx:99`
- Persist call: `src/pages/Simulator.tsx:100`
- Latest run id surfaced in UI: `src/pages/Simulator.tsx:101`

## Accessibility And UX Safeguards
Implemented accessibility details:

- Labeled main region: `src/pages/Simulator.tsx:130`
- Section landmark + heading linkage: `src/pages/Simulator.tsx:200`
- Explicit label/input `htmlFor` + `id` wiring: `src/pages/Simulator.tsx:206`, `src/pages/Simulator.tsx:221`, `src/pages/Simulator.tsx:236`, `src/pages/Simulator.tsx:255`, `src/pages/Simulator.tsx:273`, `src/pages/Simulator.tsx:295`, `src/pages/Simulator.tsx:317`
- Helper text for numeric adherence constraints: `src/pages/Simulator.tsx:291`
- Error alert semantics (`role=alert`): `src/pages/Simulator.tsx:348`
- Status alert semantics (`role=status`): `src/pages/Simulator.tsx:457`
- Loading button polite live updates: `src/pages/Simulator.tsx:336`

## Performance Notes
Performance-oriented choices currently in place:

- Route-level lazy loading: `src/App.tsx:30`
- Manual chunking of major libraries: `vite.config.ts:16`
- Memoized large JSON rendering blocks: `src/pages/Simulator.tsx:72`
- Throttled input analytics events: `src/pages/Simulator.tsx:85`

## Test Coverage
Testing is enabled with Vitest + Testing Library.

Test toolchain:
- Scripts: `package.json:12`
- Vitest config: `vite.config.ts:7`
- JSDOM setup file: `src/test/setup.ts:1`

Engine tests:
- Structured contract test: `src/simulator/engine.test.ts:6`
- PCP recommendation behavior test: `src/simulator/engine.test.ts:22`
- Recommendation sort order test: `src/simulator/engine.test.ts:35`

UI tests:
- Render sanity test: `src/pages/Simulator.test.tsx:24`
- Run simulation interaction test: `src/pages/Simulator.test.tsx:31`
- Router future flags for test warnings compatibility: `src/pages/Simulator.test.tsx:12`

## Current State Summary
Wellness Mirror is implemented as a production-grade preview flow with:
- typed inputs,
- deterministic + reasoned simulation outputs,
- traceable decision history,
- event instrumentation,
- redacted audit logging,
- accessibility semantics,
- route-level code splitting,
- and automated test coverage.
