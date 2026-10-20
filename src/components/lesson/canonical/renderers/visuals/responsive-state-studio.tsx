import { useState } from "react";
import { Smartphone, Tablet, Monitor, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type InteractiveState = "default" | "hover" | "focus-visible" | "active" | "disabled";

const BREAKPOINTS = [
  { label: "Mobile", width: 360, icon: Smartphone, cols: 1 },
  { label: "Tablet", width: 680, icon: Tablet, cols: 2 },
  { label: "Desktop", width: 1024, icon: Monitor, cols: 3 },
] as const;

export function ResponsiveStateStudio() {
  const [viewportWidth, setViewportWidth] = useState<number>(680);
  const [uiState, setUiState] = useState<InteractiveState>("default");

  const activeBreakpoint =
    viewportWidth < 520 ? "Mobile (<520px)" : viewportWidth < 860 ? "Tablet (≥520px)" : "Desktop (≥860px)";
  const gridCols = viewportWidth < 520 ? 1 : viewportWidth < 860 ? 2 : 3;

  const handleReset = () => {
    setViewportWidth(680);
    setUiState("default");
  };

  return (
    <div
      className="grid gap-6 rounded-xl border border-lesson-border bg-lesson-surface p-5 sm:p-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]"
      data-testid="responsive-state-studio"
    >
      {/* Left: Responsive Viewport & State Stage */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-lesson-border bg-lesson-bg/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-lesson-border pb-3">
          <div className="flex items-center gap-2 text-xs text-lesson-text-secondary">
            <Monitor className="h-4 w-4 text-amber-500" />
            <span className="font-semibold text-lesson-text-primary">
              Responsive Breakpoint &amp; State Inspector
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{activeBreakpoint}</span>
          </div>
          <span className="font-mono text-xs tabular-nums text-lesson-text-muted">
            Viewport: {viewportWidth}px · {gridCols} col{gridCols > 1 ? "s" : ""}
          </span>
        </div>

        {/* Simulated Viewport Frame */}
        <div className="flex min-h-[260px] items-center justify-center overflow-x-auto py-2">
          <div
            style={{ width: `${Math.min(100, Math.round((viewportWidth / 1024) * 100))}%` }}
            className="min-w-[260px] rounded-xl border border-lesson-border bg-lesson-surface p-4 shadow-xs transition-all duration-200"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-lesson-border pb-3">
              <span className="text-xs font-bold tracking-tight text-lesson-text-primary">
                Forge Design System
              </span>
              <button
                type="button"
                disabled={uiState === "disabled"}
                className={cn(
                  "rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 whitespace-nowrap",
                  uiState === "default" && "bg-primary text-primary-foreground",
                  uiState === "hover" &&
                    "bg-primary/90 text-primary-foreground -translate-y-0.5 shadow-sm",
                  uiState === "focus-visible" &&
                    "bg-primary text-primary-foreground ring-2 ring-sky-400 ring-offset-2 ring-offset-background",
                  uiState === "active" && "bg-primary/80 text-primary-foreground scale-[0.97]",
                  uiState === "disabled" &&
                    "cursor-not-allowed bg-muted text-muted-foreground opacity-50",
                )}
              >
                Primary Action ({uiState})
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
                gap: "12px",
              }}
            >
              {["Token Architecture", "Fluid Typography", "Accessible States"].map((item, i) => (
                <div
                  key={item}
                  className="rounded-lg border border-lesson-border bg-lesson-bg/70 p-3"
                >
                  <div className="font-mono text-[10px] text-lesson-text-muted tabular-nums">
                    0{i + 1} · Card
                  </div>
                  <p className="mt-1 text-xs font-semibold text-lesson-text-primary">{item}</p>
                  <p className="mt-0.5 text-[11px] text-lesson-text-secondary">
                    Reflows cleanly at {viewportWidth}px.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-lesson-border pt-3 text-xs text-lesson-text-secondary">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>
              {uiState === "focus-visible"
                ? "Keyboard focus ring (ring-2 + offset) ensures 3:1 WCAG focus visibility."
                : uiState === "disabled"
                  ? "Disabled state removes pointer actions and reduces contrast intentionally."
                  : "Compositor-only transform & opacity transitions keep interaction latency ≤150ms."}
            </span>
          </span>
        </div>
      </div>

      {/* Right: Control Deck */}
      <div className="flex flex-col justify-between gap-5 rounded-xl border border-lesson-border bg-lesson-bg/40 p-5">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-lesson-text-primary">
              Viewport &amp; State Controls
            </h3>
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

          {/* Breakpoint presets */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-lesson-text-secondary">
              Breakpoint Presets
            </label>
            <div className="grid grid-cols-3 gap-1 rounded-lg border border-lesson-border bg-lesson-surface p-1">
              {BREAKPOINTS.map((bp) => {
                const Icon = bp.icon;
                return (
                  <button
                    key={bp.label}
                    type="button"
                    onClick={() => setViewportWidth(bp.width)}
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors whitespace-nowrap",
                      viewportWidth === bp.width
                        ? "bg-primary text-primary-foreground"
                        : "text-lesson-text-secondary hover:text-lesson-text-primary",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{bp.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Viewport scrubber */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="vp-width" className="font-medium text-lesson-text-secondary">
                Container Width Scrubber
              </label>
              <span className="font-mono font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
                {viewportWidth}px
              </span>
            </div>
            <input
              id="vp-width"
              type="range"
              min={320}
              max={1024}
              step={16}
              value={viewportWidth}
              onChange={(e) => setViewportWidth(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          {/* Interactive Pseudo-State Matrix */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-lesson-text-secondary">
              Interactive Pseudo-State Inspector
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {(["default", "hover", "focus-visible", "active", "disabled"] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setUiState(st)}
                  className={cn(
                    "rounded-lg border px-2.5 py-1.5 font-mono text-xs transition-colors whitespace-nowrap text-left",
                    uiState === st
                      ? "border-amber-500/60 bg-amber-500/15 font-semibold text-amber-600 dark:text-amber-400"
                      : "border-lesson-border bg-lesson-surface text-lesson-text-secondary hover:text-lesson-text-primary",
                  )}
                >
                  :{st}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-lesson-border bg-lesson-surface p-3">
          <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-lesson-text-primary tabular-nums">
{`.btn:${uiState} {
  transition: transform 150ms cubic-bezier(0.16, 1, 0.3, 1);
  ${
    uiState === "focus-visible"
      ? "outline: 2px solid #38bdf8;\n  outline-offset: 2px;"
      : uiState === "hover"
        ? "transform: translateY(-2px);"
        : uiState === "active"
          ? "transform: scale(0.97);"
          : uiState === "disabled"
            ? "opacity: 0.5;\n  cursor: not-allowed;"
            : "transform: none;"
  }
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}
