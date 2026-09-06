import type { MultipleChoiceActivity } from "@/lib/curriculum/types";
import type { ActivityRendererProps } from "../types";
import { ActivityContainer } from "../primitives/activity-container";
import { ActivityHeader } from "../primitives/activity-header";
import { ActivityFeedback } from "../primitives/activity-feedback";
import { ActivityActions } from "../primitives/activity-actions";
import { MovementScene } from "../primitives/movement-scene";
import {
  CheckCircle2,
  XCircle,
  GitBranch,
  Target,
  ShieldCheck,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function MultipleChoiceRenderer({
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
}: ActivityRendererProps<MultipleChoiceActivity, string>) {
  const { question, options, explanation } = activity.content;
  const selectedOptionId = typeof state.response === "string" ? state.response : "";
  const isSubmitted =
    state.status === "submitted" || state.status === "correct" || state.status === "incorrect";
  const isCorrect = state.status === "correct" || state.status === "completed";
  const isIncorrect = state.status === "incorrect";
  const hintsRemaining = (activity.feedback?.hints?.length || 0) - state.hintsRevealed;

  const isPrediction =
    activity.intent === "prediction" || experienceComposition?.mode === "predict";

  const eyebrowConfig = (() => {
    if (experienceComposition?.badgeText) {
      return {
        label: experienceComposition.badgeText,
        tagline: experienceComposition.prompt || "Commit to your choice before continuing",
        icon: isPrediction ? GitBranch : Target,
      };
    }
    if (isPrediction) {
      return {
        label: "Prediction Commitment",
        tagline: "Reason through the expected behavior before running the system",
        icon: GitBranch,
      };
    }
    switch (activity.intent) {
      case "application":
        return {
          label: "Technical Investigation",
          tagline: "Evaluate the observed failure and commit to the most effective next step",
          icon: Target,
        };
      case "assessment":
        return {
          label: "Knowledge Verification",
          tagline: "Validate your mental model against this problem",
          icon: ShieldCheck,
        };
      case "retrieval":
        return {
          label: "Concept Retrieval",
          tagline: "Identify the principle in action from the options below",
          icon: BookOpen,
        };
      default:
        return {
          label: "Technical Decision",
          tagline: "Evaluate the scenario and commit to an answer",
          icon: HelpCircle,
        };
    }
  })();

  const selectedOption = options.find((o) => o.id === selectedOptionId);

  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    if (readOnly || (isSubmitted && isCorrect)) return;

    let targetIndex: number | null = null;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      targetIndex = (currentIndex + 1) % options.length;
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      targetIndex = (currentIndex - 1 + options.length) % options.length;
    }

    if (targetIndex !== null && options[targetIndex]) {
      onResponse(options[targetIndex].id);
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
        {/* Dominant Question / Prompt Surface */}
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
            id={`question-${activity.id}`}
            className="text-xl sm:text-2xl lg:text-[1.75rem] font-bold leading-snug tracking-tight text-lesson-text-primary text-pretty"
          >
            {question}
          </h2>
        </header>

        {/* Options Selection Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-medium text-lesson-text-muted">
            <span>
              {isPrediction ? "Select your expected outcome:" : "Select your commitment:"}
            </span>
            <span className="font-mono text-[11px]">
              {options.length} {options.length === 1 ? "option" : "options"}
            </span>
          </div>

          <div
            className="space-y-2.5"
            role="radiogroup"
            aria-labelledby={`question-${activity.id}`}
            data-activity-id={activity.id}
          >
            {options.map((option, idx) => {
              const isSelected = selectedOptionId === option.id;
              const isExpected =
                isSubmitted &&
                ((activity.validation?.type === "exact-match" &&
                  activity.validation.expected === option.id) ||
                  (activity.validation?.type === "one-of" &&
                    Array.isArray(activity.validation.validOptions) &&
                    activity.validation.validOptions.includes(option.id)));

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
                  key={option.id}
                  type="button"
                  role="radio"
                  id={`option-${activity.id}-${option.id}`}
                  aria-checked={isSelected}
                  disabled={readOnly || (isSubmitted && isCorrect)}
                  onClick={() => {
                    if (!readOnly && (!isSubmitted || isIncorrect)) {
                      onResponse(option.id);
                    }
                  }}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  className={cn(
                    "group relative flex min-h-[54px] w-full items-center gap-3.5 sm:gap-4 rounded-xl border px-4 py-3 sm:px-5 sm:py-3.5 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lesson-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-lesson-bg",
                    cardStateClass,
                    (readOnly || (isSubmitted && isCorrect)) && "cursor-default opacity-85",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs tracking-wider transition-colors",
                      badgeStateClass,
                    )}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>

                  <span className="min-w-0 flex-1 text-sm sm:text-base leading-relaxed text-lesson-text-primary text-pretty font-normal">
                    {option.text}
                  </span>

                  {/* Right-hand commitment / status indicator */}
                  {isSelected && !isSubmitted && (
                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium border border-lesson-accent/30 bg-lesson-accent/15 text-lesson-accent shrink-0">
                      Committed
                    </span>
                  )}
                  {isSubmitted && isSelected && isCorrect && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                      <CheckCircle2 className="h-5 w-5 shrink-0" />
                      <span className="hidden sm:inline">
                        {isPrediction ? "Prediction Verified" : "Correct"}
                      </span>
                    </span>
                  )}
                  {isSubmitted && isSelected && isIncorrect && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 shrink-0">
                      <XCircle className="h-5 w-5 shrink-0" />
                      <span className="hidden sm:inline">
                        {isPrediction ? "Prediction Disproven" : "Incorrect"}
                      </span>
                    </span>
                  )}
                  {isSubmitted && !isSelected && isExpected && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600/90 dark:text-emerald-400/90 shrink-0">
                      <CheckCircle2 className="h-5 w-5 shrink-0" />
                      <span className="hidden sm:inline">
                        {isPrediction ? "Expected Outcome" : "Expected"}
                      </span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Current Commitment Indicator */}
          {selectedOption && !isSubmitted && (
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-lesson-border bg-lesson-surface/80 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-2 w-2 rounded-full bg-lesson-accent shrink-0 animate-pulse" />
                <span className="truncate text-lesson-text-muted">
                  {isPrediction ? "Committed Prediction:" : "Committed Choice:"}{" "}
                  <strong className="text-lesson-text-primary font-semibold">
                    Option{" "}
                    {String.fromCharCode(65 + options.findIndex((o) => o.id === selectedOptionId))}
                  </strong>
                  {" — "}
                  <span className="text-lesson-text-secondary">{selectedOption.text}</span>
                </span>
              </div>
              <span className="hidden sm:inline-flex shrink-0 font-mono text-[11px] uppercase tracking-wider text-lesson-accent font-medium">
                Ready for evaluation
              </span>
            </div>
          )}
        </div>

        {/* Feedback Section */}
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
        canSubmit={Boolean(selectedOptionId)}
      />
    </ActivityContainer>
  );
}
