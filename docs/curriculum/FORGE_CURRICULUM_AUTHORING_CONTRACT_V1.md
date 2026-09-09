# FORGE CURRICULUM AUTHORING CONTRACT V1
**Production Standard for Canonical Lesson Design, Pedagogical Progression, and Evidence Integrity**

- **Document Version:** 1.2.0 (B4 Final Certified Edition)
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

In the repository implementation, `CanonicalActivity` is a discriminated union of 15 concrete activity interfaces (`IntroActivity`, `ExplanationActivity`, `CodeExampleActivity`, etc.). Each canonical activity interface contains the common activity fields appropriate to the concrete activity type, with type-specific content:

- `id`: `string` (unique activity identifier within the lesson)
- `type`: `ActivityType` (one of the 15 discriminant literal strings)
- `intent`: `ActivityIntent` (pedagogical intent; optional on `JudgmentActivity`)
- `objectiveIds`: `string[]` (array of objective IDs addressed by this activity; optional on `JudgmentActivity`)
- `content`: Type-specific activity content interface
- `validation?`: `ActivityValidationConfig` (generic activity-level validation)
- `feedback?`: `ActivityFeedback` (`{ correct: string; incorrect: string; explanation?: string; hints?: ActivityHint[] }`)
- `evidence?`: `ActivityEvidenceConfig` (author-configured evidence declaration)
- `optional?`: `boolean` (flag indicating optional activity)
- `experience?`: `ActivityExperience` (explicit executable-experience declaration, supported on `InteractiveCodeActivity` and `DebugActivity`)

### Canonical `ActivityIntent` Union
The canonical `ActivityIntent` union in `src/lib/curriculum/types.ts` is defined as:
```typescript
export type ActivityIntent =
  | "orientation"
  | "understanding"
  | "recognition"
  | "retrieval"
  | "prediction"
  | "application"
  | "modification"
  | "debugging"
  | "transfer"
  | "reflection"
  | "assessment";
```
*(Note: Conceptual terms such as "synthesis" or "evaluation" describe high-level cognitive outcomes in curriculum design, but they are not members of the canonical `ActivityIntent` TypeScript union.)*

---

### 4.1 `intro`
- **Typical Intent:** `"orientation"`
- **Typical Purpose:** Frame the lesson, present a compelling engineering scenario, outline concrete learning goals.
- **Actual Content Schema (`IntroActivityContent`):**
  - `title`: `string` (required)
  - `hook`: `string` (required)
  - `context?`: `string` (optional)
  - `goals?`: `string[]` (optional)
- **Validation Support:** None required. Passive activity; generic `activity.validation` is optional.
- **Evidence Support:** Typically none (author may attach `activity.evidence` if orientation includes an active check).

---

### 4.2 `explanation`
- **Typical Intent:** `"understanding"`
- **Typical Purpose:** Formalize a mental model, explain underlying browser mechanics, clarify common misconceptions.
- **Actual Content Schema (`ExplanationActivityContent`):**
  - `text`: `string` (required; Markdown text, keep concise ~150–250 words)
  - `title?`: `string` (optional)
  - `callout?`: `{ variant: "tip" | "warning" | "mistake" | "info"; text: string }` (optional)
  - `keyTakeaway?`: `string` (optional)
- **Validation Support:** None required (passive activity).
- **Evidence Support:** Typically none.

---

### 4.3 `code-example`
- **Typical Intent:** `"understanding"`
- **Typical Purpose:** Present clean, annotated reference code illustrating syntax anatomy or design patterns.
- **Actual Content Schema (`CodeExampleActivityContent`):**
  - `code`: `string` (required)
  - `language`: `string` (required)
  - `title?`: `string` (optional)
  - `description?`: `string` (optional)
  - `highlightedLines?`: `number[]` (optional)
  - `annotations?`: `Array<{ line: number; comment: string }>` (optional)
- **Validation Support:** None required (passive activity).
- **Evidence Support:** Typically none.

---

### 4.4 `visual`
- **Typical Intent:** `"orientation"` or `"recognition"`
- **Typical Purpose:** Provide an interactive or diagrammatic representation of structural systems (DOM trees, box models, flowcharts).
- **Actual Content Schema (`VisualActivityContent`):**
  - `title`: `string` (required)
  - `visualType`: `"diagram" | "flowchart" | "comparison" | "hierarchy" | "custom"` (required)
  - `description?`: `string` (optional)
  - `visualData?`: `Record<string, unknown>` (optional)
  - `interactive?`: `{ kind: string; config?: Record<string, unknown>; caption?: string }` (optional)
- **Validation Support:**
  - **No built-in validation fields in content:** `VisualActivityContent` does NOT contain checklist or evaluation properties. Do not invent visual-specific validation fields.
  - **Generic Activity Validation:** Like all canonical activities, the activity wrapper supports an optional generic `activity.validation?: ActivityValidationConfig`. Visual activities are categorized as passive/exploratory by default and do not require validation.
- **Evidence Support:** Author-configurable via generic `activity.evidence` (typically `"recognition"` when paired with interactive exploration).

---

### 4.5 `output-prediction`
- **Typical Intent:** `"prediction"`
- **Typical Purpose:** Prompt the learner to simulate code execution or rendering in their mind before viewing output.
- **Actual Content Schema (`OutputPredictionActivityContent`):**
  - `code`: `string` (required)
  - `language`: `string` (required)
  - `prompt`: `string` (required)
  - `options?`: `string[]` (optional)
  - `explanation?`: `string` (optional)
- **Validation Support:** Required by authoring linter (assessment activity).
  - Uses `ExactMatchValidation` (`type: "exact-match"`, `expected: string | number | boolean`, `caseSensitive?: boolean`).
  - Or `OneOfValidation` (`type: "one-of"`, `validOptions: (string | number)[]`).
- **Evidence Support:** Author-configurable via generic `activity.evidence` (typically `types: ["prediction"]`).

---

### 4.6 `multiple-choice`
- **Typical Intent:** `"recognition"` or `"retrieval"`
- **Typical Purpose:** Verify conceptual understanding, syntax rules, or vocabulary identification.
- **Actual Content Schema (`MultipleChoiceActivityContent`):**
  - `question`: `string` (required)
  - `options`: `MultipleChoiceOption[]` (required; at least 2 options, unique `id`s)
    - `id`: `string` (required)
    - `text`: `string` (required)
    - `hint?`: `string` (optional)
  - `explanation?`: `string` (optional)
- **Validation Support:** Required by authoring linter (`MULTIPLE_CHOICE_MISSING_VALIDATION`).
  - `ExactMatchValidation` (`type: "exact-match"`, `expected: string | number | boolean`), where `expected` matches the correct option's `id`.
  - Or `OneOfValidation` (`type: "one-of"`, `validOptions: (string | number)[]`), where every item in `validOptions` matches an option `id`.
- **Evidence Support:** Author-configurable via generic `activity.evidence` (typically `types: ["recognition"]`).

---

### 4.7 `multi-select`
- **Typical Intent:** `"recognition"` or `"retrieval"`
- **Typical Purpose:** Test classification or identification of multiple valid criteria without single-choice guessing.
- **Actual Content Schema (`MultiSelectActivityContent`):**
  - `question`: `string` (required)
  - `options`: `MultipleChoiceOption[]` (required; at least 2 options, unique `id`s)
  - `minSelections?`: `number` (optional)
  - `maxSelections?`: `number` (optional)
  - `explanation?`: `string` (optional)
- **Validation Support:** Required by authoring linter (assessment activity).
  - `MultiMatchValidation` (`type: "multi-match"`, `expected: string[]`, `ignoreOrder?: boolean`), where each value in `expected` matches an option `id`.
- **Evidence Support:** Author-configurable via generic `activity.evidence` (typically `types: ["recognition"]`).

---

### 4.8 `fill-blank`
- **Typical Intent:** `"application"` or `"recognition"`
- **Typical Purpose:** Provide scaffolded syntax completion where learners supply missing tokens in real code.
- **Actual Content Schema (`FillBlankActivityContent`):**
  - `prompt`: `string` (required)
  - `template`: `string` (required; code string containing placeholders like `{{blank1}}`)
  - `blanks`: `FillBlankItem[]` (required; at least 1 blank)
    - `id`: `string` (required; matches the placeholder identifier)
    - `hint?`: `string` (optional)
    - `placeholder?`: `string` (optional)
  - `explanation?`: `string` (optional)
- **Validation Architecture:**
  - **No per-blank validation objects:** `FillBlankItem` does NOT define individual validation objects (do not invent `perBlankValidation`, `blankValidation[]`, or similar properties).
  - **Activity-Level Validation:** Validation is defined strictly on the activity wrapper (`activity.validation?: ActivityValidationConfig`):
    - *Single blank:* `ExactMatchValidation` (`type: "exact-match"`, `expected: string`) or `OneOfValidation` (`type: "one-of"`, `validOptions: (string | number)[]`).
    - *Multiple blanks:* `MultiMatchValidation` (`type: "multi-match"`, `expected: string[]`, `ignoreOrder?: boolean`). The runtime evaluates the learner's array of string inputs against `expected`. When `ignoreOrder: false`, inputs are evaluated positionally against the ordered blanks.
- **Evidence Support:** Author-configurable via generic `activity.evidence` (typically `types: ["manipulation"]` or `["recognition"]`).

---

### 4.9 `ordering`
- **Typical Intent:** `"application"` or `"recognition"`
- **Typical Purpose:** Tactile arrangement of syntax tokens, lifecycle phases, or hierarchical DOM nesting.
- **Actual Content Schema (`OrderingActivityContent`):**
  - `prompt`: `string` (required)
  - `items`: `OrderingItem[]` (required; at least 2 items)
    - `id`: `string` (required)
    - `text`: `string` (required)
    - `initialOrder?`: `number` (optional)
  - `explanation?`: `string` (optional)
- **Validation Support:** Required by authoring linter (assessment activity).
  - `OrderingValidation` (`type: "ordering"`, `correctSequence: string[]`), where each string in `correctSequence` matches an item `id`.
- **Evidence Support:** Author-configurable via generic `activity.evidence` (typically `types: ["manipulation"]`).

---

### 4.10 `interactive-code`
- **Typical Intent:** `"application"` or `"modification"`
- **Typical Purpose:** Live coding in the browser sandbox editor with instant preview and multi-criteria validation.
- **Actual Content Schema (`InteractiveCodeActivityContent`):**
  - `title`: `string` (required)
  - `prompt`: `string` (required)
  - `language`: `string` (required)
  - `starterCode`: `string` (required; initial editor code)
  - `instructions?`: `string` (optional)
  - `solutionCode?`: `string` (optional)
  - `hints?`: `string[]` (optional)
  - `files?`: `InteractiveCodeFile[]` (optional; `{ name: string; content: string; readOnly?: boolean }`)
  - `testCases?`: `Array<{ id?: string; description: string; assertion?: string; testCode?: string }>` (optional)
  - `htmlFixture?`: `string` (optional; DOM environment fixture for CSS/JS activities)
- **Activity-Level Properties:**
  - `experience?`: `ActivityExperience` (optional explicit executable-experience declaration)
- **Validation Support:** Required by authoring linter (`INTERACTIVE_CODE_MISSING_VALIDATION`).
  - `TestsValidation` (`type: "tests"`, `testCases: TestCaseValidation[]`) via `activity.validation`.
  - Or `CodeOutputValidation` (`type: "code-output"`, `expectedOutput: string`, `matchType?: "exact" | "contains" | "regex"`).
  - Or embedded test cases defined via `content.testCases`.
- **Evidence Support:** Author-configurable via generic `activity.evidence` (typically `types: ["implementation"]` or `["manipulation"]`).

---

### 4.11 `debug`
- **Typical Intent:** `"debugging"`
- **Typical Purpose:** Present realistic broken code for the learner to diagnose, isolate, and repair.
- **Actual Content Schema (`DebugActivityContent`):**
  - `title`: `string` (required)
  - `prompt`: `string` (required)
  - `buggyCode`: `string` (required; initial broken code in editor)
  - `language`: `string` (required)
  - `bugDescription`: `string` (required; description of observed broken behavior)
  - `hints?`: `string[]` (optional)
  - `fixRequirements?`: `string[]` (optional)
  - `files?`: `InteractiveCodeFile[]` (optional)
  - `solutionCode?`: `string` (optional)
  - `testCases?`: `Array<{ id?: string; description: string; assertion?: string; testCode?: string }>` (optional)
  - `htmlFixture?`: `string` (optional)
- **Activity-Level Properties:**
  - `experience?`: `ActivityExperience` (optional)
- **Validation Support:** Required by authoring linter (`DEBUG_MISSING_VALIDATION`).
  - Configured via `activity.validation` (`TestsValidation` or `CodeOutputValidation`), or embedded via `content.testCases`.
- **Evidence Support:** Author-configurable via generic `activity.evidence` (typically `types: ["debugging"]`).

---

### 4.12 `judgment`
- **Typical Intent:** `"transfer"`
- **Typical Purpose:** Compare architectural tradeoffs, evaluate alternative implementations, justify technical decisions.
- **Actual Content Schema (`JudgmentActivityContent`):**
  - `prompt`: `string` (required)
  - `modelAnswer`: `{ summary: string; detailedAnalysis: string; keyTradeoffs: string[] }` (required)
  - `evaluationRubric`: `Array<{ id: string; label: string; description: string }>` (required)
  - `title?`: `string` (optional)
  - `context?`: `string` (optional)
  - `responsePlaceholder?`: `string` (optional)
  - `takeaways?`: `string[]` (optional)
- **Validation Support:** Self-evaluation against rubric and model answer; optional generic `activity.validation?: ActivityValidationConfig`.
- **Evidence Support:** Author-configurable via generic `activity.evidence` (typically `types: ["judgment"]` or `["transfer"]`).

---

### 4.13 `reflection`
- **Typical Intent:** `"reflection"`
- **Typical Purpose:** Prompt the learner to articulate mental models, summarize mechanisms, or evaluate what broke in their own words.
- **Actual Content Schema (`ReflectionActivityContent`):**
  - `prompt`: `string` (required)
  - `guidelines?`: `string[]` (optional)
  - `sampleResponse?`: `string` (optional)
  - `minCharacters?`: `number` (optional)
- **Validation Support:** Optional generic `activity.validation?: ActivityValidationConfig`.
- **Evidence Support:** Author-configurable via generic `activity.evidence` (typically `types: ["explanation"]`).

---

### 4.14 `summary`
- **Typical Intent:** `"understanding"` or `"reflection"`
- **Typical Purpose:** Consolidate core mental models, review key takeaways, preview next curriculum milestones.
- **Actual Content Schema (`SummaryActivityContent`):**
  - `takeaways`: `string[]` (required)
  - `title?`: `string` (optional)
  - `nextSteps?`: `string[]` (optional)
  - `reviewQuestions?`: `string[]` (optional)
- **Validation Support:** None required (passive synthesis activity).
- **Evidence Support:** Typically none.

---

### 4.15 `completion`
- **Typical Intent:** `"assessment"`
- **Typical Purpose:** Acknowledge milestone mastery, display earned achievements or badges.
- **Actual Content Schema (`CompletionActivityContent`):**
  - `title`: `string` (required)
  - `message`: `string` (required)
  - `badgeId?`: `string` (optional)
  - `congratulations?`: `string` (optional)
- **Validation Support:** Session state verification.
- **Evidence Support:** Typically `types: ["mastery"]` or none.

---

## 5. VALIDATION CONFIGURATION TYPES

All activity-level validations are defined through `ActivityValidationConfig` in `src/lib/curriculum/types.ts`:

```typescript
export type ActivityValidationConfig =
  | ExactMatchValidation
  | OneOfValidation
  | MultiMatchValidation
  | OrderingValidation
  | TestsValidation
  | CodeOutputValidation;
```

### 5.1 ExactMatchValidation
```typescript
interface ExactMatchValidation {
  type: "exact-match";
  expected: string | number | boolean;
  caseSensitive?: boolean;
}
```
- **Used by:** `multiple-choice` (matching correct option ID), `output-prediction`, `fill-blank` (single blank).

### 5.2 OneOfValidation
```typescript
interface OneOfValidation {
  type: "one-of";
  validOptions: (string | number)[];
  caseSensitive?: boolean;
}
```
- **Used by:** `multiple-choice` (multiple acceptable option IDs), `output-prediction`, `fill-blank` (synonyms for single blank).

### 5.3 MultiMatchValidation
```typescript
interface MultiMatchValidation {
  type: "multi-match";
  expected: string[];
  ignoreOrder?: boolean; // Defaults to true if omitted in runtime matcher
}
```
- **Used by:** `multi-select` (matching all selected option IDs), `fill-blank` (multiple ordered blanks when `ignoreOrder: false`).

### 5.4 OrderingValidation
```typescript
interface OrderingValidation {
  type: "ordering";
  correctSequence: string[];
}
```
- **Used by:** `ordering` (array of item IDs in correct sequence).

### 5.5 TestsValidation
```typescript
interface TestCaseValidation {
  id: string;
  description: string;
  testCode?: string;
  assertion?: string;
}

interface TestsValidation {
  type: "tests";
  testCases: TestCaseValidation[];
}
```
- **Used by:** `interactive-code`, `debug`.

### 5.6 CodeOutputValidation
```typescript
interface CodeOutputValidation {
  type: "code-output";
  expectedOutput: string;
  matchType?: "exact" | "contains" | "regex";
}
```
- **Used by:** `interactive-code`, `debug` (when output terminal matching is used instead of DOM assertions).

---

## 6. EVIDENCE ARCHITECTURE & CONFIGURATION

Activity types do **not** inherently or magically emit evidence by merely being rendered. The actual architecture is decoupled:
```text
Activity Type
      ↓ (provides an interactive surface & learner behavior)
Author Configures Evidence (`activity.evidence`)
      ↓ (declares target capabilities, skills, objectives, types, level)
Runtime Evaluates & Session Engine Emits `LearningEvidenceToken`
```

### 6.1 Evidence Configuration Schema (`ActivityEvidenceConfig`)
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

### 6.2 Evidence Mapping Rules
1. **Explicit Intentionality:** If an activity is intended to provide evidence of an objective or capability, the author must explicitly reference that objective ID or capability ID in the activity's `objectiveIds`, `evidence.objectiveIds`, or `evidence.capabilityIds`.
2. **Assessment Alignment:** Assessment and practice activities must target the specific cognitive behavior they evaluate (e.g., an `output-prediction` activity should emit `prediction` evidence; an `interactive-code` activity should emit `manipulation` or `implementation` evidence).
3. **No Decorative Evidence:** Do not attach evidence configurations to passive orientation text where the learner performed no observable cognitive act.

---

## 7. CAPABILITY & METADATA MODEL

In `CanonicalLesson` (`src/lib/curriculum/types.ts`), capabilities are defined through structured declarations:

```typescript
export interface CapabilityDeclaration {
  id: string;
  statement: string;
}

export interface CanonicalLesson {
  id: string;
  schemaVersion: string;
  topicId: string;
  phaseId?: string;
  moduleId?: string;
  capabilityGroupId?: string;
  title: string;
  description: string;
  lessonType: LessonType;
  difficulty: Difficulty;
  estimatedMinutes: number;
  conceptIds: string[];
  skillIds: string[];
  capabilityIds?: string[];
  primaryCapability?: CapabilityDeclaration;
  secondaryCapabilities?: CapabilityDeclaration[];
  objectives: Objective[];
  prerequisites: LessonPrerequisites;
  activities: CanonicalActivity[];
  completion: LessonCompletionRule;
  metadata?: Record<string, unknown>;
}
```

### 7.1 Field Distinction & Relationships
- `capabilityIds?: string[]`: The canonical array of capability string IDs developed or assessed by the lesson.
- `primaryCapability?: CapabilityDeclaration`: An optional structured declaration `{ id: string; statement: string; }` identifying the core capability of the lesson.
- `secondaryCapabilities?: CapabilityDeclaration[]`: An optional array of secondary capability declarations `{ id: string; statement: string; }`.

### 7.2 Integrity Rules Enforced by the Repository
1. **Root Reference Rule:** If `primaryCapability` is declared, `primaryCapability.id` **MUST** exist in `lesson.capabilityIds`. Omitting it triggers the repository linter error `BROKEN_CAPABILITY_REFERENCE`.
2. **Secondary Reference Rule:** If `secondaryCapabilities` are declared, every item's `id` **MUST** exist in `lesson.capabilityIds`. Omitting any triggers `BROKEN_CAPABILITY_REFERENCE`.
3. **Evidence Backing Rule:** Every capability listed in `capabilityIds` should have at least one activity whose `evidence.capabilityIds` contains that capability ID. If an activity is missing, the linter emits a `CAPABILITY_WITHOUT_EVIDENCE` warning.

### 7.3 Reference Implementation Snippet (from B3 `lesson-elements-tags-attributes.json`)
```json
{
  "id": "lesson-1-1-2",
  "capabilityIds": [
    "cap-inspect-dom-hierarchy"
  ],
  "primaryCapability": {
    "id": "cap-inspect-dom-hierarchy",
    "statement": "Use browser inspection tools to examine DOM node hierarchy, parent-child nesting, and element attributes."
  },
  "secondaryCapabilities": [],
  "conceptIds": [ ... ],
  "skillIds": [ ... ]
}
```

---

## 8. MACHINE-ENFORCEABLE REPOSITORY RULES VS. FORGE PRODUCTION POLICY

To ensure technical precision, this contract distinguishes between checks that are **machine-enforced by repository code** and requirements that are **Forge Production Policies**.

### 8.1 Machine-Enforceable Repository Rules (Automated Linter)
These rules are implemented in `src/lib/curriculum/authoring/rules.ts`, `lint-lesson.ts`, and `schema-v1.ts`.

#### Linter Errors (Causes `lintLesson().valid === false`)
- `SCHEMA_VALIDATION_ERROR`: Document fails Zod schema parsing.
- `DUPLICATE_LESSON_ID`: Duplicate lesson ID detected.
- `DUPLICATE_ACTIVITY_ID`: Two or more activities share the same ID within the lesson.
- `DUPLICATE_OBJECTIVE_ID`: Duplicate objective ID within lesson objectives.
- `DUPLICATE_OPTION_ID`: Non-unique option IDs in `multiple-choice` or `multi-select`.
- `DUPLICATE_BLANK_ID`: Non-unique blank IDs in `fill-blank`.
- `DUPLICATE_ITEM_ID`: Non-unique item IDs in `ordering`.
- `UNKNOWN_ACTIVITY_TYPE`: Activity type not in the 15 approved canonical types.
- `INVALID_ACTIVITY_FIELD`: Unrecognized, missing, or malformed field for activity type.
- `BROKEN_PHASE_REFERENCE`: Lesson references non-existent `phaseId`.
- `BROKEN_MODULE_REFERENCE`: Lesson references non-existent `moduleId`.
- `BROKEN_CAPABILITY_REFERENCE`: `primaryCapability.id` or `secondaryCapabilities[].id` is not present in `lesson.capabilityIds`.
- `BROKEN_OBJECTIVE_REFERENCE`: Activity references an objective ID not present in `lesson.objectives`.
- `BROKEN_SKILL_REFERENCE` / `BROKEN_CONCEPT_REFERENCE`: References broken in graph context.
- `OBJECTIVE_WITHOUT_EVIDENCE`: An objective in `lesson.objectives` has no activity or completion evidence requirement providing evidence for it.
- `CANONICAL_ACTIVITY_MISSING_VALIDATION`: Interactive/assessment activity lacks a validation configuration.
- `INTERACTIVE_CODE_MISSING_VALIDATION`: Interactive code activity lacks validation test cases or code output validation.
- `DEBUG_MISSING_VALIDATION`: Debug activity lacks validation test cases.
- `MULTIPLE_CHOICE_MISSING_VALIDATION`: Multiple choice activity lacks validation.
- `MULTIPLE_CHOICE_ONE_OPTION`: Multiple choice or multi-select activity contains fewer than 2 options.
- `INVALID_ACTIVITY_VALIDATION`: Validation configuration points to non-existent option IDs or ordering item IDs.

#### Linter Warnings (`lintLesson().valid === true`, but flagged in `warnings`)
- `CAPABILITY_WITHOUT_EVIDENCE`: Capability claimed in `capabilityIds` has no activity declaring evidence for it.
- `SKILL_WITHOUT_EVIDENCE`: Skill claimed in `skillIds` is not supported by any practice/assessment activity.
- `PEDAGOGICAL_SEQUENCE_WARNING`:
  - Lesson begins directly with an applied activity without orientation.
  - `debug` appears before any explanation or code example.
  - Three or more consecutive activities share the exact same type.
- `PASSIVE_LESSON_WARNING`: Four or more consecutive passive activities without an active check.
- `MISSING_RETRIEVAL_WARNING`: Practice/assessment lesson contains no retrieval or assessment activities.
- `MISSING_SYNTHESIS_WARNING`: Lesson does not conclude with a `summary`, `reflection`, or `completion` activity.
- `MALFORMED_HINTS`: Hints contain empty strings, pure whitespace, or coding activities lack hints.
- `DUPLICATE_PROMPT_WARNING`: Identical prompts repeated across activities.
- `CONTENT_QUALITY_WARNING`: Text length or structure anomalies.

### 8.2 Forge Production Policies (Curriculum Quality Gates)
These policies govern pedagogical quality and cannot be fully automated by AST linters. They are enforced at human and curriculum review gates:
1. **Zero-Warning Gate for B5 Production:** Authored lessons in B5 must resolve all `PEDAGOGICAL_SEQUENCE_WARNING`, `PASSIVE_LESSON_WARNING`, `CAPABILITY_WITHOUT_EVIDENCE`, and `MISSING_SYNTHESIS_WARNING` diagnostics before release.
2. **No Unjustified Coding Cliff:** Ensure the learner has sufficient prior knowledge, starter code, and scaffolding before facing an interactive coding challenge.
3. **Intentional Prediction:** Predictions must involve reasoned hypotheses, not random guessing.
4. **Meaningful Discovery:** Encounter living phenomena before abstract rules whenever concepts have observable manifestations.
5. **Cognitive Load Restraint:** Do not introduce multiple unrelated mental models in a single lesson.
6. **Tone & Voice Fidelity:** Comply strictly with `FORGE_VOICE_AND_HUMOR_BIBLE_V1.md`.

---

## 9. HINT & ASSISTANCE STANDARDS

Applied and coding activities (`interactive-code`, `debug`, `fill-blank`, `ordering`) should provide progressive scaffolding appropriate to the task.

### 9.1 Machine Requirements vs. Authoring Policy
- **Machine Rule (`checkHintQuality`):** Checks that hints are non-empty strings and warns if coding activities have no hints. The machine does **NOT** enforce exactly three hints.
- **Forge Authoring Recommendation (Pedagogical Policy):** Progressive 3-tier scaffolding is recommended for applied coding challenges:
  - *Tier 1 (Orientation):* Nudge attention to the relevant concept or element (e.g., *"Consider which tag represents an image in HTML"*).
  - *Tier 2 (Mechanism):* Clarify the mechanical rule or syntax requirement (e.g., *"Void elements cannot hold text, so they do not take a closing tag"*).
  - *Tier 3 (Concrete Guidance):* Provide specific syntax templates or partial code structure.

---

## 10. LESSON LENGTH & ACTIVITY SELECTION

### 10.1 Lesson Length
- **No Arbitrary Activity Count:** Do not enforce that "every lesson must contain 7–8 activities."
- Lesson length is determined by:
  - Scope of the capability
  - Complexity of the underlying mental model
  - Amount of guided practice needed to establish confident mastery
- A focused lesson on a narrow concept may legitimately contain 4–5 activities. A broader architectural lesson may require 7–9 activities.
- **Prohibitions:** Avoid filler padding to hit an arbitrary count; avoid excessive compression that creates a cognitive cliff.

### 10.2 Activity Diversity
- **Activity diversity is not a goal in itself.** Do not force `fill-blank`, `ordering`, `multiple-choice`, and `debug` into a lesson merely to check a diversity box.
- The author must ask:
  > **"What specific learner behavior is necessary to develop and demonstrate this capability?"**
- Select only the activity types that directly produce that behavior.

---

## 11. REFERENCE IMPLEMENTATION: B3 PILOT ANALYSIS

The lesson `src/data/canonical/lessons/lesson-elements-tags-attributes.json` serves as the verified B3 reference archetype illustrating how authoring choices create a beginner-friendly experience without runtime modifications.

### 11.1 Actual B3 Activity Sequence & IDs
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
