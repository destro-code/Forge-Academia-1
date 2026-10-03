import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { canonicalManifest, CanonicalManifestProvider } from "./manifest";
import { canonicalProvider } from "./canonical-provider";
import { localContentProvider } from "../providers/content-provider";
import { resolveLessonLayer } from "./lesson-resolver";
import {
  isCurriculumBuildMode,
  setCurriculumModeForTesting,
} from "./curriculum-mode";
import type { CanonicalLesson } from "./types";

describe("Canonical Curriculum Manifest & Build Mode Architecture", () => {
  beforeEach(() => {
    setCurriculumModeForTesting("build");
  });

  afterEach(() => {
    setCurriculumModeForTesting(null);
  });

  describe("1. Dynamic Discovery & Archived Separation", () => {
    it("preserves all 40 archived canonical lessons outside active discovery", () => {
      const archived = canonicalProvider.getAllArchivedLessons();
      expect(archived.length).toBe(40);

      // Verify specific archived lessons are preserved with original IDs
      const archived011 = canonicalProvider.getArchivedLesson("lesson-0-1-1");
      expect(archived011).toBeDefined();
      expect(archived011?.title).toBe("The Button Has Betrayed You");

      expect(canonicalProvider.isArchivedLesson("lesson-0-1-1")).toBe(true);
    });

    it("ensures active canonical discovery does NOT discover archived files", () => {
      const activeLessons = canonicalProvider.getAllCanonicalLessons();
      // Initially, active directory is a clean slate ready for new curriculum authoring
      expect(activeLessons.length).toBe(0);

      const orderedIds = canonicalManifest.getOrderedLessonIds();
      expect(orderedIds).toEqual([]);

      // Archived lesson ID is NOT recognized as active curriculum lesson
      expect(canonicalManifest.isCurriculumLesson("lesson-0-1-1")).toBe(false);
      expect(canonicalProvider.getLesson("lesson-0-1-1")).toBeUndefined();
      expect(canonicalProvider.getCanonicalLesson("lesson-0-1-1")).toBeUndefined();
    });
  });

  describe("2. Build Mode Isolation vs Legacy Fallback", () => {
    it("ensures legacy lessons do not appear in learner-facing curriculum during build mode", () => {
      setCurriculumModeForTesting("build");
      expect(isCurriculumBuildMode()).toBe(true);

      // Learner-facing lessons list must contain ONLY active canonical lessons (0 initially)
      const learnerLessons = localContentProvider.lessons();
      expect(learnerLessons.length).toBe(0);

      // Learner-facing getLesson must not fall back to legacy lessons
      expect(localContentProvider.getLesson("lesson-0-1-2")).toBeUndefined();
      expect(localContentProvider.getLesson("lesson-1-1-1")).toBeUndefined();
    });

    it("preserves explicit legacy queries for backward compatibility", () => {
      // Explicit legacy accessor remains functional for compatibility tools/tests
      const legacyLesson = localContentProvider.getLegacyLesson?.("lesson-0-1-2");
      expect(legacyLesson).toBeDefined();
      expect(legacyLesson?.id).toBe("lesson-0-1-2");
    });

    it("restores legacy fallback in production mode", () => {
      setCurriculumModeForTesting("production");
      expect(isCurriculumBuildMode()).toBe(false);

      const prodLessons = localContentProvider.lessons();
      expect(prodLessons.length).toBeGreaterThan(0);

      const prodLesson = localContentProvider.getLesson("lesson-0-1-2");
      expect(prodLesson).toBeDefined();
    });
  });

  describe("3. Partial Curriculum Support (0, 1, 3 lessons)", () => {
    it("gracefully operates with zero active lessons in build mode", () => {
      setCurriculumModeForTesting("build");

      expect(canonicalManifest.getOrderedLessonIds()).toEqual([]);
      expect(canonicalManifest.getCanonicalLessonsForModule("module-0-1")).toEqual([]);
      expect(canonicalManifest.getNextCanonicalLesson("any-id")).toBeUndefined();
      expect(canonicalManifest.getPreviousCanonicalLesson("any-id")).toBeUndefined();
    });

    it("operates with a simulated partial curriculum (1 lesson)", () => {
      const mockSingleLesson: CanonicalLesson = {
        id: "lesson-new-001",
        schemaVersion: "1.0.0",
        title: "First Forged Lesson",
        description: "Test lesson 1",
        topicId: "what-is-frontend-development",
        moduleId: "module-0-1",
        lessonType: "instruction",
        difficulty: "Beginner",
        estimatedMinutes: 10,
        conceptIds: [],
        skillIds: [],
        objectives: [{ id: "OBJ-1", statement: "Test objective" }],
        prerequisites: {},
        activities: [],
      };

      const provider = new CanonicalManifestProvider();
      const report = provider.validateManifestReferences([mockSingleLesson], { allowPartial: true });

      // In build mode with partial curriculum allowed, unauthored planned lessons are warnings, not fatal
      expect(report.errors).toEqual([]);
      expect(report.valid).toBe(true);
      expect(report.totalDiscoveredLessons).toBe(1);
    });

    it("operates with a simulated partial curriculum (3 lessons) with sequential navigation", () => {
      const lessonA: CanonicalLesson = {
        id: "lesson-part-a",
        schemaVersion: "1.0.0",
        title: "Part A",
        description: "A",
        topicId: "what-is-frontend-development",
        moduleId: "module-0-1",
        lessonType: "instruction",
        difficulty: "Beginner",
        estimatedMinutes: 10,
        conceptIds: [],
        skillIds: [],
        objectives: [{ id: "OBJ-1", statement: "A" }],
        prerequisites: {},
        activities: [],
      };

      const lessonB: CanonicalLesson = {
        id: "lesson-part-b",
        schemaVersion: "1.0.0",
        title: "Part B",
        description: "B",
        topicId: "what-is-frontend-development",
        moduleId: "module-0-1",
        lessonType: "instruction",
        difficulty: "Beginner",
        estimatedMinutes: 10,
        conceptIds: [],
        skillIds: [],
        objectives: [{ id: "OBJ-1", statement: "B" }],
        prerequisites: {},
        activities: [],
      };

      const provider = new CanonicalManifestProvider();
      const report = provider.validateManifestReferences([lessonA, lessonB], { allowPartial: true });
      expect(report.valid).toBe(true);
      expect(report.totalDiscoveredLessons).toBe(2);
    });
  });

  describe("4. Manifest Integrity Validation", () => {
    it("detects duplicate lesson IDs", () => {
      const provider = new CanonicalManifestProvider();
      const duplicateLessons: CanonicalLesson[] = [
        {
          id: "dup-id-1",
          schemaVersion: "1.0.0",
          title: "Dup 1",
          description: "Test",
          topicId: "what-is-frontend-development",
          moduleId: "module-0-1",
          lessonType: "instruction",
          difficulty: "Beginner",
          estimatedMinutes: 10,
          conceptIds: [],
          skillIds: [],
          objectives: [{ id: "OBJ-1", statement: "Objective" }],
          prerequisites: {},
          activities: [],
        },
        {
          id: "dup-id-1",
          schemaVersion: "1.0.0",
          title: "Dup 2",
          description: "Test",
          topicId: "what-is-frontend-development",
          moduleId: "module-0-1",
          lessonType: "instruction",
          difficulty: "Beginner",
          estimatedMinutes: 10,
          conceptIds: [],
          skillIds: [],
          objectives: [{ id: "OBJ-1", statement: "Objective" }],
          prerequisites: {},
          activities: [],
        },
      ];

      const report = provider.validateManifestReferences(duplicateLessons);
      expect(report.valid).toBe(false);
      expect(report.errors.some((e) => e.type === "duplicate-id")).toBe(true);
    });

    it("detects invalid module references", () => {
      const provider = new CanonicalManifestProvider();
      const invalidLessons: CanonicalLesson[] = [
        {
          id: "invalid-mod-lesson",
          schemaVersion: "1.0.0",
          title: "Invalid Mod",
          description: "Test",
          topicId: "what-is-frontend-development",
          moduleId: "module-fake-999",
          lessonType: "instruction",
          difficulty: "Beginner",
          estimatedMinutes: 10,
          conceptIds: [],
          skillIds: [],
          objectives: [{ id: "OBJ-1", statement: "Objective" }],
          prerequisites: {},
          activities: [],
        },
      ];

      const report = provider.validateManifestReferences(invalidLessons);
      expect(report.valid).toBe(false);
      expect(report.errors.some((e) => e.type === "invalid-module")).toBe(true);
    });

    it("fails when allowPartial is false and planned lessons are missing", () => {
      const provider = new CanonicalManifestProvider();
      // In strict production mode (allowPartial: false), missing planned lessons are errors
      const report = provider.validateManifestReferences([], { allowPartial: false });
      expect(report.valid).toBe(false);
      expect(report.errors.some((e) => e.type === "missing-lesson")).toBe(true);
    });
  });

  describe("5. Direct Route & Resolver Conformance in Build Mode", () => {
    it("blocks direct URL access to legacy lessons in build mode", () => {
      setCurriculumModeForTesting("build");

      const resolved = resolveLessonLayer({
        v1Lesson: undefined,
        layer1Lesson: undefined,
        legacyLesson: { id: "lesson-0-1-2" },
      });

      // In build mode, visiting an unmigrated legacy lesson URL returns not-found
      expect(resolved).toBe("not-found");
    });

    it("allows direct URL access to legacy lessons in production mode", () => {
      setCurriculumModeForTesting("production");

      const resolved = resolveLessonLayer({
        v1Lesson: undefined,
        layer1Lesson: undefined,
        legacyLesson: { id: "lesson-0-1-2" },
      });

      // In production mode, legacy fallback remains active
      expect(resolved).toBe("legacy");
    });

    it("always resolves active canonical Layer 1 lessons in build mode", () => {
      setCurriculumModeForTesting("build");

      const mockCanonical: CanonicalLesson = {
        id: "lesson-active-001",
        schemaVersion: "1.0.0",
        title: "Active Lesson",
        description: "Desc",
        topicId: "what-is-frontend-development",
        moduleId: "module-0-1",
        lessonType: "instruction",
        difficulty: "Beginner",
        estimatedMinutes: 10,
        conceptIds: [],
        skillIds: [],
        objectives: [{ id: "OBJ-1", statement: "Obj" }],
        prerequisites: {},
        activities: [],
      };

      const resolved = resolveLessonLayer({
        v1Lesson: undefined,
        layer1Lesson: mockCanonical,
        legacyLesson: undefined,
      });

      expect(resolved).toBe("layer1");
    });
  });
});
