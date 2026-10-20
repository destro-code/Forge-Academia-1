# Forge Mobile UI/UX Audit (Ratings Out of 10) & Flagship Mobile Reconstruction Plan

Deliver a forensic mobile audit across every route and viewport dimension (`375px–430px` smartphones and `768px` tablets), followed by the architectural blueprint to transform **Forge** into a captivating, native-grade mobile engineering studio with a signature **Obsidian & Molten Ember** identity.

---

## User Review & Confirmed Decisions

> [!IMPORTANT]
> All four architectural and visual craft decisions from our discovery interview have been locked into this plan:

- **Confirmed Decision 1 — Flagship Mobile Navigation Architecture**: Replace the anonymous hamburger-only mobile top bar with a **Glassmorphic Top Brand Header** (`56px`, displaying the Forge Ember emblem, wordmark, and quick telemetry/search actions) paired with a **Fixed 5-Tab Bottom Navigation Bar** (`Studio`, `Learn`, `Practice`, `Mastery`, `More Drawer`) anchored in the natural thumb zone (`pb-safe`).
- **Confirmed Decision 2 — Two-Tier Mobile Lesson Player (`/lesson/$lessonId`)**: Split the cramped single-row lesson header on mobile into a **Two-Tier Studio Header** (Tier 1: Back, Lesson Title, Outline & Notes sheet triggers; Tier 2: Full-width Pedagogical Movement Rail) paired with a **Sticky Thumb-Zone Action Bar** and backdrop-scrimmed bottom drawers.
- **Confirmed Decision 3 — Mobile IDE Ergonomics (`/playground` & `/debug-lab/$bugId`)**: Replace the multi-row wrapping button walls with a **Compact IDE Toolbar**, a horizontal single-pane workspace switcher (`Code`, `Preview`, `Validation`, `Console`, `Files`), and a **Thumb-Zone Run & Validate Bar**.
- **Confirmed Decision 4 — Mobile Craft & Visual Identity Upgrades**:
  1. Remove the destructive global `@media (max-width: 767px) { button, [role="button"], a.inline-flex { min-height: 44px; } }` rule that warps segmented tabs, badges, and inline controls across mobile.
  2. Add always-visible touch labels to `PathConstellation` nodes on mobile (eliminating hover-only mystery nodes).
  3. Introduce the signature **Forge Ember & Obsidian Glass** surface system with specular top-edge highlights and `active:scale-[0.98]` tactile press physics.
  4. Convert wrapping filter and sub-navigation stacks (`AnalyticsSubnav`, module filters) into smooth horizontal snap-scroll rails.

---

## Executive Mobile Audit Scorecard (Ratings Out of 10)

| Mobile Surface / Dimension | Current Rating | Target Rating | Primary Mobile Failure Mode Identified |
| :--- | :---: | :---: | :--- |
| **Overall Mobile Experience** | **5.4 / 10** | **9.8 / 10** | Desktop-first layout squeezed onto 375px with a global 44px CSS button override that distorts UI geometry. |
| **1. Mobile Navbar & App Shell** | **4.2 / 10** | **9.9 / 10** | Zero brand identity on mobile (logo hidden inside closed sidebar), no bottom tab bar, and cramped top-right icons. |
| **2. Global Touch CSS & Micro-Sizing** | **3.8 / 10** | **9.8 / 10** | Blanket `min-height: 44px` rule inflates every tiny tab, pill, and icon button into stretched vertical capsules. |
| **3. Studio Dashboard (`/`)** | **6.4 / 10** | **9.8 / 10** | `PathConstellation` relies on desktop hover tooltips (invisible on touch); mode switcher wraps awkwardly on 375px. |
| **4. Landing Experience (`/?view=landing` & `/about`)** | **6.8 / 10** | **9.8 / 10** | Interactive Hero Studio inspector controls and syllabus explorer pills stretch vertically due to the 44px CSS override. |
| **5. Lesson Player (`/lesson/$lessonId`)** | **5.5 / 10** | **9.9 / 10** | Leave, Outline, MovementRail, Bookmark, and Notes collide inside a single 375px header row; drawers lack mobile backdrop scrims. |
| **6. Code Playground (`/playground`)** | **4.8 / 10** | **9.6 / 10** | 6 action buttons wrap into 3 rows in `PageHeader`; mobile tab bar buttons are verticallybloated and horizontally clipped. |
| **7. Debug Lab (`/debug-lab` & `/debug-lab/$bugId`)** | **5.6 / 10** | **9.6 / 10** | Simulator + Code Inspector + Investigation Notes stack into a 2,400px scroll without a mobile workspace switcher. |
| **8. Curriculum & Roadmaps (`/learn`)** | **6.8 / 10** | **9.7 / 10** | Module filter buttons and search controls stack heavily above the fold before the first lesson card appears. |
| **9. Mastery & Analytics Hub (`/progress`, `/analytics`, `/mastery`)** | **6.2 / 10** | **9.7 / 10** | `AnalyticsSubnav` wraps into multiple rows of tall 44px pills on 375px screens instead of a sleek swipeable rail. |
| **10. AI Mentor & Practice Hub (`/mentor`, `/practice`)** | **6.5 / 10** | **9.7 / 10** | Prompt chips and header actions consume 45% of mobile viewport height before the conversation or arena grid begins. |

---

### Deep-Dive Page-by-Page Mobile Audit: What's Wrong, What's Missing & How We Fix It

#### 1. Mobile Navbar & Navigation Architecture — **4.2 / 10**
- **Why It Looks Weird Right Now**:
  - **Missing Brand Identity**: Because `AppSidebar` collapses off-screen on `< md` viewports and `TopBar` only renders `<SidebarTrigger />` on the left, a mobile visitor sees a generic hamburger icon with **no Forge logo, no brand name, and no current page context**.
  - **Asymmetric Top-Right Clutter**: Five separate utility triggers (Search icon, Streak badge, XP badge, Bell popover, Theme toggle) crowd the right side of the 375px bar, and the global `min-height: 44px` rule stretches the small icon buttons into tall narrow rectangles.
  - **Zero Thumb-Zone Navigation**: Switching from Curriculum to Practice or Analytics requires a two-step top-left corner reach (Open Hamburger -> Scroll Sidebar -> Tap Link).
- **The Solution**:
  - **Glassmorphic Top Brand Bar (`56px`)**: Left slot shows the glowing **Forge Ember Anvil** + `FORGE` typographic mark + active section badge. Right slot consolidates into a unified **Streak/XP Telemetry Pill**, **Command Search (`⌘K`)**, **Notifications**, and **Theme Toggle** with balanced `38px` visual pills inside ergonomic tap zones.
  - **Fixed 5-Tab Bottom Navigation Bar (`64px + safe-area`)**: Floating obsidian-glass dock (`backdrop-blur-xl bg-background/90 border-t border-white/10`) with 5 thumb-zone tabs: **Studio**, **Learn**, **Practice**, **Mastery**, and **More** (which opens the full-featured Studio Drawer).

#### 2. Global Touch CSS & Visual Identity (`design-overrides.css`) — **3.8 / 10**
- **Why It Breaks Every Page on Mobile**:
  - Lines 208–213 of `design-overrides.css` apply `button, [role="button"], a.inline-flex { min-height: 44px; }` globally on `< 768px`.
  - Any compact UI control—segmented tabs (`h-7`), code editor file tabs (`h-8`), filter chips, `MovementRail` step dots, or slider presets—gets forcibly stretched to `44px` tall while keeping `px-2` horizontal padding.
  - Additionally, `design-overrides.css` strips `.ember-glow` and `.shadow-glow` (`background: none !important; box-shadow: none !important;`), flattening Forge's visual depth on mobile OLED screens.
- **The Solution**:
  - Remove the blunt global `button { min-height: 44px }` override and replace it with explicit `.touch-target` utilities on primary interactive controls while preserving compact heights (`h-7`, `h-8`) for segmented tabs, code pills, and inline badges.
  - Introduce **Forge Obsidian & Ember Glass** tokens: subtle radial ember aura (`--ember-ambient`), crisp `1px` top-border specular highlights (`border-t border-white/12`), and spring-backed press feedback (`active:scale-[0.98]`).

#### 3. Studio Dashboard (`/`) & Path Constellation — **6.4 / 10**
- **What's Broken on Mobile**:
  - `PathConstellation` renders 8–10 lesson nodes on an SVG canvas, but the lesson titles are inside `opacity-0 group-hover:opacity-100` tooltips. On touchscreens, users see unlabeled circles and have no idea which lesson they are tapping.
  - The top Command Status Bar wraps awkwardly on 375px viewports when showing telemetry + `Studio Workspace / Landing Showcase` switcher + `60s Skill Diagnostic`.
- **The Solution**:
  - Upgrade `PathConstellation` with **always-visible mobile node badges** (`01`, `02`, active title callout) and an interactive **Active Node Preview Strip** at the bottom of the constellation card so tapping or viewing on mobile immediately shows the lesson title, module, and a direct `Launch` CTA.
  - Reflow the Dashboard Command Bar on mobile into a sleek 2-row bento header with a full-width segmented mode switcher.

#### 4. Lesson Player (`/lesson/$lessonId`) — **5.5 / 10**
- **What's Broken on Mobile**:
  - The header crams `Leave`, `Outline 1/8`, `MovementRail` (up to 7 step pills), `Bookmark`, and `Notes` into a single horizontal row. On 375px–414px screens, the `MovementRail` gets crushed to `< 120px` wide.
  - Opening the `Outline` or `Notes` drawer overlays `w-80` without a dark backdrop scrim, making it visually confusing over code editors.
- **The Solution**:
  - **Two-Tier Mobile Studio Header**:
    - **Row 1**: `Leave` button + truncated **Lesson Title** in center + `Outline (1/N)`, `Bookmark`, and `Notes` triggers on the right.
    - **Row 2 (`< md` only)**: Dedicated full-width **Pedagogical Movement Rail** with current step label (`Step 2/6 · System Investigation`) so the learner always knows where they are in the lesson arc.
  - Add a tap-to-dismiss **Backdrop Scrim (`bg-black/60 backdrop-blur-xs`)** behind the Outline and Notes drawers on mobile.
  - Keep the **Lesson Player** full-screen on mobile (suppressing the global 5-tab bottom bar so the Lesson Footer owns 100% of the bottom thumb zone).

#### 5. Code Playground (`/playground`) & Debug Lab (`/debug-lab/$bugId`) — **4.8 / 10**
- **What's Broken on Mobile**:
  - In `/playground`, `PageHeader` renders up to 6 buttons (`Submit & Complete`, `Back to Lesson`, `AI Review`, `Solution`, `Reset`, `Run & Validate`) that wrap into a chaotic cluster above the editor.
  - In `/debug-lab/$bugId`, the Live Diagnostic Simulator, Code Inspector, Hints Accordion, and Investigation Notes stack vertically with no tab switcher on mobile, forcing endless scrolling between the broken code and the live simulator.
- **The Solution**:
  - **Playground Mobile IDE Mode**: Condense secondary header actions into a compact toolbar, refine the single-pane mobile workspace bar (`Code`, `Preview`, `Validation`, `Console`, `Hints`, `Files`) with proper pill proportions, and anchor a **Sticky Thumb-Zone Execution Bar** (`Run Code` / `Run & Validate` + live compile status) at the bottom of the card.
  - **Debug Lab Mobile Workspace Switcher**: Add a mobile segmented view switcher (`Simulator + Fix` vs `Hints & Notes`) on `< lg` viewports so learners can toggle cleanly between diagnosing/coding and reading hints without losing scroll position.

#### 6. Mastery & Analytics Hub (`/progress`, `/analytics`, `/mastery`, `/achievements`, `/certificates`) — **6.2 / 10**
- **What's Broken on Mobile**:
  - `AnalyticsSubnav` wraps its 5 navigation tabs + 4 telemetry pills into a tall multi-line block on mobile screens.
- **The Solution**:
  - Transform `AnalyticsSubnav` on mobile into a **Single-Line Horizontal Snap-Scroll Pill Rail** (`overflow-x-auto scrollbar-none snap-x`) with a compact telemetry header strip above it, saving over `110px` of vertical fold space.

---

## 1. Overview & Core Concept

- **What It Does**: Elevates Forge's mobile and tablet experience (`375px–1023px`) to match flagship developer platforms (Linear Mobile, Raycast iOS, Vercel Mobile) while preserving the full 1360px 12-column Bento Command Center on desktop.
- **Target Audience / Persona**: Frontend engineers and learners reviewing concepts on the go, running interactive visual studios on phones/tablets, practicing bug diagnostics, and tracking mastery streaks one-handed.
- **Key Value**: Instant brand recognition ("wow" factor within 2 seconds of load), zero clipped or stretched buttons, effortless one-handed thumb navigation via a 5-tab bottom glass dock, and distraction-free mobile studio workspaces.

---

## 2. User Experience & Visual Design

### Mobile Viewport Budget & Thumb-Zone Ergonomics
- **15% Sticky Surface Cap**:
  - Top Brand Header: `54px` (`h-13.5`)
  - Bottom 5-Tab Glass Dock: `62px` (`h-15.5` + `env(safe-area-inset-bottom)`)
  - Over `85%` of the vertical viewport remains open for scrollable bento cards, visual simulations, and code workspaces.
- **Touch Target Discipline without Visual Distortion**:
  - Primary navigation tabs, drawer rows, and CTA buttons maintain `44px–48px` hitboxes.
  - Segmented tabs (`Code | Preview | Console`), filter chips, and inline badges use `32px–36px` visual heights with comfortable horizontal padding (`px-3`) and `gap-1.5` spacing so they look razor-sharp rather than vertically bloated.

### Signature "Obsidian & Molten Ember" Mobile Identity
- **Surface Hierarchy**:
  - **Canvas**: Deep Obsidian Ink (`oklch(0.145 0.012 260)`) with a subtle `24px` technical micro-grid and radial top-center ember aura (`radial-gradient(90% 50% at 50% 0%, oklch(0.7 0.2 46 / 14%), transparent 70%)`).
  - **Elevated Cards & Docks**: Translucent obsidian glass (`bg-card/88 backdrop-blur-xl`) with a top-edge specular hairline (`shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]`).
  - **Active Accents**: Molten Signal Orange (`oklch(0.7 0.2 46)`) with controlled active node glow and tactile press scaling (`active:scale-[0.98] transition-transform duration-150`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: 5-Tab Bottom Dock + Top Brand Header vs. Hamburger-Only Top Bar**
  - *Chosen Approach*: Persistent 5-Tab Bottom Bar (`Studio`, `Learn`, `Practice`, `Mastery`, `More`) + Glassmorphic Top Brand Header on `< lg` screens (automatically hidden inside `/lesson/$lessonId` so the Lesson Footer has exclusive control of the bottom edge).
  - *Why*: Eliminates top-left corner reach fatigue, restores Forge's brand presence on mobile, and makes switching between the 5 core hubs instantaneous.
- **Decision 2: Two-Tier Lesson Header on Mobile vs. Single-Row Compression**
  - *Chosen Approach*: Split the mobile lesson header into Row 1 (Navigation, Title, Drawer Triggers) and Row 2 (Full-width Pedagogical Movement Rail).
  - *Why*: Gives both the lesson title and the multi-step pedagogical rail 100% horizontal clarity on `375px` viewports without truncation collisions.
- **Decision 3: Scoped Touch Targets vs. Global `button { min-height: 44px }` CSS Rule**
  - *Chosen Approach*: Remove the global `button` tag override in `src/design-overrides.css` and apply explicit touch sizing to navigation and primary CTAs.
  - *Why*: Immediately fixes stretched code tabs, distorted filter chips, and warped inline controls across all 26 routes.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Mobile Navigation & Workspace Architecture Diagram

```
┌───────────────────────────────────────────────────────────────────────────┐
│                     FORGE MOBILE VIEWPORT (< 1024px)                      │
├───────────────────────────────────────────────────────────────────────────┤
│ [TopBar: 54px Sticky Glass]                                               │
│  ┌──────────────────────────┐        ┌──────────────────────────────────┐ │
│  │ 🔥 FORGE · [Active Hub]  │        │ [🔥 Streak · XP] [⌘K] [🔔] [🌗] │ │
│  └──────────────────────────┘        └──────────────────────────────────┘ │
├───────────────────────────────────────────────────────────────────────────┤
│ [Main Viewport Canvas: pb-24 on <lg to clear Bottom Dock]                 │
│                                                                           │
│  ┌─ Route: Studio / Landing (/) ────────────────────────────────────────┐ │
│  │ • Mobile-optimized Bento Hero + Segmented Studio/Landing Switcher    │ │
│  │ • PathConstellation with visible touch node labels + Active Bar      │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  ┌─ Route: Lesson Studio (/lesson/$lessonId) [Hides Global Bottom Nav] ─┐ │
│  │ • Tier 1 Header: [←] [Lesson Title]           [Outline 1/N] [🔖] [📝]│ │
│  │ • Tier 2 Header: [●━━━◉━━━○━━━○━━━○]  Step 2/5 · Investigation      │ │
│  │ • Scrimmed Mobile Drawers (Outline & Studio Notes)                   │ │
│  │ • Sticky Thumb-Zone Footer: [← Prev] [   Check Answer / Continue   ] │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  ┌─ Route: Playground & Debug Lab (/playground, /debug-lab/$bugId) ─────┐ │
│  │ • Compact IDE Toolbar + Horizontal Pill Switcher (Code|Preview|...)  │ │
│  │ • Sticky Bottom Execution Bar: [▶ Run & Validate]   [Console Status] │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
├───────────────────────────────────────────────────────────────────────────┤
│ [MobileBottomNav: 62px + safe-area Fixed Glass Dock (lg:hidden)]          │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────────────────────┐ │
│  │  Studio  │  Learn   │ Practice │ Mastery  │   More ( opens Sidebar ) │ │
│  │   (/)    │ (/learn) │(/practice│(/progress│   (AI Mentor, Tools...)  │ │
│  └──────────┴──────────┴──────────┴──────────┴──────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────┘
```

### Interactive Component & State Mapping
1. **Mobile Brand TopBar & Bottom Dock (`TopBar` + `MobileBottomNav` + `__root.tsx`)**:
   - `TopBar` renders the Forge Ember emblem + `FORGE` title + current hub badge on `< md` alongside a compact `Streak + XP` pill, `Search`, `Notifications`, and `ThemeToggle`.
   - `MobileBottomNav` mounts in `AppLayout` (`__root.tsx`) for all non-lesson routes on `< lg` viewports, highlighting the active hub (`Studio`, `Learn`, `Practice`, `Mastery`) and wiring the 5th tab (`More`) directly to `useSidebar().setOpenMobile(true)` so learners can access AI Mentor, Flashcards, Whiteboard, Journal, and Settings from the thumb zone.
   - `AppLayout` adds `pb-24 lg:pb-9` to the main content container so no page footer or card is ever obscured by the fixed bottom dock.
2. **Global Mobile CSS & Obsidian-Ember Polish (`design-overrides.css`)**:
   - Removes the destructive `@media (max-width: 767px) { button, [role="button"], a.inline-flex { min-height: 44px; } }` rule while preserving `font-size: 16px !important` on `input, textarea, select` to prevent iOS Safari auto-zoom.
   - Restores controlled `.ember-glow`, `.shadow-glow`, and `.glass-panel` specular styling so mobile cards and active states radiate Forge's signature craftsmanship.
3. **Touch-First `PathConstellation` (`path-constellation.tsx`)**:
   - Renders persistent mobile micro-labels beneath constellation nodes on `< sm` viewports and adds an interactive node selection/preview bar at the base of the constellation so touch users can inspect any node before launching.
4. **Two-Tier Mobile Lesson Shell (`lesson-shell.tsx`)**:
   - Separates the `MovementRail` into a dedicated second tier on `< md` viewports with a live step counter (`Step X/Y · Role`).
   - Adds a mobile backdrop scrim (`fixed inset-0 bg-black/60 backdrop-blur-xs z-30`) whenever `outlineOpen` or `notesOpen` is active so tapping outside cleanly closes the drawer.
5. **Horizontal Snap-Scroll Subnavs & Mobile IDE Bars (`analytics-subnav.tsx`, `playground.tsx`, `debug-lab.$bugId.tsx`)**:
   - Converts `AnalyticsSubnav` tabs into a horizontal snap-scroll rail (`overflow-x-auto flex-nowrap scrollbar-none`) on mobile.
   - Streamlines `playground.tsx` and `debug-lab.$bugId.tsx` on mobile with compact header actions, clean single-pane tab switching, and a sticky thumb-zone `Run & Validate` bar.
