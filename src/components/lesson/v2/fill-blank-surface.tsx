import { Fragment, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ComparisonPanel } from "./comparison-panel";
import type { FillBlankContentV1 } from "@/lib/curriculum/v1/content-schemas";
import type {
  ActivityInteractionStatus,
  ActivityValidationResult,
} from "@/components/lesson/canonical/types";

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
 * When Word Bank options are provided, renders interactive token chips
 * below the snippet allowing learners to tap tokens into blank slots.
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

  const tokenOptions: string[] = useMemo(() => {
    const raw = content.options ?? (content as unknown as { tokenBank?: string[] }).tokenBank;
    return Array.isArray(raw) ? raw : [];
  }, [content]);

  const hasTokenBank = tokenOptions.length > 0;
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  const setValue = (blankId: string, value: string) => {
    if (readOnly || isResolved) return;
    onResponse({ ...values, [blankId]: value });
  };

  const handleTokenClick = (token: string) => {
    if (readOnly || isResolved) return;
    let targetId = selectedSlotId && !values[selectedSlotId] ? selectedSlotId : null;
    if (!targetId) {
      const firstEmpty = content.blanks.find(
        (b) => !values[b.id] || values[b.id].trim().length === 0,
      );
      targetId = firstEmpty ? firstEmpty.id : selectedSlotId || content.blanks[0]?.id;
    }
    if (!targetId) return;
    setValue(targetId, token);

    const remainingEmpty = content.blanks.find(
      (b) => b.id !== targetId && (!values[b.id] || values[b.id].trim().length === 0),
    );
    setSelectedSlotId(remainingEmpty ? remainingEmpty.id : null);
  };

  const usedTokens = useMemo(() => {
    if (!hasTokenBank) return new Set<number>();
    const used = new Set<number>();
    const currentValues = Object.values(values).filter(Boolean);
    for (const val of currentValues) {
      const idx = tokenOptions.findIndex((opt, i) => opt === val && !used.has(i));
      if (idx !== -1) used.add(idx);
    }
    return used;
  }, [hasTokenBank, tokenOptions, values]);

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
        {instruction && instruction.trim().toLowerCase() !== title.trim().toLowerCase() && (
          <p className="text-sm text-lesson-text-secondary">{instruction}</p>
        )}
        {content.prompt &&
          content.prompt.trim().toLowerCase() !== title.trim().toLowerCase() &&
          content.prompt.trim().toLowerCase() !== instruction?.trim().toLowerCase() && (
            <p className="text-sm text-lesson-text-secondary">{content.prompt}</p>
          )}
      </div>

      <p className="rounded-lg border border-lesson-border bg-lesson-surface p-4 font-mono text-sm leading-loose text-lesson-text-primary">
        {parts.map((part, i) =>
          "text" in part ? (
            <Fragment key={i}>{part.text}</Fragment>
          ) : (
            <span key={i} className="inline-flex items-center align-baseline">
              <input
                type="text"
                value={values[part.blankId] ?? ""}
                onFocus={() => setSelectedSlotId(part.blankId)}
                onChange={(e) => setValue(part.blankId, e.target.value)}
                disabled={readOnly || isResolved}
                placeholder={blankById.get(part.blankId)?.placeholder}
                aria-label={blankById.get(part.blankId)?.hint ?? `Blank ${part.blankId}`}
                style={{
                  width: `${Math.max(4, (values[part.blankId] ?? blankById.get(part.blankId)?.placeholder ?? "").length + 2)}ch`,
                }}
                className={cn(
                  "mx-1 inline-block rounded border-b-2 bg-lesson-surface-elevated px-1.5 py-0.5 font-mono text-sm text-lesson-text-primary outline-none transition-all",
                  selectedSlotId === part.blankId
                    ? "border-primary ring-2 ring-primary/40 bg-primary/10"
                    : "border-primary/60 focus:border-primary",
                  "disabled:cursor-not-allowed disabled:opacity-80",
                )}
              />
              {hasTokenBank && values[part.blankId] && !readOnly && !isResolved && (
                <button
                  type="button"
                  onClick={() => {
                    setValue(part.blankId, "");
                    setSelectedSlotId(part.blankId);
                  }}
                  className="text-xs text-lesson-text-muted hover:text-lesson-text-primary px-1 rounded hover:bg-lesson-surface-elevated transition-colors"
                  title="Clear slot"
                  aria-label={`Clear blank ${part.blankId}`}
                >
                  ×
                </button>
              )}
            </span>
          ),
        )}
      </p>

      {hasTokenBank && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-lesson-text-muted font-mono">
              Word Bank
            </span>
            {Object.values(values).some(Boolean) && !readOnly && !isResolved && (
              <button
                type="button"
                onClick={() => onResponse({})}
                className="text-xs text-lesson-text-muted hover:text-lesson-text-primary underline underline-offset-2 transition"
              >
                Clear all
              </button>
            )}
          </div>
          <div
            className="flex flex-wrap gap-2.5 p-3 rounded-xl border border-lesson-border bg-lesson-surface-elevated/40"
            role="group"
            aria-label="Word Bank options"
          >
            {tokenOptions.map((token, idx) => {
              const isUsed = usedTokens.has(idx);
              return (
                <button
                  key={`${token}-${idx}`}
                  type="button"
                  disabled={isUsed || readOnly || isResolved}
                  onClick={() => handleTokenClick(token)}
                  className={cn(
                    "rounded-lg border px-3.5 py-1.5 font-mono text-sm font-semibold transition active:scale-95 select-none shadow-xs",
                    isUsed
                      ? "opacity-30 pointer-events-none cursor-not-allowed border-dashed border-lesson-border bg-lesson-surface-subtle text-lesson-text-muted"
                      : "bg-lesson-surface hover:bg-lesson-surface-elevated text-lesson-text-primary border-lesson-border hover:border-primary/60 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40",
                  )}
                  aria-pressed={isUsed}
                >
                  {token}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {isResolved && (
        <ComparisonPanel
          expectedLabel="You wrote"
          expected={Object.values(values).join(", ") || "Nothing"}
          actualLabel="Result"
          actual={
            validationResult?.feedbackMessage ??
            (status === "correct" ? "That checks out." : "Not quite — look at the mechanism again.")
          }
          tone={status === "incorrect" ? "warning" : "success"}
        />
      )}
    </div>
  );
}
