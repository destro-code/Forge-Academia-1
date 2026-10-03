import { useState, useRef, useEffect, useCallback, useId } from "react";
import { cn } from "@/lib/utils";
import { Eye, SplitSquareVertical, User, Sparkles, GripVertical } from "lucide-react";

export type ViewportMode = "target" | "yours" | "compare";

export interface StageViewportProps {
  targetHtml: string;
  targetCss?: string;
  userHtml: string;
  userCss?: string;
  viewportHeight?: number;
  className?: string;
  onUserDocumentReady?: (doc: Document) => void;
}

/**
 * Standard baseline reset and theme inside sandboxed preview iframes.
 */
function buildPreviewDocument(html: string, css?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=360, initial-scale=1.0">
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
    }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      min-height: 100%;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: #090a0c;
      color: #f4f4f5;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }
    /* User or Target Custom Styles */
    ${css || ""}
  </style>
</head>
<body>
  ${html}
</body>
</html>`;
}

export function StageViewport({
  targetHtml,
  targetCss = "",
  userHtml,
  userCss = "",
  viewportHeight = 380,
  className,
  onUserDocumentReady,
}: StageViewportProps) {
  const [mode, setMode] = useState<ViewportMode>("target");
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const userIframeRef = useRef<HTMLIFrameElement>(null);
  const targetIframeRef = useRef<HTMLIFrameElement>(null);

  const viewportId = useId();

  // Notify parent whenever user iframe loads/updates
  const handleUserIframeLoad = useCallback(() => {
    try {
      const doc = userIframeRef.current?.contentDocument;
      if (doc && onUserDocumentReady) {
        onUserDocumentReady(doc);
      }
    } catch {
      // Sandboxed access error fallback
    }
  }, [onUserDocumentReady]);

  // Comparison slider dragging logic
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const rawX = e.clientX - rect.left;
      const percentage = Math.max(5, Math.min(95, (rawX / rect.width) * 100));
      setSliderPosition(percentage);
    },
    [isDragging],
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // Ignore release capture errors
    }
  }, []);

  // Global pointer up in case cursor leaves frame during drag
  useEffect(() => {
    const handleGlobalUp = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener("pointerup", handleGlobalUp);
      return () => window.removeEventListener("pointerup", handleGlobalUp);
    }
  }, [isDragging]);

  const targetDocContent = buildPreviewDocument(targetHtml, targetCss);
  const userDocContent = buildPreviewDocument(userHtml, userCss);

  return (
    <div
      className={cn(
        "flex flex-col items-center w-full max-w-[420px] mx-auto select-none",
        className,
      )}
      id={`viewport-stage-${viewportId}`}
    >
      {/* Segmented Sticky Pill Control */}
      <div className="w-full flex items-center justify-between gap-2 p-1.5 mb-3 bg-muted/60 border border-border/80 rounded-lg backdrop-blur-md">
        <div className="flex items-center gap-1 w-full" role="tablist" aria-label="Viewport Mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "target"}
            onClick={() => setMode("target")}
            className={cn(
              "flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-medium transition-all duration-200",
              mode === "target"
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-background/40",
            )}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Target</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={mode === "yours"}
            onClick={() => setMode("yours")}
            className={cn(
              "flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-medium transition-all duration-200",
              mode === "yours"
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-background/40",
            )}
          >
            <User className="w-3.5 h-3.5" />
            <span>Yours</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={mode === "compare"}
            onClick={() => setMode("compare")}
            className={cn(
              "flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-medium transition-all duration-200",
              mode === "compare"
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-background/40",
            )}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>Compare</span>
          </button>
        </div>
      </div>

      {/* Mobile Device Frame Header */}
      <div className="w-[360px] bg-card border border-border rounded-t-2xl px-4 py-2 flex items-center justify-between text-[11px] font-mono text-muted-foreground shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary/80 animate-pulse" />
          <span className="font-semibold tracking-wider uppercase text-[10px]">
            360px Mobile Viewport
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground/70">
          <span>
            {mode === "compare" ? `Diff (${Math.round(sliderPosition)}%)` : mode.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Viewport Frame (360px strict container) */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ height: `${viewportHeight}px`, width: "360px" }}
        className={cn(
          "relative overflow-hidden bg-[#090a0c] border-x border-b border-border rounded-b-2xl shadow-xl transition-shadow",
          isDragging && "cursor-ew-resize ring-1 ring-primary/40",
        )}
      >
        {/* Layer 1: Target Iframe (Underneath in compare mode, full in target mode) */}
        {(mode === "target" || mode === "compare") && (
          <div
            className={cn("absolute inset-0 w-full h-full", isDragging && "pointer-events-none")}
          >
            <iframe
              ref={targetIframeRef}
              title="Target Reference Rendering"
              srcDoc={targetDocContent}
              sandbox="allow-same-origin"
              className="w-full h-full border-0 block"
            />
          </div>
        )}

        {/* Layer 2: Yours Iframe (Above with clip-path in compare mode, full in yours mode) */}
        {(mode === "yours" || mode === "compare") && (
          <div
            style={{
              clipPath: mode === "compare" ? `inset(0 0 0 ${sliderPosition}%)` : undefined,
            }}
            className={cn(
              "absolute inset-0 w-full h-full transition-[clip-path] duration-0",
              isDragging && "pointer-events-none",
            )}
          >
            <iframe
              ref={userIframeRef}
              title="Your Code Rendering"
              srcDoc={userDocContent}
              sandbox="allow-same-origin"
              onLoad={handleUserIframeLoad}
              className="w-full h-full border-0 block"
            />
          </div>
        )}

        {/* Layer 3: Interactive Draggable Split Slider in Compare Mode */}
        {mode === "compare" && (
          <>
            {/* Split Divider Line */}
            <div
              style={{ left: `${sliderPosition}%` }}
              className="absolute top-0 bottom-0 w-0.5 bg-primary shadow-[0_0_10px_rgba(249,115,22,0.8)] pointer-events-none z-20"
            />

            {/* Draggable Handle */}
            <div
              style={{ left: `${sliderPosition}%` }}
              onPointerDown={handlePointerDown}
              role="slider"
              tabIndex={0}
              aria-label="Comparison split slider"
              aria-valuenow={Math.round(sliderPosition)}
              aria-valuemin={5}
              aria-valuemax={95}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft") setSliderPosition((p) => Math.max(5, p - 5));
                if (e.key === "ArrowRight") setSliderPosition((p) => Math.min(95, p + 5));
              }}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 cursor-ew-resize touch-none flex items-center justify-center p-1"
            >
              <div
                className={cn(
                  "w-7 h-10 rounded-full bg-card border-2 border-primary shadow-lg flex items-center justify-center text-primary transition-transform",
                  isDragging ? "scale-110 ring-4 ring-primary/20" : "hover:scale-105",
                )}
              >
                <GripVertical className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Overlay Indicator Badges */}
            <div className="absolute top-3 left-3 z-10 pointer-events-none">
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-background/80 text-foreground border border-border/80 backdrop-blur-sm shadow">
                TARGET
              </span>
            </div>
            <div className="absolute top-3 right-3 z-10 pointer-events-none">
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-primary/90 text-primary-foreground border border-primary/40 backdrop-blur-sm shadow">
                YOURS
              </span>
            </div>
          </>
        )}

        {/* Mode Specific Badges for Target & Yours */}
        {mode === "target" && (
          <div className="absolute bottom-2.5 right-2.5 pointer-events-none">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono font-medium rounded-full bg-background/85 text-muted-foreground border border-border/80 backdrop-blur-sm">
              <Sparkles className="w-3 h-3 text-primary" /> Goal Specification
            </span>
          </div>
        )}

        {mode === "yours" && (
          <div className="absolute bottom-2.5 right-2.5 pointer-events-none">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono font-medium rounded-full bg-background/85 text-muted-foreground border border-border/80 backdrop-blur-sm">
              <User className="w-3 h-3 text-primary" /> Live Implementation
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
