# Forge Academia — Creative Atelier Redesign
## Final Verified Implementation Plan (Incorporating Amendments A–G)

![Forge Academia Brand Vision Moodboard](/assets/aistudio/Forge_Academia_Brand_Vision_Moodboard_0712ff4b.png)

---

## 1. First-Principles Creative Atelier Mandate (Amendment A)

- **Blank Visual Canvas**: The existing dashboard (`src/routes/dashboard.tsx` and `src/components/dashboard/*`) is treated strictly as a source of verified functional requirements, routing contracts, and data hooks—**never** as a visual or structural template.
- **Original Atelier Architecture**: All new presentation components will be authored independently under `src/components/atelier/`:
  - **Atelier Top Navigation Ribbon** (`src/components/atelier/atelier-top-nav.tsx`)
  - **Zone 1 — The Creative Studio Desk & Live Blueprint Stage** (`src/components/atelier/studio-desk-hero.tsx` + `src/components/atelier/live-blueprint-stage.tsx`)
  - **Zone 2 — The 4 Chapter Folios & Unfolding Blueprint Trail** (`src/components/atelier/learning-path-folios.tsx` + `src/components/atelier/unfolded-blueprint-trail.tsx`)
  - **Zone 3 — The Builder's Pinboard** (`src/components/atelier/builders-pinboard.tsx`)
  - **Dimensional SVG Studio Artwork** (`src/components/atelier/forge-buddy-illos.tsx`)
- **Non-Destructive Legacy Coexistence**: No files in `src/components/dashboard/*` will be deleted, and no unrelated routes (`/`, `/lesson/$lessonId`, `/learn/*`, `/projects/*`, `/playground`, `/debug-lab`, `/achievements`, `/mastery`, etc.) will have their layouts or dependencies broken.
- **Zero Fabricated Telemetry**: Every number, label, progress bar, project state, and badge is derived strictly from real persisted learner state and curriculum data.

---

## 2. Verified Integration Contracts (Amendment B)

Every API signature below has been verified directly against the repository source files:

### 1. `useCurriculumResume()` (`src/lib/utils/curriculum-order.ts`, lines 94–126) & `canonicalManifest` (`src/lib/curriculum/manifest.ts`)
- **Actual Return Signature of `useCurriculumResume()`**:
  ```ts
  {
    modules: Module[];            // 17 active modules from useModules()
    topics: Topic[];              // Active topics from useTopics()
    lessons: Lesson[];            // Legacy-adapted lessons from useLessons()
    orderedLessons: Lesson[];     // 139 authored lessons in manifest order
    currentLesson: Lesson | undefined; // Resume target: lastActiveLessonId (if valid & incomplete) || first incomplete authored lesson || orderedLessons[0]
    completedCount: number;       // Count of orderedLessons present in progress.lessonsCompleted
    totalLessons: number;         // orderedLessons.length (139 authored lessons)
    isCompleted: boolean;         // completedCount === orderedLessons.length
    isReturningLearner: boolean;  // lessonsCompleted.length > 0 || !!lastActiveLessonId
  }
  ```
  *(Note: `useCurriculumResume()` does **not** return `currentModule` or `currentTopic`; we derive `activeModule = modules.find(m => m.id === currentLesson?.moduleId) ?? modules[0]` and `activeTopic = topics.find(t => t.id === currentLesson?.topicId)`.)*
- **Canonical Manifest Lookups (`src/lib/curriculum/manifest.ts`)**:
  - `canonicalManifest.getModules()`: Returns all 27 manifest module descriptors; filtering by `m.lessonIds.length > 0` (as `localContentProvider.modules()` does in `src/lib/providers/content-provider.ts` line 98) yields the **17 active modules** (`module-0-1` through `module-4-2`).
  - `canonicalManifest.getAuthoredLessonsForModule(moduleId)`: Returns `CanonicalManifestLessonRef[]` where `authored !== false`. We use this to derive playable lesson links so the dashboard **never routes to an unauthored lesson**.
  - `canonicalManifest.getLessonsForModule(moduleId)`: Returns all manifest lesson refs (155 total across the 17 active modules, including 16 planned refs with `authored: false`). Any `authored === false` lesson ref in a module is rendered as a non-clickable `"Coming Soon"` stone.

### 2. `useProgress()` (`src/lib/hooks/use-progress.ts`) & `ProgressState` (`src/lib/types.ts`, lines 590–627)
- **Verified Persisted & Derived Fields**:
  - `xp: number`
  - `streakDays: number` (derived in `getDerivedProgress` via `deriveStreakDays(activityDates)`)
  - `bestStreakDays?: number`
  - `lessonsCompleted: string[]`
  - `lastActiveLessonId?: string`
  - `activityDates?: string[]` (normalized `YYYY-MM-DD` UTC strings via `getUnifiedActivityDates`)
  - `projectTasks: Record<string, boolean>` (keyed by `"${projectId}:${taskId}"`)
  - `projectCriteria: Record<string, boolean>` (keyed by `"${projectId}:${criteriaId}"`)
  - `projectReflections: Record<string, ProjectReflection>` (keyed by `projectId`)
  - `projectPortfolioNotes: Record<string, ProjectUserNotes>` (keyed by `projectId`)
  - `completedProjects?: string[]` (Note: `progressStore.useStore()` in `src/lib/providers/progress-provider.ts` lines 569–602 currently omits `completedProjects: rawProgress.completedProjects ?? []` from `stateSlice`; we will include that 1-line fix so `progress.completedProjects` is preserved through `useProgress()`).
  - *(Note: `ProgressState` does **not** have a `level` field; we will not reference `progress.level`.)*
- **Documented Weekly Active Days Convention (Amendment F)**:
  - `recordActivityState` (`src/lib/hooks/use-progress.ts` line 34) and `getUnifiedActivityDates` (`src/lib/providers/progress-provider.ts` line 200) record dates using UTC ISO date prefixes (`new Date().toISOString().slice(0, 10)`).
  - Accordingly, we will compute **Weekly Active Days** as the count of unique `YYYY-MM-DD` strings in `progress.activityDates` that fall within the **current UTC calendar week (Monday `00:00:00Z` through Sunday `23:59:59Z`)**, yielding an exact integer in `0..7`.

### 3. `useProjects()` (`src/lib/hooks/use-content.ts`) & `Project` Schema (`src/lib/types.ts`, lines 284–298)
- **Verified `Project` Shape**:
  - `{ id, title, subtitle?, description, overview?, category?, difficulty, estimatedHours, tags, milestones: ProjectMilestone[], acceptanceCriteria?: ProjectAcceptanceCriteria[], resources?, portfolioTips? }`.
  - `Project` has **no** `moduleId` property.
- **Verified Project State Classification (Amendment F)**:
  - For each `project` in `useProjects()`:
    - `allTasks = (project.milestones ?? []).flatMap(m => m.tasks ?? [])`
    - `completedTasksCount = allTasks.filter(t => Boolean(progress.projectTasks?.[`${project.id}:${t.id}`])).length`
    - `allCriteria = project.acceptanceCriteria ?? []`
    - `completedCriteriaCount = allCriteria.filter(c => Boolean(progress.projectCriteria?.[`${project.id}:${c.id}`])).length`
    - `hasReflection = Object.values(progress.projectReflections?.[project.id] ?? {}).some(v => typeof v === "string" && v.trim().length > 0)`
    - `hasNotes = Object.values(progress.projectPortfolioNotes?.[project.id] ?? {}).some(v => typeof v === "string" && v.trim().length > 0)`
    - `isCompleted = Boolean(progress.completedProjects?.includes(project.id)) || (allCriteria.length > 0 && completedCriteriaCount === allCriteria.length)`
    - `isInProgress = !isCompleted && (completedTasksCount > 0 || completedCriteriaCount > 0 || hasReflection || hasNotes)`
  - If no project is `isInProgress` or `isCompleted`, the Builder's Pinboard shows a genuine **"Start a Guided Project"** state (defaulting to `projects[0]` as a recommended starter brief with `0` tasks completed and a `"Start Project →"` link to `/projects/$projectId`).

### 4. `getEli5MentorNote(lessonId: string, moduleId: string): Eli5MentorNote` (`src/lib/curriculum/v1/eli5-mentor-bank.ts`, lines 9–17 & 195–206)
- **Verified Return Shape**:
  ```ts
  export interface Eli5MentorNote {
    analogyTitle: string;
    eli5Text: string;
    seniorWit: string;
    visualPreset?: {
      kind: string;
      config: Record<string, unknown>;
    };
  }
  ```
- **Fallback Behavior**: Returns `LESSON_SPECIFIC_NOTES[lessonId]` if defined, else `MODULE_MENTOR_NOTES[moduleId]` (defined for all 17 active modules `module-0-1` through `module-4-2`), else `MODULE_MENTOR_NOTES["module-0-1"]`.
- **Usage in `StudioDeskHero`**: Forge Buddy's interactive toggle switches between the verified **`eli5Text`** (*"ELI5 Mental Model"*) and **`seniorWit`** (*"Builder's Pro-Tip"*), titled by `analogyTitle`.

### 5. `evaluateAchievements(rawAchievements, progress, lessons)` (`src/lib/utils/achievements.ts`, lines 25–225)
- **Verified Return Shape**:
  ```ts
  (Achievement & {
    unlocked: boolean;
    progress: number; // 0..1 ratio
    current: number;
    target: number;
    unlockedAt?: string;
  })[]
  ```
- **Usage in `BuildersPinboard`**: Displays unlocked achievements (`unlocked === true`) as collectible die-cut stickers, sorted by tier (`platinum`, `gold`, `silver`, `bronze`), and surfaces the highest-progress locked achievement (`!unlocked`, showing its real `current / target` counter and `description`) as the `"Next Sticker on Your Workbench"`.

### 6. `useCommandPalette()`, `useTheme()`, and Route Shell Ownership (`src/routes/__root.tsx`)
- **`useCommandPalette()` (`src/lib/hooks/use-command-palette.ts`)**: Returns `{ open, setOpen, toggle }`. Global `<CommandPalette />` is mounted once inside `AppLayout` (`src/routes/__root.tsx`, line 159).
- **`useTheme()` (`src/lib/hooks/use-theme.ts`)**: Returns `{ theme, setTheme, toggle }`.
- **Route Shell Ownership (`src/routes/__root.tsx`, lines 131–165)**:
  - Currently, `AppLayout` checks `const isStandaloneRoute = location.pathname.startsWith("/lesson") || location.pathname === "/";`.
  - When we cut over `/dashboard` in **Step 2**, we will update `isStandaloneRoute` in `src/routes/__root.tsx` to include `location.pathname === "/dashboard"` (while keeping `<MobileBottomNav />` visible on mobile or rendering `<AtelierTopNav />` once inside `StudioDashboardPage`), ensuring:
    1. `/dashboard` renders `<AtelierTopNav />` **exactly once** (no duplicate `TopBar` or `AppSidebar`).
    2. `<CommandPalette />`, `<KeyboardShortcutsModal />`, and `<Toaster />` remain globally mounted in `AppLayout`.
    3. Every other route (`/`, `/lesson/$lessonId`, `/learn/*`, `/projects/*`, `/playground`, `/debug-lab`, `/achievements`, `/mastery`, etc.) keeps its exact existing shell and navigation.

---

## 3. Theme Safety & Two-Stage CSS Foundation (Amendment C)

### Audit of Existing CSS Variable Consumers
- In `src/styles.css`, `@theme inline` maps Tailwind v4 color tokens (`--color-background`, `--color-foreground`, `--color-primary`, `--color-card`, `--color-muted`, `--color-border`, `--color-lesson-*`, etc.) directly to `var(--background)`, `var(--primary)`, etc.
- Existing utilities in `src/styles.css` and `src/design-overrides.css` (`glass-panel`, `forge-grid`, `forge-panel`, `node-active-glow`, `::selection`) use `color-mix(in oklab, var(--primary) ..., transparent)` and `var(--border)`, which accept standard CSS colors (`#hex` or `oklch(...)`). No consumer in `src/` uses legacy Tailwind v3 `hsl(var(--primary) / <alpha>)` channel-splitting syntax.
- All existing semantic variables (`--background`, `--foreground`, `--card`, `--card-foreground`, `--popover`, `--popover-foreground`, `--primary`, `--primary-foreground`, `--primary-glow`, `--secondary`, `--secondary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`, `--destructive`, `--destructive-foreground`, `--success`, `--success-foreground`, `--warning`, `--warning-foreground`, `--info`, `--info-foreground`, `--border`, `--input`, `--ring`, `--sidebar-*`, `--lesson-*`, `--focus-surface`, `--focus-border`, `--focus-field`) will be retained in both `.light` and `.dark` so no route breaks.

### Splitting Foundation into Step 1A and Step 1B
1. **Step 1A — Atelier Design Tokens & Typography (`src/styles.css`, `src/design-overrides.css`)**:
   - Update `--font-sans` and `--font-display` in `src/styles.css` so `"Plus Jakarta Sans"` is primary (`"Plus Jakarta Sans", "DM Sans", ui-sans-serif, system-ui, sans-serif`), keeping `"JetBrains Mono"` for `--font-mono`.
   - Add the new `--atelier-*` semantic variables (`--atelier-cream: #FFFDF9`, `--atelier-ivory: #FFF6ED`, `--atelier-cobalt: #4F6BFF`, `--atelier-lilac: #C9BBFF`, `--atelier-butter: #FFE08A`, `--atelier-mint: #A7E3D1`, `--atelier-coral: #FF8C7A`, `--atelier-navy: #0E1B3D`) and `.atelier-paper-grid`, `.atelier-card`, `.atelier-sticker` utilities.
   - Update `.light` and `.dark` token definitions in `src/styles.css` and `src/design-overrides.css` so `.light` uses the warm **Creative Atelier** palette and `.dark` uses the **Midnight Navy Atelier** palette.
2. **Step 1B — Theme Defaults, Saved-Preference Preservation & Root Initialization (`src/lib/providers/settings-provider.ts`, `src/routes/__root.tsx`, `src/lib/hooks/use-theme.ts`)**:
   - In `src/lib/providers/settings-provider.ts`, change `DEFAULT_SETTINGS_STATE.theme` from `"dark"` to `"light"` **without** changing the `forge:settings:v1` key or resetting persisted user state:
     - New users (no `forge:settings:v1` in `localStorage`) initialize to `"light"`.
     - Existing users who have explicitly saved `"dark"`, `"light"`, or `"system"` in `localStorage` keep their saved preference untouched.
   - In `src/routes/__root.tsx`, update `RootShell` `<html lang="en" className="light" suppressHydrationWarning>` and include an inline synchronous theme-resolution script (reading `localStorage.getItem("forge:settings:v1")` before first paint) so `document.documentElement` immediately receives `.dark` or `.light` matching the user's persisted setting—preventing both hydration mismatches and any visible light/dark flash!

---

## 4. Phased Incremental Delivery & Verification Plan (Amendments E, F, G)

Each step below will be executed as **one logical change per response**, stating the scope and files beforehand, running real verification commands (`npm test`, `npm run build`, `npm run lint`), and reporting the exact lines changed and actual command outputs:

### Step 1A — Creative Atelier Design Tokens & Typography
- **Files**: `src/styles.css`, `src/design-overrides.css`.
- **Scope**: Introduce the Creative Atelier semantic tokens, `Plus Jakarta Sans` primary typography, and `.light` / `.dark` palette definitions while preserving all existing semantic CSS variables. No route or theme-default changes yet.
- **Verification**: `npm test` (`vitest run`) and `npm run build` (`vite build`).

### Step 1B — Light-First Default, Saved-Preference Preservation & Flash-Free Root Theme Sync
- **Files**: `src/lib/providers/settings-provider.ts`, `src/lib/hooks/use-theme.ts`, `src/routes/__root.tsx`.
- **Scope**: Set `DEFAULT_SETTINGS_STATE.theme = "light"` for new users, preserve existing persisted preferences in `forge:settings:v1`, and synchronize `document.documentElement` class without flash or hydration mismatch. Do not cut over `/dashboard` yet.
- **Verification**: `npm test` (including a new unit test for theme default & persisted preference preservation) and `npm run build`.

### Step 2 — Verified Chapter Partition Helper, Atelier Top Nav & Zone 1 (Studio Desk + Live Blueprint Stage)
- **Files**:
  - `src/lib/curriculum/atelier-chapters.ts` (new: verified 17-module partition across the 4 Chapter Folios, playable authored-lesson lookup, and UTC calendar-week active-day helper).
  - `src/components/atelier/forge-buddy-illos.tsx` (new: custom dimensional SVG studio illustrations).
  - `src/components/atelier/atelier-top-nav.tsx` (new: single-owner Top Atelier Navigation Ribbon for `/dashboard`).
  - `src/components/atelier/live-blueprint-stage.tsx` (new: functional 3-token preview switcher, `"Explode Layers"` component breakdown toggle, and `"Reset Stage"` control).
  - `src/components/atelier/studio-desk-hero.tsx` (new: personal greeting, active lesson resume workbench, Forge Buddy `eli5Text` / `seniorWit` switcher, and Studio Rhythm bar).
  - `src/routes/__root.tsx` & `src/routes/dashboard.tsx` (mount `AtelierTopNav` once and integrate Zone 1 on `/dashboard`).
- **Verification**: `npm test` and `npm run build`.

### Step 3 — Zone 2: The 4 Dimensional Chapter Folios & Unfolding Living Blueprint Trail
- **Files**:
  - `src/components/atelier/learning-path-folios.tsx` (new: 4 Chapter Folios covering all 17 active modules once, with real completion counts).
  - `src/components/atelier/unfolded-blueprint-trail.tsx` (new: connected module stations + winding authored-lesson stepping-stones, separate exploration state vs. resume target, and `"Return to Active Lesson"` reset action).
  - `src/routes/dashboard.tsx` (integrate Zone 2 and replace legacy `LearningLadder` and `PathConstellation` mounts).
- **Verification**: `npm test` and `npm run build`.

### Step 4 — Zone 3: Builder's Pinboard (Honest Project Blueprint, Studio Launchers & Sticker Passport)
- **Files**:
  - `src/lib/providers/progress-provider.ts` (preserve `completedProjects` in `progressStore.useStore()`).
  - `src/components/atelier/builders-pinboard.tsx` (new: honest project progress / starter state from `useProjects()` + `projectTasks`/`projectCriteria`/`projectReflections`/`projectPortfolioNotes`, 4 tactile Studio Quick Launchers including `SkillDiagnosticModal`, and real achievement stickers from `evaluateAchievements()`).
  - `src/routes/dashboard.tsx` (complete Zone 3 integration so `/dashboard` mounts exclusively the new `src/components/atelier/*` experience).
- **Verification**: `npm test` and `npm run build`.

### Step 5 — Comprehensive Automated Test Suite & Multi-Viewport Audit
- **Files**: `src/components/atelier/atelier-dashboard.test.tsx` (new).
- **Scope**: Add automated Vitest tests covering:
  1. Exact 17-module partitioning across the 4 Chapter Folios (no duplicates, no omissions).
  2. Authored-only playable lesson routing (`canonicalManifest.getAuthoredLessonsForModule`) and graceful empty/coming-soon states.
  3. Progress calculations and UTC calendar-week active-day derivation for new and returning learners.
  4. Honest project-state classification (`not-started`, `in-progress`, `completed`).
  5. `LiveBlueprintStage` token switching, `"Explode Layers"`, and `"Reset Stage"` without mutating learner progress.
  6. Chapter exploration state isolation and `"Return to Active Lesson"` restoration.
  7. Theme default (`"light"`) vs. persisted `"dark"` preference preservation and route-shell isolation.
- **Verification**: Run `npm test`, `npm run lint`, and `npm run build`, and inspect responsive layout behavior across `320px`, `375px`, `390px`, `768px`, `1024px`, and `1440px`.
