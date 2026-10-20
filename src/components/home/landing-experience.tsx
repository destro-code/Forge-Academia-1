import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Bug,
  CheckCircle2,
  Code2,
  Compass,
  FolderKanban,
  Layers,
  Layout,
  MessagesSquare,
  Play,
  Sliders,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModules, useLessons, useProjects, useBugs } from "@/lib/hooks/use-content";
import { useProgress } from "@/lib/hooks/use-progress";
import { useCurriculumResume } from "@/lib/utils/curriculum-order";
import { cn } from "@/lib/utils";

interface LandingExperienceProps {
  onOpenDiagnostic: () => void;
  onSwitchToDashboard?: () => void;
}

type StudioDemoTab = "css-studio" | "js-trace" | "react-audit";
type TrackFilter = "all" | "foundations" | "design-css" | "js-ts" | "react-systems";

export function LandingExperience({
  onOpenDiagnostic,
  onSwitchToDashboard,
}: LandingExperienceProps) {
  const modules = useModules();
  const lessons = useLessons();
  const projects = useProjects();
  const bugs = useBugs();
  const progress = useProgress();
  const { currentLesson, completedCount, totalLessons } = useCurriculumResume();

  // Interactive Hero Workbench state
  const [activeDemoTab, setActiveDemoTab] = useState<StudioDemoTab>("css-studio");
  const [demoPadding, setDemoPadding] = useState<number>(20);
  const [demoGap, setDemoGap] = useState<number>(12);
  const [demoDirection, setDemoDirection] = useState<"row" | "column">("row");
  const [traceStep, setTraceStep] = useState<number>(2);
  const [reactFixed, setReactFixed] = useState<boolean>(false);

  // Syllabus track filter
  const [trackFilter, setTrackFilter] = useState<TrackFilter>("all");

  const startLessonId = currentLesson?.id || "lesson-0-1-1";
  const isReturning = completedCount > 0;

  const filteredModules = useMemo(() => {
    return modules.filter((m) => {
      if (trackFilter === "all") return true;
      if (trackFilter === "foundations") return m.id.startsWith("module-0-");
      if (trackFilter === "design-css") return m.id.startsWith("module-1-");
      if (trackFilter === "js-ts") return m.id.startsWith("module-2-");
      if (trackFilter === "react-systems")
        return m.id.startsWith("module-3-") || m.id.startsWith("module-4-");
      return true;
    });
  }, [modules, trackFilter]);

  const TRACE_STEPS = [
    {
      step: 1,
      line: "const inc = createCounter(10);",
      stack: "Global → createCounter(10)",
      heap: "LexicalEnv #1: { count: 10 }",
      output: "Returns closure fn () => ++count",
    },
    {
      step: 2,
      line: "inc(); // First invocation",
      stack: "Global → inc()",
      heap: "LexicalEnv #1: { count: 11 }",
      output: "11 (mutates closed-over binding)",
    },
    {
      step: 3,
      line: "inc(); // Second invocation",
      stack: "Global → inc()",
      heap: "LexicalEnv #1: { count: 12 }",
      output: "12 (persists across calls without globals)",
    },
  ];

  const activeTrace = TRACE_STEPS[traceStep - 1] || TRACE_STEPS[0];

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO PROPOSITION + PLAYABLE LIVE WORKBENCH */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-stretch">
          {/* Left 6 cols: Value Proposition & Primary Actions */}
          <div className="flex flex-col justify-between space-y-6 lg:col-span-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
                <span className="font-semibold text-primary">Forge Frontend Academy</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{modules.length || 17} Modules</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{totalLessons || lessons.length || 155} Interactive Lessons</span>
              </div>

              <h1 className="text-balance font-serif text-3xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-4xl lg:text-[44px]">
                Master frontend design &amp; engineering by building inside live systems.
              </h1>

              <p className="max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
                Stop watching passive syntax videos. Forge takes you from zero to staff-level web
                designer and frontend engineer through interactive box-model &amp; layout studios,
                side-by-side UI replication challenges, execution traces, and real bug diagnostics.
              </p>
            </div>

            {/* Action Cluster */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="gap-2 font-semibold whitespace-nowrap shrink-0">
                  <Link
                    to="/lesson/$lessonId"
                    params={{ lessonId: startLessonId }}
                    search={{ mode: "curriculum" }}
                  >
                    <Play className="h-4 w-4 fill-current" />
                    {isReturning ? `Resume Lesson (${completedCount}/${totalLessons})` : "Start Interactive Curriculum"}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={onOpenDiagnostic}
                  className="gap-2 whitespace-nowrap shrink-0"
                >
                  <Compass className="h-4 w-4 text-primary" />
                  Take 60s Skill Diagnostic
                </Button>

                {onSwitchToDashboard && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onSwitchToDashboard}
                    className="font-mono text-xs text-muted-foreground hover:text-foreground whitespace-nowrap shrink-0"
                  >
                    Open Studio Command Center →
                  </Button>
                )}
              </div>

              {/* Quantified Proof Strip */}
              <div className="grid grid-cols-3 gap-4 border-t border-border/70 pt-4 font-mono">
                <div>
                  <div className="text-lg font-bold tabular-nums text-foreground">
                    {totalLessons || 155}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Multi-stage interactive lessons
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold tabular-nums text-foreground">
                    {bugs.length || 24} Labs
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Defensive debugging &amp; root-cause drills
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold tabular-nums text-foreground">
                    {projects.length || 12} Builds
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Portfolio-grade engineering specs
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right 6 cols: Interactive Live Studio Workbench Preview */}
          <div className="flex flex-col justify-between rounded-xl border border-border bg-background/90 p-4 sm:p-5 lg:col-span-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-3">
              <div className="flex items-center gap-1 rounded-lg bg-muted/60 p-1">
                <button
                  type="button"
                  onClick={() => setActiveDemoTab("css-studio")}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap shrink-0 transition-colors",
                    activeDemoTab === "css-studio"
                      ? "bg-card text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  01. CSS &amp; Layout Studio
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDemoTab("js-trace")}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap shrink-0 transition-colors",
                    activeDemoTab === "js-trace"
                      ? "bg-card text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  02. JS Closure Trace
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDemoTab("react-audit")}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap shrink-0 transition-colors",
                    activeDemoTab === "react-audit"
                      ? "bg-card text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  03. React Bug Lab
                </button>
              </div>
              <span className="font-mono text-[11px] text-primary">Interactive Preview</span>
            </div>

            {/* Tab 1: CSS Box Model & Flexbox Interactive Sandbox */}
            {activeDemoTab === "css-studio" && (
              <div className="my-4 space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <label className="rounded-lg border border-border/70 bg-card p-2.5 text-xs">
                    <div className="flex justify-between font-mono text-[11px] text-muted-foreground">
                      <span>padding</span>
                      <span className="tabular-nums text-foreground">{demoPadding}px</span>
                    </div>
                    <input
                      type="range"
                      min={8}
                      max={36}
                      value={demoPadding}
                      onChange={(e) => setDemoPadding(Number(e.target.value))}
                      className="mt-2 w-full accent-amber-500"
                      aria-label="Adjust padding"
                    />
                  </label>
                  <label className="rounded-lg border border-border/70 bg-card p-2.5 text-xs">
                    <div className="flex justify-between font-mono text-[11px] text-muted-foreground">
                      <span>gap</span>
                      <span className="tabular-nums text-foreground">{demoGap}px</span>
                    </div>
                    <input
                      type="range"
                      min={4}
                      max={28}
                      value={demoGap}
                      onChange={(e) => setDemoGap(Number(e.target.value))}
                      className="mt-2 w-full accent-amber-500"
                      aria-label="Adjust flex gap"
                    />
                  </label>
                  <div className="rounded-lg border border-border/70 bg-card p-2.5 text-xs">
                    <div className="font-mono text-[11px] text-muted-foreground">flex-direction</div>
                    <div className="mt-1.5 flex gap-1">
                      {(["row", "column"] as const).map((dir) => (
                        <button
                          key={dir}
                          type="button"
                          onClick={() => setDemoDirection(dir)}
                          className={cn(
                            "flex-1 rounded px-2 py-1 font-mono text-[11px] transition-colors",
                            demoDirection === dir
                              ? "bg-primary text-primary-foreground font-semibold"
                              : "bg-muted text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {dir}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Live rendered specimen */}
                <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-3">
                  <div
                    className="rounded-lg border border-border bg-card transition-all duration-150"
                    style={{
                      padding: `${demoPadding}px`,
                      display: "flex",
                      flexDirection: demoDirection,
                      gap: `${demoGap}px`,
                    }}
                  >
                    <div className="flex-1 rounded-md border border-border/80 bg-muted/50 p-3">
                      <div className="font-mono text-[11px] text-primary">01 · Semantic Node</div>
                      <div className="mt-1 text-xs font-semibold text-foreground">
                        Live Box-Model &amp; Flex Axis
                      </div>
                    </div>
                    <div className="flex-1 rounded-md border border-border/80 bg-muted/50 p-3">
                      <div className="font-mono text-[11px] text-emerald-500">02 · WCAG AA 7.4:1</div>
                      <div className="mt-1 text-xs font-semibold text-foreground">
                        Computed Geometry
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: JS Execution & Closure Trace */}
            {activeDemoTab === "js-trace" && (
              <div className="my-4 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-muted-foreground">
                    Step through closure heap memory:
                  </span>
                  <div className="flex gap-1.5">
                    {TRACE_STEPS.map((t) => (
                      <button
                        key={t.step}
                        type="button"
                        onClick={() => setTraceStep(t.step)}
                        className={cn(
                          "rounded-md px-2.5 py-1 font-mono text-xs tabular-nums transition-colors",
                          traceStep === t.step
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "border border-border bg-card text-muted-foreground hover:text-foreground",
                        )}
                      >
                        Step {t.step}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <pre className="rounded-lg border border-border bg-card p-3 font-mono text-xs leading-relaxed text-foreground">
                    <code>{`function createCounter(start) {\n  let count = start;\n  return () => ++count;\n}\nconst inc = createCounter(10);\ninc(); // 11\ninc(); // 12`}</code>
                  </pre>
                  <div className="space-y-2 rounded-lg border border-border bg-card p-3 font-mono text-xs">
                    <div>
                      <span className="text-muted-foreground">Active Line: </span>
                      <span className="text-primary font-semibold">{activeTrace.line}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Call Stack: </span>
                      <span className="text-foreground">{activeTrace.stack}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Heap Env: </span>
                      <span className="text-emerald-400">{activeTrace.heap}</span>
                    </div>
                    <div className="border-t border-border/60 pt-1.5">
                      <span className="text-muted-foreground">Return: </span>
                      <span className="text-foreground">{activeTrace.output}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: React State Bug Lab */}
            {activeDemoTab === "react-audit" && (
              <div className="my-4 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-muted-foreground">
                    Inspect stale closure vs functional state update:
                  </span>
                  <button
                    type="button"
                    onClick={() => setReactFixed(!reactFixed)}
                    className={cn(
                      "rounded-md px-3 py-1 font-mono text-xs font-semibold transition-colors",
                      reactFixed
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : "bg-primary text-primary-foreground",
                    )}
                  >
                    {reactFixed ? "✓ Functional Updater Applied" : "Apply Fix (prev => prev + 1)"}
                  </button>
                </div>

                <pre className="rounded-lg border border-border bg-card p-3.5 font-mono text-xs leading-relaxed text-foreground">
                  <code>
                    {reactFixed
                      ? `// ✅ FIXED: Functional update reads latest queued state\nfunction handleTripleIncrement() {\n  setCount((prev) => prev + 1);\n  setCount((prev) => prev + 1);\n  setCount((prev) => prev + 1);\n  // Result after 1 click: +3`
                      : `// ❌ BUG: All 3 calls close over the same render snapshot (count = 0)\nfunction handleTripleIncrement() {\n  setCount(count + 1);\n  setCount(count + 1);\n  setCount(count + 1);\n  // Result after 1 click: +1 (lost 2 updates)`}
                  </code>
                </pre>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-border/70 pt-3 text-xs text-muted-foreground">
              <span>Every lesson embeds live manipulable studios like this.</span>
              <Link
                to="/lesson/$lessonId"
                params={{ lessonId: "lesson-1-2-1" }}
                search={{ mode: "curriculum" }}
                className="font-mono font-semibold text-primary hover:underline whitespace-nowrap shrink-0"
              >
                Try full lesson player →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FIVE INTERACTIVE LEARNING ENGINES (MECHANISM -> OUTCOME BENTO) */}
      <section className="space-y-6">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <div className="font-mono text-xs font-semibold uppercase tracking-wider text-primary">
              01 · Architecture of Deliberate Practice
            </div>
            <h2 className="mt-1 font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Five interactive engines built for real engineering fluency
            </h2>
          </div>
          <p className="max-w-md text-xs sm:text-sm text-muted-foreground">
            Every concept moves from mental model visualization to prediction commitment, live code
            modification, and architectural judgment.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-6">
          <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-6 md:col-span-3">
            <div className="space-y-2">
              <div className="font-mono text-xs text-primary">01. Visual System Studios</div>
              <h3 className="text-lg font-bold text-foreground">
                Box Model, Flexbox, Grid, Typography &amp; HTTP Simulators
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                Manipulate CSS layout axes, WCAG contrast ratios, DOM trees, and network request
                pipelines directly before writing code so you see the underlying browser mechanism.
              </p>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-3 font-mono text-xs">
              <span className="text-muted-foreground">Modules 0.1 – 1.4 &amp; 4.1</span>
              <Link
                to="/lesson/$lessonId"
                params={{ lessonId: "lesson-0-1-1" }}
                search={{ mode: "curriculum" }}
                className="text-primary hover:underline"
              >
                Launch Module 0.1 →
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-6 md:col-span-3">
            <div className="space-y-2">
              <div className="font-mono text-xs text-emerald-500">02. Replicate-This UI Studio</div>
              <h3 className="text-lg font-bold text-foreground">
                Side-by-Side Target vs. Live DOM Replication &amp; Diff Overlay
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                Build production cards, navigation headers, accessible forms, and responsive grids
                with live visual diffing and automated structural/computed-style diagnostics.
              </p>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-3 font-mono text-xs">
              <span className="text-muted-foreground">Modules 1.1 – 1.4 &amp; 3.1</span>
              <Link
                to="/lesson/$lessonId"
                params={{ lessonId: "lesson-1-1-1" }}
                search={{ mode: "curriculum" }}
                className="text-primary hover:underline"
              >
                Open HTML/CSS Track →
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 md:col-span-2">
            <div className="space-y-2">
              <div className="font-mono text-xs text-rose-400">03. Defensive Debug Lab</div>
              <h3 className="text-base font-bold text-foreground">
                Diagnose Broken React, CSS &amp; Async Apps
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Hunt down stale closures, race conditions, layout shifts (CLS), and memory leaks in
                realistic multi-file reproduction sandboxes.
              </p>
            </div>
            <Link
              to="/debug-lab"
              className="mt-4 inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline"
            >
              Enter Debug Lab ({bugs.length} bugs) <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 md:col-span-2">
            <div className="space-y-2">
              <div className="font-mono text-xs text-sky-400">04. Guided Capstone Projects</div>
              <h3 className="text-base font-bold text-foreground">
                Ship Portfolio Builds with Acceptance Specs
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Step-by-step milestones, testable acceptance criteria, architectural reflections,
                and automated resume impact bullets.
              </p>
            </div>
            <Link
              to="/projects"
              className="mt-4 inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline"
            >
              Browse {projects.length} Projects <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 md:col-span-2">
            <div className="space-y-2">
              <div className="font-mono text-xs text-amber-400">05. Timed Interview Academy</div>
              <h3 className="text-base font-bold text-foreground">
                Staff-Calibrated Rubrics &amp; AI Mentor Coaching
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Practice timed frontend system design, JS/TS coding, and React architecture loops
                with rubric self-scoring and Socratic AI code reviews.
              </p>
            </div>
            <Link
              to="/interview"
              className="mt-4 inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline"
            >
              Start Mock Interview <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE 17-MODULE / 155-LESSON SYLLABUS EXPLORER */}
      <section className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="font-mono text-xs font-semibold uppercase tracking-wider text-primary">
              02 · Complete Curriculum Architecture
            </div>
            <h2 className="mt-1 font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              17 Modules · 155 Canonical Lessons from Zero to Production
            </h2>
          </div>

          {/* Interactive Track Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1 rounded-lg border border-border bg-card p-1">
            {(
              [
                { id: "all", label: "All 17 Modules" },
                { id: "foundations", label: "00. Web Systems" },
                { id: "design-css", label: "01. HTML/CSS & Design" },
                { id: "js-ts", label: "02. JS & TypeScript" },
                { id: "react-systems", label: "03–04. React & Design Systems" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTrackFilter(tab.id)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors",
                  trackFilter === tab.id
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredModules.map((mod, idx) => {
            const modLessons = lessons.filter((l) => l.moduleId === mod.id);
            const doneCount = modLessons.filter((l) =>
              progress.lessonsCompleted.includes(l.id),
            ).length;
            const firstLessonId = modLessons[0]?.id || "lesson-0-1-1";

            return (
              <div
                key={mod.id}
                className="group flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
                    <span>
                      {String(mod.order || idx + 1).padStart(2, "0")} · {mod.difficulty}
                    </span>
                    <span className="tabular-nums">
                      {doneCount}/{modLessons.length} lessons · {mod.estimatedHours}h
                    </span>
                  </div>

                  <Link
                    to="/learn/modules/$moduleId"
                    params={{ moduleId: mod.id }}
                    className="block text-base font-bold tracking-tight text-foreground group-hover:text-primary transition-colors"
                  >
                    {mod.title}
                  </Link>

                  <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {mod.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 font-mono text-xs">
                  <Link
                    to="/learn/modules/$moduleId"
                    params={{ moduleId: mod.id }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Module syllabus
                  </Link>
                  <Link
                    to="/lesson/$lessonId"
                    params={{ lessonId: firstLessonId }}
                    search={{ mode: "module" }}
                    className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                  >
                    <span>{doneCount > 0 ? "Continue" : "Start module"}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
