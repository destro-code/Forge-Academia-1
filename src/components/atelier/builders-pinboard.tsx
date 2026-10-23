import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  Bug,
  CheckCircle2,
  Compass,
  FolderKanban,
  Sparkles,
  Terminal,
  Trophy,
  Zap,
} from "lucide-react";
import {
  ForgeBuddyMascot3D,
  HandwrittenCallout,
  TrophyFlame3D,
} from "./forge-buddy-illos";
import { evaluateAtelierProjects } from "@/lib/curriculum/atelier-chapters";
import { evaluateAchievements } from "@/lib/utils/achievements";
import type { Achievement, Lesson, Project, ProgressState } from "@/lib/types";
import { cn } from "@/lib/utils";

interface BuildersPinboardProps {
  projects: Project[];
  achievements: Achievement[];
  lessons: Lesson[];
  progress: ProgressState;
  onOpenDiagnostic: () => void;
}

export function BuildersPinboard({
  projects,
  achievements,
  lessons,
  progress,
  onOpenDiagnostic,
}: BuildersPinboardProps) {
  const { activeProject, hasAnyStartedProject } = useMemo(
    () => evaluateAtelierProjects(projects, progress),
    [projects, progress],
  );

  const evaluatedAchievements = useMemo(
    () => evaluateAchievements(achievements as never, progress, lessons),
    [achievements, progress, lessons],
  );

  const unlockedAchievements = useMemo(
    () => evaluatedAchievements.filter((a) => a.unlocked),
    [evaluatedAchievements],
  );

  const nextClosestAchievement = useMemo(() => {
    const locked = evaluatedAchievements.filter((a) => !a.unlocked);
    if (locked.length === 0) return undefined;
    return [...locked].sort((a, b) => b.progress - a.progress)[0];
  }, [evaluatedAchievements]);

  // Quick Actions matching Panel 5 ("Quick Actions": Explore Curriculum, Create New Project, Debug Lab, View Achievements / Skill Check)
  const quickActions = [
    {
      id: "explore-curriculum",
      title: "Explore Curriculum",
      subtitle: "17 interactive modules",
      to: "/learn/modules",
      icon: BookOpen,
      iconBg: "bg-[#FFFBEB] text-[#D97706] border-[#FFE08A]",
    },
    {
      id: "create-project",
      title: "Live Playground",
      subtitle: "Experiment with code",
      to: "/playground",
      icon: Terminal,
      iconBg: "bg-[#F5F3FF] text-[#6D28D9] border-[#C9BBFF]",
    },
    {
      id: "debug-lab",
      title: "Debug Lab Quests",
      subtitle: "Fix real frontend bugs",
      to: "/debug-lab",
      icon: Bug,
      iconBg: "bg-[#E8F8F2] text-[#0F7656] border-[#A7E3D1]",
    },
    {
      id: "interview-prep",
      title: "Interview Simulator",
      subtitle: "Live code & rubric coaching",
      to: "/interview",
      icon: Briefcase,
      iconBg: "bg-[#EEF2FF] text-[#4F6BFF] border-[#C9BBFF]",
    },
  ] as const;

  return (
    <section aria-label="Builder's Pinboard & Portfolio Workbench" className="space-y-6 w-full min-w-0">
      {/* Compact Header & Studio Sandbox Shortcuts */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-extrabold uppercase tracking-wider text-[#4F6BFF] dark:text-[#8DA2FF]">
            Builder&apos;s Pinboard
          </div>
          <h2 className="mt-0.5 font-display text-2xl font-extrabold tracking-tight text-[#0E1B3D] dark:text-white">
            Portfolio Workbench &amp; Studio Badges
          </h2>
          <p className="text-sm text-[#4A5578] dark:text-[#CBD5F0]">
            Build real portfolio specs, track acceptance criteria, and collect die-cut achievement stickers.
          </p>
        </div>

        {/* Compact Studio Tool Strip (2x2 on mobile, inline on desktop) */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.id}
                to={action.to}
                className="inline-flex min-h-[42px] items-center gap-2 rounded-2xl border border-[#E5DFD3] bg-white px-3.5 py-2 text-xs font-bold text-[#0E1B3D] shadow-2xs transition-all hover:-translate-y-0.5 hover:border-[#4F6BFF] hover:text-[#4F6BFF] dark:border-white/10 dark:bg-[#131E3A] dark:text-white"
              >
                <Icon className="h-3.5 w-3.5 shrink-0 text-[#4F6BFF]" />
                <span className="truncate">{action.title}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={onOpenDiagnostic}
            className="inline-flex min-h-[42px] items-center gap-2 rounded-2xl border border-[#C9BBFF] bg-[#F5F3FF] px-3.5 py-2 text-xs font-bold text-[#4F6BFF] transition-all hover:-translate-y-0.5 hover:bg-[#EDE9FE] cursor-pointer dark:border-white/15 dark:bg-[#1D294D] dark:text-[#C9BBFF]"
          >
            <Compass className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">60s Skill Check</span>
          </button>
        </div>
      </div>

      {/* Split Row: Project Showcase ("My Portfolio") + Achievement Stickers & Trophy */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left (6 cols): Project Showcase ("My Portfolio" Deep Navy & Tactile Workbench from Panel 8) */}
        <div className="lg:col-span-6 flex flex-col justify-between rounded-[28px] border border-[#E5DFD3] bg-white p-6 shadow-[0_18px_45px_-15px_rgba(14,27,61,0.08)] dark:border-white/10 dark:bg-[#131E3A]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#4F6BFF] dark:text-[#8DA2FF]">
                Project Showcase
              </div>
              <h3 className="mt-0.5 font-display text-xl font-extrabold text-[#0E1B3D] dark:text-white">
                {hasAnyStartedProject ? "Active Project Workbench" : "Build Real Portfolio Projects"}
              </h3>
            </div>
            <Link
              to="/projects"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#4F6BFF] hover:underline dark:text-[#8DA2FF]"
            >
              <span>All Projects ({projects.length})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Deep Navy Project Showcase Card matching Panel 8 ("My Portfolio · View Project") */}
          {activeProject ? (
            <div className="my-5 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0E1B3D] via-[#172554] to-[#1E1B4B] p-6 text-white shadow-[0_18px_36px_-12px_rgba(14,27,61,0.45)]">
              {/* Decorative 3D Blocks inside Project Card (Panel 8) */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-4 -bottom-4 h-28 w-28 rotate-12 rounded-3xl bg-gradient-to-br from-[#A7E3D1] to-[#10B981] opacity-85 shadow-lg"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute right-16 bottom-6 h-14 w-14 -rotate-12 rounded-2xl bg-gradient-to-br from-[#FF8C7A] to-[#F59E0B] opacity-90 shadow-md"
              />

              <div className="relative z-10 max-w-md space-y-3">
                <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-[#A7E3D1]">
                  <span>{activeProject.project.difficulty}</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {hasAnyStartedProject
                      ? `${activeProject.completionPercent}% Complete`
                      : "Starter Project Invitation"}
                  </span>
                </div>

                <h4 className="font-display text-2xl font-extrabold tracking-tight text-white">
                  {activeProject.project.title}
                </h4>

                <p className="text-xs sm:text-sm leading-relaxed text-[#CBD5F0]">
                  {activeProject.project.description}
                </p>

                {/* Honest Task & Acceptance Criteria Counters */}
                <div className="flex flex-wrap items-center gap-4 pt-1 font-mono text-xs text-[#E2E8F0]">
                  <span>
                    Tasks: {activeProject.completedTasks}/{activeProject.totalTasks}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    Criteria: {activeProject.completedCriteria}/{activeProject.totalCriteria}
                  </span>
                </div>

                <div className="pt-2">
                  <Link
                    to="/projects/$projectId"
                    params={{ projectId: activeProject.project.id }}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#C9BBFF] px-5 py-2.5 font-display text-xs font-extrabold text-[#0E1B3D] shadow-md transition-transform hover:scale-105 hover:bg-white"
                  >
                    <FolderKanban className="h-4 w-4" />
                    <span>
                      {hasAnyStartedProject ? "Continue Project" : "View Starter Project"}
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-between text-xs text-[#4A5578] dark:text-[#CBD5F0]">
            <span>
              {hasAnyStartedProject
                ? "Check off milestones and acceptance criteria inside the project studio."
                : "New to projects? Start with our guided beginner spec when you're ready."}
            </span>
          </div>
        </div>

        {/* Right (6 cols): Achievement Badges & Collectible Stickers (matching Panel 8 & Panel 10) */}
        <div className="lg:col-span-6 flex flex-col justify-between rounded-[28px] border border-[#E5DFD3] bg-white p-6 shadow-[0_18px_45px_-15px_rgba(14,27,61,0.08)] dark:border-white/10 dark:bg-[#131E3A]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#4F6BFF] dark:text-[#8DA2FF]">
                Achievement Badges
              </div>
              <h3 className="mt-0.5 font-display text-xl font-extrabold text-[#0E1B3D] dark:text-white">
                Studio Sticker Collection
              </h3>
            </div>
            <Link
              to="/achievements"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#4F6BFF] hover:underline dark:text-[#8DA2FF]"
            >
              <span>
                {unlockedAchievements.length}/{evaluatedAchievements.length} Unlocked
              </span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Unlocked Stickers or Honest Next-Target Showcase */}
          {unlockedAchievements.length > 0 ? (
            <div className="my-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {unlockedAchievements.slice(0, 3).map((ach, idx) => {
                const bgColors = [
                  "bg-[#FFFBEB] border-[#FFE08A] text-[#92400E]",
                  "bg-[#E8F8F2] border-[#A7E3D1] text-[#0F7656]",
                  "bg-[#EEF2FF] border-[#C9BBFF] text-[#4F6BFF]",
                ];
                return (
                  <div
                    key={ach.id}
                    className="flex flex-col items-center rounded-2xl border border-[#E5DFD3] bg-[#FFFDF9] p-4 text-center dark:border-white/10 dark:bg-[#0B1226]"
                  >
                    <div
                      className={cn(
                        "atelier-sticker flex h-14 w-14 items-center justify-center rounded-full",
                        bgColors[idx % bgColors.length],
                      )}
                    >
                      <Trophy className="h-6 w-6" />
                    </div>
                    <div className="mt-2.5 font-display text-xs font-extrabold text-[#0E1B3D] dark:text-white">
                      {ach.title}
                    </div>
                    <div className="mt-0.5 line-clamp-2 text-[11px] text-[#7B86A6] dark:text-[#94A3C9]">
                      {ach.description}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="my-5 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-[#C9BBFF] bg-gradient-to-br from-[#FFFDF9] via-[#F5F3FF]/60 to-[#EEF2FF]/70 p-5 sm:flex-row dark:border-white/15 dark:from-[#0B1226] dark:to-[#1D294D]/50">
              <TrophyFlame3D className="h-24 w-24 shrink-0" />
              <div className="space-y-1.5 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#4F6BFF] dark:text-[#8DA2FF]">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>First Sticker Ready to Earn</span>
                </div>
                <h4 className="font-display text-base font-extrabold text-[#0E1B3D] dark:text-white">
                  {nextClosestAchievement?.title ?? "First Steps in the Atelier"}
                </h4>
                <p className="text-xs leading-relaxed text-[#4A5578] dark:text-[#CBD5F0]">
                  {nextClosestAchievement?.description ??
                    "Complete your first interactive lesson to unlock your first die-cut studio badge!"}
                </p>
                {nextClosestAchievement && (
                  <div className="pt-1 font-mono text-[11px] font-bold text-[#0F7656] dark:text-[#A7E3D1]">
                    Progress: {nextClosestAchievement.current}/{nextClosestAchievement.target} (
                    {nextClosestAchievement.progress}%)
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom Cheer Footer with Forge Buddy ("Progress looks good on you!" from Panel 8 & "You got this!" from Panel 10) */}
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#FFF6ED] px-4 py-3 dark:bg-[#0B1226]">
            <div className="flex items-center gap-2.5">
              <ForgeBuddyMascot3D className="h-10 w-10 shrink-0" mood="celebrating" />
              <div className="text-xs font-medium text-[#0E1B3D] dark:text-[#F8F6F0]">
                {nextClosestAchievement ? (
                  <span>
                    Next badge:{" "}
                    <strong className="font-bold">{nextClosestAchievement.title}</strong> (
                    {nextClosestAchievement.current}/{nextClosestAchievement.target})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-bold text-[#0F7656]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    All studio badges unlocked!
                  </span>
                )}
              </div>
            </div>

            <span className="inline-flex items-center gap-1 rounded-xl bg-[#C9BBFF]/45 px-3 py-1 font-[family-name:var(--font-handwritten)] text-base font-bold text-[#1E3A8A] dark:bg-[#C9BBFF]/20 dark:text-[#C9BBFF]">
              <Award className="h-3.5 w-3.5" />
              You got this!
            </span>
          </div>
        </div>
      </div>

      {/* Interview Readiness & Live Mock Simulator Launcher */}
      <div className="relative overflow-hidden rounded-[28px] border border-[#6E6AF6]/35 bg-gradient-to-r from-[#1E1B4B] via-[#27235C] to-[#13112C] p-6 sm:p-7 text-white shadow-[0_18px_45px_-15px_rgba(30,27,75,0.4)]">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4 max-w-2xl">
            <div className="hidden sm:flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#6E6AF6]/45 bg-white/10 p-1.5">
              <ForgeBuddyMascot3D mood="winking" className="h-full w-full" />
            </div>
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#FBBF24]/40 bg-[#FBBF24]/15 px-3 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-[#FBBF24]">
                <Briefcase className="h-3 w-3" />
                <span>Interview Readiness · Zero-Setup Live Simulator</span>
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                Turn What You Learn Into Offer-Ready Confidence
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-[#C7D2FE]">
                Practice the exact <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[#FDE68A]">async/await</code>, event loop, DOM, and React state questions interviewers ask live—with a runnable code sandbox and progressive hints from Forge Buddy.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              to="/interview/session"
              search={{
                category: "JavaScript",
                mode: "single",
                preset: "frontend",
                duration: "30",
                projectId: undefined,
              }}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-[#6E6AF6] px-4 py-2 text-xs font-extrabold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#5B57E6]"
            >
              <Zap className="h-3.5 w-3.5 text-[#FBBF24]" />
              <span>Async &amp; JS Traps</span>
            </Link>

            <Link
              to="/interview/session"
              search={{
                category: "React",
                mode: "single",
                preset: "frontend",
                duration: "30",
                projectId: undefined,
              }}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-xs font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-white/20"
            >
              <span>React Systems</span>
            </Link>

            <Link
              to="/interview/session"
              search={{
                category: "CSS",
                mode: "single",
                preset: "frontend",
                duration: "30",
                projectId: undefined,
              }}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-xs font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-white/20"
            >
              <span>DOM &amp; CSS</span>
            </Link>

            <Link
              to="/interview"
              search={{ projectId: undefined }}
              className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-[#FBBF24]/45 bg-[#FBBF24]/15 px-4 py-2 text-xs font-extrabold text-[#FDE68A] transition-all hover:-translate-y-0.5 hover:bg-[#FBBF24]/25"
            >
              <span>Open Interview Hub</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
