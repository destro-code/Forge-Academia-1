import type { CanonicalActivity, CanonicalLesson } from "@/lib/curriculum/types";
import type {
  ActivitySessionState,
  LessonSessionState,
  ActivityEvaluationResult,
} from "@/lib/learning-engine/types";

/**
 * Forge Cognitive Experience Modes.
 *
 * Maps directly to the instructional moments in the Forge learning loop:
 * Discover → Understand → Interact → Predict → Practice → Challenge → Debug → Explain → Master
 */
export type ExperienceMode =
  | "discover"
  | "understand"
  | "interact"
  | "predict"
  | "practice"
  | "challenge"
  | "debug"
  | "explain"
  | "master";

/**
 * The primary active learning surface on the viewport.
 */
export type FocalSurface =
  | "presentation"
  | "editor"
  | "preview"
  | "inspection"
  | "terminal"
  | "interaction"
  | "reconstruction";

/**
 * Supplementary information surfaces accompanying the focal surface.
 */
export type SupportingSurface =
  "hint" | "misconception" | "evaluation" | "inspector" | "console" | "model";

/**
 * Layout arrangement profile for the presentation layer.
 */
export type SpatialMode = "focused" | "split" | "stacked" | "ambient";

/**
 * Information density tier.
 */
export type Density = "compact" | "normal" | "spacious";

/**
 * Authoritative interpretation of the primary forward action.
 */
export interface ExperienceAction {
  label: string;
  kind: "primary" | "secondary" | "continue" | "retry" | "evaluating";
  intent: "advance" | "submit" | "retry" | "inspect";
  disabled: boolean;
  status?: string;
}

/**
 * Scaffolding and remedial assistance state derived from canonical evaluation and session state.
 */
export interface ExperienceAssistance {
  hasHints: boolean;
  hintsAvailable: number;
  hintsRevealed: number;
  activeHint?: string;
  matchedMisconception?: string | null;
  requiresRetry: boolean;
  recoveryGuidance?: string;
}

/**
 * Context input to the pure Experience Interpreter.
 * The interpreter reads this input deterministically with zero side effects.
 */
export interface ExperienceContext {
  lesson: CanonicalLesson;
  activity: CanonicalActivity;
  activityState?: ActivitySessionState;
  lessonState?: LessonSessionState;
  evaluationResult?: ActivityEvaluationResult | null;
  matchedMisconception?: string | null;
}

/**
 * Deterministic presentation-layer interpretation output.
 * Guides how CanonicalActivityView and the player frame should be experienced.
 */
export interface ExperienceInterpretation {
  mode: ExperienceMode;
  focalSurface: FocalSurface;
  supportingSurfaces: SupportingSurface[];
  spatialMode: SpatialMode;
  density: Density;
  primaryAction: ExperienceAction;
  assistance: ExperienceAssistance;
  headline?: string;
  prompt?: string;
  badgeText?: string;
  tone?: "neutral" | "investigative" | "rigorous" | "encouraging" | "celebratory";
}
