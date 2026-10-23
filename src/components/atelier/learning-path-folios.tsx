import { useRef } from "react";
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
  const unfoldedTrailRef = useRef<HTMLDivElement | null>(null);

  const selectedFolio =
    folios.find((f) => f.id === selectedChapterId) ?? folios[0];

  const selectedModule: AtelierChapterModule =
    selectedFolio?.modules.find((m) => m.id === selectedModuleId) ??
    selectedFolio?.modules[0];

  const isExploringDifferentChapterOrModule =
    selectedChapterId !== activeChapterId || selectedModule?.id !== activeModuleId;

  const handleTrackClick = (chapterId: AtelierChapterId) => {
    onSelectChapter(chapterId);
    // Smoothly scroll the unfolded modules panel into view so clicking HTML, CSS, JS, or React
    // immediately takes the user to that track's modules (especially on mobile/tablet).
    requestAnimationFrame(() => {
      unfoldedTrailRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });
  };

  return (
    <section aria-label="Your Learning Path" className="space-y-6">
      {/* Section Header matching Panel 5 ("Your Learning Path" + handwritten "You're building something amazing!") */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-[#4F6BFF] dark:text-[#8DA2FF]">
            4 Learning Tracks · 17 Modules · 139 Lessons
          </div>
          <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-[#0E1B3D] sm:text-3xl dark:text-white">
            Your Learning Path
          </h2>
          <p className="mt-0.5 text-sm text-[#4A5578] dark:text-[#CBD5F0]">
            Click any track—<strong>HTML</strong>, <strong>CSS</strong>,{" "}
            <strong>JavaScript</strong>, or <strong>React</strong>—to browse its modules and jump straight in.
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

      {/* Quick Domain Pill Bar for 1-Tap Track Switching */}
      <div
        role="tablist"
        aria-label="Choose a Learning Track"
        className="flex flex-wrap items-center gap-2"
      >
        {folios.map((folio) => {
          const isSelected = folio.id === selectedChapterId;
          return (
            <button
              key={`pill-${folio.id}`}
              role="tab"
              type="button"
              aria-selected={isSelected}
              onClick={() => handleTrackClick(folio.id)}
              className={cn(
                "inline-flex min-h-[40px] items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-extrabold transition-all cursor-pointer",
                isSelected
                  ? "border-[#4F6BFF] bg-[#4F6BFF] text-white shadow-[0_8px_20px_-6px_rgba(79,107,255,0.55)]"
                  : "border-[#E5DFD3] bg-white text-[#0E1B3D] hover:border-[#4F6BFF] dark:border-white/15 dark:bg-[#131E3A] dark:text-white",
              )}
            >
              <span className="font-mono opacity-80">{folio.numberLabel}</span>
              <span>{folio.shortTitle}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 font-mono text-[10px]",
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-[#F4EFE6] text-[#4A5578] dark:bg-white/10 dark:text-[#CBD5F0]",
                )}
              >
                {folio.modules.length} modules
              </span>
            </button>
          );
        })}
      </div>

      {/* 4 Dimensional Chapter Folios Grid (matching Panel 5 "Your Learning Path" & Panel 8 "Course Cards") */}
      {/* Vertical stack on mobile (320-390px), 2x2 on tablet, 4 columns on desktop */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {folios.map((folio) => {
          const isSelected = folio.id === selectedChapterId;
          const isCurrentChapter = folio.id === activeChapterId;
          const isCompletedChapter = folio.status === "completed";

          const isCobaltCard = folio.accent === "cobalt";
          const isMintCard = folio.accent === "mint";
          const isButterCard = folio.accent === "butter";

          return (
            <button
              key={folio.id}
              type="button"
              onClick={() => handleTrackClick(folio.id)}
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
                  "ring-4 ring-[#4F6BFF] -translate-y-1.5",
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
                    Track {folio.numberLabel} · {folio.modules.length} Modules
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

              {/* Middle Title & Metadata */}
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

              {/* Bottom Status Row */}
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
                ) : isSelected ? (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold",
                      isCobaltCard
                        ? "bg-white text-[#4F6BFF]"
                        : "bg-[#4F6BFF] text-white",
                    )}
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Viewing {folio.modules.length} Modules ↓</span>
                  </span>
                ) : isCurrentChapter ? (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold",
                      isCobaltCard
                        ? "bg-white/20 text-white"
                        : "bg-[#0E1B3D]/10 text-[#0E1B3D] dark:bg-white/15 dark:text-white",
                    )}
                  >
                    <span>Current Track · View Modules</span>
                  </span>
                ) : (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 text-xs font-bold",
                      isCobaltCard ? "text-white/90" : "text-[#0E1B3D] dark:text-white",
                    )}
                  >
                    <span>Show {folio.modules.length} Modules</span>
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

      {/* Unfolded Modules & Lessons for the Selected Track */}
      <div ref={unfoldedTrailRef} className="scroll-mt-24">
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
      </div>

      {/* Footer Link to Full Curriculum Map */}
      <div className="flex justify-end">
        <Link
          to="/learn/modules"
          search={{ track: selectedFolio?.id }}
          className="inline-flex min-h-[40px] items-center gap-1.5 text-xs font-bold text-[#4F6BFF] hover:underline dark:text-[#8DA2FF]"
        >
          <span>
            Browse All {selectedFolio?.shortTitle} Modules in Full Catalog
          </span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}
