import type { MultiSelectActivity } from "@/lib/curriculum/types";
import type { ActivityRendererProps } from "../types";
import { ActivityContainer } from "../primitives/activity-container";
import { ActivityHeader } from "../primitives/activity-header";
import { ActivityFeedback } from "../primitives/activity-feedback";
import { ActivityActions } from "../primitives/activity-actions";
import { MovementScene } from "../primitives/movement-scene";
import {
  Check,
  CheckCircle2,
  XCircle,
  ListChecks,
  ShieldCheck,
  Layers,
  BookOpen,
  GitBranch,
  CheckSquare,
  ListFilter,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function MultiSelectRenderer({
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
}: ActivityRendererProps<MultiSelectActivity, string[]>) {
  const { question, options, minSelections = 1, maxSelections, explanation } = activity.content;
  const selectedOptionIds = Array.isArray(state.response) ? state.response : [];
  const isSubmitted =
    state.status === "submitted" || state.status === "correct" || state.status === "incorrect";
  const isCorrect = state.status === "correct" || state.status === "completed";
  const isIncorrect = state.status === "incorrect";
  const hintsRemaining = (activity.feedback?.hints?.length || 0) - state.hintsRevealed;

  const expectedOptions =
    activity.validation?.type === "multi-match" && Array.isArray(activity.validation.expected)
      ? (activity.validation.expected as string[])
      : undefined;

  const eyebrowConfig = (() => {
    if (experienceComposition?.badgeText) {
      return {
        label: experienceComposition.badgeText,
        tagline: experienceComposition.prompt || "Identify all evidence that belongs to the set",
        icon: ListFilter,
      };
    }
    switch (activity.intent) {
      case "recognition":
        return {
          label: "Evidence Selection",
          tagline: "Distinguish directly observable facts from unverified hypotheses",
          icon: ListChecks,
        };
      case "assessment":
        return {
          label: "Knowledge Verification",
          tagline: "Identify all components that satisfy the technical criteria",
          icon: ShieldCheck,
        };
      case "application":
        return {
          label: "Technical Investigation",
          tagline: "Select all conditions or factors contributing to the system behavior",
          icon: Layers,
        };
      case "retrieval":
        return {
          label: "Concept Retrieval",
          tagline: "Select all items that apply to this concept",
          icon: BookOpen,
        };
      case "prediction":
        return {
          label: "Prediction Set",
          tagline: "Select all outcomes expected when this system executes",
          icon: GitBranch,
        };
      default:
        return {
          label: "Evidence Set",
          tagline: "Identify the complete set of items that belong together",
          icon: CheckSquare,
        };
    }
  })();

  const toggleOption = (id: string) => {
    if (readOnly || (isSubmitted && isCorrect)) return;
    if (selectedOptionIds.includes(id)) {
      onResponse(selectedOptionIds.filter((item) => item !== id));
      return;
    }
    if (maxSelections && selectedOptionIds.length >= maxSelections) return;
    onResponse([...selectedOptionIds, id]);
  };

  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    if (readOnly || (isSubmitted && isCorrect)) return;

    let targetIndex: number | null = null;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      targetIndex = (currentIndex + 1) % options.length;
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      targetIndex = (currentIndex - 1 + options.length) % options.length;
    }

    if (targetIndex !== null) {
      const buttons = document.querySelectorAll<HTMLButtonElement>(
        `[role="group"][data-activity-id="${activity.id}"] button[role="checkbox"]`,
      );
      buttons[targetIndex]?.focus();
    }
  };

  const canSubmit =
    selectedOptionIds.length >= minSelections &&
    (!maxSelections || selectedOptionIds.length <= maxSelections);

  let instructionText = "Select all that apply.";
  if (minSelections > 1 && maxSelections && minSelections === maxSelections) {
    instructionText = `Select exactly ${minSelections} items.`;
  } else if (minSelections > 1 && maxSelections) {
    instructionText = `Select between ${minSelections} and ${maxSelections} items.`;
  } else if (minSelections > 1) {
    instructionText = `Select at least ${minSelections} items.`;
  } else if (maxSelections) {
    instructionText = `Select up to ${maxSelections} items.`;
  }

  const selectedIndices = options
    .map((opt, idx) => (selectedOptionIds.includes(opt.id) ? String.fromCharCode(65 + idx) : null))
    .filter(Boolean);

  return (
    <ActivityContainer id={`activity-${activity.id}`} variant="standard" className={className}>
      <ActivityHeader
        activity={activity}
        onRevealHint={onRevealHint}
        hintsRemaining={hintsRemaining}
      />

      <MovementScene className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-8 sm:py-8 flex flex-col gap-6">
        {/* Dominant Investigation Prompt Surface */}
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

        {/* Candidate Items / Evidence Set Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-medium text-lesson-text-muted">
            <span>{instructionText}</span>
            <span className="font-mono text-[11px] text-lesson-text-muted">
              {selectedOptionIds.length} selected
            </span>
          </div>

          <div
            className="space-y-2.5"
            role="group"
            aria-labelledby={`question-${activity.id}`}
            data-activity-id={activity.id}
          >
            {options.map((option, idx) => {
              const isSelected = selectedOptionIds.includes(option.id);
              const isExpected = expectedOptions ? expectedOptions.includes(option.id) : undefined;

              // Card background and border states
              const cardStateClass = (() => {
                if (!isSubmitted) {
                  return isSelected
                    ? "border-lesson-accent bg-lesson-accent/10 ring-1 ring-lesson-accent/40"
                    : "border-lesson-border bg-lesson-surface hover:border-lesson-border-elevated hover:bg-lesson-surface-elevated";
                }
                if (isCorrect) {
                  return isSelected
                    ? "border-emerald-500/80 bg-emerald-500/10 ring-1 ring-emerald-500/30"
                    : "border-lesson-border/60 bg-lesson-surface/50 opacity-70";
                }
                // isIncorrect
                if (isSelected) {
                  if (isExpected === true) {
                    return "border-emerald-500/70 bg-emerald-500/10 ring-1 ring-emerald-500/25";
                  }
                  return "border-rose-500/80 bg-rose-500/10 ring-1 ring-rose-500/30";
                }
                if (isExpected === true) {
                  return "border-dashed border-emerald-500/60 bg-emerald-500/5";
                }
                return "border-lesson-border/60 bg-lesson-surface/50 opacity-60";
              })();

              // Checkbox indicator styles
              const checkboxStateClass = (() => {
                if (!isSubmitted) {
                  return isSelected
                    ? "border-lesson-accent bg-lesson-accent text-lesson-accent-foreground shadow-xs"
                    : "border-lesson-border bg-lesson-surface text-transparent";
                }
                if (isCorrect) {
                  return isSelected
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-lesson-border text-transparent";
                }
                // isIncorrect
                if (isSelected) {
                  if (isExpected === true) {
                    return "border-emerald-600 bg-emerald-600 text-white";
                  }
                  return "border-rose-600 bg-rose-600 text-white";
                }
                if (isExpected === true) {
                  return "border-dashed border-emerald-500/80 bg-transparent text-emerald-600 dark:text-emerald-400";
                }
                return "border-lesson-border text-transparent";
              })();

              // Option index badge styles
              const badgeStateClass = (() => {
                if (!isSubmitted) {
                  return isSelected
                    ? "border-lesson-accent/40 bg-lesson-accent/20 text-lesson-accent font-semibold"
                    : "border-lesson-border bg-lesson-surface-elevated text-lesson-text-muted font-medium";
                }
                if (isCorrect) {
                  return isSelected
                    ? "border-emerald-600/50 bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 font-semibold"
                    : "border-lesson-border bg-lesson-surface-elevated text-lesson-text-muted";
                }
                // isIncorrect
                if (isSelected) {
                  if (isExpected === true) {
                    return "border-emerald-600/50 bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 font-semibold";
                  }
                  return "border-rose-600/50 bg-rose-600/20 text-rose-600 dark:text-rose-400 font-semibold";
                }
                if (isExpected === true) {
                  return "border-dashed border-emerald-500/60 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold";
                }
                return "border-lesson-border bg-lesson-surface-elevated text-lesson-text-muted";
              })();

              return (
                <button
                  key={option.id}
                  type="button"
                  role="checkbox"
                  id={`option-${activity.id}-${option.id}`}
                  aria-checked={isSelected}
                  disabled={readOnly || (isSubmitted && isCorrect)}
                  onClick={() => toggleOption(option.id)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  className={cn(
                    "group relative flex min-h-[54px] w-full items-center gap-3.5 sm:gap-4 rounded-xl border px-4 py-3 sm:px-5 sm:py-3.5 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lesson-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-lesson-bg",
                    cardStateClass,
                    (readOnly || (isSubmitted && isCorrect)) && "cursor-default opacity-85",
                  )}
                >
                  {/* Semantic Checkbox Visual */}
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                      checkboxStateClass,
                    )}
                    aria-hidden="true"
                  >
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                  </span>

                  {/* Option letter marker */}
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs font-mono tracking-wider transition-colors",
                      badgeStateClass,
                    )}
                    aria-hidden="true"
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>

                  {/* Option text */}
                  <span className="min-w-0 flex-1 text-sm sm:text-base leading-relaxed text-lesson-text-primary text-pretty font-normal">
                    {option.text}
                  </span>

                  {/* Right-hand status / commitment tag */}
                  {isSelected && !isSubmitted && (
                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium border border-lesson-accent/30 bg-lesson-accent/15 text-lesson-accent shrink-0">
                      Included
                    </span>
                  )}
                  {isSubmitted && isCorrect && isSelected && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                      <CheckCircle2 className="h-5 w-5 shrink-0" />
                      <span className="hidden sm:inline">Verified</span>
                    </span>
                  )}
                  {isSubmitted && isIncorrect && isSelected && isExpected === true && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                      <CheckCircle2 className="h-5 w-5 shrink-0" />
                      <span className="hidden sm:inline">Valid Member</span>
                    </span>
                  )}
                  {isSubmitted && isIncorrect && isSelected && isExpected !== true && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 shrink-0">
                      <XCircle className="h-5 w-5 shrink-0" />
                      <span className="hidden sm:inline">Does Not Belong</span>
                    </span>
                  )}
                  {isSubmitted && isIncorrect && !isSelected && isExpected === true && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600/90 dark:text-emerald-400/90 shrink-0">
                      <CheckCircle2 className="h-5 w-5 shrink-0" />
                      <span className="hidden sm:inline">Belonged in Set</span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Current Selection Set Summary */}
          {selectedOptionIds.length > 0 && !isSubmitted && (
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-lesson-border bg-lesson-surface/80 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="h-2 w-2 rounded-full bg-lesson-accent shrink-0 animate-pulse" />
                <span className="truncate text-lesson-text-muted">
                  Committed Set:{" "}
                  <strong className="text-lesson-text-primary font-semibold">
                    {selectedIndices.join(", ")}
                  </strong>
                  {" — "}
                  <span className="text-lesson-text-secondary">
                    {selectedOptionIds.length} {selectedOptionIds.length === 1 ? "item" : "items"}{" "}
                    selected
                  </span>
                </span>
              </div>
              {canSubmit ? (
                <span className="hidden sm:inline-flex shrink-0 font-mono text-[11px] uppercase tracking-wider text-lesson-accent font-medium">
                  Ready to evaluate
                </span>
              ) : (
                <span className="hidden sm:inline-flex shrink-0 font-mono text-[11px] uppercase tracking-wider text-lesson-text-muted font-medium">
                  {minSelections - selectedOptionIds.length > 0
                    ? `Select ${minSelections - selectedOptionIds.length} more`
                    : `Max ${maxSelections} allowed`}
                </span>
              )}
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
        canSubmit={canSubmit}
      />
    </ActivityContainer>
  );
}
