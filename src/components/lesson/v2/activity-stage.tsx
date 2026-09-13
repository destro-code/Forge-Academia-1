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
import { resolvePresentationFamily } from "./presentation";
import { SystemSurface } from "./system-surface";
import { CommitmentSurface } from "./commitment-surface";
import { InvestigationSurface } from "./investigation-surface";
import { CodeWorkspaceSurface } from "./code-workspace-surface";
import { ReasoningSurface } from "./reasoning-surface";
import type { InvestigationResponse } from "@/components/lesson/v1/investigation-debug-renderer";

export interface ActivityStageProps {
  activity: CanonicalActivity;
  renderKind: V1ActivityRenderKind;
  originalActivity: ActivityV1;
  lesson: CanonicalLesson;
  lessonState: LessonSessionState;
  activityState?: ActivitySessionState;
  validationResult?: ActivityValidationResult;
  onResponseChange: (response: unknown) => void;
  onSubmit: () => void;
  onRequestEvaluation?: (options?: { authoritative?: boolean }) => void;
  evaluationRequest?: EvaluationRequest;
  onRuntimeValidation?: (result: ActivityValidationResult) => void;
  onRetry: () => void;
  onRevealHint: () => void;
  onContinue: () => void;
  /** Carried forward from an earlier investigation, if one exists in this lesson — see code-workspace-surface.tsx. */
  carriedInvestigationEvidence?: { targetElement: string; fields: string[] };
}

/**
 * Single per-activity dispatch point for the v2 player. Resolves a
 * presentation family via the registry (§4 of the blueprint) and renders
 * the matching v2 surface. `delegate-layer1` activities still pass through
 * the real, unmodified `CanonicalActivityView` — this component only adds
 * v2 framing around that delegation, exactly the boundary discipline the
 * vertical slice established in `v1-activity-view.tsx`, generalized.
 */
export function ActivityStage(props: ActivityStageProps) {
  const {
    activity,
    renderKind,
    originalActivity,
    lesson,
    lessonState,
    activityState,
    validationResult,
    onResponseChange,
    onSubmit,
    onRequestEvaluation,
    evaluationRequest,
    onRuntimeValidation,
    onRetry,
    onRevealHint,
    onContinue,
    carriedInvestigationEvidence,
  } = props;

  const family = resolvePresentationFamily(originalActivity.type);
  const status = activityState ? mapSessionStatus(activityState.status) : "idle";

  const delegated = (
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
  );

  switch (family) {
    case "system":
      return <SystemSurface>{delegated}</SystemSurface>;

    case "commitment": {
      if (renderKind !== "prediction") return delegated; // multiple-choice/output-prediction share the delegated path today (shared-primitive status)
      const content = originalActivity.content as PredictionContentV1;
      return (
        <CommitmentSurface
          title={originalActivity.title}
          instruction={originalActivity.instruction}
          content={content}
          status={status}
          response={activityState?.response as string | undefined}
          onResponse={onResponseChange as (r: string) => void}
          validationResult={validationResult}
        />
      );
    }

    case "investigation": {
      const content = originalActivity.content as DebugContentV1;
      return (
        <InvestigationSurface
          title={originalActivity.title}
          instruction={originalActivity.instruction}
          content={content}
          status={status}
          response={activityState?.response as InvestigationResponse | undefined}
          onResponse={onResponseChange as (r: InvestigationResponse) => void}
          validationResult={validationResult}
        />
      );
    }

    case "code-workspace":
      return <CodeWorkspaceSurface carriedEvidence={carriedInvestigationEvidence}>{delegated}</CodeWorkspaceSurface>;

    case "reasoning": {
      if (renderKind === "delegate-layer1") {
        return <ReasoningSurface kind="reflection">{delegated}</ReasoningSurface>;
      }
      // judgment via the generic-demo fallback (see reasoning-surface.tsx doc)
      const demoContent = originalActivity.content as InteractiveDemoContentV1 & { scenario?: string };
      return (
        <ReasoningSurface
          kind="judgment"
          title={originalActivity.title}
          instruction={originalActivity.instruction}
          bodyText={demoContent.expectedStatus ?? demoContent.scenario}
          status={status}
          response={activityState?.response as { acknowledged: true } | undefined}
          onResponse={onResponseChange as (r: { acknowledged: true }) => void}
          hasContentGap
        />
      );
    }

    case "seeing":
    case "reading":
    case "closure":
      // shared-primitive / delegate today — no dedicated v2 framing built yet beyond Layer 1's own renderer.
      return delegated;

    case "selection":
    case "assembly":
      // Registry marks these not-yet-supported; resolvePresentationFamily
      // already throws before reaching here for those types. This branch
      // exists only for TypeScript exhaustiveness.
      return delegated;

    default:
      return delegated;
  }
}
