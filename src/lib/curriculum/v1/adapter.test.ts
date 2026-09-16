import { describe, it, expect } from "vitest";
import { adaptLessonV1ToLayer1 } from "./adapter";
import { goldenLesson0CanonicalV1 } from "../golden-lesson-v1";

describe("adaptLessonV1ToLayer1 — golden lesson", () => {
  const adapted = adaptLessonV1ToLayer1(goldenLesson0CanonicalV1);

  it("produces one Layer 1 activity per V1 activity, in order", () => {
    expect(adapted.lesson.activities).toHaveLength(goldenLesson0CanonicalV1.activities.length);
    expect(adapted.lesson.activities.map((a) => a.id)).toEqual(
      goldenLesson0CanonicalV1.activities.map((a) => a.id),
    );
  });

  it("classifies the encounter interactive-demo (systemComponent) as delegate-layer1", () => {
    expect(adapted.renderPlan["act-0-1-1-encounter"]).toBe("delegate-layer1");
    const activity = adapted.lesson.activities.find((a) => a.id === "act-0-1-1-encounter");
    expect(activity?.type).toBe("visual");
    if (activity?.type === "visual") {
      expect(activity.content.interactive?.kind).toBe("account-settings");
    }
  });

  it("classifies the verification interactive-demo (expectedStatus only) as generic-demo", () => {
    expect(adapted.renderPlan["act-0-1-1-verification"]).toBe("generic-demo");
  });

  it("classifies prediction as its own render kind, backed by a multiple-choice Layer 1 shape for session bookkeeping", () => {
    expect(adapted.renderPlan["act-0-1-1-prediction"]).toBe("prediction");
    const activity = adapted.lesson.activities.find((a) => a.id === "act-0-1-1-prediction");
    expect(activity?.type).toBe("multiple-choice");
    if (activity?.type === "multiple-choice") {
      expect(activity.content.options.map((o) => o.id)).toEqual([
        "opt-no-listener",
        "opt-css-blocking",
        "opt-server-down",
      ]);
      expect(activity.validation).toEqual({ type: "one-of", validOptions: ["opt-no-listener"] });
    }
  });

  it("classifies debug (investigation) as its own render kind, never delegate-layer1", () => {
    expect(adapted.renderPlan["act-0-1-1-investigation"]).toBe("investigation");
    expect(adapted.originalActivities["act-0-1-1-investigation"].content).toEqual({
      targetElement: "button#save-button",
      inspectionFields: ["attributes", "eventListeners", "computedStyles"],
    });
  });

  it("classifies interactive-code as delegate-layer1 with a tests validation config carried over", () => {
    expect(adapted.renderPlan["act-0-1-1-fix"]).toBe("delegate-layer1");
    const activity = adapted.lesson.activities.find((a) => a.id === "act-0-1-1-fix");
    expect(activity?.type).toBe("interactive-code");
    if (activity?.type === "interactive-code") {
      expect(activity.content.starterCode).toContain("querySelector");
      expect(activity.validation?.type).toBe("tests");
    }
  });

  it("classifies reflection as delegate-layer1", () => {
    expect(adapted.renderPlan["act-0-1-1-explanation"]).toBe("delegate-layer1");
    const activity = adapted.lesson.activities.find((a) => a.id === "act-0-1-1-explanation");
    expect(activity?.type).toBe("reflection");
  });

  it("classifies judgment (transfer) as generic-demo, not Layer 1's strict JudgmentRenderer", () => {
    expect(adapted.renderPlan["act-0-1-1-transfer"]).toBe("generic-demo");
  });

  it("preserves the original V1 activity content for every non-delegated ID", () => {
    for (const [id, kind] of Object.entries(adapted.renderPlan)) {
      if (kind !== "delegate-layer1") {
        expect(adapted.originalActivities[id]).toBeDefined();
      }
    }
  });

  it("synthesizes lesson-level objectives from the V1 capability declarations", () => {
    expect(adapted.lesson.objectives.length).toBeGreaterThan(0);
    expect(adapted.lesson.objectives[0].id).toBe(goldenLesson0CanonicalV1.learning.primaryCapability.id);
  });

  it("throws a clear error for an activity type with no registered adapter", () => {
    const brokenLesson = {
      ...goldenLesson0CanonicalV1,
      activities: [
        {
          id: "act-unsupported",
          role: "encounter",
          type: "code-modification",
          title: "Unsupported",
          content: {},
        },
      ],
    } as typeof goldenLesson0CanonicalV1;
    expect(() => adaptLessonV1ToLayer1(brokenLesson)).toThrow(/no adapter registered/);
  });
});

describe("adaptLessonV1ToLayer1 — Activity Coverage phase additions", () => {
  function lessonWith(activity: Record<string, unknown>) {
    return { ...goldenLesson0CanonicalV1, activities: [activity] } as typeof goldenLesson0CanonicalV1;
  }

  it("adapts multi-select with a multi-match validation config", () => {
    const lesson = lessonWith({
      id: "a", role: "t", type: "multi-select", title: "t",
      content: { question: "q", options: [{ id: "o1", text: "a" }, { id: "o2", text: "b" }] },
      validation: { expected: ["o1", "o2"], ignoreOrder: true },
    });
    const { renderPlan, lesson: adapted } = adaptLessonV1ToLayer1(lesson);
    expect(renderPlan["a"]).toBe("multi-select");
    const activity = adapted.activities[0];
    expect(activity.type).toBe("multi-select");
    if (activity.type === "multi-select") expect(activity.validation).toEqual({ type: "multi-match", expected: ["o1", "o2"], ignoreOrder: true });
  });

  it("adapts ordering with an ordering validation config", () => {
    const lesson = lessonWith({
      id: "a", role: "t", type: "ordering", title: "t",
      content: { prompt: "p", items: [{ id: "i1", text: "a" }, { id: "i2", text: "b" }] },
      validation: { correctSequence: ["i1", "i2"] },
    });
    const { renderPlan, lesson: adapted } = adaptLessonV1ToLayer1(lesson);
    expect(renderPlan["a"]).toBe("ordering");
    const activity = adapted.activities[0];
    if (activity.type === "ordering") expect(activity.validation).toEqual({ type: "ordering", correctSequence: ["i1", "i2"] });
  });

  it("adapts fill-blank with an exact-match validation config", () => {
    const lesson = lessonWith({
      id: "a", role: "t", type: "fill-blank", title: "t",
      content: { prompt: "p", template: "{{x}}", blanks: [{ id: "x" }] },
      validation: { expected: "answer" },
    });
    const { renderPlan, lesson: adapted } = adaptLessonV1ToLayer1(lesson);
    expect(renderPlan["a"]).toBe("fill-blank");
    const activity = adapted.activities[0];
    if (activity.type === "fill-blank") expect(activity.validation).toEqual({ type: "exact-match", expected: "answer", caseSensitive: undefined });
  });

  it("adapts multiple-choice and output-prediction as delegate-layer1 with correct Layer 1 type names", () => {
    const mcLesson = lessonWith({
      id: "a", role: "t", type: "multiple-choice", title: "t",
      content: { question: "q", options: [{ id: "o1", text: "a" }, { id: "o2", text: "b" }] },
      validation: { correctAnswer: "o1" },
    });
    const mc = adaptLessonV1ToLayer1(mcLesson);
    expect(mc.renderPlan["a"]).toBe("delegate-layer1");
    expect(mc.lesson.activities[0].type).toBe("multiple-choice");

    const opLesson = lessonWith({
      id: "a", role: "t", type: "output-prediction", title: "t",
      content: { code: "1+1", language: "javascript", prompt: "p" },
      validation: { expected: "2" },
    });
    const op = adaptLessonV1ToLayer1(opLesson);
    expect(op.renderPlan["a"]).toBe("delegate-layer1");
    expect(op.lesson.activities[0].type).toBe("output-prediction");
  });

  it("adapts intro, explanation, summary, visual, and completion without validation configs (non-graded)", () => {
    for (const [type, content] of [
      ["intro", { title: "T", hook: "H" }],
      ["explanation", { text: "body" }],
      ["summary", { takeaways: ["one"] }],
      ["visual", { title: "T", description: "d" }],
      ["completion", { title: "T", message: "m" }],
    ] as const) {
      const lesson = lessonWith({ id: "a", role: "t", type, title: "t", content });
      const { renderPlan, lesson: adapted } = adaptLessonV1ToLayer1(lesson);
      expect(renderPlan["a"]).toBe("delegate-layer1");
      expect(adapted.activities[0].type).toBe(type);
    }
  });

  it("still throws for code-modification — the one genuine remaining gap", () => {
    const lesson = lessonWith({ id: "a", role: "t", type: "code-modification", title: "t", content: {} });
    expect(() => adaptLessonV1ToLayer1(lesson)).toThrow(/code-modification/);
  });
});

describe("adaptLessonV1ToLayer1 — interactive-code language passthrough (runtime verification fix)", () => {
  function lessonWith(activity: Record<string, unknown>) {
    return { ...goldenLesson0CanonicalV1, activities: [activity] } as typeof goldenLesson0CanonicalV1;
  }

  it("defaults to javascript when no language is authored (golden lesson's own shape, unaffected by the fix)", () => {
    const lesson = lessonWith({
      id: "a", role: "t", type: "interactive-code", title: "t",
      content: { starterCode: "console.log(1);" },
    });
    const { lesson: adapted } = adaptLessonV1ToLayer1(lesson);
    const activity = adapted.activities[0];
    if (activity.type === "interactive-code") expect(activity.content.language).toBe("javascript");
  });

  it("passes through an authored html language instead of hardcoding javascript (the actual bug fix)", () => {
    const lesson = lessonWith({
      id: "a", role: "t", type: "interactive-code", title: "t",
      content: { starterCode: "<div></div>", language: "html" },
    });
    const { lesson: adapted } = adaptLessonV1ToLayer1(lesson);
    const activity = adapted.activities[0];
    if (activity.type === "interactive-code") expect(activity.content.language).toBe("html");
  });
});
