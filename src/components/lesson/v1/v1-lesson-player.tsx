import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import type { ActivityEvaluationResult } from "@/lib/learning-engine/types";
import { useLessonSession } from "@/lib/learning-engine/use-lesson-session";
import { useProgress } from "@/lib/hooks/use-progress";
import { evaluateActivityValidation } from "@/components/lesson/canonical/validation";
import { mapSessionStatus } from "@/components/lesson/canonical/runtime/use-activity-runtime";
import type { EvaluationRequest } from "@/components/lesson/canonical/types";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckCircle2, Check, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CanonicalLessonV1 } from "@/lib/curriculum/types-v1";
import { adaptLessonV1ToLayer1 } from "@/lib/curriculum/v1/adapter";
import type { InvestigationResponse } from "./investigation-debug-renderer";
import { V1ActivityView } from "./v1-activity-view";

export interface V1LessonPlayerProps {
  lesson: CanonicalLessonV1;
  onComplete?: () => void;
  className?: string;
}

/**
 * Thin V1 player: owns activity progression, V1 activity dispatch, and
 * lesson completion. Everything else — session state, persistence,
 * evidence, sandbox execution, the account-settings visual, reflection —
 * is reused unchanged from Layer 1 (see ../../lib/curriculum/v1/adapter.ts
 * and v1-activity-view.tsx). This mirrors
 * `canonical-lesson-player.tsx`'s shell structure deliberately (same
 * header/rail/footer idiom) rather than inventing a second visual language
 * for lessons, but the type-specific branching inside it is driven by the
 * adapter's `renderPlan`, not by hardcoded Layer-1 type assumptions.
 */
export function V1LessonPlayer({ lesson: lessonV1, onComplete, className }: V1LessonPlayerProps) {
  // The adapted lesson only needs to be recomputed when the V1 source
  // lesson identity changes, not on every render.
  const adapted = useMemo(() => adaptLessonV1ToLayer1(lessonV1), [lessonV1]);
  const { lesson, renderPlan, originalActivities } = adapted;

  const { completeLesson: completeGlobalProgress } = useProgress();
  const handleLessonCompleted = useCallback(() => {
    completeGlobalProgress(lesson.id);
    onComplete?.();
  }, [completeGlobalProgress, lesson.id, onComplete]);

  const {
    session,
    currentActivity,
    currentActivityState,
    getActivityState,
    updateResponse,
    startEvaluation,
    resolveEvaluation,
    retry,
    revealHint,
    completeActivity,
    goNext,
    goPrevious,
    completeLesson,
  } = useLessonSession(lesson, { onComplete: handleLessonCompleted, skills: [], misconceptions: [] });

  const currentActivityIndex = session.currentActivityIndex;
  const totalActivities = session.totalActivities;
  const isLastActivity = currentActivityIndex === totalActivities - 1;

  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const evaluationRevisionRef = useRef(0);
  const [evaluationRequest, setEvaluationRequest] = useState<EvaluationRequest>();

  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [currentActivity?.id]);

  const renderKind = currentActivity ? renderPlan[currentActivity.id] : undefined;
  const originalActivity = currentActivity ? originalActivities[currentActivity.id] : undefined;

  // Only the delegated interactive-code path needs the real sandbox
  // evaluation round-trip (compile → run → report) — everything else in
  // this slice evaluates synchronously against the response already held
  // in session state, same as Layer 1's non-code activity types.
  const usesSandboxEvaluation = renderKind === "delegate-layer1" && currentActivity?.type === "interactive-code";

  const isInteractive = useMemo(() => {
    if (!currentActivity || !renderKind) return false;
    if (renderKind === "delegate-layer1") {
      // "visual" (the account-settings encounter beat) is observational,
      // not graded — matches Layer 1's own INTERACTIVE_TYPES exclusion of
      // "visual". Everything else delegated (interactive-code, reflection)
      // is interactive, same as Layer 1.
      return currentActivity.type !== "visual";
    }
    return true; // prediction, investigation, generic-demo are all graded/acknowledged interactions
  }, [currentActivity, renderKind]);

  const activeResponse = useMemo(() => {
    if (!currentActivity) return undefined;
    return (
      getActivityState(currentActivity.id)?.response ??
      session.activities[currentActivity.id]?.response ??
      currentActivityState?.response
    );
  }, [currentActivity, getActivityState, session.activities, currentActivityState]);

  const canSubmit = useMemo(() => {
    if (!currentActivity || !renderKind) return false;
    if (!isInteractive) return true;
    switch (renderKind) {
      case "prediction":
        return typeof activeResponse === "string" && activeResponse.length > 0;
      case "investigation":
        return Boolean((activeResponse as InvestigationResponse | undefined)?.inspectedElement);
      case "generic-demo":
        return activeResponse !== undefined && activeResponse !== null;
      case "delegate-layer1":
        if (currentActivity.type === "reflection")
          return typeof activeResponse === "string" && activeResponse.trim().length >= 10;
        return activeResponse !== undefined && activeResponse !== null; // interactive-code
      default:
        return false;
    }
  }, [currentActivity, renderKind, isInteractive, activeResponse]);

  const effectiveStatus = useMemo(() => {
    if (!currentActivity) return "idle" as const;
    const state = getActivityState(currentActivity.id) || currentActivityState;
    return state ? mapSessionStatus(state.status) : ("idle" as const);
  }, [currentActivity, getActivityState, currentActivityState]);

  const isCorrect = effectiveStatus === "correct" || effectiveStatus === "completed";
  const isIncorrect = effectiveStatus === "incorrect";
  const isSubmitted = effectiveStatus === "submitted";

  const handleResponseChange = useCallback(
    (response: unknown) => {
      if (currentActivity) updateResponse(response, currentActivity.id);
    },
    [currentActivity, updateResponse],
  );

  const requestInteractiveEvaluation = useCallback(
    (options?: { authoritative?: boolean }) => {
      if (!currentActivity || !usesSandboxEvaluation) return;
      const attemptId = `${currentActivity.id}:attempt-${(currentActivityState?.attempts ?? 0) + 1}:${Date.now()}`;
      setEvaluationRequest({
        activityId: currentActivity.id,
        attemptId,
        revision: ++evaluationRevisionRef.current,
        authoritative: options?.authoritative ?? true,
      });
      startEvaluation(currentActivity.id);
    },
    [currentActivity, currentActivityState?.attempts, usesSandboxEvaluation, startEvaluation],
  );

  const handleRuntimeValidation = useCallback(
    (result: ActivityEvaluationResult) => {
      if (currentActivity) resolveEvaluation(result, currentActivity.id);
    },
    [currentActivity, resolveEvaluation],
  );

  const handleSubmit = useCallback(() => {
    if (!currentActivity || !renderKind) return;

    if (usesSandboxEvaluation) {
      requestInteractiveEvaluation({ authoritative: true });
      return;
    }

    startEvaluation(currentActivity.id);

    let result: ActivityEvaluationResult;
    if (renderKind === "investigation" && originalActivity) {
      const expectedElement = (
        originalActivity.validation as { expectedState?: { inspectedElement?: string } } | undefined
      )?.expectedState?.inspectedElement;
      const response = activeResponse as InvestigationResponse | undefined;
      const isValid = !expectedElement || response?.inspectedElement === expectedElement;
      result = {
        isValid,
        feedbackMessage: isValid
          ? "That's the right target to inspect."
          : "That's not the element the symptom points to — look again.",
      };
    } else if (renderKind === "generic-demo") {
      // Acknowledgment-style: reaching this point with a response recorded
      // is itself the evidence (see generic-demo-panel.tsx doc).
      result = { isValid: true };
    } else {
      // prediction, and delegate-layer1 non-code types (reflection)
      result = evaluateActivityValidation(currentActivity, activeResponse as never);
    }

    resolveEvaluation(result, currentActivity.id);
  }, [
    currentActivity,
    renderKind,
    usesSandboxEvaluation,
    requestInteractiveEvaluation,
    originalActivity,
    activeResponse,
    startEvaluation,
    resolveEvaluation,
  ]);

  const handleRetry = useCallback(() => {
    if (currentActivity) retry(currentActivity.id);
  }, [currentActivity, retry]);

  const handleRevealHint = useCallback(() => {
    if (currentActivity) revealHint(currentActivity.id);
  }, [currentActivity, revealHint]);

  const handleContinue = useCallback(() => {
    if (!currentActivity) return;
    completeActivity(currentActivity.id);
    if (currentActivityIndex < totalActivities - 1) goNext();
    else completeLesson();
  }, [currentActivity, currentActivityIndex, totalActivities, completeActivity, goNext, completeLesson]);

  return (
    <div
      className={cn(
        "flex h-full min-h-0 w-full flex-col overflow-hidden bg-lesson-bg text-lesson-text-primary",
        className,
      )}
      data-testid="v1-lesson-player"
    >
      <header className="relative z-20 shrink-0 border-b border-lesson-border bg-lesson-bg/80 px-4 py-3 backdrop-blur-sm sm:px-6">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4">
          <a
            href="/learn"
            className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-sm font-medium text-lesson-text-secondary transition-colors hover:bg-lesson-surface-subtle hover:text-lesson-text-primary"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Leave</span>
          </a>
          <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
            V1
          </span>
          <div className="hidden min-w-0 flex-1 flex-col items-end text-right sm:flex">
            <p className="truncate text-xs font-medium text-lesson-text-muted">{lesson.title}</p>
            <p className="font-mono text-[11px] font-semibold text-lesson-text-secondary">
              {currentActivityIndex + 1}
              <span className="text-lesson-text-muted"> / {totalActivities}</span>
            </p>
          </div>
        </div>
      </header>

      <main
        ref={scrollContainerRef}
        className="relative h-0 min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 pt-8 pb-36 sm:px-6 sm:pt-10 sm:pb-40 lg:px-8"
      >
        <div className="relative z-10 mx-auto flex min-h-full w-full max-w-[1200px] flex-col justify-start">
          {currentActivity && renderKind && originalActivity ? (
            <V1ActivityView
              key={currentActivity.id}
              activity={currentActivity}
              renderKind={renderKind}
              originalActivity={originalActivity}
              lesson={lesson}
              lessonState={session}
              activityState={currentActivityState}
              onResponseChange={handleResponseChange}
              onSubmit={handleSubmit}
              onRequestEvaluation={requestInteractiveEvaluation}
              evaluationRequest={evaluationRequest}
              onRuntimeValidation={handleRuntimeValidation}
              onRetry={handleRetry}
              onRevealHint={handleRevealHint}
              onContinue={handleContinue}
              className="w-full"
            />
          ) : (
            <div className="py-16 text-center text-lesson-text-muted">
              No activities available in this lesson.
            </div>
          )}
        </div>
      </main>

      <footer className="shrink-0 border-t border-lesson-border bg-lesson-surface/95 backdrop-blur-sm px-4 py-3 sm:px-6 z-30 pb-[calc(12px+env(safe-area-inset-bottom,0px))]">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={goPrevious}
            disabled={currentActivityIndex === 0}
            className="min-h-11 gap-1 px-3 text-sm text-lesson-text-secondary"
            aria-label="Previous activity"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>

          <div className="flex items-center gap-2">
            {!isInteractive || isCorrect ? (
              <Button onClick={handleContinue} disabled={!currentActivity} className="min-h-11 gap-2 rounded-lg px-6 text-sm font-semibold">
                <span>{isLastActivity ? "Complete lesson" : "Continue"}</span>
                {isLastActivity ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
              </Button>
            ) : isIncorrect ? (
              <Button onClick={handleRetry} className="min-h-11 gap-2 px-6 text-sm font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700">
                <RotateCcw className="h-4 w-4 shrink-0" />
                <span>Try Again</span>
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!canSubmit || isSubmitted} className="min-h-11 gap-2 rounded-lg px-6 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed">
                <Check className="h-4 w-4 shrink-0" />
                <span>{isSubmitted ? "Evaluating…" : "Check Answer"}</span>
              </Button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
