import { useState, useId } from "react";
import { cn } from "@/lib/utils";
import type { EvaluationResult } from "@/lib/curriculum/replication/types";
import {
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Layers,
  Palette,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

export interface DiagnosticChecklistProps {
  results: EvaluationResult[];
  isSubmitted: boolean;
  className?: string;
}

const CATEGORY_META = {
  structure: {
    label: "Structure",
    icon: Layers,
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
  style: {
    label: "Style",
    icon: Palette,
    color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  },
  engineering: {
    label: "Engineering",
    icon: ShieldAlert,
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
};

/**
 * Formats feedback text containing selectors or HTML tags in inline code badges.
 */
function FormattedFeedbackText({ text }: { text: string }) {
  // Regex to match code elements like <tag>, "selector", or `.class`
  const parts = text.split(/(<[^>]+>|"[^"]+"|\.[a-zA-Z0-9_-]+|#[a-zA-Z0-9_-]+)/g);

  return (
    <span>
      {parts.map((part, index) => {
        if (
          (part.startsWith("<") && part.endsWith(">")) ||
          (part.startsWith('"') && part.endsWith('"')) ||
          part.startsWith(".") ||
          part.startsWith("#")
        ) {
          return (
            <code
              key={index}
              className="px-1 py-0.5 mx-0.5 rounded bg-muted/80 border border-border/60 text-foreground font-mono text-[11px]"
            >
              {part}
            </code>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}

export function DiagnosticChecklist({ results, isSubmitted, className }: DiagnosticChecklistProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const checklistId = useId();

  const totalCount = results.length;
  const passedCount = results.filter((r) => r.passed).length;
  const allPassed = totalCount > 0 && passedCount === totalCount;

  if (totalCount === 0) {
    return null;
  }

  return (
    <div
      id={`diagnostic-checklist-${checklistId}`}
      className={cn(
        "w-full rounded-xl border border-border bg-card overflow-hidden shadow-sm transition-all duration-200",
        className,
      )}
    >
      {/* Tray Header */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full px-4 py-3 bg-muted/30 hover:bg-muted/50 flex items-center justify-between gap-3 text-left transition-colors border-b border-border/60"
        aria-expanded={isExpanded}
        aria-controls={`diagnostic-content-${checklistId}`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold",
              isSubmitted
                ? allPassed
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "bg-muted text-muted-foreground border border-border",
            )}
          >
            {isSubmitted ? (
              allPassed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <XCircle className="w-4 h-4 text-amber-400" />
              )
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-wide text-foreground uppercase">
              Diagnostic Invariants
            </h4>
            <p className="text-[11px] text-muted-foreground">
              {isSubmitted
                ? `${passedCount} of ${totalCount} requirements satisfied`
                : `${totalCount} invariants to replicate`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSubmitted && (
            <span
              className={cn(
                "px-2 py-0.5 text-[11px] font-mono font-medium rounded border",
                allPassed
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/20",
              )}
            >
              {Math.round((passedCount / totalCount) * 100)}%
            </span>
          )}

          <div className="text-muted-foreground p-1 rounded hover:bg-background/40">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {/* Expandable Checklist Content */}
      {isExpanded && (
        <div
          id={`diagnostic-content-${checklistId}`}
          className="divide-y divide-border/60 max-h-[360px] overflow-y-auto"
        >
          {results.map((result) => {
            const meta = CATEGORY_META[result.category] || CATEGORY_META.structure;
            const CategoryIcon = meta.icon;

            return (
              <div
                key={result.ruleId}
                className={cn(
                  "p-3.5 flex items-start gap-3 transition-colors",
                  isSubmitted
                    ? result.passed
                      ? "bg-card hover:bg-muted/20"
                      : "bg-amber-950/10 hover:bg-amber-950/20"
                    : "bg-card hover:bg-muted/20",
                )}
              >
                {/* Status Indicator Icon */}
                <div className="mt-0.5 flex-shrink-0">
                  {isSubmitted ? (
                    result.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-amber-400" />
                    )
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-dashed border-muted-foreground/60" />
                  )}
                </div>

                {/* Rule Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border",
                        meta.color,
                      )}
                    >
                      <CategoryIcon className="w-3 h-3" />
                      {meta.label}
                    </span>
                    <span className="text-xs font-medium text-foreground">
                      <FormattedFeedbackText text={result.description} />
                    </span>
                  </div>

                  {/* Feedback line when evaluated */}
                  {isSubmitted && (
                    <div
                      className={cn(
                        "text-[12px] leading-relaxed mt-1 font-sans",
                        result.passed ? "text-muted-foreground" : "text-amber-300",
                      )}
                    >
                      <FormattedFeedbackText text={result.feedback} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
