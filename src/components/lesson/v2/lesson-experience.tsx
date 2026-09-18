import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import type { ActivityEvaluationResult } from "@/lib/learning-engine/types";
import { evaluateActivityValidation } from "@/components/lesson/canonical/validation";
import { mapSessionStatus } from "@/components/lesson/canonical/runtime/use-activity-runtime";
import type {
  EvaluationRequest,
  ActivityValidationResult,
} from "@/components/lesson/canonical/types";
import type { RailNode } from "@/components/lesson/canonical/movement-rail";
import type { CanonicalLessonV1 } from "@/lib/curriculum/types-v1";
import { adaptLessonV1ToLayer1 } from "@/lib/curriculum/v1/adapter";
import type { InvestigationResponse } from "@/components/lesson/v1/investigation-debug-renderer";
import type { DebugContentV1 } from "@/lib/curriculum/v1/content-schemas";
import { useLessonRuntime } from "./use-lesson-runtime";
import { LessonShell, type FooterAction } from "./lesson-shell";
import { ActivityStage } from "./activity-stage";
import { ClosureSurface } from "./closure-surface";
import { deriveLessonMode } from "./mode";
import { movementForV1Role } from "./movement-v1";
import { deriveContinueLabel } from "./continue-label";

export interface LessonExperienceProps {
  lesson: CanonicalLessonV1;
  onComplete?: () => void;
  className?: string;
}

/**
 * The new Forge Lesson Player for Layer 2 V1 lessons, superseding
 * `V1LessonPlayer` (kept in the codebase, no longer wired to the route —
 * see FORGE_V2_PLAYER_IMPLEMENTATION_REPORT.md). Owns activity progression,
 * activity dispatch (via `ActivityStage`), lesson-level mode derivation, and
 * completion — nothing else. All runtime concerns (session, persistence,
 * evidence, sandbox execution) are reused unchanged through
 * `useLessonRuntime`.
 */
export function LessonExperience({
  lesson: lessonV1,
  onComplete,
  className,
}: LessonExperienceProps) {
  const adapted = useMemo(() => adaptLessonV1ToLayer1(lessonV1), [lessonV1]);
  const { lesson, renderPlan, originalActivities } = adapted;

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
  } = useLessonRuntime(lesson, onComplete);

  const currentActivityIndex = session.currentActivityIndex;
  const totalActivities = session.totalActivities;
  const isLastActivity = currentActivityIndex === totalActivities - 1;
  const isLessonComplete = session.status === "completed";

  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const evaluationRevisionRef = useRef(0);
  const [evaluationRequest, setEvaluationRequest] = useState<EvaluationRequest>();
  const [lastValidationResult, setLastValidationResult] = useState<
    ActivityValidationResult | undefined
  >();

  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "instant" });
    setLastValidationResult(undefined);
  }, [currentActivity?.id]);

  const renderKind = currentActivity ? renderPlan[currentActivity.id] : undefined;
  const originalActivity = currentActivity ? originalActivities[currentActivity.id] : undefined;

  const railNodes: RailNode[] = useMemo(
    () =>
      lesson.activities.map((a) => ({
        id: a.id,
        type: a.type,
        role: originalActivities[a.id]?.role,
      })),
    [lesson.activities, originalActivities],
  );

  const currentMovement = useMemo(
    () => movementForV1Role(originalActivity?.role, currentActivity?.type ?? "explanation"),
    [originalActivity?.role, currentActivity?.type],
  );
  const currentMode = useMemo(
    () => deriveLessonMode(originalActivity?.role, currentActivity?.type),
    [originalActivity?.role, currentActivity?.type],
  );

  // Evidence gathered during the lesson's `investigation`-role activity,
  // carried forward into the next `manipulation` (code) activity — see
  // FORGE_LESSON_PLAYER_V2_EXPERIENCE_SPEC.md §6 "previously discovered
  // evidence remains useful."
  const carriedInvestigationEvidence = useMemo(() => {
    const investigationActivity = lesson.activities.find(
      (a) => renderPlan[a.id] === "investigation",
    );
    if (!investigationActivity) return undefined;
    const state = getActivityState(investigationActivity.id);
    if (!state || (state.status !== "completed" && state.status !== "passed")) return undefined;
    const content = originalActivities[investigationActivity.id]?.content as
      DebugContentV1 | undefined;
    if (!content) return undefined;
    return { targetElement: content.targetElement, fields: content.inspectionFields };
  }, [lesson.activities, renderPlan, getActivityState, originalActivities]);

  const usesSandboxEvaluation =
    renderKind === "delegate-layer1" && currentActivity?.type === "interactive-code";

  const NON_GRADED_DELEGATE_TYPES = useMemo(
    () => new Set(["visual", "intro", "explanation", "summary", "completion"]),
    [],
  );

  const isInteractive = useMemo(() => {
    if (!currentActivity || !renderKind) return false;
    if (renderKind === "delegate-layer1")
      return !NON_GRADED_DELEGATE_TYPES.has(currentActivity.type);
    return true; // prediction/investigation/generic-demo/multi-select/ordering/fill-blank are all graded/acknowledged interactions
  }, [currentActivity, renderKind, NON_GRADED_DELEGATE_TYPES]);

  const activeResponse = useMemo(() => {
    if (!currentActivity) return undefined;
    return getActivityState(currentActivity.id)?.response ?? currentActivityState?.response;
  }, [currentActivity, getActivityState, currentActivityState]);

  const canSubmit = useMemo(() => {
    if (!currentActivity || !renderKind || !isInteractive) return !isInteractive;
    switch (renderKind) {
      case "prediction":
        return typeof activeResponse === "string" && activeResponse.length > 0;
      case "investigation":
        return Boolean((activeResponse as InvestigationResponse | undefined)?.inspectedElement);
      case "generic-demo":
        return activeResponse !== undefined && activeResponse !== null;
      case "multi-select": {
        const selection = activeResponse as string[] | undefined;
        const content = originalActivity?.content as { minSelections?: number } | undefined;
        const minRequired = content?.minSelections ?? 1;
        return Array.isArray(selection) && selection.length >= minRequired;
      }
      case "ordering":
        return Array.isArray(activeResponse) && activeResponse.length > 0;
      case "fill-blank": {
        const values = activeResponse as Record<string, string> | undefined;
        const requiredBlanks =
          (originalActivity?.content as { blanks?: { id: string }[] } | undefined)?.blanks ?? [];
        return (
          requiredBlanks.length > 0 &&
          requiredBlanks.every((b) => (values?.[b.id] ?? "").trim().length > 0)
        );
      }
      case "delegate-layer1":
        if (currentActivity.type === "reflection")
          return typeof activeResponse === "string" && activeResponse.trim().length >= 10;
        return activeResponse !== undefined && activeResponse !== null;
      default:
        return false;
    }
  }, [currentActivity, renderKind, isInteractive, activeResponse, originalActivity]);

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
      setLastValidationResult(result as ActivityValidationResult);
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
      result = { isValid: true };
    } else {
      result = evaluateActivityValidation(currentActivity, activeResponse as never);
    }

    setLastValidationResult(result as ActivityValidationResult);
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
  }, [
    currentActivity,
    currentActivityIndex,
    totalActivities,
    completeActivity,
    goNext,
    completeLesson,
  ]);

  const nextActivity =
    currentActivityIndex < totalActivities - 1
      ? lesson.activities[currentActivityIndex + 1]
      : undefined;
  const nextOriginalActivity = nextActivity ? originalActivities[nextActivity.id] : undefined;
  const continueLabel = isLastActivity
    ? "Complete lesson"
    : deriveContinueLabel(nextOriginalActivity?.role, nextActivity?.type);

  const footerAction: FooterAction = !currentActivity
    ? { kind: "none" }
    : !isInteractive || isCorrect
      ? { kind: "continue", label: continueLabel, onClick: handleContinue }
      : isIncorrect
        ? { kind: "retry", onClick: handleRetry }
        : {
            kind: "check",
            label: isSubmitted ? "Evaluating…" : "Check Answer",
            disabled: !canSubmit || isSubmitted,
            onClick: handleSubmit,
          };

  if (isLessonComplete) {
    return (
      <LessonShell
        lessonTitle={lesson.title}
        currentIndex={totalActivities}
        totalActivities={totalActivities}
        railNodes={railNodes}
        completedIds={session.completedActivityIds}
        onSelectActivity={goToActivity}
        currentMovement={movementForV1Role("completion", "completion")}
        mode="closing"
        onBack={() => (window.location.href = "/learn")}
        onPrevious={goPrevious}
        canGoPrevious={false}
        footerAction={{ kind: "none" }}
      >
        <ClosureSurface capabilityStatements={lessonV1.learning.targetState.canDo} />
      </LessonShell>
    );
  }

  return (
    <LessonShell
      lessonTitle={lesson.title}
      currentIndex={currentActivityIndex}
      totalActivities={totalActivities}
      railNodes={railNodes}
      completedIds={session.completedActivityIds}
      onSelectActivity={goToActivity}
      currentMovement={currentMovement}
      mode={currentMode}
      onBack={() => (window.location.href = "/learn")}
      onPrevious={goPrevious}
      canGoPrevious={currentActivityIndex > 0}
      footerAction={footerAction}
    >
      {currentActivity && renderKind && originalActivity ? (
        <ActivityStage
          key={currentActivity.id}
          activity={currentActivity}
          renderKind={renderKind}
          originalActivity={originalActivity}
          lesson={lesson}
          lessonState={session}
          activityState={currentActivityState}
          validationResult={lastValidationResult}
          onResponseChange={handleResponseChange}
          onSubmit={handleSubmit}
          onRequestEvaluation={requestInteractiveEvaluation}
          evaluationRequest={evaluationRequest}
          onRuntimeValidation={handleRuntimeValidation}
          onRetry={handleRetry}
          onRevealHint={handleRevealHint}
          onContinue={handleContinue}
          carriedInvestigationEvidence={
            renderKind === "delegate-layer1" ? carriedInvestigationEvidence : undefined
          }
        />
      ) : (
        <div className="py-16 text-center text-lesson-text-muted">
          No activities available in this lesson.
        </div>
      )}
    </LessonShell>
  );
}
