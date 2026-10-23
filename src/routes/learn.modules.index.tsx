import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { DifficultyBadge } from "@/components/shared/difficulty-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  CurvedDoodleArrow,
  HandwrittenCallout,
  StudioDesk3DCluster,
} from "@/components/atelier/forge-buddy-illos";
import { useModules } from "@/lib/hooks/use-content";
import { useProgress } from "@/lib/hooks/use-progress";
import { canonicalManifest } from "@/lib/curriculum/manifest";
import {
  ATELIER_CHAPTER_DEFINITIONS,
  findChapterIdForModule,
  type AtelierChapterId,
  type AtelierChapterAccent,
} from "@/lib/curriculum/atelier-chapters";
import type { Difficulty } from "@/lib/types";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";

type ModulesSearch = {
  track?: AtelierChapterId;
};

const VALID_TRACK_IDS = new Set<AtelierChapterId>(
  ATELIER_CHAPTER_DEFINITIONS.map((d) => d.id),
);

export const Route = createFileRoute("/learn/modules/")({
  validateSearch: (search: Record<string, unknown>): ModulesSearch => {
    const rawTrack = typeof search.track === "string" ? search.track : undefined;
    return {
      track:
        rawTrack && VALID_TRACK_IDS.has(rawTrack as AtelierChapterId)
          ? (rawTrack as AtelierChapterId)
          : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "17 Modules · 4 Learning Tracks · Forge Academia" },
      {
        name: "description",
        content:
          "Browse all 17 interactive frontend engineering modules organized across 4 clear learning tracks.",
      },
      { property: "og:title", content: "17 Modules · 4 Learning Tracks · Forge Academia" },
      { property: "og:description", content: "4 Tracks, 17 Modules, 139 Interactive Lessons." },
    ],
  }),
  component: ModulesRoute,
});

const DIFFICULTIES: readonly ("All" | Difficulty)[] = [
  "All",
  "Beginner",
  "Intermediate",
  "Advanced",
];

const TRACK_ACCENT_STYLES: Record<
  AtelierChapterAccent,
  {
    badge: string;
    cardHoverBorder: string;
    numberBadge: string;
    progressBar: string;
  }
> = {
  mint: {
    badge:
      "border-[#A7E3D1] bg-[#E8F8F2] text-[#0F7656] dark:border-[#A7E3D1]/30 dark:bg-[#0F7656]/20 dark:text-[#A7E3D1]",
    cardHoverBorder: "hover:border-[#0F7656]/60",
    numberBadge: "bg-[#E8F8F2] text-[#0F7656] dark:bg-[#0F7656]/25 dark:text-[#A7E3D1]",
    progressBar: "from-[#0F7656] to-[#A7E3D1]",
  },
  cobalt: {
    badge:
      "border-[#C9BBFF] bg-[#EEF2FF] text-[#4F6BFF] dark:border-[#C9BBFF]/30 dark:bg-[#1D294D] dark:text-[#8DA2FF]",
    cardHoverBorder: "hover:border-[#4F6BFF]/65",
    numberBadge: "bg-[#EEF2FF] text-[#4F6BFF] dark:bg-[#1D294D] dark:text-[#8DA2FF]",
    progressBar: "from-[#4F6BFF] to-[#7B91FF]",
  },
  butter: {
    badge:
      "border-[#FFE08A] bg-[#FFFBEB] text-[#92400E] dark:border-[#FFE08A]/30 dark:bg-[#78350F]/30 dark:text-[#FFE08A]",
    cardHoverBorder: "hover:border-[#D97706]/60",
    numberBadge: "bg-[#FFFBEB] text-[#92400E] dark:bg-[#78350F]/30 dark:text-[#FFE08A]",
    progressBar: "from-[#D97706] to-[#FBBF24]",
  },
  lilac: {
    badge:
      "border-[#C9BBFF] bg-[#F5F3FF] text-[#6D28D9] dark:border-[#C9BBFF]/30 dark:bg-[#4C1D95]/30 dark:text-[#DDD6FE]",
    cardHoverBorder: "hover:border-[#6D28D9]/60",
    numberBadge: "bg-[#F5F3FF] text-[#6D28D9] dark:bg-[#4C1D95]/30 dark:text-[#DDD6FE]",
    progressBar: "from-[#6D28D9] to-[#A78BFA]",
  },
};

function ModulesRoute() {
  const allModules = useModules();
  const { lessonsCompleted } = useProgress();
  const { track: initialTrack } = Route.useSearch();

  const [selectedTrackId, setSelectedTrackId] = useState<"all" | AtelierChapterId>(
    initialTrack ?? "all",
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<"All" | Difficulty>("All");

  const completedSet = useMemo(() => new Set(lessonsCompleted), [lessonsCompleted]);

  const enrichedModules = useMemo(() => {
    return allModules.map((mod, idx) => {
      const trackId = findChapterIdForModule(mod.id);
      const trackDef =
        ATELIER_CHAPTER_DEFINITIONS.find((t) => t.id === trackId) ??
        ATELIER_CHAPTER_DEFINITIONS[0];
      const authoredLessons = canonicalManifest.getAuthoredLessonsForModule(mod.id);
      const totalLessons = authoredLessons.length;
      const completedLessons = authoredLessons.filter((l) =>
        completedSet.has(l.lessonId),
      ).length;
      const progressPercent =
        totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return {
        ...mod,
        moduleNumber: String(mod.order ?? idx + 1).padStart(2, "0"),
        trackId,
        trackDef,
        totalLessons,
        completedLessons,
        progressPercent,
      };
    });
  }, [allModules, completedSet]);

  const filteredModules = useMemo(() => {
    return enrichedModules.filter((m) => {
      if (selectedTrackId !== "all" && m.trackId !== selectedTrackId) return false;
      if (selectedDifficulty !== "All" && m.difficulty !== selectedDifficulty) return false;
      return true;
    });
  }, [enrichedModules, selectedTrackId, selectedDifficulty]);

  const resetFilters = () => {
    setSelectedTrackId("all");
    setSelectedDifficulty("All");
  };

  return (
    <div className="space-y-8 pb-12 w-full min-w-0">
      {/* Creative Atelier Modules Hero */}
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
              <span>4 Learning Tracks · 17 Modules · 139 Interactive Lessons</span>
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#0E1B3D] sm:text-4xl dark:text-white">
              Master Frontend Craft,{" "}
              <span className="text-[#4F6BFF] dark:text-[#8DA2FF]">
                One Module at a Time.
              </span>
            </h1>
            <p className="max-w-2xl text-sm sm:text-base leading-relaxed text-[#4A5578] dark:text-[#CBD5F0]">
              Our curriculum is organized into 4 progressive tracks—from HTML &amp; Web Foundations
              to production React &amp; State Architecture. Pick a track below or jump into any
              module.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <HandwrittenCallout
                rotation="-rotate-2"
                className="text-xl sm:text-2xl text-[#1E3A8A] dark:text-[#FFE08A]"
              >
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

      {/* Unified 4-Track & Difficulty Filter Bar (Zero Duplicate Search Bar) */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#E5DFD3] bg-white p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between dark:border-white/10 dark:bg-[#131E3A]">
        {/* 4 Learning Track Filter Pills */}
        <div
          role="tablist"
          aria-label="Filter modules by learning track"
          className="flex flex-wrap items-center gap-1.5"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedTrackId === "all"}
            onClick={() => setSelectedTrackId("all")}
            className={`min-h-[38px] rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
              selectedTrackId === "all"
                ? "bg-[#4F6BFF] text-white shadow-xs"
                : "bg-[#F4EFE6] text-[#4A5578] hover:text-[#0E1B3D] dark:bg-[#0B1226] dark:text-[#CBD5F0]"
            }`}
          >
            All 17 Modules
          </button>

          {ATELIER_CHAPTER_DEFINITIONS.map((track) => {
            const active = selectedTrackId === track.id;
            return (
              <button
                key={track.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedTrackId(track.id)}
                className={`min-h-[38px] rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                  active
                    ? "bg-[#4F6BFF] text-white shadow-xs"
                    : "bg-[#F4EFE6] text-[#4A5578] hover:text-[#0E1B3D] dark:bg-[#0B1226] dark:text-[#CBD5F0]"
                }`}
              >
                Track {track.numberLabel} · {track.shortTitle} ({track.moduleIds.length})
              </button>
            );
          })}
        </div>

        {/* Difficulty Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {DIFFICULTIES.map((diff) => {
            const active = selectedDifficulty === diff;
            return (
              <button
                key={diff}
                type="button"
                aria-pressed={active}
                onClick={() => setSelectedDifficulty(diff)}
                className={`min-h-[36px] rounded-full px-3 py-1 text-xs font-bold transition-all ${
                  active
                    ? "bg-[#0E1B3D] text-white dark:bg-[#FFE08A] dark:text-[#0E1B3D]"
                    : "border border-[#E5DFD3] bg-[#FFFDF9] text-[#4A5578] hover:border-[#4F6BFF] dark:border-white/15 dark:bg-[#0B1226] dark:text-[#CBD5F0]"
                }`}
              >
                {diff}
              </button>
            );
          })}
        </div>
      </div>

      {/* Focused 4-Element Module Cards (Module Title is the Hero) */}
      {filteredModules.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredModules.map((m, idx) => {
            const style = TRACK_ACCENT_STYLES[m.trackDef.accent];
            const isCompleted = m.totalLessons > 0 && m.completedLessons === m.totalLessons;
            const isStarted = m.completedLessons > 0;

            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.03, 0.25), duration: 0.3 }}
                whileHover={{ y: -4 }}
                className="h-full"
              >
                <Link
                  to="/learn/modules/$moduleId"
                  params={{ moduleId: m.id }}
                  className={`group flex h-full flex-col justify-between overflow-hidden rounded-[26px] border border-[#E5DFD3] bg-white p-5 sm:p-6 shadow-[0_14px_34px_-12px_rgba(14,27,61,0.07)] transition-all duration-200 ${style.cardHoverBorder} dark:border-white/10 dark:bg-[#131E3A]`}
                >
                  <div className="space-y-3.5">
                    {/* 1. Track Badge + Difficulty & Time Metadata */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-bold ${style.badge}`}
                      >
                        <span>Track {m.trackDef.numberLabel}</span>
                        <span aria-hidden="true">·</span>
                        <span>{m.trackDef.shortTitle}</span>
                      </span>

                      <div className="flex items-center gap-2 font-mono text-xs text-[#4A5578] dark:text-[#CBD5F0]">
                        <DifficultyBadge difficulty={m.difficulty} />
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3 text-[#D97706]" />~{m.estimatedHours}h
                        </span>
                      </div>
                    </div>

                    {/* 2. Hero Module Number & Title */}
                    <div className="flex items-start gap-3 pt-0.5">
                      <span
                        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-extrabold ${style.numberBadge}`}
                      >
                        {m.moduleNumber}
                      </span>
                      <div className="min-w-0">
                        <h2 className="font-display text-xl font-extrabold leading-snug tracking-tight text-[#0E1B3D] transition-colors group-hover:text-[#4F6BFF] dark:text-white dark:group-hover:text-[#8DA2FF]">
                          {m.title}
                        </h2>
                      </div>
                    </div>

                    {/* 3. Scannable 2-Line Description */}
                    <p className="line-clamp-2 text-xs sm:text-sm leading-relaxed text-[#4A5578] dark:text-[#CBD5F0]">
                      {m.description}
                    </p>
                  </div>

                  {/* 4. Progress Bar + Lesson Count + Clear CTA */}
                  <div className="mt-6 space-y-3.5 border-t border-[#E5DFD3]/70 pt-4 dark:border-white/10">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between font-mono text-xs text-[#4A5578] tabular-nums dark:text-[#94A3C9]">
                        <span className="inline-flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5 text-[#4F6BFF]" />
                          <span>
                            {m.completedLessons}/{m.totalLessons} lessons
                          </span>
                        </span>
                        <span className="font-bold text-[#0E1B3D] dark:text-white">
                          {m.progressPercent}%
                        </span>
                      </div>

                      <div className="h-2 w-full overflow-hidden rounded-full bg-[#E5DFD3]/70 dark:bg-white/10">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${style.progressBar} transition-all duration-500`}
                          style={{
                            width: `${Math.max(m.progressPercent, isStarted ? 6 : 2)}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-0.5">
                      <span className="font-mono text-[11px] text-[#7B86A6] dark:text-[#94A3C9]">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 font-bold text-[#0F7656] dark:text-[#A7E3D1]">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                          </span>
                        ) : isStarted ? (
                          "In progress"
                        ) : (
                          "Ready to start"
                        )}
                      </span>

                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#4F6BFF] px-4 py-2 font-display text-xs font-extrabold text-white shadow-xs transition-transform group-hover:translate-x-0.5 group-hover:bg-[#3B53D9]">
                        <span>
                          {isCompleted
                            ? "Review Module"
                            : isStarted
                              ? "Continue Module"
                              : "Start Module"}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No modules match these filters"
          description="Try selecting a different learning track or difficulty level."
          action={
            <Button onClick={resetFilters} variant="outline">
              Reset filters
            </Button>
          }
        />
      )}
    </div>
  );
}
