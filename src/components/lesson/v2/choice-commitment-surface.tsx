import type { ReactNode } from "react";
import type {
  ActivityInteractionStatus,
  ActivityValidationResult,
} from "@/components/lesson/canonical/types";

export interface ChoiceCommitmentSurfaceProps {
  /** The delegated CanonicalActivityView rendering Layer 1's own multiple-choice/output-prediction renderer — the choice UI and inline ActivityFeedback are rendered once inside the question card. */
  children: ReactNode;
  status?: ActivityInteractionStatus;
  chosenSummary?: string | undefined;
  validationResult?: ActivityValidationResult;
}

/**
 * Presentation family: Commitment (multiple-choice / output-prediction).
 * Delegates directly to Layer 1's `MultipleChoiceRenderer` / `OutputPredictionRenderer`
 * which already highlight the selected option and render inline `ActivityFeedback`
 * once directly beneath the options list.
 */
export function ChoiceCommitmentSurface({ children }: ChoiceCommitmentSurfaceProps) {
  return (
    <div className="space-y-4 pt-6" data-testid="choice-commitment-surface">
      {children}
    </div>
  );
}
