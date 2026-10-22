import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Clock3, Construction, Play, RotateCcw } from "lucide-react";
import { getAtelierModules } from "@/lib/curriculum/atelier-chapters";
import { canonicalManifest } from "@/lib/curriculum/manifest";

interface UnfoldedBlueprintTrailProps {
  selectedChapterId: string;
  selectedModuleId: string;
  activeModuleId?: string;
  activeLessonId?: string;
  completedLessonIds: string[];
  onSelectModule: (moduleId: string) => void;
  onReturnToActive: () => void;
}

const accentFor = (color: string) => ({
  mint: "#158062",
  cobalt: "#4F6BFF",
  butter: "#8B6800",
  lilac: "#7652C7",
}[color] ?? "#4F6BFF");

export function UnfoldedBlueprintTrail({
  selectedChapterId,
  selectedModuleId,
  activeModuleId,
  activeLessonId,
  completedLessonIds,
  onSelectModule,
  onReturnToActive,
}: UnfoldedBlueprintTrailProps) {
  const chapters = getAtelierModules();
  const chapter = chapters.find((item) => item.id === selectedChapterId) ?? chapters[0];
  if (!chapter) return null;

  const module = chapter.modules.find((item) => item.moduleId === selectedModuleId) ?? chapter.modules[0];
  if (!module) {
    return <section className="rounded-3xl border border-dashed border-[#0E1B3D]/20 bg-white p-6"><h3 className="text-lg font-bold text-[#0E1B3D]">This chapter is being prepared.</h3><p className="mt-2 text-sm text-[#596174]">Its learning stations will appear here when they are added to the curriculum manifest.</p></section>;
  }

  const lessons = canonicalManifest.getLessonsForModule(module.moduleId);
  const chapterHasActiveModule = Boolean(activeModuleId && chapter.moduleIds.some((moduleId) => moduleId === activeModuleId));
  const needsReturn = Boolean(activeModuleId && (selectedModuleId !== activeModuleId || !chapterHasActiveModule));

  return (
    <section aria-labelledby="blueprint-trail-title" className="min-w-0 overflow-hidden rounded-[28px] border border-[#0E1B3D]/15 bg-white shadow-[0_15px_40px_-30px_rgba(14,27,61,.35)]">
      <div className="border-b border-[#0E1B3D]/10 bg-[#FFF6ED] p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-[#4F6BFF]">Unfolded blueprint · folio {chapter.id}</p>
            <h2 id="blueprint-trail-title" className="mt-2 font-display text-2xl font-extrabold tracking-tight text-[#0E1B3D] sm:text-3xl">{chapter.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[#596174]">Choose a module station, then open an authored lesson. Planned lessons stay visible but cannot be opened yet.</p>
          </div>
          {needsReturn && <button type="button" onClick={onReturnToActive} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#0E1B3D]/15 bg-white px-3 py-2 text-xs font-bold text-[#0E1B3D] hover:border-[#4F6BFF]"><RotateCcw size={14}/> Return to active lesson</button>}
        </div>
        <div className="mt-5 flex min-w-0 gap-2 overflow-x-auto pb-2">
          {chapter.modules.map((item, index) => {
            const selected = item.moduleId === module.moduleId;
            const authored = canonicalManifest.getAuthoredLessonsForModule(item.moduleId);
            const all = canonicalManifest.getLessonsForModule(item.moduleId);
            const color = accentFor(chapter.color);
            return (
              <button
                key={item.moduleId}
                type="button"
                aria-pressed={selected}
                onClick={() => onSelectModule(item.moduleId)}
                className={`relative min-w-[210px] max-w-[260px] flex-1 rounded-2xl border-2 p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F6BFF] focus-visible:ring-offset-2 ${selected ? "border-[#0E1B3D] bg-white shadow-[4px_4px_0_#0E1B3D]" : "border-[#0E1B3D]/10 bg-white/60 hover:bg-white"}`}
              >
                <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.12em]" style={{ color }}>{index + 1 < 10 ? `0${index + 1}` : index + 1} · MODULE STATION</span>
                <span className="mt-2 block text-sm font-bold leading-snug text-[#0E1B3D]">{item.title}</span>
                <span className="mt-2 block text-xs text-[#596174]">{authored.length} authored · {Math.max(0, all.length - authored.length)} planned</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-5 sm:p-7">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div><p className="font-mono text-[10px] font-bold uppercase tracking-[.18em] text-[#4F6BFF]">Module station</p><h3 className="mt-1 text-xl font-extrabold tracking-tight text-[#0E1B3D]">{module.title}</h3></div>
          <Link to="/learn/modules/$moduleId" params={{ moduleId: module.moduleId }} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-[#0E1B3D]/15 bg-white px-3 text-xs font-bold text-[#0E1B3D] hover:border-[#4F6BFF]">Module overview <ArrowRight size={14}/></Link>
        </div>

        {lessons.length === 0 ? <div className="rounded-2xl border border-dashed border-[#0E1B3D]/20 bg-[#FFFDF9] p-5 text-sm text-[#596174]">No lessons have been placed in this module yet.</div> : (
          <ol className="relative space-y-2 before:absolute before:bottom-5 before:left-[19px] before:top-5 before:w-px before:bg-[#0E1B3D]/10">
            {lessons.map((lesson, index) => {
              const authored = lesson.authored !== false;
              const completed = completedLessonIds.includes(lesson.lessonId);
              const active = lesson.lessonId === activeLessonId;
              const statusColor = completed ? "#158062" : active ? "#4F6BFF" : "#8C92A1";
              return (
                <li key={lesson.lessonId} className="relative min-w-0">
                  {authored ? (
                    <Link
                      to="/lesson/$lessonId"
                      params={{ lessonId: lesson.lessonId }}
                      search={{ mode: "curriculum" }}
                      aria-current={active ? "step" : undefined}
                      className={`group flex min-w-0 items-center gap-3 rounded-2xl border p-3 transition hover:-translate-y-px hover:border-[#4F6BFF]/50 sm:gap-4 sm:p-4 ${active ? "border-[#4F6BFF]/45 bg-[#EEF0FF]" : "border-[#0E1B3D]/10 bg-white hover:bg-[#FFFDF9]"}`}
                    >
                      <span className="relative z-10 grid size-10 shrink-0 place-items-center rounded-xl border-2 bg-white font-mono text-xs font-bold" style={{ borderColor: statusColor, color: statusColor }}>
                        {completed ? <CheckCircle2 size={18}/> : active ? <Play size={16} fill="currentColor"/> : String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1"><span className="block break-words text-sm font-bold leading-5 text-[#0E1B3D]">{lesson.title}</span><span className="mt-1 block text-xs text-[#596174]">{completed ? "Completed · revisit any time" : active ? "Your current lesson" : "Ready when you are"}</span></span>
                      <ArrowRight size={16} className="shrink-0 text-[#4F6BFF] transition-transform group-hover:translate-x-1"/>
                    </Link>
                  ) : (
                    <div aria-disabled="true" className="flex min-w-0 items-center gap-3 rounded-2xl border border-dashed border-[#0E1B3D]/15 bg-[#F8F6F0]/80 p-3 opacity-80 sm:gap-4 sm:p-4">
                      <span className="relative z-10 grid size-10 shrink-0 place-items-center rounded-xl border border-dashed border-[#0E1B3D]/20 bg-white text-[#777E8D]"><Construction size={17}/></span>
                      <span className="min-w-0 flex-1"><span className="block break-words text-sm font-semibold leading-5 text-[#596174]">{lesson.title}</span><span className="mt-1 block text-xs text-[#777E8D]">Planned lesson · not available yet</span></span>
                      <span className="shrink-0 rounded-full bg-[#EAE6DE] px-2.5 py-1 text-[10px] font-bold text-[#596174]">Coming soon</span>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        )}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#0E1B3D]/10 pt-4 text-xs text-[#596174]">
          <span className="inline-flex items-center gap-2"><BookOpen size={14}/> {lessons.filter((lesson) => lesson.authored !== false).length} authored lessons</span>
          <span className="inline-flex items-center gap-2"><Clock3 size={14}/> Pick up at your own pace</span>
          <Link to="/learn/" className="inline-flex min-h-10 items-center gap-1 font-bold text-[#4F6BFF]">Browse learning hub <ArrowLeft size={14}/></Link>
        </div>
      </div>
    </section>
  );
}
