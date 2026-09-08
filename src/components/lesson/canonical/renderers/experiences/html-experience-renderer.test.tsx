// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderActivity } from "../../registry";
import { HtmlExperienceRenderer } from "./html-experience-renderer";
import type { InteractiveCodeActivity } from "@/lib/curriculum/types";
import type { ActivityInteractionState } from "../../types";

function setInputValue(input: HTMLTextAreaElement, value: string) {
  const proto = window.HTMLTextAreaElement.prototype;
  const nativeSetter = Object.getOwnPropertyDescriptor(proto, "value")?.set;

  act(() => {
    const tracker = (input as any)._valueTracker;
    if (tracker) {
      tracker.setValue(value === "" ? "a" : "");
    }
    if (nativeSetter) {
      nativeSetter.call(input, value);
    } else {
      input.value = value;
    }
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));

    const reactKey = Object.keys(input).find(
      (k) =>
        k.startsWith("__reactProps$") ||
        k.startsWith("__reactEvents$") ||
        k.startsWith("__reactFiber$"),
    );
    if (reactKey) {
      const props = (input as any)[reactKey];
      if (props?.onChange) {
        props.onChange({ target: { value } } as any);
      }
    }
  });
}

describe("Phase D1 — HTML Experience Recovery", () => {
  const mockHtmlActivity: InteractiveCodeActivity = {
    id: "act-html-continuous-test",
    type: "interactive-code",
    intent: "application",
    objectiveIds: ["obj-html-test"],
    content: {
      language: "html",
      title: "Semantic Heading Laboratory",
      prompt: "Construct an article with an h1 heading and a paragraph.",
      instructions: "Construct an article with an h1 heading and a paragraph.",
      starterCode: "<article>\n  <h1>Main Title</h1>\n</article>",
      solutionCode: "<article>\n  <h1>Main Title</h1>\n  <p>First paragraph.</p>\n</article>",
      testCases: [
        {
          id: "tc-h1",
          description: "Contains an h1 heading element",
          assertion: 'Boolean(doc.querySelector("h1"))',
        },
        {
          id: "tc-p",
          description: "Contains a paragraph element inside the article",
          assertion: 'Boolean(doc.querySelector("article p"))',
        },
      ],
    },
    feedback: {
      correct: "Semantic article structure verified with heading and paragraph.",
      incorrect: "Add a paragraph tag inside the article.",
    },
  };

  const mockState: ActivityInteractionState<string> = {
    status: "idle",
    response: mockHtmlActivity.content.starterCode,
    hintsRevealed: 0,
    attempts: 0,
    startedAt: Date.now(),
  };

  function renderComponent(props: Partial<React.ComponentProps<typeof HtmlExperienceRenderer>> = {}) {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root: Root = createRoot(container);

    const fullProps = {
      activity: mockHtmlActivity,
      state: mockState,
      onResponse: vi.fn(),
      onSubmit: vi.fn(),
      onRetry: vi.fn(),
      onContinue: vi.fn(),
      onRevealHint: vi.fn(),
      ...props,
    };

    act(() => {
      root.render(<HtmlExperienceRenderer {...fullProps} />);
    });

    return {
      container,
      root,
      props: fullProps,
      unmount() {
        act(() => {
          root.unmount();
        });
        container.remove();
      },
    };
  }

  it("1. HTML activity resolves to HtmlExperienceRenderer via canonical registry dispatch", () => {
    const element = renderActivity(mockHtmlActivity, {
      state: mockState,
      onResponse: () => {},
      onSubmit: () => {},
      onRetry: () => {},
      onContinue: () => {},
      onRevealHint: () => {},
    });

    expect(element.type).toBe(HtmlExperienceRenderer);
    expect(element.props.experience?.kind).toBe("markup");
  });

  it("2. renders both the HTML editor and rendered-document preview simultaneously", () => {
    const { container, unmount } = renderComponent();

    // Editor is present and accessible
    const editor = container.querySelector('[aria-label="HTML document editor"]');
    expect(editor).not.toBeNull();
    expect(container.textContent).toContain("HTML Source");

    // Rendered document preview is present and accessible
    const preview = container.querySelector('iframe[aria-label="Rendered document preview"]');
    expect(preview).not.toBeNull();
    expect(container.textContent).toContain("Rendered Document");

    unmount();
  });

  it("3. presents a continuous workspace on mobile without mobile tab switcher hiding surfaces", () => {
    const { container, unmount } = renderComponent();

    // The legacy mobile tab buttons must no longer exist
    const buttons = Array.from(container.querySelectorAll("button"));
    const previewTabBtn = buttons.find((btn) => btn.textContent?.includes("Document Preview"));
    const codeTabBtn = buttons.find((btn) => btn.textContent?.includes("HTML Code"));

    expect(previewTabBtn).toBeUndefined();
    expect(codeTabBtn).toBeUndefined();

    // Neither the editor container nor preview container should have 'hidden lg:block' class
    const hiddenElements = container.querySelectorAll(".hidden.lg\\:block");
    expect(hiddenElements.length).toBe(0);

    // Both surfaces are directly in DOM flow
    const editorSection = container.querySelector('[aria-label="HTML document editor"]');
    const previewIframe = container.querySelector('iframe[aria-label="Rendered document preview"]');
    expect(editorSection).not.toBeNull();
    expect(previewIframe).not.toBeNull();

    unmount();
  });

  it("4. editing HTML feeds the canonical response path", () => {
    const onResponseSpy = vi.fn();
    const { container, unmount } = renderComponent({ onResponse: onResponseSpy });

    const textarea = container.querySelector("textarea");
    expect(textarea).not.toBeNull();

    const updatedCode = "<article><h1>Updated</h1><p>Text</p></article>";
    if (textarea) {
      setInputValue(textarea, updatedCode);
      expect(onResponseSpy).toHaveBeenCalledWith(updatedCode);
    }

    unmount();
  });

  it("5. preserves action controls: Run, Check, Reset, and ActivityActions submit", () => {
    const onSubmitSpy = vi.fn();
    const { container, unmount } = renderComponent({ onSubmit: onSubmitSpy });

    const buttons = Array.from(container.querySelectorAll("button"));

    // Check Run button exists
    const runBtn = buttons.find((b) => b.textContent?.trim() === "Run");
    expect(runBtn).toBeDefined();

    // Check Check button exists
    const checkBtn = buttons.find((b) => b.textContent?.trim() === "Check");
    expect(checkBtn).toBeDefined();

    // Check Reset button exists
    const resetBtn = buttons.find((b) => b.textContent?.trim() === "Reset");
    expect(resetBtn).toBeDefined();

    // Submit button from ActivityActions exists
    const submitBtn = buttons.find(
      (b) => b.textContent?.trim().toLowerCase() === "check" || b.textContent?.trim().toLowerCase() === "submit",
    );
    expect(submitBtn).toBeDefined();

    unmount();
  });

  it("6. shows document requirements and task instructions clearly", () => {
    const { container, unmount } = renderComponent();

    expect(container.textContent).toContain("Semantic Heading Laboratory");
    expect(container.textContent).toContain("Construct an article with an h1 heading and a paragraph.");
    expect(container.textContent).toContain("Document Requirements");
    expect(container.textContent).toContain("Contains an h1 heading element");
    expect(container.textContent).toContain("Contains a paragraph element inside the article");

    unmount();
  });
});
