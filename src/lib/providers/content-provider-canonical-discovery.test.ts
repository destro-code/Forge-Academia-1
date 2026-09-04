import { describe, it, expect } from "vitest";
import { localContentProvider, contentProvider } from "./content-provider";
import { canonicalProvider } from "../curriculum/canonical-provider";

describe("Forge Canonical Curriculum Discovery Integration", () => {
  describe("Phase 1: Canonical Hierarchy & Discovery", () => {
    it("discovers Level 0 and its modules via provider", () => {
      const level0 = localContentProvider.getLevel?.("level-0");
      expect(level0).toBeDefined();
      expect(level0?.title).toContain("Level 0");
      expect(level0?.moduleIds).toContain("module-0-1");

      const mod01 = localContentProvider.getModule("module-0-1");
      expect(mod01).toBeDefined();
      expect(mod01?.id).toBe("module-0-1");
      expect(mod01?.topicCount).toBeGreaterThan(0);
      expect(mod01?.lessonCount).toBeGreaterThan(0);
    });

    it("discovers topic what-is-frontend-development under module-0-1", () => {
      const topic = localContentProvider.getTopic("what-is-frontend-development");
      expect(topic).toBeDefined();
      expect(topic?.id).toBe("what-is-frontend-development");
      expect(topic?.moduleId).toBe("module-0-1");
    });
  });

  describe("Phase 3 & 4: Lesson 0 Discovery and Authority Rule", () => {
    it("returns lesson-0-1-1 with canonical title 'The Button Has Betrayed You'", () => {
      const lesson = localContentProvider.getLesson("lesson-0-1-1");
      expect(lesson).toBeDefined();
      expect(lesson?.id).toBe("lesson-0-1-1");
      expect(lesson?.title).toBe("The Button Has Betrayed You");
      expect(lesson?.topicId).toBe("what-is-frontend-development");
      expect(lesson?.moduleId).toBe("module-0-1");
    });

    it("ensures canonical title is authoritative in lessons() list and never overridden by legacy", () => {
      const allLessons = localContentProvider.lessons();
      const lesson011 = allLessons.find((l) => l.id === "lesson-0-1-1");
      expect(lesson011).toBeDefined();
      expect(lesson011?.title).toBe("The Button Has Betrayed You");

      // Verify no duplicate lesson IDs exist
      const ids = allLessons.map((l) => l.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });

    it("preserves unmigrated legacy lessons alongside canonical golden lessons", () => {
      const allLessons = localContentProvider.lessons();
      const legacyLesson = allLessons.find((l) => l.id === "lesson-0-1-2");
      expect(legacyLesson).toBeDefined();
      expect(legacyLesson?.id).toBe("lesson-0-1-2");
    });

    it("ensures topics list has no duplicate IDs and contains canonical topics", () => {
      const allTopics = localContentProvider.topics();
      const topic = allTopics.find((t) => t.id === "what-is-frontend-development");
      expect(topic).toBeDefined();
      expect(topic?.moduleId).toBe("module-0-1");

      const ids = allTopics.map((t) => t.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });
  });

  describe("Phase 6: Golden Lessons Authority Precedence", () => {
    it("enforces canonical authority for all golden fixtures", () => {
      const goldenLessons = canonicalProvider.getGoldenLessons();
      expect(goldenLessons.length).toBe(6);

      for (const golden of goldenLessons) {
        const fromContentProvider = localContentProvider.getLesson(golden.id);
        expect(fromContentProvider).toBeDefined();
        expect(fromContentProvider?.title).toBe(golden.title);
        expect(fromContentProvider?.topicId).toBe(golden.topicId);
      }
    });

    it("contentProvider alias matches localContentProvider", () => {
      expect(contentProvider.getLesson("lesson-0-1-1")?.title).toBe("The Button Has Betrayed You");
    });
  });
});
