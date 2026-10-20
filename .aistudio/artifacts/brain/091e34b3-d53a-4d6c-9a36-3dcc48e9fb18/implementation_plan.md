# Forge Lesson Player UI/UX Reconstruction & Zero-to-Hero Web Design Architecture Plan

Reconstruct the Forge Lesson Player into an **Adaptive High-Craft Design & Engineering Studio**, wire every dormant interactive architecture (`ReplicateThisRenderer`, `VisualRenderer`, `Html/Css/JavaScriptExperienceRenderer`, `JudgmentRenderer`, `MechanismInspector`, and `MiniVisualPreview`) into the 155 canonical lessons, and introduce interactive Web Design Craft studios that take learners from zero to professional web designer and frontend engineer.

---

## User Review & Confirmed Decisions

> [!IMPORTANT]
> The following architectural and UX decisions were confirmed during clarification and govern this plan:

- **Confirmed Decision 1 — Adaptive Studio Shell**: Replace the stripped-down single-column shell with an **Adaptive Studio Shell** featuring a collapsible Module & Curriculum Outline Drawer, active step/movement context, integrated Notes & Bookmark tools, and an adaptive stage that expands from focused editorial reading ($680\text{px}$) to a full-bleed split studio ($1280\text{px}+$) during Visual Simulations, Code Experiences, and Replicate-This UI challenges.
- **Confirmed Decision 2 — Full Activation of Dormant Lesson Architectures**: Wire all four unused/bypassed interactive engines into the 155 lessons:
  1. **Replicate-This UI Studio** (`ReplicateThisRenderer` + `StageViewport` + `DiagnosticChecklist`) for side-by-side target vs. learner live DOM/CSS replication.
  2. **Interactive Visuals & System Simulations** (`VisualRenderer` + `RequestFlow`, `LayerStack`, `ComputerPipeline`, and new Web Design visualizers).
  3. **Domain Experience Renderers** (`HtmlExperienceRenderer`, `CssExperienceRenderer`, `JavaScriptExperienceRenderer`) with auto-synthesized HTML fixtures for CSS labs and normalized language resolution.
  4. **Real Judgment & Transfer Rubrics** (`JudgmentRenderer` with structured scenario context, evaluation rubric criteria, and expert model answers instead of fallback acknowledgment cards).
- **Confirmed Decision 3 — Web Design "Zero-to-Hero" Interactive Studios**: Add four interactive design-craft visualizers & lab types across the HTML, CSS, UI Craft, and Design System modules:
  - **Box Model, Flexbox, Grid & Spacing Visualizer**
  - **Typography Scale, Hierarchy & WCAG Color Contrast Studio**
  - **Component Replication Challenges** (cards, navbars, forms, dashboards)
  - **Responsive Breakpoint & Interactive State/Motion Inspector**
- **Confirmed Decision 4 — Aesthetic Direction**: High-craft dark/light design studio aesthetic following a strict 60-30-10 neutral-to-accent budget, tabular numerals (`tabular-nums`), hairline structural borders, live visual canvases, and zero decorative AI-slop clutter.

---

## 1. Root-Cause Audit: Why Existing Architectures Were Unused or Degraded

Our audit of the Lesson Player pipeline (`compile-manuscripts-v1.mjs` $\to$ `lessons-v1/*.json` $\to$ `v1/adapter.ts` $\to$ `v2/lesson-experience.tsx` $\to$ `v2/activity-stage.tsx` $\to$ `canonical/registry.tsx`) uncovered **6 concrete architectural disconnects**:

1. **Dropped Shell Props in `LessonExperience`**:
   - The route (`lesson.$lessonId.tsx`) passes `module`, `moduleLessons`, `mode`, `isCompleted`, `isBookmarked`, `initialNote`, `prevLessonId`, `onToggleBookmark`, and `onSaveNote` into `LessonExperience`, but `LessonExperience` prefixes all of them with an underscore (`_module`, `_moduleLessons`, `_isBookmarked`, etc.) and discards them. As a result, learners have **no lesson outline drawer, no module progress indicator, no bookmark toggle, and no notes drawer** inside the player.
2. **Experience Resolver Language Mismatch (`ExperienceResolutionError`)**:
   - `CanonicalActivityView` calls `resolveActivityExperience(codeActivity)` to dispatch `"html"` to `HtmlExperienceRenderer`, `"css"` to `CssExperienceRenderer`, and `"javascript"` to `JavaScriptExperienceRenderer`.
   - However, the compiler emits `"js"`, `"ts"`, `"tsx"`, and `"jsx"`, while `experience.ts` only checks `language === "javascript"`. Every `"js"`/`"ts"` lab throws `ExperienceResolutionError` and falls back to a basic generic editor, and `"css"` labs without an explicit `htmlFixture` fall back to a hardcoded dummy navbar/modal fixture that doesn't match the lesson's CSS selectors.
3. **Zero `"replicate-this"` Activities Emitted by the Manuscript Compiler**:
   - `ReplicateThisRenderer`, `StageViewport` (Side-by-Side & Diff Overlay), `DiagnosticChecklist`, and `ReplicationEvaluator` are fully built and registered in `ACTIVITY_RENDERER_MAP`, but `compile-manuscripts-v1.mjs` never emits `type: "replicate-this"`. None of the 155 lessons currently trigger this UI replication studio.
4. **Interactive Visual Registry Disconnected in `adaptInteractiveDemo` & `adaptVisual`**:
   - `INTERACTIVE_VISUALS` registers `layer-stack` (`LayerStack`), `request-flow` (`RequestFlow`), `computer-pipeline` (`ComputerPipeline`), and `account-settings` (`AccountSettingsSystem`), but `adaptInteractiveDemo` in `v1/adapter.ts` only maps `AccountSettingsSystem`, and `adaptVisual` drops the `interactive` config block completely.
5. **Judgment & Transfer Activities Forced into `generic-demo` Fallback**:
   - `v1/adapter.ts` hardcodes `case "judgment": renderPlan[activity.id] = "generic-demo"`, which forces `ActivityStage` to render a placeholder acknowledgment box (`hasContentGap`) instead of the rich `JudgmentRenderer` (which supports scenario context, 50-character commitment lock, interactive rubric self-check, and expert model-answer trade-off comparison).
6. **Wall-of-Text Reading Surface**:
   - `ReadingSurface` and `ExplanationRenderer` render plain markdown blocks without activating `CodeExampleRenderer` (with `MiniVisualPreview` and `MechanismInspector`), visual callout cards, or interactive design specimens.

---

## 2. User Experience & Visual Design Reconstruction

### A. Adaptive Studio Shell & Top Bar Architecture
- **Studio Header (3-Zone Discipline)**:
  - **Zone 1 (Left — Context & Outline Trigger)**: Back-to-Module/Curriculum button, collapsible **Lesson Outline Drawer** toggle (`17 Modules · 155 Lessons` or current Module lesson list with completion states), and current Module/Lesson breadcrumb title.
  - **Zone 2 (Center — Pedagogical Movement Rail)**: Interactive step progression rail showing each activity's pedagogical role (`Encounter`, `Visual Studio`, `Prediction`, `Investigation`, `Code Studio`, `Replicate UI`, `Transfer`) with direct step jumping and clear active/completed states.
  - **Zone 3 (Right — Learner Studio Tools)**: Quick-access buttons for **Lesson Notes Drawer** (persisted per lesson), **Bookmark Toggle**, and **Previous / Next Lesson** quick-switch.
- **Adaptive Stage Geometry**:
  - **Concept & Reading Mode (`720px` Editorial Stage)**: Clean typographic hierarchy (`Plus Jakarta Sans` display headings + `DM Sans` prose + `JetBrains Mono` code/metrics), interactive callout blocks, embedded `MiniVisualPreview` sandboxes, and `MechanismInspector` step-throughs.
  - **Interactive Studio Mode (`1280px–1440px` Split Workbench)**: Automatically widens when the learner enters a `visual`, `interactive-demo`, `interactive-code`, `code-modification`, or `replicate-this` activity so the code editor, live DOM/CSS preview canvas, and diagnostic checklist sit side-by-side without cramped scrolling.

### B. Visual Identity & Theme Tokens
- **60-30-10 Studio Color Budget**:
  - **60% Canvas (`--lesson-bg`)**: Deep obsidian slate in dark mode / crisp architectural paper in light mode, tinted subtly by the active movement's ambient accent (`--m-accent-soft`).
  - **30% Structural Surfaces (`--lesson-surface`, `--lesson-border`)**: Hairline `1px` borders, elevated workbench panels, and high-contrast syntax/inspector surfaces.
  - **10% Semantic & Pedagogical Accents (`--m-accent`)**:
    - *Encounter & Visual Systems*: Cerulean Blue (`#0EA5E9`)
    - *Prediction & Commitment*: Amber Gold (`#F59E0B`)
    - *Investigation & Debug*: Coral Rose (`#F43F5E`)
    - *Code & Replicate Studio*: Emerald Teal (`#10B981`)
    - *Judgment & Transfer*: Indigo Violet (`#6366F1`)

---

## 3. Module-by-Module Curriculum & Interactive Architecture Blueprint (All 17 Modules / 155 Lessons)

Every lesson across the 17 active modules will follow a rich, multi-modal pedagogical arc (**Concept + Visual Mental Model $\to$ Prediction/Commitment $\to$ Guided Code or Visual Manipulation $\to$ Replicate-This / Debug Studio $\to$ Architectural Judgment & Transfer**):

| Level & Module | Lessons | Interactive Visuals & Studios Activated | Hands-On Labs & Replicate-This Challenges |
| :--- | :---: | :--- | :--- |
| **Mod 0.1 — The Web as a System** | `0-1-1` to `0-1-6` (6) | `RequestFlow` HTTP packet tracer, `ComputerPipeline` IPO simulator, `LayerStack` (HTML/CSS/JS three-layer inspector) | Trace URL-to-render lifecycle, inspect status codes (`200`/`404`/`500`), modify live HTML/CSS/JS layers |
| **Mod 0.2 — How Code Runs & Fails** | `0-2-1` to `0-2-6` (6) | `ComputerPipeline` execution trace + Runtime Error & Console Inspector | `JavaScriptExperienceRenderer` console trace labs + `InvestigationSurface` bug localization |
| **Mod 1.1 — Semantic HTML & Document Architecture** | `1-1-1` to `1-1-10` (10) | Interactive DOM Tree & Landmark Inspector + `HtmlExperienceRenderer` ("You are building a document") | **Replicate-This Stage 1 (Guided)**: Semantic article layout, accessible form with labels, navigation header landmarks |
| **Mod 1.2 — CSS Layout, Box Model, Flex & Grid** | `1-2-1` to `1-2-10` (10) | **New `BoxModelStudio` & `FlexGridStudio` Interactive Visuals** (live margin/border/padding/content sliders, flex axis/gap/align controls, grid track builder) | `CssExperienceRenderer` with synthesized HTML fixtures + **Replicate-This Stage 2**: Pricing card, Flexbox navbar, responsive CSS Grid gallery |
| **Mod 1.3 — Visual Design: Typography, Color & Hierarchy** | `1-3-1` to `1-3-7` (7) | **New `TypographyContrastStudio` Interactive Visual** (live type scale ratio, measure `ch` slider, line-height, WCAG AA/AAA contrast calculator, visual hierarchy squint-test) | **Replicate-This Stage 2/3**: Editorial hero card, accessible alert banner contrast repair, typographic hierarchy specimen |
| **Mod 1.4 — Responsive Craft, States & Motion** | `1-4-1` to `1-4-7` (7) | **New `ResponsiveStateStudio` Interactive Visual** (viewport width scrubber `320px–1440px`, `:hover`/`:focus-visible`/`:disabled` state matrix, cubic-bezier easing preview) | **Replicate-This Stage 3**: Fluid responsive card grid, accessible focus-ring interactive button bar |
| **Mod 2.1 — JavaScript Fundamentals & Data Modeling** | `2-1-1` to `2-1-15` (15) | `MechanismInspector` step-by-step variable/reference/closure memory model + `JavaScriptExperienceRenderer` | Live JS data transformation labs + output predictions + edge-case debugging |
| **Mod 2.2 — DOM Manipulation, Events & Browser APIs** | `2-2-1` to `2-2-10` (10) | Event Bubbling/Delegation interactive diagram + `JavaScriptExperienceRenderer` with live DOM preview (`htmlFixture` enabled) | Interactive event-driven UI widgets (tabs, modal toggles, live filter input) |
| **Mod 2.3 — TypeScript for UI Contracts** | `2-3-1` to `2-3-10` (10) | Type-narrowing & discriminated union state flow visualizers + `JavaScriptExperienceRenderer` (with TS-to-JS transpilation support) | Model component prop contracts and async state unions (`idle | loading | success | error`) |
| **Mod 2.4 — Async Flows, Fetch & Network Resilience** | `2-4-1` to `2-4-7` (7) | `RequestFlow` async lifecycle & race-condition visualizer + `AccountSettingsSystem` optimistic/error state simulator | Fix async loading states, retry handling, and stale-request bugs |
| **Mod 2.5 — Frontend Architecture & State Patterns** | `2-5-1` to `2-5-10` (10) | `LayerStack` state ownership & data-flow architecture visualizer + `JudgmentRenderer` trade-off drills | Refactor coupled UI state into clean state machines and derived selectors |
| **Mod 3.1 — React Components, JSX & Props Craft** | `3-1-1` to `3-1-9` (9) | Component tree & prop-flow visual diagrams + **Replicate-This Component Specs** | Build reusable card, badge, and list primitives with clean prop APIs |
| **Mod 3.2 — React State, Hooks & Effects** | `3-2-1` to `3-2-9` (9) | Render-cycle & hook dependency inspector + `AccountSettingsSystem` state bug simulator | Fix stale closures, infinite `useEffect` loops, and derived-state anti-patterns |
| **Mod 3.3 — Component Composition & Custom Hooks** | `3-3-1` to `3-3-9` (9) | Compound component & slot architecture visualizers + `JudgmentRenderer` API design drills | Design compound tabs, dialogs, and headless hook abstractions |
| **Mod 3.4 — Routing, Data Fetching & Forms in React** | `3-4-1` to `3-4-9` (9) | URL state & form validation lifecycle diagrams + `InvestigationSurface` | Synchronize search params, optimistic mutations, and accessible form validation |
| **Mod 4.1 — Design Systems, Tokens & UI Engineering** | `4-1-1` to `4-1-15` (15) | `TypographyContrastStudio` + `ResponsiveStateStudio` + Design Token semantic mapping visualizer | **Replicate-This Capstone Specs**: Multi-token button/input system, SaaS metric card, and themeable settings panel |
| **Mod 4.2 — Accessibility, Performance & Production Polish** | `4-2-1` to `4-2-5` (5) | Keyboard focus-order & Core Web Vitals (CLS/LCP/INP) visual simulators + `JudgmentRenderer` production audits | Audit and repair keyboard traps, ARIA semantics, layout shift, and render bottlenecks |

---

## 4. Technical Architecture & Component Flow

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                     Manuscript Compiler (compile-manuscripts-v1.mjs)                 │
│  • Emits Visual / Interactive-Demo activities (RequestFlow, LayerStack,              │
│    ComputerPipeline, BoxModelStudio, FlexGridStudio, TypographyContrastStudio,       │
│    ResponsiveStateStudio) based on lesson module & concept                           │
│  • Emits ReplicateThisActivity specs for HTML/CSS/UI/Design-System lessons           │
│  • Emits structured JudgmentStep (context + evaluationRubric + modelAnswer)          │
│  • Synthesizes matching htmlFixture for CSS labs so live preview always renders      │
└──────────────────────────────────────────┬───────────────────────────────────────────┘
                                           ▼
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                       V1 → Layer 1 Adapter (src/lib/curriculum/v1/adapter.ts)        │
│  • Maps all 7 interactive visual kinds into VisualActivity.content.interactive       │
│  • Preserves ReplicateThisActivity and dispatches to ReplicateThisRenderer           │
│  • Dispatches structured Judgment activities to JudgmentRenderer (no content gap)    │
│  • Normalizes "js"/"ts"/"jsx"/"tsx" in experience.ts so ExperienceRenderers mount    │
└──────────────────────────────────────────┬───────────────────────────────────────────┘
                                           ▼
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                   Reconstructed LessonExperience & Adaptive LessonShell              │
│  ┌─────────────────────────┬──────────────────────────────────────────────────────┐  │
│  │ Collapsible Studio      │  Adaptive Stage (720px Reading ↔ 1360px Workbench)   │  │
│  │ Outline & Tools Drawer  │  • ReadingSurface + Interactive Visual Callouts      │  │
│  │ • Module Lesson List    │  • VisualRenderer (7 Interactive System Studios)     │  │
│  │ • Step Progress Badges  │  • Html / Css / JavaScript ExperienceRenderers       │  │
│  │ • Lesson Notes Widget   │  • ReplicateThisRenderer (Target vs Live DOM + Diff) │  │
│  │ • Bookmark Toggle       │  • InvestigationSurface & JudgmentRenderer           │  │
│  └─────────────────────────┴──────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

### Interactive Component & State Mapping
1. **Adaptive Studio Shell (`LessonShell` + `LessonExperience`)**:
   - Restores all dropped props (`module`, `moduleLessons`, `mode`, `isBookmarked`, `initialNote`, `prevLessonId`, `onToggleBookmark`, `onSaveNote`).
   - Adds a slide-over **Curriculum & Module Outline Drawer** showing all lessons in the current module (or full curriculum), completion checkmarks, and current activity progress.
   - Adds an integrated **Notes & Bookmark Popover/Drawer** in the top-right studio toolbar so learners can jot down architectural notes and bookmark lessons without leaving the stage.
   - Dynamically switches container width between `max-w-[780px]` (focused reading/prediction) and `max-w-[1360px]` (interactive visual studios, code workspaces, and `replicate-this` challenges).
2. **Four New Web Design Interactive Studios (`src/components/lesson/canonical/renderers/visuals/`)**:
   - `box-model-studio.tsx`: Interactive sliders for `padding`, `border`, `margin`, `width`, and `box-sizing: content-box | border-box` with live computed total width/height readouts and color-coded layout layers.
   - `flex-grid-studio.tsx`: Interactive controls for `flex-direction`, `justify-content`, `align-items`, `flex-wrap`, `gap`, and CSS Grid `grid-template-columns` (`1fr 1fr`, `repeat(auto-fit, minmax(160px, 1fr))`) with live child item reflow.
   - `typography-contrast-studio.tsx`: Live type-scale selector, font-weight/tracking/line-height (`1.2`–`1.8`) and measure (`45ch`–`85ch`) controls, plus foreground/background color pickers with real-time WCAG relative luminance & AA/AAA contrast ratio calculation.
   - `responsive-state-studio.tsx`: Interactive viewport width scrubber (`320px` Mobile, `768px` Tablet, `1024px` Desktop, `1440px` Wide), interactive state simulator (`default`, `:hover`, `:focus-visible`, `:active`, `:disabled`), and transition timing curve preview.
3. **Experience Renderer & CSS Fixture Upgrade (`src/lib/curriculum/experience.ts` & `adapter.ts`)**:
   - Normalize `"js"`, `"javascript"`, `"ts"`, `"jsx"`, `"tsx"` in `experience.ts` so `JavaScriptExperienceRenderer` mounts reliably with live console and preview support.
   - Auto-generate semantic `htmlFixture` markup tailored to the CSS selectors present in each CSS lab's `starterCode`/`solutionCode` so `CssExperienceRenderer` always displays a live, relevant preview canvas next to the CSS editor.
4. **Replicate-This & Judgment Compiler Enrichment (`scripts/compile-manuscripts-v1.mjs`)**:
   - Upgrade design/layout/component labs across Modules 1.1–1.4, 3.1, and 4.1 to emit curated `replicate-this` activities (`ReplicateThisActivity`) complete with target HTML/CSS, starter workspace code, token chips, and structural/style evaluation rules.
   - Upgrade `judgment` (transfer) activities in `compile-manuscripts-v1.mjs` and `v1/adapter.ts` to populate `context`, `evaluationRubric`, `modelAnswer`, and `takeaways`, routing them to the real `JudgmentRenderer` instead of the `generic-demo` content-gap fallback.
   - Inject a dedicated **Interactive Visual Studio** step into lessons across Modules 0.1–4.2 so every lesson combines conceptual explanation with an interactive manipulable visual model.
