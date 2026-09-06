import { useEffect, useMemo, useState } from "react";
import type { OrderingActivity } from "@/lib/curriculum/types";
import type { ActivityRendererProps } from "../types";
import { ActivityContainer } from "../primitives/activity-container";
import { ActivityHeader } from "../primitives/activity-header";
import { ActivityFeedback } from "../primitives/activity-feedback";
import { ActivityActions } from "../primitives/activity-actions";
import { MovementScene } from "../primitives/movement-scene";
import { Button } from "@/components/ui/button";
import {
  Workflow,
  ListOrdered,
  ShieldCheck,
  GitBranch,
  Layers,
  ChevronUp,
  ChevronDown,
  GripVertical,
  CheckCircle2,
  XCircle,
  ArrowDownUp,
  ArrowDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function OrderingRenderer({
  activity,
  state,
  onResponse,
  onSubmit,
  onRetry,
  onContinue,
  onRevealHint,
  readOnly,
  className,
  experienceComposition,
}: ActivityRendererProps<OrderingActivity, string[]>) {
  const { prompt, items, explanation } = activity.content;

  // Initialize or maintain current order
  const currentItemIds: string[] = useMemo(() => {
    if (Array.isArray(state.response) && state.response.length === items.length) {
      return state.response;
    }
    const initial = [...items].sort((a, b) => (a.initialOrder || 0) - (b.initialOrder || 0));
    return initial.map((i) => i.id);
  }, [state.response, items]);

  // Sync initial response if not set
  useEffect(() => {
    if (!state.response || state.response.length !== items.length) {
      onResponse(currentItemIds);
    }
  }, [currentItemIds, state.response, onResponse, items.length]);

  const isSubmitted =
    state.status === "submitted" || state.status === "correct" || state.status === "incorrect";
  const isCorrect = state.status === "correct" || state.status === "completed";
  const isIncorrect = state.status === "incorrect";

  const hintsRemaining = (activity.feedback?.hints?.length || 0) - state.hintsRevealed;

  // Interaction and drag tracking
  const [hasInteracted, setHasInteracted] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const eyebrowConfig = (() => {
    if (experienceComposition?.badgeText) {
      return {
        label: experienceComposition.badgeText,
        tagline: experienceComposition.prompt || "Reconstruct the operational sequence",
        icon: Workflow,
      };
    }
    switch (activity.intent) {
      case "application":
        return {
          label: "Process Reconstruction",
          tagline: "Reconstruct the execution order of the system mechanism",
          icon: Workflow,
        };
      case "retrieval":
        return {
          label: "Sequence Recall",
          tagline: "Reconstruct the chronological stages of the technical workflow",
          icon: ListOrdered,
        };
      case "assessment":
        return {
          label: "Execution Verification",
          tagline: "Sequence each phase according to technical specification",
          icon: ShieldCheck,
        };
      case "prediction":
        return {
          label: "Causal Progression",
          tagline: "Arrange the sequential events as cause leads to effect",
          icon: GitBranch,
        };
      default:
        return {
          label: "Mechanism Sequence",
          tagline: "Arrange the technical components into operational sequence",
          icon: Layers,
        };
    }
  })();

  const moveItem = (index: number, direction: "up" | "down") => {
    if (readOnly || (isSubmitted && isCorrect)) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentItemIds.length) return;

    const next = [...currentItemIds];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    setHasInteracted(true);
    onResponse(next);
  };

  const handleItemKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (readOnly || (isSubmitted && isCorrect)) return;
    if (e.key === "ArrowUp" && (e.altKey || e.ctrlKey)) {
      e.preventDefault();
      moveItem(index, "up");
    } else if (e.key === "ArrowDown" && (e.altKey || e.ctrlKey)) {
      e.preventDefault();
      moveItem(index, "down");
    }
  };

  const itemMap = useMemo(() => {
    return new Map(items.map((item) => [item.id, item]));
  }, [items]);

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (readOnly || (isSubmitted && isCorrect)) {
      e.preventDefault();
      return;
    }
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const next = [...currentItemIds];
    const draggedId = next[draggedIndex];
    next.splice(draggedIndex, 1);
    next.splice(index, 0, draggedId);
    setDraggedIndex(index);
    setHasInteracted(true);
    onResponse(next);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <ActivityContainer id={`activity-${activity.id}`} variant="standard" className={className}>
      <ActivityHeader
        activity={activity}
        onRevealHint={onRevealHint}
        hintsRemaining={hintsRemaining}
      />

      <MovementScene className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-8 sm:py-8 flex flex-col gap-6">
        {/* Dominant Investigation Prompt Surface */}
        <header className="space-y-2.5">
          <div className="inline-flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-[0.14em] text-lesson-accent flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-lesson-accent/30 bg-lesson-accent/10">
              <eyebrowConfig.icon className="w-3.5 h-3.5" />
              <span>{eyebrowConfig.label}</span>
            </span>
            <span className="text-xs text-lesson-text-muted hidden sm:inline">
              {eyebrowConfig.tagline}
            </span>
          </div>

          <h2
            id={`prompt-${activity.id}`}
            className="text-xl sm:text-2xl lg:text-[1.75rem] font-bold leading-snug tracking-tight text-lesson-text-primary text-pretty"
          >
            {prompt}
          </h2>
        </header>

        {/* Reconstruction Header */}
        <div className="flex items-center justify-between text-xs font-medium text-lesson-text-muted">
          <span className="flex items-center gap-1.5">
            <ArrowDownUp className="w-3.5 h-3.5 text-lesson-accent" />
            <span>Reconstruct the sequence from first to last step</span>
          </span>
          <span className="font-mono text-[11px] text-lesson-text-muted">
            {items.length} {items.length === 1 ? "step" : "steps"} total
          </span>
        </div>

        {/* Ordered Process Flow with Semantic <ol> */}
        <ol
          id={`ordering-list-${activity.id}`}
          className="space-y-2.5"
          aria-labelledby={`prompt-${activity.id}`}
        >
          <AnimatePresence initial={false}>
            {currentItemIds.map((id, index) => {
              const item = itemMap.get(id);
              if (!item) return null;

              const isDragging = draggedIndex === index;

              // Card styling
              let cardStyle =
                "border-lesson-border bg-lesson-surface text-lesson-text-primary hover:border-lesson-border-elevated hover:bg-lesson-surface-elevated";
              let stepNumberStyle =
                "border-lesson-border/60 bg-lesson-surface-elevated text-lesson-accent";

              if (isDragging) {
                cardStyle =
                  "border-lesson-accent bg-lesson-accent/10 ring-2 ring-lesson-accent/40 shadow-md opacity-90 scale-[1.01]";
                stepNumberStyle = "border-lesson-accent bg-lesson-accent text-white";
              } else if (isSubmitted) {
                if (isCorrect) {
                  cardStyle =
                    "border-emerald-500/80 bg-emerald-500/5 text-lesson-text-primary ring-1 ring-emerald-500/30";
                  stepNumberStyle =
                    "border-emerald-500/60 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
                } else if (isIncorrect) {
                  cardStyle =
                    "border-rose-500/80 bg-rose-500/5 text-lesson-text-primary ring-1 ring-rose-500/30";
                  stepNumberStyle =
                    "border-rose-500/60 bg-rose-500/10 text-rose-600 dark:text-rose-400";
                }
              }

              return (
                <motion.li
                  key={item.id}
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                  className="list-none flex flex-col gap-1.5"
                >
                  <div
                    role="listitem"
                    draggable={!readOnly && (!isSubmitted || isIncorrect)}
                    onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, index)}
                    onDragOver={(e) => handleDragOver(e as React.DragEvent, index)}
                    onDragEnd={handleDragEnd}
                    onKeyDown={(e) => handleItemKeyDown(e, index)}
                    className={cn(
                      "flex items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl border text-left transition-all relative overflow-hidden group select-none shadow-xs min-h-[64px]",
                      cardStyle,
                      !readOnly &&
                        (!isSubmitted || isIncorrect) &&
                        "cursor-grab active:cursor-grabbing",
                    )}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      {/* Step Number & Desktop Drag Handle */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div
                          className={cn(
                            "w-9 h-9 sm:w-10 sm:h-10 rounded-xl font-mono font-bold text-xs sm:text-sm flex items-center justify-center border transition-colors shadow-xs",
                            stepNumberStyle,
                          )}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </div>
                        {!readOnly && (!isSubmitted || isIncorrect) && (
                          <GripVertical
                            aria-hidden="true"
                            className="w-4 h-4 text-lesson-text-muted/40 group-hover:text-lesson-text-muted/80 transition-colors hidden sm:block shrink-0 cursor-grab"
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 font-mono text-sm sm:text-base text-lesson-text-primary leading-relaxed break-words select-text">
                        {item.text}
                      </div>
                    </div>

                    {/* Accessible 44px Movement Controls */}
                    {!readOnly && (!isSubmitted || isIncorrect) && (
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={index === 0}
                          onClick={() => moveItem(index, "up")}
                          aria-label={`Move step ${index + 1} "${item.text}" up`}
                          className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-xl text-lesson-text-muted hover:text-lesson-text-primary hover:bg-lesson-surface-elevated border border-lesson-border/40 focus-visible:ring-2 focus-visible:ring-lesson-accent focus-visible:outline-none transition-colors disabled:opacity-20 disabled:pointer-events-none"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={index === currentItemIds.length - 1}
                          onClick={() => moveItem(index, "down")}
                          aria-label={`Move step ${index + 1} "${item.text}" down`}
                          className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-xl text-lesson-text-muted hover:text-lesson-text-primary hover:bg-lesson-surface-elevated border border-lesson-border/40 focus-visible:ring-2 focus-visible:ring-lesson-accent focus-visible:outline-none transition-colors disabled:opacity-20 disabled:pointer-events-none"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Sequence Connector */}
                  {index < currentItemIds.length - 1 && (
                    <div
                      aria-hidden="true"
                      className="flex items-center justify-center py-0.5 text-lesson-text-muted/30 select-none"
                    >
                      <div className="flex items-center gap-1.5 text-[10px] font-mono">
                        <span className="w-3.5 h-px bg-lesson-border/60" />
                        <ArrowDown className="w-3 h-3 text-lesson-accent/50" />
                        <span className="w-3.5 h-px bg-lesson-border/60" />
                      </div>
                    </div>
                  )}
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ol>

        {/* Commitment or Guidance Strip before submission */}
        {!isSubmitted &&
          (hasInteracted ? (
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-lesson-border bg-lesson-surface/80 text-xs animate-in fade-in duration-150">
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-2 w-2 rounded-full bg-lesson-accent shrink-0 animate-pulse" />
                <span className="truncate text-lesson-text-muted">
                  Sequence constructed:{" "}
                  <span className="font-mono text-lesson-text-primary font-semibold">
                    {items.length} steps arranged
                  </span>
                </span>
              </div>
              <span className="hidden sm:inline-flex shrink-0 font-mono text-[11px] uppercase tracking-wider text-lesson-accent font-medium">
                Ready to evaluate • Click Check Answer
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-dashed border-lesson-border/80 bg-lesson-surface/40 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <ListOrdered className="w-3.5 h-3.5 text-lesson-accent shrink-0" />
                <span className="text-lesson-text-muted">
                  Reconstruct the sequence: arrange the technical steps into execution order.
                </span>
              </div>
              <span className="hidden sm:inline-flex shrink-0 font-mono text-[10px] uppercase tracking-wider text-lesson-text-muted">
                Use buttons or drag
              </span>
            </div>
          ))}

        {/* Evaluated Sequence Results (Restrained Semantic Treatments) */}
        {isSubmitted && isCorrect && (
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs animate-in fade-in duration-150">
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-emerald-800 dark:text-emerald-200 font-medium">
                Mechanism Sequence Verified — all steps positioned in correct execution order.
              </span>
            </div>
            <span className="hidden sm:inline-flex shrink-0 font-mono text-[11px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold">
              Correct Sequence
            </span>
          </div>
        )}

        {isSubmitted && isIncorrect && (
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs animate-in fade-in duration-150">
            <div className="flex items-center gap-2 min-w-0">
              <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span className="text-rose-800 dark:text-rose-200 font-medium">
                Sequence Incomplete or Out of Order — review mechanism flow and retry.
              </span>
            </div>
            <span className="hidden sm:inline-flex shrink-0 font-mono text-[11px] uppercase tracking-wider text-rose-600 dark:text-rose-400 font-semibold">
              Needs Revision
            </span>
          </div>
        )}

        {/* Authoritative Feedback Section */}
        <ActivityFeedback
          status={state.status}
          validationResult={state.validationResult}
          hints={activity.feedback?.hints}
          hintsRevealed={state.hintsRevealed}
          explanation={explanation}
        />
      </MovementScene>

      <ActivityActions
        status={state.status}
        onSubmit={onSubmit}
        onRetry={onRetry}
        onContinue={onContinue}
        canSubmit={currentItemIds.length === items.length}
      />
    </ActivityContainer>
  );
}
