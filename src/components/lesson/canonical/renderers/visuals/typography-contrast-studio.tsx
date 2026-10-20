import { useState } from "react";
import { Type, RotateCcw, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ColorPairPreset {
  id: string;
  label: string;
  fg: string;
  bg: string;
  muted: string;
}

const COLOR_PRESETS: ColorPairPreset[] = [
  {
    id: "obsidian-high",
    label: "Studio Dark (AAA)",
    fg: "#F8FAFC",
    bg: "#0F172A",
    muted: "#94A3B8",
  },
  {
    id: "editorial-paper",
    label: "Editorial Light (AAA)",
    fg: "#0F172A",
    bg: "#F8FAFC",
    muted: "#475569",
  },
  {
    id: "ocean-aa",
    label: "Deep Navy (AA)",
    fg: "#E0F2FE",
    bg: "#0C4A6E",
    muted: "#7DD3FC",
  },
  {
    id: "low-contrast-fail",
    label: "Low Contrast (Fail)",
    fg: "#94A3B8",
    bg: "#E2E8F0",
    muted: "#CBD5E1",
  },
];

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const transform = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const [R, G, B] = [transform(r), transform(g), transform(b)];
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function calculateContrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hexToRgb(hex1));
  const l2 = relativeLuminance(hexToRgb(hex2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

export function TypographyContrastStudio() {
  const [scaleRatio, setScaleRatio] = useState<number>(1.25);
  const [lineHeight, setLineHeight] = useState<number>(1.6);
  const [measureCh, setMeasureCh] = useState<number>(62);
  const [presetId, setPresetId] = useState<string>("obsidian-high");

  const activePreset = COLOR_PRESETS.find((p) => p.id === presetId) ?? COLOR_PRESETS[0];
  const contrastRatio = calculateContrastRatio(activePreset.fg, activePreset.bg);
  const passesAA = contrastRatio >= 4.5;
  const passesAAA = contrastRatio >= 7.0;

  const basePx = 16;
  const h1Px = Math.round(basePx * Math.pow(scaleRatio, 3));
  const h2Px = Math.round(basePx * Math.pow(scaleRatio, 2));

  const handleReset = () => {
    setScaleRatio(1.25);
    setLineHeight(1.6);
    setMeasureCh(62);
    setPresetId("obsidian-high");
  };

  return (
    <div
      className="grid gap-6 rounded-xl border border-lesson-border bg-lesson-surface p-5 sm:p-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]"
      data-testid="typography-contrast-studio"
    >
      {/* Left: Live Editorial Specimen Canvas */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-lesson-border bg-lesson-bg/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-lesson-border pb-3">
          <div className="flex items-center gap-2 text-xs text-lesson-text-secondary">
            <Type className="h-4 w-4 text-indigo-500" />
            <span className="font-semibold text-lesson-text-primary">
              Typography Scale &amp; WCAG Contrast Studio
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs tabular-nums">
            <span>Contrast: {contrastRatio}:1</span>
            <span aria-hidden="true">·</span>
            {passesAAA ? (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> WCAG AAA
              </span>
            ) : passesAA ? (
              <span className="inline-flex items-center gap-1 font-semibold text-sky-600 dark:text-sky-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> WCAG AA
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
                <AlertTriangle className="h-3.5 w-3.5" /> Fails WCAG AA (&lt;4.5:1)
              </span>
            )}
          </div>
        </div>

        {/* Rendered Specimen Surface */}
        <div
          style={{
            backgroundColor: activePreset.bg,
            color: activePreset.fg,
          }}
          className="flex min-h-[260px] flex-col justify-center rounded-xl border border-lesson-border p-6 transition-colors duration-200"
        >
          <div style={{ maxWidth: `${measureCh}ch` }} className="space-y-3">
            <div
              style={{ color: activePreset.muted }}
              className="font-mono text-xs tracking-wide tabular-nums"
            >
              Design System Specimen · Scale {scaleRatio}x · Measure {measureCh}ch
            </div>
            <h3
              style={{
                fontSize: `${h1Px}px`,
                lineHeight: 1.15,
              }}
              className="font-bold tracking-tight text-balance"
            >
              Visual Hierarchy Guides the Eye Before a Word Is Read
            </h3>
            <h4
              style={{
                fontSize: `${h2Px}px`,
                lineHeight: 1.3,
                color: activePreset.muted,
              }}
              className="font-medium"
            >
              Balanced line width ({measureCh}ch) and {lineHeight}x leading prevent eye fatigue.
            </h4>
            <p
              style={{
                fontSize: `${basePx}px`,
                lineHeight,
              }}
              className="pt-1"
            >
              Professional interface typography relies on deliberate contrast between display
              headings, subheadings, and body prose. When line length stays between 55ch and 75ch
              and luminance contrast exceeds 4.5:1, long-form reading feels effortless.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-lesson-border pt-3 font-mono text-xs text-lesson-text-secondary tabular-nums">
          <span>
            H1: {h1Px}px · H2: {h2Px}px · Body: {basePx}px
          </span>
          <span>
            Leading: {lineHeight} · Measure: {measureCh}ch
          </span>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex flex-col justify-between gap-5 rounded-xl border border-lesson-border bg-lesson-bg/40 p-5">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-lesson-text-primary">
              Type &amp; Contrast Controls
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

          {/* Color Palette Presets */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-lesson-text-secondary">
              Surface &amp; Foreground Contrast Pair
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setPresetId(preset.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs font-medium transition-colors",
                    presetId === preset.id
                      ? "border-primary bg-primary/10 text-lesson-text-primary"
                      : "border-lesson-border bg-lesson-surface text-lesson-text-secondary hover:text-lesson-text-primary",
                  )}
                >
                  <span
                    className="h-4 w-4 shrink-0 rounded border border-lesson-border"
                    style={{ backgroundColor: preset.bg }}
                  />
                  <span className="truncate">{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Modular Type Scale */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="type-scale" className="font-medium text-lesson-text-secondary">
                Modular Scale Ratio
              </label>
              <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">
                {scaleRatio}x
              </span>
            </div>
            <input
              id="type-scale"
              type="range"
              min={1.125}
              max={1.4}
              step={0.025}
              value={scaleRatio}
              onChange={(e) => setScaleRatio(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          {/* Line Height */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="type-lh" className="font-medium text-lesson-text-secondary">
                Body Line Height (Leading)
              </label>
              <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">
                {lineHeight}
              </span>
            </div>
            <input
              id="type-lh"
              type="range"
              min={1.2}
              max={1.9}
              step={0.05}
              value={lineHeight}
              onChange={(e) => setLineHeight(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          {/* Measure (ch) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="type-measure" className="font-medium text-lesson-text-secondary">
                Line Measure (max-width)
              </label>
              <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">
                {measureCh}ch
              </span>
            </div>
            <input
              id="type-measure"
              type="range"
              min={38}
              max={85}
              step={2}
              value={measureCh}
              onChange={(e) => setMeasureCh(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
        </div>

        <div className="rounded-lg border border-lesson-border bg-lesson-surface p-3">
          <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-lesson-text-primary tabular-nums">
{`.prose-specimen {
  color: ${activePreset.fg};
  background: ${activePreset.bg}; /* ${contrastRatio}:1 */
  max-width: ${measureCh}ch;
  line-height: ${lineHeight};
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}
