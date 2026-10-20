import { useState } from "react";
import { RotateCcw, Box, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface BoxModelStudioConfig {
  initialWidth?: number;
  initialPadding?: number;
  initialBorder?: number;
  initialMargin?: number;
  initialBoxSizing?: "content-box" | "border-box";
  specimenTitle?: string;
  specimenBody?: string;
}

export function BoxModelStudio({
  config,
  visualData,
}: {
  config?: BoxModelStudioConfig;
  visualData?: Record<string, unknown>;
}) {
  const merged = { ...(visualData as BoxModelStudioConfig), ...config };
  const defaults = {
    width: merged.initialWidth ?? 260,
    padding: merged.initialPadding ?? 24,
    border: merged.initialBorder ?? 4,
    margin: merged.initialMargin ?? 20,
    boxSizing: merged.initialBoxSizing ?? ("border-box" as const),
  };

  const [width, setWidth] = useState<number>(defaults.width);
  const [padding, setPadding] = useState<number>(defaults.padding);
  const [border, setBorder] = useState<number>(defaults.border);
  const [margin, setMargin] = useState<number>(defaults.margin);
  const [boxSizing, setBoxSizing] = useState<"content-box" | "border-box">(defaults.boxSizing);
  const [hoveredLayer, setHoveredLayer] = useState<
    "margin" | "border" | "padding" | "content" | null
  >(null);

  const handleReset = () => {
    setWidth(defaults.width);
    setPadding(defaults.padding);
    setBorder(defaults.border);
    setMargin(defaults.margin);
    setBoxSizing(defaults.boxSizing);
  };

  const renderedBoxWidth =
    boxSizing === "border-box" ? width : width + padding * 2 + border * 2;
  const innerContentWidth =
    boxSizing === "border-box" ? Math.max(40, width - padding * 2 - border * 2) : width;
  const totalOuterSpace = renderedBoxWidth + margin * 2;

  return (
    <div
      className="grid gap-6 rounded-xl border border-lesson-border bg-lesson-surface p-5 sm:p-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]"
      data-testid="box-model-studio"
    >
      {/* Left: Interactive Visual Stage */}
      <div className="flex flex-col justify-between gap-5 rounded-xl border border-lesson-border bg-lesson-bg/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-lesson-border pb-3">
          <div className="flex items-center gap-2 text-xs text-lesson-text-secondary">
            <Box className="h-4 w-4 text-sky-500" />
            <span className="font-semibold text-lesson-text-primary">
              Interactive CSS Box Model Inspector
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">box-sizing: {boxSizing}</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono tabular-nums text-lesson-text-secondary">
            <span>
              Rendered Box: <strong className="text-lesson-text-primary">{renderedBoxWidth}px</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              With Margin: <strong className="text-lesson-text-primary">{totalOuterSpace}px</strong>
            </span>
          </div>
        </div>

        {/* Concentric Box Model Diagram */}
        <div className="flex min-h-[290px] items-center justify-center overflow-x-auto py-4">
          {/* Margin Box */}
          <div
            onMouseEnter={() => setHoveredLayer("margin")}
            onMouseLeave={() => setHoveredLayer(null)}
            style={{ padding: `${Math.max(12, margin)}px` }}
            className={cn(
              "relative rounded-xl border border-dashed border-amber-500/60 bg-amber-500/10 transition-all duration-150",
              hoveredLayer === "margin" && "ring-2 ring-amber-500/50 bg-amber-500/15",
            )}
          >
            <span className="absolute left-2 top-1 font-mono text-[10px] font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
              margin: {margin}px
            </span>

            {/* Border Box */}
            <div
              onMouseEnter={(e) => {
                e.stopPropagation();
                setHoveredLayer("border");
              }}
              onMouseLeave={() => setHoveredLayer("margin")}
              style={{ padding: `${Math.max(6, border)}px` }}
              className={cn(
                "relative rounded-lg border border-rose-500/70 bg-rose-500/15 transition-all duration-150",
                hoveredLayer === "border" && "ring-2 ring-rose-500/60 bg-rose-500/25",
              )}
            >
              <span className="absolute right-2 top-0.5 font-mono text-[10px] font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                border: {border}px
              </span>

              {/* Padding Box */}
              <div
                onMouseEnter={(e) => {
                  e.stopPropagation();
                  setHoveredLayer("padding");
                }}
                onMouseLeave={() => setHoveredLayer("border")}
                style={{ padding: `${Math.max(12, padding)}px` }}
                className={cn(
                  "relative rounded-md border border-emerald-500/60 bg-emerald-500/15 transition-all duration-150",
                  hoveredLayer === "padding" && "ring-2 ring-emerald-500/50 bg-emerald-500/25",
                )}
              >
                <span className="absolute left-2 top-1 font-mono text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  padding: {padding}px
                </span>

                {/* Content Box */}
                <div
                  onMouseEnter={(e) => {
                    e.stopPropagation();
                    setHoveredLayer("content");
                  }}
                  onMouseLeave={() => setHoveredLayer("padding")}
                  style={{ width: `${Math.min(340, Math.max(120, innerContentWidth))}px` }}
                  className={cn(
                    "rounded border border-sky-500/70 bg-sky-500/20 p-3 text-center transition-all duration-150",
                    hoveredLayer === "content" && "ring-2 ring-sky-500 bg-sky-500/30",
                  )}
                >
                  <div className="font-mono text-xs font-semibold text-sky-700 dark:text-sky-300 tabular-nums">
                    Content: {innerContentWidth}px
                  </div>
                  <p className="mt-1 text-xs font-medium text-lesson-text-primary">
                    {merged.specimenTitle ?? "Card Component"}
                  </p>
                  <p className="mt-0.5 text-[11px] text-lesson-text-secondary">
                    {merged.specimenBody ?? "Inspect how padding, border, and margin shape layout."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Layer Legend & Formula */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-lesson-border pt-3 text-xs text-lesson-text-secondary">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sky-600 dark:text-sky-400 font-medium">■ Content ({innerContentWidth}px)</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">■ Padding ({padding * 2}px)</span>
            <span aria-hidden="true">·</span>
            <span className="text-rose-600 dark:text-rose-400 font-medium">■ Border ({border * 2}px)</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-600 dark:text-amber-400 font-medium">■ Margin ({margin * 2}px)</span>
          </div>
          <span className="font-mono text-[11px] tabular-nums text-lesson-text-muted">
            {boxSizing === "border-box"
              ? `width (${width}px) includes padding + border`
              : `${width}px + ${padding * 2}px pad + ${border * 2}px border = ${renderedBoxWidth}px`}
          </span>
        </div>
      </div>

      {/* Right: Control & Concept Deck */}
      <div className="flex flex-col justify-between gap-5 rounded-xl border border-lesson-border bg-lesson-bg/40 p-5">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-lesson-text-primary">Box Model Controls</h3>
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

          {/* Box Sizing Segmented Control */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-lesson-text-secondary">box-sizing Mode</label>
            <div className="grid grid-cols-2 gap-1 rounded-lg border border-lesson-border bg-lesson-surface p-1">
              <button
                type="button"
                onClick={() => setBoxSizing("border-box")}
                className={cn(
                  "rounded-md px-3 py-1.5 font-mono text-xs font-medium transition-colors whitespace-nowrap",
                  boxSizing === "border-box"
                    ? "bg-primary text-primary-foreground"
                    : "text-lesson-text-secondary hover:text-lesson-text-primary",
                )}
              >
                border-box
              </button>
              <button
                type="button"
                onClick={() => setBoxSizing("content-box")}
                className={cn(
                  "rounded-md px-3 py-1.5 font-mono text-xs font-medium transition-colors whitespace-nowrap",
                  boxSizing === "content-box"
                    ? "bg-primary text-primary-foreground"
                    : "text-lesson-text-secondary hover:text-lesson-text-primary",
                )}
              >
                content-box
              </button>
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-3.5">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="bm-width" className="font-medium text-lesson-text-secondary">
                  Declared Width
                </label>
                <span className="font-mono font-semibold text-sky-600 dark:text-sky-400 tabular-nums">
                  {width}px
                </span>
              </div>
              <input
                id="bm-width"
                type="range"
                min={180}
                max={340}
                step={4}
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="w-full accent-sky-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="bm-padding" className="font-medium text-lesson-text-secondary">
                  Padding (inner breathing room)
                </label>
                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {padding}px
                </span>
              </div>
              <input
                id="bm-padding"
                type="range"
                min={0}
                max={48}
                step={4}
                value={padding}
                onChange={(e) => setPadding(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="bm-border" className="font-medium text-lesson-text-secondary">
                  Border Width
                </label>
                <span className="font-mono font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                  {border}px
                </span>
              </div>
              <input
                id="bm-border"
                type="range"
                min={0}
                max={16}
                step={1}
                value={border}
                onChange={(e) => setBorder(Number(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="bm-margin" className="font-medium text-lesson-text-secondary">
                  Margin (outer separation)
                </label>
                <span className="font-mono font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
                  {margin}px
                </span>
              </div>
              <input
                id="bm-margin"
                type="range"
                min={0}
                max={48}
                step={4}
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Live Generated CSS */}
        <div className="rounded-lg border border-lesson-border bg-lesson-surface p-3">
          <div className="mb-1.5 flex items-center justify-between text-[11px] text-lesson-text-muted">
            <span className="flex items-center gap-1 font-medium">
              <Maximize2 className="h-3 w-3" />
              Computed CSS Rule
            </span>
            <span className="font-mono tabular-nums">{renderedBoxWidth}px box</span>
          </div>
          <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-lesson-text-primary tabular-nums">
{`.card {
  box-sizing: ${boxSizing};
  width: ${width}px;
  padding: ${padding}px;
  border: ${border}px solid;
  margin: ${margin}px;
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}
