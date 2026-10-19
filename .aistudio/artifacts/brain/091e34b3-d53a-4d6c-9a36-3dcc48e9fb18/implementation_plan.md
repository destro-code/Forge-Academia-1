# Forge Curriculum v2 Manuscript-to-V1 Architecture Synchronization & Conversion Plan

This plan establishes a lossless, deterministic conversion pipeline to transform all 17 authored Forge Curriculum v2 Markdown manuscripts (**155 lessons** across Modules `0.1` through `4.2`) into production-approved Canonical V1 lessons while synchronizing the curriculum identity registries so every lesson passes the 13-gate runtime integrity validator.

## User Review & Critical Decisions

> [!IMPORTANT]
> **Architectural Findings from Manuscript Audit**:
> 1. **Curriculum Taxonomy Divergence**: The current manifest reflects an earlier module sequence (e.g., Module `0.2` listed as *Developer Tools*, `1.3` as *JavaScript*, `4.1` as *Global State*) that conflicts with the 17 authored v2 manuscripts (`0.2` *Thinking Like a Programmer*, `1.1–1.4` *HTML/CSS/Layout/Accessibility*, `2.1–2.5` *JS/DOM/TS/APIs/Git*, `3.1–3.4` *React*, `4.1` *Next.js*, `4.2` *Application State*).
> 2. **Module 1.1 Replacement**: Six older lessons currently exist for `1.1`, whereas the v2 manuscript defines **8 complete lessons** (`1.1.1` through `1.1.8`).
> 3. **Production-Approved Activity Mapping**: Using unapproved activity types (such as `code-example`) triggers a runtime schema rejection. All manuscript sections will map strictly to approved V1 surfaces (`intro`, `explanation`, `multiple-choice`, `ordering`, `reflection`, `code-modification`, and `summary`).

- **Confirmed Decision 1 (Authoritative v2 Taxonomy)**: Synchronize the curriculum manifest, concept catalog, and capability catalog to match the 17 v2 manuscripts as the single source of truth, replacing the 6 legacy Module `1.1` lessons with the 8 v2 manuscript lessons.
- **Confirmed Decision 2 (Deterministic Manuscript Compiler)**: Build a reproducible Markdown-AST-to-V1 compiler and validator workflow that preserves 100% of the authored explanatory prose, ASCII/code diagrams, question stems, option sets, answer keys, feedback blocks, and senior takeaways without summarizing or turning prose into multiple-choice quizzes.
- **Confirmed Decision 3 (Approved V1 Activity Surfaces Only)**: Map every manuscript block onto existing production-approved V1 activity types so every lesson renders immediately in the Forge Lesson Player with zero schema errors.

---

## 1. Overview & Core Concept

- **What It Does**: Converts all 17 Forge Curriculum v2 manuscripts (**155 lessons** spanning Levels 0 through 4) into validated V1 lesson records, updates the curriculum identity hierarchy (`phases`, `modules`, `topics`, `concepts`, `capabilities`), and ensures seamless navigation, progress tracking, and interactive execution in the Forge Lesson Player.
- **Target Audience / Persona**: Frontend engineering learners progressing from foundational mental models (Level 0) through HTML/CSS/Accessibility (Level 1), JavaScript/TypeScript/APIs/Git (Level 2), React Architecture (Level 3), and Production Next.js & Application State (Level 4).
- **Key Value**: Guarantees 100% fidelity to the authored curriculum manuscripts—preserving every explanation, diagram, prediction, guided lab, reflection, checkpoint, and Forge takeaway—while satisfying all 13 runtime integrity gates.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Curriculum Overview & Module Discovery**: Learners browse Levels 0–4 on the curriculum map, seeing accurate v2 module titles, lesson counts, estimated durations, and prerequisite chains.
  2. **Instructional Reading & Diagrams (`intro` & `explanation`)**: Learners begin each lesson with the authored hook and mental model, reading structured prose and formatted code/ASCII diagrams in high-contrast typography before being tested.
  3. **Active Prediction & Verification (`multiple-choice` & `ordering`)**: When the manuscript presents a prediction, sequence exercise, or checkpoint, learners commit to an answer and receive the exact authored review feedback.
  4. **Open-Ended Reasoning & Labs (`reflection` & `code-modification`)**: For *"Say it in your own words"*, *"Tiny exercise"*, and *"Forge Mission"* sections, learners compose their own response or code modification and compare it against the manuscript's suggested solution and review criteria.
  5. **Lesson Closure (`summary`)**: Every lesson concludes with the authored **Forge takeaway** (Mental Model, Senior Habit, and Lesson Completion criteria) and advances cleanly to the next authored lesson.
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: High-craft technical academy workspace combining editorial clarity for reading passages with tactile interactive cards for predictions, code labs, and reflections.
  - *Color Palette & Mood*: Follows the 60-30-10 discipline—60% neutral slate canvas (`--background`), 30% structured activity surfaces with hairline borders (`--card` / `--border`), and 10% semantic focal accents (`--primary` for active step progression, emerald for verified answers, amber for guided hints).
  - *Typography & Hierarchy*: Clear distinction between instructional headings, readable prose measure (`65ch–75ch`), and monospace code/diagram blocks (`JetBrains Mono` / `IBM Plex Mono` with `tabular-nums`).
  - *Component Styling & Layout*: Unboxed metadata with middle-dot separators (`·`), single-elevation activity cards, and generous vertical spacing between instructional reading blocks and interactive checkpoints.
- **Interactive Feedback & Motion**: Immediate (<150ms) state transitions when submitting predictions, revealing suggested reflection answers, or advancing across lesson steps.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Deterministic Markdown Parser vs. Manual One-Off Conversion**
  - *Chosen Approach*: Build a structured compiler script that parses all 17 manuscript files into Canonical V1 JSON and cross-registers all curriculum entities.
  - *Why*: Manual conversion of 155 lessons (~45,000+ lines of JSON) is prone to human/LLM summarization, dropped paragraphs, and inconsistent IDs. A deterministic parser guarantees verbatim preservation of every heading, paragraph, code block, option, review key, and feedback note across all 17 modules.
  - *Alternatives Considered*: Hand-converting lessons one by one—rejected due to scale (155 lessons) and high risk of text truncation.
- **Decision 2: Mapping Specialized Manuscript Exercises to Approved V1 Activity Types**
  - *Chosen Approach*:
    - Opening section (`1. Start here` / opening prose) $\to$ `intro` activity (preserving hook, full context paragraphs, and learner goal).
    - Explanatory sections, comparisons, and ASCII/code diagrams $\to$ `explanation` activity (preserving full markdown text and fenced code blocks).
    - Authored questions with `A/B/C/D` options and `Review key` $\to$ `multiple-choice` activity (preserving exact option text, correct option ID, and authored feedback).
    - Sequence/arrangement exercises (e.g., *"Put it in order"*) $\to$ `ordering` or `multiple-choice` depending on manuscript structure.
    - Matching exercises, free-form exercises, and *"Say it in your own words"* prompts $\to$ `reflection` activity (allowing learner composition with the manuscript's `Suggested answer` / `Review key` and `Feedback` surfaced upon submission).
    - Closing `Forge takeaway` & `Lesson completion` $\to$ `summary` activity.
  - *Why*: Every one of these types is marked `isProductionApproved: true` in the V1 Activity Audit Matrix and has a dedicated, tested renderer in the Lesson Player.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                 17 Authored Markdown Manuscripts (v2)                    │
│     Modules 0.1–0.2 (12) · 1.1–1.4 (42) · 2.1–2.5 (45) · 3.1–3.4 (36)    │
│                           · 4.1–4.2 (20)                                 │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│             Deterministic Manuscript-to-V1 Compiler Pipeline             │
│  • Parses module outcomes, lesson headers, durations, and learner goals  │
│  • Classifies sections into Intro, Explanation, MCQ, Reflection, Summary │
│  • Extracts verbatim prose, fenced diagrams, options, keys & feedback    │
└───────────┬────────────────────────┴────────────────────────┬────────────┘
            │                                                 │
            ▼                                                 ▼
┌───────────────────────────────────────┐ ┌────────────────────────────────┐
│   Authoritative Identity Catalogs     │ │   155 Canonical V1 JSON Files  │
│  • Curriculum Manifest (Levels 0–4,   │ │  • Schema V1 structure         │
│    Modules, Topics, 155 Lesson Refs)  │ │  • Strict Prerequisite Chains  │
│  • Registered Concepts Catalog        │ │  • Production-Approved Types   │
│  • Registered Capabilities Catalog    │ │  • Required Mastery Activities │
└───────────────────┬───────────────────┘ └───────────────┬────────────────┘
                    │                                     │
                    └──────────────────┬──────────────────┘
                                       ▼
┌──────────────────────────────────────────────────────────────────────────┐
│               13-Gate V1 Loader & Canonical Content Provider             │
│  • Gate 1–3: Discovery, Filename↔ID match, Zod Canonical Schema V1       │
│  • Gate 4: CurriculumIdentityError verification (Topic/Module/Concept)   │
│  • Gate 5–8: Activity Audit Approval & Option/Answer Reference Checks    │
│  • Gate 9–13: Bidirectional Manifest Sync, Prerequisite Order & Mastery  │
└──────────────────────────────────────┬───────────────────────────────────┘
                                       ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                     Forge Lesson Player & Curriculum UI                  │
└──────────────────────────────────────────────────────────────────────────┘
```

- **Data Model & Module Inventory (155 Lessons Across 17 Modules)**:
  - **Level 0 (`phase-0`)**:
    - `module-0-1`: *The Web as a System* — 6 lessons (`lesson-0-1-1` to `0-1-6`) [Verified & preserved]
    - `module-0-2`: *Thinking Like a Programmer* — 6 lessons (`lesson-0-2-1` to `0-2-6`)
  - **Level 1 (`phase-1`)**:
    - `module-1-1`: *HTML: Structure and Meaning* — 8 lessons (`lesson-1-1-1` to `1-1-8`)
    - `module-1-2`: *CSS: Make the Structure Visible* — 12 lessons (`lesson-1-2-1` to `1-2-12`)
    - `module-1-3`: *Layout and Responsive Design* — 12 lessons (`lesson-1-3-1` to `1-3-12`)
    - `module-1-4`: *Accessible Interface Craft* — 10 lessons (`lesson-1-4-1` to `1-4-10`)
  - **Level 2 (`phase-2`)**:
    - `module-2-1`: *JavaScript: The Language of Behavior* — 10 lessons (`lesson-2-1-1` to `2-1-10`)
    - `module-2-2`: *JavaScript in the Browser* — 10 lessons (`lesson-2-2-1` to `2-2-10`)
    - `module-2-3`: *TypeScript: Make Intent Explicit* — 8 lessons (`lesson-2-3-1` to `2-3-8`)
    - `module-2-4`: *Web Data and APIs* — 7 lessons (`lesson-2-4-1` to `2-4-7`)
    - `module-2-5`: *Git, GitHub, and Team Workflow* — 10 lessons (`lesson-2-5-1` to `2-5-10`)
  - **Level 3 (`phase-3`)**:
    - `module-3-1`: *React: Think in UI State* — 9 lessons (`lesson-3-1-1` to `3-1-9`)
    - `module-3-2`: *React: Interaction and Effects* — 9 lessons (`lesson-3-2-1` to `3-2-9`)
    - `module-3-3`: *React: Component Design and Application Patterns* — 9 lessons (`lesson-3-3-1` to `3-3-9`)
    - `module-3-4`: *Routing, Data Flow, and React Applications* — 9 lessons (`lesson-3-4-1` to `3-4-9`)
  - **Level 4 (`phase-4`)**:
    - `module-4-1`: *Next.js Application Engineering* — 15 lessons (`lesson-4-1-1` to `4-1-15`)
    - `module-4-2`: *Application State* — 5 lessons (`lesson-4-2-1` to `4-2-5`)

- **Interactive Component & State Mapping**:
  - Each generated lesson's `mastery.completionCriteria.requiredActivities` array automatically references all interactive assessment activities (`multiple-choice`, `ordering`, `reflection`) within that lesson so completion progress and XP calculation work out of the box.
  - Sequential `prerequisiteLessonIds` are linked within each module so the curriculum progression graph and "Next Lesson" navigation work continuously from `lesson-0-1-1` through `lesson-4-2-5`.
