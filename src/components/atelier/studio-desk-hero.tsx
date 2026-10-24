import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Clock,
  Compass,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
  FolderKanban,
  Sparkles,
} from "lucide-react";
import {
  ForgeBuddyMascot3D,
  HandwrittenCallout,
} from "./forge-buddy-illos";
import { evaluateAtelierProjects } from "@/lib/curriculum/atelier-chapters";
import {
  computeGuidedNextStep,
  getLessonStepResumeInfo,
  getVerifiedProjectTasks,
  getCapabilityEvidenceRecords,
  useLearnerEvidenceVersion,
} from "@/lib/learning-engine/evidence-store";
import type { Lesson, Module, Project, ProgressState } from "@/lib/types";

interface StudioDeskHeroProps {
  currentLesson: Lesson | undefined;
  activeModule: Module | undefined;
  lessons?: Lesson[];
  projects?: Project[];
  completedCount: number;
  totalLessons: number;
  progress: ProgressState;
  onOpenDiagnostic?: () => void;
}

export function StudioDeskHero({
  currentLesson,
  activeModule,
  lessons = [],
  projects = [],
  completedCount,
  totalLessons,
  progress,
  onOpenDiagnostic,
}: StudioDeskHeroProps) {
  const evidenceVersion = useLearnerEvidenceVersion();
  const isBrandNewLearner = completedCount === 0;
  const moduleTitle = activeModule?.title ?? "CSS & Web Foundations";
  const lessonId = currentLesson?.id ?? "lesson-0-1-1";
  const lessonTitle = currentLesson?.title ?? "A Website Is a Conversation";

  // 1. Primary Recommendation ("Your Next Step" with explicit WHY)
  const nextStep = useMemo(
    () =>
      computeGuidedNextStep({
        currentLesson,
        activeModule,
        lessons,
        projects,
        progress,
      }),
    [currentLesson, activeModule, lessons, projects, progress, evidenceVersion],
  );

  // 2. Exact Step-Level Lesson Resume Info
  const lessonResume = useMemo(
    () => getLessonStepResumeInfo(lessonId, progress.lessonsCompleted),
    [lessonId, progress.lessonsCompleted, evidenceVersion],
  );

  // 3. Project Milestone & Verified vs Self-Reported Evidence
  const { activeProject, hasAnyStartedProject } = useMemo(
    () => evaluateAtelierProjects(projects, progress),
    [projects, progress],
  );

  const verifiedProjectTasksMap = useMemo(
    () => getVerifiedProjectTasks(),
    [evidenceVersion],
  );

  const projectEvidenceStats = useMemo(() => {
    if (!activeProject) return { verifiedCount: 0, selfReportedCount: 0, totalCount: 0 };
    const pid = activeProject.project.id;
    const allTasks = activeProject.project.milestones.flatMap((m) => m.tasks || []);
    let verifiedCount = 0;
    let selfReportedCount = 0;
    allTasks.forEach((t) => {
      const key = `${pid}:${t.id}`;
      if (verifiedProjectTasksMap[key]) {
        verifiedCount += 1;
      } else if (progress.projectTasks?.[key]) {
        selfReportedCount += 1;
      }
    });
    return {
      verifiedCount,
      selfReportedCount,
      totalCount: allTasks.length,
    };
  }, [activeProject, verifiedProjectTasksMap, progress.projectTasks]);

  // 4. Capability & Evidence Ledger Summary (Tier 3)
  const capabilityLedger = useMemo(() => {
    const records = getCapabilityEvidenceRecords();
    const verifiedRecords = records.filter(
      (r) => r.status === "mastered" || r.status === "demonstrated",
    );
    const needsReviewRecords = records.filter((r) => r.status === "needs-review");
    const totalVerifiedCapabilities =
      completedCount +
      Object.keys(verifiedProjectTasksMap).length +
      verifiedRecords.length;

    return {
      totalVerifiedCapabilities,
      needsReviewRecords,
      recentVerified: verifiedRecords.slice(0, 3),
    };
  }, [completedCount, verifiedProjectTasksMap, evidenceVersion]);

  const greetingText = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning, Builder";
    if (hour < 18) return "Good afternoon, Builder";
    return "Good evening, Builder";
  }, []);

  return (
    <section aria-label="Guided Engineering Workshop" className="space-y-6 w-full min-w-0">
      {/* Top Studio Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="inline-flex flex-wrap items-center gap-2 text-xs font-semibold text-[#4F6BFF] dark:text-[#8DA2FF]">
            <span>Guided Engineering Workshop</span>
            <span aria-hidden="true">·</span>
            <span>{moduleTitle}</span>
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0E1B3D] dark:text-white">
            {isBrandNewLearner ? "Welcome to Forge Academia" : greetingText}
          </h1>
        </div>

        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <HandwrittenCallout rotation="-rotate-2" className="text-xl text-[#4F6BFF]">
            Learn → Practice → Build → Verify ✨
          </HandwrittenCallout>
        </div>
      </div>

      {/* TIER 1 — PRIMARY FOCUS: "Your Next Step" (Single Reasoned Recommendation) */}
      <div
        className="relative overflow-hidden rounded-[28px] border-2 border-[#4F6BFF]/35 bg-gradient-to-br from-white via-[#F8FAFF] to-[#EEF2FF] p-5 sm:p-7 shadow-[0_18px_45px_-15px_rgba(79,107,255,0.16)] dark:border-[#4F6BFF]/40 dark:from-[#131E3A] dark:via-[#172342] dark:to-[#1D294D]"
        data-testid="dashboard-tier1-next-step"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3.5 max-w-3xl min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#4F6BFF] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white">
                <Sparkles className="h-3 w-3" />
                <span>Your Next Step</span>
              </span>
              <span className="font-mono text-xs font-semibold text-[#4F6BFF] dark:text-[#8DA2FF]">
                {nextStep.eyebrow}
              </span>
              <span aria-hidden="true" className="text-xs text-[#4A5578]">
                ·
              </span>
              <span className="inline-flex items-center gap-1 font-mono text-xs text-[#4A5578] dark:text-[#CBD5F0]">
                <Clock className="h-3.5 w-3.5 text-[#4F6BFF]" />
                <span>~{nextStep.estimatedMinutes} min</span>
              </span>
            </div>

            <div className="space-y-1.5">
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0E1B3D] dark:text-white">
                {nextStep.title}
              </h2>
              <p className="text-sm sm:text-[15px] leading-relaxed text-[#4A5578] dark:text-[#CBD5F0]">
                <strong className="font-semibold text-[#0E1B3D] dark:text-white">
                  Why this next:{" "}
                </strong>
                {nextStep.reason}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2.5 shrink-0">
            <Link
              to={nextStep.to as never}
              params={nextStep.params as never}
              search={nextStep.search as never}
              className="inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-2xl bg-[#4F6BFF] px-6 py-3 font-display text-sm font-extrabold text-white shadow-[0_12px_28px_-6px_rgba(79,107,255,0.55)] transition-all hover:-translate-y-0.5 hover:bg-[#3B53D9]"
            >
              <span>{nextStep.ctaLabel}</span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>

            {isBrandNewLearner && onOpenDiagnostic && (
              <button
                type="button"
                onClick={onOpenDiagnostic}
                className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-[#C9BBFF] bg-white px-3.5 py-2 text-xs font-bold text-[#0E1B3D] transition-colors hover:border-[#4F6BFF] hover:text-[#4F6BFF] dark:border-white/15 dark:bg-[#0B1226] dark:text-white"
              >
                <Compass className="h-3.5 w-3.5 shrink-0 text-[#4F6BFF]" />
                <span>Experienced? Take 60s Skill Check</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TIER 2 — SECONDARY: "Continue Where You Left Off" (Exact Activity & Milestone Resume) */}
      <div
        className="grid grid-cols-1 gap-5 lg:grid-cols-12"
        data-testid="dashboard-tier2-resume"
      >
        {/* Left (6 cols): Exact Lesson Step Resume Card */}
        <div className="lg:col-span-6 flex flex-col justify-between rounded-[24px] border border-[#E5DFD3] bg-white p-5 sm:p-6 shadow-xs dark:border-white/10 dark:bg-[#131E3A]">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#4F6BFF] dark:text-[#8DA2FF]">
                <BookOpen className="h-3.5 w-3.5" />
                <span>Active Lesson State</span>
              </span>
              <span className="rounded-full bg-[#EEF2FF] px-2.5 py-0.5 font-mono text-[11px] font-bold text-[#4F6BFF] dark:bg-[#1D294D] dark:text-[#8DA2FF]">
                {lessonResume.status === "in-progress" && lessonResume.totalSteps > 0
                  ? `In Progress · Step ${lessonResume.currentStepIndex + 1} of ${lessonResume.totalSteps}`
                  : lessonResume.status === "completed"
                    ? "Completed"
                    : "Ready to Start"}
              </span>
            </div>

            <div>
              <h3 className="font-display text-lg font-extrabold text-[#0E1B3D] dark:text-white">
                {lessonTitle}
              </h3>
              <p className="mt-1 text-xs text-[#4A5578] dark:text-[#CBD5F0]">
                {lessonResume.status === "in-progress" && lessonResume.totalSteps > 0
                  ? `Saved at Step ${lessonResume.currentStepIndex + 1}/${lessonResume.totalSteps} (${lessonResume.completedStepCount} steps completed, ${lessonResume.verifiedStepCount} interactive checks verified).`
                  : `Module: ${moduleTitle} · ${completedCount}/${totalLessons} curriculum lessons completed.`}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#E5DFD3]/70 pt-3.5 dark:border-white/10">
            <span className="font-mono text-xs text-[#4A5578] dark:text-[#CBD5F0]">
              {lessonResume.needsAttentionStepIds.length > 0
                ? `${lessonResume.needsAttentionStepIds.length} step flagged for review`
                : "Exact step state auto-saved"}
            </span>
            <Link
              to="/lesson/$lessonId"
              params={{ lessonId }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#EEF2FF] px-3.5 py-2 text-xs font-bold text-[#4F6BFF] hover:bg-[#4F6BFF] hover:text-white transition-colors dark:bg-[#1D294D] dark:text-[#8DA2FF]"
            >
              <span>
                {lessonResume.status === "in-progress"
                  ? `Resume Step ${lessonResume.currentStepIndex + 1}`
                  : "Open Lesson"}
              </span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Right (6 cols): Active Project Milestone & Verification Status */}
        <div className="lg:col-span-6 flex flex-col justify-between rounded-[24px] border border-[#E5DFD3] bg-white p-5 sm:p-6 shadow-xs dark:border-white/10 dark:bg-[#131E3A]">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                <FolderKanban className="h-3.5 w-3.5" />
                <span>Active Project Milestone</span>
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                {projectEvidenceStats.verifiedCount} Verified ·{" "}
                {projectEvidenceStats.selfReportedCount} Self-Reported
              </span>
            </div>

            <div>
              <h3 className="font-display text-lg font-extrabold text-[#0E1B3D] dark:text-white">
                {activeProject?.project.title ?? "Personal Portfolio Website"}
              </h3>
              <p className="mt-1 text-xs text-[#4A5578] dark:text-[#CBD5F0]">
                {hasAnyStartedProject
                  ? `${projectEvidenceStats.verifiedCount} of ${projectEvidenceStats.totalCount} tasks verified in Playground (${projectEvidenceStats.selfReportedCount} self-reported).`
                  : "Build and verify project milestones directly in the browser Playground without local setup."}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#E5DFD3]/70 pt-3.5 dark:border-white/10">
            <Link
              to="/projects/$projectId"
              params={{ projectId: activeProject?.project.id ?? "personal-portfolio" }}
              className="text-xs font-semibold text-[#4A5578] hover:text-[#0E1B3D] hover:underline dark:text-[#CBD5F0]"
            >
              View Milestone Spec
            </Link>
            <Link
              to="/playground"
              search={{ projectId: activeProject?.project.id ?? "personal-portfolio" }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600/10 px-3.5 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors dark:text-emerald-300"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Build &amp; Verify in Playground</span>
            </Link>
          </div>
        </div>
      </div>

      {/* TIER 3 — TERTIARY: "Your Capability & Evidence Ledger" */}
      <div
        className="rounded-[24px] border border-[#E5DFD3] bg-white p-5 sm:p-6 shadow-xs dark:border-white/10 dark:bg-[#131E3A]"
        data-testid="dashboard-tier3-capabilities"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1E1B4B] border border-[#6E6AF6]/40">
              <ForgeBuddyMascot3D
                mood={capabilityLedger.needsReviewRecords.length > 0 ? "thinking" : "happy"}
                className="h-10 w-10"
                animate={false}
              />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#4F6BFF] dark:text-[#8DA2FF]">
                Your Capability &amp; Evidence Ledger
              </div>
              <h3 className="font-display text-base sm:text-lg font-extrabold text-[#0E1B3D] dark:text-white">
                Demonstrated Engineering Capabilities
              </h3>
              <p className="text-xs text-[#4A5578] dark:text-[#CBD5F0]">
                Progress is backed by verified interactive checks, runnable Playground milestones, and rubric evaluations.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:flex sm:items-center sm:gap-3 shrink-0">
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/8 px-3 py-2 text-center">
              <div className="flex items-center justify-center gap-1 font-mono text-base font-extrabold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                <span>{capabilityLedger.totalVerifiedCapabilities}</span>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                Verified
              </div>
            </div>

            <div className="rounded-xl border border-[#4F6BFF]/25 bg-[#EEF2FF]/70 px-3 py-2 text-center dark:bg-[#1D294D]">
              <div className="font-mono text-base font-extrabold text-[#4F6BFF] dark:text-[#8DA2FF]">
                {lessonResume.status === "in-progress" ? 1 : 0}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#4A5578] dark:text-[#CBD5F0]">
                In Progress
              </div>
            </div>

            <div className="rounded-xl border border-amber-500/25 bg-amber-500/8 px-3 py-2 text-center">
              <div className="flex items-center justify-center gap-1 font-mono text-base font-extrabold text-amber-700 dark:text-amber-300">
                <AlertTriangle className="h-4 w-4" />
                <span>
                  {capabilityLedger.needsReviewRecords.length +
                    projectEvidenceStats.selfReportedCount}
                </span>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                Needs Verification
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
