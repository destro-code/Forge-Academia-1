import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Atom,
  Braces,
  Bug,
  ChevronRight,
  Clock3,
  Code2,
  Compass,
  FlaskConical,
  Layers3,
  MoveUpRight,
  Sparkles,
  Terminal,
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
        content:
          "Enter the Forge workshop: discover how the web works, experiment with code, build real projects and investigate what breaks.",
      },
    ],
  }),
  component: WorkshopHomePage,
});

const trackMeta: Record<AtelierChapterId, { mark: string; color: string; soft: string; descriptor: string }> = {
  "chapter-html-foundations": {
    mark: "01",
    color: "#72c4ce",
    soft: "rgba(114,196,206,.12)",
    descriptor: "Structure · Semantics · The browser",
  },
  "chapter-css-magic": {
    mark: "02",
    color: "#ff9a65",
    soft: "rgba(255,154,101,.12)",
    descriptor: "Composition · Layout · Responsive craft",
  },
  "chapter-js-adventure": {
    mark: "03",
    color: "#e6bd72",
    soft: "rgba(230,189,114,.12)",
    descriptor: "Logic · Behaviour · Interaction",
  },
  "chapter-react-projects": {
    mark: "04",
    color: "#a6a0ff",
    soft: "rgba(166,160,255,.12)",
    descriptor: "Components · State · Application systems",
  },
};

function WorkshopHomePage() {
  const progress = useProgress();
  const lessons = useLessons();
  const modules = useModules();
  const projects = useProjects();
  const { currentLesson, completedCount, totalLessons } = useCurriculumResume();
  const [diagnosticOpen, setDiagnosticOpen] = useState(false);

  const activeModule = useMemo(() => {
    if (currentLesson?.moduleId) {
      return modules.find((module) => module.id === currentLesson.moduleId) ?? modules[0];
    }
    return modules[0];
  }, [currentLesson, modules]);

  const activeModuleId = activeModule?.id ?? "module-0-1";
  const activeChapterId = useMemo(
    () => findChapterIdForModule(activeModuleId),
    [activeModuleId],
  );
  const chapterFolios = useMemo(
    () => buildAtelierChapterFolios(modules, progress.lessonsCompleted, currentLesson?.id),
    [modules, progress.lessonsCompleted, currentLesson?.id],
  );
  const [selectedChapterId, setSelectedChapterId] = useState<AtelierChapterId>(activeChapterId);

  useEffect(() => {
    setSelectedChapterId(activeChapterId);
  }, [activeChapterId]);

  const selectedFolio =
    chapterFolios.find((folio) => folio.id === selectedChapterId) ?? chapterFolios[0];
  const nextStep = useMemo(
    () =>
      computeGuidedNextStep({
        currentLesson,
        activeModule,
        lessons,
        projects,
        progress,
      }),
    [currentLesson, activeModule, lessons, projects, progress],
  );
  const { activeProject, hasAnyStartedProject } = useMemo(
    () => evaluateAtelierProjects(projects, progress),
    [projects, progress],
  );

  const isNew = completedCount === 0;
  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  })();
  const completionPercent =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const selectedTone = selectedFolio ? trackMeta[selectedFolio.id] : trackMeta["chapter-html-foundations"];

  const handleSelectChapter = (chapterId: AtelierChapterId) => {
    setSelectedChapterId(chapterId);
  };

  return (
    <div className="forge-workshop min-h-dvh overflow-x-clip bg-background text-foreground">
      <AtelierTopNav onOpenDiagnostic={() => setDiagnosticOpen(true)} />

      <main className="relative mx-auto w-full max-w-[1480px] px-4 pb-20 pt-7 sm:px-6 sm:pt-10 lg:px-10 lg:pt-12">
        <div className="pointer-events-none absolute inset-x-4 top-0 -z-0 h-[680px] opacity-60 sm:inset-x-6 lg:inset-x-10" aria-hidden="true">
          <div className="absolute right-0 top-0 h-[520px] w-[520px] rounded-full" style={{ background: "radial-gradient(circle, rgba(244,119,53,.09), transparent 68%)" }} />
          <div className="absolute left-0 top-28 h-[380px] w-[380px] rounded-full" style={{ background: "radial-gradient(circle, rgba(114,196,206,.07), transparent 70%)" }} />
        </div>

        <div className="relative z-10">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
            <div className="flex items-center gap-3 font-mono text-[10px] font-semibold uppercase tracking-[.2em] text-muted-foreground">
              <span className="inline-flex h-2 w-2 rounded-full bg-[#72c4ce] shadow-[0_0_0_4px_rgba(114,196,206,.12)]" />
              <span>Forge / Workshop</span>
              <span className="text-border">—</span>
              <span>Field notes 001</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.14em] text-muted-foreground">
              <span className="hidden sm:inline">A place to think with your hands</span>
              <span className="text-primary">●</span>
              <span>Open session</span>
            </div>
          </div>

          <section className="forge-home-hero relative grid min-h-[540px] items-center gap-8 pb-10 lg:grid-cols-[.92fr_1.08fr] lg:gap-5 lg:pb-14" aria-labelledby="workshop-title">
            <div className="relative z-10 max-w-[650px] py-5 lg:py-12">
              <p className="mb-6 flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[.2em] text-primary">
                <span className="h-px w-9 bg-primary" />
                {isNew ? "Your first experiment starts here" : greeting + ", builder"}
              </p>
              <h1 id="workshop-title" className="max-w-[10ch] text-balance font-display text-[clamp(3.8rem,8vw,7.8rem)] font-black leading-[.84] tracking-[-.085em] text-foreground">
                Make the
                <span className="block text-primary">web make</span>
                <span className="block">sense<span className="text-[#72c4ce]">.</span></span>
              </h1>
              <p className="mt-8 max-w-[490px] text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                A creative engineering workshop for people who want to know what is happening beneath the interface — and learn to shape it themselves.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to={nextStep.to as never}
                  params={nextStep.params as never}
                  search={nextStep.search as never}
                  className="group inline-flex min-h-14 items-center gap-4 bg-primary px-5 py-3 text-sm font-extrabold text-primary-foreground transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <span>{isNew ? "Begin your first discovery" : nextStep.ctaLabel}</span>
                  <span className="grid h-8 w-8 place-items-center bg-[#202329]/10 transition-transform group-hover:translate-x-1">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setDiagnosticOpen(true)}
                  className="inline-flex min-h-14 items-center gap-2 border border-border px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <Compass className="h-4 w-4" />
                  Find my level
                </button>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-border/80 pt-5">
                <div>
                  <span className="block font-mono text-2xl font-bold tracking-tight text-foreground">{modules.length}</span>
                  <span className="mt-1 block text-[9px] font-bold uppercase tracking-[.17em] text-muted-foreground">Learning modules</span>
                </div>
                <div className="h-9 w-px bg-border" />
                <div>
                  <span className="block font-mono text-2xl font-bold tracking-tight text-foreground">{totalLessons}</span>
                  <span className="mt-1 block text-[9px] font-bold uppercase tracking-[.17em] text-muted-foreground">Lessons to explore</span>
                </div>
                <div className="h-9 w-px bg-border" />
                <div>
                  <span className="block font-mono text-2xl font-bold tracking-tight text-foreground">{projects.length}</span>
                  <span className="mt-1 block text-[9px] font-bold uppercase tracking-[.17em] text-muted-foreground">Build briefs</span>
                </div>
              </div>
            </div>

            <div className="forge-home-system relative mx-auto flex min-h-[410px] w-full max-w-[700px] items-center justify-center lg:min-h-[570px]" aria-label="An illustration of connected web technologies">
              <div className="absolute inset-0" aria-hidden="true">
                <div className="forge-home-orbit forge-home-orbit-a" />
                <div className="forge-home-orbit forge-home-orbit-b" />
                <div className="forge-home-orbit forge-home-orbit-c" />
                <div className="forge-home-cross forge-home-cross-x" />
                <div className="forge-home-cross forge-home-cross-y" />
              </div>

              <svg viewBox="0 0 640 560" className="relative z-10 h-auto w-full max-w-[650px] overflow-visible" fill="none" role="img" aria-labelledby="system-art-title">
                <title id="system-art-title">A connected system of HTML, CSS, JavaScript and React around a central browser window</title>
                <defs>
                  <linearGradient id="forge-core" x1="170" y1="140" x2="470" y2="430" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#343d46" />
                    <stop offset="1" stopColor="#171a1f" />
                  </linearGradient>
                  <linearGradient id="forge-face" x1="240" y1="175" x2="430" y2="380" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#ffad7c" />
                    <stop offset="1" stopColor="#e9682f" />
                  </linearGradient>
                  <filter id="forge-shadow" x="90" y="80" width="470" height="430" filterUnits="userSpaceOnUse">
                    <feGaussianBlur stdDeviation="22" />
                  </filter>
                </defs>

                <circle cx="320" cy="280" r="205" stroke="currentColor" strokeOpacity=".12" strokeDasharray="2 10" />
                <circle cx="320" cy="280" r="164" stroke="#72c4ce" strokeOpacity=".24" strokeDasharray="4 8" />
                <path d="M111 280H529M320 64V496" stroke="currentColor" strokeOpacity=".12" strokeDasharray="3 8" />
                <path d="M164 132L252 190M476 132L388 190M164 428L252 370M476 428L388 370" stroke="#72c4ce" strokeOpacity=".55" strokeWidth="1.5" />
                <path d="M320 84V145M320 415V476M124 280H184M456 280H516" stroke="#ff874a" strokeOpacity=".7" strokeWidth="2" />
                <circle cx="320" cy="280" r="132" fill="#ff874a" fillOpacity=".09" filter="url(#forge-shadow)" />

                <g className="forge-home-core">
                  <path d="M206 184L320 124L434 184V376L320 436L206 376V184Z" fill="url(#forge-core)" stroke="#68747e" strokeOpacity=".65" strokeWidth="1.5" />
                  <path d="M206 184L320 244L434 184" stroke="#72c4ce" strokeOpacity=".8" strokeWidth="1.5" />
                  <path d="M320 244V436" stroke="#68747e" strokeOpacity=".65" strokeWidth="1.5" />
                  <path d="M206 184L320 244L320 436L206 376V184Z" fill="#252d35" fillOpacity=".9" />
                  <path d="M320 244L434 184V376L320 436V244Z" fill="#171d23" fillOpacity=".8" />
                  <rect x="247" y="218" width="146" height="124" rx="4" fill="#111519" stroke="#66727d" strokeOpacity=".7" />
                  <path d="M247 237H393" stroke="#66727d" strokeOpacity=".55" />
                  <circle cx="260" cy="228" r="2.7" fill="#ff874a" />
                  <circle cx="270" cy="228" r="2.7" fill="#e6bd72" />
                  <circle cx="280" cy="228" r="2.7" fill="#72c4ce" />
                  <path d="M266 261L278 273L266 285M294 261L282 273L294 285" stroke="#72c4ce" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M310 292L332 254" stroke="#ff9a65" strokeWidth="3" strokeLinecap="round" />
                  <path d="M348 262H373M348 278H367M348 294H377" stroke="#aab2ba" strokeOpacity=".8" strokeWidth="3" strokeLinecap="round" />
                  <path d="M268 312H369" stroke="#66727d" strokeOpacity=".65" strokeWidth="2" />
                  <path d="M280 325H352" stroke="#66727d" strokeOpacity=".4" strokeWidth="2" />
                  <path d="M320 124L320 160" stroke="#ff874a" strokeWidth="2" />
                  <circle cx="320" cy="119" r="6" fill="#ff874a" />
                </g>

                <g>
                  <path d="M103 104L153 130L177 174" stroke="#72c4ce" strokeWidth="1.5" />
                  <circle cx="103" cy="104" r="30" fill="#1d343a" stroke="#72c4ce" strokeWidth="1.5" />
                  <text x="103" y="109" textAnchor="middle" fill="#bde7e8" fontSize="13" fontFamily="monospace" fontWeight="700">HTML</text>
                  <circle cx="177" cy="174" r="4" fill="#72c4ce" />
                  <path d="M537 104L487 130L463 174" stroke="#ff9a65" strokeWidth="1.5" />
                  <circle cx="537" cy="104" r="30" fill="#3b2921" stroke="#ff9a65" strokeWidth="1.5" />
                  <text x="537" y="109" textAnchor="middle" fill="#ffd0b5" fontSize="13" fontFamily="monospace" fontWeight="700">CSS</text>
                  <circle cx="463" cy="174" r="4" fill="#ff9a65" />
                  <path d="M103 456L153 430L177 386" stroke="#e6bd72" strokeWidth="1.5" />
                  <circle cx="103" cy="456" r="30" fill="#3a3323" stroke="#e6bd72" strokeWidth="1.5" />
                  <text x="103" y="461" textAnchor="middle" fill="#f0d49e" fontSize="12" fontFamily="monospace" fontWeight="700">JS</text>
                  <circle cx="177" cy="386" r="4" fill="#e6bd72" />
                  <path d="M537 456L487 430L463 386" stroke="#a6a0ff" strokeWidth="1.5" />
                  <circle cx="537" cy="456" r="30" fill="#2e2b4b" stroke="#a6a0ff" strokeWidth="1.5" />
                  <text x="537" y="461" textAnchor="middle" fill="#d2ceff" fontSize="12" fontFamily="monospace" fontWeight="700">UI</text>
                  <circle cx="463" cy="386" r="4" fill="#a6a0ff" />
                </g>

                <g>
                  <rect x="250" y="70" width="140" height="30" rx="15" fill="#202a31" stroke="#4a5964" />
                  <circle cx="266" cy="85" r="4" fill="#83b99a" />
                  <text x="280" y="89" fill="#d8e0e4" fontSize="9" fontFamily="monospace" letterSpacing="1.4">SYSTEM ONLINE</text>
                  <rect x="224" y="474" width="192" height="30" rx="15" fill="#202a31" stroke="#4a5964" />
                  <text x="320" y="493" textAnchor="middle" fill="#aab2ba" fontSize="9" fontFamily="monospace" letterSpacing="1.1">STRUCTURE → STYLE → BEHAVIOUR</text>
                </g>
              </svg>

              <div className="absolute bottom-2 left-2 z-20 hidden border-l-2 border-primary pl-3 sm:block">
                <p className="font-mono text-[9px] uppercase tracking-[.18em] text-muted-foreground">System study / 001</p>
                <p className="mt-1 text-xs font-semibold text-foreground">The interface is only the surface.</p>
              </div>
              <div className="absolute right-1 top-5 z-20 hidden rotate-90 origin-right font-mono text-[9px] uppercase tracking-[.22em] text-muted-foreground sm:block">Observe / Connect / Understand</div>
            </div>
          </section>

          <div className="forge-home-ribbon mb-20 flex flex-wrap items-center justify-between gap-x-5 gap-y-3 border-y border-border py-4">
            {[
              { label: "01", name: "Discover", icon: Compass },
              { label: "02", name: "Experiment", icon: FlaskConical },
              { label: "03", name: "Create", icon: Layers3 },
              { label: "04", name: "Investigate", icon: Bug },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex min-w-[130px] flex-1 items-center gap-3">
                  <span className="font-mono text-[10px] text-primary">{item.label}</span>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-bold tracking-tight text-foreground">{item.name}</span>
                  {index < 3 && <span className="ml-auto hidden text-border sm:inline">/</span>}
                </div>
              );
            })}
          </div>

          <section className="mb-24" aria-labelledby="next-discovery-title">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-primary">The thread to pick up</p>
                <h2 className="mt-2 font-display text-3xl font-black tracking-[-.055em] text-foreground sm:text-4xl">Your next discovery.</h2>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">Recommended / based on your learning state</span>
            </div>

            <div className="forge-next-discovery relative overflow-hidden border border-border">
              <div className="absolute inset-y-0 left-0 w-1.5 bg-primary" aria-hidden="true" />
              <div className="grid gap-0 lg:grid-cols-[1fr_300px]">
                <div className="relative p-6 pl-8 sm:p-8 sm:pl-10">
                  <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[.15em] text-muted-foreground">
                    <span className="inline-flex items-center gap-2 text-primary"><span className="h-1.5 w-1.5 rounded-full bg-primary" />{nextStep.eyebrow}</span>
                    <span className="text-border">/</span>
                    <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3 w-3" />{nextStep.estimatedMinutes} min</span>
                  </div>
                  <h3 id="next-discovery-title" className="mt-5 max-w-2xl font-display text-2xl font-black leading-tight tracking-[-.045em] text-foreground sm:text-3xl">{nextStep.title}</h3>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground"><span className="font-bold text-foreground">Why this matters: </span>{nextStep.reason}</p>
                  <Link
                    to={nextStep.to as never}
                    params={nextStep.params as never}
                    search={nextStep.search as never}
                    className="mt-7 inline-flex min-h-12 items-center gap-3 border-b-2 border-primary pb-1 text-sm font-extrabold text-foreground transition-colors hover:text-primary"
                  >
                    {nextStep.ctaLabel}<MoveUpRight className="h-4 w-4 text-primary" />
                  </Link>
                </div>
                <div className="forge-discovery-side relative flex min-h-[170px] flex-col justify-between overflow-hidden border-t border-border p-6 lg:border-l lg:border-t-0">
                  <div className="relative z-10 flex items-center justify-between font-mono text-[9px] uppercase tracking-[.17em] text-muted-foreground"><span>Current signal</span><Sparkles className="h-4 w-4 text-primary" /></div>
                  <div className="relative z-10 mt-8">
                    <p className="font-display text-5xl font-black tracking-[-.07em] text-foreground">{String(completedCount).padStart(2, "0")}<span className="text-primary">/</span>{String(totalLessons).padStart(2, "0")}</p>
                    <p className="mt-2 font-mono text-[9px] uppercase tracking-[.15em] text-muted-foreground">Lessons completed</p>
                  </div>
                  <div className="relative z-10 mt-5 h-1 w-full bg-border"><div className="h-full bg-primary" style={{ width: completionPercent + "%" }} /></div>
                  <span className="relative z-10 mt-2 text-right font-mono text-[10px] text-muted-foreground">{completionPercent}% through authored lessons</span>
                  <div className="forge-discovery-mark absolute -bottom-14 -right-10 h-52 w-52 rounded-full border border-primary/20" aria-hidden="true" />
                  <div className="forge-discovery-mark absolute -bottom-7 -right-3 h-36 w-36 rounded-full border border-primary/20" aria-hidden="true" />
                </div>
              </div>
            </div>
          </section>

          <section className="mb-24" aria-labelledby="pathway-title">
            <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-primary">The map is not the territory</p>
                <h2 id="pathway-title" className="mt-2 max-w-3xl font-display text-3xl font-black tracking-[-.055em] text-foreground sm:text-5xl">Explore the systems<br className="hidden sm:block" /> behind the screen.</h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">Four connected disciplines. Follow the recommended route, jump into a subject or trace a concept back to its foundations.</p>
              </div>
              <Link to="/learn/modules" className="inline-flex min-h-11 items-center gap-2 self-start border-b border-border text-xs font-bold text-foreground transition-colors hover:border-primary hover:text-primary lg:self-end">Open full curriculum map <ArrowUpRight className="h-4 w-4" /></Link>
            </div>

            <div className="forge-path-map relative">
              <div className="forge-path-spine absolute bottom-8 left-[25px] top-8 hidden w-px bg-border md:block" aria-hidden="true" />
              <div className="grid gap-0 md:grid-cols-[minmax(250px,.78fr)_minmax(0,1.22fr)]">
                <div className="forge-track-list relative z-10 flex flex-col border-y border-border">
                  {chapterFolios.map((folio, index) => {
                    const tone = trackMeta[folio.id];
                    const selected = folio.id === selectedChapterId;
                    const percent = Math.min(100, Math.round((folio.completedLessonsCount / Math.max(folio.totalAuthoredLessonsCount, 1)) * 100));
                    const Icon = index === 0 ? Code2 : index === 1 ? Layers3 : index === 2 ? Braces : Atom;
                    return (
                      <button
                        key={folio.id}
                        type="button"
                        onClick={() => handleSelectChapter(folio.id)}
                        aria-pressed={selected}
                        className={"forge-track-button group relative flex min-h-[116px] items-center gap-4 border-b border-border px-4 py-5 text-left transition-colors last:border-b-0 sm:px-5 " + (selected ? "is-selected" : "")}
                        style={{ "--track-accent": tone.color, "--track-soft": tone.soft } as CSSProperties}
                      >
                        <span className="forge-track-index relative z-10 grid h-12 w-12 shrink-0 place-items-center border border-border bg-background font-mono text-xs font-bold text-muted-foreground transition-colors">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[.16em] text-muted-foreground">Track {folio.numberLabel}<span className="text-border">/</span>{folio.modules.length} modules</span>
                          <span className="mt-1 block font-display text-lg font-black tracking-[-.03em] text-foreground sm:text-xl">{folio.shortTitle}</span>
                          <span className="mt-1 block text-[11px] text-muted-foreground">{folio.completedLessonsCount} of {folio.totalAuthoredLessonsCount} lessons</span>
                          <span className="mt-3 block h-[3px] w-full max-w-[220px] bg-border"><span className="block h-full transition-[width] duration-300" style={{ width: percent + "%", backgroundColor: tone.color }} /></span>
                        </span>
                        <ChevronRight className={"h-4 w-4 shrink-0 transition-transform " + (selected ? "translate-x-1" : "text-muted-foreground group-hover:translate-x-1")} style={{ color: selected ? tone.color : undefined }} />
                      </button>
                    );
                  })}
                </div>

                <div className="forge-track-detail relative min-h-[420px] overflow-hidden border-b border-border p-5 sm:p-7 md:border-l md:border-t md:border-b-0 md:p-8" style={{ "--track-accent": selectedTone.color, "--track-soft": selectedTone.soft } as CSSProperties}>
                  <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border opacity-40" style={{ borderColor: selectedTone.color }} aria-hidden="true" />
                  <div className="pointer-events-none absolute -right-7 -top-7 h-40 w-40 rounded-full border border-dashed opacity-30" style={{ borderColor: selectedTone.color }} aria-hidden="true" />
                  {selectedFolio ? (
                    <>
                      <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="font-mono text-[10px] font-bold uppercase tracking-[.18em]" style={{ color: selectedTone.color }}>Track {selectedFolio.numberLabel} / Field of study</p>
                          <h3 className="mt-3 max-w-[15ch] font-display text-3xl font-black leading-[.98] tracking-[-.055em] text-foreground sm:text-4xl">{selectedFolio.title}</h3>
                          <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">{selectedFolio.subtitle}</p>
                        </div>
                        <div className="relative z-10 grid h-16 w-16 place-items-center border" style={{ color: selectedTone.color, borderColor: selectedTone.color, backgroundColor: selectedTone.soft }}>
                          <span className="font-mono text-2xl font-bold">{selectedFolio.numberLabel}</span>
                        </div>
                      </div>
                      <p className="relative z-10 mt-8 font-mono text-[9px] uppercase tracking-[.17em] text-muted-foreground">{selectedTone.descriptor}</p>
                      <div className="relative z-10 mt-4 divide-y divide-border border-y border-border">
                        {selectedFolio.modules.map((module, index) => {
                          const firstLessonId = module.authoredLessons[0]?.id;
                          const percent = Math.min(100, Math.round((module.completedCount / Math.max(module.totalAuthoredCount, 1)) * 100));
                          return (
                            <div key={module.id} className="group flex flex-wrap items-center gap-3 py-4">
                              <span className="w-7 shrink-0 font-mono text-[10px] text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                              <div className="min-w-0 flex-1">
                                <Link to="/learn/modules/$moduleId" params={{ moduleId: module.id }} className="font-display text-sm font-bold text-foreground transition-colors hover:text-primary">{module.title}</Link>
                                <p className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">{module.description}</p>
                              </div>
                              <span className="hidden w-16 text-right font-mono text-[9px] text-muted-foreground sm:block">{module.completedCount}/{module.totalAuthoredCount}</span>
                              <span className="h-[2px] w-12 bg-border sm:w-16"><span className="block h-full" style={{ width: percent + "%", backgroundColor: selectedTone.color }} /></span>
                              {firstLessonId ? (
                                <Link to="/lesson/$lessonId" params={{ lessonId: firstLessonId }} aria-label={"Start " + module.title} className="grid h-9 w-9 shrink-0 place-items-center border border-border text-muted-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"><ArrowUpRight className="h-4 w-4" /></Link>
                              ) : (
                                <Link to="/learn/modules/$moduleId" params={{ moduleId: module.id }} aria-label={"Open " + module.title} className="grid h-9 w-9 shrink-0 place-items-center border border-border text-muted-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"><ArrowUpRight className="h-4 w-4" /></Link>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div className="relative z-10 mt-5 flex flex-wrap items-center justify-between gap-3">
                        <span className="font-mono text-[9px] uppercase tracking-[.14em] text-muted-foreground">{selectedFolio.estimatedHours} estimated hours · {selectedFolio.totalAuthoredLessonsCount} lessons</span>
                        <Link to="/learn/modules" search={{ track: selectedFolio.id }} className="inline-flex min-h-10 items-center gap-2 text-xs font-bold" style={{ color: selectedTone.color }}>Explore this track <ArrowRight className="h-3.5 w-3.5" /></Link>
                      </div>
                    </>
                  ) : (
                    <div className="flex min-h-[340px] items-center justify-center text-sm text-muted-foreground">Curriculum map is loading.</div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="mb-24" aria-labelledby="workbench-title">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-primary">Beyond the lesson</p>
                <h2 id="workbench-title" className="mt-2 font-display text-3xl font-black tracking-[-.055em] text-foreground sm:text-5xl">Make. Break. Understand.</h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">The workshop opens into different kinds of work. Pick the tool that matches the question you are trying to answer.</p>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[.15em] text-muted-foreground">Three ways to work</span>
            </div>

            <div className="grid gap-0 border-y border-border lg:grid-cols-[1.25fr_.75fr]">
              <div className="forge-workbench-project relative flex min-h-[350px] flex-col justify-between overflow-hidden border-b border-border p-6 sm:p-8 lg:border-b-0 lg:border-r">
                <div className="pointer-events-none absolute right-0 top-0 h-full w-[55%] opacity-70" aria-hidden="true">
                  <svg viewBox="0 0 360 340" className="h-full w-full" fill="none">
                    <path d="M180 20L320 92V250L180 322L40 250V92L180 20Z" stroke="#ff9a65" strokeOpacity=".45" />
                    <path d="M180 62L280 113V229L180 280L80 229V113L180 62Z" stroke="#ff9a65" strokeOpacity=".35" strokeDasharray="4 6" />
                    <path d="M180 102L244 135V207L180 240L116 207V135L180 102Z" fill="#ff874a" fillOpacity=".1" stroke="#ff9a65" />
                    <path d="M116 135L180 168L244 135M180 168V240" stroke="#ff9a65" strokeOpacity=".7" />
                    <path d="M180 102V62M244 135L280 113M116 135L80 113M180 240V280" stroke="#72c4ce" strokeOpacity=".8" />
                    <circle cx="180" cy="20" r="5" fill="#ff874a" />
                    <circle cx="320" cy="92" r="5" fill="#72c4ce" />
                    <circle cx="40" cy="92" r="5" fill="#e6bd72" />
                    <circle cx="180" cy="322" r="5" fill="#ff874a" />
                  </svg>
                </div>
                <div className="relative z-10 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[.17em] text-[#ffb38c]"><Layers3 className="h-4 w-4" /> Project workshop <span className="text-white/30">/ 01</span></div>
                <div className="relative z-10 mt-16 max-w-[490px]">
                  <p className="font-mono text-[9px] uppercase tracking-[.16em] text-[#aab2ba]">{activeProject ? (hasAnyStartedProject ? "Your current build" : "A place to start") : "Choose a build brief"}</p>
                  <h3 className="mt-3 font-display text-3xl font-black leading-[1] tracking-[-.05em] text-white sm:text-4xl">{activeProject?.project.title ?? "Your next real-world build"}</h3>
                  <p className="mt-3 max-w-md text-sm leading-6 text-[#c6cbd0]">{activeProject?.project.description ?? "Choose a project brief and turn what you have learned into a working piece of software."}</p>
                  {activeProject && <div className="mt-5 flex items-center gap-4 font-mono text-[10px] text-[#c6cbd0]"><span>{activeProject.completedTasks}/{activeProject.totalTasks} tasks</span><span className="h-1 w-1 rounded-full bg-[#ff9a65]" /><span>{activeProject.completionPercent}% progress</span></div>}
                </div>
                {activeProject ? (
                  <Link to="/projects/$projectId" params={{ projectId: activeProject.project.id }} className="relative z-10 mt-8 inline-flex min-h-12 w-fit items-center gap-3 border-b border-[#ff9a65] pb-1 text-sm font-extrabold text-white transition-colors hover:text-[#ffb38c]">
                    {hasAnyStartedProject ? "Return to your build" : "Explore this project"}<ArrowUpRight className="h-4 w-4 text-[#ff9a65]" />
                  </Link>
                ) : (
                  <Link to="/projects" className="relative z-10 mt-8 inline-flex min-h-12 w-fit items-center gap-3 border-b border-[#ff9a65] pb-1 text-sm font-extrabold text-white transition-colors hover:text-[#ffb38c]">
                    Explore project briefs<ArrowUpRight className="h-4 w-4 text-[#ff9a65]" />
                  </Link>
                )}
              </div>

              <div className="grid grid-rows-2">
                <Link to="/playground" className="forge-workbench-tool group relative flex min-h-[210px] flex-col justify-between overflow-hidden border-b border-border p-6 transition-colors hover:bg-accent/30 sm:p-8">
                  <div className="pointer-events-none absolute -right-4 -top-8 rotate-[-12deg] text-primary/10 transition-transform duration-500 group-hover:rotate-0 group-hover:scale-110" aria-hidden="true"><Terminal className="h-44 w-44 stroke-[.7]" /></div>
                  <div className="relative z-10 flex items-center justify-between"><span className="font-mono text-[10px] uppercase tracking-[.17em] text-muted-foreground">Experiment / 02</span><MoveUpRight className="h-5 w-5 text-primary transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" /></div>
                  <div className="relative z-10 mt-8">
                    <h3 className="font-display text-2xl font-black tracking-[-.04em] text-foreground">The Playground</h3>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Change the code. Observe the result. Find out what actually matters.</p>
                  </div>
                </Link>
                <Link to="/debug-lab" className="forge-workbench-tool group relative flex min-h-[210px] flex-col justify-between overflow-hidden p-6 transition-colors hover:bg-accent/30 sm:p-8">
                  <div className="pointer-events-none absolute -right-4 -top-8 rotate-[-12deg] text-[#72c4ce]/10 transition-transform duration-500 group-hover:rotate-0 group-hover:scale-110" aria-hidden="true"><Bug className="h-44 w-44 stroke-[.7]" /></div>
                  <div className="relative z-10 flex items-center justify-between"><span className="font-mono text-[10px] uppercase tracking-[.17em] text-muted-foreground">Investigation / 03</span><MoveUpRight className="h-5 w-5 text-[#72c4ce] transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" /></div>
                  <div className="relative z-10 mt-8">
                    <h3 className="font-display text-2xl font-black tracking-[-.04em] text-foreground">The Debug Lab</h3>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Follow the evidence, test a theory and explain the behaviour.</p>
                  </div>
                </Link>
              </div>
            </div>
          </section>

          <section className="forge-home-journey relative overflow-hidden border border-border p-6 sm:p-9" aria-labelledby="journey-title">
            <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full border border-primary/15" aria-hidden="true" />
            <div className="pointer-events-none absolute -right-8 -top-16 h-52 w-52 rounded-full border border-dashed border-[#72c4ce]/25" aria-hidden="true" />
            <div className="relative z-10 grid gap-8 lg:grid-cols-[.75fr_1.25fr] lg:items-center">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-primary">The point of all this</p>
                <h2 id="journey-title" className="mt-3 max-w-[11ch] font-display text-3xl font-black leading-[.98] tracking-[-.055em] text-foreground sm:text-4xl">Not more lessons. More independence.</h2>
                <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">Forge changes the kind of help it gives as your engineering judgement grows. The goal is to make the workshop less necessary over time.</p>
                <Link to="/progress" className="mt-6 inline-flex min-h-10 items-center gap-2 text-xs font-bold text-primary hover:underline">See your capability map <ArrowRight className="h-4 w-4" /></Link>
              </div>
              <div className="forge-stage-line relative grid gap-0 sm:grid-cols-4">
                {[
                  { n: "01", title: "Familiarity", role: "Guide", text: "See the shape of things.", tone: "#72c4ce" },
                  { n: "02", title: "Fluency", role: "Collaborator", text: "Make the pieces work.", tone: "#ff9a65" },
                  { n: "03", title: "Reasoning", role: "Challenger", text: "Defend your decisions.", tone: "#e6bd72" },
                  { n: "04", title: "Independence", role: "Observer", text: "Own unfamiliar problems.", tone: "#a6a0ff" },
                ].map((stage, index) => (
                  <div key={stage.n} className="relative border-l border-border py-3 pl-5 sm:border-l-0 sm:border-t sm:pl-0 sm:pt-6">
                    <span className="absolute -left-[5px] top-4 h-2.5 w-2.5 rounded-full border-2 border-background sm:-top-[5px] sm:left-0" style={{ backgroundColor: stage.tone }} />
                    <span className="font-mono text-[10px]" style={{ color: stage.tone }}>{stage.n} / {stage.role}</span>
                    <h3 className="mt-3 font-display text-lg font-black tracking-[-.035em] text-foreground">{stage.title}</h3>
                    <p className="mt-2 max-w-[150px] text-xs leading-5 text-muted-foreground">{stage.text}</p>
                    {index < 3 && <ArrowDownRight className="absolute bottom-2 right-3 hidden h-4 w-4 text-muted-foreground/50 sm:block" />}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <footer className="mt-16 flex flex-col gap-3 border-t border-border pt-6 text-[10px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span className="font-mono uppercase tracking-[.16em]">Forge / Playful intelligence. Serious engineering.</span>
            <span>Understand the system. Then make it yours.</span>
          </footer>
        </div>
      </main>

      <SkillDiagnosticModal open={diagnosticOpen} onOpenChange={setDiagnosticOpen} />
    </div>
  );
}
