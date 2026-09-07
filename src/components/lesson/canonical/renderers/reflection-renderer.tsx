import type { ReflectionActivity } from "@/lib/curriculum/types";
import type { ActivityRendererProps } from "../types";
import { ActivityContainer } from "../primitives/activity-container";
import { ActivityHeader } from "../primitives/activity-header";
import { ActivityFeedback } from "../primitives/activity-feedback";
import { ActivityActions } from "../primitives/activity-actions";
import { MovementScene } from "../primitives/movement-scene";
import { Brain, Sparkles, Compass, Lightbulb, BookOpen, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ReflectionRenderer({
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
}: ActivityRendererProps<ReflectionActivity, string>) {
  const { prompt, minCharacters = 20, sampleResponse, guidelines = [] } = activity.content;

  const currentText = typeof state.response === "string" ? state.response : "";
  const charCount = currentText.trim().length;
  const isSatisfied = charCount >= minCharacters;

  const isSubmitted =
    state.status === "submitted" || state.status === "correct" || state.status === "completed";

  const hintsRemaining = (activity.feedback?.hints?.length || 0) - state.hintsRevealed;

  const eyebrowConfig = (() => {
    if (experienceComposition?.badgeText) {
      return {
        label: experienceComposition.badgeText,
        tagline: experienceComposition.prompt || "Explain the mechanism in your own words",
        icon: Brain,
      };
    }
    switch (activity.intent) {
      case "reflection":
        return {
          label: "Engineering Synthesis",
          tagline: "Articulate what changed in your mental model",
          icon: Brain,
        };
      case "synthesis":
        return {
          label: "Concept Synthesis",
          tagline: "Connect the observed behaviors to the underlying principle",
          icon: Sparkles,
        };
      case "application":
        return {
          label: "Mechanism Explanation",
          tagline: "Explain how the system operates and why this behavior occurs",
          icon: Compass,
        };
      case "retrieval":
        return {
          label: "Mental Model Recall",
          tagline: "Reconstruct the core mechanism in your own words",
          icon: BookOpen,
        };
      case "assessment":
        return {
          label: "Engineering Takeaway",
          tagline: "Synthesize what you have observed and commit your explanation",
          icon: Lightbulb,
        };
      default:
        return {
          label: "Engineering Synthesis",
          tagline: "Explain the mechanism in your own words",
          icon: Brain,
        };
    }
  })();

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

        {/* Contextual Support / Thinking Prompts before Writing */}
        {guidelines && guidelines.length > 0 && (
          <section
            className="rounded-xl border border-lesson-border bg-lesson-surface-elevated/50 p-4 sm:p-5 space-y-2.5 shadow-2xs"
            aria-label="Thinking prompts"
          >
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-lesson-text-muted flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-lesson-accent" />
              <span>Thinking Prompts</span>
            </span>
            <ul className="space-y-2 text-sm text-lesson-text-secondary leading-relaxed">
              {guidelines.map((guideline, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="text-lesson-accent font-mono font-bold select-none">•</span>
                  <span>{guideline}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Writing Surface or Comparative Synthesis */}
        {!isSubmitted ? (
          <section className="space-y-2.5" aria-label="Reflection writing workspace">
            <div className="flex items-center justify-between text-xs font-medium text-lesson-text-muted">
              <label
                htmlFor={`reflection-textarea-${activity.id}`}
                className="font-mono text-[11px] uppercase tracking-wider text-lesson-text-secondary font-semibold"
              >
                Your Explanation
              </label>
              <span className="text-[11px] text-lesson-text-muted">
                {isSatisfied ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono font-medium inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Ready to commit
                  </span>
                ) : (
                  <span className="font-mono">
                    {charCount} / {minCharacters} min chars
                  </span>
                )}
              </span>
            </div>

            <div className="relative rounded-xl border border-lesson-border bg-lesson-surface transition-all duration-150 focus-within:border-lesson-accent focus-within:ring-2 focus-within:ring-lesson-accent/20">
              <textarea
                id={`reflection-textarea-${activity.id}`}
                value={currentText}
                disabled={readOnly}
                rows={6}
                placeholder="Articulate the mechanism in your own words..."
                onChange={(e) => onResponse(e.target.value)}
                className="w-full resize-y rounded-xl bg-transparent p-4 sm:p-5 font-sans text-sm sm:text-base leading-relaxed text-lesson-text-primary placeholder:text-lesson-text-muted/60 focus:outline-none disabled:opacity-75"
                aria-describedby={`reflection-help-${activity.id}`}
                spellCheck={true}
              />
            </div>

            {/* Calm Readiness Indicator */}
            <div
              id={`reflection-help-${activity.id}`}
              className="flex items-center justify-between text-xs text-lesson-text-muted px-1"
            >
              <span className="text-[11px]">
                {isSatisfied
                  ? "Explanation developed enough to commit."
                  : `Develop your explanation (${minCharacters - charCount} more character${minCharacters - charCount === 1 ? "" : "s"} required).`}
              </span>
              <span className="font-mono text-[11px]">
                {charCount} character{charCount === 1 ? "" : "s"}
              </span>
            </div>
          </section>
        ) : (
          <section
            className="space-y-4"
            aria-label="Committed reflection and reference perspective"
          >
            {/* Learner's Own Explanation */}
            <div className="rounded-xl border border-lesson-border bg-lesson-surface p-4 sm:p-5 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-lesson-text-muted">
                <span className="font-semibold text-lesson-text-secondary">Your Explanation</span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Committed</span>
                </span>
              </div>
              <p className="text-sm sm:text-base leading-relaxed text-lesson-text-primary font-sans whitespace-pre-wrap">
                {currentText}
              </p>
            </div>

            {/* Reference Perspective (only if sampleResponse is present in content) */}
            {sampleResponse && (
              <div className="rounded-xl border border-lesson-accent/30 bg-lesson-accent/5 p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-lesson-accent">
                  <span className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Reference Perspective</span>
                  </span>
                  <span className="text-[11px] font-normal text-lesson-text-muted hidden sm:inline">
                    Comparison Reference
                  </span>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs text-lesson-text-muted">
                    Compare your thinking with how an engineer frames the mechanism:
                  </p>
                  <blockquote className="text-sm sm:text-base leading-relaxed text-lesson-text-primary font-sans italic border-l-2 border-lesson-accent/40 pl-3.5 py-0.5">
                    &ldquo;{sampleResponse}&rdquo;
                  </blockquote>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Canonical Feedback / Hints Section */}
        <ActivityFeedback
          status={state.status}
          validationResult={state.validationResult}
          hints={activity.feedback?.hints}
          hintsRevealed={state.hintsRevealed}
        />
      </MovementScene>

      <ActivityActions
        status={state.status}
        onSubmit={onSubmit}
        onRetry={onRetry}
        onContinue={onContinue}
        canSubmit={isSatisfied}
        submitLabel="Submit Reflection"
      />
    </ActivityContainer>
  );
}
