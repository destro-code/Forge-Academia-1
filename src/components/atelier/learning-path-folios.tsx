import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Atom, Braces, CheckCircle2, Code2, Layers } from "lucide-react";
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
  const moduleCount = folios.reduce((count, folio) => count + folio.modules.length, 0);
  const lessonCount = folios.reduce((count, folio) => count + folio.totalAuthoredLessonsCount, 0);

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
            {folios.length} Tracks · {moduleCount} Modules · {lessonCount} Lessons
          </div>
          <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Explore the Learning Paths
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Choose a track to explore its modules. Your recommended route stays visible, and you can revisit material whenever you need it.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground sm:self-end">
          <span className="h-2 w-2 rounded-full bg-primary" />
          Recommended path
        </div>
      </div>

      {/* Learning tracks: consistent surfaces, explicit progress, and one clear selection state. */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {folios.map((folio) => {
          const isSelected = folio.id === selectedChapterId;
          const isCurrentChapter = folio.id === activeChapterId;
          const isCompletedChapter = folio.status === "completed";
          const trackName = folio.shortTitle.toLowerCase();
          const TrackIcon =
            trackName === "html"
              ? Code2
              : trackName === "css"
                ? Layers
                : trackName === "javascript"
                  ? Braces
                  : Atom;
          const progressPercent = Math.min(
            100,
            Math.round(
              (folio.completedLessonsCount / Math.max(folio.totalAuthoredLessonsCount, 1)) * 100,
            ),
          );

          return (
            <button
              key={folio.id}
              type="button"
              onClick={() => handleTrackClick(folio.id)}
              aria-pressed={isSelected}
              className={cn(
                "group relative flex min-h-[208px] flex-col justify-between overflow-hidden rounded-2xl border bg-card p-5 text-left transition-colors duration-200",
                isSelected
                  ? "border-primary bg-primary/[0.035] shadow-sm"
                  : "border-border hover:border-primary/55 hover:bg-secondary/25",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-2">
                  <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Track {folio.numberLabel} · {folio.modules.length} Modules
                  </div>
                  <h3 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
                    {folio.shortTitle}
                  </h3>
                  <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
                    {folio.title} · {folio.estimatedHours}h
                  </p>
                </div>
                <div
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-colors",
                    isSelected
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-border bg-secondary/60 text-muted-foreground group-hover:text-primary",
                  )}
                  aria-hidden="true"
                >
                  <TrackIcon className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-semibold text-muted-foreground">Lessons completed</span>
                  <span className="font-mono font-bold tabular-nums text-foreground">
                    {folio.completedLessonsCount}/{folio.totalAuthoredLessonsCount}
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-label={`${folio.shortTitle} completed lessons`}
                  aria-valuenow={progressPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="h-1.5 overflow-hidden rounded-full bg-muted"
                >
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between gap-3 pt-1">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 text-xs font-bold",
                      isCompletedChapter
                        ? "text-success"
                        : isCurrentChapter
                          ? "text-primary"
                          : "text-muted-foreground",
                    )}
                  >
                    {isCompletedChapter ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Completed</span>
                      </>
                    ) : isSelected ? (
                      <span>Viewing modules</span>
                    ) : isCurrentChapter ? (
                      <span>Current track</span>
                    ) : (
                      <span>Explore track</span>
                    )}
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors group-hover:border-primary group-hover:text-primary">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
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
          className="inline-flex min-h-[40px] items-center gap-1.5 text-xs font-bold text-primary hover:underline dark:text-primary"
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
