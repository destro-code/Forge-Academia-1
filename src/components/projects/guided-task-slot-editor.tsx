import { useCallback, useMemo, useState } from "react";
import { LessonCodeEditor } from "@/components/shared/lesson-editor";
import type { ProjectTask, TaskInteractionMode } from "@/lib/types";
import type { PlaygroundFile } from "@/lib/types/playground";

export interface GuidedTaskSlotExtraction {
  fileId: string;
  fileName: string;
  language: PlaygroundFile["language"];
  interactionMode: TaskInteractionMode;
  interactionLabel: string;
  targetRegionLabel: string;
  prefix: string;
  slotCode: string;
  suffix: string;
}

const INTERACTION_MODE_META: Record<TaskInteractionMode, { label: string }> = {
  "write-code": { label: "Write code" },
  "complete-code": { label: "Complete code" },
  "change-value": { label: "Change a value" },
  "build-component": { label: "Build a component" },
  "implement-behaviour": { label: "Implement behaviour" },
};

export function inferTaskInteractionMode(
  task: ProjectTask,
  language: string,
): TaskInteractionMode {
  if (task.interactionMode) {
    return task.interactionMode;
  }

  const text = `${task.title} ${task.description}`.toLowerCase();
  const lang = language.toLowerCase();

  if (["javascript", "js", "typescript", "ts"].includes(lang)) {
    return "implement-behaviour";
  }

  if (lang === "css") {
    if (
      ["token", ":root", "variable", "contrast", "focus"].some((word) =>
        text.includes(word),
      )
    ) {
      return "change-value";
    }

    return "complete-code";
  }

  if (
    ["card", "section", "grid", "hero", "header", "form"].some((word) =>
      text.includes(word),
    )
  ) {
    return "build-component";
  }

  if (["complete", "replace", "remediate"].some((word) => text.includes(word))) {
    return "complete-code";
  }

  return "write-code";
}

/**
 * Resolve only an explicitly authored slot; never guess from TODOs, selectors,
 * or file structure.
 */
export function extractGuidedTaskSlot(
  file: PlaygroundFile,
  task: ProjectTask,
  taskNumber: number,
): GuidedTaskSlotExtraction {
  const spec = task.taskSlot;

  if (!spec) {
    throw new Error(
      `Guided Build step ${taskNumber} ("${task.title}") has no explicit task-slot configuration.`,
    );
  }

  if (file.name !== spec.targetFile) {
    throw new Error(
      `Task "${task.title}" targets ${spec.targetFile}, but the selected file is ${file.name}.`,
    );
  }

  const lines = (file.code || "").split("\\n");
  const starts: number[] = [];
  const ends: number[] = [];

  lines.forEach((line, index) => {
    if (line.trim() === spec.slotStartMarker) {
      starts.push(index);
    }
    if (line.trim() === spec.slotEndMarker) {
      ends.push(index);
    }
  });

  if (starts.length !== 1 || ends.length !== 1 || ends[0] <= starts[0]) {
    throw new Error(
      `Task "${task.title}" requires exactly one ordered pair of slot markers in ${file.name}; found ${starts.length} start marker(s) and ${ends.length} end marker(s).`,
    );
  }

  const start = starts[0];
  const end = ends[0];
  const interactionMode = inferTaskInteractionMode(task, file.language);

  return {
    fileId: file.id,
    fileName: file.name,
    language: file.language,
    interactionMode,
    interactionLabel: INTERACTION_MODE_META[interactionMode].label,
    targetRegionLabel: spec.contextLabel || spec.slotId,
    prefix: lines.slice(0, start + 1).join("\\n"),
    slotCode: lines.slice(start + 1, end).join("\\n"),
    suffix: lines.slice(end).join("\\n"),
  };
}

/** Reinsert learner code while preserving all surrounding workspace code. */
export function spliceGuidedTaskSlot(
  extraction: Pick<GuidedTaskSlotExtraction, "prefix" | "suffix">,
  newSlotCode: string,
): string {
  if (newSlotCode.length === 0) {
    return `${extraction.prefix}\\n${extraction.suffix}`;
  }

  return `${extraction.prefix}\\n${newSlotCode}\\n${extraction.suffix}`;
}

interface GuidedTaskSlotEditorProps {
  file: PlaygroundFile;
  task: ProjectTask;
  taskNumber: number;
  onChange: (newFullFileCode: string) => void;
  onDownloadWorkspaceBackup?: () => void;
  onResetToFocusedStarter?: () => void;
}

export function GuidedTaskSlotEditor({
  file,
  task,
  taskNumber,
  onChange,
  onDownloadWorkspaceBackup,
  onResetToFocusedStarter,
}: GuidedTaskSlotEditorProps) {
  const [backupDownloaded, setBackupDownloaded] = useState(false);

  const handleDownloadBackup = useCallback(() => {
    if (!onDownloadWorkspaceBackup) {
      return;
    }

    onDownloadWorkspaceBackup();
    setBackupDownloaded(true);
  }, [onDownloadWorkspaceBackup]);

  const extraction = useMemo(() => {
    try {
      return extractGuidedTaskSlot(file, task, taskNumber);
    } catch {
      return null;
    }
  }, [file, task, taskNumber]);

  const handleSlotChange = useCallback(
    (nextSlot: string) => {
      if (extraction) {
        onChange(spliceGuidedTaskSlot(extraction, nextSlot));
      }
    },
    [extraction, onChange],
  );

  if (!extraction) {
    const hasSlotSpec = Boolean(task.taskSlot);
    const hasBothMarkers = Boolean(
      task.taskSlot &&
        file.code.includes(task.taskSlot.slotStartMarker) &&
        file.code.includes(task.taskSlot.slotEndMarker),
    );

    return (
      <div
        role="alert"
        data-testid="guided-task-slot-error"
        className="flex h-full min-h-[180px] flex-col justify-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-foreground"
      >
        <div>
          <p className="font-semibold">
            {hasSlotSpec && !hasBothMarkers
              ? "This saved workspace needs to be updated."
              : "This step's focused code-entry area is not ready."}
          </p>
          <p className="mt-1 text-muted-foreground">
            Your existing code has not been changed. This can happen when a
            workspace was saved before focused code-entry areas were introduced,
            or when its task markers were edited.
          </p>
        </div>

        {(onDownloadWorkspaceBackup || onResetToFocusedStarter) && (
          <div className="flex flex-wrap gap-2">
            {onDownloadWorkspaceBackup && (
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="min-h-11 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                Download saved code first
              </button>
            )}
            {onResetToFocusedStarter && (
              <button
                type="button"
                onClick={onResetToFocusedStarter}
                disabled={!backupDownloaded}
                className="min-h-11 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Use current starter
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      data-testid="guided-task-slot-editor"
      className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-xl border border-border bg-card"
    >
      <div className="flex min-h-10 items-center justify-between gap-3 border-b border-border px-3 py-2">
        <span className="truncate text-xs font-semibold text-foreground">
          {extraction.targetRegionLabel}
        </span>
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
          {file.language}
        </span>
      </div>

      <div className="min-h-0 flex-1 p-2">
        <LessonCodeEditor
          key={`${task.id}:${file.id}`}
          value={extraction.slotCode}
          onChange={handleSlotChange}
          language={extraction.language}
          showLineNumbers={false}
          aria-label={`Code entry for ${task.title}`}
          className="h-full w-full"
        />
      </div>
    </div>
  );
}
