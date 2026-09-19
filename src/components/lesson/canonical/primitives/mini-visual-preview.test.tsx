// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { MiniVisualPreview, isVisualHtml } from "./mini-visual-preview";

interface RenderHelperResult {
  container: HTMLDivElement;
  cleanup: () => void;
}

function renderComponent(element: React.ReactElement): RenderHelperResult {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root: Root = createRoot(container);

  act(() => {
    root.render(element);
  });

  return {
    container,
    cleanup() {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}

describe("isVisualHtml", () => {
  it("returns true for common HTML tags without explicit language", () => {
    expect(isVisualHtml("<button>Click Me</button>")).toBe(true);
    expect(isVisualHtml("<h1>Title</h1>")).toBe(true);
    expect(isVisualHtml('<div class="card"><p>Hello</p></div>')).toBe(true);
    expect(isVisualHtml('<input type="text" placeholder="name" />')).toBe(true);
    expect(isVisualHtml('<a href="https://example.com">Link</a>')).toBe(true);
  });

  it("returns true when language is explicitly html, css, or svg", () => {
    expect(isVisualHtml("body { color: red; }", "css")).toBe(true);
    expect(isVisualHtml("Plain text snippet", "html")).toBe(true);
    expect(isVisualHtml("<path d='M0 0' />", "svg")).toBe(true);
  });

  it("returns false for non-visual programming language code", () => {
    expect(isVisualHtml("let count = 5;", "javascript")).toBe(false);
    expect(isVisualHtml("const x = 10; console.log(x);")).toBe(false);
    expect(isVisualHtml("function add(a, b) { return a + b; }")).toBe(false);
    expect(isVisualHtml("import React from 'react';")).toBe(false);
  });

  it("returns false for empty or falsy strings", () => {
    expect(isVisualHtml("")).toBe(false);
    expect(isVisualHtml("   ")).toBe(false);
  });

  it("returns false for comparisons that are not HTML tags", () => {
    expect(isVisualHtml("x < 5 && y > 2")).toBe(false);
  });
});

describe("MiniVisualPreview", () => {
  it("renders an iframe with sandboxing and title", () => {
    const { container, cleanup } = renderComponent(
      <MiniVisualPreview html="<h1>Hello</h1>" title="Custom Preview" />,
    );

    const iframe = container.querySelector("iframe");
    expect(iframe).not.toBeNull();
    expect(iframe?.getAttribute("sandbox")).toBe("");
    expect(iframe?.getAttribute("title")).toBe("Custom Preview");
    expect(iframe?.getAttribute("srcdoc")).toContain("<h1>Hello</h1>");

    cleanup();
  });

  it("injects raw code into body when language is not css", () => {
    const { container, cleanup } = renderComponent(
      <MiniVisualPreview code="<button>Click</button>" language="html" />,
    );

    const iframe = container.querySelector("iframe");
    expect(iframe?.getAttribute("srcdoc")).toContain(
      "<body>\n    <button>Click</button>\n  </body>",
    );

    cleanup();
  });

  it("injects raw code into style tag when language is css", () => {
    const { container, cleanup } = renderComponent(
      <MiniVisualPreview code=".btn { background: red; }" language="css" />,
    );

    const iframe = container.querySelector("iframe");
    expect(iframe?.getAttribute("srcdoc")).toContain(".btn { background: red; }");

    cleanup();
  });
});
