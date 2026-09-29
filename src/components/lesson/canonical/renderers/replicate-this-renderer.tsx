import { useCallback, useEffect, useMemo, useRef, useState, useId } from "react";
import type { ActivityRendererProps, ActivityValidationResult } from "../types";
import type { ReplicateThisActivity, EvaluationResult, EvaluationSummary } from "@/lib/curriculum/replication/types";
import { ReplicationEvaluator } from "@/lib/curriculum/replication/evaluator";
import { StageViewport } from "./replicate-this/stage-viewport";
import { DiagnosticChecklist } from "./replicate-this/diagnostic-checklist";
import { LessonCodeEditor } from "@/components/shared/lesson-editor/lesson-code-editor";
import { ActivityContainer } from "../primitives/activity-container";
import { ActivityHeader } from "../primitives/activity-header";
import { ActivityFeedback } from "../primitives/activity-feedback";
import { Button } from "@/components/ui/button";
import {
  Code2,
  FileCode,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Builds initial pending evaluation results for display before the first evaluation run.
 */
function buildInitialPendingResults(activity: ReplicateThisActivity): EvaluationResult[] {
  const { structuralRules, styleRules, prohibitedPatterns } = activity.content.evaluation;
  const initial: EvaluationResult[] = [];

  for (const rule of structuralRules) {
    initial.push({
      ruleId: rule.id,
      category: "structure",
      description: rule.description,
      passed: false,
      feedback: "Pending verification against target specification.",
    });
  }

  for (const rule of styleRules) {
    initial.push({
      ruleId: rule.id,
      category: "style",
      description: rule.description,
      passed: false,
      feedback: "Pending verification against target specification.",
    });
  }

  if (prohibitedPatterns) {
    for (const pat of prohibitedPatterns) {
      initial.push({
        ruleId: pat.id,
        category: "engineering",
        description:
          pat.rule === "no-inline-styles"
            ? "No inline style attributes"
            : pat.rule === "no-absolute-position-hacks"
            ? "No absolute positioning hacks"
            : "Semantic elements only",
        passed: false,
        feedback: "Pending anti-pattern inspection.",
      });
    }
  }

  return initial;
}

export function ReplicateThisRenderer({
  activity,
  state,
  onResponse,
  onSubmit,
  evaluationRequest,
  onRequestEvaluation,
  onRuntimeValidation,
  onRetry,
  onContinue,
  onRevealHint,
  readOnly,
}: ActivityRendererProps<ReplicateThisActivity, string>) {
  const { stage, prompt, workspace, target, hints } = activity.content;
  const starterHtml = workspace.starterHtml || "";
  const starterCss = workspace.starterCss || "";
  const availableTokens = workspace.availableTokens || [];

  // Code state
  const initialHtml = typeof state.response === "string" && state.response.length > 0
    ? state.response
    : starterHtml;
  const [userHtml, setUserHtml] = useState<string>(initialHtml);
  const [userCss, setUserCss] = useState<string>(starterCss);
  const [activeCodeTab, setActiveCodeTab] = useState<"html" | "css">("html");

  // Live DOM reference from user iframe
  const userDocumentRef = useRef<Document | null>(null);

  // Evaluation state
  const [evaluationSummary, setEvaluationSummary] = useState<EvaluationSummary | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(
    state.status === "submitted" || state.status === "correct" || state.status === "incorrect" || state.status === "completed",
  );

  const initialResults = useMemo(() => buildInitialPendingResults(activity), [activity]);
  const activeResults = evaluationSummary ? evaluationSummary.results : initialResults;

  // Sync state.response into userHtml if reset occurs
  const previousStatusRef = useRef(state.status);
  useEffect(() => {
    const wasReset = previousStatusRef.current !== "idle" && state.status === "idle";
    const wasRetry = previousStatusRef.current !== "retrying" && state.status === "retrying";
    previousStatusRef.current = state.status;

    if (wasReset || wasRetry) {
      setUserHtml(starterHtml);
      setUserCss(starterCss);
      onResponse(starterHtml);
      setEvaluationSummary(null);
      setIsSubmitted(false);
    }
  }, [state.status, starterHtml, starterCss, onResponse]);

  // Handle live document capture from stage viewport
  const handleUserDocumentReady = useCallback((doc: Document) => {
    userDocumentRef.current = doc;
  }, []);

  // Update HTML code and notify outer harness
  const handleHtmlChange = useCallback(
    (newHtml: string) => {
      setUserHtml(newHtml);
      onResponse(newHtml);
    },
    [onResponse],
  );

  const handleCssChange = useCallback((newCss: string) => {
    setUserCss(newCss);
  }, []);

  // Token chip click handler (for guided stage)
  const handleInsertToken = useCallback(
    (token: string) => {
      if (activeCodeTab === "html") {
        setUserHtml((prev) => {
          // If there's an editable placeholder like <!-- SLOT --> or [TOKEN], replace it
          if (prev.includes("<!-- SLOT -->")) {
            const next = prev.replace("<!-- SLOT -->", token);
            onResponse(next);
            return next;
          }
          const next = prev ? `${prev}\n${token}` : token;
          onResponse(next);
          return next;
        });
      } else {
        setUserCss((prev) => (prev ? `${prev}\n${token}` : token));
      }
    },
    [activeCodeTab, onResponse],
  );

  // Core evaluation runner
  const runEvaluation = useCallback(
    (authoritative = true) => {
      let doc = userDocumentRef.current;

      // Fallback: parse standalone DOM if iframe document is not accessible
      if (!doc && typeof DOMParser !== "undefined") {
        try {
          const parser = new DOMParser();
          const markup = `<!DOCTYPE html><html><head><style>${userCss}</style></head><body>${userHtml}</body></html>`;
          doc = parser.parseFromString(markup, "text/html");
        } catch {
          // Fallback parsing failed
        }
      }

      const summary = ReplicationEvaluator.evaluate(doc as Document, activity.content);
      setEvaluationSummary(summary);
      setIsSubmitted(true);

      const passRatio = summary.totalCount > 0 ? summary.passCount / summary.totalCount : 0;
      const score = Math.round(passRatio * 100);

      const validationResult: ActivityValidationResult = {
        isValid: summary.isFullyReplicated,
        score,
        feedbackMessage: summary.isFullyReplicated
          ? activity.feedback?.correct || "Pixel-perfect replication achieved! All invariants verified."
          : activity.feedback?.incorrect || "Some replication requirements are not met yet. Check the checklist below.",
        details: {
          passCount: summary.passCount,
          totalCount: summary.totalCount,
        },
      };

      if (authoritative) {
        onRuntimeValidation?.(validationResult);
      }

      return summary;
    },
    [userHtml, userCss, activity, onRuntimeValidation],
  );

  // Authoritative evaluation request from player footer
  const lastEvaluationRequestRef = useRef<string | null>(null);
  const evaluationAttemptId = evaluationRequest?.attemptId;
  useEffect(() => {
    if (!evaluationRequest || evaluationRequest.activityId !== activity.id || !evaluationAttemptId) {
      return;
    }
    if (lastEvaluationRequestRef.current === evaluationAttemptId) return;
    lastEvaluationRequestRef.current = evaluationAttemptId;

    runEvaluation(evaluationRequest.authoritative !== false);
  }, [activity.id, evaluationAttemptId, evaluationRequest, runEvaluation]);

  // Local manual check button handler
  const handleManualCheck = useCallback(() => {
    if (onRequestEvaluation) {
      onRequestEvaluation({ authoritative: true });
    } else {
      const summary = runEvaluation(true);
      if (onSubmit) onSubmit();
    }
  }, [onRequestEvaluation, runEvaluation, onSubmit]);

  const resolvedHints = activity.feedback?.hints || hints;
  const hintsRemaining = (resolvedHints?.length || 0) - (state.hintsRevealed || 0);

  return (
    <ActivityContainer variant="workspace" className="p-0 overflow-hidden border border-border">
      {/* Activity Header */}
      <ActivityHeader
        activity={activity as any}
        title={prompt || "Replicate This"}
        onRevealHint={onRevealHint}
        hintsRemaining={hintsRemaining}
      />

      {/* Main Workspace Grid: Mobile-First Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[640px] divide-y lg:divide-y-0 lg:divide-x divide-border">
        {/* Left Column (lg: 5 cols): Mobile Viewport Stage & Diagnostic Checklist */}
        <div className="lg:col-span-5 p-4 sm:p-5 flex flex-col gap-4 bg-muted/20 overflow-y-auto">
          <StageViewport
            targetHtml={target.html}
            targetCss={target.css}
            userHtml={userHtml}
            userCss={userCss}
            viewportHeight={target.viewportHeight || 380}
            onUserDocumentReady={handleUserDocumentReady}
          />

          <DiagnosticChecklist
            results={activeResults}
            isSubmitted={isSubmitted}
            className="mt-2"
          />
        </div>

        {/* Right Column (lg: 7 cols): Editor, Token Bank, and Controls */}
        <div className="lg:col-span-7 flex flex-col bg-card">
          {/* Editor Header Bar with Tabs and Reset */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b border-border text-xs">
            <div className="flex items-center gap-1.5" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeCodeTab === "html"}
                onClick={() => setActiveCodeTab("html")}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors",
                  activeCodeTab === "html"
                    ? "bg-background text-foreground shadow-xs font-semibold border border-border/80"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Code2 className="w-3.5 h-3.5 text-orange-400" />
                <span>HTML</span>
              </button>

              {(starterCss || target.css) && (
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeCodeTab === "css"}
                  onClick={() => setActiveCodeTab("css")}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors",
                    activeCodeTab === "css"
                      ? "bg-background text-foreground shadow-xs font-semibold border border-border/80"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <FileCode className="w-3.5 h-3.5 text-blue-400" />
                  <span>CSS</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setUserHtml(starterHtml);
                  setUserCss(starterCss);
                  onResponse(starterHtml);
                }}
                disabled={readOnly}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Reset Code
              </Button>
            </div>
          </div>

          {/* Guided Stage Token Bank */}
          {stage === "guided" && availableTokens.length > 0 && (
            <div className="p-3 bg-muted/20 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-primary" /> Token Bank (Click to insert)
                </span>
                <span className="text-[10px] text-muted-foreground">Guided Scaffolding</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {availableTokens.map((token, idx) => (
                  <button
                    key={`${token}-${idx}`}
                    type="button"
                    onClick={() => handleInsertToken(token)}
                    disabled={readOnly}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-muted/80 hover:bg-primary/20 text-foreground hover:text-primary border border-border/70 hover:border-primary/40 text-xs font-mono transition-all duration-150 active:scale-95 shadow-xs"
                    title={`Insert "${token}"`}
                  >
                    <Plus className="w-3 h-3 opacity-60" />
                    <span>{token}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Code Editor Body */}
          <div className="flex-1 min-h-[360px] relative bg-[#090a0c]">
            {activeCodeTab === "html" ? (
              <LessonCodeEditor
                value={userHtml}
                onChange={handleHtmlChange}
                language="html"
                readOnly={readOnly}
                className="h-full min-h-[360px]"
                aria-label="HTML Code Workspace"
              />
            ) : (
              <LessonCodeEditor
                value={userCss}
                onChange={handleCssChange}
                language="css"
                readOnly={readOnly}
                className="h-full min-h-[360px]"
                aria-label="CSS Code Workspace"
              />
            )}
          </div>

          {/* Editor Footer / Local Verification Action Bar */}
          <div className="p-3 bg-muted/30 border-t border-border flex items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              {evaluationSummary ? (
                evaluationSummary.isFullyReplicated ? (
                  <span className="text-emerald-400 font-medium inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Replicated ({evaluationSummary.passCount}/{evaluationSummary.totalCount})
                  </span>
                ) : (
                  <span className="text-amber-400 font-medium inline-flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {evaluationSummary.passCount}/{evaluationSummary.totalCount} Invariants Passing
                  </span>
                )
              ) : (
                <span>Switch to <strong>Compare</strong> mode to view difference overlay</span>
              )}
            </div>

            <Button
              type="button"
              size="sm"
              onClick={handleManualCheck}
              disabled={readOnly}
              className="px-4 font-semibold shadow-xs"
            >
              Check Invariants
            </Button>
          </div>
        </div>
      </div>

      {/* Primary Feedback banner when submitted */}
      {isSubmitted && evaluationSummary && (
        <ActivityFeedback
          isCorrect={evaluationSummary.isFullyReplicated}
          feedback={
            evaluationSummary.isFullyReplicated
              ? activity.feedback?.correct || "Pixel-perfect replication achieved! All structural and style invariants verified."
              : activity.feedback?.incorrect || "Some requirements are not met yet. Check the diagnostic checklist above."
          }
        />
      )}
    </ActivityContainer>
  );
}
