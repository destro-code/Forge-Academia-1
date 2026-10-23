import { useState } from "react";
import { CheckCircle2, Search } from "lucide-react";
import { MechanismInspector } from "@/components/lesson/canonical/primitives/mechanism-inspector";
import {
  EvidenceSurface,
  type EvidenceItem,
} from "@/components/lesson/canonical/primitives/evidence-surface";
import type { DebugContentV1 } from "@/lib/curriculum/v1/content-schemas";
import type { V1ActivityRendererProps } from "./types";
import { cn } from "@/lib/utils";

export interface InvestigationResponse {
  inspectedElement: string;
  selectedEvidenceField?: string;
}

export interface InvestigationDebugRendererProps extends V1ActivityRendererProps<InvestigationResponse> {
  title: string;
  instruction?: string;
  content: DebugContentV1;
}

/**
 * V1's `debug` activity type, investigation-only variant.
 * Step 1: Click to inspect the target element and reveal its runtime inspection fields.
 * Step 2: Select the observed evidence field you want to record for your hypothesis,
 * which unlocks the Check Answer button.
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
  const [selectedField, setSelectedField] = useState<string | undefined>(
    state.response?.selectedEvidenceField,
  );

  const evidenceItems: EvidenceItem[] = content.inspectionFields.map((field) => ({
    id: field,
    label: field,
    value: `Observed on ${content.targetElement}`,
  }));

  const handleSelectField = (field: string) => {
    if (readOnly) return;
    setSelectedField(field);
    onResponse({
      inspectedElement: content.targetElement,
      selectedEvidenceField: field,
    });
  };

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
            ? selectedField
              ? `Logged primary evidence field: ${selectedField}`
              : "Now select the primary evidence field below to record your observation."
            : "Click Inspect below to gather runtime evidence on the target."
        }
      />

      {!hasInspected && (
        <button
          type="button"
          disabled={readOnly}
          onClick={() => {
            setHasInspected(true);
            if (content.inspectionFields.length === 0) {
              onResponse({ inspectedElement: content.targetElement });
            }
          }}
          className="flex min-h-[44px] items-center gap-2 rounded-lg border border-lesson-border bg-lesson-surface px-4 py-2 text-xs font-medium text-lesson-text-secondary transition-colors hover:border-lesson-border/80 hover:text-lesson-text disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Step 1: Inspect {content.targetElement}</span>
        </button>
      )}

      {hasInspected && (
        <div className="space-y-3">
          <EvidenceSurface title="Evidence gathered" items={evidenceItems} />
          {content.inspectionFields.length > 0 && (
            <div className="rounded-xl border border-lesson-border bg-lesson-surface p-4 space-y-2.5">
              <p className="text-xs font-semibold text-lesson-text-primary">
                Step 2: Select the primary evidence field to log for your diagnosis:
              </p>
              <div className="flex flex-wrap gap-2">
                {content.inspectionFields.map((field) => {
                  const isChosen = selectedField === field;
                  return (
                    <button
                      key={field}
                      type="button"
                      disabled={readOnly}
                      onClick={() => handleSelectField(field)}
                      className={cn(
                        "inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-xs font-semibold transition-colors",
                        isChosen
                          ? "border-lesson-accent bg-lesson-accent/15 text-lesson-text-primary"
                          : "border-lesson-border bg-lesson-surface-subtle text-lesson-text-secondary hover:border-lesson-accent/60 hover:text-lesson-text-primary",
                      )}
                    >
                      {isChosen && <CheckCircle2 className="h-3.5 w-3.5 text-lesson-accent" />}
                      <span>{field}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
