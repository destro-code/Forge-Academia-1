import { useState } from "react";
import { LayoutGrid, RotateCcw, Columns3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FlexGridStudioConfig {
  initialMode?: "flex" | "grid";
  initialDirection?: "row" | "column";
  initialJustify?: "flex-start" | "center" | "space-between" | "space-around";
  initialAlign?: "stretch" | "center" | "flex-start";
  initialGap?: number;
  initialGridCols?: "2-col" | "3-col" | "auto-fit";
}

const SAMPLE_CARDS = [
  { id: "1", title: "Navigation", metric: "48px height", badge: "Header" },
  { id: "2", title: "Hero Feature", metric: "2fr primary", badge: "Focal" },
  { id: "3", title: "Metric Tile", metric: "99.9% uptime", badge: "Data" },
  { id: "4", title: "Action Panel", metric: "CTA + status", badge: "Interactive" },
];

export function FlexGridStudio({
  config,
  visualData,
}: {
  config?: FlexGridStudioConfig;
  visualData?: Record<string, unknown>;
}) {
  const merged = { ...(visualData as FlexGridStudioConfig), ...config };
  const [mode, setMode] = useState<"flex" | "grid">(merged.initialMode ?? "flex");
  const [direction, setDirection] = useState<"row" | "column">(merged.initialDirection ?? "row");
  const [justify, setJustify] = useState<
    "flex-start" | "center" | "space-between" | "space-around"
  >(merged.initialJustify ?? "space-between");
  const [align, setAlign] = useState<"stretch" | "center" | "flex-start">(
    merged.initialAlign ?? "stretch",
  );
  const [gap, setGap] = useState<number>(merged.initialGap ?? 16);
  const [gridCols, setGridCols] = useState<"2-col" | "3-col" | "auto-fit">(
    merged.initialGridCols ?? "2-col",
  );

  const handleReset = () => {
    setMode(merged.initialMode ?? "flex");
    setDirection(merged.initialDirection ?? "row");
    setJustify(merged.initialJustify ?? "space-between");
    setAlign(merged.initialAlign ?? "stretch");
    setGap(merged.initialGap ?? 16);
    setGridCols(merged.initialGridCols ?? "2-col");
  };

  const gridTemplateColumns =
    gridCols === "2-col"
      ? "repeat(2, minmax(0, 1fr))"
      : gridCols === "3-col"
        ? "repeat(3, minmax(0, 1fr))"
        : "repeat(auto-fit, minmax(150px, 1fr))";

  return (
    <div
      className="grid gap-6 rounded-xl border border-lesson-border bg-lesson-surface p-5 sm:p-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]"
      data-testid="flex-grid-studio"
    >
      {/* Left: Live Layout Canvas */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-lesson-border bg-lesson-bg/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-lesson-border pb-3">
          <div className="flex items-center gap-2 text-xs text-lesson-text-secondary">
            <LayoutGrid className="h-4 w-4 text-emerald-500" />
            <span className="font-semibold text-lesson-text-primary">
              Live Flexbox &amp; CSS Grid Workbench
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">display: {mode}</span>
          </div>
          <span className="font-mono text-xs tabular-nums text-lesson-text-muted">
            gap: {gap}px
          </span>
        </div>

        {/* Interactive Container Stage */}
        <div className="min-h-[270px] rounded-xl border border-dashed border-emerald-500/40 bg-lesson-surface/70 p-4">
          <div
            style={
              mode === "flex"
                ? {
                    display: "flex",
                    flexDirection: direction,
                    justifyContent: justify,
                    alignItems: align,
                    flexWrap: "wrap",
                    gap: `${gap}px`,
                    minHeight: "230px",
                  }
                : {
                    display: "grid",
                    gridTemplateColumns,
                    alignItems: align,
                    gap: `${gap}px`,
                    minHeight: "230px",
                  }
            }
          >
            {SAMPLE_CARDS.map((card, idx) => (
              <div
                key={card.id}
                className="flex min-w-[135px] flex-col justify-between rounded-lg border border-lesson-border bg-lesson-bg p-3.5 shadow-2xs transition-all duration-150"
              >
                <div className="flex items-center justify-between gap-2 text-[11px] text-lesson-text-muted">
                  <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    0{idx + 1}
                  </span>
                  <span>{card.badge}</span>
                </div>
                <p className="mt-2 text-sm font-semibold text-lesson-text-primary">{card.title}</p>
                <p className="mt-1 font-mono text-[11px] text-lesson-text-secondary tabular-nums">
                  {card.metric}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-lesson-border pt-3 text-xs text-lesson-text-secondary">
          <span>
            {mode === "flex"
              ? "1D axis distribution: items size to content and distribute along the main axis."
              : "2D track system: items snap into explicit column tracks regardless of content length."}
          </span>
        </div>
      </div>

      {/* Right: Control Deck */}
      <div className="flex flex-col justify-between gap-5 rounded-xl border border-lesson-border bg-lesson-bg/40 p-5">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-lesson-text-primary">Layout Controls</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-8 gap-1.5 px-2.5 text-xs text-lesson-text-secondary"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </Button>
          </div>

          {/* Mode switch */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-lesson-text-secondary">Layout Engine</label>
            <div className="grid grid-cols-2 gap-1 rounded-lg border border-lesson-border bg-lesson-surface p-1">
              <button
                type="button"
                onClick={() => setMode("flex")}
                className={cn(
                  "rounded-md px-3 py-1.5 font-mono text-xs font-medium transition-colors whitespace-nowrap",
                  mode === "flex"
                    ? "bg-primary text-primary-foreground"
                    : "text-lesson-text-secondary hover:text-lesson-text-primary",
                )}
              >
                display: flex
              </button>
              <button
                type="button"
                onClick={() => setMode("grid")}
                className={cn(
                  "rounded-md px-3 py-1.5 font-mono text-xs font-medium transition-colors whitespace-nowrap",
                  mode === "grid"
                    ? "bg-primary text-primary-foreground"
                    : "text-lesson-text-secondary hover:text-lesson-text-primary",
                )}
              >
                display: grid
              </button>
            </div>
          </div>

          {mode === "flex" ? (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-lesson-text-secondary">
                  flex-direction (Main Axis)
                </label>
                <div className="grid grid-cols-2 gap-1 rounded-lg border border-lesson-border bg-lesson-surface p-1">
                  {(["row", "column"] as const).map((dir) => (
                    <button
                      key={dir}
                      type="button"
                      onClick={() => setDirection(dir)}
                      className={cn(
                        "rounded-md px-2.5 py-1 font-mono text-xs transition-colors whitespace-nowrap",
                        direction === dir
                          ? "bg-emerald-500/20 font-semibold text-emerald-600 dark:text-emerald-400"
                          : "text-lesson-text-secondary hover:text-lesson-text-primary",
                      )}
                    >
                      {dir}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-lesson-text-secondary">
                  justify-content
                </label>
                <div className="grid grid-cols-2 gap-1 rounded-lg border border-lesson-border bg-lesson-surface p-1">
                  {(["flex-start", "center", "space-between", "space-around"] as const).map((j) => (
                    <button
                      key={j}
                      type="button"
                      onClick={() => setJustify(j)}
                      className={cn(
                        "rounded-md px-2 py-1 font-mono text-[11px] transition-colors whitespace-nowrap",
                        justify === j
                          ? "bg-emerald-500/20 font-semibold text-emerald-600 dark:text-emerald-400"
                          : "text-lesson-text-secondary hover:text-lesson-text-primary",
                      )}
                    >
                      {j}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-lesson-text-secondary">
                grid-template-columns
              </label>
              <div className="grid grid-cols-3 gap-1 rounded-lg border border-lesson-border bg-lesson-surface p-1">
                {(
                  [
                    { id: "2-col", label: "1fr 1fr" },
                    { id: "3-col", label: "repeat(3, 1fr)" },
                    { id: "auto-fit", label: "auto-fit" },
                  ] as const
                ).map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => setGridCols(col.id)}
                    className={cn(
                      "rounded-md px-2 py-1.5 font-mono text-[11px] transition-colors whitespace-nowrap",
                      gridCols === col.id
                        ? "bg-emerald-500/20 font-semibold text-emerald-600 dark:text-emerald-400"
                        : "text-lesson-text-secondary hover:text-lesson-text-primary",
                    )}
                  >
                    {col.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cross-axis align */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-lesson-text-secondary">align-items</label>
            <div className="grid grid-cols-3 gap-1 rounded-lg border border-lesson-border bg-lesson-surface p-1">
              {(["stretch", "center", "flex-start"] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAlign(a)}
                  className={cn(
                    "rounded-md px-2 py-1 font-mono text-[11px] transition-colors whitespace-nowrap",
                    align === a
                      ? "bg-emerald-500/20 font-semibold text-emerald-600 dark:text-emerald-400"
                      : "text-lesson-text-secondary hover:text-lesson-text-primary",
                  )}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Gap slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="fg-gap" className="font-medium text-lesson-text-secondary">
                Track / Item Gap
              </label>
              <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {gap}px
              </span>
            </div>
            <input
              id="fg-gap"
              type="range"
              min={0}
              max={36}
              step={4}
              value={gap}
              onChange={(e) => setGap(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>
        </div>

        <div className="rounded-lg border border-lesson-border bg-lesson-surface p-3">
          <div className="mb-1.5 flex items-center justify-between text-[11px] text-lesson-text-muted">
            <span className="flex items-center gap-1 font-medium">
              <Columns3 className="h-3 w-3" />
              Authored Container CSS
            </span>
          </div>
          <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-lesson-text-primary tabular-nums">
            {mode === "flex"
              ? `.container {\n  display: flex;\n  flex-direction: ${direction};\n  justify-content: ${justify};\n  align-items: ${align};\n  gap: ${gap}px;\n}`
              : `.container {\n  display: grid;\n  grid-template-columns: ${gridTemplateColumns};\n  align-items: ${align};\n  gap: ${gap}px;\n}`}
          </pre>
        </div>
      </div>
    </div>
  );
}
