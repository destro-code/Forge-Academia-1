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
  const isFirst = chapterId === "01";
  const isSecond = chapterId === "02";
  const isThird = chapterId === "03";
  return (
    <svg viewBox="0 0 220 96" aria-hidden="true" className="h-[84px] w-full max-w-[220px]">
      <ellipse cx="108" cy="85" rx="58" ry="5" fill="#0E1B3D" opacity=".12" />
      <g transform={isSecond ? "translate(18 8) rotate(-8 60 40)" : isThird ? "translate(15 7) rotate(5 60 40)" : "translate(18 7)"}>
        <rect x="16" y="14" width="104" height="62" rx="11" fill={color} stroke="#0E1B3D" strokeWidth="2.5" />
        <rect x="23" y="21" width="90" height="11" rx="5" fill="#FFFDF9" opacity=".9" />
        <circle cx="30" cy="26.5" r="2" fill="#FF8C7A" /><circle cx="37" cy="26.5" r="2" fill="#FFE08A" /><circle cx="44" cy="26.5" r="2" fill="#A7E3D1" />
        {isFirst ? <><path d="M34 43h25v23H34z" fill="#FFFDF9" stroke="#0E1B3D" strokeWidth="2" /><path d="M40 49h13M40 55h13M40 61h8" stroke="#4F6BFF" strokeWidth="2.5" strokeLinecap="round" /></> :
          isSecond ? <><rect x="31" y="41" width="27" height="25" rx="5" fill="#FFFDF9" stroke="#0E1B3D" strokeWidth="2" /><path d="M67 44h34M67 52h26M67 60h30" stroke="#0E1B3D" strokeWidth="3" strokeLinecap="round" /></> :
          isThird ? <><path d="M34 43h23l-9 9 9 9H34" stroke="#0E1B3D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /><circle cx="78" cy="51" r="10" fill="#FFFDF9" stroke="#0E1B3D" strokeWidth="2" /><path d="M78 45v12M72 51h12" stroke="#4F6BFF" strokeWidth="2.5" /></> :
          <><rect x="31" y="40" width="25" height="25" rx="6" fill="#FFFDF9" stroke="#0E1B3D" strokeWidth="2" /><rect x="64" y="40" width="25" height="25" rx="6" fill="#A7E3D1" stroke="#0E1B3D" strokeWidth="2" /><path d="M43 35v5M76 35v5M56 52h8" stroke="#0E1B3D" strokeWidth="2.5" strokeLinecap="round" /></>}
      </g>
      <g transform="translate(130 19) rotate(8)">
        <rect x="0" y="0" width="56" height="47" rx="10" fill="#FFFDF9" stroke="#0E1B3D" strokeWidth="2.5" />
        <path d="M12 14h29M12 22h22M12 30h27" stroke={color} strokeWidth="4" strokeLinecap="round" />
      </g>
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
          const containsActive = Boolean(activeModuleId && chapter.moduleIds.includes(activeModuleId));
          return (
            <button
              key={chapter.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelectChapter(chapter.id)}
              className={`group relative flex min-w-0 flex-col overflow-hidden rounded-[26px] border-2 p-4 text-left transition duration-200 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F6BFF] focus-visible:ring-offset-2 sm:p-5 ${selected ? "border-[#0E1B3D] bg-white shadow-[7px_7px_0_#0E1B3D]" : "border-[#0E1B3D]/10 bg-white/85 hover:border-[#0E1B3D]/30 hover:shadow-[0_12px_28px_-20px_rgba(14,27,61,.45)]"}`}
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
