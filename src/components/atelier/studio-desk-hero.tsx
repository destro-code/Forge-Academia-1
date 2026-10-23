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
  const [showTip, setShowTip] = useState(false);
  const activeModule = modules.find((module) => module.id === currentLesson?.moduleId) ?? modules[0];
  const activeTopic = topics.find((topic) => topic.id === currentLesson?.topicId);
  const note = getEli5MentorNote(currentLesson?.id ?? "", activeModule?.id ?? "module-0-1");
  const percent = totalLessons ? Math.round(completedCount / totalLessons * 100) : 0;
  return <section className="atelier-studio-desk-hero grid gap-5 lg:grid-cols-[1fr_.95fr] lg:gap-7">
    <div className="atelier-card atelier-hero-workbench relative overflow-hidden !border-[#0E1B3D] !bg-[#4F6BFF] p-5 text-white shadow-[7px_7px_0_#0E1B3D] sm:p-8 lg:p-10">
      <div className="pointer-events-none absolute -right-4 top-2 h-44 w-44 opacity-90 sm:right-3 sm:top-3 sm:h-56 sm:w-56 lg:right-5 lg:top-4 lg:h-64 lg:w-64" aria-hidden="true">
        <svg viewBox="0 0 240 240" className="h-full w-full" fill="none">
          <circle cx="120" cy="120" r="96" fill="#FFFFFF" fillOpacity=".08"/>
          <circle cx="120" cy="120" r="76" stroke="#FFFFFF" strokeOpacity=".24" strokeWidth="1.5" strokeDasharray="5 8"/>
          <path d="M45 161c-15-24-8-51 14-68" stroke="#A7E3D1" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 7"/>
          <path d="M188 65c20 21 22 46 10 64" stroke="#FFE08A" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 7"/>
          <g transform="rotate(35 122 112)">
            <path d="M122 35C143 56 153 86 151 122L122 155 93 122C91 86 101 56 122 35Z" fill="#FFFDF9" stroke="#0E1B3D" strokeWidth="3" strokeLinejoin="round"/>
            <path d="M122 35V155L93 122C91 86 101 56 122 35Z" fill="#E9E4FF"/>
            <circle cx="122" cy="91" r="14" fill="#A7E3D1" stroke="#0E1B3D" strokeWidth="3"/>
            <circle cx="122" cy="91" r="6" fill="#4F6BFF"/>
            <path d="M93 112 70 137 72 159 105 138M151 112 174 137 172 159 139 138" fill="#FF8C7A" stroke="#0E1B3D" strokeWidth="3" strokeLinejoin="round"/>
            <path d="M108 148 112 173 122 187 132 173 136 148" fill="#FFE08A" stroke="#0E1B3D" strokeWidth="3" strokeLinejoin="round"/>
            <path d="M116 157 122 174 128 157" fill="#FF8C7A"/>
          </g>
          <path d="m55 64 4 9 10 1-7 7 2 10-9-5-9 5 2-10-7-7 10-1 4-9Z" fill="#FFE08A" stroke="#0E1B3D" strokeOpacity=".25" strokeWidth="1.5"/>
          <circle cx="186" cy="166" r="6" fill="#A7E3D1"/>
          <circle cx="68" cy="188" r="4" fill="#FF8C7A"/>
          <path d="M45 208h145" stroke="#FFFFFF" strokeOpacity=".3" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <div className="relative">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#0E1B3D]/10 bg-white/95 px-3 py-1.5 text-xs font-bold text-[#0E1B3D]"><Sparkles size={14}/> YOUR CREATIVE STUDIO</div>
        <p className="mt-5 max-w-[72%] text-sm font-semibold text-white/85 sm:max-w-[62%]">{isReturningLearner ? "Welcome back, builder." : "Welcome to your workbench."} <span className="text-[#FFE08A]">Small steps. Real craft.</span></p>
        <p className="mt-2 font-mono text-xs uppercase tracking-[.12em] text-[#E9E4FF]">{activeModule?.title ?? "Your first chapter"}{activeTopic ? ` · ${activeTopic.title}` : ""}</p>
        <h1 className="mt-3 max-w-2xl font-display text-3xl font-extrabold leading-tight tracking-tight text-[#0E1B3D] sm:max-w-[72%] sm:text-4xl lg:text-[2.7rem]">{currentLesson?.title ?? "Make your first thing for the web."}</h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-white/85">{currentLesson?.description ?? "Start with the foundations, then turn what you learn into working interfaces."}</p>
        <Link to="/lesson/$lessonId" params={{ lessonId: currentLesson?.id ?? "lesson-0-1-1" }} search={{ mode: "curriculum" }} className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#FFE08A] px-5 py-3 font-extrabold text-[#0E1B3D] shadow-[0_5px_0_#D28C28] transition hover:-translate-y-0.5 sm:w-auto">Continue lesson <ArrowRight size={18}/></Link>
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
