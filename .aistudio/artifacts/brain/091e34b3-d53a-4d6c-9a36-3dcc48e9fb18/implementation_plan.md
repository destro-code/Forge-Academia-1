# Forge Full-Site Audit (Ratings Out of 10) & Master Reconstruction Plan

Deliver a comprehensive audit of the Landing Page, Dashboard, and every route across Forge Frontend Academy—complete with ratings out of 10, root-cause diagnostics of what is missing, what must change, and what must be added—followed by the execution blueprint to transform Forge into a **9.6/10 High-Craft Design & Engineering Academy**.

---

## User Review & Confirmed Decisions

> [!IMPORTANT]
> All four architectural and product decisions below were confirmed during our interactive clarification and govern this reconstruction plan:

- **Confirmed Decision 1 — Dedicated Landing Page + Full-Width Studio Dashboard**: Build a dedicated, high-converting **Public Landing Page** (with an interactive live mini-studio preview, 17-module curriculum showcase, role-based career outcomes, and instant onboarding entry) alongside a **Full-Width Studio Dashboard** for active learners (with a one-click switcher to view the Landing Page anytime).
- **Confirmed Decision 2 — 1440px 2-Column Bento Command Center Dashboard**: Replace the cramped `672px` (`max-w-2xl`) single-column stack on `/` with a **1360px–1440px 2-Column Asymmetric Bento Command Center** that integrates the dormant `HeroStudio`, `LearningLadder` (full current module progression), `PathConstellation`, `MomentumPanel` + Activity Heatmap, and `SecondaryWorkspaces`.
- **Confirmed Decision 3 — Streamlined 5-Hub Navigation & Unified Progress/Analytics/Mastery**: Consolidate the sprawling 21-link sidebar and 42 fragmented routes into **5 clear navigation hubs** (`Command Center`, `Learn & Curriculum`, `Practice Arena`, `Mastery & Analytics`, `Studio Library & AI Mentor`), and unify the three overlapping `/progress`, `/analytics`, and `/mastery` pages into a single cohesive **Mastery & Analytics Hub** (while keeping clean tab/route deep-linking so no features or URLs break).
- **Confirmed Decision 4 — All 4 High-Impact Craft & Pedagogical Upgrades**:
  1. **Typography & Anti-Slop Overhaul**: Replace generic `Inter` and unconfigured `font-serif` (which falls back to system Times New Roman) with **`Plus Jakarta Sans`** (display/headings), **`DM Sans`** (high-legibility body prose), and **`JetBrains Mono`** (`tabular-nums` code & metrics).
  2. **Dynamic Real Notifications**: Replace the hardcoded fake notifications in `TopBar` with a live, state-driven notification engine powered by actual learner streaks, due flashcards, unlocked achievements, and next curriculum milestones.
  3. **Lesson Player Studio & Web Design Zero-to-Hero Labs**: Restore all dropped shell props in `LessonExperience` (Outline Drawer, Module Progress, Bookmarks, Notes) and wire `ReplicateThisRenderer`, `VisualRenderer` (`BoxModelStudio`, `FlexGridStudio`, `TypographyContrastStudio`, `ResponsiveStateStudio`), `ExperienceRenderers`, and `JudgmentRenderer`.
  4. **Interactive Onboarding Skill Diagnostic**: Add a 60-second interactive **Skill Diagnostic & Path Recommender** modal/flow for new learners so they can either start at Module 0.1 (`The Web as a System`) or jump directly to their calibrated module (`HTML/CSS Craft`, `JavaScript & TypeScript`, or `React & Design Systems`).

---

## 1. Executive Site-Wide Audit & Scorecard (Rated Out of 10)

### Overall Website Rating Today: **6.4 / 10** → Target After Reconstruction: **9.6 / 10**

Forge has an extraordinarily rich underlying engine (17 modules, 155 canonical lessons, a multi-file Playground, Debug Lab, Guided Projects, Timed Mock Interviews, Flashcards, and an AI Mentor), but its **surface UX, layout geometry, information architecture, and disconnected components** currently hold it back from feeling like a flagship product.

| Surface / Page Group | Current Rating | Target Rating | Core Verdict |
| :--- | :---: | :---: | :--- |
| **1. Public Landing Page** | **2.0 / 10** | **9.6 / 10** | **Missing entirely.** `/` drops visitors straight into a narrow internal dashboard with zero product storytelling, live demo, or curriculum pitch. |
| **2. Learner Dashboard (`/`)** | **5.5 / 10** | **9.7 / 10** | **Cramped & under-wired.** Locked to `max-w-2xl` (`672px`) on a `1440px` desktop screen (>50% empty void) while 15+ built dashboard components sit unused. |
| **3. App Shell, Sidebar & TopBar** | **6.2 / 10** | **9.5 / 10** | **Cognitive overload + fake state.** 21 sidebar links across 5 groups, orphaned routes, and hardcoded fake notifications in the TopBar bell popover. |
| **4. Curriculum & Browse Hub (`/learn/*`)** | **7.2 / 10** | **9.5 / 10** | **Fragmented hierarchy.** Split across `/learn`, `/learn/paths`, `/learn/modules`, `/learn/topics`, and `/learn/lessons` with heavy pill-badge clutter. |
| **5. Lesson Player (`/lesson/$lessonId`)** | **6.0 / 10** | **9.8 / 10** | **Disconnected engines.** Drops `module`, `isBookmarked`, and `initialNote` props; bypasses `ReplicateThisRenderer`, `JudgmentRenderer`, and `ExperienceRenderers`. |
| **6. Practice Arena (`/playground`, `/debug-lab`, `/projects`, `/interview`, `/whiteboard`)** | **7.8 / 10** | **9.5 / 10** | **Strongest functional depth**, but `/practice` is an orphaned 6-tile stub, and `MonacoEditor` needs resilient fallback to `LessonCodeEditor` when SSR/MIME errors occur. |
| **7. Progress, Analytics & Mastery (`/progress`, `/analytics`, `/mastery`)** | **6.3 / 10** | **9.6 / 10** | **Triple duplication.** Three massive pages (2,650+ lines combined) render overlapping radar charts, bar charts, and heatmaps; `/analytics` isn't even linked in the sidebar. |
| **8. Utility & Support Pages (`/mentor`, `/journal`, `/bookmarks`, `/resources`, `/docs`, `/about`, `/settings`)** | **7.0 / 10** | **9.4 / 10** | **Solid utilities**, but `/about` is a 4-card stub, `/calendar` is orphaned, and visual styling uses generic `Inter` + nested bordered cards. |

---

### Detailed Page-by-Page Audit: What's Missing, What Should Change, What Should Be Added

#### A. Landing Page (`/` for Visitors & `/welcome` or Marketing View) — **Current: 2.0 / 10**
- **What's Missing**:
  - There is **no landing page**. First-time visitors arriving at `/` see an internal sidebar, a `Workspace / Forge` breadcrumb, and a narrow 672px column saying *"Shape your craft"*.
  - No explanation of the **17 Modules / 155 Lessons**, no interactive preview of the **Code & Visual Design Studios**, no comparison of why Forge beats passive video courses, and no **Skill Diagnostic** to place learners at the right starting point.
- **What Should Be Changed**:
  - First-time visitors (or learners clicking *"Landing Page / Academy Overview"*) should experience a full-bleed, high-craft **Marketing & Interactive Product Showcase** following the strict **Proposition $\to$ Live Interactive Mechanism $\to$ Curriculum Architecture $\to$ Proof & Career Outcomes $\to$ Action** flow.
- **What Should Be Added**:
  - **Interactive Hero Workbench Preview**: A live, playable mini-sandbox right in the hero where visitors can toggle between **Visual Box-Model/Flex Studio**, **Live Code Challenge**, and **Debug Lab** in real time.
  - **Interactive 17-Module Curriculum Explorer**: Filterable by track (`Foundations`, `HTML/CSS & Web Design Craft`, `JavaScript & TypeScript`, `React & State Architecture`, `Design Systems & Production Polish`).
  - **60-Second Skill Diagnostic Placement Flow**: 4 interactive engineering questions that recommend the exact starting module and transition the user into the Studio Dashboard.

#### B. Learner Dashboard (`/` — Studio Command Center) — **Current: 5.5 / 10**
- **What's Missing**:
  - **Desktop Viewport Presence**: Currently constrained to `max-w-2xl` (`672px`), wasting over half the horizontal viewport on desktop (`1440px`).
  - **Module Context & Up-Next visibility**: Learners only see 6 abstract dots in `PathConstellation` without seeing their current module's lesson checklist (`LearningLadder`), their due flashcards, their active Capstone Project, or their 90-day activity heatmap.
  - **Onboarding Calibration**: New learners (`lessonsCompleted.length === 0`) see 0% everywhere with no guided diagnostic or track selector.
- **What Should Be Changed**:
  - Upgrade from the narrow 5-widget vertical column (`JourneyIntro`, `PathConstellation`, `CurrentFocus`, `MomentumPanel`, `RecentWins`) to a **1360px 2-Column Asymmetric Bento Command Center**:
    - **Primary Left Column (8 cols)**: Active `HeroStudio` + `CurrentFocus` Resume Card (with time estimate, module progress bar, and 1-click resume), interactive **`LearningLadder`** (showing all lessons in the current module with `Verified`, `Current`, `Hands-On Lab`, and `Up Next` states), and **`SecondaryWorkspaces`** (Active Capstone Project, Due Flashcards, Debug Lab challenge).
    - **Secondary Right Column (4 cols)**: Compact **`PathConstellation`** map, **`MomentumPanel` + Activity Heatmap**, **Daily Challenge / Due Review Prompt**, and **`RecentWins` Proof-of-Work** badges.
  - Remove the dismiss (`X`) button on `CurrentFocus` (or provide a restore affordance)—currently, clicking `X` permanently hides the primary resume CTA for the session!
- **What Should Be Added**:
  - **"Take 60s Placement Diagnostic"** banner for new learners (`isNewLearner === true`) + **"Switch Track / Module"** quick selector.

#### C. Global Navigation, Sidebar & TopBar (`__root.tsx`, `app-sidebar.tsx`, `top-bar.tsx`) — **Current: 6.2 / 10**
- **What's Missing**:
  - **Typography Setup**: `__root.tsx` loads `Inter` (`family=Inter:wght@400;500;600;700;800`), while `JourneyIntro`, `CurrentFocus`, `PathConstellation`, and `HeroStudio` use `font-serif`—which is not loaded from Google Fonts and falls back to generic system Times New Roman/Georgia.
  - **Real Notification State**: `TopBar` hardcodes 3 static notifications (`"Daily challenge ready"`, `"Achievement unlocked: Seven Days Strong"`, `"Mentor tip"`) even when a user has 0 days streak and 0 lessons completed.
- **What Should Be Changed**:
  - **Load Curated Studio Fonts**: Load **`Plus Jakarta Sans`** (Display/Headings), **`DM Sans`** (Body), and **`JetBrains Mono`** (Code/Tabular Metrics) in `__root.tsx` and map `--font-sans`, `--font-display`, and `--font-mono` cleanly in `styles.css`.
  - **Streamline Sidebar from 21 Links to 5 Core Hubs**:
    1. **Command Center**: `Dashboard` (`/`), `Landing & Overview` (`/about`)
    2. **Learn**: `Interactive Curriculum` (`/lesson/$lessonId`), `Modules & Paths` (`/learn/modules`), `Lesson Catalog` (`/learn/lessons`)
    3. **Practice Arena**: `Practice Hub` (`/practice`), `Code Playground` (`/playground`), `Debug Lab` (`/debug-lab`), `Projects` (`/projects`), `Interview Academy` (`/interview`)
    4. **Mastery & Analytics**: `Mastery & Analytics Hub` (`/mastery` with unified tabs for *Overview & Progress*, *Deep Analytics*, *Skill Confidence & Spaced Repetition*, and *Achievements & Certificates*)
    5. **Studio Tools**: `AI Mentor` (`/mentor`), `Flashcards & Challenges` (`/flashcards`), `Engineering Journal & Bookmarks` (`/journal`), `Reference & Docs` (`/resources`), `Settings` (`/settings`)
- **What Should Be Added**:
  - **Dynamic Notification Engine in `TopBar`**: Compute real notifications from `useProgress()` (e.g., current streak status, flashcards due today, most recent unlocked achievement, next recommended lesson, or daily challenge status) with a working *"Mark all read"* state.

#### D. Progress, Analytics & Skill Mastery (`/progress`, `/analytics`, `/mastery`, `/statistics`) — **Current: 6.3 / 10**
- **What's Missing**:
  - **Cohesion**: Currently split across three massive standalone files (`/progress` at 658 lines, `/analytics` at 889 lines, `/mastery` at 1,103 lines). Worse, `/analytics` is not even in the main sidebar (only reachable via a small footer card or `/statistics` redirect), so users miss the best charts in the app!
- **What Should Be Changed**:
  - Unify `/progress`, `/analytics`, and `/mastery` with a shared **Mastery & Analytics Navigation Bar** at the top of all three routes (and unified tab views) so learners can seamlessly switch between:
    1. **Progress & Milestones** (`/progress` — XP level, module completion bar chart, curriculum milestones)
    2. **Growth & Readiness Analytics** (`/analytics` — 5-pillar Radar chart, quiz accuracy trends, category breakdown, 365-day activity heatmap)
    3. **Skill Mastery & Spaced Repetition** (`/mastery` — confidence sliders per topic, due review queue, weak/strong topic diagnostics)
    4. **Credentials & Proof of Work** (`/achievements` & `/certificates`)
  - Enforce `tabular-nums` on every percentage, XP counter, streak readout, and chart tooltip.

#### E. Practice Arena, Lesson Player & Secondary Pages — **Current: 6.8 / 10**
- **What Should Be Changed & Added**:
  - **Practice Hub (`/practice`)**: Upgrade from a bare 6-card static grid into an interactive **Practice Arena Command Page** showing live completion counters for Debug Lab bugs solved, Projects in progress, Quizzes passed, Daily Challenge status, Whiteboard snapshots, and Flashcards due.
  - **Lesson Player (`/lesson/$lessonId`)**: Complete the **Adaptive Studio Shell** upgrade (restoring the collapsible Module & Curriculum Outline Drawer, Notes & Bookmark drawer, normalized `js`/`ts`/`css` Experience Renderers, `ReplicateThisRenderer` UI replication challenges, `JudgmentRenderer` rubrics, and the 4 interactive **Web Design Zero-to-Hero Studios**: `BoxModelStudio`, `FlexGridStudio`, `TypographyContrastStudio`, and `ResponsiveStateStudio`).
  - **Resilient Code Editor (`MonacoEditor`)**: Ensure `MonacoEditor` gracefully falls back to `LessonCodeEditor` (CodeMirror 6) if Vite/SSR module pre-bundling ever fails to initialize Monaco workers, preventing any crash in `/playground` or inline code blocks.

---

## 2. User Experience & Visual Design Architecture

### A. Typography, Color & Anti-Slop Discipline
- **2+1 Font Hierarchy**:
  - **Display & Section Headings (`--font-display`)**: `Plus Jakarta Sans` (`600`/`700`, tight tracking `-0.02em`, `text-wrap: balance`).
  - **Body & UI Controls (`--font-sans`)**: `DM Sans` (`400`/`500`, `15px–16px` prose with `1.65` line height and `65ch–72ch` measure).
  - **Code, Telemetry & Metrics (`--font-mono`)**: `JetBrains Mono` with mandatory `font-variant-numeric: tabular-nums` on all counters, percentages, timers, and axes.
- **60-30-10 High-Craft Color System**:
  - **60% Neutral Studio Canvas**: Deep obsidian (`#090D16`) in dark mode / crisp architectural paper (`#F8FAFC`) in light mode.
  - **30% Structural Surfaces**: Single-elevation cards (`#111827` / `#FFFFFF`) with `1px` hairline borders (`border-border/70`) and zero card-inside-card nesting.
  - **10% High-Intent Accent Budget**: Forge Amber/Primary (`#F59E0B` / `--primary`) for primary CTAs and active progress, Emerald (`#10B981`) for verified mastery, Cerulean (`#0EA5E9`) for interactive visual studios, and Rose (`#F43F5E`) for debug/error diagnostics.
- **Anti-Slop Cleanliness**:
  - Replace pill-badge sandwiches on curriculum/module cards with clean inline typographic metadata (`Beginner · 6 Lessons · 2.5 hrs`).
  - Remove thick left accent stripes (`border-l-4`) in favor of subtle hairline borders and surface contrast.

---

## 3. Technical Architecture & Component Flow

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        Entry & Global App Shell (__root.tsx)                           │
│  • Loads Plus Jakarta Sans + DM Sans + JetBrains Mono (tabular-nums)                   │
│  • Streamlined 5-Hub AppSidebar + Dynamic Real-State TopBar Notifications              │
└───────────────────┬────────────────────────────────────────────────┬───────────────────┘
                    ▼                                                ▼
┌───────────────────────────────────────────┐    ┌───────────────────────────────────────┐
│     Public Landing & Overview Experience  │    │   1440px Bento Studio Dashboard (/)   │
│  • Hero + Live Playable Mini-Workbench    │    │  • Left (8 col): HeroStudio Resume,   │
│  • 17-Module Interactive Curriculum Map   │    │    Interactive LearningLadder,        │
│  • 60-Second Skill Placement Diagnostic   │    │    SecondaryWorkspaces                │
│  • Proof of Work & Career Track Matrix    │    │  • Right (4 col): PathConstellation,  │
└───────────────────────────────────────────┘    │    Momentum + Heatmap, RecentWins     │
                                                 └───────────────────┬───────────────────┘
                                                                     ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                     Unified Core Hubs & Reconstructed Lesson Player                    │
│  ┌──────────────────────────┬───────────────────────────┬───────────────────────────┐  │
│  │ Adaptive Lesson Studio   │ Unified Mastery &         │ Enriched Practice Arena   │  │
│  │ (/lesson/$lessonId)      │ Analytics Hub             │ (/practice, /playground,  │  │
│  │ • Outline & Notes Drawer │ (/progress, /analytics,   │  /debug-lab, /projects)   │  │
│  │ • 4 Web Design Studios   │  /mastery cross-nav bar)  │ • Live progress counters  │  │
│  │ • Replicate-This & Labs  │ • 5-Pillar Radar & Trends │ • Resilient Editor Engine │  │
│  └──────────────────────────┴───────────────────────────┴───────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Interactive Component & State Mapping
1. **Dedicated Landing Experience & 60s Skill Diagnostic (`src/components/home/landing-experience.tsx` & `src/routes/index.tsx` / `src/routes/about.tsx`)**:
   - First-time visitors (or any user clicking *"Academy Overview / Landing"* or toggling *"View Landing Page"*) see the full **Forge Landing Page** featuring:
     - **Interactive Hero Workbench**: Switch between 3 live mini-labs (*Flexbox & Box Model Visualizer*, *JavaScript Execution Trace*, *React State Bug Fix*) right on the landing page.
     - **60-Second Skill Placement Diagnostic Modal**: 4 interactive questions covering HTML/CSS layout, JS closures/async, TypeScript unions, and React rendering—automatically recommending the ideal starting module and saving the learner's calibrated track.
     - **Interactive 17-Module / 155-Lesson Syllabus Explorer**: Filterable across all 5 levels with live lesson previews.
2. **1440px 2-Column Bento Studio Dashboard (`src/routes/index.tsx`)**:
   - Expands `/` from `max-w-2xl` (`672px`) to the full `1360px` container with a responsive 12-column Bento grid:
     - **Top Banner**: Quick switcher between *Studio Command Center*, *60s Skill Diagnostic*, and *Academy Landing Page*.
     - **Main 8-Column Stack**: `HeroStudio` (active module/lesson spec + progress bar + resume CTA), `LearningLadder` (complete interactive lesson list for the active module with direct jump links), and `SecondaryWorkspaces` (active Capstone Project, due Flashcards count, and Debug Lab status).
     - **Side 4-Column Stack**: `PathConstellation` (visual node graph), `MomentumPanel` (weekly session goal + 14-day activity strip), and `RecentWins` (unlocked achievement badges).
3. **Streamlined 5-Hub Sidebar & Real Dynamic Notifications (`src/components/layout/app-sidebar.tsx` & `src/components/layout/top-bar.tsx`)**:
   - Reorganizes `AppSidebar` into 5 clean, scannable sections with zero orphaned core hubs and adds a collapsible *"More Tools"* group for secondary utilities (`Whiteboard`, `Daily Challenges`, `Bookmarks`, `Journal`, `Docs`).
   - Replaces the hardcoded `TopBar` notification list with dynamic notifications derived from `useProgress()` (streak status, due spaced-repetition reviews, unlocked badges, and current curriculum step) with interactive read/dismiss state.
4. **Unified Mastery & Analytics Cross-Navigation + Enriched Practice Hub (`src/components/shared/analytics-subnav.tsx`, `src/routes/progress.tsx`, `src/routes/analytics.tsx`, `src/routes/mastery.tsx`, `src/routes/practice.tsx`)**:
   - Adds a unified segmented sub-navigation bar across `/progress`, `/analytics`, `/mastery`, `/achievements`, and `/certificates` so all 4 analytics/mastery surfaces act as one cohesive hub.
   - Upgrades `/practice` to display live learner telemetry (bugs squashed, projects in progress, quiz accuracy, flashcards due, and daily challenge streak) on each practice arena card.
5. **Adaptive Lesson Player & Web Design Studios (`src/components/lesson/v2/lesson-experience.tsx`, `src/components/lesson/canonical/renderers/visuals/*`, `src/lib/curriculum/experience.ts`, `src/lib/curriculum/v1/adapter.ts`)**:
   - Restores the dropped `module`, `moduleLessons`, `isBookmarked`, `initialNote`, `onToggleBookmark`, and `onSaveNote` props in `LessonExperience` with a slide-over **Module Outline Drawer** and **Lesson Notes Drawer**.
   - Wires the 4 interactive Web Design Studios (`BoxModelStudio`, `FlexGridStudio`, `TypographyContrastStudio`, `ResponsiveStateStudio`), normalizes `js`/`ts`/`css` in `experience.ts`, activates `ReplicateThisRenderer` and `JudgmentRenderer`, and hardens `MonacoEditor` with a zero-crash fallback to `LessonCodeEditor`.
