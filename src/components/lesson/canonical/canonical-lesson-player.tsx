import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CanonicalLesson } from "@/lib/curriculum/types";
import type { ActivityEvaluationResult } from "@/lib/learning-engine/types";
import { CanonicalActivityView } from "./canonical-activity-view";
import { mapSessionStatus } from "./runtime/use-activity-runtime";
import { evaluateActivityValidation } from "./validation";
import type {
  ActivityCompletionEvent,
  ActivityInteractionStatus,
  EvaluationRequest,
} from "./types";
import { LessonLayoutProvider } from "./primitives/lesson-layout-context";
import { useLessonSession } from "@/lib/learning-engine/use-lesson-session";
import { useProgress } from "@/lib/hooks/use-progress";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Check,
  RotateCcw,
  Flame,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { movementForActivityType, movementVars } from "./lesson-movements";
import { MovementRail, MovementBadge } from "./movement-rail";
import { interpretExperience } from "./experience/experience-interpreter";
import { composeExperience } from "./experience/experience-composer";
import type { ExperienceComposition } from "./experience/experience-types";

export interface CanonicalLessonPlayerProps {
  lesson: CanonicalLesson;
  onComplete?: () => void;
  className?: string;
}

const INTERACTIVE_TYPES = new Set([
  "multiple-choice",
  "multi-select",
  "fill-blank",
  "ordering",
  "output-prediction",
  "interactive-code",
  "debug",
  "reflection",
  "judgment",
]);

export function CanonicalLessonPlayer({
  lesson,
  onComplete,
  className,
}: CanonicalLessonPlayerProps) {
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
    goToActivity,
    completeLesson,
    matchedMisconception,
  } = useLessonSession(lesson, { onComplete: handleLessonCompleted });

  const activities = lesson.activities || [];
  const currentActivityIndex = session.currentActivityIndex;
  const totalActivities = session.totalActivities;

  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const evaluationRevisionRef = useRef(0);
  const [evaluationRequest, setEvaluationRequest] = useState<EvaluationRequest>();

  useEffect(() => {
    scrollContainerRef.current?.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, [currentActivity?.id]);

  const handleResponseChange = useCallback(
    (newResponse: unknown) => {
      if (currentActivity) updateResponse(newResponse, currentActivity.id);
    },
    [currentActivity, updateResponse],
  );

  const handleRuntimeValidation = useCallback(
    (result: ActivityEvaluationResult) => {
      if (currentActivity) resolveEvaluation(result, currentActivity.id);
    },
    [currentActivity, resolveEvaluation],
  );

  const requestInteractiveEvaluation = useCallback(
    (options?: { authoritative?: boolean }) => {
      if (
        !currentActivity ||
        (currentActivity.type !== "interactive-code" && currentActivity.type !== "debug")
      )
        return;
      const attemptId = `${currentActivity.id}:attempt-${(currentActivityState?.attempts ?? 0) + 1}:${Date.now()}`;
      const request = {
        activityId: currentActivity.id,
        attemptId,
        revision: ++evaluationRevisionRef.current,
        authoritative: options?.authoritative ?? true,
      } satisfies EvaluationRequest;
      setEvaluationRequest(request);
      startEvaluation(currentActivity.id);
    },
    [currentActivity, currentActivityState?.attempts, startEvaluation],
  );

  const handleSubmit = useCallback(() => {
    if (!currentActivity) return;
    if (currentActivity.type === "interactive-code" || currentActivity.type === "debug") {
      requestInteractiveEvaluation({ authoritative: true });
      return;
    }
    const latestActState = getActivityState(currentActivity.id);
    let responseToEvaluate =
      latestActState?.response ??
      session.activities[currentActivity.id]?.response ??
      currentActivityState?.response;
    startEvaluation(currentActivity.id);

    if (responseToEvaluate === null || responseToEvaluate === undefined) {
      if (currentActivity.content && "starterCode" in currentActivity.content) {
        responseToEvaluate = (currentActivity.content as { starterCode?: string }).starterCode;
      } else if (currentActivity.content && "buggyCode" in currentActivity.content) {
        responseToEvaluate = (currentActivity.content as { buggyCode?: string }).buggyCode;
      }
    }

    const valResult = evaluateActivityValidation(currentActivity, responseToEvaluate as never);
    resolveEvaluation(valResult, currentActivity.id);
  }, [
    currentActivity,
    getActivityState,
    session.activities,
    currentActivityState?.response,
    startEvaluation,
    requestInteractiveEvaluation,
    resolveEvaluation,
  ]);

  const handleRetry = useCallback(() => {
    if (currentActivity) retry(currentActivity.id);
  }, [currentActivity, retry]);

  const handleRevealHint = useCallback(() => {
    if (currentActivity) revealHint(currentActivity.id);
  }, [currentActivity, revealHint]);

  const handleActivityContinue = useCallback(
    (_event?: ActivityCompletionEvent<unknown> | React.MouseEvent<HTMLButtonElement>) => {
      if (!currentActivity) return;
      completeActivity(currentActivity.id);
      if (currentActivityIndex < totalActivities - 1) goNext();
      else completeLesson();
    },
    [
      currentActivity,
      currentActivityIndex,
      totalActivities,
      completeActivity,
      goNext,
      completeLesson,
    ],
  );

  const isInteractive = currentActivity ? INTERACTIVE_TYPES.has(currentActivity.type) : false;

  const activeResponse = useMemo(() => {
    if (!currentActivity) return undefined;
    return (
      getActivityState(currentActivity.id)?.response ??
      session.activities[currentActivity.id]?.response ??
      currentActivityState?.response
    );
  }, [currentActivity, getActivityState, session.activities, currentActivityState?.response]);

  const canSubmit = useMemo(() => {
    if (!currentActivity) return false;
    if (!isInteractive) return true;

    switch (currentActivity.type) {
      case "multiple-choice":
        return typeof activeResponse === "string" && activeResponse.length > 0;
      case "multi-select":
        return Array.isArray(activeResponse) && activeResponse.length > 0;
      case "fill-blank": {
        const blanks = (currentActivity.content as { blanks?: unknown[] })?.blanks ?? [];
        if (!Array.isArray(activeResponse)) return false;
        if (blanks.length > 0 && activeResponse.length < blanks.length) return false;
        return (
          activeResponse.length > 0 &&
          activeResponse.every((v) => typeof v === "string" && v.trim().length > 0)
        );
      }
      case "ordering": {
        const items = (currentActivity.content as { items?: unknown[] })?.items ?? [];
        return Array.isArray(activeResponse) && activeResponse.length === items.length;
      }
      case "reflection":
        return typeof activeResponse === "string" && activeResponse.trim().length >= 10;
      case "interactive-code":
      case "debug":
      case "output-prediction":
      case "judgment":
      default:
        return activeResponse !== undefined && activeResponse !== null;
    }
  }, [currentActivity, isInteractive, activeResponse]);

  const effectiveStatus = useMemo<ActivityInteractionStatus>(() => {
    if (!currentActivity) return "idle";
    const state = getActivityState(currentActivity.id) || currentActivityState;
    return state ? mapSessionStatus(state.status) : "idle";
  }, [currentActivity, getActivityState, currentActivityState]);

  const isCorrect = effectiveStatus === "correct" || effectiveStatus === "completed";
  const isIncorrect = effectiveStatus === "incorrect";
  const isSubmitted = effectiveStatus === "submitted";

  const isLastActivity = currentActivityIndex === totalActivities - 1;
  const activityType = currentActivity?.type ?? "explanation";

  // Pure experience metadata derivation for the player shell
  const experienceInterpretation = useMemo(
    () =>
      currentActivity
        ? interpretExperience({
            activity: currentActivity,
            activityState: currentActivityState,
            lesson,
            lessonState: session,
            evaluationResult: currentActivityState?.lastEvaluation,
            matchedMisconception,
          })
        : null,
    [currentActivity, currentActivityState, lesson, session, matchedMisconception],
  );

  const [composedExperience, setComposedExperience] = useState<ExperienceComposition | null>(null);

  const experienceComposition = useMemo(() => {
    if (composedExperience) return composedExperience;
    return experienceInterpretation ? composeExperience(experienceInterpretation) : null;
  }, [composedExperience, experienceInterpretation]);

  const handleExperienceCompositionChange = useCallback((composition: ExperienceComposition) => {
    setComposedExperience(composition);
  }, []);

  // Distinguish Reading Space from Engineering Workspace
  const isWorkspace = useMemo(() => {
    return (
      experienceComposition?.spatialMode === "split" ||
      experienceComposition?.focalSurface === "editor" ||
      experienceComposition?.focalSurface === "reconstruction" ||
      activityType === "interactive-code" ||
      activityType === "debug"
    );
  }, [experienceComposition, activityType]);

  const canvasMeasureClass = useMemo(() => {
    if (isWorkspace) {
      return "max-w-full lg:max-w-7xl xl:max-w-[94vw] 2xl:max-w-[1640px]";
    }

    if (
      experienceComposition?.focalSurface === "interaction" ||
      activityType === "multiple-choice" ||
      activityType === "multi-select" ||
      activityType === "fill-blank" ||
      activityType === "ordering" ||
      activityType === "judgment" ||
      activityType === "code-example"
    ) {
      return "max-w-3xl lg:max-w-4xl";
    }

    // Reading space: strictly constrained to optimal line length (68ch - 75ch)
    return "max-w-[68ch] lg:max-w-3xl";
  }, [isWorkspace, experienceComposition, activityType]);

  const shellContainerClass = useMemo(() => {
    return isWorkspace
      ? "max-w-full lg:max-w-7xl xl:max-w-[94vw] 2xl:max-w-[1640px]"
      : "max-w-[1200px]";
  }, [isWorkspace]);

  const movement = movementForActivityType(activityType);
  const progressPercent =
    totalActivities > 0 ? ((currentActivityIndex + 1) / totalActivities) * 100 : 0;
  const railNodes = activities.map((a) => ({
    id: a.id,
    type: a.type,
    title: "title" in a.content ? a.content.title : a.type,
  }));

  const assistance = experienceComposition?.assistance;

  return (
    <div
      className={cn(
        "flex h-full min-h-0 w-full flex-col overflow-hidden bg-lesson-bg text-lesson-text-primary selection:bg-[var(--m-accent-soft)] selection:text-[var(--m-accent)]",
        className,
      )}
      data-testid="canonical-lesson-player"
      data-experience-mode={experienceComposition?.mode ?? "discover"}
      data-spatial-mode={experienceComposition?.spatialMode ?? "focused"}
      data-focal-surface={experienceComposition?.focalSurface ?? "presentation"}
      style={movementVars(movement)}
    >
      {/* Layer 1 — Top Navigation & Lesson Identity */}
      <header className="relative z-20 shrink-0 border-b border-lesson-border bg-lesson-bg/85 px-3 py-2.5 backdrop-blur-md sm:px-6 sm:py-3 transition-all duration-300">
        <div
          className={cn(
            "mx-auto flex items-center justify-between gap-3 sm:gap-4",
            shellContainerClass,
          )}
        >
          {/* Left: Exit/Leave Navigation & Brand Identity */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <a
              href="/learn"
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-lesson-border/60 bg-lesson-surface-subtle/50 px-2.5 py-1 text-xs font-medium text-lesson-text-secondary transition-all hover:bg-lesson-surface-subtle hover:text-lesson-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lesson-focus-ring"
              aria-label="Leave lesson and return to curriculum"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Leave</span>
            </a>

            <div className="hidden md:flex items-center gap-2 border-l border-lesson-border/60 pl-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--m-accent-soft)] text-[var(--m-accent)] ring-1 ring-[var(--m-accent-line)]">
                <Flame className="h-3.5 w-3.5" />
              </span>
              <span className="font-mono text-[11px] font-bold tracking-widest text-lesson-text-secondary uppercase">
                Forge
              </span>
            </div>
          </div>

          {/* Center: Movement & Experience Mode Badge & Lesson Title */}
          <div className="flex min-w-0 flex-1 items-center justify-center gap-2 text-center sm:text-left">
            <MovementBadge movement={movement} compact className="shrink-0 hidden sm:flex" />
            <span className="sm:hidden font-mono text-[10px] font-semibold text-[var(--m-accent)] uppercase tracking-wider">
              {movement.label}
            </span>
            {experienceComposition?.badgeText && (
              <span className="hidden md:inline-flex items-center rounded px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-lesson-text-secondary bg-lesson-surface-subtle border border-lesson-border/60">
                {experienceComposition.badgeText}
              </span>
            )}
            <div className="min-w-0">
              <h1 className="truncate text-xs sm:text-sm font-semibold tracking-tight text-lesson-text-primary">
                {lesson.title}
              </h1>
            </div>
          </div>

          {/* Right: Activity Progress Counter */}
          <div className="flex items-center gap-2 text-right shrink-0">
            <div className="flex flex-col items-end leading-tight">
              <span className="font-mono text-xs font-semibold text-lesson-text-primary">
                {currentActivityIndex + 1}
                <span className="text-lesson-text-muted"> / {totalActivities}</span>
              </span>
              <span className="hidden sm:inline text-[10px] font-medium text-lesson-text-muted">
                {Math.round(progressPercent)}% complete
              </span>
            </div>
          </div>
        </div>

        {/* Layer 2 — Progress Presentation: Segmented Movement Rail on Desktop, Compact Bar on Mobile */}
        <div className={cn("mx-auto mt-2.5 transition-all duration-300", shellContainerClass)}>
          {/* Desktop Segmented Movement Rail */}
          <div className="hidden sm:block">
            <MovementRail
              nodes={railNodes}
              currentIndex={currentActivityIndex}
              completedIds={session.completedActivityIds}
              onSelect={goToActivity}
            />
          </div>

          {/* Mobile Lightweight Progress Bar */}
          <div className="block sm:hidden">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-lesson-surface-subtle">
              <div
                className="h-full bg-[var(--m-accent)] transition-all duration-300 shadow-[0_0_8px_var(--m-glow)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Layer 3 — Learning Canvas */}
      <main
        ref={scrollContainerRef}
        className="relative h-0 min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 pt-6 pb-32 sm:px-6 sm:pt-8 sm:pb-36 lg:px-8 lg:pb-40"
      >
        {/* Ambient movement backdrop gradient */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[420px] transition-opacity duration-700"
          style={{
            background: "radial-gradient(900px 380px at 50% -8%, var(--m-glow), transparent 70%)",
          }}
        />

        <div
          className={cn(
            "relative z-10 mx-auto flex min-h-full w-full flex-col justify-start transition-all duration-300",
            canvasMeasureClass,
          )}
        >
          <LessonLayoutProvider
            value={{
              shellManagedWidth: false,
              shellManagedFeedback: false,
            }}
          >
            {currentActivity ? (
              <CanonicalActivityView
                key={currentActivity.id}
                activity={currentActivity}
                activityState={currentActivityState}
                lesson={lesson}
                lessonState={session}
                onResponseChange={handleResponseChange}
                onSubmit={handleSubmit}
                onRequestEvaluation={requestInteractiveEvaluation}
                evaluationRequest={evaluationRequest}
                onRuntimeValidation={handleRuntimeValidation}
                onRetry={handleRetry}
                onRevealHint={handleRevealHint}
                onComplete={handleActivityContinue}
                onExperienceCompositionChange={handleExperienceCompositionChange}
                matchedMisconception={matchedMisconception}
                className="w-full"
              />
            ) : (
              <div className="py-16 text-center text-lesson-text-muted">
                No activities available in this lesson.
              </div>
            )}
          </LessonLayoutProvider>
        </div>
      </main>

      {/* Layer 4 — Contextual Activity Actions */}
      <footer className="shrink-0 border-t border-lesson-border bg-lesson-surface/95 backdrop-blur-md px-4 py-3 sm:px-6 z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-[calc(12px+env(safe-area-inset-bottom,0px))] transition-all duration-300">
        <div className={cn("mx-auto flex items-center justify-between gap-3", shellContainerClass)}>
          {/* Left: Previous Navigation */}
          <Button
            variant="ghost"
            onClick={goPrevious}
            disabled={currentActivityIndex === 0}
            className="min-h-11 gap-1.5 px-3.5 text-sm font-medium text-lesson-text-secondary hover:bg-lesson-surface-subtle hover:text-lesson-text-primary focus-visible:ring-2 focus-visible:ring-lesson-focus-ring"
            aria-label="Previous activity"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>

          {/* Center: Contextual activity title */}
          <span className="hidden max-w-[40%] truncate text-xs font-medium text-lesson-text-muted sm:block">
            {(currentActivity && "title" in currentActivity.content
              ? currentActivity.content.title
              : undefined) || `Activity ${currentActivityIndex + 1}`}
          </span>

          {/* Right: Assistance & Primary Action Controls */}
          <div className="flex items-center gap-2">
            {assistance &&
              assistance.hasHints &&
              !isCorrect &&
              (assistance.hintsAvailable ?? 0) > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRevealHint}
                  disabled={assistance.hintsRevealed >= assistance.hintsAvailable}
                  className="min-h-11 gap-1.5 px-3 text-xs font-medium text-lesson-text-secondary hover:bg-lesson-surface-subtle hover:text-lesson-text-primary transition-colors disabled:opacity-40"
                  aria-label={
                    assistance.hintsRevealed >= assistance.hintsAvailable
                      ? "All hints revealed"
                      : `Reveal hint (${assistance.hintsRevealed} of ${assistance.hintsAvailable})`
                  }
                >
                  <Lightbulb className="h-4 w-4 text-amber-400 shrink-0" />
                  <span className="hidden sm:inline">Hint</span>
                  <span className="font-mono text-[11px] text-lesson-text-muted">
                    {assistance.hintsRevealed}/{assistance.hintsAvailable}
                  </span>
                </Button>
              )}

            {!isInteractive || isCorrect ? (
              <Button
                onClick={handleActivityContinue}
                disabled={!currentActivity}
                style={{ backgroundColor: "var(--m-accent)", color: "var(--lesson-bg)" }}
                className="min-h-11 gap-2 rounded-lg px-6 text-sm font-semibold shadow-[0_6px_20px_var(--m-glow)] transition-transform hover:-translate-y-px hover:brightness-105 focus-visible:ring-2 focus-visible:ring-[var(--m-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-lesson-surface active:scale-[0.98]"
              >
                <span>{isLastActivity ? "Set the skill" : "Continue"}</span>
                {isLastActivity ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0" />
                )}
              </Button>
            ) : isIncorrect ? (
              <Button
                onClick={handleRetry}
                className="min-h-11 gap-2 rounded-lg border border-rose-500/30 bg-rose-500/15 px-6 text-sm font-semibold text-rose-200 hover:bg-rose-500/25 focus-visible:ring-2 focus-visible:ring-rose-500 shadow-xs active:scale-[0.98] transition-all"
              >
                <RotateCcw className="h-4 w-4 shrink-0" />
                <span>Try Again</span>
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitted}
                style={{ backgroundColor: "var(--m-accent)", color: "var(--lesson-bg)" }}
                className="min-h-11 gap-2 rounded-lg px-6 text-sm font-semibold shadow-[0_6px_20px_var(--m-glow)] transition-transform hover:-translate-y-px hover:brightness-105 disabled:opacity-40 disabled:shadow-none disabled:hover:translate-y-0 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-[var(--m-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-lesson-surface active:scale-[0.98]"
              >
                <Check className="h-4 w-4 shrink-0" />
                <span>
                  {isSubmitted
                    ? "Evaluating…"
                    : currentActivity.type === "debug"
                      ? "Submit Fix"
                      : currentActivity.type === "reflection"
                        ? "Submit Reflection"
                        : "Check Answer"}
                </span>
              </Button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
