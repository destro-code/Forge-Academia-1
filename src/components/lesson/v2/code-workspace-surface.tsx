import type { ReactNode } from "react";
import { EvidenceStrip } from "./evidence-strip";

export interface CodeWorkspaceSurfaceProps {
  /** The delegated, unmodified CanonicalActivityView rendering the real interactive-code activity (real sandbox execution — reused, never rebuilt). */
  children: ReactNode;
  /** Set when a prior investigation activity in this lesson produced evidence worth carrying forward — see EvidenceStrip's doc. */
  carriedEvidence?: { targetElement: string; fields: string[] };
}

/**
 * Presentation family: Code Workspace. Deliberately thin — per the task's
 * explicit instruction ("do not rebuild code execution"), this component
 * owns none of the editor, sandbox, or test-result behavior; it exists only
 * to place the carried-forward evidence strip above the real, unmodified
 * interactive-code activity, implementing "previously discovered evidence
 * remains accessible" without touching the sandbox runtime at all.
 */
export function CodeWorkspaceSurface({ children, carriedEvidence }: CodeWorkspaceSurfaceProps) {
  return (
    <div className="space-y-3" data-testid="code-workspace-surface">
      {carriedEvidence && (
        <EvidenceStrip targetElement={carriedEvidence.targetElement} fields={carriedEvidence.fields} />
      )}
      {children}
    </div>
  );
}
