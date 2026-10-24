# Forge Academia — Verification, Cross-Feature Integration & QA Plan

## 1. Architectural Vision & Scope
Forge Academia operates as a **guided engineering workshop** where every learning surface (Dashboard, Modules, Lesson Player, Project Studio, Interview Coach, and Supporting Practice Tools) shares one coherent model of learner capability. Based on your decisions:
- **All 6 Pillars Executed with Automated Tests**: We will verify and tighten all 6 pillars end-to-end and back them with a deterministic Vitest verification suite covering the learning engine, project verification rules, lesson-player renderers, interview evaluation, and supporting feature contracts.
- **Provenance-Labeled Interview Evaluation**: Coding and conceptual interview prompts will clearly distinguish **Executed Sandbox Checks** (live code execution + output/error assertions) from **Deterministic Rubric Signals** (keyword + structural criteria matching), with zero silent mock fallbacks.
- **Strict Sandbox-Verified Credentialing**: Track certificates and mastery achievements will require sandbox-verified tasks and passed checks (`verified` evidence status) rather than unverified self-reports.

---

## 2. Pillar-by-Pillar Implementation & Verification Plan

### Pillar 1 — Core Learning Engine (`src/lib/learning-engine/evidence-store.ts`)
- **Strict Provenance & Mastery Separation**:
  - Enforce distinct states across all helpers: `not-started`, `in-progress`, `completed` (lesson finished), `self-reported` (manual checkbox), `verified` (passed sandbox/activity check), and `needs-attention` (failed attempts or low interview/quiz score).
  - Prevent stale or conflicting evidence from inflating mastery: if a newer quiz, project verification, or interview attempt on the same capability/topic fails (`status: "needs-review"`), downgrade or cap the aggregated capability status until re-verified.
  - Add topic/module mapping to `CapabilityEvidenceRecord` (`topicId?: string`, `moduleId?: string`, `remediationLessonId?: string`) so capability gaps recorded in Quizzes, Debug Lab, Projects, or Interviews immediately surface in `computeGuidedNextStep` and across Dashboard, Modules, Projects, and Interviews.
- **Automated Engine Tests (`src/lib/learning-engine/__tests__/evidence-store.test.ts`)**:
  - Test persistence across simulated reloads (`localStorage` serialization + custom event dispatch).
  - Test `computeGuidedNextStep` across all 4 learner archetypes:
    1. *New learner* (0 lessons completed → Lesson 1).
    2. *Active mid-lesson learner* (`currentStepIndex > 0` → exact-step resume `Step X of Y`).
    3. *Struggling learner* (`needs-review` capability record from failed lesson step, quiz, or interview → targeted remediation lesson).
    4. *Project/Verification learner* (self-reported project tasks awaiting sandbox verification → Playground verification link with `projectId` and `milestoneId`).

### Pillar 2 — Real Project Verification (`src/routes/playground.tsx`, `src/routes/projects.$projectId.tsx`, `src/routes/projects.index.tsx`)
- **Per-Task Acceptance Criteria & Isolation**:
  - Ensure `verifyMilestoneTasks` in `src/routes/playground.tsx` evaluates each task against its own `task.validation` rules (and milestone-level rules mapped to specific criteria) against the learner's live HTML/CSS/JS/TS files—never letting a single passing check mark unrelated tasks as verified.
  - Persist project workspace state (`files`, `activeMilestoneId`, last verification output, and per-task check statuses) in `localStorage` per `projectId` so refreshing or navigating between the Project Brief (`/projects/$projectId`) and Playground (`/playground?projectId=...`) preserves all code and validation diagnostics.
  - Display clear provenance badges on every milestone task in both `/projects/$projectId` and `/playground`:
    - **Verified in Sandbox** (emerald badge with timestamp & passed rule count)
    - **Self-Reported Only** (amber badge with direct *"Verify in Sandbox →"* CTA)
    - **Not Started / Failed Check** (with specific failing assertion feedback)
- **Automated Project Verification Tests (`src/lib/learning-engine/__tests__/project-verification.test.ts`)**:
  - Verify passing and failing code submissions against real project milestone criteria, confirming task isolation and persistence.

### Pillar 3 — Lesson-Player Quality Assurance (`src/components/lesson/lesson-view.tsx`, `src/lib/learning-engine/lesson-adapter.ts`)
- **All Activity Renderers & Zero Duplication**:
  - Audit and test every activity renderer (`concept_walkthrough`, `explanation`, `code_sandbox`, `multiple_choice`, `fill_in_blank`, `code_order`, `debug_exercise`, `terminal_sim`, `predict_output`, `reflection`) to confirm:
    - Zero vertical scroll bloat or duplicate scene-setting cards.
    - No unparsed markdown syntax leaks in titles, callouts, or options.
    - Removed audio narration and heavy multi-tab banners cannot reappear via alternate lesson paths.
  - **Forge Buddy Discipline**:
    - Confirm the bottom Forge Buddy pill remains quiet during focused work, opens only on wrong answers, explicit hint requests, or verified milestones, is keyboard-accessible (`Escape` to dismiss, proper `aria-expanded`), and respects `prefers-reduced-motion`.
  - **Exact-Step Resume, Notes & Bookmarks**:
    - Verify that bookmarking a lesson, saving lesson notes, and navigating away/back restores the exact step index (`Step X of Y`) and step completion state.

### Pillar 4 — Connect Interview Feedback to Learning (`src/routes/interview.tsx`, `src/routes/interview.session.tsx`)
- **Executed Sandbox Checks vs. Deterministic Rubric Badges**:
  - In `/src/routes/interview.session.tsx`, separate evaluation output into two explicit provenance sections:
    1. **Executed Sandbox Checks**: Live execution status of the candidate's code draft (console output, return values, and runtime error checks).
    2. **Staff Rubric Signal Analysis**: Deterministic rubric criteria matched vs. missed, labeled clearly as `Rubric Signal Check`.
- **Actionable Concept Mapping & Remediation**:
  - Map each interview category and question to its corresponding curriculum `topicId` and `lessonId`. When a candidate scores `< 75%` or misses key rubric signals, record a `needs-review` capability evidence item linked to that `lessonId` and render a direct **"Practice Weak Concept in Lesson →"** and **"Retry Question"** CTA in both the per-question evaluation card and the session summary screen.
  - Ensure timed mock sessions (`mode === "mock"`) keep Forge Buddy completely silent while the clock is running unless the learner explicitly clicks *Request Coach Hint*.

### Pillar 5 — Complete Cross-Feature Learner Journey (`src/routes/dashboard.tsx`, `src/routes/practice.tsx`, `src/routes/mastery.tsx`, `src/routes/learn.paths.tsx`)
- **End-to-End Flow & Type-Safe Routing**:
  - Connect the full loop: **Dashboard Recommendation → Lesson Step → Practice/Quiz → Project Studio → Playground Verification → Interview Coach**.
  - Fix the remaining route and type mismatches identified in `src/routes/practice.tsx` (`TopicMasteryRecord.mastery` and `interviewResults`), `src/routes/mastery.tsx` (`/interview` search params), and `src/routes/learn.paths.tsx` (`/learn/modules` search params) so `tsc --noEmit` passes with zero errors.
  - Ensure capability gaps recorded in any tool (Lesson check, Quiz, Debug Lab, Project verification, or Interview) immediately update `computeGuidedNextStep` and the Practice Hub remediation queue.

### Pillar 6 — Supporting Features Audit
- **Quizzes (`src/routes/quizzes.$quizId.tsx`, `src/components/quiz/quiz-results.tsx`)**:
  - On quiz completion, record capability evidence via `recordCapabilityEvidence` (`verified` when $\ge 80\%$, `needs-attention` / `needs-review` when $< 70\%$).
  - For every wrong answer in `QuizResults`, display the specific misconception explanation alongside a direct remediation link to the relevant lesson/topic.
- **Flashcards (`src/routes/flashcards.tsx`)**:
  - Display the next scheduled review interval (`< 10m`, `1d`, `3d`, `7d+`) on the rating buttons (`Again`, `Hard`, `Good`, `Easy`) and show a scheduled upcoming review summary when a deck is caught up so spaced repetition scheduling is transparent and verifiable.
- **Debug Lab (`src/routes/debug-lab.$bugId.tsx`)**:
  - When a learner's fix passes all diagnostic tests in `InteractiveBugSimulator`, record verified capability evidence (`recordCapabilityEvidence`) and unlock a clear Root-Cause & Prevention breakdown card.
- **Daily Challenges (`src/routes/challenges.tsx`)**:
  - Tie challenge completion to actual activity completion (or verified deep-link target completion) rather than an unverified manual toggle alone, and link each challenge to its exact quiz, bug, or playground exercise.
- **Certificates & Achievements (`src/lib/utils/path-eligibility.ts`, `src/routes/certificates.tsx`, `src/lib/utils/achievements.ts`, `src/routes/achievements.tsx`)**:
  - Update `checkPathEligibility` and `/certificates` so earning a Path Certificate requires completed lessons, passed topic quizzes ($\ge 70\%$), **and** at least 1 sandbox-verified project milestone in the path, displaying explicit verification status for each requirement.
  - Surface evidence provenance on unlocked achievements in `/achievements` and `/progress`.
- **Bookmarks, Notes/Journal, Calendar & Resources (`src/routes/bookmarks.tsx`, `src/routes/journal.tsx`, `src/routes/calendar.tsx`, `src/routes/resources.tsx`)**:
  - Enhance `/bookmarks` to show exact lesson step resume status (`Step X of Y`) and saved lesson notes preview so learners can jump straight back into saved work.
