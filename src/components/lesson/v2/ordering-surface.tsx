import { useEffect, useMemo, useState } from "react";
import { ArrowUp, ArrowDown, GripVertical, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ComparisonPanel } from "./comparison-panel";
import { LessonMarkdown } from "@/components/lesson/shared/lesson-markdown";
import {
  isValidOrderingPermutation,
  resolveInitialOrderingResponse,
  scrambleOrderingItems,
} from "@/lib/utils/shuffle-options";
import type { OrderingContentV1 } from "@/lib/curriculum/v1/content-schemas";
import type {
  ActivityInteractionStatus,
  ActivityValidationResult,
} from "@/components/lesson/canonical/types";

export interface OrderingSurfaceProps {
  activityId?: string;
  title: string;
  instruction?: string;
  content: OrderingContentV1;
  correctSequence?: string[];
  status: ActivityInteractionStatus;
  /** The learner's current sequence, as an array of item IDs. Pre-scrambled on initial mount when undefined. */
  response: string[] | undefined;
  onResponse: (response: string[]) => void;
  validationResult?: ActivityValidationResult;
  readOnly?: boolean;
}

export function OrderingSurface({
  activityId,
  title,
  instruction,
  content,
  correctSequence,
  status,
  response,
  onResponse,
  validationResult,
  readOnly,
}: OrderingSurfaceProps) {
  const isLocked =
    Boolean(readOnly) ||
    status === "correct" ||
    status === "completed" ||
    status === "submitted" ||
    status === "evaluating";
  const showFeedback =
    status === "correct" || status === "incorrect" || status === "completed";
  const [shuffleRevision, setShuffleRevision] = useState(0);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const order = useMemo(
    () =>
      resolveInitialOrderingResponse(
        content.items,
        correctSequence,
        `${activityId || title}:rev-${shuffleRevision}`,
        response,
      ),
    [content.items, correctSequence, activityId, title, shuffleRevision, response],
  );

  // Automatically register the pre-scrambled initial order so Check Answer is enabled immediately
  useEffect(() => {
    if (!isLocked && !isValidOrderingPermutation(response, content.items) && order.length === content.items.length) {
      onResponse(order);
    }
  }, [isLocked, response, content.items, order, onResponse]);

  const itemById = useMemo(
    () => new Map(content.items.map((item) => [item.id, item])),
    [content.items],
  );

  const move = (index: number, direction: -1 | 1) => {
    if (isLocked) return;
    const target = index + direction;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    onResponse(next);
  };

  const handleReshuffle = () => {
    if (isLocked) return;
    const nextRev = shuffleRevision + 1;
    setShuffleRevision(nextRev);
    const nextOrder = scrambleOrderingItems(
      content.items,
      correctSequence,
      `${activityId || title}:rev-${nextRev}`,
    );
    onResponse(nextOrder);
  };

  return (
    <div className="space-y-4" data-testid="ordering-surface">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-lesson-text-primary">
            <LessonMarkdown inline>{title}</LessonMarkdown>
          </h2>
          {instruction && instruction.trim().toLowerCase() !== title.trim().toLowerCase() && (
            <div className="text-sm text-lesson-text-secondary">
              <LessonMarkdown>{instruction}</LessonMarkdown>
            </div>
          )}
          {content.prompt &&
            content.prompt.trim().toLowerCase() !== title.trim().toLowerCase() &&
            content.prompt.trim().toLowerCase() !== instruction?.trim().toLowerCase() && (
              <div className="text-sm text-lesson-text-secondary">
                <LessonMarkdown>{content.prompt}</LessonMarkdown>
              </div>
            )}
        </div>

        {!isLocked && content.items.length > 1 && (
          <button
            type="button"
            onClick={handleReshuffle}
            className="inline-flex items-center gap-1.5 rounded-lg border border-lesson-border bg-lesson-surface px-2.5 py-1.5 text-xs font-medium text-lesson-text-secondary transition-colors hover:text-lesson-text-primary"
          >
            <Shuffle className="h-3.5 w-3.5" />
            <span>Shuffle Order</span>
          </button>
        )}
      </div>

      <ol className="space-y-2" aria-label={content.prompt}>
        {order.map((itemId, index) => {
          const item = itemById.get(itemId);
          if (!item) return null;
          return (
            <li
              key={itemId}
              draggable={!isLocked}
              onDragStart={() => setDraggedIndex(index)}
              onDragOver={(e) => {
                e.preventDefault();
                if (draggedIndex === null || draggedIndex === index || isLocked)
                  return;
                const next = [...order];
                const [moved] = next.splice(draggedIndex, 1);
                next.splice(index, 0, moved);
                setDraggedIndex(index);
                onResponse(next);
              }}
              onDragEnd={() => setDraggedIndex(null)}
              className={cn(
                "flex items-center gap-3 rounded-lg border border-lesson-border bg-lesson-surface px-3 py-2.5 transition-colors",
                !isLocked && "cursor-grab active:cursor-grabbing hover:border-primary/40",
                draggedIndex === index && "border-primary bg-primary/5 ring-1 ring-primary/40",
              )}
            >
              <GripVertical
                className="h-4 w-4 shrink-0 text-lesson-text-muted"
                aria-hidden="true"
              />
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 font-mono text-xs font-bold text-primary">
                {index + 1}
              </span>
              <span className="flex-1 text-sm text-lesson-text-primary">
                <LessonMarkdown inline>{item.text}</LessonMarkdown>
              </span>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={isLocked || index === 0}
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
                  disabled={isLocked || index === order.length - 1}
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

      {showFeedback && (
        <ComparisonPanel
          expectedLabel="Your order"
          expected={order.map((id) => itemById.get(id)?.text ?? id).join(" → ")}
          actualLabel="Result"
          actual={
            validationResult?.feedbackMessage ??
            (status === "correct" ? "Spot-on sequence!" : "Not quite in the right order yet—try swapping the steps that happen earlier vs. later.")
          }
          tone={status === "incorrect" ? "warning" : "success"}
        />
      )}
    </div>
  );
}
