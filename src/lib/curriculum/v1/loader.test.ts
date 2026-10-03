import { describe, it, expect, beforeEach } from "vitest";
import {
  buildV1LessonRegistry,
  loadV1Lesson,
  getV1LessonById,
  listV1LessonIds,
  getLessonV1ValidationError,
  isV1LessonTarget,
  reloadV1LessonRegistry,
  DuplicateLessonIdError,
  extractLessonIdFromPath,
} from "./loader";
import { goldenLesson0CanonicalV1 } from "../golden-lesson-v1";
import { adaptLessonV1ToLayer1 } from "./adapter";

describe("V1 Loader — Pure Registry Builder (buildV1LessonRegistry)", () => {
  it("registers valid lesson sources by ID", () => {
    const { registry, invalid, validationErrors } = buildV1LessonRegistry(
      [goldenLesson0CanonicalV1],
      { throwOnDuplicate: false },
    );
    expect(invalid).toHaveLength(0);
    expect(validationErrors.size).toBe(0);
    expect(registry.get("lesson-0-1-1")).toBeDefined();
    expect(registry.get("lesson-0-1-1")?.identity.title).toBe(
      goldenLesson0CanonicalV1.identity.title,
    );
  });

  it("produces an empty registry for an empty source list", () => {
    const { registry, invalid } = buildV1LessonRegistry([]);
    expect(registry.size).toBe(0);
    expect(invalid).toHaveLength(0);
  });

  it("extracts lesson ID cleanly from filename paths", () => {
    expect(extractLessonIdFromPath("src/data/canonical/lessons-v1/lesson-1-1-1.json")).toBe(
      "lesson-1-1-1",
    );
    expect(extractLessonIdFromPath("/lesson-0-1-1.json")).toBe("lesson-0-1-1");
    expect(extractLessonIdFromPath("lesson-bad.txt")).toBeUndefined();
  });
});

describe("V1 Loader — Collision & Validation Hardening (Task Requirements)", () => {
  it("1. duplicate ID fails loudly by throwing DuplicateLessonIdError", () => {
    const duplicateA = { ...goldenLesson0CanonicalV1 };
    const duplicateB = {
      ...goldenLesson0CanonicalV1,
      identity: { ...goldenLesson0CanonicalV1.identity, title: "Duplicate Clashing Lesson" },
    };

    expect(() =>
      buildV1LessonRegistry([
        { filePath: "src/data/canonical/lessons-v1/lesson-0-1-1.json", source: duplicateA },
        { filePath: "src/data/canonical/lessons-v1/clashing.json", source: duplicateB },
      ]),
    ).toThrow(DuplicateLessonIdError);
  });

  it("1b. duplicate ID in non-throwing mode rejects both and never silently overwrites registry", () => {
    const duplicateA = { ...goldenLesson0CanonicalV1 };
    const duplicateB = {
      ...goldenLesson0CanonicalV1,
      identity: { ...goldenLesson0CanonicalV1.identity, title: "Duplicate Clashing Lesson" },
    };

    const { registry, invalid, validationErrors } = buildV1LessonRegistry(
      [
        { filePath: "src/data/canonical/lessons-v1/lesson-0-1-1.json", source: duplicateA },
        { filePath: "src/data/canonical/lessons-v1/clashing.json", source: duplicateB },
      ],
      { throwOnDuplicate: false },
    );

    // Never silently overwrites or serves collided ID
    expect(registry.has("lesson-0-1-1")).toBe(false);
    expect(invalid.length).toBeGreaterThanOrEqual(1);
    expect(validationErrors.get("lesson-0-1-1")?.errors[0]).toMatch(
      /Duplicate lesson ID detected/i,
    );
  });

  it("2. filename/ID mismatch fails validation and is excluded from registry", () => {
    const lesson = { ...goldenLesson0CanonicalV1, id: "lesson-actual-id" };

    const { registry, invalid, validationErrors } = buildV1LessonRegistry([
      {
        filePath: "src/data/canonical/lessons-v1/lesson-filename-mismatch.json",
        source: lesson,
      },
    ]);

    expect(registry.has("lesson-actual-id")).toBe(false);
    expect(registry.has("lesson-filename-mismatch")).toBe(false);
    expect(invalid).toHaveLength(1);
    expect(invalid[0].errors.some((e) => e.includes("Filename/ID mismatch"))).toBe(true);
    expect(validationErrors.get("lesson-actual-id")).toBeDefined();
    expect(validationErrors.get("lesson-filename-mismatch")).toBeDefined();
  });

  it("3. invalid JSON schema fails validation with detailed diagnostics", () => {
    const malformed = {
      id: "lesson-malformed",
      identity: { title: "Malformed" }, // missing curriculum, learning, activities, etc.
    };

    const { registry, invalid, validationErrors, discoveredLessonIds } = buildV1LessonRegistry(
      [{ filePath: "src/data/canonical/lessons-v1/lesson-malformed.json", source: malformed }],
      { throwOnDuplicate: false },
    );

    expect(registry.has("lesson-malformed")).toBe(false);
    expect(invalid).toHaveLength(1);
    expect(invalid[0].lessonId).toBe("lesson-malformed");
    expect(invalid[0].errors.length).toBeGreaterThan(0);
    expect(validationErrors.get("lesson-malformed")).toBeDefined();
    expect(discoveredLessonIds.has("lesson-malformed")).toBe(true);
  });

  it("4. golden fixture does not enter the production registry", () => {
    // Reload to ensure pristine state
    reloadV1LessonRegistry();

    const productionLessonIds = listV1LessonIds();

    // goldenLesson0CanonicalV1 is ID "lesson-0-1-1"
    expect(productionLessonIds).not.toContain("lesson-0-1-1");
    expect(getV1LessonById("lesson-0-1-1")).toBeUndefined();

    const result = loadV1Lesson("lesson-0-1-1");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("not-found");
      expect(result.lessonId).toBe("lesson-0-1-1");
    }

    expect(isV1LessonTarget("lesson-0-1-1")).toBe(false);
  });

  it("5. valid JSON lesson is the lesson actually loaded and ready to render", () => {
    reloadV1LessonRegistry();

    // lesson-1-1-1 is a valid production JSON lesson in src/data/canonical/lessons-v1/lesson-1-1-1.json
    const result = loadV1Lesson("lesson-1-1-1");
    expect(result.ok).toBe(true);

    if (result.ok) {
      const lesson = result.lesson;
      expect(lesson.id).toBe("lesson-1-1-1");
      expect(lesson.schemaVersion).toBe("1.0.0");
      expect(lesson.identity.title).toBe("HTML: The Structure of the Web");
      expect(lesson.activities.length).toBeGreaterThan(0);

      // Verify the loaded JSON lesson adapts cleanly into playable Layer 1 format
      const adapted = adaptLessonV1ToLayer1(lesson);
      expect(adapted.lesson.id).toBe("lesson-1-1-1");
      expect(adapted.lesson.activities.length).toBe(lesson.activities.length);
      expect(Object.keys(adapted.renderPlan)).toHaveLength(lesson.activities.length);
    }

    // Direct helper getV1LessonById also retrieves it
    const directLesson = getV1LessonById("lesson-1-1-1");
    expect(directLesson).toBeDefined();
    expect(directLesson?.id).toBe("lesson-1-1-1");
    expect(isV1LessonTarget("lesson-1-1-1")).toBe(true);
  });
});

describe("V1 Loader — Production Registry Lifecycle", () => {
  beforeEach(() => {
    reloadV1LessonRegistry();
  });

  it("reports not-found for nonexistent lesson IDs", () => {
    const result = loadV1Lesson("nonexistent-lesson-id");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("not-found");
    }
    expect(getV1LessonById("nonexistent-lesson-id")).toBeUndefined();
    expect(isV1LessonTarget("nonexistent-lesson-id")).toBe(false);
  });

  it("lists all discovered production JSON lessons without duplicates", () => {
    const ids = listV1LessonIds();
    expect(ids.length).toBeGreaterThan(0);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
    expect(ids).toContain("lesson-1-1-1");
    expect(ids).toContain("lesson-1-1-2");
  });

  it("reloadV1LessonRegistry safely clears and rebuilds cache", () => {
    expect(() => reloadV1LessonRegistry()).not.toThrow();
    expect(isV1LessonTarget("lesson-1-1-1")).toBe(true);
  });
});
