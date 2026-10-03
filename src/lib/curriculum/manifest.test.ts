import { describe, it, expect } from "vitest";
import path from "path";
import fs from "fs";
import manifest from "@/data/canonical/curriculum-manifest.json";
import { canonicalManifest } from "./manifest";
import { canonicalProvider } from "./canonical-provider";
import { contentProvider as localContentProvider } from "../providers/content-provider";

describe("Authoritative Curriculum Manifest Data Integrity", () => {
  it("1. Manifest has correct schema version", () => {
    expect(manifest.version).toBe("1.0.0");
    expect(manifest.curriculumVersion).toBe("1.0.0");
  });

  it("2. Manifest contains all required top-level arrays", () => {
    expect(Array.isArray(manifest.levels)).toBe(true);
    expect(Array.isArray(manifest.modules)).toBe(true);
    expect(Array.isArray(manifest.topics)).toBe(true);
    expect(Array.isArray(manifest.lessons)).toBe(true);
  });

  it("3. Every level has valid, unique ID and non-empty title", () => {
    const levelIds = new Set<string>();
    for (const lvl of manifest.levels) {
      expect(lvl.levelId).toMatch(/^level-\d+$/);
      expect(levelIds.has(lvl.levelId)).toBe(false);
      levelIds.add(lvl.levelId);
      expect(typeof lvl.title).toBe("string");
      expect(lvl.title.trim().length).toBeGreaterThan(0);
      expect(typeof lvl.position).toBe("number");
      expect(Array.isArray(lvl.moduleIds)).toBe(true);
    }
  });

  it("4. Every module has valid, unique ID, belongs to a valid level, and has non-empty title", () => {
    const levelIds = new Set(manifest.levels.map((l) => l.levelId));
    const moduleIds = new Set<string>();

    for (const mod of manifest.modules) {
      expect(mod.moduleId).toMatch(/^module-\d+-\d+$/);
      expect(moduleIds.has(mod.moduleId)).toBe(false);
      moduleIds.add(mod.moduleId);
      expect(levelIds.has(mod.levelId)).toBe(true);
      expect(typeof mod.title).toBe("string");
      expect(mod.title.trim().length).toBeGreaterThan(0);
      expect(typeof mod.position).toBe("number");
      expect(Array.isArray(mod.topicIds)).toBe(true);
      expect(Array.isArray(mod.lessonIds)).toBe(true);
    }
  });

  it("5. Every topic has valid, unique ID, belongs to a valid module, and has non-empty title", () => {
    const moduleIds = new Set(manifest.modules.map((m) => m.moduleId));
    const topicIds = new Set<string>();

    for (const top of manifest.topics) {
      expect(typeof top.topicId).toBe("string");
      expect(top.topicId.trim().length).toBeGreaterThan(0);
      expect(topicIds.has(top.topicId)).toBe(false);
      topicIds.add(top.topicId);
      expect(moduleIds.has(top.moduleId)).toBe(true);
      expect(typeof top.title).toBe("string");
      expect(top.title.trim().length).toBeGreaterThan(0);
      expect(typeof top.position).toBe("number");
      expect(Array.isArray(top.lessonIds)).toBe(true);
    }
  });

  it("6. Every lesson has valid, unique ID, canonical filename, and references valid hierarchy", () => {
    const levelIds = new Set(manifest.levels.map((l) => l.levelId));
    const moduleIds = new Set(manifest.modules.map((m) => m.moduleId));
    const topicIds = new Set(manifest.topics.map((t) => t.topicId));
    const lessonIds = new Set<string>();

    for (const les of manifest.lessons) {
      expect(les.lessonId).toMatch(/^lesson-\d+-\d+-\d+$/);
      expect(lessonIds.has(les.lessonId)).toBe(false);
      lessonIds.add(les.lessonId);
      expect(levelIds.has(les.levelId)).toBe(true);
      expect(moduleIds.has(les.moduleId)).toBe(true);
      expect(topicIds.has(les.topicId)).toBe(true);
      expect(typeof les.position).toBe("number");
      expect(typeof les.title).toBe("string");
      expect(les.title.trim().length).toBeGreaterThan(0);
      expect(les.canonicalFilename).toBe(`${les.lessonId}.json`);
    }
  });

  it("7. Manifest lesson list matches authored files on disk", () => {
    const lessonsDir = path.resolve(process.cwd(), "src/data/canonical/lessons-v1");
    for (const lessonRef of manifest.lessons) {
      if (lessonRef.authored) {
        const fullPath = path.join(lessonsDir, lessonRef.canonicalFilename);
        expect(
          fs.existsSync(fullPath),
          `Manifest references authored file ${lessonRef.canonicalFilename}, but it does not exist on disk`,
        ).toBe(true);
      }
    }
  });

  it("8. Topic lesson membership is consistent with Lesson records", () => {
    for (const topic of manifest.topics) {
      for (const lessonId of topic.lessonIds) {
        const lessonRef = manifest.lessons.find((l) => l.lessonId === lessonId);
        expect(
          lessonRef,
          `Topic "${topic.topicId}" contains lessonId "${lessonId}", which is missing from manifest.lessons`,
        ).toBeDefined();
        expect(lessonRef?.topicId).toBe(topic.topicId);
        expect(lessonRef?.moduleId).toBe(topic.moduleId);
      }
    }
  });

  it("9. Module lesson membership is consistent with Topic and Lesson records", () => {
    for (const mod of manifest.modules) {
      for (const lessonId of mod.lessonIds) {
        const lessonRef = manifest.lessons.find((l) => l.lessonId === lessonId);
        expect(
          lessonRef,
          `Module "${mod.moduleId}" contains lessonId "${lessonId}", which is missing from manifest.lessons`,
        ).toBeDefined();
        expect(lessonRef?.moduleId).toBe(mod.moduleId);
      }
    }
  });

  it("10. No prerequisite cycle may exist (strict DAG)", () => {
    const lessonsDir = path.resolve(process.cwd(), "src/data/canonical/lessons-v1");
    const adj = new Map<string, string[]>();

    for (const lessonRef of manifest.lessons) {
      const fullPath = path.join(lessonsDir, lessonRef.canonicalFilename);
      if (fs.existsSync(fullPath)) {
        const content = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
        const prereqs: string[] = content.curriculum?.prerequisiteLessonIds || [];
        adj.set(lessonRef.lessonId, prereqs);
      }
    }

    const visited = new Set<string>();
    const inStack = new Set<string>();

    function dfs(node: string) {
      visited.add(node);
      inStack.add(node);

      for (const dep of adj.get(node) || []) {
        if (inStack.has(dep)) {
          expect.fail(`Prerequisite cycle detected involving lesson "${dep}"`);
        }
        if (!visited.has(dep)) {
          dfs(dep);
        }
      }

      inStack.delete(node);
    }

    for (const lessonId of adj.keys()) {
      if (!visited.has(lessonId)) {
        dfs(lessonId);
      }
    }
  });

  it("11. Lesson ordering must be deterministic", () => {
    const positions = manifest.lessons.map((l) => l.position);
    for (let i = 0; i < positions.length - 1; i++) {
      expect(positions[i]).toBeLessThan(positions[i + 1]);
    }
  });

  it("12. Module ordering must be deterministic", () => {
    const positions = manifest.modules.map((m) => m.position);
    expect(positions.length).toBeGreaterThan(0);
    for (const lvl of manifest.levels) {
      const mods = manifest.modules.filter((m) => m.levelId === lvl.levelId);
      for (let i = 0; i < mods.length - 1; i++) {
        expect(mods[i].position).toBeLessThan(mods[i + 1].position);
      }
    }
  });

  it("13. Level ordering must be deterministic", () => {
    const positions = manifest.levels.map((l) => l.position);
    for (let i = 0; i < positions.length - 1; i++) {
      expect(positions[i]).toBeLessThan(positions[i + 1]);
    }
  });
});

describe("Runtime Curriculum Identity Services Navigation", () => {
  it("canonicalManifestProvider exposes manifest-backed sequence and hierarchy", () => {
    const ordered = canonicalManifest.getOrderedLessonIds();
    expect(ordered[0]).toBe("lesson-0-1-1");
    expect(ordered.slice(1)).toEqual([
      "lesson-1-1-1",
      "lesson-1-1-2",
      "lesson-1-1-3",
      "lesson-1-1-4",
      "lesson-1-1-5",
      "lesson-1-1-6",
    ]);

    expect(canonicalManifest.getNextLessonId("lesson-0-1-1")).toBe("lesson-1-1-1");
    expect(canonicalManifest.getPreviousLessonId("lesson-1-1-1")).toBe("lesson-0-1-1");
    expect(canonicalManifest.getNextLessonId("lesson-1-1-6")).toBeUndefined();
    expect(canonicalManifest.getPreviousLessonId("lesson-0-1-1")).toBeUndefined();

    // Module & topic query methods
    const mod1Lessons = canonicalManifest.getLessonsForModule("module-1-1");
    expect(mod1Lessons).toHaveLength(6);

    const topic1Lessons = canonicalManifest.getLessonsForTopic("html-the-structure-of-the-web");
    expect(topic1Lessons).toHaveLength(5);

    const topic2Lessons = canonicalManifest.getLessonsForTopic("accessible-form-labels");
    expect(topic2Lessons).toHaveLength(1);
    expect(topic2Lessons[0].lessonId).toBe("lesson-1-1-6");
  });

  it("canonicalProvider resolves next and previous lessons according to authoritative manifest", () => {
    const lessons = canonicalProvider.getLessons();
    expect(lessons.length).toBeGreaterThanOrEqual(6);

    expect(canonicalProvider.getNextLesson("lesson-1-1-1")?.id).toBe("lesson-1-1-2");
    expect(canonicalProvider.getPreviousLesson("lesson-1-1-2")?.id).toBe("lesson-1-1-1");
  });

  it("contentProvider queries the new manifest without legacy file mingling", () => {
    const modules = localContentProvider.modules();
    expect(modules.length).toBeGreaterThanOrEqual(27);
    const mod1 = localContentProvider.getModule("module-1-1");
    expect(mod1).toBeDefined();
    expect(mod1?.lessonCount).toBe(6);

    const topics = localContentProvider.topics();
    expect(topics.length).toBeGreaterThanOrEqual(28);
    const top1 = localContentProvider.getTopic("html-the-structure-of-the-web");
    expect(top1).toBeDefined();
    expect(top1?.lessonIds).toHaveLength(5);

    const lessons = localContentProvider.lessons();
    expect(lessons).toHaveLength(6);
    expect(lessons.map((l) => l.id)).toEqual([
      "lesson-1-1-1",
      "lesson-1-1-2",
      "lesson-1-1-3",
      "lesson-1-1-4",
      "lesson-1-1-5",
      "lesson-1-1-6",
    ]);

    const lesson1 = localContentProvider.getLesson("lesson-1-1-1");
    expect(lesson1).toBeDefined();
    expect(lesson1?.title).toBe("HTML: The Structure of the Web");
  });

  it("preserves archived canonical lessons outside active navigation", () => {
    const archived = canonicalProvider.getAllArchivedLessons();
    expect(archived.length).toBeGreaterThanOrEqual(40);

    expect(canonicalProvider.isArchivedLesson("lesson-0-1-2")).toBe(true);
    expect(canonicalProvider.getArchivedLesson("lesson-0-1-2")).toBeDefined();

    // Not in active manifest
    expect(canonicalManifest.isCurriculumLesson("lesson-0-1-2")).toBe(false);
    expect(canonicalProvider.getLesson("lesson-0-1-2")).toBeUndefined();
  });
});
