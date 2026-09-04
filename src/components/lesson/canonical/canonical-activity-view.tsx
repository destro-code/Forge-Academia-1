import { useMemo, useEffect } from "react";
import type { CanonicalActivity, CanonicalLesson } from "@/lib/curriculum/types";
import type {
  ActivitySessionState,
  LessonSessionState,
  MisconceptionMatchResult,
} from "@/lib/learning-engine/types";
import type { ActivityValidationResult, ActivityCompletionEvent } from "./types";
import { renderActivity } from "./registry";
import { useActivityRuntime } from "./runtime/use-activity-runtime";
import { interpretExperience } from "./experience/experience-interpreter";
import { composeExperience } from "./experience/experience-composer";
import type {
  ExperienceInterpretation,
  ExperienceComposition,
} from "./experience/experience-types";

export interface CanonicalActivityViewProps {
  activity: CanonicalActivity;
  activityState?: ActivitySessionState;
  lesson?: CanonicalLesson;
  lessonState?: LessonSessionState;
  onComplete?: (event: ActivityCompletionEvent<unknown>) => void;
  onResponseChange?: (response: unknown) => void;
  onSubmit?: () => void;
  evaluationRequest?: import("./types").EvaluationRequest;
  onRequestEvaluation?: (options?: { authoritative?: boolean }) => void;
  onRuntimeValidation?: (result: ActivityValidationResult) => void;
  onRetry?: () => void;
  onContinue?: () => void;
  onRevealHint?: () => void;
  matchedMisconception?: MisconceptionMatchResult | null;
  readOnly?: boolean;
  className?: string;
  onExperienceCompositionChange?: (composition: ExperienceComposition) => void;
  onExperienceInterpretationChange?: (interpretation: ExperienceInterpretation) => void;
}

export function CanonicalActivityView(props: CanonicalActivityViewProps) {
  const {
    activity,
    activityState,
    lesson,
    lessonState,
    matchedMisconception,
    readOnly,
    className,
    onExperienceCompositionChange,
    onExperienceInterpretationChange,
  } = props;
  const runtime = useActivityRuntime(props);

  // Pure, observational experience metadata derivation
  const interpretation = useMemo(
    () =>
      interpretExperience({
        activity,
        activityState,
        lesson,
        lessonState,
        evaluationResult: activityState?.lastEvaluation,
        matchedMisconception,
      }),
    [activity, activityState, lesson, lessonState, matchedMisconception],
  );

  const composition = useMemo(() => composeExperience(interpretation), [interpretation]);

  useEffect(() => {
    onExperienceInterpretationChange?.(interpretation);
    onExperienceCompositionChange?.(composition);
  }, [
    interpretation,
    composition,
    onExperienceInterpretationChange,
    onExperienceCompositionChange,
  ]);

  return (
    <div
      className={className}
      data-testid="canonical-activity-view"
      data-experience-mode={composition.mode}
      data-spatial-mode={composition.spatialMode}
      data-density={composition.density}
      data-focal-surface={composition.focalSurface}
    >
      {renderActivity(activity, {
        state: runtime.state,
        onResponse: runtime.actions.respond,
        onSubmit: props.onSubmit ?? runtime.actions.submit,
        evaluationRequest: props.evaluationRequest,
        onRequestEvaluation: props.onRequestEvaluation,
        onRuntimeValidation: props.onRuntimeValidation,
        onRetry: runtime.actions.retry,
        onContinue: runtime.actions.continue,
        onRevealHint: runtime.actions.revealHint,
        readOnly: readOnly,
        experienceComposition: composition,
      })}
    </div>
  );
}
