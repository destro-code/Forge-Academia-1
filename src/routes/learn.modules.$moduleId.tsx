import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProgressRing } from "@/components/shared/progress-ring";
import { DifficultyBadge } from "@/components/shared/difficulty-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { useModule, useModules, useCategory } from "@/lib/hooks/use-content";
import { useProgress } from "@/lib/hooks/use-progress";
import { getModuleProgress } from "@/lib/hooks/use-curriculum";
import { canonicalManifest } from "@/lib/curriculum/manifest";
import { canonicalProvider } from "@/lib/curriculum/canonical-provider";
import {
  ATELIER_CHAPTER_DEFINITIONS,
  findChapterIdForModule,
} from "@/lib/curriculum/atelier-chapters";
import { ChapterFolio3DArt } from "@/components/atelier/forge-buddy-illos";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock,
  FolderTree,
  GraduationCap,
  CheckCircle2,
  Sparkles,
  Play,
  RotateCcw,
  Award,
  Circle,
  ChevronDown,
  ChevronUp,
  Layers,
  Compass,
} from "lucide-react";

export const Route = createFileRoute("/learn/modules/$moduleId")({
  head: () => ({
    meta: [
      { title: `Course Overview · Forge Academia` },
      {
        name: "description",
        content: `Structured course learning path and curriculum roadmap for frontend engineering.`,
      },
    ],
  }),
  component: ModuleHubRoute,
});

function ModuleHubRoute() {
  const { moduleId } = Route.useParams();
  const moduleItem = useModule(moduleId);
  const allModules = useModules();
  const category = useCategory(moduleItem?.categoryId);
  const { lessonsCompleted, lastActiveLessonId } = useProgress();

  // Collapsed state for chapters (all open by default for full visibility)
  const [collapsedChapters, setCollapsedChapters] = useState<Record<string, boolean>>({});

  const toggleChapter = (topicId: string) => {
    setCollapsedChapters((prev) => ({
      ...prev,
      [topicId]: !prev[topicId],
    }));
  };

  // Resolve parent Atelier Chapter for 3D emblem and breadcrumb context
  const parentChapter = useMemo(() => {
    const chId = findChapterIdForModule(moduleId);
    return (
      ATELIER_CHAPTER_DEFINITIONS.find((c) => c.id === chId) ??
      ATELIER_CHAPTER_DEFINITIONS[0]
    );
  }, [moduleId]);

  // 1. Get module topics strictly from authoritative curriculum manifest
  const moduleTopics = useMemo(() => {
    return canonicalManifest.getTopicsForModule(moduleId);
  }, [moduleId]);

  // 2. Build structured chapters with ordered lessons directly from manifest
  const chapters = useMemo(() => {
    const manifestMod = canonicalManifest.getModule(moduleId);
    if (!manifestMod) return [];

    return moduleTopics.map((topic, index) => {
      const topicLessonRefs = canonicalManifest.getLessonsForTopic(topic.topicId);
      const topicLessons = topicLessonRefs.map((ref) => {
        const canonical = canonicalProvider.getCanonicalLesson(ref.lessonId);
        return {
          id: ref.lessonId,
          title: ref.title,
          description: canonical?.description ?? ref.title,
          summary: canonical?.description ?? "",
          difficulty: canonical?.metadata?.difficulty ?? "Beginner",
          estimatedMinutes: canonical?.metadata?.estimatedDuration ?? 15,
          topicId: ref.topicId,
          moduleId: ref.moduleId,
          order: ref.position,
        };
      });

      const completedTopicLessons = topicLessons.filter((l) => lessonsCompleted.includes(l.id));

      return {
        topic: {
          id: topic.topicId,
          moduleId: topic.moduleId,
          title: topic.title,
          description: `Interactive studio lessons covering ${topic.title}.`,
          difficulty: "Beginner" as const,
          estimatedMinutes: topicLessons.reduce((acc, l) => acc + (l.estimatedMinutes || 15), 0),
          interviewFrequency: "Medium" as const,
          order: topic.position,
          prerequisites: [],
          tags: [],
        },
        chapterNumber: index + 1,
        lessons: topicLessons,
        completedCount: completedTopicLessons.length,
        isCompleted:
          topicLessons.length > 0 && completedTopicLessons.length === topicLessons.length,
      };
    });
  }, [moduleId, moduleTopics, lessonsCompleted]);

  // 3. Flat sequential list of all module lessons in deterministic manifest curriculum order
  const orderedModuleLessons = useMemo(() => {
    return chapters.flatMap((c) => c.lessons);
  }, [chapters]);

  // Prerequisites resolution
  const prerequisites = useMemo(() => {
    if (!moduleItem?.prerequisites || moduleItem.prerequisites.length === 0) return [];
    return moduleItem.prerequisites
      .map((prereqId) => allModules.find((m) => m.id === prereqId))
      .filter(Boolean) as Array<NonNullable<ReturnType<typeof useModule>>>;
  }, [moduleItem, allModules]);

  if (!moduleItem) {
    return (
      <div className="space-y-6 w-full min-w-0">
        <Button asChild variant="outline" size="sm" className="gap-1.5">
          <Link to="/learn/modules">
            <ArrowLeft className="h-4 w-4" /> Back to Courses
          </Link>
        </Button>
        <EmptyState
          title="Course Not Found"
          description="The requested curriculum module does not exist or may have been updated."
          action={
            <Button asChild>
              <Link to="/learn/modules">Browse All Courses</Link>
            </Button>
          }
        />
      </div>
    );
  }

  // 4. Progress and Progression Logic
  const totalLessons = orderedModuleLessons.length;
  const completedLessons = orderedModuleLessons.filter((l) => lessonsCompleted.includes(l.id));
  const completedCount = completedLessons.length;
  const isModuleCompleted = totalLessons > 0 && completedCount === totalLessons;
  const isStarted = completedCount > 0;
  const progressPercent = getModuleProgress(moduleItem.id, lessonsCompleted);

  // 5. Determine the active target lesson and primary CTA state
  let targetLesson = orderedModuleLessons[0];
  let ctaMode: "start" | "continue" | "review" = "start";

  if (isModuleCompleted) {
    ctaMode = "review";
    targetLesson = orderedModuleLessons[0];
  } else if (isStarted) {
    ctaMode = "continue";
    const lastActiveInModule = orderedModuleLessons.find((l) => l.id === lastActiveLessonId);
    if (lastActiveInModule && !lessonsCompleted.includes(lastActiveInModule.id)) {
      targetLesson = lastActiveInModule;
    } else {
      const firstUncompleted = orderedModuleLessons.find((l) => !lessonsCompleted.includes(l.id));
      targetLesson = firstUncompleted || orderedModuleLessons[0];
    }
  } else {
    ctaMode = "start";
    targetLesson = orderedModuleLessons[0];
  }

  const targetTopic = targetLesson
    ? moduleTopics.find((t) => t.topicId === targetLesson.topicId)
    : null;

  return (
    <div className="w-full min-w-0 max-w-full space-y-6 sm:space-y-8 overflow-x-clip">
      {/* Studio Breadcrumbs */}
      <nav
        aria-label="Course breadcrumb"
        className="flex flex-wrap items-center gap-1.5 sm:gap-2 rounded-2xl border border-[#E5DFD3] bg-white/85 px-3.5 py-2.5 font-mono text-xs text-[#4A5578] shadow-2xs dark:border-white/10 dark:bg-[#131E3A] dark:text-[#CBD5F0]"
      >
        <GraduationCap className="h-4 w-4 shrink-0 text-[#4F6BFF]" />
        <Link to="/dashboard" className="hover:text-[#0E1B3D] hover:underline dark:hover:text-white">
          Studio
        </Link>
        <span aria-hidden="true">→</span>
        <Link
          to="/learn/modules"
          className="hover:text-[#0E1B3D] hover:underline dark:hover:text-white"
        >
          Ch. {parentChapter.numberLabel}: {parentChapter.shortTitle}
        </Link>
        <span aria-hidden="true">→</span>
        <span className="min-w-0 truncate font-semibold text-[#4F6BFF] dark:text-[#8DA2FF]">
          {moduleItem.title}
        </span>
      </nav>

      {/* Creative Atelier Course Hero Banner (Warm Ivory + 3D Domain Emblem + Mobile-Safe Layout) */}
      <div className="w-full min-w-0 overflow-hidden rounded-[28px] border border-[#E5DFD3] bg-gradient-to-br from-white via-[#FFFDF9] to-[#EEF2FF] p-5 sm:p-7 lg:p-8 shadow-[0_18px_45px_-18px_rgba(14,27,61,0.08)] dark:border-white/10 dark:from-[#131E3A] dark:via-[#172342] dark:to-[#1D294D]">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
          <div className="w-full min-w-0 flex-1 space-y-4">
            {/* Clean Unboxed Metadata Line (Zero-Pill Discipline) */}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-xs text-[#4A5578] dark:text-[#CBD5F0]">
              <DifficultyBadge difficulty={moduleItem.difficulty} />
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-[#4F6BFF] dark:text-[#8DA2FF]">
                {category?.name || parentChapter.title}
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-[#D97706]" />~{moduleItem.estimatedHours}h
              </span>
              <span aria-hidden="true">·</span>
              <span>{moduleTopics.length} chapters</span>
              <span aria-hidden="true">·</span>
              <span>{totalLessons} lessons</span>
            </div>

            <div className="space-y-2 min-w-0">
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#0E1B3D] break-words dark:text-white">
                {moduleItem.title}
              </h1>
              <p className="max-w-2xl text-sm sm:text-base leading-relaxed text-[#4A5578] break-words dark:text-[#CBD5F0]">
                {moduleItem.description}
              </p>
            </div>

            {totalLessons === 0 ? (
              <div className="rounded-2xl border border-[#FFE08A] bg-[#FFFBEB] p-4 text-xs text-[#92400E] dark:border-[#FFE08A]/30 dark:bg-[#FFE08A]/10 dark:text-[#FFE08A]">
                No canonical lessons are available yet for {moduleItem.title}. This studio module is
                currently being authored.
              </div>
            ) : (
              targetLesson && (
                <div className="pt-1 flex flex-col sm:flex-row sm:items-center gap-3 w-full min-w-0">
                  <Link
                    to="/lesson/$lessonId"
                    params={{ lessonId: targetLesson.id }}
                    search={{ mode: "module" }}
                    className="inline-flex min-h-[48px] w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-[#4F6BFF] px-6 py-3 font-display text-sm font-extrabold text-white shadow-[0_12px_28px_-6px_rgba(79,107,255,0.55)] transition-all hover:-translate-y-0.5 hover:bg-[#3B53D9]"
                  >
                    {ctaMode === "review" ? (
                      <>
                        <RotateCcw className="h-4 w-4 shrink-0" />
                        <span>Review Course</span>
                      </>
                    ) : ctaMode === "continue" ? (
                      <>
                        <Play className="h-4 w-4 shrink-0 fill-current" />
                        <span>Continue Course</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 shrink-0" />
                        <span>Start Course</span>
                      </>
                    )}
                  </Link>

                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="min-h-[44px] w-full sm:w-auto rounded-2xl border-[#E5DFD3] bg-white px-4 text-xs font-bold text-[#0E1B3D] hover:border-[#4F6BFF] hover:text-[#4F6BFF] dark:border-white/15 dark:bg-[#0B1226] dark:text-white"
                  >
                    <Link to="/learn/modules">
                      <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> All Courses
                    </Link>
                  </Button>
                </div>
              )
            )}

            {targetLesson && (
              <div className="font-mono text-xs text-[#4A5578] break-words dark:text-[#94A3C9]">
                Target:{" "}
                <strong className="font-semibold text-[#0E1B3D] dark:text-white">
                  {targetLesson.title}
                </strong>{" "}
                (~{targetLesson.estimatedMinutes || 20}m)
              </div>
            )}
          </div>

          {/* Right Column: 3D Chapter Art + Course Progress Ring */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-center justify-between gap-4 border-t lg:border-t-0 lg:border-l border-[#E5DFD3] pt-5 lg:pt-0 lg:pl-7 shrink-0 w-full lg:w-[240px] dark:border-white/10">
            <div className="hidden sm:block w-36 lg:w-full">
              <ChapterFolio3DArt accent={parentChapter.accent} className="h-24 w-full" />
            </div>
            <div className="flex w-full items-center justify-between gap-4 rounded-2xl border border-[#E5DFD3]/80 bg-white/90 p-3.5 dark:border-white/10 dark:bg-[#0B1226]/70">
              <div className="space-y-0.5 min-w-0">
                <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#7B86A6] dark:text-[#94A3C9]">
                  Course Progress
                </div>
                <div className="font-mono text-xl font-extrabold text-[#0E1B3D] dark:text-white">
                  {progressPercent}%
                </div>
                <div className="text-xs text-[#4A5578] dark:text-[#CBD5F0]">
                  {completedCount}/{totalLessons} lessons
                </div>
              </div>
              <ProgressRing value={progressPercent / 100} size={56} />
            </div>
          </div>
        </div>

        {/* Progress bar line */}
        <div className="mt-6 pt-4 border-t border-[#E5DFD3]/70 dark:border-white/10">
          <div className="flex items-center justify-between font-mono text-xs text-[#4A5578] mb-2 dark:text-[#CBD5F0]">
            <span>Overall Completion</span>
            <span>
              {completedCount}/{totalLessons} Lessons ({progressPercent}%)
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </div>

      {/* Next Up Focus Banner (when in progress or new) */}
      {!isModuleCompleted && targetLesson && (
        <div className="w-full min-w-0 overflow-hidden rounded-[24px] border border-[#C9BBFF]/70 bg-white p-5 sm:p-6 shadow-[0_12px_30px_-14px_rgba(79,107,255,0.12)] dark:border-white/10 dark:bg-[#131E3A]">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="w-full min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#4F6BFF] px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider text-white">
                  <Play className="h-3 w-3 fill-current" /> Next Up
                </span>
                {targetTopic && (
                  <span className="font-mono text-[#4A5578] break-words dark:text-[#CBD5F0]">
                    Chapter: {targetTopic.title}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <h2 className="font-display text-base sm:text-lg font-extrabold text-[#0E1B3D] break-words dark:text-white">
                  Lesson {targetLesson.order || 1}: {targetLesson.title}
                </h2>
                {targetLesson.summary && (
                  <p className="text-xs sm:text-sm text-[#4A5578] mt-1 line-clamp-2 leading-relaxed break-words dark:text-[#CBD5F0]">
                    {targetLesson.summary}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs text-[#4A5578] pt-0.5 dark:text-[#94A3C9]">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-[#D97706]" />
                  {targetLesson.estimatedMinutes || 20} min
                </span>
                <span aria-hidden="true">·</span>
                <DifficultyBadge difficulty={targetLesson.difficulty || moduleItem.difficulty} />
              </div>
            </div>

            <Link
              to="/lesson/$lessonId"
              params={{ lessonId: targetLesson.id }}
              search={{ mode: "module" }}
              className="inline-flex min-h-[44px] w-full sm:w-auto shrink-0 items-center justify-center gap-2 rounded-xl bg-[#4F6BFF] px-5 py-2.5 font-display text-xs sm:text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-[#3B53D9]"
            >
              <span>{isStarted ? "Resume Lesson" : "Start Lesson"}</span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
          </div>
        </div>
      )}

      {/* Celebratory Completion Banner (when 100% complete) */}
      {isModuleCompleted && (
        <Card className="w-full min-w-0 overflow-hidden rounded-[24px] border-emerald-500/40 bg-emerald-500/5 p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="rounded-full bg-emerald-500/10 p-2 text-emerald-500 shrink-0 mt-0.5">
                <Award className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-foreground break-words">
                  Course Complete · 100% Mastered
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed break-words">
                  Congratulations! You have completed every lesson in {moduleItem.title}. You can
                  review any chapter or practice with related challenges.
                </p>
              </div>
            </div>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full sm:w-auto shrink-0 gap-1.5 min-h-[44px]"
            >
              <Link to="/learn/modules">
                Explore More Courses <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Card>
      )}

      {/* Prerequisites & Core Skills */}
      {(prerequisites.length > 0 || (moduleItem.tags && moduleItem.tags.length > 0)) && (
        <div className="grid gap-4 md:grid-cols-2 w-full min-w-0">
          {prerequisites.length > 0 && (
            <div className="w-full min-w-0 rounded-[22px] border border-[#E5DFD3] bg-white p-4 dark:border-white/10 dark:bg-[#131E3A]">
              <div className="text-xs font-mono text-[#4A5578] uppercase tracking-wider mb-2.5 flex items-center gap-1.5 dark:text-[#94A3C9]">
                <Compass className="h-3.5 w-3.5 text-[#4F6BFF]" /> Recommended Prerequisites
              </div>
              <div className="space-y-2">
                {prerequisites.map((prereq) => (
                  <Link
                    key={prereq.id}
                    to="/learn/modules/$moduleId"
                    params={{ moduleId: prereq.id }}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#FFFDF9] border border-[#E5DFD3] hover:border-[#4F6BFF] text-xs font-semibold transition-colors min-w-0 dark:border-white/10 dark:bg-[#0B1226]"
                  >
                    <span className="truncate">{prereq.title}</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#4F6BFF]" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {moduleItem.tags && moduleItem.tags.length > 0 && (
            <div className="w-full min-w-0 rounded-[22px] border border-[#E5DFD3] bg-white p-4 dark:border-white/10 dark:bg-[#131E3A]">
              <div className="text-xs font-mono text-[#4A5578] uppercase tracking-wider mb-2.5 flex items-center gap-1.5 dark:text-[#94A3C9]">
                <Layers className="h-3.5 w-3.5 text-[#4F6BFF]" /> Core Skills &amp; Topics Covered
              </div>
              <div className="flex flex-wrap gap-1.5">
                {moduleItem.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg border border-[#E5DFD3] bg-[#FFFDF9] px-2.5 py-1 font-mono text-xs font-medium text-[#0E1B3D] dark:border-white/10 dark:bg-[#0B1226] dark:text-[#F8F6F0]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Course Curriculum Roadmap Section */}
      <section className="space-y-4 w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5DFD3] pb-3 dark:border-white/10">
          <div className="min-w-0">
            <h2 className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-[#0E1B3D] flex items-center gap-2 dark:text-white">
              <Layers className="h-5 w-5 shrink-0 text-[#4F6BFF]" />
              <span>Curriculum Roadmap</span>
            </h2>
            <p className="text-xs text-[#4A5578] dark:text-[#CBD5F0]">
              {moduleTopics.length} Chapters · {totalLessons} Sequential Studio Lessons
            </p>
          </div>
          <div className="text-xs font-mono font-semibold text-[#4A5578] dark:text-[#94A3C9]">
            {completedCount} of {totalLessons} completed ({progressPercent}%)
          </div>
        </div>

        {chapters.length > 0 ? (
          <div className="space-y-4 w-full min-w-0">
            {chapters.map((chapter) => {
              const isCollapsed = !!collapsedChapters[chapter.topic.id];

              return (
                <div
                  key={chapter.topic.id}
                  className={`w-full min-w-0 overflow-hidden rounded-[24px] border transition-all duration-200 ${
                    chapter.isCompleted
                      ? "border-[#A7E3D1] bg-white dark:border-[#A7E3D1]/30 dark:bg-[#131E3A]"
                      : "border-[#E5DFD3] bg-white hover:border-[#C9BBFF] dark:border-white/10 dark:bg-[#131E3A]"
                  }`}
                >
                  {/* Chapter Header */}
                  <div
                    className="p-4 sm:p-5 flex items-start sm:items-center justify-between gap-3 cursor-pointer select-none w-full min-w-0"
                    onClick={() => toggleChapter(chapter.topic.id)}
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      {/* Clean Unboxed Chapter Metadata */}
                      <div className="flex items-center gap-2 flex-wrap font-mono text-xs text-[#4A5578] dark:text-[#94A3C9]">
                        <span
                          className={`font-bold uppercase tracking-wider ${
                            chapter.isCompleted
                              ? "text-[#0F7656] dark:text-[#A7E3D1]"
                              : "text-[#4F6BFF] dark:text-[#8DA2FF]"
                          }`}
                        >
                          Chapter {chapter.chapterNumber}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3 text-[#D97706]" />
                          {chapter.topic.estimatedMinutes}m
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {chapter.completedCount}/{chapter.lessons.length} lessons
                        </span>
                      </div>

                      <div className="flex items-center gap-2 min-w-0">
                        <h3 className="font-display text-base sm:text-lg font-extrabold text-[#0E1B3D] break-words dark:text-white">
                          {chapter.topic.title}
                        </h3>
                        {chapter.isCompleted && (
                          <CheckCircle2 className="h-4 w-4 text-[#0F7656] shrink-0 dark:text-[#A7E3D1]" />
                        )}
                      </div>

                      <p className="text-xs text-[#4A5578] line-clamp-2 leading-relaxed break-words dark:text-[#CBD5F0]">
                        {chapter.topic.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right hidden sm:block">
                        <div className="text-xs font-mono font-bold text-[#0E1B3D] dark:text-white">
                          {chapter.completedCount} / {chapter.lessons.length}
                        </div>
                        <div className="text-[10px] text-[#7B86A6] font-mono dark:text-[#94A3C9]">
                          {chapter.isCompleted ? "Completed" : "In Progress"}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-[#4A5578]"
                        aria-label="Toggle chapter"
                      >
                        {isCollapsed ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronUp className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Chapter Lessons List (Mobile-Safe: w-full min-w-0 + line-clamp-2 sm:truncate) */}
                  {!isCollapsed && (
                    <div className="border-t border-[#E5DFD3]/70 divide-y divide-[#E5DFD3]/60 bg-[#FFFDF9]/80 dark:border-white/10 dark:divide-white/10 dark:bg-[#0B1226]/50">
                      {chapter.lessons.map((lesson, lessonIndex) => {
                        const isLessonCompleted = lessonsCompleted.includes(lesson.id);
                        const isTarget = targetLesson?.id === lesson.id;

                        return (
                          <div
                            key={lesson.id}
                            className={`p-3.5 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 transition-colors w-full min-w-0 ${
                              isTarget
                                ? "bg-[#EEF2FF]/75 border-l-4 border-l-[#4F6BFF] dark:bg-[#1D294D]/60"
                                : isLessonCompleted
                                  ? "hover:bg-[#F4EFE6]/50 dark:hover:bg-white/5"
                                  : "hover:bg-[#F4EFE6]/40 dark:hover:bg-white/5"
                            }`}
                          >
                            <div className="flex items-start gap-3 w-full flex-1 min-w-0">
                              {/* Status Icon */}
                              <div className="mt-0.5 shrink-0">
                                {isLessonCompleted ? (
                                  <CheckCircle2 className="h-4 w-4 text-[#0F7656] dark:text-[#A7E3D1]" />
                                ) : isTarget ? (
                                  <Play className="h-4 w-4 text-[#4F6BFF] fill-[#4F6BFF]" />
                                ) : (
                                  <Circle className="h-4 w-4 text-[#7B86A6]/50" />
                                )}
                              </div>

                              <div className="space-y-1 min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[11px] font-mono text-[#7B86A6] dark:text-[#94A3C9]">
                                    Lesson {lesson.order || lessonIndex + 1}
                                  </span>
                                  {isTarget && (
                                    <Badge
                                      variant="default"
                                      className="bg-[#4F6BFF] text-white text-[10px] py-0 px-1.5 font-semibold"
                                    >
                                      Next Up
                                    </Badge>
                                  )}
                                  {isLessonCompleted && (
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] py-0 px-1.5 text-[#0F7656] border-[#A7E3D1] dark:text-[#A7E3D1]"
                                    >
                                      Completed
                                    </Badge>
                                  )}
                                </div>

                                <h4 className="text-sm font-bold text-[#0E1B3D] line-clamp-2 sm:truncate break-words dark:text-white">
                                  {lesson.title}
                                </h4>

                                {lesson.summary && (
                                  <p className="text-xs text-[#4A5578] line-clamp-1 break-words dark:text-[#CBD5F0]">
                                    {lesson.summary}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E5DFD3]/60 dark:border-white/10">
                              <span className="text-xs text-[#4A5578] font-mono inline-flex items-center gap-1 dark:text-[#94A3C9]">
                                <Clock className="h-3 w-3 text-[#D97706]" />
                                {lesson.estimatedMinutes || 20}m
                              </span>

                              <Button
                                asChild
                                variant={
                                  isTarget ? "default" : isLessonCompleted ? "outline" : "secondary"
                                }
                                size="sm"
                                className="min-h-[40px] sm:min-h-[36px] text-xs gap-1.5 shadow-2xs rounded-xl"
                              >
                                <Link
                                  to="/lesson/$lessonId"
                                  params={{ lessonId: lesson.id }}
                                  search={{ mode: "module" }}
                                >
                                  {isLessonCompleted ? (
                                    <>
                                      <RotateCcw className="h-3.5 w-3.5" /> Revisit
                                    </>
                                  ) : isTarget ? (
                                    <>
                                      <Play className="h-3.5 w-3.5 fill-current" />{" "}
                                      {isStarted ? "Resume" : "Start"}
                                    </>
                                  ) : (
                                    <>
                                      <ArrowRight className="h-3.5 w-3.5" /> Start
                                    </>
                                  )}
                                </Link>
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <Card className="border-dashed border-border/80 bg-muted/10 p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 mb-3">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground">This module is being forged</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1 leading-relaxed">
              No lessons are available yet. Canonical learning units for this module are currently
              scheduled in the Forge production roadmap.
            </p>
          </Card>
        )}
      </section>

      {/* Secondary Actions & Filtered Catalog Links */}
      <div className="w-full min-w-0 rounded-[24px] border border-[#E5DFD3] bg-white p-5 dark:border-white/10 dark:bg-[#131E3A]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <h4 className="font-display text-sm font-extrabold text-[#0E1B3D] dark:text-white">
              Need to search or browse by specific topics?
            </h4>
            <p className="text-xs text-[#4A5578] dark:text-[#CBD5F0]">
              Explore the filtered catalog of lessons or return to the 4 Studio Chapters.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs min-h-[40px] flex-1 sm:flex-none rounded-xl"
            >
              <Link to="/learn/lessons" search={{ moduleId: moduleItem.id }}>
                <BookOpen className="h-3.5 w-3.5" /> Filtered Lessons
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs min-h-[40px] flex-1 sm:flex-none rounded-xl"
            >
              <Link to="/learn/topics" search={{}}>
                <FolderTree className="h-3.5 w-3.5" /> All Topics
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
