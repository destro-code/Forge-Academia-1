import type { CanonicalActivity } from "@/lib/curriculum/types";
import type {
  ExperienceContext,
  ExperienceInterpretation,
  ExperienceMode,
  FocalSurface,
  SupportingSurface,
  SpatialMode,
  Density,
  ExperienceAction,
  ExperienceAssistance,
} from "./experience-types";

const INTERACTIVE_TYPES = new Set([
  "multiple-choice",
  "multi-select",
  "fill-blank",
  "ordering",
  "output-prediction",
  "interactive-code",
  "debug",
  "reflection",
  "judgment",
]);

/**
 * Extracts canonical hints from an activity definition without mutating state.
 */
function getCanonicalHints(activity: CanonicalActivity): string[] {
  if (activity.feedback?.hints && Array.isArray(activity.feedback.hints)) {
    return activity.feedback.hints.map((h) => (typeof h === "string" ? h : h.content));
  }
  if (
    activity.content &&
    "hints" in activity.content &&
    Array.isArray((activity.content as { hints?: unknown[] }).hints)
  ) {
    const rawHints = (activity.content as { hints?: unknown[] }).hints!;
    return rawHints.map((h) =>
      typeof h === "string" ? h : (h as { content?: string })?.content || String(h),
    );
  }
  return [];
}

/**
 * Resolves the baseline cognitive experience mode strictly from activity intent and type.
 */
function resolveBaseMode(activity: CanonicalActivity): ExperienceMode {
  if (activity.type === "completion") return "master";
  if (activity.type === "debug") return "debug";
  if (activity.type === "reflection") return "explain";
  if (activity.type === "intro") return "discover";

  switch (activity.intent) {
    case "orientation":
      return "discover";
    case "prediction":
      return "predict";
    case "recognition":
    case "understanding":
    case "retrieval":
      return "understand";
    case "modification":
      return "interact";
    case "application":
      return "practice";
    case "debugging":
      return "debug";
    case "reflection":
      return "explain";
    case "transfer":
      return activity.type === "debug" ? "debug" : "practice";
    case "assessment":
      return activity.type === "completion" ? "master" : "practice";
    default:
      if (activity.type === "visual") return "discover";
      if (activity.type === "interactive-code") return "interact";
      if (activity.type === "output-prediction") return "predict";
      if (activity.type === "summary" || activity.type === "explanation") return "understand";
      return "understand";
  }
}

/**
 * Identifies the primary focal surface commanding learner attention.
 */
function resolveFocalSurface(activity: CanonicalActivity): FocalSurface {
  switch (activity.type) {
    case "intro":
    case "visual":
    case "explanation":
    case "code-example":
    case "summary":
    case "completion":
      return "presentation";
    case "interactive-code":
    case "debug":
      return "editor";
    case "reflection":
      return "reconstruction";
    case "multiple-choice":
    case "multi-select":
    case "fill-blank":
    case "ordering":
    case "output-prediction":
    case "judgment":
    default:
      return "interaction";
  }
}

/**
 * Determines which supporting surfaces are contextually relevant.
 */
function resolveSupportingSurfaces(
  context: ExperienceContext,
  hints: string[],
): SupportingSurface[] {
  const surfaces: SupportingSurface[] = [];
  const { activity, activityState, evaluationResult, matchedMisconception } = context;

  // Evaluation surface
  const hasEvaluation = Boolean(
    evaluationResult ??
    activityState?.lastEvaluation ??
    (activityState?.status === "passed" || activityState?.status === "failed"),
  );
  if (hasEvaluation) {
    surfaces.push("evaluation");
  }

  // Misconception surface
  const hasMisconception = Boolean(
    matchedMisconception ||
    activityState?.lastEvaluation?.details?.misconception ||
    evaluationResult?.details?.misconception,
  );
  if (hasMisconception) {
    surfaces.push("misconception");
  }

  // Hint surface
  const hasRevealedHints = (activityState?.hintsRevealed ?? 0) > 0;
  if (hints.length > 0 && (hasRevealedHints || activityState?.status === "failed")) {
    surfaces.push("hint");
  }

  // Console surface for interactive-code and debug activities exposing output/console
  if (
    activity.type === "debug" ||
    (activity.type === "interactive-code" &&
      "experience" in activity &&
      Boolean(
        (activity as { experience?: { output?: { console?: boolean } } }).experience?.output
          ?.console,
      ))
  ) {
    surfaces.push("console");
  }

  // Model surface for explanation / mental model activities
  if (
    activity.intent === "understanding" ||
    activity.type === "explanation" ||
    activity.id.includes("model")
  ) {
    surfaces.push("model");
  }

  return surfaces;
}

/**
 * Determines layout spatial distribution profile.
 */
function resolveSpatialMode(activity: CanonicalActivity): SpatialMode {
  switch (activity.type) {
    case "interactive-code":
    case "debug":
      return "split";
    case "intro":
    case "explanation":
    case "summary":
    case "completion":
    case "reflection":
    case "visual":
    default:
      return "focused";
  }
}

/**
 * Determines presentation density tier.
 */
function resolveDensity(activity: CanonicalActivity): Density {
  switch (activity.type) {
    case "intro":
    case "explanation":
    case "reflection":
    case "completion":
    case "summary":
      return "spacious";
    case "debug":
    case "interactive-code":
      return "normal";
    default:
      return "normal";
  }
}

/**
 * Determines the authoritative interpretation of the primary forward action.
 */
function resolvePrimaryAction(
  context: ExperienceContext,
  isPassed: boolean,
  isFailed: boolean,
  isEvaluating: boolean,
  isLastActivity: boolean,
): ExperienceAction {
  const { activity, activityState } = context;
  const isInteractive = INTERACTIVE_TYPES.has(activity.type);

  // Non-interactive activities advance directly
  if (!isInteractive) {
    return {
      label: activity.type === "intro" ? "Explore" : isLastActivity ? "Set the skill" : "Continue",
      kind: "continue",
      intent: "advance",
      disabled: false,
    };
  }

  // Actively undergoing runtime or rule validation
  if (isEvaluating) {
    return {
      label: "Evaluating…",
      kind: "evaluating",
      intent: "submit",
      disabled: true,
      status: "evaluating",
    };
  }

  // Evaluation failed
  if (isFailed) {
    return {
      label: "Try again",
      kind: "retry",
      intent: "retry",
      disabled: false,
    };
  }

  // Evaluation passed
  if (isPassed) {
    return {
      label: isLastActivity ? "Set the skill" : "Continue",
      kind: "continue",
      intent: "advance",
      disabled: false,
    };
  }

  // Awaiting submission - compute meaningful label
  let label = "Check Answer";
  if (activity.intent === "prediction") {
    label = "Make your prediction";
  } else if (activity.type === "interactive-code") {
    label = "Run";
  } else if (activity.type === "debug") {
    label = "Investigate";
  }

  // Check response completeness for disabling submit button
  const response = activityState?.response;
  let disabled = false;
  if (response === undefined || response === null) {
    if (
      activity.type === "multiple-choice" ||
      activity.type === "multi-select" ||
      activity.type === "fill-blank" ||
      activity.type === "reflection"
    ) {
      disabled = true;
    }
  } else if (typeof response === "string" && response.trim().length === 0) {
    disabled = true;
  } else if (Array.isArray(response) && response.length === 0) {
    disabled = true;
  }

  return {
    label,
    kind: "primary",
    intent: "submit",
    disabled,
  };
}

/**
 * Pure, deterministic Experience Interpreter.
 *
 * Translates existing canonical lesson/activity state into presentation metadata.
 * Does NOT own state, mutate data, persist, or execute runtime logic.
 */
export function interpretExperience(context: ExperienceContext): ExperienceInterpretation {
  const { activity, activityState, evaluationResult, lesson } = context;

  // Evaluation outcome resolution
  const evaluation = evaluationResult ?? activityState?.lastEvaluation;
  const isFailed =
    (evaluation !== null && evaluation !== undefined && !evaluation.isValid) ||
    activityState?.status === "failed";
  const isPassed =
    (evaluation !== null && evaluation !== undefined && evaluation.isValid) ||
    activityState?.status === "passed" ||
    activityState?.status === "completed";
  const isEvaluating = activityState?.status === "evaluating";

  // Mode derivation
  let mode = resolveBaseMode(activity);
  if (isFailed) {
    if (
      mode === "interact" ||
      mode === "practice" ||
      mode === "predict" ||
      mode === "challenge" ||
      mode === "debug"
    ) {
      mode = "debug";
    }
  } else if (isPassed) {
    if (activity.type === "completion") {
      mode = "master";
    } else if (mode === "predict") {
      mode = "understand";
    }
  }

  // Surface and spatial resolutions
  const focalSurface = resolveFocalSurface(activity);
  const hints = getCanonicalHints(activity);
  const supportingSurfaces = resolveSupportingSurfaces(context, hints);
  const spatialMode = resolveSpatialMode(activity);
  const density = resolveDensity(activity);

  // Forward action determination
  const isLastActivity =
    lesson.activities.length > 0 &&
    activity.id === lesson.activities[lesson.activities.length - 1]?.id;
  const primaryAction = resolvePrimaryAction(
    context,
    isPassed,
    isFailed,
    isEvaluating,
    isLastActivity,
  );

  // Assistance determination
  const hintsAvailable = hints.length;
  const hasHints = hintsAvailable > 0;
  const hintsRevealed = Math.min(activityState?.hintsRevealed ?? 0, hintsAvailable);
  const activeHint = hintsRevealed > 0 ? hints[hintsRevealed - 1] : undefined;
  const matchedMisconception =
    context.matchedMisconception ??
    (typeof evaluation?.details?.misconception === "string"
      ? (evaluation.details.misconception as string)
      : null);

  const assistance: ExperienceAssistance = {
    hasHints,
    hintsAvailable,
    hintsRevealed,
    activeHint,
    matchedMisconception,
    requiresRetry: isFailed,
    recoveryGuidance: isFailed
      ? (evaluation?.feedbackMessage ??
        activity.feedback?.incorrect ??
        "Examine the browser evidence carefully and adjust your hypothesis before trying again.")
      : undefined,
  };

  // Headline and prompt
  const headline =
    activity.content && "title" in activity.content && typeof activity.content.title === "string"
      ? activity.content.title
      : undefined;

  let prompt: string | undefined;
  if (activity.content) {
    if ("prompt" in activity.content && typeof activity.content.prompt === "string") {
      prompt = activity.content.prompt;
    } else if ("question" in activity.content && typeof activity.content.question === "string") {
      prompt = activity.content.question;
    } else if ("hook" in activity.content && typeof activity.content.hook === "string") {
      prompt = activity.content.hook;
    }
  }

  // Display badge text
  const badgeTextMap: Record<ExperienceMode, string> = {
    discover: "Discovery",
    understand: "Mental Model",
    interact: "Live System",
    predict: "Prediction",
    practice: "Application",
    challenge: "Challenge",
    debug: "Investigation",
    explain: "Explanation",
    master: "Mastery",
  };
  const badgeText = badgeTextMap[mode];

  // Cognitive tone
  let tone: ExperienceInterpretation["tone"] = "neutral";
  if (isPassed && mode === "master") {
    tone = "celebratory";
  } else if (isFailed || mode === "debug") {
    tone = "investigative";
  } else if (mode === "predict") {
    tone = "investigative";
  } else if (mode === "explain" || mode === "challenge" || mode === "practice") {
    tone = "rigorous";
  } else if (isPassed) {
    tone = "encouraging";
  } else {
    tone = "neutral";
  }

  return {
    mode,
    focalSurface,
    supportingSurfaces,
    spatialMode,
    density,
    primaryAction,
    assistance,
    headline,
    prompt,
    badgeText,
    tone,
  };
}
