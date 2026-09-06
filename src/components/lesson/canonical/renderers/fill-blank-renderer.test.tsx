// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { FillBlankRenderer } from "./fill-blank-renderer";
import type { FillBlankActivity } from "@/lib/curriculum/types";
import type { ActivityInteractionState } from "../types";

/**
 * Event trigger helper to support React 19 synthetic events in happy-dom
 */
function setInputValue(input: HTMLInputElement, value: string) {
  const proto = window.HTMLInputElement.prototype;
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

describe("FillBlankRenderer Experience Redesign", () => {
  const mockActivity: FillBlankActivity = {
    id: "act-fb-test",
    type: "fill-blank",
    intent: "application",
    objectiveIds: ["obj-test"],
    content: {
      prompt: "Reconstruct the flex container alignment rule to center children on the main axis.",
      template: "display: flex; justify-content: ___;",
      blanks: [
        {
          id: "b1",
          placeholder: "alignment value",
          hint: "Think about the keyword that positions items at the center.",
        },
      ],
      explanation: "justify-content: center aligns flex items along the main axis.",
    },
    validation: {
      type: "exact-match",
      expected: "center",
    },
  };

  const createInitialState = (
    overrides?: Partial<ActivityInteractionState<string[]>>,
  ): ActivityInteractionState<string[]> => ({
    status: "idle",
    response: [],
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
  ) => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    let root: Root | null = null;

    act(() => {
      root = createRoot(container);
      root.render(
        <FillBlankRenderer
          activity={activity}
          state={state}
          onResponse={onResponse}
          onSubmit={onSubmit}
          onRetry={onRetry}
          onContinue={onContinue}
        />,
      );
    });

    return {
      container,
      cleanup: () => {
        act(() => {
          root?.unmount();
        });
        container.remove();
      },
    };
  };

  it("renders the prompt as the dominant element and establishes mechanism reconstruction hierarchy", () => {
    const { container, cleanup } = renderComponent();

    expect(container.textContent).toContain("Mechanism Reconstruction");
    expect(container.textContent).toContain(
      "Reconstruct the flex container alignment rule to center children on the main axis.",
    );
    expect(container.textContent).toContain("display: flex; justify-content:");

    const input = container.querySelector<HTMLInputElement>("input[type='text']");
    expect(input).not.toBeNull();
    expect(input?.placeholder).toBe("alignment value");
    expect(input?.getAttribute("aria-label")).toContain("Answer for missing mechanism");

    cleanup();
  });

  it("renders named blank templates like 'Value: {b1}' seamlessly inline", () => {
    const namedActivity: FillBlankActivity = {
      ...mockActivity,
      content: {
        ...mockActivity.content,
        template: "Current state is: {b1}.",
        blanks: [{ id: "b1", placeholder: "state name" }],
      },
    };

    const { container, cleanup } = renderComponent(namedActivity);

    expect(container.textContent).toContain("Current state is:");
    const input = container.querySelector<HTMLInputElement>("input[type='text']");
    expect(input).not.toBeNull();
    expect(input?.placeholder).toBe("state name");

    cleanup();
  });

  it("falls back gracefully to structured reference and slot cards when template cannot be parsed inline", () => {
    const nonInlineActivity: FillBlankActivity = {
      ...mockActivity,
      content: {
        ...mockActivity.content,
        template: "Arbitrary reference code without blank markers.",
        blanks: [{ id: "b1", placeholder: "target token" }],
      },
    };

    const { container, cleanup } = renderComponent(nonInlineActivity);

    expect(container.textContent).toContain("Reference Mechanism");
    expect(container.textContent).toContain("Arbitrary reference code without blank markers.");
    expect(container.textContent).toContain("Blank (target token)");

    const input = container.querySelector<HTMLInputElement>(
      `#blank-input-${nonInlineActivity.id}-0`,
    );
    expect(input).not.toBeNull();

    cleanup();
  });

  it("updates response via onResponse as string[] when learner enters text", () => {
    const onResponse = vi.fn();
    const { container, cleanup } = renderComponent(mockActivity, createInitialState(), onResponse);

    const input = container.querySelector<HTMLInputElement>("input[type='text']")!;
    setInputValue(input, "center");

    expect(onResponse).toHaveBeenCalledWith(["center"]);

    cleanup();
  });

  it("shows commitment strip when all blanks are filled and hides it when empty", () => {
    const emptyState = createInitialState({ response: [""] });
    const { container: c1, cleanup: cl1 } = renderComponent(mockActivity, emptyState);

    expect(c1.textContent).not.toContain("Reconstructed Mechanism:");
    cl1();

    const filledState = createInitialState({ response: ["center"] });
    const { container: c2, cleanup: cl2 } = renderComponent(mockActivity, filledState);

    expect(c2.textContent).toContain("Reconstructed Mechanism:");
    expect(c2.textContent).toContain("[center]");
    expect(c2.textContent).toContain("Ready to check");

    cl2();
  });

  it("supports submitting via Enter key when all blanks are filled", () => {
    const onSubmit = vi.fn();
    const filledState = createInitialState({ response: ["center"] });
    const { container, cleanup } = renderComponent(mockActivity, filledState, vi.fn(), onSubmit);

    const input = container.querySelector<HTMLInputElement>("input[type='text']")!;

    act(() => {
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);

    cleanup();
  });

  it("does not trigger onSubmit on Enter when blanks are empty", () => {
    const onSubmit = vi.fn();
    const emptyState = createInitialState({ response: [""] });
    const { container, cleanup } = renderComponent(mockActivity, emptyState, vi.fn(), onSubmit);

    const input = container.querySelector<HTMLInputElement>("input[type='text']")!;

    act(() => {
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    });

    expect(onSubmit).not.toHaveBeenCalled();

    cleanup();
  });

  it("renders verified status and locks inputs when state is correct", () => {
    const correctState = createInitialState({
      status: "correct",
      response: ["center"],
      validationResult: { isValid: true, feedbackMessage: "Mechanism perfectly aligned!" },
    });

    const { container, cleanup } = renderComponent(mockActivity, correctState);

    expect(container.textContent).toContain("Mechanism Verified");
    expect(container.textContent).toContain("Mechanism perfectly aligned!");

    const input = container.querySelector<HTMLInputElement>("input[type='text']")!;
    expect(input.disabled).toBe(true);

    cleanup();
  });

  it("renders diagnostic clues and feedback when state is incorrect", () => {
    const incorrectState = createInitialState({
      status: "incorrect",
      response: ["flex-start"],
      validationResult: { isValid: false, feedbackMessage: "Incorrect alignment property value." },
    });

    const { container, cleanup } = renderComponent(mockActivity, incorrectState);

    expect(container.textContent).toContain("Mechanism Incomplete or Incorrect");
    expect(container.textContent).toContain("Diagnostic Clues");
    expect(container.textContent).toContain(
      "Think about the keyword that positions items at the center.",
    );

    const input = container.querySelector<HTMLInputElement>("input[type='text']")!;
    expect(input.disabled).toBe(false);

    cleanup();
  });

  it("satisfies accessibility standards with semantic inputs, labels, and touch targets", () => {
    const { container, cleanup } = renderComponent();

    const input = container.querySelector<HTMLInputElement>("input[type='text']")!;
    expect(input.tagName.toLowerCase()).toBe("input");
    expect(input.getAttribute("aria-label")).toBeTruthy();
    expect(input.classList.contains("h-11")).toBe(true); // 44px min height

    cleanup();
  });
});
