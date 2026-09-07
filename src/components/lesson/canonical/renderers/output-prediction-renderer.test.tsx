// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { OutputPredictionRenderer } from "./output-prediction-renderer";
import type { OutputPredictionActivity } from "@/lib/curriculum/types";
import type { ActivityInteractionState } from "../types";

describe("OutputPredictionRenderer Experience Redesign", () => {
  const mockOptionActivity: OutputPredictionActivity = {
    id: "act-test-prediction-options",
    type: "output-prediction",
    intent: "prediction",
    objectiveIds: ["obj-test-pred"],
    content: {
      prompt: "What will be printed to the console when this script runs?",
      code: "const a = [1, 2, 3];\nconst b = a;\nb.push(4);\nconsole.log(a.length);",
      language: "javascript",
      options: ["3", "4", "undefined", "TypeError"],
      explanation:
        "Arrays are reference types in JavaScript. Mutating b also mutates the underlying array referenced by a.",
    },
    validation: {
      type: "code-output",
      expectedOutput: "4",
    },
    feedback: {
      correct: "Execution trace verified! Arrays are passed by reference.",
      incorrect: "Prediction disproven. Trace the array reference mutation.",
    },
  };

  const mockExactActivity: OutputPredictionActivity = {
    id: "act-test-prediction-exact",
    type: "output-prediction",
    intent: "application",
    objectiveIds: ["obj-test-pred-exact"],
    content: {
      prompt: "Trace the function execution and enter the exact output string:",
      code: "function compute(n) {\n  return n > 0 ? n * 2 : 0;\n}\nconsole.log(compute(5));",
      language: "javascript",
      explanation: "compute(5) evaluates the ternary true branch: 5 * 2 = 10.",
    },
    validation: {
      type: "code-output",
      expectedOutput: "10",
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
    activity: OutputPredictionActivity = mockOptionActivity,
    state: ActivityInteractionState<string> = createInitialState(),
    onResponse = vi.fn(),
    onSubmit = vi.fn(),
    onRetry = vi.fn(),
    onContinue = vi.fn(),
    readOnly = false,
  ) => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    let root: Root | null = null;

    act(() => {
      root = createRoot(container);
      root.render(
        <OutputPredictionRenderer
          activity={activity}
          state={state}
          onResponse={onResponse}
          onSubmit={onSubmit}
          onRetry={onRetry}
          onContinue={onContinue}
          readOnly={readOnly}
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

  // Helper to simulate input change in React 19 test environment
  function setInputValue(input: HTMLInputElement | HTMLTextAreaElement, value: string) {
    const proto =
      input instanceof HTMLInputElement
        ? window.HTMLInputElement.prototype
        : window.HTMLTextAreaElement.prototype;
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
        (k) => k.startsWith("__reactProps$") || k.startsWith("__reactEvents$"),
      );
      if (reactKey) {
        const props = (input as any)[reactKey];
        if (props?.onChange) {
          props.onChange({ target: { value } } as any);
        }
      }
    });
  }

  // A — Prompt hierarchy & execution framing
  it("A — renders prompt hierarchy and intent-aware execution framing", () => {
    const { container, cleanup } = renderComponent(mockOptionActivity);

    expect(container.textContent).toContain(
      "What will be printed to the console when this script runs?",
    );
    expect(container.textContent).toContain("Runtime Prediction");
    expect(container.textContent).toContain(
      "Trace the execution path and predict the observable output",
    );

    cleanup();
  });

  // B — Code evidence rendering
  it("B — renders code snippet as the primary evidence under investigation", () => {
    const { container, cleanup } = renderComponent(mockOptionActivity);

    expect(container.textContent).toContain("Code to Trace");
    expect(container.textContent).toContain("javascript");
    expect(container.textContent).toContain("console.log(a.length)");

    cleanup();
  });

  // C — Structured prediction mode
  it("C — handles structured prediction options with single selection and onResponse emission", () => {
    const onResponseSpy = vi.fn();
    const { container, cleanup } = renderComponent(
      mockOptionActivity,
      createInitialState(),
      onResponseSpy,
    );

    const radioButtons = container.querySelectorAll<HTMLButtonElement>(
      '[role="radiogroup"] button[role="radio"]',
    );
    expect(radioButtons.length).toBe(4);

    expect(radioButtons[0].textContent).toContain("3");
    expect(radioButtons[1].textContent).toContain("4");
    expect(radioButtons[2].textContent).toContain("undefined");
    expect(radioButtons[3].textContent).toContain("TypeError");

    // Click option B ("4")
    act(() => {
      radioButtons[1].click();
    });

    expect(onResponseSpy).toHaveBeenCalledWith("4");

    cleanup();
  });

  // D — Exact prediction mode
  it("D — handles exact output prediction input and emits string response", () => {
    const onResponseSpy = vi.fn();
    const { container, cleanup } = renderComponent(
      mockExactActivity,
      createInitialState({ response: "" }),
      onResponseSpy,
    );

    const input = container.querySelector<HTMLInputElement>(
      'input[placeholder="Enter predicted output..."]',
    );
    expect(input).not.toBeNull();

    setInputValue(input!, "10");
    expect(onResponseSpy).toHaveBeenCalledWith("10");

    cleanup();
  });

  // E — Selection commitment state
  it("E — presents a neutral commitment state when a prediction is formed before evaluation", () => {
    const { container, cleanup } = renderComponent(
      mockOptionActivity,
      createInitialState({ response: "4" }),
    );

    expect(container.textContent).toContain("Committed Prediction:");
    expect(container.textContent).toContain("4");
    expect(container.textContent).toContain("Ready to evaluate");

    // Must NOT declare correct or verified before submission
    expect(container.textContent).not.toContain("Prediction Verified");
    expect(container.textContent).not.toContain("Prediction Disproven");

    cleanup();
  });

  // F — No local correctness checking
  it("F — does not determine correctness before canonical submission", () => {
    // Even if response is wrong ("3"), it shows only neutral commitment
    const { container, cleanup } = renderComponent(
      mockOptionActivity,
      createInitialState({ response: "3", status: "idle" }),
    );

    expect(container.textContent).toContain("Committed Prediction:");
    expect(container.textContent).not.toContain("Incorrect");
    expect(container.textContent).not.toContain("Disproven");

    cleanup();
  });

  // G — Canonical feedback
  it("G — integrates canonical feedback through ActivityFeedback upon submission", () => {
    const { container, cleanup } = renderComponent(
      mockOptionActivity,
      createInitialState({
        response: "4",
        status: "correct",
        validationResult: {
          isValid: true,
          feedbackMessage: "Execution trace verified! Arrays are passed by reference.",
        },
      }),
    );

    expect(container.textContent).toContain("Prediction Verified");
    expect(container.textContent).toContain("Execution trace verified!");

    cleanup();
  });

  // H — No duplicate terminal feedback
  it("H — does not render duplicate skeuomorphic terminal diagnostics or macOS dots", () => {
    const { container, cleanup } = renderComponent(
      mockOptionActivity,
      createInitialState({
        response: "4",
        status: "correct",
        validationResult: { isValid: true, feedbackMessage: "Execution trace verified!" },
      }),
    );

    // Confirm no fake terminal chrome
    expect(container.textContent).not.toContain("[PREDICTION CORRECT]");
    expect(container.textContent).not.toContain("[PREDICTION INCORRECT]");
    expect(container.textContent).not.toContain("zsh — prediction-evaluator");
    expect(container.querySelector(".bg-rose-500\\/80")).toBeNull();

    cleanup();
  });

  // I — Retry flow
  it("I — allows new prediction selection after an incorrect submission and retry", () => {
    const onResponseSpy = vi.fn();
    const { container, cleanup } = renderComponent(
      mockOptionActivity,
      createInitialState({
        response: "3",
        status: "incorrect",
        validationResult: { isValid: false, feedbackMessage: "Prediction disproven." },
      }),
      onResponseSpy,
    );

    expect(container.textContent).toContain("Prediction Disproven");

    // Can still interact / change selection on retry
    const buttons = container.querySelectorAll<HTMLButtonElement>('[role="radio"]');
    act(() => {
      buttons[1].click();
    });

    expect(onResponseSpy).toHaveBeenCalledWith("4");

    cleanup();
  });

  // J — readOnly behavior
  it("J — prevents mutating prediction when readOnly is true", () => {
    const onResponseSpy = vi.fn();
    const { container, cleanup } = renderComponent(
      mockOptionActivity,
      createInitialState({ response: "4" }),
      onResponseSpy,
      vi.fn(),
      vi.fn(),
      vi.fn(),
      true, // readOnly
    );

    const buttons = container.querySelectorAll<HTMLButtonElement>('[role="radio"]');
    expect(buttons[0].disabled).toBe(true);

    act(() => {
      buttons[0].click();
    });

    expect(onResponseSpy).not.toHaveBeenCalled();

    cleanup();
  });

  // K — Accessibility & Keyboard interaction
  it("K — supports keyboard navigation across radio options via arrow keys", () => {
    const onResponseSpy = vi.fn();
    const { container, cleanup } = renderComponent(
      mockOptionActivity,
      createInitialState({ response: "3" }),
      onResponseSpy,
    );

    const buttons = container.querySelectorAll<HTMLButtonElement>('[role="radio"]');
    expect(buttons[0].getAttribute("aria-checked")).toBe("true");

    // Simulate ArrowDown on first option
    act(() => {
      buttons[0].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    });

    expect(onResponseSpy).toHaveBeenCalledWith("4");

    cleanup();
  });

  // L — Submit trigger on Enter for exact prediction input
  it("L — triggers onSubmit when pressing Enter in exact prediction input", () => {
    const onSubmitSpy = vi.fn();
    const { container, cleanup } = renderComponent(
      mockExactActivity,
      createInitialState({ response: "10" }),
      vi.fn(),
      onSubmitSpy,
    );

    const input = container.querySelector<HTMLInputElement>("input");
    expect(input).not.toBeNull();

    act(() => {
      input?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    });

    expect(onSubmitSpy).toHaveBeenCalled();

    cleanup();
  });
});
