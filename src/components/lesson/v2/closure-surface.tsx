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
  verifiedCheckCount = 0,
  totalInteractiveCount = 0,
  flaggedStepTitles = [],
  onRestart,
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
    <div className="mx-auto max-w-2xl py-2 px-2 sm:px-4">
      <div className="rounded-2xl border border-[#6E6AF6]/30 bg-gradient-to-b from-[#1E1B4B] via-[#1E1B4B] to-[#27235C] p-4 sm:p-6 text-white shadow-xl space-y-4">
        {/* Compact Header */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex shrink-0 items-center justify-center">
            <div className="absolute -inset-2 rounded-full bg-[#6E6AF6]/25 blur-md" />
            <ForgeBuddyMascot3D mood="excited" className="w-12 h-12 sm:w-14 sm:h-14 relative z-10" />
            <ForgeCrystal3D className="w-5 h-5 -ml-2 mt-4 relative z-10" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/15 border border-emerald-400/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300 mb-1">
              <Award className="h-3 w-3 shrink-0" />
              <span>Lesson Verified</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-snug">
              {lessonTitle}
            </h1>
            <p className="text-xs text-[#C7D2FE] leading-relaxed line-clamp-2">{summaryText}</p>
          </div>
        </div>

        {/* Compact 2-Column Session Metrics Row */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2.5 flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                Checks Passed
              </div>
              <div className="text-xs font-semibold text-white truncate">
                {totalInteractiveCount > 0
                  ? `${verifiedCheckCount}/${totalInteractiveCount} verified`
                  : "All steps complete"}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#6E6AF6]/30 text-[#C7D2FE]">
              {flaggedStepTitles.length > 0 ? (
                <AlertTriangle className="h-4 w-4 text-amber-300" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              )}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#A78BFA]">
                Confidence Signal
              </div>
              <div className="text-xs font-semibold text-white truncate">
                {flaggedStepTitles.length > 0
                  ? `${flaggedStepTitles.length} step${flaggedStepTitles.length > 1 ? "s" : ""} to review`
                  : "First-try precision"}
              </div>
            </div>
          </div>
        </div>

        {/* Compact Capabilities Demonstrated */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#A78BFA] mb-2">
            Capabilities Demonstrated
          </h2>
          <ul className="space-y-1.5">
            {takeaways.map((point, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#34D399] shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-white/90 leading-snug">{point}</span>
              </li>
            ))}
          </ul>

          {flaggedStepTitles.length > 0 && (
            <div className="mt-2.5 pt-2.5 border-t border-white/10 text-[11px] text-[#C7D2FE]">
              <strong className="text-amber-300">Quick review suggested:</strong>{" "}
              {flaggedStepTitles.join(", ")}
            </div>
          )}
        </div>

        {/* Forge Buddy Interview Readiness Check */}
        <div className="rounded-xl border border-[#FBBF24]/30 bg-[#FBBF24]/10 p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#FBBF24]">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span>Forge Buddy&apos;s Real-World Interview Check</span>
          </div>
          <p className="text-xs text-white/95 leading-snug">
            <strong>Q:</strong> &ldquo;{mentorNote.interviewTrap.question}&rdquo;
          </p>
          <p className="text-xs text-[#C7D2FE] leading-snug">
            <strong>A:</strong> {mentorNote.interviewTrap.punchline}
          </p>
        </div>

        {/* Compact Secondary Actions (Primary forward Next Lesson CTA lives exclusively in the sticky footer) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
          <Link
            to="/playground"
            search={{ lessonId }}
            className="flex items-center justify-between gap-2 rounded-xl border border-[#6E6AF6]/40 bg-[#6E6AF6]/15 hover:bg-[#6E6AF6]/25 px-3 py-2 text-xs font-semibold text-white transition-colors"
          >
            <span className="inline-flex items-center gap-1.5 truncate">
              <Code2 className="h-3.5 w-3.5 shrink-0 text-[#A78BFA]" />
              <span>Playground</span>
            </span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#A78BFA]" />
          </Link>

          <Link
            to="/interview"
            className="flex items-center justify-between gap-2 rounded-xl border border-[#FBBF24]/40 bg-[#FBBF24]/15 hover:bg-[#FBBF24]/25 px-3 py-2 text-xs font-semibold text-white transition-colors"
          >
            <span className="inline-flex items-center gap-1.5 truncate">
              <Briefcase className="h-3.5 w-3.5 shrink-0 text-[#FBBF24]" />
              <span>Interview Coach</span>
            </span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#FBBF24]" />
          </Link>

          {onReturnToModule ? (
            <button
              type="button"
              onClick={onReturnToModule}
              className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-3 py-2 text-xs font-semibold text-white/90 transition-colors"
            >
              <span>Return to Module</span>
            </button>
          ) : onRestart ? (
            <button
              type="button"
              onClick={onRestart}
              className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-3 py-2 text-xs font-semibold text-white/90 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Review Steps</span>
            </button>
          ) : (
            <Link
              to="/learn/modules"
              className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-3 py-2 text-xs font-semibold text-white/90 transition-colors"
            >
              <span>All Modules</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
