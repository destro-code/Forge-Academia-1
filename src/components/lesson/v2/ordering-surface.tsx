import { ArrowUp, ArrowDown, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { ComparisonPanel } from "./comparison-panel";
import type { OrderingContentV1 } from "@/lib/curriculum/v1/content-schemas";
import type { ActivityInteractionStatus, ActivityValidationResult } from "@/components/lesson/canonical/types";

export interface OrderingSurfaceProps {
  title: string;
  instruction?: string;
  content: OrderingContentV1;
  status: ActivityInteractionStatus;
  /** The learner's current sequence, as an array of item IDs. Defaults to the authored order when no response exists yet. */
  response: string[] | undefined;
  onResponse: (response: string[]) => void;
  validationResult?: ActivityValidationResult;
  readOnly?: boolean;
}

/**
 * Presentation family: Selection (ordering half).
 * FORGE_LESSON_PLAYER_V2_IMPLEMENTATION_REPORT (Activity Coverage phase)
 * §4: the primary reordering mechanism here is button-based (Up/Down),
 * which is fully keyboard-and-screen-reader operable by construction — per
 * the explicit instruction to provide "an accessible button/keyboard
 * alternative" when drag-and-drop is used. No pointer-drag interaction was
 * implemented in this phase (flagged in the phase report); the button
 * mechanism is the primary and only reordering method right now, not a
 * fallback bolted onto a drag interface.
 */
export function OrderingSurface({
  title,
  instruction,
  content,
  status,
  response,
  onResponse,
  validationResult,
  readOnly,
}: OrderingSurfaceProps) {
  const isResolved = status === "correct" || status === "incorrect" || status === "completed";
  const order = response ?? content.items.map((item) => item.id);
  const itemById = new Map(content.items.map((item) => [item.id, item]));

  const move = (index: number, direction: -1 | 1) => {
    if (readOnly || isResolved) return;
    const target = index + direction;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    onResponse(next);
  };

  return (
    <div className="space-y-4" data-testid="ordering-surface">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-lesson-text-primary">{title}</h2>
        {instruction && <p className="text-sm text-lesson-text-secondary">{instruction}</p>}
        <p className="text-sm text-lesson-text-secondary">{content.prompt}</p>
      </div>

      <ol className="space-y-2" aria-label={content.prompt}>
        {order.map((itemId, index) => {
          const item = itemById.get(itemId);
          if (!item) return null;
          return (
            <li
              key={itemId}
              className="flex items-center gap-3 rounded-lg border border-lesson-border bg-lesson-surface px-3 py-2.5"
            >
              <GripVertical className="h-4 w-4 shrink-0 text-lesson-text-muted" aria-hidden="true" />
              <span className="w-6 shrink-0 text-center font-mono text-xs text-lesson-text-muted">{index + 1}</span>
              <span className="flex-1 text-sm text-lesson-text-primary">{item.text}</span>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={readOnly || isResolved || index === 0}
                  aria-label={`Move "${item.text}" up`}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-md border border-lesson-border text-lesson-text-secondary transition-colors hover:text-lesson-text-primary",
                    "disabled:cursor-not-allowed disabled:opacity-30",
                  )}
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={readOnly || isResolved || index === order.length - 1}
                  aria-label={`Move "${item.text}" down`}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-md border border-lesson-border text-lesson-text-secondary transition-colors hover:text-lesson-text-primary",
                    "disabled:cursor-not-allowed disabled:opacity-30",
                  )}
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          );
        })}
      </ol>

      {isResolved && (
        <ComparisonPanel
          expectedLabel="Your order"
          expected={order.map((id) => itemById.get(id)?.text ?? id).join(" → ")}
          actualLabel="Result"
          actual={validationResult?.feedbackMessage ?? (status === "correct" ? "That's the sequence." : "Not quite the right sequence yet.")}
          tone={status === "incorrect" ? "warning" : "success"}
        />
      )}
    </div>
  );
}
