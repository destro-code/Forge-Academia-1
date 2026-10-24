import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ComparisonPanel } from "./comparison-panel";
import { LessonMarkdown } from "@/components/lesson/shared/lesson-markdown";
import type { MultiSelectContentV1 } from "@/lib/curriculum/v1/content-schemas";
import type {
  ActivityInteractionStatus,
  ActivityValidationResult,
} from "@/components/lesson/canonical/types";

export interface MultiSelectSurfaceProps {
  title: string;
  instruction?: string;
  content: MultiSelectContentV1;
  status: ActivityInteractionStatus;
  response: string[] | undefined;
  onResponse: (response: string[]) => void;
  validationResult?: ActivityValidationResult;
  readOnly?: boolean;
}

export function MultiSelectSurface({
  title,
  instruction,
  content,
  status,
  response,
  onResponse,
  validationResult,
  readOnly,
}: MultiSelectSurfaceProps) {
  const isResolved = status === "correct" || status === "incorrect" || status === "completed";
  const isLocked = Boolean(readOnly) || status === "correct" || status === "completed";
  const selected = new Set(response ?? []);

  const toggle = (optionId: string) => {
    if (isLocked) return;
    const next = new Set(selected);
    if (next.has(optionId)) next.delete(optionId);
    else next.add(optionId);
    onResponse(Array.from(next));
  };

  const selectedLabels = content.options.filter((o) => selected.has(o.id)).map((o) => o.text);

  return (
    <div className="space-y-4" data-testid="multi-select-surface">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-lesson-text-primary">
          <LessonMarkdown inline>{title}</LessonMarkdown>
        </h2>
        {instruction && (
          <div className="text-sm text-lesson-text-secondary">
            <LessonMarkdown>{instruction}</LessonMarkdown>
          </div>
        )}
      </div>

      <fieldset className="space-y-2" disabled={isLocked}>
        <legend className="sr-only">{content.question}</legend>
        {content.options.map((option) => {
          const isChecked = selected.has(option.id);
          return (
            <label
              key={option.id}
              className={cn(
                "flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-4 py-2.5 text-sm transition-colors",
                isChecked
                  ? "border-lesson-focus-ring/60 bg-lesson-surface-elevated text-lesson-text-primary"
                  : "border-lesson-border bg-lesson-surface text-lesson-text-secondary hover:border-lesson-border/80",
                isLocked && "cursor-not-allowed opacity-80",
              )}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggle(option.id)}
                className="h-4 w-4 shrink-0 accent-primary"
                aria-checked={isChecked}
              />
              <span>
                <LessonMarkdown inline>{option.text}</LessonMarkdown>
              </span>
              {isChecked && <Check className="ml-auto h-4 w-4 shrink-0 text-primary" />}
            </label>
          );
        })}
      </fieldset>

      {isResolved && (
        <ComparisonPanel
          expectedLabel="You selected"
          expected={selectedLabels.join(", ") || "Nothing"}
          actualLabel="Result"
          actual={
            validationResult?.feedbackMessage ??
            (status === "correct"
              ? "That's the full set."
              : "Not quite the full set — reconsider which apply.")
          }
          tone={status === "incorrect" ? "warning" : "success"}
        />
      )}
    </div>
  );
}
