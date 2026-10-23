import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useProgress } from "@/lib/hooks/use-progress";
import {
  useAchievements,
  useLessons,
  useModules,
  useProjects,
} from "@/lib/hooks/use-content";
import { useCurriculumResume } from "@/lib/utils/curriculum-order";
import {
  buildAtelierChapterFolios,
  findChapterIdForModule,
  type AtelierChapterId,
} from "@/lib/curriculum/atelier-chapters";
import { AtelierTopNav } from "@/components/atelier/atelier-top-nav";
import { StudioDeskHero } from "@/components/atelier/studio-desk-hero";
import { LearningPathFolios } from "@/components/atelier/learning-path-folios";
import { BuildersPinboard } from "@/components/atelier/builders-pinboard";
import { SkillDiagnosticModal } from "@/components/home/skill-diagnostic-modal";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Creative Atelier Dashboard · Forge Academia" },
      {
        name: "description",
        content:
          "Your Forge Academia Creative Atelier — interactive studio lessons, live CSS/DOM blueprint stage, 4 chapter folios, and real portfolio projects.",
      },
    ],
  }),
  component: StudioDashboardPage,
});

export function StudioDashboardPage() {
  const progress = useProgress();
  const lessons = useLessons();
  const modules = useModules();
  const projects = useProjects();
  const achievements = useAchievements();

  const { currentLesson, completedCount, totalLessons } = useCurriculumResume();
  const [diagnosticOpen, setDiagnosticOpen] = useState(false);

  const activeModule = useMemo(() => {
    if (currentLesson?.moduleId) {
      return modules.find((m) => m.id === currentLesson.moduleId) ?? modules[0];
    }
    return modules[0];
  }, [currentLesson, modules]);

  const activeModuleId = activeModule?.id ?? "module-0-1";
  const activeChapterId = useMemo(
    () => findChapterIdForModule(activeModuleId),
    [activeModuleId],
  );

  const chapterFolios = useMemo(
    () =>
      buildAtelierChapterFolios(
        modules,
        progress.lessonsCompleted,
        currentLesson?.id,
      ),
    [modules, progress.lessonsCompleted, currentLesson?.id],
  );

  const [selectedChapterId, setSelectedChapterId] =
    useState<AtelierChapterId>(activeChapterId);
  const [selectedModuleId, setSelectedModuleId] =
    useState<string>(activeModuleId);

  // Sync default selection when active lesson module changes
  useEffect(() => {
    setSelectedChapterId(activeChapterId);
    setSelectedModuleId(activeModuleId);
  }, [activeChapterId, activeModuleId]);

  const handleSelectChapter = (chapterId: AtelierChapterId) => {
    setSelectedChapterId(chapterId);
    const folio = chapterFolios.find((f) => f.id === chapterId);
    if (!folio || folio.modules.length === 0) return;

    // Prefer the active module if it belongs to this chapter, else first incomplete, else first module
    const hasActiveInChapter = folio.modules.find((m) => m.id === activeModuleId);
    const firstIncomplete = folio.modules.find((m) => m.status !== "completed");
    const nextMod = hasActiveInChapter ?? firstIncomplete ?? folio.modules[0];
    setSelectedModuleId(nextMod.id);
  };

  const handleReturnToActiveLesson = () => {
    setSelectedChapterId(activeChapterId);
    setSelectedModuleId(activeModuleId);
  };

  return (
    <div className="atelier-paper-grid min-h-dvh w-full max-w-full overflow-x-clip text-foreground">
      <AtelierTopNav onOpenDiagnostic={() => setDiagnosticOpen(true)} />

      {/* Ambient Pastel Studio Glows */}
      <div className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/4 h-80 w-80 rounded-full bg-[#C9BBFF]/25 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-40 right-10 h-72 w-72 rounded-full bg-[#FFE08A]/25 blur-3xl"
        />

        <div className="relative mx-auto w-full min-w-0 max-w-[1360px] space-y-10 sm:space-y-12 px-4 pt-6 pb-20 sm:px-6 sm:pt-8 lg:px-8 lg:py-10">
          {/* Zone A — Creative Studio Desk & First-Time Onboarding */}
          <StudioDeskHero
            currentLesson={currentLesson}
            activeModule={activeModule}
            completedCount={completedCount}
            totalLessons={totalLessons}
            progress={progress}
            onOpenDiagnostic={() => setDiagnosticOpen(true)}
          />

          {/* Zone B — 4 Chapter Folios & Unfolded Blueprint Trail */}
          <LearningPathFolios
            folios={chapterFolios}
            selectedChapterId={selectedChapterId}
            onSelectChapter={handleSelectChapter}
            selectedModuleId={selectedModuleId}
            onSelectModule={setSelectedModuleId}
            activeLessonId={currentLesson?.id}
            activeChapterId={activeChapterId}
            activeModuleId={activeModuleId}
            onReturnToActiveLesson={handleReturnToActiveLesson}
          />

          {/* Zone C — Builder's Pinboard, Quick Actions & Collectible Stickers */}
          <BuildersPinboard
            projects={projects}
            achievements={achievements}
            lessons={lessons}
            progress={progress}
            onOpenDiagnostic={() => setDiagnosticOpen(true)}
          />
        </div>
      </div>

      <SkillDiagnosticModal
        open={diagnosticOpen}
        onOpenChange={setDiagnosticOpen}
      />
    </div>
  );
}
