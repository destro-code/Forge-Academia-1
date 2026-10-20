import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Code2, Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type NodeStatus = "mastered" | "active" | "available" | "locked";

export interface ConstellationNode {
  key: string;
  lessonId: string;
  title: string;
  status: NodeStatus;
}

interface PathConstellationProps {
  pathDomain: string;
  pathTitle: string;
  percent: number;
  nodes: ConstellationNode[];
}

/* Fixed zig-zag coordinates (percent of the plotting box) that read as a rising,
   dipping path — the active node sits high near the center. */
const POSITIONS: { x: number; y: number }[] = [
  { x: 13, y: 74 },
  { x: 30, y: 50 },
  { x: 45, y: 70 },
  { x: 60, y: 34 },
  { x: 77, y: 56 },
  { x: 90, y: 26 },
];

export function PathConstellation({
  pathDomain,
  pathTitle,
  percent,
  nodes,
}: PathConstellationProps) {
  const plotted = nodes.slice(0, POSITIONS.length).map((node, i) => ({
    ...node,
    index: i,
    pos: POSITIONS[i],
  }));

  const defaultNode =
    plotted.find((n) => n.status === "active") ||
    plotted.find((n) => n.status === "available") ||
    plotted[0];

  const [selectedKey, setSelectedKey] = useState<string | undefined>(defaultNode?.key);
  const inspectedNode = plotted.find((n) => n.key === selectedKey) || defaultNode;

  return (
    <section
      aria-label="Your path"
      className="overflow-hidden rounded-xl border border-border bg-card shadow-xs"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-4 pt-4 sm:px-6 sm:pt-5">
        <div className="min-w-0">
          <div className="font-mono text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Path / {pathDomain}
          </div>
          <h2 className="mt-1 truncate font-serif text-xl sm:text-2xl font-medium tracking-tight text-foreground">
            {pathTitle}
          </h2>
        </div>
        <div className="shrink-0 text-right">
          <div className="font-mono text-base sm:text-lg font-semibold tabular-nums text-primary">
            {percent}%
          </div>
          <div className="font-mono text-[10px] text-muted-foreground">complete</div>
        </div>
      </div>

      {/* Progress rail */}
      <div className="mt-3 px-4 sm:px-6">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${Math.max(2, percent)}%` }}
          />
        </div>
      </div>

      {/* Constellation Canvas */}
      <div className="relative mt-4 px-4 pb-4 sm:px-6">
        <div className="mb-1 flex items-center justify-between font-mono text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
          <span>
            Interactive Constellation <span aria-hidden="true">→</span>
          </span>
          <span className="text-[10px] normal-case tracking-normal text-muted-foreground">
            Tap any node to inspect
          </span>
        </div>

        <div className="relative h-56 w-full sm:h-64">
          {/* Connector lines */}
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {plotted.slice(1).map((node, i) => {
              const prev = plotted[i].pos;
              const cur = node.pos;
              const isCompletedEdge =
                plotted[i].status === "mastered" &&
                (node.status === "mastered" || node.status === "active");
              return (
                <line
                  key={node.key}
                  x1={prev.x}
                  y1={prev.y}
                  x2={cur.x}
                  y2={cur.y}
                  stroke="currentColor"
                  className={isCompletedEdge ? "text-primary/60" : "text-border"}
                  strokeWidth={isCompletedEdge ? 0.8 : 0.5}
                  strokeDasharray={isCompletedEdge ? undefined : "2 2"}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </svg>

          {/* Nodes with Visible Touch Labels */}
          {plotted.map((node) => (
            <ConstellationDot
              key={node.key}
              node={node}
              isSelected={inspectedNode?.key === node.key}
              onSelect={() => setSelectedKey(node.key)}
            />
          ))}
        </div>

        {/* Touch-First Active/Selected Node Preview Bar */}
        {inspectedNode && (
          <div className="mt-2 flex flex-col gap-2.5 rounded-xl border border-border/80 bg-muted/25 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="rounded bg-primary/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary">
                  NODE {String(inspectedNode.index + 1).padStart(2, "0")}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {inspectedNode.status === "active"
                    ? "Active Focus"
                    : inspectedNode.status === "mastered"
                      ? "Verified"
                      : inspectedNode.status === "available"
                        ? "Ready"
                        : "Locked"}
                </span>
              </div>
              <p className="mt-1 truncate text-xs sm:text-sm font-semibold text-foreground">
                {inspectedNode.title}
              </p>
            </div>

            {inspectedNode.status !== "locked" ? (
              <Link
                to="/lesson/$lessonId"
                params={{ lessonId: inspectedNode.lessonId }}
                search={{ mode: "curriculum" }}
                className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-3.5 text-xs font-semibold text-primary-foreground shadow-xs transition-transform hover:bg-primary/90 active:scale-98"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>
                  {inspectedNode.status === "mastered" ? "Review Lesson" : "Launch Studio"}
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <span className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card/60 px-3 font-mono text-[11px] text-muted-foreground">
                <Lock className="h-3 w-3" /> Complete prior step
              </span>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border/60 pt-2.5 font-mono text-[11px] text-muted-foreground">
          <LegendItem className="bg-muted-foreground/60" label="Mastered" />
          <LegendItem className="bg-primary" label="In progress" />
          <LegendItem className="bg-muted-foreground/30" label="Locked" />
        </div>
      </div>
    </section>
  );
}

function LegendItem({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("h-2 w-2 rounded-full", className)} aria-hidden="true" />
      {label}
    </span>
  );
}

function ConstellationDot({
  node,
  isSelected,
  onSelect,
}: {
  node: ConstellationNode & { index: number; pos: { x: number; y: number } };
  isSelected: boolean;
  onSelect: () => void;
}) {
  const isActive = node.status === "active";
  const isLocked = node.status === "locked";
  const isMastered = node.status === "mastered";

  const size = isActive ? "h-12 w-12 sm:h-15 sm:w-15" : "h-9 w-9 sm:h-11 sm:w-11";

  const style = {
    left: `${node.pos.x}%`,
    top: `${node.pos.y}%`,
  } as const;

  const shortTitle =
    node.title.length > 14 ? `${node.title.slice(0, 12).trim()}…` : node.title;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 focus-visible:outline-none"
      style={style}
      aria-label={`${node.title} — ${node.status}`}
      title={node.title}
    >
      <span
        className={cn(
          "grid place-items-center rounded-full border transition-all duration-150 active:scale-95",
          size,
          isActive && "node-active-glow border-primary bg-primary text-primary-foreground",
          isMastered && "border-border bg-secondary text-muted-foreground",
          node.status === "available" &&
            "border-primary/40 bg-card text-foreground hover:border-primary hover:text-primary",
          isLocked && "border-dashed border-border bg-card/60 text-muted-foreground/50",
          isSelected && !isActive && "ring-2 ring-primary ring-offset-2 ring-offset-card",
        )}
      >
        {isActive ? (
          <Code2 className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
        ) : isMastered ? (
          <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
        ) : isLocked ? (
          <Lock className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
        ) : (
          <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
        )}
      </span>

      {/* Always-visible Touch Label Pill */}
      <span
        className={cn(
          "max-w-[82px] sm:max-w-[110px] truncate rounded-md border px-1.5 py-0.5 font-mono text-[9px] sm:text-[10px] leading-tight transition-colors",
          isActive || isSelected
            ? "border-primary/50 bg-primary/15 font-semibold text-foreground shadow-2xs"
            : "border-border/60 bg-background/85 text-muted-foreground backdrop-blur-xs",
        )}
      >
        {String(node.index + 1).padStart(2, "0")} · {shortTitle}
      </span>
    </button>
  );
}
