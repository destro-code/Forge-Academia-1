import { CheckCircle2 } from "lucide-react";
import type { V1ActivityRendererProps } from "./types";

export interface GenericDemoPanelProps extends V1ActivityRendererProps<{ acknowledged: true }> {
  title: string;
  instruction?: string;
  /** Freeform factual/contextual text to display above the acknowledge action — e.g. an `expectedStatus` string or a `scenario` description. Optional so a panel with nothing but the instruction still renders sensibly. */
  bodyText?: string;
  acknowledgeLabel?: string;
}

/**
 * Fallback renderer for V1 activities that don't have a richer V1-native or
 * Layer-1-delegated path available. Two cases route here in this slice:
 *  - `interactive-demo` activities with no `systemComponent` (those that DO
 *    declare one are instead adapted to Layer 1's `visual` type and rendered
 *    through the existing interactive-visual registry — see
 *    ../../../lib/curriculum/v1/adapter.ts). The golden lesson's
 *    verification beat (`expectedStatus` only) uses this path.
 *  - `judgment` activities whose authored content doesn't include the
 *    option set Layer 1's JudgmentRenderer requires (modelAnswer +
 *    evaluationRubric) — the golden lesson's transfer beat is like this: it
 *    declares `validation.type: "single-choice"` but never authors the
 *    corresponding options. Rather than fabricate rubric/option content
 *    that was never authored, this renders as an open acknowledgment. This
 *    is a genuine content gap in the golden fixture, not silently patched —
 *    see the Layer 2 vertical slice report's Known Limitations.
 */
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
        <h2 className="text-lg font-bold text-lesson-text-primary">{title}</h2>
        {instruction && <p className="text-sm text-lesson-text-secondary">{instruction}</p>}
      </div>
      {bodyText && (
        <p className="rounded-md border border-lesson-border/60 bg-lesson-bg/60 p-3 font-mono text-xs text-lesson-text">
          {bodyText}
        </p>
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

