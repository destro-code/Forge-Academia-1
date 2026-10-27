# Forge Academia — Phase 1 Curriculum Audit & Implementation Plan: Guided Projects and Modern Playground

Transform Forge Academia into three cleanly separated, beginner-friendly learning experiences—**Lessons (Learn)**, **Projects (Apply)**, and **Playground (Experiment)**—grounded in an audit of the existing curriculum, verification engine, editor layers, and companion architecture.

## User Review & Critical Decisions

> [!IMPORTANT]
> This document delivers the **Phase 1 Audit & Architecture Plan** based on inspecting the current codebase and your confirmed choices. No application source code has been modified in Phase 1. Click **Proceed** when you are ready to begin **Phase 2 (Vertical Slice: Module 1.1 HTML Foundations → Semantic Profile Launchpad)**.

- **Confirmed Decision — Phase 2 Vertical Slice Target**: Module 1.1 (*HTML: Structure and Meaning*, 8 canonical lessons) connected end-to-end to the **Personal Developer Bio & Link Launchpad** (`semantic-profile-launchpad`) guided project.
- **Confirmed Decision — Independent Guided Project Studio**: Learners complete and verify project tasks directly inside `/projects/$projectId` via an embedded **Guided Project Coaching Studio** (step-by-step task brief, starter scaffold, live preview, task verifier, and contextual Forge Buddy hints)—eliminating the dependency on `/playground`.
- **Confirmed Decision — Unified CodeMirror 6 Editing Layer**: Standardize on **CodeMirror 6** (already installed and proven in lesson activities) with light/dark Atelier theme support for both the Guided Project Coaching Studio and the redesigned standalone Playground, retiring the heavy Monaco mount workarounds.

---

## 1. Phase 1 Repository Audit & Findings

### A. Map of the Current Lesson & Module Curriculum (Confirmed in Source)

The canonical curriculum manifest defines **6 Levels** and **27 Modules**, containing **153 authored Canonical V1 lessons** across **17 active modules** and **10 unauthored future modules**:

| Level | Module ID & Title | Authored Lessons | Core Concepts & Techniques Taught | Primary Guided Project Mapping |
| :--- | :--- | :--- | :--- | :--- |
| **Level 0: Web Orientation** | `module-0-1` · The Web as a System<br>`module-0-2` · Thinking Like a Programmer | 6 lessons<br>6 lessons | Client/server conversation, HTTP requests, browser rendering roles (HTML/CSS/JS), state/input mental models, systematic debugging | **Onboarding Foundation** → Feeds into `semantic-profile-launchpad` Milestone 1 |
| **Level 1: Core Web & CSS** | `module-1-1` · HTML: Structure and Meaning | 8 lessons (`1-1-1` to `1-1-8`) | HTML5 document skeleton, headings & text hierarchy, lists (`ul`/`ol`/`dl`), anchor links, `img` & `alt` attributes, semantic landmarks (`header`, `nav`, `main`, `section`, `footer`), accessible forms | **Personal Developer Bio & Link Launchpad** (`semantic-profile-launchpad` · Milestone 1: Tasks `t1`–`t3`) |
| **Level 1: Core Web & CSS** | `module-1-2` · CSS: Make the Structure Visible | 12 lessons (`1-2-1` to `1-2-12`) | Selectors, cascade & specificity, inheritance, `:root` custom properties, Box Model (`border-box`), spacing rhythm, typography scale, color contrast, surface tokens, `:focus-visible` states | **CSS Design Surface & Token System** (`css-design-surface-system`) & `semantic-profile-launchpad` Milestone 2 (`t4`, `t6`) |
| **Level 1: Core Web & CSS** | `module-1-3` · Layout and Responsive Design | 12 lessons (`1-3-1` to `1-3-12`) | Normal flow vs display modes, Flexbox axes/alignment/wrapping/gap, CSS Grid tracks/areas/`auto-fit`+`minmax()`, fluid sizing, media queries, mobile-first layout debugging | **Responsive Workspace Layout Shell** (`css-responsive-workspace-shell`) & `semantic-profile-launchpad` (`t5`) |
| **Level 1: Core Web & CSS** | `module-1-4` · Accessible Interface Craft | 10 lessons (`1-4-1` to `1-4-10`) | Programmatic form labels (`for`/`id`), `fieldset`/`legend`, keyboard tab order, focus management, semantic buttons vs divs, ARIA roles & live error announcements | **Accessible Interface Remediation Suite** (`accessible-interface-remediation`) |
| **Level 2: JS & TypeScript** | `module-2-1` · JavaScript: The Language of Behavior | 10 lessons (`2-1-1` to `2-1-10`) | Variables (`const`/`let`), primitives & types, pure functions, conditionals, arrays (`map`/`filter`/`reduce`), objects, immutability, scope & closures | **JavaScript Logic & Data Transformation Engine** (`js-logic-and-data-engine`) |
| **Level 2: JS & TypeScript** | `module-2-2` · JavaScript in the Browser | 10 lessons (`2-2-1` to `2-2-10`) | `querySelector`, reading/updating DOM text & attributes, `classList`, `addEventListener`, `event.preventDefault()`, dynamic element creation, event bubbling & delegation (`closest`) | **Interactive DOM Taskboard** (`js-dom-interactive-taskboard`) |
| **Level 2: JS & TypeScript** | `module-2-3` · TypeScript: Make Intent Explicit | 8 lessons (`2-3-1` to `2-3-8`) | Type annotations, interfaces vs type aliases, union narrowing, generics, strict null checks, typed DOM/event contracts | **JavaScript-to-TypeScript Migration** (`js-to-ts-migration`) |
| **Level 2: JS & TypeScript** | `module-2-4` · Web Data and APIs | 7 lessons (`2-4-1` to `2-4-7`) | Event loop & Promises, `async`/`await`, `fetch` lifecycle, HTTP status handling, loading/empty/error UI states, `localStorage` persistence | **Integrated API Status Dashboard** (`integrated-api-status-dashboard`) |
| **Level 2: JS & TypeScript** | `module-2-5` · Git, GitHub, and Team Workflow | 10 lessons (`2-5-1` to `2-5-10`) | Commits, branching, staging, merge conflict resolution, pull requests, atomic history discipline | **Curriculum Gap Identified**: No dedicated Git workflow project exists; integrates as workflow checkpoints within module projects |
| **Level 3: React Engineering** | `module-3-1` · React: Think in UI State<br>`module-3-2` · React: Interaction and Effects<br>`module-3-3` · Component Design Patterns<br>`module-3-4` · Routing, Data Flow & Apps | 9 lessons<br>9 lessons<br>9 lessons<br>9 lessons | Declarative JSX, props, `useState`, controlled inputs, derived state, `useEffect` cleanup, custom hooks, composition, compound components, client routing & URL state | `component-library` (`3-1`), `kanban-board` (`3-2`), `ai-chat-workspace` (`3-3`), `e-commerce-checkout` (`3-4`) |
| **Level 4–5: Advanced Systems** | `module-4-1` · Next.js App Engineering (15)<br>`module-4-2` · Application State (5)<br>`module-4-3`..`5-6` (10 modules) | 20 authored<br>0 authored in `4-3`..`5-6` | Server/Client Components, streaming SSR, global state stores; **Genuine Gap**: `module-4-3` through `module-5-6` have empty `lessonIds: []` in manifest | `nextjs-server-components-migration` (`4-1`), `product-spec-to-architecture-plan` (`4-2`); unauthored modules explicitly marked "In Roadmap" |

---

### B. Granular Lesson-to-Project Audit for Phase 2 Vertical Slice (`module-1-1` → `semantic-profile-launchpad`)

Every lesson in Module 1.1 was audited against `semantic-profile-launchpad` to verify objectives, learner actions, and task coverage without duplicating lessons:

| Lesson ID & Title | Actual Learning Objective | Learner Action Demonstrating Understanding | Mapped Project Task (`semantic-profile-launchpad`) | Verification Method |
| :--- | :--- | :--- | :--- | :--- |
| `lesson-1-1-1` · Anatomy of an HTML Element | Construct valid opening/closing tags, attributes, and HTML5 document root (`!DOCTYPE`, `html`, `head`, `body`). | Inspect and repair document root and `<header>` wrapper around profile identity. | **M1 · Task 1 (`t1`)**: Profile `<header>` Landmark & Identity | Live DOM query (`header` exists inside `.launchpad-card`) |
| `lesson-1-1-2` · Headings, Paragraphs & Document Outline | Establish a single `<h1>` page title and logical `<h2>` section hierarchy with `<p>` prose. | Promote `<div class="profile-name">` to `<h1>` and verify section heading hierarchy. | **M1 · Task 1 (`t1`)**: Top-level `<h1>` developer name inside `<header>` | Live DOM query (`header h1` exists with non-empty text) |
| `lesson-1-1-3` · Lists: Grouping Related Items (`ul`, `ol`, `dl`) | Choose `<ul>` for unordered navigation links and `<dl>/<dt>/<dd>` for key-value profile facts. | Author `<dl>` with `<dt>`/`<dd>` pairs for "Currently Learning" and "Availability". | **M1 · Task 3 (`t3`)**: Key-value profile status facts using `<dl>`, `<dt>`, `<dd>` | Live DOM query (`dl dt, dl dd` count $\ge 4$) |
| `lesson-1-1-4` · Links & Navigation (`<a href>`) | Wire accessible anchor elements with valid `href` attributes inside a navigation list. | Add a third `<a href="...">` item inside `<ul>` and wrap with `<nav aria-label="Social links">`. | **M1 · Task 2 (`t2`)**: Accessible `<nav aria-label="Social links">` with $\ge 3$ `<a>` links | Live DOM + attribute assertion (`nav[aria-label]` & `nav ul li a[href]` $\ge 3$) |
| `lesson-1-1-5` · Images & Media Accessibility (`<img>`, `alt`) | Provide meaningful `alt` text and intrinsic `width`/`height` dimensions on `<img>` elements. | Repair the empty `alt=""` attribute on the developer avatar `<img>` with a descriptive label. | **M1 · Task 1 (`t1`)**: Avatar `<img>` descriptive `alt` attribute ($\ge 3$ chars) | Runtime DOM evaluation (`img.getAttribute('alt').trim().length >= 3`) |
| `lesson-1-1-6` · Semantic Landmarks vs. Generic `<div>` Soup | Replace non-semantic `<div>` containers with `<header>`, `<nav>`, `<main>`, `<section>`, and `<footer>`. | Refactor `.profile-body` into `<main>` + `<section>` and `.profile-footer` into `<footer>`. | **M1 · Task 3 (`t3`)**: `<main>`, `<section>`, and `<footer>` landmark architecture | Live DOM query (`main section` exists and `footer` exists) |
| `lesson-1-1-7` · Forms & Interactive Inputs (`<form>`, `<label>`, `<input>`) | Connect `<label for="...">` to `<input id="...">` with semantic `<button type="submit">`. | Add an accessible "Quick Message / Newsletter" contact form control in Milestone 1 Task 4 (`t1_4`). | **Audit Finding — Missing Task**: `module-1-1` teaches accessible forms in `1-1-7`, but `semantic-profile-launchpad` M1 currently has no form task! We will add a focused task or milestone step covering `<label for>` + `<input id>`. | Live DOM query (`label[for]` matches `input[id]` + `button[type="submit"]`) |
| `lesson-1-1-8` · Reviewing & Auditing Document Semantics | Diagnose broken outlines, missing landmarks, and inaccessible images in a complete document. | Run full Milestone 1 verification across the complete Developer Bio Launchpad. | **Milestone 1 Capstone Check (`m1`)**: All semantic landmarks, links, and status facts verified | Combined Milestone 1 runtime DOM & accessibility verification |

---

### C. Inventory of Duplicated, Misleading, or Unreliable Existing Behaviors

1. **Projects Depend on the Playground to Function (Critical Defect)**:
   - `/projects/$projectId` is currently a static checklist page with zero editing or preview capability. Every build CTA (`"Build in Playground"`, `"Launch Project in Playground"`, `"Build & Verify Milestone"`) forces the learner out of `/projects` into `/playground?projectId=...`.
   - Lesson completion (`ClosureSurface`) also links `"Apply in Project"` to `/playground?projectId=...` instead of `/projects/$projectId`.
2. **Self-Reported Checkboxes Masquerade as Project Completion (Misleading Verification)**:
   - In `/projects/$projectId` and `/projects/`, clicking manual checkboxes (`toggleProjectTask`) increments `completedTasksCount` and displays a green `"Fully Completed"` badge even when `verifiedTasksCount === 0`.
3. **Module Completion Ignores Project Application**:
   - `/learn/modules/$moduleId` declares `"Course Complete · 100% Mastered"` as soon as lesson steps are clicked through, with no section showing the module's guided project milestones or requiring verified project tasks for full module mastery.
4. **Overloaded 2,059-Line Playground Route**:
   - `/routes/playground.tsx` mixes three unrelated modes: free coding sandbox, project milestone grading harness, and `lesson-inline` embedded preview. Beginners opening `/playground` encounter a dense multi-panel IDE with file locking, verification banners, and Monaco loading timeouts.
5. **Dual Editor Duplication (Monaco vs. CodeMirror 6)**:
   - `LessonCodeEditor` (`@codemirror/*`) is fast, accessible, and mobile-friendly (192 lines), whereas `PlaygroundEditor` (`@monaco-editor/react`) requires a 12-second mount timeout fallback, manual `ResizeObserver` layout hacks, and heavy worker bundles.
6. **Disconnected Project Companion**:
   - `ForgeBuddyLessonCompanion` has a clean, event-driven trigger policy in lessons, but `/projects/$projectId` lacks contextual Forge Buddy task coaching and instead exposes a separate "AI Project Mentor" tab that generates long wall-of-text essays.

---

## 2. User Experience & Visual Design

### A. Three Distinct Product Destinations

1. **Lessons (`/lesson/$lessonId`) — Learn**:
   - Single-concept interactive steps using the existing V2 Lesson Experience and `LessonCodeEditor`.
   - At lesson closure (`ClosureSurface`), the **"Apply in Project"** card links directly to `/projects/$projectId?milestoneId=...&taskId=...` (opening the Guided Project Coaching Studio on the exact task that applies the lesson's concept).
2. **Projects (`/projects` & `/projects/$projectId`) — Apply (Self-Contained Coaching Studio)**:
   - Opening `/projects/$projectId` launches the **Guided Project Coaching Studio** directly inside the Projects route—no trip to `/playground` required.
   - **Two-Zone Guided Coaching Layout** (following the Education & Interactive Simulations 60/40 spatial architecture):
     - **Left / Top Coaching & Task Deck (40%)**:
       - **Task Stepper Header**: Shows current Milestone & Task (`Task 1 of 3 · Build the profile <header>`), clear status (`Verified`, `In Progress`, `Not Started`), and navigation between tasks.
       - **6-Part Coaching Brief**: (1) *What you're building*, (2) *Why it matters*, (3) *What to do next* (focused action), (4) *Expected result*, (5) *Live Verification Checklist* (individual assertions turning green as they pass), and (6) *Stuck? Ask Forge Buddy / Review Lesson* link.
     - **Right / Bottom Interactive Workbench & Live Preview (60%)**:
       - Focused **CodeMirror 6 Editor** (with clean file pills only for the files relevant to the current task, e.g., `index.html` and `styles.css`, plus `Check Task` and `Reset Task` actions).
       - **Live Responsive Preview** right beside/below the editor so code-to-result feedback is immediate.
       - **Contextual Forge Buddy Popover**: Appears only when the learner requests a hint, fails verification with a specific misconception, or verifies a milestone—distinguishing learner syntax/DOM mistakes from sandbox runtime errors.
   - Secondary tabs (*Project Overview & Architecture*, *Reflection & Portfolio Notes*) remain accessible via clean progressive disclosure without crowding the active task coach.
3. **Playground (`/playground`) — Experiment (Independent Creative Workspace)**:
   - Decoupled from project grading. Opening `/playground` presents a welcoming **Creative Experimentation Studio**:
     - **Curated Starter Templates Bar**: Quick-switch templates (*HTML & CSS Card*, *Interactive JS Toy*, *CSS Grid Poster*, *React Counter Component*, or *Blank Canvas*).
     - **Clean CodeMirror 6 Editor + Live Preview Split**: Uncluttered toolbar with **Run**, **Reset**, **Template Picker**, and a collapsible **Console Drawer** (closed by default; auto-badges when `console.log` or runtime errors occur).
     - Mobile-first segmented view toggle (`Code` | `Preview` | `Console`) with $\ge 44\text{px}$ touch targets.

### B. Visual Identity & Anti-Slop Discipline

- **Palette & Surface Hierarchy (60-30-10)**:
  - **60% Canvas**: Warm Atelier Ivory (`#FFFDF9` light) / Deep Midnight Slate (`#101A32` dark).
  - **30% Structural Surfaces**: Crisp white (`#FFFFFF`) / Slate container (`#131E3A`) with `1px` hairline borders (`#E5DFD3` / `rgba(255,255,255,0.1)`).
  - **10% Semantic Accents**: Cobalt (`#4F6BFF`) for primary actions, Emerald (`#059669`) with explicit `Verified` label for passed checks, Amber (`#D97706`) with explicit label for hints/warnings.
- **Typography**: `Plus Jakarta Sans` (Display headings), `DM Sans` (Coaching prose), `JetBrains Mono` with `tabular-nums` (CodeMirror 6 editor, assertions, and progress counters).
- **Zero-Pill Metadata**: Render task metadata (`Milestone 1 · 20 min · HTML5 Landmarks`) as clean inline text with `·` separators rather than stacked badge sandwiches.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Self-Contained Project Verification & Workspace Persistence (`forge_project_studio_v1_`)**
  - *Chosen Approach*: Persist each project's edited files in `localStorage` keyed by `projectId` and run task assertions directly against the Project Studio's live preview iframe (`verifyProjectTaskInRuntime`) with static DOM/CSS fallback.
  - *Why*: Guarantees Projects work 100% independently of the Playground, preserves learner work across refreshes, and verifies one focused task at a time rather than dumping all milestone errors at once.
- **Decision 2: Strict Separation of Verified vs. Self-Reported Progress**
  - *Chosen Approach*: Remove manual task completion checkboxes from counting toward `"Verified"` project or module completion. A project task is marked **Verified** only when its `validationSpec` assertions pass against the learner's code (with explicit disclosure if a conceptual checklist item is self-reviewed).
  - *Why*: Eliminates false completion states and aligns progress metrics with genuine demonstrated skill.
- **Decision 3: Shared CodeMirror 6 Editor Across Lessons, Projects, and Playground**
  - *Chosen Approach*: Extend the proven `LessonCodeEditor` into a reusable `StudioCodeEditor` supporting both light and dark Atelier themes, multi-file document switching via compartments, and keyboard shortcuts (`Cmd/Ctrl + Enter` to Run/Check).
  - *Why*: Instant mount time ($<15\text{ms}$ vs. Monaco's multi-second worker bootstrap), superior mobile touch support, and consistent editing ergonomics across the entire platform.

---

## 4. Technical Architecture & Phased Implementation Roadmap

### A. System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        Forge Academia Learning Cycle                         │
│                                                                              │
│  ┌────────────────────┐    Lesson Closure     ┌───────────────────────────┐  │
│  │  1. LESSONS        │   Handoff (Task CTA)  │  2. PROJECTS              │  │
│  │  (/lesson/$id)     │──────────────────────▶│  (/projects/$projectId)   │  │
│  │  • Concept Steps   │                       │  • Guided Coaching Studio │  │
│  │  • Focused Checks  │◀──────────────────────│  • Task-by-Task Verifier  │  │
│  └────────────────────┘   "Review Concept"    │  • Contextual Forge Buddy │  │
│            │                 Remediation      └─────────────┬─────────────┘  │
│            │                                                │                │
│            ▼                                                ▼                │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │               Shared Learning Engine & Evidence Store                  │  │
│  │  • Curriculum-to-Project Mapping (Lesson -> Project -> Milestone/Task) │  │
│  │  • Runtime & Static Task Verifier (DOM, Computed Styles, AST, JS)      │  │
│  │  • Module Progression Gate (Lessons Completed + Project Tasks Verified)│  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  3. PLAYGROUND (/playground) — Independent Creative Workspace          │  │
│  │  • Curated Starter Templates • CodeMirror 6 + Live Preview + Console   │  │
│  │  • Zero Coupling to Project Completion or Milestone Grading            │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

### B. Controlled Execution Phases

1. **Phase 1 — Audit & Plan Only (Completed in This Document)**:
   - Full curriculum audit (153 authored lessons across 17 modules, 10 unauthored roadmap modules, 12 projects), editor comparison, Forge Buddy review, and verification model design.
2. **Phase 2 — Build One Complete Vertical Slice (`module-1-1` → `semantic-profile-launchpad`)**:
   - Build the self-contained **Guided Project Coaching Studio** inside `/projects/$projectId` using CodeMirror 6, live iframe preview, single-task runtime verification, and contextual Forge Buddy coaching.
   - Update `ClosureSurface` in lessons so completing any lesson in `module-1-1` (`lesson-1-1-1` through `lesson-1-1-8`) hands off directly to the corresponding guided task in `/projects/semantic-profile-launchpad?milestoneId=m1&taskId=...`.
   - Ensure local avatar fallback SVG/data-URI in `semantic-profile-launchpad` starter template so the preview never relies on fragile external image URLs.
3. **Phase 3 — Establish Module Project Progression & Truthful Completion Gates**:
   - Extend task-level verification and starter scaffolds across the remaining HTML, CSS, JavaScript, TypeScript, and React module projects (`css-design-surface-system`, `css-responsive-workspace-shell`, `accessible-interface-remediation`, `js-logic-and-data-engine`, `js-dom-interactive-taskboard`, `integrated-api-status-dashboard`, and React projects).
   - Add the **Module Project Milestone Card** and explicit completion gate to `/learn/modules/$moduleId` (distinguishing *Lessons Completed* from *Project Milestones Verified* and surfacing a primary CTA to continue to the next module once verified).
4. **Phase 4 — Improve the Playground Independently (`/playground`)**:
   - Redesign `/playground` into a clean, welcoming CodeMirror 6 creative workspace with starter templates, responsive split/tabbed preview, collapsible console drawer, friendly learner-vs-platform error banner, and zero project-grading clutter.
5. **Phase 5 — Integration & Regression Testing**:
   - Verify unit and integration tests across lesson handoffs, independent project task verification, persistence across reloads, Playground independence, and mobile layout responsiveness.
