import type { OutputPredictionActivity } from "@/lib/curriculum/types";
import type { ActivityRendererProps } from "../types";
import { ActivityContainer } from "../primitives/activity-container";
import { ActivityHeader } from "../primitives/activity-header";
import { ActivityFeedback } from "../primitives/activity-feedback";
import { ActivityActions } from "../primitives/activity-actions";
import { MovementScene } from "../primitives/movement-scene";
import { CodeBlock } from "@/components/shared/code-block";
import {
  CheckCircle2,
  XCircle,
  GitBranch,
  Target,
  ShieldCheck,
  BookOpen,
  Terminal,
  Code2,
  CornerDownLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function OutputPredictionRenderer({
  activity,
  state,
  onResponse,
  onSubmit,
  onRetry,
  onContinue,
  onRevealHint,
  readOnly,
  className,
  experienceComposition,
}: ActivityRendererProps<OutputPredictionActivity, string>) {
  const { code, language, prompt, options, explanation } = activity.content;

  const currentPrediction = typeof state.response === "string" ? state.response : "";

  const isSubmitted =
    state.status === "submitted" || state.status === "correct" || state.status === "incorrect";
  const isCorrect = state.status === "correct" || state.status === "completed";
  const isIncorrect = state.status === "incorrect";

  const hintsRemaining = (activity.feedback?.hints?.length || 0) - state.hintsRevealed;
  const hasOptions = Array.isArray(options) && options.length > 0;

  const isPrediction =
    activity.intent === "prediction" || experienceComposition?.mode === "predict";

  const eyebrowConfig = (() => {
    if (experienceComposition?.badgeText) {
      return {
        label: experienceComposition.badgeText,
        tagline: experienceComposition.prompt || "Trace the code and predict the observable output",
        icon: GitBranch,
      };
    }
    if (isPrediction) {
      return {
        label: "Runtime Prediction",
        tagline: "Trace the execution path and predict the observable output",
        icon: GitBranch,
      };
    }
    switch (activity.intent) {
      case "application":
        return {
          label: "Code Trace",
          tagline: "Follow the execution flow to determine the system outcome",
          icon: Target,
        };
      case "retrieval":
        return {
          label: "Execution Recall",
          tagline: "Recall the evaluation semantics and predict the result",
          icon: BookOpen,
        };
      case "assessment":
        return {
          label: "Mental Execution",
          tagline: "Mentally execute the program and commit your prediction",
          icon: ShieldCheck,
        };
      default:
        return {
          label: "Mental Execution",
          tagline: "Trace the code before predicting the observable result",
          icon: Terminal,
        };
    }
  })();

  const handleOptionKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    if (readOnly || (isSubmitted && isCorrect) || !options) return;

    let targetIndex: number | null = null;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      targetIndex = (currentIndex + 1) % options.length;
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      targetIndex = (currentIndex - 1 + options.length) % options.length;
    }

    if (targetIndex !== null && options[targetIndex] !== undefined) {
      onResponse(options[targetIndex]);
      const buttons = document.querySelectorAll<HTMLButtonElement>(
        `[role="radiogroup"][data-activity-id="${activity.id}"] button[role="radio"]`,
      );
      buttons[targetIndex]?.focus();
    }
  };

  return (
    <ActivityContainer id={`activity-${activity.id}`} variant="standard" className={className}>
      <ActivityHeader
        activity={activity}
        onRevealHint={onRevealHint}
        hintsRemaining={hintsRemaining}
      />

      <MovementScene className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-8 sm:py-8 flex flex-col gap-6">
        {/* Dominant Prompt Surface */}
        <header className="space-y-2.5">
          <div className="inline-flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-[0.14em] text-lesson-accent flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-lesson-accent/30 bg-lesson-accent/10">
              <eyebrowConfig.icon className="w-3.5 h-3.5" />
              <span>{eyebrowConfig.label}</span>
            </span>
            <span className="text-xs text-lesson-text-muted hidden sm:inline">
              {eyebrowConfig.tagline}
            </span>
          </div>

          <h2
            id={`prompt-${activity.id}`}
            className="text-xl sm:text-2xl lg:text-[1.75rem] font-bold leading-snug tracking-tight text-lesson-text-primary text-pretty"
          >
            {prompt}
          </h2>
        </header>

        {/* Code to Inspect (Evidence Surface) */}
        {code && (
          <section className="space-y-2" aria-label="Code to inspect">
            <div className="flex items-center justify-between text-xs font-medium text-lesson-text-muted">
              <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider">
                <Code2 className="w-3.5 h-3.5 text-lesson-accent" />
                <span>Code to Trace</span>
              </span>
              <span className="font-mono text-[11px] uppercase tracking-wider text-lesson-text-muted/80">
                {language || "code"}
              </span>
            </div>

            <div className="rounded-xl overflow-hidden border border-lesson-border bg-lesson-surface shadow-xs">
              <CodeBlock code={code} language={language} showTryIt={false} />
            </div>
          </section>
        )}

        {/* Prediction Surface */}
        <section className="space-y-3" aria-label="Prediction surface">
          <div className="flex items-center justify-between text-xs font-medium text-lesson-text-muted">
            <span>
              {hasOptions
                ? "Select predicted execution outcome:"
                : "Enter predicted console / return output:"}
            </span>
            {hasOptions && (
              <span className="font-mono text-[11px]">
                {options.length} {options.length === 1 ? "outcome" : "outcomes"}
              </span>
            )}
          </div>

          {hasOptions ? (
            /* Mode A: Structured Prediction Options */
            <div
              className="space-y-2.5"
              role="radiogroup"
              aria-labelledby={`prompt-${activity.id}`}
              data-activity-id={activity.id}
            >
              {options.map((optionText, idx) => {
                const isSelected = currentPrediction === optionText;
                const isExpected =
                  isSubmitted &&
                  ((activity.validation?.type === "exact-match" &&
                    activity.validation.expected === optionText) ||
                    (activity.validation?.type === "code-output" &&
                      activity.validation.expectedOutput === optionText) ||
                    (activity.validation?.type === "one-of" &&
                      Array.isArray(activity.validation.validOptions) &&
                      activity.validation.validOptions.includes(optionText)));

                const cardStateClass =
                  isSubmitted && isSelected && isCorrect
                    ? "border-emerald-500/80 bg-emerald-500/10 ring-1 ring-emerald-500/30"
                    : isSubmitted && isSelected && isIncorrect
                      ? "border-rose-500/80 bg-rose-500/10 ring-1 ring-rose-500/30"
                      : isSubmitted && !isSelected && isExpected
                        ? "border-emerald-500/50 bg-emerald-500/5"
                        : isSelected
                          ? "border-lesson-accent bg-lesson-accent/10 ring-1 ring-lesson-accent/40"
                          : "border-lesson-border bg-lesson-surface hover:border-lesson-border-elevated hover:bg-lesson-surface-elevated";

                const badgeStateClass =
                  isSubmitted && isSelected && isCorrect
                    ? "border-emerald-600 bg-emerald-600 text-white font-semibold"
                    : isSubmitted && isSelected && isIncorrect
                      ? "border-rose-600 bg-rose-600 text-white font-semibold"
                      : isSubmitted && !isSelected && isExpected
                        ? "border-emerald-600/80 bg-emerald-600/80 text-white font-semibold"
                        : isSelected
                          ? "border-lesson-accent bg-lesson-accent text-lesson-accent-foreground font-semibold shadow-xs"
                          : "border-lesson-border bg-lesson-surface-elevated text-lesson-text-muted font-medium";

                return (
                  <button
                    key={idx}
                    type="button"
                    role="radio"
                    id={`option-${activity.id}-${idx}`}
                    aria-checked={isSelected}
                    disabled={readOnly || (isSubmitted && isCorrect)}
                    onClick={() => {
                      if (!readOnly && (!isSubmitted || isIncorrect)) {
                        onResponse(optionText);
                      }
                    }}
                    onKeyDown={(e) => handleOptionKeyDown(e, idx)}
                    className={cn(
                      "group relative flex min-h-[54px] w-full items-center gap-3.5 sm:gap-4 rounded-xl border px-4 py-3 sm:px-5 sm:py-3.5 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lesson-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-lesson-bg",
                      cardStateClass,
                      (readOnly || (isSubmitted && isCorrect)) && "cursor-default opacity-85",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs tracking-wider transition-colors font-mono",
                        badgeStateClass,
                      )}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>

                    <span className="min-w-0 flex-1 font-mono text-sm sm:text-base leading-relaxed text-lesson-text-primary break-all font-normal">
                      {optionText}
                    </span>

                    {/* Status badges */}
                    {isSelected && !isSubmitted && (
                      <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium border border-lesson-accent/30 bg-lesson-accent/15 text-lesson-accent shrink-0">
                        Predicted
                      </span>
                    )}
                    {isSubmitted && isSelected && isCorrect && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                        <CheckCircle2 className="h-5 w-5 shrink-0" />
                        <span className="hidden sm:inline">Prediction Verified</span>
                      </span>
                    )}
                    {isSubmitted && isSelected && isIncorrect && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 shrink-0">
                        <XCircle className="h-5 w-5 shrink-0" />
                        <span className="hidden sm:inline">Prediction Disproven</span>
                      </span>
                    )}
                    {isSubmitted && !isSelected && isExpected && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600/90 dark:text-emerald-400/90 shrink-0">
                        <CheckCircle2 className="h-5 w-5 shrink-0" />
                        <span className="hidden sm:inline">Expected Output</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            /* Mode B: Exact Output Prediction Input */
            <div className="space-y-2">
              <label htmlFor={`prediction-input-${activity.id}`} className="sr-only">
                Predicted output value
              </label>
              <div
                className={cn(
                  "relative flex items-center min-h-[52px] rounded-xl border bg-lesson-surface px-4 py-2 transition-all duration-150 focus-within:border-lesson-accent focus-within:ring-2 focus-within:ring-lesson-accent/20",
                  isSubmitted &&
                    isCorrect &&
                    "border-emerald-500/80 bg-emerald-500/10 ring-1 ring-emerald-500/30",
                  isSubmitted &&
                    isIncorrect &&
                    "border-rose-500/80 bg-rose-500/10 ring-1 ring-rose-500/30",
                  !isSubmitted &&
                    currentPrediction &&
                    "border-lesson-accent/60 bg-lesson-surface-elevated",
                  !isSubmitted && !currentPrediction && "border-lesson-border",
                )}
              >
                <Terminal className="w-4 h-4 text-lesson-text-muted shrink-0 mr-3 select-none" />
                <input
                  id={`prediction-input-${activity.id}`}
                  type="text"
                  value={currentPrediction}
                  disabled={readOnly || (isSubmitted && isCorrect)}
                  placeholder="Enter predicted output..."
                  onChange={(e) => onResponse(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && currentPrediction.trim() && onSubmit && !isSubmitted) {
                      e.preventDefault();
                      onSubmit();
                    }
                  }}
                  className="flex-1 bg-transparent border-none outline-none font-mono text-sm sm:text-base text-lesson-text-primary p-0 focus:ring-0 focus:outline-none placeholder:text-lesson-text-muted/60 min-w-0"
                  aria-label="Enter predicted output"
                  autoComplete="off"
                  spellCheck={false}
                />
                {!isSubmitted && currentPrediction.trim() && onSubmit && (
                  <button
                    type="button"
                    onClick={onSubmit}
                    className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-lesson-text-muted hover:text-lesson-text-primary px-2 py-1 rounded bg-lesson-surface-elevated border border-lesson-border shrink-0 ml-2"
                    title="Press Enter to evaluate"
                  >
                    <span>Enter</span>
                    <CornerDownLeft className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Reasoning Cue & Prediction Commitment State */}
          {!isSubmitted && (
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-lesson-border bg-lesson-surface/80 text-xs">
              {currentPrediction.trim() ? (
                <>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-2 w-2 rounded-full bg-lesson-accent shrink-0 animate-pulse" />
                    <span className="truncate text-lesson-text-muted">
                      Committed Prediction:{" "}
                      <strong className="text-lesson-text-primary font-mono font-semibold">
                        {currentPrediction}
                      </strong>
                    </span>
                  </div>
                  <span className="hidden sm:inline-flex shrink-0 font-mono text-[11px] uppercase tracking-wider text-lesson-accent font-medium">
                    Ready to evaluate
                  </span>
                </>
              ) : (
                <div className="flex items-center gap-2 text-lesson-text-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-lesson-text-muted/50 shrink-0" />
                  <span>
                    Trace the control flow step-by-step before committing your prediction.
                  </span>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Canonical Feedback Section */}
        <ActivityFeedback
          status={state.status}
          validationResult={state.validationResult}
          hints={activity.feedback?.hints}
          hintsRevealed={state.hintsRevealed}
          explanation={explanation}
        />
      </MovementScene>

      <ActivityActions
        status={state.status}
        onSubmit={onSubmit}
        onRetry={onRetry}
        onContinue={onContinue}
        canSubmit={Boolean(currentPrediction.trim())}
      />
    </ActivityContainer>
  );
}
