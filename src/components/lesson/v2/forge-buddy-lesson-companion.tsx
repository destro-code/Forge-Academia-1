import { useState, useEffect } from "react";
import { ForgeBuddyMascot3D, type ForgeMascotMood } from "@/components/atelier/forge-buddy-illos";
import { getEli5MentorNote } from "@/lib/curriculum/v1/eli5-mentor-bank";
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Code2,
  Laugh,
  Briefcase,
  HelpCircle,
  ArrowRight,
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
  onOpenSandbox?: () => void;
  onOpenSandboxWithTrap?: (code: string, title: string, challengePrompt: string) => void;
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

export function ForgeBuddyLessonCompanion({
  lessonId,
  lessonTitle,
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
  onOpenSandbox,
  onOpenSandboxWithTrap,
}: ForgeBuddyLessonCompanionProps) {
  const mentorNote = getEli5MentorNote(lessonId, moduleTitle, lessonSummary);
  const effectiveKind = (activityType || stepKind || "concept").toLowerCase();

  // Intro/concept steps naturally show the Plain-English Analogy + Dev Joke;
  // Code/Practice/Walkthrough steps (or step 3+) naturally surface the Interview Trap.
  const isCodeOrPracticeStep =
    stepIndex >= 2 ||
    isInteractive ||
    effectiveKind.includes("code") ||
    effectiveKind.includes("replicate") ||
    effectiveKind.includes("debug") ||
    effectiveKind.includes("practice");

  const [manualViewOverride, setManualViewOverride] = useState<"analogy" | "trap" | null>(null);
  const [showJokeBubble, setShowJokeBubble] = useState(false);

  // Reset manual overrides when advancing to a new step
  useEffect(() => {
    setManualViewOverride(null);
    setShowJokeBubble(false);
  }, [stepIndex, lessonId]);

  const activeView: "analogy" | "trap" =
    manualViewOverride ?? (isCodeOrPracticeStep ? "trap" : "analogy");

  const isCompleted =
    isCompletedProp ?? (status === "correct" || status === "completed");
  const isIncorrect = status === "incorrect" || Boolean(stepError);
  const errorText = stepError || (isIncorrect ? lastFeedbackMessage : undefined);

  const getMascotMood = (): ForgeMascotMood => {
    if (isIncorrect) return "thinking";
    if (isCompleted) return stepIndex === totalSteps - 1 ? "excited" : "cheering";
    if (showJokeBubble) return "winking";
    if (activeView === "trap") return isInteractive ? "coding" : "thinking";
    return "happy";
  };

  const handleTestTrapLive = () => {
    const trapCode = `// 🎯 LIVE INTERVIEW TRAP LAB: ${lessonTitle}
// Interview Question: ${mentorNote.interviewTrap.question}
// ⚠️ Common Trap: ${mentorNote.interviewTrap.trap}
// ✅ Senior Approach: ${mentorNote.interviewTrap.punchline}

${mentorNote.practiceSnippet.starterCode}`;

    if (onOpenSandboxWithTrap) {
      onOpenSandboxWithTrap(
        trapCode,
        `Interview Trap: ${mentorNote.interviewTrap.question}`,
        `Prove the senior answer in code: ${mentorNote.interviewTrap.punchline}`,
      );
    } else if (onOpenSandbox) {
      onOpenSandbox();
    }
  };

  return (
    <div
      className="mb-3 rounded-2xl border border-[#6E6AF6]/25 bg-gradient-to-r from-[#F5F3FF]/95 via-[#FFFDF9] to-[#EEF2FF]/80 px-3.5 py-3 sm:px-4 sm:py-3.5 shadow-2xs transition-all"
      data-testid="forge-buddy-companion"
    >
      <div className="flex items-start gap-3 sm:gap-3.5">
        {/* Compact Hooded Forge Spirit Avatar */}
        <div className="relative flex h-12 w-12 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1E1B4B] to-[#312E81] border border-[#6E6AF6]/40 shadow-xs">
          <ForgeBuddyMascot3D
            mood={getMascotMood()}
            className="h-11 w-11"
            animate={true}
          />
          {isCompleted && (
            <span
              title="Step Mastered!"
              className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#2E6B4E] text-white shadow-2xs"
            >
              <CheckCircle2 className="h-3 w-3" />
            </span>
          )}
        </div>

        {/* Contextual Speech Bubble Body */}
        <div className="min-w-0 flex-1 space-y-2">
          {/* State 1: Learner Just Checked Answer (Correct / Incorrect Reaction) */}
          {isCompleted ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#2E6B4E]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Forge Buddy · Step {stepIndex + 1} Locked In!</span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-[#1C1814] leading-relaxed">
                  {lastFeedbackMessage
                    ? renderInlineMarkdown(lastFeedbackMessage)
                    : `Spot on! You nailed "${stepTitle}". Ready for the next step or want to experiment in Code Live?`}
                </p>
              </div>
              {onOpenSandbox && (
                <button
                  type="button"
                  onClick={onOpenSandbox}
                  className="inline-flex items-center gap-1.5 self-start sm:self-center shrink-0 rounded-xl border border-[#6E6AF6]/35 bg-white px-3 py-1.5 text-xs font-bold text-[#4F46E5] hover:bg-[#F5F3FF] transition-colors"
                >
                  <Code2 className="h-3.5 w-3.5" />
                  <span>Tinker in Code Live</span>
                </button>
              )}
            </div>
          ) : isIncorrect ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#B45309]">
                  <AlertTriangle className="h-3.5 w-3.5 text-[#D97706]" />
                  <span>
                    Forge Buddy Coaching ({attempts} {attempts === 1 ? "try" : "tries"})
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#1C1814] leading-relaxed">
                  {errorText ? renderInlineMarkdown(errorText) : "Almost there!"}{" "}
                  <span className="text-[#5C5346]">
                    Tip: {renderInlineMarkdown(mentorNote.watchOut)}
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                {onRevealHint && hintsAvailable > hintsRevealed && (
                  <button
                    type="button"
                    onClick={onRevealHint}
                    className="inline-flex items-center gap-1 rounded-xl border border-[#D97706]/40 bg-[#FFFBEB] px-2.5 py-1.5 text-xs font-bold text-[#B45309] hover:bg-[#FEF3C7] transition-colors"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                    <span>Get Hint ({hintsRevealed + 1}/{hintsAvailable})</span>
                  </button>
                )}
                {onOpenSandbox && (
                  <button
                    type="button"
                    onClick={onOpenSandbox}
                    className="inline-flex items-center gap-1 rounded-xl bg-[#6E6AF6] px-2.5 py-1.5 text-xs font-bold text-white hover:bg-[#5B57E6] transition-colors"
                  >
                    <Code2 className="h-3.5 w-3.5" />
                    <span>Test in Sandbox</span>
                  </button>
                )}
              </div>
            </div>
          ) : activeView === "analogy" ? (
            /* State 2: Intro / Concept Step -> Plain-English Mental Model + Dev Joke */
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#1E1B4B] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#FBBF24]">
                    <Sparkles className="h-2.5 w-2.5 text-[#A78BFA]" />
                    Forge Buddy
                  </span>
                  <span className="text-xs font-extrabold text-[#312E81]">
                    {mentorNote.analogyTitle}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowJokeBubble((v) => !v)}
                    className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-bold transition-colors ${
                      showJokeBubble
                        ? "bg-[#6E6AF6] text-white"
                        : "bg-white/90 text-[#4F46E5] border border-[#6E6AF6]/25 hover:bg-[#EDE9FE]"
                    }`}
                  >
                    <Laugh className="h-3 w-3" />
                    <span>{showJokeBubble ? "Hide Joke" : "Dev Joke"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setManualViewOverride("trap")}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#D97706]/30 bg-[#FFFBEB] px-2 py-0.5 text-[11px] font-bold text-[#B45309] hover:bg-[#FEF3C7] transition-colors"
                  >
                    <Briefcase className="h-3 w-3" />
                    <span>Interview Trap</span>
                  </button>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#1C1814] leading-relaxed">
                {renderInlineMarkdown(mentorNote.eli5Text)}
              </p>

              {showJokeBubble && (
                <div className="mt-1.5 flex items-start gap-2 rounded-xl border border-[#6E6AF6]/25 bg-white/90 px-3 py-2 text-xs text-[#1E1B4B]">
                  <Laugh className="h-4 w-4 shrink-0 text-[#6E6AF6] mt-0.5" />
                  <div>
                    <p className="font-semibold italic">&ldquo;{mentorNote.joke}&rdquo;</p>
                    <p className="mt-0.5 text-[11px] text-[#5C5346]">
                      {renderInlineMarkdown(mentorNote.seniorWit)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* State 3: Code / Practice / Challenge Step -> How Interviewers Ask This Live */
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#B45309] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    <Briefcase className="h-2.5 w-2.5" />
                    How Interviewers Ask This Live
                  </span>
                  <span className="text-xs font-bold text-[#78350F]">
                    Q: &ldquo;{mentorNote.interviewTrap.question}&rdquo;
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setManualViewOverride("analogy")}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#6E6AF6]/25 bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-[#4F46E5] hover:bg-[#F5F3FF] transition-colors"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Analogy &amp; Joke</span>
                  </button>

                  {onRevealHint && hintsAvailable > hintsRevealed && (
                    <button
                      type="button"
                      onClick={onRevealHint}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#D97706]/35 bg-[#FFFBEB] px-2 py-0.5 text-[11px] font-bold text-[#B45309] hover:bg-[#FEF3C7]"
                    >
                      <HelpCircle className="h-3 w-3" />
                      <span>Hint ({hintsRevealed}/{hintsAvailable})</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border border-[#F59E0B]/30 bg-[#FFFBEB]/90 px-3 py-2 text-xs">
                <div className="space-y-0.5 min-w-0">
                  <p className="text-[#78350F] leading-relaxed">
                    <strong className="text-[#92400E]">Watch out for the trap:</strong>{" "}
                    {renderInlineMarkdown(mentorNote.interviewTrap.trap)}
                  </p>
                  <p className="text-[#1E1B4B] leading-relaxed">
                    <strong className="text-[#2E6B4E]">Senior Answer:</strong>{" "}
                    {renderInlineMarkdown(mentorNote.interviewTrap.punchline)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleTestTrapLive}
                  className="inline-flex items-center gap-1.5 self-start sm:self-center shrink-0 rounded-xl bg-[#1E1B4B] px-3 py-1.5 text-xs font-bold text-[#FBBF24] hover:bg-[#312E81] transition-colors shadow-2xs cursor-pointer"
                >
                  <Code2 className="h-3.5 w-3.5 text-[#A78BFA]" />
                  <span>Test Trap Live</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

