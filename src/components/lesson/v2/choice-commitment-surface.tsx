import type { ReactNode } from "react";
import { ComparisonPanel } from "./comparison-panel";
import type { ActivityInteractionStatus, ActivityValidationResult } from "@/components/lesson/canonical/types";

export interface ChoiceCommitmentSurfaceProps {
  /** The delegated, unmodified CanonicalActivityView rendering Layer 1's own multiple-choice/output-prediction renderer — the actual choice UI is reused as-is (it's already well-built); this surface only adds the outcome comparison. */
  children: ReactNode;
  status: ActivityInteractionStatus;
  /** Precomputed by ActivityStage from the response + the activity's own option/prompt content — kept out of this component so it stays presentation-only, not response-shape-aware. */
  chosenSummary: string | undefined;
  validationResult?: ActivityValidationResult;
}

/**
 * Presentation family: Commitment (multiple-choice / output-prediction
 * half). Extends the family beyond `prediction` per
 * FORGE_LESSON_PLAYER_V2_IMPLEMENTATION_REPORT §6 — same "compare, don't
 * judge" outcome idiom as `CommitmentSurface`/`InvestigationSurface`, but
 * built around delegation rather than a bespoke selection UI, since Layer
 * 1's `MultipleChoiceRenderer`/`OutputPredictionRenderer` are already
 * correct and shouldn't be duplicated (task §3/§6: "reuse behavior before
 * rewriting behavior").
 */
export function ChoiceCommitmentSurface({ children, status, chosenSummary, validationResult }: ChoiceCommitmentSurfaceProps) {
  const isResolved = status === "correct" || status === "incorrect" || status === "completed";
  return (
    <div className="space-y-4" data-testid="choice-commitment-surface">
      {children}
      {isResolved && chosenSummary && (
        <ComparisonPanel
          expectedLabel="You chose"
          expected={chosenSummary}
          actualLabel="Result"
          actual={validationResult?.feedbackMessage ?? (status === "correct" ? "That's it." : "Not quite.")}
          tone={status === "incorrect" ? "warning" : "success"}
        />
      )}
    </div>
  );
}
