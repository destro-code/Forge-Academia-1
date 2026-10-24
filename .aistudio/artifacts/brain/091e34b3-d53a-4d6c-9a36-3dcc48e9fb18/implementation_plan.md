# Forge Academia — Lesson Player UX & HTML Module Quality Plan

This plan addresses the mobile interaction layout and control clarity in the `LayerStack` simulation, eliminates duplicate validation feedback in code exercises, simplifies the lesson completion surface to report only verified learner outcomes, and repairs curriculum data across the eight HTML module lessons.

---

## User Review & Critical Decisions

- **Cumulative Layer Controls in `LayerStack`:** Confirmed. Instead of independent toggles that allow learners to accidentally disable the base HTML markup (leaving CSS and JavaScript with nothing to style or target), the top control bar will present three cumulative stages: **Stage 1: HTML Only**, **Stage 2: HTML + CSS**, and **Stage 3: HTML + CSS + JS**.
- **Redundant HTML Module Steps:** Confirmed. Generic repeated steps (`Interactive Semantic Document & Layer Inspector` and `Replicate UI: Semantic Feature Card`) will be removed across the eight HTML lessons unless specifically tailored to that lesson's unique learning objective.
- **Simplified Lesson Completion Card:** Confirmed. The completion card will remove unconditional mastery claims, unverified capability checklists, and secondary navigation clutter, retaining only the sticky footer's primary CTA plus a single secondary **Review Steps** action.

---

## 1. Overview & Core Concept

Learners on mobile devices need immediate visual cause-and-effect when interacting with simulations, clear and non-repetitive feedback when running code checks, and honest progress reporting at the end of a lesson. This refactoring focuses on six interconnected improvements:

1. **Immediate Mobile Cause-and-Effect (`LayerStack`):** Reorder the mobile layout so the live preview appears directly beneath the stage selector (`1 · CHOOSE A STAGE` → `2 · SEE THE RESULT IMMEDIATELY` → `3 · INSPECT THE CODE`), while preserving the side-by-side layout on desktop viewports.
2. **Single-Owner Code Activity Feedback:** Make the test results panel the sole owner of the main pass/fail headline and criterion breakdown in HTML, CSS, and JavaScript coding activities, while restricting the secondary feedback surface to revealed hints only.
3. **Honest, Compact Lesson Completion Surface:** Replace inflated "Lesson Verified" and static capability badges with an accurate summary comprising a truthful completion header, a one-sentence core takeaway, recorded activity/check evidence, and a single secondary action to review steps.
4. **Distinct Diagnostic Feedback in HTML Curriculum:** Replace 30 copy-pasted `incorrect` feedback strings across the eight HTML lessons with specific diagnostic guidance that highlights the misconception without praising the learner or giving away the exact answer.
5. **Curriculum Step Deduplication & Code Alignment:** Remove boilerplate visual/replication steps injected across the HTML lessons and align coding exercise prompts, starter code, validation checks, and reference feedback.
6. **Automated Regression Coverage:** Add unit and component tests verifying the cumulative stage behavior, single-render code feedback, honest completion card states, and distinct correct/incorrect curriculum strings.

---

## 2. User Experience & Visual Design

### Mobile-First Activity & Simulation Layout
- **Immediate Visual Feedback Loop:** On mobile viewports, interactive controls must sit immediately above the live preview so tapping a stage button produces a visible change within the same viewport without scrolling past code blocks.
- **Cumulative Stage Selector (`1 · CHOOSE A STAGE`):**
  - Displays three clear stage pills/cards: `1. HTML (Structure)`, `2. HTML + CSS (+ Style)`, and `3. HTML + CSS + JS (+ Behavior)`.
  - Selecting a stage guarantees the base HTML markup remains mounted while layering CSS and JavaScript progressively.
- **Live Preview (`2 · LIVE PREVIEW`):**
  - Rendered directly below the stage selector on mobile (`order-2`) and in the right-hand column on desktop (`lg:col-start-2 lg:row-start-1 lg:row-span-2`).
  - Displays active layer badges in the preview header so learners can see which layers are active at a glance.
- **Code Inspection Panel (`3 · INSPECT THE CODE`):**
  - Positioned below the live preview on mobile (`order-3`) with clean tabs (`HTML`, `CSS`, `JavaScript`) that default to the newly added layer for the chosen stage while allowing inspection of any layer's source code.

### Code Exercise Feedback Surface
- **Single Authoritative Result Banner:** When a learner runs code or checks their solution in HTML, CSS, or JavaScript exercises, the test results panel renders the primary pass/fail summary headline and the criterion-by-criterion checklist once.
- **Hint-Only Secondary Surface:** The activity feedback component at the bottom of code exercises is configured to suppress duplicate validation headlines, rendering only when the learner has unlocked progressive hints.

### Honest Lesson Completion Card
- **Four Focused Elements:**
  1. **Completion Header:** Displays `"Lesson Complete"` by default, upgrading to `"Lesson Mastered"` only when all graded checks in the lesson were passed.
  2. **Core Takeaway:** A single, high-contrast summary sentence stating the lesson's target mental model.
  3. **Recorded Evidence Summary:** Accurately reports the count of activities completed alongside graded checks passed on the first attempt versus checks that required retries.
  4. **Focused Navigation:** Keeps the primary forward CTA (`Next Lesson` or `Return to Module`) in the sticky footer and provides a single secondary `Review Steps` button inside the card.

---

## 3. Key Product Decisions & Trade-Offs

- **Cumulative Stages vs. Independent Layer Checkboxes:**
  - *Decision:* Enforce cumulative stages (`HTML` → `HTML + CSS` → `HTML + CSS + JS`) while allowing free tab switching in the code viewer.
  - *Rationale:* CSS selectors and JavaScript DOM queries depend on HTML structure existing in the document. Cumulative stages prevent broken blank states while teaching how presentation and behavior build on top of semantic markup.
- **Preserving Standard Quiz Feedback While Deduplicating Code Exercises:**
  - *Decision:* Keep `ActivityFeedback` intact for multiple-choice, output-prediction, and fill-in-the-blank activities (where it is the sole feedback renderer), and suppress its validation banner only in the three code experience renderers where `TestResultsPanel` is already present.
  - *Rationale:* Avoids regressions in declarative quiz activities while eliminating the double banner in code playgrounds.
- **Curriculum Purity over Filler Length:**
  - *Decision:* Remove repeated generic visual inspector and feature-card replication steps from lessons where they do not directly serve the lesson's specific topic, and tighten code exercise explanations to match what substring/structural tests actually verify.
  - *Rationale:* Every step in a lesson should advance the specific concept being taught rather than padding step counts with identical exercises.

---

## 4. Technical Architecture & Data Strategy

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         Mobile Lesson Viewport                           │
├──────────────────────────────────────────────────────────────────────────┤
│  LayerStack Simulation                                                   │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │ 1 · CHOOSE A STAGE: [ HTML Only ] [ HTML + CSS ] [ HTML + CSS + JS]│  │
│  └─────────────────────────────────┬──────────────────────────────────┘  │
│                                    ▼                                     │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │ 2 · LIVE PREVIEW (Immediate Visual Result on Mobile)               │  │
│  └─────────────────────────────────┬──────────────────────────────────┘  │
│                                    ▼                                     │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │ 3 · INSPECT THE CODE (Synchronized Layer Tabs: HTML / CSS / JS)    │  │
│  └────────────────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────────────┤
│  Code Activity Renderers (HTML / CSS / JS)                               │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │ TestResultsPanel  ──► Sole owner of Pass/Fail Headline & Criteria  │  │
│  │ ActivityFeedback  ──► Renders Progressive Hints ONLY               │  │
│  └────────────────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────────────┤
│  ClosureSurface (Final Step)                                             │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │ Header + 1-Sentence Takeaway + Actual Recorded Evidence            │  │
│  │ Secondary Action: [ Review Steps ]   │   Sticky Footer: [ Next → ] │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

### Data & State Verification
- **HTML Curriculum Audit (8 Lessons, 30 Activities):**
  - Systematically update every activity in the HTML module where `feedback.correct === feedback.incorrect` so that `feedback.incorrect` provides a targeted, non-celebratory diagnostic clue tailored to the question's specific HTML concept (elements, document skeleton, heading hierarchy, links/media, semantic landmarks, forms, and page structure).
  - Audit code exercises across the HTML module so starter templates, expected test substrings, and solution explanations use consistent tags and attributes.
  - Re-index step numbers cleanly after removing redundant untailored visual/replication steps.
