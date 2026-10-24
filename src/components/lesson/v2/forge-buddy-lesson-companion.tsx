import { useState, useEffect } from "react";
import { ForgeBuddyMascot3D, type ForgeMascotMood } from "@/components/atelier/forge-buddy-illos";
import { getEli5MentorNote } from "@/lib/curriculum/v1/eli5-mentor-bank";
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Laugh,
  Briefcase,
  HelpCircle,
  ChevronDown,
  X,
} from "lucide-react";

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
  hintsAvailable?: number;
  hintsRevealed?: number;
  lastFeedbackMessage?: string;
  stepError?: string | null;
  onRevealHint?: () => void;
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
 * Event-Driven Bottom Forge Buddy Companion:
 * - Positioned BELOW the primary lesson content (`ActivityStage`) so it never spoils the topic.
 * - Quiet by default (collapsed single-line bottom pill).
 * - Automatically expands ONLY on meaningful learner events:
 *   1. Wrong answer / misconception (`isIncorrect`)
 *   2. Explicit hint request (`hintsRevealed > 0` or learner taps "Ask Forge Buddy")
 *   3. Verified interactive check completion (`isInteractive && isCompleted`)
 */
export function ForgeBuddyLessonCompanion({
  lessonId,
  moduleTitle,
  lessonSummary,
  stepIndex,
  totalSteps,
  stepTitle,
  activityType,
  stepKind,
  isInteractive = false,
  status = "idle",
  isCompleted: isCompletedProp,
  attempts = 0,
  hintsAvailable = 0,
  hintsRevealed = 0,
  lastFeedbackMessage,
  stepError,
  onRevealHint,
}: ForgeBuddyLessonCompanionProps) {
  const mentorNote = getEli5MentorNote(lessonId, moduleTitle, lessonSummary);
  const effectiveKind = (activityType || stepKind || "concept").toLowerCase();

  const isCodeOrPracticeStep =
    stepIndex >= 2 ||
    isInteractive ||
    effectiveKind.includes("code") ||
    effectiveKind.includes("replicate") ||
    effectiveKind.includes("debug") ||
    effectiveKind.includes("practice");

  const [isManuallyExpanded, setIsManuallyExpanded] = useState(false);
  const [isEventDismissed, setIsEventDismissed] = useState(false);
  const [activeTab, setActiveTab] = useState<"analogy" | "trap" | "joke">(
    isCodeOrPracticeStep ? "trap" : "analogy",
  );

  // Reset manual expansion and dismissal when moving to a new step or new attempt
  useEffect(() => {
    setIsManuallyExpanded(false);
    setIsEventDismissed(false);
    setActiveTab(isCodeOrPracticeStep ? "trap" : "analogy");
  }, [stepIndex, lessonId, isCodeOrPracticeStep]);

  useEffect(() => {
    setIsEventDismissed(false);
  }, [status, attempts, hintsRevealed]);

  const isCompleted =
    isCompletedProp ?? (status === "correct" || status === "completed");
  const isIncorrect = status === "incorrect" || Boolean(stepError);
  const errorText = stepError || (isIncorrect ? lastFeedbackMessage : undefined);

  // Event-driven triggers: wrong answer, hint requested, or verified interactive check
  const isEventTriggered =
    !isEventDismissed &&
    (isIncorrect || hintsRevealed > 0 || (isInteractive && isCompleted));
  const isExpanded = isEventTriggered || isManuallyExpanded;

  const handleDismiss = () => {
    setIsManuallyExpanded(false);
    setIsEventDismissed(true);
  };

  useEffect(() => {
    if (!isExpanded) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsManuallyExpanded(false);
        setIsEventDismissed(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isExpanded]);

  const getMascotMood = (): ForgeMascotMood => {
    if (isIncorrect) return "thinking";
    if (isCompleted) return stepIndex === totalSteps - 1 ? "excited" : "cheering";
    if (activeTab === "joke") return "winking";
    if (activeTab === "trap") return "thinking";
    return "happy";
  };

  // Quiet Default State: Single unobtrusive bottom pill below the lesson content
  if (!isExpanded) {
    return (
      <div
        className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-lesson-border/80 bg-lesson-surface/70 px-3.5 py-2.5 transition-all hover:border-primary/40"
        data-testid="forge-buddy-companion-pill"
      >
        <button
          type="button"
          aria-expanded={false}
          onClick={() => {
            setActiveTab(isCodeOrPracticeStep ? "trap" : "analogy");
            setIsEventDismissed(false);
            setIsManuallyExpanded(true);
          }}
          className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#1E1B4B] border border-[#6E6AF6]/40">
            <ForgeBuddyMascot3D mood="happy" className="h-7 w-7" animate={false} />
          </div>
          <div className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold text-lesson-text-primary">
              Ask Forge Buddy ·{" "}
              <span className="font-normal text-lesson-text-secondary">
                {isCodeOrPracticeStep
                  ? "See how interviewers test this concept"
                  : mentorNote.analogyTitle}
              </span>
            </span>
          </div>
          <span className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary shrink-0">
            <span>Open Coach</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </span>
        </button>

        {isInteractive && onRevealHint && hintsAvailable > hintsRevealed && (
          <button
            type="button"
            onClick={() => {
              onRevealHint();
              setIsEventDismissed(false);
              setIsManuallyExpanded(true);
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-amber-500/35 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 shrink-0"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Hint ({hintsRevealed}/{hintsAvailable})</span>
          </button>
        )}
      </div>
    );
  }

  // Event-Driven / On-Demand Expanded State (Below Main Content)
  return (
    <div
      role="region"
      aria-label="Forge Buddy Lesson Coach"
      className="mt-4 rounded-2xl border border-[#6E6AF6]/30 bg-gradient-to-r from-[#F5F3FF]/95 via-[#FFFDF9] to-[#EEF2FF]/85 px-3.5 py-3 sm:px-4 sm:py-3.5 shadow-2xs transition-all"
      data-testid="forge-buddy-companion"
    >
      <div className="flex items-start gap-3">
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1E1B4B] to-[#312E81] border border-[#6E6AF6]/40 shadow-xs">
          <ForgeBuddyMascot3D
            mood={getMascotMood()}
            className="h-10 w-10"
            animate={true}
          />
          {isCompleted && (
            <span
              title="Verified!"
              className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xs"
            >
              <CheckCircle2 className="h-3 w-3" />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          {/* Event 1: Verified Interactive Check Celebration */}
          {isInteractive && isCompleted ? (
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Verified · Capability Evidence Recorded</span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-[#1C1814] leading-relaxed">
                  {lastFeedbackMessage
                    ? renderInlineMarkdown(lastFeedbackMessage)
                    : `Spot on! You verified "${stepTitle}".`}
                </p>
              </div>
              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Dismiss Forge Buddy"
                className="rounded-lg p-1 text-[#5C5346] hover:bg-black/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : isIncorrect ? (
            /* Event 2: Wrong Answer / Misconception Coaching */
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-amber-800">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                  <span>
                    Forge Buddy Coaching · {attempts === 1 ? "1st Attempt" : `${attempts} Attempts`}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {onRevealHint && hintsAvailable > hintsRevealed && (
                    <button
                      type="button"
                      onClick={onRevealHint}
                      className="inline-flex items-center gap-1 rounded-lg border border-amber-500/40 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-colors"
                    >
                      <HelpCircle className="h-3.5 w-3.5" />
                      <span>Reveal Hint ({hintsRevealed + 1}/{hintsAvailable})</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleDismiss}
                    aria-label="Dismiss Forge Buddy"
                    className="rounded-lg p-1 text-[#5C5346] hover:bg-black/5"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-[#1C1814] leading-relaxed">
                {errorText ? renderInlineMarkdown(errorText) : "Let's look closely at why that happened."}{" "}
                <span className="block mt-1 text-[#4A4338]">
                  <strong>Mental model tip:</strong> {renderInlineMarkdown(mentorNote.watchOut)}
                </span>
              </p>
            </div>
          ) : (
            /* Event 3: Learner-Requested Coach (Analogy, Interview Trap, or Dev Joke) */
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab("analogy")}
                    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors ${
                      activeTab === "analogy"
                        ? "bg-[#1E1B4B] text-white"
                        : "bg-white/90 text-[#312E81] border border-[#6E6AF6]/25 hover:bg-[#EDE9FE]"
                    }`}
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Analogy</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("trap")}
                    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors ${
                      activeTab === "trap"
                        ? "bg-amber-700 text-white"
                        : "bg-white/90 text-amber-800 border border-amber-500/30 hover:bg-amber-50"
                    }`}
                  >
                    <Briefcase className="h-3 w-3" />
                    <span>Interview Trap</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("joke")}
                    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors ${
                      activeTab === "joke"
                        ? "bg-[#6E6AF6] text-white"
                        : "bg-white/90 text-[#4F46E5] border border-[#6E6AF6]/25 hover:bg-[#EDE9FE]"
                    }`}
                  >
                    <Laugh className="h-3 w-3" />
                    <span>Dev Joke</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleDismiss}
                  aria-label="Collapse Forge Buddy"
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-[#5C5346] hover:bg-black/5"
                >
                  <span>Hide</span>
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {activeTab === "analogy" && (
                <div className="space-y-1">
                  <p className="text-xs font-extrabold text-[#312E81]">
                    {mentorNote.analogyTitle}
                  </p>
                  <p className="text-xs sm:text-sm text-[#1C1814] leading-relaxed">
                    {renderInlineMarkdown(mentorNote.eli5Text)}
                  </p>
                </div>
              )}

              {activeTab === "trap" && (
                <div className="space-y-1.5 rounded-xl border border-amber-500/30 bg-amber-50/80 px-3 py-2 text-xs">
                  <p className="font-bold text-amber-950">
                    Interviewer Question: &ldquo;{mentorNote.interviewTrap.question}&rdquo;
                  </p>
                  <p className="text-amber-900 leading-relaxed">
                    <strong>Common Trap:</strong> {renderInlineMarkdown(mentorNote.interviewTrap.trap)}
                  </p>
                  <p className="text-[#1E1B4B] leading-relaxed">
                    <strong className="text-emerald-800">Winning Answer:</strong>{" "}
                    {renderInlineMarkdown(mentorNote.interviewTrap.punchline)}
                  </p>
                </div>
              )}

              {activeTab === "joke" && (
                <div className="rounded-xl border border-[#6E6AF6]/25 bg-white/90 px-3 py-2 text-xs text-[#1E1B4B]">
                  <p className="font-semibold italic">&ldquo;{mentorNote.joke}&rdquo;</p>
                  <p className="mt-1 text-[11px] text-[#5C5346]">
                    {renderInlineMarkdown(mentorNote.seniorWit)}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
