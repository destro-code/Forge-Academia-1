import { describe, it, expect } from "vitest";
import { renderActivity, FallbackActivityRenderer } from "./registry";
import { IntroRenderer } from "./renderers/intro-renderer";
import { ExplanationRenderer } from "./renderers/explanation-renderer";
import { CodeExampleRenderer } from "./renderers/code-example-renderer";
import { VisualRenderer } from "./renderers/visual-renderer";
import { MultipleChoiceRenderer } from "./renderers/multiple-choice-renderer";
import { MultiSelectRenderer } from "./renderers/multi-select-renderer";
import { FillBlankRenderer } from "./renderers/fill-blank-renderer";
import { OrderingRenderer } from "./renderers/ordering-renderer";
import { OutputPredictionRenderer } from "./renderers/output-prediction-renderer";
import { InteractiveCodeRenderer } from "./renderers/interactive-code-renderer";
import { HtmlExperienceRenderer } from "./renderers/experiences/html-experience-renderer";
import { CssExperienceRenderer } from "./renderers/experiences/css-experience-renderer";
import { JavaScriptExperienceRenderer } from "./renderers/experiences/javascript-experience-renderer";
import { DebugRenderer } from "./renderers/debug-renderer";
import { ReflectionRenderer } from "./renderers/reflection-renderer";
import { SummaryRenderer } from "./renderers/summary-renderer";
import { CompletionRenderer } from "./renderers/completion-renderer";
import { JudgmentRenderer } from "./renderers/judgment-renderer";
import { evaluateActivityValidation } from "./validation";
import { canonicalProvider } from "@/lib/providers/content-provider";
import type {
  CanonicalActivity,
  IntroActivity,
  ExplanationActivity,
  CodeExampleActivity,
  VisualActivity,
  MultipleChoiceActivity,
  MultiSelectActivity,
  FillBlankActivity,
  OrderingActivity,
  OutputPredictionActivity,
  InteractiveCodeActivity,
  DebugActivity,
  ReflectionActivity,
  SummaryActivity,
  CompletionActivity,
} from "@/lib/curriculum/types";

describe("Phase 2A: Native Canonical Activity Renderer System", () => {
  describe("ActivityRendererRegistry (renderActivity)", () => {
    const requiredTypes: Array<{ type: CanonicalActivity["type"]; component: any }> = [
      { type: "intro", component: IntroRenderer },
      { type: "explanation", component: ExplanationRenderer },
      { type: "code-example", component: CodeExampleRenderer },
      { type: "visual", component: VisualRenderer },
      { type: "multiple-choice", component: MultipleChoiceRenderer },
      { type: "multi-select", component: MultiSelectRenderer },
      { type: "fill-blank", component: FillBlankRenderer },
      { type: "ordering", component: OrderingRenderer },
      { type: "output-prediction", component: OutputPredictionRenderer },
      { type: "interactive-code", component: InteractiveCodeRenderer },
      { type: "debug", component: DebugRenderer },
      { type: "reflection", component: ReflectionRenderer },
      { type: "summary", component: SummaryRenderer },
      { type: "completion", component: CompletionRenderer },
    ];

    it("resolves correct native renderers for all 14 canonical activity types via renderActivity", () => {
      for (const { type, component } of requiredTypes) {
        const mockActivity = { type, id: "test-id" } as any;
        const mockProps = { state: { status: "idle" } } as any;
        const element = renderActivity(mockActivity, mockProps);
        expect(element.type).toBe(component);
      }
    });

    it("safely falls back to FallbackActivityRenderer for unknown activity types", () => {
      const element = renderActivity({ type: "unknown-custom-type", id: "x" } as any, {} as any);
      expect(element.type).toBe(FallbackActivityRenderer);
    });

    describe("Specialized Experience Renderer Routing & Fallbacks", () => {
      const baseProps = {
        state: {
          status: "idle" as const,
          response: null,
          hintsRevealed: 0,
          attempts: 0,
          startedAt: Date.now(),
        },
        onResponse: () => {},
        onSubmit: () => {},
        onRetry: () => {},
        onContinue: () => {},
        onRevealHint: () => {},
      };

      it("routes interactive-code + html to HtmlExperienceRenderer with markup experience", () => {
        const htmlActivity: InteractiveCodeActivity = {
          id: "act-html-test",
          type: "interactive-code",
          intent: "application",
          objectiveIds: ["obj-test"],
          content: {
            language: "html",
            starterCode: "<h1>Hello</h1>",
          },
        };
        const element = renderActivity(htmlActivity, baseProps);
        expect(element.type).toBe(HtmlExperienceRenderer);
        expect(element.props.experience?.kind).toBe("markup");
      });

      it("routes interactive-code + css to CssExperienceRenderer with css experience", () => {
        const cssActivity: InteractiveCodeActivity = {
          id: "act-css-test",
          type: "interactive-code",
          intent: "application",
          objectiveIds: ["obj-test"],
          content: {
            language: "css",
            starterCode: ".box { display: flex; }",
          },
        };
        const element = renderActivity(cssActivity, baseProps);
        expect(element.type).toBe(CssExperienceRenderer);
        expect(element.props.experience?.kind).toBe("css");
      });

      it("routes interactive-code + javascript to JavaScriptExperienceRenderer with javascript experience", () => {
        const jsActivity: InteractiveCodeActivity = {
          id: "act-js-test",
          type: "interactive-code",
          intent: "application",
          objectiveIds: ["obj-test"],
          content: {
            language: "javascript",
            starterCode: "const x = 42;",
          },
        };
        const element = renderActivity(jsActivity, baseProps);
        expect(element.type).toBe(JavaScriptExperienceRenderer);
        expect(element.props.experience?.kind).toBe("javascript");
      });

      it("routes production HTML lesson activity (act-112-code-interactive) to HtmlExperienceRenderer", () => {
        const lesson = canonicalProvider.getLesson("lesson-1-1-2");
        expect(lesson).toBeDefined();
        const activity = lesson?.activities.find((a) => a.id === "act-112-code-interactive");
        expect(activity).toBeDefined();
        if (activity) {
          const element = renderActivity(activity, baseProps);
          expect(element.type).toBe(HtmlExperienceRenderer);
          expect(element.props.experience?.kind).toBe("markup");
        }
      });

      it("routes production CSS lesson activity (lesson-1-2-7 / lesson-css-flexbox) to CssExperienceRenderer", () => {
        const lesson = canonicalProvider.getLesson("lesson-1-2-7");
        expect(lesson).toBeDefined();
        const activity = lesson?.activities.find((a) => a.type === "interactive-code");
        expect(activity).toBeDefined();
        if (activity) {
          const element = renderActivity(activity, baseProps);
          expect(element.type).toBe(CssExperienceRenderer);
          expect(element.props.experience?.kind).toBe("css");
        }
      });

      it("routes production JavaScript lesson activity (lesson-1-3-1 / lesson-javascript-functions) to JavaScriptExperienceRenderer", () => {
        const lesson = canonicalProvider.getLesson("lesson-1-3-1");
        expect(lesson).toBeDefined();
        const activity = lesson?.activities.find((a) => a.type === "interactive-code");
        expect(activity).toBeDefined();
        if (activity) {
          const element = renderActivity(activity, baseProps);
          expect(element.type).toBe(JavaScriptExperienceRenderer);
          expect(element.props.experience?.kind).toBe("javascript");
        }
      });

      it("confirms existing non-code activity types route to their dedicated renderers", () => {
        const checks: Array<{ type: string; activity: any; expectedRenderer: any }> = [
          {
            type: "visual",
            activity: { id: "v-1", type: "visual", content: {} },
            expectedRenderer: VisualRenderer,
          },
          {
            type: "output-prediction",
            activity: { id: "op-1", type: "output-prediction", content: {} },
            expectedRenderer: OutputPredictionRenderer,
          },
          {
            type: "multiple-choice",
            activity: { id: "mc-1", type: "multiple-choice", content: { options: [] } },
            expectedRenderer: MultipleChoiceRenderer,
          },
          {
            type: "debug",
            activity: { id: "db-1", type: "debug", content: { buggyCode: "x" } },
            expectedRenderer: DebugRenderer,
          },
          {
            type: "reflection",
            activity: { id: "rf-1", type: "reflection", content: {} },
            expectedRenderer: ReflectionRenderer,
          },
          {
            type: "summary",
            activity: { id: "sm-1", type: "summary", content: {} },
            expectedRenderer: SummaryRenderer,
          },
          {
            type: "completion",
            activity: { id: "cp-1", type: "completion", content: {} },
            expectedRenderer: CompletionRenderer,
          },
          {
            type: "judgment",
            activity: {
              id: "jg-1",
              type: "judgment",
              content: {
                prompt: "Explain the architecture choice.",
                modelAnswer: {
                  summary: "Valid summary",
                  detailedAnalysis: "Valid detailed analysis",
                  keyTradeoffs: ["Tradeoff A"],
                },
                evaluationRubric: [
                  { id: "r1", label: "Clarity", description: "Clear explanation", points: 1 },
                ],
              },
            },
            expectedRenderer: JudgmentRenderer,
          },
        ];

        for (const { activity, expectedRenderer } of checks) {
          const element = renderActivity(activity, baseProps);
          expect(element.type).toBe(expectedRenderer);
        }
      });

      it("safely falls back to InteractiveCodeRenderer when language is unsupported (e.g. typescript, python)", () => {
        const tsActivity = {
          id: "act-ts-test",
          type: "interactive-code",
          content: { language: "typescript", starterCode: "const n: number = 5;" },
        } as any;
        const element = renderActivity(tsActivity, baseProps);
        expect(element.type).toBe(InteractiveCodeRenderer);

        const pyActivity = {
          id: "act-py-test",
          type: "interactive-code",
          content: { language: "python", starterCode: "print('hi')" },
        } as any;
        const pyElement = renderActivity(pyActivity, baseProps);
        expect(pyElement.type).toBe(InteractiveCodeRenderer);
      });

      it("safely falls back to InteractiveCodeRenderer when explicit experience is unimplemented (e.g. react)", () => {
        const reactActivity = {
          id: "act-react-test",
          type: "interactive-code",
          experience: { kind: "react", language: "tsx", editor: { starterSource: "" } },
          content: { language: "tsx", starterCode: "export default () => null;" },
        } as any;
        const element = renderActivity(reactActivity, baseProps);
        expect(element.type).toBe(InteractiveCodeRenderer);
      });

      it("safely falls back to InteractiveCodeRenderer when content is unresolvable or missing starterCode", () => {
        const unresolvableActivity = {
          id: "act-missing-content",
          type: "interactive-code",
          content: { language: "html" }, // missing starterCode
        } as any;
        const element = renderActivity(unresolvableActivity, baseProps);
        expect(element.type).toBe(InteractiveCodeRenderer);
      });
    });
  });

  describe("Declarative Validation Engine", () => {
    it("evaluates exact-match validation correctly", () => {
      const activity: MultipleChoiceActivity = {
        id: "act-mc-1",
        type: "multiple-choice",
        intent: "retrieval",
        objectiveIds: ["obj-test"],
        content: {
          question: "What is HTML?",
          options: [
            { id: "opt-a", text: "HyperText Markup Language" },
            { id: "opt-b", text: "High Tech Modern Language" },
          ],
        },
        validation: {
          type: "exact-match",
          expected: "opt-a",
        },
        feedback: {
          correct: "Correct acronym!",
          incorrect: "Incorrect choice.",
        },
      };

      const correctResult = evaluateActivityValidation(activity, "opt-a");
      expect(correctResult.isValid).toBe(true);
      expect(correctResult.feedbackMessage).toBe("Correct acronym!");

      const incorrectResult = evaluateActivityValidation(activity, "opt-b");
      expect(incorrectResult.isValid).toBe(false);
      expect(incorrectResult.feedbackMessage).toBe("Incorrect choice.");
    });

    it("evaluates one-of validation correctly", () => {
      const activity: CanonicalActivity = {
        id: "act-one-of",
        type: "multiple-choice",
        intent: "retrieval",
        objectiveIds: ["obj-test"],
        content: { question: "Pick a valid truthy value", options: [] },
        validation: {
          type: "one-of",
          validOptions: ["true", "1", "yes"],
          caseSensitive: false,
        },
      };

      expect(evaluateActivityValidation(activity, "TRUE").isValid).toBe(true);
      expect(evaluateActivityValidation(activity, "yes").isValid).toBe(true);
      expect(evaluateActivityValidation(activity, "false").isValid).toBe(false);
    });

    it("evaluates multi-match validation with ignoreOrder", () => {
      const activity: MultiSelectActivity = {
        id: "act-ms-1",
        type: "multi-select",
        intent: "recognition",
        objectiveIds: ["obj-test"],
        content: {
          question: "Select all semantic elements",
          options: [
            { id: "header", text: "<header>" },
            { id: "nav", text: "<nav>" },
            { id: "div", text: "<div>" },
          ],
        },
        validation: {
          type: "multi-match",
          expected: ["header", "nav"],
          ignoreOrder: true,
        },
      };

      // In-order matching
      expect(evaluateActivityValidation(activity, ["header", "nav"]).isValid).toBe(true);
      // Reversed order matching
      expect(evaluateActivityValidation(activity, ["nav", "header"]).isValid).toBe(true);
      // Incomplete
      expect(evaluateActivityValidation(activity, ["header"]).isValid).toBe(false);
      // Extra incorrect item
      expect(evaluateActivityValidation(activity, ["header", "nav", "div"]).isValid).toBe(false);
    });

    it("evaluates ordering validation correctly", () => {
      const activity: OrderingActivity = {
        id: "act-ord-1",
        type: "ordering",
        intent: "application",
        objectiveIds: ["obj-test"],
        content: {
          prompt: "Arrange the box model from innermost to outermost",
          items: [
            { id: "content", text: "Content", initialOrder: 3 },
            { id: "padding", text: "Padding", initialOrder: 1 },
            { id: "border", text: "Border", initialOrder: 2 },
            { id: "margin", text: "Margin", initialOrder: 0 },
          ],
        },
        validation: {
          type: "ordering",
          correctSequence: ["content", "padding", "border", "margin"],
        },
      };

      const correctSeq = ["content", "padding", "border", "margin"];
      expect(evaluateActivityValidation(activity, correctSeq).isValid).toBe(true);

      const wrongSeq = ["margin", "border", "padding", "content"];
      expect(evaluateActivityValidation(activity, wrongSeq).isValid).toBe(false);
    });

    it("evaluates code-output validation correctly", () => {
      const activity: OutputPredictionActivity = {
        id: "act-pred-1",
        type: "output-prediction",
        intent: "prediction",
        objectiveIds: ["obj-test"],
        content: {
          code: "console.log(typeof null);",
          prompt: "What is output?",
          language: "javascript",
        },
        validation: {
          type: "code-output",
          expectedOutput: "object",
          matchType: "exact",
        },
      };

      expect(evaluateActivityValidation(activity, "object").isValid).toBe(true);
      expect(evaluateActivityValidation(activity, " null ").isValid).toBe(false);
    });

    it("passes validation automatically for activities without validation requirements", () => {
      const introAct: IntroActivity = {
        id: "act-intro-1",
        type: "intro",
        intent: "orientation",
        objectiveIds: ["obj-test"],
        content: {
          title: "Introduction to HTML",
          hook: "Let's build the web.",
        },
      };

      const result = evaluateActivityValidation(introAct, undefined);
      expect(result.isValid).toBe(true);
    });
  });

  describe("Golden Lessons Compatibility with Canonical Renderers", () => {
    const goldenLessonIds = [
      "lesson-0-1-1",
      "lesson-1-1-2",
      "lesson-1-2-7",
      "lesson-1-3-1",
      "lesson-0-2-5",
    ];

    it("resolves native renderers for every activity across all golden lessons", () => {
      for (const lessonId of goldenLessonIds) {
        const lesson = canonicalProvider.getLesson(lessonId);
        expect(lesson).toBeDefined();
        if (!lesson) continue;

        expect(lesson.activities.length).toBeGreaterThan(0);

        for (const activity of lesson.activities) {
          const element = renderActivity(activity, { state: { status: "idle" } } as any);
          expect(element).toBeDefined();
          expect(element.type).not.toBe(FallbackActivityRenderer);
        }
      }
    });

    it("verifies interactive activities in golden lessons have proper validation configs", () => {
      for (const lessonId of goldenLessonIds) {
        const lesson = canonicalProvider.getLesson(lessonId);
        if (!lesson) continue;

        for (const activity of lesson.activities) {
          if (
            activity.type === "multiple-choice" ||
            activity.type === "multi-select" ||
            activity.type === "fill-blank" ||
            activity.type === "ordering" ||
            activity.type === "output-prediction"
          ) {
            expect(activity.validation).toBeDefined();
            // Validation evaluator must handle it without error
            const dummyResult = evaluateActivityValidation(activity, "");
            expect(dummyResult).toHaveProperty("isValid");
          }
        }
      }
    });
  });
});
