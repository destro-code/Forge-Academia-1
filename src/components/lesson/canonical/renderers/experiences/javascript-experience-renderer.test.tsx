// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { JavaScriptExperienceRenderer } from "./javascript-experience-renderer";
import type { InteractiveCodeActivity } from "@/lib/curriculum/types";
import type { ActivityInteractionState, ActivityValidationResult, EvaluationRequest } from "../../types";

const mockCheck = vi.fn();
const mockRun = vi.fn();
const mockReset = vi.fn();
let triggerTechnicalResult: ((result: ActivityValidationResult) => void) | null = null;

vi.mock("../../runtime/use-experience-controller", () => ({
  useExperienceController: vi.fn(() => {
    const [technicalResult, setTechnicalResult] = React.useState<ActivityValidationResult | undefined>();
    const [hasExecuted, setHasExecuted] = React.useState(false);
    const [testResults, setTestResults] = React.useState<Array<{ id: string; description: string; passed: boolean }>>([]);

    React.useEffect(() => {
      triggerTechnicalResult = (result: ActivityValidationResult) => {
        setTechnicalResult(result);
        setHasExecuted(true);
        setTestResults(
          result.testResults?.map((t, idx) => ({
            id: t.id || `test-${idx}`,
            description: t.description || `Test ${idx + 1}`,
            passed: t.status === "passed",
          })) || [],
        );
      };
    }, []);

    return {
      iframeRef: { current: null },
      iframeTitle: "Preview",
      iframeSandbox: "allow-scripts",
      isRunning: false,
      hasExecuted,
      consoleOutput: ["[log] Output initialized"],
      testResults,
      technicalResult,
      buildError: undefined,
      run: mockRun,
      check: () => {
        mockCheck();
      },
      reset: mockReset,
    };
  }),
}));

describe("JavaScriptExperienceRenderer - Evaluation Bridge", () => {
  const mockActivity: InteractiveCodeActivity = {
    id: "act-js-test",
    type: "interactive-code",
    intent: "application",
    objectiveIds: ["obj-js"],
    content: {
      language: "javascript",
      title: "Multiply Function",
      prompt: "Create a function multiply(a, b).",
      instructions: "Define multiply so that multiply(2, 3) returns 6.",
      starterCode: "function multiply(a, b) {\n  \n}",
      solutionCode: "function multiply(a, b) {\n  return a * b;\n}",
      testCases: [
        {
          id: "tc-mult",
          description: "multiply(2, 3) returns 6",
          assertion: "multiply(2, 3) === 6",
        },
      ],
    },
    feedback: {
      correct: "Calculation works.",
      incorrect: "Check multiply logic.",
    },
  };

  const idleState: ActivityInteractionState<string> = {
    status: "idle",
    attempts: 0,
    startedAt: Date.now(),
    response: "function multiply(a, b) {\n  \n}",
    hintsRevealed: 0,
  };

  const sampleResult: ActivityValidationResult = {
    isValid: true,
    score: 1,
    feedbackMessage: "Calculation works.",
    testResults: [
      {
        id: "tc-mult",
        description: "multiply(2, 3) returns 6",
        status: "passed",
      },
    ],
  };

  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.clearAllMocks();
    triggerTechnicalResult = null;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  it("triggers controller.check and forwards result to onRuntimeValidation on authoritative evaluationRequest", () => {
    const onRuntimeValidation = vi.fn();
    const onSubmit = vi.fn();

    act(() => {
      root.render(
        <JavaScriptExperienceRenderer
          activity={mockActivity}
          state={idleState}
          onResponse={vi.fn()}
          onSubmit={onSubmit}
          onRuntimeValidation={onRuntimeValidation}
        />,
      );
    });

    expect(mockCheck).not.toHaveBeenCalled();
    expect(onRuntimeValidation).not.toHaveBeenCalled();

    const evaluationRequest: EvaluationRequest = {
      activityId: mockActivity.id,
      attemptId: "act-js-test:attempt-1:1000",
      revision: 1,
      authoritative: true,
    };

    act(() => {
      root.render(
        <JavaScriptExperienceRenderer
          activity={mockActivity}
          state={{ ...idleState, status: "evaluating" }}
          onResponse={vi.fn()}
          onSubmit={onSubmit}
          evaluationRequest={evaluationRequest}
          onRuntimeValidation={onRuntimeValidation}
        />,
      );
    });

    expect(mockCheck).toHaveBeenCalledTimes(1);
    expect(onRuntimeValidation).not.toHaveBeenCalled();

    act(() => {
      triggerTechnicalResult?.(sampleResult);
    });

    expect(onRuntimeValidation).toHaveBeenCalledTimes(1);
    expect(onRuntimeValidation).toHaveBeenCalledWith(sampleResult);
  });

  it("keeps renderer Check button non-authoritative (does NOT trigger onRuntimeValidation)", () => {
    const onRuntimeValidation = vi.fn();

    act(() => {
      root.render(
        <JavaScriptExperienceRenderer
          activity={mockActivity}
          state={idleState}
          onResponse={vi.fn()}
          onRuntimeValidation={onRuntimeValidation}
        />,
      );
    });

    const checkBtn = Array.from(container.querySelectorAll("button")).find(
      (btn) => btn.textContent?.trim() === "Check",
    );
    expect(checkBtn).toBeDefined();

    act(() => {
      checkBtn?.click();
    });

    expect(mockCheck).toHaveBeenCalledTimes(1);

    act(() => {
      triggerTechnicalResult?.(sampleResult);
    });

    expect(onRuntimeValidation).not.toHaveBeenCalled();
  });

  it("supports retrying with fresh evaluationRequest after failure", () => {
    const onRuntimeValidation = vi.fn();

    act(() => {
      root.render(
        <JavaScriptExperienceRenderer
          activity={mockActivity}
          state={{ ...idleState, status: "evaluating" }}
          onResponse={vi.fn()}
          evaluationRequest={{
            activityId: mockActivity.id,
            attemptId: "act-js-test:attempt-1:1000",
            revision: 1,
            authoritative: true,
          }}
          onRuntimeValidation={onRuntimeValidation}
        />,
      );
    });

    expect(mockCheck).toHaveBeenCalledTimes(1);

    const failureResult: ActivityValidationResult = {
      isValid: false,
      score: 0,
      feedbackMessage: "Incorrect output.",
      testResults: [{ id: "tc-mult", description: "multiply(2, 3) returns 6", status: "failed" }],
    };

    act(() => {
      triggerTechnicalResult?.(failureResult);
    });

    expect(onRuntimeValidation).toHaveBeenCalledWith(failureResult);

    act(() => {
      root.render(
        <JavaScriptExperienceRenderer
          activity={mockActivity}
          state={{ ...idleState, status: "idle", attempts: 1 }}
          onResponse={vi.fn()}
          onRuntimeValidation={onRuntimeValidation}
        />,
      );
    });

    act(() => {
      root.render(
        <JavaScriptExperienceRenderer
          activity={mockActivity}
          state={{ ...idleState, status: "evaluating", attempts: 1 }}
          onResponse={vi.fn()}
          evaluationRequest={{
            activityId: mockActivity.id,
            attemptId: "act-js-test:attempt-2:2000",
            revision: 2,
            authoritative: true,
          }}
          onRuntimeValidation={onRuntimeValidation}
        />,
      );
    });

    expect(mockCheck).toHaveBeenCalledTimes(2);

    act(() => {
      triggerTechnicalResult?.(sampleResult);
    });

    expect(onRuntimeValidation).toHaveBeenCalledTimes(2);
    expect(onRuntimeValidation).toHaveBeenLastCalledWith(sampleResult);
  });
});
