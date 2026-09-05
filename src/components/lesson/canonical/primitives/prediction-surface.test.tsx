// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import {
  PredictionSurface,
  type PredictionOption,
  type PredictionSurfaceProps,
} from "./prediction-surface";

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

function setTextareaValue(element: HTMLTextAreaElement, value: string) {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    "value",
  )?.set;
  if (nativeInputValueSetter) {
    nativeInputValueSetter.call(element, value);
  } else {
    element.value = value;
  }
  element.dispatchEvent(new Event("change", { bubbles: true }));
  element.dispatchEvent(new Event("input", { bubbles: true }));
}

describe("PredictionSurface — Canonical UI Primitive", () => {
  // Test A — renders prompt
  it("Test A: renders prompt and optional description correctly", () => {
    const { container, cleanup } = renderComponent(
      <PredictionSurface
        prompt="Predict the return value of the async function."
        promptDescription="What will be resolved when the microtask queue clears?"
        value=""
      />,
    );
    try {
      expect(container.textContent).toContain("Predict the return value of the async function.");
      expect(container.textContent).toContain(
        "What will be resolved when the microtask queue clears?",
      );
    } finally {
      cleanup();
    }
  });

  // Test B — renders learner input
  it("Test B: renders learner prediction input value", () => {
    const { container, cleanup } = renderComponent(
      <PredictionSurface
        prompt="Predict execution outcome"
        value="The promise resolves with status code 200 after 50ms"
      />,
    );
    try {
      const textarea = container.querySelector(
        '[data-testid="prediction-input"]',
      ) as HTMLTextAreaElement;
      expect(textarea).not.toBeNull();
      expect(textarea.value).toBe("The promise resolves with status code 200 after 50ms");
    } finally {
      cleanup();
    }
  });

  // Test C — input interaction
  it("Test C: reports input value changes through supplied onChange callback", () => {
    const handleChange = vi.fn();
    const { container, cleanup } = renderComponent(
      <PredictionSurface prompt="Predict outcome" value="" onChange={handleChange} />,
    );
    try {
      const textarea = container.querySelector(
        '[data-testid="prediction-input"]',
      ) as HTMLTextAreaElement;
      act(() => {
        setTextareaValue(textarea, "I predict an unhandled rejection");
      });
      expect(handleChange).toHaveBeenCalledWith("I predict an unhandled rejection");
    } finally {
      cleanup();
    }
  });

  // Test D — renders structured options
  it("Test D: renders all supplied structured prediction assessment options", () => {
    const options: PredictionOption[] = [
      { id: "opt-1", label: "Option 1: Returns a fulfilled promise" },
      { id: "opt-2", label: "Option 2: Throws a synchronous TypeError" },
      { id: "opt-3", label: "Option 3: Blocks the event loop indefinitely" },
    ];
    const { container, cleanup } = renderComponent(
      <PredictionSurface
        prompt="Predict outcome"
        value=""
        options={options}
        optionsLegend="Expected failure mode:"
      />,
    );
    try {
      const fieldset = container.querySelector('[data-testid="prediction-assessment-fieldset"]');
      expect(fieldset).not.toBeNull();
      expect(fieldset?.textContent).toContain("Expected failure mode:");
      expect(fieldset?.textContent).toContain("Option 1: Returns a fulfilled promise");
      expect(fieldset?.textContent).toContain("Option 2: Throws a synchronous TypeError");
      expect(fieldset?.textContent).toContain("Option 3: Blocks the event loop indefinitely");
    } finally {
      cleanup();
    }
  });

  // Test E — preserves option order
  it("Test E: renders structured options in the exact caller-supplied order", () => {
    const options: PredictionOption[] = [
      { id: "alpha", label: "Alpha" },
      { id: "beta", label: "Beta" },
      { id: "gamma", label: "Gamma" },
    ];
    const { container, cleanup } = renderComponent(
      <PredictionSurface prompt="Predict outcome" value="" options={options} />,
    );
    try {
      const radioInputs = Array.from(
        container.querySelectorAll('input[type="radio"]'),
      ) as HTMLInputElement[];
      expect(radioInputs.map((r) => r.value)).toEqual(["alpha", "beta", "gamma"]);
    } finally {
      cleanup();
    }
  });

  // Test F — selected option
  it("Test F: represents selected option state accurately and triggers selection callback", () => {
    const handleSelect = vi.fn();
    const options: PredictionOption[] = [
      { id: "choice-a", label: "Choice A" },
      { id: "choice-b", label: "Choice B" },
    ];
    const { container, cleanup } = renderComponent(
      <PredictionSurface
        prompt="Predict outcome"
        value=""
        options={options}
        selectedOptionId="choice-b"
        onSelectOption={handleSelect}
      />,
    );
    try {
      const radioA = container.querySelector('input[value="choice-a"]') as HTMLInputElement;
      const radioB = container.querySelector('input[value="choice-b"]') as HTMLInputElement;

      expect(radioA.checked).toBe(false);
      expect(radioB.checked).toBe(true);

      act(() => {
        radioA.click();
      });
      expect(handleSelect).toHaveBeenCalledWith("choice-a");
    } finally {
      cleanup();
    }
  });

  // Test G — record action
  it("Test G: invokes onRecord callback when record action is activated", () => {
    const handleRecord = vi.fn();
    const { container, cleanup } = renderComponent(
      <PredictionSurface
        prompt="Predict outcome"
        value="A valid prediction"
        onRecord={handleRecord}
        recordDisabled={false}
      />,
    );
    try {
      const button = container.querySelector(
        '[data-testid="record-prediction-action-button"]',
      ) as HTMLButtonElement;
      expect(button).not.toBeNull();
      act(() => {
        button.click();
      });
      expect(handleRecord).toHaveBeenCalledTimes(1);
    } finally {
      cleanup();
    }
  });

  // Test H — disabled record action
  it("Test H: respects caller-supplied disabled state on record button", () => {
    const handleRecord = vi.fn();
    const { container, cleanup } = renderComponent(
      <PredictionSurface
        prompt="Predict outcome"
        value=""
        onRecord={handleRecord}
        recordDisabled={true}
      />,
    );
    try {
      const button = container.querySelector(
        '[data-testid="record-prediction-action-button"]',
      ) as HTMLButtonElement;
      expect(button.disabled).toBe(true);
      act(() => {
        button.click();
      });
      expect(handleRecord).not.toHaveBeenCalled();
    } finally {
      cleanup();
    }
  });

  // Test I — generic data (unrelated engineering scenario)
  it("Test I: renders a completely unrelated CSS Flexbox engineering prediction scenario without coupling", () => {
    const flexOptions: PredictionOption[] = [
      { id: "row-reverse", label: "Items will align from right to left" },
      { id: "column", label: "Items will stack vertically from top to bottom" },
      { id: "wrap", label: "Items will wrap onto multiple horizontal lines" },
    ];

    const { container, cleanup } = renderComponent(
      <PredictionSurface
        title="CSS Flexbox Behavior Prediction"
        prompt="Predict the layout when flex-direction: column is applied to .container"
        promptDescription="Observe the child dimensions: width: 100px, height: 50px."
        inputLabel="What will the container's computed cross-axis dimension be?"
        value="The cross axis becomes horizontal, stretching items to full container width."
        options={flexOptions}
        optionsLegend="Expected item flow:"
        selectedOptionId="column"
        isRecorded={true}
        recordedStatus="Prediction recorded."
        transitionCue="Now apply the rule in DevTools to test your prediction."
      />,
    );
    try {
      const text = container.textContent || "";
      expect(text).toContain("CSS Flexbox Behavior Prediction");
      expect(text).toContain(
        "Predict the layout when flex-direction: column is applied to .container",
      );
      expect(text).toContain("What will the container's computed cross-axis dimension be?");
      expect(text).toContain("Items will stack vertically from top to bottom");
      expect(text).toContain("Prediction recorded.");
      expect(text).toContain("Now apply the rule in DevTools to test your prediction.");

      // Verify zero mentions of Golden Lesson 1 specifics
      expect(text).not.toContain("Account Settings");
      expect(text).not.toContain("Save Changes");
      expect(text).not.toContain("Notification Preferences");
    } finally {
      cleanup();
    }
  });

  // Test J — no grading
  it("Test J: does not display score, grade, correctness, or model answers", () => {
    const { container, cleanup } = renderComponent(
      <PredictionSurface
        prompt="Predict outcome"
        value="A plausible prediction"
        isRecorded={true}
      />,
    );
    try {
      const text = container.textContent?.toLowerCase() || "";
      expect(text).not.toContain("grade");
      expect(text).not.toContain("score");
      expect(text).not.toContain("points");
      expect(text).not.toContain("correct answer");
      expect(text).not.toContain("incorrect answer");
      expect(text).not.toContain("model answer");
      expect(text).not.toContain("pass");
      expect(text).not.toContain("fail");
    } finally {
      cleanup();
    }
  });

  // Test K — no evaluation/runtime
  it("Test K: does not invoke sandbox, iframe, or runtime evaluation", () => {
    const { container, cleanup } = renderComponent(
      <PredictionSurface prompt="Predict runtime output" value="console.log('test')" />,
    );
    try {
      expect(container.querySelector("iframe")).toBeNull();
      expect(container.querySelector('[data-testid="runtime-host"]')).toBeNull();
      expect(container.querySelector('[data-testid="sandbox-container"]')).toBeNull();
    } finally {
      cleanup();
    }
  });

  // Test L — accessibility
  it("Test L: satisfies accessibility requirements (semantic fieldset, legend, labels, touch targets)", () => {
    const { container, cleanup } = renderComponent(
      <PredictionSurface
        id="test-prediction-surface"
        title="Diagnostic Prediction"
        prompt="Predict outcome"
        inputId="test-prediction-input"
        inputLabel="Enter your hypothesis outcome"
        value=""
        options={[
          { id: "opt-a", label: "Option A" },
          { id: "opt-b", label: "Option B" },
        ]}
        optionsLegend="Choose likely outcome"
        optionsFieldsetId="test-options-group"
      />,
    );
    try {
      const outerFieldset = container.querySelector("#test-prediction-surface");
      expect(outerFieldset?.tagName.toLowerCase()).toBe("fieldset");

      const outerLegend = outerFieldset?.querySelector("legend");
      expect(outerLegend).not.toBeNull();
      expect(outerLegend?.textContent).toContain("Diagnostic Prediction");

      const textareaLabel = container.querySelector('label[for="test-prediction-input"]');
      expect(textareaLabel).not.toBeNull();
      expect(textareaLabel?.textContent).toBe("Enter your hypothesis outcome");

      const recordButton = container.querySelector(
        '[data-testid="record-prediction-action-button"]',
      );
      expect(recordButton?.classList.contains("min-h-[44px]")).toBe(true);

      const optionLabels = container.querySelectorAll('label[for^="prediction-assessment-"]');
      expect(optionLabels.length).toBe(2);
      optionLabels.forEach((label) => {
        expect(label.classList.contains("min-h-[44px]")).toBe(true);
      });
    } finally {
      cleanup();
    }
  });

  // Test M — deterministic/predictable rendering
  it("Test M: produces identical output for identical props", () => {
    const props: PredictionSurfaceProps = {
      id: "det-prediction-surface",
      title: "Deterministic Prediction",
      prompt: "Predict outcome",
      promptDescription: "Provide your reasoning",
      inputLabel: "Outcome observation:",
      value: "Expected outcome",
      options: [
        { id: "1", label: "Option 1" },
        { id: "2", label: "Option 2" },
      ],
      selectedOptionId: "1",
      isRecorded: true,
      recordedStatus: "Prediction recorded.",
      transitionCue: "Proceed to next step.",
    };

    const { container: container1, cleanup: cleanup1 } = renderComponent(
      <PredictionSurface {...props} />,
    );
    const { container: container2, cleanup: cleanup2 } = renderComponent(
      <PredictionSurface {...props} />,
    );
    try {
      expect(container1.innerHTML).toBe(container2.innerHTML);
    } finally {
      cleanup1();
      cleanup2();
    }
  });
});
