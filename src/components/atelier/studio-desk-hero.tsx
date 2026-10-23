import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Compass, Flame, Sparkles } from "lucide-react";
import {
  ForgeBuddyMascot3D,
  HandwrittenCallout,
  StudioDesk3DCluster,
  TrophyFlame3D,
} from "./forge-buddy-illos";
import { computeUtcCalendarWeekActiveDays } from "@/lib/curriculum/atelier-chapters";
import { getEli5MentorNote } from "@/lib/curriculum/v1/eli5-mentor-bank";
import type { Lesson, Module, ProgressState } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StudioDeskHeroProps {
  currentLesson: Lesson | undefined;
  activeModule: Module | undefined;
  completedCount: number;
  totalLessons: number;
  progress: ProgressState;
  onOpenDiagnostic?: () => void;
}

export function StudioDeskHero({
  currentLesson,
  activeModule,
  completedCount,
  totalLessons,
  progress,
  onOpenDiagnostic,
}: StudioDeskHeroProps) {
  const [mentorMode, setMentorMode] = useState<"friendly" | "senior">("friendly");

  const isBrandNewLearner = completedCount === 0;
  const pathPercent =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const lessonId = currentLesson?.id ?? "lesson-0-1-1";
  const lessonTitle = currentLesson?.title ?? "How the Web Works";
  const lessonDescription =
    currentLesson?.description ??
    "Discover how browsers transform HTML, CSS, and JavaScript into interactive experiences.";
  const moduleTitle = activeModule?.title ?? "CSS & Web Foundations";
  const estimatedMinutes = currentLesson?.estimatedMinutes ?? 12;

  const mentorNote = useMemo(
    () => getEli5MentorNote(lessonId, activeModule?.id ?? "module-0-1"),
    [lessonId, activeModule?.id],
  );

  const weeklyRhythm = useMemo(
    () => computeUtcCalendarWeekActiveDays(progress.activityDates),
    [progress.activityDates],
  );

  const greetingText = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning, Builder!";
    if (hour < 18) return "Good afternoon, Builder!";
    return "Good evening, Builder!";
  }, []);

  return (
    <section aria-label="Creative Studio Desk" className="space-y-6 w-full min-w-0">
      {/* Top Greeting Banner */}
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="inline-flex flex-wrap items-center gap-2 text-xs font-semibold text-[#4F6BFF] dark:text-[#8DA2FF]">
            <span>Creative Atelier Studio</span>
            <span aria-hidden="true">·</span>
            <span>{moduleTitle}</span>
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0E1B3D] dark:text-white">
            {isBrandNewLearner ? "Welcome to Your Creative Studio!" : greetingText}{" "}
            <span aria-hidden="true">☀️</span>
          </h1>
          <p className="mt-1 text-sm sm:text-base font-medium text-[#4A5578] dark:text-[#CBD5F0]">
            {completedCount > 0
              ? `You're doing amazing — ${completedCount} of ${totalLessons} studio lessons completed. Keep going!`
              : "Start from Lesson 1 to build from scratch, or take the 60-second Skill Check to jump ahead."}
          </p>
        </div>

        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <HandwrittenCallout rotation="-rotate-3" className="text-2xl text-[#4F6BFF]">
            Small steps. Big dreams. ✨
          </HandwrittenCallout>
        </div>
      </div>

      {/* Two-Column Top Studio Cards: "Your Progress" + "Next Up / First-Time Onboarding" */}
      {/* On mobile (<lg), Active Lesson / First-Time Onboarding comes first so primary CTA is immediately above the fold */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Card 1 (Left on Desktop, Second on Mobile): "Your Progress" */}
        <div className="order-2 lg:order-1 lg:col-span-5 flex flex-col justify-between rounded-[28px] border border-[#E5DFD3] bg-white p-5 sm:p-6 shadow-[0_18px_45px_-15px_rgba(14,27,61,0.08)] dark:border-white/10 dark:bg-[#131E3A]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-extrabold text-[#0E1B3D] dark:text-white">
                {isBrandNewLearner ? "Your Studio Passport" : "Your Progress"}
              </h2>
              <p className="mt-0.5 text-xs text-[#4A5578] dark:text-[#CBD5F0]">
                {isBrandNewLearner
                  ? "Complete your first lesson to light up your weekly rhythm"
                  : "Real curriculum mastery & weekly studio rhythm"}
              </p>
            </div>
            <span className="font-mono text-xl font-extrabold text-[#0E1B3D] tabular-nums dark:text-white">
              {pathPercent}%
            </span>
          </div>

          {/* Middle row: 3D Trophy/Flame + Streak & Progress Bar */}
          <div className="my-4 sm:my-5 flex items-center gap-4 rounded-2xl bg-gradient-to-r from-[#FFFDF9] via-[#FFF6ED] to-[#EEF2FF] p-4 dark:from-[#0B1226] dark:via-[#172342] dark:to-[#1D294D]">
            <TrophyFlame3D className="h-18 w-18 sm:h-20 sm:w-20 shrink-0" />
            <div className="min-w-0 flex-1 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-[#0E1B3D] dark:text-white">
                <span className="inline-flex items-center gap-1.5 text-[#D97706] dark:text-[#FFE08A]">
                  <Flame className="h-4 w-4 shrink-0 fill-[#FF8C7A] text-[#F59E0B]" />
                  {progress.streakDays > 0
                    ? `${progress.streakDays} day streak!`
                    : "Day 1 streak awaits"}
                </span>
                <span className="font-mono text-[#4A5578] tabular-nums dark:text-[#CBD5F0]">
                  {completedCount}/{totalLessons}
                </span>
              </div>

              {/* Smooth Cobalt-to-Mint Progress Bar */}
              <div className="h-3 w-full overflow-hidden rounded-full bg-[#E5DFD3]/70 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#4F6BFF] via-[#7B91FF] to-[#A7E3D1] transition-all duration-500"
                  style={{ width: `${Math.max(pathPercent, completedCount > 0 ? 6 : 3)}%` }}
                />
              </div>

              <div className="flex items-center justify-between font-mono text-[11px] text-[#4A5578] dark:text-[#94A3C9]">
                <span>{(progress.xp || 0).toLocaleString()} XP earned</span>
                <span>{weeklyRhythm.activeDaysCount}/7 days this week</span>
              </div>
            </div>
          </div>

          {/* Honest 7-Day UTC Calendar Week Strip */}
          <div className="flex items-center justify-between gap-1.5 pt-1">
            {weeklyRhythm.days.map((day) => (
              <div
                key={day.isoDate}
                className={cn(
                  "flex flex-1 flex-col items-center rounded-xl border py-2 text-[11px] font-semibold transition-colors",
                  day.isActive
                    ? "border-[#A7E3D1] bg-[#E8F8F2] text-[#0F7656] dark:border-[#A7E3D1]/40 dark:bg-[#A7E3D1]/15 dark:text-[#A7E3D1]"
                    : day.isToday
                      ? "border-[#4F6BFF]/50 bg-[#EEF2FF] text-[#4F6BFF] dark:bg-[#1D294D] dark:text-[#8DA2FF]"
                      : "border-[#E5DFD3]/60 bg-[#FFFDF9] text-[#7B86A6] dark:border-white/5 dark:bg-[#0B1226]",
                )}
                title={`${day.label} (${day.isoDate}): ${day.isActive ? "Active" : "No recorded activity"}`}
              >
                <span>{day.shortLabel}</span>
                <span
                  className={cn(
                    "mt-1 h-2 w-2 rounded-full",
                    day.isActive
                      ? "bg-[#0F7656] dark:bg-[#A7E3D1]"
                      : day.isToday
                        ? "bg-[#4F6BFF]"
                        : "bg-[#E5DFD3] dark:bg-white/15",
                  )}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Card 2 (Right on Desktop, First on Mobile): Active Lesson Workbench & First-Time Onboarding */}
        <div className="order-1 lg:order-2 lg:col-span-7 relative overflow-hidden rounded-[28px] border border-[#C9BBFF]/70 bg-gradient-to-br from-white via-[#F8FAFF] to-[#EEF2FF] p-5 sm:p-7 shadow-[0_18px_45px_-15px_rgba(79,107,255,0.14)] dark:border-[#C9BBFF]/20 dark:from-[#131E3A] dark:via-[#172342] dark:to-[#1D294D]">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-12 sm:items-center">
            <div className="space-y-4 sm:col-span-7 min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#4F6BFF] dark:text-[#8DA2FF]">
                <span className="uppercase tracking-wider">
                  {isBrandNewLearner ? "Step 1 · Start Here" : "Next Up"}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-[#4A5578] dark:text-[#CBD5F0]">
                  {moduleTitle}
                </span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 font-mono text-[#4A5578] dark:text-[#CBD5F0]">
                  <Clock className="h-3 w-3" />
                  {estimatedMinutes} min
                </span>
              </div>

              <div className="min-w-0">
                <h2 className="font-display text-2xl font-extrabold tracking-tight text-[#0E1B3D] sm:text-3xl break-words dark:text-white">
                  {lessonTitle}
                </h2>
                <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[#4A5578] dark:text-[#CBD5F0]">
                  {lessonDescription}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  to="/lesson/$lessonId"
                  params={{ lessonId }}
                  className="inline-flex min-h-[48px] items-center gap-2.5 rounded-2xl bg-[#4F6BFF] px-6 py-3 font-display text-sm font-extrabold text-white shadow-[0_12px_28px_-6px_rgba(79,107,255,0.55)] transition-all hover:-translate-y-0.5 hover:bg-[#3B53D9]"
                >
                  <span>
                    {isBrandNewLearner
                      ? `Start Lesson 1 (${estimatedMinutes} min)`
                      : "Continue Lesson"}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </Link>

                {isBrandNewLearner && onOpenDiagnostic ? (
                  <button
                    type="button"
                    onClick={onOpenDiagnostic}
                    className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl border border-[#C9BBFF] bg-white px-4 py-3 text-xs font-bold text-[#0E1B3D] transition-colors hover:border-[#4F6BFF] hover:text-[#4F6BFF] dark:border-white/15 dark:bg-[#0B1226] dark:text-white"
                  >
                    <Compass className="h-4 w-4 shrink-0 text-[#4F6BFF]" />
                    <span>Not a beginner? 60s Skill Check</span>
                  </button>
                ) : (
                  <Link
                    to="/learn/modules"
                    className="inline-flex min-h-[48px] items-center gap-1.5 rounded-2xl border border-[#E5DFD3] bg-white px-4 py-3 text-xs font-bold text-[#0E1B3D] transition-colors hover:border-[#4F6BFF] hover:text-[#4F6BFF] dark:border-white/15 dark:bg-[#0B1226] dark:text-white"
                  >
                    <span>Browse All Courses</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Right 3D Studio Cluster Illustration */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
              className="flex items-center justify-center sm:col-span-5"
            >
              <StudioDesk3DCluster className="h-28 sm:h-36 w-full max-w-[210px]" />
            </motion.div>
          </div>

          {/* Interactive Forge Buddy Mentor Strip inside Workbench */}
          <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-[#C9BBFF]/60 bg-white/90 p-3.5 sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-[#0B1226]/80">
            <div className="flex items-center gap-3 min-w-0">
              <ForgeBuddyMascot3D className="h-12 w-12 shrink-0" mood="cheerful" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0E1B3D] dark:text-white">
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#4F6BFF]" />
                  <span className="truncate">Forge Buddy · {mentorNote.analogyTitle}</span>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-[#4A5578] dark:text-[#CBD5F0]">
                  {mentorMode === "friendly" ? mentorNote.eli5Text : mentorNote.seniorWit}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1 self-start sm:self-center rounded-xl bg-[#F4EFE6] p-1 dark:bg-[#131E3A]">
              <button
                type="button"
                onClick={() => setMentorMode("friendly")}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors",
                  mentorMode === "friendly"
                    ? "bg-white text-[#0E1B3D] shadow-xs dark:bg-[#4F6BFF] dark:text-white"
                    : "text-[#4A5578] hover:text-[#0E1B3D] dark:text-[#CBD5F0]",
                )}
              >
                Friendly Tip
              </button>
              <button
                type="button"
                onClick={() => setMentorMode("senior")}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors",
                  mentorMode === "senior"
                    ? "bg-white text-[#0E1B3D] shadow-xs dark:bg-[#4F6BFF] dark:text-white"
                    : "text-[#4A5578] hover:text-[#0E1B3D] dark:text-[#CBD5F0]",
                )}
              >
                Pro Insight
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
