import { useState } from "react";
import { Code2, Layers2, RotateCcw, Sparkles } from "lucide-react";
import { BlueprintArrow } from "@/components/atelier/forge-buddy-illos";

const presets = [
  { id: "mint", label: "Mint", color: "#A7E3D1", description: "Calm and considered" },
  { id: "lilac", label: "Lilac", color: "#C9BBFF", description: "Playful and expressive" },
  { id: "butter", label: "Butter", color: "#FFE08A", description: "Warm and bright" },
] as const;

export function LiveBlueprintStage() {
  const [preset, setPreset] = useState<(typeof presets)[number]["id"]>("mint");
  const [exploded, setExploded] = useState(false);
  const selected = presets.find((item) => item.id === preset) ?? presets[0];

  const reset = () => {
    setPreset("mint");
    setExploded(false);
  };

  return (
    <section aria-labelledby="blueprint-stage-title" className="relative min-w-0">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-primary">Live preview · 01</p>
          <h2 id="blueprint-stage-title" className="mt-1 text-lg font-bold tracking-tight">The blueprint stage</h2>
        </div>
        <button type="button" onClick={reset} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-xs font-semibold hover:bg-muted"><RotateCcw className="h-3.5 w-3.5" /> Reset stage</button>
      </div>

      <div className="atelier-blueprint-frame overflow-hidden rounded-[1.6rem] p-3 sm:p-4">
        <div className="overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_20px_55px_-35px_rgba(14,27,61,.5)]">
          <div className="flex h-10 items-center gap-1.5 border-b border-[#E8E5E0] bg-[#FBFAF7] px-3">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF8C7A]" /><span className="h-2.5 w-2.5 rounded-full bg-[#FFE08A]" /><span className="h-2.5 w-2.5 rounded-full bg-[#A7E3D1]" />
            <span className="ml-2 rounded-md bg-white px-2 py-1 font-mono text-[10px] text-[#667085]">live-preview.forge</span>
          </div>
          <div className="relative min-h-[205px] overflow-hidden p-5 sm:min-h-[230px] sm:p-7" style={{ background: selected.color }}>
            <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full border-[22px] border-white/20" />
            <div className={`relative mx-auto max-w-[260px] rounded-[1.3rem] border-2 border-[#0E1B3D] bg-[#FFFDF9] p-4 shadow-[7px_7px_0_#0E1B3D] transition-transform duration-300 ${exploded ? "-translate-y-2 rotate-[-2deg]" : ""}`}>
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl border-2 border-[#0E1B3D]" style={{ background: selected.color }}><Sparkles className="h-5 w-5 text-[#0E1B3D]" /></div>
                <div><p className="text-sm font-extrabold text-[#0E1B3D]">A thoughtful card</p><p className="text-xs text-[#59627A]">{selected.description}</p></div>
              </div>
              <div className="mt-4 h-2 rounded-full bg-[#E9E7E1]"><div className="h-2 w-2/3 rounded-full" style={{ background: selected.color }} /></div>
              <div className="mt-3 flex gap-2"><span className="rounded-full border border-[#0E1B3D]/15 px-2.5 py-1 text-[10px] font-bold text-[#0E1B3D]">Structure</span><span className="rounded-full border border-[#0E1B3D]/15 px-2.5 py-1 text-[10px] font-bold text-[#0E1B3D]">Style</span></div>
            </div>
            {exploded && <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-2"><span className="rounded-lg border border-[#0E1B3D] bg-white/90 px-2 py-1 font-mono text-[10px] text-[#0E1B3D]">HTML</span><span className="rounded-lg border border-[#0E1B3D] bg-white/90 px-2 py-1 font-mono text-[10px] text-[#0E1B3D]">CSS</span><span className="rounded-lg border border-[#0E1B3D] bg-white/90 px-2 py-1 font-mono text-[10px] text-[#0E1B3D]">State</span></div>}
          </div>
        </div>

        <div className="relative mt-3 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="atelier-code-window min-w-0 overflow-hidden rounded-2xl p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-white/75"><Code2 className="h-4 w-4" /> design-tokens.css</div>
            <pre className="overflow-x-auto text-[11px] leading-5 text-[#D9E2FF]"><code>{`.card {\n  background: ${selected.color};\n  border: 2px solid #0E1B3D;\n  border-radius: 1.3rem;\n}`}</code></pre>
          </div>
          <BlueprintArrow className="hidden h-12 w-24 lg:block" />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-semibold text-muted-foreground">Try a token</span>
          {presets.map((item) => <button key={item.id} type="button" aria-pressed={preset === item.id} onClick={() => setPreset(item.id)} className={`inline-flex min-h-[40px] items-center gap-2 rounded-full border px-3 text-xs font-bold transition-colors ${preset === item.id ? "border-[var(--atelier-navy)] bg-card text-foreground shadow-sm" : "border-border bg-background text-muted-foreground hover:text-foreground"}`}><span className="h-3 w-3 rounded-full border border-black/10" style={{ background: item.color }} />{item.label}</button>)}
          <button type="button" aria-pressed={exploded} onClick={() => setExploded((value) => !value)} className="ml-auto inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-border bg-card px-3 text-xs font-semibold hover:bg-muted"><Layers2 className="h-4 w-4" />{exploded ? "Collapse layers" : "Explode layers"}</button>
        </div>
      </div>
    </section>
  );
}
