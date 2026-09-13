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
