// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from "vitest";
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { ComputerPipeline, type ComputerPipelineConfig } from "./computer-pipeline";
import { getInteractiveVisual } from "./index";
import { VisualRenderer } from "../visual-renderer";
import type { VisualActivity } from "@/lib/curriculum/types";
import type { ActivityInteractionState } from "../../types";

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

describe("ComputerPipeline Visual Primitive", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  // --------------------------------------------------------------------------
  // Test A — Registration
  // --------------------------------------------------------------------------
  it("Test A — Registration: interactive.kind = 'computer-pipeline' resolves to ComputerPipeline renderer", () => {
    const ResolvedComponent = getInteractiveVisual("computer-pipeline");
    expect(ResolvedComponent).toBe(ComputerPipeline);

    const mockActivity: VisualActivity = {
      id: "act-test-pipeline",
      type: "visual",
      intent: "concept",
      objectiveIds: ["obj-test"],
      content: {
        title: "Computer Flow",
        visualType: "flowchart",
        interactive: {
          kind: "computer-pipeline",
          caption: "A model of how computers process information",
        },
      },
    };

    const mockState: ActivityInteractionState<null> = {
      status: "idle",
      response: null,
      attempts: 0,
      hintsRevealed: 0,
      startedAt: Date.now(),
    };

    const { container, cleanup } = renderComponent(
      <VisualRenderer activity={mockActivity} state={mockState} onContinue={() => {}} />,
    );

    try {
      const pipelineRoot = container.querySelector('[data-testid="computer-pipeline"]');
      expect(pipelineRoot).not.toBeNull();
      expect(container.textContent).toContain("A model of how computers process information");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test B — Trace rendering
  // --------------------------------------------------------------------------
  it("Test B — Trace rendering: renders the expected stages for a trace scenario", () => {
    const config: ComputerPipelineConfig = {
      scenario: {
        id: "name-scenario",
        title: "Type your name",
        mode: "trace",
        steps: [
          {
            id: "step-1",
            stage: "input",
            title: "Keys Pressed",
            description: "You press letters on your keyboard.",
          },
          {
            id: "step-2",
            stage: "processing",
            title: "Character Encoding",
            description: "The CPU converts key codes into characters.",
          },
          {
            id: "step-3",
            stage: "output",
            title: "Screen Update",
            description: "Your name appears on the display.",
          },
        ],
      },
    };

    const { container, cleanup } = renderComponent(<ComputerPipeline config={config} />);

    try {
      const inputCard = container.querySelector('[data-testid="stage-card-input"]');
      const processingCard = container.querySelector('[data-testid="stage-card-processing"]');
      const outputCard = container.querySelector('[data-testid="stage-card-output"]');

      expect(inputCard).not.toBeNull();
      expect(processingCard).not.toBeNull();
      expect(outputCard).not.toBeNull();

      expect(inputCard?.getAttribute("data-status")).toBe("active");
      expect(processingCard?.getAttribute("data-status")).toBe("upcoming");
      expect(outputCard?.getAttribute("data-status")).toBe("upcoming");

      const detail = container.querySelector('[data-testid="trace-step-detail"]');
      expect(detail?.textContent).toContain("You press letters on your keyboard.");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test C — Trace progression
  // --------------------------------------------------------------------------
  it("Test C — Trace progression: advancing changes the active stage and preserves prior stages as completed", () => {
    const config: ComputerPipelineConfig = {
      scenario: {
        id: "name-scenario",
        title: "Type your name",
        mode: "trace",
        steps: [
          {
            id: "step-1",
            stage: "input",
            title: "Keys Pressed",
            description: "You press letters on your keyboard.",
          },
          {
            id: "step-2",
            stage: "processing",
            title: "Character Encoding",
            description: "The CPU converts key codes into characters.",
          },
          {
            id: "step-3",
            stage: "output",
            title: "Screen Update",
            description: "Your name appears on the display.",
          },
        ],
      },
    };

    const { container, cleanup } = renderComponent(<ComputerPipeline config={config} />);

    try {
      const advanceButton = container.querySelector(
        '[data-testid="trace-advance-button"]',
      ) as HTMLButtonElement | null;
      expect(advanceButton).not.toBeNull();

      // Advance to step 2 (processing)
      act(() => {
        advanceButton?.click();
      });

      const inputCard = container.querySelector('[data-testid="stage-card-input"]');
      const processingCard = container.querySelector('[data-testid="stage-card-processing"]');
      const outputCard = container.querySelector('[data-testid="stage-card-output"]');

      expect(inputCard?.getAttribute("data-status")).toBe("completed");
      expect(processingCard?.getAttribute("data-status")).toBe("active");
      expect(outputCard?.getAttribute("data-status")).toBe("upcoming");

      const detail = container.querySelector('[data-testid="trace-step-detail"]');
      expect(detail?.textContent).toContain("The CPU converts key codes into characters.");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test D — Trace completion
  // --------------------------------------------------------------------------
  it("Test D — Trace completion: the scenario becomes complete after all relevant stages are traversed", () => {
    const config: ComputerPipelineConfig = {
      scenario: {
        id: "name-scenario",
        title: "Type your name",
        mode: "trace",
        steps: [
          { id: "s1", stage: "input", title: "Input", description: "Press keys" },
          { id: "s2", stage: "processing", title: "Processing", description: "Compute text" },
          { id: "s3", stage: "output", title: "Output", description: "Show on screen" },
        ],
      },
    };

    const { container, cleanup } = renderComponent(<ComputerPipeline config={config} />);

    try {
      const advanceButton = container.querySelector(
        '[data-testid="trace-advance-button"]',
      ) as HTMLButtonElement | null;

      // Click to step 2 (processing)
      act(() => {
        advanceButton?.click();
      });

      // Click to step 3 (output)
      act(() => {
        advanceButton?.click();
      });

      // Click to complete trace
      act(() => {
        advanceButton?.click();
      });

      const root = container.querySelector('[data-testid="computer-pipeline"]');
      expect(root?.getAttribute("data-completed")).toBe("true");

      const completeBadge = container.querySelector('[data-testid="trace-complete-badge"]');
      expect(completeBadge).not.toBeNull();
      expect(completeBadge?.textContent).toContain("Trace complete");

      // Button now allows replay
      expect(advanceButton?.textContent).toContain("Replay Trace");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test E — Mapping rendering
  // --------------------------------------------------------------------------
  it("Test E — Mapping rendering: mapping mode renders the authored question and choices inside accessible controls", () => {
    const config: ComputerPipelineConfig = {
      scenario: {
        id: "mapping-doc",
        title: "Saving a Document",
        mode: "mapping",
        mapping: {
          prompt: "Which part of saving a document is INPUT?",
          targetStage: "input",
          choices: [
            { id: "c1", text: "Typing words on the keyboard", stage: "input", isCorrect: true },
            { id: "c2", text: "Compressing the file", stage: "processing", isCorrect: false },
            { id: "c3", text: "Preserving data on disk", stage: "storage", isCorrect: false },
            {
              id: "c4",
              text: "Displaying the saved confirmation",
              stage: "output",
              isCorrect: false,
            },
          ],
        },
      },
    };

    const { container, cleanup } = renderComponent(<ComputerPipeline config={config} />);

    try {
      const prompt = container.querySelector('[data-testid="mapping-prompt"]');
      expect(prompt?.textContent).toContain("Which part of saving a document is INPUT?");

      const choice1 = container.querySelector('[data-testid="mapping-choice-c1"]');
      const choice2 = container.querySelector('[data-testid="mapping-choice-c2"]');
      const choice3 = container.querySelector('[data-testid="mapping-choice-c3"]');
      const choice4 = container.querySelector('[data-testid="mapping-choice-c4"]');

      expect(choice1).not.toBeNull();
      expect(choice2).not.toBeNull();
      expect(choice3).not.toBeNull();
      expect(choice4).not.toBeNull();

      // Check choice radio buttons
      const radioInputs = container.querySelectorAll('input[type="radio"]');
      expect(radioInputs.length).toBe(4);

      // Verify submit button is disabled before selection
      const checkButton = container.querySelector(
        '[data-testid="mapping-check-button"]',
      ) as HTMLButtonElement | null;
      expect(checkButton?.disabled).toBe(true);
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test F — Mapping selection
  // --------------------------------------------------------------------------
  it("Test F — Mapping selection: selecting a choice updates local state, enables submit, and provides feedback upon commit", () => {
    const config: ComputerPipelineConfig = {
      scenario: {
        id: "mapping-doc",
        title: "Saving a Document",
        mode: "mapping",
        mapping: {
          prompt: "Which part of saving a document is INPUT?",
          targetStage: "input",
          explanation: "Input captures external information into the system.",
          choices: [
            {
              id: "c1",
              text: "Typing words on the keyboard",
              stage: "input",
              isCorrect: true,
              rationale: "Keystrokes are input to the computer.",
            },
            {
              id: "c2",
              text: "Compressing the file",
              stage: "processing",
              isCorrect: false,
              rationale: "Compression is processing.",
            },
          ],
        },
      },
    };

    const { container, cleanup } = renderComponent(<ComputerPipeline config={config} />);

    try {
      const radioWrong = container.querySelector('input[value="c2"]') as HTMLInputElement | null;
      expect(radioWrong).not.toBeNull();

      // Select wrong choice
      act(() => {
        radioWrong?.click();
      });

      const checkButton = container.querySelector(
        '[data-testid="mapping-check-button"]',
      ) as HTMLButtonElement | null;
      expect(checkButton?.disabled).toBe(false);

      // Commit choice
      act(() => {
        checkButton?.click();
      });

      const feedback = container.querySelector('[data-testid="mapping-feedback"]');
      expect(feedback?.textContent).toContain("Not quite");
      expect(feedback?.textContent).toContain("Compression is processing.");

      // Retry button is available
      const retryButton = container.querySelector(
        '[data-testid="mapping-retry-button"]',
      ) as HTMLButtonElement | null;
      expect(retryButton).not.toBeNull();

      act(() => {
        retryButton?.click();
      });

      // Feedback cleared; can select correct choice
      const radioCorrect = container.querySelector('input[value="c1"]') as HTMLInputElement | null;
      act(() => {
        radioCorrect?.click();
      });

      const checkButtonAfterRetry = container.querySelector(
        '[data-testid="mapping-check-button"]',
      ) as HTMLButtonElement | null;
      act(() => {
        checkButtonAfterRetry?.click();
      });

      const feedbackCorrect = container.querySelector('[data-testid="mapping-feedback"]');
      expect(feedbackCorrect?.textContent).toContain("Correct!");
      expect(feedbackCorrect?.textContent).toContain("Keystrokes are input to the computer.");

      const root = container.querySelector('[data-testid="computer-pipeline"]');
      expect(root?.getAttribute("data-completed")).toBe("true");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test G — Storage optionality
  // --------------------------------------------------------------------------
  it("Test G — Storage optionality: a scenario without storage does not render a mandatory storage stage", () => {
    const config: ComputerPipelineConfig = {
      scenario: {
        id: "calculator",
        title: "Calculate 2 + 2",
        mode: "trace",
        steps: [
          { id: "s1", stage: "input", title: "Enter Numbers", description: "Press 2 + 2" },
          { id: "s2", stage: "processing", title: "Add", description: "CPU adds 2 and 2" },
          { id: "s3", stage: "output", title: "Display 4", description: "Screen shows 4" },
        ],
      },
    };

    const { container, cleanup } = renderComponent(<ComputerPipeline config={config} />);

    try {
      const storageCard = container.querySelector('[data-testid="stage-card-storage"]');
      expect(storageCard).toBeNull();

      const storageContainer = container.querySelector(
        '[data-testid="pipeline-storage-container"]',
      );
      expect(storageContainer).toBeNull();

      // Main flow is intact
      expect(container.querySelector('[data-testid="stage-card-input"]')).not.toBeNull();
      expect(container.querySelector('[data-testid="stage-card-processing"]')).not.toBeNull();
      expect(container.querySelector('[data-testid="stage-card-output"]')).not.toBeNull();
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test H — Storage save
  // --------------------------------------------------------------------------
  it("Test H — Storage save: a save scenario represents storage as a persistence relationship", () => {
    const config: ComputerPipelineConfig = {
      scenario: {
        id: "save-doc",
        title: "Save Document",
        mode: "trace",
        storage: {
          action: "save",
          title: "Storage",
          description: "Preserve document on disk",
        },
        steps: [
          { id: "s1", stage: "input", title: "Write Text", description: "Type notes" },
          { id: "s2", stage: "processing", title: "Format", description: "Prepare file" },
          { id: "s3", stage: "storage", title: "Save File", description: "Write bytes to disk" },
        ],
      },
    };

    const { container, cleanup } = renderComponent(<ComputerPipeline config={config} />);

    try {
      const storageCard = container.querySelector('[data-testid="stage-card-storage"]');
      expect(storageCard).not.toBeNull();

      const relationship = container.querySelector('[data-testid="storage-relationship"]');
      expect(relationship).not.toBeNull();
      expect(relationship?.getAttribute("data-action")).toBe("save");
      expect(relationship?.textContent).toContain("Save data");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test I — Storage retrieve
  // --------------------------------------------------------------------------
  it("Test I — Storage retrieve: a retrieve scenario represents storage feeding back into the process", () => {
    const config: ComputerPipelineConfig = {
      scenario: {
        id: "open-file",
        title: "Open Saved File",
        mode: "trace",
        storage: {
          action: "retrieve",
          title: "Storage",
          description: "Read saved file from disk",
        },
        steps: [
          { id: "s1", stage: "storage", title: "Fetch File", description: "Read bytes from disk" },
          {
            id: "s2",
            stage: "processing",
            title: "Parse Document",
            description: "Decompress and interpret",
          },
          { id: "s3", stage: "output", title: "Display File", description: "Show on monitor" },
        ],
      },
    };

    const { container, cleanup } = renderComponent(<ComputerPipeline config={config} />);

    try {
      const storageCard = container.querySelector('[data-testid="stage-card-storage"]');
      expect(storageCard).not.toBeNull();

      const relationship = container.querySelector('[data-testid="storage-relationship"]');
      expect(relationship).not.toBeNull();
      expect(relationship?.getAttribute("data-action")).toBe("retrieve");
      expect(relationship?.textContent).toContain("Retrieve data");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test J — Accessibility
  // --------------------------------------------------------------------------
  it("Test J — Accessibility: provides semantic controls, accessible labels, keyboard focus, and minimum 44px touch targets", () => {
    const config: ComputerPipelineConfig = {
      scenarios: [
        {
          id: "sc-1",
          title: "Scenario 1",
          mode: "trace",
          steps: [
            { id: "s1", stage: "input", title: "Input", description: "Press keys" },
            { id: "s2", stage: "output", title: "Output", description: "Display text" },
          ],
        },
        {
          id: "sc-2",
          title: "Scenario 2",
          mode: "mapping",
          mapping: {
            prompt: "Identify the processing step:",
            choices: [
              { id: "c1", text: "Sorting numbers", isCorrect: true },
              { id: "c2", text: "Typing keys", isCorrect: false },
            ],
          },
        },
      ],
    };

    const { container, cleanup } = renderComponent(<ComputerPipeline config={config} />);

    try {
      // 1. Tablist semantics
      const tablist = container.querySelector('[role="tablist"]');
      expect(tablist).not.toBeNull();
      expect(tablist?.getAttribute("aria-label")).toBe("Pipeline scenarios");

      const tabs = container.querySelectorAll('[role="tab"]');
      expect(tabs.length).toBe(2);
      expect(tabs[0].classList.contains("min-h-[44px]")).toBe(true);

      // 2. Buttons have min-h-[44px] touch targets
      const advanceButton = container.querySelector('[data-testid="trace-advance-button"]');
      expect(advanceButton?.classList.contains("min-h-[44px]")).toBe(true);

      // 3. Switch to scenario 2 (mapping)
      act(() => {
        (tabs[1] as HTMLButtonElement).click();
      });

      // 4. Fieldset & radiogroup semantics
      const fieldset = container.querySelector("fieldset");
      expect(fieldset).not.toBeNull();

      const radiogroup = container.querySelector('[role="radiogroup"]');
      expect(radiogroup).not.toBeNull();

      const mappingChoices = container.querySelectorAll('label[data-testid^="mapping-choice-"]');
      mappingChoices.forEach((choiceLabel) => {
        expect(choiceLabel.classList.contains("min-h-[44px]")).toBe(true);
      });
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test K — Isolation
  // --------------------------------------------------------------------------
  it("Test K — Isolation: does not invoke external session or runtime execution methods", () => {
    const mockExecute = vi.fn();
    const mockEvaluate = vi.fn();
    const mockSubmit = vi.fn();
    const mockProgress = vi.fn();

    const config: ComputerPipelineConfig = {
      scenario: {
        id: "iso-test",
        title: "Isolation Test",
        mode: "trace",
        steps: [
          { id: "s1", stage: "input", title: "Input", description: "Test" },
          { id: "s2", stage: "output", title: "Output", description: "Done" },
        ],
      },
    };

    // Mount with props that could potentially hold runtime handlers if leaky
    const { container, cleanup } = renderComponent(
      <ComputerPipeline
        config={config}
        visualData={{
          execute: mockExecute,
          evaluate: mockEvaluate,
          submit: mockSubmit,
          progress: mockProgress,
        }}
      />,
    );

    try {
      const advanceButton = container.querySelector(
        '[data-testid="trace-advance-button"]',
      ) as HTMLButtonElement | null;

      act(() => {
        advanceButton?.click();
      });

      act(() => {
        advanceButton?.click();
      });

      expect(mockExecute).not.toHaveBeenCalled();
      expect(mockEvaluate).not.toHaveBeenCalled();
      expect(mockSubmit).not.toHaveBeenCalled();
      expect(mockProgress).not.toHaveBeenCalled();
    } finally {
      cleanup();
    }
  });
});
