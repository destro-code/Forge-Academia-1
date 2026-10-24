import { useState, useEffect, useCallback } from "react";
import { ForgeBuddyMascot3D, type ForgeMascotMood } from "@/components/atelier/forge-buddy-illos";
import { AlertTriangle, CheckCircle2, HelpCircle, X } from "lucide-react";

export type ForgeBuddyEventKind = "wrong-answer" | "explicit-hint" | "milestone-verified";

export interface ForgeBuddyEvent {
  kind: ForgeBuddyEventKind;
  key: string;
}

export interface ForgeBuddyLessonCompanionProps {
  lessonId: string;
  lessonTitle: string;
  moduleTitle?: string;
  lessonSummary?: string;
  stepIndex: number;
  totalSteps: number;
  stepTitle: string;
  stepInstruction?: string;
  activityType?: string;
  stepKind?: string;
  isInteractive?: boolean;
  status?: "idle" | "submitted" | "correct" | "incorrect" | "completed";
  isCompleted?: boolean;
  attempts?: number;
  hints?: string[];
  hintsAvailable?: number;
  hintsRevealed?: number;
  helpRequested?: boolean;
  hintText?: string;
  misconceptionNote?: string;
  milestoneVerified?: boolean;
  milestoneTitle?: string;
  milestoneMessage?: string;
  isTimedInterview?: boolean;
  lastFeedbackMessage?: string;
  stepError?: string | null;
  onRevealHint?: () => void;
  onDismiss?: () => void;
}

function resolveDistinctCoachingNote(params: {
  misconceptionNote?: string;
  stepError?: string | null;
  hintText?: string;
  hints?: string[];
  hintsRevealed?: number;
  lastFeedbackMessage?: string;
}): string | undefined {
  const {
    misconceptionNote,
    stepError,
    hintText,
    hints = [],
    hintsRevealed = 0,
    lastFeedbackMessage,
  } = params;
  const activeHintFromList =
    hints.length > 0
      ? hints[Math.min(Math.max(0, hintsRevealed - 1), hints.length - 1)]
      : undefined;
  const inlineFeedback = (lastFeedbackMessage ?? "").trim().toLowerCase();

  const candidates = [misconceptionNote, stepError ?? undefined, hintText, activeHintFromList];
  for (const candidate of candidates) {
    const trimmed = candidate?.trim();
    if (trimmed && trimmed.toLowerCase() !== inlineFeedback) {
      return trimmed;
    }
  }
  return undefined;
}

/**
 * Explicit event policy for Forge Buddy in lessons.
 * - Never triggers on initial load, ordinary navigation, or ordinary correct answers.
 * - Never triggers during a timed interview.
 * - Never falls back to unrelated lesson/module trivia or generic boilerplate tips.
 * - Triggers ONLY on:
 *   1. Verified milestone (`milestoneVerified === true`)
 *   2. Explicit hint/help request (`hintsRevealed > 0` or `helpRequested === true`) when the activity has an explicit hint
 *   3. Wrong answer / meaningful misconception (`status === "incorrect"`, `stepError`, or `misconceptionNote`) ONLY when the activity has an explicit, distinct `misconceptionNote`, `stepError`, `hintText`, or `hints` entry beyond the inline error feedback.
 */
export function resolveForgeBuddyEvent(
  props: Pick<
    ForgeBuddyLessonCompanionProps,
    | "lessonId"
    | "stepIndex"
    | "stepTitle"
    | "status"
    | "isCompleted"
    | "attempts"
    | "hints"
    | "hintsRevealed"
    | "helpRequested"
    | "hintText"
    | "misconceptionNote"
    | "milestoneVerified"
    | "milestoneTitle"
    | "isTimedInterview"
    | "lastFeedbackMessage"
    | "stepError"
  >,
): ForgeBuddyEvent | null {
  if (props.isTimedInterview) {
    return null;
  }

  const {
    lessonId,
    stepIndex,
    stepTitle,
    status = "idle",
    isCompleted: isCompletedProp,
    attempts = 0,
    hints = [],
    hintsRevealed = 0,
    helpRequested = false,
    hintText,
    misconceptionNote,
    milestoneVerified = false,
    milestoneTitle,
    lastFeedbackMessage,
    stepError,
  } = props;

  if (milestoneVerified) {
    return {
      kind: "milestone-verified",
      key: `${lessonId}:${stepIndex}:milestone:${milestoneTitle || stepTitle}`,
    };
  }

  const isOrdinaryCompleted =
    Boolean(isCompletedProp) || status === "correct" || status === "completed";

  // After an ordinary correct answer, show the activity's own feedback only.
  if (isOrdinaryCompleted) {
    return null;
  }

  const hasExplicitHintContent = hints.length > 0 || Boolean(hintText?.trim());
  if ((hintsRevealed > 0 || helpRequested) && hasExplicitHintContent) {
    return {
      kind: "explicit-hint",
      key: `${lessonId}:${stepIndex}:hint:${hintsRevealed}:${helpRequested ? "help" : "nohelp"}`,
    };
  }

  const isIncorrect = status === "incorrect" || Boolean(stepError) || Boolean(misconceptionNote);
  const distinctWrongAnswerNote = resolveDistinctCoachingNote({
    misconceptionNote,
    stepError,
    hintText,
    hints,
    hintsRevealed,
    lastFeedbackMessage,
  });

  if (isIncorrect && distinctWrongAnswerNote) {
    return {
      kind: "wrong-answer",
      key: `${lessonId}:${stepIndex}:wrong:${Math.max(1, attempts)}:${distinctWrongAnswerNote}`,
    };
  }

  return null;
}

function renderInlineMarkdown(text: string) {
  const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return tokens.map((token, idx) => {
    if (token.startsWith("**") && token.endsWith("**") && token.length > 4) {
      return (
        <strong key={idx} className="font-bold text-[#1E1B4B]">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith("`") && token.endsWith("`") && token.length > 2) {
      return (
        <code
          key={idx}
          className="rounded bg-[#EDE9FE] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-[#4F46E5]"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    return <span key={idx}>{token}</span>;
  });
}

/**
 * Event-Driven Forge Buddy Lesson Companion:
 * - Renders `null` on initial load, ordinary navigation, ordinary correct answers, and timed interviews.
 * - Renders a small, dismissible contextual speech bubble ONLY when `resolveForgeBuddyEvent` returns a qualifying event.
 * - Once dismissed for a given event key, stays dismissed across unrelated rerenders.
 */
export function ForgeBuddyLessonCompanion(props: ForgeBuddyLessonCompanionProps) {
  const {
    lessonId,
    stepIndex,
    totalSteps,
    stepTitle,
    status = "idle",
    isCompleted: isCompletedProp,
    attempts = 0,
    hints = [],
    hintsAvailable: hintsAvailableProp,
    hintsRevealed = 0,
    helpRequested = false,
    hintText,
    misconceptionNote,
    milestoneVerified = false,
    milestoneTitle,
    milestoneMessage,
    isTimedInterview = false,
    lastFeedbackMessage,
    stepError,
    onRevealHint,
    onDismiss,
  } = props;

  const [dismissedEventKeys, setDismissedEventKeys] = useState<Record<string, true>>({});

  const activeEvent = resolveForgeBuddyEvent({
    lessonId,
    stepIndex,
    stepTitle,
    status,
    isCompleted: isCompletedProp,
    attempts,
    hints,
    hintsRevealed,
    helpRequested,
    hintText,
    misconceptionNote,
    milestoneVerified,
    milestoneTitle,
    isTimedInterview,
    lastFeedbackMessage,
    stepError,
  });

  const isVisible = Boolean(activeEvent && !dismissedEventKeys[activeEvent.key]);

  const handleDismiss = useCallback(() => {
    if (!activeEvent) return;
    setDismissedEventKeys((prev) =>
      prev[activeEvent.key] ? prev : { ...prev, [activeEvent.key]: true },
    );
    onDismiss?.();
  }, [activeEvent, onDismiss]);

  useEffect(() => {
    if (!isVisible) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleDismiss();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isVisible, handleDismiss]);

  if (!activeEvent || !isVisible) {
    return null;
  }

  const effectiveHintsAvailable = Math.max(hintsAvailableProp ?? 0, hints.length);
  const canRevealNextHint = Boolean(onRevealHint && effectiveHintsAvailable > hintsRevealed);

  const getMascotMood = (): ForgeMascotMood => {
    if (activeEvent.kind === "milestone-verified") {
      return stepIndex === totalSteps - 1 ? "excited" : "cheering";
    }
    if (activeEvent.kind === "wrong-answer") {
      return "thinking";
    }
    return "happy";
  };

  const resolvedHintMessage = (() => {
    if (hints.length > 0 && hintsRevealed > 0) {
      const idx = Math.min(hintsRevealed, hints.length) - 1;
      return hints[idx];
    }
    if (hintText?.trim()) {
      return hintText.trim();
    }
    if (hints.length > 0) {
      return hints[0];
    }
    return "";
  })();

  const resolvedWrongAnswerMessage =
    resolveDistinctCoachingNote({
      misconceptionNote,
      stepError,
      hintText,
      hints,
      hintsRevealed,
      lastFeedbackMessage,
    }) ?? "";

  return (
    <div
      role="region"
      aria-label="Forge Buddy Lesson Coach"
      className="mt-4 rounded-2xl border border-[#6E6AF6]/30 bg-gradient-to-r from-[#F5F3FF]/95 via-[#FFFDF9] to-[#EEF2FF]/85 px-3.5 py-3 sm:px-4 sm:py-3.5 shadow-2xs transition-all"
      data-testid="forge-buddy-companion"
      data-buddy-event={activeEvent.kind}
    >
      <div className="flex items-start gap-3">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1E1B4B] to-[#312E81] border border-[#6E6AF6]/40 shadow-xs">
          <ForgeBuddyMascot3D mood={getMascotMood()} className="h-9 w-9" animate={true} />
          {activeEvent.kind === "milestone-verified" && (
            <span
              title="Milestone Verified"
              className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xs"
            >
              <CheckCircle2 className="h-3 w-3" />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          {activeEvent.kind === "milestone-verified" ? (
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Milestone Verified</span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-[#1C1814] leading-relaxed">
                  {renderInlineMarkdown(
                    milestoneMessage || `Milestone verified: "${milestoneTitle || stepTitle}".`,
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Dismiss Forge Buddy"
                data-testid="forge-buddy-dismiss"
                className="rounded-lg p-1 text-[#5C5346] hover:bg-black/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : activeEvent.kind === "explicit-hint" ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#312E81]">
                  <HelpCircle className="h-3.5 w-3.5 text-[#4F46E5]" />
                  <span>
                    Forge Buddy Hint
                    {effectiveHintsAvailable > 0 && hintsRevealed > 0
                      ? ` · ${Math.min(hintsRevealed, effectiveHintsAvailable)}/${effectiveHintsAvailable}`
                      : ""}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {canRevealNextHint && (
                    <button
                      type="button"
                      onClick={onRevealHint}
                      data-testid="forge-buddy-reveal-hint"
                      className="inline-flex items-center gap-1 rounded-lg border border-amber-500/40 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-colors"
                    >
                      <HelpCircle className="h-3.5 w-3.5" />
                      <span>
                        Next Hint ({hintsRevealed + 1}/{effectiveHintsAvailable})
                      </span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleDismiss}
                    aria-label="Dismiss Forge Buddy"
                    data-testid="forge-buddy-dismiss"
                    className="rounded-lg p-1 text-[#5C5346] hover:bg-black/5"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-[#1C1814] leading-relaxed">
                {renderInlineMarkdown(resolvedHintMessage)}
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-amber-800">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                  <span>
                    Forge Buddy Coaching · {attempts <= 1 ? "1st Attempt" : `${attempts} Attempts`}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {canRevealNextHint && (
                    <button
                      type="button"
                      onClick={onRevealHint}
                      data-testid="forge-buddy-reveal-hint"
                      className="inline-flex items-center gap-1 rounded-lg border border-amber-500/40 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-colors"
                    >
                      <HelpCircle className="h-3.5 w-3.5" />
                      <span>
                        Reveal Hint ({hintsRevealed + 1}/{effectiveHintsAvailable})
                      </span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleDismiss}
                    aria-label="Dismiss Forge Buddy"
                    data-testid="forge-buddy-dismiss"
                    className="rounded-lg p-1 text-[#5C5346] hover:bg-black/5"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-[#1C1814] leading-relaxed">
                {renderInlineMarkdown(resolvedWrongAnswerMessage)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
