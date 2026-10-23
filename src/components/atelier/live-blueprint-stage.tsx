import { useState } from "react";
import { Layers, Play, RotateCcw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type GradientPresetId = "cobalt-mint" | "coral-butter" | "lilac-cobalt";
type RadiusPresetId = "rounded" | "pill" | "crisp";
type MotionPresetId = "scale" | "bounce" | "glow";

interface GradientPreset {
  id: GradientPresetId;
  label: string;
  cssValue: string;
  buttonStyle: string;
  swatchClass: string;
}

const GRADIENT_PRESETS: readonly GradientPreset[] = [
  {
    id: "cobalt-mint",
    label: "Cobalt → Mint",
    cssValue: "linear-gradient(45deg, #4F6BFF, #A7E3D1)",
    buttonStyle: "linear-gradient(135deg, #4F6BFF 0%, #63B3ED 52%, #A7E3D1 100%)",
    swatchClass: "bg-gradient-to-r from-[#4F6BFF] to-[#A7E3D1]",
  },
  {
    id: "coral-butter",
    label: "Coral → Butter",
    cssValue: "linear-gradient(45deg, #FF8C7A, #FFE08A)",
    buttonStyle: "linear-gradient(135deg, #FF8C7A 0%, #FBBF24 100%)",
    swatchClass: "bg-gradient-to-r from-[#FF8C7A] to-[#FFE08A]",
  },
  {
    id: "lilac-cobalt",
    label: "Lilac → Cobalt",
    cssValue: "linear-gradient(45deg, #C9BBFF, #4F6BFF)",
    buttonStyle: "linear-gradient(135deg, #9F7AEA 0%, #4F6BFF 100%)",
    swatchClass: "bg-gradient-to-r from-[#C9BBFF] to-[#4F6BFF]",
  },
] as const;

const RADIUS_PRESETS: Record<
  RadiusPresetId,
  { label: string; cssRadius: string; className: string }
> = {
  rounded: { label: "16px Soft", cssRadius: "16px", className: "rounded-2xl" },
  pill: { label: "999px Pill", cssRadius: "999px", className: "rounded-full" },
  crisp: { label: "8px Studio", cssRadius: "8px", className: "rounded-lg" },
};

const MOTION_PRESETS: Record<
  MotionPresetId,
  { label: string; cssTransform: string; hoverClass: string }
> = {
  scale: {
    label: "scale(1.06)",
    cssTransform: "scale(1.06)",
    hoverClass: "hover:scale-105 active:scale-95",
  },
  bounce: {
    label: "translateY(-4px)",
    cssTransform: "translateY(-4px) scale(1.04)",
    hoverClass: "hover:-translate-y-1.5 hover:scale-[1.04] active:translate-y-0",
  },
  glow: {
    label: "glow + rotate",
    cssTransform: "rotate(-2deg) scale(1.05)",
    hoverClass: "hover:-rotate-2 hover:scale-105",
  },
};

export function LiveBlueprintStage({ className }: { className?: string }) {
  const [gradientId, setGradientId] = useState<GradientPresetId>("cobalt-mint");
  const [radiusId, setRadiusId] = useState<RadiusPresetId>("rounded");
  const [motionId, setMotionId] = useState<MotionPresetId>("scale");
  const [exploded, setExploded] = useState(false);
  const [editorTab, setEditorTab] = useState<"css" | "html">("css");
  const [clickCount, setClickCount] = useState(0);

  const activeGradient =
    GRADIENT_PRESETS.find((g) => g.id === gradientId) ?? GRADIENT_PRESETS[0];
  const activeRadius = RADIUS_PRESETS[radiusId];
  const activeMotion = MOTION_PRESETS[motionId];

  const handleReset = () => {
    setGradientId("cobalt-mint");
    setRadiusId("rounded");
    setMotionId("scale");
    setExploded(false);
    setEditorTab("css");
    setClickCount(0);
  };

  return (
    <div
      className={cn(
        "rounded-[28px] border border-[#E5DFD3] bg-white p-5 sm:p-7 shadow-[0_18px_45px_-15px_rgba(14,27,61,0.08)] dark:border-white/10 dark:bg-[#131E3A]",
        className,
      )}
    >
      {/* Top Header matching Panel 6 ("Let's style that button!") */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-[#F4EFE6] dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#4F6BFF] dark:text-[#8DA2FF]">
            <span className="inline-block h-2 w-2 rounded-full bg-[#4F6BFF]" />
            <span>Interactive Blueprint Sandbox · Try Live Tokens</span>
          </div>
          <h3 className="mt-1 font-display text-xl font-extrabold tracking-tight text-[#0E1B3D] sm:text-2xl dark:text-white">
            Let&apos;s style that button!
          </h3>
          <p className="mt-0.5 text-sm text-[#4A5578] dark:text-[#CBD5F0]">
            CSS lets us make things look tactile and alive. Change the gradient, corner radius, or
            explode the layers below.
          </p>
        </div>

        {/* Action controls: Explode Layers & Reset Stage */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setExploded((prev) => !prev)}
            aria-pressed={exploded}
            className={cn(
              "inline-flex min-h-[44px] items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all",
              exploded
                ? "border-[#4F6BFF] bg-[#4F6BFF] text-white shadow-[0_8px_20px_-4px_rgba(79,107,255,0.45)]"
                : "border-[#E5DFD3] bg-[#FFFDF9] text-[#0E1B3D] hover:border-[#4F6BFF] dark:border-white/15 dark:bg-[#0B1226] dark:text-white",
            )}
          >
            <Layers className="h-4 w-4" />
            <span>{exploded ? "Collapse Layers" : "Explode Layers"}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#E5DFD3] bg-[#FFFDF9] px-3.5 py-2 text-xs font-semibold text-[#4A5578] transition-colors hover:border-[#0E1B3D] hover:text-[#0E1B3D] dark:border-white/15 dark:bg-[#0B1226] dark:text-[#CBD5F0]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Stage</span>
          </button>
        </div>
      </div>

      {/* 3 Style Token Controls Bar */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Token 1: Gradient Surface */}
        <div className="rounded-2xl border border-[#E5DFD3]/80 bg-[#FFFDF9] p-3 dark:border-white/10 dark:bg-[#0B1226]">
          <div className="font-mono text-[11px] font-semibold text-[#4A5578] dark:text-[#94A3C9]">
            1. Gradient Fill
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {GRADIENT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setGradientId(preset.id)}
                className={cn(
                  "inline-flex min-h-[36px] flex-1 items-center justify-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-semibold transition-all",
                  gradientId === preset.id
                    ? "border-[#4F6BFF] bg-[#EEF2FF] text-[#0E1B3D] shadow-xs dark:bg-[#1D294D] dark:text-white"
                    : "border-transparent bg-white text-[#4A5578] hover:text-[#0E1B3D] dark:bg-[#131E3A] dark:text-[#CBD5F0]",
                )}
              >
                <span className={cn("h-3 w-3 rounded-full shrink-0", preset.swatchClass)} />
                <span className="truncate">{preset.label.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Token 2: Border Radius */}
        <div className="rounded-2xl border border-[#E5DFD3]/80 bg-[#FFFDF9] p-3 dark:border-white/10 dark:bg-[#0B1226]">
          <div className="font-mono text-[11px] font-semibold text-[#4A5578] dark:text-[#94A3C9]">
            2. Corner Radius
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(Object.keys(RADIUS_PRESETS) as RadiusPresetId[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setRadiusId(key)}
                className={cn(
                  "inline-flex min-h-[36px] flex-1 items-center justify-center rounded-lg border px-2 py-1 text-xs font-semibold transition-all",
                  radiusId === key
                    ? "border-[#4F6BFF] bg-[#EEF2FF] text-[#0E1B3D] shadow-xs dark:bg-[#1D294D] dark:text-white"
                    : "border-transparent bg-white text-[#4A5578] hover:text-[#0E1B3D] dark:bg-[#131E3A] dark:text-[#CBD5F0]",
                )}
              >
                {RADIUS_PRESETS[key].label}
              </button>
            ))}
          </div>
        </div>

        {/* Token 3: Hover Transform */}
        <div className="rounded-2xl border border-[#E5DFD3]/80 bg-[#FFFDF9] p-3 dark:border-white/10 dark:bg-[#0B1226]">
          <div className="font-mono text-[11px] font-semibold text-[#4A5578] dark:text-[#94A3C9]">
            3. Hover Motion
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(Object.keys(MOTION_PRESETS) as MotionPresetId[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setMotionId(key)}
                className={cn(
                  "inline-flex min-h-[36px] flex-1 items-center justify-center rounded-lg border px-2 py-1 font-mono text-[11px] font-semibold transition-all",
                  motionId === key
                    ? "border-[#4F6BFF] bg-[#EEF2FF] text-[#0E1B3D] shadow-xs dark:bg-[#1D294D] dark:text-white"
                    : "border-transparent bg-white text-[#4A5578] hover:text-[#0E1B3D] dark:bg-[#131E3A] dark:text-[#CBD5F0]",
                )}
              >
                {MOTION_PRESETS[key].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Split Live Preview Stage + Deep Navy Code Window (Panel 6 layout) */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Left: Soft Pastel Interactive Preview Canvas (5 cols) */}
        <div className="relative flex min-h-[250px] flex-col justify-between overflow-hidden rounded-2xl border border-[#F3E8FF] bg-gradient-to-br from-[#FFF0F5] via-[#F3E8FF] to-[#E0E7FF] p-5 lg:col-span-5 dark:border-white/10 dark:from-[#1E1B4B] dark:via-[#1E293B] dark:to-[#0F172A]">
          {/* Top Mini Browser Bar */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 font-mono text-[11px] font-bold text-[#4F6BFF] shadow-xs backdrop-blur-xs dark:bg-white/10 dark:text-[#A7E3D1]">
              <Play className="h-3 w-3 fill-current" />
              Live Stage
            </span>
            <span className="font-mono text-[11px] text-[#4A5578] dark:text-[#CBD5F0]">
              {clickCount > 0 ? `Clicked ${clickCount}x ✨` : "Click button to test"}
            </span>
          </div>

          {/* Floating 3D Geometric Shapes in background (matching Panel 6 & 7) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-12 right-6 h-10 w-10 rotate-12 rounded-xl bg-gradient-to-br from-[#93C5FD] to-[#4F6BFF] opacity-80 shadow-md"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-10 left-6 h-9 w-9 -rotate-12 rounded-full bg-gradient-to-br from-[#FFFBEB] to-[#FBBF24] opacity-85 shadow-md"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-8 right-10 h-11 w-11 rotate-12 rounded-xl bg-gradient-to-br from-[#FBCFE8] to-[#FF8C7A] opacity-80 shadow-md"
          />

          {/* Center Interactive Button or Exploded Layer Stack */}
          <div className="relative z-10 my-auto flex flex-col items-center justify-center py-6">
            {exploded ? (
              <div
                data-testid="exploded-layers-view"
                className="w-full max-w-[260px] space-y-2 rounded-2xl border border-[#4F6BFF]/30 bg-white/90 p-3.5 shadow-lg backdrop-blur-md dark:bg-[#0E1B3D]/90"
              >
                <div className="flex items-center justify-between font-mono text-[11px] font-bold text-[#4F6BFF]">
                  <span>Layer 3 · Label &amp; Icon</span>
                  <span>z-index: 30</span>
                </div>
                <div className="rounded-lg border border-dashed border-[#4F6BFF]/40 bg-[#EEF2FF] px-3 py-1.5 font-mono text-xs text-[#0E1B3D] dark:bg-[#1D294D] dark:text-white">
                  &lt;span&gt;Click Me&lt;/span&gt;
                </div>
                <div className="flex items-center justify-between font-mono text-[11px] font-bold text-[#0F7656] dark:text-[#A7E3D1]">
                  <span>Layer 2 · Padding Box</span>
                  <span>12px 24px</span>
                </div>
                <div className="flex items-center justify-between font-mono text-[11px] font-bold text-[#9333EA] dark:text-[#C9BBFF]">
                  <span>Layer 1 · Gradient Surface</span>
                  <span>radius: {activeRadius.cssRadius}</span>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setClickCount((c) => c + 1)}
                style={{ backgroundImage: activeGradient.buttonStyle }}
                className={cn(
                  "group relative inline-flex min-h-[52px] items-center gap-2.5 px-8 py-3.5 font-display text-base font-extrabold text-white shadow-[0_14px_28px_-6px_rgba(79,107,255,0.5)] transition-all duration-300 cursor-pointer",
                  activeRadius.className,
                  activeMotion.hoverClass,
                )}
              >
                <Sparkles className="h-4 w-4 text-[#FFE08A] transition-transform group-hover:rotate-45" />
                <span>Click Me</span>
              </button>
            )}
          </div>

          <div className="text-center font-mono text-[11px] text-[#4A5578] dark:text-[#CBD5F0]">
            button.btn · {activeRadius.cssRadius} · {activeMotion.label}
          </div>
        </div>

        {/* Right: Deep Ink Navy Code Window (7 cols, matching Panel 6) */}
        <div className="atelier-code-window flex flex-col justify-between rounded-2xl p-4 sm:p-5 lg:col-span-7">
          {/* Code Window Header Tabs */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditorTab("html")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs font-semibold transition-colors",
                  editorTab === "html"
                    ? "bg-[#4F6BFF] text-white"
                    : "text-[#94A3C9] hover:text-white",
                )}
              >
                <span className="h-2 w-2 rounded-full bg-[#FF8C7A]" />
                HTML
              </button>
              <button
                type="button"
                onClick={() => setEditorTab("css")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs font-semibold transition-colors",
                  editorTab === "css"
                    ? "bg-[#4F6BFF] text-white"
                    : "text-[#94A3C9] hover:text-white",
                )}
              >
                <span className="h-2 w-2 rounded-full bg-[#A7E3D1]" />
                CSS
              </button>
            </div>
            <span className="font-mono text-[11px] text-[#94A3C9]">style.css · live synced</span>
          </div>

          {/* Code Content */}
          <pre className="my-4 overflow-x-auto font-mono text-xs sm:text-[13px] leading-relaxed text-[#F8F6F0]">
            {editorTab === "css" ? (
              <code>
                <span className="text-[#FFE08A]">.btn</span> {"{\n"}
                {"  "}
                <span className="text-[#93C5FD]">background</span>:{" "}
                <span className="text-[#A7E3D1]">{activeGradient.cssValue}</span>
                {";\n"}
                {"  "}
                <span className="text-[#93C5FD]">color</span>:{" "}
                <span className="text-[#C9BBFF]">white</span>
                {";\n"}
                {"  "}
                <span className="text-[#93C5FD]">padding</span>:{" "}
                <span className="text-[#FFE08A]">12px 24px</span>
                {";\n"}
                {"  "}
                <span className="text-[#93C5FD]">border-radius</span>:{" "}
                <span className="text-[#FFE08A]">{activeRadius.cssRadius}</span>
                {";\n"}
                {"  "}
                <span className="text-[#93C5FD]">transition</span>:{" "}
                <span className="text-[#A7E3D1]">transform 0.3s ease</span>
                {";\n}\n\n"}
                <span className="text-[#FFE08A]">.btn:hover</span> {"{\n"}
                {"  "}
                <span className="text-[#93C5FD]">transform</span>:{" "}
                <span className="text-[#FF8C7A]">{activeMotion.cssTransform}</span>
                {";\n}"}
              </code>
            ) : (
              <code>
                <span className="text-[#93C5FD]">&lt;button</span>{" "}
                <span className="text-[#FFE08A]">class</span>=
                <span className="text-[#A7E3D1]">&quot;btn&quot;</span>
                <span className="text-[#93C5FD]">&gt;</span>
                {"\n  Click Me\n"}
                <span className="text-[#93C5FD]">&lt;/button&gt;</span>
              </code>
            )}
          </pre>

          {/* Bottom Run Bar */}
          <div className="flex items-center justify-between border-t border-white/10 pt-3">
            <span className="font-mono text-[11px] text-[#A7E3D1]">
              ✓ Styles applied in real time
            </span>
            <button
              type="button"
              onClick={() => setClickCount((c) => c + 1)}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-[#4F6BFF] px-4 py-1.5 font-display text-xs font-bold text-white shadow-[0_6px_16px_rgba(79,107,255,0.4)] transition-transform hover:scale-105"
            >
              <Play className="h-3 w-3 fill-current" />
              <span>Run</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pro Tip Bar from Panel 6 */}
      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[#FFE08A]/70 bg-[#FFFBEB] px-4 py-3 text-xs sm:text-sm text-[#0E1B3D] dark:border-[#FFE08A]/25 dark:bg-[#FFE08A]/10 dark:text-[#F8F6F0]">
        <span className="text-base leading-none" aria-hidden="true">
          💡
        </span>
        <div>
          <span className="font-bold">Pro Tip: </span>
          <span className="text-[#4A5578] dark:text-[#CBD5F0]">
            Gradients can make your designs look modern and professional. Try experimenting with the
            tokens above or click &ldquo;Explode Layers&rdquo; to inspect how the button is built!
          </span>
        </div>
      </div>
    </div>
  );
}
