import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
import { LessonCodeEditor } from "@/components/shared/lesson-editor";
import { GuidedTaskSlotEditor } from "@/components/projects/guided-task-slot-editor";
import { ForgeBuddyMascot3D } from "@/components/atelier/forge-buddy-illos";
import { useProject } from "@/lib/hooks/use-content";
import { useProgress } from "@/lib/hooks/use-progress";
import {
  getVerifiedProjectTasks,
  getTaskEvidenceStatus,
  markProjectTasksVerified,
  unmarkProjectTasksVerified,
  recordCapabilityEvidence,
  useLearnerEvidenceVersion,
} from "@/lib/learning-engine/evidence-store";
import {
  verifyProjectMilestone,
  verifyProjectMilestoneInRuntime,
  getProjectVerificationReports,
  getTaskVerificationCriteria,
  type TaskVerificationCheckResult,
} from "@/lib/learning-engine/project-verifier";
import { buildProjectWorkspaceFiles } from "@/lib/project-workspace-templates";
import { compilePlaygroundProject, buildPlaygroundHtml } from "@/lib/playground-compiler";
import type { PlaygroundFile } from "@/lib/types/playground";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
  CheckSquare,
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
  Play,
  RotateCcw,
  Eye,
  AlertTriangle,
  X,
} from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";

type ProjectStudioSearch = {
  milestoneId?: string;
  taskId?: string;
  lessonId?: string;
};

const PROJECT_STUDIO_STORAGE_PREFIX = "forge_project_studio_files_v1_";

const FALLBACK_AVATAR_DATA_URI =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none"><rect width="120" height="120" rx="60" fill="#312E81"/><circle cx="60" cy="46" r="22" fill="#A5B4FC"/><path d="M24 106c6-20 22-32 36-32s30 12 36 32" fill="#818CF8"/></svg>`,
  );

function sanitizeWorkspaceFiles(files: PlaygroundFile[]): PlaygroundFile[] {
  return files.map((file) => ({
    ...file,
    code: (file.code || "").replace(
      /https:\/\/images\.unsplash\.com\/[^\s"'<>]+/g,
      FALLBACK_AVATAR_DATA_URI,
    ),
  }));
}

export const Route = createFileRoute("/projects/$projectId")({
  validateSearch: (search: Record<string, unknown>): ProjectStudioSearch => ({
    milestoneId: typeof search.milestoneId === "string" ? search.milestoneId : undefined,
    taskId: typeof search.taskId === "string" ? search.taskId : undefined,
    lessonId: typeof search.lessonId === "string" ? search.lessonId : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Guided Project Studio · Forge Academia" },
      {
        name: "description",
        content:
          "Guided project coaching studio — step-by-step tasks, live preview, task verification, and portfolio notes.",
      },
      { property: "og:title", content: "Forge Guided Project Studio" },
      { property: "og:description", content: "Build, verify, and reflect on real frontend projects." },
    ],
  }),
  component: ProjectView,
});

function ProjectView() {
  const { projectId } = Route.useParams();
  const searchParams = Route.useSearch();
  const navigate = useNavigate();
  const project = useProject(projectId);

  const {
    projectTasks = {},
    projectCriteria = {},
    projectReflections = {},
    projectPortfolioNotes = {},
    toggleProjectCriteria,
    markProjectCompleted,
    saveProjectReflection,
    saveProjectPortfolioNotes,
  } = useProgress();

  useLearnerEvidenceVersion();

  const verifiedTasksMap = getVerifiedProjectTasks();
  const verificationReports = project ? getProjectVerificationReports(project.id) : {};

  // Active Milestone & Task Selection (defaults to URL search param or first unverified task)
  const initialSelection = useMemo(() => {
    if (!project || project.milestones.length === 0) {
      return { milestoneId: "m1", taskId: "t1" };
    }
    if (searchParams.milestoneId) {
      const m =
        project.milestones.find((item) => item.id === searchParams.milestoneId) ??
        project.milestones[0];
      const t =
        m.tasks.find((item) => item.id === searchParams.taskId) ?? m.tasks[0];
      return { milestoneId: m.id, taskId: t?.id ?? "t1" };
    }
    for (const m of project.milestones) {
      for (const t of m.tasks) {
        if (!verifiedTasksMap[`${project.id}:${t.id}`]) {
          return { milestoneId: m.id, taskId: t.id };
        }
      }
    }
    const firstM = project.milestones[0];
    return { milestoneId: firstM.id, taskId: firstM.tasks[0]?.id ?? "t1" };
  }, [project, searchParams.milestoneId, searchParams.taskId, verifiedTasksMap]);

  const [activeMilestoneId, setActiveMilestoneId] = useState<string>(initialSelection.milestoneId);
  const [activeTaskId, setActiveTaskId] = useState<string>(initialSelection.taskId);

  useEffect(() => {
    if (searchParams.milestoneId) {
      setActiveMilestoneId(searchParams.milestoneId);
    }
    if (searchParams.taskId) {
      setActiveTaskId(searchParams.taskId);
    }
  }, [searchParams.milestoneId, searchParams.taskId]);

  const activeMilestone = useMemo(() => {
    if (!project) return null;
    return (
      project.milestones.find((m) => m.id === activeMilestoneId) ??
      project.milestones[0] ??
      null
    );
  }, [project, activeMilestoneId]);

  const activeTask = useMemo(() => {
    if (!activeMilestone) return null;
    return (
      activeMilestone.tasks.find((t) => t.id === activeTaskId) ??
      activeMilestone.tasks[0] ??
      null
    );
  }, [activeMilestone, activeTaskId]);

  const templateWorkspace = useMemo(() => {
    if (!project) return null;
    return buildProjectWorkspaceFiles(project, activeMilestone?.id, activeTask?.id);
  }, [project, activeMilestone?.id, activeTask?.id]);

  const [studioFiles, setStudioFiles] = useState<PlaygroundFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string>("");
  const [mobilePane, setMobilePane] = useState<"editor" | "preview">("editor");
  const [isVerifying, setIsVerifying] = useState(false);
  const [taskAttempts, setTaskAttempts] = useState<Record<string, number>>({});
  const [lastTaskResult, setLastTaskResult] = useState<TaskVerificationCheckResult | null>(null);
  const [platformError, setPlatformError] = useState<string | null>(null);
  const [hintIndexRevealed, setHintIndexRevealed] = useState<number>(0);
  const [buddyDismissedKey, setBuddyDismissedKey] = useState<string | null>(null);

  const isGuidedBuild = Boolean(
    project &&
      (project.projectKind === "guided-build" ||
        (!project.projectKind && project.defaultPlaygroundMode === "beginner")),
  );

  // Load or initialize persisted project studio files (with one-time migration from legacy playground key)
  useEffect(() => {
    if (!project || !templateWorkspace) return;
    const storageKey = `${PROJECT_STUDIO_STORAGE_PREFIX}${project.id}`;
    const legacyPlaygroundKey = `forge_playground_project_v1_${project.id}`;
    try {
      const savedRaw = window.localStorage.getItem(storageKey);
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw) as PlaygroundFile[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = sanitizeWorkspaceFiles(parsed);
          setStudioFiles(sanitized);
          setActiveFileId(sanitized[0].id);
          return;
        }
      }
      const legacyRaw = window.localStorage.getItem(legacyPlaygroundKey);
      if (legacyRaw) {
        const parsedLegacy = JSON.parse(legacyRaw) as
          | PlaygroundFile[]
          | { files?: PlaygroundFile[] };
        const candidateFiles = Array.isArray(parsedLegacy)
          ? parsedLegacy
          : Array.isArray(parsedLegacy?.files)
            ? parsedLegacy.files
            : [];
        if (candidateFiles.length > 0) {
          const sanitized = sanitizeWorkspaceFiles(candidateFiles);
          window.localStorage.setItem(storageKey, JSON.stringify(sanitized));
          setStudioFiles(sanitized);
          setActiveFileId(sanitized[0].id);
          return;
        }
      }
    } catch {
      // Fallback to template starter files
    }
    const initialFiles = sanitizeWorkspaceFiles(templateWorkspace.files);
    setStudioFiles(initialFiles);
    setActiveFileId(templateWorkspace.activeFileId || initialFiles[0]?.id || "");
  }, [project?.id]);

  // Auto-select the most relevant file when switching tasks (e.g. taskSlot.targetFile, TODO (Task N), or language cue)
  useEffect(() => {
    if (!activeTask || studioFiles.length === 0) return;
    setLastTaskResult(
      activeMilestone
        ? verificationReports[activeMilestone.id]?.taskResults?.[activeTask.id] ?? null
        : null,
    );
    setPlatformError(null);
    setHintIndexRevealed(0);

    if (activeTask.taskSlot?.targetFile) {
      const explicitTarget = studioFiles.find(
        (f) => f.name === activeTask.taskSlot?.targetFile || f.id === activeTask.taskSlot?.targetFile,
      );
      if (explicitTarget) {
        setActiveFileId(explicitTarget.id);
        return;
      }
    }

    const flatList = (project?.milestones || []).flatMap((m) => m.tasks || []);
    const taskNumber = flatList.findIndex((t) => t.id === activeTask.id) + 1;
    if (taskNumber > 0) {
      const todoRegex = new RegExp(`TODO\\s*\\(?Task\\s*${taskNumber}\\b`, "i");
      const fileWithTaskTodo = studioFiles.find((f) => todoRegex.test(f.code || ""));
      if (fileWithTaskTodo) {
        setActiveFileId(fileWithTaskTodo.id);
        return;
      }
    }

    const hasCssAssertion = activeTask.validationSpec?.assertions?.some(
      (a) => a.type === "css_rule",
    );
    const lowerDesc = `${activeTask.title} ${activeTask.description}`.toLowerCase();
    if (
      hasCssAssertion ||
      lowerDesc.includes("css") ||
      lowerDesc.includes(":root") ||
      lowerDesc.includes("flex") ||
      lowerDesc.includes("grid")
    ) {
      const cssFile = studioFiles.find((f) => f.language === "css" || f.name.endsWith(".css"));
      if (cssFile) {
        setActiveFileId(cssFile.id);
        return;
      }
    }
    if (
      lowerDesc.includes("javascript") ||
      lowerDesc.includes("event") ||
      lowerDesc.includes("queryselector") ||
      lowerDesc.includes("click") ||
      lowerDesc.includes("render")
    ) {
      const jsFile = studioFiles.find(
        (f) => f.language === "javascript" || f.name.endsWith(".js"),
      );
      if (jsFile) {
        setActiveFileId(jsFile.id);
        return;
      }
    }
    const htmlFile = studioFiles.find((f) => f.language === "html" || f.name.endsWith(".html"));
    if (htmlFile) {
      setActiveFileId(htmlFile.id);
    }
  }, [activeTask?.id, activeMilestone?.id]);

  const activeFile = useMemo(
    () => studioFiles.find((f) => f.id === activeFileId) ?? studioFiles[0] ?? null,
    [studioFiles, activeFileId],
  );

  const handleCodeChange = useCallback(
    (newCode: string) => {
      if (!project || !activeFile) return;
      setStudioFiles((prev) => {
        const next = prev.map((f) => (f.id === activeFile.id ? { ...f, code: newCode } : f));
        try {
          window.localStorage.setItem(
            `${PROJECT_STUDIO_STORAGE_PREFIX}${project.id}`,
            JSON.stringify(next),
          );
        } catch {
          // Ignore storage quota issues
        }
        return next;
      });
    },
    [project, activeFile],
  );

  // Compile live preview HTML from studioFiles
  const compiledPreview = useMemo(() => {
    if (!project || studioFiles.length === 0) {
      return { srcDoc: "", error: null as string | null };
    }
    try {
      const compiled = compilePlaygroundProject(studioFiles, {
        runtime: templateWorkspace?.runtime ?? "vanilla",
        entryFile: templateWorkspace?.entryFile ?? "index.html",
        title: project.title,
      });
      const srcDoc = buildPlaygroundHtml(
        compiled.html,
        compiled.css,
        compiled.js,
        compiled.headTags,
      );
      return {
        srcDoc,
        error: compiled.errors.length > 0 ? compiled.errors[0].message : null,
      };
    } catch (err) {
      return {
        srcDoc: "",
        error: err instanceof Error ? err.message : "Preview compilation failed.",
      };
    }
  }, [project, studioFiles, templateWorkspace]);

  const handleVerifyCurrentTask = useCallback(async () => {
    if (!project || !activeMilestone || !activeTask || studioFiles.length === 0) return;
    setIsVerifying(true);
    setPlatformError(null);
    const attemptCount = (taskAttempts[activeTask.id] ?? 0) + 1;
    setTaskAttempts((prev) => ({ ...prev, [activeTask.id]: attemptCount }));

    try {
      const report = await verifyProjectMilestoneInRuntime(
        activeMilestone,
        project,
        studioFiles,
      );
      const taskResult = report.taskResults[activeTask.id];
      setLastTaskResult(taskResult ?? null);

      const passedIds = Object.values(report.taskResults)
        .filter((r) => r.passed)
        .map((r) => r.taskId);
      const failedIds = Object.values(report.taskResults)
        .filter((r) => !r.passed)
        .map((r) => r.taskId);

      if (passedIds.length > 0) {
        markProjectTasksVerified(project.id, passedIds);
      }
      if (failedIds.length > 0) {
        unmarkProjectTasksVerified(project.id, failedIds);
      }

      const latestVerifiedMap = getVerifiedProjectTasks();
      const allProjectTaskIds = project.milestones.flatMap((m) =>
        (m.tasks || []).map((t) => t.id),
      );
      const isEntireProjectVerified =
        allProjectTaskIds.length > 0 &&
        allProjectTaskIds.every((tid) => Boolean(latestVerifiedMap[`${project.id}:${tid}`]));
      if (isEntireProjectVerified) {
        markProjectCompleted(project.id);
      }

      if (taskResult?.passed) {
        recordCapabilityEvidence({
          id: `project-task:${project.id}:${activeTask.id}`,
          title: `${project.title} — ${activeTask.title}`,
          sourceType: "project",
          sourceId: project.id,
          moduleId: project.moduleId,
          status: report.allPassed ? "mastered" : "demonstrated",
          evidenceStatus: "verified",
          summary: `Verified task "${activeTask.title}" (${taskResult.criteriaChecked.length} check${taskResult.criteriaChecked.length === 1 ? "" : "s"} passed).`,
        });
        toast.success(`Task verified: ${activeTask.title}`);
      } else {
        setBuddyDismissedKey(null);
        toast.error("Some task checks still need attention. Review the checklist below.");
      }
    } catch (err) {
      setPlatformError(
        err instanceof Error
          ? err.message
          : "The verification sandbox encountered a platform error. Your code was not marked incorrect.",
      );
    } finally {
      setIsVerifying(false);
    }
  }, [project, activeMilestone, activeTask, studioFiles, taskAttempts, markProjectCompleted]);

  const handleResetWorkspace = useCallback(() => {
    if (!project || !templateWorkspace) return;
    const starterFiles = sanitizeWorkspaceFiles(templateWorkspace.files);
    setStudioFiles(starterFiles);
    setActiveFileId(templateWorkspace.activeFileId || starterFiles[0]?.id || "");
    setLastTaskResult(null);
    setPlatformError(null);
    try {
      window.localStorage.removeItem(`${PROJECT_STUDIO_STORAGE_PREFIX}${project.id}`);
    } catch {
      // Ignore storage errors
    }
    const allMilestoneTaskIds = project.milestones.flatMap((m) => m.tasks.map((t) => t.id));
    unmarkProjectTasksVerified(project.id, allMilestoneTaskIds);
    toast.info("Workspace reset to the prepared starter code.");
  }, [project, templateWorkspace]);

  const handleLoadReferenceSolution = useCallback(() => {
    if (!project || !templateWorkspace) return;
    const solutionFiles = studioFiles.map((file) => ({
      ...file,
      code:
        templateWorkspace.solutionFiles[file.id] ??
        templateWorkspace.solutionFiles[file.name] ??
        file.code,
    }));
    const sanitized = sanitizeWorkspaceFiles(solutionFiles);
    setStudioFiles(sanitized);
    try {
      window.localStorage.setItem(
        `${PROJECT_STUDIO_STORAGE_PREFIX}${project.id}`,
        JSON.stringify(sanitized),
      );
    } catch {
      // Ignore storage errors
    }
    toast.info("Loaded reference implementation. Click 'Check Task' to verify and inspect how it works.");
  }, [project, templateWorkspace, studioFiles]);

  // Truthful Progress Calculation: Separate Verified vs Self-Reported
  const allTasks = (project?.milestones || []).flatMap((m) => m.tasks || []);
  const totalTasks = allTasks.length;
  const activeTaskFlatIndex = Math.max(
    0,
    allTasks.findIndex((t) => t.id === activeTask?.id),
  );
  const verifiedTasksCount = project
    ? allTasks.filter((t) => Boolean(verifiedTasksMap[`${project.id}:${t.id}`])).length
    : 0;
  const selfReportedTasksCount = project
    ? allTasks.filter(
        (t) =>
          Boolean(projectTasks[`${project.id}:${t.id}`]) &&
          !verifiedTasksMap[`${project.id}:${t.id}`],
      ).length
    : 0;
  const verifiedProgressPercent = Math.round(
    (verifiedTasksCount / Math.max(totalTasks, 1)) * 100,
  );

  // Next Task continuation resolution
  const nextTaskTarget = useMemo(() => {
    if (!project || !activeMilestone || !activeTask) return null;
    const currentTaskIdx = activeMilestone.tasks.findIndex((t) => t.id === activeTask.id);
    if (currentTaskIdx >= 0 && currentTaskIdx < activeMilestone.tasks.length - 1) {
      return {
        milestoneId: activeMilestone.id,
        task: activeMilestone.tasks[currentTaskIdx + 1],
      };
    }
    const currentMilestoneIdx = project.milestones.findIndex((m) => m.id === activeMilestone.id);
    if (currentMilestoneIdx >= 0 && currentMilestoneIdx < project.milestones.length - 1) {
      const nextM = project.milestones[currentMilestoneIdx + 1];
      if (nextM.tasks.length > 0) {
        return {
          milestoneId: nextM.id,
          task: nextM.tasks[0],
        };
      }
    }
    return null;
  }, [project, activeMilestone, activeTask]);

  const isActiveTaskVerified = Boolean(
    project && activeTask && verifiedTasksMap[`${project.id}:${activeTask.id}`],
  );
  const currentTaskAttempts = activeTask ? (taskAttempts[activeTask.id] ?? 0) : 0;

  // Contextual Forge Buddy Trigger Resolution (Non-intrusive, event-driven)
  const activeTaskCriteria = useMemo(() => {
    if (!activeTask || !activeMilestone) return [];
    return getTaskVerificationCriteria(activeTask, activeMilestone);
  }, [activeTask, activeMilestone]);

  const availableHints = useMemo(() => {
    if (!activeTask) return [];
    const list: string[] = [...(activeTask.hints || [])];
    for (const assertion of activeTask.validationSpec?.assertions || []) {
      if (assertion.hint && !list.includes(assertion.hint)) {
        list.push(assertion.hint);
      }
    }
    return list;
  }, [activeTask]);

  const forgeBuddyState = useMemo(() => {
    if (!activeTask) return null;
    if (platformError) {
      return {
        key: `platform-err:${activeTask.id}`,
        mood: "thinking" as const,
        badge: "Sandbox Diagnostic",
        title: "Platform Verification Notice (Not Your Fault)",
        message: platformError,
        tone: "amber" as const,
      };
    }
    if (isActiveTaskVerified && lastTaskResult?.passed) {
      return {
        key: `verified:${activeTask.id}`,
        mood: "proud" as const,
        badge: "Task Verified",
        title: `Verified: ${activeTask.title}`,
        message: `All ${lastTaskResult.criteriaChecked.length} required check${lastTaskResult.criteriaChecked.length === 1 ? "" : "s"} passed against your live implementation.`,
        tone: "emerald" as const,
      };
    }
    if (hintIndexRevealed > 0 && availableHints.length > 0) {
      const hintText =
        availableHints[Math.min(hintIndexRevealed - 1, availableHints.length - 1)];
      return {
        key: `hint:${activeTask.id}:${hintIndexRevealed}`,
        mood: "waving" as const,
        badge: `Coaching Hint ${Math.min(hintIndexRevealed, availableHints.length)} of ${availableHints.length}`,
        title: "Focused Next Step",
        message: hintText,
        tone: "indigo" as const,
      };
    }
    if (lastTaskResult && !lastTaskResult.passed && lastTaskResult.failedReasons.length > 0) {
      return {
        key: `failed:${activeTask.id}:${currentTaskAttempts}`,
        mood: "thinking" as const,
        badge: "Diagnostic Guidance",
        title: "Let's Adjust Your Implementation",
        message:
          lastTaskResult.failedReasons[0] +
          (availableHints[0] ? ` Tip: ${availableHints[0]}` : ""),
        tone: "amber" as const,
      };
    }
    return null;
  }, [
    activeTask,
    platformError,
    isActiveTaskVerified,
    lastTaskResult,
    hintIndexRevealed,
    availableHints,
    currentTaskAttempts,
  ]);

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

  const showForgeBuddy =
    forgeBuddyState !== null && buddyDismissedKey !== forgeBuddyState.key;

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

  const prerequisiteLessonId =
    searchParams.lessonId ||
    activeTask?.recommendedAfterLessonId ||
    activeMilestone?.recommendedAfterLessonId ||
    project.recommendedAfterLessonId;

  return (
    <div className="space-y-8 w-full min-w-0">
      {/* Top Bar Navigation & Truthful Verification Status */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" asChild className="-ml-2 h-9 text-xs font-semibold">
            <Link to="/projects">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              All Guided Projects
            </Link>
          </Button>
          {project.moduleId && (
            <>
              <span className="text-muted-foreground text-xs" aria-hidden="true">
                ·
              </span>
              <Link
                to="/learn/modules/$moduleId"
                params={{ moduleId: project.moduleId }}
                className="text-xs font-medium text-[#4F6BFF] hover:underline dark:text-[#8DA2FF]"
              >
                Module Overview
              </Link>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs tabular-nums">
          {verifiedTasksCount === totalTasks && totalTasks > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 font-bold text-emerald-700 dark:text-emerald-300">
              <ShieldCheck className="h-4 w-4" />
              All {totalTasks} Tasks Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1 font-semibold text-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              {verifiedTasksCount} of {totalTasks} Tasks Verified ({verifiedProgressPercent}%)
            </span>
          )}
        </div>
      </div>

      <PageHeader
        eyebrow={`${
          isGuidedBuild ? "Guided Build Studio" : "Module Project Studio"
        } · ${project.category || "Frontend"}`}
        title={project.title}
        description={project.description}
        actions={
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-mono">
            <span
              data-testid="project-kind-badge"
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${
                isGuidedBuild
                  ? "bg-[#4F6BFF]/12 text-[#4F6BFF] dark:bg-[#4F6BFF]/20 dark:text-[#A5B8FF]"
                  : "bg-amber-500/12 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300"
              }`}
            >
              {isGuidedBuild ? "Guided Build" : "Module Project"}
            </span>
            <DifficultyBadge difficulty={project.difficulty} />
            <span aria-hidden="true">·</span>
            <span>~{project.estimatedHours}h {isGuidedBuild ? "guided build" : "module project"}</span>
            {prerequisiteLessonId && (
              <>
                <span aria-hidden="true">·</span>
                <Link
                  to="/lesson/$lessonId"
                  params={{ lessonId: prerequisiteLessonId }}
                  className="inline-flex items-center gap-1 font-sans font-semibold text-[#4F6BFF] hover:underline dark:text-[#8DA2FF]"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Review Lesson
                </Link>
              </>
            )}
          </div>
        }
      />

      {/* =====================================================================
          SELF-CONTAINED GUIDED PROJECT COACHING STUDIO (Two-Zone 40/60 Layout)
         ===================================================================== */}
      {activeMilestone && activeTask && (
        <section
          aria-label="Guided Project Coaching Studio"
          data-testid="guided-project-studio"
          className="rounded-3xl border border-[#E5DFD3] bg-[#FFFDF9] p-4 sm:p-6 shadow-[0_18px_45px_-18px_rgba(14,27,61,0.08)] dark:border-white/10 dark:bg-[#131E3A] space-y-5"
        >
          {/* Milestone & Task Stepper Bar */}
          <div className="flex flex-col gap-3 border-b border-[#E5DFD3] pb-4 dark:border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Project milestones">
                {project.milestones.map((m, mIdx) => {
                  const isCurrentM = m.id === activeMilestone.id;
                  const mVerifiedCount = m.tasks.filter(
                    (t) => Boolean(verifiedTasksMap[`${project.id}:${t.id}`]),
                  ).length;
                  const isMComplete = m.tasks.length > 0 && mVerifiedCount === m.tasks.length;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      role="tab"
                      aria-selected={isCurrentM}
                      onClick={() => {
                        setActiveMilestoneId(m.id);
                        if (m.tasks[0]) setActiveTaskId(m.tasks[0].id);
                      }}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                        isCurrentM
                          ? "bg-[#4F6BFF] text-white shadow-2xs"
                          : "bg-white/80 text-[#4A5578] hover:text-[#0E1B3D] border border-[#E5DFD3] dark:bg-[#0B1226]/70 dark:text-[#CBD5F0] dark:border-white/10"
                      }`}
                    >
                      {isMComplete && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300 shrink-0" />}
                      <span>
                        Milestone {mIdx + 1} ({mVerifiedCount}/{m.tasks.length})
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-[#4A5578] dark:text-[#CBD5F0] tabular-nums">
                <span>
                  Verified Progress: <strong>{verifiedTasksCount}/{totalTasks}</strong>
                </span>
                {selfReportedTasksCount > 0 && (
                  <span>· {selfReportedTasksCount} self-reported</span>
                )}
              </div>
            </div>

            {/* Task Selector Pills within Active Milestone */}
            <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Milestone tasks">
              {activeMilestone.tasks.map((task, tIdx) => {
                const isCurrentT = task.id === activeTask.id;
                const isTaskVerified = Boolean(verifiedTasksMap[`${project.id}:${task.id}`]);
                return (
                  <button
                    key={task.id}
                    type="button"
                    role="tab"
                    aria-selected={isCurrentT}
                    onClick={() => setActiveTaskId(task.id)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                      isCurrentT
                        ? "border-2 border-[#4F6BFF] bg-[#EEF2FF] text-[#0E1B3D] dark:bg-[#1D294D] dark:text-white"
                        : isTaskVerified
                          ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                          : "border border-[#E5DFD3] bg-white text-[#4A5578] hover:border-[#4F6BFF]/50 dark:border-white/10 dark:bg-[#0B1226] dark:text-[#CBD5F0]"
                    }`}
                  >
                    {isTaskVerified ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <span className="font-mono text-[11px] opacity-75">#{tIdx + 1}</span>
                    )}
                    <span className="truncate max-w-[220px]">{task.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Two-Zone Studio Grid: Left Coaching Brief (5 cols) + Right Code & Live Preview (7 cols) */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
            {/* LEFT ZONE: Guided Task Coach & Verification Checklist */}
            <div className="lg:col-span-5 space-y-4 w-full min-w-0">
              <div className="rounded-2xl border border-[#E5DFD3] bg-white p-4 sm:p-5 space-y-4 dark:border-white/10 dark:bg-[#0B1226]">
                {/* Task Header & Metadata */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#4A5578] dark:text-[#94A3C9]">
                    <span>
                      {activeMilestone.title} · ~{activeTask.estimatedMinutes || 20} min
                    </span>
                    {isActiveTaskVerified ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck className="h-3.5 w-3.5" /> Verified
                      </span>
                    ) : (
                      <span className="text-[#4F6BFF] dark:text-[#8DA2FF] font-semibold">
                        Active Task
                      </span>
                    )}
                  </div>
                  <h2 className="font-display text-lg sm:text-xl font-extrabold text-[#0E1B3D] dark:text-white leading-snug">
                    {activeTask.title}
                  </h2>
                </div>

                {/* 1 & 2. What You Are Accomplishing & Why It Matters */}
                <div className="space-y-2 text-xs sm:text-sm leading-relaxed text-[#4A5578] dark:text-[#CBD5F0]">
                  <p>{activeTask.description}</p>
                  <p className="text-xs text-[#7B86A6] dark:text-[#94A3C9]">
                    <strong className="text-[#0E1B3D] dark:text-white">Why this matters:</strong>{" "}
                    {activeTask.whyItMatters || activeMilestone.description}
                  </p>
                  {activeTask.whatChangesInPreview && (
                    <p className="text-xs text-[#4F6BFF] dark:text-[#A5B8FF]">
                      <strong className="text-[#0E1B3D] dark:text-white">
                        What changes in the preview:
                      </strong>{" "}
                      {activeTask.whatChangesInPreview}
                    </p>
                  )}
                </div>

                {/* Module Project Engineering Brief Callout (Shown for Module Projects) */}
                {!isGuidedBuild && (
                  <div
                    data-testid="module-project-brief-card"
                    className="rounded-xl border border-amber-500/30 bg-amber-500/8 p-3 text-xs space-y-1.5 dark:border-amber-400/20 dark:bg-amber-500/10"
                  >
                    <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                      Module Project Brief · Independent Application
                    </div>
                    <p className="text-[#4A5578] dark:text-[#CBD5F0] leading-relaxed">
                      Work across the project files (<code className="font-mono">index.html</code>,{" "}
                      <code className="font-mono">styles.css</code>,{" "}
                      <code className="font-mono">app.js</code>) to satisfy the module deliverables and verification checks below.
                    </p>
                  </div>
                )}

                {/* 3. Required Verification Checks (How You Know It Worked) */}
                <div className="space-y-2 pt-2 border-t border-[#E5DFD3]/80 dark:border-white/10">
                  <div className="flex items-center justify-between text-xs font-bold text-[#0E1B3D] dark:text-white">
                    <span>Required Verification Checks</span>
                    <span className="font-mono text-[11px] text-[#7B86A6] dark:text-[#94A3C9]">
                      {activeTaskCriteria.length || 1} check
                      {(activeTaskCriteria.length || 1) === 1 ? "" : "s"}
                    </span>
                  </div>

                  <ul className="space-y-2" data-testid="task-verification-checklist">
                    {activeTaskCriteria.map((criterion) => {
                      const failedMatch = lastTaskResult?.failedReasons.find(
                        (reason) =>
                          reason === criterion.hint ||
                          reason.includes(criterion.label) ||
                          reason.includes("Starter template is unmodified"),
                      );
                      const isCriterionPassed =
                        isActiveTaskVerified ||
                        (lastTaskResult !== null && !failedMatch && lastTaskResult.passed);
                      const isCriterionFailed =
                        lastTaskResult !== null && !lastTaskResult.passed && Boolean(failedMatch);

                      return (
                        <li
                          key={criterion.id}
                          className={`rounded-xl border p-3 text-xs transition-colors ${
                            isCriterionPassed
                              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200"
                              : isCriterionFailed
                                ? "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200"
                                : "border-[#E5DFD3] bg-[#FFFDF9] text-[#0E1B3D] dark:border-white/10 dark:bg-[#131E3A] dark:text-white"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {isCriterionPassed ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                            ) : isCriterionFailed ? (
                              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            ) : (
                              <CheckSquare className="h-4 w-4 text-[#7B86A6] shrink-0 mt-0.5" />
                            )}
                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="font-semibold leading-snug">{criterion.label}</div>
                              {isCriterionFailed && failedMatch && (
                                <div className="text-[11px] opacity-90">{failedMatch}</div>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Primary Coaching Action Bar: Check Task + Hint + Stuck Recovery */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <Button
                    type="button"
                    onClick={() => void handleVerifyCurrentTask()}
                    disabled={isVerifying}
                    data-testid="verify-project-task-btn"
                    className="bg-[#4F6BFF] hover:bg-[#3B53D9] text-white font-bold text-xs h-10 px-4 gap-1.5 rounded-xl"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>{isVerifying ? "Checking Implementation..." : "Check Task"}</span>
                  </Button>

                  {availableHints.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setBuddyDismissedKey(null);
                        setHintIndexRevealed((prev) =>
                          prev < availableHints.length ? prev + 1 : 1,
                        );
                      }}
                      data-testid="request-project-hint-btn"
                      className="h-10 text-xs gap-1.5 rounded-xl"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-[#4F6BFF]" />
                      <span>
                        {hintIndexRevealed > 0
                          ? `Next Hint (${Math.min(hintIndexRevealed, availableHints.length)}/${availableHints.length})`
                          : "Ask Forge Buddy for a Hint"}
                      </span>
                    </Button>
                  )}

                  {currentTaskAttempts >= 2 && !isActiveTaskVerified && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleLoadReferenceSolution}
                      className="h-10 text-xs gap-1.5 text-amber-700 hover:text-amber-800 dark:text-amber-300"
                    >
                      <Lightbulb className="h-3.5 w-3.5" />
                      <span>Compare Reference Solution</span>
                    </Button>
                  )}
                </div>

                {/* Clear Continuation Action when Verified */}
                {isActiveTaskVerified && (
                  <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
                        Task Complete &amp; Verified
                      </div>
                      <div className="text-[11px] text-emerald-700 dark:text-emerald-300">
                        {nextTaskTarget
                          ? `Up next: ${nextTaskTarget.task.title}`
                          : "You have verified every task in this project!"}
                      </div>
                    </div>
                    {nextTaskTarget ? (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          setActiveMilestoneId(nextTaskTarget.milestoneId);
                          setActiveTaskId(nextTaskTarget.task.id);
                        }}
                        data-testid="continue-next-project-task-btn"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 rounded-lg shrink-0"
                      >
                        <span>Continue to Next Task</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    ) : project.moduleId ? (
                      <Button
                        asChild
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 rounded-lg shrink-0"
                      >
                        <Link
                          to="/learn/modules/$moduleId"
                          params={{ moduleId: project.moduleId }}
                        >
                          <span>Return to Module</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Contextual Forge Buddy Companion Card (Shown ONLY on Hint, Failure, or Verified Milestone) */}
              {showForgeBuddy && forgeBuddyState && (
                <div
                  role="status"
                  aria-live="polite"
                  data-testid="project-forge-buddy-card"
                  className={`rounded-2xl border p-4 transition-all ${
                    forgeBuddyState.tone === "emerald"
                      ? "border-emerald-500/40 bg-emerald-500/10"
                      : forgeBuddyState.tone === "amber"
                        ? "border-amber-500/40 bg-amber-500/10"
                        : "border-[#C9BBFF] bg-[#F5F3FF] dark:border-white/15 dark:bg-[#1D294D]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <ForgeBuddyMascot3D
                        mood={forgeBuddyState.mood}
                        className="h-11 w-11 shrink-0"
                      />
                      <div className="space-y-1 min-w-0">
                        <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#4F6BFF] dark:text-[#C4B5FD]">
                          Forge Buddy · {forgeBuddyState.badge}
                        </div>
                        <div className="text-xs font-bold text-[#0E1B3D] dark:text-white">
                          {forgeBuddyState.title}
                        </div>
                        <p className="text-xs leading-relaxed text-[#4A5578] dark:text-[#CBD5F0]">
                          {forgeBuddyState.message}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBuddyDismissedKey(forgeBuddyState.key)}
                      aria-label="Dismiss Forge Buddy tip"
                      className="rounded-lg p-1 text-[#4A5578] hover:bg-black/5 dark:text-[#CBD5F0] dark:hover:bg-white/10"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT ZONE: Code Entry Surface (Guided Task Slot vs Module Project Multi-File) & Live Preview Workbench */}
            <div className="lg:col-span-7 space-y-3 w-full min-w-0">
              {/* Editor Toolbar: Guided Step Focus Header (for Guided Builds) OR File Tabs (for Module Projects / Full-File Inspection) */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#E5DFD3] bg-white px-3 py-2 dark:border-white/10 dark:bg-[#0B1226]">
                {isGuidedBuild ? (
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <span
                      data-testid="guided-step-focus-badge"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#0E1B3D] px-2.5 py-1 font-mono text-xs font-semibold text-white dark:bg-[#4F6BFF]"
                    >
                      <Sparkles className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        Step {activeTaskFlatIndex + 1} of {totalTasks}
                      </span>
                    </span>
                    <span className="text-xs font-semibold text-[#4A5578] dark:text-[#CBD5F0] truncate">
                      Focused Task Area · Evolving Website Build
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Project files">
                    {studioFiles.map((file) => {
                      const isSelected = activeFile?.id === file.id;
                      return (
                        <button
                          key={file.id}
                          type="button"
                          role="tab"
                          aria-selected={isSelected}
                          onClick={() => {
                            setActiveFileId(file.id);
                            setMobilePane("editor");
                          }}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                            isSelected
                              ? "bg-[#0E1B3D] text-white dark:bg-[#4F6BFF]"
                              : "text-[#4A5578] hover:bg-[#F4EFE6] dark:text-[#CBD5F0] dark:hover:bg-white/10"
                          }`}
                        >
                          <Code2 className="h-3.5 w-3.5 shrink-0" />
                          <span>{file.name}</span>
                        </button>
                      );
                    })}
                    )}
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  {/* Mobile Segmented Switcher (Editor vs Preview) */}
                  <div className="flex md:hidden items-center rounded-lg bg-[#F4EFE6] p-0.5 dark:bg-white/10">
                    <button
                      type="button"
                      onClick={() => setMobilePane("editor")}
                      className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                        mobilePane === "editor"
                          ? "bg-white text-[#0E1B3D] shadow-2xs dark:bg-[#0B1226] dark:text-white"
                          : "text-[#4A5578] dark:text-[#CBD5F0]"
                      }`}
                    >
                      Code
                    </button>
                    <button
                      type="button"
                      onClick={() => setMobilePane("preview")}
                      className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                        mobilePane === "preview"
                          ? "bg-white text-[#0E1B3D] shadow-2xs dark:bg-[#0B1226] dark:text-white"
                          : "text-[#4A5578] dark:text-[#CBD5F0]"
                      }`}
                    >
                      Preview
                    </button>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResetWorkspace}
                    className="h-8 text-xs gap-1 text-[#4A5578] hover:text-[#0E1B3D] dark:text-[#CBD5F0]"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset Starter</span>
                  </Button>
                </div>
              </div>

              {/* Editor + Live Preview Stacked/Split Surface */}
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {/* Code Entry Surface */}
                <div
                  className={`${
                    mobilePane === "preview" ? "hidden md:flex" : "flex"
                  } flex-col h-[380px] sm:h-[440px] w-full min-w-0`}
                >
                  {activeFile &&
                    (isGuidedBuild ? (
                      <GuidedTaskSlotEditor
                        key={`${activeTask.id}:${activeFile.id}`}
                        file={activeFile}
                        task={activeTask}
                        taskNumber={activeTaskFlatIndex + 1}
                        onChange={handleCodeChange}
                      />
                    ) : (
                      <LessonCodeEditor
                        value={activeFile.code}
                        onChange={handleCodeChange}
                        language={activeFile.language}
                        aria-label={`${activeFile.name} code editor`}
                        className="h-full w-full"
                      />
                    ))}
                </div>

                {/* Live Result Preview Surface */}
                <div
                  className={`${
                    mobilePane === "editor" ? "sr-only md:not-sr-only md:flex" : "flex"
                  } flex-col h-[380px] sm:h-[440px] w-full min-w-0 overflow-hidden rounded-xl border border-[#E5DFD3] bg-white dark:border-white/10 dark:bg-[#0B1226]`}
                >
                  <div className="flex items-center justify-between border-b border-[#E5DFD3] bg-[#FFFDF9] px-3 py-2 text-xs font-mono text-[#4A5578] dark:border-white/10 dark:bg-[#131E3A] dark:text-[#CBD5F0]">
                    <span className="inline-flex items-center gap-1.5 font-semibold">
                      <Eye className="h-3.5 w-3.5 text-[#4F6BFF]" />
                      Live Preview · {project.title}
                    </span>
                    <span>Auto-updating</span>
                  </div>

                  {compiledPreview.error ? (
                    <div className="p-4 text-xs font-mono text-amber-700 bg-amber-500/10 flex-1 overflow-auto">
                      <div className="font-bold mb-1">Syntax or Compile Issue:</div>
                      <div>{compiledPreview.error}</div>
                    </div>
                  ) : (
                    <iframe
                      title="Forge Playground Live Preview"
                      srcDoc={compiledPreview.srcDoc}
                      sandbox="allow-scripts allow-modals"
                      className="w-full flex-1 border-0 bg-white"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Secondary Project Reference & Portfolio Tabs */}
      <Tabs defaultValue="tasks" className="w-full space-y-6">
        <TabsList className="bg-muted/50 p-1 flex w-full overflow-x-auto whitespace-nowrap scrollbar-none h-auto gap-1 justify-start border border-border/40 rounded-lg">
          <TabsTrigger value="tasks" className="gap-1.5 text-xs py-2 shrink-0">
            <CheckSquare className="h-3.5 w-3.5" />
            All Milestones ({verifiedTasksCount}/{totalTasks} Verified)
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

        {/* --- TAB 1: ALL MILESTONES & TASKS OVERVIEW --- */}
        <TabsContent value="tasks" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8 space-y-6">
              {project.milestones.map((milestone) => {
                const milestoneTasks = milestone.tasks || [];
                const verifiedInM = milestoneTasks.filter(
                  (t) => Boolean(verifiedTasksMap[`${project.id}:${t.id}`]),
                ).length;
                const isMilestoneVerified =
                  milestoneTasks.length > 0 && verifiedInM === milestoneTasks.length;

                return (
                  <Card key={milestone.id} className="border-border/60 overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b border-border/40 py-4 px-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <CardTitle className="text-base font-bold">{milestone.title}</CardTitle>
                            {isMilestoneVerified && (
                              <Badge className="bg-emerald-600 hover:bg-emerald-600 text-[10px]">
                                Verified Milestone
                              </Badge>
                            )}
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
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setActiveMilestoneId(milestone.id);
                              if (milestone.tasks[0]) setActiveTaskId(milestone.tasks[0].id);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="h-7 text-xs gap-1.5 border-[#4F6BFF]/40 text-[#4F6BFF] hover:bg-[#4F6BFF]/10"
                          >
                            <Code2 className="h-3.5 w-3.5" />
                            <span>Focus in Studio</span>
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-4 space-y-3">
                      {milestoneTasks.map((task) => {
                        const evidenceStatus = getTaskEvidenceStatus(
                          project.id,
                          task.id,
                          projectTasks,
                          verifiedTasksMap,
                        );
                        const isFocused =
                          activeMilestone?.id === milestone.id && activeTask?.id === task.id;

                        return (
                          <div
                            key={task.id}
                            className={`p-3.5 rounded-lg border transition-all ${
                              evidenceStatus === "verified"
                                ? "bg-emerald-500/5 border-emerald-500/30"
                                : isFocused
                                  ? "bg-primary/5 border-primary/40"
                                  : "bg-card border-border hover:border-primary/40"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1 flex-1">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMilestoneId(milestone.id);
                                      setActiveTaskId(task.id);
                                      window.scrollTo({ top: 0, behavior: "smooth" });
                                    }}
                                    className="text-sm font-semibold text-left hover:text-[#4F6BFF] transition-colors"
                                  >
                                    {task.title}
                                  </button>
                                  {evidenceStatus === "verified" ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                      <ShieldCheck className="h-3 w-3" />
                                      Verified
                                    </span>
                                  ) : evidenceStatus === "self-reported" ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                      Self-Reported · Needs Verification
                                    </span>
                                  ) : (
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        setActiveMilestoneId(milestone.id);
                                        setActiveTaskId(task.id);
                                        window.scrollTo({ top: 0, behavior: "smooth" });
                                      }}
                                      className="h-6 px-2 text-[11px] font-semibold text-[#4F6BFF]"
                                    >
                                      Start Task →
                                    </Button>
                                  )}
                                </div>
                                {task.description && (
                                  <p className="text-xs text-muted-foreground leading-relaxed">
                                    {task.description}
                                  </p>
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
                      Technologies &amp; Tags
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
            completedTasksCount={verifiedTasksCount}
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
