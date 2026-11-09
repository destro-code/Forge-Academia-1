import { loader } from "@monaco-editor/react";
import EditorWorker from "monaco-editor/editor/editor.worker?worker";
import JsonWorker from "monaco-editor/language/json/json.worker?worker";
import CssWorker from "monaco-editor/language/css/css.worker?worker";
import HtmlWorker from "monaco-editor/language/html/html.worker?worker";
import TsWorker from "monaco-editor/language/typescript/ts.worker?worker";

// Register Vite preload error handler to prevent Safari from throwing on dynamic CSS preloads
if (typeof window !== "undefined") {
  window.addEventListener("vite:preloadError", (event) => {
    console.warn("[Forge Monaco/Vite] Handled dynamic preload error event:", event);
    event.preventDefault();
  });
}

let initPromise: Promise<typeof import("monaco-editor")> | null = null;

/**
 * Single authoritative Monaco initialization function for the application.
 * Configures global MonacoEnvironment workers and connects @monaco-editor/react loader.
 */
export function initMonaco(): Promise<typeof import("monaco-editor")> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Monaco can only be initialized on the client."));
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    console.log("[Forge Monaco] initializing Monaco editor setup...");
    const monaco = await import("monaco-editor");

    self.MonacoEnvironment = {
      getWorker(_: unknown, label: string) {
        console.log(`[Forge Monaco] worker requested for label: ${label}`);
        let WorkerClass = EditorWorker;
        if (label === "json") {
          WorkerClass = JsonWorker;
        } else if (label === "css" || label === "scss" || label === "less") {
          WorkerClass = CssWorker;
        } else if (label === "html" || label === "handlebars" || label === "razor") {
          WorkerClass = HtmlWorker;
        } else if (
          label === "typescript" ||
          label === "javascript" ||
          label === "typescriptreact" ||
          label === "javascriptreact" ||
          label === "tsx" ||
          label === "jsx"
        ) {
          WorkerClass = TsWorker;
        }

        try {
          const worker = new WorkerClass();
          console.log(`[Forge Monaco] worker created successfully for label: ${label}`);
          return worker;
        } catch (err) {
          console.error(`[Forge Monaco] Failed to instantiate worker for label '${label}':`, err);
          throw err;
        }
      },
    };

    // Forge editor themes mirror the canonical code-surface tokens in
    // src/forge-visual-system.css. They stay dark/charcoal even when the app
    // uses the warm-paper light theme.
    monaco.editor.defineTheme("forge-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "AAB2BA", fontStyle: "italic" },
        { token: "string", foreground: "83B99A" },
        { token: "keyword", foreground: "FF874A" },
        { token: "number", foreground: "E6BD72" },
        { token: "type", foreground: "72C4CE" },
        { token: "function", foreground: "72C4CE" },
        { token: "variable", foreground: "F1F0EB" },
        { token: "tag", foreground: "FF874A" },
        { token: "attribute.name", foreground: "72C4CE" },
        { token: "regexp", foreground: "F0786E" },
      ],
      colors: {
        "editor.background": "#20252B",
        "editor.foreground": "#F1F0EB",
        "editorLineNumber.foreground": "#69727B",
        "editorLineNumber.activeForeground": "#F1F0EB",
        "editorCursor.foreground": "#FF874A",
        "editor.selectionBackground": "#FF874A33",
        "editor.inactiveSelectionBackground": "#72C4CE22",
        "editor.lineHighlightBackground": "#242A30",
        "editorIndentGuide.background": "#363D44",
        "editorIndentGuide.activeBackground": "#72C4CE",
        "editorWidget.background": "#20252B",
        "editorWidget.border": "#363D44",
        "editorSuggestWidget.background": "#20252B",
        "editorSuggestWidget.foreground": "#F1F0EB",
        "editorSuggestWidget.selectedBackground": "#363D44",
        "editorSuggestWidget.highlightForeground": "#72C4CE",
        "editorGutter.background": "#20252B",
        "editorOverviewRuler.border": "#363D44",
        "editorError.foreground": "#F0786E",
        "editorWarning.foreground": "#E6BD72",
        "minimap.background": "#20252B",
        "scrollbarSlider.background": "#363D4480",
        "scrollbarSlider.hoverBackground": "#72C4CE55",
        focusBorder: "#72C4CE",
      },
    });

    monaco.editor.defineTheme("forge-light", {
      base: "vs",
      inherit: true,
      rules: [
        { token: "comment", foreground: "626A73", fontStyle: "italic" },
        { token: "string", foreground: "386F56" },
        { token: "keyword", foreground: "C45A22" },
        { token: "number", foreground: "94601D" },
        { token: "type", foreground: "277C89" },
        { token: "function", foreground: "277C89" },
        { token: "variable", foreground: "202329" },
        { token: "tag", foreground: "C45A22" },
        { token: "attribute.name", foreground: "277C89" },
        { token: "regexp", foreground: "C94D43" },
      ],
      colors: {
        "editor.background": "#FFFEFB",
        "editor.foreground": "#202329",
        "editorLineNumber.foreground": "#8A929A",
        "editorLineNumber.activeForeground": "#202329",
        "editorCursor.foreground": "#C45A22",
        "editor.selectionBackground": "#F4773533",
        "editor.inactiveSelectionBackground": "#277C8922",
        "editor.lineHighlightBackground": "#F4F2EC",
        "editorIndentGuide.background": "#DEDAD1",
        "editorIndentGuide.activeBackground": "#277C89",
        "editorWidget.background": "#FFFEFB",
        "editorWidget.border": "#DEDAD1",
        "editorSuggestWidget.background": "#FFFEFB",
        "editorSuggestWidget.foreground": "#202329",
        "editorSuggestWidget.selectedBackground": "#ECEAE4",
        "editorSuggestWidget.highlightForeground": "#277C89",
        "editorGutter.background": "#FFFEFB",
        "editorOverviewRuler.border": "#DEDAD1",
        "editorError.foreground": "#C94D43",
        "editorWarning.foreground": "#94601D",
        "minimap.background": "#FFFEFB",
        "scrollbarSlider.background": "#DEDAD180",
        "scrollbarSlider.hoverBackground": "#277C8955",
        focusBorder: "#277C89",
      },
    });

    // Configure @monaco-editor/react to use local monaco-editor instance.
    loader.config({ monaco });

    return monaco;
  })();

  return initPromise;
}
