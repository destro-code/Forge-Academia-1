import { useState, type ReactNode } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Check,
  RotateCcw,
  PanelLeft,
  Bookmark,
  StickyNote,
  X,
  Layers,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MovementRail, type RailNode } from "@/components/lesson/canonical/movement-rail";
import { movementVars, type Movement } from "@/components/lesson/canonical/lesson-movements";
import type { LessonMode } from "./mode";

export type FooterAction =
  | { kind: "continue"; label: string; onClick: () => void }
  | { kind: "check"; label: string; disabled: boolean; onClick: () => void }
  | { kind: "retry"; onClick: () => void }
  | { kind: "none" };

export interface StudioModuleLessonItem {
  id: string;
  title: string;
  position?: number;
  isCompleted?: boolean;
}

export interface LessonShellProps {
  lessonId?: string;
  lessonTitle: string;
  moduleTitle?: string;
  navigationMode?: "module" | "curriculum";
  moduleLessons?: StudioModuleLessonItem[];
  activityTitles?: string[];
  currentIndex: number;
  totalActivities: number;
  railNodes: RailNode[];
  completedIds: string[];
  onSelectActivity: (index: number) => void;
  currentMovement: Movement;
  mode: LessonMode;
  stageWidth?: "reading" | "studio";
  isBookmarked?: boolean;
  initialNote?: string;
  prevLessonId?: string | null;
  nextLessonId?: string | null;
  onToggleBookmark?: () => void;
  onSaveNote?: (text: string) => void;
  onNavigateLesson?: (lessonId: string) => void;
  onBack: () => void;
  onPrevious: () => void;
  canGoPrevious: boolean;
  footerAction: FooterAction;
  children: ReactNode;
}

const MODE_AMBIENT_OPACITY: Record<LessonMode, string> = {
  studying: "0.04",
  committing: "0.06",
  investigating: "0.08",
  building: "0.05",
  reflecting: "0.04",
  closing: "0.06",
};

const MODE_STUDIO_LABEL: Record<LessonMode, string> = {
  studying: "Concept & Visual Model",
  committing: "Hypothesis Commitment",
  investigating: "System Investigation",
  building: "Interactive Code & Design Studio",
  reflecting: "Architectural Judgment",
  closing: "Capability Mastery",
};

export function LessonShell({
  lessonId,
  lessonTitle,
  moduleTitle,
  moduleLessons = [],
  activityTitles = [],
  currentIndex,
  totalActivities,
  railNodes,
  completedIds,
  onSelectActivity,
  currentMovement,
  mode,
  stageWidth = "studio",
  isBookmarked = false,
  initialNote = "",
  prevLessonId,
  nextLessonId,
  onToggleBookmark,
  onSaveNote,
  onNavigateLesson,
  onBack,
  onPrevious,
  canGoPrevious,
  footerAction,
  children,
}: LessonShellProps) {
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState(initialNote);
  const [noteSaved, setNoteSaved] = useState(false);

  const handleSaveNote = () => {
    onSaveNote?.(noteDraft);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 1800);
  };

  const currentLessonIndexInModule = moduleLessons.findIndex((l) => l.id === lessonId);
  const currentStepTitle =
    activityTitles[currentIndex] || MODE_STUDIO_LABEL[mode] || `Step ${currentIndex + 1}`;

  return (
    <div
      className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-lesson-bg text-lesson-text-primary transition-colors duration-300"
      style={{
        ...movementVars(currentMovement),
        backgroundImage: `radial-gradient(120% 90% at 50% 0%, var(--m-accent-soft), transparent 65%)`,
        ["--m-glow" as string]: `oklch(${currentMovement.hue} / ${MODE_AMBIENT_OPACITY[mode]})`,
      }}
      data-testid="lesson-shell"
      data-mode={mode}
    >
      {/* Top Bar: Two-Tier Mobile Studio Header + 3-Zone Desktop Contract */}
      <header className="relative z-30 shrink-0 border-b border-lesson-border bg-lesson-bg/92 backdrop-blur-xl">
        {/* Tier 1: Primary Navigation, Lesson Title & Studio Drawer Triggers */}
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-2 px-3 py-2 sm:gap-4 sm:px-6 sm:py-2.5">
          {/* Zone 1: Leave + Outline Drawer Toggle + Lesson Identity */}
          <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2 md:flex-initial">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-8 sm:h-9 items-center gap-1 rounded-lg px-2 sm:px-2.5 text-xs font-medium text-lesson-text-secondary transition-colors hover:bg-lesson-surface-subtle hover:text-lesson-text-primary whitespace-nowrap shrink-0 active:scale-95"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Leave</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setOutlineOpen((v) => !v);
                setNotesOpen(false);
              }}
              aria-label="Toggle lesson outline drawer"
              className={cn(
                "inline-flex h-8 sm:h-9 items-center gap-1.5 rounded-lg border px-2 sm:px-2.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 active:scale-95",
                outlineOpen
                  ? "border-primary/50 bg-primary/15 text-lesson-text-primary"
                  : "border-lesson-border bg-lesson-surface/60 text-lesson-text-secondary hover:text-lesson-text-primary",
              )}
            >
              <PanelLeft className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Outline</span>
              {moduleLessons.length > 0 && currentLessonIndexInModule >= 0 && (
                <span className="font-mono text-[10px] sm:text-[11px] text-lesson-text-muted tabular-nums">
                  {currentLessonIndexInModule + 1}/{moduleLessons.length}
                </span>
              )}
            </button>

            {/* Mobile & Tablet Truncated Lesson Title (< lg) */}
            <span className="min-w-0 flex-1 truncate pl-1 text-xs font-semibold text-lesson-text-primary lg:hidden">
              {lessonTitle}
            </span>

            {/* Desktop Module + Lesson Breadcrumb (lg+) */}
            <div className="hidden min-w-0 lg:flex lg:items-center lg:gap-2 lg:pl-1">
              {moduleTitle && (
                <>
                  <span className="truncate max-w-[180px] text-xs text-lesson-text-muted">
                    {moduleTitle}
                  </span>
                  <span aria-hidden="true" className="text-xs text-lesson-text-muted">
                    /
                  </span>
                </>
              )}
              <span className="truncate max-w-[240px] text-xs font-semibold text-lesson-text-primary">
                {lessonTitle}
              </span>
            </div>
          </div>

          {/* Zone 2: Pedagogical Movement Rail (Desktop/Tablet md+ inline) */}
          <div className="hidden min-w-0 flex-1 max-w-xl md:block">
            <MovementRail
              nodes={railNodes}
              currentIndex={currentIndex}
              completedIds={completedIds}
              onSelect={onSelectActivity}
            />
          </div>

          {/* Zone 3: Studio Tools (Step Status, Bookmark, Notes) */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="hidden xl:inline-flex items-center gap-1.5 px-2 text-xs text-lesson-text-secondary font-mono tabular-nums">
              <span>
                Step {Math.min(currentIndex + 1, totalActivities)}/{totalActivities}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-sans text-lesson-text-muted truncate max-w-[150px]">
                {currentStepTitle}
              </span>
            </span>

            {onToggleBookmark && (
              <button
                type="button"
                onClick={onToggleBookmark}
                aria-label={isBookmarked ? "Remove bookmark" : "Bookmark lesson"}
                className={cn(
                  "inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border transition-colors active:scale-95",
                  isBookmarked
                    ? "border-amber-500/40 bg-amber-500/10 text-amber-500"
                    : "border-lesson-border bg-lesson-surface/60 text-lesson-text-secondary hover:text-lesson-text-primary",
                )}
              >
                <Bookmark className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", isBookmarked && "fill-current")} />
              </button>
            )}

            {onSaveNote && (
              <button
                type="button"
                onClick={() => {
                  setNotesOpen((v) => !v);
                  setOutlineOpen(false);
                }}
                aria-label="Toggle lesson notes"
                className={cn(
                  "inline-flex h-8 sm:h-9 items-center gap-1.5 rounded-lg border px-2 sm:px-2.5 text-xs font-medium transition-colors whitespace-nowrap active:scale-95",
                  notesOpen || noteDraft.trim().length > 0
                    ? "border-primary/50 bg-primary/15 text-lesson-text-primary"
                    : "border-lesson-border bg-lesson-surface/60 text-lesson-text-secondary hover:text-lesson-text-primary",
                )}
              >
                <StickyNote className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Notes</span>
              </button>
            )}
          </div>
        </div>

        {/* Tier 2 (< md only): Dedicated Mobile Pedagogical Movement Rail Bar */}
        <div className="flex items-center justify-between gap-3 border-t border-lesson-border/60 bg-lesson-surface/40 px-3 py-1.5 md:hidden">
          <div className="min-w-0 flex-1">
            <MovementRail
              nodes={railNodes}
              currentIndex={currentIndex}
              completedIds={completedIds}
              onSelect={onSelectActivity}
            />
          </div>
          <span className="shrink-0 font-mono text-[10px] font-semibold text-lesson-text-secondary tabular-nums">
            {Math.min(currentIndex + 1, totalActivities)}/{totalActivities}
          </span>
        </div>
      </header>

      {/* Mobile & Desktop Backdrop Scrim when Outline or Notes Drawer is Open */}
      {(outlineOpen || notesOpen) && (
        <div
          aria-hidden="true"
          onClick={() => {
            setOutlineOpen(false);
            setNotesOpen(false);
          }}
          className="fixed inset-0 z-30 bg-black/55 backdrop-blur-[2px] transition-opacity"
        />
      )}

      {/* Collapsible Outline Drawer */}
      {outlineOpen && (
        <aside
          className="absolute left-0 top-[85px] md:top-[53px] bottom-[61px] z-40 w-80 max-w-[88vw] overflow-y-auto border-r border-lesson-border bg-lesson-surface/98 p-4 shadow-2xl backdrop-blur-xl"
          data-testid="lesson-outline-drawer"
        >
          <div className="mb-4 flex items-center justify-between border-b border-lesson-border pb-3">
            <div className="min-w-0 pr-2">
              <p className="truncate text-[11px] font-medium text-lesson-text-muted">
                {moduleTitle || "Current Module"}
              </p>
              <h3 className="truncate text-sm font-semibold text-lesson-text-primary">
                {lessonTitle}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setOutlineOpen(false)}
              className="rounded-lg p-1.5 text-lesson-text-secondary hover:bg-lesson-surface-subtle hover:text-lesson-text-primary"
              aria-label="Close outline"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Current Lesson Activity Steps */}
          <div className="mb-6 space-y-1.5">
            <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-lesson-text-muted">
              Lesson Steps ({completedIds.length}/{totalActivities})
            </p>
            {railNodes.map((node, idx) => {
              const isCurrent = idx === currentIndex;
              const isDone = completedIds.includes(node.id);
              const stepTitle = activityTitles[idx] || `${node.role || node.type} (${idx + 1})`;
              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => {
                    onSelectActivity(idx);
                    setOutlineOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors",
                    isCurrent
                      ? "bg-primary/15 font-semibold text-lesson-text-primary"
                      : "text-lesson-text-secondary hover:bg-lesson-surface-subtle hover:text-lesson-text-primary",
                  )}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="font-mono text-[11px] text-lesson-text-muted tabular-nums">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="truncate">{stepTitle}</span>
                  </div>
                  {isDone && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />}
                </button>
              );
            })}
          </div>

          {/* Module Lessons List */}
          {moduleLessons.length > 0 && onNavigateLesson && (
            <div className="space-y-1.5 border-t border-lesson-border pt-4">
              <p className="flex items-center gap-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-lesson-text-muted">
                <Layers className="h-3 w-3" />
                <span>Module Lessons ({moduleLessons.length})</span>
              </p>
              {moduleLessons.map((ml, idx) => {
                const isActiveLesson = ml.id === lessonId;
                return (
                  <button
                    key={ml.id}
                    type="button"
                    onClick={() => {
                      setOutlineOpen(false);
                      if (!isActiveLesson) onNavigateLesson(ml.id);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors",
                      isActiveLesson
                        ? "border border-primary/40 bg-primary/10 font-semibold text-lesson-text-primary"
                        : "text-lesson-text-secondary hover:bg-lesson-surface-subtle hover:text-lesson-text-primary",
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="font-mono text-[11px] text-lesson-text-muted tabular-nums">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="truncate">{ml.title}</span>
                    </div>
                    {ml.isCompleted && (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </aside>
      )}

      {/* Collapsible Notes Drawer */}
      {notesOpen && onSaveNote && (
        <aside
          className="absolute right-0 top-[85px] md:top-[53px] bottom-[61px] z-40 flex w-80 max-w-[88vw] flex-col justify-between border-l border-lesson-border bg-lesson-surface/98 p-4 shadow-2xl backdrop-blur-xl"
          data-testid="lesson-notes-drawer"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-lesson-border pb-3">
              <div>
                <h3 className="text-sm font-semibold text-lesson-text-primary">Studio Notes</h3>
                <p className="text-[11px] text-lesson-text-muted">
                  Saved automatically to your journal for this lesson
                </p>
              </div>
              <button
                type="button"
                onClick={() => setNotesOpen(false)}
                className="rounded-lg p-1.5 text-lesson-text-secondary hover:bg-lesson-surface-subtle hover:text-lesson-text-primary"
                aria-label="Close notes"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              rows={10}
              placeholder="Write key mental models, CSS snippets, or architectural takeaways..."
              className="w-full rounded-xl border border-lesson-border bg-lesson-bg p-3 text-xs leading-relaxed text-lesson-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div className="flex items-center justify-between pt-3">
            <span className="text-[11px] text-emerald-500 font-medium">
              {noteSaved ? "Saved to Journal" : ""}
            </span>
            <Button size="sm" onClick={handleSaveNote} className="text-xs font-semibold">
              Save Note
            </Button>
          </div>
        </aside>
      )}

      {/* Adaptive Main Stage */}
      <main className="relative h-0 min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3.5 pt-5 pb-28 sm:px-6 sm:pt-8 sm:pb-36 lg:px-8">
        <div
          className={cn(
            "relative z-10 mx-auto flex min-h-full w-full flex-col justify-start transition-all duration-300",
            stageWidth === "reading" ? "max-w-[860px]" : "max-w-[1360px]",
          )}
        >
          {children}
        </div>
      </main>

      {/* Sticky Thumb-Zone Studio Footer */}
      <footer className="z-30 shrink-0 border-t border-lesson-border bg-lesson-surface/95 px-3.5 py-2.5 pb-[calc(10px+env(safe-area-inset-bottom,0px))] backdrop-blur-md sm:px-6 sm:py-3">
        <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              onClick={onPrevious}
              disabled={!canGoPrevious}
              className="h-10 sm:h-11 gap-1 px-2.5 sm:px-3 text-xs sm:text-sm text-lesson-text-secondary"
              aria-label="Previous activity"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous Step</span>
              <span className="sm:hidden">Prev</span>
            </Button>

            {prevLessonId && onNavigateLesson && !canGoPrevious && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateLesson(prevLessonId)}
                className="hidden sm:inline-flex h-9 text-xs text-lesson-text-secondary"
              >
                Previous Lesson
              </Button>
            )}
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-lesson-text-muted">
            <Sparkles className="h-3.5 w-3.5" style={{ color: "var(--m-accent)" }} />
            <span>{MODE_STUDIO_LABEL[mode]}</span>
          </div>

          <div className="flex flex-1 sm:flex-initial items-center justify-end gap-2">
            {nextLessonId && onNavigateLesson && footerAction.kind === "none" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateLesson(nextLessonId)}
                className="h-10 text-xs font-medium"
              >
                Next Lesson
              </Button>
            )}
            <FooterActionButton
              action={footerAction}
              isLast={currentIndex === totalActivities - 1}
            />
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterActionButton({ action, isLast }: { action: FooterAction; isLast: boolean }) {
  switch (action.kind) {
    case "continue":
      return (
        <Button
          onClick={action.onClick}
          className="h-11 flex-1 sm:flex-initial gap-2 rounded-xl px-5 sm:px-6 text-sm font-semibold shadow-glow active:scale-[0.98]"
        >
          <span>{action.label}</span>
          {isLast ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0" />
          )}
        </Button>
      );
    case "check":
      return (
        <Button
          onClick={action.onClick}
          disabled={action.disabled}
          className={cn(
            "h-11 flex-1 sm:flex-initial gap-2 rounded-xl px-5 sm:px-6 text-sm font-semibold shadow-glow active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40",
          )}
        >
          <Check className="h-4 w-4 shrink-0" />
          <span>{action.label}</span>
        </Button>
      );
    case "retry":
      return (
        <Button
          onClick={action.onClick}
          className="h-11 flex-1 sm:flex-initial gap-2 rounded-xl bg-rose-600 px-5 sm:px-6 text-sm font-semibold text-white hover:bg-rose-700 active:scale-[0.98]"
        >
          <RotateCcw className="h-4 w-4 shrink-0" />
          <span>Try Again</span>
        </Button>
      );
    case "none":
      return null;
  }
}
