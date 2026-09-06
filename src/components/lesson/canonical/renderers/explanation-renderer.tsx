import { useState } from "react";
import type { ExplanationActivity } from "@/lib/curriculum/types";
import type { ActivityRendererProps } from "../types";
import { ActivityContainer } from "../primitives/activity-container";
import { MovementScene, MovementEyebrow } from "../primitives/movement-scene";
import { ActivityActions } from "../primitives/activity-actions";
import { Callout } from "@/components/shared/callout";
import { Sparkles, Compass, Cpu, ShieldAlert, Check, Copy } from "lucide-react";

/**
 * A parsed unit of an explanation.
 * Surfaces concept structures, mechanisms, consequences, lists, and examples
 * into distinct cognitive surfaces rather than an undifferentiated wall of prose.
 */
type ExplanationBlock =
  | { kind: "concept"; index: string; title: string; body: string[]; example?: string }
  | { kind: "mechanism"; label: string; text: string }
  | { kind: "consequence"; label: string; text: string }
  | { kind: "rule"; label: string; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "code"; code: string; language?: string }
  | { kind: "prose"; text: string; isLead: boolean };

function parseExplanation(text: string): ExplanationBlock[] {
  const paragraphs = text
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);

  let hasEmittedLead = false;

  return paragraphs.map((para): ExplanationBlock => {
    // 1. Code block fenced with ```
    if (para.startsWith("```") && para.endsWith("```") && para.length >= 6) {
      const lines = para.split("\n");
      const langMatch = lines[0].match(/^```(\w+)?/);
      const language = langMatch ? langMatch[1] : undefined;
      const code = lines.slice(1, -1).join("\n");
      return { kind: "code", code, language };
    }

    const lines = para
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const first = lines[0] ?? "";

    // 2. Numbered concept block (e.g., "1. Box Sizing")
    const numbered = first.match(/^(\d+)\.\s+(.*)$/);
    if (numbered) {
      const rest = lines.slice(1);
      const exampleLine = rest.find((l) => /^example:\s*/i.test(l));
      const body = rest.filter((l) => !/^example:\s*/i.test(l));
      return {
        kind: "concept",
        index: numbered[1],
        title: numbered[2],
        body,
        example: exampleLine ? exampleLine.replace(/^example:\s*/i, "") : undefined,
      };
    }

    // 3. Bulleted or listed items
    const bulletLines = lines.filter((l) => /^[-*•]\s+/.test(l));
    if (bulletLines.length > 0 && bulletLines.length === lines.length) {
      return {
        kind: "list",
        items: bulletLines.map((l) => l.replace(/^[-*•]\s+/, "")),
      };
    }

    // 4. Mechanism observation (How it works / Mechanism)
    const mechanismMatch = para.match(/^(how (?:this|it) works|mechanism):\s*(.+)$/is);
    if (mechanismMatch) {
      return {
        kind: "mechanism",
        label: mechanismMatch[1].toUpperCase(),
        text: mechanismMatch[2],
      };
    }

    // 5. Engineering consequence (Why this matters / In practice)
    const consequenceMatch = para.match(
      /^(why (?:this|it) matters|why you should care|engineering consequence|in practice):\s*(.+)$/is,
    );
    if (consequenceMatch) {
      return {
        kind: "consequence",
        label: consequenceMatch[1].toUpperCase(),
        text: consequenceMatch[2],
      };
    }

    // 6. Core engineering rule
    const ruleMatch = para.match(/^(key rule|core rule|rule|golden rule):\s*(.+)$/is);
    if (ruleMatch) {
      return {
        kind: "rule",
        label: ruleMatch[1].toUpperCase(),
        text: ruleMatch[2],
      };
    }

    // 7. General prose (first non-structural paragraph acts as lead concept)
    const isLead = !hasEmittedLead;
    hasEmittedLead = true;
    return { kind: "prose", text: para, isLead };
  });
}

/**
 * Parses inline backticks into clean monospaced tokens without external dependencies.
 */
function renderFormattedText(text: string) {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code
          key={i}
          className="rounded-md border border-lesson-border bg-lesson-surface-subtle/80 px-1.5 py-0.5 font-mono text-[13px] font-medium text-lesson-text-primary"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

/**
 * Clean example code block with interactive copy button.
 */
function ConceptCodeSnippet({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard errors gracefully
    }
  };

  return (
    <div className="relative mt-4 group">
      <div className="flex items-center justify-between px-3.5 py-1.5 rounded-t-lg border-t border-x border-lesson-border bg-lesson-surface-subtle/70 text-[11px] font-mono text-lesson-text-muted">
        <span className="font-semibold uppercase tracking-wider">Example</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-lesson-text-muted hover:text-lesson-text-primary transition-colors focus-visible:outline-none"
          aria-label="Copy example code"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-500" />
              <span className="text-emerald-500 font-semibold">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto rounded-b-lg border border-lesson-border bg-lesson-bg/80 px-3.5 py-3 font-mono text-[13px] leading-relaxed text-lesson-text-primary">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/**
 * ExplanationRenderer — the mental model workspace.
 *
 * Distinct from the trailhead intro, this renderer organizes cognitive
 * understanding into clear layers: the core idea, mechanisms, supporting concepts,
 * and key engineering takeaways.
 */
export function ExplanationRenderer({
  activity,
  state,
  onContinue,
}: ActivityRendererProps<ExplanationActivity>) {
  const { title, text, callout, keyTakeaway } = activity.content;
  const blocks = parseExplanation(text);

  return (
    <ActivityContainer id={`activity-${activity.id}`} variant="immersive">
      <MovementScene className="mx-auto w-full max-w-3xl">
        <article className="flex flex-col gap-8 py-2 sm:py-6">
          {/* Movement orientation and heading */}
          <header className="space-y-4">
            <MovementEyebrow type={activity.type} />
            {title && (
              <h1 className="text-2xl font-bold leading-tight tracking-tight text-balance text-lesson-text-primary sm:text-3xl lg:text-[2.25rem]">
                {title}
              </h1>
            )}
          </header>

          {/* Structured mental model blocks */}
          <div className="flex flex-col gap-5">
            {blocks.map((block, idx) => {
              if (block.kind === "concept") {
                return (
                  <section
                    key={idx}
                    aria-label={`Concept ${block.index}: ${block.title}`}
                    className="rounded-2xl border border-lesson-border bg-lesson-surface/60 p-5 transition-colors duration-300 hover:border-lesson-border/80 sm:p-6 animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-both duration-500"
                    style={{ animationDelay: `${idx * 70}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-bold border border-lesson-border"
                        style={{
                          backgroundColor: "var(--m-accent-soft, rgba(245, 158, 11, 0.1))",
                          color: "var(--m-accent, #f59e0b)",
                        }}
                      >
                        {block.index}
                      </span>
                      <h2 className="text-base font-semibold leading-snug text-lesson-text-primary sm:text-lg">
                        {renderFormattedText(block.title)}
                      </h2>
                    </div>

                    {block.body.length > 0 && (
                      <div className="mt-3.5 space-y-2 pl-11">
                        {block.body.map((line, j) => (
                          <p
                            key={j}
                            className="text-[15px] leading-relaxed text-lesson-text-secondary sm:text-base"
                          >
                            {renderFormattedText(line)}
                          </p>
                        ))}
                      </div>
                    )}

                    {block.example && (
                      <div className="pl-11">
                        <ConceptCodeSnippet code={block.example} />
                      </div>
                    )}
                  </section>
                );
              }

              if (block.kind === "mechanism") {
                return (
                  <aside
                    key={idx}
                    aria-label={block.label}
                    className="rounded-2xl border border-lesson-border bg-lesson-surface/50 p-5 sm:p-6"
                  >
                    <div className="flex items-start gap-3.5">
                      <span
                        aria-hidden
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-lesson-border bg-lesson-surface-subtle text-lesson-text-secondary"
                      >
                        <Cpu className="h-4 w-4 text-lesson-accent" />
                      </span>
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-[11px] font-mono font-bold uppercase tracking-[0.16em] text-lesson-text-muted">
                          {block.label}
                        </p>
                        <p className="text-[15px] leading-relaxed text-lesson-text-primary sm:text-base">
                          {renderFormattedText(block.text)}
                        </p>
                      </div>
                    </div>
                  </aside>
                );
              }

              if (block.kind === "consequence") {
                return (
                  <aside
                    key={idx}
                    aria-label={block.label}
                    className="rounded-2xl border border-lesson-border bg-lesson-surface/50 p-5 sm:p-6"
                  >
                    <div className="flex items-start gap-3.5">
                      <span
                        aria-hidden
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-lesson-border bg-lesson-surface-subtle text-lesson-text-secondary"
                      >
                        <Compass className="h-4 w-4 text-lesson-accent" />
                      </span>
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-[11px] font-mono font-bold uppercase tracking-[0.16em] text-lesson-text-muted">
                          {block.label}
                        </p>
                        <p className="text-[15px] leading-relaxed text-lesson-text-primary sm:text-base">
                          {renderFormattedText(block.text)}
                        </p>
                      </div>
                    </div>
                  </aside>
                );
              }

              if (block.kind === "rule") {
                return (
                  <aside
                    key={idx}
                    aria-label={block.label}
                    className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 sm:p-6"
                  >
                    <div className="flex items-start gap-3.5">
                      <span
                        aria-hidden
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-500"
                      >
                        <ShieldAlert className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-[11px] font-mono font-bold uppercase tracking-[0.16em] text-amber-500">
                          {block.label}
                        </p>
                        <p className="text-[15px] leading-relaxed text-lesson-text-primary sm:text-base font-medium">
                          {renderFormattedText(block.text)}
                        </p>
                      </div>
                    </div>
                  </aside>
                );
              }

              if (block.kind === "list") {
                return (
                  <ul key={idx} className="my-1 space-y-2.5 pl-1">
                    {block.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <span
                          aria-hidden
                          className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: "var(--m-accent, #f59e0b)" }}
                        />
                        <span className="text-[15px] leading-relaxed text-lesson-text-secondary sm:text-base">
                          {renderFormattedText(item)}
                        </span>
                      </li>
                    ))}
                  </ul>
                );
              }

              if (block.kind === "code") {
                return (
                  <div key={idx} className="my-2">
                    <ConceptCodeSnippet code={block.code} />
                  </div>
                );
              }

              // Regular prose paragraph
              return (
                <p
                  key={idx}
                  className={
                    block.isLead
                      ? "text-lg leading-relaxed text-pretty text-lesson-text-primary/95 sm:text-xl font-normal"
                      : "text-[15px] leading-relaxed text-lesson-text-secondary sm:text-base"
                  }
                >
                  {renderFormattedText(block.text)}
                </p>
              );
            })}
          </div>

          {/* Author Callout */}
          {callout && (
            <div>
              <Callout variant={callout.variant}>{renderFormattedText(callout.text)}</Callout>
            </div>
          )}

          {/* Forge Takeaway Surface */}
          {keyTakeaway && (
            <aside
              aria-label="Forge takeaway"
              className="relative overflow-hidden rounded-2xl border border-lesson-border bg-lesson-surface/80 p-5 sm:p-6"
              style={{ boxShadow: "0 8px 30px -18px var(--m-glow)" }}
            >
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-1"
                style={{
                  background:
                    "linear-gradient(90deg, var(--m-accent, #f59e0b) 0%, transparent 100%)",
                }}
              />
              <div className="flex items-start gap-3.5">
                <span
                  aria-hidden
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-lesson-border"
                  style={{
                    backgroundColor: "var(--m-accent-soft, rgba(245, 158, 11, 0.1))",
                    color: "var(--m-accent, #f59e0b)",
                  }}
                >
                  <Sparkles className="h-4.5 w-4.5" />
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <p
                    className="text-[11px] font-mono font-bold uppercase tracking-[0.16em]"
                    style={{ color: "var(--m-accent, #f59e0b)" }}
                  >
                    Forge Takeaway
                  </p>
                  <p className="text-base font-semibold leading-relaxed text-lesson-text-primary sm:text-lg">
                    {renderFormattedText(keyTakeaway)}
                  </p>
                </div>
              </div>
            </aside>
          )}
        </article>
      </MovementScene>

      {/* Navigation action */}
      <ActivityActions
        status={state.status}
        isInteractive={false}
        onContinue={onContinue}
        continueLabel="Continue"
      />
    </ActivityContainer>
  );
}
