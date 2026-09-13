import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ClosureSurfaceProps {
  /** The authored capability statement (`learning.targetState.canDo`), verbatim — never a score. */
  capabilityStatements: string[];
  nextLessonLabel?: string;
  onContinueToNext?: () => void;
  onReturnToModule?: () => void;
}

/**
 * Presentation family: Closure. Implements
 * FORGE_LESSON_PLAYER_V2_EXPERIENCE_SPEC.md §10 — no score, no XP, no
 * generic congratulations. The movement rail's own final-segment resolve
 * (in lesson-shell.tsx) is the only motion; this component is deliberately
 * static and quiet.
 */
export function ClosureSurface({
  capabilityStatements,
  nextLessonLabel,
  onContinueToNext,
  onReturnToModule,
}: ClosureSurfaceProps) {
  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col items-start gap-6 py-10" data-testid="closure-surface">
      <CheckCircle2 className="h-8 w-8 text-lesson-success-text" />
      <div className="space-y-3">
        {capabilityStatements.map((statement) => (
          <p key={statement} className="text-lg font-medium leading-snug text-lesson-text-primary">
            {statement}
          </p>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {onContinueToNext && (
          <Button onClick={onContinueToNext} className="min-h-11 rounded-lg px-6 text-sm font-semibold">
            {nextLessonLabel ? `Next: ${nextLessonLabel}` : "Continue"}
          </Button>
        )}
        {onReturnToModule && (
          <Button variant="ghost" onClick={onReturnToModule} className="min-h-11 text-sm text-lesson-text-secondary">
            Back to module
          </Button>
        )}
      </div>
    </div>
  );
}
