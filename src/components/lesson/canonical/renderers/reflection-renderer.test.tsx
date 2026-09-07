// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { ReflectionRenderer } from "./reflection-renderer";
import type { ReflectionActivity } from "@/lib/curriculum/types";
import type { ActivityInteractionState } from "../types";

/**
 * Event trigger helper to support React 19 synthetic events in happy-dom for textarea
 */
function setTextareaValue(textarea: HTMLTextAreaElement, value: string) {
  const proto = window.HTMLTextAreaElement.prototype;
  const nativeSetter = Object.getOwnPropertyDescriptor(proto, "value")?.set;

  act(() => {
    const tracker = (textarea as any)._valueTracker;
    if (tracker) {
      tracker.setValue(value === "" ? "a" : "");
    }
    if (nativeSetter) {
      nativeSetter.call(textarea, value);
    } else {
      textarea.value = value;
    }
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    textarea.dispatchEvent(new Event("change", { bubbles: true }));

    const reactKey = Object.keys(textarea).find(
      (k) =>
        k.startsWith("__reactProps$") ||
        k.startsWith("__reactEvents$") ||
        k.startsWith("__reactFiber$"),
    );
    if (reactKey) {
      const props = (textarea as any)[reactKey];
      if (props?.onChange) {
        props.onChange({ target: { value } } as any);
      }
    }
  });
}

describe("ReflectionRenderer — Engineering Synthesis Surface", () => {
  const mockActivity: ReflectionActivity = {
    id: "act-reflect-test",
    type: "reflection",
    intent: "reflection",
    objectiveIds: ["obj-test"],
    content: {
      prompt: "Explain why CSS box-sizing: border-box prevents unexpected layout overflow.",
      guidelines: [
        "Consider how padding and borders are calculated in the standard box model.",
        "Articulate how border-box alters the width calculation.",
      ],
      sampleResponse:
        "With border-box, the specified width includes padding and border, ensuring child elements stay within allocated dimensions.",
      minCharacters: 25,
    },
    feedback: {
      hints: [{ id: "h1", content: "Think about whether padding expands outward or inward." }],
    },
  };

  const createInitialState = (
    overrides?: Partial<ActivityInteractionState<string>>,
  ): ActivityInteractionState<string> => ({
    status: "idle",
    response: "",
    attempts: 0,
    hintsRevealed: 0,
    startedAt: Date.now(),
    ...overrides,
  });

  const renderComponent = (
    activity = mockActivity,
    state = createInitialState(),
    onResponse = vi.fn(),
    onSubmit = vi.fn(),
    onRetry = vi.fn(),
    onContinue = vi.fn(),
    onRevealHint = vi.fn(),
    extraProps: Record<string, any> = {},
  ) => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    let root: Root | null = null;

    act(() => {
      root = createRoot(container);
      root.render(
        <ReflectionRenderer
          activity={activity}
          state={state}
          onResponse={onResponse}
          onSubmit={onSubmit}
          onRetry={onRetry}
          onContinue={onContinue}
          onRevealHint={onRevealHint}
          {...extraProps}
        />,
      );
    });

    return {
      container,
      unmount: () => {
        act(() => {
          root?.unmount();
        });
        container.remove();
      },
    };
  };

  describe("A — Prompt rendering", () => {
    it("renders the primary reflection prompt as dominant header", () => {
      const { container, unmount } = renderComponent();
      const promptEl = container.querySelector(`#prompt-${mockActivity.id}`);
      expect(promptEl).not.toBeNull();
      expect(promptEl?.textContent).toContain(
        "Explain why CSS box-sizing: border-box prevents unexpected layout overflow.",
      );
      unmount();
    });

    it("renders intent-aware eyebrow framing", () => {
      const { container, unmount } = renderComponent();
      expect(container.textContent).toContain("Engineering Synthesis");
      unmount();
    });
  });

  describe("B — Context / Guidelines rendering", () => {
    it("renders existing contextual thinking prompts before the writing surface", () => {
      const { container, unmount } = renderComponent();
      expect(container.textContent).toContain("Thinking Prompts");
      expect(container.textContent).toContain(
        "Consider how padding and borders are calculated in the standard box model.",
      );
      expect(container.textContent).toContain(
        "Articulate how border-box alters the width calculation.",
      );
      unmount();
    });

    it("does not render guidelines section if activity has no guidelines", () => {
      const noGuidelinesAct: ReflectionActivity = {
        ...mockActivity,
        content: {
          ...mockActivity.content,
          guidelines: undefined,
        },
      };
      const { container, unmount } = renderComponent(noGuidelinesAct);
      expect(container.textContent).not.toContain("Thinking Prompts");
      unmount();
    });
  });

  describe("C — Writing surface", () => {
    it("renders textarea with accessible label and aria description", () => {
      const { container, unmount } = renderComponent();
      const textarea = container.querySelector(
        `#reflection-textarea-${mockActivity.id}`,
      ) as HTMLTextAreaElement;
      expect(textarea).not.toBeNull();

      const label = container.querySelector(`label[for="reflection-textarea-${mockActivity.id}"]`);
      expect(label).not.toBeNull();
      expect(label?.textContent).toContain("Your Explanation");

      const help = container.querySelector(`#reflection-help-${mockActivity.id}`);
      expect(help).not.toBeNull();
      unmount();
    });
  });

  describe("D — Response contract", () => {
    it("calls onResponse with typed string text", () => {
      const onResponse = vi.fn();
      const { container, unmount } = renderComponent(
        mockActivity,
        createInitialState(),
        onResponse,
      );

      const textarea = container.querySelector(
        `#reflection-textarea-${mockActivity.id}`,
      ) as HTMLTextAreaElement;
      expect(textarea).not.toBeNull();

      setTextareaValue(textarea, "Padding is included inside the width.");
      expect(onResponse).toHaveBeenCalledWith("Padding is included inside the width.");
      unmount();
    });
  });

  describe("E — Character requirement", () => {
    it("shows character requirement as unmet when below minCharacters threshold", () => {
      const stateBelow = createInitialState({ response: "Too short" }); // 9 chars < 25
      const { container, unmount } = renderComponent(mockActivity, stateBelow);

      expect(container.textContent).toContain("9 / 25 min chars");
      expect(container.textContent).toContain("16 more characters required");
      expect(container.textContent).not.toContain("Ready to commit");
      unmount();
    });

    it("shows readiness indicator when minCharacters threshold is satisfied", () => {
      const stateMet = createInitialState({
        response: "Padding is included in the declared width of the container.", // > 25 chars
      });
      const { container, unmount } = renderComponent(mockActivity, stateMet);

      expect(container.textContent).toContain("Ready to commit");
      expect(container.textContent).toContain("Explanation developed enough to commit.");
      unmount();
    });
  });

  describe("F — Submission & G — Model answer boundary", () => {
    it("does not render sampleResponse before submission boundary", () => {
      const stateMet = createInitialState({
        response: "Padding is included in the declared width of the container.",
      });
      const { container, unmount } = renderComponent(mockActivity, stateMet);

      expect(container.textContent).not.toContain("Reference Perspective");
      expect(container.textContent).not.toContain(mockActivity.content.sampleResponse);
      unmount();
    });

    it("renders both learner explanation and Reference Perspective after submission", () => {
      const submittedState = createInitialState({
        status: "submitted",
        response: "Border-box forces padding to be absorbed into width.",
      });
      const { container, unmount } = renderComponent(mockActivity, submittedState);

      // Learner response is preserved and clearly visible
      expect(container.textContent).toContain("Your Explanation");
      expect(container.textContent).toContain(
        "Border-box forces padding to be absorbed into width.",
      );

      // Reference perspective is revealed
      expect(container.textContent).toContain("Reference Perspective");
      expect(container.textContent).toContain(mockActivity.content.sampleResponse);
      unmount();
    });
  });

  describe("H — Neutral synthesis framing", () => {
    it("does not inject incorrect or grading judgment labels merely because a reflection is submitted", () => {
      const submittedState = createInitialState({
        status: "submitted",
        response: "A valid explanation that meets all requirements.",
      });
      const { container, unmount } = renderComponent(mockActivity, submittedState);

      expect(container.textContent).not.toContain("Incorrect");
      expect(container.textContent).not.toContain("Wrong");
      unmount();
    });
  });

  describe("I — Hints support", () => {
    it("renders hint button and reveals hints through ActivityHeader", () => {
      const onRevealHint = vi.fn();
      const stateWithHint = createInitialState({ hintsRevealed: 0 });
      const { container, unmount } = renderComponent(
        mockActivity,
        stateWithHint,
        vi.fn(),
        vi.fn(),
        vi.fn(),
        vi.fn(),
        onRevealHint,
      );

      const hintBtn = Array.from(container.querySelectorAll("button")).find((btn) =>
        btn.textContent?.toLowerCase().includes("hint"),
      );
      expect(hintBtn).toBeDefined();

      act(() => {
        hintBtn?.click();
      });
      expect(onRevealHint).toHaveBeenCalled();
      unmount();
    });
  });

  describe("J — Experience composition support", () => {
    it("respects experienceComposition badge and prompt if provided", () => {
      const { container, unmount } = renderComponent(
        mockActivity,
        createInitialState(),
        vi.fn(),
        vi.fn(),
        vi.fn(),
        vi.fn(),
        vi.fn(),
        {
          experienceComposition: {
            badgeText: "Core Synthesis",
            prompt: "Reflect on how this applies in production systems",
          },
        },
      );

      expect(container.textContent).toContain("Core Synthesis");
      expect(container.textContent).toContain("Reflect on how this applies in production systems");
      unmount();
    });
  });

  describe("K — Accessibility & Keyboard Interactions", () => {
    it("has accessible label association and keyboard-friendly textarea", () => {
      const { container, unmount } = renderComponent();
      const textarea = container.querySelector("textarea");
      expect(textarea).not.toBeNull();
      expect(textarea?.id).toBe(`reflection-textarea-${mockActivity.id}`);

      const label = container.querySelector(`label[for="reflection-textarea-${mockActivity.id}"]`);
      expect(label).not.toBeNull();
      unmount();
    });
  });
});
