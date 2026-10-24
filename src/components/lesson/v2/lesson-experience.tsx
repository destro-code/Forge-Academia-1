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
import { LessonShell, type FooterAction, type StudioModuleLessonItem } from "./lesson-shell";
import { ActivityStage } from "./activity-stage";
import { ClosureSurface } from "./closure-surface";
import { ForgeBuddyLessonCompanion } from "./forge-buddy-lesson-companion";
import { deriveLessonMode } from "./mode";
import { movementForV1Role } from "./movement-v1";
import { deriveContinueLabel } from "./continue-label";
import {
  isValidOrderingPermutation,
  resolveInitialOrderingResponse,
} from "@/lib/utils/shuffle-options";
import { recordCapabilityEvidence } from "@/lib/learning-engine/evidence-store";

export interface LessonExperienceProps {
  lesson: CanonicalLessonV1;
  moduleTitle?: string;
  navigationMode?: "module" | "curriculum";
  moduleLessons?: StudioModuleLessonItem[];
  isBookmarked?: boolean;
  initialNote?: string;
  prevLessonId?: string | null;
  nextLessonId?: string | null;
  onToggleBookmark?: () => void;
  onSaveNote?: (text: string) => void;
  onNavigateLesson?: (lessonId: string) => void;
  onComplete?: () => void;
  onLessonComplete?: () => void;
  onBack?: () => void;
  nextLessonLabel?: string;
  onContinueToNext?: () => void;
  onReturnToModule?: () => void;
  className?: string;
}

export function LessonExperience({
  lesson: lessonV1,
  moduleTitle,
  navigationMode,
  moduleLessons,
  isBookmarked,
  initialNote,
  prevLessonId,
  nextLessonId,
  onToggleBookmark,
  onSaveNote,
  onNavigateLesson,
  onComplete,
  onLessonComplete,
  onBack,
  nextLessonLabel,
  onContinueToNext,
  onReturnToModule,
}: LessonExperienceProps) {
  const adapted = useMemo(() => adaptLessonV1ToLayer1(lessonV1), [lessonV1]);
  const { lesson, renderPlan, originalActivities } = adapted;

  const handleLessonCompleted = useCallback(() => {
    onComplete?.();
    onLessonComplete?.();
  }, [onComplete, onLessonComplete]);

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
  } = useLessonRuntime(lesson, handleLessonCompleted);

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

  const activityTitles: string[] = useMemo(
    () =>
      lesson.activities.map(
        (a, idx) => originalActivities[a.id]?.title || `Step ${idx + 1}: ${a.type}`,
      ),
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

  const stageWidth: "reading" | "studio" = useMemo(() => {
    const t = originalActivity?.type ?? currentActivity?.type;
    if (
      t === "visual" ||
      t === "interactive-demo" ||
      t === "interactive-code" ||
      t === "code-modification" ||
      t === "replicate-this" ||
      t === "debug" ||
      t === "judgment"
    ) {
      return "studio";
    }
    return "reading";
  }, [originalActivity?.type, currentActivity?.type]);

  const carriedInvestigationEvidence = useMemo(() => {
    const investigationActivity = lesson.activities.find(
      (a) => renderPlan[a.id] === "investigation",
    );
    if (!investigationActivity) return undefined;
    const state = getActivityState(investigationActivity.id);
    if (!state || (state.status !== "completed" && state.status !== "passed")) return undefined;
    const content = originalActivities[investigationActivity.id]?.content as
      | DebugContentV1
      | undefined;
    if (!content) return undefined;
    return { targetElement: content.targetElement, fields: content.inspectionFields };
  }, [lesson.activities, renderPlan, getActivityState, originalActivities]);

  const usesSandboxEvaluation =
    renderKind === "delegate-layer1" &&
    (currentActivity?.type === "replicate-this" ||
      (currentActivity?.type === "interactive-code" &&
        (currentActivity.content.language === "html" ||
          currentActivity.content.language === "css" ||
          (currentActivity.content.language === "javascript" &&
            !currentActivity.validation?.testCases?.some((tc) =>
              tc.assertion?.startsWith("source_contains:"),
            )))));

  const NON_GRADED_DELEGATE_TYPES = useMemo(
    () => new Set(["visual", "intro", "explanation", "summary", "completion"]),
    [],
  );

  const isInteractive = useMemo(() => {
    if (!currentActivity || !renderKind) return false;
    if (renderKind === "delegate-layer1")
      return !NON_GRADED_DELEGATE_TYPES.has(currentActivity.type);
    return true;
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
      case "ordering": {
        const items =
          (originalActivity?.content as { items?: { id: string }[] } | undefined)?.items ??
          (currentActivity.content as { items?: { id: string }[] })?.items ??
          [];
        return isValidOrderingPermutation(activeResponse, items);
      }
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
        if (currentActivity.type === "interactive-code")
          return (
            (typeof activeResponse === "string" && activeResponse.trim().length > 0) ||
            Boolean(currentActivity.content.starterCode?.trim().length)
          );
        if (currentActivity.type === "replicate-this") return true;
        if (currentActivity.type === "judgment")
          return activeResponse !== undefined && activeResponse !== null;
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

    const effectiveResponse =
      currentActivity.type === "interactive-code" && activeResponse === undefined
        ? currentActivity.content.starterCode
        : currentActivity.type === "ordering"
          ? resolveInitialOrderingResponse(
              currentActivity.content.items,
              currentActivity.validation?.type === "ordering"
                ? currentActivity.validation.correctSequence
                : undefined,
              currentActivity.id,
              activeResponse,
            )
          : activeResponse;

    let result: ActivityEvaluationResult;
    if (renderKind === "investigation" && originalActivity) {
      const expectedElement = (
        originalActivity.validation as { expectedState?: { inspectedElement?: string } } | undefined
      )?.expectedState?.inspectedElement;
      const response = effectiveResponse as InvestigationResponse | undefined;
      const isValid = !expectedElement || response?.inspectedElement === expectedElement;
      result = {
        isValid,
        feedbackMessage: isValid
          ? "That's the right target and evidence field to inspect."
          : "That's not the element the symptom points to — look again.",
      };
    } else if (renderKind === "generic-demo" || currentActivity.type === "judgment") {
      result = {
        isValid: true,
        feedbackMessage: "Architectural judgment recorded and verified against rubric.",
      };
    } else {
      result = evaluateActivityValidation(currentActivity, effectiveResponse as never);
    }

    setLastValidationResult(result as ActivityValidationResult);
    resolveEvaluation(result, currentActivity.id);

    const stepName = originalActivity?.title || lesson.title;
    const attemptsSoFar = (currentActivityState?.attempts ?? 0) + 1;
    if (result.isValid) {
      recordCapabilityEvidence({
        id: `lesson:${lesson.id}:step:${currentActivity.id}`,
        title: `${lesson.title} — ${stepName}`,
        sourceType: "lesson",
        sourceId: lesson.id,
        status: attemptsSoFar >= 3 ? "demonstrated" : "mastered",
        evidenceStatus: "verified",
        summary: `Verified interactive check "${stepName}" in ${lesson.title}.`,
      });
    } else if (attemptsSoFar >= 2) {
      recordCapabilityEvidence({
        id: `lesson:${lesson.id}:step:${currentActivity.id}`,
        title: `${lesson.title} — ${stepName}`,
        sourceType: "lesson",
        sourceId: lesson.id,
        status: "needs-review",
        evidenceStatus: "needs-attention",
        summary: `Multiple attempts on "${stepName}" in ${lesson.title}.`,
      });
    }
  }, [
    currentActivity,
    renderKind,
    usesSandboxEvaluation,
    requestInteractiveEvaluation,
    originalActivity,
    activeResponse,
    startEvaluation,
    resolveEvaluation,
    lesson.id,
    lesson.title,
    currentActivityState?.attempts,
  ]);

  const handleRetry = useCallback(() => {
    setLastValidationResult(undefined);
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
        : currentActivity.type === "judgment"
          ? { kind: "none" }
          : {
              kind: "check",
              label: isSubmitted
                ? "Evaluating…"
                : currentActivity.type === "replicate-this"
                  ? "Verify Replication"
                  : "Check Answer",
              disabled: !canSubmit || isSubmitted,
              onClick: handleSubmit,
            };

  const handleBackNavigation = useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      window.location.href = "/learn";
    }
  }, [onBack]);

  if (isLessonComplete) {
    const interactiveActs = lesson.activities.filter(
      (a) => !NON_GRADED_DELEGATE_TYPES.has(a.type),
    );
    const verifiedCount = interactiveActs.filter((a) => {
      const st = session.activities[a.id];
      return st?.status === "passed" || st?.status === "completed";
    }).length;
    const flaggedTitles = interactiveActs
      .filter((a) => (session.activities[a.id]?.attempts ?? 0) >= 2)
      .map((a) => originalActivities[a.id]?.title || a.type);

    return (
      <LessonShell
        lessonId={lesson.id}
        lessonTitle={lesson.title}
        moduleTitle={moduleTitle}
        navigationMode={navigationMode}
        moduleLessons={moduleLessons}
        activityTitles={activityTitles}
        currentIndex={totalActivities}
        totalActivities={totalActivities}
        railNodes={railNodes}
        completedIds={session.completedActivityIds}
        onSelectActivity={goToActivity}
        currentMovement={movementForV1Role("completion", "completion")}
        mode="closing"
        stageWidth="reading"
        isBookmarked={isBookmarked}
        initialNote={initialNote}
        prevLessonId={prevLessonId}
        nextLessonId={nextLessonId}
        onToggleBookmark={onToggleBookmark}
        onSaveNote={onSaveNote}
        onNavigateLesson={onNavigateLesson}
        onBack={handleBackNavigation}
        onPrevious={goPrevious}
        canGoPrevious={false}
        footerAction={{ kind: "none" }}
      >
        <ClosureSurface
          lessonId={lesson.id}
          lessonTitle={lesson.title}
          moduleTitle={moduleTitle}
          capabilityStatements={lessonV1.learning.targetState.canDo}
          nextLessonLabel={nextLessonLabel}
          verifiedCheckCount={verifiedCount}
          totalInteractiveCount={interactiveActs.length}
          flaggedStepTitles={flaggedTitles}
          onContinueToNext={onContinueToNext}
          onReturnToModule={onReturnToModule}
        />
      </LessonShell>
    );
  }

  const resolvedHintsCount =
    (originalActivity?.hints?.length ??
      currentActivity?.feedback?.hints?.length ??
      0);

  const stepTitleText =
    originalActivity?.title || activityTitles[currentActivityIndex] || lesson.title;
  const rawStepInstruction =
    typeof (originalActivity as { prompt?: string; body?: string })?.prompt === "string"
      ? (originalActivity as { prompt?: string }).prompt
      : typeof (originalActivity as { body?: string })?.body === "string"
        ? (originalActivity as { body?: string }).body
        : lesson.description;

  return (
    <LessonShell
      lessonId={lesson.id}
      lessonTitle={lesson.title}
      moduleTitle={moduleTitle}
      navigationMode={navigationMode}
      moduleLessons={moduleLessons}
      activityTitles={activityTitles}
      currentIndex={currentActivityIndex}
      totalActivities={totalActivities}
      railNodes={railNodes}
      completedIds={session.completedActivityIds}
      onSelectActivity={goToActivity}
      currentMovement={currentMovement}
      mode={currentMode}
      stageWidth={stageWidth}
      isBookmarked={isBookmarked}
      initialNote={initialNote}
      prevLessonId={prevLessonId}
      nextLessonId={nextLessonId}
      onToggleBookmark={onToggleBookmark}
      onSaveNote={onSaveNote}
      onNavigateLesson={onNavigateLesson}
      onBack={handleBackNavigation}
      onPrevious={goPrevious}
      canGoPrevious={currentActivityIndex > 0}
      footerAction={footerAction}
    >
      {currentActivity && renderKind && originalActivity ? (
        <div className="space-y-4">
          <ActivityStage
            key={currentActivity.id}
            activity={currentActivity}
            renderKind={renderKind}
            originalActivity={originalActivity}
            lesson={lesson}
            lessonState={session}
            activityState={currentActivityState}
            validationResult={
              isCorrect || isIncorrect
                ? (lastValidationResult ??
                  (currentActivityState?.lastEvaluation as ActivityValidationResult | undefined))
                : undefined
            }
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
          <ForgeBuddyLessonCompanion
            lessonId={lesson.id}
            lessonTitle={lesson.title}
            moduleTitle={moduleTitle}
            lessonSummary={lesson.description}
            stepIndex={currentActivityIndex}
            totalSteps={totalActivities}
            stepTitle={stepTitleText}
            stepInstruction={rawStepInstruction}
            activityType={originalActivity.type || currentActivity.type}
            stepKind={originalActivity.role}
            isInteractive={isInteractive}
            status={effectiveStatus}
            attempts={currentActivityState?.attempts ?? 0}
            hintsAvailable={resolvedHintsCount}
            hintsRevealed={currentActivityState?.hintsRevealed ?? 0}
            lastFeedbackMessage={
              (
                lastValidationResult ??
                (currentActivityState?.lastEvaluation as
                  | ActivityValidationResult
                  | undefined)
              )?.feedbackMessage
            }
            onRevealHint={resolvedHintsCount > 0 ? handleRevealHint : undefined}
          />
        </div>
      ) : (
        <div className="py-16 text-center text-lesson-text-muted">
          No activities available in this lesson.
        </div>
      )}
    </LessonShell>
  );
}

