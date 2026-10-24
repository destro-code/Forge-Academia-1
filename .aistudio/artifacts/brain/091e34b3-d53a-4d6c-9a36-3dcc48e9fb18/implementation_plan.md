# Forge Academia — Complete Learner Experience & 10/10 Lesson Player Architecture Plan

## Vision & Core Design Principle
Forge Academia is designed around one central guarantee: **A learner should never have to guess what to learn, why they are learning it, how to practice it, whether they understand it, or what to do next.**

Every feature across the platform—Lessons, Playground, Projects, Mock Interviews, and the Dashboard—operates as one connected engineering workshop powered by **demonstrated capability and explicit evidence states**, rather than passive checkboxes or isolated pages.

---

## Stage 1: Shared Capability & Evidence Model + Event-Driven Mascot Policy

### 1.1 Explicit Learner Evidence States (`/src/lib/learning-engine/evidence-store.ts`)
Create a unified, persistent learner evidence & capability store that tracks distinct states across lessons, project milestones, and interview drills:
- **Activity & Milestone States**:
  - `not-started`: Learner has not opened or attempted the item.
  - `in-progress`: Learner is actively working (stores exact `currentActivityIndex`, saved draft answers, and active project milestone ID).
  - `completed`: Learner finished a reading/conceptual step.
  - `self-reported`: Learner manually checked a project milestone task without running automated verification.
  - `verified`: Learner passed an interactive check, runtime code assertion, project milestone verification suite, or interview rubric check.
  - `needs-attention`: Learner had multiple failed attempts, misconceptions, or failed verification checks on this concept.
- **Capability States**:
  - `in-progress`, `demonstrated`, `mastered`, and `needs-review` (computed from verified lesson checks, project milestones, and interview performance, never inflated by passive reading).

### 1.2 Event-Driven Forge Buddy Policy (`/src/components/lesson/v2/forge-buddy-lesson-companion.tsx` & `/src/components/mascot/forge-buddy-mascot-3d.tsx`)
Forge Buddy transitions from an always-open top banner into a disciplined, **event-driven coaching companion**:
- **Never** rendered above the lesson title or orientation hook.
- **Never** duplicates lesson text (`eli5Text`) that appears in the lesson body.
- **Never** interrupts timed mock interviews unsolicited.
- **Appears at the bottom of the stage ONLY when triggered by a meaningful learner event**:
  1. **Wrong Answer / Misconception Detected**: Surfaces a targeted mental-model reframe or misconception hint explaining *why* that trap happens.
  2. **Explicit Hint / "Ask Forge Buddy" Request**: A compact, quiet bottom pill (`Ask Forge Buddy for an Analogy or Interview Trap`) lets the learner summon the analogy, dev joke, or interview trap on demand without cluttering the slide.
  3. **Verified Milestone / Step Mastery**: Celebrates verified interactive checks, completed project verifications, and lesson completion.

---

## Stage 2: Complete the Project-to-Verification Loop

### 2.1 Seamless Project Milestone → Playground Handoff (`/src/routes/projects.$projectId.tsx` & `/src/routes/playground.tsx`)
- Launching a project milestone opens `/playground?project=<projectId>&milestone=<milestoneId>` with:
  - **Active Milestone Context Bar**: Displays the project title, current milestone objective, acceptance criteria, and verification requirements right inside the Playground workspace.
  - **Persistent Per-Project File Storage**: Automatically saves file edits per project in `localStorage` (`forge_project_files_<projectId>`) with a safe **"Reset to Starter Template"** action.
- **Honest Verification vs. Self-Reported Progress**:
  - **Run Milestone Verification**: Executes concrete structural and runtime checks against the learner's code and preview output. Passing marks the milestone as **`Verified`** (emerald badge) and updates the associated capability evidence.
  - **Manual Checkbox**: Clearly labeled as **`Self-Reported`** (amber/neutral badge) so learners and the recommendation engine distinguish between self-checked tasks and verified engineering output.

---

## Stage 3: Unify & Declutter the Lesson Experience (The 10/10 Mobile & Desktop Player)

### 3.1 Eliminate Verbatim Copy-Paste Duplication & Raw `---` Leak (`/src/lib/curriculum/v1/adapter.ts` & `/src/components/lesson/v2/activity-stage.tsx`)
- **Fix `adaptIntro` & `adaptExplanation`**: Remove the injection of `\n\n---\n\n${note.analogyTitle}\n${note.eli5Text}` into `content.context` ("SET THE SCENE") and `callout` in `/src/lib/curriculum/v1/adapter.ts`.
- **Clean Markdown Divider Handling**: Ensure `ReadingSurface` and `IntroRenderer` in `/src/components/lesson/v2/activity-stage.tsx` never render raw `---` text strings, and remove compulsory "Set the Scene" wall-of-text bloat when the intro hook already introduces the concept.

### 3.2 "One Screen = One Thought" Hierarchy (`/src/components/lesson/v2/lesson-experience.tsx` & `/src/components/lesson/v2/activity-stage.tsx`)
Enforce a strict, top-to-bottom visual hierarchy on every lesson step:
1. **Movement Eyebrow**: Subtle category label (`ORIENT — GET YOUR BEARINGS`).
2. **Lesson / Step H1 Title**: Immediate, high-contrast typographic focal point (`A Website Is a Conversation`).
3. **Single Focused Concept or Interactive Task**: Scannable, bite-sized explanation or interactive challenge that fits comfortably in the viewport without nested scrollbars.
4. **Bottom Event-Driven Forge Buddy Pill**: Positioned *below* `ActivityStage`. Quiet by default; expands automatically on wrong answers/hints or when tapped by the learner.
5. **Sticky Bottom Action Bar**: Clean `[ Previous ]` and `[ Continue > / Check Answer ]` controls.

### 3.3 Clean 2-Row Header & Harmonized Palette (`/src/components/lesson/v2/lesson-shell.tsx`)
- **Remove Audio Narration & Unsolicited IDE Drawer**: Strip `speechSynthesis` audio controls and the top-bar `Code Live` button/drawer from `LessonShell` so normal conceptual lessons never force an IDE or audio bar onto the screen. (Interactive code editors appear strictly inside coding activities where writing code is the task).
- **2-Row Mobile & Desktop Header**:
  - **Row 1**: `[ < Exit ]` — `[ 1/6: Full Lesson Title (clickable for Outline drawer) ]` — `[ ⋮ More (Bookmark & Notes menu) ]`
  - **Row 2**: `[ Segmented Progress Bar + Step 1/10 Counter ]`
- **Unified Color Hierarchy**: Align the progress bar, active step indicators, and primary CTA button around Forge's signature violet/indigo primary accent (`--primary`), reserving emerald for verified success and amber for hints/warnings.

---

## Stage 4: Connect Learner State & 4-Tier Guided Dashboard

### 4.1 Exact Activity-Level Resume (`/src/lib/learning-engine/evidence-store.ts` & `/src/routes/lesson.$lessonId.tsx`)
- Persist the learner's exact `currentActivityIndex`, completed step IDs, and draft responses on every step transition.
- Returning to an unfinished lesson resumes at the **exact step** where the learner left off (e.g., `Step 4 of 10 · Predict the HTTP Status`), never resetting to Step 1.

### 4.2 Restructure Dashboard into 4 Guided Tiers (`/src/routes/dashboard.tsx`)
Replace competing widgets and vanity counters with a calm, high-clarity 4-tier hierarchy:
1. **Tier 1 — Primary Focus ("Your Next Step")**:
   - One dominant, reasoned recommendation card that states:
     - **What to do next** (e.g., *Finish "A Website Is a Conversation" — Step 4 of 10* or *Practice Async Error Handling*).
     - **Why it is recommended** (derived from real learner evidence: unfinished step, recent misconception in a lesson/interview, or next unlocked project milestone).
     - **Estimated time** (e.g., `~6 min remaining`) and **one primary CTA button**.
2. **Tier 2 — Secondary ("Continue Where You Left Off")**:
   - Direct resume cards for the active Lesson (showing exact step index) and active Project Milestone (showing `Verified` vs `Self-Reported` milestone status).
3. **Tier 3 — Tertiary ("Your Capability & Evidence Ledger")**:
   - Honest breakdown of capabilities **Demonstrated / Verified**, **In Progress**, and **Needs Attention / Review** based on real checks, projects, and interview sessions.
4. **Tier 4 — Optional ("Explore the Workshop")**:
   - Clean, secondary entry points to the Curriculum Map, Playground, Project Studio, and Mock Interview Coach.

---

## Stage 5: Validate the Interview & Feedback System

### 5.1 Focused Entry Modes & Uninterrupted Timed Sessions (`/src/routes/interview.tsx` & `/src/routes/interview.session.tsx`)
- Organize the Interview Hub around three clear learner intents:
  1. **Practice a Concept** (untimed coaching mode with on-demand Forge Buddy hints).
  2. **Run a Timed Mock Interview** (realistic pressure; Forge Buddy stays completely silent unless the learner explicitly clicks *Request Hint*).
  3. **Work on a Flagged Weakness** (targeted drills generated from `needs-attention` capabilities).
- **Transparent Evaluation Breakdown**:
  - Post-interview debrief explicitly separates **Code Execution / Test Results**, **Rubric Criteria Checks** (edge cases, async error handling, clarity), and **Targeted Next Steps** linking directly to the exact lesson or practice challenge to fix any gap.

---

## Stage 6: Module Entrance & Lesson Closure Evidence Polish

### 6.1 Dual-Track Module Progress & Evidence Closure (`/src/routes/learn.modules.$moduleId.tsx` & `/src/components/lesson/v2/surfaces/closure-surface.tsx`)
- **Module View**: Show both **Activity Completion** (lessons/steps finished) and **Verified Capability Progress** (concepts proven through interactive checks and milestones), plus a single primary **"Continue Module"** button that jumps to the exact unfinished step.
- **Lesson Closure Surface**: At the end of every lesson, summarize the **Capabilities Demonstrated** during the session, highlight any concept that **Needs Review** (if multiple retries occurred), and present the **Reasoned Next Step** (continue to the next lesson or apply the concept in a linked Project Milestone).
