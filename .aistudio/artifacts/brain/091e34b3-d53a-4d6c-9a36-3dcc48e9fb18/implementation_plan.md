# Forge Academia — Product Architecture Audit & Connected Learning Journey Implementation Plan

## 1. Executive Summary

Forge Academia’s product vision is a guided engineering workshop structured around a five-stage pedagogical loop:

$$\text{Learn} \rightarrow \text{Practice} \rightarrow \text{Build} \rightarrow \text{Verify} \rightarrow \text{Explain}$$

A comprehensive audit of the repository reveals that while the codebase contains strong foundational building blocks—including a 147-lesson V1 canonical curriculum (`src/data/canonical/lessons-v1/*.json`), a 5-stage client-side compiler pipeline (`src/lib/compiler/pipeline.ts`), an iframe-isolated runtime assertion harness (`src/lib/compiler/validation-client.ts` and `src/lib/compiler/validation-evaluator.ts`), and an evidence store (`src/lib/learning-engine/evidence-store.ts`)—**the five stages of the learning loop are currently disconnected from one another, and several verification and starter-code mechanisms are either hardcoded or gameable.**

### Summary of Verified Critical Findings

1. **Zero Curriculum-to-Project Wiring in the Lesson Player (Verified Fact)**
   - In `src/routes/lesson.$lessonId.tsx` (lines 25–158), `LessonRoutePage` loads the V1 lesson via `loadV1Lesson(lessonId)` and renders `LessonExperience` (`src/components/lesson/v2/lesson-experience.tsx`).
   - When a learner finishes a lesson (`handleLessonComplete` at lines 77–80 and `handleContinueToNext` at lines 82–90 of `src/routes/lesson.$lessonId.tsx`), the app calls `completeLesson(lessonId)` and navigates directly to `nextLessonId` or `/learn/modules/$moduleId`.
   - `ClosureSurface` (`src/components/lesson/v2/closure-surface.tsx`, lines 30–156) renders a takeaway card and a "Review Steps" button, with **no awareness of any linked project, milestone, or Playground build deliverable**.
   - None of the 147 canonical V1 lesson JSON files in `src/data/canonical/lessons-v1/` contain a `projectId`, `milestoneId`, or `deliverable` field.

2. **Bulk Copy-Pasted, Mismatched Coding Activities Across 58 V1 Lessons (Verified Fact)**
   - In `src/data/canonical/lessons-v1/`, 58 lessons contain a bulk-injected `replicate-this` activity that does not match the individual lesson’s topic—and in two modules does not even match the module’s language/framework:
     - **Module 1-2 (`CSS: Make the Structure Visible`, 12 lessons)**: All 12 lessons (`lesson-1-2-1` through `lesson-1-2-12`) repeat `"Replicate UI: Box Model & Surface Card"`.
     - **Module 1-3 (`Layout and Responsive Design`, 12 lessons)**: All 12 lessons (`lesson-1-3-1` through `lesson-1-3-12`) repeat `"Replicate UI: Flexbox Navigation Bar"` (even in Grid and Media Query lessons).
     - **Module 1-4 (`Accessible Interface Craft`, 10 lessons)**: All 10 lessons (`lesson-1-4-1` through `lesson-1-4-10`) repeat `"Replicate UI: Accessible Design System Specimen"`.
     - **Module 3-1 (`React: Think in UI State`, 9 lessons)**: All 9 React lessons (`lesson-3-1-1` through `lesson-3-1-9`) repeat the HTML/CSS `"Replicate UI: Accessible Design System Specimen"`.
     - **Module 4-1 (`Next.js Application Engineering`, 15 lessons)**: All 15 Next.js lessons (`lesson-4-1-1` through `lesson-4-1-15`) repeat the HTML/CSS `"Replicate UI: Accessible Design System Specimen"`.
   - Conversely, in **Module 2-1 (`JavaScript: The Language of Behavior`)** and **Module 2-2 (`JavaScript in the Browser`)**, the capstone mission lessons (`lesson-2-1-10: Forge Mission: Read, Predict, Repair` and `lesson-2-2-10: Forge Mission: Build an Interactive Page`) have **zero coding activities** (`code-modification` or `replicate-this`), ending with multiple-choice/judgment slides instead of building an interactive page.

3. **Identical Hardcoded Boilerplate for Every Project in the Catalog (Verified Fact)**
   - `buildProjectWorkspaceFiles(project: Project)` in `src/lib/project-workspace-templates.ts` (lines 75–225) generates the **exact same 3-file vanilla JS step-pill template** (`index.html` with `.project-shell`, `.workbench-card`, `#run-feature-btn`; `styles.css`; `app.js` rendering milestone step pills) for **all 11 projects** in `src/data/projects.json`.
   - Whether a learner opens `semantic-profile-launchpad` (Beginner HTML/CSS) or `kanban-board` (Advanced React), they receive the identical generic step-tracker boilerplate rather than project-specific starter files.

4. **Broken Prerequisite Links on 10 of 11 Existing Projects (Verified Fact)**
   - `src/data/modules.json` defines 17 canonical module IDs (`module-0-1` through `module-4-2`).
   - In `src/data/projects.json`, 10 of the 11 projects reference legacy, non-existent `moduleId` strings (`"html-css-foundations"`, `"react-professional"`, `"typescript-mastery"`, `"language-mastery"`, `"testing-and-tooling"`, `"frontend-architecture"`, `"performance-and-a11y"`). Only `semantic-profile-launchpad` references a valid module ID (`"module-1-1"`).
   - Consequently, in `src/routes/projects.$projectId.tsx` (lines 79–91), `modules.find((m) => m.id === project.moduleId)` returns `undefined` and `topics.filter((t) => t.moduleId === project.moduleId)` returns `[]` for 10 of 11 projects, causing `isPrereqsMet` to evaluate to `true` unconditionally (`uncompletedPrereqs.length === 0`).

5. **Gameable Static Regex & Character-Count Fallback in Project Verification (Verified Fact)**
   - Instead of using the real iframe runtime validation engine (`requestPlaygroundValidation` in `src/lib/compiler/validation-client.ts`), project milestone verification in `src/routes/playground.tsx` (`handleVerifyProjectMilestone`, lines 878–972) calls `verifyProjectMilestone` in `src/lib/learning-engine/project-verifier.ts`.
   - `buildTaskAcceptanceAssertions` (`src/lib/learning-engine/project-verifier.ts`, lines 39–204) scrapes `task.title`, `task.description`, and `task.hints` with regexes for `<tag>` or CSS property names. When no regex matches (or in addition to it), its fallback check (lines 149–201) passes if the learner added $\ge 25$ characters of non-starter text (`userAddedCode.length >= 25`) AND either included the literal task ID (e.g., `"t1"`) or half of the 4+ letter words from the task title (`matchedKeywords.length >= Math.ceil(titleKeywords.length * 0.5)`).
   - A learner can type a single comment containing words from the task title plus 25 characters in any file and earn `"VERIFIED"` status and capability evidence in `evidence-store.ts`.

6. **Mobile Playground Unmounts the Preview Iframe During Validation (Verified Fact)**
   - In `src/routes/playground.tsx`, the desktop layout keeps `PlaygroundPreview` mounted at all times via CSS visibility (`className={activePaneTab === "preview" ? "flex-1 ..." : "hidden"}` at line 1804).
   - On mobile (`< lg`), `PlaygroundPreview` is conditionally rendered only when `mobileTab === "preview"` (line 1649: `{mobileTab === "preview" && (... <PlaygroundPreview ... />)}`).
   - When a mobile learner taps **Run & Validate** (`handleRunAndValidate`, lines 798–876), line 805 executes `setMobileTab("validation")` *before* calling `await waitForIframeReady(...)` (line 814) and `await requestPlaygroundValidation(...)` (line 842). Switching `mobileTab` to `"validation"` immediately unmounts the `<iframe title="Forge Playground Live Preview">` on mobile, causing `requestPlaygroundValidation` (`src/lib/compiler/validation-client.ts`, lines 213–239) to fail with `"Playground preview iframe is not mounted or ready"` or time out.

7. **Conflated Manual Self-Check vs. Verified Progress & No Staleness Invalidation (Verified Fact)**
   - `useProgressStore` (`src/lib/stores/use-progress-store.ts`, lines 72, 232–243) stores `projectTasks: Record<string, boolean>` (`"${projectId}:${taskId}"`).
   - Clicking a task card in the Playground project banner (`src/routes/playground.tsx`, line 1402) or checking a task in `src/routes/projects.$projectId.tsx` (line 384) toggles `projectTasks` directly.
   - `src/routes/projects.index.tsx` (lines 70, 224–236) computes global and per-project completion percentages solely from `projectTasks`, completely ignoring `getVerifiedProjectTasks()` from `evidence-store.ts`.
   - In `src/routes/projects.$projectId.tsx` (line 152), checking all checkboxes displays a green `"100% Complete"` badge even when `verifiedTasksCount === 0`.
   - Furthermore, when `verifyProjectMilestone` fails on a subsequent run (`src/routes/playground.tsx`, lines 912–921), previously auto-checked `projectTasks` are never unchecked, and editing files in `usePlaygroundStore.updateFileContent` (`src/lib/stores/use-playground-store.ts`, lines 129–144) does not invalidate `latestMilestoneReport` or mark verified tasks as stale (`needs-review`).

---

## 2. Repository Architecture Map (Current vs. Proposed)

| Subsystem | Current Files & Exported Symbols | Verified Current Behavior | Proposed Architecture Changes |
| :--- | :--- | :--- | :--- |
| **Canonical V1 Lesson Catalog & Loader** | `src/data/canonical/lessons-v1/lesson-*.json` (147 files)<br>`src/lib/curriculum/v1/loader.ts` (`loadV1Lesson`, `hasV1Lesson`)<br>`src/lib/curriculum/types-v1.ts` (`CanonicalLessonV1`) | Stores lesson metadata, `curriculum`, `learning`, `activities`, and `relationships`. Has no `deliverable` or `projectLink` binding. 58 lessons contain copy-pasted mismatched `replicate-this` activities. | Extend `CanonicalLessonV1.relationships` (and create `src/data/curriculum-project-map.json` + typed resolver `src/lib/curriculum/project-mapping.ts`) to bind every lesson to its `LessonDeliverableSpec` (`in-lesson-check`, `guided-mini-build`, `project-milestone`, or `capstone-project`). Remove mismatched `replicate-this` activities from non-matching lessons. |
| **Lesson Player & Closure Surface** | `src/routes/lesson.$lessonId.tsx` (`LessonRoutePage`)<br>`src/components/lesson/v2/lesson-experience.tsx` (`LessonExperience`)<br>`src/components/lesson/v2/closure-surface.tsx` (`ClosureSurface`) | On lesson completion, only offers `"Next Lesson"` in sticky footer and `"Review Steps"` in `ClosureSurface`. Zero link to project milestones or Playground mini-builds. | Inject `deliverableSpec` into `LessonExperience` and `ClosureSurface`. When a lesson unlocks or contributes to a `guided-mini-build` or `project-milestone`, display a structured **"Next Step: Apply What You Learned"** card on `ClosureSurface` with direct deep-link CTA to `/playground?project=...&milestone=...&task=...&lessonId=...&mode=beginner`. |
| **Project Catalog & Starter Templates** | `src/data/projects.json` (11 projects)<br>`src/lib/types.ts` (`Project`, `ProjectMilestone`, `ProjectTask`)<br>`src/lib/project-workspace-templates.ts` (`buildProjectWorkspaceFiles`, `resolveProjectMilestoneContext`) | 10/11 projects reference invalid `moduleId`s. `buildProjectWorkspaceFiles` returns the exact same generic vanilla JS step-pill template for all 11 projects. Tasks have no machine-executable `validationSpec`. | Expand & normalize `src/data/projects.json` so every module (`module-1-1` through `module-4-2`) has cumulative multi-milestone module projects plus standalone capstones, with valid `moduleId`, `prerequisiteLessonIds`, per-project/per-milestone `starterFiles`, `solutionFiles`, and per-task `validationSpec: ExerciseValidationSpec`. |
| **Project Hub & Detail Routes** | `src/routes/projects.index.tsx` (`ProjectsIndexPage`)<br>`src/routes/projects.$projectId.tsx` (`ProjectDetailPage`) | `projects.index.tsx` computes progress solely from manual `projectTasks` checkboxes. `projects.$projectId.tsx` has broken prerequisite checks and shows `"100% Complete"` on manual self-checks even with 0 verified tasks. | Group `/projects` into **Ready Now**, **In Progress**, **Locked by Prerequisites**, and **Completed & Verified**. Fix prerequisite resolution against `completedLessons`. Separate `selfReported` status from `verified` status on both `/projects` and `/projects/$projectId`. |
| **Playground Route & Modes** | `src/routes/playground.tsx` (`PlaygroundPage`, 1,878 lines)<br>`src/lib/stores/use-playground-store.ts` (`usePlaygroundStore`)<br>`src/components/playground/*` | Single complex IDE layout with 8 header buttons, file tree sidebar, multi-tab bar, and 6 mobile tabs (`Code`, `Validation`, `Preview`, `Console`, `Hints`, `Files`). Unmounts `PlaygroundPreview` on mobile when `mobileTab !== "preview"`. | Introduce `workspaceMode: "beginner" \| "advanced"` in `usePlaygroundStore` (auto-enabled to `"beginner"` for HTML/CSS/Vanilla JS modules `module-0-1`..`module-2-2`, `module-2-4`, with a 1-click toggle to `"advanced"`). Simplify mobile to 4 primary tabs (`Task`, `Code`, `Preview`, `Checks`), keep `PlaygroundPreview` mounted via CSS visibility on mobile, and remove manual task-card click-to-complete. |
| **Project & Task Verification Engine** | `src/lib/learning-engine/project-verifier.ts` (`verifyProjectMilestone`, `buildTaskAcceptanceAssertions`)<br>`src/lib/compiler/validation-client.ts` (`requestPlaygroundValidation`, `waitForIframeReady`)<br>`src/lib/compiler/validation-evaluator.ts` (`executeAssertion`) | `verifyProjectMilestone` uses static string regexes and a 25-character + title-word fallback check instead of running code in the preview iframe. | Refactor `verifyProjectMilestone` into an async orchestrator (`verifyProjectMilestoneRuntime`) that executes each task’s `ExerciseValidationSpec` (`dom_query`, `computed_style`, `js_evaluation`, `console_match`, `source_ast_check`, `actions`) inside the live preview iframe via `waitForIframeReady` + `requestPlaygroundValidation`. |
| **Progress & Evidence Stores** | `src/lib/stores/use-progress-store.ts` (`useProgressStore`)<br>`src/lib/learning-engine/evidence-store.ts` (`recordProjectGateVerification`, `getVerifiedProjectTasks`) | Manual checkboxes (`projectTasks`) and verified evidence (`projectGateVerifications`) are out of sync. Modifying code after verification does not mark verification stale. | Implement a unified 7-state model (`not-started`, `in-progress`, `attempted`, `completed`, `self-reported`, `verified`, `needs-review`) with `workspaceHash` tracking so post-verification edits transition status to `needs-review`. |

---

## 3. Workstreams A & B — Complete Lesson Library Audit & Lesson-to-Project Mapping

### 3.1 Audit of the Dual Lesson Catalog (`lessons-v1` vs. `lessons.json`)

- **Verified Fact**: The repository contains two lesson datasets:
  1. `src/data/canonical/lessons-v1/lesson-*.json`: **147 canonical V1 lessons** across all 17 modules (`module-0-1` through `module-4-2`). When a learner visits `/lesson/$lessonId`, `src/routes/lesson.$lessonId.tsx` (line 36) checks `loadV1Lesson(lessonId)` first and renders `LessonExperience` (`src/components/lesson/v2/lesson-experience.tsx`). Because all 147 lesson IDs exist in `lessons-v1`, **`lessons-v1` is the active runtime catalog for 100% of lessons**.
  2. `src/data/lessons.json`: **96 legacy lessons** (`lesson-0-1-1` through `lesson-3-2-3`) referenced by `src/lib/curriculum/manifest.ts` for legacy exercise lookups (`exercises` array with `starterCode`, `solution`, `testCases`) and fallback metadata.
- **Systemic Pedagogical Defects Identified Across the 147 V1 Lessons**:
  1. **Zero Outbound Build Links**: None of the 147 V1 lessons link to a Playground mini-build or project milestone upon completion.
  2. **Bulk-Duplicated Unrelated `replicate-this` Activities**:
     - `lesson-1-2-1`..`lesson-1-2-12` (12 lessons): Every lesson ends with the identical `"Replicate UI: Box Model & Surface Card"` step, even when the lesson is about typography (`lesson-1-2-4`), cascade specificity (`lesson-1-2-8`), or `:hover`/`:focus` states (`lesson-1-2-10`).
     - `lesson-1-3-1`..`lesson-1-3-12` (12 lessons): Every lesson ends with `"Replicate UI: Flexbox Navigation Bar"`, even when teaching normal flow (`lesson-1-3-1`), CSS Grid (`lesson-1-3-8`), or media queries (`lesson-1-3-10`).
     - `lesson-1-4-1`..`lesson-1-4-10` (10 lessons): Every lesson ends with `"Replicate UI: Accessible Design System Specimen"`.
     - `lesson-3-1-1`..`lesson-3-1-9` (9 React lessons) and `lesson-4-1-1`..`lesson-4-1-15` (15 Next.js lessons): Every single lesson ends with `"Replicate UI: Accessible Design System Specimen"`—a static HTML/CSS exercise injected into React and Next.js lessons!
  3. **Missing Coding Activities in Core JavaScript & Browser DOM Lessons**:
     - In `module-2-1` (`JavaScript: The Language of Behavior`), `lesson-2-1-1` (Values & Expressions), `lesson-2-1-3` (Types), `lesson-2-1-9` (Scope & Composition), and `lesson-2-1-10` (Forge Mission: Read, Predict, Repair) contain **no coding steps**.
     - In `module-2-2` (`JavaScript in the Browser`), `lesson-2-2-1` (DOM Tree), `lesson-2-2-4` (`classList`), `lesson-2-2-6` (`event.target`), `lesson-2-2-8` (`preventDefault`), `lesson-2-2-9` (`localStorage`), and `lesson-2-2-10` (Forge Mission: Build an Interactive Page) contain **no coding steps**.

### 3.2 Architecture of the Connected Lesson-to-Project Mapping

Per the confirmed architectural decision (**Cumulative multi-milestone projects per module plus standalone capstones**), every lesson across the 17 modules maps to one of four deliverable tiers:
1. **`in-lesson-check`**: Conceptual/mental-model foundations (e.g., `module-0-1`, `module-0-2`) verified via interactive visual tracers (`LayerStack`, `RequestResponseTimeline`, `ExecutionOrderTracer`) and prediction checks inside the lesson player, culminating in a module-end guided Playground exploration.
2. **`guided-mini-build`**: Focused 5–10 minute Playground lab launched from the lesson closure card (`mode=beginner` for HTML/CSS/JS tracks) where the learner applies the exact concept taught in that lesson to a small self-contained artifact.
3. **`project-milestone`**: A milestone task (`m1:t1`, `m1:t2`, etc.) within the module’s **cumulative multi-milestone project**, where the learner progressively builds a real deliverable across the module’s lessons.
4. **`capstone-project`**: The module’s synthesis lesson (`role: "challenge"` / `"Forge Mission"`) where the learner completes and verifies the final milestone of the module project or a standalone integrated capstone project.

---

### 3.3 Complete 147-Lesson Inventory & Lesson-to-Project Mapping Table

#### Phase 0: Foundations (`module-0-1` & `module-0-2` — 12 Lessons)

| Lesson ID | Title | Lang / Subject | Prereqs | Current Activities | Deliverable Type | Target Project & Milestone / Task ID | Learner Task & Visible Result | Automated Verification Checks (`ExerciseValidationSpec`) | Est. Min |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `lesson-0-1-1` | A Website Is a Conversation | Web Systems | None | `intro`, `visual`, `multiple-choice`, `explanation`, `reflection`, `summary` | `in-lesson-check` | `web-system-inspector` (In-Lesson Check) | Trace client request and server response roles in `RequestResponseTimeline`. | In-lesson activity runtime validation (`multiple-choice` + timeline state). | 10 |
| `lesson-0-1-2` | The Browser Has a Job | Web Systems | `lesson-0-1-1` | `explanation`, `visual`, `multiple-choice`, `summary` | `in-lesson-check` | `web-system-inspector` (In-Lesson Check) | Identify how the browser parses responses into visible UI. | In-lesson activity runtime validation. | 10 |
| `lesson-0-1-3` | Three Languages, Three Jobs | HTML / CSS / JS | `lesson-0-1-2` | `explanation`, `visual` (`LayerStack`), `multiple-choice`, `summary` | `guided-mini-build` | `proj-0-1-web-trio` / `m1:t1` | Inspect cumulative `HTML` $\rightarrow$ `HTML+CSS` $\rightarrow$ `HTML+CSS+JS` layers in `LayerStack`, then change the heading text, button color, and click message in Beginner Playground. | `dom_query`: `h1` non-empty; `computed_style`: `button` background-color changed; `actions`: click `button` updates `#status-msg`. | 12 |
| `lesson-0-1-4` | From Address to Page | Web Systems | `lesson-0-1-3` | `explanation`, `visual`, `ordering`, `multiple-choice`, `reflection`, `summary` | `in-lesson-check` | `web-system-inspector` (In-Lesson Check) | Order the URL-to-render lifecycle steps accurately. | In-lesson permutation ordering validation. | 12 |
| `lesson-0-1-5` | What Is Running Where? | Web Systems | `lesson-0-1-4` | `explanation`, `visual`, `multiple-choice`, `reflection`, `summary` | `in-lesson-check` | `web-system-inspector` (In-Lesson Check) | Classify client-side vs. server-side operations. | In-lesson check validation. | 10 |
| `lesson-0-1-6` | Trace the Page | Web Systems | `lesson-0-1-5` | `explanation`, `visual`, `ordering`, `multiple-choice`, `reflection`, `summary` | `project-milestone` | `proj-0-1-web-trio` / `m1:t2` | Repair a broken 3-layer welcome card in Beginner Playground by restoring missing `<h1>`, linking the CSS class, and fixing the button click message. | `dom_query`: `.welcome-card h1` exists; `computed_style`: `.welcome-card` has border-radius $\ge 8\text{px}$; `actions`: click `#ping-btn` sets `#response-out` text. | 15 |
| `lesson-0-2-1` | Computers Do Exactly What You Said | Programming Logic | `lesson-0-1-6` | `intro`, `visual`, `multiple-choice`, `explanation`, `reflection`, `summary` | `in-lesson-check` | `logic-tracer-lab` (In-Lesson Check) | Trace literal instruction execution and spot ambiguous steps. | In-lesson check validation. | 10 |
| `lesson-0-2-2` | Order Matters | Programming Logic | `lesson-0-2-1` | `intro`, `visual`, `multiple-choice`, `ordering`, `summary` | `in-lesson-check` | `logic-tracer-lab` (In-Lesson Check) | Sequence state-mutating instructions so prerequisites execute before dependents. | In-lesson ordering & check validation. | 10 |
| `lesson-0-2-3` | Break the Big Thing Apart | Decomposition | `lesson-0-2-2` | `intro`, `visual`, `multiple-choice`, `explanation`, `reflection`, `summary` | `in-lesson-check` | `logic-tracer-lab` (In-Lesson Check) | Decompose a UI feature into input, state change, and output steps. | In-lesson check validation. | 10 |
| `lesson-0-2-4` | Predict Before You Press Run | Mental Models | `lesson-0-2-3` | `intro`, `visual`, `multiple-choice`, `explanation`, `summary` | `in-lesson-check` | `logic-tracer-lab` (In-Lesson Check) | Form a falsifiable prediction of program output before running. | In-lesson check validation. | 10 |
| `lesson-0-2-5` | Find the First Wrong Step | Debugging | `lesson-0-2-4` | `intro`, `visual`, `multiple-choice`, `explanation`, `summary` | `guided-mini-build` | `proj-0-2-instruction-debugger` / `m1:t1` | Inspect a 3-step DOM banner script where step 2 overwrites the greeting, and fix the instruction order. | `dom_query`: `#banner-title` equals `"Welcome, Builder"`; `#banner-step` equals `"Ready"`. | 12 |
| `lesson-0-2-6` | Forge Mission: Fix the Instructions | Debugging | `lesson-0-2-5` | `judgment`, `visual`, `multiple-choice`, `explanation`, `summary` | `project-milestone` | `proj-0-2-instruction-debugger` / `m1:t2` | Repair a multi-step status checklist script so initialization, status update, and summary count run in the right sequence. | `dom_query`: `.step-item.done` count $= 3$; `#summary-badge` textContains `"3 / 3 Complete"`. | 15 |

---

#### Phase 1A: HTML Structure & Accessibility (`module-1-1` & `module-1-4` — 18 Lessons)

- **Cumulative Module 1-1 Project**: `semantic-profile-launchpad` (**Personal Developer Bio & Link Launchpad**, 4 cumulative milestones across `lesson-1-1-1`..`lesson-1-1-8`).
- **Cumulative Module 1-4 Project**: `accessible-interface-remediation` (**Accessible Community Event Registration Portal**, 4 cumulative milestones across `lesson-1-4-1`..`lesson-1-4-10`, plus standalone capstone `accessible-component-audit`).

| Lesson ID | Title | Lang | Prereqs | Current Activities & Audit Finding | Deliverable Type | Target Project & Milestone / Task ID | Starting Files | Learner Task & Visible Result | Automated Verification Checks (`ExerciseValidationSpec`) | Est. Min |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `lesson-1-1-1` | HTML Is Structure | HTML | `lesson-0-2-6` | `intro`, `multiple-choice`, `explanation`, `code-modification` ("Tiny HTML lab"), `summary` | `guided-mini-build` | `semantic-profile-launchpad` / `m1:t1` | `index.html`, `styles.css` (read-only base) | Mark up raw plain text into an `<h1>` developer name and `<p>` bio introduction inside the profile card. | `dom_query`: `h1` exists & non-empty; `p` exists & text length $\ge 15$. | 12 |
| `lesson-1-1-2` | Elements Have Meaning | HTML | `lesson-1-1-1` | `reflection`, `explanation`, `multiple-choice`, `summary` (No code lab) | `guided-mini-build` | `semantic-profile-launchpad` / `m1:t1` (refinement) | `index.html`, `styles.css` | Replace generic `<div>` tags around the role tagline and bio callout with `<strong>`, `<em>`, and `<p>`. | `dom_query`: `p strong` exists; no unsemantic `.fake-heading` divs remain (`exists: false`). | 12 |
| `lesson-1-1-3` | Build the Document Skeleton | HTML | `lesson-1-1-2` | `intro`, `multiple-choice`, `code-modification` ("Build it yourself"), `summary` | `project-milestone` | `semantic-profile-launchpad` / `m1:t1` | `index.html` | Complete Milestone 1 Task 1: Wrap the profile page in a valid HTML skeleton (`<header>`, `<main>`, `<footer>`) with a page `<title>`. | `dom_query`: `header`, `main`, `footer` exist; `header h1` exists. | 15 |
| `lesson-1-1-4` | Build Content With Hierarchy | HTML | `lesson-1-1-3` | `intro`, `multiple-choice`, `explanation`, `summary` | `project-milestone` | `semantic-profile-launchpad` / `m1:t2` | `index.html`, `styles.css` | Add a logical heading hierarchy (`<h1>` Name, `<h2>` About Me, `<h2>` Featured Links, `<ul><li>` skill list) without skipping heading levels. | `dom_query`: `h1` count $= 1$; `main h2` count $\ge 2$; `ul > li` count $\ge 3`; `h3` without `h2` forbidden. | 15 |
| `lesson-1-1-5` | Connect Pages and Media | HTML | `lesson-1-1-4` | `intro`, `multiple-choice`, `code-modification` (x2: link + image), `explanation`, `summary` | `project-milestone` | `semantic-profile-launchpad` / `m1:t3` | `index.html`, `styles.css` | Add a profile avatar `<img>` with descriptive `alt` and `width`/`height`, plus a `<nav>` containing 3 external resource `<a>` links with valid `href` attributes. | `dom_query`: `img[alt][src]` exists with non-empty `alt`; `nav a[href]` count $\ge 3$. | 15 |
| `lesson-1-1-6` | Group Content With Semantic Structure | HTML | `lesson-1-1-5` | `intro`, `explanation`, `multiple-choice`, `summary` | `project-milestone` | `semantic-profile-launchpad` / `m2:t1` | `index.html`, `styles.css` | Organize the `<main>` area into distinct `<section>` landmarks (`#about`, `#projects`, `#contact`) and `<article>` project cards. | `dom_query`: `main section` count $\ge 2$; `section article` count $\ge 2$; each `article h3` exists. | 15 |
| `lesson-1-1-7` | Model User Input | HTML | `lesson-1-1-6` | `intro`, `multiple-choice`, `code-modification` ("Build a name field"), `explanation`, `summary` | `project-milestone` | `semantic-profile-launchpad` / `m2:t2` | `index.html`, `styles.css` | Add a "Send a Message" `<form>` inside `#contact` with explicitly associated `<label for="...">`, `<input id="..." type="email" required>`, and `<button type="submit">`. | `dom_query`: `form label[for]` matches `input[id]`; `input[type="email"][required]` exists; `button[type="submit"]` exists. | 15 |
| `lesson-1-1-8` | Forge Mission: Build the Page Structure | HTML | `lesson-1-1-7` | `judgment`, `multiple-choice`, `explanation`, `code-modification` (x2), `summary` | `capstone-project` | `semantic-profile-launchpad` / `m2:t3` (HTML Structure Gate) | `index.html`, `styles.css` | Assemble and verify the complete semantic HTML Developer Bio & Link Launchpad (`header`, `nav`, `main`, `section`, `article`, `img[alt]`, `form` with labeled controls, `footer`). | Full Milestone 1 & 2 HTML DOM suite (`header`, `nav a`, `main section`, `article`, `img[alt]`, `form label[for]`, `button[type="submit"]`, `footer`). | 20 |
| `lesson-1-4-1` | Accessibility Is Part of the Interface | HTML / A11y | `lesson-1-3-12` | Has redundant `replicate-this: Accessible Design System Specimen` (remove redundant step) | `in-lesson-check` | `accessible-interface-remediation` (Audit Intro) | `index.html`, `styles.css` | Identify assistive technology barriers in an inaccessible event card. | In-lesson multiple-choice & reflection checks. | 12 |
| `lesson-1-4-2` | Semantic HTML Is Free Accessibility | HTML / A11y | `lesson-1-4-1` | Remove redundant `replicate-this` | `project-milestone` | `accessible-interface-remediation` / `m1:t1` | `index.html`, `styles.css` | Replace clickable `<div class="btn">` and `<div class="nav">` elements with native `<header>`, `<nav>`, `<main>`, and `<button type="button">` elements. | `dom_query`: `div.btn` `exists: false`; `header`, `nav`, `main`, `button[type="button"]` exist. | 15 |
| `lesson-1-4-3` | Headings Create a Reading Path | HTML / A11y | `lesson-1-4-2` | Remove redundant `replicate-this` | `project-milestone` | `accessible-interface-remediation` / `m1:t2` | `index.html`, `styles.css` | Repair a broken heading outline (`<h1>` $\rightarrow$ `<h4>` $\rightarrow$ `<h2>`) so the Event Portal follows a strict `<h1>` $\rightarrow$ `<h2>` $\rightarrow$ `<h3>` document outline. | `dom_query`: `h1` count $= 1$; `main h2` count $\ge 2$; `section h3` exists; no orphan `h4`. | 15 |
| `lesson-1-4-4` | Links and Buttons Must Say What They Do | HTML / A11y | `lesson-1-4-3` | Remove redundant `replicate-this` | `project-milestone` | `accessible-interface-remediation` / `m1:t3` | `index.html`, `styles.css` | Replace vague `"Click here"` links and icon-only buttons with descriptive link text and `aria-label` attributes. | `dom_query`: `a` with text `"Click here"` `exists: false`; `button#close-modal[aria-label]` exists; `nav a[href]` has descriptive text. | 15 |
| `lesson-1-4-5` | Images Need the Right Text Story | HTML / A11y | `lesson-1-4-4` | Remove redundant `replicate-this` | `project-milestone` | `accessible-interface-remediation` / `m2:t1` | `index.html`, `styles.css` | Provide meaningful `alt` text for the speaker portrait and empty `alt=""` for decorative divider graphics. | `dom_query`: `img.speaker-photo[alt]` has non-empty `alt`; `img.decorative-wave[alt=""]` has exact empty `alt`. | 15 |
| `lesson-1-4-6` | Forms Need Labels and Instructions | HTML / A11y | `lesson-1-4-5` | Remove redundant `replicate-this` | `project-milestone` | `accessible-interface-remediation` / `m2:t2` | `index.html`, `styles.css` | Connect every registration `<input>` and `<select>` to an explicit `<label for="...">` and link helper text via `aria-describedby`. | `dom_query`: `label[for="attendee-email"]`, `input#attendee-email[aria-describedby="email-hint"]`, `#email-hint` exist. | 15 |
| `lesson-1-4-7` | Keyboard Access and Visible Focus | HTML / CSS A11y | `lesson-1-4-6` | Remove redundant `replicate-this` | `project-milestone` | `accessible-interface-remediation` / `m3:t1` | `index.html`, `styles.css` | Remove `outline: none` anti-patterns and add a high-contrast `:focus-visible` ring (`outline: 2px solid`) on interactive controls, plus a skip link `<a class="skip-link" href="#main-content">`. | `dom_query`: `a.skip-link[href="#main-content"]` and `main#main-content` exist; `source_ast_check`: `styles.css` contains `:focus-visible` and does not leave bare `outline: none`. | 15 |
| `lesson-1-4-8` | Color, Contrast, and More Than Color | CSS / A11y | `lesson-1-4-7` | Remove redundant `replicate-this` | `project-milestone` | `accessible-interface-remediation` / `m3:t2` | `index.html`, `styles.css` | Fix low-contrast `#94a3b8` text on `#f8fafc` background to dark high-contrast `#0f172a` and add text/icon status badges so error states do not rely on red color alone. | `computed_style`: `.ticket-body` `color` is `rgb(15, 23, 42)`; `dom_query`: `.field-error [role="alert"]` contains text `"Required:"`. | 15 |
| `lesson-1-4-9` | Accessibility Investigation: Test the Real Path | HTML / CSS A11y | `lesson-1-4-8` | Remove redundant `replicate-this` | `guided-mini-build` | `accessible-interface-remediation` / `m3:t3` | `index.html`, `styles.css` | Audit and fix a modal dialog header and registration summary region (`aria-live="polite"`). | `dom_query`: `[aria-live="polite"]` exists; `dialog` or `[role="dialog"][aria-labelledby]` exists. | 15 |
| `lesson-1-4-10` | Forge Mission: Repair the Interface for More People | HTML / CSS A11y | `lesson-1-4-9` | Keep & tailor `replicate-this` to the full remediation challenge | `capstone-project` | `accessible-interface-remediation` (Full Module Verification) + unlocks `accessible-component-audit` | `index.html`, `styles.css` | Complete the end-to-end Accessible Event Portal remediation and pass all semantic, label, alt-text, contrast, and `:focus-visible` checks. | Full 8-assertion DOM + Computed Style + Source AST suite across M1–M3. | 25 |

---

#### Phase 1B: CSS Presentation & Responsive Layout (`module-1-2` & `module-1-3` — 24 Lessons)

- **Cumulative Module 1-2 Project**: `css-design-surface-system` (**Developer Launchpad Visual Theme & Card Surface**, 4 cumulative milestones styling the HTML built in `module-1-1` / `semantic-profile-launchpad` Milestone 2 + standalone surface system).
- **Cumulative Module 1-3 Project**: `css-responsive-workspace-shell` (**Responsive Portfolio & Navigation Shell**, 4 cumulative milestones across Flexbox, Grid, and Media Queries).

| Lesson ID | Title | Lang | Prereqs | Current Activities & Audit Finding | Deliverable Type | Target Project & Milestone / Task ID | Starting Files | Learner Task & Visible Result | Automated Verification Checks (`ExerciseValidationSpec`) | Est. Min |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `lesson-1-2-1` | CSS Is Presentation | CSS | `lesson-1-1-8` | Has `code-modification` ("Tiny CSS lab") + redundant `replicate-this` (remove redundant `replicate-this`) | `guided-mini-build` | `css-design-surface-system` / `m1:t1` | `index.html` (pre-populated semantic bio), `styles.css` | Apply base background color and text color to `body` and `.profile-card` to separate presentation from HTML structure. | `computed_style`: `.profile-card` `background-color` $\ne$ `rgba(0, 0, 0, 0)`. | 12 |
| `lesson-1-2-2` | Selectors Choose the Target | CSS | `lesson-1-2-1` | Has `code-modification` ("Targeting lab") + remove redundant `replicate-this` | `project-milestone` | `css-design-surface-system` / `m1:t1` | `index.html`, `styles.css` | Target `.profile-card`, `.role-badge`, and `#primary-cta` using class, element, and ID selectors without polluting global `p` or `a` elements. | `computed_style`: `.role-badge` has distinct `color` and `background-color` from `body p`. | 15 |
| `lesson-1-2-3` | Color, Background, and Contrast | CSS | `lesson-1-2-2` | Has `code-modification` ("Fix the contrast") + remove redundant `replicate-this` | `project-milestone` | `css-design-surface-system` / `m1:t2` | `index.html`, `styles.css` | Define CSS custom properties (`--bg-surface`, `--text-primary`, `--accent-primary`) on `:root` and apply high-contrast colors to the card and links. | `source_ast_check`: `styles.css` defines `--bg-surface` and `--accent-primary`; `computed_style`: `.profile-card` uses the surface color. | 15 |
| `lesson-1-2-4` | Text That Reads Like Text | CSS | `lesson-1-2-3` | Has `code-modification` ("Typography lab") + remove redundant `replicate-this` | `project-milestone` | `css-design-surface-system` / `m1:t3` | `index.html`, `styles.css` | Style `h1`, `h2`, and `.bio-copy` with a clear typographic scale (`font-size`, `font-weight: 700`, `line-height: 1.6`, `letter-spacing`). | `computed_style`: `h1` `font-weight` $\ge 700$; `.bio-copy` `line-height` $> \text{font-size}$. | 15 |
| `lesson-1-2-5` | The Box Model | CSS | `lesson-1-2-4` | Replace generic `replicate-this` with focused Box Model padding/margin task | `project-milestone` | `css-design-surface-system` / `m2:t1` | `index.html`, `styles.css` | Add internal breathing room (`padding: 24px`) to `.profile-card` and vertical separation (`margin-bottom: 16px`) between `.project-item` cards. | `computed_style`: `.profile-card` `padding-top` $= \text{"24px"}$; `.project-item` `margin-bottom` $= \text{"16px"}$. | 15 |
| `lesson-1-2-6` | Sizing Without Guessing | CSS | `lesson-1-2-5` | Has `code-modification` ("Sizing lab") + remove redundant `replicate-this` | `project-milestone` | `css-design-surface-system` / `m2:t2` | `index.html`, `styles.css` | Apply `box-sizing: border-box` globally and constrain `.profile-card` with `max-width: 560px` and `width: 100%` so it never overflows small viewports. | `computed_style`: `.profile-card` `box-sizing` $= \text{"border-box"}$ and `max-width` $= \text{"560px"}$. | 15 |
| `lesson-1-2-7` | Borders, Radius, and Shadows | CSS | `lesson-1-2-6` | Has `code-modification` ("Surface lab") + remove redundant `replicate-this` | `project-milestone` | `css-design-surface-system` / `m2:t3` | `index.html`, `styles.css` | Give `.profile-card` and `.link-pill` refined surface boundaries using `border`, `border-radius: 16px`, and `box-shadow`. | `computed_style`: `.profile-card` `border-radius` $= \text{"16px"}$ and `border-top-width` $= \text{"1px"}$. | 15 |
| `lesson-1-2-8` | The Cascade: When Rules Meet | CSS | `lesson-1-2-7` | Replace generic `replicate-this` with cascade conflict repair lab | `guided-mini-build` | `css-design-surface-system` / `m3:t1` | `index.html`, `styles.css` | Resolve a specificity conflict where a broad `.card-list a` selector overrides `.link-pill.featured`, without using `!important`. | `computed_style`: `.link-pill.featured` has accent background; `source_ast_check`: `!important` is `forbidden: true`. | 15 |
| `lesson-1-2-9` | Inheritance and Defaults | CSS | `lesson-1-2-8` | Replace generic `replicate-this` with inheritance cleanup lab | `guided-mini-build` | `css-design-surface-system` / `m3:t2` | `index.html`, `styles.css` | Move repeated `font-family` and `color` declarations to `body` and set `font: inherit` on `<button>` and `<input>` elements. | `computed_style`: `button` `font-family` matches `body` `font-family`. | 12 |
| `lesson-1-2-10` | States: Hover, Focus, and More | CSS | `lesson-1-2-9` | Has `code-modification` ("State lab") + remove redundant `replicate-this` | `project-milestone` | `css-design-surface-system` / `m4:t1` | `index.html`, `styles.css` | Add `:hover`, `:active`, and `:focus-visible` rules with smooth `transition` to `.link-pill` and `button[type="submit"]`. | `source_ast_check`: `styles.css` includes `.link-pill:hover` and `:focus-visible` and `transition`. | 15 |
| `lesson-1-2-11` | CSS Investigation: Find the Rule | CSS | `lesson-1-2-10` | Remove redundant `replicate-this` | `guided-mini-build` | `css-design-surface-system` / `m4:t2` | `index.html`, `styles.css` | Diagnose and fix 3 visual regressions in the card surface (collapsed padding, invisible focus ring, clipped badge). | `computed_style`: `.profile-card` `padding-left` $= \text{"24px"}$; `.role-badge` `overflow` $\ne \text{"hidden"}$. | 15 |
| `lesson-1-2-12` | Forge Mission: Make the Structure Look Intentional | CSS | `lesson-1-2-11` | Keep & tailor `replicate-this: Box Model & Surface Card` | `capstone-project` | `css-design-surface-system` (Full Verification) & `semantic-profile-launchpad` / `m2` | `index.html`, `styles.css` | Complete the full visual surface styling of the Developer Launchpad (`:root` tokens, typography, box model, card borders/radius, interactive states). | Full DOM + Computed Style + Source AST check suite. | 20 |
| `lesson-1-3-1` | Layout Starts With Flow | CSS Layout | `lesson-1-2-12` | Remove redundant `replicate-this: Flexbox Navigation Bar` | `in-lesson-check` | `css-responsive-workspace-shell` (Flow Intro) | `index.html`, `styles.css` | Predict normal document flow stacking before introducing layout containers. | In-lesson check validation. | 12 |
| `lesson-1-3-2` | Block and Inline: Two Different Kinds of Flow | CSS Layout | `lesson-1-3-1` | Remove redundant `replicate-this` | `guided-mini-build` | `css-responsive-workspace-shell` / `m1:t1` | `index.html`, `styles.css` | Convert inline `.tag-badge` links to `display: inline-block` so vertical padding and dimensions take effect cleanly. | `computed_style`: `.tag-badge` `display` $= \text{"inline-block"}$. | 12 |
| `lesson-1-3-3` | Space in Flow | CSS Layout | `lesson-1-3-2` | Remove redundant `replicate-this` | `project-milestone` | `css-responsive-workspace-shell` / `m1:t2` | `index.html`, `styles.css` | Center the `.page-container` (`max-width: 1024px; margin: 0 auto; padding: 0 24px`) and establish consistent section rhythm. | `computed_style`: `.page-container` `max-width` $= \text{"1024px"}$; `padding-left` $= \text{"24px"}$. | 15 |
| `lesson-1-3-4` | Flexbox: Put Items Into One Flow | CSS Layout | `lesson-1-3-3` | Has `code-modification` ("Tiny lab") + remove redundant `replicate-this` | `project-milestone` | `css-responsive-workspace-shell` / `m2:t1` | `index.html`, `styles.css` | Turn `.site-header` and `.nav-list` into Flex containers (`display: flex`) so the brand logo and navigation links sit in a single row. | `computed_style`: `.site-header` `display` $= \text{"flex"}$; `.nav-list` `display` $= \text{"flex"}$. | 15 |
| `lesson-1-3-5` | Flex Direction and Gap | CSS Layout | `lesson-1-3-4` | Remove redundant `replicate-this` | `project-milestone` | `css-responsive-workspace-shell` / `m2:t2` | `index.html`, `styles.css` | Configure `flex-direction: column` with `gap: 16px` on `.hero-stack` and `gap: 24px` on `.nav-list`. | `computed_style`: `.hero-stack` `flex-direction` $= \text{"column"}$ and `row-gap` $= \text{"16px"}$; `.nav-list` `column-gap` $= \text{"24px"}$. | 15 |
| `lesson-1-3-6` | Alignment: Where Should Items Sit? | CSS Layout | `lesson-1-3-5` | Has `code-modification` ("Tiny lab") + keep `replicate-this: Flexbox Navigation Bar` here! | `project-milestone` | `css-responsive-workspace-shell` / `m2:t3` | `index.html`, `styles.css` | Align `.site-header` with `justify-content: space-between` and `align-items: center` to complete the Flexbox Navigation Bar milestone. | `computed_style`: `.site-header` `justify-content` $= \text{"space-between"}$ and `align-items` $= \text{"center"}$. | 15 |
| `lesson-1-3-7` | Wrapping and Flexible Space | CSS Layout | `lesson-1-3-6` | Remove redundant `replicate-this` | `project-milestone` | `css-responsive-workspace-shell` / `m3:t1` | `index.html`, `styles.css` | Add `flex-wrap: wrap` and `flex: 1 1 260px` to `.stat-strip` items so metric cards wrap gracefully instead of overflowing. | `computed_style`: `.stat-strip` `flex-wrap` $= \text{"wrap"}$. | 15 |
| `lesson-1-3-8` | Grid: Two Dimensions | CSS Layout | `lesson-1-3-7` | Remove redundant Flexbox `replicate-this`; add Grid gallery task | `project-milestone` | `css-responsive-workspace-shell` / `m3:t2` | `index.html`, `styles.css` | Build the 2D `.projects-grid` using `display: grid`, `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`, and `gap: 24px`. | `computed_style`: `.projects-grid` `display` $= \text{"grid"}$ and `row-gap` $= \text{"24px"}$. | 15 |
| `lesson-1-3-9` | Responsive Thinking: Design for Constraints | CSS Layout | `lesson-1-3-8` | Remove redundant `replicate-this` | `in-lesson-check` | `css-responsive-workspace-shell` (Responsive Audit) | `index.html`, `styles.css` | Identify fixed-pixel width anti-patterns that cause horizontal scrolling on 375px viewports. | In-lesson check validation. | 12 |
| `lesson-1-3-10` | Media Queries: Change the Rules When Needed | CSS Layout | `lesson-1-3-9` | Remove redundant `replicate-this`; add Media Query task | `project-milestone` | `css-responsive-workspace-shell` / `m4:t1` | `index.html`, `styles.css` | Write a mobile-first `@media (min-width: 768px)` rule that switches `.hero-layout` from stacked column to two-column row. | `source_ast_check`: `styles.css` contains `@media` and `min-width`; `computed_style`: `.hero-layout` `display` $= \text{"flex"}$ or `"grid"`. | 15 |
| `lesson-1-3-11` | Layout Investigation: Find the Broken Relationship | CSS Layout | `lesson-1-3-10` | Remove redundant `replicate-this` | `guided-mini-build` | `css-responsive-workspace-shell` / `m4:t2` | `index.html`, `styles.css` | Fix an overflowing card header and squished badge (`flex-shrink: 0`, `min-width: 0`) inside the project gallery. | `computed_style`: `.card-badge` `flex-shrink` $= \text{"0"}$. | 15 |
| `lesson-1-3-12` | Forge Mission: Build a Layout That Survives Change | CSS Layout | `lesson-1-3-11` | Tailor mission to full Responsive Portfolio Layout | `capstone-project` | `css-responsive-workspace-shell` (Full Module Verification) + `portfolio-site` / `m1` | `index.html`, `styles.css` | Complete and verify the Responsive Portfolio Shell combining a Flexbox navbar, wrapping metric strip, CSS Grid project gallery, and responsive media query. | Full DOM + Computed Style + Source AST verification across navbar, grid, and media query. | 25 |

---

#### Phase 2A: JavaScript Language & Browser DOM (`module-2-1` & `module-2-2` — 20 Lessons)

- **Cumulative Module 2-1 Project**: `js-logic-and-data-engine` (**Developer Study & Task Analytics Engine**, 4 cumulative milestones across variables, conditionals, loops, functions, arrays, and objects, with live DOM/console output in Beginner Playground).
- **Cumulative Module 2-2 Project**: `js-dom-interactive-taskboard` (**Interactive Study Planner & Persistent Task Board**, 4 cumulative milestones across DOM querying, `textContent`, `classList`, event listeners, forms, `preventDefault()`, and `localStorage`).

| Lesson ID | Title | Lang | Prereqs | Current Activities | Deliverable Type | Target Project & Milestone / Task ID | Starting Files | Learner Task & Visible Result | Automated Verification Checks (`ExerciseValidationSpec`) | Est. Min |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `lesson-2-1-1` | JavaScript Gives Instructions a Shape | JS | `lesson-1-4-10` | `intro`, `visual`, `explanation`, `multiple-choice`, `reflection`, `summary` | `guided-mini-build` | `js-logic-and-data-engine` / `m1:t1` | `index.html`, `styles.css`, `app.js` | Compute total study minutes from session expressions and log/render the result to `#total-minutes`. | `js_evaluation`: `typeof totalMinutes === "number" && totalMinutes === 135`; `dom_query`: `#total-minutes` textContains `"135"`. | 12 |
| `lesson-2-1-2` | Variables: Give Values a Name | JS | `lesson-2-1-1` | Includes `code-modification` ("Build") | `project-milestone` | `js-logic-and-data-engine` / `m1:t1` | `index.html`, `styles.css`, `app.js` | Declare `const learnerName`, `let completedCount`, and `const dailyGoal`, then update `completedCount` and display the summary banner. | `js_evaluation`: `typeof learnerName === "string" && completedCount >= 1`; `dom_query`: `#learner-banner` textContains `learnerName`. | 15 |
| `lesson-2-1-3` | Types: Values Behave Differently | JS | `lesson-2-1-2` | No code lab currently | `project-milestone` | `js-logic-and-data-engine` / `m1:t2` | `index.html`, `styles.css`, `app.js` | Fix a string-concatenation bug (`"25" + 15 === "2515"`) using `Number()` conversion so the score calculator outputs numeric `40`. | `js_evaluation`: `calculateTotal("25", 15) === 40`; `dom_query`: `#score-output` textExact `"40"`. | 15 |
| `lesson-2-1-4` | Decisions: Let the Program Choose | JS | `lesson-2-1-3` | Includes `code-modification` ("Build") | `project-milestone` | `js-logic-and-data-engine` / `m2:t1` | `index.html`, `styles.css`, `app.js` | Write `getStreakStatus(completed, goal)` using `if / else if / else` to return `"Goal Met"`, `"Almost There"`, or `"Keep Going"`. | `js_evaluation`: `getStreakStatus(5, 5) === "Goal Met" && getStreakStatus(0, 5) === "Keep Going"`. | 15 |
| `lesson-2-1-5` | Repetition: Let the Program Do the Same Work Again | JS | `lesson-2-1-4` | Includes `code-modification` ("Build") | `project-milestone` | `js-logic-and-data-engine` / `m2:t2` | `index.html`, `styles.css`, `app.js` | Use a `for` loop to sum an array of daily study durations into `weeklyTotal` without hardcoding indices. | `js_evaluation`: `sumDurations([20, 35, 45]) === 100`; `source_ast_check`: `app.js` uses `for`. | 15 |
| `lesson-2-1-6` | Functions: Name a Job | JS | `lesson-2-1-5` | Includes `code-modification` ("Build") | `project-milestone` | `js-logic-and-data-engine` / `m3:t1` | `index.html`, `styles.css`, `app.js` | Define reusable `formatProgressLabel(done, total)` returning `"X of Y completed (Z%)"` and render it into `#progress-label`. | `js_evaluation`: `formatProgressLabel(3, 4) === "3 of 4 completed (75%)"`; `dom_query`: `#progress-label` textContains `"75%"`. | 15 |
| `lesson-2-1-7` | Arrays: Work With Ordered Values | JS | `lesson-2-1-6` | Includes `code-modification` ("Build") | `project-milestone` | `js-logic-and-data-engine` / `m3:t2` | `index.html`, `styles.css`, `app.js` | Filter and format an array of study modules to list completed items and count remaining items. | `js_evaluation`: `Array.isArray(getPendingItems(["HTML", "CSS"], ["HTML"])) && getPendingItems(["HTML", "CSS"], ["HTML"]).length === 1`. | 15 |
| `lesson-2-1-8` | Objects: Describe a Thing With Named Data | JS | `lesson-2-1-7` | Includes `code-modification` ("Build") | `project-milestone` | `js-logic-and-data-engine` / `m4:t1` | `index.html`, `styles.css`, `app.js` | Model a task record `{ id, title, minutes, completed }` and implement `toggleTaskRecord(task)` returning an updated status. | `js_evaluation`: `toggleTaskRecord({ id: 1, title: "DOM", minutes: 20, completed: false }).completed === true`. | 15 |
| `lesson-2-1-9` | Scope and Composition: Keep the Work Understandable | JS | `lesson-2-1-8` | No code lab currently | `project-milestone` | `js-logic-and-data-engine` / `m4:t2` | `index.html`, `styles.css`, `app.js` | Compose `sumDurations`, `getStreakStatus`, and `formatProgressLabel` inside `buildDashboardSummary(tasks)` without leaking globals. | `js_evaluation`: `buildDashboardSummary([{ minutes: 30, completed: true }]).totalMinutes === 30`. | 15 |
| `lesson-2-1-10` | Forge Mission: Read, Predict, Repair | JS | `lesson-2-1-9` | No code lab currently (add mission code lab + project gate) | `capstone-project` | `js-logic-and-data-engine` (Full Module Verification) | `index.html`, `styles.css`, `app.js` | Repair 3 logic bugs in the Study Analytics Engine (off-by-one loop, mutated object state, wrong threshold comparison) and verify live dashboard metrics. | Full `js_evaluation` + `dom_query` suite verifying `#total-minutes`, `#progress-label`, and `#streak-badge`. | 20 |
| `lesson-2-2-1` | The Page Is a Data Structure | JS DOM | `lesson-2-1-10` | Conceptual DOM tree introduction | `in-lesson-check` | `js-dom-interactive-taskboard` (DOM Intro) | `index.html`, `styles.css`, `app.js` | Trace parent/child node relationships in the Interactive Study Planner HTML structure. | In-lesson check validation. | 12 |
| `lesson-2-2-2` | Find the Thing You Need | JS DOM | `lesson-2-2-1` | Includes `code-modification` ("Try it") | `project-milestone` | `js-dom-interactive-taskboard` / `m1:t1` | `index.html`, `styles.css`, `app.js` | Use `document.querySelector` and `document.querySelectorAll` to select `#board-title`, `#task-list`, and `.task-card` elements. | `js_evaluation`: `selectedTitle?.id === "board-title" && selectedCards?.length === 3`. | 15 |
| `lesson-2-2-3` | Read and Change the Page | JS DOM | `lesson-2-2-2` | Includes `code-modification` ("Change one thing") | `project-milestone` | `js-dom-interactive-taskboard` / `m1:t2` | `index.html`, `styles.css`, `app.js` | Dynamically compute the number of `.task-card` elements and update `#remaining-count` using `textContent`. | `dom_query`: `#remaining-count` textExact `"3 tasks remaining"`. | 15 |
| `lesson-2-2-4` | Classes Connect Structure and Presentation | JS DOM | `lesson-2-2-3` | No code lab currently | `project-milestone` | `js-dom-interactive-taskboard` / `m2:t1` | `index.html`, `styles.css`, `app.js` | Implement `setFilterHighlight(activeBtn)` and `toggleCardCompleted(cardEl)` using `classList.add`, `classList.remove`, and `classList.toggle("is-completed")`. | `dom_query`: `.task-card.is-completed` exists after function call; `computed_style`: `.task-card.is-completed` changes opacity/border. | 15 |
| `lesson-2-2-5` | Events: The Browser Waits | JS DOM | `lesson-2-2-4` | Includes `code-modification` ("Try it") | `project-milestone` | `js-dom-interactive-taskboard` / `m2:t2` | `index.html`, `styles.css`, `app.js` | Attach a `click` listener via `addEventListener("click", ...)` to `#mark-all-btn` that marks all tasks completed and updates `#remaining-count` to `"0 tasks remaining"`. | `actions`: `[{ type: "click", selector: "#mark-all-btn" }]` $\rightarrow$ `dom_query`: `#remaining-count` textExact `"0 tasks remaining"`; `.task-card.is-completed` count $= 3$. | 15 |
| `lesson-2-2-6` | Event Data: Know What Happened | JS DOM | `lesson-2-2-5` | No code lab currently | `project-milestone` | `js-dom-interactive-taskboard` / `m2:t3` | `index.html`, `styles.css`, `app.js` | Attach a delegated `click` listener on `#task-list` using `event.target.closest(".toggle-task-btn")` to toggle individual task cards and recalculate the counter. | `actions`: `[{ type: "click", selector: ".task-card:first-child .toggle-task-btn" }]` $\rightarrow$ `dom_query`: `.task-card:first-child` hasClass `"is-completed"`; `#remaining-count` textContains `"2"`. | 15 |
| `lesson-2-2-7` | Forms: Read What the User Entered | JS DOM | `lesson-2-2-6` | Includes `code-modification` ("Try a variation") | `project-milestone` | `js-dom-interactive-taskboard` / `m3:t1` | `index.html`, `styles.css`, `app.js` | Read `input#new-task-input.value` and `select#new-task-category.value`, create a new `.task-card` DOM node, append it to `#task-list`, and clear the input. | `actions`: `[{ type: "setValue", selector: "#new-task-input", value: "Ship CSS Grid" }, { type: "click", selector: "#add-task-btn" }]` $\rightarrow$ `dom_query`: `#task-list .task-card` count $= 4$, textContains `"Ship CSS Grid"`. | 15 |
| `lesson-2-2-8` | Default Browser Actions and Control | JS DOM | `lesson-2-2-7` | No code lab currently | `project-milestone` | `js-dom-interactive-taskboard` / `m3:t2` | `index.html`, `styles.css`, `app.js` | Handle the `submit` event on `form#new-task-form` with `event.preventDefault()`, validate non-empty input (showing `#form-error` if blank), and append valid tasks. | `actions`: `[{ type: "submit", selector: "#new-task-form" }]` (empty) $\rightarrow$ `dom_query`: `#form-error` textContains `"Please enter a task"`; then `setValue` + `submit` $\rightarrow$ appends card. | 15 |
| `lesson-2-2-9` | Remembering Between Refreshes | JS DOM | `lesson-2-2-8` | No code lab currently | `project-milestone` | `js-dom-interactive-taskboard` / `m4:t1` | `index.html`, `styles.css`, `app.js` | Persist the tasks array to `localStorage.setItem("forge_study_tasks", JSON.stringify(tasks))` on every mutation and hydrate from `localStorage.getItem` on load. | `actions`: add task $\rightarrow$ `js_evaluation`: `JSON.parse(localStorage.getItem("forge_study_tasks") || "[]").length >= 4`. | 15 |
| `lesson-2-2-10` | Forge Mission: Build an Interactive Page | HTML+CSS+JS | `lesson-2-2-9` | No code lab currently (add full capstone mission link) | `capstone-project` | `js-dom-interactive-taskboard` (Full Verification) & `semantic-profile-launchpad` / `m3` | `index.html`, `styles.css`, `app.js` | Complete and verify the full Interactive Study Planner & Task Board: semantic HTML form + list, CSS completed/active states, delegated toggle, form `preventDefault()` + validation, category filter, and `localStorage` persistence. | Multi-step interactive validation (`actions`: submit empty form $\rightarrow$ verify error; submit valid task $\rightarrow$ verify DOM card + counter; click toggle $\rightarrow$ verify `.is-completed` + `localStorage`). | 25 |

---

#### Phase 2B: TypeScript, Web APIs & Git Workflow (`module-2-3`, `module-2-4`, `module-2-5` — 25 Lessons)

- **Cumulative Module 2-3 Project**: `js-to-ts-migration` (**Typed Study Planner & Domain Model Migration**, 3 cumulative milestones across `lesson-2-3-1`..`lesson-2-3-8`).
- **Cumulative Module 2-4 Project**: `integrated-api-status-dashboard` (**Live Service & Weather Data Explorer**, 3 cumulative milestones across `lesson-2-4-1`..`lesson-2-4-7` integrating HTML, CSS, `fetch`, `async/await`, loading/error states, and retry controls).
- **Cumulative Module 2-5 Project**: `git-release-readiness-sim` (**Release Branch & Conflict Resolution Workbench**, 3 cumulative milestones across `lesson-2-5-1`..`lesson-2-5-10`).

| Lesson ID | Title | Module & Subject | Prereqs | Deliverable Type | Target Project & Milestone / Task ID | Learner Task & Visible Result | Automated Verification Checks (`ExerciseValidationSpec`) | Est. Min |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `lesson-2-3-1` | Why TypeScript Exists | `module-2-3` (TS) | `lesson-2-2-10` | `in-lesson-check` | `js-to-ts-migration` (Intro) | Identify runtime property-access bugs that static type checking catches before execution. | In-lesson check validation. | 12 |
| `lesson-2-3-2` | Inference Before Annotation | `module-2-3` (TS) | `lesson-2-3-1` | `guided-mini-build` | `js-to-ts-migration` / `m1:t1` | Remove redundant primitive annotations while adding explicit type annotations for uninitialized state variables in `App.ts`. | `source_ast_check` & compiler zero-diagnostics check. | 12 |
| `lesson-2-3-3` | Functions: Make Inputs and Outputs Explicit | `module-2-3` (TS) | `lesson-2-3-2` | `project-milestone` | `js-to-ts-migration` / `m1:t2` | Add explicit parameter and return types to `calculateSprintVelocity(tasks: TaskItem[]): number`. | `js_evaluation`: function returns expected number; compiler zero errors. | 15 |
| `lesson-2-3-4` | Objects and Named Shapes | `module-2-3` (TS) | `lesson-2-3-3` | `project-milestone` | `js-to-ts-migration` / `m1:t3` | Define `interface TaskItem` and `interface MilestoneSummary` in `types.ts` and render typed cards. | `source_ast_check`: `interface TaskItem` exists; `dom_query`: `.typed-card` count $\ge 2$. | 15 |
| `lesson-2-3-5` | Unions: More Than One Valid Possibility | `module-2-3` (TS) | `lesson-2-3-4` | `project-milestone` | `js-to-ts-migration` / `m2:t1` | Define `type TaskStatus = "todo" \| "in-progress" \| "verified"` and `type FilterMode = "all" \| TaskStatus`. | `source_ast_check`: union type definition present; `dom_query`: status badge rendered. | 15 |
| `lesson-2-3-6` | Narrowing: Prove What You Have | `module-2-3` (TS) | `lesson-2-3-5` | `project-milestone` | `js-to-ts-migration` / `m2:t2` | Narrow a discriminated union `ApiResult<T>` (`{ status: "ok", data: T } \| { status: "error", message: string }`) before rendering data. | `dom_query`: renders `.data-view` on success and `.error-banner` on error state. | 15 |
| `lesson-2-3-7` | Generics: Preserve the Relationship | `module-2-3` (TS) | `lesson-2-3-6` | `project-milestone` | `js-to-ts-migration` / `m2:t3` | Implement generic helper `groupByKey<T, K extends keyof T>(items: T[], key: K)` and render grouped counts. | `js_evaluation`: `Object.keys(groupByKey(sampleTasks, "status")).length >= 2`. | 15 |
| `lesson-2-3-8` | Forge Mission: Make Intent Explicit | `module-2-3` (TS) | `lesson-2-3-7` | `capstone-project` | `js-to-ts-migration` / `m3` (Full Verification) | Complete the JavaScript-to-TypeScript migration with discriminated unions, exhaustive narrowing, and zero compiler errors. | Full `source_ast_check` + `js_evaluation` + `dom_query` suite. | 20 |
| `lesson-2-4-1` | APIs Are Agreements | `module-2-4` (APIs) | `lesson-2-3-8` | `in-lesson-check` | `integrated-api-status-dashboard` (Contract Check) | Inspect request/response contract shapes and status codes. | In-lesson check validation. | 12 |
| `lesson-2-4-2` | HTTP: What Are We Asking For? | `module-2-4` (APIs) | `lesson-2-4-1` | `in-lesson-check` | `integrated-api-status-dashboard` (HTTP Check) | Match HTTP methods (`GET`, `POST`, `PATCH`) and status classes (`200`, `400`, `500`) to UI states. | In-lesson check validation. | 12 |
| `lesson-2-4-3` | JSON: Data With a Shape | `module-2-4` (APIs) | `lesson-2-4-2` | `project-milestone` | `integrated-api-status-dashboard` / `m1:t1` | Parse a JSON service payload (`JSON.parse`) and render `.service-card` items into `#service-grid`. | `dom_query`: `#service-grid .service-card` count $= 3$; `.service-name` non-empty. | 15 |
| `lesson-2-4-4` | Fetch: Ask for Data | `module-2-4` (APIs) | `lesson-2-4-3` | `project-milestone` | `integrated-api-status-dashboard` / `m1:t2` | Call the sandbox mock endpoint `fetch("/api/services")` (or provided `fetchServices()`), check `response.ok`, and populate `#service-grid`. | `dom_query`: `#service-grid .service-card` count $\ge 3$ after async load. | 15 |
| `lesson-2-4-5` | Promises: The Result Arrives Later | `module-2-4` (APIs) | `lesson-2-4-4` | `project-milestone` | `integrated-api-status-dashboard` / `m2:t1` | Refactor promise chains into clean `async / await` with `try / catch` error handling. | `source_ast_check`: uses `async` and `await` and `try`; `dom_query`: renders loaded cards. | 15 |
| `lesson-2-4-6` | Loading, Success, Failure | `module-2-4` (APIs) | `lesson-2-4-5` | `project-milestone` | `integrated-api-status-dashboard` / `m2:t2` | Render explicit `#loading-indicator`, `#service-grid` (on success), and `#error-panel` with a `#retry-btn` when the request rejects or returns `!response.ok`. | `actions`: trigger failure mode $\rightarrow$ `dom_query`: `#error-panel` exists; click `#retry-btn` $\rightarrow$ `#service-grid .service-card` count $\ge 3$. | 15 |
| `lesson-2-4-7` | Forge Mission: Build With Remote Data | `module-2-4` (APIs) | `lesson-2-4-6` | `capstone-project` | `integrated-api-status-dashboard` / `m3` (Full Verification) | Complete the Live Service Explorer with search filter, status filter (`All`, `Healthy`, `Degraded`), loading state, error recovery button, and live card rendering. | Full DOM + interactive action suite (`setValue` search input, click status filter, click retry). | 25 |
| `lesson-2-5-1`..`lesson-2-5-9` | Version Control, Working Tree, Stage/Commit, Diff/History, Branches, Remotes, PRs, Merge Conflicts, Undo (`9 lessons`) | `module-2-5` (Git) | `lesson-2-4-7` | `in-lesson-check` & `guided-mini-build` (`lesson-2-5-8`) | `git-release-readiness-sim` / `m1` & `m2` | Practice staging, commit message craft, branch isolation, and resolving conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) in code files. | In-lesson checks + `lesson-2-5-8` conflict marker removal check (`source_ast_check`: `<<<<<<<` `forbidden: true`, `dom_query` renders merged header). | 12 ea |
| `lesson-2-5-10` | Forge Mission: Ship a Small Change Safely | `module-2-5` (Git) | `lesson-2-5-9` | `capstone-project` | `git-release-readiness-sim` / `m3` | Resolve a 2-file merge conflict in `index.html` and `app.js`, verify zero conflict markers remain, and pass the release smoke checks. | `source_ast_check`: `<<<<<<<`, `=======`, `>>>>>>>` `forbidden: true`; `dom_query`: `#release-banner` textContains `"v1.2.0 Ready"`. | 20 |

---

#### Phase 3 & 4: React & Next.js Application Engineering (`module-3-1` through `module-4-2` — 56 Lessons)

- **Audit Remediation Note**: Remove the bulk copy-pasted `"Replicate UI: Accessible Design System Specimen"` step from all 9 lessons in `module-3-1` and all 15 lessons in `module-4-1`.
- **Module Projects & Capstones**:
  - `module-3-1` (`React: Think in UI State`, 9 lessons: `lesson-3-1-1`..`lesson-3-1-9`): Maps to **`react-searchable-product-board`** (Milestone 1: Components & Props `lesson-3-1-1`..`3-1-4`; Milestone 2: Minimal State & Derived Filtering `lesson-3-1-5`..`3-1-7`; Milestone 3: Lifted Search & Category Filter `lesson-3-1-8`..`3-1-9`).
  - `module-3-2` (`React: Interaction and Effects`, 9 lessons: `lesson-3-2-1`..`lesson-3-2-9`): Maps to **`react-interactive-settings-panel`** & **`kanban-board` Milestone 1** (Milestone 1: Event Callbacks & Controlled Inputs `lesson-3-2-1`..`3-2-5`; Milestone 2: Synchronized Effects & Cleanup `lesson-3-2-6`..`3-2-9`).
  - `module-3-3` (`React: Component Design and Application Patterns`, 9 lessons: `lesson-3-3-1`..`lesson-3-3-9`): Maps to **`component-library`** (`Design System & Component Library` — Milestone 1: Props API & Composition `lesson-3-3-1`..`3-3-4`; Milestone 2: Controlled/Uncontrolled Primitives & Keys `lesson-3-3-5`..`3-3-7`; Milestone 3: Compound Components Refactor `lesson-3-3-8`..`3-3-9`).
  - `module-3-4` (`Routing, Data Flow, and React Applications`, 9 lessons: `lesson-3-4-1`..`lesson-3-4-9`): Maps to **`e-commerce-checkout`** & **`kanban-board` Milestones 2–3** (Milestone 1: Route & URL State `lesson-3-4-1`..`3-4-4`; Milestone 2: Reducer Workflow & Route Mutations `lesson-3-4-5`..`3-4-9`).
  - `module-4-1` (`Next.js Application Engineering`, 15 lessons: `lesson-4-1-1`..`lesson-4-1-15`): Maps to **`nextjs-server-components-migration`** (Milestone 1: App Router & Layouts `lesson-4-1-1`..`4-1-4`; Milestone 2: Server/Client Component Split & Streaming `lesson-4-1-5`..`4-1-10`; Milestone 3: Route Handlers, Server Actions & Caching `lesson-4-1-11`..`4-1-15`).
  - `module-4-2` (`Application State`, 5 lessons: `lesson-4-2-1`..`lesson-4-2-5`): Maps to **`ai-chat-workspace`** & **`product-spec-to-architecture-plan`** (Milestone 1: State Classification & Ownership `lesson-4-2-1`..`4-2-2`; Milestone 2: Context & Server Cache Synchronization `lesson-4-2-3`..`4-2-5`).

---

## 4. Workstream B & C — Proposed Project Catalog & Prerequisite Graph

### 4.1 Fixing `src/data/projects.json` & Adding Missing Progressive Track Projects

Currently, `src/data/projects.json` has 11 projects, 10 of which point to non-existent `moduleId`s, and jumps straight from 1 beginner HTML/CSS project (`semantic-profile-launchpad`) to intermediate/advanced React/TS projects.

We will normalize and expand `src/data/projects.json` into a **14-project progressive catalog** organized into four clear capability tracks, where every project has:
- A valid `moduleId` matching `src/data/modules.json` (`module-1-1` through `module-4-2`).
- Explicit `prerequisiteLessonIds: string[]` and `recommendedAfterLessonId: string` so `/projects` and `/projects/$projectId` compute exact readiness against `useProgressStore.completedLessons`.
- Authentic, project-specific `starterFiles: PlaygroundFile[]` and `solutionFiles: PlaygroundFile[]` stored in a dedicated registry (`src/lib/project-workspace-templates.ts` + `src/data/project-workspaces/*.ts`), replacing the single hardcoded generic boilerplate.
- Per-task `validationSpec: ExerciseValidationSpec` so every task is verified by real DOM, CSS computed style, and JS runtime assertions in the preview iframe.

### 4.2 Progressive Project Catalog Overview

| Project ID | Title | Track & Runtime | Module ID | Unlock Prereq (`prerequisiteLessonIds`) | Milestones & Core Deliverable |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`semantic-profile-launchpad`** *(Existing ID, Upgraded)* | Personal Developer Bio & Link Launchpad | **Track 1: HTML & CSS Foundations** (`html-css`) | `module-1-1` | Unlocks M1 at `lesson-1-1-3`; M2 at `lesson-1-1-8` | **M1**: Semantic document skeleton (`header`, `main`, `footer`), heading hierarchy (`h1`, `h2`), avatar `img[alt]`, and `nav` resource links.<br>**M2**: Semantic `<section>`/`<article>` project cards and labeled contact `<form>` (`label[for]`, `input[type="email"][required]`, `button[type="submit"]`). |
| **`css-design-surface-system`** *(New Module 1-2 Project)* | Developer Launchpad Visual Theme & Card Surface | **Track 1: CSS Styling** (`html-css`) | `module-1-2` | `["lesson-1-1-8"]` (M1 unlocks at `lesson-1-2-2`, full at `lesson-1-2-12`) | **M1**: `:root` color tokens (`--bg-surface`, `--accent-primary`) & typographic scale (`h1`, `.bio-copy`).<br>**M2**: Box Model (`box-sizing: border-box`, `padding: 24px`, `max-width: 560px`, `border-radius: 16px`).<br>**M3**: Interactive `:hover` and `:focus-visible` states without `!important`. |
| **`css-responsive-workspace-shell`** *(New Module 1-3 Project)* | Responsive Portfolio & Navigation Shell | **Track 1: CSS Layout** (`html-css`) | `module-1-3` | `["lesson-1-2-12"]` (M1 at `lesson-1-3-4`, full at `lesson-1-3-12`) | **M1**: Centered `.page-container` & Flexbox `.site-header` (`display: flex; justify-content: space-between; align-items: center`).<br>**M2**: 2D CSS Grid `.projects-grid` (`display: grid; gap: 24px`).<br>**M3**: Mobile-first `@media (min-width: 768px)` responsive hero and card adaptation. |
| **`accessible-interface-remediation`** *(New Module 1-4 Project)* | Accessible Event Registration Portal | **Track 1: HTML + CSS A11y** (`html-css`) | `module-1-4` | `["lesson-1-3-12"]` | **M1**: Landmark replacement (`header`, `nav`, `main`, native `button`) & logical heading outline.<br>**M2**: Informative vs. decorative `img[alt]` and explicit `<label for>` + `aria-describedby` form fields.<br>**M3**: Skip link (`a.skip-link`), `:focus-visible` outline, and WCAG AA contrast remediation. |
| **`js-logic-and-data-engine`** *(New Module 2-1 Project)* | Study Streak & Task Analytics Engine | **Track 2: JavaScript Logic** (`html-css-js`) | `module-2-1` | `["lesson-1-4-10"]` | **M1**: Numeric type coercion & streak decision function (`getStreakStatus`).<br>**M2**: Loop aggregation (`sumDurations`) & reusable progress formatter (`formatProgressLabel`).<br>**M3**: Array filtering (`getPendingItems`), immutable task object toggle (`toggleTaskRecord`), and dashboard summary composition. |
| **`js-dom-interactive-taskboard`** *(New Module 2-2 Project)* | Interactive Study Planner & Persistent Task Board | **Track 2: JavaScript DOM & Events** (`html-css-js`) | `module-2-2` | `["lesson-2-1-10"]` | **M1**: DOM selection (`querySelector`/`querySelectorAll`), live counter `textContent`, and `classList.toggle("is-completed")`.<br>**M2**: Delegated click handler on `#task-list` and `#mark-all-btn` listener.<br>**M3**: `#new-task-form` `submit` handler with `event.preventDefault()`, empty-input validation error (`#form-error`), dynamic `.task-card` creation, and `localStorage` persistence. |
| **`integrated-api-status-dashboard`** *(New Module 2-4 Integrated Capstone)* | Live Service & Weather Data Explorer | **Track 3: Integrated HTML+CSS+JS** (`html-css-js`) | `module-2-4` | `["lesson-2-2-10"]` | **M1**: Semantic dashboard shell, responsive status grid, and JSON payload renderer.<br>**M2**: `async/await` `fetch` integration with explicit `#loading-indicator`, `#error-panel`, and `#retry-btn` recovery.<br>**M3**: Live search input + status pill filter (`All`, `Healthy`, `Degraded`) updating visible cards and summary counter. |
| **`portfolio-site`** *(Existing ID, Remapped)* | High-Performance Developer Portfolio | **Track 3: Integrated HTML+CSS+JS Capstone** (`html-css-js`) | `module-2-2` | `["lesson-1-3-12", "lesson-2-2-10"]` | Remapped from invalid `"html-css-foundations"` to `module-2-2`. Combines responsive Flexbox/Grid layout (`m1`), interactive project category filter + detail modal (`m2`), and theme toggle with `localStorage` (`m3`). |
| **`js-to-ts-migration`** *(Existing ID, Remapped)* | Incremental JavaScript-to-TypeScript Migration | **Track 4: TypeScript & React** (`typescript`) | `module-2-3` | `["lesson-2-3-8"]` | Remapped from invalid `"language-mastery"` to `module-2-3`. |
| **`react-searchable-product-board`** *(New Module 3-1/3-2 Project)* | Searchable Product & Inventory Board | **Track 4: React Foundations** (`react-ts`) | `module-3-1` | `["lesson-3-1-9"]` | **M1**: Declarative `ProductCard` & `CategoryFilter` props.<br>**M2**: Controlled search input, Stock-only checkbox, and derived filtered list count. |
| **`component-library`** *(Existing ID, Remapped)* | Design System & Component Library | **Track 4: React Architecture** (`react-ts`) | `module-3-3` | `["lesson-3-3-9"]` | Remapped from `"html-css-foundations"` to `module-3-3`. |
| **`e-commerce-checkout`** *(Existing ID, Remapped)* | Resilient E-Commerce Checkout Flow | **Track 4: React Routing & State** (`react-ts`) | `module-3-4` | `["lesson-3-4-9"]` | Remapped from `"typescript-mastery"` to `module-3-4`. |
| **`kanban-board`** *(Existing ID, Remapped)* | Real-time Collaborative Kanban Board | **Track 4: React Capstone** (`react-ts`) | `module-3-4` | `["lesson-3-2-9", "lesson-3-4-9"]` | Remapped from `"react-professional"` to `module-3-4`. |
| **`nextjs-server-components-migration`**, **`ai-chat-workspace`**, **`accessible-component-audit`**, **`quality-and-security-hardening`**, **`product-spec-to-architecture-plan`** *(Existing IDs, Remapped)* | Advanced Engineering Capstones | **Track 4: Next.js & Architecture** (`react-ts`) | `module-4-1` / `module-4-2` / `module-1-4` | Mapped to `lesson-4-1-15`, `lesson-4-2-5`, `lesson-1-4-10` | Remapped from non-existent legacy `moduleId`s to canonical `module-4-1`, `module-4-2`, and `module-1-4`. |

---

## 5. Workstream C — Projects Page (`/projects`) & Project Detail (`/projects/$projectId`) Redesign

### 5.1 Current Audit Findings in `src/routes/projects.index.tsx` and `src/routes/projects.$projectId.tsx`

1. **Flat, Unordered Cognitive Wall on `/projects` (`src/routes/projects.index.tsx`)**:
   - Currently renders a single flat 3-column grid filtered only by difficulty (`All`, `Beginner`, `Intermediate`, `Advanced`) and search text.
   - A brand-new learner who just finished `lesson-1-1-3` sees `"Real-time Collaborative Kanban Board"`, `"Multi-Model AI Chat & Document Workspace"`, and `"Client-Rendered App to Next.js App Router Migration"` right next to `"Personal Developer Bio & Link Launchpad"`, with no indication of which project matches their current module or which projects require uncompleted prerequisites.
2. **Inaccurate Progress Metrics (`src/routes/projects.index.tsx`, lines 70, 224–236)**:
   - `completedTasks` is calculated from `Object.keys(projectTasks).filter((k) => projectTasks[k]).length` (manual checkboxes), ignoring `getVerifiedProjectTasks()` from `evidence-store.ts`.
3. **False `"100% Complete"` Badge on `/projects/$projectId` (`src/routes/projects.$projectId.tsx`, lines 98–104, 150–159)**:
   - Checking manual task checkboxes sets `taskProgressPercent === 100` and displays a green `"100% Complete"` badge in the hero header even when `verifiedTasksCount === 0`!
   - Meanwhile, the task checkboxes in `src/routes/projects.$projectId.tsx` (lines 380–388) allow toggling any task to completed without ever opening the Playground or running a single check.

### 5.2 Redesigned `/projects` Hub Journey

1. **Curriculum-Connected Grouping Tabs & Sections**:
   - Group projects into four clear sections (with a filter bar for **Track**: `All Tracks`, `HTML & CSS`, `JavaScript`, `Integrated Web`, `React & TypeScript`):
     1. **Ready Now (Recommended for Your Current Module)**: Projects whose `prerequisiteLessonIds` are satisfied (or whose Milestone 1 unlocks in the learner’s current active module).
     2. **In Progress**: Projects where the learner has saved workspace edits (`forge_playground_project_v2_${projectId}`), self-checked tasks, or verified at least 1 task/milestone.
     3. **Up Next (Locked by Prerequisites)**: Projects whose prerequisite lessons are not yet complete. Each card shows the exact prerequisite module/lessons required (e.g., *"Unlocks after HTML: Structure and Meaning (`3/8` lessons completed)"*) with a **"Go to Prerequisite Lesson"** link, while still allowing experienced learners to preview the spec.
     4. **Verified & Completed**: Projects where **100% of milestones and tasks have passed automated runtime verification** at the current workspace revision.
2. **Rich, Honest Project Card Metadata**:
   - Each card displays:
     - **Track & Language Badge**: e.g., `HTML & CSS` (`Beginner Mode`), `JavaScript DOM` (`Beginner Mode`), `React + TypeScript` (`Advanced IDE`).
     - **Curriculum Anchor**: e.g., `Module 1-1 · HTML: Structure and Meaning`.
     - **Expected Artifact Preview Summary**: 1-sentence description of what the learner will see and build.
     - **Honest Status Pill**: `Not Started` | `In Progress (2/6 Tasks Verified)` | `Self-Reported Only (Unverified)` | `Needs Review (Code Modified)` | `Verified (6/6 Passed)`.

### 5.3 Redesigned `/projects/$projectId` Detail Journey

1. **Clear "What You Will Build" & Prerequisite Readiness Banner**:
   - Fix `prerequisiteTopics` / `prerequisiteLessons` lookup in `src/routes/projects.$projectId.tsx` (lines 79–91) to resolve `project.prerequisiteLessonIds` against `completedLessons` in `useProgressStore`.
   - Show each milestone’s linked lessons (e.g., `Milestone 1: Semantic HTML Document Structure` $\leftarrow$ `Lessons 1-1-3 to 1-1-5`).
2. **Distinguish Manual Self-Check Checklist vs. Automated Verification**:
   - Replace the ambiguous single checkbox with two distinct visual indicators on every task row:
     - **Verification Badge (Authoritative)**: `Verified ✓` (emerald, backed by `evidence-store.ts` + matching workspace hash), `Needs Review ⚠` (amber, code edited since last pass), `Failed ✕` (rose, last verification run failed), or `Unverified` (neutral outline).
     - **Learner Planning Check (Optional Self-Note)**: Labeled explicitly as `"Mark as drafted (self-check)"` so learners can track their own drafting progress without the app ever claiming the project is `"Verified"` or `"Completed"` until automated checks pass.
3. **Direct Milestone Launch CTAs**:
   - Each milestone card has a primary **"Build & Verify Milestone in Playground"** button that navigates to:
     `/playground?project=${project.id}&milestone=${milestone.id}&task=${firstUnverifiedTask.id}&mode=${project.defaultPlaygroundMode}`

---

## 6. Workstream D — Playground Audit & Redesign (Beginner Mode vs. Advanced IDE Mode)

### 6.1 Current Playground Audit (`src/routes/playground.tsx`, 1,878 Lines)

1. **Desktop Overload for Beginners**:
   - When a learner opens `/playground` for an HTML or CSS task, they confront:
     - Top header bar with 8 controls: `Compiled` badge, `Submit & Complete`, `Back to Project Spec`, `Back to Lesson`, `Explain / AI Code Review`, `Compare Solution`, `Reset`, `Run Code`.
     - Secondary Forge Buddy bar + Project Gate banner with milestone `<select>`, `"Verify Milestone"`, `"Compare Reference"`, `"View Project Spec"`, and a clickable task grid (`onClick={() => toggleProjectTask(projectTaskKey)}` at line 1402).
     - Left File Explorer sidebar (`PlaygroundFileTree`) with template preset selector, `"New File"` button, and file rename/delete controls.
     - Multi-tab bar (`PlaygroundTabs`) with close buttons and `+` tab button.
     - Monaco editor toolbar (`PlaygroundEditor`) with font size, theme toggle, copy, undo, redo, format, and line/char counter.
2. **Mobile Viewport Overload & Unmounted Preview Bug**:
   - On `< lg` viewports, `src/routes/playground.tsx` stacks:
     1. Top header bar (2 rows of wrapped buttons on 375px width).
     2. Project Gate banner (collapsible, but expanded by default, consuming ~260px height).
     3. Active Exercise banner (consuming another ~140px height).
     4. Mobile 6-tab bar (`Code`, `Validation`, `Preview`, `Console`, `Hints`, `Files`).
     5. Editor toolbar + Monaco editor in the remaining ~220px of vertical height.
   - **Critical Bug (Line 1649)**: `{mobileTab === "preview" && (... <PlaygroundPreview ... />)}` unmounts the preview iframe whenever `mobileTab !== "preview"`. When `handleRunAndValidate` (line 805) sets `setMobileTab("validation")`, the iframe is destroyed before `waitForIframeReady` (line 814) and `requestPlaygroundValidation` (line 842) execute!

### 6.2 Two Progressive Modes Sharing One Underlying Engine

Per the confirmed architectural decision (**Auto-enable Beginner Mode for early modules with toggle to Advanced IDE**):

Both **Beginner Mode** and **Advanced IDE Mode** read and mutate the exact same `files`, `activeFileId`, `compilerOutput`, `workspaceRevision`, and `validationReport` in `usePlaygroundStore` (`src/lib/stores/use-playground-store.ts`), and compile/validate through the exact same `compilePlaygroundProject` (`src/lib/playground-compiler.ts`) and `requestPlaygroundValidation` (`src/lib/compiler/validation-client.ts`) pipeline.

| Capability / Surface | **Beginner Mode (Guided Workshop)**<br>*(Auto-enabled for Modules `0-1`..`2-2` & `2-4`, or `runtime: "html-css" \| "html-css-js"`)* | **Advanced IDE Mode (Full Workbench)**<br>*(Auto-enabled for Modules `2-3`, `3-1`..`4-2`, or `runtime: "typescript" \| "react-ts"`)* |
| :--- | :--- | :--- |
| **Mode Switching** | Compact segmented switch in header (`Workshop` \| `Full IDE`). Switching preserves all open files, unsaved edits, preview state, and validation results instantaneously. | Same segmented switch (`Workshop` \| `Full IDE`). |
| **File Navigation** | **Fixed 3-Pill Language Switcher**: `HTML (index.html)` · `CSS (styles.css)` · `JS (app.js)` (shows only the files relevant to the current task, e.g., `HTML` + `CSS` for Module 1-1/1-2). Hides the left file-tree sidebar, file creation/deletion controls, and preset selector. | Full `PlaygroundFileTree` sidebar + multi-file `PlaygroundTabs` with file creation, renaming, deletion, and template switcher. |
| **Task & Acceptance Checklist** | Integrated **Task Brief & Live Checklist Drawer/Panel**: Shows current Milestone + Task title, 1–2 sentence objective, starter hints, and the exact automated checks (`dom_query`, `computed_style`, `js_evaluation`) that will be verified. | Full Project Milestone selector + multi-task inspection panel + AI Code Review / Reference diff tools. |
| **Primary CTA** | Single prominent **"Run & Check Work"** button (`Cmd/Ctrl + Enter`). Automatically compiles code, updates the live preview, runs the task/milestone’s `ExerciseValidationSpec` inside the preview iframe, and displays pass/fail results per check. | Separate `"Run Code"` and `"Verify Milestone"` / `"Submit"` controls, plus console log filter and AST diagnostics. |
| **Secondary Actions** | Consolidated into a clean `More (⋯)` menu (`Reset to Starter Code`, `Compare Reference`, `Workshop / Full IDE Toggle`, `Editor Font Size`). | Accessible in header/toolbar. |

### 6.3 Mobile Playground Interaction Model (`375px–430px` Viewports)

1. **Single-Row Compact Top Bar (`h-12`)**:
   - Left: `← Back` (returns to Lesson or Project Spec based on origin query param).
   - Center: Truncated Project/Task title + Milestone badge (`M1 · Task 2`).
   - Right: Primary **"Run & Check"** button (`h-9 px-3`) + `⋯` overflow menu (contains `Workshop / Full IDE` toggle, `Reset Code`, `Compare Reference`).
2. **4-Tab Mobile Workspace Switcher (`h-10`)**:
   - Replaces the cramped 6-tab bar + stacked banners with 4 dedicated full-height views:
     1. **`Task`**: Displays the active Lesson/Project Task instructions, expected visible result, collapsible progressive hints, and milestone task switcher. (Eliminates the 300px of stacked banners above the editor!)
     2. **`Code`**: Shows the `HTML | CSS | JS` language pills at the top of the pane (in Beginner Mode) and maximizes vertical height for the code editor (`calc(100dvh - 5.5rem)`).
     3. **`Preview`**: Live rendered iframe preview with a 1-tap `"Check Work"` floating bar and quick viewport width indicator.
     4. **`Checks`**: Shows the structured pass/fail assertion checklist (`DOM Structure`, `CSS Computed Styles`, `JavaScript Behavior`) and any runtime console errors in plain beginner-friendly language, with a 1-tap **"View in Preview"** or **"Fix in Code"** jump button.
3. **Permanent Iframe Mounting Fix on Mobile**:
   - Change line 1649 of `src/routes/playground.tsx` so `PlaygroundPreview` is **always mounted** inside the mobile container and toggled via CSS (`className={mobileTab === "preview" ? "flex-1 flex flex-col min-h-0" : "sr-only pointer-events-none absolute inset-0 opacity-0 -z-10"}`).
   - Why `sr-only opacity-0` instead of `display: none` (`hidden`)? Note that inside an iframe with `display: none`, some browsers return empty or zero layout dimensions (`getBoundingClientRect()`) and can affect `getComputedStyle` layout-dependent properties (`width`, `height`). Keeping the off-screen preview container sized (`w-full h-full opacity-0 pointer-events-none absolute inset-0 -z-10`) ensures `window.getComputedStyle` and `waitForIframeReady` work identically on mobile whether the user is viewing the `Code`, `Preview`, or `Checks` tab!

---

## 7. Workstream E — Connected End-to-End Learning Journey & Source-of-Truth State Rules

### 7.1 The Connected Journey: `Learn → Practice → Build → Verify → Explain`

```
┌────────────────────────────────────────────────────────────────────────────┐
│ 1. LEARN & 2. PRACTICE (/lesson/$lessonId)                                 │
│  • Learner completes interactive concepts, predictions, & tiny inline labs │
│  • On final step, ClosureSurface renders:                                  │
│    - Core Takeaway & Honest Check Summary                                  │
│    - NEW "Next Step: Apply in Project / Playground" Card                   │
│      (Shows linked Project Milestone & Task unlocked by this lesson)       │
│      [ Primary CTA: "Build Milestone Task in Playground →" ]               │
│      [ Secondary CTA: "Continue to Next Lesson" / "Review Steps" ]         │
└───────────────────────────────────────┬────────────────────────────────────┘
                                        │ Deep link:
                                        │ /playground?project=semantic-profile-launchpad
                                        │   &milestone=m1&task=t1&lessonId=lesson-1-1-3&mode=beginner
                                        ▼
┌────────────────────────────────────────────────────────────────────────────┐
│ 3. BUILD (/playground — Beginner Workshop Mode)                            │
│  • Loads project-specific starterFiles (or saved workspace for projectId)  │
│  • Focuses active task (m1:t1) with clear objective & visible result goal  │
│  • Learner edits HTML / CSS / JS tabs and sees live preview                │
└───────────────────────────────────────┬────────────────────────────────────┘
                                        │ Learner taps "Run & Check Work"
                                        ▼
┌────────────────────────────────────────────────────────────────────────────┐
│ 4. VERIFY (Iframe Runtime Harness: validation-client + project-verifier)   │
│  • Compiles project & waits for PLAYGROUND_READY (waitForIframeReady)      │
│  • Runs task's ExerciseValidationSpec (dom_query, computed_style,          │
│    js_evaluation, actions, source_ast_check) inside preview iframe         │
│  • Computes deterministic workspaceHash over project files                 │
│  • Records verified task & milestone in evidence-store + progress-store    │
└───────────────────────────────────────┬────────────────────────────────────┘
                                        │ All required assertions pass
                                        ▼
┌────────────────────────────────────────────────────────────────────────────┐
│ 5. EXPLAIN & ADVANCE (Post-Verification Reflection & Next Step)            │
│  • Displays "Verified ✓" summary + 1-question "Explain Why It Works"       │
│    prompt (or AI Code Review walkthrough)                                  │
│  • Offers 1-click CTAs:                                                    │
│    - "Next Task in Milestone" (if tasks remain)                            │
│    - "Continue to Next Lesson (lesson-1-1-4)" (if launched from lesson)    │
│    - "View Verified Project Portfolio (/projects/$projectId)"              │
└────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Strict Source-of-Truth State Definitions & Transitions

We will enforce a single canonical status resolver `resolveEntityLearningStatus()` in `src/lib/learning-engine/status-resolver.ts` used across `/learn`, `/lesson/$lessonId`, `/projects`, `/projects/$projectId`, and `/playground`:

| State | Exact Definition & Persistence Source | UI Badge & Progress Bar Treatment |
| :--- | :--- | :--- |
| **`not-started`** | No saved workspace (`forge_playground_project_v2_${projectId}` absent), no attempt records, not checked in `projectTasks`, not in `completedLessons`. | Neutral outline badge: `Not Started`. Counts as `0%` in verified progress. |
| **`in-progress`** | Learner has opened the lesson (`lastActiveLesson === id`) or modified project workspace files (`workspaceHash !== starterHash`), but has not yet run verification or completed all steps. | Blue badge: `In Progress`. |
| **`attempted`** | Learner ran verification (`verifyProjectMilestoneRuntime`) or submitted an activity check, and at least 1 required assertion failed (`lastReport.passed === false`). | Rose/Amber badge: `Attempted · X/Y Checks Passed`. Never marks the task as completed. |
| **`self-reported`** | Learner manually ticked the planning checkbox on `/projects/$projectId` (`projectTasks["${projectId}:${taskId}"] === true`), **without** a passing runtime verification record in `evidence-store.ts`. | Slate/Dashed badge: `Self-Checked (Unverified)`. **Never** triggers a `"100% Complete"` or `"Verified"` badge; shown separately from verified progress. |
| **`verified`** | Learner ran automated runtime verification (`requestPlaygroundValidation`), **100% of required DOM/CSS/JS assertions passed**, `recordProjectGateVerification` recorded `passed: true` in `evidence-store.ts`, AND the current workspace file hash matches `verifiedWorkspaceHash`. | Emerald badge: `Verified ✓`. Authoritative source for project completion, capability mastery, and milestone gates. |
| **`needs-review`** | Task or milestone was previously `verified`, **but** the learner subsequently modified the project’s files (`currentWorkspaceHash !== verifiedWorkspaceHash`) or a subsequent verification run failed. | Amber badge: `Needs Review (Modified Since Verification)`. Prompts learner to click `"Run & Check Work"` to re-verify their latest edits. |
| **`completed`** | For **Lessons**: all lesson steps completed in `LessonExperience` and `completedLessons.includes(lessonId)`. For **Projects**: **all milestones and tasks** are in the `verified` state. | Emerald badge: `Lesson Complete` (or `All Checks Passed` when `verifiedCheckCount === totalInteractiveCount`) / `Project Verified & Complete`. |

---

## 8. Workstream F — Phased Implementation Plan

### Phase 1: Data Schemas, Curriculum-to-Project Mapping, and Authentic Project Workspaces
**Goal**: Establish the data foundation without breaking existing routes. Fix invalid `moduleId`s in `src/data/projects.json`, add missing HTML/CSS/JS module projects, define per-project starter files, and attach declarative `ExerciseValidationSpec` assertions to every project task.

1. **Extend Type Definitions (`src/lib/types.ts` & `src/lib/curriculum/types-v1.ts`)**:
   - Add `prerequisiteLessonIds?: string[]`, `recommendedAfterLessonId?: string`, `defaultPlaygroundMode?: "beginner" | "advanced"`, `runtime?: PlaygroundRuntime`, and `starterFiles?: PlaygroundFile[]` to `Project` and `ProjectMilestone` in `src/lib/types.ts`.
   - Add `validationSpec?: ExerciseValidationSpec` and `starterFiles?: PlaygroundFile[]` to `ProjectTask` in `src/lib/types.ts`.
   - Add `LessonDeliverableLink` interface (`deliverableType`, `projectId`, `milestoneId`, `taskId`, `launchMode`, `prompt`) to `src/lib/curriculum/types-v1.ts`.
2. **Create Canonical Lesson-to-Project Mapping Registry (`src/data/curriculum-project-map.json` & `src/lib/curriculum/project-mapping.ts`)**:
   - Map all 147 lessons (`lesson-0-1-1` through `lesson-4-2-5`) to their exact deliverable spec (`in-lesson-check`, `guided-mini-build`, `project-milestone`, `capstone-project`), target `projectId`, `milestoneId`, `taskId`, and launch parameters.
   - Export helper functions: `getDeliverableForLesson(lessonId)`, `getLessonsForProjectMilestone(projectId, milestoneId)`, and `isProjectUnlocked(project, completedLessons)`.
3. **Upgrade Project Catalog (`src/data/projects.json`) & Starter Templates (`src/lib/project-workspace-templates.ts`)**:
   - Fix all 10 broken `moduleId` references in `src/data/projects.json` to canonical module IDs (`module-1-1`..`module-4-2`).
   - Add progressive module projects (`css-design-surface-system`, `css-responsive-workspace-shell`, `accessible-interface-remediation`, `js-logic-and-data-engine`, `js-dom-interactive-taskboard`, `integrated-api-status-dashboard`, `react-searchable-product-board`) with concrete `ExerciseValidationSpec` assertions per task.
   - Refactor `buildProjectWorkspaceFiles(project, milestoneId?)` in `src/lib/project-workspace-templates.ts` so every project returns its authentic HTML/CSS/JS/TS/React starter files instead of the hardcoded step-pill template.
4. **Clean Up Redundant Copy-Pasted `replicate-this` Steps in `src/data/canonical/lessons-v1/`**:
   - Remove the mismatched bulk-injected `"Replicate UI: Accessible Design System Specimen"` from `module-3-1` (9 React lessons) and `module-4-1` (15 Next.js lessons), and remove redundant non-matching `replicate-this` steps from `module-1-2`, `module-1-3`, and `module-1-4` (retaining them only on the lessons where they directly match the lesson topic, e.g., `lesson-1-2-12`, `lesson-1-3-6`, `lesson-1-4-10`).

### Phase 2: Trustworthy Runtime Project Verification & Unified Status Engine
**Goal**: Replace the regex/25-character fallback in `project-verifier.ts` with real iframe DOM/CSS/JS verification and implement the 7-state status resolver with workspace-hash staleness detection.

1. **Create Workspace Hash & Unified Status Resolver (`src/lib/learning-engine/status-resolver.ts`)**:
   - Implement `computeWorkspaceHash(files: PlaygroundFile[]): string`.
   - Implement `resolveTaskStatus(projectId, milestoneId, taskId, currentHash)` and `resolveProjectStatus(project, completedLessons, currentHash)` returning `'not-started' | 'in-progress' | 'attempted' | 'self-reported' | 'verified' | 'needs-review' | 'completed'`.
2. **Update Evidence Store (`src/lib/learning-engine/evidence-store.ts`) & Progress Store (`src/lib/stores/use-progress-store.ts`)**:
   - Add `workspaceHash?: string` to `ProjectGateEvidence` in `src/lib/learning-engine/evidence-store.ts`.
   - When `verifyProjectMilestoneRuntime` runs and a previously passed task fails, ensure `useProgressStore` and `evidence-store.ts` record the latest status accurately so stale passes are never retained.
   - Separate `selfReportedProjectTasks` from `verifiedProjectTasks` in progress calculations.
3. **Upgrade Project Verifier (`src/lib/learning-engine/project-verifier.ts`)**:
   - Add `verifyProjectMilestoneRuntime(project, milestoneId, files, starterFiles)` which compiles each task’s `validationSpec: ExerciseValidationSpec` into a unified runtime validation request executed via `waitForIframeReady` + `requestPlaygroundValidation` (`src/lib/compiler/validation-client.ts`), mapping each assertion result back to its `ProjectTaskVerificationResult` (`dom_query`, `computed_style`, `js_evaluation`, `source_ast_check`, `actions`).
   - Eliminate the 25-character + title keyword heuristic fallback so tasks can only reach `verified` when their actual DOM, CSS, and JS assertions pass.

### Phase 3: Playground Redesign — Beginner Workshop Mode vs. Advanced IDE Mode & Mobile Fix
**Goal**: Make `/playground` welcoming and effortless for beginners on both mobile and desktop while preserving full IDE power for advanced modules.

1. **Extend `usePlaygroundStore` (`src/lib/stores/use-playground-store.ts`)**:
   - Add `workspaceMode: "beginner" | "advanced"` and `setWorkspaceMode(mode)`.
   - Auto-select `"beginner"` when opening a lesson or project from Modules `0-1`..`2-2` or `2-4` (or when `?mode=beginner` is in the URL), and `"advanced"` for TypeScript/React/Next.js modules (`2-3`, `3-1`..`4-2`).
2. **Fix Mobile Preview Unmounting Bug (`src/routes/playground.tsx`)**:
   - Keep `PlaygroundPreview` mounted at all times on mobile (`< lg`) using off-screen positioning (`opacity-0 pointer-events-none absolute inset-0 -z-10`) when `mobileTab !== "preview"`, ensuring `waitForIframeReady` and `requestPlaygroundValidation` succeed 100% of the time on mobile.
3. **Implement Beginner Workshop UI (`src/components/playground/beginner-workshop-bar.tsx` & `src/routes/playground.tsx`)**:
   - **File Switcher**: Single-row `HTML` · `CSS` · `JS` pill switcher (`index.html`, `styles.css`, `app.js`) with no sidebar tree or file-creation clutter.
   - **Remove Click-to-Complete Task Cards**: Remove `onClick={() => toggleProjectTask(projectTaskKey)}` from task cards in the Playground project banner (`src/routes/playground.tsx`, line 1402); clicking a task card now **focuses that task’s instructions and acceptance checks** instead of faking completion.
   - **4-Surface Mobile Navigation**: `Task` | `Code` | `Preview` | `Checks` with a single-row compact top bar (`← Back`, `Title`, `Run & Check Work`, `⋯`).

### Phase 4: Lesson-to-Project Bridge in Lesson Player & Closure Surface
**Goal**: Connect every lesson’s completion directly to its practical deliverable (`guided-mini-build`, `project-milestone`, or `capstone-project`).

1. **Wire `LessonRoutePage` (`src/routes/lesson.$lessonId.tsx`) & `LessonExperience` (`src/components/lesson/v2/lesson-experience.tsx`)**:
   - Resolve `deliverable = getDeliverableForLesson(lessonId)` and pass it to `LessonExperience` and `ClosureSurface`.
2. **Enhance `ClosureSurface` (`src/components/lesson/v2/closure-surface.tsx`)**:
   - Render a dedicated **"Apply What You Learned — Project Milestone"** card on the lesson completion slide showing:
     - Project & Milestone title (e.g., *Personal Developer Bio & Link Launchpad · Milestone 1, Task 1*).
     - Concrete 1-sentence build objective (e.g., *Build the `<header>`, `<main>`, and `<footer>` document skeleton in the Workshop Playground*).
     - Current verification status badge (`Not Started` | `In Progress` | `Verified ✓`).
     - Button to **"Build & Verify in Playground →"** (deep-linking to `/playground?project=...&milestone=...&task=...&lessonId=...&mode=beginner`), alongside the sticky footer’s `"Next Lesson"` CTA and `"Review Steps"`.

### Phase 5: Projects Hub (`/projects`) & Project Detail (`/projects/$projectId`) Redesign
**Goal**: Turn `/projects` into a guided, curriculum-aware portfolio hub with honest verification badges.

1. **Redesign `/projects` (`src/routes/projects.index.tsx`)**:
   - Replace raw `projectTasks` percentage calculation with `resolveProjectStatus` and `getVerifiedProjectTasks`.
   - Organize projects into **Ready Now**, **In Progress**, **Locked by Prerequisites** (with exact lesson/module unlock links), and **Verified & Completed**, plus Track filter pills (`All`, `HTML & CSS`, `JavaScript`, `Integrated Web`, `React & TS`).
2. **Redesign `/projects/$projectId` (`src/routes/projects.$projectId.tsx`)**:
   - Resolve `prerequisiteLessonIds` against `completedLessons` (fixing the broken `modules.find` bug).
   - Display each task’s automated verification criteria (`DOM`, `CSS`, `JS` checks) and authoritative `Verified ✓` / `Needs Review` / `Unverified` status badge.
   - Provide milestone-specific and task-specific **"Launch in Playground"** buttons.

---

## 9. Test Strategy & Acceptance Criteria

### 9.1 Automated Unit & Integration Tests (Vitest)
1. **`src/lib/curriculum/__tests__/project-mapping.test.ts`**:
   - Verifies that all 147 V1 lesson IDs in `src/data/canonical/lessons-v1/` have a valid entry in `curriculum-project-map.json`.
   - Verifies that every `projectId`, `milestoneId`, and `taskId` referenced by a lesson exists in `src/data/projects.json`.
   - Verifies that all projects in `src/data/projects.json` reference a valid `moduleId` in `src/data/modules.json` and non-empty `prerequisiteLessonIds`.
2. **`src/lib/learning-engine/__tests__/project-verifier-runtime.test.ts`**:
   - Verifies that starter code alone **fails** verification (`passed: false`).
   - Verifies that adding a 30-character comment containing task keywords (`// t1 header main footer semantic skeleton`) **fails** verification (proving the legacy fallback bug is eliminated).
   - Verifies that valid HTML (`<header>`, `<main>`, `<footer>`), CSS (`display: flex; justify-content: space-between`), and JS (`addEventListener`, DOM mutation, `localStorage`) pass their respective `dom_query`, `computed_style`, and `js_evaluation`/`actions` assertions.
3. **`src/lib/learning-engine/__tests__/status-resolver.test.ts`**:
   - Verifies state transitions: `not-started` $\rightarrow$ `in-progress` (on file edit) $\rightarrow$ `attempted` (on failed check) $\rightarrow$ `verified` (on passed runtime check with matching `workspaceHash`) $\rightarrow$ `needs-review` (when code is modified after verification).
   - Verifies that manual self-checking (`projectTasks`) sets `self-reported` and never reports `verified` or `completed`.
4. **`src/components/lesson/v2/__tests__/closure-surface-deliverable.test.ts`**:
   - Verifies that completing a lesson mapped to a project milestone renders the **"Apply What You Learned"** card with the exact `/playground?project=...&milestone=...&task=...&lessonId=...&mode=beginner` link.

### 9.2 Mobile (`375×812`) & Desktop (`1440×900`) Acceptance Criteria
- **Mobile Playground Validation**: Tapping **"Run & Check Work"** from the `Code` or `Task` tab on a `375×812` viewport executes `waitForIframeReady` and `requestPlaygroundValidation` against the mounted off-screen iframe without throwing `"Playground preview iframe is not mounted or ready"` and transitions cleanly to the `Checks` tab with assertion results.
- **Mobile Beginner Ergonomics**: In Beginner Mode on `375×812`, the top bar is 1 row (`48px`), the bottom/top workspace switcher has 4 tabs (`Task`, `Code`, `Preview`, `Checks`), and the `Code` tab shows only `HTML | CSS | JS` file pills with at least `65%` of viewport height dedicated to the code editor.
- **Desktop Beginner vs. Advanced Toggle**: Opening `/playground?project=semantic-profile-launchpad&milestone=m1&mode=beginner` on `1440×900` displays the 2-pane Guided Workshop (Code with `HTML | CSS` pills on left, Live Preview + Checks Drawer on right). Clicking `Full IDE` toggles the file tree sidebar and multi-tab bar without losing any editor state or preview output.

---

## 10. Risks, Dependencies & Resolved Architectural Decisions

### 10.1 Resolved Architectural Decisions (Confirmed with User)
1. **Lesson-to-Project Structure**: **Cumulative multi-milestone projects per module plus standalone capstones.** Learners build a cohesive artifact across each module’s lessons (e.g., `semantic-profile-launchpad` in Module 1-1, `css-design-surface-system` in Module 1-2, `js-dom-interactive-taskboard` in Module 2-2) and tackle standalone synthesis capstones at module/track boundaries.
2. **Playground Mode Switching**: **Auto-enable Beginner Mode for early modules with toggle to Advanced IDE.** HTML, CSS, and Vanilla JS lessons/projects launch automatically in Beginner Mode (`HTML`, `CSS`, `JS` pills, streamlined toolbar, integrated Task/Checks view), with a persistent toggle to switch to the full Advanced IDE at any time.
3. **Milestone Verification Standard**: **Require automated DOM, CSS, and JS checks for Verified status.** Manual checkboxes are strictly treated as `self-reported` drafting notes; only passing runtime assertions in the preview iframe grants `verified` status.

### 10.2 Key Risks & Mitigations
- **Risk 1: Existing `localStorage` Progress Migration (`forge-academia-progress` & `forge-capability-evidence-v1`)**
  - *Impact*: Learners who previously clicked manual task checkboxes in `useProgressStore.projectTasks` might see their project status change from `"100% Complete"` to `"Self-Reported (Unverified)"`.
  - *Mitigation*: Preserve all existing keys in `forge-academia-progress` and `forge-capability-evidence-v1`. If a task has an existing `projectGateVerifications` entry with `passed: true` in `evidence-store.ts`, retain its `verified` status; if it only has a manual boolean in `projectTasks`, display `"Self-Checked · Run Checks to Verify"` so no user data is lost while restoring verification integrity.
- **Risk 2: Computed Style Assertions in Off-Screen Mobile Iframes**
  - *Impact*: If an iframe container has `display: none` (`hidden`), browser layout engines may skip layout computation or return `auto`/`0px` for geometry properties.
  - *Mitigation*: Never use `display: none` on the `PlaygroundPreview` wrapper; use `opacity-0 pointer-events-none fixed inset-0 -z-10` when the `Preview` tab is inactive so the iframe retains full viewport dimensions for `getComputedStyle` and media query evaluation.

---

## 11. Files That Must NOT Be Touched in Phase 1

To ensure zero regressions while establishing the data schemas, project templates, and lesson-to-project mappings in **Phase 1**, the following files **must not be modified in Phase 1**:

- `src/lib/compiler/pipeline.ts`, `src/lib/compiler/parser.ts`, `src/lib/compiler/generator.ts`, `src/lib/compiler/writer.ts` (Core 5-step compiler pipeline)
- `src/lib/compiler/validation-client.ts` and `src/lib/compiler/validation-evaluator.ts` (Iframe message transport and DOM/CSS/JS assertion evaluator)
- `src/components/lesson/canonical/*` and `src/components/lesson/v2/activity-stage.tsx` (In-lesson quiz/check state machine and activity renderers)
- `src/components/lesson/v1/visual-widgets/layer-stack.tsx` (Recently refactored `LayerStack` widget)
- `src/routes/learn.tsx`, `src/routes/learn.index.tsx`, `src/routes/learn.modules.$moduleId.tsx`, `src/routes/review.tsx`, `src/routes/analytics.tsx`
- `package.json`, `vite.config.ts`, `tsconfig.json` (Zero dependency or build configuration changes)

---

## 12. Recommended First Implementation Slice (End-to-End Vertical Slice)

Before scaling across all 14 projects, we recommend executing a focused, end-to-end **First Implementation Slice** that proves the entire `Learn → Practice → Build → Verify → Explain` architecture across **1 HTML lesson, 1 CSS lesson, and 1 JavaScript DOM lesson** connected to the cumulative **Personal Developer Bio & Link Launchpad (`semantic-profile-launchpad`)** project:

1. **Three Connected Lessons $\rightarrow$ Three Cumulative Project Milestones**:
   - **HTML Lesson (`lesson-1-1-8: Forge Mission: Build the Page Structure`)** $\rightarrow$ Maps to `semantic-profile-launchpad` **Milestone 1 (`m1`: Semantic HTML Document Structure)**:
     - *Tasks*: `t1` (`<header>`, `<main>`, `<footer>`, `<h1>` bio header, `<nav>` links), `t2` (`<section>` landmarks & `<article>` project cards with `<h2>`/`<h3>`), `t3` (Contact `<form>` with `<label for>`, `<input type="email" required>`, `<button type="submit">`).
     - *Verification*: Real `dom_query` assertions via `requestPlaygroundValidation`.
   - **CSS Lesson (`lesson-1-2-12: Forge Mission: Make the Structure Look Intentional`)** $\rightarrow$ Maps to `semantic-profile-launchpad` **Milestone 2 (`m2`: Box Model, Surface & Flexbox Layout)**:
     - *Tasks*: `t1` (`:root` custom properties & card `box-sizing: border-box`, `max-width`, `padding`, `border-radius`), `t2` (Flexbox `.site-header` & `.link-list` with `display: flex`, `justify-content: space-between`, `gap`), `t3` (`:hover` and `:focus-visible` interactive states).
     - *Verification*: Real `computed_style` and `source_ast_check` assertions via `requestPlaygroundValidation`.
   - **JavaScript DOM Lesson (`lesson-2-2-10: Forge Mission: Build an Interactive Page`)** $\rightarrow$ Maps to `semantic-profile-launchpad` **Milestone 3 (`m3`: Interactive Theme Toggle, Category Filter & Contact Form Validation)**:
     - *Tasks*: `t1` (`#theme-toggle-btn` click listener toggling `.dark-surface` class on `.profile-card` and updating button label), `t2` (Category filter buttons filtering `.project-card` visibility and updating `#visible-project-count` `textContent`), `t3` (Contact `<form>` `submit` listener with `event.preventDefault()`, empty-email error message `#form-status`, and `localStorage` draft persistence).
     - *Verification*: Real interactive `actions` (`click`, `setValue`, `submit`) + `dom_query` + `js_evaluation` assertions via `requestPlaygroundValidation`.
2. **End-to-End UX Included in the First Slice**:
   - Completing `lesson-1-1-8`, `lesson-1-2-12`, or `lesson-2-2-10` renders the **"Apply What You Learned"** project milestone card on `ClosureSurface` with a 1-click launch into `/playground?project=semantic-profile-launchpad&milestone=...&mode=beginner`.
   - `/playground` opens in **Beginner Workshop Mode** (`HTML | CSS | JS` pills, 4-tab mobile layout `Task | Code | Preview | Checks`, permanently mounted preview iframe on mobile, and `"Run & Check Work"` button).
   - Passing all assertions records `verified` status with `workspaceHash` in `evidence-store.ts`, updates `/projects` and `/projects/semantic-profile-launchpad`, and transitions to `needs-review` if the learner subsequently breaks the code.
