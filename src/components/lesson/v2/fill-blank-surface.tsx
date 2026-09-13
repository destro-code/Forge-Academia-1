import { Fragment } from "react";
import { cn } from "@/lib/utils";
import { ComparisonPanel } from "./comparison-panel";
import type { FillBlankContentV1 } from "@/lib/curriculum/v1/content-schemas";
import type { ActivityInteractionStatus, ActivityValidationResult } from "@/components/lesson/canonical/types";

export interface FillBlankSurfaceProps {
  title: string;
  instruction?: string;
  content: FillBlankContentV1;
  status: ActivityInteractionStatus;
  /** Keyed by blank ID. Preserved across a failed attempt — never cleared on incorrect (see task §5 "preserve the learner's attempt after failure"). */
  response: Record<string, string> | undefined;
  onResponse: (response: Record<string, string>) => void;
  validationResult?: ActivityValidationResult;
  readOnly?: boolean;
}

const BLANK_TOKEN = /\{\{(.+?)\}\}/g;

/**
 * Presentation family: Assembly. Renders `template` as flowing text with
 * inline inputs at each `{{blankId}}` token — "constructing a technical
 * statement," not a worksheet with a card around every blank
 * (FORGE_LESSON_PLAYER_V2_IMPLEMENTATION_REPORT §5). Blank inputs size to
 * their content via a CSS `ch`-based width so short answers don't get a
 * full-width text box.
 */
export function FillBlankSurface({
  title,
  instruction,
  content,
  status,
  response,
  onResponse,
  validationResult,
  readOnly,
}: FillBlankSurfaceProps) {
  const isResolved = status === "correct" || status === "incorrect" || status === "completed";
  const values = response ?? {};

  const setValue = (blankId: string, value: string) => {
    if (readOnly || isResolved) return;
    onResponse({ ...values, [blankId]: value });
  };

  const blankById = new Map(content.blanks.map((b) => [b.id, b]));
  const parts: Array<{ text: string } | { blankId: string }> = [];
  let lastIndex = 0;
  for (const match of content.template.matchAll(BLANK_TOKEN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) parts.push({ text: content.template.slice(lastIndex, index) });
    parts.push({ blankId: match[1] });
    lastIndex = index + match[0].length;
  }
  if (lastIndex < content.template.length) parts.push({ text: content.template.slice(lastIndex) });

  return (
    <div className="space-y-4" data-testid="fill-blank-surface">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-lesson-text-primary">{title}</h2>
        {instruction && <p className="text-sm text-lesson-text-secondary">{instruction}</p>}
        <p className="text-sm text-lesson-text-secondary">{content.prompt}</p>
      </div>

      <p className="rounded-lg border border-lesson-border bg-lesson-surface p-4 font-mono text-sm leading-loose text-lesson-text-primary">
        {parts.map((part, i) =>
          "text" in part ? (
            <Fragment key={i}>{part.text}</Fragment>
          ) : (
            <input
              key={i}
              type="text"
              value={values[part.blankId] ?? ""}
              onChange={(e) => setValue(part.blankId, e.target.value)}
              disabled={readOnly || isResolved}
              placeholder={blankById.get(part.blankId)?.placeholder}
              aria-label={blankById.get(part.blankId)?.hint ?? `Blank ${part.blankId}`}
              style={{ width: `${Math.max(4, (values[part.blankId] ?? blankById.get(part.blankId)?.placeholder ?? "").length + 2)}ch` }}
              className={cn(
                "mx-1 inline-block rounded border-b-2 border-primary/60 bg-lesson-surface-elevated px-1.5 py-0.5 font-mono text-sm text-lesson-text-primary outline-none focus:border-primary",
                "disabled:cursor-not-allowed disabled:opacity-80",
              )}
            />
          ),
        )}
      </p>

      {isResolved && (
        <ComparisonPanel
          expectedLabel="You wrote"
          expected={Object.values(values).join(", ") || "Nothing"}
          actualLabel="Result"
          actual={validationResult?.feedbackMessage ?? (status === "correct" ? "That checks out." : "Not quite — look at the mechanism again.")}
          tone={status === "incorrect" ? "warning" : "success"}
        />
      )}
    </div>
  );
}
