import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Code2, Compass, FolderKanban, Sparkles, Swords } from "lucide-react";
import { AtelierTopNav } from "@/components/atelier/atelier-top-nav";
import { StudioDeskHero } from "@/components/atelier/studio-desk-hero";
import { useProgress } from "@/lib/hooks/use-progress";
import { useModules, useTopics } from "@/lib/hooks/use-content";
import { useCurriculumResume } from "@/lib/utils/curriculum-order";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Creative Studio · Forge Academia" },
      { name: "description", content: "A hands-on frontend engineering atelier, with real curriculum progress and live design experiments." },
    ],
  }),
  component: StudioDashboardPage,
});

export function StudioDashboardPage() {
  const progress = useProgress();
  const modules = useModules();
  const topics = useTopics();
  const {
    currentLesson,
    orderedLessons,
    completedCount,
    totalLessons,
    isReturningLearner,
  } = useCurriculumResume();

  const activeModule = useMemo(
    () => modules.find((module) => module.id === currentLesson?.moduleId) ?? modules[0],
    [modules, currentLesson?.moduleId],
  );
  const activeTopic = useMemo(
    () => topics.find((topic) => topic.id === currentLesson?.topicId),
    [topics, currentLesson?.topicId],
  );

  return (
    <div className="min-h-dvh bg-[var(--atelier-cream)] text-foreground">
      <AtelierTopNav />
      <main id="main-content" className="mx-auto w-full max-w-[1440px] px-4 pb-20 pt-7 sm:px-6 sm:pt-10 lg:px-8 lg:pt-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[.22em] text-primary">Forge Academia <span className="text-border">/</span> Independent creative practice</p>
            <p className="mt-2 text-sm text-muted-foreground">{isReturningLearner ? "Welcome back to your workbench. Pick up where your curiosity left off." : "Welcome to the workbench. Start small, experiment freely, and learn by making."}</p>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground sm:inline-flex"><span className="h-2 w-2 rounded-full bg-[var(--atelier-mint)]" /> Your progress is saved locally</div>
        </div>

        <StudioDeskHero
          lesson={currentLesson}
          activeModule={activeModule}
          activeTopic={activeTopic}
          completedCount={completedCount}
          totalLessons={totalLessons}
          streakDays={progress.streakDays}
          xp={progress.xp}
          activityDates={progress.activityDates}
          lessonsCompleted={progress.lessonsCompleted}
          isReturningLearner={isReturningLearner}
        />

        <section className="mt-12 border-t border-border/80 pt-8" aria-labelledby="next-workshop-title">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><p className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-primary">Your workshop tools</p><h2 id="next-workshop-title" className="mt-2 text-2xl font-extrabold tracking-[-.035em] sm:text-3xl">Where will curiosity take you?</h2></div>
            <span className="text-xs text-muted-foreground">{orderedLessons.length} authored lessons in your curriculum</span>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Link to="/learn" className="group atelier-card flex min-h-[132px] items-start gap-4 rounded-2xl p-5 transition-transform hover:-translate-y-1"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--atelier-mint)]"><BookOpen className="h-5 w-5 text-[var(--atelier-navy)]" /></span><span><strong className="block text-sm">Explore curriculum</strong><span className="mt-1 block text-xs leading-5 text-muted-foreground">Browse modules and authored lessons.</span><span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary">Open learning path <ArrowRight className="h-3.5 w-3.5" /></span></span></Link>
            <Link to="/playground" className="group atelier-card flex min-h-[132px] items-start gap-4 rounded-2xl p-5 transition-transform hover:-translate-y-1"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--atelier-lilac)]"><Code2 className="h-5 w-5 text-[var(--atelier-navy)]" /></span><span><strong className="block text-sm">Code playground</strong><span className="mt-1 block text-xs leading-5 text-muted-foreground">Test an idea and see how it behaves.</span><span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary">Start experimenting <ArrowRight className="h-3.5 w-3.5" /></span></span></Link>
            <Link to="/debug-lab" className="group atelier-card flex min-h-[132px] items-start gap-4 rounded-2xl p-5 transition-transform hover:-translate-y-1"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--atelier-butter)]"><Swords className="h-5 w-5 text-[var(--atelier-navy)]" /></span><span><strong className="block text-sm">Debug boss labs</strong><span className="mt-1 block text-xs leading-5 text-muted-foreground">Practice tracing bugs back to their source.</span><span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary">Enter the lab <ArrowRight className="h-3.5 w-3.5" /></span></span></Link>
            <Link to="/projects" className="group atelier-card flex min-h-[132px] items-start gap-4 rounded-2xl p-5 transition-transform hover:-translate-y-1"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--atelier-coral)]"><FolderKanban className="h-5 w-5 text-[var(--atelier-navy)]" /></span><span><strong className="block text-sm">Guided projects</strong><span className="mt-1 block text-xs leading-5 text-muted-foreground">Turn concepts into proof of work.</span><span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary">Browse projects <ArrowRight className="h-3.5 w-3.5" /></span></span></Link>
          </div>
        </section>

        <section className="mt-8 flex flex-col gap-4 rounded-[1.6rem] border border-[var(--atelier-navy)]/10 bg-[var(--atelier-navy)] p-5 text-white sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="flex items-center gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10"><Compass className="h-6 w-6 text-[var(--atelier-butter)]" /></span><div><p className="text-sm font-bold">Not sure where to begin?</p><p className="mt-1 text-xs leading-5 text-white/70">Use the skill diagnostic to get a starting recommendation.</p></div></div>
          <Link to="/" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--atelier-coral)] px-4 py-3 text-sm font-bold text-[var(--atelier-navy)] hover:brightness-105">Open skill diagnostic <Sparkles className="h-4 w-4" /></Link>
        </section>
      </main>
    </div>
  );
}
