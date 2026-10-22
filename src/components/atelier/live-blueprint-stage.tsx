import { useState } from "react";
import { RotateCcw, Layers3, Sparkles } from "lucide-react";

const presets = [
  { id: "mint", label: "Mint", surface: "#A7E3D1", accent: "#4F6BFF", radius: "22px" },
  { id: "lilac", label: "Lilac", surface: "#C9BBFF", accent: "#FF8C7A", radius: "8px" },
  { id: "butter", label: "Butter", surface: "#FFE08A", accent: "#0E1B3D", radius: "999px" },
] as const;

export function LiveBlueprintStage() {
  const [presetId, setPresetId] = useState<(typeof presets)[number]["id"]>("mint");
  const [exploded, setExploded] = useState(false);
  const [clicked, setClicked] = useState(false);
  const preset = presets.find((item) => item.id === presetId) ?? presets[0];
  const reset = () => { setPresetId("mint"); setExploded(false); setClicked(false); };
  return <section aria-labelledby="blueprint-title" className="atelier-live-blueprint overflow-hidden rounded-[28px] border border-[#0E1B3D]/15 bg-white shadow-[0_18px_55px_-30px_rgba(14,27,61,.4)]">
    <div className="flex items-center justify-between border-b border-[#0E1B3D]/10 px-4 py-3 sm:px-5">
      <div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#657087]">Live preview · forge.studio</p><h2 id="blueprint-title" className="mt-1 font-display text-lg font-bold text-[#0E1B3D]">The little component lab</h2></div>
      <span className="flex gap-1.5"><i className="size-2.5 rounded-full bg-[#FF8C7A]"/><i className="size-2.5 rounded-full bg-[#FFE08A]"/><i className="size-2.5 rounded-full bg-[#A7E3D1]"/></span>
    </div>
    <div className="grid md:grid-cols-[1.1fr_.9fr]">
      <div className="atelier-paper-grid flex min-h-[250px] flex-col items-center justify-center gap-6 p-5">
        <div className="flex flex-wrap justify-center gap-2">{presets.map((item) => <button key={item.id} type="button" aria-pressed={presetId === item.id} onClick={() => setPresetId(item.id)} className={`min-h-10 rounded-full border px-4 text-sm font-bold transition ${presetId === item.id ? "border-[#0E1B3D] bg-[#0E1B3D] text-white" : "border-[#0E1B3D]/15 bg-white text-[#0E1B3D]"}`}>{item.label}</button>)}</div>
        <div className={`relative transition-all duration-300 ${exploded ? "translate-y-2" : ""}`} style={{ transform: exploded ? "translateY(8px) rotate(-3deg)" : undefined }}>
          {exploded && <div className="absolute -left-6 -top-4 h-20 w-28 rounded-2xl border-2 border-dashed border-[#4F6BFF] bg-[#C9BBFF]/60"/>}
          <button type="button" onClick={() => setClicked((value) => !value)} className="relative grid h-32 w-44 place-items-center border-[3px] border-[#0E1B3D] font-display text-xl font-extrabold text-[#0E1B3D] shadow-[7px_7px_0_#0E1B3D] transition hover:-translate-y-1" style={{ background: preset.surface, borderRadius: preset.radius }}><Sparkles size={23} style={{ color: preset.accent }}/>{clicked ? "Nice click!" : "Hello, builder"}</button>
          {exploded && <span className="absolute -bottom-5 -right-5 rounded-lg bg-[#FFE08A] px-2 py-1 font-mono text-[10px] font-bold text-[#0E1B3D]">component.tsx</span>}
        </div>
        <p className="text-center text-xs text-[#596174]">Tap the component. Change a token. See the design respond.</p>
      </div>
      <div className="atelier-code-window flex flex-col justify-between p-5 sm:p-6">
        <div><div className="mb-4 flex items-center gap-2 font-mono text-xs text-[#C9BBFF]"><span className="size-2 rounded-full bg-[#A7E3D1]"/> component.tsx</div><pre className="overflow-x-auto text-xs leading-6 sm:text-sm"><code><span className="text-[#C9BBFF]">const</span> button = {'{'}{"\n"}  surface: <span className="text-[#FFE08A]">'{preset.surface}'</span>,{"\n"}  radius: <span className="text-[#FFE08A]">'{preset.radius}'</span>,{"\n"}  state: <span className="text-[#A7E3D1]">'{clicked ? "clicked" : "ready"}'</span>{"\n"}{'}'};</code></pre></div>
        <div className="mt-6 flex flex-wrap gap-2"><button type="button" onClick={() => setExploded((value) => !value)} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#C9BBFF] px-3 py-2 text-sm font-bold text-[#0E1B3D]"><Layers3 size={16}/>{exploded ? "Fold Layers" : "Explode Layers"}</button><button type="button" onClick={reset} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/20 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"><RotateCcw size={15}/>Reset Stage</button></div>
      </div>
    </div>
  </section>;
}
