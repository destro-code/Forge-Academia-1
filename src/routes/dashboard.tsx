import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight, ArrowUpRight, Atom, BookOpen, Bug, Clock3, Code2, Compass,
  FlaskConical, Layers3, Sparkles, Terminal, Workflow,
} from "lucide-react";
import { useProgress } from "@/lib/hooks/use-progress";
import { useLessons, useModules, useProjects } from "@/lib/hooks/use-content";
import { useCurriculumResume } from "@/lib/utils/curriculum-order";
import {
  buildAtelierChapterFolios,
  findChapterIdForModule,
  evaluateAtelierProjects,
  type AtelierChapterId,
} from "@/lib/curriculum/atelier-chapters";
import { computeGuidedNextStep } from "@/lib/learning-engine/evidence-store";
import { ForgeBuddyMascot3D } from "@/components/atelier/forge-buddy-illos";
import { SkillDiagnosticModal } from "@/components/home/skill-diagnostic-modal";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Forge Workshop · Frontend Engineering Academy" },
      {
        name: "description",
        content: "Explore how the web works, experiment with code, build real projects and investigate what breaks.",
      },
    ],
  }),
  component: WorkshopHomePage,
});

type SystemLayer = "structure" | "presentation" | "behaviour";

const layerContent: Record<SystemLayer, { label: string; short: string; detail: string; code: string }> = {
  structure: {
    label: "HTML", short: "Structure", detail: "The elements give the page its meaning and shape.",
    code: "<main>  <h1>Hello, web.</h1>  <button>Explore</button></main>",
  },
  presentation: {
    label: "CSS", short: "Presentation", detail: "Rules turn that structure into a visual experience.",
    code: "main { display: grid; gap: 1rem; }button { background: coral; }",
  },
  behaviour: {
    label: "JavaScript", short: "Behaviour", detail: "Events and logic make the interface respond.",
    code: "button.addEventListener('click', () => {  explore();});",
  },
};

const trackMeta: Record<AtelierChapterId, { mark: string; color: string; soft: string; descriptor: string }> = {
  "chapter-html-foundations": { mark: "01", color: "#72c4ce", soft: "rgba(114,196,206,.13)", descriptor: "Structure · Semantics · The browser" },
  "chapter-css-magic": { mark: "02", color: "#ff9a65", soft: "rgba(255,154,101,.13)", descriptor: "Composition · Layout · Responsive craft" },
  "chapter-js-adventure": { mark: "03", color: "#e6bd72", soft: "rgba(230,189,114,.13)", descriptor: "Logic · Behaviour · Interaction" },
  "chapter-react-projects": { mark: "04", color: "#a6a0ff", soft: "rgba(166,160,255,.13)", descriptor: "Components · State · Application systems" },
};

function WorkshopHomePage() {
  const progress = useProgress();
  const lessons = useLessons();
  const modules = useModules();
  const projects = useProjects();
  const { currentLesson, completedCount, totalLessons } = useCurriculumResume();
  const [diagnosticOpen, setDiagnosticOpen] = useState(false);
  const [activeLayer, setActiveLayer] = useState<SystemLayer>("structure");

  const activeModule = useMemo(() => {
    if (currentLesson?.moduleId) return modules.find((module) => module.id === currentLesson.moduleId) ?? modules[0];
    return modules[0];
  }, [currentLesson, modules]);

  const activeModuleId = activeModule?.id ?? "module-0-1";
  const activeChapterId = useMemo(() => findChapterIdForModule(activeModuleId), [activeModuleId]);
  const chapterFolios = useMemo(
    () => buildAtelierChapterFolios(modules, progress.lessonsCompleted, currentLesson?.id),
    [modules, progress.lessonsCompleted, currentLesson?.id],
  );
  const [selectedChapterId, setSelectedChapterId] = useState<AtelierChapterId>(activeChapterId);

  useEffect(() => setSelectedChapterId(activeChapterId), [activeChapterId]);

  const selectedFolio = chapterFolios.find((folio) => folio.id === selectedChapterId) ?? chapterFolios[0];
  const nextStep = useMemo(
    () => computeGuidedNextStep({ currentLesson, activeModule, lessons, projects, progress }),
    [currentLesson, activeModule, lessons, projects, progress],
  );
  const { activeProject, hasAnyStartedProject } = useMemo(
    () => evaluateAtelierProjects(projects, progress),
    [projects, progress],
  );

  const isNew = completedCount === 0;
  const completionPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const selectedTone = selectedFolio ? trackMeta[selectedFolio.id] : trackMeta["chapter-html-foundations"];
  const layer = layerContent[activeLayer];

  return (
    <div className="min-h-dvh bg-[#0b1018] text-[#edf2f7]">
      <div className="mx-auto flex min-h-dvh max-w-[1680px]">
        <aside className="sticky top-0 hidden h-dvh w-[244px] shrink-0 flex-col border-r border-white/[.07] bg-[#0e1520] px-5 py-6 xl:flex">
          <Link to="/dashboard" className="mb-10 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#ff8648] text-[#151b24]"><Atom className="h-6 w-6" /></span>
            <span><span className="block text-xl font-black tracking-[-.04em] text-white">Forge</span><span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[.16em] text-[#8190a3]">Frontend Academy</span></span>
          </Link>
          <p className="mb-3 px-3 font-mono text-[9px] font-bold uppercase tracking-[.18em] text-[#64748b]">Workspace</p>
          <nav className="space-y-1" aria-label="Main navigation">
            {[
              { to: "/dashboard", label: "Overview", icon: Layers3, active: true },
              { to: "/learn/modules", label: "Learning paths", icon: Code2 },
              { to: "/projects", label: "Projects", icon: FlaskConical },
              { to: "/playground", label: "Playground", icon: Terminal },
              { to: "/debug-lab", label: "Debug lab", icon: Bug },
              { to: "/progress", label: "Knowledge map", icon: Workflow },
            ].map((item) => {
              const Icon = item.icon;
              return <Link key={item.to} to={item.to as never} className={"flex min-h-11 items-center gap-3 rounded-xl px-3 text-[13px] font-semibold transition " + (item.active ? "bg-[#ff8648]/[.13] text-[#ff9b67] ring-1 ring-inset ring-[#ff8648]/20" : "text-[#91a0b2] hover:bg-white/[.05] hover:text-white")}>
                <Icon className="h-[17px] w-[17px]" />{item.label}{item.active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#ff8648]" />}
              </Link>;
            })}
          </nav>
          <div className="mt-auto rounded-2xl border border-[#26384b] bg-[#121e2b] p-4">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#7f91a6]"><Sparkles className="h-3.5 w-3.5 text-[#5bbbd1]" /> Need a direction?</div>
            <p className="mt-2 text-xs leading-5 text-[#c2ccd8]">Find a starting point that matches what you already know.</p>
            <button type="button" onClick={() => setDiagnosticOpen(true)} className="mt-3 inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-lg bg-[#1c3445] px-3 text-[11px] font-bold text-[#a9e4ef] transition hover:bg-[#25475d]">Run skill check <ArrowUpRight className="h-3.5 w-3.5" /></button>
          </div>
          <div className="mt-5 flex items-center gap-2 border-t border-white/[.07] pt-4">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#243447] text-[10px] font-bold text-[#a9e4ef]">F</span>
            <span className="min-w-0 flex-1"><span className="block text-xs font-bold text-white">Your workspace</span><span className="block text-[10px] text-[#718197]">Learning in progress</span></span>
            <span className="h-2 w-2 rounded-full bg-[#5cc79a]" />
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 pb-12 pt-4 sm:px-6 lg:px-8 lg:pt-7">
          <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 xl:hidden">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#ff8648] text-[#151b24]"><Atom className="h-5 w-5" /></span>
              <span className="text-lg font-black tracking-tight text-white">Forge</span>
            </div>
            <div className="hidden xl:block"><p className="font-mono text-[9px] font-bold uppercase tracking-[.18em] text-[#64748b]">Your engineering workspace</p><p className="mt-1 text-xs text-[#91a0b2]">A place to explore, experiment and build.</p></div>
            <div className="ml-auto flex items-center gap-2">
              <button type="button" onClick={() => setDiagnosticOpen(true)} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 bg-[#121b27] px-3 text-xs font-semibold text-[#b8c4d2] transition hover:border-[#5bbbd1]/40 hover:text-white"><Compass className="h-4 w-4 text-[#5bbbd1]" /><span className="hidden sm:inline">Find my level</span></button>
              <Link to="/progress" className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-[#121b27] text-[#a8b5c5] transition hover:text-white" aria-label="View progress"><ArrowUpRight className="h-4 w-4" /></Link>
            </div>
          </header>

          <section className="relative isolate overflow-hidden rounded-[26px] border border-[#26384b] bg-[radial-gradient(ellipse_at_78%_45%,rgba(35,93,125,.32),transparent_40%),linear-gradient(120deg,#172536_0%,#111c2a_54%,#101923_100%)] px-5 py-7 sm:px-8 sm:py-9 lg:min-h-[310px] lg:px-10">
            <div className="pointer-events-none absolute inset-0 opacity-[.14]" style={{ backgroundImage: "linear-gradient(rgba(160,190,220,.25) 1px,transparent 1px),linear-gradient(90deg,rgba(160,190,220,.25) 1px,transparent 1px)", backgroundSize: "34px 34px" }} aria-hidden="true" />
            <div className="pointer-events-none absolute -right-20 -top-28 h-[420px] w-[420px] rounded-full border border-[#5bbbd1]/20" aria-hidden="true" />
            <div className="pointer-events-none absolute right-16 top-10 h-[260px] w-[260px] rounded-full border border-dashed border-[#ff8648]/20" aria-hidden="true" />
            <div className="relative z-10 grid items-center gap-3 lg:grid-cols-[1fr_310px]">
              <div className="max-w-[650px]">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#5bbbd1]/25 bg-[#5bbbd1]/10 px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[.15em] text-[#8cdae8]"><span className="h-1.5 w-1.5 rounded-full bg-[#5cc79a]" /> Workshop is open</div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[.18em] text-[#91a9bd]">{isNew ? "Your first experiment starts here" : "Welcome back, builder"}</p>
                <h1 className="mt-3 max-w-[12ch] text-[clamp(2.7rem,5.4vw,5rem)] font-black leading-[.94] tracking-[-.065em] text-white">Make the web make <span className="text-[#ff945e]">sense.</span></h1>
                <p className="mt-4 max-w-[470px] text-sm leading-6 text-[#aebdca]">Understand what happens beneath the interface. Experiment with the pieces. Build things you can explain.</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link to={nextStep.to as never} params={nextStep.params as never} search={nextStep.search as never} className="group inline-flex min-h-12 items-center gap-3 rounded-xl bg-[#ff8648] px-4 text-xs font-extrabold text-[#1b2027] shadow-[0_8px_30px_-12px_rgba(255,134,72,.65)] transition hover:-translate-y-0.5 hover:bg-[#ffa16e]">{isNew ? "Start your first experiment" : nextStep.ctaLabel}<ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></Link>
                  <Link to="/learn/modules" className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/15 bg-white/[.04] px-4 text-xs font-bold text-[#d3dce5] transition hover:bg-white/[.09]"><BookOpen className="h-4 w-4" /> Explore learning paths</Link>
                </div>
              </div>
              <div className="relative mx-auto hidden h-[260px] w-full max-w-[300px] items-center justify-center lg:flex">
                <div className="absolute h-[220px] w-[220px] rounded-full border border-[#5bbbd1]/20" />
                <div className="absolute h-[176px] w-[176px] rounded-full border border-dashed border-[#ff945e]/30" />
                <div className="absolute h-[130px] w-[130px] rounded-full bg-[#5bbbd1]/[.08] blur-2xl" />
                <ForgeBuddyMascot3D mood="excited" className="relative z-10 h-[220px] w-[220px] drop-shadow-[0_18px_30px_rgba(0,0,0,.35)]" />
                <span className="absolute right-0 top-7 rounded-lg border border-[#5bbbd1]/25 bg-[#102332] px-2.5 py-1.5 font-mono text-[8px] uppercase tracking-[.12em] text-[#8cdae8]">Curiosity engine</span>
                <span className="absolute bottom-5 left-0 rounded-lg border border-[#ff945e]/25 bg-[#251f20] px-2.5 py-1.5 font-mono text-[8px] uppercase tracking-[.12em] text-[#ffb18a]">Ready to build</span>
              </div>
            </div>
            <div className="relative z-10 mt-8 grid grid-cols-3 gap-2 border-t border-white/10 pt-5 sm:max-w-[540px] sm:gap-5">
              {[{ value: modules.length, label: "Learning modules", icon: Layers3 }, { value: totalLessons, label: "Lessons to explore", icon: Code2 }, { value: projects.length, label: "Build briefs", icon: FlaskConical }].map((item) => {
                const Icon = item.icon;
                return <div key={item.label} className="flex items-center gap-2.5"><span className="hidden h-9 w-9 place-items-center rounded-lg bg-white/[.06] text-[#8cdae8] sm:grid"><Icon className="h-4 w-4" /></span><span><span className="block font-mono text-xl font-bold text-white sm:text-2xl">{item.value}</span><span className="block text-[9px] text-[#8495a8] sm:text-[10px]">{item.label}</span></span></div>;
              })}
            </div>
          </section>

          <div className="mt-5 grid gap-4 xl:grid-cols-[1.45fr_.75fr]">
            <section className="overflow-hidden rounded-2xl border border-[#26384b] bg-[#121c29] p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-mono text-[9px] font-bold uppercase tracking-[.16em] text-[#5bbbd1]">Recommended next step</p><h2 className="mt-2 text-xl font-extrabold tracking-[-.035em] text-white sm:text-2xl">Your next discovery</h2></div><span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[.04] px-3 py-1.5 font-mono text-[9px] text-[#91a0b2]"><Clock3 className="h-3.5 w-3.5" /> {nextStep.estimatedMinutes} min</span></div>
              <div className="mt-5 grid gap-5 md:grid-cols-[minmax(0,1fr)_190px] md:items-center">
                <div><span className="inline-flex rounded-md bg-[#ff8648]/10 px-2.5 py-1 font-mono text-[8px] font-bold uppercase tracking-[.13em] text-[#ff9b67]">{nextStep.eyebrow}</span><h3 className="mt-3 max-w-[25ch] text-lg font-bold leading-snug text-white">{nextStep.title}</h3><p className="mt-2 max-w-[560px] text-xs leading-5 text-[#91a0b2]">{nextStep.reason}</p><Link to={nextStep.to as never} params={nextStep.params as never} search={nextStep.search as never} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#203b50] px-3.5 text-[11px] font-bold text-[#a9e4ef] transition hover:bg-[#2a4c65]">Continue learning <ArrowRight className="h-3.5 w-3.5" /></Link></div>
                <div className="relative hidden min-h-[150px] items-center justify-center overflow-hidden rounded-xl border border-[#294255] bg-[#0d1722] md:flex"><div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(#5bbbd1 1px,transparent 1px)", backgroundSize: "17px 17px" }} /><div className="relative grid h-20 w-20 place-items-center rounded-2xl border border-[#5bbbd1]/40 bg-[#163144] text-[#83d7e6] shadow-[0_0_40px_rgba(91,187,209,.12)]"><Code2 className="h-9 w-9" /></div><span className="absolute bottom-3 font-mono text-[8px] uppercase tracking-[.15em] text-[#71869a]">Learning signal / active</span></div>
              </div>
            </section>
            <section className="relative overflow-hidden rounded-2xl border border-[#26384b] bg-[linear-gradient(145deg,#17283a,#101a27)] p-5 sm:p-6">
              <div className="flex items-center justify-between"><span className="font-mono text-[9px] font-bold uppercase tracking-[.15em] text-[#91a9bd]">Forge Buddy</span><span className="rounded-full bg-[#5cc79a]/10 px-2 py-1 font-mono text-[8px] uppercase tracking-[.12em] text-[#7ed9ae]">On your side</span></div>
              <div className="mt-3 flex items-center gap-3"><ForgeBuddyMascot3D mood="thinking" className="h-[94px] w-[94px] shrink-0" animate={false} /><div><h3 className="text-sm font-extrabold text-white">Stuck on something?</h3><p className="mt-1 text-[11px] leading-5 text-[#9aabbd]">Bring a question. We’ll work through the evidence, not guess.</p></div></div>
              <p className="mt-3 border-t border-white/[.08] pt-3 text-[10px] leading-5 text-[#8294a8]">Buddy is here when useful. The workshop is yours either way.</p>
            </section>
          </div>

          <section className="mt-7">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><p className="font-mono text-[9px] font-bold uppercase tracking-[.16em] text-[#5bbbd1]">Your learning landscape</p><h2 className="mt-1.5 text-2xl font-black tracking-[-.045em] text-white">Four connected disciplines</h2><p className="mt-1 text-xs text-[#8190a3]">Explore the systems that turn ideas into interfaces.</p></div><Link to="/learn/modules" className="inline-flex min-h-9 items-center gap-2 text-[11px] font-bold text-[#8cdae8] hover:text-white">All learning paths <ArrowUpRight className="h-3.5 w-3.5" /></Link></div>
            <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
              {chapterFolios.map((folio,index) => {
                const tone=trackMeta[folio.id];
                const percent=Math.min(100,Math.round((folio.completedLessonsCount/Math.max(folio.totalAuthoredLessonsCount,1))*100));
                const icons=[Code2,Layers3,Braces,Atom];
                const Icon=icons[index] ?? Code2;
                const chosen=folio.id===selectedChapterId;
                return <button key={folio.id} type="button" onClick={()=>setSelectedChapterId(folio.id)} aria-pressed={chosen} className={"group relative min-h-[175px] overflow-hidden rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 " +(chosen?"border-[#5bbbd1]/50 bg-[#172a39] shadow-[0_12px_35px_-24px_rgba(91,187,209,.5)]":"border-[#26384b] bg-[#121c29] hover:border-[#405a70]")}>
                  <div className="flex items-center justify-between"><span className="font-mono text-[9px] font-bold tracking-[.14em]" style={{color:tone.color}}>DISCIPLINE / {folio.numberLabel}</span><Icon className="h-5 w-5" style={{color:tone.color}} /></div>
                  <h3 className="mt-6 text-lg font-extrabold tracking-[-.03em] text-white">{folio.shortTitle}</h3>
                  <p className="mt-1 text-[10px] leading-4 text-[#8293a7]">{tone.descriptor}</p>
                  <div className="mt-5 flex items-center justify-between font-mono text-[9px] text-[#91a0b2]"><span>{folio.completedLessonsCount} / {folio.totalAuthoredLessonsCount} explored</span><span>{percent}%</span></div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[.08]"><div className="h-full rounded-full" style={{width:percent+"%",backgroundColor:tone.color}} /></div>
                  {chosen && <span className="absolute right-4 top-12 h-1.5 w-1.5 rounded-full bg-[#5bbbd1] shadow-[0_0_0_4px_rgba(91,187,209,.12)]" />}
                </button>;
              })}
            </div>
            {selectedFolio && <div className="mt-3 overflow-hidden rounded-2xl border border-[#26384b] bg-[#101a26]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[.07] px-5 py-4"><div><p className="font-mono text-[8px] font-bold uppercase tracking-[.15em]" style={{color:selectedTone.color}}>Selected discipline / {selectedFolio.numberLabel}</p><h3 className="mt-1 text-base font-extrabold text-white">{selectedFolio.title}</h3><p className="mt-1 text-[10px] text-[#8190a3]">{selectedFolio.subtitle}</p></div><Link to="/learn/modules" search={{track:selectedFolio.id}} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-[10px] font-bold text-[#b9c7d6] hover:border-[#5bbbd1]/40 hover:text-white">Open discipline <ArrowUpRight className="h-3.5 w-3.5" /></Link></div>
              <div className="divide-y divide-white/[.06] px-4 sm:px-5">
                {selectedFolio.modules.map((module,index)=>{const first=module.authoredLessons[0]?.id;const pct=Math.min(100,Math.round((module.completedCount/Math.max(module.totalAuthoredCount,1))*100));return <div key={module.id} className="flex flex-wrap items-center gap-3 py-3"><span className="font-mono text-[9px] text-[#64748b]">{String(index+1).padStart(2,"0")}</span><div className="min-w-0 flex-1"><Link to="/learn/modules/$moduleId" params={{moduleId:module.id}} className="text-xs font-bold text-[#dce5ee] hover:text-[#8cdae8]">{module.title}</Link><p className="mt-1 line-clamp-1 text-[10px] text-[#718197]">{module.description}</p></div><span className="hidden font-mono text-[9px] text-[#718197] sm:block">{module.completedCount}/{module.totalAuthoredCount}</span><div className="h-1 w-16 overflow-hidden rounded-full bg-white/[.08]"><div className="h-full rounded-full" style={{width:pct+"%",backgroundColor:selectedTone.color}} /></div><Link to={first?"/lesson/$lessonId":"/learn/modules/$moduleId"} params={first?{lessonId:first} as never:{moduleId:module.id} as never} aria-label={"Open "+module.title} className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-[#91a0b2] hover:border-[#5bbbd1]/50 hover:text-white"><ArrowUpRight className="h-4 w-4" /></Link></div>})}
              </div>
            </div>}
          </section>

          <section className="mt-7 grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
            <div className="overflow-hidden rounded-2xl border border-[#26384b] bg-[#121c29] p-5 sm:p-6">
              <div className="flex items-center justify-between"><div><p className="font-mono text-[9px] font-bold uppercase tracking-[.15em] text-[#ff9b67]">Build something real</p><h2 className="mt-1.5 text-xl font-extrabold text-white">Project workshop</h2></div><FlaskConical className="h-5 w-5 text-[#ff9b67]" /></div>
              <div className="mt-5 flex flex-wrap items-center gap-5"><div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl border border-[#ff945e]/20 bg-[#ff945e]/[.08] text-[#ff9b67]"><Layers3 className="h-9 w-9" /></div><div className="min-w-0 flex-1"><p className="font-mono text-[8px] uppercase tracking-[.13em] text-[#718197]">{activeProject ? hasAnyStartedProject ? "Your current build" : "Ready to begin" : "Choose a build brief"}</p><h3 className="mt-1 text-base font-bold text-white">{activeProject?.project.title ?? "Turn understanding into software."}</h3><p className="mt-1 max-w-xl text-[11px] leading-5 text-[#8190a3]">{activeProject?.project.description ?? "Take a real brief, make decisions and build something you can explain."}</p>{activeProject && <p className="mt-2 font-mono text-[9px] text-[#91a0b2]">{activeProject.completedTasks}/{activeProject.totalTasks} tasks · {activeProject.completionPercent}% complete</p>}</div></div>
              {activeProject ? <Link to="/projects/$projectId" params={{projectId:activeProject.project.id}} className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#263c50] px-3.5 text-[10px] font-bold text-[#b9e6ef] hover:bg-[#31516b]">{hasAnyStartedProject?"Return to your build":"Explore this project"}<ArrowUpRight className="h-3.5 w-3.5" /></Link> : <Link to="/projects" className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#263c50] px-3.5 text-[10px] font-bold text-[#b9e6ef] hover:bg-[#31516b]">Explore project briefs<ArrowUpRight className="h-3.5 w-3.5" /></Link>}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <Link to="/playground" className="group flex min-h-[132px] flex-col justify-between rounded-2xl border border-[#26384b] bg-[#121c29] p-5 transition hover:border-[#5bbbd1]/45 hover:bg-[#152535]"><div className="flex items-center justify-between"><span className="font-mono text-[9px] font-bold uppercase tracking-[.14em] text-[#5bbbd1]">Experiment / 01</span><Terminal className="h-5 w-5 text-[#5bbbd1]" /></div><div><h3 className="text-base font-extrabold text-white">The Playground</h3><p className="mt-1 text-[10px] leading-4 text-[#8190a3]">Change the code. Observe the result. Find out what matters.</p></div></Link>
              <Link to="/debug-lab" className="group flex min-h-[132px] flex-col justify-between rounded-2xl border border-[#26384b] bg-[#121c29] p-5 transition hover:border-[#ff945e]/45 hover:bg-[#1b232d]"><div className="flex items-center justify-between"><span className="font-mono text-[9px] font-bold uppercase tracking-[.14em] text-[#ff9b67]">Investigate / 02</span><Bug className="h-5 w-5 text-[#ff9b67]" /></div><div><h3 className="text-base font-extrabold text-white">The Debug Lab</h3><p className="mt-1 text-[10px] leading-4 text-[#8190a3]">Follow evidence, test a theory and explain the behaviour.</p></div></Link>
            </div>
          </section>

          <section className="mt-7 overflow-hidden rounded-2xl border border-[#26384b] bg-[#101b28] p-5 sm:p-6">
            <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
              <div><p className="font-mono text-[9px] font-bold uppercase tracking-[.15em] text-[#5bbbd1]">Your engineering journey</p><h2 className="mt-2 max-w-[14ch] text-2xl font-black leading-tight tracking-[-.045em] text-white">The goal is to need less help over time.</h2><p className="mt-2 max-w-md text-xs leading-5 text-[#8190a3]">Forge adapts its support as your capability develops. Progress records the work you have done; it does not pretend to measure your entire ability.</p><Link to="/progress" className="mt-4 inline-flex min-h-9 items-center gap-2 text-[10px] font-bold text-[#8cdae8] hover:text-white">Open knowledge map <ArrowRight className="h-3.5 w-3.5" /></Link></div>
              <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                {[{n:"01",title:"Familiarity",mode:"Guided",copy:"See the shape of things.",tone:"#5bbbd1"},{n:"02",title:"Fluency",mode:"Constrained",copy:"Make the pieces work.",tone:"#ff945e"},{n:"03",title:"Reasoning",mode:"Assisted",copy:"Defend your decisions.",tone:"#e7c477"},{n:"04",title:"Independence",mode:"Independent",copy:"Own unfamiliar problems.",tone:"#81c9a4"}].map((stage,index)=><div key={stage.n} className="relative rounded-xl border border-[#2a3b4e] bg-[#142231] p-3.5"><div className="flex items-center justify-between"><span className="font-mono text-[9px]" style={{color:stage.tone}}>{stage.n}</span>{index<3&&<ArrowRight className="hidden h-3 w-3 text-[#5d7085] lg:block"/>}</div><h3 className="mt-4 text-xs font-extrabold text-white">{stage.title}</h3><p className="mt-1 font-mono text-[8px] uppercase tracking-[.12em] text-[#8495a8]">{stage.mode}</p><p className="mt-2 text-[9px] leading-4 text-[#8190a3]">{stage.copy}</p></div>)}
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[.07] pt-4"><div className="flex items-center gap-3"><div className="h-2 w-36 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#5bbbd1]" style={{width:completionPercent+"%"}} /></div><span className="font-mono text-[9px] text-[#91a0b2]">{completedCount}/{totalLessons} lessons completed</span></div><span className="font-mono text-[8px] uppercase tracking-[.14em] text-[#607287]">Understand · Build · Investigate · Explain</span></div>
          </section>
          <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/[.07] pt-5 font-mono text-[8px] uppercase tracking-[.13em] text-[#5e7084]"><span>Forge / Playful intelligence. Serious engineering.</span><span>Understand the system. Then make it yours.</span></footer>
        </main>
      </div>
      <SkillDiagnosticModal open={diagnosticOpen} onOpenChange={setDiagnosticOpen} />
    </div>
  );
}
