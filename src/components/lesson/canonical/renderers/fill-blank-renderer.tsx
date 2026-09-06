import type { FillBlankActivity, FillBlankItem } from "@/lib/curriculum/types";
import type { ActivityRendererProps } from "../types";
import { ActivityContainer } from "../primitives/activity-container";
import { ActivityHeader } from "../primitives/activity-header";
import { ActivityFeedback } from "../primitives/activity-feedback";
import { ActivityActions } from "../primitives/activity-actions";
import { MovementScene } from "../primitives/movement-scene";
import {
  Wrench,
  Code2,
  ShieldCheck,
  BookOpen,
  GitBranch,
  CheckCircle2,
  XCircle,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TemplateSegment {
  type: "text" | "blank";
  text?: string;
  blankIndex?: number;
  blank?: FillBlankItem;
}

/**
 * Tokenizes the activity template into structured text and blank slots.
 * Supports both named identifiers (e.g. {b1} or {{b1}}) and positional blanks (e.g. ___ or __).
 */
function parseTemplateToSegments(
  template: string,
  blanks: FillBlankItem[],
): { segments: TemplateSegment[]; isInlineValid: boolean } {
  if (!template || !blanks || blanks.length === 0) {
    return { segments: [], isInlineValid: false };
  }

  const regex = /\{\{?\s*([a-zA-Z0-9_-]+)\s*\}?\}|_{2,}/g;
  const segments: TemplateSegment[] = [];
  let lastIndex = 0;
  let nextSequentialBlankIdx = 0;
  const assignedBlankIndices = new Set<number>();

  let match: RegExpExecArray | null;
  while ((match = regex.exec(template)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: "text",
        text: template.slice(lastIndex, match.index),
      });
    }

    const namedId = match[1];
    let targetIdx = -1;

    if (namedId) {
      const foundIdx = blanks.findIndex((b) => b.id === namedId);
      if (foundIdx !== -1 && !assignedBlankIndices.has(foundIdx)) {
        targetIdx = foundIdx;
      }
    }

    if (targetIdx === -1) {
      while (
        nextSequentialBlankIdx < blanks.length &&
        assignedBlankIndices.has(nextSequentialBlankIdx)
      ) {
        nextSequentialBlankIdx++;
      }
      if (nextSequentialBlankIdx < blanks.length) {
        targetIdx = nextSequentialBlankIdx;
        nextSequentialBlankIdx++;
      }
    }

    if (targetIdx !== -1 && targetIdx < blanks.length) {
      assignedBlankIndices.add(targetIdx);
      segments.push({
        type: "blank",
        blankIndex: targetIdx,
        blank: blanks[targetIdx],
      });
    } else {
      segments.push({
        type: "text",
        text: match[0],
      });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < template.length) {
    segments.push({
      type: "text",
      text: template.slice(lastIndex),
    });
  }

  const isInlineValid = assignedBlankIndices.size === blanks.length;

  return { segments, isInlineValid };
}

/**
 * Detects whether the template represents code/syntax vs prose.
 */
function detectIsCodeTemplate(template: string): boolean {
  return Boolean(
    template.includes("const ") ||
    template.includes("let ") ||
    template.includes("var ") ||
    template.includes("function ") ||
    template.includes("=>") ||
    template.includes("</") ||
    template.includes("/>") ||
    (template.includes("<") && template.includes(">")) ||
    (template.includes("{") && template.includes("}")) ||
    template.includes(";") ||
    template.includes("return ") ||
    template.includes("import ") ||
    template.includes("export ") ||
    template.includes("console.") ||
    template.includes("class "),
  );
}

export function FillBlankRenderer({
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
}: ActivityRendererProps<FillBlankActivity, string[]>) {
  const { prompt, template, blanks, explanation } = activity.content;

  // Blanks state array
  const rawValues = Array.isArray(state.response)
    ? state.response
    : typeof state.response === "string"
      ? [state.response]
      : [];
  const blankValues = blanks.map((_, idx) => rawValues[idx] || "");

  const isSubmitted =
    state.status === "submitted" || state.status === "correct" || state.status === "incorrect";
  const isCorrect = state.status === "correct" || state.status === "completed";
  const isIncorrect = state.status === "incorrect";

  const hintsRemaining = (activity.feedback?.hints?.length || 0) - state.hintsRevealed;

  const handleBlankChange = (index: number, val: string) => {
    if (readOnly || (isSubmitted && isCorrect)) return;
    const next = [...blankValues];
    next[index] = val;
    onResponse(next);
  };

  const allFilled =
    blanks.length > 0 &&
    blankValues.length === blanks.length &&
    blankValues.every((val) => val.trim().length > 0);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && allFilled && onSubmit && !isSubmitted) {
      e.preventDefault();
      onSubmit();
    }
  };

  const isCodeBlank = detectIsCodeTemplate(template);
  const { segments, isInlineValid } = parseTemplateToSegments(template, blanks);

  const eyebrowConfig = (() => {
    if (experienceComposition?.badgeText) {
      return {
        label: experienceComposition.badgeText,
        tagline: experienceComposition.prompt || "Reconstruct the missing piece of the mechanism",
        icon: Wrench,
      };
    }
    switch (activity.intent) {
      case "application":
        return {
          label: "Mechanism Reconstruction",
          tagline: "Reconstruct the missing technical component to restore expected behavior",
          icon: Wrench,
        };
      case "assessment":
        return {
          label: "Concept Verification",
          tagline: "Supply the precise technical terminology or value required",
          icon: ShieldCheck,
        };
      case "retrieval":
        return {
          label: "Technical Recall",
          tagline: "Complete the missing syntax or keyword from memory",
          icon: BookOpen,
        };
      case "prediction":
        return {
          label: "Outcome Prediction",
          tagline: "Specify the exact output or state produced by this mechanism",
          icon: GitBranch,
        };
      default:
        return {
          label: "Mechanism Completion",
          tagline: "Reconstruct the missing element to complete the mechanism",
          icon: Code2,
        };
    }
  })();

  const inputStateClasses = (blankIdx: number, isFilled: boolean) => {
    if (!isSubmitted) {
      if (isCodeBlank) {
        return isFilled
          ? "border-amber-500/70 bg-zinc-900 text-amber-300 font-semibold focus:border-amber-500 focus:ring-amber-500/30"
          : "border-dashed border-amber-500/40 bg-zinc-900/80 text-amber-300 placeholder:text-zinc-600 focus:border-amber-500 focus:ring-amber-500/30 focus:bg-zinc-900";
      }
      return isFilled
        ? "border-lesson-accent/70 bg-lesson-surface text-lesson-text-primary font-semibold focus:border-lesson-accent focus:ring-lesson-focus-ring"
        : "border-dashed border-lesson-border bg-lesson-bg text-lesson-text-primary placeholder:text-lesson-text-muted focus:border-lesson-accent focus:ring-lesson-focus-ring";
    }
    if (isCorrect) {
      return "border-emerald-500/80 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold ring-1 ring-emerald-500/30";
    }
    return "border-rose-500/80 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold ring-1 ring-rose-500/30";
  };

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
            id={`prompt-${activity.id}`}
            className="text-xl sm:text-2xl lg:text-[1.75rem] font-bold leading-snug tracking-tight text-lesson-text-primary text-pretty"
          >
            {prompt}
          </h2>
        </header>

        {/* Mechanism Reconstruction Surface */}
        {isInlineValid ? (
          <div
            className={cn(
              "rounded-2xl border shadow-xs overflow-hidden transition-all duration-200",
              isCodeBlank
                ? "border-zinc-800 bg-zinc-950 text-zinc-100 font-mono"
                : "border-lesson-border bg-lesson-surface text-lesson-text-primary",
            )}
          >
            {/* Header bar of mechanism slot */}
            <div
              className={cn(
                "flex items-center justify-between px-4 sm:px-5 py-2.5 border-b text-[11px] font-mono select-none",
                isCodeBlank
                  ? "border-zinc-800/80 bg-zinc-900/60 text-zinc-400"
                  : "border-lesson-border/60 bg-lesson-surface-elevated/50 text-lesson-text-muted",
              )}
            >
              <div className="flex items-center gap-2">
                {isCodeBlank ? (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-zinc-700/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-zinc-700/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-zinc-700/80" />
                    </div>
                    <span className="h-3.5 w-px bg-zinc-800 mx-1" />
                    <Code2 className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-semibold text-zinc-300">Syntax Reconstruction</span>
                  </>
                ) : (
                  <>
                    <Wrench className="w-3.5 h-3.5 text-lesson-accent" />
                    <span className="font-semibold text-lesson-text-secondary">
                      Mechanism Statement
                    </span>
                  </>
                )}
              </div>
              <span className="text-[10px] uppercase tracking-wider opacity-75">
                {blanks.length === 1 ? "1 missing piece" : `${blanks.length} missing pieces`}
              </span>
            </div>

            {/* Inline interactive mechanism */}
            <div className="p-5 sm:p-7 whitespace-pre-wrap leading-loose text-base sm:text-lg flex flex-wrap items-center gap-y-3.5 gap-x-1.5">
              {segments.map((seg, segIdx) => {
                if (seg.type === "text") {
                  return (
                    <span key={`text-${segIdx}`} className="select-text">
                      {seg.text}
                    </span>
                  );
                }

                const blankIdx = seg.blankIndex ?? 0;
                const blank = seg.blank || blanks[blankIdx];
                const val = blankValues[blankIdx] || "";
                const isFilled = val.trim().length > 0;

                return (
                  <span
                    key={`blank-slot-${blankIdx}`}
                    className="inline-flex items-center relative mx-1 my-0.5 align-middle"
                  >
                    <input
                      id={`blank-input-${activity.id}-${blankIdx}`}
                      type="text"
                      value={val}
                      disabled={readOnly || (isSubmitted && isCorrect)}
                      autoComplete="off"
                      spellCheck={false}
                      placeholder={blank?.placeholder || "..."}
                      style={{
                        width: `${Math.max(val.length, (blank?.placeholder || "").length, 4) * 9.5 + 38}px`,
                        minWidth: "88px",
                        maxWidth: "100%",
                      }}
                      onChange={(e) => handleBlankChange(blankIdx, e.target.value)}
                      onKeyDown={handleKeyDown}
                      aria-label={
                        blanks.length > 1
                          ? `Blank ${blankIdx + 1} of ${blanks.length}: ${blank?.placeholder || blank?.id || ""}`
                          : `Answer for missing mechanism: ${blank?.placeholder || blank?.id || ""}`
                      }
                      className={cn(
                        "h-11 px-3 sm:px-3.5 rounded-lg border text-center text-base transition-all duration-150 shadow-xs focus:outline-none focus:ring-2",
                        inputStateClasses(blankIdx, isFilled),
                      )}
                    />
                  </span>
                );
              })}
            </div>
          </div>
        ) : (
          /* Fallback structured reference and slot cards view */
          <div className="space-y-5">
            <div className="rounded-2xl border border-lesson-border bg-lesson-surface overflow-hidden shadow-xs">
              <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 border-b border-lesson-border/60 bg-lesson-surface-elevated/50 text-[11px] font-mono text-lesson-text-muted select-none">
                <span className="flex items-center gap-2">
                  <Code2 className="w-3.5 h-3.5 text-lesson-accent" />
                  <span className="font-semibold text-lesson-text-secondary">
                    Reference Mechanism
                  </span>
                </span>
                <span className="text-[10px] uppercase tracking-wider text-lesson-text-muted">
                  {blanks.length} {blanks.length === 1 ? "blank" : "blanks"} to reconstruct
                </span>
              </div>
              <div className="p-5 sm:p-6 overflow-x-auto text-sm sm:text-base font-mono leading-relaxed bg-lesson-bg/60">
                <pre className="whitespace-pre-wrap font-mono">{template}</pre>
              </div>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2">
              {blanks.map((blank, idx) => {
                const val = blankValues[idx] || "";
                const isFilled = val.trim().length > 0;
                return (
                  <div
                    key={blank.id}
                    className="flex flex-col gap-2 p-4 rounded-xl border border-lesson-border bg-lesson-surface shadow-xs transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor={`blank-input-${activity.id}-${idx}`}
                        className="text-xs font-mono font-semibold uppercase tracking-wider text-lesson-text-muted flex items-center gap-1.5"
                      >
                        <span className="flex h-5 w-5 items-center justify-center rounded-md border border-lesson-border bg-lesson-surface-elevated text-[11px] font-bold text-lesson-accent">
                          {idx + 1}
                        </span>
                        <span>
                          {blank.placeholder ? `Blank (${blank.placeholder})` : `Blank #${idx + 1}`}
                        </span>
                      </label>
                      {isSubmitted && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                      {isSubmitted && isIncorrect && (
                        <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                      )}
                    </div>

                    <input
                      id={`blank-input-${activity.id}-${idx}`}
                      type="text"
                      value={val}
                      disabled={readOnly || (isSubmitted && isCorrect)}
                      autoComplete="off"
                      spellCheck={false}
                      placeholder={blank.placeholder || "Enter missing value..."}
                      onChange={(e) => handleBlankChange(idx, e.target.value)}
                      onKeyDown={handleKeyDown}
                      aria-label={`Blank ${idx + 1}: ${blank.placeholder || blank.id}`}
                      className={cn(
                        "h-11 px-3.5 rounded-lg border text-base font-mono bg-lesson-bg text-lesson-text-primary focus:outline-none focus:ring-2 transition-all w-full",
                        !isSubmitted &&
                          (isFilled ? "border-lesson-accent/60" : "border-lesson-border"),
                        !isSubmitted && "focus:border-lesson-accent focus:ring-lesson-focus-ring",
                        isSubmitted &&
                          isCorrect &&
                          "border-emerald-500/80 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold",
                        isSubmitted &&
                          isIncorrect &&
                          "border-rose-500/80 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold",
                      )}
                    />

                    {blank.hint && isIncorrect && (
                      <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                        <span>Hint: {blank.hint}</span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Commitment Strip */}
        {allFilled && !isSubmitted && (
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-lesson-border bg-lesson-surface/80 text-xs animate-in fade-in duration-150">
            <div className="flex items-center gap-2 min-w-0">
              <span className="h-2 w-2 rounded-full bg-lesson-accent shrink-0 animate-pulse" />
              <span className="truncate text-lesson-text-muted">
                Reconstructed Mechanism:{" "}
                <span className="font-mono text-lesson-text-primary font-semibold">
                  {blankValues.map((v) => `[${v}]`).join(" ")}
                </span>
              </span>
            </div>
            <span className="hidden sm:inline-flex shrink-0 font-mono text-[11px] uppercase tracking-wider text-lesson-accent font-medium">
              Ready to check • Press Enter
            </span>
          </div>
        )}

        {/* Verification Status Feedback Strip */}
        {isSubmitted && isCorrect && (
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs animate-in fade-in duration-150">
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-emerald-800 dark:text-emerald-200 font-medium">
                Mechanism Verified — all missing elements correctly reconstructed.
              </span>
            </div>
            <span className="hidden sm:inline-flex shrink-0 font-mono text-[11px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold">
              Correct
            </span>
          </div>
        )}

        {/* Diagnostic Clues on Incorrect Submission */}
        {isSubmitted && isIncorrect && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span className="text-rose-800 dark:text-rose-200 font-medium">
                  Mechanism Incomplete or Incorrect — review the diagnostic feedback and retry.
                </span>
              </div>
              <span className="hidden sm:inline-flex shrink-0 font-mono text-[11px] uppercase tracking-wider text-rose-600 dark:text-rose-400 font-semibold">
                Needs Revision
              </span>
            </div>

            {blanks.some((b) => b.hint) && (
              <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs text-lesson-text-secondary space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400 font-mono uppercase tracking-wider text-[11px]">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>Diagnostic Clues</span>
                </div>
                <ul className="list-disc list-inside space-y-1">
                  {blanks.map((b, idx) =>
                    b.hint ? (
                      <li key={b.id} className="leading-relaxed">
                        <strong className="text-lesson-text-primary">
                          Blank #{idx + 1} {b.placeholder ? `(${b.placeholder})` : ""}:
                        </strong>{" "}
                        {b.hint}
                      </li>
                    ) : null,
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

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
        canSubmit={allFilled}
      />
    </ActivityContainer>
  );
}
