import type { ReactNode } from "react";
import { Code2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Data structure representing a discrete mechanism inspection.
 * Contains factual observations discovered by inspecting a system component or mechanism.
 */
export interface MechanismInspection {
  /** The specific mechanism, component, or system path being inspected */
  target: ReactNode;
  /** Observable facts discovered during inspection */
  observed: ReactNode[];
  /** Factual evidence statement summarizing what the mechanism does */
  evidence: ReactNode;
}

/**
 * Properties for the reusable MechanismInspector presentation primitive.
 */
export interface MechanismInspectorProps {
  /** Optional DOM element ID */
  id?: string;
  /** Surface heading text. Defaults to "MECHANISM INSPECTION". Pass null to hide. */
  title?: ReactNode;
  /** Leading icon displayed beside the heading. Defaults to Code2. Pass null to hide. */
  icon?: ReactNode;
  /** Target mechanism or system path being inspected */
  target: ReactNode;
  /** List of observed factual statements or properties */
  observed: ReactNode[];
  /** Factual evidence statement */
  evidence: ReactNode;
  /** Optional label prefix for the target. Defaults to "What you inspected: " */
  targetLabel?: ReactNode;
  /** Optional label prefix for observations. Defaults to "Observed:" */
  observedLabel?: ReactNode;
  /** Optional label prefix for evidence. Defaults to "Evidence: " */
  evidenceLabel?: ReactNode;
  /** Optional density variant. Defaults to "normal". */
  density?: "compact" | "normal" | "spacious";
  /** Optional additional CSS classes */
  className?: string;
  /** Test identifier. Defaults to "mechanism-inspection-result-surface". */
  "data-testid"?: string;
}

/**
 * MechanismInspector
 *
 * A reusable, purely presentational canonical Lesson Player primitive.
 * Displays factual target, observed properties, and evidence revealed during a mechanism investigation.
 *
 * Architectural Boundaries:
 * - Pure presentation: Does NOT determine root causes, diagnose bugs, evaluate correctness,
 *   manage session state, persist evidence, or advance progression.
 * - Deterministic: Render output is strictly a function of the provided props.
 * - Decoupled: Agnostic to the specific domain or lesson being taught.
 */
export function MechanismInspector({
  id,
  title = "MECHANISM INSPECTION",
  icon,
  target,
  observed,
  evidence,
  targetLabel = "What you inspected: ",
  observedLabel = "Observed:",
  evidenceLabel = "Evidence: ",
  density = "normal",
  className,
  "data-testid": testId = "mechanism-inspection-result-surface",
}: MechanismInspectorProps) {
  // If no content is provided, do not render an empty container
  if (!target && (!observed || observed.length === 0) && !evidence) {
    return null;
  }

  const densityPadding = {
    compact: "p-2 text-xs",
    normal: "p-3 text-xs",
    spacious: "p-4 text-sm",
  }[density];

  // Default icon is Code2 unless explicitly specified (or passed as null)
  const renderedIcon =
    icon === undefined ? <Code2 className="h-3.5 w-3.5 text-amber-400/90" /> : icon;

  return (
    <div
      id={id}
      data-testid={testId}
      className={cn(
        "space-y-2 rounded-lg border border-amber-400/50 bg-amber-400/5 transition-all",
        densityPadding,
        className,
      )}
    >
      {(title !== null || renderedIcon !== null) && (
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-lesson-text">
          {renderedIcon}
          {title !== null && <span>{title}</span>}
        </div>
      )}

      <div className="space-y-2 text-[11px] leading-relaxed">
        {target && (
          <div>
            <span className="font-semibold text-lesson-text">{targetLabel}</span>
            <span data-testid="mechanism-inspection-target" className="text-lesson-text-muted">
              {target}
            </span>
          </div>
        )}

        {observed && observed.length > 0 && (
          <div className="space-y-1">
            <span className="font-semibold text-lesson-text">{observedLabel}</span>
            <ul
              data-testid="mechanism-inspection-observed-list"
              className="list-disc pl-4 space-y-0.5 text-lesson-text-muted font-mono text-[10.5px]"
            >
              {observed.map((obs, idx) => (
                <li key={idx}>{obs}</li>
              ))}
            </ul>
          </div>
        )}

        {evidence && (
          <div>
            <span className="font-semibold text-lesson-text">{evidenceLabel}</span>
            <span data-testid="mechanism-inspection-evidence" className="text-lesson-text-muted">
              {evidence}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
