import type { ClosureBlock } from "@/lib/curriculum/v2/types";
import {
  CheckCircle2,
  RotateCcw,
  Award,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

export interface ClosureSurfaceProps {
  closure?: ClosureBlock;
  coreTakeaway?: string;
  capabilityStatements?: string[];
  lessonId?: string;
  lessonTitle?: string;
  moduleTitle?: string;
  nextLessonId?: string;
  nextLessonLabel?: string;
  completedActivityCount?: number;
  totalActivityCount?: number;
  verifiedCheckCount?: number;
  firstTryCheckCount?: number;
  totalInteractiveCount?: number;
  flaggedStepTitles?: string[];
  onRestart?: () => void;
  onContinueToNext?: () => void;
  onReturnToModule?: () => void;
}

export function ClosureSurface({
  closure,
  coreTakeaway,
  capabilityStatements,
  lessonTitle = "Lesson Complete",
  completedActivityCount = 0,
  totalActivityCount = 0,
  verifiedCheckCount = 0,
  firstTryCheckCount,
  totalInteractiveCount = 0,
  flaggedStepTitles = [],
  onRestart,
}: ClosureSurfaceProps) {
  const allChecksPassed =
    totalInteractiveCount > 0 && verifiedCheckCount >= totalInteractiveCount;
  const effectiveFirstTryCount =
    firstTryCheckCount ?? Math.max(0, verifiedCheckCount - flaggedStepTitles.length);

  // 2. One-sentence core takeaway
  const rawTakeaway =
    coreTakeaway ||
    closure?.keyTakeaways?.[0] ||
    closure?.summary ||
    capabilityStatements?.[0] ||
    `You completed the steps in ${lessonTitle}.`;
  const oneSentenceTakeaway = rawTakeaway.replace(/^\*\*Mental model:\*\*\s*/i, "").trim();

  return (
    <div className="mx-auto max-w-xl py-3 px-2 sm:px-4" data-testid="closure-surface">
      <div className="rounded-2xl border border-lesson-border bg-lesson-surface p-5 sm:p-6 text-lesson-text-primary shadow-sm space-y-4">
        {/* 1. Honest Lesson Complete Header */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            <Award className="h-3.5 w-3.5 shrink-0" />
            <span>{allChecksPassed ? "All Checks Passed" : "Lesson Complete"}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-lesson-text-primary leading-snug">
            {lessonTitle}
          </h1>
        </div>

        {/* 2. One-Sentence Takeaway */}
        <div
          className="rounded-xl border border-lesson-border/80 bg-lesson-surface-subtle p-3.5"
          data-testid="closure-takeaway"
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-lesson-text-muted mb-1">
            Core Takeaway
          </p>
          <p className="text-sm font-medium text-lesson-text-primary leading-relaxed">
            {oneSentenceTakeaway}
          </p>
        </div>

        {/* 3. Brief, Accurate Evidence Summary */}
        <div className="space-y-2.5" data-testid="closure-evidence-summary">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="rounded-xl border border-lesson-border bg-lesson-surface-subtle px-3.5 py-2.5 flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-lesson-text-muted">
                  Recorded Progress
                </div>
                <div className="text-xs font-semibold text-lesson-text-primary">
                  {totalInteractiveCount > 0
                    ? `${verifiedCheckCount} of ${totalInteractiveCount} checks passed`
                    : totalActivityCount > 0
                      ? `${completedActivityCount} of ${totalActivityCount} steps completed`
                      : "Steps completed"}
                </div>
              </div>
            </div>

            {totalInteractiveCount > 0 && (
              <div className="rounded-xl border border-lesson-border bg-lesson-surface-subtle px-3.5 py-2.5 flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                  {flaggedStepTitles.length > 0 ? (
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-lesson-text-muted">
                    Attempt Breakdown
                  </div>
                  <div className="text-xs font-semibold text-lesson-text-primary">
                    {verifiedCheckCount === 0
                      ? "No graded checks recorded"
                      : flaggedStepTitles.length > 0
                        ? `${effectiveFirstTryCount} first-try · ${flaggedStepTitles.length} retried`
                        : `${effectiveFirstTryCount} passed on first attempt`}
                  </div>
                </div>
              </div>
            )}
          </div>

          {flaggedStepTitles.length > 0 && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-lesson-text-secondary">
              <strong className="font-semibold text-amber-700 dark:text-amber-300">
                Suggested review:
              </strong>{" "}
              {flaggedStepTitles.join(", ")}
            </div>
          )}
        </div>

        {/* 4. Single Secondary Action (Primary Next Lesson CTA lives exclusively in the sticky footer) */}
        {onRestart && (
          <div className="pt-1">
            <button
              type="button"
              onClick={onRestart}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-lesson-border bg-lesson-surface-subtle hover:bg-lesson-surface px-3.5 py-2 text-xs font-semibold text-lesson-text-secondary hover:text-lesson-text-primary transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Review Steps</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
