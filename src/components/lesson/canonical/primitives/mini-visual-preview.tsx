import { useMemo } from "react";
import { cn } from "@/lib/utils";

/**
 * Determines whether a code string represents visual HTML/CSS markup that
 * should be rendered in an iframe preview, rather than pure JavaScript logic.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function isVisualHtml(code: string, language?: string): boolean {
  if (!code || typeof code !== "string") return false;
  const trimmed = code.trim();
  if (!trimmed) return false;

  const normalizedLang = language?.toLowerCase().trim();
  if (normalizedLang) {
    if (["html", "htm", "css", "svg", "xml"].includes(normalizedLang)) {
      return true;
    }
    if (
      ["javascript", "js", "typescript", "ts", "python", "py", "json", "sql"].includes(
        normalizedLang,
      )
    ) {
      return false;
    }
  }

  // Filter out pure JavaScript logic statements
  const isPureJs =
    /^\s*(?:const|let|var|function|import|export|class|console\.|if\s*\(|while\s*\(|for\s*\(|return\s)/m.test(
      trimmed,
    ) &&
    !/<\/?(?:!doctype|html|head|body|div|p|h[1-6]|span|button|section|article|a|input|form|ul|li|svg)/i.test(
      trimmed,
    );

  if (isPureJs) {
    return false;
  }

  // Common HTML / SVG tags check
  const commonHtmlTags =
    /<\/?(?:!doctype|html|head|body|div|p|h[1-6]|span|button|section|article|header|footer|nav|ul|ol|li|img|a|form|input|label|textarea|select|option|table|tr|td|th|svg|path|circle|rect|style|code|pre|strong|em|i|b)[\s>/]/i;

  if (commonHtmlTags.test(trimmed)) {
    return true;
  }

  // General tag pattern: <tag ...> or <tag>...</tag> or self-closing <tag ... />
  const genericTag = /<\/?([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*>/i;
  return genericTag.test(trimmed);
}

export interface MiniVisualPreviewProps {
  html?: string;
  css?: string;
  code?: string;
  language?: string;
  title?: string;
  className?: string;
}

export function MiniVisualPreview({
  html,
  css,
  code,
  language,
  title,
  className,
}: MiniVisualPreviewProps) {
  const formattedDoc = useMemo(() => {
    let finalHtml = html || "";
    let finalCss = css || "";

    if (code) {
      if (language?.toLowerCase() === "css") {
        finalCss = finalCss ? `${finalCss}\n${code}` : code;
      } else {
        finalHtml = code;
      }
    }

    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      *, *::before, *::after { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 12px;
        font-family: system-ui, -apple-system, sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background: transparent;
      }
      button {
        padding: 10px 20px;
        background: #ea580c;
        color: #ffffff;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        font-size: 14px;
        font-family: inherit;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(234, 88, 12, 0.25);
      }
      ${finalCss}
    </style>
  </head>
  <body>
    ${finalHtml}
  </body>
</html>`;
  }, [html, css, code, language]);

  return (
    <iframe
      srcDoc={formattedDoc}
      sandbox="allow-same-origin"
      tabIndex={-1}
      aria-hidden="true"
      title={title || "Visual Preview"}
      className={cn(
        "w-full h-28 sm:h-32 border-0 pointer-events-none select-none rounded-xl bg-card/60",
        className,
      )}
    />
  );
}
