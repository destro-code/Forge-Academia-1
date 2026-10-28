import { useState, useEffect, useMemo, useCallback } from "react";
import { LessonCodeEditor } from "@/components/shared/lesson-editor";
import type { ProjectTask, TaskInteractionMode } from "@/lib/types";
import type { PlaygroundFile } from "@/lib/types/playground";
import { Lock, Sparkles, Code2, Eye, Layers } from "lucide-react";

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
}

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

  // 1. Explicit slot markers if configured on task.taskSlot
  if (task.taskSlot?.slotStartMarker && task.taskSlot?.slotEndMarker) {
    const startMarkerIdx = lines.findIndex((l) =>
      l.includes(task.taskSlot!.slotStartMarker!),
    );
    const endMarkerIdx = lines.findIndex(
      (l, idx) => idx > startMarkerIdx && l.includes(task.taskSlot!.slotEndMarker!),
    );
    if (startMarkerIdx !== -1 && endMarkerIdx !== -1 && endMarkerIdx > startMarkerIdx) {
      const startLine = startMarkerIdx + 1;
      const endLine = endMarkerIdx - 1;
      return buildExtractionFromLineRange(
        file,
        lines,
        startLine,
        Math.max(startLine, endLine),
        interactionMode,
        interactionLabel,
        targetRegionLabel,
      );
    }
  }

  // 2. Locate `TODO (Task N)` comment block in the starter/current file
  const taskTodoRegex = new RegExp(`TODO\\s*\\(?Task\\s*${taskNumber}\\b`, "i");
  const anyTodoRegex = /TODO\s*\(?Task\s*\d+\b/i;
  const todoLineIdx = lines.findIndex((line) => taskTodoRegex.test(line));

  if (todoLineIdx !== -1) {
    // Include an immediately preceding opening tag/selector line if the TODO is the first line inside a rule/container
    let startLine = todoLineIdx;
    if (
      todoLineIdx > 0 &&
      (lines[todoLineIdx - 1].trim().endsWith("{") ||
        /^<(header|main|section|footer|nav|article|form)\b/i.test(
          lines[todoLineIdx - 1].trim(),
        ))
    ) {
      startLine = todoLineIdx - 1;
    }

    let endLine = todoLineIdx;
    const maxScan = Math.min(lines.length - 1, todoLineIdx + 16);

    for (let i = todoLineIdx + 1; i <= maxScan; i++) {
      const lineText = lines[i];
      if (anyTodoRegex.test(lineText)) {
        // Stop before the next task's TODO (and if the line right before it opens a new block for that next TODO, stop before that too)
        endLine = i - 1;
        if (
          endLine > startLine &&
          (lines[endLine].trim().endsWith("{") ||
            /^<(header|main|section|footer|nav|article)\b/i.test(lines[endLine].trim()))
        ) {
          endLine -= 1;
        }
        break;
      }
      endLine = i;
      const trimmed = lineText.trim();
      if (file.language === "css" && trimmed === "}") {
        break;
      }
      if (
        file.language === "html" &&
        /^<\/(header|section|footer|nav|article|form)>/i.test(trimmed)
      ) {
        break;
      }
    }

    return buildExtractionFromLineRange(
      file,
      lines,
      startLine,
      Math.max(startLine, endLine),
      interactionMode,
      interactionLabel,
      targetRegionLabel,
    );
  }

  // 3. Fallback: Locate by first assertion selector or landmark tag
  const primarySelector = task.validationSpec?.assertions?.find((a) => a.selector)?.selector;
  if (primarySelector) {
    const token = primarySelector.split(/[\s>+~]/)[0].replace(/^[.#]/, "");
    if (token) {
      const matchIdx = lines.findIndex((l) => l.includes(token));
      if (matchIdx !== -1) {
        const startLine = Math.max(0, matchIdx - 1);
        const endLine = Math.min(lines.length - 1, matchIdx + 10);
        return buildExtractionFromLineRange(
          file,
          lines,
          startLine,
          endLine,
          interactionMode,
          interactionLabel,
          targetRegionLabel,
        );
      }
    }
  }

  // 4. Final fallback: body interior for HTML, or full file for short CSS/JS
  if (file.language === "html") {
    const bodyStart = lines.findIndex((l) => /<body\b/i.test(l));
    const bodyEnd = lines.findIndex((l) => /<\/body>/i.test(l));
    if (bodyStart !== -1 && bodyEnd !== -1 && bodyEnd > bodyStart + 1) {
      return buildExtractionFromLineRange(
        file,
        lines,
        bodyStart + 1,
        bodyEnd - 1,
        interactionMode,
        interactionLabel,
        targetRegionLabel,
      );
    }
  }

  return buildExtractionFromLineRange(
    file,
    lines,
    0,
    Math.max(0, lines.length - 1),
    interactionMode,
    interactionLabel,
    targetRegionLabel,
  );
}

function buildExtractionFromLineRange(
  file: PlaygroundFile,
  lines: string[],
  startLine: number,
  endLine: number,
  interactionMode: TaskInteractionMode,
  interactionLabel: string,
  targetRegionLabel: string,
): GuidedTaskSlotExtraction {
  const safeStart = Math.max(0, Math.min(startLine, lines.length - 1));
  const safeEnd = Math.max(safeStart, Math.min(endLine, lines.length - 1));

  const prefixLines = lines.slice(0, safeStart);
  const slotLines = lines.slice(safeStart, safeEnd + 1);
  const suffixLines = lines.slice(safeEnd + 1);

  const prefix = prefixLines.join("\n");
  const slotCode = slotLines.join("\n");
  const suffix = suffixLines.join("\n");

  const contextBefore = prefixLines.slice(Math.max(0, prefixLines.length - 4)).join("\n");
  const contextAfter = suffixLines.slice(0, 4).join("\n");

  return {
    fileId: file.id,
    fileName: file.name,
    language: file.language,
    interactionMode,
    interactionLabel,
    targetRegionLabel,
    prefix,
    slotCode,
    suffix,
    hasPrefix: prefixLines.length > 0,
    hasSuffix: suffixLines.length > 0,
    contextBefore,
    contextAfter,
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
  parts.push(newSlotCode);
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
  onToggleFullFileView?: () => void;
}

export function GuidedTaskSlotEditor({
  file,
  task,
  taskNumber,
  onChange,
  onToggleFullFileView,
}: GuidedTaskSlotEditorProps) {
  const initialExtraction = useMemo(
    () => extractGuidedTaskSlot(file, task, taskNumber),
    // Re-anchor when switching task or switching target file
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [task.id, file.id, taskNumber],
  );

  const [anchor, setAnchor] = useState<GuidedTaskSlotExtraction>(initialExtraction);
  const [slotValue, setSlotValue] = useState<string>(initialExtraction.slotCode);

  // Sync anchor when task or file changes, or when external reset/reference solution replaces the file outside the slot
  useEffect(() => {
    const expectedFull = spliceGuidedTaskSlot(anchor, slotValue);
    if (
      anchor.fileId !== file.id ||
      expectedFull !== file.code
    ) {
      const fresh = extractGuidedTaskSlot(file, task, taskNumber);
      setAnchor(fresh);
      setSlotValue(fresh.slotCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.id, file.id, file.code, taskNumber]);

  const handleSlotChange = useCallback(
    (nextSlot: string) => {
      setSlotValue(nextSlot);
      const nextFullCode = spliceGuidedTaskSlot(anchor, nextSlot);
      onChange(nextFullCode);
    },
    [anchor, onChange],
  );

  const modeMeta = INTERACTION_MODE_META[anchor.interactionMode];

  return (
    <div
      data-testid="guided-task-slot-editor"
      className="flex flex-col h-full w-full rounded-2xl border border-[#E5DFD3] bg-[#FFFDF9] overflow-hidden dark:border-white/10 dark:bg-[#0B1226]"
    >
      {/* Task Slot Header: Interaction Mode Pill + Target Region + Optional Full-File Escape Hatch */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5DFD3] bg-[#F4EFE6]/70 px-3.5 py-2 dark:border-white/10 dark:bg-[#131E3A]">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <span
            data-testid="guided-task-interaction-mode"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#4F6BFF]/12 px-2.5 py-1 font-mono text-[11px] font-bold text-[#4F6BFF] dark:bg-[#4F6BFF]/20 dark:text-[#A5B8FF]"
          >
            <Sparkles className="h-3 w-3 shrink-0" />
            <span>{anchor.interactionLabel}</span>
          </span>
          <span className="font-mono text-xs font-semibold text-[#0E1B3D] dark:text-white truncate">
            {anchor.targetRegionLabel}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block text-[11px] text-[#4A5578] dark:text-[#94A3C9]">
            {modeMeta.description}
          </span>
          {onToggleFullFileView && (
            <button
              type="button"
              onClick={onToggleFullFileView}
              data-testid="toggle-guided-full-file-btn"
              className="inline-flex items-center gap-1 rounded-lg border border-[#E5DFD3] bg-white px-2.5 py-1 font-mono text-[11px] font-semibold text-[#4A5578] hover:text-[#0E1B3D] dark:border-white/10 dark:bg-[#0B1226] dark:text-[#CBD5F0] dark:hover:text-white"
            >
              <Layers className="h-3 w-3" />
              <span>Inspect Full Project</span>
            </button>
          )}
        </div>
      </div>

      {/* Read-Only Surrounding Context (Before) */}
      {anchor.contextBefore.trim().length > 0 && (
        <div
          aria-label="Read-only surrounding code before your task slot"
          className="border-b border-dashed border-[#E5DFD3] bg-[#F4EFE6]/45 px-3.5 py-2 dark:border-white/10 dark:bg-[#070C1A]/80"
        >
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#7B86A6] dark:text-[#64748B] mb-1">
            <span className="inline-flex items-center gap-1">
              <Lock className="h-2.5 w-2.5" /> Surrounding Context (Read-Only)
            </span>
            <span>{anchor.fileName}</span>
          </div>
          <pre className="font-mono text-[11px] leading-snug text-[#64748B] dark:text-[#94A3C9]/70 overflow-x-auto whitespace-pre select-none">
            {anchor.contextBefore}
          </pre>
        </div>
      )}

      {/* Editable Task Slot Region (No IDE line numbers or file tab clutter) */}
      <div className="flex-1 min-h-[180px] flex flex-col p-2 bg-white dark:bg-[#0B1226]">
        <div className="flex items-center justify-between px-2 pb-1.5 text-[11px] font-mono font-semibold text-[#4F6BFF] dark:text-[#8DA2FF]">
          <span className="inline-flex items-center gap-1">
            <Code2 className="h-3 w-3" /> Editable Task Area — Your changes update the live preview automatically
          </span>
        </div>
        <div className="flex-1 min-h-0">
          <LessonCodeEditor
            value={slotValue}
            onChange={handleSlotChange}
            language={anchor.language}
            showLineNumbers={false}
            aria-label={`Guided task code slot for ${task.title}`}
            className="h-full w-full"
          />
        </div>
      </div>

      {/* Read-Only Surrounding Context (After) */}
      {anchor.contextAfter.trim().length > 0 && (
        <div
          aria-label="Read-only surrounding code after your task slot"
          className="border-t border-dashed border-[#E5DFD3] bg-[#F4EFE6]/45 px-3.5 py-2 dark:border-white/10 dark:bg-[#070C1A]/80"
        >
          <pre className="font-mono text-[11px] leading-snug text-[#64748B] dark:text-[#94A3C9]/70 overflow-x-auto whitespace-pre select-none">
            {anchor.contextAfter}
          </pre>
        </div>
      )}
    </div>
  );
}
