import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ProgressRing } from "@/components/shared/progress-ring";
import { DifficultyBadge } from "@/components/shared/difficulty-badge";
import { CurriculumFilterBar } from "@/components/learning/curriculum-filter-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  ChapterFolio3DArt,
  CurvedDoodleArrow,
  HandwrittenCallout,
  StudioDesk3DCluster,
} from "@/components/atelier/forge-buddy-illos";
import { useCurriculum, getModuleProgress } from "@/lib/hooks/use-curriculum";
import { useProgress } from "@/lib/hooks/use-progress";
import {
  ArrowRight,
  Layers,
  GraduationCap,
  FolderTree,
  BookOpen,
  Clock,
  Code2,
  Palette,
  Braces,
  Sparkles,
} from "lucide-react";
import type { AtelierChapterAccent } from "@/lib/curriculum/atelier-chapters";

export const Route = createFileRoute("/learn/modules/")({
  head: () => ({
    meta: [
      { title: "Modules · Forge Academia" },
      {
        name: "description",
        content:
          "Learning Modules — major engineering domains containing focused topics and lessons.",
      },
      { property: "og:title", content: "Modules · Forge Academia" },
      { property: "og:description", content: "Learning modules index." },
    ],
  }),
  component: ModulesRoute,
});

function getModuleVisual(title: string, description: string, tags: string[] = []): {
  label: string;
  detail: string;
  icon: typeof Code2;
  mark: string;
  accent: AtelierChapterAccent;
  cardBorder: string;
  bannerTone: string;
} {
  const text = `${title} ${description} ${tags.join(" ")}`.toLowerCase();
  if (text.includes("html") || text.includes("semantic") || text.includes("document structure") || text.includes("web works")) {
    return {
      label: "HTML & Structure",
      detail: "Shape clear, semantic page architecture.",
      icon: Code2,
      mark: "</>",
      accent: "mint",
      cardBorder: "hover:border-[#0F7656]/50",
      bannerTone: "from-[#E6FBF2] via-[#D1FAE5]/80 to-[#A7E3D1]/45 border-[#A7E3D1] text-[#0E1B3D] dark:from-[#064E3B]/70 dark:to-[#0F7656]/40 dark:border-[#A7E3D1]/30 dark:text-[#A7E3D1]",
    };
  }
  if (text.includes("css") || text.includes("style") || text.includes("layout") || text.includes("responsive")) {
    return {
      label: "CSS & Visual Craft",
      detail: "Control layout, color, and responsive motion.",
      icon: Palette,
      mark: "{ }",
      accent: "cobalt",
      cardBorder: "hover:border-[#4F6BFF]/60",
      bannerTone: "from-[#EEF2FF] via-[#E0E7FF] to-[#C9BBFF]/55 border-[#C9BBFF] text-[#0E1B3D] dark:from-[#1E293B] dark:to-[#1D294D] dark:border-[#C9BBFF]/30 dark:text-[#C9BBFF]",
    };
  }
  if (text.includes("javascript") || text.includes("typescript") || text.includes("logic") || text.includes("async")) {
    return {
      label: "JS & TS Logic",
      detail: "Turn user actions and data into living behavior.",
      icon: Braces,
      mark: "ƒ()",
      accent: "butter",
      cardBorder: "hover:border-[#D97706]/50",
      bannerTone: "from-[#FFFDF7] via-[#FEF3C7] to-[#FFE08A]/60 border-[#FFE08A] text-[#0E1B3D] dark:from-[#451A03]/60 dark:to-[#78350F]/40 dark:border-[#FFE08A]/30 dark:text-[#FFE08A]",
    };
  }
  return {
    label: "React & Systems",
    detail: "Compose scalable components and real applications.",
    icon: Layers,
    mark: "⚛",
    accent: "lilac",
    cardBorder: "hover:border-[#6D28D9]/50",
    bannerTone: "from-[#F8F7FF] via-[#EDE9FE] to-[#DDD6FE]/60 border-[#C9BBFF] text-[#0E1B3D] dark:from-[#2E1065]/60 dark:to-[#4C1D95]/40 dark:border-[#C9BBFF]/30 dark:text-[#DDD6FE]",
  };
}

function ModulesRoute() {
  const { categories, learningPaths, modules, filter, setFilter, resetFilter, activeFiltersCount } =
    useCurriculum();
  const { lessonsCompleted } = useProgress();

  return (
    <div className="space-y-8 pb-12">
      {/* Studio Breadcrumb Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E5DFD3] bg-white/85 px-4 py-2.5 text-xs font-mono text-[#4A5578] shadow-xs dark:border-white/10 dark:bg-[#131E3A] dark:text-[#CBD5F0]">
        <div className="flex flex-wrap items-center gap-2">
          <GraduationCap className="h-4 w-4 text-[#4F6BFF]" />
          <Link to="/learn" className="hover:text-[#0E1B3D] hover:underline dark:hover:text-white">
            Learning Path
          </Link>
          <span aria-hidden="true">·</span>
          <span className="font-bold text-[#4F6BFF] dark:text-[#8DA2FF]">Modules ({modules.length})</span>
          <span aria-hidden="true">·</span>
          <Link to="/learn/topics" className="hover:text-[#0E1B3D] hover:underline dark:hover:text-white">
            Topics
          </Link>
          <span aria-hidden="true">·</span>
          <Link to="/learn/lessons" className="hover:text-[#0E1B3D] hover:underline dark:hover:text-white">
            Lessons
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/learn/topics"
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-[#E5DFD3] bg-[#FFFDF9] px-3.5 py-1 font-sans text-xs font-bold text-[#0E1B3D] transition-colors hover:border-[#4F6BFF] hover:text-[#4F6BFF] dark:border-white/15 dark:bg-[#0B1226] dark:text-white"
          >
            <FolderTree className="h-3.5 w-3.5 text-[#4F6BFF]" />
            <span>Explore Topics</span>
          </Link>
          <Link
            to="/learn/lessons"
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-[#E5DFD3] bg-[#FFFDF9] px-3.5 py-1 font-sans text-xs font-bold text-[#0E1B3D] transition-colors hover:border-[#4F6BFF] hover:text-[#4F6BFF] dark:border-white/15 dark:bg-[#0B1226] dark:text-white"
          >
            <BookOpen className="h-3.5 w-3.5 text-[#4F6BFF]" />
            <span>Lesson Catalog</span>
          </Link>
        </div>
      </div>

      {/* Creative Atelier Modules Hero matching Landing Page aesthetic */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-[28px] sm:rounded-[34px] border border-[#E5DFD3] bg-gradient-to-br from-[#FFFDF9] via-[#F5F7FF] to-[#E8EEFF] p-5 sm:p-8 lg:p-10 shadow-[0_20px_50px_-18px_rgba(14,27,61,0.09)] dark:border-white/10 dark:from-[#0F1830] dark:via-[#131E3A] dark:to-[#1D294D]"
      >
        <div className="relative z-10 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
          <div className="space-y-3 lg:col-span-8">
            <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#4F6BFF] dark:text-[#8DA2FF]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Creative Atelier Curriculum · 17 Studio Modules</span>
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#0E1B3D] sm:text-4xl dark:text-white">
              Master Frontend Craft,{" "}
              <span className="text-[#4F6BFF] dark:text-[#8DA2FF]">One Studio Module at a Time.</span>
            </h1>
            <p className="max-w-2xl text-sm sm:text-base leading-relaxed text-[#4A5578] dark:text-[#CBD5F0]">
              Every module pairs interactive visual studios, hands-on code sandboxes, and real-world
              engineering mental models. Choose a domain below to unfold its chapters and lessons.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <HandwrittenCallout rotation="-rotate-2" className="text-xl sm:text-2xl text-[#1E3A8A] dark:text-[#FFE08A]">
                Pick any module to start experimenting!
              </HandwrittenCallout>
              <CurvedDoodleArrow variant="coral-up-right" className="h-8 w-10" />
            </div>
          </div>

          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="flex items-center justify-center lg:col-span-4"
          >
            <StudioDesk3DCluster className="h-36 sm:h-44 w-full max-w-[240px]" />
          </motion.div>
        </div>
      </motion.section>

      <CurriculumFilterBar
        query={filter.query || ""}
        onQueryChange={(q) => setFilter({ query: q })}
        categoryId={filter.categoryId || "all"}
        onCategoryChange={(catId) => setFilter({ categoryId: catId })}
        difficulty={filter.difficulty || "All"}
        onDifficultyChange={(diff) => setFilter({ difficulty: diff })}
        pathId={filter.pathId || "all"}
        onPathChange={(pId) => setFilter({ pathId: pId })}
        categories={categories}
        learningPaths={learningPaths}
        activeCount={activeFiltersCount}
        onReset={resetFilter}
      />

      {modules.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m, idx) => {
            const category = categories.find((c) => c.id === m.categoryId);
            const moduleProgressPercent = getModuleProgress(m.id, lessonsCompleted);
            const visual = getModuleVisual(m.title, m.description, m.tags || []);
            const VisualIcon = visual.icon;

            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.04, 0.35), duration: 0.35 }}
                whileHover={{ y: -5 }}
                className="h-full"
              >
                <div
                  className={`group flex h-full flex-col justify-between overflow-hidden rounded-[26px] border border-[#E5DFD3] bg-white p-5 sm:p-6 shadow-[0_14px_34px_-12px_rgba(14,27,61,0.07)] transition-all duration-200 ${visual.cardBorder} dark:border-white/10 dark:bg-[#131E3A]`}
                >
                  <div>
                    {/* Top 3D Illustrated Banner */}
                    <div
                      className={`mb-4 flex items-center justify-between gap-3 rounded-2xl border bg-gradient-to-br p-3.5 ${visual.bannerTone}`}
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider">
                          <VisualIcon className="h-3.5 w-3.5 shrink-0" />
                          <span>{visual.label}</span>
                        </div>
                        <p className="text-xs leading-snug opacity-85">{visual.detail}</p>
                      </div>
                      <div className="w-24 shrink-0">
                        <ChapterFolio3DArt
                          accent={visual.accent}
                          className="h-16 w-full transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap text-xs text-[#4A5578] dark:text-[#CBD5F0]">
                          <DifficultyBadge difficulty={m.difficulty} />
                          {category && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono text-[11px]">{category.name}</span>
                            </>
                          )}
                        </div>
                        <h2 className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-[#0E1B3D] group-hover:text-[#4F6BFF] transition-colors dark:text-white dark:group-hover:text-[#8DA2FF]">
                          {m.title}
                        </h2>
                      </div>
                      <div className="shrink-0">
                        <ProgressRing value={moduleProgressPercent / 100} size={46} />
                      </div>
                    </div>

                    <p className="mt-2.5 text-xs sm:text-sm text-[#4A5578] leading-relaxed dark:text-[#CBD5F0]">
                      {m.description}
                    </p>
                  </div>

                  <div className="mt-5 space-y-3.5 border-t border-[#E5DFD3]/70 pt-3.5 dark:border-white/10">
                    <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-[#4A5578] tabular-nums dark:text-[#94A3C9]">
                      <span className="inline-flex items-center gap-1.5">
                        <FolderTree className="h-3.5 w-3.5 text-[#4F6BFF]" />
                        {m.topicCount} Chapters
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-[#0F7656] dark:text-[#A7E3D1]" />
                        {m.lessonCount} Lessons
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-[#D97706] dark:text-[#FFE08A]" />~
                        {m.estimatedHours}h
                      </span>
                    </div>

                    {(m.tags || []).length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-[#7B86A6] dark:text-[#94A3C9]">
                        {(m.tags || []).slice(0, 4).map((t, i) => (
                          <span key={t}>
                            {i > 0 && <span className="mr-1.5">·</span>}
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}

                    <Link
                      to="/learn/modules/$moduleId"
                      params={{ moduleId: m.id }}
                      className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl bg-[#4F6BFF] px-4 py-2.5 font-display text-xs sm:text-sm font-extrabold text-white shadow-[0_10px_22px_-6px_rgba(79,107,255,0.45)] transition-all hover:bg-[#3B53D9]"
                    >
                      <span>Open Module Studio</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No modules found"
          description="No modules matched your current filter setup."
          action={
            <Button onClick={resetFilter} variant="outline">
              Reset filters
            </Button>
          }
        />
      )}
    </div>
  );
}

