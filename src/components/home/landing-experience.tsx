import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Braces, Bug, Compass, FlaskConical, Layers3, Play, Route, Workflow } from "lucide-react";
import { useModules, useProjects } from "@/lib/hooks/use-content";
import { useCurriculumResume } from "@/lib/utils/curriculum-order";

interface LandingExperienceProps {
  onOpenDiagnostic: () => void;
  onSwitchToDashboard?: () => void;
}

const heroModes = [
  {
    id: "discover", label: "Discover", index: "01", eyebrow: "REVEAL THE SYSTEM",
    heading: "A page is more than what you see.",
    copy: "Explore the structure, styles and behaviour working together beneath a web interface.",
    code: ["<main>", "  <h1>Make it make sense</h1>", "  <button>Explore</button>", "</main>"],
    result: "Structure becomes visible",
  },
  {
    id: "experiment", label: "Experiment", index: "02", eyebrow: "CHANGE ONE THING",
    heading: "Make a change. Watch what moves.",
    copy: "Adjust a value, test a prediction and observe how a small decision changes the result.",
    code: ["const layout = {", '  display: "grid",', '  gap: "16px",', "};"],
    result: "A change produces evidence",
  },
  {
    id: "investigate", label: "Investigate", index: "03", eyebrow: "FOLLOW THE EVIDENCE",
    heading: "Unexpected behaviour has a reason.",
    copy: "Compare what you expected with what happened, then find the cause instead of guessing.",
    code: ["const expected = 200;", "const actual = 180;", "if (actual !== expected) {", "  inspectLayout();", "}"],
    result: "The cause becomes explainable",
  },
] as const;

const learningModes = [
  { number: "01", title: "Discover", description: "Uncover how browser technologies and frontend systems fit together.", icon: Compass },
  { number: "02", title: "Experiment", description: "Change code, make predictions and observe the consequences.", icon: FlaskConical },
  { number: "03", title: "Create", description: "Turn understanding into interfaces and working projects.", icon: Layers3 },
  { number: "04", title: "Investigate", description: "Trace unexpected behaviour, debug it and explain the result.", icon: Bug },
] as const;

const journeyStages = [
  { name: "Familiarity", detail: "Understand the foundations", step: "01" },
  { name: "Fluency", detail: "Apply what you know", step: "02" },
  { name: "Reasoning", detail: "Make and defend decisions", step: "03" },
  { name: "Independence", detail: "Solve unfamiliar problems", step: "04" },
] as const;

const destinations = [
  { title: "Learning paths", description: "Move through concepts with a clear route and room to explore.", to: "/learn/modules", label: "Explore curriculum", icon: Route },
  { title: "Playground", description: "Work directly with code in an environment made for experimentation.", to: "/playground", label: "Open Playground", icon: Braces },
  { title: "Projects", description: "Apply your understanding to meaningful pieces of software.", to: "/projects", label: "Explore projects", icon: Layers3 },
  { title: "Debug Lab", description: "Investigate bugs and practise reasoning from evidence.", to: "/debug-lab", label: "Enter Debug Lab", icon: Bug },
] as const;

export function LandingExperience({ onOpenDiagnostic, onSwitchToDashboard }: LandingExperienceProps) {
  const modules = useModules();
  const projects = useProjects();
  const { currentLesson, completedCount, totalLessons } = useCurriculumResume();
  const [activeMode, setActiveMode] = useState<(typeof heroModes)[number]["id"]>("discover");
  const active = heroModes.find((mode) => mode.id === activeMode) ?? heroModes[0];
  const startLessonId = currentLesson?.id || "lesson-0-1-1";

  return (
    <div className="w-full min-w-0 space-y-20 pb-8 sm:space-y-24">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: [0.2, 0.7, 0.2, 1] }}
        className="forge-landing-hero relative isolate overflow-hidden rounded-[24px] border border-border px-5 py-8 sm:rounded-[30px] sm:px-9 sm:py-11 lg:px-14 lg:py-14"
      >
        <div className="forge-landing-orbit forge-landing-orbit--one" aria-hidden="true" />
        <div className="forge-landing-orbit forge-landing-orbit--two" aria-hidden="true" />
        <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/85 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.13em] text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Frontend engineering, learned by doing
            </div>
            <h1 className="max-w-[12ch] text-balance font-display text-[clamp(2.6rem,6vw,4.8rem)] font-extrabold leading-[0.99] tracking-[-0.065em] text-foreground">
              Understand the web.<span className="block text-primary">Build with intent.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              Learn how frontend systems work by exploring ideas, experimenting with code,
              building real projects and investigating what happens when things break.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/lesson/$lessonId" params={{ lessonId: startLessonId }} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
                {completedCount > 0 ? "Continue learning" : "Start learning"}<ArrowRight className="h-4 w-4" />
              </Link>
              <button type="button" onClick={onOpenDiagnostic} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/60 hover:bg-muted">
                <Compass className="h-4 w-4 text-primary" />Find my starting point
              </button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-5 text-xs text-muted-foreground">
              <span><strong className="font-mono text-foreground">{modules.length || "—"}</strong> learning modules</span>
              <span><strong className="font-mono text-foreground">{totalLessons || "—"}</strong> lessons</span>
              <span><strong className="font-mono text-foreground">{projects.length || "—"}</strong> projects</span>
              {completedCount > 0 && <button type="button" onClick={onSwitchToDashboard} className="font-semibold text-primary hover:underline">{completedCount} lessons completed · View progress</button>}
            </div>
          </div>

          <div className="forge-landing-visual relative min-w-0 overflow-hidden rounded-[20px] border border-white/10 p-4 text-[#F1F0EB] shadow-elegant sm:p-5">
            <div className="absolute right-[-44px] top-[-62px] h-48 w-48 rounded-full border border-white/10" aria-hidden="true" />
            <div className="absolute right-[-10px] top-[-28px] h-32 w-32 rounded-full border border-dashed border-white/15" aria-hidden="true" />
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#AAB2BA]">Forge / Workbench</p><p className="mt-1 text-sm font-semibold text-white">See the system differently</p></div>
              <span className="rounded-md border border-white/15 bg-white/5 px-2.5 py-1 font-mono text-[10px] text-[#BDE7E8]">INTERACTIVE PREVIEW</span>
            </div>
            <div className="relative z-10 mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Explore how Forge teaches">
              {heroModes.map((mode) => <button key={mode.id} type="button" role="tab" aria-selected={activeMode === mode.id} onClick={() => setActiveMode(mode.id)} className="min-h-10 rounded-lg border px-3 text-xs font-semibold transition-colors" data-active={activeMode === mode.id}>{mode.label}</button>)}
            </div>
            <div className="relative z-10 mt-5 grid gap-4 sm:grid-cols-[1fr_0.78fr]">
              <div className="min-w-0 rounded-xl border border-white/10 bg-[#111519] p-4">
                <div className="mb-4 flex items-center justify-between gap-2"><span className="font-mono text-[10px] text-[#AAB2BA]">experiment.{activeMode === "discover" ? "html" : activeMode === "experiment" ? "css" : "js"}</span><span className="font-mono text-[10px] text-[#83B99A]">● Ready to explore</span></div>
                <div className="mb-4 font-mono text-[10px] tracking-[0.14em] text-[#FFAA7E]">{active.index} / {active.eyebrow}</div>
                <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-[11px] leading-[1.9] sm:text-xs"><code>{active.code.map((line, index) => <span key={active.id + "-" + index} className={line.includes("button") || line.includes("gap") || line.includes("if") ? "text-[#FFAA7E]" : line.includes("main") || line.includes("grid") || line.includes("actual") ? "text-[#72C4CE]" : "text-[#E7E6E0]"}>{line}{"\n"}</span>)}</code></pre>
              </div>
              <div className="flex min-w-0 flex-col justify-between gap-4">
                <div><p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#72C4CE]">{active.index} / Observation</p><h2 className="mt-3 text-lg font-bold leading-tight tracking-tight text-white">{active.heading}</h2><p className="mt-3 text-xs leading-6 text-[#C6CBD0]">{active.copy}</p></div>
                <div className="rounded-xl border border-[#83B99A]/25 bg-[#83B99A]/10 p-3"><p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#A9D3B8]">What you gain</p><p className="mt-1 text-xs font-semibold text-white">{active.result}</p></div>
              </div>
            </div>
            <div className="relative z-10 mt-5 flex items-center justify-between border-t border-white/10 pt-4"><span className="font-mono text-[10px] text-[#AAB2BA]">PREDICT → CHANGE → OBSERVE</span><span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FFAA7E]"><Play className="h-3 w-3" /> Try it in Forge</span></div>
          </div>
        </div>
      </motion.section>

      <section>
        <div className="max-w-2xl"><p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">The way we work</p><h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl">Learning should change how you think.</h2><p className="mt-3 text-base leading-7 text-muted-foreground">Not just what you remember. Each experience should help you understand a system, test an idea or make something work.</p></div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {learningModes.map((item) => { const Icon = item.icon; return <article key={item.number} className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/45"><div className="flex items-center justify-between"><span className="font-mono text-xs text-muted-foreground">{item.number}</span><span className="grid h-10 w-10 place-items-center rounded-xl bg-muted text-primary transition-colors group-hover:bg-accent"><Icon className="h-5 w-5" /></span></div><h3 className="mt-5 text-lg font-bold text-foreground">{item.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p></article>; })}
        </div>
      </section>

      <section className="rounded-[22px] border border-border bg-card p-5 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div><p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Your engineering journey</p><h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-foreground">From first principles to independence.</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">The goal isn't to rush through a curriculum. It's to build the judgement to work through unfamiliar problems.</p></div>
          <div className="grid gap-2 sm:grid-cols-2">{journeyStages.map((stage, index) => <div key={stage.step} className="relative rounded-xl border border-border bg-background p-4"><div className="flex items-center justify-between gap-3"><span className="font-mono text-[10px] text-primary">{stage.step} / 04</span>{index < journeyStages.length - 1 && <Workflow className="h-4 w-4 text-muted-foreground" />}</div><h3 className="mt-3 font-bold text-foreground">{stage.name}</h3><p className="mt-1 text-xs text-muted-foreground">{stage.detail}</p></div>)}</div>
        </div>
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Choose your next move</p><h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl">Step into the workshop.</h2></div><Link to="/dashboard" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary hover:underline" onClick={onSwitchToDashboard}>Open your workspace <ArrowRight className="h-4 w-4" /></Link></div>
        <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {destinations.map((destination) => { const Icon = destination.icon; return <Link key={destination.title} to={destination.to} className="group flex min-h-[190px] flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/50"><span className="grid h-10 w-10 place-items-center rounded-xl bg-muted text-primary group-hover:bg-accent"><Icon className="h-5 w-5" /></span><h3 className="mt-5 text-base font-bold text-foreground">{destination.title}</h3><p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{destination.description}</p><span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-primary">{destination.label}<ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></span></Link>; })}
        </div>
      </section>

      <section className="flex flex-col gap-5 rounded-[22px] bg-[#202329] px-6 py-8 text-[#F1F0EB] sm:flex-row sm:items-center sm:justify-between sm:px-9">
        <div className="max-w-2xl"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#FFAA7E]">Start where you are</p><h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">You don't need to know everything to begin.</h2><p className="mt-2 text-sm leading-6 text-[#C6CBD0]">Find a starting point, follow your curiosity and build from there.</p></div>
        <div className="flex shrink-0 flex-wrap gap-3"><button type="button" onClick={onOpenDiagnostic} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#FF874A] px-4 py-3 text-sm font-bold text-[#211A16] hover:bg-[#FF9A65]">Find my starting point <ArrowRight className="h-4 w-4" /></button><Link to="/learn/modules" className="inline-flex min-h-11 items-center rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10">Browse learning paths</Link></div>
      </section>
    </div>
  );
}
