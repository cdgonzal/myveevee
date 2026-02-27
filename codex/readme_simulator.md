# Wellness Mirror Plan

## Purpose
Build a new `Wellness Mirror` page that lets users run health/benefits "what-if" scenarios and understand how VeeVee makes decisions.

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
- [x] Add header/footer navigation links to Simulator where appropriate.
- [x] Define simulator input schema (profile, insurance, symptom, behavior, meds, labs, lifestyle).
- [x] Build scenario input form UI with validation and friendly defaults.
- [x] Create normalized twin-state model contract for UI state.
- [x] Build versioned pipeline interface (policy, guardrails, coverage constraints).
- [x] Implement deterministic rule pass (state updates + flags).
- [x] Implement reasoning pass (explanations + recommendation ranking).
- [x] Return structured outputs:
  - [x] twin-state updates
  - [x] risk/priority signals
  - [x] ranked recommended actions
  - [x] follow-up questions
  - [x] decision trace/audit log
- [x] Design "Under the hood" panel showing inputs -> rule hits -> outputs.
- [x] Add CTA flow from simulator to account creation / login.
- [x] Instrument analytics events (start sim, input change, run sim, CTA click).
- [x] Add safety messaging and non-diagnostic disclaimers where needed.
- [x] Add loading, error, and empty states.
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
- Header, mobile nav, and footer now include `Wellness Mirror®`.
- Input schema added: `src/simulator/schema.ts` with defaults and starter scenarios.
- Current Simulator UI includes starter scenario selection, editable form fields, and structured input preview under "Under The Hood".
- Simulation engine added: `src/simulator/engine.ts` with versioned pipeline metadata, deterministic scoring rules, ranking logic, and structured output contract.
- Simulator page now renders risk summary, twin-state updates, ranked actions, follow-up questions, and decision trace output.
- Analytics events added for page view, scenario start, input changes, simulation runs, and CTA clicks.
- UX states added for loading, errors, and empty output sections.
- Safety notice added to reinforce educational/non-diagnostic use.

## Next Up
- Add test coverage:
  - unit tests for rules and ranking
  - contract tests for pipeline output shape
  - UI tests for key simulator flows
- Add logging strategy for observability and auditability.
- Security/privacy pass (PII minimization, redaction in logs, retention rules).

## Open Questions (Keep Simple)
- [ ] Should simulator be public without login, or gated after first scenario?
- [ ] What is the single primary CTA after simulation: `Create account` or `Log in`?
- [ ] Do we show raw decision trace by default, or behind an "Advanced" toggle?
- [ ] Which 3-5 starter scenarios should we pre-load for first-time users?
