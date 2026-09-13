import { useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EvidenceStripProps {
  targetElement: string;
  fields: string[];
  className?: string;
}

/**
 * "Previously discovered evidence remains useful" — the collapsed, carried-
 * forward form of an earlier investigation's findings, shown above the code
 * workspace (FORGE_LESSON_PLAYER_V2_EXPERIENCE_SPEC.md §5/§6). Collapsed by
 * default so it doesn't compete with the editor; expandable for a learner
 * who wants to re-check what they found.
 */
export function EvidenceStrip({ targetElement, fields, className }: EvidenceStripProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={cn("rounded-lg border border-lesson-border/60 bg-lesson-surface-subtle", className)}
      data-testid="evidence-strip"
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex min-h-9 w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs font-medium text-lesson-text-secondary"
        aria-expanded={expanded}
      >
        <span className="flex items-center gap-2">
          <Search className="h-3.5 w-3.5" />
          Evidence from your investigation of <code className="font-mono">{targetElement}</code>
        </span>
        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>
      {expanded && (
        <ul className="space-y-1 border-t border-lesson-border/60 px-3 py-2 font-mono text-xs text-lesson-text-secondary">
          {fields.map((field) => (
            <li key={field}>• {field}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
