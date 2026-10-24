import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { FileCode2, Paintbrush, Zap, Eye } from "lucide-react";

export type LayerSlot = "html" | "css" | "js";

export interface StackLayer {
  slot: LayerSlot;
  label: string;
  role: string;
  code: string;
}

export interface LayerStackData {
  layers?: StackLayer[];
  /** Optional caption shown under the live preview. */
  previewLabel?: string;
}

const DEFAULT_STACK_LAYERS: StackLayer[] = [
  {
    slot: "html",
    label: "HTML",
    role: "Semantic structure & content",
    code: `<article class="card">
  <span class="badge">Live Component</span>
  <h2>Design System Token</h2>
  <p>Structure defines meaning before styling or behavior is attached.</p>
  <button id="action-btn" type="button">Inspect State</button>
  <p id="status-readout" aria-live="polite">Status: Ready</p>
</article>`,
  },
  {
    slot: "css",
    label: "CSS",
    role: "Visual presentation & layout",
    code: `.card {
  max-width: 340px;
  padding: 20px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}
.badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 999px;
  background: #e0e7ff;
  color: #3730a3;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}
h2 {
  margin: 10px 0 6px;
  font-size: 18px;
  color: #0f172a;
}
p {
  margin: 0 0 14px;
  font-size: 13px;
  line-height: 1.5;
  color: #475569;
}
button {
  padding: 8px 14px;
  border-radius: 8px;
  border: none;
  background: #4f46e5;
  color: white;
  font-weight: 600;
  cursor: pointer;
}
#status-readout {
  margin-top: 10px;
  margin-bottom: 0;
  font-family: monospace;
  font-size: 12px;
  color: #0f766e;
}`,
  },
  {
    slot: "js",
    label: "JavaScript",
    role: "Interactive behavior & state",
    code: `const btn = document.getElementById("action-btn");
const readout = document.getElementById("status-readout");
let count = 0;

btn?.addEventListener("click", () => {
  count += 1;
  readout.textContent = "Status: Triggered " + count + "x";
  btn.textContent = "Clicked (" + count + ")";
});`,
  },
];

const SLOT_META: Record<LayerSlot, { icon: typeof FileCode2; hue: string; lang: string }> = {
  html: { icon: FileCode2, hue: "24 80% 58%", lang: "html" },
  css: { icon: Paintbrush, hue: "205 75% 58%", lang: "css" },
  js: { icon: Zap, hue: "45 85% 58%", lang: "js" },
};

const STAGE_META: Record<
  LayerSlot,
  {
    stepNumber: string;
    stageTitle: string;
    cumulativeLabel: string;
    includedSlots: LayerSlot[];
  }
> = {
  html: {
    stepNumber: "Stage 1",
    stageTitle: "HTML Only",
    cumulativeLabel: "Structure only",
    includedSlots: ["html"],
  },
  css: {
    stepNumber: "Stage 2",
    stageTitle: "HTML + CSS",
    cumulativeLabel: "Structure + Style",
    includedSlots: ["html", "css"],
  },
  js: {
    stepNumber: "Stage 3",
    stageTitle: "HTML + CSS + JS",
    cumulativeLabel: "Structure + Style + Behavior",
    includedSlots: ["html", "css", "js"],
  },
};

/**
 * LayerStack — the signature "see the system work" visual.
 *
 * The three files a browser assembles into a page (HTML, CSS, JavaScript) are
 * made tangible via cumulative stages so base HTML structure is never lost.
 * On mobile, the live preview sits immediately below the stage selector so
 * cause-and-effect is visible without scrolling past code.
 */
export function LayerStack({
  config,
  visualData,
}: {
  config?: LayerStackData;
  visualData?: Record<string, unknown>;
}) {
  const layers = useMemo(() => {
    if (config?.layers && config.layers.length > 0) {
      return config.layers;
    }
    const fromVisualData = visualData?.layers as StackLayer[] | undefined;
    if (
      Array.isArray(fromVisualData) &&
      fromVisualData.length > 0 &&
      typeof fromVisualData[0]?.slot === "string"
    ) {
      return fromVisualData;
    }
    return DEFAULT_STACK_LAYERS;
  }, [config?.layers, visualData?.layers]);

  const [stage, setStage] = useState<LayerSlot>("html");
  const [activeTab, setActiveTab] = useState<LayerSlot>(layers[0]?.slot ?? "html");

  const enabled = useMemo<Record<LayerSlot, boolean>>(
    () => ({
      html: true,
      css: stage === "css" || stage === "js",
      js: stage === "js",
    }),
    [stage],
  );

  const bySlot = useMemo(() => {
    const map = {} as Record<LayerSlot, StackLayer | undefined>;
    layers.forEach((l) => (map[l.slot] = l));
    return map;
  }, [layers]);

  const srcDoc = useMemo(() => {
    const html = enabled.html ? (bySlot.html?.code ?? "") : "";
    const css = enabled.css ? (bySlot.css?.code ?? "") : "";
    const js = enabled.js ? (bySlot.js?.code ?? "") : "";
    return `<!doctype html><html><head><meta charset="utf-8"/><style>
      *{box-sizing:border-box}
      body{margin:0;padding:20px;font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;color:#111;background:#fff}
      ${css}
    </style></head><body>${html}${
      js ? `<script>try{${js}}catch(e){console.warn(e)}</script>` : ""
    }</body></html>`;
  }, [enabled, bySlot]);

  const activeLayer = bySlot[activeTab];
  const activeEnabled = enabled[activeTab];

  return (
    <div
      className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-start"
      data-testid="layer-stack"
    >
      {/* 1 · CHOOSE A LAYER (Cumulative stages: HTML is always active) */}
      <div
        className="flex flex-col gap-2 lg:col-start-1 lg:row-start-1"
        data-testid="layer-stack-controls"
      >
        <div className="flex items-center justify-between px-0.5">
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-lesson-text-muted">
            1 · Choose a Layer Stage
          </span>
          <span className="text-[11px] font-medium text-lesson-text-secondary">
            {STAGE_META[stage].cumulativeLabel}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(["html", "css", "js"] as LayerSlot[]).map((slot) => {
            const layer = bySlot[slot];
            if (!layer) return null;
            const meta = SLOT_META[slot];
            const stageInfo = STAGE_META[slot];
            const Icon = meta.icon;
            const isSelectedStage = stage === slot;
            const isLayerIncluded = enabled[slot];
            return (
              <button
                key={slot}
                type="button"
                aria-pressed={isSelectedStage}
                data-stage={slot}
                data-layer-active={isLayerIncluded}
                onClick={() => {
                  setStage(slot);
                  setActiveTab(slot);
                }}
                style={{ "--h": meta.hue } as React.CSSProperties}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all",
                  isSelectedStage
                    ? "border-[hsl(var(--h)/0.75)] bg-[hsl(var(--h)/0.14)] shadow-[0_0_18px_hsl(var(--h)/0.2)] ring-1 ring-[hsl(var(--h)/0.45)]"
                    : isLayerIncluded
                      ? "border-[hsl(var(--h)/0.4)] bg-[hsl(var(--h)/0.06)] opacity-90 hover:opacity-100"
                      : "border-lesson-border bg-lesson-surface-subtle opacity-70 hover:opacity-100",
                )}
              >
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-lesson-text-muted">
                  {stageInfo.stepNumber}
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isLayerIncluded ? "text-[hsl(var(--h))]" : "text-lesson-text-muted",
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs font-bold tracking-tight",
                      isLayerIncluded ? "text-lesson-text-primary" : "text-lesson-text-muted",
                    )}
                  >
                    {stageInfo.stageTitle}
                  </span>
                </span>
                <span className="text-[10px] leading-tight text-lesson-text-muted">
                  {layer.role}
                </span>
                <span
                  className={cn(
                    "mt-1 text-[9px] font-bold uppercase tracking-widest",
                    isSelectedStage
                      ? "text-[hsl(var(--h))]"
                      : isLayerIncluded
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-lesson-text-muted/60",
                  )}
                >
                  {isSelectedStage ? "Selected" : isLayerIncluded ? "Active" : "Add Layer"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2 · SEE THE RESULT IMMEDIATELY (Directly below controls on mobile; right column on desktop) */}
      <div
        className="flex flex-col gap-2 lg:col-start-2 lg:row-start-1 lg:row-span-2"
        data-testid="layer-stack-preview"
      >
        <div className="flex items-center justify-between px-0.5">
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-lesson-text-muted">
            2 · See the Result Immediately
          </span>
          <div className="flex items-center gap-1">
            {(["html", "css", "js"] as LayerSlot[]).map((slot) => (
              <span
                key={slot}
                className={cn(
                  "rounded px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase",
                  enabled[slot]
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "bg-lesson-surface-subtle text-lesson-text-muted/50",
                )}
              >
                {slot}
              </span>
            ))}
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-lesson-border bg-white shadow-lg">
          <div className="flex items-center gap-1.5 border-b border-black/10 bg-zinc-100 px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="ml-2 flex items-center gap-1 rounded-md bg-white px-2 py-0.5 font-mono text-[10px] text-zinc-500">
              <Eye className="h-3 w-3" /> live preview
            </span>
          </div>
          <iframe
            title="Live layer preview"
            srcDoc={srcDoc}
            sandbox="allow-scripts"
            className="h-[240px] sm:h-[260px] w-full bg-white"
          />
        </div>
        <p className="px-1 text-center text-xs text-lesson-text-muted">
          {stage === "js"
            ? "All three layers working together — HTML structure, CSS styling, and JS behavior."
            : stage === "css"
              ? "HTML + CSS active — visual presentation applied on top of semantic structure."
              : (config?.previewLabel ?? "HTML structure only — semantic meaning without styling.")}
        </p>
      </div>

      {/* 3 · INSPECT THE CODE (Below preview on mobile; left column under controls on desktop) */}
      <div
        className="flex flex-col gap-2 lg:col-start-1 lg:row-start-2"
        data-testid="layer-stack-code"
      >
        <div className="flex items-center justify-between px-0.5">
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-lesson-text-muted">
            3 · Inspect the Code
          </span>
          <span className="text-[11px] text-lesson-text-muted">
            Viewing {activeLayer?.label ?? activeTab.toUpperCase()} file
          </span>
        </div>
        <div className="overflow-hidden rounded-xl border border-lesson-border bg-zinc-950">
          <div className="flex items-center gap-1 border-b border-white/5 px-2 py-1.5">
            {(["html", "css", "js"] as LayerSlot[]).map((slot) => {
              const layer = bySlot[slot];
              if (!layer) return null;
              const meta = SLOT_META[slot];
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setActiveTab(slot)}
                  style={{ "--h": meta.hue } as React.CSSProperties}
                  className={cn(
                    "rounded-md px-2.5 py-1 font-mono text-[11px] font-semibold transition-colors",
                    activeTab === slot
                      ? "bg-white/10 text-[hsl(var(--h))]"
                      : "text-zinc-400 hover:text-zinc-200",
                  )}
                >
                  {layer.label.toLowerCase()}
                  {!enabled[slot] && <span className="ml-1 text-zinc-500">·inactive</span>}
                </button>
              );
            })}
          </div>
          <pre
            className={cn(
              "max-h-[220px] overflow-auto p-3.5 font-mono text-[12px] leading-relaxed transition-opacity",
              activeEnabled ? "text-zinc-200" : "text-zinc-500 opacity-60",
            )}
          >
            <code>{activeLayer?.code ?? ""}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
