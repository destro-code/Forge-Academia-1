import { useState, type ReactNode } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Check,
  RotateCcw,
  Bookmark,
  StickyNote,
  X,
  Layers,
  MoreVertical,
  ListTree,
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
  studying: "Concept & Mental Model",
  committing: "Hypothesis Commitment",
  investigating: "System Investigation",
  building: "Interactive Code Studio",
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
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState(initialNote);
  const [noteSaved, setNoteSaved] = useState(false);

  const handleSaveNote = () => {
    onSaveNote?.(noteDraft);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 1800);
  };

  const currentLessonIndexInModule = moduleLessons.findIndex((l) => l.id === lessonId);
  const lessonNumberPrefix =
    moduleLessons.length > 0 && currentLessonIndexInModule >= 0
      ? `${currentLessonIndexInModule + 1}/${moduleLessons.length}: `
      : "";
  const hasNoteContent = noteDraft.trim().length > 0;

  return (
    <div
      className="atelier-lesson-shell relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-lesson-bg text-lesson-text-primary transition-colors duration-300"
      style={{
        ...movementVars(currentMovement),
        backgroundImage: `radial-gradient(120% 90% at 50% 0%, rgba(79, 107, 255, 0.05), transparent 65%)`,
        ["--m-glow" as string]: `oklch(${currentMovement.hue} / ${MODE_AMBIENT_OPACITY[mode]})`,
      }}
      data-testid="lesson-shell"
      data-mode={mode}
    >
      {/* Clean 2-Row Header Contract:
          Row 1: [ < Exit ] — [ 1/6: Full Lesson Title ] — [ ⋮ More (Bookmark / Notes / Outline) ]
          Row 2: [ Segmented Progress Bar + Step Counter 1/10 ] */}
      <header className="atelier-lesson-header relative z-30 shrink-0 border-b border-lesson-border bg-lesson-bg/95 backdrop-blur-xl">
        {/* Row 1: Primary Exit, Full Readable Lesson Title, and Overflow Menu */}
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-2 px-3 py-2 sm:px-6 sm:py-2.5">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-8 sm:h-9 items-center gap-1 rounded-lg px-2 sm:px-2.5 text-xs font-semibold text-lesson-text-secondary transition-colors hover:bg-lesson-surface-subtle hover:text-lesson-text-primary shrink-0 active:scale-95"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Exit</span>
          </button>

          {/* Center: Full Readable Lesson Title (Tapping toggles the Lesson Outline Drawer) */}
          <button
            type="button"
            onClick={() => {
              setOutlineOpen((v) => !v);
              setNotesOpen(false);
              setMoreMenuOpen(false);
            }}
            title="View lesson steps and module outline"
            className="group flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1 text-center transition-colors hover:bg-lesson-surface-subtle"
          >
            <span className="truncate text-xs sm:text-sm font-bold text-lesson-text-primary">
              {lessonNumberPrefix && (
                <span className="font-mono text-primary mr-1">{lessonNumberPrefix}</span>
              )}
              {lessonTitle}
            </span>
          </button>

          {/* Right: Secondary Actions (⋮ More Menu on Mobile & Desktop) */}
          <div className="relative flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setMoreMenuOpen((v) => !v)}
              aria-label="Lesson tools menu"
              className={cn(
                "relative inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border transition-colors active:scale-95",
                moreMenuOpen || isBookmarked || hasNoteContent || outlineOpen || notesOpen
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-lesson-border bg-lesson-surface/60 text-lesson-text-secondary hover:text-lesson-text-primary",
              )}
            >
              <MoreVertical className="h-4 w-4" />
              {(isBookmarked || hasNoteContent) && (
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary" />
              )}
            </button>

            {moreMenuOpen && (
              <div
                className="absolute right-0 top-10 z-50 w-52 rounded-xl border border-lesson-border bg-lesson-surface p-1.5 shadow-xl"
                data-testid="lesson-more-menu"
              >
                <button
                  type="button"
                  onClick={() => {
                    setOutlineOpen((v) => !v);
                    setNotesOpen(false);
                    setMoreMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium text-lesson-text-primary hover:bg-lesson-surface-subtle"
                >
                  <span className="flex items-center gap-2">
                    <ListTree className="h-3.5 w-3.5 text-primary" />
                    <span>Lesson Outline</span>
                  </span>
                  <span className="font-mono text-[10px] text-lesson-text-muted">
                    {completedIds.length}/{totalActivities}
                  </span>
                </button>

                {onToggleBookmark && (
                  <button
                    type="button"
                    onClick={() => {
                      onToggleBookmark();
                      setMoreMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium text-lesson-text-primary hover:bg-lesson-surface-subtle"
                  >
                    <span className="flex items-center gap-2">
                      <Bookmark
                        className={cn(
                          "h-3.5 w-3.5",
                          isBookmarked ? "fill-amber-500 text-amber-500" : "text-lesson-text-secondary",
                        )}
                      />
                      <span>{isBookmarked ? "Bookmarked" : "Bookmark Lesson"}</span>
                    </span>
                  </button>
                )}

                {onSaveNote && (
                  <button
                    type="button"
                    onClick={() => {
                      setNotesOpen((v) => !v);
                      setOutlineOpen(false);
                      setMoreMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium text-lesson-text-primary hover:bg-lesson-surface-subtle"
                  >
                    <span className="flex items-center gap-2">
                      <StickyNote className="h-3.5 w-3.5 text-primary" />
                      <span>Studio Notes</span>
                    </span>
                    {hasNoteContent && (
                      <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                        Saved
                      </span>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Segmented Progress Bar + Step Counter */}
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-3 border-t border-lesson-border/60 bg-lesson-surface/35 px-3 py-1.5 sm:px-6">
          <div className="min-w-0 flex-1">
            <MovementRail
              nodes={railNodes}
              currentIndex={currentIndex}
              completedIds={completedIds}
              onSelect={onSelectActivity}
            />
          </div>
          <span className="shrink-0 font-mono text-[11px] font-semibold text-lesson-text-secondary tabular-nums">
            {Math.min(currentIndex + 1, totalActivities)}/{totalActivities}
          </span>
        </div>
      </header>

      {/* Backdrop Scrim when Outline, Notes, or More Menu is Open */}
      {(outlineOpen || notesOpen || moreMenuOpen) && (
        <div
          aria-hidden="true"
          onClick={() => {
            setOutlineOpen(false);
            setNotesOpen(false);
            setMoreMenuOpen(false);
          }}
          className="fixed inset-0 z-20 bg-black/35 backdrop-blur-[1px] transition-opacity"
        />
      )}

      {/* Collapsible Outline Drawer */}
      {outlineOpen && (
        <aside
          className="absolute left-0 top-[82px] bottom-[61px] z-40 w-80 max-w-[88vw] overflow-y-auto border-r border-lesson-border bg-lesson-surface/98 p-4 shadow-2xl backdrop-blur-xl"
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
          className="absolute right-0 top-[82px] bottom-[61px] z-40 flex w-80 max-w-[88vw] flex-col justify-between border-l border-lesson-border bg-lesson-surface/98 p-4 shadow-2xl backdrop-blur-xl"
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

      {/* Main Focused Stage ("One Screen = One Thought") */}
      <div className="relative flex h-0 min-h-0 flex-1 overflow-hidden">
        <main className="atelier-lesson-stage relative h-full min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 pt-4 pb-24 sm:px-6 sm:pt-6 sm:pb-28 lg:px-8">
          <div
            className={cn(
              "relative z-10 mx-auto flex min-h-full w-full flex-col justify-start transition-all duration-300",
              stageWidth === "reading" ? "max-w-[780px]" : "max-w-[1240px]",
            )}
          >
            {children}
          </div>
        </main>
      </div>

      {/* Sticky Thumb-Zone Studio Footer */}
      <footer className="atelier-lesson-footer z-30 shrink-0 border-t border-lesson-border bg-lesson-surface/95 px-3.5 py-2.5 pb-[calc(10px+env(safe-area-inset-bottom,0px))] backdrop-blur-md sm:px-6 sm:py-3">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-2.5 sm:gap-3">
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

          <div className="hidden md:flex items-center gap-2 text-xs font-medium text-lesson-text-muted">
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
          className="h-11 flex-1 sm:flex-initial gap-2 rounded-xl bg-primary hover:bg-primary/90 text-white px-5 sm:px-6 text-sm font-semibold shadow-sm active:scale-[0.98]"
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
            "h-11 flex-1 sm:flex-initial gap-2 rounded-xl bg-primary hover:bg-primary/90 text-white px-5 sm:px-6 text-sm font-semibold shadow-sm active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40",
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
          className="h-11 flex-1 sm:flex-initial gap-2 rounded-xl bg-amber-600 px-5 sm:px-6 text-sm font-semibold text-white hover:bg-amber-700 active:scale-[0.98]"
        >
          <RotateCcw className="h-4 w-4 shrink-0" />
          <span>Try Again</span>
        </Button>
      );
    case "none":
      return null;
  }
}
