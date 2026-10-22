import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AtelierTopNav } from "@/components/atelier/atelier-top-nav";
import { LiveBlueprintStage } from "@/components/atelier/live-blueprint-stage";
import { StudioDeskHero } from "@/components/atelier/studio-desk-hero";
import { LearningPathFolios } from "@/components/atelier/learning-path-folios";
import { UnfoldedBlueprintTrail } from "@/components/atelier/unfolded-blueprint-trail";
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
  const { currentLesson } = useCurriculumResume();
  const chapters = getAtelierModules();
  const activeModuleId = currentLesson?.moduleId;
  const activeChapter = chapters.find((chapter) => activeModuleId && chapter.moduleIds.includes(activeModuleId));
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

  return (
    <div className="atelier-paper-grid min-h-dvh overflow-x-clip bg-[#FFFDF9] text-[#0E1B3D]">
      <AtelierTopNav />
      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 py-6 sm:gap-10 sm:px-7 sm:py-9 lg:px-10 lg:py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[.22em] text-[#4F6BFF]">Forge Academia · Creative Atelier</p>
            <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">Your ideas, on the workbench.</h1>
          </div>
          <span className="rounded-full border border-[#0E1B3D]/10 bg-white px-4 py-2 font-mono text-xs text-[#596174]">LEARN · EXPERIMENT · BUILD</span>
        </div>

        <section aria-label="Your studio desk" className="flex min-w-0 flex-col gap-6">
          <StudioDeskHero />
          <LiveBlueprintStage />
        </section>

        <div className="border-t border-[#0E1B3D]/10 pt-8">
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
      </main>
      <footer className="border-t border-[#0E1B3D]/10 px-4 py-5 text-center font-mono text-[11px] uppercase tracking-[.18em] text-[#7A8090]">
        Forge Academia · Built by curiosity, refined by practice
      </footer>
    </div>
  );
}
