import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

/**
 * Custom CodeMirror theme that references Forge lesson design tokens natively.
 * Responsive fonts, focus shadows, and scroll containing behavior are built in.
 */
export const lessonTheme = EditorView.theme(
  {
    "&": {
      color: "var(--lesson-text-primary, #F1F0EB)",
      backgroundColor: "var(--lesson-surface, #20252B)",
      fontFamily: "var(--font-mono, monospace)",
      fontSize: "14px",
      height: "100%",
      display: "flex",
      flexDirection: "column",
    },
    "& .cm-scroller": {
      overflow: "auto",
      flex: 1,
      minHeight: "0",
      scrollbarWidth: "thin",
      overscrollBehaviorX: "contain",
    },
    ".cm-content": {
      caretColor: "var(--lesson-accent, #FF874A)",
      padding: "16px 0",
      minHeight: "100%",
    },
    "&.cm-focused": {
      outline: "none",
    },
    "&.cm-focused .cm-cursor": {
      borderLeftColor: "var(--lesson-accent, #FF874A)",
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": {
      backgroundColor: "color-mix(in srgb, var(--lesson-accent) 22%, transparent) !important",
    },
    ".cm-gutters": {
      backgroundColor: "var(--lesson-surface-subtle, #171A1F)",
      color: "var(--lesson-text-muted, #AAB2BA)",
      borderRight: "1px solid var(--lesson-border, rgba(255, 255, 255, 0.08))",
      fontFamily: "var(--font-mono, monospace)",
      fontSize: "12px",
      paddingLeft: "10px",
      paddingRight: "10px",
      userSelect: "none",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "color-mix(in srgb, var(--lesson-accent) 8%, transparent)",
      color: "var(--lesson-text-secondary, #C3C8CD)",
      fontWeight: "bold",
    },
    ".cm-activeLine": {
      backgroundColor: "color-mix(in srgb, var(--lesson-accent) 3%, transparent)",
    },
    ".cm-matchingBracket": {
      backgroundColor: "color-mix(in srgb, var(--lesson-accent) 12%, transparent)",
      outline: "none",
      border: "none",
      borderRadius: "2px",
    },
    ".cm-nonmatchingBracket": {
      backgroundColor: "color-mix(in srgb, var(--lesson-error-text) 20%, transparent)",
      outline: "1.5px solid var(--lesson-error-text)",
      borderRadius: "2px",
    },
    ".cm-matchingTag": {
      backgroundColor: "color-mix(in srgb, var(--lesson-accent) 15%, transparent)",
      outline: "none",
      border: "none",
      borderRadius: "2px",
    },
    ".cm-nonmatchingTag": {
      backgroundColor: "color-mix(in srgb, var(--lesson-error-text) 15%, transparent)",
      outline: "none",
      border: "none",
      borderRadius: "2px",
    },
  },
  { dark: true },
);

/**
 * Clean display-ready syntax highlight mapping for Forge's learning environment.
 */
export const lessonHighlightStyle = HighlightStyle.define([
  { tag: t.meta, color: "var(--lesson-text-muted, #AAB2BA)" },
  { tag: t.link, textDecoration: "underline" },
  { tag: t.heading, textDecoration: "underline", fontWeight: "bold" },
  { tag: t.emphasis, fontStyle: "italic" },
  { tag: t.strong, fontWeight: "bold" },
  { tag: t.strikethrough, textDecoration: "line-through" },
  { tag: t.keyword, color: "var(--lesson-accent)", fontWeight: "600" }, // Forge orange
  { tag: [t.atom, t.bool, t.url, t.contentSeparator, t.labelName], color: "var(--lesson-warning-text)" }, // Warm amber
  { tag: [t.literal, t.inserted, t.string, t.deleted], color: "var(--lesson-success-text)" }, // Crisp green
  { tag: [t.regexp, t.escape, t.special(t.string)], color: "var(--lesson-error-text)" },
  { tag: t.definition(t.variableName), color: "var(--lesson-focus-ring)" }, // Technical cyan
  { tag: [t.typeName, t.className, t.number, t.changed], color: "var(--lesson-accent)" }, // Orange accent
  { tag: t.tagName, color: "var(--lesson-accent)" }, // Orange tags
  { tag: t.attributeName, color: "var(--lesson-focus-ring)" }, // Technical cyan attributes
  { tag: [t.variableName, t.propertyName], color: "var(--lesson-text-primary, #F1F0EB)" },
  {
    tag: [t.function(t.variableName), t.function(t.propertyName)],
    color: "var(--lesson-focus-ring)",
    fontWeight: "500",
  },
  { tag: t.comment, color: "var(--lesson-text-muted, #AAB2BA)", fontStyle: "italic" },
  { tag: t.processingInstruction, color: "var(--lesson-text-muted, #AAB2BA)" },
  { tag: t.invalid, color: "var(--lesson-error-text)", textDecoration: "underline" },
]);

export const syntaxHighlightingExtension = syntaxHighlighting(lessonHighlightStyle);
