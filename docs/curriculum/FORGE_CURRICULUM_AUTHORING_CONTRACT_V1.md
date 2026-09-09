# FORGE CURRICULUM AUTHORING CONTRACT V1
**Production Standard for Canonical Lesson Design, Pedagogical Progression, and Evidence Integrity**

- **Document Version:** 1.0.0
- **Status:** Ratified & Authoritative
- **System Target:** Forge Canonical Learning Engine (`src/lib/curriculum/`, `src/components/lesson/canonical/`)
- **Authority:** Preceded by `FORGE_LEARNING_EXPERIENCE_SPEC_V1.md` and `FORGE_VOICE_AND_HUMOR_BIBLE_V1.md`. Governs all future lesson authoring, transformation, and batch production (B5+).

---

## 1. PURPOSE & INTENT

The purpose of this Contract is to establish the definitive, machine-enforceable standard for authoring Forge lessons. 

Forge is not an encyclopedia, a video course platform, a documentation site, or a trivia quiz runner. Forge is an engineering academy designed to take learners from total novice to staff-level frontend engineer by cultivating genuine mental models, predictive instincts, debugging intuition, and architectural reasoning.

This document answers the core engineering question:
> **How must a Forge lesson be authored so that the existing canonical runtime architecture produces a genuinely effective, active, beginner-friendly learning experience without requiring ad-hoc runtime modifications?**

Every lesson authored for Forge is a structured software artifact: a deterministic JSON document validated by schemas, checked by linting rules, consumed by a pure experience interpreter, and executed on a real browser runtime host. This contract defines the requirements, boundaries, pedagogical progressions, activity typologies, validation paradigms, and quality gates that every authored lesson must fulfill.

---

## 2. GOVERNING ARCHITECTURAL PRINCIPLES

### 2.1 Capability Over Content Coverage
The fundamental unit of the Forge curriculum is the **Capability**, not the lesson. 
- A lesson is an experience container.
- A topic or concept is a cognitive tool.
- A capability is an **observable, verifiable engineering ability** (e.g., *"Inspect parent-child nesting in the DOM and predict cascade inheritance"*).
- Content coverage without an observable capability is forbidden. If a concept cannot be observed, manipulated, predicted, or constructed by the learner, it has no place in the lesson.

### 2.2 Discovery-First / Empirical Before Theoretical
Learners must never be greeted with a wall of theoretical definitions before seeing or interacting with the phenomenon. 
- **Rule of Encounter:** If a concept has a visual, behavioral, or runtime manifestation (e.g., DOM structure, CSS box-model margins, flexbox wrapping, variable scope), the learner must encounter the phenomenon or observe the code behavior before receiving the formal taxonomic definition.
- Explanation serves to formalize what the learner has already observed or predicted, not to lecture in a vacuum.

### 2.3 Prediction Precedes Consequence
Learning happens in the gap between a hypothesis and the outcome. 
- Prediction is not a grading quiz or a test of prior knowledge; it is a **cognitive anchor**.
- Asking a learner to predict what will happen *before* executing code or rendering markup forces active mental simulation.
- Feedback on predictions must explain the underlying mechanical rule, treating incorrect hypotheses as valuable diagnostic misconceptions rather than failures.

### 2.4 Progressive Exposure (No Cognitive Cliff)
Concepts must be introduced along a strict cognitive ladder:
```text
Recognize → Understand → Predict → Manipulate → Construct → Debug → Reflect/Transfer
```
- A learner must never be asked to write code from scratch (`interactive-code`) before they have recognized the syntax components (`explanation` / `visual`), predicted behavior (`output-prediction`), and manipulated or ordered fragments (`fill-blank` / `ordering`).
- Scaffolding must decrease monotonically as the lesson progresses, but assistance must remain accessible on demand via multi-level hints and misconception traps.

### 2.5 Strict Separation of Concerns
1. **Content (`CanonicalLesson` JSON):** Authoritative semantic definition of capabilities, objectives, concepts, activities, validations, and evidence requirements.
2. **Experience Interpretation (`experience-interpreter.ts`):** Pure function mapping lesson semantic intent into cognitive modes (`discover`, `predict`, `interact`, `practice`, `debug`, `explain`, `master`), focal surfaces (`presentation`, `stage`, `editor`, `terminal`, `split`), and assistance levels.
3. **Experience Composition (`experience-composer.ts`):** Pure layout orchestrator assigning surface priorities, spatial density, and responsive stage arrangements.
4. **Runtime Execution (`useActivityRuntime`, `SandboxRuntimeHost`):** Isolated execution sandbox running real web technology code and validating state against explicit criteria.
5. **Session & Mastery State (`useLessonSession`, `session-engine.ts`):** Immutable progress tracking, evidence accumulation, objective satisfaction, and misconception matching.

Authors **MUST NOT** embed presentation hacks, inline CSS styles, layout directives, or UI assumptions into lesson JSON content.

---

## 3. LESSON LIFECYCLE & PEDAGOGICAL PROGRESSION

Every canonical Forge instruction lesson must take the learner through an intentional pedagogical sequence. Cookie-cutter uniformity is strictly banned, but the underlying cognitive progression must remain robust.

### 3.1 The Seven Cognitive Stages

| Stage | Cognitive Objective | Typical Canonical Activity Types | Learner State |
| :--- | :--- | :--- | :--- |
| **1. Orientation & Discovery** | Establish the real-world hook; demonstrate the living phenomenon without lecture. | `intro`, `visual` | *"I see something real happening."* |
| **2. Active Mental Model** | Deconstruct the anatomy; name the parts that were observed in Discovery. | `code-example`, `explanation`, `visual` | *"I understand the mechanism and vocabulary."* |
| **3. Hypothesis & Prediction** | Commit to an expectation before running code or seeing output. | `output-prediction` | *"I can predict how the system behaves."* |
| **4. Guided Manipulation** | Assemble, order, or fill missing syntax fragments with immediate feedback. | `ordering`, `fill-blank`, `multiple-choice` | *"I can manipulate and assemble the parts."* |
| **5. Applied Construction** | Write real code in the sandbox editor to fulfill an engineering specification. | `interactive-code` | *"I can build the solution with real code."* |
| **6. Diagnostic / Debugging** | Diagnose and correct intentional breakage or evaluate architectural tradeoffs. | `debug`, `judgment` | *"I can fix broken systems and evaluate choices."* |
| **7. Reflection & Synthesis** | Articulate mental models in learner's own words; synthesize key takeaways. | `reflection`, `summary`, `completion` | *"I can explain why this works and transfer it."* |

### 3.2 Banned Sequence Anti-Patterns

1. **The "Cookie-Cutter Monolith":**
   `intro → visual → output-prediction → interactive-code → [multiple-choice | reflection] → summary`
   *Why banned:* Empirically identified in B2 inventory as covering over 57% of early conversions. It ignores the specific needs of the concept, jumping immediately from passive viewing to free-form coding without guided manipulation.
2. **The "Lecture-First Opening":**
   `intro (3 paragraphs of text) → explanation (4 paragraphs) → explanation → ...`
   *Why banned:* Overwhelms beginners with abstract taxonomy before establishing why the learner should care or what the syntax looks like in practice.
3. **The "Cold Coding Cliff":**
   `intro → interactive-code`
   *Why banned:* Throws beginner learners directly into a blank editor without establishing syntax recognition, element anatomy, or predictive intuition.
4. **The "Ungrounded Prediction":**
   Placing an `output-prediction` before the learner has been exposed to the underlying syntax or rules being tested, forcing a blind guess rather than reasoned prediction.
5. **The "Passive Lecture Run":**
   Four or more consecutive passive activities (`intro`, `explanation`, `visual`, `summary`, `code-example`) without an interactive check. (Enforced by linter rule `PASSIVE_LESSON_WARNING`).

---

## 4. CANONICAL ACTIVITY TYPE SPECIFICATION & TAXONOMY

The Forge runtime supports exactly 15 canonical activity types. Authors must choose activity types based on pedagogical necessity rather than arbitrary variety.

### 4.1 Orientation & Exploration Types

#### `intro`
- **Intent:** `orientation`
- **Focal Surface:** `presentation`
- **Spatial Mode:** `stage` (or `prose`)
- **Required Content Schema:**
  - `title`: Short, punchy, curiosity-inducing heading.
  - `hook`: A 1-2 sentence real-world problem, failure, or relatable frontend scenario.
  - `context`: Concise paragraph situating the learner within the web architecture.
  - `goals`: Array of 2-4 observable, concrete capability statements.
- **Evidence Emitted:** None (orientation only).

#### `visual`
- **Intent:** `orientation` or `recognition`
- **Focal Surface:** `stage`
- **Required Content Schema:**
  - `title`: Descriptive label for the visual model.
  - `description`: Explanatory walkthrough of the model components.
  - `modelType`: One of `"dom-tree"`, `"box-model"`, `"flow"`, `"hierarchy"`, `"architecture"`, `"flexbox"`, `"grid"`.
  - `data`: Strongly typed structured object representing nodes, boxes, dimensions, or flowchart links.
- **Evidence Emitted:** `recognition` (when paired with interaction or active checklist).

### 4.2 Concept Formation & Anatomical Types

#### `explanation`
- **Intent:** `understanding`
- **Focal Surface:** `presentation`
- **Required Content Schema:**
  - `title`: Clear topic header.
  - `content`: Markdown text strictly limited to 150-250 words, utilizing bold terms and crisp formatting.
  - `keyTakeaway`: Optional single-sentence summary callout.
  - `callout`: Optional warning, tip, or common pitfall note.
- **Rule:** Never author consecutive `explanation` activities without an intervening active verification.

#### `code-example`
- **Intent:** `understanding`
- **Focal Surface:** `editor` (read-only) or `presentation`
- **Required Content Schema:**
  - `title`: Code focus descriptor.
  - `code`: Valid, syntactically pristine HTML, CSS, or JS snippet.
  - `language`: `"html"`, `"css"`, `"javascript"`, or `"typescript"`.
  - `annotations`: Optional array of line-specific explanatory badges or comments.
  - `description`: Brief text explaining the mechanism highlighted by the code.

### 4.3 Reasoning & Mental Simulation Types

#### `output-prediction`
- **Intent:** `prediction`
- **Focal Surface:** `stage` (split: code snippet + prediction options)
- **Required Content Schema:**
  - `prompt`: Question asking what will occur when this code runs or renders.
  - `code`: Clean code snippet under scrutiny.
  - `language`: Target language.
  - `options`: 3 to 4 distinct, plausible predictions.
  - `explanation`: Thorough breakdown of the mechanical rule governing the outcome.
- **Validation:** `exact-match` matching the exact string of the correct prediction.
- **Feedback:** Must include `correct`, `incorrect`, and explanation of common misconceptions.
- **Evidence Emitted:** `prediction`.

#### `multiple-choice`
- **Intent:** `recognition` or `retrieval`
- **Focal Surface:** `presentation`
- **Required Content Schema:**
  - `question`: Precise question testing recognition of anatomy, rules, or behavior.
  - `options`: 3 to 4 options. Options must not be trick questions or syntactically pedantic puns.
  - `explanation`: Rationale for the correct answer and diagnosis of distractors.
- **Validation:** `exact-match` with correct option text.
- **Evidence Emitted:** `recognition`.

#### `multi-select`
- **Intent:** `recognition` or `retrieval`
- **Focal Surface:** `presentation`
- **Required Content Schema:**
  - `question`: Clear prompt identifying multiple applicable criteria.
  - `options`: 4 to 6 candidate statements.
  - `minSelections`: Minimum required selections.
  - `maxSelections`: Maximum permitted selections.
- **Validation:** Array equality or set containment.
- **Evidence Emitted:** `recognition`.

### 4.4 Guided Manipulation & Syntax Assembly Types

#### `ordering`
- **Intent:** `application` or `recognition`
- **Focal Surface:** `stage` (interactive draggable/reorderable list)
- **Required Content Schema:**
  - `prompt`: Clear instruction (e.g., *"Arrange these tags to form a validly nested document hierarchy from outer to innermost"*).
  - `items`: Array of items with `id` and `text`.
  - `correctOrder`: Array of item IDs representing the syntactically valid sequence.
- **Validation:** Sequence equality.
- **Evidence Emitted:** `manipulation`.

#### `fill-blank`
- **Intent:** `application` or `recognition`
- **Focal Surface:** `editor` (scaffolded code with interactive blank slots)
- **Required Content Schema:**
  - `prompt`: Instructions detailing what token or syntax must be supplied.
  - `template`: Code containing designated blank tokens (e.g., `{{blank1}}`).
  - `blanks`: Array defining `id`, optional candidate choices or placeholder hint, and accepted answers.
- **Validation:** Token match or regex match per blank.
- **Evidence Emitted:** `manipulation`.

### 4.5 Applied Construction & Engineering Types

#### `interactive-code`
- **Intent:** `application` or `modification`
- **Focal Surface:** `editor` (dual pane: Monaco/CodeMirror editor + live sandbox preview)
- **Required Content Schema:**
  - `prompt`: Clear, unambiguous engineering specification.
  - `initialCode`: Pre-scaffolded template code with clear comments showing where to implement changes.
  - `language`: `"html"`, `"css"`, `"javascript"`, or `"typescript"`.
  - `solution`: Reference implementation meeting all validation criteria.
  - `sandboxConfig`: Configuration for live preview runtime (e.g., viewport, console, mock styles).
- **Validation:** Multi-criteria automated suite:
  - `ast`: Structural AST checks (e.g., element existence, nesting depth, attribute presence).
  - `regex` / `text-contains`: Exact token or pattern checks where appropriate.
  - `runtime` / `dom-query`: Querying the actual DOM tree inside the sandbox iframe (`querySelector`, computed styles).
- **Feedback:** Clear, actionable error messages pointing out what criteria failed and how to rectify it.
- **Evidence Emitted:** `implementation` or `manipulation`.

#### `debug`
- **Intent:** `debugging`
- **Focal Surface:** `editor` (with highlighted bug markers) and `terminal` / `inspector`
- **Required Content Schema:**
  - `scenario`: Realistic engineering bug report (e.g., *"The navigation bar wraps unexpectedly on mobile screens"*).
  - `brokenCode`: Code containing 1 to 2 intentional, realistic bugs (syntax error, bad attribute, incorrect CSS selector, logic fault).
  - `symptoms`: Observable failure description.
  - `hintTiers`: Multi-tiered progressive hints (Tier 1: Area of interest; Tier 2: The underlying mechanic; Tier 3: Concrete fix).
  - `solution`: Fixed code.
- **Validation:** Verification that the bug is resolved and no regressions were introduced.
- **Evidence Emitted:** `debugging`.

#### `judgment`
- **Intent:** `transfer` or `evaluation`
- **Focal Surface:** `presentation` (split comparison)
- **Required Content Schema:**
  - `scenario`: Real-world architectural or implementation dilemma.
  - `options`: 2 to 3 distinct valid technical approaches, each with tradeoffs.
  - `criteria`: What constraints must be prioritized (accessibility, performance, maintainability, responsiveness).
  - `rubric`: Analysis explaining why one option best satisfies the given engineering constraints.
- **Validation:** Choice of optimal solution with justification.
- **Evidence Emitted:** `judgment` or `transfer`.

### 4.6 Synthesis & Reflection Types

#### `reflection`
- **Intent:** `reflection`
- **Focal Surface:** `presentation`
- **Required Content Schema:**
  - `prompt`: Open-ended or guided prompt asking the learner to explain a mechanism in their own words or analyze what happens when a rule is violated.
  - `sampleResponse`: Exemplar response illustrating clear engineering reasoning.
  - `rubric`: Self-assessment checklist.
- **Evidence Emitted:** `explanation`.

#### `summary`
- **Intent:** `understanding`
- **Focal Surface:** `presentation`
- **Required Content Schema:**
  - `title`: Synthesis header.
  - `takeaways`: 3 to 5 high-impact, bulleted summary statements reinforcing core mental models.
  - `nextSteps`: Preview of how these capabilities unlock upcoming concepts.
- **Evidence Emitted:** None (synthesis only).

#### `completion`
- **Intent:** `assessment`
- **Focal Surface:** `presentation` (celebratory milestone)
- **Required Content Schema:**
  - `title`: Achievement milestone title.
  - `message`: Congratulatory assessment acknowledging the demonstrated capabilities.
  - `demonstratedCapabilities`: Array of capability IDs proven during the session.
- **Evidence Emitted:** `mastery`.

---

## 5. CAPABILITY & EVIDENCE ARCHITECTURE

Forge adheres strictly to an evidence-based competency model. Lessons do not "award completion" merely because a user clicked Next through all cards.

### 5.1 The Capability-Evidence Linkage Rules

1. **Every lesson must declare exactly one `primaryCapability`:**
   - Must contain an `id` that exists in `capabilityIds`.
   - Must declare a concrete, observable action `statement`.
2. **Declared capabilities must be supported by Evidence Configs:**
   - Every capability claimed in `lesson.capabilityIds` **MUST** be explicitly referenced in `activity.evidence.capabilityIds` by at least one applied, prediction, debugging, or judgment activity in the lesson.
   - Unreferenced capabilities trigger linter error: `CAPABILITY_WITHOUT_EVIDENCE`.
3. **Every Objective must be evidenced:**
   - All objectives declared in `lesson.objectives` must be satisfied by at least one activity declaring that objective in `activity.objectiveIds` or `activity.evidence.objectiveIds`.
   - Objectives without evidence trigger linter error: `OBJECTIVE_WITHOUT_EVIDENCE`.
4. **No Phantom Capabilities:**
   - Claiming unrelated or secondary capabilities (e.g., claiming `cap-predict-box-model-overflow` in an HTML syntax lesson) is strictly prohibited. Every declared capability must be directly developed by the lesson's activities.

### 5.2 Evidence Tokens & States

The runtime produces immutable `LearningEvidenceToken` objects during lesson execution:
- `types`: One or more of `["recognition", "prediction", "manipulation", "debugging", "explanation", "judgment", "transfer", "implementation"]`.
- `demonstratedLevel`: `"emerging"`, `"competent"`, or `"mastered"`.
- `state`: Monotonically transitions: `unseen` → `attempted` → `observed` → `demonstrated` → `verified` → `mastered`.

---

## 6. VALIDATION & FEEDBACK SPECIFICATION

All interactive and assessment activities must define deterministic, fail-safe validation.

### 6.1 Supported Validation Strategies

1. **`exact-match`:**
   - Used for: `output-prediction`, `multiple-choice`, text tokens.
   - Compares learner response to `expected` value (with optional `caseSensitive: false`).
2. **`one-of`:**
   - Accepts any string matching an approved array of acceptable expressions.
3. **`ordered-sequence`:**
   - Used for: `ordering` activities. Validates array element order matches `expectedOrder`.
4. **`ast` (Abstract Syntax Tree):**
   - Used for: `interactive-code` and `debug` activities.
   - Evaluates parsed DOM or JavaScript AST for required nodes, attributes, hierarchy, and properties without being brittle to whitespace or quote style.
5. **`runtime` (DOM & Style Evaluation):**
   - Queries the live sandbox iframe environment using selectors and `window.getComputedStyle()`.
   - Verifies visual results and reactive behaviors.
6. **`regex`:**
   - Matches patterns while strictly avoiding over-constraining learner formatting.

### 6.2 Feedback Standards

Every activity providing validation must supply structured feedback:
```json
"feedback": {
  "correct": "Precise confirmation explaining WHY the answer or code is mechanically correct.",
  "incorrect": "Constructive diagnostic feedback identifying the likely conceptual error without shame.",
  "explanation": "Deep dive into the underlying platform specification or mental model.",
  "hints": [
    { "id": "hint-1", "level": 1, "content": "Gentle nudge toward the relevant concept." },
    { "id": "hint-2", "level": 2, "content": "Specific syntax guidance pointing out the missing tag, attribute, or property." },
    { "id": "hint-3", "level": 3, "content": "Near-complete structural template illustrating the solution." }
  ]
}
```

---

## 7. VOICE, TONE, AND MISCONCEPTION HANDLING

Authors must adhere to the **Forge Voice and Humor Bible V1**.

### 7.1 Voice Attributes
- **Peer-to-Peer Engineering Demeanor:** Speak like a sharp, supportive Senior Engineer pairing with an apprentice. Respect the learner's intelligence.
- **Zero Corporate Jargon:** Never use words like *"supercharge"*, *"empower"*, *"seamless"*, *"unleash"*, or *"gamify"*.
- **Subtle, Dry Engineering Wit:** Occasional understated humor about real web realities (e.g., CSS centering jokes, browsers being forgiving but chaotic, the weird historical artifacts of 1995 JavaScript). Never use wacky cartoonish humor or childish praise.
- **High Technical Precision:** Use standard web platform terminology accurately:
  - An **element** includes start tag, content, and end tag.
  - A **tag** is the delimiter (`<p>` or `</p>`).
  - An **attribute** consists of a name and value inside a start tag.
  - An image element is a **void element**, not an *"empty self-closing trick"*.

### 7.2 Misconception Modeling

Lessons must proactively anticipate beginner traps and declare them:
- Misconceptions should be declared in lesson metadata or mapped via `matchedMisconception` triggers.
- When an incorrect response triggers a known misconception, the runtime elevates the `misconception` supporting surface to explain the exact mental model error before the learner attempts a retry.

---

## 8. DETERMINISTIC LINTER RULES & MACHINE-ENFORCEABLE CONSTRAINTS

The authoring pipeline integrates automated verification via `src/lib/curriculum/authoring/lint-lesson.ts` and `rules.ts`. Authored lessons must pass this suite with **0 errors** and **0 warnings**.

### 8.1 Critical Error Rules (Blocking)

| Rule Code | Description | Corrective Action |
| :--- | :--- | :--- |
| `SCHEMA_VALIDATION_ERROR` | JSON fails Zod schema validation (`canonicalLessonSchema`). | Correct missing or malformed fields according to schema. |
| `OBJECTIVE_WITHOUT_EVIDENCE` | An objective declared in `lesson.objectives` is never referenced by an activity. | Attach objective to an applied, prediction, or assessment activity. |
| `BROKEN_CAPABILITY_REFERENCE` | `primaryCapability.id` or `secondaryCapabilities[].id` is missing from `capabilityIds`. | Ensure all capability IDs are declared in the root `capabilityIds` array. |
| `DUPLICATE_ACTIVITY_ID` | Multiple activities share the same `id`. | Make every activity ID unique within the lesson. |
| `INVALID_VALIDATION_CONFIG` | Interactive activity lacks `validation` or has malformed criteria. | Provide a complete, typed validation object. |

### 8.2 Quality & Pedagogical Warnings (Blocking for Production Certification)

| Rule Code | Condition | Corrective Action |
| :--- | :--- | :--- |
| `CAPABILITY_WITHOUT_EVIDENCE` | A capability listed in `capabilityIds` has no activity declaring evidence for it. | Add an activity emitting evidence for this capability, or remove the capability if out of scope. |
| `SKILL_WITHOUT_EVIDENCE` | A skill in `skillIds` has no practice or assessment activity. | Ensure at least one activity references the skill in `evidence.skillIds` or objective. |
| `PEDAGOGICAL_SEQUENCE_WARNING` | 1. Lesson starts directly with applied/assessment task.<br>2. `debug` appears before any explanation or code example.<br>3. Three or more consecutive activities have identical types. | Add orientation, place explanations before debugging, and vary activity types. |
| `PASSIVE_LESSON_WARNING` | Four or more consecutive passive activities without an active check. | Intersperse active knowledge checks, predictions, or manipulations. |
| `MISSING_RETRIEVAL_WARNING` | A practice/assessment lesson contains no retrieval activities. | Add retrieval or applied activities. |
| `MISSING_SYNTHESIS_WARNING` | Lesson does not end with a `summary`, `reflection`, or `completion` activity. | Add a summary or completion activity to conclude the lesson. |

---

## 9. B3 GOLDEN LESSON REFERENCE ARCHETYPE

The lesson `src/data/canonical/lessons/lesson-elements-tags-attributes.json` serves as the authoritative, certified B3 Golden Standard for beginner instruction.

### 9.1 Anatomy of the Reference Flow

```text
[act-112-intro]             (intro: orientation)
      ↓
[act-112-predict-structure] (output-prediction: prediction before explanation)
      ↓
[act-112-explanation]       (explanation: formalize anatomy & rules)
      ↓
[act-112-code-example]      (code-example: concrete annotated syntax)
      ↓
[act-112-order-nesting]     (ordering: guided manipulation of hierarchy)
      ↓
[act-112-mcq-void]          (multiple-choice: retrieval & concept check)
      ↓
[act-112-code-profile]      (interactive-code: applied construction in sandbox)
      ↓
[act-112-summary]           (summary: synthesis of mental models)
```

### 9.2 Key Pedagogical Features of the Golden Standard
1. **Prediction Before Lecture:** Learner encounters `act-112-predict-structure` immediately after the intro, grappling with void elements and paragraph structure *before* the formal definition.
2. **Multimodal Exposure:** The lesson pairs conceptual explanation (`act-112-explanation`) with syntax inspection (`act-112-code-example`) and tactile manipulation (`act-112-order-nesting`).
3. **Progressive Independence:** Learner moves from ordering pre-written tags to identifying void element rules, and finally constructing a complete semantic card profile from scratch with attributes and nested elements.
4. **Clean Capability Binding:** Only `cap-inspect-dom-hierarchy` is declared and proven. Secondary noise was eliminated.

---

## 10. LESSON AUTHORING CHECKLIST (PRE-COMMIT GATE)

Before any new lesson is committed to `src/data/canonical/lessons/`, the content engineer must verify:

- [ ] **Identity & Role:** `id`, `topicId`, `title`, and `description` are clean, accurate, and learner-focused.
- [ ] **Single Primary Capability:** Exactly one `primaryCapability` declared, with action verb, matching `capabilityIds[0]`.
- [ ] **No Secondary Drift:** No extraneous or unevidenced secondary capabilities declared.
- [ ] **Discovery First:** First 2 activities hook the learner and present the living system or prediction before abstract taxonomy.
- [ ] **Active Rhythm:** No more than 2 consecutive passive activities. Total interactive activities ≥ passive activities.
- [ ] **No Blank Editor Cliffs:** An `interactive-code` activity is always preceded by syntax exposure and guided manipulation (`ordering`, `fill-blank`, or `code-example`).
- [ ] **Multi-Tiered Hints:** All coding and debugging activities include at least 2 progressive hint tiers.
- [ ] **Actionable Feedback:** Feedback explains *why* the outcome occurred, referencing the underlying browser mechanism.
- [ ] **Synthesis Ending:** Lesson concludes with a `summary`, `reflection`, or `completion` activity.
- [ ] **Zero Linter Violations:** Runs cleanly through `lintLesson()` with 0 errors and 0 warnings.
- [ ] **Schema Conformance:** Passes Zod parse against `canonicalLessonSchema`.

---

## 11. RATIFICATION & BOUNDARY STATEMENT

This Contract constitutes the sole standard for Forge curriculum creation. 
- Batch production in B5 must conform directly to this contract.
- No modifications to runtime architecture (`src/components/lesson/canonical/runtime/`, `experience-interpreter.ts`, `session-engine.ts`) may be introduced to accommodate non-compliant lesson content. 
- Content conforms to the system; the system remains stable, deterministic, and clean.
