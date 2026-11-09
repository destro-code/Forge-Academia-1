import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/page-header";
import { AtelierRouteHero } from "@/components/atelier/atelier-route-hero";
import { AnalyticsSubnav } from "@/components/shared/analytics-subnav";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useProgress } from "@/lib/hooks/use-progress";
import {
  getAggregatedTopicCapabilityStatuses,
  getCapabilityEvidenceRecords,
  type CapabilityStatus,
  useLearnerEvidenceVersion,
} from "@/lib/learning-engine/evidence-store";
import {
  useLessons,
  useProjects,
  useTopics,
  useModules,
} from "@/lib/hooks/use-content";
import {
  Flame,
  Trophy,
  Brain,
  BookOpen,
  Award,
  ListChecks,
  Bug,
  TrendingUp,
  Play,
  ShieldCheck,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Progress Dashboard · Forge" },
      {
        name: "description",
        content:
          "High-level overview of curriculum completion, lessons, quizzes, projects, and milestones.",
      },
      { property: "og:title", content: "Progress Dashboard · Forge" },
      { property: "og:description", content: "Visualize your path through Forge." },
    ],
  }),
  component: ProgressDashboardPage,
});

const CAPABILITY_STATUS_ORDER: Record<CapabilityStatus, number> = {
  "needs-review": 0,
  "in-progress": 1,
  demonstrated: 2,
  mastered: 3,
  "not-started": 4,
};

export function ProgressDashboardPage() {
  const progress = useProgress();
  const allLessons = useLessons();
  const allProjects = useProjects();
  const allTopics = useTopics();
  const allModules = useModules();

  // 1. Core Completion Calculations
  const completedLessonsCount = useMemo(() => {
    return progress.lessonsCompleted?.length || 0;
  }, [progress.lessonsCompleted]);

  const totalLessonsCount = useMemo(() => {
    return allLessons.length || 1;
  }, [allLessons]);

  const curriculumPercent = useMemo(() => {
    return Math.round((completedLessonsCount / totalLessonsCount) * 100);
  }, [completedLessonsCount, totalLessonsCount]);

  // Completed quizzes (using the unique quiz IDs from quiz results or completedQuizzes list)
  const completedQuizzesCount = useMemo(() => {
    const fromCompleted = progress.completedQuizzes || [];
    const fromResults = (progress.quizResults || []).map((r) => r.quizId);
    const uniqueQuizzes = new Set([...fromCompleted, ...fromResults]);
    return uniqueQuizzes.size;
  }, [progress.completedQuizzes, progress.quizResults]);

  const averageQuizScore = useMemo(() => {
    const results = progress.quizResults || [];
    if (results.length === 0) return 0;

    // Group by quizId and find max score for each
    const maxScores: Record<string, number> = {};
    results.forEach((r) => {
      maxScores[r.quizId] = Math.max(maxScores[r.quizId] || 0, r.scorePercent);
    });

    const scores = Object.values(maxScores);
    const sum = scores.reduce((acc, s) => acc + s, 0);
    return Math.round(sum / scores.length);
  }, [progress.quizResults]);

  // Completed projects count
  const completedProjectsCount = useMemo(() => {
    return progress.completedProjects?.length || 0;
  }, [progress.completedProjects]);

  // Completed debug bugs count
  const completedBugsCount = useMemo(() => {
    return progress.solvedBugs?.length || 0;
  }, [progress.solvedBugs]);

  // Completed topics count (where all of its lessons are completed)
  const completedTopicsCount = useMemo(() => {
    return allTopics.filter((topic) => {
      const topicLessons = allLessons.filter((l) => l.topicId === topic.id);
      if (topicLessons.length === 0) return false;
      return topicLessons.every((l) => progress.lessonsCompleted?.includes(l.id));
    }).length;
  }, [allTopics, allLessons, progress.lessonsCompleted]);

  // Completed modules count (where all of its topics are completed)
  const completedModulesCount = useMemo(() => {
    return allModules.filter((module) => {
      const moduleTopics = allTopics.filter((t) => t.moduleId === module.id);
      if (moduleTopics.length === 0) return false;
      return moduleTopics.every((topic) => {
        const topicLessons = allLessons.filter((l) => l.topicId === topic.id);
        if (topicLessons.length === 0) return false;
        return topicLessons.every((l) => progress.lessonsCompleted?.includes(l.id));
      });
    }).length;
  }, [allModules, allTopics, allLessons, progress.lessonsCompleted]);

  // 2. Module completion analytics for charting
  const moduleChartData = useMemo(() => {
    return allModules.map((m) => {
      const moduleTopics = allTopics.filter((t) => t.moduleId === m.id);
      const topicIds = moduleTopics.map((t) => t.id);
      const moduleLessons = allLessons.filter((l) => topicIds.includes(l.topicId));
      const totalLessons = moduleLessons.length;
      const completed = moduleLessons.filter((l) =>
        progress.lessonsCompleted?.includes(l.id),
      ).length;

      const percent = totalLessons === 0 ? 0 : Math.round((completed / totalLessons) * 100);
      return {
        name: m.title.split(" & ")[0].split(" - ")[0], // Shorten name for readability
        completion: percent,
        completedCount: completed,
        totalCount: totalLessons,
      };
    });
  }, [allModules, allTopics, allLessons, progress.lessonsCompleted]);

  // 3. Milestones Verification
  const milestonesList = useMemo(() => {
    return [
      {
        id: "first_spark",
        title: "First Spark",
        description: "Complete your first lesson in Forge",
        icon: <BookOpen className="h-5 w-5 text-sky-500" />,
        isUnlocked: completedLessonsCount >= 1,
        progressVal: Math.min(completedLessonsCount, 1),
        progressMax: 1,
        targetLabel: "1 lesson",
      },
      {
        id: "quiz_master",
        title: "Quiz Graduate",
        description: "Practice and complete at least 3 quiz assessments",
        icon: <ListChecks className="h-5 w-5 text-indigo-500" />,
        isUnlocked: completedQuizzesCount >= 3,
        progressVal: Math.min(completedQuizzesCount, 3),
        progressMax: 3,
        targetLabel: "3 quizzes",
      },
      {
        id: "bug_squasher",
        title: "Bug Squasher",
        description: "Identify and solve 2 Debug Lab bug scenarios",
        icon: <Bug className="h-5 w-5 text-rose-500" />,
        isUnlocked: completedBugsCount >= 2,
        progressVal: Math.min(completedBugsCount, 2),
        progressMax: 2,
        targetLabel: "2 bugs",
      },
      {
        id: "portfolio_builder",
        title: "Project Builder",
        description: "Complete and verify at least one project milestone.",
        icon: <Trophy className="h-5 w-5 text-amber-500" />,
        isUnlocked: completedProjectsCount >= 1,
        progressVal: Math.min(completedProjectsCount, 1),
        progressMax: 1,
        targetLabel: "1 project",
      },
      {
        id: "senior_readiness",
        title: "Interview Practice",
        description: "Complete a mock technical interview session.",
        icon: <Award className="h-5 w-5 text-emerald-500" />,
        isUnlocked: (progress.interviewResults || []).length >= 1,
        progressVal: Math.min((progress.interviewResults || []).length, 1),
        progressMax: 1,
        targetLabel: "1 interview session",
      },
    ];
  }, [
    completedLessonsCount,
    completedQuizzesCount,
    completedBugsCount,
    completedProjectsCount,
    progress.interviewResults,
  ]);

  // Capability is based on verified evidence, not activity points or lesson completion alone.
  const evidenceVersion = useLearnerEvidenceVersion();
  const capabilityStatuses = useMemo(
    () =>
      getAggregatedTopicCapabilityStatuses({
        topics: allTopics,
        lessons: allLessons,
        progress: {
          lessonsCompleted: progress.lessonsCompleted,
          quizResults: progress.quizResults,
        },
      }),
    [allTopics, allLessons, progress.lessonsCompleted, progress.quizResults, evidenceVersion],
  );
  const capabilityEntries = useMemo(
    () =>
      allTopics
        .map((topic) => ({
          ...topic,
          summary: capabilityStatuses[topic.id],
        }))
        .sort(
          (a, b) =>
            CAPABILITY_STATUS_ORDER[a.summary?.status ?? "not-started"] -
            CAPABILITY_STATUS_ORDER[b.summary?.status ?? "not-started"],
        ),
    [allTopics, capabilityStatuses],
  );
  const capabilityCounts = useMemo(
    () => ({
      mastered: capabilityEntries.filter((item) => item.summary?.status === "mastered").length,
      demonstrated: capabilityEntries.filter((item) => item.summary?.status === "demonstrated").length,
      inProgress: capabilityEntries.filter((item) => item.summary?.status === "in-progress").length,
      needsReview: capabilityEntries.filter((item) => item.summary?.status === "needs-review").length,
    }),
    [capabilityEntries],
  );
  const recentEvidence = useMemo(
    () =>
      getCapabilityEvidenceRecords()
        .slice()
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 6),
    [evidenceVersion],
  );

  return (
    <div className="atelier-progress-page space-y-8 pb-12">
      <AnalyticsSubnav />

      {/* 1. Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          eyebrow="My Progress"
          title="Your Engineering Journey"
          description="See what you have studied, what you have demonstrated, and which capabilities still need practice or verification."
        />

        {/* Action Button to Quick Learn */}
        <div className="flex items-center gap-2 shrink-0">
          <Link to="/learn">
            <Button size="sm" className="gap-1.5 font-semibold">
              <Play className="h-4 w-4" /> Continue Learning
            </Button>
          </Link>
        </div>
      </div>

      <AtelierRouteHero
        label="Your learning blueprint"
        title="Progress should show what you can do."
        description="Lesson completion shows where you have been. Verified evidence shows what you can demonstrate. Use both to choose your next useful challenge."
        icon={<TrendingUp className="size-7" />}
        note="Learning activity and verified capability are tracked separately"
      />

      {/* 2. Overall Curriculum Progress & Capability Evidence */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Progress Gauge */}
        <Card className="border-border/60 md:col-span-2 flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Overall Curriculum Completion</span>
              <span className="text-primary font-mono font-bold text-lg">{curriculumPercent}%</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Your overall journey progress computed from completed lessons.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-3">
            <div className="space-y-2">
              <Progress value={curriculumPercent} className="h-3.5" />
              <div className="flex justify-between text-xs text-muted-foreground font-medium">
                <span>
                  {completedLessonsCount} / {totalLessonsCount} Lessons Done
                </span>
                <span>{totalLessonsCount - completedLessonsCount} Lessons Remaining</span>
              </div>
            </div>

            {/* Sub-progress categories */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/40 text-center">
              <div>
                <span className="text-xs text-muted-foreground block">Topics with all lessons done</span>
                <span className="text-xl font-bold text-foreground font-mono">
                  {completedTopicsCount}{" "}
                  <span className="text-xs text-muted-foreground">/ {allTopics.length}</span>
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Modules with all lessons done</span>
                <span className="text-xl font-bold text-foreground font-mono">
                  {completedModulesCount}{" "}
                  <span className="text-xs text-muted-foreground">/ {allModules.length}</span>
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Streaks Status</span>
                <span className="text-xl font-bold text-amber-500 font-mono flex items-center justify-center gap-1">
                  <Flame className="h-5 w-5 fill-amber-500 text-amber-500 inline shrink-0" />
                  {progress.streakDays || 0}d
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Capability Evidence Summary */}
        <Card className="border-border/60 flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-1.5">
              <ShieldCheck className="h-5 w-5 text-primary" /> Capability Evidence
            </CardTitle>
            <CardDescription className="text-xs">
              Mastery is earned through verified demonstrations, not activity points.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 pt-3">
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3">
              <div className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400">{capabilityCounts.mastered}</div>
              <div className="text-xs text-muted-foreground">Mastered</div>
            </div>
            <div className="rounded-xl border border-primary/25 bg-primary/5 p-3">
              <div className="font-mono text-2xl font-bold text-primary">{capabilityCounts.demonstrated}</div>
              <div className="text-xs text-muted-foreground">Demonstrated</div>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <div className="font-mono text-2xl font-bold text-foreground">{capabilityCounts.inProgress}</div>
              <div className="text-xs text-muted-foreground">In progress</div>
            </div>
            <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-3">
              <div className="font-mono text-2xl font-bold text-amber-600 dark:text-amber-400">{capabilityCounts.needsReview}</div>
              <div className="text-xs text-muted-foreground">Needs review</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. High Level Stat Cards */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Lessons Completed"
          value={`${completedLessonsCount} / ${totalLessonsCount}`}
          delta={`${Math.round((completedLessonsCount / totalLessonsCount) * 100)}% complete`}
          icon={<BookOpen className="h-4 w-4 text-sky-500" />}
        />
        <StatCard
          label="Quizzes Completed"
          value={completedQuizzesCount}
          delta={
            completedQuizzesCount > 0 ? `${averageQuizScore}% Average Accuracy` : "No scores yet"
          }
          icon={<ListChecks className="h-4 w-4 text-indigo-500" />}
        />
        <StatCard
          label="Projects Completed"
          value={`${completedProjectsCount} / ${allProjects.length}`}
          delta={`${allProjects.length - completedProjectsCount} projects remaining`}
          icon={<Trophy className="h-4 w-4 text-amber-500" />}
        />
        <StatCard
          label="Debug Challenges Solved"
          value={completedBugsCount}
          delta="Verified bug challenges"
          icon={<Bug className="h-4 w-4 text-rose-500" />}
        />
      </div>

      {/* 4. Chart Section & Module Progress Accordion List */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Side: Module completion bar chart */}
        <Card className="border-border/60 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-primary" /> Lesson Activity by Module
            </CardTitle>
            <CardDescription className="text-xs">
              Shows completed lessons within each curriculum module. This measures learning activity, not mastery.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={moduleChartData}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }}
                  unit="%"
                />
                <RTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 bg-popover border border-border rounded-xl shadow-md text-xs">
                          <p className="font-bold text-foreground">{data.name}</p>
                          <p className="text-muted-foreground pt-1">
                            Completion: <strong className="text-primary">{data.completion}%</strong>
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Lessons:{" "}
                            <strong>
                              {data.completedCount} / {data.totalCount}
                            </strong>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="completion" radius={[4, 4, 0, 0]}>
                  {moduleChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`hsl(var(--primary) / ${0.5 + (entry.completion / 100) * 0.5})`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Right Side: Modules List */}
        <Card className="border-border/60 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-sm">Curriculum Modules Hub</CardTitle>
            <CardDescription className="text-xs">
              Review and jump to specific learning sections.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-1 max-h-64 overflow-y-auto">
            {allModules.map((m, idx) => {
              const chartItem = moduleChartData[idx];
              return (
                <div
                  key={m.id}
                  className="space-y-1.5 pb-3 border-b border-border/40 last:border-0 last:pb-0"
                >
                  <div className="flex items-center justify-between text-xs">
                    <Link
                      to="/learn/modules/$moduleId"
                      params={{ moduleId: m.id }}
                      className="hover:underline font-semibold text-foreground"
                    >
                      {m.title}
                    </Link>
                    <span className="font-bold text-primary font-mono">
                      {chartItem?.completion || 0}%
                    </span>
                  </div>
                  <Progress value={chartItem?.completion || 0} className="h-1.5" />
                  <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                    <span>
                      {chartItem?.completedCount} / {chartItem?.totalCount} lessons completed
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* 5. Curriculum Milestones Checklist */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-amber-500" /> Learning Milestones
          </CardTitle>
          <CardDescription className="text-xs">
            These milestones recognize completed learning activities. They are not capability or seniority rankings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {milestonesList.map((m) => (
              <div
                key={m.id}
                className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition ${
                  m.isUnlocked
                    ? "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40"
                    : "border-border/50 bg-card/40 opacity-75"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div
                      className={`p-2 rounded-lg ${m.isUnlocked ? "bg-emerald-500/10" : "bg-muted"}`}
                    >
                      {m.icon}
                    </div>
                    {m.isUnlocked ? (
                      <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] h-5">
                        Unlocked
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] h-5 font-mono">
                        Locked
                      </Badge>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-foreground">{m.title}</h4>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      {m.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] text-muted-foreground font-semibold">
                    <span>Target: {m.targetLabel}</span>
                    <span className="font-mono">
                      {m.progressVal} / {m.progressMax}
                    </span>
                  </div>
                  <Progress value={(m.progressVal / m.progressMax) * 100} className="h-1" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 6. Recent verified capability evidence */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-primary" /> Recent Capability Evidence
          </CardTitle>
          <CardDescription className="text-xs">
            Recent records from lessons, projects, quizzes, interviews, and Debug Lab. Each item shows whether it has been verified.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentEvidence.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-xs">
              No capability evidence has been recorded yet. Complete an interactive check or verify a project task to begin building your evidence record.
            </div>
          ) : (
            <div className="space-y-3">
              {recentEvidence.map((record) => (
                <div key={record.id} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">{record.title}</span>
                      <Badge variant="outline" className="text-[10px] capitalize">{record.sourceType.replace("-", " ")}</Badge>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">{record.summary}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 text-[10px] text-muted-foreground">
                    <Badge variant={record.evidenceStatus === "verified" ? "secondary" : "outline"} className="text-[10px] capitalize">{record.evidenceStatus.replace("-", " ")}</Badge>
                    <time dateTime={record.updatedAt}>{new Date(record.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</time>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 7. Capability map */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-1.5">
            <Brain className="h-4 w-4 text-primary" /> Topic Capability Map
          </CardTitle>
          <CardDescription className="text-xs">
            A topic moves from learning to demonstrated capability only when supported by verification. Recent failures can flag a topic for review.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {capabilityEntries.map((topic) => {
              const status = topic.summary?.status ?? "not-started";
              const statusLabel = status === "needs-review" ? "Needs review" : status.replace("-", " ");
              const statusClass =
                status === "mastered"
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : status === "demonstrated"
                    ? "border-primary/30 bg-primary/5"
                    : status === "needs-review"
                      ? "border-amber-500/30 bg-amber-500/5"
                      : "border-border bg-card";
              return (
                <div key={topic.id} className={`rounded-xl border p-3 ${statusClass}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-xs font-semibold text-foreground">{topic.title}</h3>
                    <Badge variant="outline" className="text-[10px] capitalize">{statusLabel}</Badge>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
                    <span>{topic.summary?.verifiedCount ?? 0} verified checks</span>
                    <span>{topic.summary?.completedLessonsCount ?? 0}/{topic.summary?.totalLessonsCount ?? 0} lessons</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{topic.summary?.latestReason ?? "Not started yet."}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
