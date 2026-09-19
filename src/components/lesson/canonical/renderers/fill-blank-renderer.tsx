import { useState, useMemo } from "react";
import type { FillBlankActivity } from "@/lib/curriculum/types";
import type { ActivityRendererProps } from "../types";
import { ActivityContainer } from "../primitives/activity-container";
import { ActivityHeader } from "../primitives/activity-header";
import { ActivityFeedback } from "../primitives/activity-feedback";
import { ActivityActions } from "../primitives/activity-actions";
import { MiniVisualPreview, isVisualHtml } from "../primitives/mini-visual-preview";
import { Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

export function FillBlankRenderer({
  activity,
  state,
  onResponse,
  onSubmit,
  onRetry,
  onContinue,
  onRevealHint,
  readOnly,
}: ActivityRendererProps<FillBlankActivity, string[]>) {
  const { prompt, template, blanks, options, explanation } = activity.content;

  // Blanks state array
  const rawValues = Array.isArray(state.response) ? state.response : [];
  const blankValues = blanks.map((_, idx) => rawValues[idx] || "");

  // Track active target slot for token bank selection
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

  const hasTokenBank = Array.isArray(options) && options.length > 0;

  const isSubmitted =
    state.status === "submitted" || state.status === "correct" || state.status === "incorrect";
  const isCorrect =
    state.status === "correct" ||
    state.status === "completed" ||
    (isSubmitted && state.validationResult?.isValid === true);
  const isIncorrect =
    state.status === "incorrect" || (isSubmitted && state.validationResult?.isValid === false);

  const hintsRemaining = (activity.feedback?.hints?.length || 0) - state.hintsRevealed;

  const handleBlankChange = (index: number, val: string) => {
    if (readOnly || (isSubmitted && isCorrect)) return;
    const next = [...blankValues];
    next[index] = val;
    onResponse(next);
  };

  const handleClearSlot = (index: number) => {
    if (readOnly || (isSubmitted && isCorrect)) return;
    if (!blankValues[index]) {
      setSelectedSlotIndex(index);
      return;
    }
    const next = [...blankValues];
    next[index] = "";
    onResponse(next);
    setSelectedSlotIndex(index);
  };

  const handleTokenSelect = (token: string) => {
    if (readOnly || (isSubmitted && isCorrect)) return;

    // Place into actively selected slot if empty, otherwise into earliest empty slot
    const targetSlot =
      selectedSlotIndex !== null && !blankValues[selectedSlotIndex]
        ? selectedSlotIndex
        : blankValues.findIndex((val) => !val || val.trim().length === 0);

    if (targetSlot === -1) return;

    const next = [...blankValues];
    next[targetSlot] = token;
    onResponse(next);

    // Auto-advance to next empty slot if one remains
    const nextEmpty = next.findIndex((val) => !val || val.trim().length === 0);
    setSelectedSlotIndex(nextEmpty !== -1 ? nextEmpty : null);
  };

  // Determine usage of each option pill in the token bank (handles duplicate values cleanly)
  const optionUsage = useMemo(() => {
    if (!hasTokenBank || !options) return [];
    const counts: Record<string, number> = {};
    for (const val of blankValues) {
      if (val) counts[val] = (counts[val] || 0) + 1;
    }

    const seen: Record<string, number> = {};
    return options.map((opt) => {
      seen[opt] = (seen[opt] || 0) + 1;
      return seen[opt] <= (counts[opt] || 0);
    });
  }, [hasTokenBank, options, blankValues]);

  const allFilled = blankValues.every((val) => val.trim().length > 0);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLButtonElement>) => {
    if (e.key === "Enter" && allFilled && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };

  // Determine presentation mode (Code vs Conceptual)
  const isCodeBlank = Boolean(
    template.includes("const ") ||
    template.includes("let ") ||
    template.includes("<") ||
    template.includes("{") ||
    template.includes(";") ||
    template.includes("function") ||
    template.includes("=>"),
  );

  // Dual-syntax template tokenizer: supports {{identifier}} and runs of underscores (_{2,})
  const tokens = useMemo(() => {
    const BLANK_REGEX = /(\{\{[a-zA-Z0-9_.-]+\}\}|_{2,})/g;
    const result: Array<
      { type: "text"; text: string } | { type: "blank"; blankIndex: number; blankId: string }
    > = [];

    let lastIdx = 0;
    let ordinal = 0;

    for (const match of template.matchAll(BLANK_REGEX)) {
      const matchIndex = match.index ?? 0;
      if (matchIndex > lastIdx) {
        result.push({
          type: "text",
          text: template.slice(lastIdx, matchIndex),
        });
      }

      const matchedStr = match[0];
      let assignedIndex = -1;
      let assignedId = "";

      if (matchedStr.startsWith("{{") && matchedStr.endsWith("}}")) {
        const identifier = matchedStr.slice(2, -2).trim();
        const found = blanks.findIndex((b) => b.id === identifier);
        if (found !== -1) {
          assignedIndex = found;
          assignedId = identifier;
        } else if (
          !isNaN(Number(identifier)) &&
          Number(identifier) >= 0 &&
          Number(identifier) < blanks.length
        ) {
          assignedIndex = Number(identifier);
          assignedId = blanks[assignedIndex]?.id ?? identifier;
        }
      }

      if (assignedIndex === -1) {
        assignedIndex = ordinal;
        assignedId = blanks[ordinal]?.id ?? `blank-${ordinal + 1}`;
      }
      ordinal++;

      result.push({
        type: "blank",
        blankIndex: assignedIndex,
        blankId: assignedId,
      });

      lastIdx = matchIndex + matchedStr.length;
    }

    if (lastIdx < template.length) {
      result.push({
        type: "text",
        text: template.slice(lastIdx),
      });
    }

    return result;
  }, [template, blanks]);

  // Reconstruct completed code from tokens and current blank answers
  const reconstructedCode = useMemo(() => {
    return tokens
      .map((token) => {
        if (token.type === "text") return token.text;
        return blankValues[token.blankIndex] || "";
      })
      .join("");
  }, [tokens, blankValues]);

  const shouldShowLivePreview =
    isSubmitted && isCorrect && isVisualHtml(reconstructedCode, activity.content.language);

  const parsedBlanksCount = tokens.filter((t) => t.type === "blank").length;
  const canRenderInline = parsedBlanksCount > 0;

  return (
    <ActivityContainer id={`activity-${activity.id}`} variant="standard">
      <ActivityHeader
        activity={activity}
        onRevealHint={onRevealHint}
        hintsRemaining={hintsRemaining}
      />

      <div className="p-6 md:p-10 flex flex-col gap-8">
        {/* Header Instructions */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-primary/80 font-mono">
            {hasTokenBank ? "Word Bank Challenge" : "Fill in the Blanks"}
          </span>
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground leading-snug">
            {prompt}
          </h2>
        </div>

        {/* Dynamic Spatial Layout */}
        {canRenderInline ? (
          <div
            className={cn(
              "p-6 md:p-8 rounded-2xl border transition-all duration-300 shadow-xs",
              isCodeBlank
                ? "bg-zinc-950 text-zinc-100 font-mono border-zinc-800"
                : "bg-muted/10 text-foreground border-lesson-border leading-relaxed font-mono",
            )}
          >
            <div className="whitespace-pre-wrap leading-loose text-base md:text-lg">
              {tokens.map((token, idx) => {
                if (token.type === "text") {
                  return <span key={idx}>{token.text}</span>;
                }

                const blankIdx = token.blankIndex;
                const blank = blanks[blankIdx];
                const value = blankValues[blankIdx] || "";
                const isSelected = selectedSlotIndex === blankIdx;

                return (
                  <span key={idx} className="inline-block relative group align-baseline">
                    {hasTokenBank ? (
                      /* Clickable Token Slot */
                      <button
                        type="button"
                        disabled={readOnly || (isSubmitted && isCorrect)}
                        onClick={() => handleClearSlot(blankIdx)}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace" || e.key === "Delete") {
                            e.preventDefault();
                            handleClearSlot(blankIdx);
                          } else {
                            handleKeyDown(e);
                          }
                        }}
                        className={cn(
                          "inline-flex items-center justify-center min-w-[72px] h-9 px-3 mx-1 rounded-lg border text-sm font-mono font-medium transition-all align-middle select-none",
                          !value &&
                            (isSelected
                              ? "border-primary ring-2 ring-primary/40 bg-primary/10 text-primary shadow-xs"
                              : "border-dashed border-muted-foreground/40 bg-muted/20 text-muted-foreground hover:border-primary/50 hover:bg-muted/30"),
                          value &&
                            (isSubmitted && isCorrect
                              ? "border-solid border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold"
                              : isSubmitted && isIncorrect
                                ? "border-solid border-rose-500 bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold"
                                : "border-solid border-primary/60 bg-primary/10 text-primary font-semibold hover:bg-primary/20 cursor-pointer shadow-xs"),
                        )}
                        aria-label={`Blank ${blankIdx + 1}: ${value || blank?.placeholder || "empty slot"}`}
                      >
                        {value ? (
                          <span className="flex items-center gap-1.5">
                            <span>{value}</span>
                            {!readOnly && !(isSubmitted && isCorrect) && (
                              <span className="text-xs opacity-50 hover:opacity-100 font-sans leading-none">
                                ×
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-xs opacity-60 font-sans">
                            {blank?.placeholder || `...`}
                          </span>
                        )}
                      </button>
                    ) : (
                      /* Freeform Text Input */
                      <input
                        type="text"
                        value={value}
                        disabled={readOnly || (isSubmitted && isCorrect)}
                        placeholder={blank?.placeholder || "..."}
                        style={{
                          width: `${Math.max(value.length || (blank?.placeholder || "").length || 4, 6) * 10 + 28}px`,
                        }}
                        onChange={(e) => handleBlankChange(blankIdx, e.target.value)}
                        onKeyDown={handleKeyDown}
                        className={cn(
                          "h-10 px-3 mx-1 rounded-lg border text-center text-base font-semibold focus:outline-none focus:ring-2 transition-all shadow-xs min-w-[70px] max-w-full align-middle inline-block",
                          isCodeBlank
                            ? "bg-zinc-900 border-zinc-700 text-amber-400 focus:ring-primary focus:border-primary"
                            : "bg-background border-lesson-border text-foreground focus:ring-primary focus:border-primary",
                          isSubmitted &&
                            isCorrect &&
                            "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold focus:ring-emerald-500",
                          isSubmitted &&
                            isIncorrect &&
                            "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold focus:ring-rose-500",
                        )}
                        aria-label={`Blank ${blankIdx + 1}: ${blank?.placeholder || blank?.id || ""}`}
                      />
                    )}

                    {blank?.hint && isIncorrect && (
                      <span className="absolute left-1/2 -translate-x-1/2 -top-9 bg-amber-600 dark:bg-amber-500 text-white text-[11px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-10">
                        Hint: {blank.hint}
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        ) : (
          /* Fallback view if template contains no recognizable blank markers */
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-zinc-950 text-zinc-100 font-mono border border-zinc-800 text-sm leading-relaxed overflow-x-auto">
              <pre className="whitespace-pre-wrap">{template}</pre>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {blanks.map((blank, idx) => (
                <div
                  key={blank.id}
                  className="flex flex-col gap-2 p-4 rounded-xl border border-lesson-border bg-muted/5 shadow-xs"
                >
                  <label
                    htmlFor={`fallback-input-${idx}`}
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono"
                  >
                    Blank #{idx + 1} {blank.placeholder ? `(${blank.placeholder})` : ""}
                  </label>
                  {hasTokenBank ? (
                    <button
                      type="button"
                      disabled={readOnly || (isSubmitted && isCorrect)}
                      onClick={() => handleClearSlot(idx)}
                      className={cn(
                        "h-11 px-3 rounded-lg border text-base font-mono font-medium transition-all w-full flex items-center justify-between",
                        !blankValues[idx] &&
                          "border-dashed border-muted-foreground/40 bg-muted/20 text-muted-foreground",
                        blankValues[idx] &&
                          "border-solid border-primary/60 bg-primary/10 text-primary",
                      )}
                    >
                      <span>{blankValues[idx] || "Select from Word Bank below"}</span>
                      {blankValues[idx] && <span>×</span>}
                    </button>
                  ) : (
                    <input
                      id={`fallback-input-${idx}`}
                      value={blankValues[idx] || ""}
                      disabled={readOnly || (isSubmitted && isCorrect)}
                      placeholder={blank.placeholder || "Enter answer..."}
                      onChange={(e) => handleBlankChange(idx, e.target.value)}
                      onKeyDown={handleKeyDown}
                      className={cn(
                        "font-mono text-base h-11 px-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all w-full",
                        isCorrect &&
                          "border-emerald-500 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300",
                        isIncorrect &&
                          "border-rose-500 bg-rose-500/5 text-rose-800 dark:text-rose-300",
                      )}
                      aria-label={`Blank ${idx + 1}: ${blank.placeholder || blank.id}`}
                    />
                  )}
                  {blank.hint && isIncorrect && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 animate-in fade-in flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                      <span>Hint: {blank.hint}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mimo-Style Token Bank (Options Pills) */}
        {hasTokenBank && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                Word Bank
              </span>
              {blankValues.some(Boolean) && !readOnly && !(isSubmitted && isCorrect) && (
                <button
                  type="button"
                  onClick={() => {
                    onResponse(blanks.map(() => ""));
                    setSelectedSlotIndex(0);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition"
                >
                  Reset all slots
                </button>
              )}
            </div>
            <div
              className="flex flex-wrap gap-2.5 p-4 rounded-xl border border-border bg-card/60"
              role="group"
              aria-label="Word Bank options"
            >
              {options.map((option, optIdx) => {
                const isUsed = optionUsage[optIdx];
                return (
                  <button
                    key={`${option}-${optIdx}`}
                    type="button"
                    disabled={isUsed || readOnly || (isSubmitted && isCorrect)}
                    onClick={() => handleTokenSelect(option)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 font-mono text-sm font-medium transition active:scale-95 select-none",
                      isUsed
                        ? "opacity-30 pointer-events-none cursor-not-allowed border-dashed border-muted-foreground/30 bg-muted/20 text-muted-foreground"
                        : "bg-card hover:bg-muted text-foreground border-border hover:border-primary/50 shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40",
                    )}
                    aria-pressed={isUsed}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Static Hint helper listing if mistakes are made */}
        {isIncorrect && blanks.some((b) => b.hint) && (
          <div className="p-4 rounded-xl border border-amber-500/10 bg-amber-500/5 text-xs text-foreground/90 space-y-2 animate-in fade-in">
            <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400 font-mono uppercase tracking-wider">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Diagnostic Hints</span>
            </div>
            <ul className="list-disc list-inside space-y-1">
              {blanks.map((b, idx) =>
                b.hint ? (
                  <li key={b.id} className="leading-relaxed">
                    <strong>
                      Blank #{idx + 1} ({b.placeholder || b.id}):
                    </strong>{" "}
                    {b.hint}
                  </li>
                ) : null,
              )}
            </ul>
          </div>
        )}

        {/* Live Visual Preview (Revealed on Correct Completion) */}
        {shouldShowLivePreview && (
          <div className="space-y-2 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono">
                Output Preview
              </span>
            </div>
            <div className="rounded-2xl border border-emerald-500/30 bg-card/80 p-4 shadow-xs">
              <MiniVisualPreview
                code={reconstructedCode}
                language={activity.content.language || (isCodeBlank ? "html" : undefined)}
              />
            </div>
          </div>
        )}

        {/* Feedback Section */}
        <ActivityFeedback
          status={state.status}
          validationResult={state.validationResult}
          hints={activity.feedback?.hints}
          hintsRevealed={state.hintsRevealed}
          explanation={explanation}
        />
      </div>

      <ActivityActions
        status={state.status}
        onSubmit={onSubmit}
        onRetry={onRetry}
        onContinue={onContinue}
        canSubmit={allFilled}
      />
    </ActivityContainer>
  );
}
