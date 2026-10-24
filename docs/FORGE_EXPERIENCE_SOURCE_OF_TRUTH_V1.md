# Forge Academia — Product and Implementation Contract (V1)

Status: authoritative intended behaviour for implementation and QA. This document describes what the product must do; the existence of a route or component is not proof that the behaviour is complete.

## Non-negotiable product promise

Forge is a guided engineering workshop: **Learn → Practice → Build → Verify → Explain**. It should help a learner understand a concept, reason about behaviour, apply/debug it, build a project, verify the result, and explain the trade-offs in an interview.

Do not add UI merely because a component is available. Every screen must answer:
1. What is the learner trying to accomplish here?
2. What is the one primary action?
3. What evidence shows the action worked?
4. What is the next sensible action?
5. What state must be preserved if the learner leaves?

Use the existing Creative Atelier visual system. Calm, readable, useful beats decorative density. One main thought per lesson step. No invented progress, fake controls, placeholder actions, or claims of verification without an actual check.

## Critical current-code findings

These are code-level findings from the inspected main-branch files, not claims that every runtime state was browser-tested.

1. **Forge Buddy is still permanently present in the lesson layout.** `src/components/lesson/v2/lesson-experience.tsx` renders `ForgeBuddyLessonCompanion` after `ActivityStage` for every activity. `src/components/lesson/v2/forge-buddy-lesson-companion.tsx` renders a default collapsed “Ask Forge Buddy · Open Coach” pill whenever it is not expanded. This still creates a constant companion UI. Remove the default pill entirely. The companion must return `null` unless a qualifying event fires or the learner explicitly requests help.
2. **The companion can open for ordinary successful interactive checks.** Its event condition includes `isInteractive && isCompleted`. That is too broad: a correct answer should show the activity's own concise feedback; Buddy should appear only for meaningful milestones, a misconception/wrong answer, a requested hint/help, or a deliberately defined milestone celebration. Do not show a second copy of the activity feedback.
3. **The completion screen is overbuilt and overclaims.** `src/components/lesson/v2/closure-surface.tsx` includes a large hero, check statistics, confidence signal, capabilities list, interview check, and multiple action bridges. It defaults to “Lesson Verified • Capability Evidence Recorded” and can describe mastery even when the lesson did not verify a capability. Compact this screen and use evidence-accurate language.
4. **The dashboard's capability count can double-count different kinds of things.** `src/components/atelier/studio-desk-hero.tsx` adds `completedCount`, verified project task count, and capability record count into `totalVerifiedCapabilities`. These are different units and may overlap. Do not sum lessons, tasks, and capabilities as if they were one count. Show separate, clearly labelled counts, or compute distinct capability IDs from a normalized evidence model.
5. **Evidence currently uses browser localStorage.** `src/lib/learning-engine/evidence-store.ts` persists lesson session lookup, verified tasks, and capability records in localStorage. This is suitable only for local/device persistence. Do not promise cross-device or account-wide resume unless a server-backed store is implemented. Make persistence limitations explicit until then.
6. **Project verification needs conservative semantics.** `src/lib/learning-engine/project-verifier.ts` derives assertions heuristically from task titles/descriptions/hints and uses keyword fallbacks. A keyword or substring signal is not proof that a behaviour works. Show the actual checks and their limits; do not call a milestone verified unless every required task-specific check passes. Unknown/unverifiable criteria must be “Not checked”, not pass.
7. **Project task completion and verified completion are separate.** `src/routes/projects.$projectId.tsx` calculates overall task progress from self-reported checkboxes OR verified tasks. Keep this useful as activity progress, but never label it “verified” or “fully completed” unless the verification rule is satisfied.
8. **Interview hub duplicates entry points and has metadata fallback issues.** `src/routes/interview.tsx` has a hero, mode cards, a mock-loop configurator, and topic launch buttons. Use the three modes as the primary router; show only the selected mode's workspace. Topic metadata falls back to generic descriptions, and displaying the first two question difficulties can create duplicate difficulty badges. Derive counts and badges from data; do not hardcode conflicting counts.
9. **Interview code execution may be a demonstration, not evaluation.** `src/routes/interview.session.tsx` has a candidate-code runner path with a fallback snippet that logs a message. Never present console output from that fallback as solution verification. Clearly distinguish “ran code”, “passed test cases”, “self-assessed”, and “rubric feedback”.
10. **Progress and mastery use multiple data models.** `src/routes/progress.tsx`, `src/routes/mastery.tsx`, `src/routes/analytics.tsx`, `src/routes/achievements.tsx`, and `src/routes/certificates.tsx` draw from different progress/mastery/evidence sources. Treat their claims as untrusted until they are reconciled and tested against the same learner scenarios.
11. **The Playground has substantial infrastructure but must prove its interaction loop.** `src/routes/playground.tsx` integrates editor, compiler, preview, console, validation, project context, and persisted workspace helpers. Each mode must open the correct workspace and run/preview/check actions must be functional, visibly report errors, and preserve the current work. Do not replace a broken action with a toast that implies success.
12. **Navigation is split between global and standalone layouts.** `src/routes/__root.tsx` deliberately uses a different layout for lesson, landing, and dashboard routes. Confirm Interviews, Projects, Playground, and Learn are discoverable and the active route is visibly indicated on all non-lesson screens; lesson navigation should remain focused and provide a clear Exit route.

## Global interaction contract

- Every visible control must perform its labelled action. No dead buttons, decorative controls that look actionable, or routes that only render a mockup.
- Each action must have loading, success, empty, and failure states where applicable.
- Keep the learner's work when moving between a lesson, project, Playground, and interview.
- A page must never fabricate mastery, test results, question counts, session duration, or progress.
- All primary actions must work with keyboard and touch; use visible focus, labels, reduced-motion support, and accessible status announcements.
- Use one source of truth for domain/question counts and topic metadata.
- Avoid repeating the same feedback in the activity card, a separate result card, and Forge Buddy. One event should have one primary feedback presentation.
- Do not call something AI-powered unless a real model request is wired, handles errors, and has a transparent fallback. A deterministic rubric must be labelled rubric feedback, not AI feedback.
- Do not show an always-on mascot, coach bar, audio narration, or IDE in ordinary lessons.
- Do not auto-open Buddy during a timed interview.

## 1. Dashboard — `src/routes/dashboard.tsx`, `src/components/atelier/studio-desk-hero.tsx`

Purpose: tell the learner what to do next, why, and how to resume. It is not a directory of every feature.

Required hierarchy:
1. **Your Next Step** — one recommendation with reason, expected effort, and one primary CTA. Destination must be valid and reflect the learner's state.
2. **Continue** — resume the exact lesson step, or the exact project/milestone/workspace, whichever is most relevant. Show last saved status.
3. **Evidence snapshot** — separate counts for completed lessons, verified project tasks, demonstrated capabilities, and items needing review. Never add these units together.
4. **Learning path** — modules/lessons with prerequisites, current location, completion, and relevant project/interview links.
5. **Secondary discovery** — projects, due reviews, challenges, interviews. These must not visually compete with the primary next step.

First-time learner: offer an optional goal/diagnostic, explain what it does, allow skip, and then give a concrete starter lesson. Do not leave the learner with only a diagnostic modal or empty stats.
Returning learner: resume useful work. If evidence shows a specific weakness, offer a short review and explain why; do not discard saved work or force a reset.
If no valid recommendation exists, offer a safe fallback to the first available incomplete lesson with an honest reason.

Acceptance tests: brand-new user; user mid-lesson; active project; lesson complete but weak quiz evidence; project self-reported but unverified; all curriculum completed; malformed/missing saved state.

## 2. Lesson player — `src/components/lesson/v2/lesson-experience.tsx`, `lesson-shell.tsx`, `activity-stage.tsx`, `forge-buddy-lesson-companion.tsx`, `closure-surface.tsx`, canonical renderers and lesson data

### Default screen
- Header row: Exit; readable lesson title; secondary menu for outline/bookmark/notes.
- Progress row: accurate step count/progress.
- Main area: one activity, its instruction/content, and its own answer/input.
- Footer: exactly one primary action whose label reflects the state: Continue, Check answer, Try again, or Finish lesson. Secondary navigation must not compete.
- No narration/audio player.
- No permanent Forge Buddy pill/card.
- No code editor in an ordinary lesson. Only show the Playground/editor when a project/capstone or explicit coding task requires it.
- No compulsory “Set the scene” step. Intro/orientation is optional and only shown when it adds distinct information.

### Flexible pedagogical sequence
Use only the steps the concept needs:
1. Understand — concise explanation and one mental model.
2. Explore — prepared snippet, animation, diagram, or purpose-built visual model.
3. Predict — learner makes a prediction before revealing the result.
4. Try — one focused question or interaction.
5. Feedback — correct/incorrect and why, shown once in the activity itself.
6. Confirm — short transfer question only if it adds evidence.
7. Continue — one clear next action.

Do not force every lesson into seven screens. Do not introduce unexplained jargon in questions, examples, interview checks, or feedback. Each activity's content must declare what was taught and what prerequisite concepts it assumes.

### Feedback rendering
For a submitted answer, render one inline result in the activity:
- Correct: short confirmation plus reason.
- Incorrect: what was incorrect, the misconception, and one actionable clue or retry.
- Unanswered/invalid: clear validation message.
Do not repeat the exact same paragraph in a top alert, a “You chose / Result” card, and Buddy. Capability recording must happen independently of the visual feedback component so removing duplicate UI does not remove evidence recording.
The primary footer action should become “Continue” or “Try again” according to the evaluation result. Do not add a second next action for the same destination.

### Forge Buddy — event-driven only
Remove the default pill. In `lesson-experience.tsx`, mount Buddy only when the event policy says there is something useful to say; otherwise render nothing.
Allowed triggers:
- Learner answers incorrectly or a meaningful misconception is detected.
- Learner explicitly asks for a hint/coach.
- Learner has requested a hint and needs a targeted follow-up.
- A meaningful, explicitly defined milestone is verified (e.g. completion of a multi-step project milestone, not every ordinary correct quiz answer).
- A learner returns after a substantial break and opts into a welcome/reorientation, if implemented.
Never trigger on every step, ordinary correct answers, a timer tick, a page render, or during a timed interview.
When triggered: show a small contextual speech bubble with one short message and optional one action. It must not duplicate the activity's feedback. The learner can dismiss it; it stays dismissed for the same event and must not reopen because an unrelated state rerender occurred. Do not keep an empty pill after dismissal. Rate-limit repetitive triggers.
Examples:
- Wrong answer: “Not quite. Trace what the browser sends first; which part is the request?”
- Hint requested: one clue that does not immediately give away the answer.
- Verified milestone: brief celebration, only after actual verification.
- Repeated misconception: identify the exact misunderstanding and link to a relevant explanation.
No forced jokes, tabs for jokes/traps/analogy on every screen, or permanent mascot card. Buddy is not the assessor and does not certify mastery.

### Completion screen
Replace the long marketing-style completion card with:
- “Lesson complete” (not “mastered” unless mastery criteria are actually met).
- One-sentence takeaway.
- A compact list of checks passed / items to review; only show numbers if actually recorded.
- One primary CTA: next lesson or recommended review.
- One secondary action: return to module.
- Optional restart in a low-emphasis menu.
Remove the always-present interview-check block unless the lesson has a mapped, taught, age/level-appropriate transfer question. That question must use concepts taught in this lesson or explicitly listed prerequisites. Do not inject unrelated DNS/DOM/CSSOM concepts into an introductory browser-request lesson.
Do not claim “first-try precision” or “mastered cleanly” just because no flagged steps were supplied; unknown evidence is not positive evidence.
On the final step, there must be one Next action, not an in-card Next Step plus a sticky Next Lesson button.

### Resume and accessibility
Persist current activity index, responses, attempts, hints, validation result, and update time. Restore the exact useful step after refresh/back navigation. Ensure old or invalid saved sessions fall back safely. Use one scroll container, reset scroll when changing activity, avoid nested competing sticky actions, and test at 320px, 375px, 768px, and desktop widths.

## 3. Learn, modules, topics, paths — `src/routes/learn.index.tsx`, `learn.modules.index.tsx`, `learn.modules.$moduleId.tsx`, `learn.topics.index.tsx`, `learn.topics.$topicId.tsx`, `learn.paths.tsx`, `lesson.$lessonId.tsx`

Purpose: explain the learning sequence and help learners navigate prerequisites without overwhelming them.

- A module has an outcome, why it matters, prerequisites, lessons, practice, related project milestone, and interview connection.
- Show two distinct measures: activity completion and demonstrated capability evidence. Do not derive capability mastery solely from lesson completion.
- Every lesson card says what the learner will learn, its status, duration when known, and Resume/Start/Review.
- Keep one canonical lesson route/rendering path. The `lesson.$lessonId.tsx` route's V1/fallback selection must not produce different player behaviour for equivalent lessons.
- Unlocking: if prerequisites are required, explain them and link to the missing prerequisite; do not silently block or send the learner to an unrelated route.
- A module completion CTA should route to a real quiz/practice/project or next module, not a decorative card.
- Topic and path pages should show progress and a concrete next action. Path eligibility and certificate criteria must agree.

## 4. Playground — `src/routes/playground.tsx`, `src/lib/stores/use-playground-store.ts`, `src/lib/playground-compiler.ts`, `src/lib/compiler/validation-client.ts`, `src/lib/learning-engine/project-verifier.ts`

Purpose: real in-browser build-and-test workspace, not a static mockup.

### Required workspace
- Context strip: lesson/project name, current task/milestone, intended result, and exit/return link.
- File tree and editor with selected file clearly visible.
- Primary Run/Preview action, visible running state, preview, console/errors.
- For tasks with tests: “Check work” action and criteria-by-criteria pass/fail/not-checked results.
- Helpful errors with location and suggested next action.
- Save status and restore after route changes/reload.
- Hints are progressive and optional; a solution reveal is secondary and does not mark work verified.

### Functional contract
- Clicking Run compiles/renders the current saved editor contents, not stale starter files.
- Runtime/compiler errors are shown as failures, never success.
- Changing code invalidates the previous validation report.
- Validation is tied to the exact workspace revision. If code changes after a passing run, previous checks are stale and cannot verify the new revision.
- A project milestone opens the correct project, milestone, files, and task. Query parameters must be validated; invalid IDs show a recoverable error, not silently switch to the first milestone.
- Save workspace identity, file contents, active file, tabs, runtime, active milestone, and last check report. If persistence is local-only, say so.
- Never mark unrelated tasks verified from one passing check. Never mark a task verified if no meaningful assertion exists. Label heuristic checks as “basic structural check”, not full functional proof.
- The learner can return to the project brief without losing code.
- Lesson inline sandbox mode is separate from full project workspace and must not unexpectedly replace the user's project.

### Must test
HTML/CSS/JS preview; compile/runtime failure; no entry file; empty workspace; add/rename/delete file; reload; project/milestone deep link; passing and failing assertions; code edit after pass; offline/storage failure.

## 5. Projects and capstones — `src/routes/projects.index.tsx`, `src/routes/projects.$projectId.tsx`

Project listing cards show: deliverable/preview, skills practised, prerequisites, expected effort, status, Start/Continue. Avoid generic marketing descriptions without a concrete outcome.

Project detail:
- Clear deliverable and acceptance criteria.
- Milestones ordered by prerequisites; one active milestone highlighted.
- Each milestone has a goal, why it matters, files to edit, expected behaviour, task-specific checks, hints, and a “Build this milestone” CTA.
- Checklist checkboxes mean self-reported only. Label that honestly.
- “Verify milestone” launches/uses the Playground's actual criteria runner and displays each result. It cannot mark all tasks verified merely because the button was clicked.
- A failed check links to the relevant file/criterion and keeps the learner in the same milestone.
- Mark milestone complete only when its declared verification policy passes; if a criterion cannot be automated, request a separate review/reflection and label it accurately.
- Capstone portfolio summary: problem, features, skills, implementation decisions, checks actually passed, known limitations, and learner reflection. Never invent deployed URLs or test coverage.
- AI project mentor must use real integration or be labelled a non-AI guide; show errors and never silently fabricate a code review.

## 6. Interview Hub — `src/routes/interview.tsx`

The Hub is a router, not a wall of competing launch controls.

Exactly three primary modes:
1. **Practice a concept** — choose one domain/topic and practise questions without a timer by default.
2. **Run a timed mock interview** — configure preset, duration, and question mix in a dialog/drawer opened by this mode.
3. **Work on a flagged weakness** — show weaknesses backed by previous quiz/interview/project evidence; if none exist, explain that and offer a diagnostic.

Only the selected mode's workspace is visible. Remove duplicate quick-launch CTAs from the hero and avoid rendering the full timed configurator permanently below the mode cards. Topic cards are a secondary browse route, not a fourth competing primary mode.

Hub must include:
- Search and filters that work.
- Correct question and domain counts computed from the actual question dataset.
- Distinct topic descriptions and difficulty metadata derived from actual questions.
- Recent sessions and actionable weak areas.
- Visible active Interviews navigation state.
- Sensible beginner/intermediate/advanced calibration. Do not label every learner or tiny question pack “Staff Engineer”. Use “Production Engineering Rubric” unless an explicitly senior/staff interview mode is intentionally selected and has a matching rubric.
- Company tags mean “topics inspired by public interview themes” only if this is accurate; do not imply endorsement or affiliation by Google, Meta, Apple, Stripe, or Linear.

## 7. Interview Session — `src/routes/interview.session.tsx`

A session must be a working interaction, not a static mockup.

Before starting, explain topic mix, difficulty, duration, number/type of questions, timer behaviour, whether code execution is available, and how feedback is generated.

During a session:
- One current question with context and relevant difficulty.
- Answer field or code editor appropriate to the question.
- Save draft automatically; preserve answers when navigating back/forward.
- Timer accurately counts down and has defined pause/resume/expiry behaviour. A timed mock must not be interrupted by Forge Buddy.
- Actions: run code (only where supported), submit answer, reveal hint (if allowed), previous/next, finish.
- Do not expose model answers before the attempt unless the user chooses a study/reveal mode.
- Code execution output is not the same as passing tests. Use explicit test cases where available. If only a console run is available, label it “Run output”.
- If no actual AI service is configured, do not display “AI interviewer evaluating” or fake a score. Use transparent rubric/self-review.
- Rubric feedback explains strengths, missing concepts, correctness, reasoning, edge cases, trade-offs, and communication. Link weaknesses to a real lesson/practice route.
- Finishing creates a session record with timestamp, mode, answers, checks, rubric results, and recommendations. Resume interrupted sessions or explicitly offer to discard them.
- Results distinguish “answered”, “self-assessed”, “code ran”, “tests passed”, and “rubric feedback”; never blend them into one unexplained score.
- Record capability evidence only when the assessment criteria support it. One short answer or one self-rating must not automatically mean mastery.
- “Work on a flagged weakness” must preselect the actual weak concept and explain why it was flagged.

## 8. Evidence, progress, mastery, analytics — `src/lib/learning-engine/evidence-store.ts`, `src/lib/hooks/use-progress.ts`, `src/routes/progress.tsx`, `mastery.tsx`, `analytics.tsx`

Keep these concepts distinct:
- Activity status: not started / in progress / completed.
- Completion source: self-reported / system checked / rubric assessed.
- Evidence strength: not checked / partial / passed specified check / reviewed.
- Capability status: not started / learning / demonstrated / needs review / mastered.
- Mastery must be based on repeated, varied evidence over time according to explicit criteria, not merely a completed lesson or a single successful check.

Use a normalized record with learner ID (if accounts exist), capability ID, source activity ID/type, timestamp, assessment method, result, evidence details, and remediation route. Deduplicate records by capability and source. Define how conflicting/old evidence changes capability status. Avoid summing heterogeneous records as a “verified capabilities” total.

Progress answers “what activities did I complete?” Mastery answers “what can I currently do, and what needs review?” Analytics answers “what is changing over time and what should I do?” Every insight must have a meaningful time range and a link to an action. If there is insufficient data, say so instead of showing a fabricated trend.

LocalStorage is device/browser-specific. Cross-device resume requires a backend and user-scoped persistence. Add schema versioning, safe parsing, storage error handling, and migration/fallback tests.

## 9. Quizzes, flashcards, challenges, Debug Lab, whiteboard

### Quizzes — `src/routes/quizzes.index.tsx`, `src/routes/quizzes.$quizId.tsx`
- Explain the topic and expected time.
- Give one question at a time or a clearly grouped quiz.
- On submission, explain why the answer is right/wrong.
- Wrong answers identify the misconception and link to the exact lesson or practice.
- Save attempts and scores. Separate quiz completion from capability mastery.
- No answer feedback duplicated in multiple cards.

### Flashcards — `src/routes/flashcards.tsx`
- Card front asks one recall question; flip reveals a concise answer and explanation.
- Again/Hard/Good/Easy must change next review date if spaced repetition is promised.
- Cards map to actual capabilities and curriculum items. Repeated “Again” triggers a relevant review recommendation.
- If scheduling is not wired, do not claim the deck uses spaced repetition.

### Challenges — `src/routes/challenges.tsx`
- Show task, skill, time, hints, and completion criteria.
- Coding challenges verify submitted output where possible; reflective tasks can be self-reported.
- Do not give verified rewards for clicking “Mark complete” when code verification is required.
- Completion feedback links to the next useful task.

### Debug Lab — `src/routes/debug-lab.index.tsx`, `debug-lab.$bugId.tsx`
- Each case includes symptom, expected vs actual behaviour, reproduction/evidence, learner task, progressive hints, fix area, and verification.
- Learner flow: observe → hypothesize → test → identify root cause → fix → rerun → explain.
- Clearly state whether the task is to identify, explain, or fix the bug.
- Record a solved bug only after the required outcome; show limitations if checking is heuristic.

### Whiteboard — `src/routes/whiteboard.tsx`
- Provide purpose-built activities such as event-loop tracing, request lifecycle, data flow, or component architecture.
- Each board has a prompt, expected output, editable canvas/diagram, save/resume, and review criteria.
- If a board is only a freeform canvas, describe it as such; do not imply automatic correctness scoring.

## 10. Achievements, certificates, journal, notes, bookmarks, calendar, resources, mentor, settings

- **Achievements — `src/routes/achievements.tsx`:** each badge has a transparent unlock rule and links to evidence. Streaks and activity-count badges are not skill mastery. Recompute unlocks from source records; do not trust client-only badge flags.
- **Certificates — `src/routes/certificates.tsx`, `certificate.$certificateId.tsx`:** show exact eligibility requirements and which are met. Issuance follows path requirements, assessments, and required project verification. Never call a credential verified if requirements were only self-reported. Shareable certificates need stable IDs and server-side validation if public verification is offered.
- **Journal — `src/routes/journal.tsx`:** optional reflection tied to a lesson/project/interview. Never block progress on writing a journal entry.
- **Bookmarks — `src/routes/bookmarks.tsx`:** save and resume lessons/resources with context and remove action.
- **Notes — lesson note tools / settings storage:** save, edit, and restore notes with the correct lesson/topic/project association.
- **Calendar — `src/routes/calendar.tsx`:** scheduled session links open the exact lesson/project/interview. Show timezone and completion status honestly.
- **Resources/docs — `src/routes/resources.tsx`, `docs.tsx`:** curated references explain when they are useful and return the learner to the originating task.
- **Mentor — `src/routes/mentor.tsx`:** clarify whether this is a live AI integration or a static help experience. Use current lesson/project context only when appropriate; provide graduated help and honest failures. Do not expose assessment answers in restricted interview mode.
- **Settings — `src/routes/settings.tsx`:** theme, accessibility, reduced motion, notification preferences if supported, data/privacy and reset controls. Include a preference to hide/disable Buddy.
- **About/landing — `src/routes/index.tsx`, `about.tsx`:** state the core promise and guide the first action. Avoid claims of fully functional AI, verified code, or credentials unless implemented.

## 11. Shared navigation and route integrity — `src/routes/__root.tsx`, `src/components/atelier/atelier-top-nav.tsx`

- The global navigation must make Learn, Projects, Playground, and Interviews discoverable on every applicable main route.
- Highlight the current destination with an accessible active state.
- Standalone lesson layout remains minimal: clear Exit and lesson progress, not the entire site navigation.
- Every internal link must resolve to a real route and preserve relevant IDs/search parameters.
- Missing content or malformed IDs show a recovery route; do not silently route to the first project/lesson.
- Remove duplicated global navs or double headers when route shells nest.
- Verify the root layout's standalone-route decisions against actual route behaviour.

## 12. Blog and future features

The route inventory inspected contains no dedicated `/blog` route. Treat blog as a product decision, not a completed feature. If added, articles must connect to lessons, practice, and projects and must be maintainable; do not prioritize it ahead of functional interview and Playground flows.

## 13. Implementation and testing sequence

Do not ask an AI coding tool to “improve the whole app” in one unbounded pass. Implement one vertical slice at a time; preserve unrelated behaviour; report changed files, tests, and known gaps.

Phase A — Remove persistent Buddy UI:
- Change `src/components/lesson/v2/forge-buddy-lesson-companion.tsx` so default and dismissed states render nothing.
- Change `src/components/lesson/v2/lesson-experience.tsx` to use an explicit event policy and render Buddy only when a qualifying event exists.
- Ensure ordinary correct answers do not trigger Buddy; remove duplicated feedback without removing evidence writes.
- Add tests for no Buddy on initial render, ordinary step navigation, correct answer, wrong answer, explicit hint, milestone verification, dismiss, and timed interview.

Phase B — Correct lesson feedback and closure:
- Inspect each renderer and validation result path; render one feedback block only.
- Compact `closure-surface.tsx`; one primary CTA; accurate labels and lesson-scoped interview check.
- Test at 320/375px, with and without interactive checks, flagged attempts, and next lesson/no next lesson.

Phase C — Make Playground verification trustworthy:
- Audit `project-verifier.ts` assertions task-by-task.
- No fallback keyword assertion may confer “verified” without a transparent low-confidence label or human review.
- Tie reports to workspace revision and explicit task IDs.
- Test fail/pass/stale results and unrelated task isolation.

Phase D — Make interview modes functional:
- Refactor `interview.tsx` so three modes are the only primary router; configurator appears only after choosing timed mock.
- Correct category metadata and derive counts from `useInterviewQuestions()`.
- Test route transitions and direct URLs.
- Audit `interview.session.tsx` timer, answer persistence, code execution, scoring labels, result saving, resume, and remediation. Clearly mark any feature not wired as unavailable rather than mock functionality.

Phase E — Reconcile learner state:
- Define one evidence schema and migration plan; stop double counting in dashboard.
- Verify progress, mastery, analytics, achievements, and certificates against the same fixtures.
- Do not infer mastery from lesson completion.

Phase F — End-to-end QA and release:
- Build/typecheck/lint and automated tests.
- Test new learner, active lesson, wrong answer, project failure, successful verification, interview finish, interrupted session, returning learner, empty content, storage failure, and mobile layouts.
- Deploy only after tests pass; then smoke-test the deployed URL. A clean build is not a substitute for runtime verification.

## Definition of done

A learner can start without knowing the route map; complete a focused lesson with no persistent Buddy UI; get one clear feedback message; practise a relevant skill; open the exact project milestone in a functioning Playground; see criterion-by-criterion verification that does not overclaim; complete a real interview session with honest feedback; and return later with saved work and a useful next step.

Every visible control works. Every metric has a source. Every claim of verification is supported by evidence. Every recommendation has a reason and a valid destination. Every AI feature is genuinely connected or honestly labelled as unavailable.
