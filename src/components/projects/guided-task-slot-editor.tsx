import { useCallback, useMemo } from "react";
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

export function inferTaskInteractionMode(task: ProjectTask, language: string): TaskInteractionMode {
  if (task.interactionMode) return task.interactionMode;
  const text = `${task.title} ${task.description}`.toLowerCase();
  const lang = language.toLowerCase();
  if (["javascript", "js", "typescript", "ts"].includes(lang)) return "implement-behaviour";
  if (lang === "css") {
    if (["token", ":root", "variable", "contrast", "focus"].some(word => text.includes(word))) return "change-value";
    return "complete-code";
  }
  if (["card", "section", "grid", "hero", "header", "form"].some(word => text.includes(word))) return "build-component";
  if (["complete", "replace", "remediate"].some(word => text.includes(word))) return "complete-code";
  return "write-code";
}

/** Resolve only an explicitly authored slot; never guess from TODOs, selectors, or file structure. */
export function extractGuidedTaskSlot(file: PlaygroundFile, task: ProjectTask, taskNumber: number): GuidedTaskSlotExtraction {
  const spec = task.taskSlot;
  if (!spec) throw new Error(`Guided Build step ${taskNumber} ("${task.title}") has no explicit task-slot configuration.`);
  if (file.name !== spec.targetFile) {
    throw new Error(`Task "${task.title}" targets ${spec.targetFile}, but the selected file is ${file.name}.`);
  }
  const lines = (file.code || "").split("\n");
  const starts: number[] = [], ends: number[] = [];
  lines.forEach((line,index) => { if(line.trim()===spec.slotStartMarker) starts.push(index); if(line.trim()===spec.slotEndMarker) ends.push(index); });
  if (starts.length!==1 || ends.length!==1 || ends[0]<=starts[0]) {
    throw new Error(`Task "${task.title}" requires exactly one ordered pair of slot markers in ${file.name}; found ${starts.length} start marker(s) and ${ends.length} end marker(s).`);
  }
  const start=starts[0], end=ends[0], interactionMode=inferTaskInteractionMode(task,file.language);
  return {
    fileId:file.id,fileName:file.name,language:file.language,interactionMode,
    interactionLabel:INTERACTION_MODE_META[interactionMode].label,
    targetRegionLabel:spec.contextLabel || spec.slotId,
    prefix:lines.slice(0,start+1).join("\n"),
    slotCode:lines.slice(start+1,end).join("\n"),
    suffix:lines.slice(end).join("\n"),
  };
}

/** Reinsert learner code while preserving all surrounding workspace code. */
export function spliceGuidedTaskSlot(extraction: Pick<GuidedTaskSlotExtraction,"prefix"|"suffix">,newSlotCode:string):string {
  return newSlotCode.length>0 ? `${extraction.prefix}\n${newSlotCode}\n${extraction.suffix}` : `${extraction.prefix}\n${extraction.suffix}`;
}

interface GuidedTaskSlotEditorProps { file: PlaygroundFile; task: ProjectTask; taskNumber: number; onChange: (newFullFileCode:string)=>void; }

export function GuidedTaskSlotEditor({file,task,taskNumber,onChange}:GuidedTaskSlotEditorProps) {
  const state=useMemo(()=>{
    try{return {extraction:extractGuidedTaskSlot(file,task,taskNumber),error:null as string|null};}
    catch(error){return {extraction:null,error:error instanceof Error?error.message:"The focused code-entry area is not configured correctly."};}
  },[file.id,file.name,file.code,task.id,taskNumber]);
  const extraction=state.extraction;
  const handleSlotChange=useCallback((nextSlot:string)=>{if(extraction)onChange(spliceGuidedTaskSlot(extraction,nextSlot));},[extraction,onChange]);

  if(!extraction) return <div role="alert" data-testid="guided-task-slot-error" className="flex h-full items-center rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-foreground">This step's focused code-entry area is not ready. Your existing project code has not been changed.</div>;

  return (
    <div data-testid="guided-task-slot-editor" className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex min-h-10 items-center justify-between gap-3 border-b border-border px-3 py-2">
        <span className="truncate text-xs font-semibold text-foreground">{extraction.targetRegionLabel}</span>
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">{file.language}</span>
      </div>
      <div className="min-h-0 flex-1 p-2">
        <LessonCodeEditor key={`${task.id}:${file.id}`} value={extraction.slotCode} onChange={handleSlotChange} language={extraction.language} showLineNumbers={false} aria-label={`Code entry for ${task.title}`} className="h-full w-full" />
      </div>
    </div>
  );
}
