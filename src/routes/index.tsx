import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useProgress } from "@/lib/hooks/use-progress";
import {
  useLessons,
  useAchievements,
  useLearningPaths,
  useModules,
  useTopics,
  useProjects,
} from "@/lib/hooks/use-content";
import { useCurriculumResume } from "@/lib/utils/curriculum-order";
import { evaluateAchievements } from "@/lib/utils/achievements";
import { HeroStudio } from "@/components/dashboard/hero-studio";
import { LearningLadder } from "@/components/dashboard/learning-ladder";
import { SecondaryWorkspaces } from "@/components/dashboard/secondary-workspaces";
import {
  PathConstellation,
  type ConstellationNode,
  type NodeStatus,
} from "@/components/dashboard/path-constellation";
import { CurrentFocus } from "@/components/dashboard/current-focus";
import { MomentumPanel } from "@/components/dashboard/momentum-panel";
import { RecentWins, type Win } from "@/components/dashboard/recent-wins";
import { LandingExperience } from "@/components/home/landing-experience";
import { SkillDiagnosticModal } from "@/components/home/skill-diagnostic-modal";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  Compass,
  LayoutDashboard,
  Presentation,
  Sparkles,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Command Center · Forge Frontend Academy" },
      {
        name: "description",
        content:
          "Your Forge learning command center — interactive frontend design & engineering curriculum, live studios, and proof of work.",
      },
      { property: "og:title", content: "Command Center · Forge Frontend Academy" },
      {
        property: "og:description",
        content: "Shape your frontend design and engineering craft through deliberate practice.",
      },
    ],
  }),
  component: Dashboard,
});

const TIER_RANK: Record<Win["tier"], number> = {
  platinum: 4,
  gold: 3,
  silver: 2,
  bronze: 1,
};

function Dashboard() {
  const progress = useProgress();
  const lessons = useLessons();
  const modules = useModules();
  const topics = useTopics();
  const projects = useProjects();
  const achievements = useAchievements();
  const paths = useLearningPaths();

  const {
    currentLesson,
    currentModule,
    currentTopic,
    orderedLessons,
    completedCount,
    totalLessons,
  } = useCurriculumResume();

  const isNewLearner = progress.lessonsCompleted.length === 0;
  const [surfaceMode, setSurfaceMode] = useState<"dashboard" | "landing">("dashboard");
  const [diagnosticOpen, setDiagnosticOpen] = useState(false);

  // Path identity — the featured curriculum path.
  const featuredPath = paths.find((p) => p.featured) || paths[0];
  const pathPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Lessons in the active module for LearningLadder & HeroStudio
  const activeModule = useMemo(() => {
    if (currentModule) return currentModule;
    if (currentLesson?.moduleId) {
      return modules.find((m) => m.id === currentLesson.moduleId) || modules[0];
    }
    return modules[0];
  }, [currentModule, currentLesson, modules]);

  const moduleLessons = useMemo(() => {
    if (!activeModule) return [];
    const modTopicIds = new Set(
      topics.filter((t) => t.moduleId === activeModule.id).map((t) => t.id),
    );
    return lessons
      .filter((l) => l.moduleId === activeModule.id || (l.topicId && modTopicIds.has(l.topicId)))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [activeModule, topics, lessons]);

  const moduleCompletedCount = useMemo(
    () => moduleLessons.filter((l) => progress.lessonsCompleted.includes(l.id)).length,
    [moduleLessons, progress.lessonsCompleted],
  );

  const moduleProgressPercent =
    moduleLessons.length > 0
      ? Math.round((moduleCompletedCount / moduleLessons.length) * 100)
      : 0;

  const currentStepInModule = useMemo(() => {
    if (!currentLesson || moduleLessons.length === 0) return 1;
    const idx = moduleLessons.findIndex((l) => l.id === currentLesson.id);
    return idx >= 0 ? idx + 1 : 1;
  }, [currentLesson, moduleLessons]);

  // Constellation window around the active lesson.
  const { nodes, nextLesson } = useMemo(() => {
    if (orderedLessons.length === 0) {
      return { nodes: [] as ConstellationNode[], nextLesson: undefined };
    }
    const activeIndex = Math.max(
      0,
      orderedLessons.findIndex((l) => l.id === currentLesson?.id),
    );
    const windowSize = 6;
    const start = Math.min(
      Math.max(0, activeIndex - 2),
      Math.max(0, orderedLessons.length - windowSize),
    );
    const slice = orderedLessons.slice(start, start + windowSize);
    const completed = new Set(progress.lessonsCompleted);

    const built: ConstellationNode[] = slice.map((lesson) => {
      const gi = orderedLessons.indexOf(lesson);
      let status: NodeStatus;
      if (gi === activeIndex) status = "active";
      else if (completed.has(lesson.id)) status = "mastered";
      else if (gi === activeIndex + 1) status = "available";
      else if (gi > activeIndex + 1) status = "locked";
      else status = "available";
      return {
        key: lesson.id,
        lessonId: lesson.id,
        title: lesson.title,
        status,
      };
    });

    return { nodes: built, nextLesson: orderedLessons[activeIndex + 1] };
  }, [orderedLessons, currentLesson, progress.lessonsCompleted]);

  // Sessions this week (distinct active days over the trailing 7 days).
  const sessionsThisWeek = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 6);
    const startStr = start.toISOString().slice(0, 10);
    return new Set((progress.activityDates || []).filter((d) => d.slice(0, 10) >= startStr)).size;
  }, [progress.activityDates]);

  // Spaced-repetition due count
  const flashcardsDueCount = useMemo(() => {
    const records = Object.values(progress.topicMasteryRecords || {});
    return records.filter((r) => r.state === "Needs Review" || r.confidence < 60).length;
  }, [progress.topicMasteryRecords]);

  // Active Capstone project
  const activeProject = useMemo(() => {
    const completedSet = new Set(progress.completedProjects || []);
    return projects.find((p) => !completedSet.has(p.id)) || projects[0];
  }, [projects, progress.completedProjects]);

  // Recent wins — unlocked achievements, strongest tiers first.
  const wins = useMemo<Win[]>(() => {
    const evaluated = evaluateAchievements(achievements as never, progress, lessons);
    return evaluated
      .filter((a) => a.unlocked)
      .sort((a, b) => TIER_RANK[b.tier] - TIER_RANK[a.tier])
      .slice(0, 4)
      .map((a) => ({ id: a.id, title: a.title, icon: a.icon, tier: a.tier }));
  }, [achievements, progress, lessons]);

  return (
    <div className="mx-auto flex w-full flex-col gap-8 pb-16">
      {/* Top Studio Mode Bar: Switch between Command Center, Landing Page & 60s Diagnostic */}
      <div className="flex flex-col justify-between gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <span className="font-semibold text-primary">Forge Studio</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              {completedCount} of {totalLessons} lessons verified ({pathPercent}%)
            </span>
          </div>
          <h1 className="mt-1 font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {surfaceMode === "landing"
              ? "Academy Overview & Interactive Curriculum"
              : isNewLearner
                ? "Shape your craft through deliberate practice."
                : "Welcome back to your engineering forge."}
          </h1>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
          <div className="grid w-full grid-cols-2 items-center gap-1 rounded-xl border border-border bg-card p-1 sm:flex sm:w-auto">
            <button
              type="button"
              onClick={() => setSurfaceMode("dashboard")}
              className={cn(
                "inline-flex h-8 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-medium whitespace-nowrap shrink-0 transition-all active:scale-98",
                surfaceMode === "dashboard"
                  ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Command Center</span>
            </button>
            <button
              type="button"
              onClick={() => setSurfaceMode("landing")}
              className={cn(
                "inline-flex h-8 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-medium whitespace-nowrap shrink-0 transition-all active:scale-98",
                surfaceMode === "landing"
                  ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Presentation className="h-3.5 w-3.5" />
              <span>Landing Showcase</span>
            </button>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setDiagnosticOpen(true)}
            className="h-9 w-full sm:w-auto gap-1.5 text-xs whitespace-nowrap shrink-0"
          >
            <Compass className="h-3.5 w-3.5 text-primary" />
            <span>60s Skill Diagnostic</span>
          </Button>

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hidden xl:inline-flex gap-1.5 font-mono text-xs whitespace-nowrap shrink-0"
          >
            <Link to="/playground">
              <Terminal className="h-3.5 w-3.5 text-primary" />
              Playground
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      {surfaceMode === "landing" ? (
        <LandingExperience
          onOpenDiagnostic={() => setDiagnosticOpen(true)}
          onSwitchToDashboard={() => setSurfaceMode("dashboard")}
        />
      ) : (
        <>
          {/* Onboarding Calibration Banner for New Learners */}
          {isNewLearner && (
            <div className="flex flex-col justify-between gap-4 rounded-xl border border-primary/30 bg-primary/5 p-5 sm:flex-row sm:items-center">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  New Learner Calibration
                </div>
                <h2 className="text-base font-bold text-foreground">
                  Not sure whether to start at Web Foundations, CSS Layout Studios, or React?
                </h2>
                <p className="text-xs text-muted-foreground">
                  Take our 4-question interactive skill diagnostic to calibrate your starting module,
                  or begin at Module 0.1 (The Web as a System).
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setDiagnosticOpen(true)}
                  className="gap-1.5 text-xs font-semibold whitespace-nowrap shrink-0"
                >
                  <Compass className="h-3.5 w-3.5" />
                  Calibrate My Starting Module
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSurfaceMode("landing")}
                  className="text-xs whitespace-nowrap shrink-0"
                >
                  Explore 17-Module Overview
                </Button>
              </div>
            </div>
          )}

          {/* Full-Width Hero Studio Resume Bar */}
          {currentLesson && (
            <HeroStudio
              lesson={currentLesson}
              module={activeModule}
              topic={currentTopic}
              moduleLessonsCount={moduleLessons.length || 6}
              currentStepNumber={currentStepInModule}
              progressPercent={moduleProgressPercent}
              isNewLearner={isNewLearner}
            />
          )}

          {/* 12-Column Asymmetric Bento Command Center */}
          <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
            {/* Primary Left 8 Columns: Active Challenge Card + Module Progression Ladder + Supporting Workspaces */}
            <div className="flex flex-col gap-8 lg:col-span-8">
              {currentLesson && (
                <CurrentFocus
                  lesson={currentLesson}
                  nextLesson={nextLesson}
                  isNewLearner={isNewLearner}
                />
              )}

              {activeModule && moduleLessons.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
                  <LearningLadder
                    module={activeModule}
                    moduleLessons={moduleLessons}
                    completedLessonIds={progress.lessonsCompleted}
                    currentLessonId={currentLesson?.id}
                  />
                </div>
              )}

              <SecondaryWorkspaces
                activeProject={activeProject}
                flashcardsDueCount={flashcardsDueCount}
                completedLessonsCount={completedCount}
                streakDays={progress.streakDays}
              />
            </div>

            {/* Secondary Right 4 Columns: Constellation Graph, Weekly Momentum & Proof-of-Work Wins */}
            <div className="flex flex-col gap-6 lg:col-span-4">
              {featuredPath && (
                <PathConstellation
                  pathDomain="Frontend Engineering"
                  pathTitle={featuredPath.title}
                  percent={pathPercent}
                  nodes={nodes}
                />
              )}

              <MomentumPanel sessionsThisWeek={sessionsThisWeek} weeklyGoal={5} />

              <RecentWins wins={wins} />
            </div>
          </div>
        </>
      )}

      <SkillDiagnosticModal open={diagnosticOpen} onOpenChange={setDiagnosticOpen} />
    </div>
  );
}
