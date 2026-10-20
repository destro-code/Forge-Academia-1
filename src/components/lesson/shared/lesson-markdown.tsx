import { Fragment, useState, type ReactNode } from "react";
import { Check, Copy, Eye, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MiniVisualPreview,
  isVisualHtml,
} from "@/components/lesson/canonical/primitives/mini-visual-preview";

export interface LessonMarkdownProps {
  children: string | undefined | null;
  /**
   * When true, renders only inline tokens (**bold**, *italic*, `code`, line breaks)
   * inside a `<span>` so it can be safely placed inside `<button>`, `<label>`, `<p>`, or `<h1-h4>`.
   */
  inline?: boolean;
  className?: string;
}

/**
 * Splits markdown text on blank lines (`\n\n+`) while keeping multi-line
 * fenced code blocks (``` ... ```) and contiguous markdown tables intact.
 */
export function splitMarkdownBlocks(markdown: string): string[] {
  const normalized = markdown.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const lines = normalized.split("\n");
  const blocks: string[] = [];
  let current: string[] = [];
  let inFence = false;

  const flush = () => {
    const joined = current.join("\n").trim();
    if (joined) blocks.push(joined);
    current = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      if (!inFence) {
        if (current.length > 0) flush();
        inFence = true;
        current.push(line);
      } else {
        current.push(line);
        inFence = false;
        flush();
      }
      continue;
    }

    if (inFence) {
      current.push(line);
      continue;
    }

    if (trimmed === "") {
      flush();
    } else {
      current.push(line);
    }
  }

  flush();
  return blocks;
}

/**
 * Parses inline markdown tokens:
 * - `code`
 * - **bold**
 * - *italic*
 * - [label](url)
 */
export function renderInlineMarkdown(text: string, keyPrefix = "inl"): ReactNode[] {
  if (!text) return [];

  const tokenRegex =
    /(`[^`\n]+`|\*\*[^*\n]+\*\*|__[^_\n]+__|(?<!\*)\*[^*\n]+\*(?!\*)|\[[^\]]+\]\([^)]+\))/g;

  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let tokenIdx = 0;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    const key = `${keyPrefix}-${tokenIdx++}`;

    if (token.startsWith("`") && token.endsWith("`")) {
      const codeContent = token.slice(1, -1);
      parts.push(
        <code
          key={key}
          className="rounded-md border border-lesson-border/70 bg-lesson-surface-elevated/90 px-1.5 py-0.5 font-mono text-[0.875em] font-medium text-lesson-text-primary"
        >
          {codeContent}
        </code>,
      );
    } else if (
      (token.startsWith("**") && token.endsWith("**")) ||
      (token.startsWith("__") && token.endsWith("__"))
    ) {
      const inner = token.slice(2, -2);
      parts.push(
        <strong key={key} className="font-semibold text-lesson-text-primary">
          {renderInlineMarkdown(inner, `${key}-b`)}
        </strong>,
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      const inner = token.slice(1, -1);
      parts.push(
        <em key={key} className="italic text-lesson-text-primary/95">
          {renderInlineMarkdown(inner, `${key}-i`)}
        </em>,
      );
    } else if (token.startsWith("[")) {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        parts.push(
          <a
            key={key}
            href={linkMatch[2]}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
          >
            {renderInlineMarkdown(linkMatch[1], `${key}-l`)}
          </a>,
        );
      } else {
        parts.push(token);
      }
    } else {
      parts.push(token);
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

function CodeBlockView({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const normalizedLang = (language || "text").toLowerCase();
  const canPreviewHtml = normalizedLang === "html" && isVisualHtml(code, normalizedLang);
  const [showPreview, setShowPreview] = useState(canPreviewHtml);
  const isDiagram =
    normalizedLang === "text" ||
    normalizedLang === "ascii" ||
    normalizedLang === "diagram" ||
    normalizedLang === "plaintext" ||
    /[→←↑↓┌┐└┘├┤┬┴┼─│▼▲]/.test(code);

  const badgeLabel = isDiagram
    ? normalizedLang === "http"
      ? "HTTP"
      : "DIAGRAM / MODEL"
    : normalizedLang.toUpperCase();

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div className="my-2 overflow-hidden rounded-xl border border-lesson-border bg-zinc-950/95 text-zinc-100 shadow-xs">
      <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/70 px-3.5 py-2 text-[11px] font-mono text-zinc-400">
        <span className="flex items-center gap-1.5 font-semibold tracking-wider uppercase">
          <Terminal className="h-3.5 w-3.5 text-primary/80" />
          <span>{badgeLabel}</span>
        </span>
        <div className="flex items-center gap-2">
          {canPreviewHtml && (
            <button
              type="button"
              onClick={() => setShowPreview((p) => !p)}
              className={cn(
                "inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] transition-colors",
                showPreview
                  ? "bg-primary/20 text-primary"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100",
              )}
            >
              <Eye className="h-3 w-3" />
              <span>{showPreview ? "Hide Preview" : "Live Preview"}</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
            aria-label="Copy code snippet"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-zinc-100">
        <code>{code}</code>
      </pre>
      {canPreviewHtml && showPreview && (
        <div className="border-t border-zinc-800/80 bg-zinc-900/50 p-3">
          <div className="mb-1.5 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-400">
            <span>Rendered DOM Specimen</span>
            <span>Live Browser Output</span>
          </div>
          <MiniVisualPreview code={code} language={normalizedLang} className="h-28 rounded-lg" />
        </div>
      )}
    </div>
  );
}

function isTableBlock(lines: string[]): boolean {
  if (lines.length < 2) return false;
  const first = lines[0].trim();
  const second = lines[1].trim();
  return (
    first.includes("|") &&
    /^\|?[\s:-]+\|[\s|:-]*$/.test(second) &&
    second.includes("-")
  );
}

function renderTableBlock(lines: string[], key: string): ReactNode {
  const parseRow = (line: string) =>
    line
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cell.trim());

  const headers = parseRow(lines[0]);
  const rows = lines.slice(2).filter((l) => l.trim().includes("|")).map(parseRow);

  return (
    <div key={key} className="my-2 overflow-x-auto rounded-xl border border-lesson-border">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-lesson-border bg-lesson-surface-elevated/60">
            {headers.map((header, i) => (
              <th
                key={i}
                className="px-4 py-2.5 font-semibold text-lesson-text-primary"
              >
                {renderInlineMarkdown(header, `${key}-th-${i}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-lesson-border/60 bg-lesson-surface/40">
          {rows.map((row, rIdx) => (
            <tr key={rIdx} className="transition-colors hover:bg-lesson-surface-elevated/30">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-4 py-2.5 text-lesson-text-secondary">
                  {renderInlineMarkdown(cell, `${key}-td-${rIdx}-${cIdx}`)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Unified Markdown & technical typography renderer for all Forge lesson surfaces.
 * Eliminates raw `**bold**`, `` `code` ``, and split code fence artifacts while
 * maintaining clean semantic HTML structure.
 */
export function LessonMarkdown({ children, inline = false, className }: LessonMarkdownProps) {
  if (!children) return null;

  if (inline) {
    const lines = children.replace(/\r\n/g, "\n").split("\n");
    return (
      <span className={className}>
        {lines.map((line, idx) => (
          <Fragment key={idx}>
            {idx > 0 && <br />}
            {renderInlineMarkdown(line, `inl-${idx}`)}
          </Fragment>
        ))}
      </span>
    );
  }

  const blocks = splitMarkdownBlocks(children);

  return (
    <div className={cn("space-y-4", className)}>
      {blocks.map((block, bIdx) => {
        const key = `md-block-${bIdx}`;

        // 1. Fenced code block
        if (block.startsWith("```")) {
          const lines = block.split("\n");
          const firstLine = lines[0].trim();
          const language = firstLine.slice(3).trim() || "text";
          const lastLine = lines[lines.length - 1]?.trim();
          const codeLines =
            lastLine === "```" ? lines.slice(1, -1) : lines.slice(1);
          return <CodeBlockView key={key} language={language} code={codeLines.join("\n")} />;
        }

        const lines = block.split("\n");

        // 2. Markdown table
        if (isTableBlock(lines)) {
          return renderTableBlock(lines, key);
        }

        // 3. Heading (### or ####)
        if (lines.length === 1 && /^#{1,4}\s+/.test(lines[0].trim())) {
          const headingText = lines[0].trim().replace(/^#{1,4}\s+/, "");
          return (
            <h3
              key={key}
              className="pt-2 text-lg font-bold tracking-tight text-lesson-text-primary"
            >
              {renderInlineMarkdown(headingText, `${key}-h`)}
            </h3>
          );
        }

        // 4. Blockquote
        if (lines.every((l) => l.trim().startsWith(">"))) {
          const quoteLines = lines.map((l) => l.trim().replace(/^>\s?/, ""));
          return (
            <blockquote
              key={key}
              className="rounded-r-xl border-l-3 border-primary/60 bg-lesson-surface/60 py-2.5 pr-4 pl-4 text-[15px] italic leading-relaxed text-lesson-text-secondary"
            >
              {quoteLines.map((ql, qIdx) => (
                <p key={qIdx}>{renderInlineMarkdown(ql, `${key}-q-${qIdx}`)}</p>
              ))}
            </blockquote>
          );
        }

        // 5. Unordered bullet list (-, *, •)
        const nonEmptyLines = lines.map((l) => l.trim()).filter(Boolean);
        const isBulletList =
          nonEmptyLines.length > 0 &&
          nonEmptyLines.every((l) => /^([-*•])\s+/.test(l));
        if (isBulletList) {
          return (
            <ul key={key} className="space-y-2 pl-1">
              {nonEmptyLines.map((item, iIdx) => (
                <li
                  key={iIdx}
                  className="flex items-start gap-3 text-[15px] leading-relaxed text-lesson-text-secondary sm:text-base"
                >
                  <span
                    aria-hidden
                    className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/80"
                  />
                  <span className="min-w-0 flex-1">
                    {renderInlineMarkdown(item.replace(/^([-*•])\s+/, ""), `${key}-ul-${iIdx}`)}
                  </span>
                </li>
              ))}
            </ul>
          );
        }

        // 6. Ordered list (1. , 2. , etc.)
        const isOrderedList =
          nonEmptyLines.length > 1 &&
          nonEmptyLines.every((l) => /^\d+\.\s+/.test(l));
        if (isOrderedList) {
          return (
            <ol key={key} className="space-y-2 pl-1">
              {nonEmptyLines.map((item, iIdx) => {
                const match = item.match(/^(\d+)\.\s+(.*)$/);
                const num = match ? match[1] : String(iIdx + 1);
                const content = match ? match[2] : item;
                return (
                  <li
                    key={iIdx}
                    className="flex items-start gap-3 text-[15px] leading-relaxed text-lesson-text-secondary sm:text-base"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/10 font-mono text-xs font-semibold text-primary">
                      {num}
                    </span>
                    <span className="min-w-0 flex-1">
                      {renderInlineMarkdown(content, `${key}-ol-${iIdx}`)}
                    </span>
                  </li>
                );
              })}
            </ol>
          );
        }

        // 7. Mixed paragraph (may have a lead sentence followed by bullet items in the same block)
        const firstBulletIdx = nonEmptyLines.findIndex((l) => /^([-*•])\s+/.test(l));
        if (
          firstBulletIdx > 0 &&
          nonEmptyLines.slice(firstBulletIdx).every((l) => /^([-*•])\s+/.test(l))
        ) {
          const leadLines = nonEmptyLines.slice(0, firstBulletIdx);
          const bulletLines = nonEmptyLines.slice(firstBulletIdx);
          return (
            <div key={key} className="space-y-2.5">
              <p className="text-base leading-relaxed text-lesson-text-secondary sm:text-[17px]">
                {leadLines.map((line, lIdx) => (
                  <Fragment key={lIdx}>
                    {lIdx > 0 && <br />}
                    {renderInlineMarkdown(line, `${key}-lead-${lIdx}`)}
                  </Fragment>
                ))}
              </p>
              <ul className="space-y-2 pl-1">
                {bulletLines.map((item, iIdx) => (
                  <li
                    key={iIdx}
                    className="flex items-start gap-3 text-[15px] leading-relaxed text-lesson-text-secondary sm:text-base"
                  >
                    <span
                      aria-hidden
                      className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/80"
                    />
                    <span className="min-w-0 flex-1">
                      {renderInlineMarkdown(item.replace(/^([-*•])\s+/, ""), `${key}-m-ul-${iIdx}`)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        }

        // 8. Standard prose paragraph
        return (
          <p
            key={key}
            className="text-base leading-8 text-lesson-text-secondary sm:text-[17px]"
          >
            {lines.map((line, lIdx) => (
              <Fragment key={lIdx}>
                {lIdx > 0 && <br />}
                {renderInlineMarkdown(line, `${key}-p-${lIdx}`)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
