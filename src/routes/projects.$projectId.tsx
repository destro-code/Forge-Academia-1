import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DifficultyBadge } from "@/components/shared/difficulty-badge";
import { AIProjectMentorCard } from "@/components/project/ai-project-mentor-card";
import { useProject } from "@/lib/hooks/use-content";
import { useProgress } from "@/lib/hooks/use-progress";
import {
  getVerifiedProjectTasks,
  getTaskEvidenceStatus,
  useLearnerEvidenceVersion,
} from "@/lib/learning-engine/evidence-store";
import { getProjectVerificationReports } from "@/lib/learning-engine/project-verifier";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Layers,
  CheckSquare,
  ListChecks,
  ExternalLink,
  BookOpen,
  Sparkles,
  Copy,
  Github,
  Globe,
  HelpCircle,
  Award,
  ShieldCheck,
  FileText,
  Lightbulb,
  Code2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/projects/$projectId")({
  head: () => ({
    meta: [
      { title: "Project Academy · Forge" },
      {
        name: "description",
        content:
          "Guided project workspace — tasks, milestones, acceptance criteria, reflections, and portfolio notes.",
      },
      { property: "og:title", content: "Forge Project Workspace" },
      { property: "og:description", content: "Build, reflect and add to portfolio." },
    ],
  }),
  component: ProjectView,
});

function ProjectView() {
  const { projectId } = Route.useParams();
  const project = useProject(projectId);

  const {
    projectTasks = {},
    projectCriteria = {},
    projectReflections = {},
    projectPortfolioNotes = {},
    toggleProjectTask,
    toggleProjectCriteria,
    saveProjectReflection,
    saveProjectPortfolioNotes,
  } = useProgress();

  useLearnerEvidenceVersion();

  if (!project) {
    return (
      <div className="space-y-4 py-12 text-center">
        <h2 className="text-xl font-bold">Project Not Found</h2>
        <p className="text-sm text-muted-foreground">
          The requested project workspace could not be found.
        </p>
        <Button asChild variant="outline">
          <Link to="/projects">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Project Academy
          </Link>
        </Button>
      </div>
    );
  }

  const verifiedTasksMap = getVerifiedProjectTasks();
  const verificationReports = getProjectVerificationReports(project.id);

  // Calculate project tasks progress (Verified vs Self-Reported)
  const allTasks = project.milestones.flatMap((m) => m.tasks || []);
  const totalTasks = allTasks.length;
  const completedTasksCount = allTasks.filter(
    (t) => projectTasks[`${project.id}:${t.id}`] || verifiedTasksMap[`${project.id}:${t.id}`],
  ).length;
  const verifiedTasksCount = allTasks.filter(
    (t) => Boolean(verifiedTasksMap[`${project.id}:${t.id}`]),
  ).length;
  const selfReportedTasksCount = Math.max(0, completedTasksCount - verifiedTasksCount);
  const taskProgressPercent = Math.round((completedTasksCount / Math.max(totalTasks, 1)) * 100);

  // Calculate criteria progress
  const criteriaList = project.acceptanceCriteria || [];
  const totalCriteria = criteriaList.length;
  const completedCriteriaCount = criteriaList.filter(
    (c) => projectCriteria[`${project.id}:${c.id}`],
  ).length;

  // Saved Reflection & Portfolio state
  const savedReflection = projectReflections[project.id] || {
    challenge: "",
    solution: "",
    learned: "",
    scaleRefactor: "",
  };

  const savedPortfolio = projectPortfolioNotes[project.id] || {
    repoUrl: "",
    demoUrl: "",
    customBullets: "",
    highlight: "",
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <div className="space-y-8">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild className="-ml-2">
          <Link to="/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Project Academy
          </Link>
        </Button>

        {completedTasksCount === totalTasks && totalTasks > 0 ? (
          <Badge className="bg-emerald-600 hover:bg-emerald-600 gap-1.5 py-1 px-3">
            <CheckCircle2 className="h-4 w-4" /> Fully Completed
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1.5 py-1 px-3 font-mono">
            <Clock className="h-3.5 w-3.5 text-primary" /> {completedTasksCount}/{totalTasks} Tasks
            Done
          </Badge>
        )}
      </div>

      <PageHeader
        eyebrow={`Guided Project · ${project.category || "Frontend"}`}
        title={project.title}
        description={project.description}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <DifficultyBadge difficulty={project.difficulty} />
            <Badge variant="outline">~{project.estimatedHours} Hours</Badge>
            <Button
              asChild
              size="sm"
              className="h-8 text-xs gap-1.5 bg-[#6E6AF6] hover:bg-[#5B57E6] text-white shadow-xs"
            >
              <Link to="/playground" search={{ projectId: project.id }}>
                <Code2 className="h-3.5 w-3.5" /> Build in Playground (Zero Setup)
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="h-8 text-xs gap-1.5 shadow-glow bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Link to="/interview" search={{ projectId: project.id }}>
                <Award className="h-3.5 w-3.5" /> Evaluate in Mock Interview
              </Link>
            </Button>
          </div>
        }
      />

      {/* Zero-Setup In-Browser Project Builder Callout */}
      <div className="rounded-2xl border border-[#6E6AF6]/35 bg-gradient-to-r from-[#1E1B4B] via-[#27235C] to-[#1E1B4B] p-5 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#FBBF24]">
            <Sparkles className="h-3.5 w-3.5 text-[#A78BFA]" />
            <span>Zero-Setup Browser Workbench</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white">
            Build {project.title} right inside Forge — no local downloads required
          </h3>
          <p className="text-xs sm:text-sm text-[#C7D2FE] max-w-2xl">
            Launch the pre-configured multi-file Playground with starter HTML, CSS, and JS files plus your interactive task checklist docked right above the editor.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            asChild
            className="bg-[#6E6AF6] hover:bg-[#5B57E6] text-white font-bold gap-2"
          >
            <Link to="/playground" search={{ projectId: project.id }}>
              <Code2 className="h-4 w-4" />
              Launch Project in Playground
            </Link>
          </Button>
        </div>
      </div>

      {/* Progress Stats Summary Banner */}
      <Card className="border-border/60 bg-card/50">
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-3 items-center">
            <div className="space-y-2 md:col-span-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Tasks Progress Checklist</span>
                <span className="text-primary">{taskProgressPercent}% Complete</span>
              </div>
              <Progress value={taskProgressPercent} className="h-2.5" />
            </div>

            <div className="flex items-center justify-around border-t md:border-t-0 md:border-l border-border/60 pt-4 md:pt-0 pl-0 md:pl-6 text-center">
              <div>
                <div className="text-2xl font-extrabold text-emerald-500 font-mono">
                  {verifiedTasksCount}/{totalTasks}
                </div>
                <div className="text-[11px] text-muted-foreground uppercase font-semibold">
                  Verified in Playground
                </div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-amber-500 font-mono">
                  {selfReportedTasksCount}
                </div>
                <div className="text-[11px] text-muted-foreground uppercase font-semibold">
                  Self-Reported
                </div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-primary font-mono">
                  {completedCriteriaCount}/{totalCriteria}
                </div>
                <div className="text-[11px] text-muted-foreground uppercase font-semibold">
                  Criteria Checked
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workspace Tabs */}
      <Tabs defaultValue="tasks" className="w-full space-y-6">
        <TabsList className="bg-muted/50 p-1 flex w-full overflow-x-auto whitespace-nowrap scrollbar-none h-auto gap-1 justify-start border border-border/40 rounded-lg">
          <TabsTrigger value="tasks" className="gap-1.5 text-xs py-2 shrink-0">
            <CheckSquare className="h-3.5 w-3.5" />
            Tasks ({completedTasksCount}/{totalTasks})
          </TabsTrigger>
          <TabsTrigger value="criteria" className="gap-1.5 text-xs py-2 shrink-0">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Acceptance Criteria ({completedCriteriaCount}/{totalCriteria})
          </TabsTrigger>
          <TabsTrigger value="resources" className="gap-1.5 text-xs py-2 shrink-0">
            <BookOpen className="h-3.5 w-3.5 text-amber-400" />
            Resources ({project.resources?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="reflection" className="gap-1.5 text-xs py-2 shrink-0">
            <FileText className="h-3.5 w-3.5 text-purple-400" />
            Reflection
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="gap-1.5 text-xs py-2 shrink-0">
            <Award className="h-3.5 w-3.5 text-cyan-400" />
            Portfolio Notes
          </TabsTrigger>
          <TabsTrigger
            value="ai-mentor"
            className="gap-1.5 text-xs py-2 border border-primary/30 bg-primary/5 text-primary shrink-0"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-300 fill-amber-300/30" />
            AI Project Mentor
          </TabsTrigger>
        </TabsList>

        {/* --- TAB 1: TASKS & MILESTONES --- */}
        <TabsContent value="tasks" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8 space-y-6">
              {project.milestones.map((milestone) => {
                const milestoneTasks = milestone.tasks || [];
                const doneInM = milestoneTasks.filter(
                  (t) =>
                    projectTasks[`${project.id}:${t.id}`] ||
                    verifiedTasksMap[`${project.id}:${t.id}`],
                ).length;
                const verifiedInM = milestoneTasks.filter(
                  (t) => Boolean(verifiedTasksMap[`${project.id}:${t.id}`]),
                ).length;
                const isMilestoneVerified =
                  milestoneTasks.length > 0 && verifiedInM === milestoneTasks.length;
                const isMilestoneDone =
                  milestoneTasks.length > 0 && doneInM === milestoneTasks.length;

                return (
                  <Card key={milestone.id} className="border-border/60 overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b border-border/40 py-4 px-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <CardTitle className="text-base font-bold">{milestone.title}</CardTitle>
                            {isMilestoneVerified ? (
                              <Badge className="bg-emerald-600 hover:bg-emerald-600 text-[10px]">
                                Verified Milestone
                              </Badge>
                            ) : isMilestoneDone ? (
                              <Badge variant="outline" className="border-amber-500/40 text-amber-500 text-[10px]">
                                Self-Reported · Ready to Verify
                              </Badge>
                            ) : null}
                          </div>
                          <CardDescription className="text-xs">
                            {milestone.description}
                          </CardDescription>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center shrink-0">
                          <Badge variant="outline" className="text-xs font-mono">
                            {verifiedInM}/{milestoneTasks.length} Verified
                          </Badge>
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1.5 border-[#6E6AF6]/40 text-[#6E6AF6] hover:bg-[#6E6AF6]/10"
                          >
                            <Link
                              to="/playground"
                              search={{ projectId: project.id, milestoneId: milestone.id }}
                            >
                              <Code2 className="h-3.5 w-3.5" />
                              <span>Build &amp; Verify Milestone</span>
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-4 space-y-3">
                      {milestoneTasks.map((task) => {
                        const taskKey = `${project.id}:${task.id}`;
                        const evidenceStatus = getTaskEvidenceStatus(
                          project.id,
                          task.id,
                          projectTasks,
                          verifiedTasksMap,
                        );
                        const isChecked =
                          evidenceStatus === "verified" || evidenceStatus === "self-reported";

                        return (
                          <div
                            key={task.id}
                            className={`p-3.5 rounded-lg border transition-all ${
                              evidenceStatus === "verified"
                                ? "bg-emerald-500/5 border-emerald-500/30"
                                : isChecked
                                  ? "bg-muted/20 border-border/40"
                                  : "bg-card border-border hover:border-primary/40"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <Checkbox
                                id={taskKey}
                                checked={isChecked}
                                onCheckedChange={() => toggleProjectTask(project.id, task.id)}
                                className="mt-0.5 h-5 w-5 shrink-0"
                              />
                              <div className="space-y-1 flex-1">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <label
                                    htmlFor={taskKey}
                                    className={`text-sm font-semibold cursor-pointer select-none block ${
                                      isChecked ? "line-through text-muted-foreground" : ""
                                    }`}
                                  >
                                    {task.title}
                                  </label>
                                  {evidenceStatus === "verified" ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                      <ShieldCheck className="h-3 w-3" />
                                      Verified in Playground
                                    </span>
                                  ) : evidenceStatus === "self-reported" ? (
                                    <div className="flex items-center gap-1.5">
                                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                        Self-Reported Only
                                      </span>
                                      <Link
                                        to="/playground"
                                        search={{
                                          projectId: project.id,
                                          milestoneId: milestone.id,
                                        }}
                                        className="text-[11px] font-semibold text-[#6E6AF6] hover:underline"
                                      >
                                        Verify in Sandbox →
                                      </Link>
                                    </div>
                                  ) : null}
                                </div>
                                {task.description && (
                                  <p className="text-xs text-muted-foreground leading-relaxed">
                                    {task.description}
                                  </p>
                                )}
                                {(() => {
                                  const taskCheck =
                                    verificationReports[milestone.id]?.taskResults?.[task.id];
                                  if (!taskCheck) return null;
                                  return taskCheck.passed ? (
                                    <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 pt-1">
                                      ✓ Verified check: {taskCheck.criteriaChecked[0] || "Passed acceptance criteria"}
                                    </p>
                                  ) : (
                                    <p className="text-[11px] text-rose-500 pt-1">
                                      Needs verification: {taskCheck.failedReasons[0]}
                                    </p>
                                  );
                                })()}

                                {task.hints && task.hints.length > 0 && (
                                  <Accordion type="single" collapsible className="mt-2 w-full">
                                    <AccordionItem
                                      value={`hint-${task.id}`}
                                      className="border-none"
                                    >
                                      <AccordionTrigger className="py-1 text-[11px] text-amber-400 font-medium hover:no-underline">
                                        <span className="flex items-center gap-1">
                                          <Lightbulb className="h-3 w-3" /> Diagnostic Hint
                                        </span>
                                      </AccordionTrigger>
                                      <AccordionContent className="p-2 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
                                        {task.hints.join(" ")}
                                      </AccordionContent>
                                    </AccordionItem>
                                  </Accordion>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Sidebar Overview */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="border-border/60">
                <CardHeader className="py-4 px-5 border-b border-border/40">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" /> Architectural Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4 text-xs text-muted-foreground leading-relaxed">
                  <p>{project.overview || project.description}</p>

                  <div className="space-y-2 pt-2 border-t border-border/40">
                    <span className="text-xs font-semibold text-foreground">
                      Technologies & Tags
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(project.tags || []).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[11px]">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* --- TAB 2: ACCEPTANCE CRITERIA --- */}
        <TabsContent value="criteria" className="space-y-6">
          <Card className="border-border/60">
            <CardHeader className="py-4 px-5 border-b border-border/40">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> Quality Verification Checklist
              </CardTitle>
              <CardDescription className="text-xs">
                Before adding this project to your resume or portfolio, verify that your
                implementation satisfies all technical acceptance criteria.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              {criteriaList.map((crit) => {
                const critKey = `${project.id}:${crit.id}`;
                const isVerified = !!projectCriteria[critKey];

                const getCategoryBadge = (cat: string) => {
                  switch (cat) {
                    case "a11y":
                      return (
                        <Badge variant="outline" className="text-purple-400 border-purple-500/30">
                          Accessibility (A11y)
                        </Badge>
                      );
                    case "performance":
                      return (
                        <Badge variant="outline" className="text-amber-400 border-amber-500/30">
                          Performance
                        </Badge>
                      );
                    case "architecture":
                      return (
                        <Badge variant="outline" className="text-indigo-400 border-indigo-500/30">
                          Architecture
                        </Badge>
                      );
                    default:
                      return (
                        <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                          Functional
                        </Badge>
                      );
                  }
                };

                return (
                  <div
                    key={crit.id}
                    className={`p-4 rounded-lg border transition-all ${
                      isVerified
                        ? "bg-emerald-500/5 border-emerald-500/30"
                        : "bg-card border-border hover:border-border/80"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={critKey}
                        checked={isVerified}
                        onCheckedChange={() => toggleProjectCriteria(project.id, crit.id)}
                        className="mt-1"
                      />
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <label
                            htmlFor={critKey}
                            className={`text-sm font-semibold cursor-pointer select-none ${
                              isVerified ? "text-emerald-400" : "text-foreground"
                            }`}
                          >
                            {crit.title}
                          </label>
                          {getCategoryBadge(crit.category)}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {crit.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TAB 3: RESOURCES --- */}
        <TabsContent value="resources" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {(project.resources || []).map((res, idx) => (
              <Card key={idx} className="border-border/60 hover:border-primary/40 transition">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="uppercase text-[10px]">
                      {res.type}
                    </Badge>
                    <Button size="icon" variant="ghost" asChild className="h-7 w-7">
                      <a href={res.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
                      </a>
                    </Button>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{res.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {res.description}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" asChild className="w-full text-xs">
                    <a href={res.url} target="_blank" rel="noopener noreferrer">
                      Open Resource <ExternalLink className="ml-1.5 h-3 w-3" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* --- TAB 4: REFLECTION --- */}
        <TabsContent value="reflection" className="space-y-6">
          <Card className="border-border/60">
            <CardHeader className="py-4 px-5 border-b border-border/40">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-400" /> Guided Developer Self-Reflection
              </CardTitle>
              <CardDescription className="text-xs">
                Reflecting on architectural hurdles prepares you for technical behavioral interview
                questions (e.g. Amazon LP, Staff level trade-offs).
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">
                  1. What was the most challenging technical hurdle during this build?
                </label>
                <Textarea
                  placeholder="Describe the bug, race condition, state bug, or rendering issue you encountered..."
                  value={savedReflection.challenge}
                  onChange={(e) => saveProjectReflection(project.id, { challenge: e.target.value })}
                  className="text-xs min-h-24 font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">
                  2. How did you resolve the issue? What trade-offs were made?
                </label>
                <Textarea
                  placeholder="Explain your diagnostic path and ultimate solution..."
                  value={savedReflection.solution}
                  onChange={(e) => saveProjectReflection(project.id, { solution: e.target.value })}
                  className="text-xs min-h-24 font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">
                  3. What key pattern or technique did you master?
                </label>
                <Textarea
                  placeholder="e.g. Compound component context, optimistic state rollback, etc..."
                  value={savedReflection.learned}
                  onChange={(e) => saveProjectReflection(project.id, { learned: e.target.value })}
                  className="text-xs min-h-20 font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">
                  4. How would you refactor this system for 10x scale?
                </label>
                <Textarea
                  placeholder="e.g. WebWorkers, Virtualized lists, Server-Sent Events..."
                  value={savedReflection.scaleRefactor}
                  onChange={(e) =>
                    saveProjectReflection(project.id, { scaleRefactor: e.target.value })
                  }
                  className="text-xs min-h-20 font-mono"
                />
              </div>

              <div className="pt-2 text-right">
                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                  <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-400" /> Auto-saved locally
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TAB 5: PORTFOLIO NOTES --- */}
        <TabsContent value="portfolio" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Resume Bullet Point Generator */}
            <div className="lg:col-span-7 space-y-6">
              <Card className="border-border/60">
                <CardHeader className="py-4 px-5 border-b border-border/40">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-cyan-400" /> Resume & Interview Bullet Points
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Copy these industry-proven achievement bullets directly into your resume or
                    LinkedIn project section.
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  {(project.portfolioTips || []).map((tip, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-muted/20 border border-border/50 rounded-lg space-y-2 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {tip.category}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(tip.bullet, "Resume Bullet")}
                          className="h-7 text-xs gap-1 opacity-80 hover:opacity-100"
                        >
                          <Copy className="h-3 w-3" /> Copy
                        </Button>
                      </div>
                      <p className="text-xs font-mono text-foreground leading-relaxed">
                        {tip.bullet}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Live Demo & GitHub Links */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="border-border/60">
                <CardHeader className="py-4 px-5 border-b border-border/40">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" /> Portfolio Links & Showcase
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium flex items-center gap-1.5">
                      <Github className="h-3.5 w-3.5" /> GitHub Repository URL
                    </label>
                    <Input
                      placeholder="https://github.com/yourusername/project-repo"
                      value={savedPortfolio.repoUrl}
                      onChange={(e) =>
                        saveProjectPortfolioNotes(project.id, { repoUrl: e.target.value })
                      }
                      className="text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-primary" /> Live Demo Deployment URL
                    </label>
                    <Input
                      placeholder="https://my-project-demo.vercel.app"
                      value={savedPortfolio.demoUrl}
                      onChange={(e) =>
                        saveProjectPortfolioNotes(project.id, { demoUrl: e.target.value })
                      }
                      className="text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Custom Highlight Summary</label>
                    <Textarea
                      placeholder="Add custom talking points for recruiter screen calls..."
                      value={savedPortfolio.highlight}
                      onChange={(e) =>
                        saveProjectPortfolioNotes(project.id, { highlight: e.target.value })
                      }
                      className="text-xs min-h-24 font-mono"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        {/* --- TAB 6: AI PROJECT MENTOR (SPRINT 18) --- */}
        <TabsContent value="ai-mentor" className="space-y-6">
          <AIProjectMentorCard
            project={project}
            completedTasksCount={completedTasksCount}
            totalTasksCount={totalTasks}
            projectTasks={projectTasks}
            projectCriteria={projectCriteria}
            reflectionInfo={savedReflection}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
