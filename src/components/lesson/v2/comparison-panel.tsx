import { cn } from "@/lib/utils";
import { LessonMarkdown } from "@/components/lesson/shared/lesson-markdown";

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
          <div className="mt-1 text-sm text-lesson-text-primary">
            {expected.includes("```") ? (
              <LessonMarkdown>{expected}</LessonMarkdown>
            ) : (
              <LessonMarkdown inline>{expected}</LessonMarkdown>
            )}
          </div>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-lesson-text-muted">
            {actualLabel}
          </p>
          <div className="mt-1 text-sm text-lesson-text-primary">
            {actual.includes("```") ? (
              <LessonMarkdown>{actual}</LessonMarkdown>
            ) : (
              <LessonMarkdown inline>{actual}</LessonMarkdown>
            )}
          </div>
        </div>
      </div>
      {mechanism && (
        <p className="border-t border-lesson-border/60 pt-3 text-sm text-lesson-text-secondary">
          <LessonMarkdown inline>{mechanism}</LessonMarkdown>
        </p>
      )}
    </div>
  );
}
