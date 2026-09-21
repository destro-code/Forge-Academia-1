import { useState } from "react";
import {
  AlertTriangle,
  RotateCcw,
  FileCode,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Terminal,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { V1LessonValidationError } from "@/lib/curriculum/v1/loader";

export interface DeveloperLessonDiagnosticProps {
  lessonId: string;
  error?: V1LessonValidationError;
  onRetry?: () => void;
  className?: string;
}

export function DeveloperLessonDiagnostic({
  lessonId,
  error,
  onRetry,
  className = "",
}: DeveloperLessonDiagnosticProps) {
  const [copied, setCopied] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const filePath = error?.filePath || `src/data/canonical/lessons-v1/${lessonId}.json`;
  const errors = error?.errors || ["Schema validation failed or file was unreadable."];

  const handleCopyPath = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(filePath);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRetry = () => {
    setIsRetrying(true);
    onRetry?.();
    setTimeout(() => setIsRetrying(false), 500);
  };

  return (
    <div
      id="dev-lesson-diagnostic-container"
      className={`flex min-h-screen w-full flex-col bg-slate-950 text-slate-100 font-sans ${className}`}
    >
      {/* Top Warning Bar */}
      <header
        id="dev-diagnostic-header"
        className="sticky top-0 z-30 flex items-center justify-between border-b border-rose-900/60 bg-rose-950/80 px-4 py-3 backdrop-blur-md sm:px-6"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-600/30 text-rose-400 border border-rose-500/40">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-rose-500/20 px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider text-rose-300 border border-rose-500/30">
                Forge V1 Schema Error
              </span>
              <span className="text-xs text-rose-300/70 hidden sm:inline">
                Development Mode Diagnostics
              </span>
            </div>
            <h1
              id="dev-diagnostic-title"
              className="text-base font-bold text-white tracking-tight sm:text-lg"
            >
              [Forge V1 Schema Error] Failed to Load {lessonId}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/learn"
            id="dev-diagnostic-leave-link"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/90 px-3 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Leave</span>
          </a>

          <Button
            id="dev-diagnostic-retry-btn"
            onClick={handleRetry}
            disabled={isRetrying}
            className="min-h-9 gap-1.5 rounded-lg bg-rose-600 px-4 text-xs font-semibold text-white shadow-lg shadow-rose-950/50 hover:bg-rose-500 active:scale-95"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${isRetrying ? "animate-spin" : ""}`} />
            <span>{isRetrying ? "Validating…" : "Retry Validation"}</span>
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <div className="space-y-6">
          {/* Target File Info Card */}
          <div
            id="dev-diagnostic-file-card"
            className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5">
                <FileCode className="h-5 w-5 text-amber-400 shrink-0" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  File Target
                </span>
              </div>
              <div className="flex items-center gap-2">
                <code
                  id="dev-diagnostic-file-path"
                  className="rounded-md border border-slate-700/80 bg-slate-950 px-3 py-1 font-mono text-xs text-amber-300 selection:bg-amber-400 selection:text-slate-950"
                >
                  {filePath}
                </code>
                <button
                  id="dev-diagnostic-copy-path-btn"
                  type="button"
                  onClick={handleCopyPath}
                  className="inline-flex h-7 w-7 items-center justify-center rounded border border-slate-700 bg-slate-800 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
                  title="Copy path"
                  aria-label="Copy file path"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400 leading-relaxed">
              This lesson file was detected in the V1 lessons directory but failed strict Zod
              schema validation. Layer 1 fallback is disabled to prevent stale mock data from being served.
            </p>
          </div>

          {/* Validation Diagnostics List */}
          <div
            id="dev-diagnostic-issues-card"
            className="rounded-xl border border-rose-900/50 bg-slate-900/95 overflow-hidden shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-rose-900/40 bg-rose-950/40 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-rose-300">
                  Zod Validation Issues ({errors.length})
                </h2>
              </div>
              <span className="text-[11px] font-mono text-rose-300/80">
                canonicalLessonV1Schema
              </span>
            </div>

            <div className="divide-y divide-slate-800/80 p-2 sm:p-4">
              {errors.map((err, index) => {
                const parts = err.split(":");
                const pathPart = parts.length > 1 ? parts[0].trim() : "";
                const msgPart = parts.length > 1 ? parts.slice(1).join(":").trim() : err;

                return (
                  <div
                    key={index}
                    id={`dev-diagnostic-issue-${index}`}
                    className="group flex flex-col gap-1.5 p-3 rounded-lg hover:bg-slate-800/40 transition-colors sm:flex-row sm:items-start sm:gap-4"
                  >
                    <div className="flex items-center gap-2 shrink-0 sm:w-1/3">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500/20 text-[10px] font-mono font-bold text-rose-400">
                        {index + 1}
                      </span>
                      {pathPart ? (
                        <code className="rounded bg-rose-950/80 border border-rose-800/60 px-2 py-0.5 font-mono text-xs font-semibold text-rose-300 break-all">
                          {pathPart}
                        </code>
                      ) : (
                        <code className="rounded bg-rose-950/80 border border-rose-800/60 px-2 py-0.5 font-mono text-xs font-semibold text-rose-300">
                          root
                        </code>
                      )}
                    </div>
                    <div className="sm:flex-1">
                      <p className="text-xs font-medium text-slate-200">{msgPart}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Raw JSON Inspector */}
          {error?.rawSource ? (
            <div
              id="dev-diagnostic-raw-card"
              className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl"
            >
              <button
                type="button"
                id="dev-diagnostic-toggle-raw-btn"
                onClick={() => setShowRawJson(!showRawJson)}
                className="flex w-full items-center justify-between px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-300 hover:bg-slate-800/50"
              >
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-sky-400" />
                  <span>Inspect Raw Source Payload</span>
                </div>
                {showRawJson ? (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                )}
              </button>

              {showRawJson && (
                <div className="border-t border-slate-800 bg-slate-950 p-4">
                  <pre className="max-h-96 overflow-auto font-mono text-[11px] leading-relaxed text-emerald-300 selection:bg-emerald-900">
                    {JSON.stringify(error.rawSource, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : null}

          {/* Helpful V1 Schema Checklist */}
          <div
            id="dev-diagnostic-schema-reference-card"
            className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-5"
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              V1 Schema Required Sections
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
              <div className="rounded bg-slate-800/50 p-2 border border-slate-700/50">
                <code className="text-amber-300 font-mono text-[11px] font-bold">id</code>
                <p className="text-[10px] text-slate-400 mt-0.5">Top-level lesson ID string</p>
              </div>
              <div className="rounded bg-slate-800/50 p-2 border border-slate-700/50">
                <code className="text-amber-300 font-mono text-[11px] font-bold">schemaVersion</code>
                <p className="text-[10px] text-slate-400 mt-0.5">&quot;1.0.0&quot;</p>
              </div>
              <div className="rounded bg-slate-800/50 p-2 border border-slate-700/50">
                <code className="text-amber-300 font-mono text-[11px] font-bold">identity</code>
                <p className="text-[10px] text-slate-400 mt-0.5">id, slug, title, description</p>
              </div>
              <div className="rounded bg-slate-800/50 p-2 border border-slate-700/50">
                <code className="text-amber-300 font-mono text-[11px] font-bold">curriculum</code>
                <p className="text-[10px] text-slate-400 mt-0.5">topicId, moduleId, phaseId, order</p>
              </div>
              <div className="rounded bg-slate-800/50 p-2 border border-slate-700/50">
                <code className="text-amber-300 font-mono text-[11px] font-bold">learning</code>
                <p className="text-[10px] text-slate-400 mt-0.5">concepts, skills, objectives</p>
              </div>
              <div className="rounded bg-slate-800/50 p-2 border border-slate-700/50">
                <code className="text-amber-300 font-mono text-[11px] font-bold">mastery</code>
                <p className="text-[10px] text-slate-400 mt-0.5">requiredActivities, criteria</p>
              </div>
              <div className="rounded bg-slate-800/50 p-2 border border-slate-700/50">
                <code className="text-amber-300 font-mono text-[11px] font-bold">relationships</code>
                <p className="text-[10px] text-slate-400 mt-0.5">prerequisites, nextLessons</p>
              </div>
              <div className="rounded bg-slate-800/50 p-2 border border-slate-700/50">
                <code className="text-amber-300 font-mono text-[11px] font-bold">activities</code>
                <p className="text-[10px] text-slate-400 mt-0.5">Array of ActivityV1 objects</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
