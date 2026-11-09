import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Briefcase,
  Bug,
  CheckCircle2,
  Compass,
  FolderKanban,
  Terminal,
  Trophy,
} from "lucide-react";
import {
  ForgeBuddyMascot3D,
  TrophyFlame3D,
} from "./forge-buddy-illos";
import { evaluateAtelierProjects } from "@/lib/curriculum/atelier-chapters";
import { evaluateAchievements } from "@/lib/utils/achievements";
import type { Achievement, Lesson, Project, ProgressState } from "@/lib/types";

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

  const quickActions = [
    {
      id: "projects",
      title: "Explore Projects",
      subtitle: "Build beyond the lesson",
      to: "/projects",
      icon: FolderKanban,
    },
    {
      id: "playground",
      title: "Open Playground",
      subtitle: "Experiment with code",
      to: "/playground",
      icon: Terminal,
    },
    {
      id: "debug-lab",
      title: "Investigate Bugs",
      subtitle: "Observe, test, explain",
      to: "/debug-lab",
      icon: Bug,
    },
    {
      id: "interview-practice",
      title: "Practice Interviews",
      subtitle: "Explain decisions and trade-offs",
      to: "/interview",
      icon: Briefcase,
    },
  ] as const;

  return (
    <section aria-label="Create and investigate" className="w-full min-w-0 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
            Build &amp; Investigate
          </div>
          <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Make something. Find out why it works.
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Turn concepts into capability through projects, experiments and careful investigation.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenDiagnostic}
          className="inline-flex min-h-[42px] shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <Compass className="h-4 w-4 text-primary" />
          <span>Take a 60-second Skill Check</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <section className="flex min-w-0 flex-col rounded-2xl border border-border bg-card p-5 sm:p-6 lg:col-span-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Project Work
              </div>
              <h3 className="mt-1 font-display text-xl font-extrabold tracking-tight text-foreground">
                {activeProject ? "Your current build" : "Choose your next build"}
              </h3>
            </div>
            <Link
              to="/projects"
              className="inline-flex min-h-[36px] items-center gap-1.5 text-xs font-bold text-primary hover:underline"
            >
              <span>All Projects ({projects.length})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {activeProject ? (
            <div className="mt-5 flex flex-1 flex-col rounded-xl border border-border bg-secondary/40 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                <span>{activeProject.project.difficulty}</span>
                <span>
                  {hasAnyStartedProject
                    ? `${activeProject.completionPercent}% project progress`
                    : "Starter project"}
                </span>
              </div>
              <h4 className="mt-3 font-display text-xl font-extrabold tracking-tight text-foreground">
                {activeProject.project.title}
              </h4>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {activeProject.project.description}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border bg-card px-3 py-2.5">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Tasks
                  </div>
                  <div className="mt-1 font-mono text-lg font-bold tabular-nums text-foreground">
                    {activeProject.completedTasks}/{activeProject.totalTasks}
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-card px-3 py-2.5">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Acceptance Criteria
                  </div>
                  <div className="mt-1 font-mono text-lg font-bold tabular-nums text-foreground">
                    {activeProject.completedCriteria}/{activeProject.totalCriteria}
                  </div>
                </div>
              </div>

              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
                <span className="text-xs text-muted-foreground">
                  {hasAnyStartedProject
                    ? "Continue from your latest saved project work."
                    : "Start with a guided project and build from there."}
                </span>
                <Link
                  to="/projects/$projectId"
                  params={{ projectId: activeProject.project.id }}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-extrabold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <FolderKanban className="h-4 w-4" />
                  <span>{hasAnyStartedProject ? "Continue Project" : "View Project"}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-5 flex flex-1 flex-col items-start justify-center gap-3 rounded-xl border border-dashed border-border bg-secondary/30 p-5">
              <ForgeBuddyMascot3D className="h-16 w-16" mood="thinking" animate={false} />
              <div>
                <h4 className="font-display text-base font-bold text-foreground">
                  No active project right now.
                </h4>
                <p className="mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">
                  Explore a project when you're ready to apply what you've discovered.
                </p>
              </div>
              <Link
                to="/projects"
                className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-extrabold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <span>Explore Projects</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </section>

        <section className="flex min-w-0 flex-col rounded-2xl border border-border bg-card p-5 sm:p-6 lg:col-span-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Milestones
              </div>
              <h3 className="mt-1 font-display text-xl font-extrabold tracking-tight text-foreground">
                Achievements
              </h3>
            </div>
            <Link
              to="/achievements"
              className="inline-flex min-h-[36px] items-center gap-1.5 text-xs font-bold text-primary hover:underline"
            >
              <span>{unlockedAchievements.length}/{evaluatedAchievements.length} unlocked</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {unlockedAchievements.length > 0 ? (
            <div className="mt-5 space-y-2.5">
              {unlockedAchievements.slice(0, 3).map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-start gap-3 rounded-xl border border-border bg-secondary/35 p-3"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Trophy className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-foreground">{achievement.title}</h4>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {achievement.description}
                    </p>
                  </div>
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-success" />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 flex flex-1 items-center gap-4 rounded-xl border border-dashed border-border bg-secondary/30 p-4">
              <TrophyFlame3D className="h-20 w-20 shrink-0" />
              <div className="min-w-0 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
                  Next Milestone
                </div>
                <h4 className="font-display text-base font-bold text-foreground">
                  {nextClosestAchievement?.title ?? "Your first milestone"}
                </h4>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {nextClosestAchievement?.description ??
                    "Achievements appear here when you meet their listed criteria."}
                </p>
                {nextClosestAchievement && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                      <span>Progress</span>
                      <span>
                        {nextClosestAchievement.current}/{nextClosestAchievement.target}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${nextClosestAchievement.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="font-display text-lg font-extrabold tracking-tight text-foreground">
            Workshop Tools
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Move between building, experimenting and investigation when your work calls for it.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.id}
                to={action.to}
                className="group flex min-h-[104px] items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/60 hover:bg-secondary/25"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary/60 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-foreground">{action.title}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                    {action.subtitle}
                  </span>
                  <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-primary">
                    Open <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
