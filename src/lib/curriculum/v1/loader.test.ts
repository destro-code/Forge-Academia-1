import { describe, it, expect } from "vitest";
import {
  buildV1LessonRegistry,
  loadV1Lesson,
  getV1LessonById,
  listV1LessonIds,
  getLessonV1ValidationError,
  isV1LessonTarget,
  reloadV1LessonRegistry,
} from "./loader";
import { goldenLesson0CanonicalV1 } from "../golden-lesson-v1";

describe("buildV1LessonRegistry (pure, no glob dependency)", () => {
  it("registers valid lesson sources by ID", () => {
    const { registry, invalid, validationErrors } = buildV1LessonRegistry([goldenLesson0CanonicalV1]);
    expect(invalid).toHaveLength(0);
    expect(validationErrors.size).toBe(0);
    expect(registry.get("lesson-0-1-1")).toBeDefined();
    expect(registry.get("lesson-0-1-1")?.identity.title).toBe(goldenLesson0CanonicalV1.identity.title);
  });

  it("excludes and reports invalid sources with detailed errors", () => {
    const malformed = { id: "lesson-bad", title: "Malformed" }; // fails safeValidateLessonV1
    const { registry, invalid, validationErrors, discoveredLessonIds } = buildV1LessonRegistry([
      goldenLesson0CanonicalV1,
      malformed,
    ]);
    expect(registry.size).toBe(1);
    expect(invalid).toHaveLength(1);
    expect(invalid[0].lessonId).toBe("lesson-bad");
    expect(invalid[0].errors.length).toBeGreaterThan(0);
    expect(validationErrors.get("lesson-bad")).toBeDefined();
    expect(discoveredLessonIds.has("lesson-bad")).toBe(true);
  });

  it("produces an empty registry for an empty source list", () => {
    const { registry, invalid } = buildV1LessonRegistry([]);
    expect(registry.size).toBe(0);
    expect(invalid).toHaveLength(0);
  });
});

describe("loadV1Lesson / getV1LessonById (registry-backed, includes the golden fixture)", () => {
  it("loads the golden lesson by ID", () => {
    const result = loadV1Lesson("lesson-0-1-1");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.lesson.id).toBe("lesson-0-1-1");
    }
  });

  it("getV1LessonById returns the lesson directly", () => {
    const lesson = getV1LessonById("lesson-0-1-1");
    expect(lesson?.id).toBe("lesson-0-1-1");
  });

  it("reports a clear not-found result for a missing lesson ID", () => {
    const result = loadV1Lesson("lesson-does-not-exist");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("not-found");
      expect(result.lessonId).toBe("lesson-does-not-exist");
    }
  });

  it("getV1LessonById returns undefined for a missing lesson ID", () => {
    expect(getV1LessonById("lesson-does-not-exist")).toBeUndefined();
  });

  it("lists at least the golden lesson's ID", () => {
    expect(listV1LessonIds()).toContain("lesson-0-1-1");
  });

  it("isV1LessonTarget returns true for valid registered lessons", () => {
    expect(isV1LessonTarget("lesson-0-1-1")).toBe(true);
  });

  it("isV1LessonTarget returns false for non-existent lessons", () => {
    expect(isV1LessonTarget("completely-unknown-lesson-id")).toBe(false);
  });

  it("reloadV1LessonRegistry resets cache without throwing", () => {
    expect(() => reloadV1LessonRegistry()).not.toThrow();
    expect(isV1LessonTarget("lesson-0-1-1")).toBe(true);
  });
});

