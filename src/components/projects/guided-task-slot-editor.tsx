import { useEffect, useRef, useState } from "react";
import { LessonCodeEditor } from "@/components/shared/lesson-editor";
import type { ProjectTask, TaskInteractionMode } from "@/lib/types";
import type { PlaygroundFile } from "@/lib/types/playground";

export interface GuidedTaskSlotExtraction {
  fileId: string;
  fileName: string;
  language: PlaygroundFile["language"];
  interactionMode: TaskInteractionMode;
  targetRegionLabel: string;
  prefix: string;
  slotCode: string;
  suffix: string;
  configurationError?: string;
}

function defaultInteractionMode(task: ProjectTask, language: string): TaskInteractionMode {
  if (task.interactionMode) return task.interactionMode;
  const normalizedLanguage = language.toLowerCase();
  if (normalizedLanguage === "css") return "complete-code";
  if (["javascript", "js", "typescript", "ts"].includes(normalizedLanguage)) {
    return "implement-behaviour";
  }
  return "write-code";
}

function emptyExtraction(
  file: PlaygroundFile,
  task: ProjectTask,
  taskNumber: number,
  configurationError: string,
): GuidedTaskSlotExtraction {
  return {
    fileId: file.id,
    fileName: file.name,
    language: file.language,
    interactionMode: defaultInteractionMode(task, file.language),
    targetRegionLabel: task.taskSlot?.contextLabel || `Step ${taskNumber}`,
    prefix: "",
    slotCode: "",
    suffix: "",
    configurationError,
  };
}

/**
 * A Guided Build task must declare its own insertion boundaries. This function
 * deliberately does not infer a region from TODOs, CSS selectors, or document
 * structure: a failed configuration must never expose an arbitrary larger file.
 */
export function extractGuidedTaskSlot(
  file: PlaygroundFile,
  task: ProjectTask,
  taskNumber: number,
): GuidedTaskSlotExtraction {
  const slot = task.taskSlot;
  if (!slot) {
    return emptyExtraction(
      file,
      task,
      taskNumber,
      "This task does not have a configured code-entry area yet. No code has been exposed for editing.",
    );
  }

  if (file.name !== slot.targetFile && file.id !== slot.targetFile) {
    return emptyExtraction(
      file,
      task,
      taskNumber,
      `Task configuration error: expected ${slot.targetFile}, but the active file is ${file.name}. No code has been exposed for editing.`,
    );
  }

  const lines = (file.code || "").split("\n");
  const startIndices = lines.reduce<number[]>((indices, line, index) => {
    if (line.includes(slot.slotStartMarker)) indices.push(index);
    return indices;
  }, []);
  const endIndices = lines.reduce<number[]>((indices, line, index) => {
    if (line.includes(slot.slotEndMarker)) indices.push(index);
    return indices;
  }, []);

  if (startIndices.length !== 1 || endIndices.length !== 1) {
    return emptyExtraction(
      file,
      task,
      taskNumber,
      `Task configuration error: expected exactly one start marker and one end marker for “${slot.slotId}”. No code has been exposed for editing.`,
    );
  }

  const startIndex = startIndices[0];
  const endIndex = endIndices[0];
  if (endIndex <= startIndex) {
    return emptyExtraction(
      file,
      task,
      taskNumber,
      `Task configuration error: the code-entry markers for “${slot.slotId}” are out of order. No code has been exposed for editing.`,
    );
  }

  return {
    fileId: file.id,
    fileName: file.name,
    language: file.language,
    interactionMode: defaultInteractionMode(task, file.language),
    targetRegionLabel: slot.contextLabel || slot.slotId,
    prefix: lines.slice(0, startIndex + 1).join("\n"),
    slotCode: lines.slice(startIndex + 1, endIndex).join("\n"),
    suffix: lines.slice(endIndex).join("\n"),
  };
}

/** Rebuild the full hidden file while replacing only the configured task region. */
export function spliceGuidedTaskSlot(
  extraction: Pick<GuidedTaskSlotExtraction, "prefix" | "suffix" | "configurationError">,
  newSlotCode: string,
): string {
  if (extraction.configurationError) {
    throw new Error(extraction.configurationError);
  }
  return [extraction.prefix, newSlotCode, extraction.suffix].join("\n");
}

interface GuidedTaskSlotEditorProps {
  file: PlaygroundFile;
  task: ProjectTask;
  taskNumber: number;
  onChange: (newFullFileCode: string) => void;
}

/** Moving to another task remounts the editor, even when the file stays the same. */
export function GuidedTaskSlotEditor(props: GuidedTaskSlotEditorProps) {
  return (
    <GuidedTaskSlotEditorInstance
      key={`${props.file.id}:${props.task.id}:${props.taskNumber}`}
      {...props}
    />
  );
}

function GuidedTaskSlotEditorInstance({
  file,
  task,
  taskNumber,
  onChange,
}: GuidedTaskSlotEditorProps) {
  const [anchor, setAnchor] = useState<GuidedTaskSlotExtraction>(() =>
    extractGuidedTaskSlot(file, task, taskNumber),
  );
  const [slotValue, setSlotValue] = useState(anchor.slotCode);
  const lastWrittenFullCode = useRef<string | null>(null);

  useEffect(() => {
    if (file.code === lastWrittenFullCode.current) {
      lastWrittenFullCode.current = null;
      return;
    }

    const expectedFullCode = anchor.configurationError
      ? null
      : spliceGuidedTaskSlot(anchor, slotValue);
    if (file.code !== expectedFullCode) {
      const fresh = extractGuidedTaskSlot(file, task, taskNumber);
      setAnchor(fresh);
      setSlotValue(fresh.slotCode);
    }
    // The comparison distinguishes our edits from external workspace replacement.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file.code, file.id, task.id, taskNumber]);

  const handleSlotChange = (nextSlot: string) => {
    if (anchor.configurationError) return;
    const nextFullCode = spliceGuidedTaskSlot(anchor, nextSlot);
    lastWrittenFullCode.current = nextFullCode;
    setSlotValue(nextSlot);
    onChange(nextFullCode);
  };

  if (anchor.configurationError) {
    return (
      <div
        role="alert"
        data-testid="guided-task-slot-configuration-error"
        className="flex h-full w-full items-start rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-foreground"
      >
        {anchor.configurationError}
      </div>
    );
  }

  return (
    <div
      data-testid="guided-task-slot-editor"
      className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-border bg-card"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Write the required code</span>
        <span className="font-mono">{anchor.fileName}</span>
      </div>
      <div className="min-h-0 flex-1 p-2">
        <LessonCodeEditor
          value={slotValue}
          onChange={handleSlotChange}
          language={anchor.language}
          showLineNumbers={false}
          aria-label={`Code entry for ${task.title}`}
          className="h-full w-full"
        />
      </div>
    </div>
  );
}
