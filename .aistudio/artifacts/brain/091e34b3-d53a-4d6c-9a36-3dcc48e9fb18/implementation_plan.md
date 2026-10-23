# Forge Academia — Product Experience Polish, Mobile Overflow Fix & First-Time User Onboarding Plan

This plan executes all Product Manager priorities in a structured sequence: eliminating the mobile horizontal overflow shown in your screenshot, upgrading the Course/Module Detail experience into the Creative Atelier aesthetic, streamlining the Dashboard for new and returning learners, sharpening Landing Page conversion clarity, and unifying navigation across desktop and mobile.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> This plan prioritizes every UX gap identified in the Product Manager review alongside the mobile layout fix:
> - **Priority 1 — Fix Mobile Horizontal Overflow & Upgrade Module Detail View**: Resolves the flexbox intrinsic-width overflow where long nowrap lesson titles inside `flex-col items-start` containers push mobile screens wider than `100vw`, enforces strict viewport containment (`overflow-x: clip`, `w-full min-w-0`), and upgrades the Module Overview page to match the warm Creative Atelier aesthetic.
> - **Priority 2 — Streamline the Studio Dashboard & First-Time Learner Onboarding**: Removes the duplicate `"Let's style that button!"` demo widget from the Dashboard (keeping it as the star interactive centerpiece on the Landing Page) so **Your Learning Path** moves directly above the fold, and introduces a welcoming **First-Time Learner Onboarding state** (`0%` progress) that guides beginners between starting Lesson 1 or taking the 60-second Skill Check.
> - **Priority 3 — Landing Page Conversion Clarity, Student-Focused Copy & Atelier Footer**: Simplifies competing Hero buttons into a clear Primary + Secondary action pair, replaces meta-design descriptions (*"3D Shapes & Objects"*, *"Scroll to explore"*) with concrete student outcomes (**How You Learn** & **What You Will Build**), and adds a complete Creative Atelier footer.
> - **Priority 4 — Unified Navigation, Logo Destination Fix & Compact Mobile Header**: Aligns navigation labels between the Landing Page and the Studio App, routes the in-app Forge Academia logo to the Studio Dashboard instead of ejecting learners back to the marketing page, and compacts the mobile sticky header to preserve vertical reading space.

---

### 1. Overview & Core Concept

- **What It Does**: Transforms Forge Academia from a collection of visually impressive screens into a cohesive, frictionless learning product designed around first-time user clarity, honest progress momentum, and rock-solid mobile ergonomics (`320px–430px`).
- **Target Audience / Persona**: Brand-new learners taking their first steps in HTML, CSS, JavaScript, and React, as well as self-taught developers using the 60-second Skill Check to jump into intermediate modules on mobile or desktop.
- **Key Value**: Eliminates mobile horizontal clipping/overflow, removes cognitive overload from competing buttons and duplicate widgets, and ensures every screen clearly answers *"Where am I, what is this for, and what should I click next?"*

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Mobile Viewport Containment & Course Detail Atelier Upgrade**:
     - **Root-Cause Overflow Fix**: On the Course Overview screen, lesson rows and hero headers previously combined column flex containers (`flex-col items-start`) with single-line truncated headings (`truncate`), causing the browser to size cards to the unwrapped text width (`~520px`) and clipping both edges of a `390px` mobile screen. All flex children and card containers will enforce `w-full min-w-0` with responsive text wrapping (`line-clamp-2` on mobile) and root `overflow-x: clip`.
     - **Atelier Course Overview**: Replaces legacy muted boxes and pill-badge sandwiches with a warm Creative Atelier Course Folio header, clean unboxed metadata (`Beginner · Core Web Foundations · ~2 Hours · 12 Chapters · 6 Lessons`), a 3D domain emblem, and tactile chapter accordions.
  2. **Focused Studio Dashboard & First-Time Learner Welcome**:
     - **New-User Zero State (`0` Lessons Completed)**: Displays a dedicated **"Welcome to Your Creative Studio"** onboarding card in the hero workbench—offering a one-tap **Start Lesson 1 (12 min)** primary button alongside a **Not a beginner? Take the 60s Skill Check** prompt.
     - **Returning Learner State (`> 0` Lessons Completed)**: Highlights the active lesson workbench, 7-day UTC calendar rhythm strip, and Forge Buddy's **Friendly Breakdown / Pro Insight** mentor toggle.
     - **Immediate Learning Path Visibility**: Removing the duplicate CSS button-styling widget from the Dashboard brings the **4 Chapter Folios** and **Unfolded Blueprint Trail** directly into view without long scrolling.
  3. **High-Conversion Landing Page & Atelier Footer**:
     - **Focused Hero CTA Hierarchy**: Streamlines the Hero buttons to **Start Learning Free** (Primary Cobalt CTA) and **60s Skill Check** (Secondary Pill CTA), with a clean **Studio Dashboard** action in the top header.
     - **Outcome-Driven Sections**: Replaces design-system meta-labels (*"Scroll to explore"*, *"3D Shapes & Objects"*, *"Floating Browser Frames"*) with student-centric pillars: **Interactive Code Sandboxes**, **Visual Mental Models**, **Real-World Bug Quests**, and **Portfolio-Ready Projects**.
     - **Atelier Footer**: Adds a structured studio footer with direct links to all 4 Curriculum Chapters, Live Playground, Debug Lab, Achievements, and About.
  4. **Unified, Thumb-Friendly Navigation**:
     - **Consistent Destinations**: Standardizes navigation labels across the platform (`Studio`, `Courses`, `Projects`, `Playground`, `Debug Lab`, `Achievements`).
     - **Smart Brand Logo Link**: Clicking the Forge Academia emblem inside the app navigates to the Studio Dashboard, while a dedicated link allows returning to the Welcome Landing Page whenever desired.
     - **Compact Mobile Header**: Reduces vertical padding and pill height on mobile viewports so the sticky navigation stays compact (`≤ 15%` viewport height) with `44px` touch targets and smooth horizontal pill scrolling.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Warm Creative Atelier (`#FFFDF9` ivory paper canvas, `#0E1B3D` deep ink navy typography, `#4F6BFF` cobalt blue primary action, and Mint/Lilac/Butter/Coral chapter accents) with calibrated dark-mode parity (`#0B1226`).
  - *Typography & Hierarchy*: `Plus Jakarta Sans` (`--font-display`) for headlines with `text-wrap: balance`, `DM Sans` (`--font-sans`) for readable body copy, `JetBrains Mono` (`tabular-nums`) for metrics and code, and `Caveat` (`--font-handwritten`) for studio margin notes.
  - *Zero-Pill Metadata Discipline*: Static course metadata (difficulty, estimated hours, chapter and lesson counts) renders as clean, unboxed inline typography separated by `·` rather than rows of competing capsule badges.

- **Interactive Feedback & Motion**:
  - Smooth `framer-motion` entrance reveals and subtle floating 3D SVG sculptures (`150ms–200ms` interactive hover/tap feedback using `transform` and `opacity`), automatically respecting `prefers-reduced-motion`.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1 — Keep the Interactive Button Sandbox Exclusive to the Landing Page**:
  - *Chosen Approach*: Feature the `"Let's style that button!"` (`LiveBlueprintStage`) interactive demo on the Landing Page (`/`) to hook new visitors, and remove its duplicate instance from the Dashboard (`/dashboard`).
  - *Why*: Visitors on the Landing Page need an immediate taste of interactivity; learners on the Dashboard need fast access to their actual curriculum chapter and next lesson without scrolling past a static CSS demo every day.
- **Decision 2 — Replace Meta-Design Copy with Learner Outcomes**:
  - *Chosen Approach*: Keep the beloved 3D SVG sculptures (`StudioDesk3DCluster`, `ChapterFolio3DArt`, `ForgeBuddyMascot3D`, `TrophyFlame3D`), but rewrite their titles and descriptions around how students learn and build.
  - *Why*: Preserves the exact visual magic of the reference artwork while speaking directly to a learner's goals.
- **Decision 3 — Strict Mobile Flex & Grid Containment (`320px–430px`)**:
  - *Chosen Approach*: Combine root-level `overflow-x: clip` with `w-full min-w-0` on all flex/grid containers and multi-line clamping (`line-clamp-2`) on mobile titles instead of single-line `truncate` inside auto-width column flexboxes.
  - *Why*: Guarantees zero horizontal scrollbars or clipped left/right margins on iOS Safari and Android Chrome while keeping full lesson titles readable on small screens.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌────────────────────────────────────────────────────────────────────────────┐
│                     Forge Academia Viewport-Safe Shell                     │
│  overflow-x: clip · Unified AtelierTopNav (Compact Mobile ≤15% Viewport)   │
└───────┬──────────────────┬────────────────────────┬────────────────────────┘
        │                  │                        │
        ▼                  ▼                        ▼
┌───────────────┐  ┌──────────────────────┐  ┌───────────────────────────────┐
│ Landing Page  │  │   Studio Dashboard   │  │   Course & Hub Experiences    │
│ • Focused 2-  │  │ • New-User Welcome   │  │ • Course Overview (Atelier    │
│   CTA Hero    │  │   vs Active Resume   │  │   Folio Header, Unboxed Meta, │
│ • Outcome     │  │ • 4 Chapter Folios   │  │   Mobile-Safe Lesson Rows)    │
│   Pillars     │  │   (Above the Fold)   │  │ • Modules, Projects, Debug    │
│ • Live Stage  │  │ • Unfolded Trail     │  │   Lab & Achievements Wall     │
│ • Studio      │  │ • Project & Sticker  │  │ • Responsive Flex/Grid        │
│   Footer      │  │   Pinboard           │  │   Containment (w-full min-w-0)│
└───────┬───────┘  └──────────┬───────────┘  └───────────────┬───────────────┘
        │                     │                              │
        └─────────────────────┴──────────────┬───────────────┘
                                             ▼
┌────────────────────────────────────────────────────────────────────────────┐
│            Canonical Curriculum, Progress & Diagnostic Engines             │
│ • Real Lesson/Module Progress Evaluators & 60s Skill Diagnostic Router     │
│ • Studio Mentor Bank (Friendly Breakdown & Pro Insight — Zero ELI5)        │
└────────────────────────────────────────────────────────────────────────────┘
```

- **Data Model & State**:
  - **Onboarding vs. Active State Detection**: Uses `completedCount === 0` and `progress.xp === 0` from `useCurriculumResume()` and `useProgress()` to switch the Studio Desk between the **First-Time Learner Welcome** callout and the **Active Course Resume** view.
  - **Chapter Context Breadcrumbs**: Resolves the parent Atelier Chapter Folio (`findChapterIdForModule(moduleId)`) on the Course Overview page so learners always see which of the 4 Studio Chapters their current course belongs to.
- **Interactive Component & State Mapping**:
  - **Course Overview Accordions & Lesson Launchers**: Expanding/collapsing topic chapters updates local state cleanly; clicking any lesson row or primary course CTA navigates directly into `/lesson/$lessonId` with full mobile touch hitboxes (`≥ 44px`).
  - **Skill Check Diagnostic Trigger**: Accessible from both the Landing Page Hero and the Dashboard First-Time Welcome card to route experienced learners directly to their recommended module.
