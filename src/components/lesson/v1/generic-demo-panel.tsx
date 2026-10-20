import { CheckCircle2 } from "lucide-react";
import { LessonMarkdown } from "@/components/lesson/shared/lesson-markdown";
import type { V1ActivityRendererProps } from "./types";

export interface GenericDemoPanelProps extends V1ActivityRendererProps<{ acknowledged: true }> {
  title: string;
  instruction?: string;
  /** Freeform factual/contextual text to display above the acknowledge action — e.g. an `expectedStatus` string or a `scenario` description. Optional so a panel with nothing but the instruction still renders sensibly. */
  bodyText?: string;
  acknowledgeLabel?: string;
}

export function GenericDemoPanel({
  state,
  onResponse,
  readOnly,
  title,
  instruction,
  bodyText,
  acknowledgeLabel = "I verified it",
}: GenericDemoPanelProps) {
  const acknowledged = Boolean(state.response);

  return (
    <div className="space-y-4 rounded-lg border border-lesson-border bg-lesson-surface p-4">
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
      {bodyText && (
        <div className="rounded-md border border-lesson-border/60 bg-lesson-bg/60 p-3 text-xs text-lesson-text">
          <LessonMarkdown>{bodyText}</LessonMarkdown>
        </div>
      )}
      <button
        type="button"
        disabled={readOnly || acknowledged}
        onClick={() => onResponse({ acknowledged: true })}
        className="flex min-h-[44px] items-center gap-2 rounded-lg border border-lesson-border bg-lesson-bg px-4 py-2 text-xs font-medium text-lesson-text-secondary transition-colors hover:text-lesson-text disabled:cursor-not-allowed disabled:opacity-50"
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span>{acknowledged ? "Recorded" : acknowledgeLabel}</span>
      </button>
    </div>
  );
}
