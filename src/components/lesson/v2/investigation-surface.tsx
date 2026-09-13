import { InvestigationDebugRenderer, type InvestigationResponse } from "@/components/lesson/v1/investigation-debug-renderer";
import { ComparisonPanel } from "./comparison-panel";
import type { DebugContentV1 } from "@/lib/curriculum/v1/content-schemas";
import type { ActivityInteractionStatus, ActivityValidationResult } from "@/components/lesson/canonical/types";

export interface InvestigationSurfaceProps {
  title: string;
  instruction?: string;
  content: DebugContentV1;
  status: ActivityInteractionStatus;
  response: InvestigationResponse | undefined;
  onResponse: (response: InvestigationResponse) => void;
  validationResult?: ActivityValidationResult;
  readOnly?: boolean;
}

/**
 * Implements the "Evidence" and "Hypothesis" beats of
 * FORGE_LESSON_PLAYER_V2_EXPERIENCE_SPEC.md §6's Symptom → Reproduce →
 * Evidence → Hypothesis → Test → Fix → Verify progression (Test/Fix/Verify
 * hand off to the code-workspace and system surfaces — this component only
 * owns the investigation beat itself). Built on the vertical slice's
 * `InvestigationDebugRenderer` (reused unchanged); adds the same
 * "compare, don't judge" outcome panel the commitment surface uses, so the
 * two graded, evidence-driven activity families share one outcome idiom.
 */
export function InvestigationSurface({
  title,
  instruction,
  content,
  status,
  response,
  onResponse,
  validationResult,
  readOnly,
}: InvestigationSurfaceProps) {
  const isResolved = status === "correct" || status === "incorrect" || status === "completed";

  return (
    <div className="space-y-4" data-testid="investigation-surface">
      <InvestigationDebugRenderer
        title={title}
        instruction={instruction}
        content={content}
        state={{ status, response }}
        onResponse={onResponse}
        readOnly={readOnly || isResolved}
      />
      {isResolved && response && (
        <ComparisonPanel
          expectedLabel="You inspected"
          expected={response.inspectedElement}
          actualLabel="Was that the right target?"
          actual={
            validationResult?.feedbackMessage ??
            (status === "incorrect" ? "That's not where the symptom points — look again." : "That's the right target.")
          }
          tone={status === "incorrect" ? "warning" : "success"}
        />
      )}
    </div>
  );
}
