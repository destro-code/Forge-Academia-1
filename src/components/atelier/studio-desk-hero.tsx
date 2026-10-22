import { useState } from "react";
import { ArrowRight, BookOpen, CheckCircle2, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { getEli5MentorNote } from "@/lib/curriculum/v1/eli5-mentor-bank";
import { getUtcWeekActiveDays } from "@/lib/curriculum/atelier-chapters";
import { ForgeBuddyMark } from "@/components/atelier/forge-buddy-illos";
import { useProgress } from "@/lib/hooks/use-progress";
import { useCurriculumResume } from "@/lib/utils/curriculum-order";

export function StudioDeskHero() {
  const progress = useProgress();
  const { currentLesson, modules, topics, completedCount, totalLessons, isReturningLearner } = useCurriculumResume();
  const [showTip, setShowTip] = useState(true);
  const activeModule = modules.find((module) => module.id === currentLesson?.moduleId) ?? modules[0];
  const activeTopic = topics.find((topic) => topic.id === currentLesson?.topicId);
  const note = getEli5MentorNote(currentLesson?.id ?? "", activeModule?.id ?? "module-0-1");
  const percent = totalLessons ? Math.round(completedCount / totalLessons * 100) : 0;
  return <section className="grid gap-5 lg:grid-cols-[1fr_.95fr] lg:gap-7">
    <div className="atelier-card atelier-hero-workbench relative overflow-hidden p-6 sm:p-8 lg:p-10">
      <div className="atelier-hero-aura absolute -right-10 -top-10 size-40 rounded-full bg-[#A7E3D1]/40 blur-2xl"/><div className="atelier-orbit-object pointer-events-none absolute right-2 top-2 hidden h-40 w-40 sm:block lg:right-6 lg:top-6 lg:h-48 lg:w-48" aria-hidden="true"><svg viewBox="0 0 200 200" className="h-full w-full" fill="none"><defs><linearGradient id="atelierGemTop" x1="45" y1="32" x2="145" y2="112" gradientUnits="userSpaceOnUse"><stop stopColor="#F8F4FF"/><stop offset="1" stopColor="#C9BBFF"/></linearGradient><linearGradient id="atelierGemLeft" x1="45" y1="74" x2="99" y2="160" gradientUnits="userSpaceOnUse"><stop stopColor="#8DA2FF"/><stop offset="1" stopColor="#4F6BFF"/></linearGradient><linearGradient id="atelierGemRight" x1="100" y1="78" x2="158" y2="153" gradientUnits="userSpaceOnUse"><stop stopColor="#FFE08A"/><stop offset="1" stopColor="#FF8C7A"/></linearGradient><radialGradient id="atelierGemGlow"><stop stopColor="#C9BBFF" stopOpacity=".6"/><stop offset="1" stopColor="#C9BBFF" stopOpacity="0"/></radialGradient></defs><ellipse cx="102" cy="103" rx="83" ry="80" fill="url(#atelierGemGlow)"/><ellipse cx="101" cy="105" rx="76" ry="28" stroke="#8DA2FF" strokeOpacity=".7" strokeWidth="1.5" transform="rotate(-28 101 105)"/><ellipse cx="101" cy="105" rx="76" ry="28" stroke="#A7E3D1" strokeOpacity=".7" strokeWidth="1.5" transform="rotate(48 101 105)"/><g className="atelier-gem-spin"><path d="M100 30 151 61 151 122 100 153 49 122 49 61 100 30Z" fill="#101A32" fillOpacity=".16" transform="translate(5 8)"/><path d="M100 28 151 59 100 89 49 59 100 28Z" fill="url(#atelierGemTop)" stroke="#0E1B3D" strokeOpacity=".24" strokeWidth="1.5"/><path d="M49 59 100 89 100 151 49 120 49 59Z" fill="url(#atelierGemLeft)" stroke="#0E1B3D" strokeOpacity=".24" strokeWidth="1.5"/><path d="M151 59 100 89 100 151 151 120 151 59Z" fill="url(#atelierGemRight)" stroke="#0E1B3D" strokeOpacity=".24" strokeWidth="1.5"/><path d="M100 28V89M49 59 100 120 151 59" stroke="#FFFFFF" strokeOpacity=".65" strokeWidth="1.5"/></g><circle cx="35" cy="91" r="5" fill="#A7E3D1"/><circle cx="165" cy="54" r="4" fill="#FF8C7A"/><path d="m157 143 5 9 10 1-7 7 2 10-10-5-9 5 2-10-7-7 10-1 4-9Z" fill="#FFE08A" stroke="#0E1B3D" strokeOpacity=".22"/></svg></div>
      <div className="relative">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#0E1B3D]/10 bg-[#FFF6ED] px-3 py-1.5 text-xs font-bold text-[#0E1B3D]"><Sparkles size={14}/> YOUR CREATIVE STUDIO</div>
        <p className="mt-5 max-w-[72%] text-sm font-semibold text-[#667085] sm:max-w-[62%]">{isReturningLearner ? "Welcome back, builder." : "Welcome to your workbench."} <span className="text-[#4F6BFF]">Small steps. Real craft.</span></p>
        <p className="mt-2 font-mono text-xs uppercase tracking-[.12em] text-[#4F6BFF]">{activeModule?.title ?? "Your first chapter"}{activeTopic ? ` · ${activeTopic.title}` : ""}</p>
        <h1 className="mt-3 max-w-2xl font-display text-3xl font-extrabold leading-tight tracking-tight text-[#0E1B3D] sm:max-w-[72%] sm:text-4xl lg:text-[2.7rem]">{currentLesson?.title ?? "Make your first thing for the web."}</h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-[#586174]">{currentLesson?.description ?? "Start with the foundations, then turn what you learn into working interfaces."}</p>
        <Link to="/lesson/$lessonId" params={{ lessonId: currentLesson?.id ?? "lesson-0-1-1" }} search={{ mode: "curriculum" }} className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#4F6BFF] px-5 py-3 font-bold text-white shadow-[0_5px_0_#2639A5] transition hover:-translate-y-0.5 sm:w-auto">Continue lesson <ArrowRight size={18}/></Link>
        <div className="mt-6 rounded-2xl border border-[#0E1B3D]/10 bg-[#FFFDF9] p-4">
          <button type="button" aria-expanded={showTip} onClick={() => setShowTip((value) => !value)} className="flex w-full items-center gap-3 text-left"><ForgeBuddyMark className="size-12 shrink-0"/><span className="min-w-0 flex-1"><span className="block text-xs font-bold uppercase tracking-wider text-[#4F6BFF]">Forge Buddy · {note.analogyTitle}</span><span className="block font-semibold text-[#0E1B3D]">{showTip ? "A mental model for your next step" : "Tap to reveal your builder tip"}</span></span><span className="text-lg text-[#4F6BFF]">{showTip ? "−" : "+"}</span></button>
          {showTip && <div className="mt-3 border-t border-[#0E1B3D]/10 pt-3 text-sm leading-6 text-[#586174]"><p>{note.eli5Text}</p><p className="mt-2 font-medium text-[#4F6BFF]">Builder's pro-tip: {note.seniorWit}</p></div>}
        </div>
      </div>
    </div>
    <div className="flex flex-col gap-5">
      <div className="atelier-card p-5 sm:p-6"><div className="flex items-center justify-between gap-4"><div><p className="font-mono text-xs uppercase tracking-widest text-[#657087]">Studio rhythm</p><h2 className="mt-1 font-display text-2xl font-extrabold text-[#0E1B3D]">{percent}% in motion</h2></div><div className="grid size-12 place-items-center rounded-2xl bg-[#FFE08A] text-[#0E1B3D]"><BookOpen/></div></div><div className="mt-4 h-3 overflow-hidden rounded-full bg-[#F0EAE2]"><div className="h-full rounded-full bg-[#4F6BFF] transition-all" style={{ width: `${percent}%` }}/></div><div className="mt-3 flex flex-wrap justify-between gap-2 text-sm text-[#586174]"><span>{completedCount} of {totalLessons} lessons completed</span><span>{getUtcWeekActiveDays(progress.activityDates ?? [])}/7 active days this week</span></div></div>
      <div className="atelier-blueprint-frame flex-1 rounded-[26px] p-5 sm:p-6"><div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#4F6BFF]"><CheckCircle2 size={15}/> A small win counts</div><h2 className="mt-3 font-display text-2xl font-extrabold text-[#0E1B3D]">Make progress visible.</h2><p className="mt-2 text-sm leading-6 text-[#586174]">Your studio rhythm is based on saved lesson progress and recorded activity—not estimates or placeholder stats.</p><div className="mt-5 flex items-center justify-between rounded-2xl bg-white/80 p-4"><span className="text-sm font-semibold text-[#0E1B3D]">Current momentum</span><span className="font-mono text-sm font-bold text-[#4F6BFF]">{progress.streakDays} day streak</span></div></div>
    </div>
  </section>;
}
