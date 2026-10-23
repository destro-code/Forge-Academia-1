import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { DifficultyBadge } from "@/components/shared/difficulty-badge";
import { EmptyState } from "@/components/shared/empty-state";
import {
  ForgeBuddyMascot3D,
  HandwrittenCallout,
  ProjectWorkbench3D,
} from "@/components/atelier/forge-buddy-illos";
import { useProjects } from "@/lib/hooks/use-content";
import { useProgress } from "@/lib/hooks/use-progress";
import {
  Clock,
  ArrowRight,
  CheckCircle2,
  FolderGit2,
  Sparkles,
  Layers,
} from "lucide-react";
import type { Difficulty } from "@/lib/types";

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "Projects · Forge Academia" },
      {
        name: "description",
        content:
          "Guided portfolio projects from beginner HTML & CSS builds to full-stack React & TypeScript architectures.",
      },
      { property: "og:title", content: "Projects · Forge Academia" },
      { property: "og:description", content: "Build portfolio-ready frontend projects." },
    ],
  }),
  component: Projects,
});

const CATEGORIES = [
  "All",
  "HTML & CSS",
  "Design Systems",
  "Language Mastery",
  "State Management",
  "Architecture",
  "Full-stack",
];

const DIFFICULTIES: ("All" | Difficulty)[] = [
  "All",
  "Beginner",
  "Intermediate",
  "Advanced",
];

function Projects() {
  const projects = useProjects();
  const { projectTasks = {} } = useProgress();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | "All">("All");

  // Calculate global stats
  const totalTasksAllProjects = projects.reduce((acc, p) => {
    const pTaskCount = p.milestones.reduce((mAcc, m) => mAcc + (m.tasks?.length || 0), 0);
    return acc + pTaskCount;
  }, 0);

  const completedTasksAllProjects = Object.values(projectTasks).filter(Boolean).length;
  const overallProgressPercent = Math.round(
    (completedTasksAllProjects / Math.max(totalTasksAllProjects, 1)) * 100,
  );

  const filteredProjects = projects.filter((p) => {
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "All" || p.difficulty === selectedDifficulty;
    return matchesCategory && matchesDifficulty;
  });

  return (
    <div className="space-y-8 pb-12 w-full min-w-0">
      {/* Creative Atelier Project Academy Hero */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        aria-label="Project workshop"
        className="relative overflow-hidden rounded-[28px] sm:rounded-[34px] border border-[#E5DFD3] bg-gradient-to-br from-[#FFFDF9] via-[#F5F7FF] to-[#EDE9FE] p-5 sm:p-8 lg:p-10 shadow-[0_20px_50px_-18px_rgba(14,27,61,0.09)] dark:border-white/10 dark:from-[#0F1830] dark:via-[#131E3A] dark:to-[#1D294D]"
      >
        <div className="relative z-10 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
          <div className="space-y-4 lg:col-span-8">
            <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#4F6BFF] dark:text-[#8DA2FF]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>The Maker&apos;s Workbench · Guided Portfolio Builds</span>
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#0E1B3D] sm:text-4xl dark:text-white">
              From your first HTML &amp; CSS page to{" "}
              <span className="text-[#4F6BFF] dark:text-[#8DA2FF]">
                production React systems.
              </span>
            </h1>
            <p className="max-w-2xl text-sm sm:text-base leading-relaxed text-[#4A5578] dark:text-[#CBD5F0]">
              Start with the Beginner HTML &amp; CSS Personal Launchpad right after Track 01, then
              level up to interactive component libraries, TypeScript migrations, and full-stack
              apps.
            </p>

            {/* Progress Bar & Stats inside Hero */}
            <div className="max-w-xl rounded-2xl border border-[#C9BBFF]/60 bg-white/90 p-4 shadow-xs dark:border-white/10 dark:bg-[#0B1226]/80">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-[#0E1B3D] dark:text-white">
                <span>
                  {projects.length} Guided Builds · {completedTasksAllProjects}/
                  {totalTasksAllProjects} Tasks Checked Off
                </span>
                <span className="font-mono text-[#4F6BFF] tabular-nums dark:text-[#8DA2FF]">
                  {overallProgressPercent}%
                </span>
              </div>
              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[#E5DFD3]/70 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#4F6BFF] via-[#7B91FF] to-[#A7E3D1] transition-all duration-500"
                  style={{
                    width: `${Math.max(overallProgressPercent, completedTasksAllProjects > 0 ? 5 : 2)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <motion.div
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center justify-center lg:col-span-4"
          >
            <div className="flex items-end justify-center gap-2">
              <ForgeBuddyMascot3D mood="coding" className="h-28 w-28 shrink-0" />
              <ProjectWorkbench3D className="h-32 sm:h-36 w-full max-w-[180px]" />
            </div>
            <HandwrittenCallout
              rotation="rotate-2"
              className="mt-1 text-xl text-[#1E3A8A] dark:text-[#FFE08A]"
            >
              Build live in the browser — zero setup! ✨
            </HandwrittenCallout>
          </motion.div>
        </div>
      </motion.section>

      {/* Clean Category & Difficulty Filter Bar (No Duplicate Search Bar) */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#E5DFD3] bg-white p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between dark:border-white/10 dark:bg-[#131E3A]">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                aria-pressed={active}
                onClick={() => setSelectedCategory(cat)}
                className={`min-h-[38px] rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                  active
                    ? "bg-[#4F6BFF] text-white shadow-xs"
                    : "bg-[#F4EFE6] text-[#4A5578] hover:text-[#0E1B3D] dark:bg-[#0B1226] dark:text-[#CBD5F0]"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Difficulty Pills */}
        <div className="flex flex-wrap gap-1.5">
          {DIFFICULTIES.map((diff) => {
            const active = selectedDifficulty === diff;
            return (
              <button
                key={diff}
                type="button"
                aria-pressed={active}
                onClick={() => setSelectedDifficulty(diff)}
                className={`min-h-[36px] rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                  active
                    ? "bg-[#0E1B3D] text-white dark:bg-[#FFE08A] dark:text-[#0E1B3D]"
                    : "border border-[#E5DFD3] bg-[#FFFDF9] text-[#4A5578] hover:border-[#4F6BFF] dark:border-white/15 dark:bg-[#0B1226] dark:text-[#CBD5F0]"
                }`}
              >
                {diff}
              </button>
            );
          })}
        </div>
      </div>

      {/* Projects Grid — Project Title is the Hero */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={<FolderGit2 className="h-6 w-6" />}
          title="No Matching Projects Found"
          description="No portfolio projects match your selected category or difficulty level."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCategory("All");
                setSelectedDifficulty("All");
              }}
            >
              Reset Filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project, idx) => {
            const projectTaskCount = project.milestones.reduce(
              (acc, m) => acc + (m.tasks?.length || 0),
              0,
            );
            const completedProjectTaskCount = project.milestones.reduce((acc, m) => {
              const finishedInM = (m.tasks || []).filter(
                (t) => projectTasks[`${project.id}:${t.id}`],
              ).length;
              return acc + finishedInM;
            }, 0);

            const projectProgressPercent =
              projectTaskCount > 0
                ? Math.round((completedProjectTaskCount / projectTaskCount) * 100)
                : 0;

            const isFullyCompleted =
              projectTaskCount > 0 && completedProjectTaskCount === projectTaskCount;
            const isBeginnerStarter = project.difficulty === "Beginner";

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.04, 0.3), duration: 0.35 }}
                whileHover={{ y: -4 }}
                className="h-full"
              >
                <Link
                  to="/projects/$projectId"
                  params={{ projectId: project.id }}
                  className={`group flex h-full flex-col justify-between overflow-hidden rounded-[26px] border p-5 sm:p-6 shadow-[0_14px_34px_-12px_rgba(14,27,61,0.07)] transition-all hover:shadow-[0_20px_42px_-14px_rgba(79,107,255,0.18)] ${
                    isBeginnerStarter
                      ? "border-[#A7E3D1] bg-gradient-to-b from-[#F2FBF7] via-white to-white hover:border-[#0F7656] dark:border-[#A7E3D1]/40 dark:from-[#064E3B]/25 dark:via-[#131E3A] dark:to-[#131E3A]"
                      : "border-[#E5DFD3] bg-white hover:border-[#4F6BFF]/60 dark:border-white/10 dark:bg-[#131E3A]"
                  }`}
                >
                  <div className="space-y-3.5">
                    {/* 1. Category + Difficulty + Milestones */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-bold ${
                          isBeginnerStarter
                            ? "border-[#A7E3D1] bg-[#E8F8F2] text-[#0F7656] dark:border-[#A7E3D1]/40 dark:bg-[#0F7656]/25 dark:text-[#A7E3D1]"
                            : "border-[#C9BBFF] bg-[#EEF2FF] text-[#4F6BFF] dark:border-white/15 dark:bg-[#1D294D] dark:text-[#8DA2FF]"
                        }`}
                      >
                        <Layers className="h-3 w-3" />
                        <span>{project.category || "Guided Build"}</span>
                      </span>

                      <div className="flex items-center gap-2 font-mono text-xs text-[#4A5578] dark:text-[#CBD5F0]">
                        <DifficultyBadge difficulty={project.difficulty} />
                        {isFullyCompleted && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#0F7656] px-2 py-0.5 text-[10px] font-bold text-white">
                            <CheckCircle2 className="h-3 w-3" /> Done
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 2. Hero Project Title & Subtitle */}
                    <div>
                      <h2 className="font-display text-xl font-extrabold tracking-tight text-[#0E1B3D] group-hover:text-[#4F6BFF] transition-colors dark:text-white dark:group-hover:text-[#8DA2FF]">
                        {project.title}
                      </h2>
                      {project.subtitle && (
                        <p className="mt-1 text-xs font-semibold text-[#4F6BFF] dark:text-[#8DA2FF]">
                          {project.subtitle}
                        </p>
                      )}
                    </div>

                    {/* 3. Scannable 2-Line Description */}
                    <p className="line-clamp-2 text-xs sm:text-sm leading-relaxed text-[#4A5578] dark:text-[#CBD5F0]">
                      {project.description}
                    </p>

                    {/* Clean Tech Stack Tags */}
                    {(project.tags || []).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1 font-mono text-[11px] text-[#7B86A6] dark:text-[#94A3C9]">
                        {(project.tags || []).slice(0, 4).map((tag, i) => (
                          <span key={tag}>
                            {i > 0 && <span className="mr-1.5">·</span>}#{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 4. Progress & Action Footer */}
                  <div className="mt-6 space-y-3.5 border-t border-[#E5DFD3]/70 pt-4 dark:border-white/10">
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono text-xs text-[#4A5578] tabular-nums dark:text-[#94A3C9]">
                        <span>
                          {project.milestones.length} milestones · {completedProjectTaskCount}/
                          {projectTaskCount} tasks
                        </span>
                        <span className="font-bold text-[#0E1B3D] dark:text-white">
                          {projectProgressPercent}%
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-[#E5DFD3]/70 dark:bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#4F6BFF] to-[#A7E3D1] transition-all duration-500"
                          style={{
                            width: `${Math.max(projectProgressPercent, completedProjectTaskCount > 0 ? 6 : 2)}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-0.5 text-xs">
                      <span className="inline-flex items-center gap-1.5 font-mono text-[#4A5578] dark:text-[#CBD5F0]">
                        <Clock className="h-3.5 w-3.5 text-[#D97706]" /> ~{project.estimatedHours}h
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#4F6BFF] px-4 py-2 font-display text-xs font-extrabold text-white shadow-xs transition-transform group-hover:translate-x-0.5 group-hover:bg-[#3B53D9]">
                        <span>
                          {projectProgressPercent > 0 ? "Continue Build" : "Start Project"}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
