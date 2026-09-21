import { describe, it, expect } from "vitest";
import { resolveLessonLayer } from "./lesson-resolver";

describe("resolveLessonLayer", () => {
  it("resolves to v1 when a V1 lesson is present, regardless of the other layers", () => {
    expect(
      resolveLessonLayer({ v1Lesson: { id: "x" }, layer1Lesson: { id: "x" }, legacyLesson: { id: "x" } }),
    ).toBe("v1");
  });

  it("resolves to v1-error when a V1 error exists, blocking fallback to layer1 or legacy", () => {
    expect(
      resolveLessonLayer({
        v1Lesson: undefined,
        v1Error: { errors: ["Invalid property"] },
        layer1Lesson: { id: "x" },
        legacyLesson: { id: "x" },
      }),
    ).toBe("v1-error");
  });

  it("resolves to v1-error when an invalid V1 target exists, blocking fallback to layer1 or legacy", () => {
    expect(
      resolveLessonLayer({
        v1Lesson: undefined,
        isV1Target: true,
        layer1Lesson: { id: "x" },
        legacyLesson: { id: "x" },
      }),
    ).toBe("v1-error");
  });

  it("resolves to layer1 when no V1 lesson exists but a Layer 1 canonical lesson does", () => {
    expect(
      resolveLessonLayer({ v1Lesson: undefined, layer1Lesson: { id: "x" }, legacyLesson: { id: "x" } }),
    ).toBe("layer1");
  });

  it("resolves to legacy when only a legacy lesson exists", () => {
    expect(
      resolveLessonLayer({ v1Lesson: undefined, layer1Lesson: undefined, legacyLesson: { id: "x" } }),
    ).toBe("legacy");
  });

  it("resolves to not-found when no layer has the lesson", () => {
    expect(
      resolveLessonLayer({ v1Lesson: undefined, layer1Lesson: undefined, legacyLesson: undefined }),
    ).toBe("not-found");
  });
});
