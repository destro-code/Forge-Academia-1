import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight, CheckCircle2, Check, RotateCcw } from "lucide-react";
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

export interface LessonShellProps {
  lessonTitle: string;
  currentIndex: number;
  totalActivities: number;
  railNodes: RailNode[];
  completedIds: string[];
  onSelectActivity: (index: number) => void;
  currentMovement: Movement;
  mode: LessonMode;
  onBack: () => void;
  onPrevious: () => void;
  canGoPrevious: boolean;
  footerAction: FooterAction;
  children: ReactNode;
}

const MODE_AMBIENT_OPACITY: Record<LessonMode, string> = {
  studying: "0.03",
  committing: "0.05",
  investigating: "0.08",
  building: "0.03",
  reflecting: "0.03",
  closing: "0.05",
};

/**
 * The single shared shell every v2 activity renders inside — owns the
 * header, the movement rail, ambient mode tinting, and the sticky footer
 * action bar. No presentation surface (system/commitment/investigation/etc.)
 * duplicates any of this chrome; they only render their own content into
 * `children`. Mirrors the vertical slice's `V1LessonPlayer` layout, which
 * this component supersedes and factors out of that monolithic file.
 */
export function LessonShell({
  lessonTitle,
  currentIndex,
  totalActivities,
  railNodes,
  completedIds,
  onSelectActivity,
  currentMovement,
  mode,
  onBack,
  onPrevious,
  canGoPrevious,
  footerAction,
  children,
}: LessonShellProps) {
  return (
    <div
      className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-lesson-bg text-lesson-text-primary transition-colors duration-500"
      style={{
        ...movementVars(currentMovement),
        backgroundImage: `radial-gradient(120% 100% at 50% 0%, var(--m-accent-soft), transparent 60%)`,
        // Ambient intensity communicates mode without a literal label — see FORGE_LESSON_PLAYER_V2_BLUEPRINT.md §5.
        ["--m-glow" as string]: `oklch(${currentMovement.hue} / ${MODE_AMBIENT_OPACITY[mode]})`,
      }}
      data-testid="lesson-shell"
      data-mode={mode}
    >
      <header className="relative z-20 shrink-0 border-b border-lesson-border bg-lesson-bg/80 px-4 py-3 backdrop-blur-sm sm:px-6">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-sm font-medium text-lesson-text-secondary transition-colors hover:bg-lesson-surface-subtle hover:text-lesson-text-primary"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Leave</span>
          </button>
          <div className="min-w-0 flex-1">
            <MovementRail
              nodes={railNodes}
              currentIndex={currentIndex}
              completedIds={completedIds}
              onSelect={onSelectActivity}
            />
          </div>
          <p className="hidden shrink-0 truncate text-xs font-medium text-lesson-text-muted sm:block">{lessonTitle}</p>
        </div>
      </header>

      <main className="relative h-0 min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 pt-8 pb-36 sm:px-6 sm:pt-10 sm:pb-40 lg:px-8">
        <div className="relative z-10 mx-auto flex min-h-full w-full max-w-[1200px] flex-col justify-start">
          {children}
        </div>
      </main>

      <footer className="z-30 shrink-0 border-t border-lesson-border bg-lesson-surface/95 px-4 py-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] backdrop-blur-sm sm:px-6">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className="min-h-11 gap-1 px-3 text-sm text-lesson-text-secondary"
            aria-label="Previous activity"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>

          <FooterActionButton action={footerAction} isLast={currentIndex === totalActivities - 1} />
        </div>
      </footer>
    </div>
  );
}

function FooterActionButton({ action, isLast }: { action: FooterAction; isLast: boolean }) {
  switch (action.kind) {
    case "continue":
      return (
        <Button onClick={action.onClick} className="min-h-11 gap-2 rounded-lg px-6 text-sm font-semibold">
          <span>{action.label}</span>
          {isLast ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
        </Button>
      );
    case "check":
      return (
        <Button
          onClick={action.onClick}
          disabled={action.disabled}
          className={cn("min-h-11 gap-2 rounded-lg px-6 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40")}
        >
          <Check className="h-4 w-4 shrink-0" />
          <span>{action.label}</span>
        </Button>
      );
    case "retry":
      return (
        <Button
          onClick={action.onClick}
          className="min-h-11 gap-2 rounded-lg bg-rose-600 px-6 text-sm font-semibold text-white hover:bg-rose-700"
        >
          <RotateCcw className="h-4 w-4 shrink-0" />
          <span>Try Again</span>
        </Button>
      );
    case "none":
      return null;
  }
}
