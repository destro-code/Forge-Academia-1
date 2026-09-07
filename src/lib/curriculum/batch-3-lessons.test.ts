import { describe, it, expect } from "vitest";
import { canonicalProvider } from "./canonical-provider";
import { lintLesson } from "./authoring/lint-lesson";
import { validateLesson } from "./schema";

describe("Batch 3 — JavaScript Fundamentals Canonical Transformation", () => {
  const batch3LessonIds = ["lesson-1-3-2", "lesson-1-3-3", "lesson-1-3-4", "lesson-1-3-5"];

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

  it("1. loads and validates all Batch 3 lessons in canonical provider", () => {
    for (const id of batch3LessonIds) {
      const lesson = canonicalProvider.getLesson(id);
      expect(lesson).toBeDefined();
      expect(lesson?.id).toBe(id);
      const validated = validateLesson(lesson as unknown);
      expect(validated.id).toBe(id);
    }
  });

  it("2. all Batch 3 lessons pass canonical authoring linter with zero errors", () => {
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

  it("4. verifies unique activity IDs across all Batch 3 lessons", () => {
    const activityIds = new Set<string>();
    for (const id of batch3LessonIds) {
      const lesson = canonicalProvider.getLesson(id)!;
      for (const act of lesson.activities) {
        expect(activityIds.has(act.id)).toBe(false);
        activityIds.add(act.id);
      }
    }
  });

  it("5. confirms hint level sequencing and required completion targets", () => {
    for (const id of batch3LessonIds) {
      const lesson = canonicalProvider.getLesson(id)!;
      for (const act of lesson.activities) {
        if (act.feedback?.hints) {
          const levels = act.feedback.hints.map((h) => h.level);
          for (let i = 0; i < levels.length; i++) {
            expect(levels[i]).toBe(i + 1);
          }
        }
      }
      expect(lesson.completion.requiredActivityIds.length).toBeGreaterThanOrEqual(2);
      expect(lesson.completion.minimumScore).toBeGreaterThan(0);
    }
  });
});
