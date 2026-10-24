import { Link } from "@tanstack/react-router";
import type { ClosureBlock } from "@/lib/curriculum/v2/types";
import {
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Award,
  Code2,
  Briefcase,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { ForgeBuddyMascot3D, ForgeCrystal3D } from "@/components/atelier/forge-buddy-illos";
import { getEli5MentorNote } from "@/lib/curriculum/v1/eli5-mentor-bank";

export interface ClosureSurfaceProps {
  closure?: ClosureBlock;
  capabilityStatements?: string[];
  lessonId?: string;
  lessonTitle?: string;
  moduleTitle?: string;
  nextLessonId?: string;
  nextLessonLabel?: string;
  verifiedCheckCount?: number;
  totalInteractiveCount?: number;
  flaggedStepTitles?: string[];
  onRestart?: () => void;
  onContinueToNext?: () => void;
  onReturnToModule?: () => void;
}

export function ClosureSurface({
  closure,
  capabilityStatements,
  lessonId = "general",
  lessonTitle = "Lesson Mastered",
  moduleTitle,
  nextLessonId,
  nextLessonLabel,
  verifiedCheckCount = 0,
  totalInteractiveCount = 0,
  flaggedStepTitles = [],
  onRestart,
  onContinueToNext,
  onReturnToModule,
}: ClosureSurfaceProps) {
  const mentorNote = getEli5MentorNote(lessonId, moduleTitle);
  const takeaways = capabilityStatements?.length
    ? capabilityStatements
    : closure?.keyTakeaways ?? [mentorNote.eli5Text, mentorNote.seniorWit];
  const summaryText =
    closure?.summary ||
    `You completed ${lessonTitle} and demonstrated core engineering understanding across its interactive checks.`;

  return (
    <div className="mx-auto max-w-3xl py-6 px-4 sm:px-6">
      <div className="rounded-3xl border border-[#6E6AF6]/30 bg-gradient-to-b from-[#1E1B4B] via-[#1E1B4B] to-[#27235C] p-6 sm:p-9 text-white shadow-xl">
        {/* Mascot Celebration Header */}
        <div className="flex flex-col items-center text-center mb-7">
          <div className="relative mb-4 flex items-center justify-center">
            <div className="absolute -inset-4 rounded-full bg-[#6E6AF6]/25 blur-xl" />
            <ForgeBuddyMascot3D mood="excited" className="w-24 h-24 relative z-10" />
            <ForgeCrystal3D className="w-9 h-9 -ml-3 mt-7 relative z-10" />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 border border-emerald-400/40 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-emerald-300 mb-3">
            <Award className="h-3.5 w-3.5" />
            Lesson Verified • Capability Evidence Recorded
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            {lessonTitle}
          </h1>
          <p className="text-sm sm:text-base text-[#C7D2FE] max-w-xl leading-relaxed">
            {summaryText}
          </p>
        </div>

        {/* Session Evidence Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Verified Checks Passed
              </div>
              <div className="text-sm font-semibold text-white">
                {totalInteractiveCount > 0
                  ? `${verifiedCheckCount} of ${totalInteractiveCount} interactive checks verified`
                  : "All conceptual & interactive steps completed"}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/5 p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#6E6AF6]/30 text-[#C7D2FE]">
              {flaggedStepTitles.length > 0 ? (
                <AlertTriangle className="h-5 w-5 text-amber-300" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-emerald-300" />
              )}
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#A78BFA]">
                Confidence Signal
              </div>
              <div className="text-sm font-semibold text-white">
                {flaggedStepTitles.length > 0
                  ? `${flaggedStepTitles.length} step${flaggedStepTitles.length > 1 ? "s" : ""} needed multiple tries (flagged for review)`
                  : "First-try precision — mastered cleanly"}
              </div>
            </div>
          </div>
        </div>

        {/* Capabilities Demonstrated */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6 mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#A78BFA] mb-4">
            Capabilities Demonstrated in This Lesson
          </h2>
          <ul className="space-y-3">
            {takeaways.map((point, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#34D399] shrink-0 mt-0.5" />
                <span className="text-sm text-white/90 leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>

          {flaggedStepTitles.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-1.5">
                Recommended Quick Review
              </div>
              <p className="text-xs text-[#C7D2FE]">
                You worked through multiple attempts on:{" "}
                <strong className="text-white">{flaggedStepTitles.join(", ")}</strong>. Revisiting
                this concept in the Playground or Interview Simulator will lock it in.
              </p>
            </div>
          )}
        </div>

        {/* Forge Buddy Interview Readiness Check */}
        <div className="rounded-2xl border border-[#FBBF24]/30 bg-[#FBBF24]/10 p-5 mb-7">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FBBF24] mb-1.5">
            <Sparkles className="h-4 w-4" />
            <span>Forge Buddy&apos;s Real-World Interview Check</span>
          </div>
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed mb-2">
            <strong>If an interviewer asks you today:</strong> &ldquo;
            {mentorNote.interviewTrap.question}&rdquo;
          </p>
          <p className="text-xs text-[#C7D2FE] leading-relaxed">
            <strong>Your winning answer:</strong> {mentorNote.interviewTrap.punchline}
          </p>
        </div>

        {/* Zero-Setup Practice & Mock Interview Bridges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <Link
            to="/playground"
            search={{ lessonId }}
            className="flex items-center justify-between gap-3 rounded-2xl border border-[#6E6AF6]/40 bg-[#6E6AF6]/20 hover:bg-[#6E6AF6]/30 p-4 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6E6AF6] text-white shrink-0">
                <Code2 className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-white">Practice in Playground</div>
                <div className="text-xs text-[#C7D2FE]">Apply this concept in live code</div>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-[#A78BFA] group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            to="/interview"
            className="flex items-center justify-between gap-3 rounded-2xl border border-[#FBBF24]/40 bg-[#FBBF24]/15 hover:bg-[#FBBF24]/25 p-4 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FBBF24] text-[#1E1B4B] shrink-0">
                <Briefcase className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-white">Test in Interview Coach</div>
                <div className="text-xs text-[#FDE68A]">Verify under real interview prompts</div>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-[#FBBF24] group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Reasoned Next Step Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10">
          {onReturnToModule ? (
            <button
              type="button"
              onClick={onReturnToModule}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-colors"
            >
              Return to Module
            </button>
          ) : onRestart ? (
            <button
              type="button"
              onClick={onRestart}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Review Lesson Steps
            </button>
          ) : (
            <Link
              to="/learn/modules"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-colors"
            >
              Back to Modules
            </Link>
          )}

          {onContinueToNext ? (
            <button
              type="button"
              onClick={onContinueToNext}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#6E6AF6] hover:bg-[#5B57E6] px-6 py-3 text-sm font-bold text-white shadow-lg transition-colors"
            >
              <span>
                {nextLessonLabel ? `Next Step: ${nextLessonLabel}` : "Continue to Next Lesson"}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : nextLessonId ? (
            <Link
              to="/lesson/$lessonId"
              params={{ lessonId: nextLessonId }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#6E6AF6] hover:bg-[#5B57E6] px-6 py-3 text-sm font-bold text-white shadow-lg transition-colors"
            >
              Continue to Next Lesson
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              to="/learn/modules"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#6E6AF6] hover:bg-[#5B57E6] px-6 py-3 text-sm font-bold text-white shadow-lg transition-colors"
            >
              Explore More Modules
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
