import { useState, useEffect, useMemo, useCallback } from "react";
import { LessonCodeEditor } from "@/components/shared/lesson-editor";
import type { ProjectTask, TaskInteractionMode } from "@/lib/types";
import type { PlaygroundFile } from "@/lib/types/playground";
import { Code2 } from "lucide-react";

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
  hasPrefix?: boolean;
  hasSuffix?: boolean;
  contextBefore: string;
  contextAfter: string;
  configurationError?: string;


const INTERACTION_MODE_META: Record<
  TaskInteractionMode,
  { label: string; description: string }
> = {
  "write-code": {
    label: "Write code",
    description: "Write the required markup or logic in the designated slot below.",
  },
  "complete-code": {
    label: "Complete code",
    description: "Complete the partially written structure in the editable slot below.",
  },
  "change-value": {
    label: "Change a value",
    description: "Adjust the CSS properties or design token values in the slot below.",
  },
  "build-component": {
    label: "Build a component",
    description: "Construct the UI component inside the highlighted region below.",
  },
  "implement-behaviour": {
    label: "Implement behaviour",
    description: "Wire the interactive JavaScript behaviour in the designated slot below.",
  },
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

  if (lang === "javascript" || lang === "js" || lang === "typescript" || lang === "ts") {
    return "implement-behaviour";
  }
  if (lang === "css") {
    if (
      text.includes("token") ||
      text.includes(":root") ||
      text.includes("variable") ||
      text.includes("contrast") ||
      text.includes("focus")
    ) {
      return "change-value";
    }
    return "complete-code";
  }
  if (
    text.includes("card") ||
    text.includes("section") ||
    text.includes("grid") ||
    text.includes("hero") ||
    text.includes("header") ||
    text.includes("form")
  ) {
    return "build-component";
  }
  if (text.includes("complete") || text.includes("replace") || text.includes("remediate")) {
    return "complete-code";
  }
  return "write-code";
}

function inferTargetRegionLabel(
  task: ProjectTask,
  file: PlaygroundFile,
  taskNumber: number,
): string {
  if (task.taskSlot?.contextLabel) {
    return task.taskSlot.contextLabel;
  }
  const firstSelector = task.validationSpec?.assertions?.find((a) => a.selector)?.selector;
  if (firstSelector) {
    return `Step ${taskNumber} Focus · ${firstSelector}`;
  }
  if (file.language === "css") {
    return `Step ${taskNumber} Styling Slot`;
  }
  if (file.language === "javascript") {
    return `Step ${taskNumber} Interaction Slot`;
  }
  return `Step ${taskNumber} Structure Slot`;
}

/**
 * Extracts a task-focused editable slot and surrounding read-only context
 * from a project workspace file so Guided Builds do not force learners to hunt
 * through an entire multi-file IDE buffer.
 */
export function extractGuidedTaskSlot(
  file: PlaygroundFile,
  task: ProjectTask,
  taskNumber: number,
): GuidedTaskSlotExtraction {
  const fullCode = file.code || "";
  const lines = fullCode.split("\n");
  const interactionMode = inferTaskInteractionMode(task, file.language);
  const interactionLabel = INTERACTION_MODE_META[interactionMode].label;
  const targetRegionLabel = inferTargetRegionLabel(task, file, taskNumber);

  // Explicit task slots are authoritative. Never fall back to a wider region when they are misconfigured.
  if (task.taskSlot) {
    const spec = task.taskSlot;
    const errorBase = {
      fileId: file.id,
      fileName: file.name,
      language: file.language,
      interactionMode,
      interactionLabel,
      targetRegionLabel,
      prefix: "",
      slotCode: "",
      suffix: "",
      hasPrefix: false,
      hasSuffix: false,
      contextBefore: "",
      contextAfter: "",
    } satisfies Omit<GuidedTaskSlotExtraction, "configurationError">;

    if (file.name !== spec.targetFile && file.id !== spec.targetFile) {
      return {
        ...errorBase,
        configurationError: `This task is configured for ${spec.targetFile}, but the editor received ${file.name}. No code was changed.`,
      };
    }
    if (!spec.slotStartMarker || !spec.slotEndMarker) {
      return {
        ...errorBase,
        configurationError: "This task is missing its explicit editable-region markers. No code was changed.",
      };
    }

    const startMatches = lines
      .map((line, index) => line.includes(spec.slotStartMarker!) ? index : -1)
      .filter((index) => index >= 0);
    const endMatches = lines
      .map((line, index) => line.includes(spec.slotEndMarker!) ? index : -1)
      .filter((index) => index >= 0);

    if (startMatches.length !== 1 || endMatches.length !== 1 || endMatches[0] <= startMatches[0]) {
      return {
        ...errorBase,
        configurationError: "The editable region could not be located unambiguously. Check the task's start/end markers. No code was changed.",
      };
    }

    const startIndex = startMatches[0];
    const endIndex = endMatches[0];
    const prefix = lines.slice(0, startIndex + 1).join("\n");
    const slotCode = lines.slice(startIndex + 1, endIndex).join("\n");
    const suffix = lines.slice(endIndex).join("\n");

    return {
      ...errorBase,
      prefix,
      slotCode,
      suffix,
      hasPrefix: prefix.length > 0,
      hasSuffix: suffix.length > 0,
      contextBefore: "",
      contextAfter: "",
    };
  }

  // Missing slot configuration is a curriculum error, never a reason to expose more code.
  return {
    fileId: file.id,
    fileName: file.name,
    language: file.language,
    interactionMode,
    interactionLabel,
    targetRegionLabel,
    prefix: "",
    slotCode: "",
    suffix: "",
    hasPrefix: false,
    hasSuffix: false,
    contextBefore: "",
    contextAfter: "",
    configurationError: "This task is missing an explicit editable-region definition. No code was changed.",
  };
}

/**
 * Losslessly splices the learner's edited task slot back into the underlying file
 * so live preview rendering and verification operate on the complete document.
 */
export function spliceGuidedTaskSlot(
  extraction: Pick<GuidedTaskSlotExtraction, "prefix" | "suffix" | "hasPrefix" | "hasSuffix">,
  newSlotCode: string,
): string {
  const parts: string[] = [];
  if (extraction.hasPrefix ?? extraction.prefix.length > 0) {
    parts.push(extraction.prefix);
  }
  if (newSlotCode.length > 0) {
    parts.push(newSlotCode);
  }
  if (extraction.hasSuffix ?? extraction.suffix.length > 0) {
    parts.push(extraction.suffix);
  }
  return parts.join("\n");
}

interface GuidedTaskSlotEditorProps {
  file: PlaygroundFile;
  task: ProjectTask;
  taskNumber: number;
  onChange: (newFullFileCode: string) => void;
}

export function GuidedTaskSlotEditor({
  file,
  task,
  taskNumber,
  onChange,
}: GuidedTaskSlotEditorProps) {
  const initialExtraction = useMemo(
    () => extractGuidedTaskSlot(file, task, taskNumber),
    [task.id, file.id, taskNumber],
  );

  const [anchor, setAnchor] = useState<GuidedTaskSlotExtraction>(initialExtraction);
  const [slotValue, setSlotValue] = useState<string>(initialExtraction.slotCode);
  const [anchorTaskId, setAnchorTaskId] = useState(task.id);

  // A task change is a boundary even if both tasks use the same underlying file.
  useEffect(() => {
    const expectedFull = spliceGuidedTaskSlot(anchor, slotValue);
    if (
      anchorTaskId !== task.id ||
      anchor.fileId !== file.id ||
      expectedFull !== file.code
    ) {
      const fresh = extractGuidedTaskSlot(file, task, taskNumber);
      setAnchor(fresh);
      setSlotValue(fresh.slotCode);
      setAnchorTaskId(task.id);
    }
    // The route also keys this component by task/file; these checks protect workspace resets.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.id, file.id, file.code, taskNumber]);

  const handleSlotChange = useCallback(
    (nextSlot: string) => {
      if (anchor.configurationError) return;
      setSlotValue(nextSlot);
      onChange(spliceGuidedTaskSlot(anchor, nextSlot));
    },
    [anchor, onChange],
  );

  return (
    <div
      data-testid="guided-task-slot-editor"
      className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-border bg-card"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground">Code for this step</div>
          <div className="truncate text-xs text-muted-foreground">{anchor.targetRegionLabel}</div>
        </div>
        <span className="shrink-0 rounded-md border border-border bg-muted px-2 py-1 font-mono text-[10px] text-muted-foreground">
          {anchor.fileName}
        </span>
      </div>
      {anchor.configurationError ? (
        <div role="alert" className="m-3 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          <div className="font-semibold">This task's code area is not configured correctly.</div>
          <p className="mt-1">{anchor.configurationError}</p>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col p-2">
          <p className="px-2 pb-2 text-xs text-muted-foreground">
            Enter only the code needed for this step. Forge keeps the rest of the project in place.
          </p>
          <div className="min-h-[180px] flex-1">
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
      )}
    </div>
  );

}
