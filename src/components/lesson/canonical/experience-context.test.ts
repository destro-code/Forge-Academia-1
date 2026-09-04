import { describe, expect, it } from "vitest";
import { deriveExperienceContext } from "./experience-context";
import type { CanonicalActivity } from "@/lib/curriculum/types";

const activity = (intent: CanonicalActivity["intent"], type: CanonicalActivity["type"] = "multiple-choice") => ({ id: "test", intent, type, objectiveIds: [], content: {} } as CanonicalActivity);

describe("deriveExperienceContext", () => {
  it("prioritizes prediction intent over question type", () => {
    expect(deriveExperienceContext(activity("prediction"), 2, 4).stage).toBe("predict");
  });
  it("maps debugging to investigation", () => {
    expect(deriveExperienceContext(activity("debugging", "debug"), 1, 2).surface).toBe("investigation");
  });
  it("uses a deterministic generic fallback", () => {
    expect(deriveExperienceContext(activity("application"), 1, 1)).toEqual(deriveExperienceContext(activity("application"), 1, 1));
  });
});
