import { describe, it, expect } from "vitest";
import { canonicalProvider } from "./canonical-provider";
import { lintLesson } from "./authoring/lint-lesson";
import { validateLesson } from "./schema";

describe("Batch 3 — Module 1-3 JavaScript Fundamentals Canonical Transformation", () => {
  const batch3LessonIds = [
    "lesson-1-3-2",
    "lesson-1-3-3",
    "lesson-1-3-4",
    "lesson-1-3-5",
    "lesson-1-3-6",
    "lesson-1-3-7",
    "lesson-1-3-8",
    "lesson-1-3-9",
  ];

  const fullContext = {
    academy: canonicalProvider.getAcademy(),
    levels: canonicalProvider.getLevels(),
    modules: canonicalProvider.getModules(),
    topics: canonicalProvider.getTopics(),
    concepts: canonicalProvider.getConcepts(),
    skills: canonicalProvider.getSkills(),
    misconceptions: canonicalProvider.getMisconceptions(),
    lessons: canonicalProvider.getAllCanonicalLessons(),
  };

  it("1. loads and validates all 8 Batch 3 lessons in canonical provider", () => {
    for (const id of batch3LessonIds) {
      const lesson = canonicalProvider.getLesson(id);
      expect(lesson).toBeDefined();
      expect(lesson?.id).toBe(id);
      const validated = validateLesson(lesson as unknown);
      expect(validated.id).toBe(id);
    }
  });

  it("2. all 8 Batch 3 lessons pass canonical authoring linter with zero errors", () => {
    for (const id of batch3LessonIds) {
      const lesson = canonicalProvider.getLesson(id)!;
      const result = lintLesson(lesson, fullContext);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    }
  });

  it("3. verifies activity progression and evidence alignment for every Batch 3 lesson", () => {
    for (const id of batch3LessonIds) {
      const lesson = canonicalProvider.getLesson(id)!;
      expect(lesson.objectives.length).toBeGreaterThanOrEqual(2);
      expect(lesson.activities.length).toBeGreaterThanOrEqual(5);
      const primaryObjectives = lesson.objectives.filter((o) => o.priority === "primary");
      const coveredObjectiveIds = new Set(
        lesson.completion.evidenceRequirements?.map((r) => r.objectiveId) || [],
      );
      for (const obj of primaryObjectives) {
        expect(coveredObjectiveIds.has(obj.id)).toBe(true);
      }
    }
  });

  it("4. verifies overall curriculum integrity report passes cleanly", () => {
    const report = canonicalProvider.validateAllContent();
    expect(report.valid).toBe(true);
    expect(report.errors).toHaveLength(0);
  });
});
