/**
 * Canonical Lesson Schema V1 → Layer 1 Runtime Adapter
 *
 * Single compatibility boundary between `CanonicalLessonV1` and the shape
 * `useLessonSession` / `CanonicalActivityView` / `renderActivity` (Layer 1)
 * already expect. Per FORGE_LAYER2_DESTINATION_AUDIT.md §3.B, 12 of 17 V1
 * activity types map cleanly onto an existing Layer 1 renderer; this module
 * implements that mapping for the 6 types the golden lesson actually uses
 * (interactive-demo, prediction, debug, interactive-code, reflection,
 * judgment — the fixture turned out to use two more types than the task's
 * summary of its activity sequence listed; both are trivial Layer-1
 * passthroughs or a content-gap fallback, not new content contracts, so
 * handling them stays within this slice's spirit even though Step 2 scoped
 * new *content schemas* to just the first four).
 *
 * Deliberately the ONLY place V1↔Layer1 conversion happens — nothing else in
 * the V1 player, renderers, or route should reach into a `CanonicalLessonV1`
 * and hand-shape a Layer 1 object itself (see task Step 4).
 *
 * Design note on `debug`: V1's investigation-oriented `debug` activity has no
 * faithful Layer 1 renderer (Layer 1's DebugRenderer expects
 * buggyCode/bugDescription/testCases — a diagnose-and-fix-in-one shape; V1's
 * `debug` is investigation-only, with the fix as a separate downstream
 * activity). Rather than force it through `renderActivity` with a
 * `"debug"`-typed stub whose content it can't actually use (which would
 * silently collapse V1's split semantics back into Layer 1's combined ones —
 * exactly what the task says not to do), this adapter classifies each
 * activity in `renderPlan` and gives investigation activities an inert
 * Layer-1 placeholder shape purely so `useLessonSession`/`evidence-engine.ts`
 * have a structurally valid `CanonicalActivity` to do session bookkeeping
 * against. The V1 player (see
 * ../../components/lesson/v1/v1-activity-view.tsx) reads `renderPlan`
 * BEFORE calling `renderActivity`, and renders the real
 * `InvestigationDebugRenderer` instead for `"investigation"`-classified IDs
 * — `renderActivity` and `registry.tsx` are never modified.
 */
import type {
  CanonicalActivity,
  CanonicalLesson,
  MultipleChoiceActivity,
  VisualActivity,
  InteractiveCodeActivity,
  DebugActivity,
  ReflectionActivity,
  MultiSelectActivity,
  OrderingActivity,
  FillBlankActivity,
  OutputPredictionActivity,
  IntroActivity,
  ExplanationActivity,
  SummaryActivity,
  CompletionActivity,
  Objective,
  EvidenceType,
  ActivityEvidenceConfig,
} from "../types";
import type { ActivityV1, CanonicalLessonV1 } from "../types-v1";
import type {
  InteractiveDemoContentV1,
  PredictionContentV1,
  InteractiveCodeContentV1,
  MultipleChoiceContentV1,
  OutputPredictionContentV1,
  MultiSelectContentV1,
  OrderingContentV1,
  FillBlankContentV1,
  IntroContentV1,
  ExplanationContentV1,
  SummaryContentV1,
} from "./content-schemas";

/**
 * How the V1 player (`v1-activity-view.tsx`) should render a given activity
 * ID. `delegate-layer1` activities go through the real, unmodified
 * `CanonicalActivityView`/`renderActivity` (full reuse, including the real
 * sandbox runtime for interactive-code and the real account-settings visual
 * for interactive-demo). The other three kinds render a V1-native component
 * directly against the *original* V1 content, bypassing Layer 1's dispatch —
 * see each renderer's module doc for why.
 */
export type V1ActivityRenderKind =
  | "delegate-layer1"
  | "prediction"
  | "investigation"
  | "generic-demo"
  | "multi-select"
  | "ordering"
  | "fill-blank";

/**
 * The authoritative "can this activity type actually be rendered" set —
 * must be kept in sync with `adaptActivity`'s switch statement (every case
 * there but `default` belongs here). Exported so the authoring/validation
 * pipeline (`src/lib/curriculum/v1/activity-compatibility.ts`) can check
 * "does an adapter exist for this type" without duplicating the switch
 * logic or importing UI-layer code.
 */
export const V1_SUPPORTED_ACTIVITY_TYPES: ReadonlySet<string> = new Set([
  "interactive-demo",
  "prediction",
  "interactive-code",
  "code-modification",
  "debug",
  "reflection",
  "multiple-choice",
  "output-prediction",
  "multi-select",
  "ordering",
  "fill-blank",
  "intro",
  "explanation",
  "code-example",
  "summary",
  "visual",
  "completion",
  "judgment",
  "replicate-this",
]);

export interface AdaptedLessonV1 {
  /** Layer-1-shaped lesson, safe to pass to `useLessonSession`/`CanonicalLessonPlayer`-style consumers. */
  lesson: CanonicalLesson;
  /** Per-activity render dispatch plan, keyed by activity ID. */
  renderPlan: Record<string, V1ActivityRenderKind>;
  /** Original V1 activities, keyed by ID — the source of truth for the three V1-native renderer kinds, which cannot render from the adapted Layer 1 placeholder content. */
  originalActivities: Record<string, ActivityV1>;
}

function toObjective(id: string, statement: string, priority: Objective["priority"]): Objective {
  return { id, statement, conceptIds: [], skillIds: [], priority };
}

function toEvidenceConfig(
  evidenceV1: { types: string[]; capabilityIds: string[] } | undefined,
): ActivityEvidenceConfig | undefined {
  if (!evidenceV1) return undefined;
  // V1 and Layer 1 EvidenceType enums are the same set (see
  // FORGE_LAYER2_DESTINATION_AUDIT.md §3.A) — direct cast, no translation needed.
  return {
    types: evidenceV1.types as EvidenceType[],
    capabilityIds: evidenceV1.capabilityIds,
  };
}

function extractFeedbackString(val: unknown, fallback: string): string {
  if (typeof val === "string" && val.trim().length > 0) return val;
  if (val && typeof val === "object") {
    const rec = val as Record<string, unknown>;
    const parts = [rec.result, rec.observation, rec.mechanism, rec.generalization].filter(
      (p): p is string => typeof p === "string" && p.trim().length > 0,
    );
    if (parts.length > 0) return parts.join(" ");
  }
  return fallback;
}

function toLayer1Feedback(activity: ActivityV1): CanonicalActivity["feedback"] {
  const fb = activity.feedback;
  const rawHints = activity.hints ?? fb?.hints;
  const hints =
    Array.isArray(rawHints) && rawHints.length > 0
      ? rawHints.map((h, idx) => ({
          id: `${activity.id}-hint-${idx + 1}`,
          level: h.level ?? idx + 1,
          content: h.text,
        }))
      : undefined;

  if (!fb && !hints) return undefined;

  return {
    correct: extractFeedbackString(fb?.correct, "Correct answer selected."),
    incorrect: extractFeedbackString(
      fb?.incorrect,
      "Not quite right. Review the explanation and try again.",
    ),
    ...(hints ? { hints } : {}),
  };
}

/** interactive-demo → Layer 1 `visual`, reusing the interactive visual registry when a systemComponent is declared, or a plain description-only visual otherwise. */
function adaptInteractiveDemo(activity: ActivityV1): VisualActivity {
  const content = activity.content as InteractiveDemoContentV1;
  const kindBySystemComponent: Record<string, string> = {
    AccountSettingsSystem: "account-settings",
    RequestFlow: "request-flow",
    LayerStack: "layer-stack",
    ComputerPipeline: "computer-pipeline",
    BoxModelStudio: "box-model-studio",
    FlexGridStudio: "flex-grid-studio",
    TypographyContrastStudio: "typography-contrast-studio",
    ResponsiveStateStudio: "responsive-state-studio",
  };
  const interactiveKind = content.systemComponent
    ? (kindBySystemComponent[content.systemComponent] ?? content.systemComponent)
    : undefined;

  return {
    id: activity.id,
    type: "visual",
    intent: "orientation",
    objectiveIds: [],
    content: {
      title: activity.title,
      visualType: interactiveKind ? "custom" : "diagram",
      description: activity.instruction ?? content.symptom ?? content.expectedStatus,
      visualData: { ...content },
      ...(interactiveKind
        ? { interactive: { kind: interactiveKind, config: { ...content } } }
        : {}),
    },
    evidence: activity.evidence ? toEvidenceConfig(activity.evidence) : undefined,
  };
}

/** prediction → Layer 1 `multiple-choice`. Both are "commit to one of N options"; V1 keeps the pedagogical label `prediction` at the `role` level (see golden lesson), Layer 1 has no separate type for it (see FORGE_LAYER2_DESTINATION_AUDIT.md §3.B — flagged there as an open naming question, not resolved here). */
function adaptPrediction(activity: ActivityV1): MultipleChoiceActivity {
  const content = activity.content as PredictionContentV1;
  const correctAnswer =
    typeof activity.validation?.correctAnswer === "string"
      ? activity.validation.correctAnswer
      : undefined;

  return {
    id: activity.id,
    type: "multiple-choice",
    intent: "prediction",
    objectiveIds: [],
    content: {
      question: activity.instruction ?? activity.title,
      options: content.options.map((opt) => ({ id: opt.id, text: opt.text })),
    },
    validation: correctAnswer ? { type: "one-of", validOptions: [correctAnswer] } : undefined,
    feedback: toLayer1Feedback(activity),
    evidence: activity.evidence ? toEvidenceConfig(activity.evidence) : undefined,
  };
}

function synthesizeCssHtmlFixture(cssSource: string, title: string): string {
  const classes = new Set<string>();
  for (const m of cssSource.matchAll(/\.([a-zA-Z_-][a-zA-Z0-9_-]*)/g)) {
    classes.add(m[1]);
  }
  const classList = Array.from(classes);
  if (classList.length === 0) {
    return `<main class="preview-stage"><article class="card"><h1>${title}</h1><p>Inspect and style this semantic interface element using CSS rules.</p><button type="button">Primary Action</button></article></main>`;
  }

  const primaryClass = classList[0];
  const childClasses = classList.slice(1, 5);
  const childrenHtml =
    childClasses.length > 0
      ? childClasses
          .map(
            (cls, idx) =>
              `<div class="${cls}"><strong>Item 0${idx + 1} (.${cls})</strong><p>Styled child element inside .${primaryClass}</p></div>`,
          )
          .join("\n  ")
      : `<h2>${title}</h2>\n  <p>Live preview target for <code>.${primaryClass}</code>.</p>\n  <button type="button" class="btn button">Interactive Action</button>`;

  return `<div class="${classList.join(" ")}">\n  ${childrenHtml}\n</div>`;
}

/** interactive-code → Layer 1 `interactive-code`. Normalizes language aliases ("js", "ts", "jsx", "tsx" → "javascript") and synthesizes a live HTML fixture for CSS activities so HtmlExperienceRenderer, CssExperienceRenderer, and JavaScriptExperienceRenderer mount with live preview. */
function adaptInteractiveCode(activity: ActivityV1): InteractiveCodeActivity {
  const content = activity.content as InteractiveCodeContentV1 & {
    prompt?: string;
    htmlFixture?: string;
    language?: string;
  };
  const testCases = (activity.validation?.testCases ?? []).map((tc, idx) => ({
    id: tc.id ?? `${activity.id}-test-${idx}`,
    description: tc.description,
    assertion: tc.assertion,
    testCode: tc.testCode,
  }));

  const fullPromptText =
    content.prompt && activity.instruction && content.prompt !== activity.instruction
      ? `${activity.instruction}\n\n${content.prompt}`
      : (content.prompt ?? activity.instruction ?? "");

  const rawLang = (content.language ?? "javascript").toLowerCase();
  const normalizedLanguage: "html" | "css" | "javascript" =
    rawLang === "html" ? "html" : rawLang === "css" ? "css" : "javascript";

  let htmlFixture: string | undefined = content.htmlFixture;
  if (normalizedLanguage === "css" && !htmlFixture) {
    const fencedBlocks = [...fullPromptText.matchAll(/```(?:html|css|text)?\n([\s\S]*?)```/gi)];
    const htmlBlock = fencedBlocks.find((m) => /<[a-z][\s\S]*>/i.test(m[1]));
    if (htmlBlock) {
      htmlFixture = htmlBlock[1].trim();
    } else {
      htmlFixture = synthesizeCssHtmlFixture(
        `${content.starterCode ?? ""}\n${content.solutionCode ?? ""}`,
        activity.title || "Interface Specimen",
      );
    }
  }

  return {
    id: activity.id,
    type: "interactive-code",
    intent: "modification",
    objectiveIds: [],
    content: {
      title: activity.title,
      prompt: content.prompt ?? activity.instruction ?? "",
      instructions: fullPromptText,
      language: normalizedLanguage,
      starterCode: content.starterCode,
      solutionCode: content.solutionCode,
      ...(htmlFixture ? { htmlFixture } : {}),
      ...(testCases.length > 0 ? { testCases } : {}),
    },
    validation: testCases.length > 0 ? { type: "tests", testCases } : undefined,
    feedback: toLayer1Feedback(activity),
    evidence: activity.evidence ? toEvidenceConfig(activity.evidence) : undefined,
  };
}

/** reflection → Layer 1 `reflection`, unchanged shape — V1 and Layer 1 use the same type name and a compatible content shape (both just need a prompt). */
function adaptReflection(activity: ActivityV1): ReflectionActivity {
  const content = activity.content as {
    prompt?: string;
    guidelines?: string[];
    sampleResponse?: string;
    minCharacters?: number;
  };
  return {
    id: activity.id,
    type: "reflection",
    intent: "reflection",
    objectiveIds: [],
    content: {
      prompt: content.prompt ?? activity.instruction ?? activity.title,
      guidelines: content.guidelines,
      sampleResponse: content.sampleResponse,
      minCharacters: content.minCharacters ?? 10,
    },
    feedback: toLayer1Feedback(activity),
    evidence: activity.evidence ? toEvidenceConfig(activity.evidence) : undefined,
  };
}

/** multiple-choice → Layer 1 `multiple-choice`, unchanged shape and type name. */
function adaptMultipleChoice(activity: ActivityV1): MultipleChoiceActivity {
  const content = activity.content as MultipleChoiceContentV1;
  const correctAnswer =
    typeof activity.validation?.correctAnswer === "string"
      ? activity.validation.correctAnswer
      : undefined;
  return {
    id: activity.id,
    type: "multiple-choice",
    intent: "understanding",
    objectiveIds: [],
    content: { question: content.question, options: content.options, layout: content.layout },
    validation: correctAnswer ? { type: "one-of", validOptions: [correctAnswer] } : undefined,
    feedback: toLayer1Feedback(activity),
    evidence: activity.evidence ? toEvidenceConfig(activity.evidence) : undefined,
  };
}

/** output-prediction → Layer 1 `output-prediction`, unchanged shape and type name. */
function adaptOutputPrediction(activity: ActivityV1): OutputPredictionActivity {
  const content = activity.content as OutputPredictionContentV1;
  const expected =
    typeof activity.validation?.expected === "string" ||
    typeof activity.validation?.expected === "number"
      ? activity.validation.expected
      : undefined;
  return {
    id: activity.id,
    type: "output-prediction",
    intent: "prediction",
    objectiveIds: [],
    content: {
      code: content.code,
      language: content.language,
      prompt: content.prompt,
      options: content.options,
    },
    validation: expected !== undefined ? { type: "exact-match", expected } : undefined,
    evidence: activity.evidence ? toEvidenceConfig(activity.evidence) : undefined,
  };
}

/** multi-select → Layer 1 `multi-select`, unchanged shape and type name. `validation.expected`/`ignoreOrder` are read defensively since no authored V1 example exists yet to confirm the exact authoring field names — see content-schemas.ts's doc note. */
function adaptMultiSelect(activity: ActivityV1): MultiSelectActivity {
  const content = activity.content as MultiSelectContentV1;
  const validation = activity.validation as
    { expected?: string[]; ignoreOrder?: boolean } | undefined;
  return {
    id: activity.id,
    type: "multi-select",
    intent: "understanding",
    objectiveIds: [],
    content: {
      question: content.question,
      options: content.options,
      minSelections: content.minSelections,
      maxSelections: content.maxSelections,
    },
    validation:
      validation?.expected && validation.expected.length > 0
        ? {
            type: "multi-match",
            expected: validation.expected,
            ignoreOrder: validation.ignoreOrder ?? true,
          }
        : undefined,
    evidence: activity.evidence ? toEvidenceConfig(activity.evidence) : undefined,
  };
}

/** ordering → Layer 1 `ordering`, unchanged shape and type name. */
function adaptOrdering(activity: ActivityV1): OrderingActivity {
  const content = activity.content as OrderingContentV1;
  const validation = activity.validation as { correctSequence?: string[] } | undefined;
  return {
    id: activity.id,
    type: "ordering",
    intent: "understanding",
    objectiveIds: [],
    content: { prompt: content.prompt, items: content.items },
    validation: validation?.correctSequence
      ? { type: "ordering", correctSequence: validation.correctSequence }
      : undefined,
    evidence: activity.evidence ? toEvidenceConfig(activity.evidence) : undefined,
  };
}

/** fill-blank → Layer 1 `fill-blank`, unchanged shape and type name. */
function adaptFillBlank(activity: ActivityV1): FillBlankActivity {
  const content = activity.content as FillBlankContentV1;
  const validation = activity.validation as
    { expected?: string; correctAnswer?: string; caseSensitive?: boolean } | undefined;
  const expected = validation?.expected ?? validation?.correctAnswer;
  const options = content.options ?? (content as any)?.tokenBank;
  return {
    id: activity.id,
    type: "fill-blank",
    intent: "retrieval",
    objectiveIds: [],
    content: {
      prompt: content.prompt,
      template: content.template,
      blanks: content.blanks,
      options,
    },
    validation:
      expected !== undefined
        ? {
            type: "exact-match",
            expected: String(expected),
            caseSensitive: validation?.caseSensitive,
          }
        : undefined,
    evidence: activity.evidence ? toEvidenceConfig(activity.evidence) : undefined,
  };
}

/** intro → Layer 1 `intro`, unchanged shape and type name. Non-graded — no validation config. */
function adaptIntro(activity: ActivityV1): IntroActivity {
  const content = activity.content as IntroContentV1;
  return {
    id: activity.id,
    type: "intro",
    intent: "orientation",
    objectiveIds: [],
    content: {
      title: content.title,
      hook: content.hook,
      context: content.context,
      goals: content.goals,
    },
  };
}

/** explanation → Layer 1 `explanation`, unchanged shape and type name. Non-graded. */
function adaptExplanation(activity: ActivityV1): ExplanationActivity {
  const content = activity.content as ExplanationContentV1;
  return {
    id: activity.id,
    type: "explanation",
    intent: "understanding",
    objectiveIds: [],
    content: { title: content.title, text: content.text, keyTakeaway: content.keyTakeaway },
  };
}

/** code-example → Layer 1 `code-example`, unchanged shape and type name. Non-graded. */
function adaptCodeExample(activity: ActivityV1): any {
  return {
    id: activity.id,
    type: "code-example",
    intent: "understanding",
    objectiveIds: [],
    content: activity.content,
  };
}

/** summary → Layer 1 `summary`, unchanged shape and type name. Non-graded. */
function adaptSummary(activity: ActivityV1): SummaryActivity {
  const content = activity.content as SummaryContentV1;
  return {
    id: activity.id,
    type: "summary",
    intent: "understanding",
    objectiveIds: [],
    content: { title: content.title, takeaways: content.takeaways, nextSteps: content.nextSteps },
  };
}

/** visual → Layer 1 `visual`, preserving interactive visual studio configuration when declared. */
function adaptVisual(activity: ActivityV1): VisualActivity {
  const content = activity.content as {
    title?: string;
    visualType?: VisualActivity["content"]["visualType"];
    description?: string;
    visualData?: Record<string, unknown>;
    interactive?: {
      kind: string;
      config?: Record<string, unknown>;
      caption?: string;
    };
  };
  return {
    id: activity.id,
    type: "visual",
    intent: "orientation",
    objectiveIds: [],
    content: {
      title: content.title ?? activity.title,
      visualType: content.visualType ?? (content.interactive ? "custom" : "diagram"),
      description: content.description ?? activity.instruction,
      visualData: content.visualData,
      ...(content.interactive ? { interactive: content.interactive } : {}),
    },
    evidence: activity.evidence ? toEvidenceConfig(activity.evidence) : undefined,
  };
}

/** completion → Layer 1 `completion`, unchanged shape and type name. In practice, V2's `LessonExperience` renders `ClosureSurface` directly from `learning.targetState` once the lesson finishes rather than dispatching to an authored `completion` activity (no golden-lesson activity uses this type) — this adapter exists for schema completeness / any future lesson that authors one explicitly. */
function adaptCompletion(activity: ActivityV1): CompletionActivity {
  const content = activity.content as { title?: string; message?: string };
  return {
    id: activity.id,
    type: "completion",
    intent: "reflection",
    objectiveIds: [],
    content: {
      title: content.title ?? activity.title,
      message: content.message ?? activity.instruction ?? "",
    },
  };
}

/** Inert Layer-1 placeholder for an investigation-`debug` activity — never rendered via `renderActivity`; exists only so session-engine/evidence-engine bookkeeping (which expects a structurally valid CanonicalActivity per ID) has something to key against. See module doc above. */
function adaptInvestigationPlaceholder(activity: ActivityV1): DebugActivity {
  return {
    id: activity.id,
    type: "debug",
    intent: "debugging",
    objectiveIds: [],
    content: {
      buggyCode: "// rendered by InvestigationDebugRenderer, not DebugRenderer",
      bugDescription: activity.instruction ?? activity.title,
      language: "javascript",
    },
    evidence: activity.evidence ? toEvidenceConfig(activity.evidence) : undefined,
  };
}

/**
 * Adapts every activity this slice supports and classifies how the player
 * should render it. An activity type with no adapter yet throws with a
 * clear message rather than silently producing a broken renderer — matches
 * the loader's "fail loud" stance, and keeps the registry honest about
 * what's actually supported today (16 of 17 types, as of the Activity Coverage phase — only code-modification remains).
 */
function adaptActivity(
  activity: ActivityV1,
  renderPlan: Record<string, V1ActivityRenderKind>,
): CanonicalActivity {
  switch (activity.type) {
    case "interactive-demo": {
      const content = activity.content as InteractiveDemoContentV1;
      renderPlan[activity.id] = content.systemComponent ? "delegate-layer1" : "generic-demo";
      return adaptInteractiveDemo(activity);
    }
    case "prediction":
      renderPlan[activity.id] = "prediction";
      return adaptPrediction(activity);
    case "interactive-code":
    case "code-modification":
      renderPlan[activity.id] = "delegate-layer1";
      return adaptInteractiveCode(activity);
    case "debug":
      renderPlan[activity.id] = "investigation";
      return adaptInvestigationPlaceholder(activity);
    case "reflection":
      renderPlan[activity.id] = "delegate-layer1";
      return adaptReflection(activity);
    case "multiple-choice":
      renderPlan[activity.id] = "delegate-layer1"; // wrapped by ChoiceCommitmentSurface at the presentation layer, not a distinct render kind
      return adaptMultipleChoice(activity);
    case "output-prediction":
      renderPlan[activity.id] = "delegate-layer1";
      return adaptOutputPrediction(activity);
    case "multi-select":
      renderPlan[activity.id] = "multi-select";
      return adaptMultiSelect(activity);
    case "ordering":
      renderPlan[activity.id] = "ordering";
      return adaptOrdering(activity);
    case "fill-blank":
      renderPlan[activity.id] = "fill-blank";
      return adaptFillBlank(activity);
    case "intro":
      renderPlan[activity.id] = "delegate-layer1";
      return adaptIntro(activity);
    case "explanation":
      renderPlan[activity.id] = "delegate-layer1";
      return adaptExplanation(activity);
    case "code-example":
      renderPlan[activity.id] = "delegate-layer1";
      return adaptCodeExample(activity);
    case "summary":
      renderPlan[activity.id] = "delegate-layer1";
      return adaptSummary(activity);
    case "visual":
      renderPlan[activity.id] = "delegate-layer1";
      return adaptVisual(activity);
    case "completion":
      renderPlan[activity.id] = "delegate-layer1";
      return adaptCompletion(activity);
    case "judgment": {
      const jContent = activity.content as {
        title?: string;
        prompt?: string;
        context?: string;
        scenario?: string;
        responsePlaceholder?: string;
        modelAnswer?: {
          summary: string;
          rationale?: string;
          detailedAnalysis?: string;
          keyTradeoffs?: string[];
        };
        evaluationRubric?: Array<{ id: string; label: string; description: string }>;
        takeaways?: string[];
      };
      if (jContent.modelAnswer && Array.isArray(jContent.evaluationRubric)) {
        renderPlan[activity.id] = "delegate-layer1";
        return {
          id: activity.id,
          type: "judgment",
          intent: "reflection",
          objectiveIds: [],
          content: {
            title: jContent.title ?? activity.title,
            prompt: jContent.prompt ?? jContent.scenario ?? activity.instruction ?? activity.title,
            context: jContent.context,
            responsePlaceholder: jContent.responsePlaceholder,
            modelAnswer: {
              summary: jContent.modelAnswer.summary,
              detailedAnalysis:
                jContent.modelAnswer.detailedAnalysis ??
                jContent.modelAnswer.rationale ??
                jContent.modelAnswer.summary,
              keyTradeoffs: jContent.modelAnswer.keyTradeoffs ?? [],
            },
            evaluationRubric: jContent.evaluationRubric,
            takeaways: jContent.takeaways,
          },
          evidence: activity.evidence ? toEvidenceConfig(activity.evidence) : undefined,
        } as unknown as CanonicalActivity;
      }
      renderPlan[activity.id] = "generic-demo";
      return adaptReflection(activity);
    }
    case "replicate-this": {
      renderPlan[activity.id] = "delegate-layer1";
      return {
        id: activity.id,
        type: "replicate-this",
        intent: "manipulation",
        objectiveIds: [],
        content: activity.content as any,
        validation: activity.validation as any,
        feedback: activity.feedback as any,
        evidence: activity.evidence ? toEvidenceConfig(activity.evidence) : undefined,
      };
    }
    default:
      throw new Error(
        `adaptLessonV1ToLayer1: no adapter registered for V1 activity type "${activity.type}" ` +
          `(activity "${activity.id}").`,
      );
  }
}

export function adaptLessonV1ToLayer1(lessonV1: CanonicalLessonV1): AdaptedLessonV1 {
  const renderPlan: Record<string, V1ActivityRenderKind> = {};
  const originalActivities: Record<string, ActivityV1> = {};
  for (const a of lessonV1.activities) originalActivities[a.id] = a;

  const activities = lessonV1.activities.map((a) => adaptActivity(a, renderPlan));

  const objectives: Objective[] = [
    toObjective(
      lessonV1.learning.primaryCapability.id,
      lessonV1.learning.primaryCapability.statement,
      "primary",
    ),
    ...(lessonV1.learning.secondaryCapabilities ?? []).map((c) =>
      toObjective(c.id, c.statement, "secondary"),
    ),
  ];

  const lesson: CanonicalLesson = {
    id: lessonV1.id,
    schemaVersion: lessonV1.schemaVersion,
    topicId: lessonV1.curriculum.topicId ?? lessonV1.curriculum.moduleId,
    phaseId: lessonV1.curriculum.phaseId,
    moduleId: lessonV1.curriculum.moduleId,
    title: lessonV1.identity.title,
    description: lessonV1.identity.description,
    lessonType: "instruction",
    difficulty: "Beginner",
    estimatedMinutes: lessonV1.identity.estimatedMinutes,
    conceptIds: lessonV1.curriculum.conceptIds,
    skillIds: [],
    capabilityIds: lessonV1.curriculum.capabilityIds,
    objectives,
    prerequisites: { lessonIds: lessonV1.curriculum.prerequisiteLessonIds },
    activities,
    completion: {
      requiredActivityIds: lessonV1.mastery.completionCriteria.requiredActivities,
      minimumScore: lessonV1.mastery.completionCriteria.minimumScore,
    },
  };

  return { lesson, renderPlan, originalActivities };
}
