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

export function UnfoldedBlueprintTrail({
  selectedFolio,
  selectedModule,
  onSelectModule,
  activeLessonId,
  isExploringDifferentChapterOrModule,
  onReturnToActiveLesson,
}: UnfoldedBlueprintTrailProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.13em] text-primary">
            <span>Track {selectedFolio.numberLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{selectedFolio.modules.length} Modules</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">
              {selectedFolio.completedLessonsCount}/{selectedFolio.totalAuthoredLessonsCount} Lessons
            </span>
          </div>
          <h3 className="mt-1 font-display text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
            Modules in {selectedFolio.shortTitle}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {selectedFolio.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isExploringDifferentChapterOrModule && (
            <button
              type="button"
              onClick={onReturnToActiveLesson}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-bold text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Return to Active Lesson</span>
            </button>
          )}
          <Link
            to="/learn/modules"
            search={{ track: selectedFolio.id }}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-bold text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <span>Open Modules Catalog</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Compass className="h-3.5 w-3.5 text-primary" />
          <span>
            Select a module to inspect its lessons, or open it directly when you're ready.
          </span>
        </div>

        <div
          role="tablist"
          aria-label={`${selectedFolio.shortTitle} modules`}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
        >
          {selectedFolio.modules.map((module, index) => {
            const isSelected = module.id === selectedModule.id;
            const firstLessonId = module.authoredLessons[0]?.id;
            const progressPercent = Math.min(
              100,
              Math.round(
                (module.completedCount / Math.max(module.totalAuthoredCount, 1)) * 100,
              ),
            );

            return (
              <div
                key={module.id}
                role="presentation"
                className={cn(
                  "flex min-w-0 flex-col rounded-xl border p-4 transition-colors",
                  isSelected
                    ? "border-primary bg-primary/[0.035] shadow-sm"
                    : "border-border bg-background hover:border-primary/50",
                )}
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => onSelectModule(module.id)}
                  className="min-h-[116px] w-full text-left"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-lg border px-2 py-1 font-mono text-[10px] font-bold",
                        isSelected
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-border bg-secondary/60 text-muted-foreground",
                      )}
                    >
                      Module {index + 1}
                    </span>
                    <span className="font-mono text-[11px] font-semibold tabular-nums text-muted-foreground">
                      {module.completedCount}/{module.totalAuthoredCount}
                    </span>
                  </div>

                  <h4 className="mt-3 font-display text-base font-extrabold text-foreground">
                    {module.title}
                  </h4>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {module.description}
                  </p>
                </button>

                <div className="mt-auto space-y-3 border-t border-border pt-3">
                  <div
                    role="progressbar"
                    aria-label={`${module.title} completed lessons`}
                    aria-valuenow={progressPercent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="h-1.5 overflow-hidden rounded-full bg-muted"
                  >
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      {isSelected ? "Selected module" : "Explore module"}
                    </span>
                    <div className="flex items-center gap-2">
                      <Link
                        to="/learn/modules/$moduleId"
                        params={{ moduleId: module.id }}
                        className="inline-flex min-h-[32px] items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1 text-[11px] font-bold text-foreground transition-colors hover:border-primary hover:text-primary"
                      >
                        <span>Open</span>
                      </Link>
                      {firstLessonId && (
                        <Link
                          to="/lesson/$lessonId"
                          params={{ lessonId: firstLessonId }}
                          className="inline-flex min-h-[32px] items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                          <Play className="h-3 w-3 fill-current" />
                          <span>Start</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 border-t border-border pt-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.13em] text-primary">
              Lessons in this module
            </div>
            <h4 className="mt-1 font-display text-base font-extrabold text-foreground">
              {selectedModule.title}
              <span className="ml-2 font-mono text-xs font-semibold text-muted-foreground">
                {selectedModule.completedCount}/{selectedModule.totalAuthoredCount}
              </span>
            </h4>
          </div>
          <Link
            to="/learn/modules/$moduleId"
            params={{ moduleId: selectedModule.id }}
            className="inline-flex min-h-[36px] items-center gap-1 text-xs font-bold text-primary hover:underline"
          >
            <span>Open Full Module</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {selectedModule.authoredLessons.map((lesson, index) => {
            const isCompleted = lesson.status === "completed";
            const isCurrent =
              lesson.id === activeLessonId || lesson.status === "active";

            return (
              <Link
                key={lesson.id}
                to="/lesson/$lessonId"
                params={{ lessonId: lesson.id }}
                className={cn(
                  "group flex min-h-[76px] items-center justify-between gap-3 rounded-xl border p-3.5 transition-colors",
                  isCurrent
                    ? "border-primary bg-primary/[0.035]"
                    : isCompleted
                      ? "border-success/30 bg-success/[0.035] hover:border-success/60"
                      : "border-border bg-background hover:border-primary/50",
                )}
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-extrabold",
                      isCompleted
                        ? "bg-success/10 text-success"
                        : isCurrent
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-card text-muted-foreground",
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : isCurrent ? (
                      <Play className="h-3.5 w-3.5 fill-current" />
                    ) : (
                      String(index + 1).padStart(2, "0")
                    )}
                  </span>

                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
                      <span>Lesson {index + 1}</span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {lesson.estimatedMinutes}m
                      </span>
                      {isCurrent && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-bold text-primary">Current</span>
                        </>
                      )}
                      {!isCurrent && isCompleted && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-bold text-success">Completed</span>
                        </>
                      )}
                    </span>
                    <span className="mt-1 block truncate text-sm font-bold text-foreground transition-colors group-hover:text-primary">
                      {lesson.title}
                    </span>
                  </span>
                </div>

                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
