import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpenCheck, Flame, Trophy, Zap } from "lucide-react";
import { AtelierTopNav } from "@/components/atelier/atelier-top-nav";
import { LiveBlueprintStage } from "@/components/atelier/live-blueprint-stage";
import { StudioDeskHero } from "@/components/atelier/studio-desk-hero";
import { LearningPathFolios } from "@/components/atelier/learning-path-folios";
import { UnfoldedBlueprintTrail } from "@/components/atelier/unfolded-blueprint-trail";
import { BuildersPinboard } from "@/components/atelier/builders-pinboard";
import { getAtelierModules } from "@/lib/curriculum/atelier-chapters";
import { useProgress } from "@/lib/hooks/use-progress";
import { useCurriculumResume } from "@/lib/utils/curriculum-order";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Creative Studio · Forge Academia" },
      {
        name: "description",
        content: "Your Creative Atelier workbench for learning frontend engineering by building real interfaces.",
      },
    ],
  }),
  component: StudioDashboardPage,
});

export function StudioDashboardPage() {
  const progress = useProgress();
  const { currentLesson, completedCount, totalLessons } = useCurriculumResume();
  const chapters = getAtelierModules();
  const activeModuleId = currentLesson?.moduleId;
  const activeChapter = chapters.find((chapter) => activeModuleId && chapter.moduleIds.some((moduleId) => moduleId === activeModuleId));
  const initialChapterId = activeChapter?.id ?? chapters[0]?.id ?? "01";
  const initialModuleId = activeModuleId ?? chapters.find((chapter) => chapter.id === initialChapterId)?.modules[0]?.moduleId ?? "";

  const [selectedChapterId, setSelectedChapterId] = useState<string>(initialChapterId);
  const [selectedModuleId, setSelectedModuleId] = useState<string>(initialModuleId);

  const selectChapter = (chapterId: string) => {
    const chapter = chapters.find((item) => item.id === chapterId);
    setSelectedChapterId(chapterId);
    setSelectedModuleId(chapter?.modules[0]?.moduleId ?? "");
  };

  const returnToActiveLesson = () => {
    const chapter = chapters.find((item) => activeModuleId && item.moduleIds.includes(activeModuleId));
    const moduleId = activeModuleId ?? chapters[0]?.modules[0]?.moduleId ?? "";
    setSelectedChapterId(chapter?.id ?? chapters[0]?.id ?? "01");
    setSelectedModuleId(moduleId);
  };

  const completionPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="atelier-dashboard atelier-paper-grid min-h-dvh overflow-x-clip bg-[#FFFDF9] text-[#0E1B3D]">
      <AtelierTopNav />
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-7 px-4 py-6 sm:gap-9 sm:px-7 sm:py-9 lg:px-10 lg:py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[.22em] text-[#4F6BFF]">Forge Academia · Creative Atelier</p>
            <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">Your ideas, on the workbench.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#596174] sm:text-base">A little progress every day adds up to real craft. Pick up your learning path, experiment in the component lab, or build something of your own.</p>
          </div>
          <span className="rounded-full border border-[#0E1B3D]/10 bg-white px-4 py-2 font-mono text-xs text-[#596174]">LEARN · EXPERIMENT · BUILD</span>
        </div>

        <section aria-label="Learning overview" className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <OverviewStat icon={<Zap size={18} />} label="Experience" value={`${progress.xp} XP`} surface="#E9E4FF" />
          <OverviewStat icon={<Flame size={18} />} label="Day streak" value={String(progress.streakDays)} surface="#FFF0C4" />
          <OverviewStat icon={<BookOpenCheck size={18} />} label="Lessons done" value={`${completedCount} / ${totalLessons || "—"}`} surface="#DDF5EC" />
          <OverviewStat icon={<Trophy size={18} />} label="Path progress" value={`${completionPercent}%`} surface="#FFE5DF" />
        </section>

        <section aria-label="Your studio desk" className="flex min-w-0 flex-col gap-6">
          <StudioDeskHero />
          <LiveBlueprintStage />
        </section>

        <div className="border-t border-[#0E1B3D]/10 pt-8">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-[#4F6BFF]">Your map to mastery</p>
              <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">The learning path</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[#596174]">Explore each chapter, follow the trail, and return to your active lesson whenever you’re ready.</p>
            </div>
            <Link to="/learn/" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#0E1B3D]/15 bg-white px-4 py-2 text-sm font-bold text-[#0E1B3D] transition hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#0E1B3D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F6BFF]">
              Explore all lessons <ArrowRight size={16} />
            </Link>
          </div>
          <LearningPathFolios
            selectedChapterId={selectedChapterId}
            onSelectChapter={selectChapter}
            activeModuleId={activeModuleId}
          />
          <div className="mt-5">
            <UnfoldedBlueprintTrail
              selectedChapterId={selectedChapterId}
              selectedModuleId={selectedModuleId}
              activeModuleId={activeModuleId}
              activeLessonId={currentLesson?.id}
              completedLessonIds={progress.lessonsCompleted}
              onSelectModule={setSelectedModuleId}
              onReturnToActive={returnToActiveLesson}
            />
          </div>
        </div>
      </div>
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-10 sm:px-7 lg:px-10">
        <BuildersPinboard />
      </div>
      <footer className="border-t border-[#0E1B3D]/10 px-4 py-5 text-center font-mono text-[11px] uppercase tracking-[.18em] text-[#7A8090]">
        Forge Academia · Built by curiosity, refined by practice
      </footer>
    </div>
  );
}

function OverviewStat({
  icon,
  label,
  value,
  surface,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  surface: string;
}) {
  return (
    <div className="group flex min-w-0 items-center gap-3 rounded-[22px] border-2 border-[#0E1B3D]/10 bg-white p-3 shadow-[0_3px_0_rgba(14,27,61,.04)] transition hover:-translate-y-0.5 hover:border-[#0E1B3D]/20 hover:shadow-[4px_4px_0_#0E1B3D] sm:gap-4 sm:p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-2xl text-[#0E1B3D] sm:size-12" style={{ backgroundColor: surface }}>{icon}</span>
      <span className="min-w-0">
        <span className="block truncate text-xs font-semibold text-[#697084] sm:text-sm">{label}</span>
        <span className="mt-0.5 block truncate text-lg font-extrabold tracking-tight text-[#0E1B3D] sm:text-xl">{value}</span>
      </span>
    </div>
  );
}
