import { useMemo, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { useProgress } from "@/lib/hooks/use-progress";
import { useBugs, useProjects, useQuizzes, useInterviewQuestions } from "@/lib/hooks/use-content";
import {
  ArrowRight,
  Blocks,
  Bug,
  FolderKanban,
  ListChecks,
  MessagesSquare,
  PenTool,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/practice")({
  head: () => ({
    meta: [
      { title: "Practice Arena · Forge" },
      {
        name: "description",
        content:
          "Every hands-on surface in Forge — playground, debug lab, guided projects, mock interviews, quizzes, flashcards, whiteboard, and daily challenges.",
      },
      { property: "og:title", content: "Practice Arena · Forge" },
      { property: "og:description", content: "Deliberate engineering practice and live labs." },
    ],
  }),
  component: Practice,
});

interface ArenaTileProps {
  to: string;
  index: string;
  icon: ReactNode;
  title: string;
  desc: string;
  metricLabel: string;
  ctaLabel: string;
}

function ArenaTile({ to, index, icon, title, desc, metricLabel, ctaLabel }: ArenaTileProps) {
  return (
    <Link to={to} className="group block h-full">
      <Card className="atelier-arena-tile flex h-full flex-col justify-between border-border/80 transition-colors hover:border-primary/50">
        <CardContent className="flex h-full flex-col justify-between p-5 sm:p-6">
          <div>
            <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
              <span className="font-semibold text-primary">{index}</span>
              <span className="tabular-nums">{metricLabel}</span>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                {icon}
              </div>
              <h3 className="text-base font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                {title}
              </h3>
            </div>

            <p className="mt-3 text-xs sm:text-sm leading-relaxed text-muted-foreground">{desc}</p>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-3 font-mono text-xs">
            <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {ctaLabel}
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-primary transition-all" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function Practice() {
  const progress = useProgress();
  const bugs = useBugs();
  const projects = useProjects();
  const quizzes = useQuizzes();
  const interviewQuestions = useInterviewQuestions();

  const solvedBugsCount = progress.solvedBugs?.length || 0;
  const completedProjectsCount = progress.completedProjects?.length || 0;

  const uniqueQuizzesDone = useMemo(() => {
    const fromList = progress.completedQuizzes || [];
    const fromResults = (progress.quizResults || []).map((r) => r.quizId);
    return new Set([...fromList, ...fromResults]).size;
  }, [progress.completedQuizzes, progress.quizResults]);

  const dueFlashcards = useMemo(() => {
    const records = Object.values(progress.topicMasteryRecords || {});
    return records.filter((r) => r.state === "Needs Review" || r.confidence < 60).length;
  }, [progress.topicMasteryRecords]);

  const interviewLoopsDone = progress.interviewHistory?.length || 0;
  const whiteboardSnapshotsCount = progress.whiteboardSnapshots?.length || 0;

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        eyebrow="03 · Practice Arena"
        title="Deliberate Engineering Reps & Live Sandboxes"
        description="Move beyond passive reading. Diagnose broken apps, ship portfolio-grade specifications, run timed mock interview loops, and drill active recall."
      />

      {/* Live Telemetry Summary Strip */}
      <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-4 font-mono">
        <div className="space-y-0.5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Bugs Squashed
          </div>
          <div className="text-lg font-bold tabular-nums text-foreground">
            {solvedBugsCount} <span className="text-xs font-normal text-muted-foreground">/ {bugs.length}</span>
          </div>
        </div>
        <div className="space-y-0.5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Projects Completed
          </div>
          <div className="text-lg font-bold tabular-nums text-foreground">
            {completedProjectsCount}{" "}
            <span className="text-xs font-normal text-muted-foreground">/ {projects.length}</span>
          </div>
        </div>
        <div className="space-y-0.5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Quizzes Verified
          </div>
          <div className="text-lg font-bold tabular-nums text-foreground">
            {uniqueQuizzesDone}{" "}
            <span className="text-xs font-normal text-muted-foreground">/ {quizzes.length}</span>
          </div>
        </div>
        <div className="space-y-0.5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Interview Loops
          </div>
          <div className="text-lg font-bold tabular-nums text-foreground">
            {interviewLoopsDone}{" "}
            <span className="text-xs font-normal text-muted-foreground">
              ({interviewQuestions.length} bank)
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ArenaTile
          to="/playground"
          index="01 · Sandbox"
          icon={<Terminal className="h-5 w-5" />}
          title="Code Playground"
          desc="Multi-file HTML, CSS, TypeScript, and React sandbox with live DOM preview, console stream, and test verification."
          metricLabel="Multi-file IDE"
          ctaLabel="Open Playground"
        />
        <ArenaTile
          to="/debug-lab"
          index="02 · Diagnostics"
          icon={<Bug className="h-5 w-5" />}
          title="Defensive Debug Lab"
          desc="Real production bugs across React hooks, stale closures, race conditions, layout shift (CLS), and accessibility."
          metricLabel={`${solvedBugsCount}/${bugs.length} solved`}
          ctaLabel="Enter Debug Lab"
        />
        <ArenaTile
          to="/projects"
          index="03 · Portfolio"
          icon={<FolderKanban className="h-5 w-5" />}
          title="Guided Projects"
          desc="Step-by-step engineering builds with acceptance criteria, architectural trade-off prompts, and resume bullet generators."
          metricLabel={`${completedProjectsCount}/${projects.length} shipped`}
          ctaLabel="Browse Projects"
        />
        <ArenaTile
          to="/interview"
          index="04 · Evaluation"
          icon={<MessagesSquare className="h-5 w-5" />}
          title="Interview Academy"
          desc="Timed technical interview simulations with staff-calibrated grading rubrics across JS, React, CSS, and System Design."
          metricLabel={`${interviewQuestions.length} questions`}
          ctaLabel="Start Mock Loop"
        />
        <ArenaTile
          to="/quizzes"
          index="05 · Verification"
          icon={<ListChecks className="h-5 w-5" />}
          title="Topic Quizzes"
          desc="Rapid concept verification drills with detailed explanations to test your mental model accuracy."
          metricLabel={`${uniqueQuizzesDone}/${quizzes.length} passed`}
          ctaLabel="Take a Quiz"
        />
        <ArenaTile
          to="/challenges"
          index="06 · Cadence"
          icon={<Zap className="h-5 w-5" />}
          title="Daily Challenges"
          desc="One focused frontend engineering problem every single day to keep your implementation instincts sharp."
          metricLabel={`${progress.streakDays || 0}d streak`}
          ctaLabel="Solve Today's Challenge"
        />
        <ArenaTile
          to="/flashcards"
          index="07 · Active Recall"
          icon={<Blocks className="h-5 w-5" />}
          title="Spaced Flashcards"
          desc="Lock in core DOM, CSS, JavaScript, and React semantics using confidence-rated spaced repetition decks."
          metricLabel={dueFlashcards > 0 ? `${dueFlashcards} due today` : "All caught up"}
          ctaLabel="Review Flashcards"
        />
        <ArenaTile
          to="/whiteboard"
          index="08 · System Design"
          icon={<PenTool className="h-5 w-5" />}
          title="Architecture Whiteboard"
          desc="Sketch client-gateway-store data flows, predict output traces, and save interactive system design snapshots."
          metricLabel={`${whiteboardSnapshotsCount} snapshots`}
          ctaLabel="Open Whiteboard"
        />
      </div>
    </div>
  );
}
