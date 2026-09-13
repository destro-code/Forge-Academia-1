import { describe, it, expect } from "vitest";
import { validateActivityV1Content } from "./content-schemas";
import { goldenLesson0CanonicalV1 } from "../golden-lesson-v1";
import type { ActivityV1 } from "../types-v1";

function findActivity(id: string): ActivityV1 {
  const activity = goldenLesson0CanonicalV1.activities.find((a) => a.id === id);
  if (!activity) throw new Error(`fixture activity ${id} not found`);
  return activity;
}

describe("validateActivityV1Content", () => {
  it("accepts the golden lesson's interactive-demo content (systemComponent variant)", () => {
    const result = validateActivityV1Content(findActivity("act-0-1-1-encounter"));
    expect(result.hasSchema).toBe(true);
    expect(result.isValid).toBe(true);
  });

  it("accepts the golden lesson's interactive-demo content (expectedStatus variant)", () => {
    const result = validateActivityV1Content(findActivity("act-0-1-1-verification"));
    expect(result.hasSchema).toBe(true);
    expect(result.isValid).toBe(true);
  });

  it("accepts the golden lesson's prediction content", () => {
    const result = validateActivityV1Content(findActivity("act-0-1-1-prediction"));
    expect(result.hasSchema).toBe(true);
    expect(result.isValid).toBe(true);
  });

  it("accepts the golden lesson's debug (investigation) content", () => {
    const result = validateActivityV1Content(findActivity("act-0-1-1-investigation"));
    expect(result.hasSchema).toBe(true);
    expect(result.isValid).toBe(true);
  });

  it("accepts the golden lesson's interactive-code content", () => {
    const result = validateActivityV1Content(findActivity("act-0-1-1-fix"));
    expect(result.hasSchema).toBe(true);
    expect(result.isValid).toBe(true);
  });

  it("rejects interactive-demo content missing both systemComponent and expectedStatus", () => {
    const activity: ActivityV1 = { ...findActivity("act-0-1-1-encounter"), content: {} };
    const result = validateActivityV1Content(activity);
    expect(result.hasSchema).toBe(true);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("rejects prediction content with fewer than two options", () => {
    const activity: ActivityV1 = {
      ...findActivity("act-0-1-1-prediction"),
      content: { options: [{ id: "only-one", text: "Not enough options" }] },
    };
    const result = validateActivityV1Content(activity);
    expect(result.isValid).toBe(false);
  });

  it("rejects debug content missing inspectionFields", () => {
    const activity: ActivityV1 = {
      ...findActivity("act-0-1-1-investigation"),
      content: { targetElement: "button#save-button" },
    };
    const result = validateActivityV1Content(activity);
    expect(result.isValid).toBe(false);
  });

  it("rejects interactive-code content missing starterCode", () => {
    const activity: ActivityV1 = { ...findActivity("act-0-1-1-fix"), content: {} };
    const result = validateActivityV1Content(activity);
    expect(result.isValid).toBe(false);
  });

  it("does not fail an activity type with no registered schema yet (e.g. reflection)", () => {
    const activity = findActivity("act-0-1-1-explanation");
    const result = validateActivityV1Content(activity);
    expect(result.hasSchema).toBe(false);
    expect(result.isValid).toBe(true);
  });
});

describe("validateActivityV1Content — Activity Coverage phase additions", () => {
  it("accepts valid multi-select, ordering, fill-blank, multiple-choice, output-prediction, and reading content", () => {
    const cases: ActivityV1[] = [
      {
        id: "a1", role: "test", type: "multi-select", title: "t",
        content: { question: "q", options: [{ id: "o1", text: "a" }, { id: "o2", text: "b" }] },
      },
      {
        id: "a2", role: "test", type: "ordering", title: "t",
        content: { prompt: "p", items: [{ id: "i1", text: "a" }, { id: "i2", text: "b" }] },
      },
      {
        id: "a3", role: "test", type: "fill-blank", title: "t",
        content: { prompt: "p", template: "{{x}}", blanks: [{ id: "x" }] },
      },
      {
        id: "a4", role: "test", type: "multiple-choice", title: "t",
        content: { question: "q", options: [{ id: "o1", text: "a" }, { id: "o2", text: "b" }] },
      },
      {
        id: "a5", role: "test", type: "output-prediction", title: "t",
        content: { code: "1+1", language: "javascript", prompt: "p" },
      },
      { id: "a6", role: "test", type: "intro", title: "t", content: { title: "T", hook: "H" } },
      { id: "a7", role: "test", type: "explanation", title: "t", content: { text: "body" } },
      { id: "a8", role: "test", type: "summary", title: "t", content: { takeaways: ["one"] } },
    ] as unknown as ActivityV1[];

    for (const activity of cases) {
      const result = validateActivityV1Content(activity);
      expect(result.hasSchema, `${activity.type} should have a registered schema`).toBe(true);
      expect(result.isValid, `${activity.type}: ${result.errors.join(", ")}`).toBe(true);
    }
  });

  it("rejects ordering content with fewer than two items", () => {
    const activity = {
      id: "a", role: "t", type: "ordering", title: "t",
      content: { prompt: "p", items: [{ id: "i1", text: "only one" }] },
    } as unknown as ActivityV1;
    expect(validateActivityV1Content(activity).isValid).toBe(false);
  });

  it("rejects summary content with no takeaways", () => {
    const activity = { id: "a", role: "t", type: "summary", title: "t", content: { takeaways: [] } } as unknown as ActivityV1;
    expect(validateActivityV1Content(activity).isValid).toBe(false);
  });
});
