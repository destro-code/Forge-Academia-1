import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DifficultyBadge } from "@/components/shared/difficulty-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { useProjects } from "@/lib/hooks/use-content";
import { useProgress } from "@/lib/hooks/use-progress";
import { Clock, ArrowRight, Search, CheckCircle2, FolderGit2, Sparkles } from "lucide-react";
import { useState } from "react";
import type { Difficulty } from "@/lib/types";

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "Project Academy · Forge" },
      {
        name: "description",
        content:
          "Guided portfolio projects with tasks, milestones, acceptance criteria, reflections, and resume bullet generators.",
      },
      { property: "og:title", content: "Project Academy · Forge" },
      { property: "og:description", content: "Build production-grade projects for your resume." },
    ],
  }),
  component: Projects,
});

const CATEGORIES = ["All", "Design Systems", "State Management", "Full-stack"];
const DIFFICULTIES: ("All" | Difficulty)[] = ["All", "Beginner", "Intermediate", "Advanced"];

function Projects() {
  const projects = useProjects();
  const { projectTasks = {} } = useProgress();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");

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
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.tags || []).some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Project Academy"
        title="Guided Engineering Builds"
        description="Ship portfolio-grade applications with step-by-step milestones, granular tasks, testable acceptance criteria, reflections, and resume bullet generators."
      />

      <section className="atelier-route-hero atelier-paper-grid relative isolate overflow-hidden rounded-3xl border border-border/70 p-5 sm:p-7 lg:p-8" aria-label="Project workshop">
        <div className="relative z-10 grid items-center gap-5 sm:grid-cols-[minmax(0,1fr)_180px] lg:grid-cols-[minmax(0,1fr)_220px]">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              <Sparkles className="h-3.5 w-3.5" /> The maker's workbench
            </div>
            <h2 className="font-display text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">From small experiments to portfolio pieces.</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">Choose a guided build, work through its milestones, and leave with something you can explain, improve, and show.</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-lg border border-border/70 bg-card/80 px-3 py-2 text-muted-foreground"><strong className="text-foreground">{projects.length}</strong> guided builds</span>
              <span className="rounded-lg border border-border/70 bg-card/80 px-3 py-2 text-muted-foreground"><strong className="text-foreground">{completedTasksAllProjects}</strong> tasks checked off</span>
            </div>
          </div>
          <div className="atelier-workshop-object mx-auto w-full max-w-[190px] sm:max-w-none" aria-hidden="true">
            <svg viewBox="0 0 220 200" className="w-full overflow-visible" fill="none">
              <defs>
                <linearGradient id="workshopTop" x1="62" y1="34" x2="151" y2="91" gradientUnits="userSpaceOnUse"><stop stopColor="#F8F4FF"/><stop offset="1" stopColor="#C9BBFF"/></linearGradient>
                <linearGradient id="workshopLeft" x1="60" y1="76" x2="111" y2="151" gradientUnits="userSpaceOnUse"><stop stopColor="#8DA2FF"/><stop offset="1" stopColor="#4F6BFF"/></linearGradient>
                <linearGradient id="workshopRight" x1="111" y1="75" x2="164" y2="150" gradientUnits="userSpaceOnUse"><stop stopColor="#FFE08A"/><stop offset="1" stopColor="#FF8C7A"/></linearGradient>
              </defs>
              <ellipse cx="111" cy="156" rx="68" ry="15" fill="#4F6BFF" fillOpacity=".12"/>
              <ellipse cx="111" cy="100" rx="84" ry="32" stroke="#8DA2FF" strokeOpacity=".7" strokeWidth="1.5" transform="rotate(-24 111 100)"/>
              <ellipse cx="111" cy="100" rx="84" ry="32" stroke="#A7E3D1" strokeOpacity=".8" strokeWidth="1.5" transform="rotate(36 111 100)"/>
              <g className="atelier-gem-spin">
                <path d="M111 35 164 67 111 99 58 67 111 35Z" fill="url(#workshopTop)" stroke="#0E1B3D" strokeOpacity=".25" strokeWidth="1.5"/>
                <path d="M58 67 111 99 111 161 58 129 58 67Z" fill="url(#workshopLeft)" stroke="#0E1B3D" strokeOpacity=".25" strokeWidth="1.5"/>
                <path d="M164 67 111 99 111 161 164 129 164 67Z" fill="url(#workshopRight)" stroke="#0E1B3D" strokeOpacity=".25" strokeWidth="1.5"/>
                <path d="M111 35V99M58 67 111 130 164 67" stroke="#FFF" strokeOpacity=".7" strokeWidth="1.5"/>
              </g>
              <circle cx="38" cy="76" r="5" fill="#A7E3D1"/><circle cx="180" cy="52" r="4" fill="#FF8C7A"/>
              <path d="m183 125 4 8 9 1-7 6 2 9-8-4-8 4 2-9-7-6 9-1 4-8Z" fill="#FFE08A" stroke="#0E1B3D" strokeOpacity=".2"/>
            </svg>
          </div>
        </div>
      </section>

      {/* Global Progress Dashboard */}
      <Card className="border-border/60 bg-gradient-to-r from-card via-muted/30 to-card">
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-4 items-center">
            <div className="flex items-center gap-4 md:col-span-2">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                <FolderGit2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  Project Academy Progress
                  <Badge variant="outline" className="text-xs">
                    {projects.length} Guided Projects
                  </Badge>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {completedTasksAllProjects} of {totalTasksAllProjects} tasks completed (
                  {overallProgressPercent}%)
                </p>
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Total Engineering Milestones Progress</span>
                <span className="font-semibold text-foreground">{overallProgressPercent}%</span>
              </div>
              <Progress value={overallProgressPercent} className="h-2.5" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search & Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects, tech stack, or tags..."
              className="pl-9 text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
            {/* Category Pills */}
            <div className="flex flex-wrap gap-1">
              {CATEGORIES.map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSelectedCategory(cat)}
                    className={`min-h-9 rounded-full px-3 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <div className="h-4 w-px bg-border hidden sm:block mx-1" />

            {/* Difficulty Pills */}
            <div className="flex flex-wrap gap-1">
              {DIFFICULTIES.map((diff) => {
                const active = selectedDifficulty === diff;
                return (
                  <button
                    key={diff}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`min-h-9 rounded-full px-3 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${active ? "bg-primary text-primary-foreground" : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"}`}
                  >
                    {diff}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        projects.length === 0 ? (
          <EmptyState
            icon={<FolderGit2 className="h-6 w-6" />}
            title="No Projects Available"
            description="There are currently no guided projects available in the catalog."
          />
        ) : (
          <EmptyState
            icon={<Search className="h-6 w-6" />}
            title="No Matching Projects Found"
            description="No portfolio projects match your current category, difficulty, or search terms."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCategory("All");
                  setSelectedDifficulty("All");
                  setSearchQuery("");
                }}
              >
                Reset Filters
              </Button>
            }
          />
        )
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => {
            // Calculate project specific task stats
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

            return (
              <Link key={project.id} to="/projects/$projectId" params={{ projectId: project.id }}>
                <Card className="h-full border-border/60 transition-all hover:border-primary/50 hover:shadow-glow flex flex-col justify-between group overflow-hidden relative">
                  {isFullyCompleted && (
                    <div className="absolute top-3 right-3 z-10">
                      <Badge className="bg-emerald-600 hover:bg-emerald-600 gap-1 text-[10px]">
                        <CheckCircle2 className="h-3 w-3" /> Completed
                      </Badge>
                    </div>
                  )}

                  <CardContent className="p-6 flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <DifficultyBadge difficulty={project.difficulty} />
                      {project.category && (
                        <Badge variant="outline" className="text-xs">
                          {project.category}
                        </Badge>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                      {project.subtitle && (
                        <p className="text-xs text-primary/80 font-medium mt-0.5">
                          {project.subtitle}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground line-clamp-3 mt-2 leading-relaxed">
                        {project.description}
                      </p>
                    </div>

                    {/* Task Progress Bar */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                        <span>
                          Tasks: {completedProjectTaskCount}/{projectTaskCount}
                        </span>
                        <span>{projectProgressPercent}%</span>
                      </div>
                      <Progress value={projectProgressPercent} className="h-1.5" />
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {(project.tags || []).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px] py-0">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>

                  <div className="bg-muted/20 border-t border-border/40 p-4 px-6 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> ~{project.estimatedHours} hours
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-primary group-hover:translate-x-1 transition-transform">
                      {projectProgressPercent > 0 ? "Continue Build" : "Start Project"}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
