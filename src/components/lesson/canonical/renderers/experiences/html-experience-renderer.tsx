import { useCallback, useEffect, useRef } from "react";
import type { InteractiveCodeActivity } from "@/lib/curriculum/types";
import type { ActivityRendererProps, ActivityValidationResult } from "../../types";
import type { MarkupExperience } from "@/lib/curriculum/experience";
import { useExperienceController } from "../../runtime/use-experience-controller";
import { ActivityContainer } from "../../primitives/activity-container";
import { ActivityHeader } from "../../primitives/activity-header";
import { ActivityFeedback } from "../../primitives/activity-feedback";
import { ActivityActions } from "../../primitives/activity-actions";
import { LessonCodeEditor } from "@/components/shared/lesson-editor/lesson-code-editor";
import { ExperienceActionBar } from "./shared/experience-action-bar";
import { SandboxPreviewFrame } from "./shared/sandbox-preview-frame";
import { TestResultsPanel } from "./shared/test-results-panel";
import { Button } from "@/components/ui/button";
import { Lightbulb, FileCode2, MonitorPlay, RefreshCw, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HtmlExperienceRendererProps extends ActivityRendererProps<
  InteractiveCodeActivity,
  string
> {
  experience?: MarkupExperience;
}

/**
 * The document-building experience: "I am building a document." Editor and
 * rendered preview sit together in a continuous learning workspace so structure
 * and result stay in view together with immediate visual feedback as HTML is authored.
 */
export function HtmlExperienceRenderer({
  activity,
  state,
  onResponse,
  onSubmit,
  onRetry,
  onContinue,
  onRevealHint,
  readOnly,
  evaluationRequest,
  onRuntimeValidation,
}: HtmlExperienceRendererProps) {
  const { starterCode, testCases } = activity.content;
  const taskTitle = activity.content.title || "Build the document";
  const taskInstructions = activity.content.instructions || activity.content.prompt || "";
  const currentCode = typeof state.response === "string" ? state.response : starterCode;

  const sourceRef = useRef(currentCode);
  sourceRef.current = currentCode;
  const getSource = useCallback(() => sourceRef.current, []);

  const controller = useExperienceController({ activity, getSource });
  const isCorrect = state.status === "correct" || state.status === "completed";
  const resolvedHints = activity.feedback?.hints || activity.content?.hints;
  const hintsRemaining = (resolvedHints?.length || 0) - state.hintsRevealed;

  const runRef = useRef(controller.run);
  runRef.current = controller.run;
  const isInitialMount = useRef(true);

  // Auto-run on mount so the learner immediately sees the starter HTML rendered in the preview
  useEffect(() => {
    const timer = setTimeout(() => {
      runRef.current();
    }, 60);
    return () => clearTimeout(timer);
  }, []);

  // Debounced live update (350ms): as the learner types HTML, re-render the preview automatically
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const timer = setTimeout(() => {
      runRef.current();
    }, 350);
    return () => clearTimeout(timer);
  }, [currentCode]);

  // Handle authoritative evaluation requests from canonical player dock
  const lastEvaluationRequestRef = useRef<string | null>(null);
  const authoritativeEvaluationRef = useRef(false);
  const evaluationAttemptId = evaluationRequest?.attemptId;

  useEffect(() => {
    if (!evaluationRequest || evaluationRequest.activityId !== activity.id || !evaluationAttemptId)
      return;
    if (lastEvaluationRequestRef.current === evaluationAttemptId) return;
    lastEvaluationRequestRef.current = evaluationAttemptId;
    authoritativeEvaluationRef.current = evaluationRequest.authoritative !== false;
    controller.check();
  }, [activity.id, controller, evaluationAttemptId, evaluationRequest]);

  // Report technical evaluation results back to player
  const lastProcessedResultRef = useRef<ActivityValidationResult | null>(null);
  useEffect(() => {
    if (!controller.technicalResult) return;
    if (lastProcessedResultRef.current === controller.technicalResult) return;
    lastProcessedResultRef.current = controller.technicalResult;
    if (authoritativeEvaluationRef.current) {
      onRuntimeValidation?.(controller.technicalResult);
    }
    authoritativeEvaluationRef.current = false;
  }, [controller.technicalResult, onRuntimeValidation]);

  const handleReset = useCallback(() => {
    controller.reset();
    onResponse(starterCode);
    setTimeout(() => {
      runRef.current();
    }, 60);
  }, [controller, onResponse, starterCode]);

  return (
    <ActivityContainer id={`activity-${activity.id}`} variant="workspace">
      <ActivityHeader
        activity={activity}
        onRevealHint={onRevealHint}
        hintsRemaining={hintsRemaining}
      />

      <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(240px,0.75fr)_minmax(0,1.25fr)]">
        <aside className="space-y-5">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-lesson-text-muted bg-lesson-surface-subtle border border-lesson-border/60">
              Document Workspace
            </span>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-lesson-text-primary">
              {taskTitle}
            </h2>
          </div>
          {taskInstructions ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-lesson-text-secondary">
              {taskInstructions}
            </p>
          ) : null}

          {testCases && testCases.length > 0 && (
            <div className="space-y-2 border-t border-lesson-border/60 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-lesson-text-muted">
                Document Requirements
              </p>
              <div className="space-y-2">
                {testCases.map((tc, idx) => (
                  <div
                    key={tc.id || idx}
                    className="flex items-start gap-2.5 rounded-lg border border-lesson-border/40 bg-lesson-surface-subtle/30 px-3 py-2 text-xs leading-relaxed text-lesson-text-secondary"
                  >
                    <span className="mt-0.5 select-none font-mono text-[var(--m-accent)]">•</span>
                    <span>{tc.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {onRevealHint && hintsRemaining > 0 && (
            <Button
              variant="ghost"
              onClick={onRevealHint}
              className="min-h-11 w-full justify-start gap-2 px-3 text-sm text-lesson-text-secondary hover:bg-lesson-surface hover:text-lesson-text-primary"
            >
              <Lightbulb className="h-4 w-4 text-amber-400" />
              Hint · {hintsRemaining} remaining
            </Button>
          )}
        </aside>

        <section className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-lesson-border pb-2">
            <div className="flex items-center gap-2 text-xs text-lesson-text-muted">
              <span className="font-mono font-semibold text-lesson-text-primary">HTML</span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Preview
              </span>
            </div>
            <ExperienceActionBar
              onRun={controller.run}
              onCheck={controller.check}
              onReset={handleReset}
              isRunning={controller.isRunning}
              isLocked={isCorrect}
              disabled={readOnly || !currentCode}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-lesson-text-muted">
              <div className="flex items-center gap-1.5">
                <FileCode2 className="h-3.5 w-3.5 text-lesson-text-secondary" />
                <span>HTML Source</span>
              </div>
            </div>
            <LessonCodeEditor
              value={currentCode}
              language="html"
              onChange={(value) => onResponse(value || "")}
              readOnly={readOnly || isCorrect}
              className="min-h-[14rem] md:min-h-[18rem]"
              aria-label="HTML document editor"
              id={`lesson-code-editor-${activity.id}`}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-lesson-text-muted">
              <div className="flex items-center gap-1.5">
                <MonitorPlay className="h-3.5 w-3.5 text-lesson-text-secondary" />
                <span>Rendered Document</span>
              </div>
              <button
                type="button"
                onClick={() => controller.run()}
                className="inline-flex min-h-8 items-center gap-1 text-[11px] text-lesson-text-muted hover:text-lesson-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lesson-focus-ring"
                title="Force refresh preview"
              >
                <RefreshCw className={cn("h-3 w-3", controller.isRunning && "animate-spin")} />
                <span>Refresh</span>
              </button>
            </div>
            <SandboxPreviewFrame
              iframeRef={controller.iframeRef}
              title={controller.iframeTitle}
              sandbox={controller.iframeSandbox}
              ariaLabel="Rendered document preview"
              className="min-h-[14rem] md:min-h-[18rem]"
            />
          </div>

          {controller.hasExecuted && (
            <TestResultsPanel
              results={controller.testResults}
              successMessage={
                activity.feedback?.correct || "Your document meets every requirement."
              }
              failureMessage={
                activity.feedback?.incorrect ||
                "Review the requirements below and adjust your structure."
              }
            />
          )}

          {isCorrect && (
            <div className="flex items-center gap-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2.5 text-xs text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span className="font-medium">
                {activity.feedback?.correct || "All requirements verified! Ready to continue."}
              </span>
            </div>
          )}
        </section>
      </div>

      <ActivityFeedback
        status={state.status}
        validationResult={state.validationResult}
        hints={resolvedHints}
        hintsRevealed={state.hintsRevealed}
      />
      <ActivityActions
        status={state.status}
        onSubmit={onSubmit}
        onRetry={onRetry}
        onContinue={onContinue}
        canSubmit={Boolean(currentCode)}
      />
    </ActivityContainer>
  );
}
