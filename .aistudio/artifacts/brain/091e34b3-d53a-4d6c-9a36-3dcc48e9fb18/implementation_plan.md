# Forge Academia — Contextual Mascot, Clean Lesson Studio & 4-Pillar MVP Plan

Transform Forge Academia into a cohesive, zero-setup **"Learn → Practice Live → Build Projects → Ace the Interview"** platform while eliminating all "ELI5" terminology and replacing the heavy, repetitive top lesson banner with a clean header toolbar and natural, step-contextual **Forge Buddy** moments.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> All three UX and architectural choices from our Product Manager review are locked in below:

- **Confirmed Decision 1 — Contextual Mascot Integration (No Heavy 4-Tab Banner)**: Remove the bulky 4-tab `ELI5 & Guide` banner that pushed lesson activities below the fold. Instead, **Forge Buddy** (the Hooded Forge Spirit) appears as a **compact, conversational speech bubble** tailored to the current step, plus an interactive inline reaction when checking answers or hitting errors.
- **Confirmed Decision 2 — Top Header Bar for Audio & Live Code Slide-Over Drawer**: Move the **Studio Audio Narration Player (`Listen · 1x · Auto`)** and the **`Code Live` Sandbox toggle** into the top `LessonShell` header bar (`Zone 3`). Clicking `Code Live` opens a **Slide-Over / Split-Screen Code Drawer** so learners can write and run real code alongside any lesson step without cluttering the reading stage.
- **Confirmed Decision 3 — Step-Aware Delivery of Humor, Plain-English Breakdowns & Interview Traps**:
  - **Zero "ELI5" Jargon Anywhere**: Eradicate every instance of `ELI5` across the UI and mentor bank.
  - **Intro / Concept Steps**: Forge Buddy delivers a punchy **Real-World Analogy & Dev Joke** (`winking` / `happy` pose) to make the mental model click immediately.
  - **Code / Practice / Challenge Steps**: Forge Buddy highlights **"How Interviewers Ask This Live"** (`thinking` / `coding` pose) with a 1-click **"Test Trap in Live Sandbox"** button that loads the exact interview edge case (e.g., `fetch` 404 handling, `async/await` without `try/catch`, microtask ordering) into the slide-over code drawer.
  - **Answer Check / Completion**: Forge Buddy reacts inline (`cheering` / `excited` on pass, or offering a 1-click hint on retry).

---

## 1. Overview & Core Concept

- **What It Does**: Connects every part of Forge into one seamless confidence loop:
  1. **Learn**: Listen to any step aloud with the top header audio bar, laugh at memorable developer analogies, and open the slide-over Live Code Drawer on any step.
  2. **Practice Live**: Experiment with pre-loaded `async/await`, DOM, CSS, and React snippets right inside the lesson drawer or full Playground.
  3. **Build Projects**: Launch any project from `/projects` directly into `/playground?projectId=<id>` with multi-file starter code (`index.html`, `styles.css`, `app.js`) and a docked milestone checklist.
  4. **Ace the Interview**: Jump into the Creative Atelier-styled **Mock Interview Simulator** (`/interview` & `/interview/session`) from the top nav, Dashboard **Interview Readiness** card, or end-of-lesson bridge—complete with a live JS/TS code runner, progressive sideline coaching from Forge Buddy, and instant Staff Engineer rubric grading.

---

## 2. User Experience & Visual Design

- **Aesthetic Direction**: **Creative Atelier Studio** — warm drafting-paper canvas (`#FFFDF9` / `#FAF6F0`), crisp drafting-ink borders (`#E5DFD3`), and the signature **Forge Spirit** palette (Vibrant Indigo-Violet `#6E6AF6`, Deep Midnight Navy `#1E1B4B`, and Warm Gold `#FBBF24`).
- **Typography & Hierarchy**:
  - *Display*: `Plus Jakarta Sans` (SemiBold/ExtraBold) for clear, balanced headings.
  - *Body*: `DM Sans` for readable prose and conversational mascot bubbles.
  - *Code & Telemetry*: `JetBrains Mono` with `tabular-nums` for timers, step counters, and console output.
- **Clean Lesson Stage Layout (`LessonShell` + `LessonExperience`)**:
  - **Top Header Bar (`LessonShell`)**:
    - *Left*: Leave button, Outline drawer trigger, and Module / Lesson title.
    - *Center*: Pedagogical Step Rail (`MovementRail`).
    - *Right (`Studio Utilities`)*: **Compact Audio Player** (`Listen / Pause`, `1x / 1.25x / 1.5x` speed, `Auto` toggle), **`Code Live` Sandbox Drawer button** (with active indicator), Bookmark, and Notes.
  - **Contextual Forge Buddy Strip (`ForgeBuddyLessonCompanion`)**:
    - A slim, single-elevation conversational card (`py-3 px-4`) featuring the Hooded Forge Spirit avatar (`w-11 h-11`) and **one focused message** matched to the step role:
      - *Step 1–2 (Hook / Concept)*: **Plain-English Analogy + Dev Wit** (*"Think of a Promise like a restaurant buzzer..."*) with an optional 1-click *"Tell me the dev joke"* pill.
      - *Step 3+ (Walkthrough / Practice / Code / Quiz)*: **Live Interview Trap Callout** (*"Interviewers love asking: What happens if fetch() gets a 404?"*) with a 1-click **"Test This Trap Live →"** button that opens the slide-over code drawer pre-loaded with that exact scenario.
      - *When Answer Checked*: Morphs into a live reaction (*"Spot on! Step locked in"* with `cheering` pose, or *"Close! Check how the promise resolves—want a hint?"* with `thinking` pose).
  - **Slide-Over / Split Live Code Drawer (`LessonLiveSandboxDrawer`)**:
    - Opens smoothly as a right-hand split panel (on desktop) or bottom sheet (on mobile) inside `LessonShell` so the learner can read the lesson on the left and run live code on the right.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Header Audio & Slide-Over Sandbox vs. In-Flow Top Banner**
  - *Chosen Approach*: Move Audio Narration and the Live Code Sandbox trigger into `LessonShell`'s sticky top header, and render the sandbox as a slide-over split drawer.
  - *Why*: Frees up 180px+ of vertical viewport space above the fold so the learner immediately sees the lesson activity while keeping audio and live coding accessible on every step.
- **Decision 2: Step-Contextual Mascot Prompts vs. 4 Static Tabs**
  - *Chosen Approach*: Automatically surface the Plain-English Analogy & Joke on early conceptual steps, and automatically surface the Interview Trap & Sandbox launcher on code/practice steps (with a subtle toggle pill if the user wants to peek at the other).
  - *Why*: Eliminates "banner blindness" by making Forge Buddy say something genuinely different and relevant as you progress through a lesson.
- **Decision 3: Creative Atelier Styling & Quick Practice on `/interview` and Dashboard**
  - *Chosen Approach*: Restyle `/interview` and `/interview/session` to match the warm Creative Atelier paper + Violet/Navy studio aesthetic, add an **Interview Readiness & Quick Practice** card on the Studio Dashboard, and include a **Quick Flashcards & Bug Drill** mode switcher inside the Interview hub.
  - *Why*: Makes Interview Prep feel like a native room of the Creative Atelier rather than a legacy dark-mode page.

---

## 4. Technical Architecture & Data Strategy

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         LessonShell (Sticky Header)                          │
│  [← Leave | Outline]   [Step Movement Rail]   [🔊 Listen 1x | 💻 Code Live]  │
└───────────────────┬──────────────────────────────────────┬───────────────────┘
                    │                                      │ (Toggle Drawer)
                    ▼                                      ▼
┌───────────────────────────────────────────┐  ┌───────────────────────────────┐
│        Contextual Forge Buddy Bar         │  │   Slide-Over Live Sandbox     │
│ • Intro Step: Plain-English Hook + Joke   │  │ • Editable JS / Async / HTML  │
│ • Code Step: "Interview Trap" + 1-Click ──┼─►│ • Loads Interview Trap Code   │
│ • Answer Check: Cheering / Hint Reaction  │  │ • Console + DOM Preview       │
└───────────────────┬───────────────────────┘  └───────────────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────┐
│        ActivityStage & ClosureSurface     │
│ • Interactive Exercise / Code / Quiz      │
│ • End-of-Lesson Bridge:                   │
│   [Practice in Sandbox] [Try Interview Q] │
└───────────────────────────────────────────┘
```

- **Complete Eradication of "ELI5"**:
  - Rename all UI labels from `ELI5` to **Plain-English Breakdown** / **Mental Model**, and clean up all references in `StudioDeskHero`, `ForgeBuddyLessonCompanion`, and the mentor bank.
- **Dashboard & Interview Hub Enhancements**:
  - Add an **Interview Readiness** section on the Studio Dashboard (`/dashboard`) with 1-click launches into `Async & Promises`, `JavaScript Internals`, `DOM & UI`, and `React Systems` mock interviews.
  - Add a **Quick Practice & Flashcards** tab inside `/interview` so users can warm up with spaced-repetition flashcards and bug-fix drills right before launching a timed mock interview session.
  - Update `/interview` and `/interview/session` cards, backgrounds, and typography to the warm Creative Atelier paper & violet-navy studio theme.
