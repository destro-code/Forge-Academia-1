import { useState } from "react";
import { Search } from "lucide-react";
import { MechanismInspector } from "@/components/lesson/canonical/primitives/mechanism-inspector";
import { EvidenceSurface, type EvidenceItem } from "@/components/lesson/canonical/primitives/evidence-surface";
import type { DebugContentV1 } from "@/lib/curriculum/v1/content-schemas";
import type { V1ActivityRendererProps } from "./types";

export interface InvestigationResponse {
  inspectedElement: string;
}

export interface InvestigationDebugRendererProps
  extends V1ActivityRendererProps<InvestigationResponse> {
  title: string;
  instruction?: string;
  content: DebugContentV1;
}

/**
 * V1's `debug` activity type, investigation-only variant (see
 * FORGE_LAYER2_DESTINATION_AUDIT.md §3.B / the adapter's module doc for why
 * this can't reuse Layer 1's DebugRenderer). Implements the observation half
 * of Symptom → Reproduce → Evidence → Hypothesis → Test → Fix → Verify →
 * Explain — the fix itself is a separate, later `interactive-code` activity,
 * per the golden lesson's own structure and the task's explicit instruction
 * not to collapse the two back together.
 *
 * The learner inspects a named target and is shown the declared inspection
 * fields as evidence; recording the inspection is the "response" the V1
 * player's footer then validates against the activity's `expectedState`.
 */
export function InvestigationDebugRenderer({
  state,
  onResponse,
  readOnly,
  title,
  instruction,
  content,
}: InvestigationDebugRendererProps) {
  const [hasInspected, setHasInspected] = useState(Boolean(state.response));

  const evidenceItems: EvidenceItem[] = content.inspectionFields.map((field) => ({
    id: field,
    label: field,
    // Deliberately factual/observational rather than diagnostic — the
    // learner still has to form their own hypothesis from these facts, not
    // be handed a conclusion (task Step 5: "Do not silently... reveal the
    // solution").
    value: `Observed on ${content.targetElement}`,
  }));

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-lesson-text-primary">{title}</h2>
        {instruction && <p className="text-sm text-lesson-text-secondary">{instruction}</p>}
      </div>

      <MechanismInspector
        title="Inspect the target"
        target={<code className="font-mono">{content.targetElement}</code>}
        observed={hasInspected ? content.inspectionFields : []}
        evidence={
          hasInspected
            ? "Gather what you can observe here before forming a diagnosis."
            : "Not yet inspected."
        }
      />

      {!hasInspected && (
        <button
          type="button"
          disabled={readOnly}
          onClick={() => {
            setHasInspected(true);
            onResponse({ inspectedElement: content.targetElement });
          }}
          className="flex min-h-[44px] items-center gap-2 rounded-lg border border-lesson-border bg-lesson-surface px-4 py-2 text-xs font-medium text-lesson-text-secondary transition-colors hover:border-lesson-border/80 hover:text-lesson-text disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Inspect {content.targetElement}</span>
        </button>
      )}

      {hasInspected && <EvidenceSurface title="Evidence gathered" items={evidenceItems} />}
    </div>
  );
}
