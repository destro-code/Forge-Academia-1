import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight, ArrowUpRight, Atom, Braces, Bug, Check, ChevronRight,
  Clock3, Code2, Compass, FlaskConical, Layers3, MoveUpRight,
  Play, Sparkles, Terminal, WandSparkles, Workflow, Zap,
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
import { AtelierTopNav } from "@/components/atelier/atelier-top-nav";
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
    <div className="forge-workshop min-h-dvh overflow-x-clip bg-background text-foreground">
      <AtelierTopNav onOpenDiagnostic={() => setDiagnosticOpen(true)} />

      <main className="relative mx-auto w-full max-w-[1500px] px-4 pb-20 pt-5 sm:px-6 sm:pt-8 lg:px-10">
        <section className="relative isolate overflow-hidden rounded-[1.6rem] border border-border bg-[#171d23] text-white shadow-[0_24px_70px_-42px_rgba(0,0,0,.65)]">
          <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden="true"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px)", backgroundSize: "42px 42px" }} />
          <div className="pointer-events-none absolute -right-28 -top-32 h-[520px] w-[520px] rounded-full border border-[#72c4ce]/20" aria-hidden="true" />
          <div className="pointer-events-none absolute right-[-5rem] top-[-5rem] h-[390px] w-[390px] rounded-full border border-dashed border-[#ff9a65]/25" aria-hidden="true" />
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4 sm:px-8">
            <div className="flex items-center gap-3 font-mono text-[10px] font-bold uppercase tracking-[.18em] text-white/65">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#ff874a] text-[#171d23]"><Atom className="h-4 w-4" /></span>
              <span>Forge workshop</span><span className="text-white/25">/</span><span>Open environment</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-[#83b99a]/30 bg-[#83b99a]/10 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[.15em] text-[#a9d5ba]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#83b99a]" /> Ready to experiment
            </div>
          </div>

          <div className="relative z-10 grid gap-8 px-5 pb-8 pt-8 sm:px-8 sm:pb-10 lg:grid-cols-[.86fr_1.14fr] lg:items-center lg:gap-5 lg:px-12 lg:py-12">
            <div className="max-w-[590px]">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#ff9a65]/30 bg-[#ff9a65]/10 px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[.16em] text-[#ffb38c]">
                <Sparkles className="h-3.5 w-3.5" /> Curiosity, meet capability
              </div>
              <h1 className="max-w-[11ch] text-balance text-[clamp(3.35rem,7.2vw,6.7rem)] font-black leading-[.91] tracking-[-.075em] text-white">
                The web is a system. <span className="text-[#ff9a65]">Learn to shape it.</span>
              </h1>
              <p className="mt-6 max-w-[470px] text-sm leading-7 text-[#c2cbd1] sm:text-base">
                Pull things apart. Follow the connections. Build something that works — then find out why.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link to={nextStep.to as never} params={nextStep.params as never} search={nextStep.search as never}
                  className="group inline-flex min-h-14 items-center gap-4 rounded-xl bg-[#ff874a] px-5 py-3 text-sm font-extrabold text-[#201912] shadow-[0_8px_26px_-12px_rgba(255,135,74,.7)] transition hover:-translate-y-0.5 hover:bg-[#ffa06e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb38c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#171d23]">
                  <span>{isNew ? "Start your first experiment" : nextStep.ctaLabel}</span>
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-black/10 transition-transform group-hover:translate-x-1"><ArrowUpRight className="h-4 w-4" /></span>
                </Link>
                <button type="button" onClick={() => setDiagnosticOpen(true)}
                  className="inline-flex min-h-14 items-center gap-2 rounded-xl border border-white/20 px-4 text-sm font-semibold text-white/85 transition hover:border-[#72c4ce]/70 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#72c4ce]">
                  <Compass className="h-4 w-4 text-[#72c4ce]" /> Find my starting point
                </button>
              </div>
              <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 border-t border-white/10 pt-5">
                {[
                  { value: modules.length, label: "Modules" },
                  { value: totalLessons, label: "Lessons to explore" },
                  { value: projects.length, label: "Build briefs" },
                ].map((item) => <div key={item.label}>
                  <span className="block font-mono text-2xl font-bold tracking-tight text-white">{item.value}</span>
                  <span className="mt-1 block text-[9px] font-bold uppercase tracking-[.15em] text-white/45">{item.label}</span>
                </div>)}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[680px]">
              <div className="mb-3 flex items-center justify-between px-1 font-mono text-[9px] uppercase tracking-[.16em] text-white/45">
                <span className="inline-flex items-center gap-2"><Workflow className="h-3.5 w-3.5 text-[#72c4ce]" /> A living system / 001</span>
                <span>Explore the layers</span>
              </div>
              <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-[#202830] p-3 shadow-[0_20px_55px_-28px_rgba(0,0,0,.9)] sm:p-4">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#72c4ce]/70 to-transparent" />
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-2 pb-3">
                  <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#ff9a65]" /><span className="h-2 w-2 rounded-full bg-[#e6bd72]" /><span className="h-2 w-2 rounded-full bg-[#83b99a]" /><span className="ml-2 font-mono text-[9px] text-white/45">your-first-interface.dev</span></div>
                  <span className="rounded-md bg-[#83b99a]/10 px-2 py-1 font-mono text-[8px] uppercase tracking-[.12em] text-[#a9d5ba]">Live concept</span>
                </div>
                <div className="grid gap-3 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(180px,.72fr)]">
                  <div className="relative flex min-h-[230px] flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-[#f4f2ec] p-5 text-[#202329] sm:min-h-[270px]">
                    <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full border-[22px] border-[#72c4ce]/20" aria-hidden="true" />
                    <div className="relative z-10 flex items-center justify-between"><span className="font-mono text-[8px] font-bold uppercase tracking-[.15em] text-[#59646c]">Browser / rendered output</span><span className="h-2 w-2 rounded-full bg-[#83a98b]" /></div>
                    <div className="relative z-10">
                      <p className="font-mono text-[9px] uppercase tracking-[.15em] text-[#d56c37]">A tiny web experiment</p>
                      <h2 className="mt-2 max-w-[9ch] text-4xl font-black leading-[.94] tracking-[-.07em]">Hello, <span className={activeLayer === "presentation" ? "text-[#d56c37]" : "text-[#277c89]"}>web.</span></h2>
                      <p className="mt-3 max-w-[230px] text-xs leading-5 text-[#5c6670]">{activeLayer === "behaviour" ? "Press the button. Notice what changes." : activeLayer === "presentation" ? "A little styling changes how this feels." : "A heading. A message. A button. Structure first."}</p>
                    </div>
                    <div className="relative z-10 flex items-center justify-between gap-3">
                      <span className="rounded-lg bg-[#202329] px-3 py-2 text-[10px] font-bold text-white">{activeLayer === "behaviour" ? "Try an action ↗" : "Explore the page"}</span>
                      <span className="font-mono text-[8px] uppercase tracking-[.12em] text-[#69727b]">Output / 01</span>
                    </div>
                  </div>
                  <div className="flex min-w-0 flex-col rounded-xl border border-white/10 bg-[#171d23] p-4">
                    <div className="mb-3 flex items-center justify-between"><span className="font-mono text-[9px] uppercase tracking-[.14em] text-white/50">System layers</span><span className="text-[8px] text-[#72c4ce]">Select to inspect</span></div>
                    <div className="space-y-2">
                      {(["structure", "presentation", "behaviour"] as const).map((key, index) => {
                        const item = layerContent[key];
                        const chosen = activeLayer === key;
                        const colors = ["#72c4ce", "#ff9a65", "#e6bd72"];
                        const icons = [Code2, Layers3, Zap];
                        const Icon = icons[index];
                        return <button key={key} type="button" onClick={() => setActiveLayer(key)} aria-pressed={chosen}
                          className={"flex min-h-[54px] w-full items-center gap-3 rounded-lg border px-3 text-left transition " + (chosen ? "border-white/25 bg-white/[.09]" : "border-transparent bg-white/[.025] hover:bg-white/[.06]")}>
                          <span className="grid h-8 w-8 place-items-center rounded-md" style={{ color: colors[index], backgroundColor: colors[index] + "18" }}><Icon className="h-4 w-4" /></span>
                          <span className="min-w-0 flex-1"><span className="block text-xs font-bold text-white">{item.label}</span><span className="block text-[9px] text-white/45">{item.short}</span></span>
                          {chosen && <Check className="h-4 w-4" style={{ color: colors[index] }} />}
                        </button>;
                      })}
                    </div>
                    <div className="mt-auto border-t border-white/10 pt-3">
                      <p className="mb-2 font-mono text-[8px] uppercase tracking-[.14em] text-white/40">{layer.label} / What it does</p>
                      <p className="text-[11px] leading-5 text-white/75">{layer.detail}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-1 pt-3">
                  <span className="font-mono text-[8px] uppercase tracking-[.14em] text-white/40">Structure <span className="text-[#72c4ce]">→</span> Presentation <span className="text-[#ff9a65]">→</span> Behaviour</span>
                  <span className="font-mono text-[8px] uppercase tracking-[.12em] text-white/40">One interface / many systems</span>
                </div>
              </div>
              <div className="pointer-events-none absolute -bottom-5 -right-4 -z-10 h-24 w-24 rounded-full border border-[#ff9a65]/25" aria-hidden="true" />
            </div>
          </div>
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-black/10 px-5 py-3 sm:px-8">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[8px] uppercase tracking-[.14em] text-white/45">
              <span className="inline-flex items-center gap-2"><Compass className="h-3 w-3 text-[#72c4ce]" /> Discover</span>
              <span className="inline-flex items-center gap-2"><FlaskConical className="h-3 w-3 text-[#ff9a65]" /> Experiment</span>
              <span className="inline-flex items-center gap-2"><Layers3 className="h-3 w-3 text-[#e6bd72]" /> Create</span>
              <span className="inline-flex items-center gap-2"><Bug className="h-3 w-3 text-[#83b99a]" /> Investigate</span>
            </div>
            <span className="font-mono text-[8px] uppercase tracking-[.13em] text-white/35">Playful intelligence. Serious engineering.</span>
          </div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(260px,.7fr)]" aria-labelledby="next-step-title">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-7">
            <div className="pointer-events-none absolute -right-10 -top-12 h-48 w-48 rounded-full border-[26px] border-primary/[.06]" aria-hidden="true" />
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[.14em] text-primary"><Play className="h-3 w-3" /> {nextStep.eyebrow}</div>
              <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[.12em] text-muted-foreground"><Clock3 className="h-3 w-3" /> {nextStep.estimatedMinutes} min</span>
            </div>
            <div className="relative z-10 mt-5 grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <div>
                <p className="font-mono text-[9px] font-bold uppercase tracking-[.15em] text-muted-foreground">Your next move</p>
                <h2 id="next-step-title" className="mt-2 max-w-[24ch] text-2xl font-black leading-tight tracking-[-.045em] text-foreground sm:text-3xl">{nextStep.title}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{nextStep.reason}</p>
              </div>
              <Link to={nextStep.to as never} params={nextStep.params as never} search={nextStep.search as never}
                className="inline-flex min-h-12 shrink-0 items-center justify-center gap-3 rounded-xl bg-foreground px-5 text-sm font-bold text-background transition hover:bg-primary hover:text-primary-foreground">
                {nextStep.ctaLabel}<ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center justify-between"><span className="font-mono text-[9px] font-bold uppercase tracking-[.15em] text-muted-foreground">Your learning signal</span><Sparkles className="h-4 w-4 text-primary" /></div>
            <div className="mt-5">
              <div className="flex items-baseline gap-2"><span className="font-mono text-4xl font-bold tracking-[-.06em]">{String(completedCount).padStart(2, "0")}</span><span className="font-mono text-sm text-muted-foreground">/ {String(totalLessons).padStart(2, "0")} lessons</span></div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: completionPercent + "%" }} /></div>
              <p className="mt-2 text-[10px] text-muted-foreground">{completionPercent}% of authored lessons completed. Progress is a record of work, not a measure of your worth.</p>
            </div>
            <Link to="/progress" className="mt-5 inline-flex min-h-10 items-center gap-2 text-xs font-bold text-primary hover:underline">View your capability map <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
        </section>

        <section className="mt-16 sm:mt-20" aria-labelledby="curriculum-title">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div><p className="font-mono text-[9px] font-bold uppercase tracking-[.17em] text-primary">Explore the connected disciplines</p><h2 id="curriculum-title" className="mt-2 text-3xl font-black tracking-[-.055em] sm:text-4xl">See how the pieces fit.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Move through the foundations, follow a curiosity or revisit a concept when a project demands it.</p></div>
            <Link to="/learn/modules" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 text-xs font-bold transition hover:border-primary hover:text-primary">Open curriculum <ArrowUpRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid gap-4 lg:grid-cols-[minmax(250px,.72fr)_minmax(0,1.28fr)]">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {chapterFolios.map((folio, index) => {
                const tone = trackMeta[folio.id];
                const selected = folio.id === selectedChapterId;
                const percent = Math.min(100, Math.round((folio.completedLessonsCount / Math.max(folio.totalAuthoredLessonsCount, 1)) * 100));
                const icons = [Code2, Layers3, Braces, Atom];
                const Icon = icons[index] ?? Code2;
                return <button key={folio.id} type="button" onClick={() => setSelectedChapterId(folio.id)} aria-pressed={selected}
                  className={"group flex min-h-[94px] items-center gap-3 rounded-xl border p-4 text-left transition " + (selected ? "border-foreground/30 bg-card shadow-sm" : "border-border bg-background hover:border-foreground/20 hover:bg-card")}>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ color: tone.color, backgroundColor: tone.soft }}><Icon className="h-5 w-5" /></span>
                  <span className="min-w-0 flex-1"><span className="flex items-center gap-2 font-mono text-[8px] uppercase tracking-[.13em] text-muted-foreground">Discipline {folio.numberLabel}<span className="text-border">·</span>{folio.modules.length} modules</span><span className="mt-1 block text-sm font-extrabold">{folio.shortTitle}</span><span className="mt-1 block text-[10px] text-muted-foreground">{folio.completedLessonsCount} / {folio.totalAuthoredLessonsCount} lessons explored</span><span className="mt-2 block h-1 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full" style={{ width: percent + "%", backgroundColor: tone.color }} /></span></span>
                  <ChevronRight className={"h-4 w-4 shrink-0 transition " + (selected ? "translate-x-0.5" : "text-muted-foreground group-hover:translate-x-0.5")} style={{ color: selected ? tone.color : undefined }} />
                </button>;
              })}
            </div>
            <div className="relative min-h-[390px] overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-7">
              <div className="pointer-events-none absolute -right-14 -top-16 h-64 w-64 rounded-full border-[30px] opacity-30" style={{ borderColor: selectedTone.color }} aria-hidden="true" />
              {selectedFolio ? <>
                <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
                  <div><p className="font-mono text-[9px] font-bold uppercase tracking-[.16em]" style={{ color: selectedTone.color }}>Discipline {selectedFolio.numberLabel} / Field guide</p><h3 className="mt-2 max-w-[16ch] text-3xl font-black leading-[.98] tracking-[-.05em] sm:text-4xl">{selectedFolio.title}</h3><p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">{selectedFolio.subtitle}</p></div>
                  <span className="grid h-14 w-14 place-items-center rounded-2xl border font-mono text-xl font-bold" style={{ color: selectedTone.color, borderColor: selectedTone.color, backgroundColor: selectedTone.soft }}>{selectedFolio.numberLabel}</span>
                </div>
                <p className="relative z-10 mt-7 font-mono text-[8px] uppercase tracking-[.15em] text-muted-foreground">{selectedTone.descriptor}</p>
                <div className="relative z-10 mt-3 divide-y divide-border border-y border-border">
                  {selectedFolio.modules.map((module, index) => {
                    const firstLessonId = module.authoredLessons[0]?.id;
                    const percent = Math.min(100, Math.round((module.completedCount / Math.max(module.totalAuthoredCount, 1)) * 100));
                    return <div key={module.id} className="flex flex-wrap items-center gap-3 py-3">
                      <span className="w-6 shrink-0 font-mono text-[9px] text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                      <div className="min-w-0 flex-1"><Link to="/learn/modules/$moduleId" params={{ moduleId: module.id }} className="text-sm font-bold transition hover:text-primary">{module.title}</Link><p className="mt-1 line-clamp-1 text-[10px] text-muted-foreground">{module.description}</p></div>
                      <span className="hidden w-14 text-right font-mono text-[9px] text-muted-foreground sm:block">{module.completedCount}/{module.totalAuthoredCount}</span>
                      <span className="h-1 w-12 overflow-hidden rounded-full bg-muted"><span className="block h-full" style={{ width: percent + "%", backgroundColor: selectedTone.color }} /></span>
                      <Link to={firstLessonId ? "/lesson/$lessonId" : "/learn/modules/$moduleId"} params={firstLessonId ? { lessonId: firstLessonId } as never : { moduleId: module.id } as never} aria-label={firstLessonId ? "Start " + module.title : "Open " + module.title} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border transition hover:border-primary hover:bg-primary hover:text-primary-foreground"><ArrowUpRight className="h-4 w-4" /></Link>
                    </div>;
                  })}
                </div>
                <div className="relative z-10 mt-4 flex flex-wrap items-center justify-between gap-3"><span className="font-mono text-[8px] uppercase tracking-[.13em] text-muted-foreground">{selectedFolio.estimatedHours} estimated hours · {selectedFolio.totalAuthoredLessonsCount} lessons</span><Link to="/learn/modules" search={{ track: selectedFolio.id }} className="inline-flex min-h-9 items-center gap-2 text-xs font-bold" style={{ color: selectedTone.color }}>Explore this discipline <ArrowRight className="h-3.5 w-3.5" /></Link></div>
              </> : <div className="flex min-h-[320px] items-center justify-center text-sm text-muted-foreground">Curriculum map is loading.</div>}
            </div>
          </div>
        </section>

        <section className="mt-16 sm:mt-20" aria-labelledby="tools-title">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="font-mono text-[9px] font-bold uppercase tracking-[.17em] text-primary">Choose how to work</p><h2 id="tools-title" className="mt-2 text-3xl font-black tracking-[-.055em] sm:text-4xl">The lesson is only one tool.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Build something, test an idea or investigate a stubborn bug. Different questions need different spaces.</p></div><span className="font-mono text-[8px] uppercase tracking-[.14em] text-muted-foreground">The workshop / tools</span></div>
          <div className="grid gap-3 lg:grid-cols-[1.15fr_.85fr]">
            <div className="relative flex min-h-[310px] flex-col justify-between overflow-hidden rounded-2xl bg-[#202830] p-6 text-white sm:p-8">
              <div className="pointer-events-none absolute -right-6 top-0 opacity-20" aria-hidden="true"><Atom className="h-64 w-64 stroke-[.65]" /></div>
              <div className="relative z-10 flex items-center justify-between"><span className="inline-flex items-center gap-2 font-mono text-[9px] font-bold uppercase tracking-[.15em] text-[#ffb38c]"><Layers3 className="h-4 w-4" /> Build / Project workshop</span><span className="rounded-full border border-white/15 px-2.5 py-1 font-mono text-[8px] text-white/55">01</span></div>
              <div className="relative z-10 mt-12 max-w-[490px]"><p className="font-mono text-[8px] uppercase tracking-[.14em] text-white/45">{activeProject ? hasAnyStartedProject ? "Your current build" : "Ready when you are" : "Choose a build brief"}</p><h3 className="mt-3 text-3xl font-black leading-[1.02] tracking-[-.05em] sm:text-4xl">{activeProject?.project.title ?? "Turn understanding into software."}</h3><p className="mt-3 max-w-md text-sm leading-6 text-white/65">{activeProject?.project.description ?? "Take a real brief, make decisions, and produce something you can explain."}</p>{activeProject && <p className="mt-4 font-mono text-[9px] text-white/55">{activeProject.completedTasks}/{activeProject.totalTasks} tasks · {activeProject.completionPercent}% complete</p>}</div>
              <Link to={activeProject ? "/projects/$projectId" : "/projects"} params={activeProject ? { projectId: activeProject.project.id } : undefined as never} className="relative z-10 mt-7 inline-flex min-h-11 w-fit items-center gap-3 rounded-lg bg-[#ff874a] px-4 text-xs font-extrabold text-[#201912] transition hover:bg-[#ffa06e]">{activeProject ? hasAnyStartedProject ? "Return to your build" : "Explore this project" : "Explore project briefs"}<ArrowUpRight className="h-4 w-4" /></Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <Link to="/playground" className="group flex min-h-[150px] flex-col justify-between rounded-2xl border border-border bg-card p-5 transition hover:border-primary/50 hover:bg-accent/30 sm:p-6"><div className="flex items-center justify-between"><span className="inline-flex items-center gap-2 font-mono text-[8px] font-bold uppercase tracking-[.14em] text-muted-foreground"><Terminal className="h-4 w-4 text-primary" /> Experiment / 02</span><MoveUpRight className="h-4 w-4 text-primary transition group-hover:-translate-y-1 group-hover:translate-x-1" /></div><div><h3 className="text-xl font-black tracking-[-.035em]">The Playground</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">Change the code. Observe the result. Find out what matters.</p></div></Link>
              <Link to="/debug-lab" className="group flex min-h-[150px] flex-col justify-between rounded-2xl border border-border bg-card p-5 transition hover:border-[#72c4ce]/60 hover:bg-accent/30 sm:p-6"><div className="flex items-center justify-between"><span className="inline-flex items-center gap-2 font-mono text-[8px] font-bold uppercase tracking-[.14em] text-muted-foreground"><Bug className="h-4 w-4 text-[#277c89]" /> Investigate / 03</span><MoveUpRight className="h-4 w-4 text-[#277c89] transition group-hover:-translate-y-1 group-hover:translate-x-1" /></div><div><h3 className="text-xl font-black tracking-[-.035em]">The Debug Lab</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">Follow evidence, test a theory and explain the behaviour.</p></div></Link>
            </div>
          </div>
        </section>

        <section className="mt-16 overflow-hidden rounded-2xl border border-border bg-card p-5 sm:mt-20 sm:p-8" aria-labelledby="independence-title">
          <div className="grid gap-8 lg:grid-cols-[.78fr_1.22fr] lg:items-center">
            <div><p className="inline-flex items-center gap-2 font-mono text-[9px] font-bold uppercase tracking-[.16em] text-primary"><WandSparkles className="h-3.5 w-3.5" /> The real outcome</p><h2 id="independence-title" className="mt-3 max-w-[12ch] text-3xl font-black leading-[1] tracking-[-.055em] sm:text-4xl">Become the person who can figure it out.</h2><p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">Support changes as your capability grows. The goal is not to keep you dependent on Forge — it is to make you confident working without it.</p><Link to="/progress" className="mt-5 inline-flex min-h-10 items-center gap-2 text-xs font-bold text-primary hover:underline">Explore your engineering journey <ArrowRight className="h-4 w-4" /></Link></div>
            <div className="grid gap-2 sm:grid-cols-4">
              {[
                { n: "01", title: "Familiarity", role: "Guided", text: "See the shape of things.", color: "#72c4ce" },
                { n: "02", title: "Fluency", role: "Constrained", text: "Make the pieces work.", color: "#ff9a65" },
                { n: "03", title: "Reasoning", role: "Assisted", text: "Defend your decisions.", color: "#e6bd72" },
                { n: "04", title: "Independence", role: "Independent", text: "Own unfamiliar problems.", color: "#a6a0ff" },
              ].map((stage, index) => <div key={stage.n} className="relative rounded-xl border border-border bg-background p-4"><div className="flex items-center justify-between"><span className="font-mono text-[9px]" style={{ color: stage.color }}>{stage.n}</span>{index < 3 && <ArrowRight className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />}</div><h3 className="mt-5 text-sm font-extrabold">{stage.title}</h3><p className="mt-1 font-mono text-[8px] uppercase tracking-[.12em] text-muted-foreground">{stage.role}</p><p className="mt-3 text-[10px] leading-4 text-muted-foreground">{stage.text}</p></div>)}
            </div>
          </div>
        </section>

        <footer className="mt-12 flex flex-col gap-2 border-t border-border pt-5 text-[9px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><span className="font-mono font-bold uppercase tracking-[.15em]">Forge / Playful intelligence. Serious engineering.</span><span>Understand the system. Then make it yours.</span></footer>
      </main>
      <SkillDiagnosticModal open={diagnosticOpen} onOpenChange={setDiagnosticOpen} />
    </div>
  );
}
