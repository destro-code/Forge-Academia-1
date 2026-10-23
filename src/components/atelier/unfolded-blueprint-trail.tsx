import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
  Play,
  RotateCcw,
} from "lucide-react";
import type {
  AtelierChapterFolio,
  AtelierChapterModule,
} from "@/lib/curriculum/atelier-chapters";
import { cn } from "@/lib/utils";

interface UnfoldedBlueprintTrailProps {
  selectedFolio: AtelierChapterFolio;
  selectedModule: AtelierChapterModule;
  onSelectModule: (moduleId: string) => void;
  activeLessonId?: string;
  isExploringDifferentChapterOrModule: boolean;
  onReturnToActiveLesson: () => void;
}

const ACCENT_STYLES: Record<
  AtelierChapterFolio["accent"],
  {
    headerBadge: string;
    activeTab: string;
    activeNodeBorder: string;
    activeButton: string;
  }
> = {
  mint: {
    headerBadge: "bg-[#E8F8F2] text-[#0F7656] border-[#A7E3D1]",
    activeTab: "bg-[#0F7656] text-white border-[#0F7656]",
    activeNodeBorder: "border-[#0F7656] bg-[#E8F8F2]/60 dark:bg-[#0F7656]/20",
    activeButton: "bg-[#0F7656] hover:bg-[#0B5C43] text-white",
  },
  cobalt: {
    headerBadge: "bg-[#EEF2FF] text-[#4F6BFF] border-[#C9BBFF]",
    activeTab: "bg-[#4F6BFF] text-white border-[#4F6BFF]",
    activeNodeBorder: "border-[#4F6BFF] bg-[#EEF2FF]/70 dark:bg-[#4F6BFF]/20",
    activeButton: "bg-[#4F6BFF] hover:bg-[#3B53D9] text-white",
  },
  butter: {
    headerBadge: "bg-[#FFFBEB] text-[#92400E] border-[#FFE08A]",
    activeTab: "bg-[#D97706] text-white border-[#D97706]",
    activeNodeBorder: "border-[#F59E0B] bg-[#FFFBEB]/80 dark:bg-[#F59E0B]/15",
    activeButton: "bg-[#0E1B3D] hover:bg-[#1E3A8A] text-white",
  },
  lilac: {
    headerBadge: "bg-[#F5F3FF] text-[#6D28D9] border-[#C9BBFF]",
    activeTab: "bg-[#6D28D9] text-white border-[#6D28D9]",
    activeNodeBorder: "border-[#7C3AED] bg-[#F5F3FF]/80 dark:bg-[#7C3AED]/20",
    activeButton: "bg-[#6D28D9] hover:bg-[#5B21B6] text-white",
  },
};

export function UnfoldedBlueprintTrail({
  selectedFolio,
  selectedModule,
  onSelectModule,
  activeLessonId,
  isExploringDifferentChapterOrModule,
  onReturnToActiveLesson,
}: UnfoldedBlueprintTrailProps) {
  const accentStyle = ACCENT_STYLES[selectedFolio.accent];

  return (
    <div className="rounded-[28px] border border-[#E5DFD3] bg-white p-5 sm:p-7 shadow-[0_18px_45px_-15px_rgba(14,27,61,0.08)] dark:border-white/10 dark:bg-[#131E3A]">
      {/* Track Header & Actions */}
      <div className="flex flex-col gap-4 border-b border-[#F4EFE6] pb-5 lg:flex-row lg:items-center lg:justify-between dark:border-white/10">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#4F6BFF] dark:text-[#8DA2FF]">
            <span>Track {selectedFolio.numberLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{selectedFolio.modules.length} Modules in {selectedFolio.shortTitle}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">
              {selectedFolio.completedLessonsCount}/{selectedFolio.totalAuthoredLessonsCount} Lessons Completed
            </span>
          </div>
          <h3 className="mt-1 font-display text-xl font-extrabold tracking-tight text-[#0E1B3D] sm:text-2xl dark:text-white">
            Modules in {selectedFolio.shortTitle} ({selectedFolio.title})
          </h3>
          <p className="mt-0.5 text-sm text-[#4A5578] dark:text-[#CBD5F0]">
            {selectedFolio.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isExploringDifferentChapterOrModule && (
            <button
              type="button"
              onClick={onReturnToActiveLesson}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-2xl border border-[#4F6BFF]/40 bg-[#EEF2FF] px-4 py-2 text-xs font-bold text-[#4F6BFF] transition-all hover:bg-[#4F6BFF] hover:text-white dark:bg-[#1D294D] dark:text-[#8DA2FF]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Return to Active Lesson</span>
            </button>
          )}
          <Link
            to="/learn/modules"
            search={{ track: selectedFolio.id }}
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-2xl border border-[#E5DFD3] bg-[#FFFDF9] px-4 py-2 text-xs font-bold text-[#0E1B3D] transition-all hover:border-[#4F6BFF] hover:text-[#4F6BFF] dark:border-white/15 dark:bg-[#0B1226] dark:text-white"
          >
            <span>Open {selectedFolio.shortTitle} in Modules Catalog</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Modules Currently Present Under This Track (Clickable Module Cards) */}
      <div className="mt-5">
        <div className="mb-3 flex items-center justify-between text-xs font-semibold text-[#4A5578] dark:text-[#94A3C9]">
          <span className="inline-flex items-center gap-1.5">
            <Compass className="h-3.5 w-3.5 text-[#4F6BFF]" />
            <span>
              {selectedFolio.modules.length} Modules under {selectedFolio.shortTitle} — click any module to inspect its lessons or open it directly:
            </span>
          </span>
        </div>

        <div
          role="tablist"
          aria-label={`${selectedFolio.shortTitle} Modules`}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {selectedFolio.modules.map((mod, idx) => {
            const isSelected = mod.id === selectedModule.id;
            const firstLessonId = mod.authoredLessons[0]?.id;
            return (
              <div
                key={mod.id}
                role="tab"
                tabIndex={0}
                aria-selected={isSelected}
                onClick={() => onSelectModule(mod.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectModule(mod.id);
                  }
                }}
                className={cn(
                  "group flex flex-col justify-between rounded-2xl border p-4 text-left transition-all cursor-pointer",
                  isSelected
                    ? cn(
                        "border-2 shadow-[0_12px_28px_-10px_rgba(79,107,255,0.28)]",
                        accentStyle.activeNodeBorder,
                      )
                    : "border-[#E5DFD3] bg-[#FFFDF9] hover:border-[#4F6BFF] dark:border-white/15 dark:bg-[#0B1226]",
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-lg border px-2 py-0.5 font-mono text-[11px] font-bold",
                        accentStyle.headerBadge,
                      )}
                    >
                      Module {idx + 1}
                    </span>
                    <span className="font-mono text-xs font-bold text-[#4A5578] dark:text-[#CBD5F0]">
                      {mod.completedCount}/{mod.totalAuthoredCount} lessons
                    </span>
                  </div>

                  <h4 className="mt-2.5 font-display text-base font-extrabold text-[#0E1B3D] dark:text-white">
                    {mod.title}
                  </h4>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#4A5578] dark:text-[#94A3C9]">
                    {mod.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#E5DFD3]/60 pt-3 dark:border-white/10">
                  <span
                    className={cn(
                      "text-[11px] font-extrabold",
                      isSelected
                        ? "text-[#4F6BFF] dark:text-[#8DA2FF]"
                        : "text-[#4A5578] group-hover:text-[#0E1B3D] dark:text-[#94A3C9] dark:group-hover:text-white",
                    )}
                  >
                    {isSelected ? "Showing lessons below ↓" : "Show lessons"}
                  </span>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <Link
                      to="/learn/modules/$moduleId"
                      params={{ moduleId: mod.id }}
                      className="inline-flex min-h-[32px] items-center gap-1 rounded-xl border border-[#E5DFD3] bg-white px-2.5 py-1 text-[11px] font-bold text-[#0E1B3D] transition-colors hover:border-[#4F6BFF] hover:text-[#4F6BFF] dark:border-white/15 dark:bg-[#131E3A] dark:text-white"
                    >
                      <span>Open Module</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                    {firstLessonId && (
                      <Link
                        to="/lesson/$lessonId"
                        params={{ lessonId: firstLessonId }}
                        className={cn(
                          "inline-flex min-h-[32px] items-center gap-1 rounded-xl px-2.5 py-1 text-[11px] font-bold transition-colors",
                          accentStyle.activeButton,
                        )}
                      >
                        <Play className="h-2.5 w-2.5 fill-current" />
                        <span>Start</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Module Stepping-Stone Lesson Trail (Vertical timeline on mobile, multi-col stepping stones on desktop) */}
      <div className="mt-6 border-t border-[#F4EFE6] pt-5 dark:border-white/10">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#4F6BFF] dark:text-[#8DA2FF]">
              Lessons inside {selectedModule.title}
            </div>
            <h4 className="font-display text-base font-extrabold text-[#0E1B3D] dark:text-white">
              {selectedModule.title} ({selectedModule.completedCount}/{selectedModule.totalAuthoredCount} completed)
            </h4>
          </div>
          <Link
            to="/learn/modules/$moduleId"
            params={{ moduleId: selectedModule.id }}
            className="inline-flex min-h-[38px] items-center gap-1 text-xs font-bold text-[#4F6BFF] hover:underline dark:text-[#8DA2FF]"
          >
            <span>Open Full Module Page</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Stepping Stones Grid / Vertical Mobile Timeline */}
        <div className="relative grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {selectedModule.authoredLessons.map((lesson, idx) => {
            const isCompleted = lesson.status === "completed";
            const isCurrent =
              lesson.id === activeLessonId || lesson.status === "active";

            return (
              <Link
                key={lesson.id}
                to="/lesson/$lessonId"
                params={{ lessonId: lesson.id }}
                className={cn(
                  "group relative flex min-h-[76px] items-center justify-between gap-3 rounded-2xl border p-4 transition-all hover:-translate-y-0.5",
                  isCurrent
                    ? cn(
                        "border-2 shadow-[0_12px_28px_-8px_rgba(79,107,255,0.28)]",
                        accentStyle.activeNodeBorder,
                      )
                    : isCompleted
                      ? "border-[#A7E3D1] bg-[#E8F8F2]/40 hover:border-[#0F7656] dark:border-[#A7E3D1]/30 dark:bg-[#0F7656]/10"
                      : "border-[#E5DFD3] bg-[#FFFDF9] hover:border-[#4F6BFF] dark:border-white/10 dark:bg-[#0B1226]",
                )}
              >
                <div className="flex items-start gap-3 min-w-0">
                  {/* Step Number / Status Circle */}
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-extrabold transition-transform group-hover:scale-105",
                      isCompleted
                        ? "bg-[#0F7656] text-white"
                        : isCurrent
                          ? "bg-[#4F6BFF] text-white shadow-[0_4px_12px_rgba(79,107,255,0.4)]"
                          : "border border-[#E5DFD3] bg-white text-[#4A5578] dark:border-white/15 dark:bg-[#131E3A] dark:text-[#CBD5F0]",
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : isCurrent ? (
                      <Play className="h-3.5 w-3.5 fill-current" />
                    ) : (
                      <span>{String(idx + 1).padStart(2, "0")}</span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#7B86A6] dark:text-[#94A3C9]">
                      <span>Lesson {idx + 1}</span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {lesson.estimatedMinutes}m
                      </span>
                      {isCurrent && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-bold text-[#4F6BFF] dark:text-[#8DA2FF]">
                            Current
                          </span>
                        </>
                      )}
                    </div>
                    <div className="mt-0.5 truncate font-display text-sm font-bold text-[#0E1B3D] group-hover:text-[#4F6BFF] dark:text-white dark:group-hover:text-[#8DA2FF]">
                      {lesson.title}
                    </div>
                  </div>
                </div>

                <ArrowRight className="h-4 w-4 shrink-0 text-[#7B86A6] transition-transform group-hover:translate-x-1 group-hover:text-[#4F6BFF]" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
