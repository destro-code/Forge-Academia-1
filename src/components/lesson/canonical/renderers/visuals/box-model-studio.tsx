import { useState, useRef, useEffect } from "react";
import { RotateCcw, Box, Maximize2, Sparkles, Smartphone } from "lucide-react";
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
    width: merged.initialWidth ?? 240,
    padding: merged.initialPadding ?? 20,
    border: merged.initialBorder ?? 4,
    margin: merged.initialMargin ?? 16,
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

  const stageRef = useRef<HTMLDivElement | null>(null);
  const [stageWidth, setStageWidth] = useState<number>(0);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const updateWidth = () => {
      setStageWidth(el.clientWidth);
    };
    updateWidth();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => updateWidth());
      observer.observe(el);
      return () => observer.disconnect();
    } else {
      window.addEventListener("resize", updateWidth);
      return () => window.removeEventListener("resize", updateWidth);
    }
  }, []);

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
    boxSizing === "border-box" ? Math.max(60, width - padding * 2 - border * 2) : width;
  const totalOuterSpace = renderedBoxWidth + margin * 2;

  // Visual diagram dimensions & auto-fit scale for mobile viewports
  const visualMarginPad = Math.max(14, margin);
  const visualBorderPad = Math.max(8, border);
  const visualPaddingPad = Math.max(14, padding);
  const visualContentWidth = Math.min(320, Math.max(110, innerContentWidth));
  const naturalVisualWidth =
    visualContentWidth + (visualPaddingPad + visualBorderPad + visualMarginPad) * 2;
  const naturalVisualHeight =
    96 + (visualPaddingPad + visualBorderPad + visualMarginPad) * 2;

  const availableStageWidth = stageWidth > 0 ? Math.max(220, stageWidth - 16) : 520;
  const scaleFactor =
    naturalVisualWidth > availableStageWidth
      ? Math.max(0.45, Math.min(1, availableStageWidth / naturalVisualWidth))
      : 1;
  const isAutoScaled = scaleFactor < 0.98;
  const scaledContainerHeight = Math.max(
    180,
    Math.round(naturalVisualHeight * scaleFactor) + 16,
  );

  return (
    <div
      className="grid gap-4 sm:gap-6 rounded-xl border border-lesson-border bg-lesson-surface p-3.5 sm:p-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(270px,0.8fr)] overflow-hidden"
      data-testid="box-model-studio"
    >
      {/* Left: Interactive Visual Stage */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-lesson-border bg-lesson-bg/60 p-3.5 sm:p-5 min-w-0 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-lesson-border pb-2.5">
          <div className="flex items-center gap-2 text-xs text-lesson-text-secondary min-w-0">
            <Box className="h-4 w-4 shrink-0 text-sky-500" />
            <span className="font-semibold text-lesson-text-primary truncate">
              CSS Box Inspector
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[11px] text-primary tabular-nums">
              {boxSizing}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono tabular-nums text-lesson-text-secondary">
            <span className="rounded bg-lesson-surface px-1.5 py-0.5 border border-lesson-border">
              Box: <strong className="text-lesson-text-primary">{renderedBoxWidth}px</strong>
            </span>
            <span className="rounded bg-lesson-surface px-1.5 py-0.5 border border-lesson-border">
              Total: <strong className="text-lesson-text-primary">{totalOuterSpace}px</strong>
            </span>
          </div>
        </div>

        {/* ELI5 Mental Model Callout */}
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/25 bg-amber-500/5 px-3 py-2 text-xs text-lesson-text-secondary">
          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
          <p className="leading-relaxed">
            <strong className="text-lesson-text-primary">ELI5 Mental Model:</strong> Think of a gift in a cardboard box.{" "}
            <span className="text-sky-500 font-medium">Content</span> is the toy,{" "}
            <span className="text-emerald-500 font-medium">Padding</span> is bubble wrap inside,{" "}
            <span className="text-rose-500 font-medium">Border</span> is the cardboard wall, and{" "}
            <span className="text-amber-500 font-medium">Margin</span> is the invisible force-field pushing neighbor boxes away!
          </p>
        </div>

        {/* Auto-Scaling Concentric Box Model Diagram (Never overflows mobile screens!) */}
        <div
          ref={stageRef}
          style={{ height: `${scaledContainerHeight}px` }}
          className="relative flex w-full items-center justify-center overflow-hidden rounded-lg bg-lesson-surface/40 py-2"
        >
          {isAutoScaled && (
            <div className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-full border border-primary/30 bg-background/90 px-2 py-0.5 font-mono text-[10px] text-primary shadow-xs">
              <Smartphone className="h-3 w-3" />
              <span>Fit to screen ({Math.round(scaleFactor * 100)}%)</span>
            </div>
          )}

          <div
            style={{
              transform: `scale(${scaleFactor})`,
              transformOrigin: "center center",
            }}
            className="flex items-center justify-center transition-transform duration-150 ease-out"
          >
            {/* Margin Box */}
            <div
              onMouseEnter={() => setHoveredLayer("margin")}
              onMouseLeave={() => setHoveredLayer(null)}
              onClick={() => setHoveredLayer("margin")}
              style={{ padding: `${visualMarginPad}px` }}
              className={cn(
                "relative rounded-xl border-2 border-dashed border-amber-500/60 bg-amber-500/10 transition-all duration-150",
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
                onClick={(e) => {
                  e.stopPropagation();
                  setHoveredLayer("border");
                }}
                style={{ padding: `${visualBorderPad}px` }}
                className={cn(
                  "relative rounded-lg border-2 border-rose-500/70 bg-rose-500/15 transition-all duration-150",
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
                  onClick={(e) => {
                    e.stopPropagation();
                    setHoveredLayer("padding");
                  }}
                  style={{ padding: `${visualPaddingPad}px` }}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setHoveredLayer("content");
                    }}
                    style={{ width: `${visualContentWidth}px` }}
                    className={cn(
                      "rounded border border-sky-500/70 bg-sky-500/20 p-3 text-center transition-all duration-150",
                      hoveredLayer === "content" && "ring-2 ring-sky-500 bg-sky-500/30",
                    )}
                  >
                    <div className="font-mono text-xs font-semibold text-sky-700 dark:text-sky-300 tabular-nums">
                      Content: {innerContentWidth}px
                    </div>
                    <p className="mt-1 text-xs font-medium text-lesson-text-primary truncate">
                      {merged.specimenTitle ?? "Guild Quest Card"}
                    </p>
                    <p className="mt-0.5 text-[11px] text-lesson-text-secondary line-clamp-2">
                      {merged.specimenBody ?? "Drag the sliders to see how bubble-wrap padding and borders work!"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Layer Legend & Formula */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-lesson-border pt-2.5 text-[11px] text-lesson-text-secondary">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-sky-600 dark:text-sky-400 font-medium">■ Content ({innerContentWidth}px)</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">■ Pad ({padding * 2}px)</span>
            <span className="text-rose-600 dark:text-rose-400 font-medium">■ Border ({border * 2}px)</span>
            <span className="text-amber-600 dark:text-amber-400 font-medium">■ Margin ({margin * 2}px)</span>
          </div>
          <span className="font-mono text-[11px] tabular-nums text-lesson-text-muted">
            {boxSizing === "border-box"
              ? `border-box locks outer width at ${width}px`
              : `${width} + ${padding * 2} + ${border * 2} = ${renderedBoxWidth}px`}
          </span>
        </div>
      </div>

      {/* Right: Control & Concept Deck */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-lesson-border bg-lesson-bg/40 p-3.5 sm:p-5 min-w-0">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-lesson-text-primary">Box Model Controls</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-7 gap-1.5 px-2.5 text-xs text-lesson-text-secondary"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </Button>
          </div>

          {/* Box Sizing Segmented Control */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-lesson-text-secondary">
              box-sizing Mode (How the browser does math)
            </label>
            <div className="grid grid-cols-2 gap-1 rounded-lg border border-lesson-border bg-lesson-surface p-1">
              <button
                type="button"
                onClick={() => setBoxSizing("border-box")}
                className={cn(
                  "rounded-md px-2.5 py-1.5 font-mono text-xs font-medium transition-colors whitespace-nowrap",
                  boxSizing === "border-box"
                    ? "bg-primary text-primary-foreground"
                    : "text-lesson-text-secondary hover:text-lesson-text-primary",
                )}
              >
                border-box (Sanity)
              </button>
              <button
                type="button"
                onClick={() => setBoxSizing("content-box")}
                className={cn(
                  "rounded-md px-2.5 py-1.5 font-mono text-xs font-medium transition-colors whitespace-nowrap",
                  boxSizing === "content-box"
                    ? "bg-primary text-primary-foreground"
                    : "text-lesson-text-secondary hover:text-lesson-text-primary",
                )}
              >
                content-box (Classic)
              </button>
            </div>
          </div>

          {/* Sliders — 2x2 grid on mobile so they take half the vertical space, stacked on desktop */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="space-y-1 rounded-lg border border-lesson-border/60 bg-lesson-surface/50 p-2.5">
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
                min={160}
                max={340}
                step={4}
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1 rounded-lg border border-lesson-border/60 bg-lesson-surface/50 p-2.5">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="bm-padding" className="font-medium text-lesson-text-secondary">
                  Padding (bubble wrap)
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
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1 rounded-lg border border-lesson-border/60 bg-lesson-surface/50 p-2.5">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="bm-border" className="font-medium text-lesson-text-secondary">
                  Border (cardboard wall)
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
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1 rounded-lg border border-lesson-border/60 bg-lesson-surface/50 p-2.5">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="bm-margin" className="font-medium text-lesson-text-secondary">
                  Margin (force field)
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
                className="w-full accent-amber-500 cursor-pointer"
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
            <span className="font-mono tabular-nums">{renderedBoxWidth}px rendered</span>
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
