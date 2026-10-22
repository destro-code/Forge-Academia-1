import { Check, ChevronDown, CircleDot, Construction } from "lucide-react";
import { canonicalManifest } from "@/lib/curriculum/manifest";
import { getAtelierModules } from "@/lib/curriculum/atelier-chapters";
import { useProgress } from "@/lib/hooks/use-progress";

interface LearningPathFoliosProps {
  selectedChapterId: string;
  onSelectChapter: (chapterId: string) => void;
  activeModuleId?: string;
}

const accentStyles: Record<string, { surface: string; ink: string; soft: string }> = {
  mint: { surface: "#A7E3D1", ink: "#0E1B3D", soft: "#E9F8F2" },
  cobalt: { surface: "#4F6BFF", ink: "#FFFFFF", soft: "#EEF0FF" },
  butter: { surface: "#FFE08A", ink: "#0E1B3D", soft: "#FFF8DF" },
  lilac: { surface: "#C9BBFF", ink: "#0E1B3D", soft: "#F3EFFF" },
};

function FolioArtwork({ chapterId, color }: { chapterId: string; color: string }) {
  const art = chapterId === "01" ? "structure" : chapterId === "02" ? "style" : chapterId === "03" ? "logic" : "systems";
  return (
    <svg viewBox="0 0 240 112" aria-hidden="true" className={`atelier-folio-artwork atelier-folio-artwork--${chapterId} h-[92px] w-full max-w-[240px]`}>
      <ellipse cx="120" cy="99" rx="76" ry="6" fill="#0E1B3D" opacity=".13" />
      {art === "structure" && <>
        <g className="folio-art-float">
          <path d="M30 32 48 20 67 32 67 78 48 90 30 78Z" fill="#A7E3D1" stroke="#0E1B3D" strokeWidth="2.5" strokeLinejoin="round"/>
          <path d="M48 20v70M30 32l18 12 19-12M30 78l18-12 19 12" fill="none" stroke="#0E1B3D" strokeWidth="1.5" opacity=".6"/>
          <rect x="75" y="17" width="111" height="70" rx="9" fill="#FFFDF9" stroke="#0E1B3D" strokeWidth="2.5"/>
          <path d="M75 31h111" stroke="#0E1B3D" strokeWidth="2"/>
          <circle cx="85" cy="24" r="2.5" fill="#FF8C7A"/><circle cx="93" cy="24" r="2.5" fill="#FFE08A"/><circle cx="101" cy="24" r="2.5" fill="#A7E3D1"/>
          <rect x="87" y="42" width="31" height="32" rx="4" fill="#C9BBFF"/>
          <path d="M125 45h48M125 54h38M125 63h43M125 72h27" stroke="#4F6BFF" strokeWidth="3.5" strokeLinecap="round"/>
          <path d="m192 34 9 9-9 9" fill="none" stroke="#FF8C7A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
      </>}
      {art === "style" && <>
        <g className="folio-art-float">
          <rect x="39" y="18" width="111" height="70" rx="9" fill="#FFFDF9" stroke="#0E1B3D" strokeWidth="2.5"/>
          <rect x="48" y="27" width="93" height="9" rx="4.5" fill="#0E1B3D"/>
          <rect x="49" y="44" width="35" height="34" rx="5" fill="#C9BBFF" stroke="#0E1B3D" strokeWidth="1.5"/>
          <rect x="90" y="44" width="51" height="14" rx="4" fill="#A7E3D1"/>
          <rect x="90" y="63" width="22" height="15" rx="4" fill="#FFE08A"/>
          <rect x="117" y="63" width="24" height="15" rx="4" fill="#FFB5A8"/>
          <g transform="translate(154 31) rotate(8)">
            <rect width="47" height="47" rx="10" fill={color} stroke="#0E1B3D" strokeWidth="2.5"/>
            <circle cx="15" cy="15" r="6" fill="#FF8C7A" stroke="#0E1B3D" strokeWidth="1.5"/>
            <circle cx="31" cy="15" r="6" fill="#FFE08A" stroke="#0E1B3D" strokeWidth="1.5"/>
            <circle cx="15" cy="32" r="6" fill="#A7E3D1" stroke="#0E1B3D" strokeWidth="1.5"/>
            <circle cx="31" cy="32" r="6" fill="#4F6BFF" stroke="#0E1B3D" strokeWidth="1.5"/>
          </g>
        </g>
      </>}
      {art === "logic" && <>
        <g className="folio-art-float">
          <path d="M40 18h115l18 18v49H40Z" fill="#0E1B3D" stroke="#0E1B3D" strokeWidth="2.5" strokeLinejoin="round"/>
          <path d="M155 18v18h18" fill="#4F6BFF" stroke="#FFFDF9" strokeWidth="1.5" strokeLinejoin="round"/>
          <circle cx="53" cy="30" r="2.5" fill="#FF8C7A"/><circle cx="62" cy="30" r="2.5" fill="#FFE08A"/><circle cx="71" cy="30" r="2.5" fill="#A7E3D1"/>
          <path d="m57 48 10 8-10 8M76 65h22" fill="none" stroke="#A7E3D1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="m130 43-13 21h12l-8 16 24-27h-13l8-10Z" fill="#FFE08A" stroke="#0E1B3D" strokeWidth="1.5" strokeLinejoin="round"/>
          <circle cx="187" cy="72" r="18" fill="#FF8C7A" stroke="#0E1B3D" strokeWidth="2.5"/>
          <path d="M180 72h14M187 65v14" stroke="#0E1B3D" strokeWidth="2.5" strokeLinecap="round"/>
        </g>
      </>}
      {art === "systems" && <>
        <g className="folio-art-float">
          <path d="M120 22 143 35v27l-23 13-23-13V35Z" fill="#C9BBFF" stroke="#0E1B3D" strokeWidth="2.5" strokeLinejoin="round"/>
          <rect x="18" y="34" width="48" height="38" rx="9" fill="#A7E3D1" stroke="#0E1B3D" strokeWidth="2.5"/>
          <rect x="174" y="34" width="48" height="38" rx="9" fill="#FFE08A" stroke="#0E1B3D" strokeWidth="2.5"/>
          <rect x="96" y="78" width="48" height="22" rx="8" fill="#FFB5A8" stroke="#0E1B3D" strokeWidth="2.5"/>
          <path d="M66 53h24l13-11M150 41l13 12h11M120 70v8" fill="none" stroke="#0E1B3D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="120" cy="48" r="7" fill="#FFFDF9" stroke="#0E1B3D" strokeWidth="2"/>
          <path d="M111 55h18" stroke="#4F6BFF" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="m28 53 7 7 13-15M185 53h25M185 61h18" fill="none" stroke="#0E1B3D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
      </>}
      <path d="M207 13 210 20 217 23 210 26 207 33 204 26 197 23 204 20Z" fill="#FF8C7A"/>
      <circle cx="26" cy="17" r="3" fill="#4F6BFF"/>
    </svg>
  );
}

export function LearningPathFolios({
  selectedChapterId,
  onSelectChapter,
  activeModuleId,
}: LearningPathFoliosProps) {
  const chapters = getAtelierModules();
  const { lessonsCompleted } = useProgress();
  const completedIds = new Set(lessonsCompleted);

  return (
    <section aria-labelledby="atelier-path-title" className="min-w-0">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-[#4F6BFF]">The learning journey</p>
          <h2 id="atelier-path-title" className="mt-2 font-display text-2xl font-extrabold tracking-tight text-[#0E1B3D] sm:text-3xl">Four folios. A growing craft.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#596174]">Pick a chapter to unfold its modules and lessons. Nothing is locked behind mystery percentages.</p>
        </div>
        <span className="rounded-full border border-[#0E1B3D]/10 bg-white px-3 py-2 text-xs font-semibold text-[#596174]">Choose your next layer <ChevronDown size={14} className="ml-1 inline" /></span>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        {chapters.map((chapter) => {
          const palette = accentStyles[chapter.color] ?? accentStyles.mint;
          const refs = chapter.modules.flatMap((module) => canonicalManifest.getLessonsForModule(module.moduleId));
          const authoredIds = refs.filter((lesson) => lesson.authored !== false).map((lesson) => lesson.lessonId);
          const plannedCount = refs.filter((lesson) => lesson.authored === false).length;
          const completed = authoredIds.filter((id) => completedIds.has(id)).length;
          const percent = authoredIds.length ? Math.round((completed / authoredIds.length) * 100) : 0;
          const selected = chapter.id === selectedChapterId;
          const containsActive = Boolean(activeModuleId && chapter.moduleIds.some((moduleId) => moduleId === activeModuleId));
          return (
            <button
              key={chapter.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelectChapter(chapter.id)}
              className={`atelier-folio-card group relative flex min-w-0 flex-col overflow-hidden rounded-[26px] border-2 p-4 text-left transition duration-200 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F6BFF] focus-visible:ring-offset-2 sm:p-5 ${selected ? "border-[#0E1B3D] bg-white shadow-[7px_7px_0_#0E1B3D]" : "border-[#0E1B3D]/10 bg-white/85 hover:border-[#0E1B3D]/30 hover:shadow-[0_12px_28px_-20px_rgba(14,27,61,.45)]"}`}
            >
              <div className="flex w-full items-center justify-between gap-3">
                <span className="font-mono text-xs font-bold tracking-[.14em] text-[#596174]">FOLIO {chapter.id}</span>
                <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ backgroundColor: palette.soft, color: "#0E1B3D" }}>
                  {percent === 100 && authoredIds.length > 0 ? <Check size={12} /> : selected ? <CircleDot size={12} /> : plannedCount > 0 && authoredIds.length === 0 ? <Construction size={12} /> : <CircleDot size={12} />}
                  {percent === 100 && authoredIds.length > 0 ? "Completed" : containsActive ? "Your current chapter" : authoredIds.length === 0 ? "In preparation" : `${percent}% explored`}
                </span>
              </div>
              <div className="my-2 flex min-h-[92px] items-center justify-center rounded-2xl px-3" style={{ background: palette.soft }}>
                <FolioArtwork chapterId={chapter.id} color={palette.surface} />
              </div>
              <h3 className="text-lg font-extrabold leading-tight tracking-tight text-[#0E1B3D]">{chapter.title}</h3>
              <p className="mt-1 text-sm leading-5 text-[#596174]">{chapter.subtitle}</p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[#596174]">
                <span>{chapter.modules.length} {chapter.modules.length === 1 ? "module" : "modules"}</span>
                <span>{completed}/{authoredIds.length} lessons completed</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#EDEAE4]"><div className="h-full rounded-full transition-[width]" style={{ width: `${percent}%`, backgroundColor: palette.surface }} /></div>
              {plannedCount > 0 && <span className="mt-2 text-[11px] text-[#777E8D]">{plannedCount} planned lessons remain unavailable</span>}
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[#4F6BFF]">{selected ? "Chapter unfolded" : "Unfold chapter"} <ChevronDown size={15} className={`transition-transform ${selected ? "rotate-180" : ""}`}/></span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
