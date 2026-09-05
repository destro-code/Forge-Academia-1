import { describe, it, expect } from "vitest";
import { canonicalProvider } from "./canonical-provider";
import { lintLesson } from "./authoring/lint-lesson";
import { validateLesson } from "./schema";

describe("Change 29 — Batch 1 Canonical Curriculum Transformation", () => {
  const batch1LessonIds = [
    "lesson-0-1-2",
    "lesson-0-1-3",
    "lesson-0-1-4",
    "lesson-0-1-5",
    "lesson-1-1-1",
    "lesson-1-1-3",
    "lesson-1-1-4",
    "lesson-1-1-5",
    "lesson-1-1-6",
    "lesson-1-1-7",
    "lesson-1-1-8",
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

  it("1. loads and validates all 11 Batch 1 lessons in canonical provider", () => {
    for (const id of batch1LessonIds) {
      const lesson = canonicalProvider.getLesson(id);
      expect(lesson).toBeDefined();
      expect(lesson?.id).toBe(id);
      const validated = validateLesson(lesson as unknown);
      expect(validated.id).toBe(id);
    }
  });

  it("2. all 11 Batch 1 lessons pass canonical authoring linter with zero errors", () => {
    for (const id of batch1LessonIds) {
      const lesson = canonicalProvider.getLesson(id)!;
      const result = lintLesson(lesson, fullContext);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    }
  });

  it("3. verifies activity progression and evidence alignment for every Batch 1 lesson", () => {
    for (const id of batch1LessonIds) {
      const lesson = canonicalProvider.getLesson(id)!;
      expect(lesson.objectives.length).toBeGreaterThanOrEqual(2);
      expect(lesson.activities.length).toBeGreaterThanOrEqual(4);
      const primaryObjectives = lesson.objectives.filter((o) => o.priority === "primary");
      const coveredObjectiveIds = new Set(
        lesson.completion.evidenceRequirements?.map((r) => r.objectiveId) || [],
      );
      for (const obj of primaryObjectives) {
        expect(coveredObjectiveIds.has(obj.id)).toBe(true);
      }
    }
  });
});
