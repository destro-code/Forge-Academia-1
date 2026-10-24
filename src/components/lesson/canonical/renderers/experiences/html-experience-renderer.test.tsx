// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { HtmlExperienceRenderer } from "./html-experience-renderer";
import { LayerStack } from "../visuals/layer-stack";
import { ClosureSurface } from "@/components/lesson/v2/closure-surface";
import lesson111 from "@/data/canonical/lessons-v1/lesson-1-1-1.json";
import lesson112 from "@/data/canonical/lessons-v1/lesson-1-1-2.json";
import lesson113 from "@/data/canonical/lessons-v1/lesson-1-1-3.json";
import lesson114 from "@/data/canonical/lessons-v1/lesson-1-1-4.json";
import lesson115 from "@/data/canonical/lessons-v1/lesson-1-1-5.json";
import lesson116 from "@/data/canonical/lessons-v1/lesson-1-1-6.json";
import lesson117 from "@/data/canonical/lessons-v1/lesson-1-1-7.json";
import lesson118 from "@/data/canonical/lessons-v1/lesson-1-1-8.json";
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

describe("HtmlExperienceRenderer - Evaluation Bridge", () => {
  const mockActivity: InteractiveCodeActivity = {
    id: "act-html-test",
    type: "interactive-code",
    intent: "application",
    objectiveIds: ["obj-html"],
    content: {
      language: "html",
      title: "Build HTML Card",
      prompt: "Build the card element.",
      instructions: "Create a card element with an h2 title.",
      starterCode: '<div class="card"></div>',
      solutionCode: '<div class="card"><h2>Card Title</h2></div>',
      testCases: [
        {
          id: "tc-h2",
          description: "Contains an h2 element",
          assertion: 'Boolean(doc.querySelector("h2"))',
        },
      ],
    },
    feedback: {
      correct: "Card structure is complete.",
      incorrect: "Ensure you add an h2 inside the card.",
      hints: ["Add an <h2> element inside the .card div."],
    },
  };

  const idleState: ActivityInteractionState<string> = {
    status: "idle",
    attempts: 0,
    startedAt: Date.now(),
    response: '<div class="card"></div>',
    hintsRevealed: 0,
  };

  const sampleResult: ActivityValidationResult = {
    isValid: true,
    score: 1,
    feedbackMessage: "Card structure is complete.",
    testResults: [
      {
        id: "tc-h2",
        description: "Contains an h2 element",
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
        <HtmlExperienceRenderer
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
      attemptId: "act-html-test:attempt-1:1000",
      revision: 1,
      authoritative: true,
    };

    act(() => {
      root.render(
        <HtmlExperienceRenderer
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

  it("ignores evaluationRequest meant for a different activity", () => {
    const onRuntimeValidation = vi.fn();

    act(() => {
      root.render(
        <HtmlExperienceRenderer
          activity={mockActivity}
          state={idleState}
          onResponse={vi.fn()}
          evaluationRequest={{
            activityId: "different-activity",
            attemptId: "diff:attempt-1:1000",
            revision: 1,
            authoritative: true,
          }}
          onRuntimeValidation={onRuntimeValidation}
        />,
      );
    });

    expect(mockCheck).not.toHaveBeenCalled();
    expect(onRuntimeValidation).not.toHaveBeenCalled();
  });

  it("keeps renderer Check button non-authoritative (does NOT trigger onRuntimeValidation)", () => {
    const onRuntimeValidation = vi.fn();
    const onSubmit = vi.fn();

    act(() => {
      root.render(
        <HtmlExperienceRenderer
          activity={mockActivity}
          state={idleState}
          onResponse={vi.fn()}
          onSubmit={onSubmit}
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
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("supports retrying with fresh evaluationRequest after failure", () => {
    const onRuntimeValidation = vi.fn();

    act(() => {
      root.render(
        <HtmlExperienceRenderer
          activity={mockActivity}
          state={{ ...idleState, status: "evaluating" }}
          onResponse={vi.fn()}
          evaluationRequest={{
            activityId: mockActivity.id,
            attemptId: "act-html-test:attempt-1:1000",
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
      feedbackMessage: "Missing h2 element.",
      testResults: [{ id: "tc-h2", description: "Contains an h2 element", status: "failed" }],
    };

    act(() => {
      triggerTechnicalResult?.(failureResult);
    });

    expect(onRuntimeValidation).toHaveBeenCalledWith(failureResult);

    // Learner retries
    act(() => {
      root.render(
        <HtmlExperienceRenderer
          activity={mockActivity}
          state={{ ...idleState, status: "idle", attempts: 1 }}
          onResponse={vi.fn()}
          onRuntimeValidation={onRuntimeValidation}
        />,
      );
    });

    // Learner submits attempt 2
    act(() => {
      root.render(
        <HtmlExperienceRenderer
          activity={mockActivity}
          state={{ ...idleState, status: "evaluating", attempts: 1 }}
          onResponse={vi.fn()}
          evaluationRequest={{
            activityId: mockActivity.id,
            attemptId: "act-html-test:attempt-2:2000",
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

  it("renders pass/fail headline only once in TestResultsPanel without duplicating in ActivityFeedback", () => {
    act(() => {
      root.render(
        <HtmlExperienceRenderer
          activity={mockActivity}
          state={{
            ...idleState,
            status: "completed",
            attempts: 1,
            hintsRevealed: 1,
            validationResult: sampleResult,
          }}
          onResponse={vi.fn()}
        />,
      );
    });

    act(() => {
      triggerTechnicalResult?.(sampleResult);
    });

    const matches = Array.from(container.querySelectorAll("p")).filter(
      (el) => el.textContent?.trim() === "Card structure is complete.",
    );
    expect(matches).toHaveLength(1);
    expect(container.textContent).toContain("Add an <h2> element inside the .card div.");
  });
});

describe("LayerStack - Cumulative Stages & Mobile-First DOM Order", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  it("places controls before preview and preview before code in DOM order, and keeps HTML enabled across cumulative stages", () => {
    act(() => {
      root.render(<LayerStack />);
    });

    const controls = container.querySelector('[data-testid="layer-stack-controls"]');
    const preview = container.querySelector('[data-testid="layer-stack-preview"]');
    const code = container.querySelector('[data-testid="layer-stack-code"]');

    expect(controls).not.toBeNull();
    expect(preview).not.toBeNull();
    expect(code).not.toBeNull();

    expect(
      Boolean(
        controls!.compareDocumentPosition(preview!) & Node.DOCUMENT_POSITION_FOLLOWING,
      ),
    ).toBe(true);
    expect(
      Boolean(preview!.compareDocumentPosition(code!) & Node.DOCUMENT_POSITION_FOLLOWING),
    ).toBe(true);

    const htmlStageBtn = container.querySelector(
      '[data-stage="html"]',
    ) as HTMLButtonElement;
    const cssStageBtn = container.querySelector(
      '[data-stage="css"]',
    ) as HTMLButtonElement;
    const jsStageBtn = container.querySelector(
      '[data-stage="js"]',
    ) as HTMLButtonElement;

    expect(htmlStageBtn.getAttribute("aria-pressed")).toBe("true");

    // Clicking HTML Only again never disables HTML markup
    act(() => {
      htmlStageBtn.click();
    });
    const iframe = container.querySelector("iframe") as HTMLIFrameElement;
    expect(iframe.getAttribute("srcdoc")).toContain("Design System Token");

    // Switching to HTML + CSS includes both HTML markup and CSS styles
    act(() => {
      cssStageBtn.click();
    });
    expect(cssStageBtn.getAttribute("aria-pressed")).toBe("true");
    expect(iframe.getAttribute("srcdoc")).toContain("Design System Token");
    expect(iframe.getAttribute("srcdoc")).toContain("border-radius: 14px");

    // Switching to HTML + CSS + JS includes HTML, CSS, and script behavior
    act(() => {
      jsStageBtn.click();
    });
    expect(jsStageBtn.getAttribute("aria-pressed")).toBe("true");
    expect(iframe.getAttribute("srcdoc")).toContain("Design System Token");
    expect(iframe.getAttribute("srcdoc")).toContain("addEventListener");
  });
});

describe("ClosureSurface - Honest Lesson Completion Summary", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  it("shows honest All Checks Passed vs Lesson Complete states and a single Review Steps secondary action", () => {
    const onRestart = vi.fn();

    act(() => {
      root.render(
        <ClosureSurface
          lessonTitle="HTML Is Structure"
          coreTakeaway="HTML tells the browser what each piece of content is."
          completedActivityCount={7}
          totalActivityCount={7}
          verifiedCheckCount={2}
          totalInteractiveCount={4}
          firstTryCheckCount={1}
          onRestart={onRestart}
        />,
      );
    });

    expect(container.textContent).toContain("Lesson Complete");
    expect(container.textContent).not.toContain("All Checks Passed");
    expect(container.textContent).toContain(
      "HTML tells the browser what each piece of content is.",
    );
    expect(container.textContent).toContain("2 of 4 checks passed");
    expect(container.textContent).toContain("1 passed on first attempt");

    const reviewBtn = Array.from(container.querySelectorAll("button")).find((btn) =>
      btn.textContent?.includes("Review Steps"),
    ) as HTMLButtonElement;
    expect(reviewBtn).toBeDefined();
    act(() => {
      reviewBtn.click();
    });
    expect(onRestart).toHaveBeenCalledTimes(1);
  });
});

describe("Module 1 HTML Curriculum - Distinct Feedback & Clean Activities", () => {
  const htmlLessons = [
    lesson111,
    lesson112,
    lesson113,
    lesson114,
    lesson115,
    lesson116,
    lesson117,
    lesson118,
  ];

  it("has distinct correct and incorrect feedback messages across all 8 HTML lessons", () => {
    for (const lesson of htmlLessons) {
      for (const activity of lesson.activities) {
        expect(activity.id).not.toMatch(/visual-studio$/);
        expect(activity.id).not.toMatch(/replicate$/);
        if ("feedback" in activity && activity.feedback) {
          const { correct, incorrect } = activity.feedback as {
            correct?: string;
            incorrect?: string;
          };
          if (correct && incorrect) {
            expect(
              incorrect.trim(),
              `${lesson.id} -> ${activity.id} has identical correct and incorrect feedback`,
            ).not.toBe(correct.trim());
          }
        }
      }
    }
  });
});

