import { cn } from "@/lib/utils";

export interface ComparisonPanelProps {
  /** What the learner committed to — always shown, never cleared, per the "compare, don't judge" signature moment. */
  expectedLabel: string;
  expected: string;
  /** What was actually observed/happened. */
  actualLabel: string;
  actual: string;
  /** Short mechanism line — why the gap exists. Optional; not every miss needs one immediately. */
  mechanism?: string;
  tone: "neutral" | "success" | "warning";
  className?: string;
}

const TONE_CLASSES: Record<ComparisonPanelProps["tone"], string> = {
  neutral: "border-lesson-border bg-lesson-surface",
  success: "border-lesson-success-border bg-lesson-success-bg",
  warning: "border-lesson-warning-border bg-lesson-warning-bg",
};

/**
 * "Compare, don't judge" — one of the five signature Forge moments
 * (FORGE_LESSON_PLAYER_V2_EXPERIENCE_SPEC.md, Signature Moments #2). Used by
 * both the commitment surface (prediction outcomes) and the investigation
 * surface (evidence vs. hypothesis) — a single shared layout rather than a
 * bespoke "results" component per activity family.
 */
export function ComparisonPanel({
  expectedLabel,
  expected,
  actualLabel,
  actual,
  mechanism,
  tone,
  className,
}: ComparisonPanelProps) {
  return (
    <div
      data-testid="comparison-panel"
      className={cn("space-y-3 rounded-lg border p-4", TONE_CLASSES[tone], className)}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-lesson-text-muted">
            {expectedLabel}
          </p>
          <p className="mt-1 text-sm text-lesson-text-primary">{expected}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-lesson-text-muted">
            {actualLabel}
          </p>
          <p className="mt-1 text-sm text-lesson-text-primary">{actual}</p>
        </div>
      </div>
      {mechanism && (
        <p className="border-t border-lesson-border/60 pt-3 text-sm text-lesson-text-secondary">{mechanism}</p>
      )}
    </div>
  );
}
