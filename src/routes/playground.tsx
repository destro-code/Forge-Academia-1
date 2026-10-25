import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  PanelLeft,
  Terminal,
  Monitor,
  Lightbulb,
  ShieldCheck,
  FileCode2,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlaygroundStore } from "@/lib/stores/use-playground-store";
import { useProgressStore } from "@/lib/stores/use-progress-store";
import {
  buildPlaygroundHtml,
  compilePlaygroundProject,
  getSandboxFileInfo,
} from "@/lib/playground-compiler";
import {
  getStarterContentForFile,
  getLanguageFromFileName,
  suggestNewFileName,
  normalizeNewFileName,
  buildLessonWorkspaceFiles,
  restorePersistedPlaygroundWorkspace,
} from "@/lib/playground-templates";
import { useLesson, useProject } from "@/lib/hooks/use-content";
import { useProgress } from "@/lib/hooks/use-progress";
import {
  buildProjectWorkspaceFiles,
  getProjectMilestoneValidationSpec,
} from "@/lib/project-workspace-templates";
import { getDefaultPlaygroundModeForLessonOrProject } from "@/lib/curriculum/project-mapping";
import {
  getVerifiedProjectTasks,
  markProjectTasksVerified,
  unmarkProjectTasksVerified,
  clearVerifiedProjectTasks,
  recordCapabilityEvidence,
  useLearnerEvidenceVersion,
} from "@/lib/learning-engine/evidence-store";
import {
  verifyProjectMilestone,
  verifyProjectMilestoneInRuntime,
  getProjectVerificationReports,
  clearProjectVerificationReports,
  type MilestoneVerificationReport,
} from "@/lib/learning-engine/project-verifier";
import {
  ForgeBuddyMascot3D,
  type ForgeBuddyMood as ForgeMascotMood,
} from "@/components/atelier/forge-buddy-illos";
import {
  requestPlaygroundValidation,
  cancelPendingValidationRequests,
  waitForIframeReady,
} from "@/lib/compiler/validation-client";
import { ValidationResultsPanel } from "@/components/playground/validation-results-panel";

import type {
  PlaygroundFile,
  PlaygroundConsoleLog,
  PlaygroundRuntime,
  PlaygroundProjectManifest,
} from "@/lib/types/playground";
import type { ExerciseValidationSpec } from "@/lib/types/validation";
import { PLAYGROUND_PRESETS } from "@/lib/playground-data";
import { PlaygroundFileTree } from "@/components/playground/playground-file-tree";
import { PlaygroundTabs } from "@/components/playground/playground-tabs";
import { PlaygroundEditor } from "@/components/playground/playground-editor";
import { PlaygroundPreview } from "@/components/playground/playground-preview";
import { PlaygroundConsole } from "@/components/playground/playground-console";
import { PlaygroundSolutionModal } from "@/components/playground/playground-solution-modal";
import { PlaygroundCodeReviewerModal } from "@/components/playground/playground-code-reviewer-modal";

export const Route = createFileRoute("/playground")({
  validateSearch: (
    search: Record<string, unknown>,
  ): {
    mode?: "lesson-inline" | "beginner" | "advanced" | string;
    lessonId?: string;
    projectId?: string;
    milestoneId?: string;
    taskId?: string;
    sandboxId?: string;
    exampleId?: string;
    lang?: string;
    title?: string;
    code?: string;
  } => ({
    mode: (search.mode as string) || undefined,
    lessonId: (search.lessonId as string) || undefined,
    projectId: (search.projectId as string) || undefined,
    milestoneId: (search.milestoneId as string) || undefined,
    taskId: (search.taskId as string) || undefined,
    sandboxId: (search.sandboxId as string) || undefined,
    exampleId: (search.exampleId as string) || undefined,
    lang: (search.lang as string) || undefined,
    title: (search.title as string) || undefined,
    code: (search.code as string) || undefined,
  }),
  head: () => ({
    meta: [
      { title: "Playground · Forge" },
      {
        name: "description",
        content:
          "Full Monaco editor, multi-file explorer, live preview, console stream, and reference solution comparison.",
      },
      { property: "og:title", content: "Playground · Forge" },
      { property: "og:description", content: "Production-grade frontend sandbox." },
    ],
  }),
  component: Playground,
});

export function Playground() {
  const searchParams = Route.useSearch();
  const lesson = useLesson(searchParams.lessonId);
  const activeProject = useProject(searchParams.projectId);
  const { projectTasks = {}, toggleProjectTask } = useProgress();
  const [showProjectChecklist, setShowProjectChecklist] = useState(true);
  useLearnerEvidenceVersion();
  const verifiedProjectTasksMap = getVerifiedProjectTasks();

  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | undefined>(
    searchParams.milestoneId,
  );
  const [latestMilestoneReport, setLatestMilestoneReport] =
    useState<MilestoneVerificationReport | null>(null);

  useEffect(() => {
    if (searchParams.milestoneId) {
      setSelectedMilestoneId(searchParams.milestoneId);
    }
  }, [searchParams.milestoneId]);

  const activeMilestone = useMemo(() => {
    if (!activeProject) return undefined;
    const targetId = selectedMilestoneId || searchParams.milestoneId;
    if (targetId) {
      return (
        activeProject.milestones.find((m) => m.id === targetId) ||
        activeProject.milestones[0]
      );
    }
    return (
      activeProject.milestones.find((m) =>
        (m.tasks || []).some((t) => !verifiedProjectTasksMap[`${activeProject.id}:${t.id}`]),
      ) || activeProject.milestones[0]
    );
  }, [activeProject, selectedMilestoneId, searchParams.milestoneId, verifiedProjectTasksMap]);

  useEffect(() => {
    if (!activeProject || !activeMilestone) {
      setLatestMilestoneReport(null);
      return;
    }
    const reports = getProjectVerificationReports(activeProject.id);
    setLatestMilestoneReport(reports[activeMilestone.id] || null);
  }, [activeProject, activeMilestone]);

  const sandboxSection = lesson?.sections?.find(
    (s): s is Extract<typeof s, { type: "interactive-sandbox" }> =>
      s.type === "interactive-sandbox" && s.id === searchParams.sandboxId,
  );

  const isInlineMode =
    searchParams.mode === "lesson-inline" ||
    (!sandboxSection &&
      !!searchParams.lessonId &&
      (!!searchParams.code || !!searchParams.exampleId));

  const [currentPresetId, setCurrentPresetId] = useState<string>(PLAYGROUND_PRESETS[0].id);
  const activePreset =
    PLAYGROUND_PRESETS.find((p) => p.id === currentPresetId) || PLAYGROUND_PRESETS[0];

  const activeExercise = (lesson as any)?.exercises?.find(
    (e: any) => e.id === searchParams.sandboxId || e.id === (searchParams as any).exerciseId,
  );
  const projectValidationSpec = useMemo(() => {
    if (!activeProject) return undefined;
    return getProjectMilestoneValidationSpec(
      activeProject,
      activeMilestone?.id,
      searchParams.taskId,
    );
  }, [activeProject, activeMilestone?.id, searchParams.taskId]);

  const validationSpec: ExerciseValidationSpec | undefined =
    sandboxSection?.validation ||
    activeExercise?.validation ||
    (activeProject ? projectValidationSpec : activePreset?.validation);

  const currentSessionIdentity = activeProject
    ? `project:${activeProject.id}`
    : sandboxSection
      ? `sandbox:${searchParams.lessonId}:${searchParams.sandboxId}`
      : isInlineMode
        ? `inline:${searchParams.lessonId || "unknown"}:${searchParams.exampleId || "default"}`
        : `preset:${currentPresetId}`;

  const [hydratedSessionId, setHydratedSessionId] = useState<string | null>(null);

  const currentTitle = activeProject
    ? `Project Studio: ${activeProject.title}`
    : sandboxSection
      ? `${lesson?.title || "Lesson"}: ${sandboxSection.title}`
      : isInlineMode
        ? `${lesson?.title || "Lesson"}: ${searchParams.title || "Code Example"}`
        : activePreset.title;
  const currentDifficulty = activeProject
    ? activeProject.difficulty
    : sandboxSection || isInlineMode
      ? lesson?.difficulty || "Beginner"
      : activePreset.difficulty;
  const currentHints = activeProject
    ? activeProject.milestones.flatMap((m) => (m.tasks || []).flatMap((t) => t.hints || [])).slice(0, 5)
    : sandboxSection
      ? sandboxSection.hints && sandboxSection.hints.length > 0
        ? sandboxSection.hints
        : [sandboxSection.instructions || "Follow the exercise instructions inside the lesson."]
      : isInlineMode
        ? [
            "Edit and experiment with this lesson code example in the full isolated playground.",
            "Use 'Reset' at any time to restore the lesson's original snippet.",
          ]
        : activePreset.hints;

  const {
    manifest,
    files,
    activeFileId,
    openTabIds,
    consoleLogs,
    isBuilding,
    isValidating,
    validationReport,
    compilerOutput,
    playgroundMode,
    setManifest,
    setFiles,
    setActiveFileId,
    setOpenTabIds,
    setPlaygroundMode,
    setConsoleLogs,
    setIsBuilding,
    setCompilerOutput,
    updateFileContent,
    addFile,
    deleteFile,
  } = usePlaygroundStore();
  const { completePlaygroundExercise, playgroundCompletions = [] } = useProgressStore();

  const [executionStatus, setExecutionStatus] = useState<"idle" | "running" | "success" | "error">(
    "idle",
  );
  const [executionTime, setExecutionTime] = useState<number | null>(null);

  // Sync default Beginner vs Advanced Playground mode when lesson/project context changes
  useEffect(() => {
    if (searchParams.mode === "beginner" || searchParams.mode === "advanced") {
      setPlaygroundMode(searchParams.mode);
      return;
    }
    const defaultMode = getDefaultPlaygroundModeForLessonOrProject({
      lessonId: searchParams.lessonId,
      moduleId: lesson?.moduleId || activeProject?.moduleId,
      projectId: searchParams.projectId,
    });
    setPlaygroundMode(defaultMode);
  }, [
    searchParams.mode,
    searchParams.lessonId,
    searchParams.projectId,
    lesson?.moduleId,
    activeProject?.moduleId,
    setPlaygroundMode,
  ]);

  // Initialize store on mount or when sandbox search params change
  useEffect(() => {
    let initialManifest: PlaygroundProjectManifest;
    let initialActiveId = "f-1";
    let initialOpenTabs: string[] = [];

    if (activeProject) {
      const workspace = buildProjectWorkspaceFiles(activeProject);
      initialManifest = {
        runtime: workspace.runtime,
        entryFile: workspace.entryFile,
        title: workspace.title,
        files: workspace.files,
      };
      initialActiveId = workspace.activeFileId;
      initialOpenTabs = workspace.files.map((f) => f.id);

      if (typeof window !== "undefined") {
        const key = `forge_playground_project_${activeProject.id}`;
        const saved = localStorage.getItem(key);
        if (saved) {
          const restored = restorePersistedPlaygroundWorkspace(
            saved,
            workspace.runtime,
            workspace.entryFile,
          );
          if (restored) {
            initialManifest = restored.manifest;
            initialActiveId = restored.activeFileId || initialActiveId;
            initialOpenTabs = restored.openTabIds || initialOpenTabs;
          }
        }
      }
    } else if (sandboxSection) {
      const workspace = buildLessonWorkspaceFiles(
        lesson,
        sandboxSection,
        searchParams.code || sandboxSection.initialCode,
        sandboxSection.language,
      );
      initialManifest = {
        runtime: workspace.runtime,
        entryFile: workspace.entryFile,
        title: sandboxSection.title,
        files: workspace.files,
      };
      initialActiveId = workspace.activeFileId;
      initialOpenTabs = workspace.files.map((f) => f.id);

      // Check if there is a saved state in localStorage for this lesson sandbox
      if (typeof window !== "undefined" && !searchParams.code) {
        const key = `forge_playground_files_lesson_${searchParams.lessonId}_${searchParams.sandboxId}`;
        const saved = localStorage.getItem(key);
        if (saved) {
          const restored = restorePersistedPlaygroundWorkspace(
            saved,
            workspace.runtime,
            workspace.entryFile,
          );
          if (restored) {
            initialManifest = restored.manifest;
            initialActiveId = restored.activeFileId || initialActiveId;
            initialOpenTabs = restored.openTabIds || initialOpenTabs;
          }
        }
      }
    } else if (isInlineMode) {
      const workspace = buildLessonWorkspaceFiles(
        lesson,
        undefined,
        searchParams.code || "",
        searchParams.lang,
      );
      initialManifest = {
        runtime: workspace.runtime,
        entryFile: workspace.entryFile,
        title: searchParams.title || "Code Example",
        files: workspace.files,
      };
      initialActiveId = workspace.activeFileId;
      initialOpenTabs = workspace.files.map((f) => f.id);

      // Check if there is a saved state in localStorage for this specific inline example
      if (typeof window !== "undefined" && searchParams.lessonId) {
        const key = `forge_playground_inline_${searchParams.lessonId}_${searchParams.exampleId || "default"}`;
        const saved = localStorage.getItem(key);
        if (saved) {
          const restored = restorePersistedPlaygroundWorkspace(
            saved,
            workspace.runtime,
            workspace.entryFile,
          );
          if (restored) {
            initialManifest = restored.manifest;
            initialActiveId = restored.activeFileId || initialActiveId;
            initialOpenTabs = restored.openTabIds || initialOpenTabs;
          }
        }
      }
    } else {
      const presetRuntime: PlaygroundRuntime = activePreset.runtime || "react";
      initialManifest = {
        runtime: presetRuntime,
        title: activePreset.title,
        files: activePreset.files,
      };
      initialActiveId = activePreset.files[0]?.id || "f-1";
      initialOpenTabs = activePreset.files.map((f) => f.id);

      if (typeof window !== "undefined") {
        const key = `forge_playground_files_${currentPresetId}`;
        const saved = localStorage.getItem(key);
        if (saved) {
          const restored = restorePersistedPlaygroundWorkspace(saved, presetRuntime);
          if (restored) {
            initialManifest = restored.manifest;
            initialActiveId = restored.activeFileId || initialActiveId;
            initialOpenTabs = restored.openTabIds || initialOpenTabs;
          }
        }
      }
    }

    setManifest(initialManifest);
    setActiveFileId(initialActiveId);
    setOpenTabIds(initialOpenTabs);

    // Build initial compilerOutput for initial mount so iframe has srcDoc
    const initialHtml = buildPlaygroundHtml(initialManifest, {
      title: activeProject
        ? activeProject.title
        : sandboxSection
          ? sandboxSection.title
          : isInlineMode
            ? `${lesson?.title || "Lesson"}: ${searchParams.title || "Code Example"}`
            : "Forge Playground Live Preview",
      baseUrl: "",
    });
    setCompilerOutput(initialHtml, false);

    cancelPendingValidationRequests();
    setHydratedSessionId(currentSessionIdentity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentSessionIdentity,
    searchParams.projectId,
    searchParams.lessonId,
    searchParams.sandboxId,
    searchParams.exampleId,
    searchParams.mode,
    searchParams.code,
    searchParams.lang,
  ]);

  // Solution modal state
  const [solutionOpen, setSolutionOpen] = useState(false);
  const [codeReviewOpen, setCodeReviewOpen] = useState(false);
  const [showFileTree, setShowFileTree] = useState(true);

  // Active right/bottom tab
  const [activePaneTab, setActivePaneTab] = useState<
    "preview" | "validation" | "console" | "hints"
  >("preview");
  // Mobile single-pane active tab
  const [mobileTab, setMobileTab] = useState<
    "editor" | "validation" | "preview" | "console" | "hints" | "files"
  >("editor");

  const isSessionReady = hydratedSessionId === currentSessionIdentity;

  // Synchronously derived session initial files for immediate route synchronization
  const sessionInitialFiles = useMemo(() => {
    if (sandboxSection) {
      const initialWorkspace = buildLessonWorkspaceFiles(
        lesson,
        sandboxSection,
        searchParams.code || sandboxSection.initialCode,
        sandboxSection.language,
      );
      let loaded = initialWorkspace.files;
      if (typeof window !== "undefined" && !searchParams.code) {
        const key = `forge_playground_files_lesson_${searchParams.lessonId}_${searchParams.sandboxId}`;
        const saved = localStorage.getItem(key);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              loaded = parsed;
            }
          } catch (e) {
            /* ignore */
          }
        }
      }
      return loaded;
    }
    if (isInlineMode) {
      const initialWorkspace = buildLessonWorkspaceFiles(
        lesson,
        undefined,
        searchParams.code || "",
        searchParams.lang,
      );
      let loaded = initialWorkspace.files;
      if (typeof window !== "undefined" && searchParams.lessonId) {
        const key = `forge_playground_inline_${searchParams.lessonId}_${searchParams.exampleId || "default"}`;
        const saved = localStorage.getItem(key);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              loaded = parsed;
            }
          } catch (e) {
            /* ignore */
          }
        }
      }
      return loaded;
    }
    return null;
  }, [
    sandboxSection,
    isInlineMode,
    searchParams.lessonId,
    searchParams.sandboxId,
    searchParams.exampleId,
    searchParams.lang,
    searchParams.code,
    lesson,
  ]);

  const activeFile = isSessionReady
    ? files.find((f) => f.id === activeFileId) || files[0]
    : sessionInitialFiles
      ? sessionInitialFiles[0]
      : files.find((f) => f.id === activeFileId) || files[0];

  // Auto-persist manifest & UI state to localStorage whenever manifest or active tabs change
  useEffect(() => {
    if (typeof window === "undefined") return;
    // CRITICAL GUARD: Never write in-memory state to storage until the new session is hydrated
    if (hydratedSessionId !== currentSessionIdentity) {
      return;
    }

    const payloadToPersist = {
      manifest,
      activeFileId,
      openTabIds,
    };

    if (activeProject) {
      const key = `forge_playground_project_${activeProject.id}`;
      localStorage.setItem(key, JSON.stringify(payloadToPersist));
      return;
    }
    if (sandboxSection) {
      const key = `forge_playground_files_lesson_${searchParams.lessonId}_${searchParams.sandboxId}`;
      localStorage.setItem(key, JSON.stringify(payloadToPersist));
      return;
    }
    if (isInlineMode) {
      if (searchParams.lessonId) {
        const key = `forge_playground_inline_${searchParams.lessonId}_${searchParams.exampleId || "default"}`;
        localStorage.setItem(key, JSON.stringify(payloadToPersist));
      }
      return;
    }
    const key = `forge_playground_files_${currentPresetId}`;
    localStorage.setItem(key, JSON.stringify(payloadToPersist));
  }, [
    manifest,
    activeFileId,
    openTabIds,
    hydratedSessionId,
    currentSessionIdentity,
    currentPresetId,
    activeProject,
    searchParams.lessonId,
    searchParams.sandboxId,
    searchParams.exampleId,
    sandboxSection,
    isInlineMode,
  ]);

  // Preset switch handler
  const handleSelectPreset = (presetId: string) => {
    const nextPreset = PLAYGROUND_PRESETS.find((p) => p.id === presetId);
    if (!nextPreset) return;
    setCurrentPresetId(presetId);

    const presetRuntime: PlaygroundRuntime = nextPreset.runtime || "react";
    let nextManifest: PlaygroundProjectManifest = {
      runtime: presetRuntime,
      title: nextPreset.title,
      files: nextPreset.files,
    };
    let nextActiveId = nextPreset.files[0]?.id || "f-1";
    let nextOpenTabs = nextPreset.files.map((f) => f.id);

    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`forge_playground_files_${presetId}`);
      if (saved) {
        const restored = restorePersistedPlaygroundWorkspace(saved, presetRuntime);
        if (restored) {
          nextManifest = restored.manifest;
          nextActiveId = restored.activeFileId || nextActiveId;
          nextOpenTabs = restored.openTabIds || nextOpenTabs;
        }
      }
    }

    setManifest(nextManifest);
    setActiveFileId(nextActiveId);
    setOpenTabIds(nextOpenTabs);
    setConsoleLogs([]);
    setExecutionStatus("idle");
    setExecutionTime(null);

    // Full iframe reload for preset change
    const html = buildPlaygroundHtml(nextManifest, {
      title: "Forge Playground Live Preview",
      baseUrl: "",
    });
    setCompilerOutput(html, false);

    setHydratedSessionId(`preset:${presetId}`);

    toast.success(`Loaded preset: ${nextPreset.title}`);
  };

  // Add file handler
  const handleAddFile = (rawFileName: string) => {
    const state = usePlaygroundStore.getState();
    const fileName = normalizeNewFileName(rawFileName, state.manifest.files);
    const { code, language } = getStarterContentForFile(fileName);

    const newFile: PlaygroundFile = {
      id: `custom-${Date.now()}`,
      name: fileName,
      code,
      language,
    };

    addFile(newFile);
    toast.success(`Created ${fileName}`);
  };

  // Delete file handler
  const handleDeleteFile = (fileId: string) => {
    const fileToDelete = files.find((f) => f.id === fileId);
    if (!fileToDelete) return;

    deleteFile(fileId);
    toast.info(`Deleted ${fileToDelete.name}`);
  };

  const compileTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Code update handler
  const handleCodeChange = (newCode: string) => {
    updateFileContent(activeFileId, newCode);

    // Debounce compiler execution calls by 300ms
    if (compileTimeoutRef.current) clearTimeout(compileTimeoutRef.current);
    compileTimeoutRef.current = setTimeout(() => {
      handleRun(true);
    }, 300);
  };

  // Format code handler
  const handleFormatCode = () => {
    if (!activeFile) return;
    try {
      const formatted = activeFile.code
        .split("\n")
        .map((line) => line.trimEnd())
        .join("\n");
      handleCodeChange(formatted);
      toast.success(`Formatted ${activeFile.name}`);
    } catch {
      toast.error("Failed to format code");
    }
  };

  // Log capturer callback from iframe
  const handleLogCaptured = useCallback(
    (level: "log" | "info" | "warn" | "error", message: string) => {
      setConsoleLogs((prev) => [
        ...prev,
        {
          id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          level,
          message,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    },
    [setConsoleLogs],
  );

  // Run code handler
  const handleRun = (isAuto = false) => {
    setIsBuilding(true);
    if (!isAuto) setExecutionStatus("running");
    const startTime = performance.now();

    const currentManifest = usePlaygroundStore.getState().manifest;

    if (!isAuto) {
      setConsoleLogs((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          level: "info",
          message: `⚡ Compiling & executing playground project (${currentManifest.files.length} files, runtime: ${currentManifest.runtime})...`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    }

    const currentOutput = usePlaygroundStore.getState().compilerOutput;

    if (!isAuto || !currentOutput) {
      // Full srcDoc rebuild for explicit Run Code click, initial mount, or missing compilerOutput
      setTimeout(() => {
        try {
          const html = buildPlaygroundHtml(currentManifest, {
            title: sandboxSection
              ? sandboxSection.title
              : isInlineMode
                ? `${lesson?.title || "Lesson"}: ${searchParams.title || "Code Example"}`
                : "Forge Playground Live Preview",
            baseUrl: "",
          });
          setCompilerOutput(html, false);

          const duration = Math.round(performance.now() - startTime);
          if (!isAuto) {
            setExecutionTime(duration);
            setExecutionStatus("success");
            toast.success(`Compiled & executed in ${duration}ms`);
            if (!validationSpec) {
              if (sandboxSection && searchParams.lessonId && searchParams.sandboxId) {
                completePlaygroundExercise(`${searchParams.lessonId}:${searchParams.sandboxId}`);
              } else if (!sandboxSection && !isInlineMode) {
                completePlaygroundExercise(activePreset.id);
              }
            }
          }
        } catch (err) {
          setIsBuilding(false);
          if (!isAuto) {
            setExecutionStatus("error");
            toast.error("Compilation failed");
          }
        }
      }, 10);
    } else {
      // Auto-run on debounced keystroke: postMessage to mounted iframe without reloading iframe document
      const iframes = document.querySelectorAll<HTMLIFrameElement>(
        "iframe[title='Forge Playground Live Preview']",
      );
      if (iframes.length === 0) {
        // No mounted iframe in DOM (e.g. mobile Code tab active).
        // Rebuild compilerOutput so switching to Preview tab displays updated code.
        try {
          const html = buildPlaygroundHtml(currentManifest, {
            title: sandboxSection
              ? sandboxSection.title
              : isInlineMode
                ? `${lesson?.title || "Lesson"}: ${searchParams.title || "Code Example"}`
                : "Forge Playground Live Preview",
            baseUrl: "",
          });
          setCompilerOutput(html, false);
        } catch (e) {
          /* ignore */
        }
      } else {
        iframes.forEach((iframe) => {
          iframe.contentWindow?.postMessage(
            { type: "PLAYGROUND_UPDATE_FILES", files: currentManifest.files },
            "*",
          );
        });
      }
      setIsBuilding(false);
    }
  };

  // Run and validate handler
  const handleRunAndValidate = async () => {
    if (!validationSpec) {
      handleRun(false);
      return;
    }

    const currentIsValidating = usePlaygroundStore.getState().isValidating;
    if (currentIsValidating) return;

    setIsBuilding(true);
    setExecutionStatus("running");
    const startTime = performance.now();

    const currentStore = usePlaygroundStore.getState();
    const currentManifest = currentStore.manifest;
    const currentRevision = currentStore.workspaceRevision;

    setConsoleLogs((prev) => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        level: "info",
        message: `⚡ Compiling & validating exercise: ${validationSpec.exerciseId} (rev ${currentRevision}, ${validationSpec.assertions.length} assertions)...`,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);

    // 1. Compile project on parent side
    const compileReport = compilePlaygroundProject(currentManifest, {
      title: sandboxSection
        ? sandboxSection.title
        : isInlineMode
          ? `${lesson?.title || "Lesson"}: ${searchParams.title || "Code Example"}`
          : "Forge Playground Live Preview",
      baseUrl: "",
      workspaceRevision: currentRevision,
    });

    // If compilation has static errors (e.g. invalid JSON, missing entry), halt and report build error
    if (!compileReport.success) {
      setIsBuilding(false);
      setExecutionStatus("error");
      const errDiag = compileReport.diagnostics.find((d) => d.severity === "error");
      const errMsg = errDiag?.message || "Project compilation failed with diagnostic errors.";
      setConsoleLogs((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          level: "error",
          message: `❌ Build failed: ${errMsg}`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      toast.error(`Build failed: ${errMsg}`);
      return;
    }

    // 2. Set compiler output with the current workspace revision embedded
    setCompilerOutput(compileReport.outputHtml, false);

    // Switch to validation tab so user sees active validation progress
    setActivePaneTab("validation");
    setMobileTab("validation");

    // 3. Deterministic synchronization barrier: wait for PLAYGROUND_READY from current revision
    try {
      await waitForIframeReady(currentRevision, 7000);
    } catch (barrierErr) {
      setIsBuilding(false);
      setExecutionStatus("error");
      const errMsg =
        barrierErr instanceof Error ? barrierErr.message : "Preview runtime failed to initialize.";
      setConsoleLogs((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          level: "error",
          message: `❌ ${errMsg}`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      toast.error(`Runtime error: ${errMsg}`);
      return;
    }

    // 5. Verify workspace was not mutated during initialization barrier
    if (usePlaygroundStore.getState().workspaceRevision !== currentRevision) {
      setIsBuilding(false);
      setExecutionStatus("idle");
      return;
    }

    // 6. Execute validation suite
    try {
      const report = await requestPlaygroundValidation(validationSpec.exerciseId, validationSpec);

      const duration = Math.round(performance.now() - startTime);
      setExecutionTime(duration);
      setIsBuilding(false);

      if (report.status === "passed") {
        setExecutionStatus("success");

        if (validationSpec.exerciseId) {
          const exerciseId = validationSpec.exerciseId;
          const progressStore = useProgressStore.getState();
          const wasCompletedBefore = (progressStore.playgroundCompletions || []).some(
            (c) => c.templateId === exerciseId,
          );

          // Complete exercise idempotently via progress store action
          progressStore.completePlaygroundExercise(exerciseId);

          if (!wasCompletedBefore) {
            toast.success("Exercise Passed! +50 XP awarded");
          } else {
            toast.success(`All ${report.totalRequired} required checks passed!`);
          }
        } else {
          toast.success(`All ${report.totalRequired} required checks passed!`);
        }
      } else {
        setExecutionStatus("idle");
        toast.error(
          `Validation not passed: ${report.passedCount}/${report.totalRequired} required checks passed`,
        );
      }
    } catch (err) {
      setIsBuilding(false);
      setExecutionStatus("error");
      toast.error("Validation execution encountered an error.");
    }
  };

  // Verify Active Project Milestone handler against per-task acceptance criteria (including live iframe checks)
  const handleVerifyProjectMilestone = async () => {
    if (!activeProject) return;
    const targetMilestone = activeMilestone || activeProject.milestones[0];
    if (!targetMilestone) return;

    setIsBuilding(true);
    setExecutionStatus("running");

    const currentStore = usePlaygroundStore.getState();
    const compileReport = compilePlaygroundProject(currentStore.manifest, {
      title: activeProject.title,
      baseUrl: "",
      workspaceRevision: currentStore.workspaceRevision,
    });

    if (!compileReport.success) {
      setIsBuilding(false);
      setExecutionStatus("error");
      toast.error("Fix compilation errors before verifying this milestone.");
      return;
    }

    setCompilerOutput(compileReport.outputHtml, false);

    try {
      await waitForIframeReady(currentStore.workspaceRevision, 2500);
    } catch {
      // Proceed with combined static + DOM verification if iframe ready signal already fired
    }

    const report = await verifyProjectMilestoneInRuntime(
      targetMilestone,
      activeProject,
      usePlaygroundStore.getState().files,
    );
    setIsBuilding(false);
    setExecutionStatus(report.allPassed ? "success" : "idle");
    setLatestMilestoneReport(report);

    const passedTaskIds = Object.values(report.taskResults)
      .filter((r) => r.passed)
      .map((r) => r.taskId);
    const failedTaskResults = Object.values(report.taskResults).filter((r) => !r.passed);
    const failedTaskIds = failedTaskResults.map((r) => r.taskId);

    if (passedTaskIds.length > 0) {
      markProjectTasksVerified(activeProject.id, passedTaskIds);
      passedTaskIds.forEach((taskId) => {
        if (!projectTasks[`${activeProject.id}:${taskId}`]) {
          toggleProjectTask(activeProject.id, taskId);
        }
      });
    }

    if (failedTaskIds.length > 0) {
      unmarkProjectTasksVerified(activeProject.id, failedTaskIds);
    }

    setConsoleLogs((prev) => [
      ...prev,
      {
        id: `verify-${Date.now()}`,
        level: report.allPassed ? "info" : "warn",
        message: report.allPassed
          ? `✅ Milestone Verified (${report.passedCount}/${report.totalTasks} tasks passed acceptance checks): ${targetMilestone.title}`
          : `⚠️ Milestone Check (${report.passedCount}/${report.totalTasks} tasks passed). Remaining criteria: ${failedTaskResults
              .map((f) => `[${f.title}]: ${f.failedReasons[0] || "Incomplete"}`)
              .join(" | ")}`,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);

    recordCapabilityEvidence({
      id: `project:${activeProject.id}:milestone:${targetMilestone.id}`,
      title: `${activeProject.title} — ${targetMilestone.title}`,
      sourceType: "project",
      sourceId: activeProject.id,
      moduleId: activeProject.moduleId,
      status: report.allPassed
        ? "mastered"
        : report.passedCount > 0
          ? "demonstrated"
          : "needs-review",
      evidenceStatus: report.allPassed
        ? "verified"
        : report.passedCount > 0
          ? "in-progress"
          : "needs-attention",
      summary: report.allPassed
        ? `Verified all ${report.totalTasks} acceptance tasks in Playground for ${targetMilestone.title}.`
        : `Passed ${report.passedCount} of ${report.totalTasks} tasks in ${targetMilestone.title}. Next criteria: ${failedTaskResults[0]?.failedReasons[0] ?? "Complete remaining task requirements."}`,
    });

    if (report.allPassed) {
      toast.success(
        `Verified all ${report.totalTasks} acceptance checks for "${targetMilestone.title}"!`,
      );
    } else if (report.passedCount > 0) {
      toast.warning(
        `Verified ${report.passedCount}/${report.totalTasks} tasks. Check the task diagnostics below for the remaining ${failedTaskIds.length} task(s).`,
      );
    } else {
      toast.error(
        failedTaskResults[0]?.failedReasons[0] ||
          "No milestone acceptance criteria passed yet. Review the task hints and try again.",
      );
    }
  };

  // Load reference solution for active project
  const handleLoadProjectReferenceSolution = () => {
    if (!activeProject) return;
    const workspace = buildProjectWorkspaceFiles(activeProject, activeMilestone?.id);
    const solvedFiles: PlaygroundFile[] = workspace.files.map((f) => ({
      ...f,
      code: workspace.solutionFiles[f.id] || f.code,
    }));
    const solvedManifest: PlaygroundProjectManifest = {
      runtime: workspace.runtime,
      entryFile: workspace.entryFile,
      title: workspace.title,
      files: solvedFiles,
    };
    setManifest(solvedManifest);
    setActiveFileId(workspace.activeFileId);
    setOpenTabIds(solvedFiles.map((f) => f.id));
    const html = buildPlaygroundHtml(solvedManifest, {
      title: workspace.title,
      baseUrl: "",
    });
    setCompilerOutput(html, false);
    toast.success(`Loaded reference solution for "${activeProject.title}". Click Verify Milestone to test!`);
  };

  // Reset handler
  const handleReset = () => {
    if (activeProject) {
      const resetWorkspace = buildProjectWorkspaceFiles(activeProject);
      if (typeof window !== "undefined") {
        localStorage.removeItem(`forge_playground_project_${activeProject.id}`);
      }
      clearVerifiedProjectTasks(activeProject.id);
      clearProjectVerificationReports(activeProject.id);
      setLatestMilestoneReport(null);
      const resetManifest: PlaygroundProjectManifest = {
        runtime: resetWorkspace.runtime,
        entryFile: resetWorkspace.entryFile,
        title: resetWorkspace.title,
        files: resetWorkspace.files,
      };
      setManifest(resetManifest);
      setActiveFileId(resetWorkspace.activeFileId);
      setOpenTabIds(resetWorkspace.files.map((f) => f.id));
      setConsoleLogs([]);
      setExecutionStatus("idle");
      setExecutionTime(null);

      const html = buildPlaygroundHtml(resetManifest, {
        title: resetWorkspace.title,
        baseUrl: "",
      });
      setCompilerOutput(html, false);

      toast.info(`Reset "${activeProject.title}" to starter template.`);
      return;
    }

    if (sandboxSection) {
      const resetWorkspace = buildLessonWorkspaceFiles(
        lesson,
        sandboxSection,
        sandboxSection.initialCode,
        sandboxSection.language,
      );
      if (typeof window !== "undefined") {
        localStorage.removeItem(
          `forge_playground_files_lesson_${searchParams.lessonId}_${searchParams.sandboxId}`,
        );
      }
      const resetManifest: PlaygroundProjectManifest = {
        runtime: resetWorkspace.runtime,
        entryFile: resetWorkspace.entryFile,
        title: sandboxSection.title,
        files: resetWorkspace.files,
      };
      setManifest(resetManifest);
      setActiveFileId(resetWorkspace.activeFileId);
      setOpenTabIds(resetWorkspace.files.map((f) => f.id));
      setConsoleLogs([]);
      setExecutionStatus("idle");
      setExecutionTime(null);

      const html = buildPlaygroundHtml(resetManifest, {
        title: sandboxSection.title,
        baseUrl: "",
      });
      setCompilerOutput(html, false);

      toast.info("Playground reset to original lesson code.");
      return;
    }

    if (isInlineMode) {
      const resetWorkspace = buildLessonWorkspaceFiles(
        lesson,
        undefined,
        searchParams.code || "",
        searchParams.lang,
      );
      if (typeof window !== "undefined" && searchParams.lessonId) {
        localStorage.removeItem(
          `forge_playground_inline_${searchParams.lessonId}_${searchParams.exampleId || "default"}`,
        );
      }
      const resetManifest: PlaygroundProjectManifest = {
        runtime: resetWorkspace.runtime,
        entryFile: resetWorkspace.entryFile,
        title: `${lesson?.title || "Lesson"}: ${searchParams.title || "Code Example"}`,
        files: resetWorkspace.files,
      };
      setManifest(resetManifest);
      setActiveFileId(resetWorkspace.activeFileId);
      setOpenTabIds(resetWorkspace.files.map((f) => f.id));
      setConsoleLogs([]);
      setExecutionStatus("idle");
      setExecutionTime(null);

      const html = buildPlaygroundHtml(resetManifest, {
        title: `${lesson?.title || "Lesson"}: ${searchParams.title || "Code Example"}`,
        baseUrl: "",
      });
      setCompilerOutput(html, false);

      toast.info("Playground reset to original lesson example code.");
      return;
    }

    if (typeof window !== "undefined") {
      localStorage.removeItem(`forge_playground_files_${currentPresetId}`);
    }
    const presetRuntime: PlaygroundRuntime = activePreset.runtime || "react";
    const resetManifest: PlaygroundProjectManifest = {
      runtime: presetRuntime,
      title: activePreset.title,
      files: activePreset.files,
    };
    setManifest(resetManifest);
    setActiveFileId(activePreset.files[0]?.id || "f-1");
    setOpenTabIds(activePreset.files.map((f) => f.id));
    setConsoleLogs([]);
    setExecutionStatus("idle");
    setExecutionTime(null);

    // Full iframe reload for reset
    const html = buildPlaygroundHtml(resetManifest, {
      title: "Forge Playground Live Preview",
      baseUrl: "",
    });
    setCompilerOutput(html, false);

    toast.info("Playground reset to default preset code.");
  };

  // Apply solution handler
  const handleApplySolution = (solutionFiles: PlaygroundFile[]) => {
    setFiles(solutionFiles);
    setActiveFileId(solutionFiles[0]?.id || "f-1");
    setOpenTabIds(solutionFiles.map((f) => f.id));

    const currentManifest = usePlaygroundStore.getState().manifest;
    // Full iframe reload for applied solution
    const html = buildPlaygroundHtml(currentManifest, {
      title: "Forge Playground Live Preview",
      baseUrl: "",
    });
    setCompilerOutput(html, false);

    toast.success("Applied reference solution to playground!");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        eyebrow="Interactive Workspace"
        title="Playground Engine"
        description="Write code, test state hooks, run live component renders, and inspect console logs in real time."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {executionStatus === "success" && executionTime !== null && (
              <Badge
                variant="outline"
                className="gap-1 border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-xs"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Compiled ({executionTime}ms)
              </Badge>
            )}

            {!validationSpec &&
              searchParams.lessonId &&
              searchParams.sandboxId &&
              (() => {
                const isSandboxCompleted = playgroundCompletions.some(
                  (c) => c.templateId === `${searchParams.lessonId}:${searchParams.sandboxId}`,
                );
                return (
                  <Button
                    variant={isSandboxCompleted ? "outline" : "default"}
                    size="sm"
                    onClick={() => {
                      if (!isSandboxCompleted) {
                        completePlaygroundExercise(
                          `${searchParams.lessonId}:${searchParams.sandboxId}`,
                        );
                        toast.success("Exercise completed successfully! Checkpoint updated.");
                      }
                    }}
                    className={`gap-1.5 text-xs font-semibold ${
                      isSandboxCompleted
                        ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/10 cursor-default animate-fade-in"
                        : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-glow animate-pulse"
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{isSandboxCompleted ? "✓ Exercise Solved" : "Submit & Complete"}</span>
                  </Button>
                );
              })()}

            {activeProject && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="gap-1.5 text-xs border-[#6E6AF6]/40 bg-[#6E6AF6]/10 hover:bg-[#6E6AF6]/20 text-[#6E6AF6]"
              >
                <Link to="/projects/$projectId" params={{ projectId: activeProject.id }}>
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Project Spec</span>
                </Link>
              </Button>
            )}

            {searchParams.lessonId && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="gap-1.5 text-xs border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary"
              >
                <Link to="/lesson/$lessonId" params={{ lessonId: searchParams.lessonId }}>
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Lesson</span>
                </Link>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCodeReviewOpen(true)}
              className="gap-1.5 text-xs border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Explain / AI Code Review</span>
              <span className="inline sm:hidden">AI Review</span>
            </Button>

            {!sandboxSection && !isInlineMode && !activeProject && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSolutionOpen(true)}
                className="gap-1.5 text-xs"
              >
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="hidden sm:inline">Compare Solution</span>
                <span className="inline sm:hidden">Solution</span>
              </Button>
            )}

            <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5 text-xs">
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>

            {validationSpec ? (
              <Button
                size="sm"
                onClick={handleRunAndValidate}
                disabled={isValidating || isBuilding}
                className="gap-1.5 shadow-glow text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
                aria-label="Run Code and Validate Exercise"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Validating...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Run &amp; Validate</span>
                  </>
                )}
              </Button>
            ) : (
              <Button size="sm" onClick={() => handleRun()} className="gap-1.5 shadow-glow text-xs">
                <Play className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Run Code</span>
                <span className="inline sm:hidden">Run</span>
              </Button>
            )}
          </div>
        }
      />

      {/* Reactive Forge Mascot Companion + Zero-Setup Project Task Checklist */}
      {(() => {
        const latestErrorLog = [...consoleLogs].reverse().find((l) => l.level === "error");
        const projectAllTasks = activeProject
          ? activeProject.milestones.flatMap((m) => m.tasks || [])
          : [];
        const completedProjectTasks = activeProject
          ? projectAllTasks.filter((t) => projectTasks[`${activeProject.id}:${t.id}`]).length
          : 0;

        let mascotMood: ForgeMascotMood = "coding";
        let mascotHeadline = "Forge Buddy · Zero-Setup Studio Companion";
        let mascotMessage = activeProject
          ? `Building "${activeProject.title}" directly in the browser! Edit index.html, styles.css, or app.js and check off your milestones as you go.`
          : "Write code, break things, and experiment freely—no npm install or local setup required.";

        if (executionStatus === "error" || latestErrorLog) {
          mascotMood = "thinking";
          mascotHeadline = "Forge Buddy Spotted a Runtime / Build Issue";
          mascotMessage = latestErrorLog
            ? `Console reported: "${latestErrorLog.message}". Check your variable names, closing brackets, or async error handling!`
            : "Something didn't compile cleanly. Check the Console tab for the exact line and error.";
        } else if (
          activeProject &&
          projectAllTasks.length > 0 &&
          completedProjectTasks === projectAllTasks.length
        ) {
          mascotMood = "excited";
          mascotHeadline = "All Project Milestones Complete! 🎉";
          mascotMessage = `Incredible work! You finished all ${projectAllTasks.length} tasks for ${activeProject.title}. Ready to defend your architecture in a Mock Interview?`;
        } else if (executionStatus === "success") {
          mascotMood = "cheering";
          mascotHeadline = `Code Executed Cleanly (${executionTime ?? 12}ms)`;
          mascotMessage = activeProject
            ? `Your live preview updated! You've completed ${completedProjectTasks}/${projectAllTasks.length} project tasks so far.`
            : "Nice run! Inspect the Live Preview and Console output to see your changes in action.";
        }

        return (
          <div className="rounded-2xl border border-[#6E6AF6]/30 bg-gradient-to-r from-[#1E1B4B] via-[#27235C] to-[#1E1B4B] p-4 text-white shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 border border-[#6E6AF6]/40">
                  <ForgeBuddyMascot3D mood={mascotMood} className="w-12 h-12" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#FBBF24]">
                      {mascotHeadline}
                    </span>
                    {activeProject && (
                      <span className="rounded-full bg-[#6E6AF6]/30 border border-[#A78BFA]/40 px-2.5 py-0.5 text-[10px] font-mono font-bold text-[#E0E7FF]">
                        {completedProjectTasks}/{projectAllTasks.length} Tasks Done
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-[#E0E7FF] mt-0.5 leading-relaxed">
                    {mascotMessage}
                  </p>
                </div>
              </div>

              {activeProject && (
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {activeProject.milestones.length > 1 && (
                    <select
                      aria-label="Select project milestone"
                      value={activeMilestone?.id || ""}
                      onChange={(e) => setSelectedMilestoneId(e.target.value)}
                      className="rounded-xl border border-white/20 bg-white/10 px-2.5 py-2 text-xs font-semibold text-white"
                    >
                      {activeProject.milestones.map((m) => (
                        <option key={m.id} value={m.id} className="text-slate-900">
                          {m.title}
                        </option>
                      ))}
                    </select>
                  )}
                  <button
                    type="button"
                    onClick={handleVerifyProjectMilestone}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>
                      Verify {activeMilestone ? activeMilestone.title : "Milestone"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProjectChecklist((v) => !v)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#6E6AF6] hover:bg-[#5B57E6] px-3.5 py-2 text-xs font-bold text-white transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>
                      {showProjectChecklist ? "Hide Tasks" : "Show Tasks"}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {activeProject && showProjectChecklist && (
              <div className="mt-4 pt-3.5 border-t border-white/15 space-y-3">
                {latestMilestoneReport && (
                  <div
                    className={`rounded-xl border px-3.5 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2 ${
                      latestMilestoneReport.allPassed
                        ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-100"
                        : "border-amber-400/40 bg-amber-500/15 text-amber-100"
                    }`}
                  >
                    <span>
                      <strong>{latestMilestoneReport.milestoneTitle}:</strong>{" "}
                      {latestMilestoneReport.passedCount} of {latestMilestoneReport.totalTasks}{" "}
                      tasks verified against acceptance criteria.
                    </span>
                    <span className="font-mono text-[11px] opacity-80">
                      Checked {new Date(latestMilestoneReport.checkedAt).toLocaleTimeString()}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {(activeMilestone?.tasks || projectAllTasks).map((task, idx) => {
                    const taskKey = `${activeProject.id}:${task.id}`;
                    const isVerified = Boolean(verifiedProjectTasksMap[taskKey]);
                    const isSelfReported = Boolean(projectTasks[taskKey]) && !isVerified;
                    const taskCheck = latestMilestoneReport?.taskResults?.[task.id];
                    return (
                      <div
                        key={task.id}
                        className={`flex flex-col justify-between gap-2 rounded-xl border p-2.5 text-left transition-all ${
                          isVerified
                            ? "border-[#34D399]/50 bg-[#065F46]/40 text-[#D1FAE5]"
                            : isSelfReported
                              ? "border-amber-400/40 bg-amber-500/15 text-amber-100"
                              : "border-white/15 bg-white/5 text-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="flex items-start gap-2.5 min-w-0 text-left">
                            <div
                              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] font-bold ${
                                isVerified
                                  ? "border-[#34D399] bg-[#10B981] text-[#064E3B]"
                                  : isSelfReported
                                    ? "border-amber-300 bg-amber-400 text-amber-950"
                                    : "border-white/40 bg-transparent"
                              }`}
                            >
                              {isVerified ? "✓" : idx + 1}
                            </div>
                            <div className="min-w-0 text-xs">
                              <div
                                className={`font-semibold ${isVerified ? "line-through opacity-85" : ""}`}
                              >
                                {task.title}
                              </div>
                              {task.description && (
                                <p className="mt-0.5 text-[11px] text-white/75 line-clamp-2">
                                  {task.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                              isVerified
                                ? "bg-emerald-500/30 text-emerald-200"
                                : isSelfReported
                                  ? "bg-amber-500/30 text-amber-200"
                                  : "bg-white/10 text-white/60"
                            }`}
                          >
                            {isVerified
                              ? "Verified"
                              : isSelfReported
                                ? "Draft Note"
                                : "Required"}
                          </span>
                        </div>

                        {taskCheck && !taskCheck.passed && taskCheck.failedReasons.length > 0 && (
                          <div className="rounded-lg bg-rose-950/60 border border-rose-400/30 px-2.5 py-1.5 text-[11px] text-rose-200">
                            <strong>Criteria needed:</strong> {taskCheck.failedReasons[0]}
                          </div>
                        )}
                        {taskCheck && taskCheck.passed && (
                          <div className="text-[11px] text-emerald-300 font-mono">
                            ✓ Passed: {taskCheck.criteriaChecked[0] || "Acceptance check verified"}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-white/75">
                  <span>
                    Tasks are marked <strong>Verified</strong> automatically when your HTML, CSS, and JS pass the milestone checks.
                  </span>
                  <button
                    type="button"
                    onClick={handleLoadProjectReferenceSolution}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#FBBF24] hover:underline cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Load Reference Solution</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Main Playground Editor & Panel Window */}
      <div className="w-full max-w-full min-w-0 rounded-xl border border-border/60 bg-card overflow-hidden shadow-elegant flex flex-col min-h-[600px] lg:h-[750px]">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-border/60 bg-muted/30 px-2 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs gap-1 sm:gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {playgroundMode === "advanced" && (
              <Button
                variant="ghost"
                size="icon"
                className={`h-6 w-6 sm:h-7 sm:w-7 ${showFileTree ? "text-primary bg-primary/10" : "text-muted-foreground"}`}
                onClick={() => setShowFileTree(!showFileTree)}
                title="Toggle File Explorer"
              >
                <PanelLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            )}
            <span className="font-semibold text-foreground truncate max-w-[160px] sm:max-w-none text-xs sm:text-xs">
              {currentTitle}
            </span>
            <span className="hidden sm:inline text-muted-foreground">
              · {currentDifficulty} · {manifest.runtime}
            </span>

            {/* Beginner Workshop vs Full IDE Mode Switcher */}
            <div
              role="group"
              aria-label="Playground interface mode"
              className="ml-1 inline-flex items-center rounded-lg border border-border/70 bg-background/80 p-0.5 text-[11px]"
            >
              <button
                type="button"
                onClick={() => setPlaygroundMode("beginner")}
                className={`rounded-md px-2 py-0.5 font-semibold transition-colors cursor-pointer ${
                  playgroundMode === "beginner"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Guided Workshop
              </button>
              <button
                type="button"
                onClick={() => setPlaygroundMode("advanced")}
                className={`rounded-md px-2 py-0.5 font-semibold transition-colors cursor-pointer ${
                  playgroundMode === "advanced"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Full IDE
              </button>
            </div>
          </div>

          {/* Right Pane Selector (Desktop) */}
          <div className="hidden lg:flex items-center gap-1">
            {validationSpec && (
              <Button
                variant={activePaneTab === "validation" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => setActivePaneTab("validation")}
              >
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                <span>Validation</span>
                {validationReport && (
                  <span
                    className={`ml-1 text-[10px] font-mono px-1 rounded ${
                      validationReport.status === "passed"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-rose-500/20 text-rose-400"
                    }`}
                  >
                    {validationReport.status === "passed"
                      ? "✓"
                      : `${validationReport.passedCount}/${validationReport.totalRequired}`}
                  </span>
                )}
              </Button>
            )}
            <Button
              variant={activePaneTab === "preview" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => setActivePaneTab("preview")}
            >
              <Monitor className="h-3.5 w-3.5 text-primary" /> Preview
            </Button>
            <Button
              variant={activePaneTab === "console" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => setActivePaneTab("console")}
            >
              <Terminal className="h-3.5 w-3.5 text-primary" /> Console ({consoleLogs.length})
            </Button>
            <Button
              variant={activePaneTab === "hints" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => setActivePaneTab("hints")}
            >
              <Lightbulb className="h-3.5 w-3.5 text-amber-400" /> Hints
            </Button>
          </div>
        </div>

        {/* Mobile Single-Pane Tab Bar */}
        <div className="flex lg:hidden items-center border-b border-border/60 bg-muted/35 p-1.5 text-xs gap-1 overflow-x-auto w-full min-w-0 flex-nowrap scrollbar-none">
          <Button
            variant={mobileTab === "editor" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 rounded-lg text-xs px-3 gap-1.5 shrink-0 font-medium"
            onClick={() => setMobileTab("editor")}
          >
            <FileCode2 className="h-3.5 w-3.5 text-primary" /> Code
          </Button>
          {validationSpec && (
            <Button
              variant={mobileTab === "validation" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 rounded-lg text-xs px-3 gap-1.5 shrink-0 font-medium"
              onClick={() => setMobileTab("validation")}
            >
              <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Validation
            </Button>
          )}
          <Button
            variant={mobileTab === "preview" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 rounded-lg text-xs px-3 gap-1.5 shrink-0 font-medium"
            onClick={() => setMobileTab("preview")}
          >
            <Monitor className="h-3.5 w-3.5 text-primary" /> Preview
          </Button>
          <Button
            variant={mobileTab === "console" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 rounded-lg text-xs px-3 gap-1.5 shrink-0 font-medium"
            onClick={() => setMobileTab("console")}
          >
            <Terminal className="h-3.5 w-3.5 text-primary" /> Console ({consoleLogs.length})
          </Button>
          <Button
            variant={mobileTab === "hints" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 rounded-lg text-xs px-3 gap-1.5 shrink-0 font-medium"
            onClick={() => setMobileTab("hints")}
          >
            <Lightbulb className="h-3.5 w-3.5 text-amber-400" /> Hints
          </Button>
          { playgroundMode === "advanced" && (
            <Button
              variant={mobileTab === "files" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 rounded-lg text-xs px-3 gap-1.5 shrink-0 font-medium"
              onClick={() => setMobileTab("files")}
            >
              <PanelLeft className="h-3.5 w-3.5 text-primary" /> Files
            </Button>
          )}
        </div>

        {/* Beginner Mode Simplified HTML / CSS / JS Language Selector Bar */}
        {playgroundMode === "beginner" && files.length > 0 && (
          <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-3 py-1.5 text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-[11px] font-medium text-muted-foreground mr-1">
                Language Layer:
              </span>
              {files.map((file) => {
                const isActive = activeFile?.id === file.id;
                const friendlyLabel =
                  file.name === "index.html"
                    ? "HTML (Structure)"
                    : file.name === "styles.css"
                      ? "CSS (Style)"
                      : file.name === "app.js"
                        ? "JavaScript (Behavior)"
                        : file.name;
                return (
                  <button
                    key={file.id}
                    type="button"
                    onClick={() => {
                      setActiveFileId(file.id);
                      if (mobileTab !== "editor") setMobileTab("editor");
                    }}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-background/80 text-muted-foreground hover:text-foreground border border-border/60"
                    }`}
                  >
                    {friendlyLabel}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Mobile Single-Pane View (< lg) */}
        <div className="relative flex-1 flex flex-col overflow-hidden lg:hidden min-h-[500px] w-full max-w-full min-w-0">
          {mobileTab === "files" && playgroundMode === "advanced" && (
            <div className="flex-1 overflow-y-auto w-full min-w-0">
              <PlaygroundFileTree
                onAddFile={handleAddFile}
                onDeleteFile={handleDeleteFile}
                presets={PLAYGROUND_PRESETS}
                currentPresetId={currentPresetId}
                onSelectPreset={handleSelectPreset}
                isLessonSandbox={!!sandboxSection || isInlineMode}
              />
            </div>
          )}

          {mobileTab === "editor" && (
            <div className="flex-1 flex flex-col min-h-[450px] w-full min-w-0 overflow-hidden">
              {playgroundMode === "advanced" && (
                <PlaygroundTabs
                  onNewFileClick={() => {
                    const nextName = suggestNewFileName(usePlaygroundStore.getState().files);
                    handleAddFile(nextName);
                  }}
                />
              )}
              <div className="flex-1 flex flex-col min-h-0 w-full min-w-0 overflow-hidden">
                {!isSessionReady ? (
                  <div className="flex h-full w-full items-center justify-center bg-card p-6">
                    <Skeleton className="h-full w-full rounded-lg" />
                  </div>
                ) : activeFile ? (
                  <PlaygroundEditor
                    onCodeChange={handleCodeChange}
                    onFormatCode={handleFormatCode}
                    onRunCode={() => handleRun()}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground text-xs p-6">
                    No open file selected. Select a file above.
                  </div>
                )}
              </div>
            </div>
          )}

          {mobileTab === "validation" && validationSpec && (
            <div className="flex-1 flex flex-col bg-background min-h-[450px] w-full min-w-0 overflow-hidden">
              <ValidationResultsPanel
                validationSpec={validationSpec}
                onRunValidation={handleRunAndValidate}
                isBuilding={isBuilding}
              />
            </div>
          )}

          {/* Keep Preview persistently mounted on mobile so live iframe validation never unmounts */}
          <div
            className={
              mobileTab === "preview"
                ? "flex-1 flex flex-col bg-background min-h-[450px] w-full min-w-0 overflow-hidden"
                : "opacity-0 pointer-events-none fixed inset-0 -z-10 h-[450px] w-full overflow-hidden"
            }
          >
            <PlaygroundPreview onLogCaptured={handleLogCaptured} />
          </div>

          {mobileTab === "console" && (
            <div className="flex-1 flex flex-col bg-background min-h-0 w-full min-w-0 overflow-hidden">
              <PlaygroundConsole />
            </div>
          )}

          {mobileTab === "hints" && (
            <div className="flex-1 flex flex-col bg-background p-4 space-y-4 text-xs overflow-y-auto min-h-0 w-full min-w-0">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                <Lightbulb className="h-4 w-4" /> Lab Hints & Key Concepts
              </div>

              <div className="space-y-2">
                {currentHints.map((hint, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-amber-200/90 leading-relaxed"
                  >
                    <strong className="text-amber-400 block mb-1">Hint #{idx + 1}:</strong>
                    {hint}
                  </div>
                ))}
              </div>

              {!sandboxSection && !isInlineMode && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5 text-xs mt-4"
                  onClick={() =>
                    activeProject ? handleLoadProjectReferenceSolution() : setSolutionOpen(true)
                  }
                >
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  View Reference Solution
                </Button>
              )}
            </div>
          )}

          {/* Mobile Thumb-Zone Execution & Quick-Switch Bar */}
          <div className="flex items-center justify-between gap-2 border-t border-border/70 bg-muted/40 px-3 py-2.5">
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 text-xs gap-1.5"
                onClick={() => setMobileTab(mobileTab === "preview" ? "editor" : "preview")}
              >
                {mobileTab === "preview" ? (
                  <>
                    <FileCode2 className="h-3.5 w-3.5 text-primary" />
                    <span>Edit Code</span>
                  </>
                ) : (
                  <>
                    <Monitor className="h-3.5 w-3.5 text-primary" />
                    <span>Live Preview</span>
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-2.5 text-xs font-mono text-muted-foreground"
                onClick={() => setMobileTab("console")}
              >
                <Terminal className="h-3.5 w-3.5 mr-1 text-primary" />
                {consoleLogs.length}
              </Button>
            </div>

            {activeProject ? (
              <Button
                size="sm"
                onClick={handleVerifyProjectMilestone}
                disabled={isValidating || isBuilding}
                className="h-9 px-4 gap-1.5 shadow-glow text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white active:scale-98"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{isBuilding ? "Checking…" : "Run & Check Work"}</span>
              </Button>
            ) : validationSpec ? (
              <Button
                size="sm"
                onClick={() => {
                  handleRunAndValidate();
                  setMobileTab("validation");
                }}
                disabled={isValidating || isBuilding}
                className="h-9 px-4 gap-1.5 shadow-glow text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground active:scale-98"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>{isValidating ? "Validating…" : "Run & Check Work"}</span>
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => {
                  handleRun();
                  setMobileTab("preview");
                }}
                className="h-9 px-4 gap-1.5 shadow-glow text-xs font-semibold active:scale-98"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Run &amp; Preview</span>
              </Button>
            )}
          </div>
        </div>

        {/* Desktop Multi-Column IDE Grid (>= lg) */}
        <div className="hidden lg:flex flex-1 flex-row overflow-hidden w-full min-w-0">
          {/* Sidebar File Explorer (Only shown in Full IDE Mode) */}
          {playgroundMode === "advanced" && showFileTree && (
            <div className="w-56 shrink-0 border-r border-border/60">
              <PlaygroundFileTree
                onAddFile={handleAddFile}
                onDeleteFile={handleDeleteFile}
                presets={PLAYGROUND_PRESETS}
                currentPresetId={currentPresetId}
                onSelectPreset={handleSelectPreset}
                isLessonSandbox={!!sandboxSection || isInlineMode}
              />
            </div>
          )}

          {/* Center Editor Column */}
          <div className="flex-1 flex flex-col min-w-0 border-r border-border/60 min-h-[350px]">
            {/* Tabs Bar (Only shown in Full IDE Mode; Beginner Mode uses the Language Layer bar above) */}
            {playgroundMode === "advanced" && (
              <PlaygroundTabs
                onNewFileClick={() => {
                  const nextName = suggestNewFileName(usePlaygroundStore.getState().files);
                  handleAddFile(nextName);
                }}
              />
            )}

            {/* Monaco Editor */}
            <div className="flex-1 min-h-0 w-full min-w-0 overflow-hidden">
              {!isSessionReady ? (
                <div className="flex h-full w-full items-center justify-center bg-card p-6">
                  <Skeleton className="h-full w-full rounded-lg" />
                </div>
              ) : activeFile ? (
                <PlaygroundEditor
                  onCodeChange={handleCodeChange}
                  onFormatCode={handleFormatCode}
                  onRunCode={() => handleRun()}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground text-xs p-6">
                  No open file selected. Click a file in Explorer.
                </div>
              )}
            </div>
          </div>

          {/* Right Pane Column (Preview / Validation / Console / Hints) */}
          <div className="w-[420px] shrink-0 flex flex-col bg-background min-h-[300px] overflow-hidden">
            {/* Keep Preview mounted so the live iframe remains available for postMessage validation */}
            <div
              className={
                activePaneTab === "preview"
                  ? "flex-1 flex flex-col h-full overflow-hidden"
                  : "hidden"
              }
            >
              <PlaygroundPreview onLogCaptured={handleLogCaptured} />
            </div>

            {activePaneTab === "validation" && validationSpec && (
              <ValidationResultsPanel
                validationSpec={validationSpec}
                onRunValidation={handleRunAndValidate}
                isBuilding={isBuilding}
              />
            )}

            {activePaneTab === "console" && <PlaygroundConsole />}

            {activePaneTab === "hints" && (
              <div className="p-4 space-y-4 text-xs overflow-y-auto">
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                  <Lightbulb className="h-4 w-4" /> Lab Hints & Key Concepts
                </div>

                <div className="space-y-2">
                  {currentHints.map((hint, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-amber-200/90 leading-relaxed"
                    >
                      <strong className="text-amber-400 block mb-1">Hint #{idx + 1}:</strong>
                      {hint}
                    </div>
                  ))}
                </div>

                {!sandboxSection && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5 text-xs mt-4"
                    onClick={() => setSolutionOpen(true)}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    View Reference Solution
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compare Solution Modal */}
      <PlaygroundSolutionModal
        open={solutionOpen}
        onOpenChange={setSolutionOpen}
        preset={activePreset}
        userFiles={files}
        onApplySolution={handleApplySolution}
      />

      {/* AI Code Reviewer Modal (Explain / AI Code Review) */}
      <PlaygroundCodeReviewerModal
        open={codeReviewOpen}
        onOpenChange={setCodeReviewOpen}
        files={files}
        activeFile={activeFile}
        onApplyRefactoredCode={(newCode) => handleCodeChange(newCode)}
      />
    </div>
  );
}
