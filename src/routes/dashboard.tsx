import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight, Award, BookOpen, CheckCircle2, ChevronRight, Code2, Compass,
  Flame, FolderKanban, GraduationCap, LayoutDashboard, Moon, Search, Settings2,
  Sparkles, Sun, TerminalSquare, Trophy, Zap,
} from "lucide-react";
import { LiveBlueprintStage } from "@/components/atelier/live-blueprint-stage";
import { StudioDeskHero } from "@/components/atelier/studio-desk-hero";
import { LearningPathFolios } from "@/components/atelier/learning-path-folios";
import { UnfoldedBlueprintTrail } from "@/components/atelier/unfolded-blueprint-trail";
import { BuildersPinboard } from "@/components/atelier/builders-pinboard";
import { ForgeMark } from "@/components/atelier/forge-signature-assets";
import { getAtelierModules } from "@/lib/curriculum/atelier-chapters";
import { useProgress } from "@/lib/hooks/use-progress";
import { useTheme } from "@/lib/hooks/use-theme";
import { useCommandPalette } from "@/lib/hooks/use-command-palette";
import { useCurriculumResume } from "@/lib/utils/curriculum-order";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your Studio · Forge Academia" },
      { name: "description", content: "Your personalized frontend engineering learning dashboard." },
    ],
  }),
  component: StudioDashboardPage,
});

const navGroups = [
  { title: "WORKSPACE", items: [
    { label: "Overview", to: "/dashboard" as const, icon: LayoutDashboard },
    { label: "Learning path", to: "/learn/" as const, icon: Compass },
    { label: "My projects", to: "/projects" as const, icon: FolderKanban },
    { label: "Code playground", to: "/playground" as const, icon: TerminalSquare },
  ]},
  { title: "YOUR PROGRESS", items: [
    { label: "Achievements", to: "/achievements" as const, icon: Award },
    { label: "Mastery", to: "/mastery" as const, icon: GraduationCap },
    { label: "Progress report", to: "/progress" as const, icon: Trophy },
  ]},
];

export function StudioDashboardPage() {
  const progress = useProgress();
  const { currentLesson, completedCount, totalLessons } = useCurriculumResume();
  const { resolvedTheme, toggle } = useTheme();
  const palette = useCommandPalette();
  const chapters = getAtelierModules();
  const activeModuleId = currentLesson?.moduleId;
  const activeChapter = chapters.find((chapter) => activeModuleId && chapter.moduleIds.includes(activeModuleId));
  const initialChapterId = activeChapter?.id ?? chapters[0]?.id ?? "01";
  const initialModuleId = activeModuleId ?? chapters.find((chapter) => chapter.id === initialChapterId)?.modules[0]?.moduleId ?? "";
  const [selectedChapterId, setSelectedChapterId] = useState(initialChapterId);
  const [selectedModuleId, setSelectedModuleId] = useState(initialModuleId);
  const selectChapter = (chapterId: string) => {
    const chapter = chapters.find((item) => item.id === chapterId);
    setSelectedChapterId(chapterId);
    setSelectedModuleId(chapter?.modules[0]?.moduleId ?? "");
  };
  const returnToActiveLesson = () => {
    const chapter = chapters.find((item) => activeModuleId && item.moduleIds.includes(activeModuleId));
    setSelectedChapterId(chapter?.id ?? chapters[0]?.id ?? "01");
    setSelectedModuleId(activeModuleId ?? chapters[0]?.modules[0]?.moduleId ?? "");
  };
  const completionPercent = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0;
  const weeklyDays = getWeekDays(progress.activityDates ?? []);
  const activeDays = weeklyDays.filter((day) => day.active).length;

  return (
    <div className="min-h-dvh bg-[#F7F8FC] text-[#17213D] dark:bg-[#0B1226] dark:text-[#F8F6F0]">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1680px]">
        <aside className="hidden w-[248px] shrink-0 flex-col border-r border-[#E5E8F0] bg-[#101B3B] px-4 py-6 text-white dark:border-white/10 lg:flex">
          <Link to="/dashboard" className="mb-9 flex items-center gap-3 px-2">
            <span className="grid size-11 place-items-center rounded-2xl bg-[#E9E4FF] shadow-[0_4px_0_#070F27]"><ForgeMark size={32}/></span>
            <span><span className="block text-lg font-black tracking-tight">FORGE</span><span className="block text-[10px] font-bold uppercase tracking-[.22em] text-[#C9BBFF]">Academia</span></span>
          </Link>
          <button type="button" onClick={() => palette.setOpen(true)} className="mb-7 flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/[.07] px-3 py-2.5 text-left text-xs text-white/60 transition hover:bg-white/10"><Search size={15}/> Search your studio <span className="ml-auto rounded border border-white/15 px-1.5 py-0.5 font-mono text-[10px]">⌘ K</span></button>
          <nav className="space-y-7" aria-label="Main navigation">
            {navGroups.map((group) => <div key={group.title}><p className="mb-2 px-3 text-[10px] font-extrabold tracking-[.18em] text-white/40">{group.title}</p><div className="space-y-1">{group.items.map(({label,to,icon:Icon}) => <Link key={label} to={to} activeProps={{"aria-current":"page"}} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition ${label === "Overview" ? "bg-[#4F6BFF] text-white shadow-[0_6px_18px_rgba(79,107,255,.25)]" : "text-white/70 hover:bg-white/[.08] hover:text-white"}`}><Icon size={17}/>{label}{label === "Overview" && <span className="ml-auto size-1.5 rounded-full bg-[#A7E3D1]"/>}</Link>)}</div></div>)}
          </nav>
          <div className="mt-auto rounded-2xl border border-white/10 bg-white/[.06] p-4">
            <div className="mb-3 flex items-center gap-2"><span className="grid size-8 place-items-center rounded-xl bg-[#FFE08A] text-[#17213D]"><Flame size={17}/></span><div><p className="text-xs font-bold">Keep your spark</p><p className="text-[10px] text-white/50">Your learning streak</p></div></div>
            <p className="text-2xl font-black">{progress.streakDays} <span className="text-xs font-semibold text-white/50">days in a row</span></p>
            <div className="mt-3 flex gap-1.5">{weeklyDays.map((day) => <span key={day.label} title={day.label} className={`grid h-7 flex-1 place-items-center rounded-md text-[9px] font-bold ${day.active ? "bg-[#A7E3D1] text-[#10203C]" : "bg-white/10 text-white/45"}`}>{day.label}</span>)}</div>
          </div>
          <Link to="/settings" className="mt-4 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-white/60 transition hover:bg-white/[.08] hover:text-white"><Settings2 size={17}/> Settings</Link>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-[#E5E8F0] bg-white/90 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-[#101A32]/90 sm:px-7 lg:px-9">
            <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-3">
              <div className="flex items-center gap-2 lg:hidden"><span className="grid size-9 place-items-center rounded-xl bg-[#E9E4FF]"><ForgeMark size={27}/></span><span className="font-black">FORGE <span className="font-medium text-[#7B849A]">ACADEMIA</span></span></div>
              <div className="hidden lg:block"><p className="text-xs font-semibold text-[#7B849A]">Workspace <ChevronRight className="mx-1 inline" size={12}/> <span className="text-[#17213D] dark:text-white">Overview</span></p></div>
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="hidden items-center gap-1.5 rounded-full bg-[#FFF0C4] px-3 py-2 text-xs font-extrabold text-[#17213D] sm:inline-flex"><Flame size={15}/>{progress.streakDays} day streak</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E9E4FF] px-3 py-2 text-xs font-extrabold text-[#17213D]"><Zap size={15}/>{progress.xp} XP</span>
                <button type="button" aria-label="Search" onClick={() => palette.setOpen(true)} className="grid size-9 place-items-center rounded-xl border border-[#E5E8F0] bg-white hover:bg-[#F5F6FA] dark:border-white/10 dark:bg-white/5"><Search size={16}/></button>
                <button type="button" aria-label="Toggle theme" onClick={toggle} className="grid size-9 place-items-center rounded-xl border border-[#E5E8F0] bg-white hover:bg-[#F5F6FA] dark:border-white/10 dark:bg-white/5">{resolvedTheme === "dark" ? <Sun size={16}/> : <Moon size={16}/>}</button>
              </div>
            </div>
          </header>
          <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-7 px-4 py-6 sm:gap-8 sm:px-7 sm:py-8 lg:px-9 lg:py-9">
            <section className="flex flex-wrap items-end justify-between gap-4">
              <div><p className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#E9E4FF] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.16em] text-[#4F6BFF]"><Sparkles size={13}/> Your learning universe</p><h1 className="font-display text-3xl font-black tracking-tight sm:text-4xl">Let’s make progress.</h1><p className="mt-2 max-w-xl text-sm leading-6 text-[#778097]">Every small step adds up. Here’s your next move on the path to frontend mastery.</p></div>
              <Link to="/learn/" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#4F6BFF] px-4 py-2.5 text-sm font-bold text-white shadow-[0_4px_0_#3449C6] transition hover:-translate-y-0.5">Explore learning path <ArrowRight size={16}/></Link>
            </section>

            <section aria-label="Your learning statistics" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              <MetricCard icon={<BookOpen size={19}/>} label="Lessons completed" value={String(completedCount)} detail={`of ${totalLessons || "your"} lessons`} tone="lilac"/>
              <MetricCard icon={<Zap size={19}/>} label="Experience points" value={progress.xp.toLocaleString()} detail="earned through practice" tone="blue"/>
              <MetricCard icon={<Flame size={19}/>} label="Current streak" value={String(progress.streakDays)} detail="days of momentum" tone="yellow"/>
              <MetricCard icon={<Trophy size={19}/>} label="Curriculum progress" value={`${completionPercent}%`} detail="of your learning journey" tone="mint" progress={completionPercent}/>
            </section>

            <section aria-label="Continue learning"><StudioDeskHero/></section>

            <section className="grid gap-5 xl:grid-cols-[1.35fr_.85fr]">
              <div className="min-w-0"><div className="mb-4 flex items-end justify-between gap-3"><div><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#4F6BFF]">Build by doing</p><h2 className="mt-1 text-xl font-black tracking-tight sm:text-2xl">Your interactive studio</h2></div><span className="rounded-full bg-[#DDF5EC] px-3 py-1.5 text-[10px] font-extrabold text-[#17654F]">TRY IT LIVE</span></div><LiveBlueprintStage/></div>
              <div className="rounded-[26px] border border-[#E6E8F0] bg-white p-5 shadow-[0_12px_32px_-22px_rgba(23,33,61,.22)] dark:border-white/10 dark:bg-[#131E3A] sm:p-6">
                <div className="flex items-center justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#4F6BFF]">This week</p><h2 className="mt-1 text-xl font-black">Show up, grow</h2></div><span className="grid size-10 place-items-center rounded-2xl bg-[#FFF0C4] text-[#17213D]"><Flame size={19}/></span></div>
                <p className="mt-2 text-sm leading-6 text-[#778097]">Learning is a superpower when you make it a habit.</p>
                <div className="mt-6 grid grid-cols-7 gap-1.5">{weeklyDays.map((day) => <div key={day.label} className="flex flex-col items-center gap-2"><span className={`grid aspect-square w-full place-items-center rounded-xl text-xs font-extrabold ${day.active ? "bg-[#A7E3D1] text-[#17213D]" : "bg-[#F0F2F8] text-[#A0A7B8] dark:bg-white/10"}`}>{day.active ? <CheckCircle2 size={16}/> : "·"}</span><span className="text-[10px] font-bold text-[#8B93A7]">{day.label}</span></div>)}</div>
                <div className="mt-5 flex items-center justify-between rounded-2xl bg-[#F5F3FF] p-4 dark:bg-white/5"><div><p className="text-xs font-bold text-[#17213D] dark:text-white">Weekly activity</p><p className="mt-1 text-xs text-[#778097]">{activeDays} of 7 days active</p></div><span className="text-2xl font-black text-[#4F6BFF]">{Math.round(activeDays / 7 * 100)}%</span></div>
                <Link to="/progress" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#4F6BFF] hover:underline">View progress report <ArrowRight size={15}/></Link>
              </div>
            </section>

            <section className="border-t border-[#E4E7F0] pt-7 dark:border-white/10"><div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#4F6BFF]">Your map to mastery</p><h2 className="mt-1 text-2xl font-black tracking-tight">Choose your next chapter</h2><p className="mt-2 text-sm text-[#778097]">A visual path from the foundations to building real applications.</p></div><Link to="/learn/" className="inline-flex items-center gap-1 text-sm font-bold text-[#4F6BFF]">All lessons <ArrowRight size={15}/></Link></div>
              <LearningPathFolios selectedChapterId={selectedChapterId} onSelectChapter={selectChapter} activeModuleId={activeModuleId}/>
              <div className="mt-5"><UnfoldedBlueprintTrail selectedChapterId={selectedChapterId} selectedModuleId={selectedModuleId} activeModuleId={activeModuleId} activeLessonId={currentLesson?.id} completedLessonIds={progress.lessonsCompleted} onSelectModule={setSelectedModuleId} onReturnToActive={returnToActiveLesson}/></div>
            </section>

            <section><div className="mb-4"><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#4F6BFF]">Made by you</p><h2 className="mt-1 text-2xl font-black tracking-tight">Projects & achievements</h2><p className="mt-2 text-sm text-[#778097]">Turn your learning into things you can show off.</p></div><BuildersPinboard/></section>
            <footer className="border-t border-[#E4E7F0] pt-5 text-center text-[11px] font-semibold tracking-wide text-[#9299AA] dark:border-white/10">FORGE ACADEMIA · LEARN BY BUILDING, GROW BY PRACTICING</footer>
          </div>
        </main>
      </div>
    </div>
  );
}

function MetricCard({icon,label,value,detail,tone,progress}: {icon: React.ReactNode;label:string;value:string;detail:string;tone:"lilac"|"blue"|"yellow"|"mint";progress?:number}) {
  const tones = { lilac:"bg-[#E9E4FF] text-[#5542B7]", blue:"bg-[#E8EDFF] text-[#4057DB]", yellow:"bg-[#FFF0C4] text-[#946A00]", mint:"bg-[#DDF5EC] text-[#17654F]" };
  return <article className="min-w-0 rounded-[22px] border border-[#E5E8F0] bg-white p-4 shadow-[0_10px_28px_-24px_rgba(23,33,61,.3)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-22px_rgba(23,33,61,.28)] dark:border-white/10 dark:bg-[#131E3A] sm:p-5"><div className="flex items-center justify-between gap-2"><span className="text-xs font-semibold text-[#7B849A]">{label}</span><span className={`grid size-9 place-items-center rounded-xl ${tones[tone]}`}>{icon}</span></div><p className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">{value}</p><p className="mt-1 text-[11px] text-[#8B93A7]">{detail}</p>{progress !== undefined && <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#EEF0F6] dark:bg-white/10"><div className="h-full rounded-full bg-[#4F6BFF] transition-all" style={{width:`${Math.min(100,Math.max(0,progress))}%`}}/></div>}</article>;
}

function getWeekDays(activityDates: string[]) {
  const now = new Date();
  const monday = new Date(now);
  monday.setHours(0,0,0,0);
  monday.setDate(monday.getDate() - ((monday.getDay()+6)%7));
  const labels = ["M","T","W","T","F","S","S"];
  return labels.map((label,index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate()+index);
    const key = `${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,"0")}-${String(day.getDate()).padStart(2,"0")}`;
    return {label,active:activityDates.includes(key)};
  });
}
