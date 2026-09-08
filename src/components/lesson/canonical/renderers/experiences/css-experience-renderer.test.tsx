// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { CssExperienceRenderer } from "./css-experience-renderer";
import type { InteractiveCodeActivity } from "@/lib/curriculum/types";
import type {
  ActivityInteractionState,
  ActivityValidationResult,
  EvaluationRequest,
} from "../../types";

const mockCheck = vi.fn();
const mockRun = vi.fn();
const mockReset = vi.fn();
let triggerTechnicalResult: ((result: ActivityValidationResult) => void) | null = null;

vi.mock("../../runtime/use-experience-controller", () => ({
  useExperienceController: vi.fn(() => {
    const [technicalResult, setTechnicalResult] = React.useState<
      ActivityValidationResult | undefined
    >();
    const [hasExecuted, setHasExecuted] = React.useState(false);
    const [testResults, setTestResults] = React.useState<
      Array<{ id: string; description: string; passed: boolean }>
    >([]);

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
      consoleOutput: [],
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

describe("CssExperienceRenderer - Evaluation Bridge", () => {
  const mockActivity: InteractiveCodeActivity = {
    id: "act-css-test",
    type: "interactive-code",
    intent: "application",
    objectiveIds: ["obj-css"],
    content: {
      language: "css",
      title: "Style Heading",
      prompt: "Style the heading blue.",
      instructions: "Set color to blue on h1.",
      starterCode: "h1 {\n}",
      solutionCode: "h1 {\n  color: blue;\n}",
      testCases: [
        {
          id: "tc-color",
          description: "h1 has color blue",
          assertion: 'Boolean(rules.some(r => r.selector === "h1"))',
        },
      ],
    },
    feedback: {
      correct: "Styles applied correctly.",
      incorrect: "Ensure h1 selector sets color.",
    },
  };

  const idleState: ActivityInteractionState<string> = {
    status: "idle",
    attempts: 0,
    startedAt: Date.now(),
    response: "h1 {\n}",
    hintsRevealed: 0,
  };

  const sampleResult: ActivityValidationResult = {
    isValid: true,
    score: 1,
    feedbackMessage: "Styles applied correctly.",
    testResults: [
      {
        id: "tc-color",
        description: "h1 has color blue",
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
        <CssExperienceRenderer
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
      attemptId: "act-css-test:attempt-1:1000",
      revision: 1,
      authoritative: true,
    };

    act(() => {
      root.render(
        <CssExperienceRenderer
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
        <CssExperienceRenderer
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
        <CssExperienceRenderer
          activity={mockActivity}
          state={{ ...idleState, status: "evaluating" }}
          onResponse={vi.fn()}
          evaluationRequest={{
            activityId: mockActivity.id,
            attemptId: "act-css-test:attempt-1:1000",
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
      feedbackMessage: "Incorrect styles.",
      testResults: [{ id: "tc-color", description: "h1 has color blue", status: "failed" }],
    };

    act(() => {
      triggerTechnicalResult?.(failureResult);
    });

    expect(onRuntimeValidation).toHaveBeenCalledWith(failureResult);

    act(() => {
      root.render(
        <CssExperienceRenderer
          activity={mockActivity}
          state={{ ...idleState, status: "idle", attempts: 1 }}
          onResponse={vi.fn()}
          onRuntimeValidation={onRuntimeValidation}
        />,
      );
    });

    act(() => {
      root.render(
        <CssExperienceRenderer
          activity={mockActivity}
          state={{ ...idleState, status: "evaluating", attempts: 1 }}
          onResponse={vi.fn()}
          evaluationRequest={{
            activityId: mockActivity.id,
            attemptId: "act-css-test:attempt-2:2000",
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
