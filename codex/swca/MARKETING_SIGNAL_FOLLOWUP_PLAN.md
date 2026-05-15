# SWCA Marketing Signal Follow-Up Plan

## Objective

Capture clearer purchase-intent and care-interest signals after the user ranks wellness priorities, without making the first selection screen feel heavy.

The follow-up step should ask a small number of questions based on the user's top ranked concerns plus a small set of generic intent questions. Answers should be stored with the intake submission and later surfaced in admin/reporting without exposing unnecessary PII.

## Product Decision

- Keep the first `/swca/intake` screen focused on selecting and ranking concerns.
- Use the user's top 2 ranked concerns by default.
- Allow top 3 only if marketing explicitly wants the extra friction and the user selected at least 3 concerns.
- Ask follow-up questions after the user clicks submit and accepts consent, before final API submission and wheel redirect.
- Use structured single-select or multi-select answers by default. Avoid open text unless marketing specifically needs it.

## Phase 1: Editable Intake Question Config

Status: complete. The editable config lives at `src/swca/intakeForm/swca-intake-config.json`.

Tasks:

- Replace the hardcoded concern list in `src/swca/intakeForm/concerns.ts` with a JSON-backed config.
- Preserve current fields: `id`, `number`, `title`, and `description`.
- Add follow-up metadata per concern:
  - `followUpQuestions`
  - answer option ids
  - answer option labels
  - optional admin/report label
- Keep TypeScript types aligned with the JSON.

Acceptance criteria:

- The current 10 concern choices render with the same visible copy.
- Marketing can update concern follow-up questions in one JSON file.
- Build fails clearly if the JSON shape is invalid or missing required fields.
- Existing concern ids remain stable so historical reporting does not break.

## Phase 2: Concern-Specific Follow-Up Questions

Status: next.

Tasks:

- Draft 1-2 follow-up questions per concern category.
- Focus questions on actionable marketing/clinic signals:
  - biggest desired outcome
  - urgency
  - prior attempts
  - severity or frequency
  - what would make the user act
- Keep each answer set short, ideally 3-5 options.
- Avoid collecting unnecessary medical detail.

Acceptance criteria:

- Every concern has at least one follow-up question.
- Questions are understandable without staff explanation.
- Answer options are clear enough for reporting.
- No question asks for sensitive free-text medical history.
- Total follow-up workload stays short when top 2 concerns are used.

## Phase 3: Generic Intent Questions

Tasks:

- Add 1-2 generic questions that always appear after concern-specific follow-ups.
- Candidate topics:
  - interest in SWCA support
  - timeline to start
  - payment or insurance preference
  - willingness to hear about program pricing
- Keep answer values structured for reporting.

Acceptance criteria:

- Generic intent answers give marketing a clearer signal than concern selection alone.
- Questions do not imply guaranteed clinical service, insurance coverage, or specific price.
- Generic questions are stored separately from concern-specific answers.

## Phase 4: Follow-Up UI

Tasks:

- After the user clicks submit and consent is accepted, show a short follow-up modal or second-step panel before calling the intake API.
- Render questions for the top ranked concern ids.
- Render generic intent questions.
- Add back/cancel behavior that returns to ranking without losing selections.
- Add progress context such as `2 quick questions` or `Almost done`.
- Keep final submit disabled until required follow-up answers are complete.

Acceptance criteria:

- User cannot reach the wheel until required follow-up answers are completed.
- User can revise ranking before final submission.
- Follow-up UI is responsive and accessible by keyboard.
- Existing failed-submit handling still works.
- Honeypot still blocks automated submissions.
- No layout overlap on mobile or desktop.

## Phase 5: Intake Payload And Persistence

Tasks:

- Add `topRankedConcernIds`.
- Add `followUpAnswers` keyed by concern id and question id.
- Add `intentAnswers` keyed by question id.
- Validate the new fields in `aws/swca-intake/handler.mjs`.
- Store the new fields in the S3 intake JSON.
- Decide whether any summarized fields should also be copied to DynamoDB for admin report speed.

Acceptance criteria:

- S3 intake records contain selected concerns, rankings, top ranked concerns, follow-up answers, intent answers, and consent evidence.
- Invalid answer ids are rejected by the API.
- Existing reward eligibility creation still works.
- Existing historical records without follow-up answers do not break admin reporting.
- Backend errors do not expose raw payload details to the browser.

## Phase 6: Admin And Reporting

Tasks:

- Add top ranked concerns and intent answers to the admin report payload only as redacted/non-PII fields.
- Add optional CSV columns for:
  - top concern 1
  - top concern 2
  - key intent answer
  - payment or insurance preference
- Keep raw contact fields hidden.

Acceptance criteria:

- Management can see stronger lead signals without opening S3 manually.
- CSV export includes the new signal fields.
- Admin dashboard remains readable on desktop.
- No raw email, phone, or full sensitive intake notes appear in dashboard rows.
- Existing dashboard metrics continue to load for old and new submissions.

## Phase 7: Validation And Launch

Tasks:

- Run local build and tests.
- Run Lambda syntax check.
- Run CDK build/synth if backend changes are included.
- Deploy frontend and backend in the right order.
- Submit a live test with at least 3 selected concerns.
- Verify:
  - only top 2 or configured top N generate follow-ups
  - answers are stored in S3
  - reward flow still reaches wheel
  - admin/reporting handles the new fields

Acceptance criteria:

- Production `/swca/intake` captures follow-up answers and redirects to the reward wheel.
- S3 and admin/reporting show the expected structured signals.
- Existing teaser, wheel, reward contact, certificate, and funnel routes still work.
- Users who do not complete follow-ups do not create partial submissions.
- Mobile test can complete the full flow without confusing extra steps.
