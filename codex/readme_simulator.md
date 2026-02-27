# Simulator Page Plan

## Purpose
Build a new `Simulator` page that lets users run health/benefits "what-if" scenarios and understand how VeeVee makes decisions.

## Product Definition
VeeVee's simulator scenario explorer is an event-driven what-if engine that:
- takes user inputs (profile, insurance, symptoms, behavior changes, medication, labs, lifestyle events),
- applies them to a normalized Digital Twin state model,
- runs deterministic rules plus reasoning,
- outputs predicted state deltas, risk/priority signals, and ranked recommendations.

The engine should run through a versioned pipeline with policy, clinical guardrails, and coverage constraints, and return structured outputs with full decision-step traceability.

## Core Goals
- Let users simulate realistic health/benefits scenarios before account creation.
- Show a clear "look under the hood" of captured data, reasoning steps, and recommendation logic.

## Checklist
- [x] Create `Simulator` route and page scaffold (`/simulator`).
- [ ] Add header/footer navigation links to Simulator where appropriate.
- [x] Define simulator input schema (profile, insurance, symptom, behavior, meds, labs, lifestyle).
- [x] Build scenario input form UI with validation and friendly defaults.
- [ ] Create normalized twin-state model contract for UI state.
- [ ] Build versioned pipeline interface (policy, guardrails, coverage constraints).
- [ ] Implement deterministic rule pass (state updates + flags).
- [ ] Implement reasoning pass (explanations + recommendation ranking).
- [ ] Return structured outputs:
  - [ ] twin-state updates
  - [ ] risk/priority signals
  - [ ] ranked recommended actions
  - [ ] follow-up questions
  - [ ] decision trace/audit log
- [x] Design "Under the hood" panel showing inputs -> rule hits -> outputs.
- [x] Add CTA flow from simulator to account creation / login.
- [ ] Instrument analytics events (start sim, input change, run sim, CTA click).
- [ ] Add safety messaging and non-diagnostic disclaimers where needed.
- [ ] Add loading, error, and empty states.
- [ ] Add test coverage:
  - [ ] unit tests for rules and ranking
  - [ ] contract tests for pipeline output shape
  - [ ] UI tests for key simulator flows
- [ ] Add logging strategy for observability and auditability.
- [ ] Security/privacy pass (PII minimization, redaction in logs, retention rules).
- [ ] Accessibility pass (keyboard flow, labels, contrast, screen-reader order).
- [ ] Performance pass (bundle split, lazy load simulator modules, optimize payloads).
- [ ] Final UX/content review with product + marketing.

## Progress Notes
- Route created: `src/pages/Simulator.tsx` wired at `/simulator`.
- Input schema added: `src/simulator/schema.ts` with defaults and starter scenarios.
- Current Simulator UI includes starter scenario selection, editable form fields, and structured input preview under "Under The Hood".

## Open Questions (Keep Simple)
- [ ] Should simulator be public without login, or gated after first scenario?
- [ ] What is the single primary CTA after simulation: `Create account` or `Log in`?
- [ ] Do we show raw decision trace by default, or behind an "Advanced" toggle?
- [ ] Which 3-5 starter scenarios should we pre-load for first-time users?
