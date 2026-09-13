import type { CanonicalActivity, CanonicalLesson } from "@/lib/curriculum/types";
import type { ActivitySessionState, LessonSessionState } from "@/lib/learning-engine/types";
import type { ActivityV1 } from "@/lib/curriculum/types-v1";
import type { V1ActivityRenderKind } from "@/lib/curriculum/v1/adapter";
import type {
  InteractiveDemoContentV1,
  PredictionContentV1,
  DebugContentV1,
} from "@/lib/curriculum/v1/content-schemas";
import { CanonicalActivityView } from "@/components/lesson/canonical/canonical-activity-view";
import { mapSessionStatus } from "@/components/lesson/canonical/runtime/use-activity-runtime";
import type { EvaluationRequest, ActivityValidationResult } from "@/components/lesson/canonical/types";
import { PredictionRenderer } from "./prediction-renderer";
import { InvestigationDebugRenderer, type InvestigationResponse } from "./investigation-debug-renderer";
import { GenericDemoPanel } from "./generic-demo-panel";

export interface V1ActivityViewProps {
  activity: CanonicalActivity;
  renderKind: V1ActivityRenderKind;
  originalActivity: ActivityV1;
  lesson: CanonicalLesson;
  lessonState: LessonSessionState;
  activityState?: ActivitySessionState;
  onResponseChange: (response: unknown) => void;
  onSubmit: () => void;
  onRequestEvaluation?: (options?: { authoritative?: boolean }) => void;
  evaluationRequest?: EvaluationRequest;
  onRuntimeValidation?: (result: ActivityValidationResult) => void;
  onRetry: () => void;
  onRevealHint: () => void;
  onContinue: () => void;
  className?: string;
}

/**
 * The single per-activity dispatch point for V1 lessons. `delegate-layer1`
 * activities render through the real, unmodified `CanonicalActivityView` —
 * this is the actual reuse boundary for Layer 1's sandbox runtime,
 * account-settings visual, and reflection renderer. The other three kinds
 * render a V1-native component directly against the original V1 content.
 */
export function V1ActivityView({
  activity,
  renderKind,
  originalActivity,
  lesson,
  lessonState,
  activityState,
  onResponseChange,
  onSubmit,
  onRequestEvaluation,
  evaluationRequest,
  onRuntimeValidation,
  onRetry,
  onRevealHint,
  onContinue,
  className,
}: V1ActivityViewProps) {
  if (renderKind === "delegate-layer1") {
    return (
      <div className={className}>
        <CanonicalActivityView
          activity={activity}
          activityState={activityState}
          lesson={lesson}
          lessonState={lessonState}
          onResponseChange={onResponseChange}
          onSubmit={onSubmit}
          onRequestEvaluation={onRequestEvaluation}
          evaluationRequest={evaluationRequest}
          onRuntimeValidation={onRuntimeValidation}
          onRetry={onRetry}
          onRevealHint={onRevealHint}
          onComplete={onContinue}
        />
      </div>
    );
  }

  const status = activityState ? mapSessionStatus(activityState.status) : "idle";

  if (renderKind === "prediction") {
    const content = originalActivity.content as PredictionContentV1;
    return (
      <div className={className}>
        <PredictionRenderer
          title={originalActivity.title}
          instruction={originalActivity.instruction}
          content={content}
          state={{ status, response: activityState?.response as string | undefined }}
          onResponse={onResponseChange}
        />
      </div>
    );
  }

  if (renderKind === "investigation") {
    const content = originalActivity.content as DebugContentV1;
    return (
      <div className={className}>
        <InvestigationDebugRenderer
          title={originalActivity.title}
          instruction={originalActivity.instruction}
          content={content}
          state={{ status, response: activityState?.response as InvestigationResponse | undefined }}
          onResponse={onResponseChange}
        />
      </div>
    );
  }

  // generic-demo: interactive-demo (no systemComponent) or judgment (no authored options)
  const demoContent = originalActivity.content as InteractiveDemoContentV1 & { scenario?: string };
  return (
    <div className={className}>
      <GenericDemoPanel
        title={originalActivity.title}
        instruction={originalActivity.instruction}
        bodyText={demoContent.expectedStatus ?? demoContent.scenario}
        state={{ status, response: activityState?.response as { acknowledged: true } | undefined }}
        onResponse={onResponseChange}
      />
    </div>
  );
}
