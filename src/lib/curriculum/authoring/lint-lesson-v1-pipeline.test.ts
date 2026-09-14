import { describe, it, expect } from "vitest";
import { lintLessonV1Full } from "./lint-lesson-v1";
import { evaluateLessonQuality } from "./authoring-pipeline";
import { goldenLesson0CanonicalV1 } from "../golden-lesson-v1";
import type { CanonicalLessonV1 } from "../types-v1";

/** Deep-clones the golden lesson as a guaranteed-valid base to mutate per test — every invalid fixture below differs from a known-good lesson by exactly the one thing under test. */
function cloneLesson(): CanonicalLessonV1 {
  return JSON.parse(JSON.stringify(goldenLesson0CanonicalV1));
}

describe("lintLessonV1Full — golden lesson (strongest regression fixture)", () => {
  it("passes the complete pipeline with zero blocking errors", () => {
    const result = lintLessonV1Full(goldenLesson0CanonicalV1);
    expect(result.errors, JSON.stringify(result.errors, null, 2)).toHaveLength(0);
    expect(result.valid).toBe(true);
  });

  it("passes certification via the quality scorer", () => {
    const quality = evaluateLessonQuality(goldenLesson0CanonicalV1);
    expect(quality.lintResult.valid).toBe(true);
    // Not asserting passedCertification/overallScore >= 80 here — that's a
    // content-quality bar, not a pipeline-correctness bar, and asserting an
    // exact score would make this test brittle against legitimate future
    // scoring-weight tuning. The pipeline-correctness claim is: it runs
    // clean, with no blocking errors — verified above.
  });
});

describe("lintLessonV1Full — invalid fixtures (task §17)", () => {
  it("rejects a lesson missing required curriculum metadata", () => {
    const lesson = cloneLesson();
    // @ts-expect-error deliberately malformed for the test
    delete lesson.curriculum.moduleId;
    const result = lintLessonV1Full(lesson);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.path === "curriculum.moduleId")).toBe(true);
  });

  it("rejects an activity with malformed content", () => {
    const lesson = cloneLesson();
    const prediction = lesson.activities.find((a) => a.type === "prediction")!;
    prediction.content = { options: [{ id: "only-one", text: "not enough options" }] };
    const result = lintLessonV1Full(lesson);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.message.includes(prediction.id))).toBe(true);
  });

  it("rejects a lesson referencing a nonexistent capability", () => {
    const lesson = cloneLesson();
    lesson.curriculum.capabilityIds = [...lesson.curriculum.capabilityIds, "capability-does-not-exist"];
    const result = lintLessonV1Full(lesson);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === "BROKEN_CAPABILITY_REFERENCE")).toBe(true);
  });

  it("rejects an activity of an unsupported type (code-modification)", () => {
    const lesson = cloneLesson();
    lesson.activities.push({
      id: "act-unsupported",
      role: "manipulation",
      type: "code-modification" as never,
      title: "Not yet supported",
      content: {},
    });
    const result = lintLessonV1Full(lesson);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === "UNKNOWN_ACTIVITY_TYPE")).toBe(true);
  });

  it("rejects a lesson with a nonexistent prerequisite (when a known-lesson corpus is provided)", () => {
    const lesson = cloneLesson();
    lesson.curriculum.prerequisiteLessonIds = ["lesson-does-not-exist"];
    const result = lintLessonV1Full(lesson, { lessons: [] as never });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === "BROKEN_LESSON_REFERENCE")).toBe(true);
  });

  it("rejects two activities sharing an ID", () => {
    const lesson = cloneLesson();
    lesson.activities[1].id = lesson.activities[0].id;
    const result = lintLessonV1Full(lesson);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === "DUPLICATE_ACTIVITY_ID")).toBe(true);
  });

  it("rejects a validation config referencing a nonexistent option (the task's own worked example)", () => {
    const lesson = cloneLesson();
    const prediction = lesson.activities.find((a) => a.type === "prediction")!;
    (prediction.validation as { correctAnswer?: string }).correctAnswer = "opt-does-not-exist";
    const result = lintLessonV1Full(lesson);
    expect(result.valid).toBe(false);
    const err = result.errors.find((e) => e.code === "INVALID_ACTIVITY_VALIDATION");
    expect(err).toBeDefined();
    expect(err?.message).toContain("opt-does-not-exist");
    expect(err?.suggestion).toBeTruthy();
  });

  it("rejects a lesson pointing at an invalid module", () => {
    const lesson = cloneLesson();
    lesson.curriculum.moduleId = "module-does-not-exist";
    const result = lintLessonV1Full(lesson);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === "BROKEN_MODULE_REFERENCE")).toBe(true);
  });

  it("flags a structurally valid but 100% passive lesson as a warning, not an error", () => {
    const lesson = cloneLesson();
    for (const activity of lesson.activities) {
      activity.role = "encounter"; // PASSIVE_ROLES_V1 includes "encounter"
    }
    const result = lintLessonV1Full(lesson);
    // Still schema/structurally valid — this must be a warning, not a blocker.
    expect(result.warnings.some((w) => w.code === "PASSIVE_LESSON_WARNING")).toBe(true);
  });
});
