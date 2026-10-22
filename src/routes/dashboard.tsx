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
import { SkillDiagnosticModal } from "@/components/home/skill-diagnostic-modal";
import {
  ArrowUpRight,
  Compass,
  Flame,
  ShieldCheck,
  Sparkles,
  Swords,
  Trophy,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Guild Studio Dashboard · Forge Frontend Academy" },
      {
        name: "description",
        content:
          "Your Tactile Dev Guild command center — interactive quests, live visual studios, streak shields, and proof of work.",
      },
    ],
  }),
  component: StudioDashboardPage,
});

const TIER_RANK: Record<Win["tier"], number> = {
  platinum: 4,
  gold: 3,
  silver: 2,
  bronze: 1,
};

function getGuildTitle(level: number): { rank: string; quip: string } {
  if (level <= 1) {
    return {
      rank: "Level 1 · Curious Tinkerer",
      quip: "Every staff engineer started by wondering why a <div> wouldn't center.",
    };
  }
  if (level === 2) {
    return {
      rank: "Level 2 · Markup Apprentice",
      quip: "You know the difference between a real <button> and a div in disguise.",
    };
  }
  if (level <= 4) {
    return {
      rank: `Level ${level} · Box-Model Smith`,
      quip: "box-sizing: border-box is your shield; Flexbox is your hammer.",
    };
  }
  if (level <= 7) {
    return {
      rank: `Level ${level} · DOM Alchemist`,
      quip: "Event listeners, state machines, and async buzzers bend to your will.",
    };
  }
  return {
    rank: `Level ${level} · Systems Forgemaster`,
    quip: "200s, 404s, and 500s fear your Network tab.",
  };
}

export function StudioDashboardPage() {
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
  const [diagnosticOpen, setDiagnosticOpen] = useState(false);

  const featuredPath = paths.find((p) => p.featured) || paths[0];
  const pathPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

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

  const nextLesson = useMemo(() => {
    const source = orderedLessons.length > 0 ? orderedLessons : lessons;
    if (!currentLesson || source.length === 0) return undefined;
    const idx = source.findIndex((l) => l.id === currentLesson.id);
    return idx >= 0 && idx + 1 < source.length ? source[idx + 1] : undefined;
  }, [orderedLessons, lessons, currentLesson]);

  const constellationNodes = useMemo<ConstellationNode[]>(() => {
    const source = orderedLessons.length > 0 ? orderedLessons : lessons;
    if (source.length === 0) return [];

    const completedSet = new Set(progress.lessonsCompleted);
    const activeId = currentLesson?.id;
    let activeIndex = source.findIndex((l) => l.id === activeId);
    if (activeIndex < 0) activeIndex = 0;

    const WINDOW = 6;
    const half = Math.floor(WINDOW / 2);
    let start = Math.max(0, activeIndex - half);
    const end = Math.min(source.length, start + WINDOW);
    if (end - start < WINDOW) {
      start = Math.max(0, end - WINDOW);
    }

    const slice = source.slice(start, end);
    let passedActive = false;

    return slice.map((lesson, idx) => {
      let status: NodeStatus;
      if (completedSet.has(lesson.id)) {
        status = "mastered";
      } else if (lesson.id === activeId) {
        status = "active";
        passedActive = true;
      } else if (!passedActive) {
        status = "available";
      } else {
        const distanceFromActive = start + idx - activeIndex;
        status = distanceFromActive <= 2 ? "available" : "locked";
      }

      return {
        key: `${lesson.id}-${start + idx}`,
        lessonId: lesson.id,
        title: lesson.title,
        status,
      };
    });
  }, [orderedLessons, lessons, progress.lessonsCompleted, currentLesson]);

  const sessionsThisWeek = useMemo(() => {
    const dates = progress.activityDates || [];
    return Math.min(5, Math.max(completedCount > 0 ? 1 : 0, dates.slice(-7).length));
  }, [progress.activityDates, completedCount]);

  const recentWins = useMemo<Win[]>(() => {
    const evaluated = evaluateAchievements(achievements as never, progress, lessons);
    return evaluated
      .filter((a) => a.unlocked)
      .sort((a, b) => {
        const tierDiff = TIER_RANK[b.tier] - TIER_RANK[a.tier];
        if (tierDiff !== 0) return tierDiff;
        const aTime = a.unlockedAt ? new Date(a.unlockedAt).getTime() : 0;
        const bTime = b.unlockedAt ? new Date(b.unlockedAt).getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 4)
      .map((a) => ({
        id: a.id,
        title: a.title,
        icon: a.icon || "Trophy",
        tier: a.tier,
      }));
  }, [achievements, progress, lessons]);

  const guildInfo = getGuildTitle(progress.level || 1);

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-6">
      {/* Tactile Dev Guild Command Header & Daily Bounty Bar */}
      <div className="forge-panel rounded-2xl border border-border/80 bg-card/90 p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: Guild Rank, Quip & Telemetry Pills */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary/35 bg-primary/10 px-2.5 py-1 font-mono text-xs font-bold text-primary">
                <Trophy className="h-3.5 w-3.5" />
                {guildInfo.rank}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 font-mono text-xs font-semibold text-amber-600 dark:text-amber-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                {progress.streakDays}d Streak Shield
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/70 px-2.5 py-1 font-mono text-xs font-semibold text-foreground tabular-nums">
                <Zap className="h-3.5 w-3.5 text-primary" />
                {(progress.xp || 0).toLocaleString()} XP
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/70 px-2.5 py-1 font-mono text-xs text-muted-foreground tabular-nums">
                <Flame className="h-3.5 w-3.5 text-emerald-500" />
                {completedCount}/{totalLessons || 156} Quests Cleared
              </span>
            </div>
            <p className="text-xs text-muted-foreground italic">
              &ldquo;{guildInfo.quip}&rdquo;
            </p>
          </div>

          {/* Right: Quick Guild Actions & Landing Showcase Link */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setDiagnosticOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-mono font-semibold text-primary transition-colors hover:bg-primary/15"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>60s Skill Diagnostic</span>
            </button>

            <Link
              to="/debug-lab"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-mono font-medium text-foreground transition-colors hover:border-primary/40"
            >
              <Swords className="h-3.5 w-3.5 text-amber-500" />
              <span>Boss Debug Labs</span>
            </Link>

            <Link
              to="/"
              className="inline-flex items-center gap-1 rounded-xl border border-border/70 bg-muted/40 px-3 py-2 text-xs font-mono text-muted-foreground transition-colors hover:text-foreground"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Landing Page</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* 1440px 2-Column Bento Command Center */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 items-start">
        {/* Left Primary Column (8 cols on XL): Hero Quest Stage + Module Ladder + Workspaces */}
        <div className="space-y-6 xl:col-span-8">
          {currentLesson && (
            <HeroStudio
              lesson={currentLesson}
              module={activeModule}
              topic={currentTopic}
              moduleLessonsCount={moduleLessons.length || 1}
              currentStepNumber={currentStepInModule}
              progressPercent={moduleProgressPercent}
              isNewLearner={isNewLearner}
            />
          )}

          {activeModule && moduleLessons.length > 0 && (
            <LearningLadder
              module={activeModule}
              moduleLessons={moduleLessons}
              completedLessonIds={progress.lessonsCompleted}
              currentLessonId={currentLesson?.id}
            />
          )}

          <SecondaryWorkspaces
            activeProject={projects[0]}
            completedLessonsCount={completedCount}
            streakDays={progress.streakDays}
          />
        </div>

        {/* Right Telemetry & Constellation Rail (4 cols on XL) */}
        <div className="space-y-6 xl:col-span-4">
          {constellationNodes.length > 0 && (
            <PathConstellation
              pathDomain={activeModule?.title || "Frontend Engineering"}
              pathTitle={featuredPath?.title || "Full-Stack Frontend Craft"}
              percent={pathPercent}
              nodes={constellationNodes}
            />
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1">
            {currentLesson && (
              <CurrentFocus
                lesson={currentLesson}
                nextLesson={nextLesson}
                isNewLearner={isNewLearner}
              />
            )}

            <MomentumPanel sessionsThisWeek={sessionsThisWeek} weeklyGoal={5} />
          </div>

          <RecentWins wins={recentWins} />
        </div>
      </div>

      <SkillDiagnosticModal open={diagnosticOpen} onOpenChange={setDiagnosticOpen} />
    </div>
  );
}
