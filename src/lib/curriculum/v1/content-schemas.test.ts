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
