import { useState } from "react";
import type { CodeExampleActivity } from "@/lib/curriculum/types";
import type { ActivityRendererProps } from "../types";
import { ActivityContainer } from "../primitives/activity-container";
import { ActivityHeader } from "../primitives/activity-header";
import { MovementScene } from "../primitives/movement-scene";
import { ActivityActions } from "../primitives/activity-actions";
import { Code2, MessageSquare, Copy, Check, Eye, BookOpen, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

export function CodeExampleRenderer({
  activity,
  state,
  onContinue,
  onRevealHint,
  hintsRemaining,
}: ActivityRendererProps<CodeExampleActivity>) {
  const {
    title,
    description,
    code,
    language,
    highlightedLines = [],
    annotations = [],
  } = activity.content;
  const [copied, setCopied] = useState(false);
  const [activeLine, setActiveLine] = useState<number | null>(null);

  const isHtml = language?.toLowerCase() === "html" || (code.includes("<") && code.includes(">"));

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore copy failures gracefully */
    }
  };

  const lines = code.split("\n");
  const normalizedLanguage = language ? language.toLowerCase() : "code";

  return (
    <ActivityContainer id={`activity-${activity.id}`} variant="standard">
      <ActivityHeader
        activity={activity}
        onRevealHint={onRevealHint}
        hintsRemaining={hintsRemaining}
      />

      <MovementScene className="p-4 sm:p-6 md:p-8 flex flex-col gap-6">
        {/* Header Title & Intro: What are we looking at? */}
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-[0.16em] text-lesson-accent flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Observation & Code Study</span>
            </span>
          </div>

          {title && (
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-lesson-text-primary leading-snug flex items-center gap-2.5">
              <Code2 className="w-5 h-5 text-lesson-accent shrink-0" />
              <span>{title}</span>
            </h2>
          )}
          {description && (
            <p className="text-sm sm:text-base text-lesson-text-secondary leading-relaxed max-w-3xl">
              {description}
            </p>
          )}
        </header>

        {/* The Code: Central Learning Object */}
        <section aria-label="Code Example" className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-[0.16em] text-lesson-text-muted flex items-center gap-2">
              <Code2 className="w-3.5 h-3.5 text-lesson-accent" />
              <span>Code</span>
            </h3>
            {highlightedLines.length > 0 && (
              <span className="text-[11px] font-mono text-lesson-text-muted">
                {`${highlightedLines.length} highlighted ${highlightedLines.length === 1 ? "line" : "lines"}`}
              </span>
            )}
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 shadow-md overflow-hidden flex flex-col font-mono text-sm max-w-full">
            {/* Engineering Inspection Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/90 border-b border-zinc-800 select-none">
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700/60 text-[11px] font-mono font-bold text-zinc-300 uppercase tracking-wider">
                  {normalizedLanguage}
                </span>
                <span className="text-xs text-zinc-500 font-mono">
                  {lines.length} {lines.length === 1 ? "line" : "lines"}
                </span>
              </div>

              <button
                type="button"
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-600 cursor-pointer min-h-[32px]"
                aria-label="Copy source code"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Lines Surface */}
            <div className="overflow-x-auto max-w-full scrollbar-thin py-3">
              <pre className="text-zinc-300 select-text leading-relaxed min-w-[300px]">
                <code>
                  {lines.map((line, idx) => {
                    const lineNum = idx + 1;
                    const isHighlighted = highlightedLines.includes(lineNum);
                    const isAnnotated = annotations.some((ann) => ann.line === lineNum);
                    const isHovered = activeLine === lineNum;

                    return (
                      <div
                        key={idx}
                        onMouseEnter={() => isAnnotated && setActiveLine(lineNum)}
                        onMouseLeave={() => isAnnotated && setActiveLine(null)}
                        onClick={() =>
                          isAnnotated && setActiveLine(activeLine === lineNum ? null : lineNum)
                        }
                        className={cn(
                          "flex items-center w-full px-4 border-l-2 transition-colors duration-150 relative",
                          isAnnotated && "cursor-pointer",
                          isHighlighted
                            ? "bg-amber-500/10 border-amber-500 text-amber-200"
                            : "border-transparent",
                          isHovered && "bg-zinc-800/60 border-lesson-accent text-zinc-100",
                          isAnnotated &&
                            !isHighlighted &&
                            !isHovered &&
                            "border-sky-500/50 bg-sky-500/5",
                        )}
                      >
                        {/* Line Number Column */}
                        <span className="w-9 text-right pr-3 text-xs font-mono font-medium text-zinc-600 select-none border-r border-zinc-800/80 mr-3 shrink-0">
                          {lineNum}
                        </span>
                        {/* Line Content */}
                        <span className="flex-1 whitespace-pre pr-4 text-[13px] md:text-sm font-semibold tracking-wide">
                          {line || " "}
                        </span>
                        {/* Annotation Flag Badge */}
                        {isAnnotated && (
                          <span
                            className={cn(
                              "text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border select-none shrink-0 ml-2 transition-colors",
                              isHovered
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                : "bg-sky-500/15 text-sky-400 border-sky-500/30",
                            )}
                          >
                            Line Note
                          </span>
                        )}
                      </div>
                    );
                  })}
                </code>
              </pre>
            </div>
          </div>
        </section>

        {/* Browser Output (HTML Examples Only) */}
        {isHtml && (
          <section aria-label="Browser Output" className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-[0.16em] text-lesson-text-muted flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-lesson-accent" />
                <span>Browser Output</span>
              </h3>
            </div>

            <div className="rounded-xl border border-lesson-border bg-white shadow-xs overflow-hidden flex flex-col font-sans">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-100 border-b border-slate-200 text-xs font-mono text-slate-600 select-none">
                <div className="flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-[11px] text-slate-600">
                    Sandboxed Document Preview
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                  HTML Output
                </span>
              </div>

              <div className="p-4 bg-white min-h-[140px] flex-1">
                <iframe
                  title="Rendered HTML Output"
                  srcDoc={`
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <meta charset="utf-8" />
                        <style>
                          body {
                            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                            margin: 8px;
                            color: #0f172a;
                            background-color: #ffffff;
                          }
                          p { line-height: 1.5; margin: 6px 0; }
                          h1, h2, h3, h4 { margin-top: 8px; margin-bottom: 6px; color: #020617; font-weight: 800; }
                        </style>
                      </head>
                      <body>${code}</body>
                    </html>
                  `}
                  className="w-full h-full min-h-[120px] border-0"
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
          </section>
        )}

        {/* How It Works (Line Breakdown / Annotations) */}
        {annotations && annotations.length > 0 && (
          <section aria-label="Code Annotations" className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-[0.16em] text-lesson-text-muted flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-lesson-accent" />
                <span>How It Works</span>
              </h3>
              <span className="text-xs font-mono text-lesson-text-muted">
                {annotations.length} {annotations.length === 1 ? "annotation" : "annotations"}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {annotations.map((ann, idx) => {
                const isHovered = activeLine === ann.line;

                return (
                  <div
                    key={idx}
                    className={cn(
                      "flex gap-3.5 p-3.5 rounded-xl border transition-all duration-200 text-sm cursor-pointer",
                      isHovered
                        ? "border-lesson-accent bg-lesson-surface-subtle ring-1 ring-lesson-accent shadow-xs"
                        : "border-lesson-border bg-lesson-surface text-lesson-text-primary hover:bg-lesson-surface-subtle",
                    )}
                    onMouseEnter={() => setActiveLine(ann.line)}
                    onMouseLeave={() => setActiveLine(null)}
                    onClick={() => setActiveLine(activeLine === ann.line ? null : ann.line)}
                  >
                    <div className="flex flex-col gap-1 items-start shrink-0">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded font-mono text-xs font-bold transition-colors flex items-center gap-1",
                          isHovered
                            ? "bg-amber-500/20 text-amber-500"
                            : "bg-lesson-surface-subtle border border-lesson-border text-lesson-text-secondary",
                        )}
                      >
                        <Hash className="w-3 h-3" />
                        <span>Line {ann.line}</span>
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-lesson-text-secondary text-xs sm:text-sm font-medium leading-relaxed">
                        {ann.comment}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </MovementScene>

      <ActivityActions
        status={state.status}
        isInteractive={false}
        onContinue={onContinue}
        continueLabel="Continue"
      />
    </ActivityContainer>
  );
}
