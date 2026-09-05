import { describe, it, expect } from "vitest";
import { canonicalProvider } from "./canonical-provider";
import { lintLesson } from "./authoring/lint-lesson";
import { validateLesson } from "./schema";

describe("Change 31 — Batch 2 Canonical Curriculum Transformation", () => {
  const batch2LessonIds = [
    "lesson-1-2-1",
    "lesson-1-2-2",
    "lesson-1-2-3",
    "lesson-1-2-4",
    "lesson-1-2-5",
    "lesson-1-2-6",
    "lesson-1-2-7-colors",
    "lesson-1-2-8",
    "lesson-1-2-9",
    "lesson-1-2-10",
    "lesson-1-2-11",
    "lesson-1-2-12",
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

  it("1. loads and validates all Batch 2 lessons in canonical provider", () => {
    for (const id of batch2LessonIds) {
      const lesson = canonicalProvider.getLesson(id);
      expect(lesson).toBeDefined();
      expect(lesson?.id).toBe(id);
      const validated = validateLesson(lesson as unknown);
      expect(validated.id).toBe(id);
    }
  });

  it("2. all Batch 2 lessons pass canonical authoring linter with zero errors", () => {
    for (const id of batch2LessonIds) {
      const lesson = canonicalProvider.getLesson(id)!;
      const result = lintLesson(lesson, fullContext);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    }
  });

  it("3. verifies activity progression and evidence alignment for every Batch 2 lesson", () => {
    for (const id of batch2LessonIds) {
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
