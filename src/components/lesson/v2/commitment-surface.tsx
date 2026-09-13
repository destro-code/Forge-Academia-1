import { PredictionRenderer } from "@/components/lesson/v1/prediction-renderer";
import { ComparisonPanel } from "./comparison-panel";
import type { PredictionContentV1 } from "@/lib/curriculum/v1/content-schemas";
import type { ActivityInteractionStatus, ActivityValidationResult } from "@/components/lesson/canonical/types";

export interface CommitmentSurfaceProps {
  title: string;
  instruction?: string;
  content: PredictionContentV1;
  status: ActivityInteractionStatus;
  response: string | undefined;
  onResponse: (response: string) => void;
  validationResult?: ActivityValidationResult;
  readOnly?: boolean;
}

/**
 * Implements FORGE_LESSON_PLAYER_V2_EXPERIENCE_SPEC.md §3: stimulus →
 * selection → commitment → consequence → explanation, with the original
 * prediction staying visible. The selection UI is the vertical slice's
 * proven `PredictionRenderer` (reused unchanged, not rebuilt); this surface
 * adds the outcome comparison panel the vertical slice didn't have, per the
 * "compare, don't judge" signature moment — the option list stays on
 * screen (PredictionRenderer already locks rather than hides it) while the
 * comparison appears alongside/below it once the answer is checked.
 */
export function CommitmentSurface({
  title,
  instruction,
  content,
  status,
  response,
  onResponse,
  validationResult,
  readOnly,
}: CommitmentSurfaceProps) {
  const isResolved = status === "correct" || status === "incorrect" || status === "completed";
  const chosenOption = content.options.find((o) => o.id === response);

  return (
    <div className="space-y-4" data-testid="commitment-surface">
      <PredictionRenderer
        title={title}
        instruction={instruction}
        content={content}
        state={{ status, response }}
        onResponse={onResponse}
        readOnly={readOnly || isResolved}
      />
      {isResolved && chosenOption && (
        <ComparisonPanel
          expectedLabel="You predicted"
          expected={chosenOption.text}
          actualLabel="What actually happened"
          actual={validationResult?.feedbackMessage ?? (status === "correct" ? "That's exactly it." : "Something else was going on.")}
          tone={status === "incorrect" ? "warning" : "success"}
        />
      )}
    </div>
  );
}
