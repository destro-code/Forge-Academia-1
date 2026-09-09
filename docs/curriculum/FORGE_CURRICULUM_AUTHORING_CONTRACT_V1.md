# FORGE CURRICULUM AUTHORING CONTRACT V1
**Production Standard for Canonical Lesson Design, Pedagogical Progression, and Evidence Integrity**

- **Document Version:** 1.1.0 (B4 Revised Edition)
- **Status:** Ratified & Authoritative Production Contract
- **System Target:** Forge Canonical Learning Engine (`src/lib/curriculum/`, `src/components/lesson/canonical/`)
- **Authority:** Preceded by `FORGE_LEARNING_EXPERIENCE_SPEC_V1.md` and `FORGE_VOICE_AND_HUMOR_BIBLE_V1.md`. Subordinate only to core product charter documents. Governs all lesson authoring, transformation, and batch production (B5+).

---

## 1. PURPOSE & INTENT

The purpose of this Contract is to establish the definitive, technically accurate standard for authoring Forge lessons.

Forge is not an encyclopedia, video repository, documentation archive, or trivia runner. Forge is an engineering academy designed to take learners from absolute novice to staff-level frontend engineer by cultivating genuine mental models, predictive instincts, debugging intuition, and architectural reasoning.

This contract answers the core engineering question:
> **How must a Forge lesson be authored so that the existing canonical runtime architecture produces a genuinely effective, active, beginner-friendly learning experience without requiring ad-hoc runtime modifications?**

### The Core Architectural Axiom
> **Forge standardizes learning quality, not activity sequence.**
> **Forge needs intentional cognitive progression, not another universal lesson template.**

B3 proved that disciplined scaffolding can dramatically improve a beginner lesson within the existing runtime architecture. B3 did **NOT** prove that every lesson must use the exact same sequence. Every lesson authored for Forge is a structured software artifact: a deterministic JSON document validated by schemas, checked by linters, consumed by a pure experience interpreter, and executed on a real browser runtime host.

---

## 2. GOVERNING ARCHITECTURAL PRINCIPLES

### 2.1 Capability Over Content Coverage
The fundamental unit of the Forge curriculum is the **Capability**, not the lesson.
- A lesson is an experience container.
- A topic or concept is a cognitive tool.
- A capability is an **observable, verifiable engineering ability** (e.g., *"Inspect parent-child nesting in the DOM and identify element boundaries"*).
- Content coverage without an observable capability is forbidden. If a concept cannot be observed, manipulated, predicted, or constructed by the learner, it does not belong in the lesson.

### 2.2 Discovery-First / Empirical Before Theoretical (Conditional on Concept)
Learners must never be greeted with an abstract wall of theoretical taxonomy before seeing or interacting with the phenomenon.
- **Rule of Encounter:** If a concept has an observable runtime, visual, structural, or behavioral manifestation (e.g., DOM tree nesting, CSS box-model margins, flexbox wrapping, variable reassignment), prefer an encounter with that living phenomenon before formal abstraction.
- Explanation serves to formalize what the learner has observed or explored, rather than lecturing in a vacuum.
- If a concept is purely abstract or a direct continuation of an already observed behavior, the encounter may be concise or embedded directly in a worked example.

### 2.3 Meaningful Prediction Precedes Consequence
Learning occurs in the gap between a hypothesis and an outcome.
- Prediction is not a grading quiz, trivia test, or barrier; it is a **cognitive anchor**.
- Asking a learner to predict what will happen *before* executing code or inspecting rendered output forces active mental simulation.
- **Value-Add Constraint:** Use prediction when prediction genuinely helps the learner build or test a mental model. Do not require prediction for trivial syntax facts or ungrounded guesses where it adds no instructional value.

### 2.4 Context-Appropriate Scaffolding (No Coding Cliffs)
**Universal Scaffolding Rule:**
> **Every coding activity must provide sufficient scaffolding for the learner's actual starting state and target capability.**

Scaffolding is not a fixed sequence of prerequisite activity types. Scaffolding is a spectrum of instructional support that may legitimately come from:
- Prior lessons and established module capabilities
- Concept prerequisites and clear mental models
- Annotated code examples (`code-example`)
- Structural visual models (`visual`)
- Worked examples and step-by-step demonstrations
- Output predictions (`output-prediction`)
- Guided manipulation (`ordering` or `fill-blank`)
- Pre-populated starter code (`starterCode`) with clear structural comments
- Constrained modification tasks rather than greenfield authoring
- Progressive, multi-tiered hints
- Automated test suites with descriptive assertion feedback

The author chooses the **minimum effective scaffolding** required to prevent an unjustified coding cliff while preserving cognitive effort and problem-solving agency.

### 2.5 Strict Separation of Concerns
1. **Content (`CanonicalLesson` JSON):** Authoritative semantic definition of capabilities, objectives, concepts, activities, validations, and evidence configurations.
2. **Experience Interpretation (`experience-interpreter.ts`):** Pure function mapping lesson semantic intent into cognitive modes (`discover`, `predict`, `interact`, `practice`, `debug`, `explain`, `master`), focal surfaces (`presentation`, `stage`, `editor`, `terminal`, `split`), and assistance levels.
3. **Experience Composition (`experience-composer.ts`):** Pure layout orchestrator assigning surface priorities, spatial density, and responsive stage arrangements.
4. **Runtime Execution (`useActivityRuntime`, `SandboxRuntimeHost`):** Isolated execution sandbox running real web technology code and validating state against explicit criteria.
5. **Session & Mastery State (`useLessonSession`, `session-engine.ts`):** Progress tracking, evidence accumulation, objective satisfaction, and misconception matching.

Authors **MUST NOT** embed presentation hacks, inline CSS styles, layout directives, or UI assumptions into lesson JSON content.

---

## 3. THE COGNITIVE PROGRESSION PALETTE (NOT A RIGID TEMPLATE)

Forge defines a seven-stage cognitive progression palette. 
**Crucial Definition:** These stages represent a conceptual progression model, **NOT** seven mandatory stages that every lesson must rigidly include.

### 3.1 The Progression Palette

| Stage | Cognitive Purpose | Typical Canonical Activity Types | Learner Cognitive State |
| :--- | :--- | :--- | :--- |
| **Orientation & Discovery** | Establish context, hook curiosity, or present the living phenomenon. | `intro`, `visual` | *"I see what is happening or what problem we face."* |
| **Active Mental Model** | Deconstruct anatomy, provide clear analogies, formalize vocabulary. | `code-example`, `explanation`, `visual` | *"I understand the mechanism and how the pieces connect."* |
| **Hypothesis & Prediction** | Commit to an expectation before running code or seeing output. | `output-prediction` | *"I can anticipate how the system will behave."* |
| **Guided Manipulation** | Assemble, reorder, or complete syntax tokens with targeted feedback. | `ordering`, `fill-blank`, `multiple-choice` | *"I can manipulate and assemble the parts correctly."* |
| **Applied Construction** | Write or modify code in the sandbox editor to satisfy specifications. | `interactive-code` | *"I can build or modify working code."* |
| **Diagnostic / Debugging**| Diagnose and correct intentional breakage or evaluate tradeoffs. | `debug`, `judgment` | *"I can isolate failures and make reasoned choices."* |
| **Reflection & Synthesis** | Synthesize core principles, articulate models, or celebrate milestone. | `reflection`, `summary`, `completion` | *"I can articulate why this works and transfer it."* |

### 3.2 Sequence Flexibility: Progression Examples

Authors must select the sequence and stages that are directly justified by:
- Learner starting state
- Target capability
- Prerequisites
- Core mental model
- Intended learner behavior
- Lesson type (`instruction`, `practice`, `challenge`, `project`, `assessment`, `capstone`)

#### Example A: Compact Syntax / Focused Concept Lesson
```text
Orientation (`intro`)
  ↓
Guided Manipulation (`fill-blank` or `ordering`)
  ↓
Formal Explanation (`explanation`)
  ↓
Applied Coding (`interactive-code`)
  ↓
Synthesis (`summary`)
```

#### Example B: Investigation / Debugging Lesson
```text
Observe Failure (`intro` + broken symptom)
  ↓
Inspect / Hypothesize (`output-prediction` or `code-example`)
  ↓
Diagnose & Fix (`debug`)
  ↓
Articulate Root Cause (`reflection`)
  ↓
Milestone Completion (`completion`)
```

#### Example C: Conceptual / Mental-Model Lesson
```text
Living Encounter (`visual`)
  ↓
Predict Behavior (`output-prediction`)
  ↓
Deconstruct Anatomy (`explanation` + `code-example`)
  ↓
Retrieval Check (`multiple-choice` or `multi-select`)
  ↓
Key Takeaways (`summary`)
```

#### Example D: Applied Construction (B3 Archetype)
```text
Orientation (`intro`)
  ↓
Discovery Prediction (`output-prediction`)
  ↓
Formal Explanation (`explanation`)
  ↓
Annotated Code Example (`code-example`)
  ↓
Syntax Assembly (`ordering`)
  ↓
Concept Check (`multiple-choice`)
  ↓
Applied Modification (`interactive-code`)
  ↓
Synthesis (`summary`)
```

**None of these examples are universal templates.** The lesson sequence must emerge from the capability and learner needs.

### 3.3 Prohibition of Cookie-Cutter Cloning

The contract explicitly prohibits two symmetric anti-patterns:
1. **The Legacy Cookie-Cutter:**
   Cloning `intro → visual → output-prediction → interactive-code → [reflection | multiple-choice] → summary` across unrelated topics without pedagogical justification.
2. **The New Universal Template Fallacy:**
   Treating the B3 pilot sequence (`intro → prediction → explanation → code-example → ordering → mcq → interactive-code → summary`) as a mandatory 8-step formula for all future lessons.

**Rule:** Every activity in a lesson must earn its place by serving an observable learner behavior required to establish the target capability.

---

## 4. CANONICAL ACTIVITY TYPE SPECIFICATIONS

The Forge canonical architecture defines exactly **15 activity types** in `src/lib/curriculum/types.ts`. Authors must use the exact TypeScript property names defined in the schema.

### 4.1 `intro`
- **Typical Intent:** `orientation`
- **Typical Purpose:** Frame the lesson, present a compelling engineering scenario, outline concrete learning goals.
- **Actual Schema Fields (`IntroActivityContent`):**
  - `title`: `string`
  - `hook`: `string`
  - `context?`: `string`
  - `goals?`: `string[]`
- **Validation Support:** None (informational orientation).
- **Evidence Support:** Typically none (author may attach evidence if orientation includes an active check).

### 4.2 `explanation`
- **Typical Intent:** `understanding`
- **Typical Purpose:** Formalize a mental model, explain underlying browser mechanics, clarify common misconceptions.
- **Actual Schema Fields (`ExplanationActivityContent`):**
  - `title?`: `string`
  - `text`: `string` (Markdown text; keep concise, ~150–250 words)
  - `callout?`: `{ variant: "tip" | "warning" | "mistake" | "info"; text: string }`
  - `keyTakeaway?`: `string`
- **Validation Support:** None.
- **Evidence Support:** Typically none.

### 4.3 `code-example`
- **Typical Intent:** `understanding`
- **Typical Purpose:** Present clean, annotated reference code illustrating syntax anatomy or design patterns.
- **Actual Schema Fields (`CodeExampleActivityContent`):**
  - `title?`: `string`
  - `description?`: `string`
  - `code`: `string`
  - `language`: `string`
  - `highlightedLines?`: `number[]`
  - `annotations?`: `Array<{ line: number; comment: string }>`
- **Validation Support:** None.
- **Evidence Support:** Typically none.

### 4.4 `visual`
- **Typical Intent:** `orientation` or `recognition`
- **Typical Purpose:** Provide an interactive or diagrammatic representation of structural systems (DOM trees, box models, flowcharts).
- **Actual Schema Fields (`VisualActivityContent`):**
  - `title`: `string`
  - `visualType`: `"diagram" | "flowchart" | "comparison" | "hierarchy" | "custom"`
  - `description?`: `string`
  - `visualData?`: `Record<string, unknown>`
  - `interactive?`: `{ kind: string; config?: Record<string, unknown>; caption?: string }`
- **Validation Support:** None / optional checklist.
- **Evidence Support:** Author-configurable (typically `recognition` when paired with interactive exploration).

### 4.5 `output-prediction`
- **Typical Intent:** `prediction`
- **Typical Purpose:** Prompt the learner to simulate code execution or rendering in their mind before viewing output.
- **Actual Schema Fields (`OutputPredictionActivityContent`):**
  - `code`: `string`
  - `language`: `string`
  - `prompt`: `string`
  - `options?`: `string[]`
  - `explanation?`: `string`
- **Validation Support:** `ExactMatchValidation` (`type: "exact-match"`, `expected: string | number | boolean`, `caseSensitive?: boolean`).
- **Evidence Support:** Author-configurable (typically `prediction`).

### 4.6 `multiple-choice`
- **Typical Intent:** `recognition` or `retrieval`
- **Typical Purpose:** Verify conceptual understanding, syntax rules, or vocabulary identification.
- **Actual Schema Fields (`MultipleChoiceActivityContent`):**
  - `question`: `string`
  - `options`: `Array<{ id: string; text: string; hint?: string }>`
  - `explanation?`: `string`
- **Validation Support:** `ExactMatchValidation` (where `expected` matches the correct option ID or text).
- **Evidence Support:** Author-configurable (typically `recognition`).

### 4.7 `multi-select`
- **Typical Intent:** `recognition` or `retrieval`
- **Typical Purpose:** Test classification or identification of multiple valid criteria without single-choice guessing.
- **Actual Schema Fields (`MultiSelectActivityContent`):**
  - `question`: `string`
  - `options`: `Array<{ id: string; text: string; hint?: string }>`
  - `minSelections?`: `number`
  - `maxSelections?`: `number`
  - `explanation?`: `string`
- **Validation Support:** `MultiMatchValidation` (`type: "multi-match"`, `expected: string[]`, `ignoreOrder?: boolean`).
- **Evidence Support:** Author-configurable (typically `recognition`).

### 4.8 `fill-blank`
- **Typical Intent:** `application` or `recognition`
- **Typical Purpose:** Provide scaffolded syntax completion where learners supply missing tokens in real code.
- **Actual Schema Fields (`FillBlankActivityContent`):**
  - `prompt`: `string`
  - `template`: `string` (contains placeholders like `{{blank1}}`)
  - `blanks`: `Array<{ id: string; hint?: string; placeholder?: string }>`
  - `explanation?`: `string`
- **Validation Support:** `OneOfValidation` or `ExactMatchValidation` per blank token.
- **Evidence Support:** Author-configurable (typically `manipulation` or `recognition`).

### 4.9 `ordering`
- **Typical Intent:** `application` or `recognition`
- **Typical Purpose:** Tactile arrangement of syntax tokens, lifecycle phases, or hierarchical DOM nesting.
- **Actual Schema Fields (`OrderingActivityContent`):**
  - `prompt`: `string`
  - `items`: `Array<{ id: string; text: string; initialOrder?: number }>`
  - `explanation?`: `string`
- **Validation Support:** `OrderingValidation` (`type: "ordering"`, `correctSequence: string[]`).
- **Evidence Support:** Author-configurable (typically `manipulation`).

### 4.10 `interactive-code`
- **Typical Intent:** `application` or `modification`
- **Typical Purpose:** Live coding in the browser sandbox editor with instant preview and multi-criteria validation.
- **Actual Schema Fields (`InteractiveCodeActivityContent`):**
  - `title`: `string`
  - `prompt`: `string`
  - `instructions?`: `string`
  - `language`: `string`
  - `starterCode`: `string` (Initial editor content)
  - `solutionCode?`: `string` (Reference solution)
  - `hints?`: `string[]`
  - `files?`: `InteractiveCodeFile[]` (`{ name: string; content: string; readOnly?: boolean }`)
  - `testCases?`: `Array<{ id?: string; description: string; assertion?: string; testCode?: string }>`
  - `htmlFixture?`: `string` (DOM environment for CSS or JavaScript exercises)
- **Validation Support:** `TestsValidation` (`type: "tests"`, `testCases: TestCaseValidation[]`) or `CodeOutputValidation`.
- **Evidence Support:** Author-configurable (typically `implementation` or `manipulation`).

### 4.11 `debug`
- **Typical Intent:** `debugging`
- **Typical Purpose:** Present realistic broken code for the learner to diagnose, isolate, and repair.
- **Actual Schema Fields (`DebugActivityContent`):**
  - `title`: `string`
  - `prompt`: `string`
  - `buggyCode`: `string` (Pre-existing code with deliberate flaw)
  - `language`: `string`
  - `bugDescription`: `string` (Observed broken behavior)
  - `hints?`: `string[]`
  - `fixRequirements?`: `string[]`
  - `files?`: `InteractiveCodeFile[]`
  - `solutionCode?`: `string`
  - `testCases?`: `Array<{ id?: string; description: string; assertion?: string; testCode?: string }>`
  - `htmlFixture?`: `string`
- **Validation Support:** `TestsValidation`.
- **Evidence Support:** Author-configurable (typically `debugging`).

### 4.12 `judgment`
- **Typical Intent:** `transfer` or `evaluation`
- **Typical Purpose:** Compare architectural tradeoffs, evaluate alternative implementations, justify technical decisions.
- **Actual Schema Fields (`JudgmentActivityContent`):**
  - `title?`: `string`
  - `prompt`: `string`
  - `context?`: `string`
  - `responsePlaceholder?`: `string`
  - `modelAnswer`: `{ summary: string; detailedAnalysis: string; keyTradeoffs: string[] }`
  - `evaluationRubric`: `Array<{ id: string; label: string; description: string }>`
  - `takeaways?`: `string[]`
- **Validation Support:** Self-evaluation against rubric or instructor review.
- **Evidence Support:** Author-configurable (typically `judgment` or `transfer`).

### 4.13 `reflection`
- **Typical Intent:** `reflection`
- **Typical Purpose:** Prompt the learner to articulate mental models, summarize mechanisms, or evaluate what broke in their own words.
- **Actual Schema Fields (`ReflectionActivityContent`):**
  - `prompt`: `string`
  - `guidelines?`: `string[]`
  - `sampleResponse?`: `string`
  - `minCharacters?`: `number`
- **Validation Support:** Character threshold / self-check.
- **Evidence Support:** Author-configurable (typically `explanation`).

### 4.14 `summary`
- **Typical Intent:** `understanding` or `reflection`
- **Typical Purpose:** Consolidate core mental models, review key takeaways, preview next curriculum milestones.
- **Actual Schema Fields (`SummaryActivityContent`):**
  - `title?`: `string`
  - `takeaways`: `string[]`
  - `nextSteps?`: `string[]`
  - `reviewQuestions?`: `string[]`
- **Validation Support:** None (informational synthesis).
- **Evidence Support:** Typically none.

### 4.15 `completion`
- **Typical Intent:** `assessment`
- **Typical Purpose:** Acknowledge milestone mastery, display earned achievements or badges.
- **Actual Schema Fields (`CompletionActivityContent`):**
  - `title`: `string`
  - `message`: `string`
  - `badgeId?`: `string`
  - `congratulations?`: `string`
- **Validation Support:** Session state verification.
- **Evidence Support:** Typically `mastery`.

---

## 5. EVIDENCE ARCHITECTURE & CONFIGURATION

Activity types do **not** inherently or magically emit evidence by merely being rendered. The actual architecture is decoupled:
```text
Activity Type
      ↓ (provides an interactive surface & learner behavior)
Author Configures Evidence (`activity.evidence`)
      ↓ (declares target capabilities, skills, objectives, types, level)
Runtime Evaluates & Session Engine Emits `LearningEvidenceToken`
```

### 5.1 Evidence Configuration Schema (`ActivityEvidenceConfig`)
Authors attach evidence requirements to activities using `activity.evidence`:
```typescript
interface ActivityEvidenceConfig {
  types?: EvidenceType[]; // "recognition" | "prediction" | "manipulation" | "debugging" | "explanation" | "judgment" | "transfer" | "implementation"
  capabilityIds?: string[];
  conceptIds?: string[];
  skillIds?: string[];
  objectiveIds?: string[];
  demonstratedLevel?: "emerging" | "competent" | "mastered";
  state?: EvidenceState; // "unseen" | "attempted" | "observed" | "demonstrated" | "verified" | "mastered"
}
```

### 5.2 Evidence Mapping Rules
1. **Explicit Intentionality:** If an activity is intended to provide evidence of an objective or capability, the author must explicitly reference that objective ID or capability ID in the activity's `objectiveIds`, `evidence.objectiveIds`, or `evidence.capabilityIds`.
2. **Assessment Alignment:** Assessment and practice activities must target the specific cognitive behavior they evaluate (e.g., an `output-prediction` activity should emit `prediction` evidence; an `interactive-code` activity should emit `manipulation` or `implementation` evidence).
3. **No Decorative Evidence:** Do not attach evidence configurations to passive orientation text where the learner performed no observable cognitive act.

---

## 6. CAPABILITY & METADATA MODEL

In `CanonicalLesson` (`src/lib/curriculum/types.ts`), capabilities are represented as follows:
- `capabilityIds?: string[]`: The canonical list of capability IDs developed or assessed by the lesson.
- `primaryCapability?: CapabilityDeclaration`: An optional structured declaration `{ id: string; statement: string; }` identifying the central capability of the lesson.
- `secondaryCapabilities?: CapabilityDeclaration[]`: Optional secondary capability declarations `{ id: string; statement: string; }`.

### 6.1 Capability Conventions for Authors
1. **Root List Integrity:** If `primaryCapability` or `secondaryCapabilities` are declared, their `id` values **MUST** exist in `lesson.capabilityIds`. Omitting them triggers the repository linter error `BROKEN_CAPABILITY_REFERENCE`.
2. **Primary Target Convention:** The first/root capability declared in `capabilityIds` (or specified in `primaryCapability`) serves as the primary authoring target.
3. **No Scope Creep:** Only declare capabilities that the lesson's activities actively scaffold, practice, or evaluate.

---

## 7. MACHINE-ENFORCEABLE REPOSITORY RULES VS. PRODUCTION POLICY

To ensure technical precision, this contract distinguishes between checks that are **machine-enforced by code** and requirements that are **Forge Production Policies**.

### 7.1 Machine-Enforceable Repository Rules (Automated Linter)
These rules are implemented in `src/lib/curriculum/authoring/rules.ts`, `lint-lesson.ts`, and `schema-v1.ts`.

#### Linter Errors (Blocking in Repository Linter)
- `SCHEMA_VALIDATION_ERROR`: Document fails Zod schema parsing.
- `DUPLICATE_LESSON_ID`: Duplicate lesson ID detected.
- `DUPLICATE_ACTIVITY_ID`: Two or more activities share the same ID.
- `DUPLICATE_OBJECTIVE_ID`: Duplicate objective ID within lesson.
- `DUPLICATE_OPTION_ID` / `DUPLICATE_BLANK_ID` / `DUPLICATE_ITEM_ID`: Non-unique option/blank/item IDs.
- `UNKNOWN_ACTIVITY_TYPE`: Activity type not in the 15 approved types.
- `INVALID_ACTIVITY_FIELD`: Unrecognized or malformed field for activity type.
- `BROKEN_CAPABILITY_REFERENCE`: Primary/secondary capability not in `capabilityIds`.
- `BROKEN_OBJECTIVE_REFERENCE`: Activity references non-existent objective ID.
- `BROKEN_SKILL_REFERENCE` / `BROKEN_CONCEPT_REFERENCE`: References broken in graph.
- `OBJECTIVE_WITHOUT_EVIDENCE`: An objective in `lesson.objectives` has no activity or evidence requirement supporting it.
- `CANONICAL_ACTIVITY_MISSING_VALIDATION`: Interactive activity lacks validation block.
- `INTERACTIVE_CODE_MISSING_VALIDATION`: Coding activity lacks test cases/output validation.
- `DEBUG_MISSING_VALIDATION`: Debug activity lacks validation test cases.
- `MULTIPLE_CHOICE_MISSING_VALIDATION`: MCQ lacks validation.
- `MULTIPLE_CHOICE_ONE_OPTION`: MCQ contains fewer than 2 options.
- `INVALID_ACTIVITY_VALIDATION`: Validation configuration is malformed or invalid.

#### Linter Warnings (Pedagogical & Quality Heuristics in Code)
- `CAPABILITY_WITHOUT_EVIDENCE`: Capability claimed in `capabilityIds` has no activity declaring evidence for it.
- `SKILL_WITHOUT_EVIDENCE`: Skill claimed in `skillIds` is not supported by any practice/assessment activity.
- `PEDAGOGICAL_SEQUENCE_WARNING`:
  - Lesson begins directly with an applied activity without orientation.
  - `debug` appears before any explanation or code example.
  - Three or more consecutive activities share the exact same type.
- `PASSIVE_LESSON_WARNING`: Four or more consecutive passive activities without an active check.
- `MISSING_RETRIEVAL_WARNING`: Practice/assessment lesson contains no retrieval or assessment activities.
- `MISSING_SYNTHESIS_WARNING`: Lesson does not conclude with a `summary`, `reflection`, or `completion` activity.
- `MALFORMED_HINTS`: Hints are empty, out of order, or improperly configured.
- `DUPLICATE_PROMPT_WARNING`: Identical prompts repeated across activities.
- `CONTENT_QUALITY_WARNING`: Text length or structure anomalies.

### 7.2 Warning Severity and Production Certification Policy
In the repository linter, diagnostics are categorized as `error`, `warning`, and `info`. The linter function `lintLesson()` returns `valid: true` if there are 0 errors, even if warnings exist.

**Forge Production Certification Policy (Stricter Gate):**
For production release and B5 batch certification, the curriculum team enforces a **Zero-Warning Gate** for pedagogical integrity:
- Authored lessons in B5 must resolve all `PEDAGOGICAL_SEQUENCE_WARNING`, `PASSIVE_LESSON_WARNING`, `CAPABILITY_WITHOUT_EVIDENCE`, and `MISSING_SYNTHESIS_WARNING` diagnostics.
- This policy is enforced at the curriculum quality review gate, separate from the baseline TypeScript compiler.

### 7.3 Forge Production Policies (Human & Architectural Standards)
These policies govern pedagogical quality and cannot be fully automated by AST linters:
1. **No Unjustified Coding Cliff:** Ensure the learner has sufficient prior knowledge, starter code, and scaffolding before facing a coding challenge.
2. **Intentional Prediction:** Predictions must involve reasoned hypotheses, not random guessing.
3. **Meaningful Discovery:** Encounter living phenomena before abstract rules whenever concepts have observable manifestations.
4. **Cognitive Load Restraint:** Do not introduce multiple unrelated mental models in a single lesson.
5. **Tone & Voice Fidelity:** Comply strictly with `FORGE_VOICE_AND_HUMOR_BIBLE_V1.md`.

---

## 8. HINT & ASSISTANCE STANDARDS

Applied and coding activities (`interactive-code`, `debug`, `fill-blank`, `ordering`) should provide progressive scaffolding appropriate to the task.

### 8.1 Progressive Hint Architecture
- **Do NOT impose an arbitrary universal count:** The schema does not mandate exactly 3 hints for every task. A simple task may need 1–2 hints; a complex challenge may benefit from 3–4.
- **Progressive Direction:** Hints must progress from broad orientation toward concrete guidance:
  - *Tier 1 (Orientation):* Nudge attention to the relevant concept or element (e.g., *"Consider which tag represents an image in HTML"*).
  - *Tier 2 (Mechanism):* Clarify the mechanical rule or syntax requirement (e.g., *"Void elements cannot hold text, so they do not take a closing tag"*).
  - *Tier 3 (Concrete Guidance):* Provide specific syntax templates or partial code structure.

---

## 9. LESSON LENGTH & ACTIVITY SELECTION

### 9.1 Lesson Length
- **No Arbitrary Activity Count:** Do not enforce that "every lesson must contain 7–8 activities."
- Lesson length is determined by:
  - Scope of the capability
  - Complexity of the underlying mental model
  - Amount of guided practice needed to establish confident mastery
- A focused lesson on a narrow concept may legitimately contain 4–5 activities. A broader architectural lesson may require 7–9 activities.
- **Prohibitions:** Avoid filler padding to hit an arbitrary count; avoid excessive compression that creates a cognitive cliff.

### 9.2 Activity Diversity
- **Activity diversity is not a goal in itself.** Do not force `fill-blank`, `ordering`, `multiple-choice`, and `debug` into a lesson merely to check a diversity box.
- The author must ask:
  > **"What specific learner behavior is necessary to develop and demonstrate this capability?"**
- Select only the activity types that directly produce that behavior.

---

## 10. COGNITIVE LOAD & PREREQUISITE DISCIPLINE

1. **One Dominant Mental Model:** A single lesson should establish or refine one primary mental model. Do not introduce multiple competing conceptual frameworks simultaneously.
2. **Prerequisite Restraint:** Strictly prevent premature introduction of un-scaffolded advanced concepts (e.g., asynchronous promises, complex CSS grid algorithms, framework state) into introductory lessons.
3. **Pacing:** Balance dense interactive coding tasks with brief reflection, synthesis, or observation moments.

---

## 11. REFERENCE IMPLEMENTATION: B3 PILOT ANALYSIS

The lesson `src/data/canonical/lessons/lesson-elements-tags-attributes.json` serves as the verified B3 reference archetype illustrating how authoring choices create a beginner-friendly experience without runtime modifications.

### 11.1 Actual B3 Activity Sequence
1. `act-112-intro` (`intro`): Hook establishing real-world role of HTML elements.
2. `act-112-predict-structure` (`output-prediction`): Prediction contrasting container paragraphs with void image elements *before* formal definitions.
3. `act-112-explanation` (`explanation`): Clear formalization of tags, elements, attributes, and void elements.
4. `act-112-code-example` (`code-example`): Concrete syntax snippet with line annotations.
5. `act-112-ordering` (`ordering`): Tactile assembly of an anchor tag with attributes.
6. `act-112-mc-nesting` (`multiple-choice`): Concept check on hierarchical DOM nesting rules.
7. `act-112-code-interactive` (`interactive-code`): Applied modification adding attributes and nesting elements with live test validation.
8. `act-112-summary` (`summary`): Key takeaways and review questions.

**B3 Lesson Takeaway:** B3 demonstrated that disciplined authoring—combining an early prediction, annotated code example, and tactile token ordering before live coding—eliminates the beginner cognitive cliff. **This sequence is an exemplar, not a mandatory template for all lessons.**

---

## 12. B5 AI AUTHORING WORKFLOW

Content engineers and AI authoring agents in B5 must execute the following linear workflow:

```text
1. Read Curriculum Context & Source Lesson
   ↓
2. Identify Target Capability & Prerequisites
   ↓
3. Define Learner Starting State & Target State
   ↓
4. Choose Dominant Mental Model
   ↓
5. Select Required Learner Behaviors
   ↓
6. Select Appropriate Activity Types (from 15 Canonical Types)
   ↓
7. Design Cognitive Progression & Contextual Scaffolding
   ↓
8. Formulate Validation Test Cases & Progressive Hints
   ↓
9. Configure Evidence Mappings (`activity.evidence`)
   ↓
10. Check Cognitive Load & Mobile/Accessibility Constraints
   ↓
11. Validate Against Zod Schema (`canonicalLessonSchema`)
   ↓
12. Run Authoring Linter (`lintLesson()`)
   ↓
13. Perform Pedagogical Quality Gate Review
   ↓
14. Certify Lesson for Production
```

---

## 13. B5 AI AGENT GUARDRAILS

Any AI agent operating in B5 batch production must strictly adhere to these guardrails:
1. **Read Before Writing:** Always read the contract, relevant source lesson from `lessons.json`, and module capability definitions before generating canonical JSON.
2. **No Schema Inventions:** Use only the actual schema fields confirmed in `src/lib/curriculum/types.ts`. Never invent fields (e.g., do not use `initialCode`, `brokenCode`, `sandboxConfig`).
3. **No Architecture Modifications:** Do not touch runtime hosts, player components, renderers, or session engines.
4. **No Sequence Cloning:** Do not blindly copy previous lesson sequences. Design the sequence specifically for the target capability.
5. **Verify Cleanly:** Ensure every authored lesson passes schema parsing and `lintLesson()` with 0 errors before marking complete.
6. **Boundary Discipline:** Stop after the requested batch; do not expand scope.

---

## 14. PRE-COMMIT QUALITY GATE & CERTIFICATION CHECKLIST

Before committing any canonical lesson to `src/data/canonical/lessons/`, verify each criterion:

- [ ] **Observable Capability:** Is the target capability concrete, observable, and matched to `capabilityIds[0]`?
- [ ] **Clear States:** Are the learner's starting state and target state well defined?
- [ ] **Clear Mental Model:** Is there one dominant, coherent mental model being developed?
- [ ] **Justified Sequence:** Is the activity order justified by pedagogical necessity rather than habit or a template?
- [ ] **No Coding Cliff:** Is scaffolding sufficient for the learner's starting state before an interactive coding task?
- [ ] **Meaningful Prediction:** If prediction is used, does it prompt reasoned simulation rather than a blind guess?
- [ ] **Meaningful Interactions:** Are interactions pedagogically meaningful rather than decorative?
- [ ] **Evidence Alignment:** Does `activity.evidence` cleanly map to declared capabilities and objectives?
- [ ] **Coherent Prerequisites:** Are declared prerequisite lesson, concept, and skill IDs valid and necessary?
- [ ] **Robust Validation:** Do validation test cases and matchers accurately evaluate the target behavior without brittleness?
- [ ] **Actionable Feedback:** Does feedback explain *why* an answer is correct or incorrect, referencing browser mechanics?
- [ ] **Controlled Cognitive Load:** Does the lesson avoid introducing premature, unrelated advanced concepts?
- [ ] **Mobile & Accessible:** Are text prompts concise and accessible for mobile viewports?
- [ ] **Anti-Cookie-Cutter Compliance:** Does the lesson avoid both rote cloning and gratuitous forced diversity?
- [ ] **Schema Conformance:** Does the lesson JSON pass validation against `canonicalLessonSchema`?
- [ ] **Linter Conformance:** Does `lintLesson()` report 0 errors (and 0 blocking pedagogical warnings)?

---

## 15. RATIFICATION & STATUS

This Contract stands as the ratified, binding standard for the Forge curriculum. Content engineers and automated authoring pipelines must construct lessons that conform directly to this specification. The runtime remains clean, stable, and decoupled.
