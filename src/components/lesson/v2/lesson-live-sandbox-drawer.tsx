import { useState, useEffect, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import {
  Play,
  RotateCcw,
  Terminal,
  Monitor,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  X,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ForgeBuddyMascot3D, type ForgeBuddyMood } from "@/components/atelier/forge-buddy-illos";
import type { LessonPracticeSnippet } from "@/lib/curriculum/v1/eli5-mentor-bank";
import { cn } from "@/lib/utils";

export interface LessonLiveSandboxDrawerProps {
  lessonId: string;
  lessonTitle: string;
  snippet: LessonPracticeSnippet;
  overrideCode?: string | null;
  overrideTitle?: string | null;
  overrideChallenge?: string | null;
  onClearOverride?: () => void;
  onClose?: () => void;
  variant?: "drawer" | "inline";
}

interface ConsoleEntry {
  id: string;
  level: "log" | "warn" | "error";
  text: string;
}

export function LessonLiveSandboxDrawer({
  lessonId,
  lessonTitle,
  snippet,
  overrideCode,
  overrideTitle,
  overrideChallenge,
  onClearOverride,
  onClose,
  variant = "inline",
}: LessonLiveSandboxDrawerProps) {
  const activeStarterCode = overrideCode || snippet.starterCode;
  const activeTitle = overrideTitle || snippet.title;
  const activeChallenge = overrideChallenge || snippet.challengePrompt;

  const [code, setCode] = useState(activeStarterCode);
  const [logs, setLogs] = useState<ConsoleEntry[]>([]);
  const [runStatus, setRunStatus] = useState<"idle" | "running" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [activeOutputTab, setActiveOutputTab] = useState<"console" | "preview">(
    !overrideCode && (snippet.language === "html" || snippet.language === "css")
      ? "preview"
      : "console",
  );

  // Sync when lesson or override changes
  useEffect(() => {
    setCode(activeStarterCode);
    setLogs([]);
    setRunStatus("idle");
    setErrorMessage(null);
    setActiveOutputTab(
      !overrideCode && (snippet.language === "html" || snippet.language === "css")
        ? "preview"
        : "console",
    );
  }, [lessonId, activeStarterCode, overrideCode, snippet.language]);

  const executeCode = useCallback(async () => {
    setRunStatus("running");
    setErrorMessage(null);
    const captured: ConsoleEntry[] = [];

    const pushLog = (level: "log" | "warn" | "error", args: unknown[]) => {
      const formatted = args
        .map((arg) => {
          if (typeof arg === "string") return arg;
          if (arg instanceof Error) return arg.message;
          try {
            return JSON.stringify(arg);
          } catch {
            return String(arg);
          }
        })
        .join(" ");
      captured.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        level,
        text: formatted,
      });
      setLogs([...captured]);
    };

    if (snippet.language === "html" || snippet.language === "css") {
      const doc =
        snippet.language === "css"
          ? `<!DOCTYPE html><html><head><style>${code}</style></head><body><div class="box">Styled Preview</div></body></html>`
          : code;
      setPreviewHtml(doc);
      setRunStatus("success");
      pushLog("log", ["✨ Live HTML/CSS preview updated!"]);
      return;
    }

    // JavaScript / Async execution with console capture
    const customConsole = {
      log: (...args: unknown[]) => pushLog("log", args),
      info: (...args: unknown[]) => pushLog("log", args),
      warn: (...args: unknown[]) => pushLog("warn", args),
      error: (...args: unknown[]) => pushLog("error", args),
    };

    try {
      const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
      const runner = new AsyncFunction("console", code);
      await runner(customConsole);
      // Wait briefly for microtasks or short setTimeouts (like 150ms demo promises) to resolve
      await new Promise((r) => setTimeout(r, 380));

      const hasErrorLog = captured.some((l) => l.level === "error" && l.text.includes("Uncaught"));
      setRunStatus(hasErrorLog ? "error" : "success");
      if (captured.length === 0) {
        pushLog("log", ["✅ Code executed cleanly (no console.log output)."]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
      pushLog("error", [`❌ Runtime Error: ${msg}`]);
      setRunStatus("error");
    }
  }, [code, snippet.language]);

  // Run starter code once on mount so user immediately sees live output
  useEffect(() => {
    void executeCode();
  }, [executeCode]);

  const handleReset = () => {
    if (overrideCode && onClearOverride) {
      onClearOverride();
    }
    setCode(snippet.starterCode);
    setLogs([]);
    setErrorMessage(null);
    setRunStatus("idle");
  };

  const mascotMood: ForgeBuddyMood =
    runStatus === "error" ? "thinking" : runStatus === "success" ? "cheering" : "coding";

  return (
    <section
      aria-label="In-Lesson Live Code Studio"
      className={cn(
        "atelier-code-window overflow-hidden text-[var(--code-foreground)]",
        variant === "drawer"
          ? "flex h-full flex-col border-l border-[var(--code-border)] shadow-xl"
          : "my-4 rounded-2xl border border-[var(--code-border)] shadow-md",
      )}
    >
      {/* Top Studio Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--code-border)] bg-[var(--code-surface-raised)] px-4 py-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Code2 className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "font-mono text-[10px] font-bold uppercase tracking-wider",
                  overrideCode ? "text-[var(--code-warning)]" : "text-[var(--code-info)]",
                )}
              >
                {overrideCode ? "Live Interview Trap Sandbox" : "Zero-Setup Live Practice"}
              </span>
              <span className="rounded-full bg-info/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-[var(--code-info)]">
                {overrideCode ? "JAVASCRIPT" : snippet.language.toUpperCase()}
              </span>
            </div>
            <h3 className="truncate font-display text-sm font-extrabold text-[var(--code-foreground)]">
              {activeTitle}
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleReset}
            className="h-8 gap-1.5 text-xs text-[var(--code-muted)] hover:bg-white/10 hover:text-[var(--code-foreground)]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </Button>

          <Button
            type="button"
            size="sm"
            asChild
            variant="outline"
            className="h-8 gap-1.5 border-[var(--code-border)] bg-[var(--code-surface)] text-xs text-[var(--code-muted)] hover:bg-[var(--code-surface-strong)] hover:text-[var(--code-foreground)]"
          >
            <Link
              to="/playground"
              search={{
                mode: "lesson-inline",
                lessonId,
                title: activeTitle,
                lang: overrideCode ? "javascript" : snippet.language,
                code,
              }}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Full Playground</span>
            </Link>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => void executeCode()}
            className="h-8 gap-1.5 rounded-xl bg-primary px-3.5 text-xs font-bold text-primary-foreground hover:bg-primary/90"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Run Code</span>
          </Button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close live code sandbox"
              className="rounded-lg p-1.5 text-[var(--code-muted)] hover:bg-white/10 hover:text-[var(--code-foreground)]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Reactive Forge Mascot Challenge & Feedback Banner */}
      <div
        className={cn(
          "flex flex-col gap-3 border-b border-[var(--code-border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between shrink-0",
          runStatus === "error"
            ? "bg-destructive/15"
            : runStatus === "success"
              ? "bg-success/15"
              : "bg-[var(--code-surface-raised)]",
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-11 w-11 shrink-0 rounded-xl border border-[var(--code-border)] bg-[var(--code-surface)] p-1">
            <ForgeBuddyMascot3D mood={mascotMood} className="h-full w-full" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider">
              {runStatus === "error" ? (
                <span className="inline-flex items-center gap-1 text-[var(--code-error)]">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Forge spotted a bug — let&apos;s fix it!
                </span>
              ) : runStatus === "success" ? (
                <span className="inline-flex items-center gap-1 text-[var(--code-success)]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Forge is cheering! Code ran cleanly
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[var(--code-info)]">
                  <Sparkles className="h-3.5 w-3.5 text-[var(--code-warning)]" />
                  {overrideCode ? "Interview Trap Experiment" : `Mini Challenge for ${lessonTitle}`}
                </span>
              )}
            </div>
            <p className="text-xs leading-relaxed text-[var(--code-foreground)]">
              {runStatus === "error" && errorMessage
                ? `Check line syntax: "${errorMessage}". Remember to match parentheses, brackets, and async/await keywords.`
                : activeChallenge}
            </p>
          </div>
        </div>
      </div>

      {/* Split Editor + Live Console / Preview Grid */}
      <div
        className={cn(
          "grid grid-cols-1",
          variant === "drawer" ? "flex-1 overflow-y-auto" : "lg:grid-cols-12",
        )}
      >
        {/* Left / Top: Code Editor */}
        <div
          className={cn(
            "border-b border-[var(--code-border)]",
            variant === "drawer" ? "" : "lg:col-span-7 lg:border-b-0 lg:border-r",
          )}
        >
          <div className="flex items-center justify-between border-b border-[var(--code-border)] bg-[var(--code-surface-strong)] px-3.5 py-1.5 font-mono text-[11px] text-[var(--code-muted)]">
            <span>
              {snippet.language === "html"
                ? "index.html"
                : snippet.language === "css"
                  ? "styles.css"
                  : "practice.js"}
            </span>
            <span>Editable · Press Run to test</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (runStatus !== "idle") setRunStatus("idle");
            }}
            spellCheck={false}
            rows={12}
            aria-label="Live lesson code editor"
            className="w-full resize-y bg-[var(--code-surface-strong)] p-4 font-mono text-xs leading-relaxed text-[var(--code-foreground)] focus:outline-none"
          />
        </div>

        {/* Right / Bottom: Output Console or HTML Preview */}
        <div
          className={cn(
            "flex flex-col bg-[var(--code-surface)]",
            variant === "drawer" ? "flex-1" : "lg:col-span-5",
          )}
        >
          <div className="flex items-center justify-between border-b border-[var(--code-border)] bg-[var(--code-surface-raised)] px-3 py-1.5">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveOutputTab("console")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors",
                  activeOutputTab === "console"
                    ? "bg-primary text-primary-foreground"
                    : "text-[var(--code-muted)] hover:text-[var(--code-foreground)]",
                )}
              >
                <Terminal className="h-3 w-3" />
                <span>Console ({logs.length})</span>
              </button>
              {(snippet.language === "html" || snippet.language === "css") && (
                <button
                  type="button"
                  onClick={() => setActiveOutputTab("preview")}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors",
                    activeOutputTab === "preview"
                      ? "bg-primary text-primary-foreground"
                      : "text-[var(--code-muted)] hover:text-[var(--code-foreground)]",
                  )}
                >
                  <Monitor className="h-3 w-3" />
                  <span>Live Preview</span>
                </button>
              )}
            </div>
          </div>

          {activeOutputTab === "preview" &&
          (snippet.language === "html" || snippet.language === "css") ? (
            <div className="min-h-[240px] flex-1 bg-white">
              <iframe
                title="Lesson Live Preview"
                srcDoc={previewHtml}
                sandbox="allow-scripts"
                className="h-full min-h-[240px] w-full border-0"
              />
            </div>
          ) : (
            <div className="min-h-[240px] max-h-[300px] flex-1 space-y-1.5 overflow-y-auto p-3.5 font-mono text-xs">
              {logs.length === 0 ? (
                <p className="text-[var(--code-muted)]">
                  Click &ldquo;Run Code&rdquo; to execute and inspect output...
                </p>
              ) : (
                logs.map((entry) => (
                  <div
                    key={entry.id}
                    className={cn(
                      "rounded-lg border px-2.5 py-1.5 leading-relaxed break-words",
                      entry.level === "error"
                        ? "border-destructive/40 bg-destructive/15 text-[var(--code-error)]"
                        : entry.level === "warn"
                          ? "border-warning/40 bg-warning/15 text-[var(--code-warning)]"
                          : "border-white/10 bg-white/5 text-[var(--code-foreground)]",
                    )}
                  >
                    {entry.text}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
