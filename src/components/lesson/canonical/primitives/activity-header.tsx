import { Button } from "@/components/ui/button";
import type { CanonicalActivity } from "@/lib/curriculum/types";
import { LessonMarkdown } from "@/components/lesson/shared/lesson-markdown";
import { Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ActivityHeaderProps {
  activity: CanonicalActivity;
  title?: string;
  onRevealHint?: () => void;
  hintsRemaining?: number;
  className?: string;
}

const INTENT_LABELS: Record<string, string> = {
  orientation: "Orientation",
  understanding: "Concept Study",
  recognition: "Visual Model",
  retrieval: "Active Recall",
  prediction: "Output Prediction",
  application: "Coding Practice",
  debugging: "Debug Challenge",
  assessment: "Knowledge Check",
  reflection: "Reflection",
  synthesis: "Synthesis",
  reinforcement: "Reinforcement",
  modification: "Interactive Lab",
};

export function ActivityHeader({
  activity,
  title,
  onRevealHint,
  hintsRemaining,
  className,
}: ActivityHeaderProps) {
  const label =
    activity.type === "interactive-code"
      ? "Interactive Code Lab"
      : activity.type === "visual"
        ? "Interactive Visual Studio"
        : INTENT_LABELS[activity.intent ?? ""] || "Learning Activity";

  const displayTitle = title ?? (activity as unknown as { title?: string }).title;
  const contentObj = activity.content as unknown as {
    title?: string;
    prompt?: string;
    question?: string;
  };
  const bodyHeading = contentObj?.title || contentObj?.prompt || contentObj?.question;

  const isDuplicateHeading =
    !displayTitle ||
    (bodyHeading &&
      displayTitle.trim().toLowerCase() === bodyHeading.trim().toLowerCase()) ||
    displayTitle.trim().toLowerCase() === label.trim().toLowerCase();

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 border-b border-lesson-border px-5 py-3 sm:px-6",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-lesson-text-muted">
          {label}
        </p>
        {displayTitle && !isDuplicateHeading && (
          <p className="mt-0.5 truncate text-sm font-medium text-lesson-text-secondary">
            <LessonMarkdown inline>{displayTitle}</LessonMarkdown>
          </p>
        )}
      </div>

      {onRevealHint && typeof hintsRemaining === "number" && hintsRemaining > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRevealHint}
          className="min-h-9 shrink-0 gap-1.5 px-2.5 text-xs font-medium text-lesson-text-secondary hover:bg-lesson-surface-subtle hover:text-lesson-text-primary focus-visible:ring-2 focus-visible:ring-lesson-focus-ring"
        >
          <Lightbulb className="h-4 w-4 text-amber-500" />
          <span>Hint ({hintsRemaining})</span>
        </Button>
      )}
    </div>
  );
}
