import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import {
  ChapterFolio3DArt,
  CurvedDoodleArrow,
  HandwrittenCallout,
} from "./forge-buddy-illos";
import { UnfoldedBlueprintTrail } from "./unfolded-blueprint-trail";
import type {
  AtelierChapterFolio,
  AtelierChapterId,
  AtelierChapterModule,
} from "@/lib/curriculum/atelier-chapters";
import { cn } from "@/lib/utils";

interface LearningPathFoliosProps {
  folios: AtelierChapterFolio[];
  selectedChapterId: AtelierChapterId;
  onSelectChapter: (chapterId: AtelierChapterId) => void;
  selectedModuleId: string;
  onSelectModule: (moduleId: string) => void;
  activeLessonId?: string;
  activeChapterId: AtelierChapterId;
  activeModuleId: string;
  onReturnToActiveLesson: () => void;
}

export function LearningPathFolios({
  folios,
  selectedChapterId,
  onSelectChapter,
  selectedModuleId,
  onSelectModule,
  activeLessonId,
  activeChapterId,
  activeModuleId,
  onReturnToActiveLesson,
}: LearningPathFoliosProps) {
  const selectedFolio =
    folios.find((f) => f.id === selectedChapterId) ?? folios[0];

  const selectedModule: AtelierChapterModule =
    selectedFolio?.modules.find((m) => m.id === selectedModuleId) ??
    selectedFolio?.modules[0];

  const isExploringDifferentChapterOrModule =
    selectedChapterId !== activeChapterId || selectedModule?.id !== activeModuleId;

  return (
    <section aria-label="Your Learning Path" className="space-y-6">
      {/* Section Header matching Panel 5 ("Your Learning Path" + handwritten "You're building something amazing!") */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-[#4F6BFF] dark:text-[#8DA2FF]">
            4 Studio Chapters · 17 Modules
          </div>
          <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-[#0E1B3D] sm:text-3xl dark:text-white">
            Your Learning Path
          </h2>
          <p className="mt-0.5 text-sm text-[#4A5578] dark:text-[#CBD5F0]">
            Click any chapter folio below to unfold its interactive modules and lessons.
          </p>
        </div>

        {/* Handwritten Doodle Callout from Panel 5 right side */}
        <div className="flex items-center gap-2 self-start sm:self-end">
          <HandwrittenCallout rotation="-rotate-3" className="text-xl sm:text-2xl">
            You&apos;re building something amazing!
          </HandwrittenCallout>
          <CurvedDoodleArrow variant="coral-up-right" className="h-8 w-10" />
        </div>
      </div>

      {/* 4 Dimensional Chapter Folios Grid (matching Panel 5 "Your Learning Path" & Panel 8 "Course Cards") */}
      {/* Vertical stack on mobile (320-390px), 2x2 on tablet, 4 columns on desktop */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {folios.map((folio) => {
          const isSelected = folio.id === selectedChapterId;
          const isCurrentChapter = folio.id === activeChapterId;
          const isCompletedChapter = folio.status === "completed";

          // Style each card like Panel 5:
          // - Mint card for HTML Basics
          // - Vibrant Cobalt/Purple gradient card for CSS Magic (Panel 5 & Panel 8 highlight)
          // - Warm Butter/Lavender card for JavaScript Adventure
          // - Soft Lilac/Periwinkle card for Build Real Projects
          const isCobaltCard = folio.accent === "cobalt";
          const isMintCard = folio.accent === "mint";
          const isButterCard = folio.accent === "butter";

          return (
            <button
              key={folio.id}
              type="button"
              onClick={() => onSelectChapter(folio.id)}
              aria-pressed={isSelected}
              className={cn(
                "group relative flex min-h-[270px] flex-col justify-between overflow-hidden rounded-[26px] p-5 text-left transition-all duration-300 cursor-pointer",
                isCobaltCard
                  ? "bg-gradient-to-br from-[#4F6BFF] via-[#5E60CE] to-[#6930C3] text-white shadow-[0_20px_40px_-14px_rgba(79,107,255,0.55)]"
                  : isMintCard
                    ? "border border-[#A7E3D1] bg-gradient-to-br from-[#E6FBF2] via-[#D1FAE5] to-[#A7E3D1]/70 text-[#0E1B3D] shadow-[0_14px_32px_-12px_rgba(15,118,86,0.14)] dark:border-[#A7E3D1]/30 dark:from-[#064E3B] dark:to-[#0F7656]/50 dark:text-white"
                    : isButterCard
                      ? "border border-[#FFE08A] bg-gradient-to-br from-[#FFFDF7] via-[#FEF3C7] to-[#FDE68A]/55 text-[#0E1B3D] shadow-[0_14px_32px_-12px_rgba(217,119,6,0.12)] dark:border-[#FFE08A]/30 dark:from-[#451A03] dark:to-[#78350F]/45 dark:text-white"
                      : "border border-[#C9BBFF] bg-gradient-to-br from-[#F8F7FF] via-[#EDE9FE] to-[#DDD6FE]/65 text-[#0E1B3D] shadow-[0_14px_32px_-12px_rgba(109,40,217,0.12)] dark:border-[#C9BBFF]/30 dark:from-[#2E1065] dark:to-[#4C1D95]/45 dark:text-white",
                isSelected &&
                  "ring-4 ring-[#4F6BFF]/35 -translate-y-1",
              )}
            >
              {/* Top 3D Illustration Showcase */}
              <div className="w-full">
                <div className="mb-2 flex items-center justify-between">
                  <span
                    className={cn(
                      "font-mono text-xs font-extrabold",
                      isCobaltCard ? "text-white/85" : "text-[#4A5578] dark:text-white/80",
                    )}
                  >
                    Chapter {folio.numberLabel}
                  </span>
                  <span
                    className={cn(
                      "font-mono text-xs font-bold tabular-nums",
                      isCobaltCard ? "text-[#FFE08A]" : "text-[#0E1B3D] dark:text-white",
                    )}
                  >
                    {folio.completedLessonsCount}/{folio.totalAuthoredLessonsCount} lessons
                  </span>
                </div>

                <ChapterFolio3DArt
                  accent={folio.accent}
                  className="transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Middle Title & Metadata (matching Panel 8 "CSS Magic · 12 lessons · 2h") */}
              <div className="mt-3 space-y-1">
                <h3
                  className={cn(
                    "font-display text-xl font-extrabold tracking-tight",
                    isCobaltCard ? "text-white" : "text-[#0E1B3D] dark:text-white",
                  )}
                >
                  {folio.shortTitle}
                </h3>
                <p
                  className={cn(
                    "line-clamp-2 text-xs leading-relaxed",
                    isCobaltCard ? "text-white/85" : "text-[#4A5578] dark:text-white/80",
                  )}
                >
                  {folio.title} · {folio.estimatedHours}h
                </p>
              </div>

              {/* Bottom Status Row matching Panel 5 ("Completed ✓" / "Current" / "Explore") */}
              <div className="mt-4 flex items-center justify-between pt-2">
                {isCompletedChapter ? (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 text-xs font-extrabold",
                      isCobaltCard ? "text-[#A7E3D1]" : "text-[#0F7656] dark:text-[#A7E3D1]",
                    )}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Completed</span>
                  </span>
                ) : isCurrentChapter ? (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold",
                      isCobaltCard
                        ? "bg-white text-[#4F6BFF]"
                        : "bg-[#4F6BFF] text-white",
                    )}
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Current</span>
                  </span>
                ) : (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 text-xs font-bold",
                      isCobaltCard ? "text-white/90" : "text-[#0E1B3D] dark:text-white",
                    )}
                  >
                    <span>Explore {folio.modules.length} Modules</span>
                  </span>
                )}

                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full transition-transform group-hover:translate-x-0.5",
                    isCobaltCard
                      ? "bg-white/20 text-white"
                      : "bg-white/85 text-[#0E1B3D] shadow-xs dark:bg-white/15 dark:text-white",
                  )}
                >
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Unfolded Living Blueprint Trail for the Selected Chapter Folio */}
      {selectedFolio && selectedModule && (
        <UnfoldedBlueprintTrail
          selectedFolio={selectedFolio}
          selectedModule={selectedModule}
          onSelectModule={onSelectModule}
          activeLessonId={activeLessonId}
          isExploringDifferentChapterOrModule={isExploringDifferentChapterOrModule}
          onReturnToActiveLesson={onReturnToActiveLesson}
        />
      )}

      {/* Footer Link to Full Curriculum Map */}
      <div className="flex justify-end">
        <Link
          to="/learn/modules"
          className="inline-flex min-h-[40px] items-center gap-1.5 text-xs font-bold text-[#4F6BFF] hover:underline dark:text-[#8DA2FF]"
        >
          <span>View Full 17-Module Curriculum Directory</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}
