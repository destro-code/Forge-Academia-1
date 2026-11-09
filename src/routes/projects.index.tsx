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
  getVerifiedProjectTasks,
  useLearnerEvidenceVersion,
} from "@/lib/learning-engine/evidence-store";
import {
  Clock,
  ArrowRight,
  CheckCircle2,
  FolderGit2,
  Sparkles,
  Layers,
  ShieldCheck,
} from "lucide-react";
import type { Difficulty, ProjectExperienceKind } from "@/lib/types";

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "Projects · Forge Academia" },
      {
        name: "description",
        content:
          "Guided Builds and curriculum-linked Module Projects from beginner HTML & CSS to full-stack React & TypeScript architectures.",
      },
      { property: "og:title", content: "Projects · Forge Academia" },
      { property: "og:description", content: "Build portfolio-ready frontend projects." },
    ],
  }),
  component: Projects,
});

const EXPERIENCE_FILTERS: Array<{
  id: "all" | ProjectExperienceKind;
  label: string;
  summary: string;
}> = [
  {
    id: "all",
    label: "All Projects",
    summary:
      "Both step-by-step Guided Builds (focused task slots) and independent Module Projects (multi-file deliverables).",
  },
  {
    id: "guided-build",
    label: "Guided Builds",
    summary:
      "Construct one evolving website step by step in a focused task slot without IDE clutter.",
  },
  {
    id: "module-project",
    label: "Module Projects",
    summary:
      "Apply module concepts with greater independence across a complete multi-file project workspace.",
  },
];

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
  useLearnerEvidenceVersion();
  const verifiedTasksMap = getVerifiedProjectTasks();

  const [selectedExperience, setSelectedExperience] = useState<"all" | ProjectExperienceKind>(
    "all",
  );
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | "All">("All");

  const guidedBuildsCount = projects.filter(
    (p) =>
      p.projectKind === "guided-build" ||
      (!p.projectKind && p.defaultPlaygroundMode === "beginner"),
  ).length;
  const moduleProjectsCount = projects.length - guidedBuildsCount;

  // Calculate global stats (preferring sandbox-verified tasks, falling back to checked tasks)
  const totalTasksAllProjects = projects.reduce((acc, p) => {
    const pTaskCount = p.milestones.reduce((mAcc, m) => mAcc + (m.tasks?.length || 0), 0);
    return acc + pTaskCount;
  }, 0);

  const verifiedTasksAllProjects = projects.reduce((acc, p) => {
    const countInP = p.milestones.reduce((mAcc, m) => {
      return (
        mAcc +
        (m.tasks || []).filter((t) => Boolean(verifiedTasksMap[`${p.id}:${t.id}`])).length
      );
    }, 0);
    return acc + countInP;
  }, 0);

  const completedTasksAllProjects = projects.reduce((acc, p) => {
    const countInP = p.milestones.reduce((mAcc, m) => {
      return (
        mAcc +
        (m.tasks || []).filter((t) =>
          Boolean(verifiedTasksMap[`${p.id}:${t.id}`] || projectTasks[`${p.id}:${t.id}`]),
        ).length
      );
    }, 0);
    return acc + countInP;
  }, 0);

  const overallProgressPercent = Math.round(
    (completedTasksAllProjects / Math.max(totalTasksAllProjects, 1)) * 100,
  );

  const filteredProjects = projects.filter((p) => {
    const resolvedKind: ProjectExperienceKind =
      p.projectKind || (p.defaultPlaygroundMode === "beginner" ? "guided-build" : "module-project");
    const matchesExperience =
      selectedExperience === "all" || resolvedKind === selectedExperience;
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "All" || p.difficulty === selectedDifficulty;
    return matchesExperience && matchesCategory && matchesDifficulty;
  });

  const activeExperienceMeta =
    EXPERIENCE_FILTERS.find((f) => f.id === selectedExperience) ?? EXPERIENCE_FILTERS[0];

  return (
    <div className="space-y-8 pb-12 w-full min-w-0">
      {/* Creative Atelier Project Academy Hero */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        aria-label="Project workshop"
        className="relative overflow-hidden rounded-3xl border border-border bg-card p-5 sm:p-8 lg:p-10 shadow-sm"
      >
        <div className="relative z-10 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
          <div className="space-y-4 lg:col-span-8">
            <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-primary dark:text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>The Maker&apos;s Workbench · Guided Builds &amp; Module Projects</span>
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl dark:text-foreground">
              From guided website construction to{" "}
              <span className="text-primary dark:text-primary">
                independent module deliverables.
              </span>
            </h1>
            <p className="max-w-2xl text-sm sm:text-base leading-relaxed text-muted-foreground dark:text-muted-foreground">
              Start with step-by-step <strong>Guided Builds</strong> that focus on one task slot at
              a time, then prove your engineering fluency in multi-file{" "}
              <strong>Module Projects</strong>.
            </p>

            {/* Progress Bar & Stats inside Hero */}
            <div className="max-w-xl rounded-2xl border border-border bg-card/90 p-4 shadow-xs dark:border-white/10 dark:bg-muted/40">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-foreground dark:text-foreground">
                <span>
                  {guidedBuildsCount} Guided Builds · {moduleProjectsCount} Module Projects ·{" "}
                  {verifiedTasksAllProjects} Verified / {totalTasksAllProjects} Tasks
                </span>
                <span className="font-mono text-primary tabular-nums dark:text-primary">
                  {overallProgressPercent}%
                </span>
              </div>
              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted dark:bg-card/10">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{
                    width: `${Math.max(overallProgressPercent, completedTasksAllProjects > 0 ? 5 : 2)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <motion.div
            className="flex flex-col items-center justify-center lg:col-span-4"
          >
            <div className="flex items-end justify-center gap-2">
              <ForgeBuddyMascot3D mood="coding" className="h-28 w-28 shrink-0" />
              <ProjectWorkbench3D className="h-32 sm:h-36 w-full max-w-[180px]" />
            </div>
            <HandwrittenCallout
              rotation="rotate-2"
              className="mt-1 text-xl text-primary dark:text-primary"
            >
              Build live in the browser — zero setup! ✨
            </HandwrittenCallout>
          </motion.div>
        </div>
      </motion.section>

      {/* Experience Architecture Filter + Category & Difficulty Filter Bar */}
      <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-xs dark:border-white/10 dark:bg-card">
        {/* Top Row: Guided Builds vs Module Projects Experience Selector */}
        <div className="flex flex-col gap-2 border-b border-border/80 pb-3 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
          <div
            className="flex flex-wrap gap-1.5"
            role="tablist"
            aria-label="Project experience kind"
          >
            {EXPERIENCE_FILTERS.map((exp) => {
              const active = selectedExperience === exp.id;
              const count =
                exp.id === "all"
                  ? projects.length
                  : exp.id === "guided-build"
                    ? guidedBuildsCount
                    : moduleProjectsCount;
              return (
                <button
                  key={exp.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  data-testid={`filter-experience-${exp.id}`}
                  onClick={() => setSelectedExperience(exp.id)}
                  className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                    active
                      ? "bg-foreground text-white shadow-xs dark:bg-primary"
                      : "bg-muted text-muted-foreground hover:text-foreground dark:bg-muted/40 dark:text-muted-foreground"
                  }`}
                >
                  <span>{exp.label}</span>
                  <span className="font-mono text-[11px] opacity-80">({count})</span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground dark:text-muted-foreground">{activeExperienceMeta.summary}</p>
        </div>

        {/* Bottom Row: Category & Difficulty Pills */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelectedCategory(cat)}
                  className={`min-h-[36px] rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                    active
                      ? "bg-primary text-white shadow-xs"
                      : "bg-muted text-muted-foreground hover:text-foreground dark:bg-muted/40 dark:text-muted-foreground"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

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
                      ? "bg-foreground text-white dark:bg-[#FFE08A] dark:text-foreground"
                      : "border border-border bg-card text-muted-foreground hover:border-primary dark:border-white/15 dark:bg-muted/40 dark:text-muted-foreground"
                  }`}
                >
                  {diff}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Projects Grid — Project Title is the Hero */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={<FolderGit2 className="h-6 w-6" />}
          title="No Matching Projects Found"
          description="No portfolio projects match your selected experience, category, or difficulty level."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedExperience("all");
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
            const isGuidedBuild =
              project.projectKind === "guided-build" ||
              (!project.projectKind && project.defaultPlaygroundMode === "beginner");

            const projectTaskCount = project.milestones.reduce(
              (acc, m) => acc + (m.tasks?.length || 0),
              0,
            );
            const verifiedProjectTaskCount = project.milestones.reduce((acc, m) => {
              const verifiedInM = (m.tasks || []).filter((t) =>
                Boolean(verifiedTasksMap[`${project.id}:${t.id}`]),
              ).length;
              return acc + verifiedInM;
            }, 0);
            const completedProjectTaskCount = project.milestones.reduce((acc, m) => {
              const finishedInM = (m.tasks || []).filter((t) =>
                Boolean(
                  verifiedTasksMap[`${project.id}:${t.id}`] ||
                    projectTasks[`${project.id}:${t.id}`],
                ),
              ).length;
              return acc + finishedInM;
            }, 0);

            const projectProgressPercent =
              projectTaskCount > 0
                ? Math.round((completedProjectTaskCount / projectTaskCount) * 100)
                : 0;

            const isFullyCompleted =
              projectTaskCount > 0 && completedProjectTaskCount === projectTaskCount;

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
                  className={`group flex h-full flex-col justify-between overflow-hidden rounded-[26px] border p-5 sm:p-6 shadow-sm transition-colors hover:shadow-md ${
                    isGuidedBuild
                      ? "border-primary/40 bg-card hover:border-primary"
                      : "border-border bg-card hover:border-primary/60 dark:border-white/10 dark:bg-card"
                  }`}
                >
                  <div className="space-y-3.5">
                    {/* 1. Experience Kind + Category + Difficulty */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          data-testid={`card-kind-${project.id}`}
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${
                            isGuidedBuild
                              ? "border-info/40 bg-info/10 text-info dark:border-info/40 dark:bg-info/15 dark:text-info"
                              : "border-primary/35 bg-primary/10 text-primary dark:border-primary/35 dark:bg-primary/15 dark:text-primary"
                          }`}
                        >
                          {isGuidedBuild ? (
                            <Sparkles className="h-2.5 w-2.5" />
                          ) : (
                            <Layers className="h-2.5 w-2.5" />
                          )}
                          <span>{isGuidedBuild ? "Guided Build" : "Module Project"}</span>
                        </span>
                        {project.category && (
                          <span className="font-mono text-[11px] font-semibold text-muted-foreground dark:text-muted-foreground">
                            · {project.category}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground dark:text-muted-foreground">
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
                      <h2 className="font-display text-xl font-extrabold tracking-tight text-foreground group-hover:text-primary transition-colors dark:text-foreground dark:group-hover:text-primary">
                        {project.title}
                      </h2>
                      {project.subtitle && (
                        <p className="mt-1 text-xs font-semibold text-primary dark:text-primary">
                          {project.subtitle}
                        </p>
                      )}
                    </div>

                    {/* 3. Scannable 2-Line Description */}
                    <p className="line-clamp-2 text-xs sm:text-sm leading-relaxed text-muted-foreground dark:text-muted-foreground">
                      {project.description}
                    </p>

                    {/* Clean Tech Stack Tags */}
                    {(project.tags || []).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1 font-mono text-[11px] text-muted-foreground dark:text-muted-foreground">
                        {(project.tags || []).slice(0, 4).map((tag, i) => (
                          <span key={tag}>
                            {i > 0 && <span className="mr-1.5">·</span>}#{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 4. Progress & Action Footer */}
                  <div className="mt-6 space-y-3.5 border-t border-border/70 pt-4 dark:border-white/10">
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono text-xs text-muted-foreground tabular-nums dark:text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          {verifiedProjectTaskCount > 0 && (
                            <ShieldCheck className="h-3.5 w-3.5 text-success shrink-0" />
                          )}
                          <span>
                            {project.milestones.length} milestones · {completedProjectTaskCount}/
                            {projectTaskCount} tasks
                          </span>
                        </span>
                        <span className="font-bold text-foreground dark:text-foreground">
                          {projectProgressPercent}%
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted dark:bg-card/10">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500"
                          style={{
                            width: `${Math.max(projectProgressPercent, completedProjectTaskCount > 0 ? 6 : 2)}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-0.5 text-xs">
                      <span className="inline-flex items-center gap-1.5 font-mono text-muted-foreground dark:text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 text-warning" /> ~{project.estimatedHours}h
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 font-display text-xs font-extrabold text-primary-foreground shadow-xs transition-transform group-hover:translate-x-0.5 group-hover:bg-primary/90">
                        <span>
                          {projectProgressPercent > 0
                            ? isGuidedBuild
                              ? "Continue Guided Build"
                              : "Continue Module Project"
                            : isGuidedBuild
                              ? "Start Guided Build"
                              : "Start Module Project"}
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
