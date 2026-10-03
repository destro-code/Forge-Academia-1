import { describe, it, expect } from "vitest";
import { canonicalManifest, CanonicalManifestProvider } from "./manifest";
import { canonicalProvider } from "./canonical-provider";
import { localContentProvider } from "../providers/content-provider";
import curriculumManifestData from "@/data/canonical/curriculum-manifest.json";
import fs from "fs";
import path from "path";

describe("Authoritative Curriculum Manifest (curriculum-manifest.json)", () => {
  const manifest = curriculumManifestData;

  it("contains curriculum version, levels, modules, topics, and lessons", () => {
    expect(manifest.version).toBeDefined();
    expect(manifest.curriculumVersion).toBeDefined();
    expect(Array.isArray(manifest.levels)).toBe(true);
    expect(Array.isArray(manifest.modules)).toBe(true);
    expect(Array.isArray(manifest.topics)).toBe(true);
    expect(Array.isArray(manifest.lessons)).toBe(true);
  });

  it("1. No lesson may exist in the manifest twice", () => {
    const lessonIds = manifest.lessons.map((l) => l.lessonId);
    const uniqueLessonIds = new Set(lessonIds);
    expect(lessonIds.length).toBe(uniqueLessonIds.size);
  });

  it("2. No module may exist twice", () => {
    const moduleIds = manifest.modules.map((m) => m.moduleId);
    const uniqueModuleIds = new Set(moduleIds);
    expect(moduleIds.length).toBe(uniqueModuleIds.size);
  });

  it("3. No topic may exist twice", () => {
    const topicIds = manifest.topics.map((t) => t.topicId);
    const uniqueTopicIds = new Set(topicIds);
    expect(topicIds.length).toBe(uniqueTopicIds.size);
  });

  it("4. Every lesson must belong to exactly one topic", () => {
    const topicMap = new Map(manifest.topics.map((t) => [t.topicId, t]));

    for (const lesson of manifest.lessons) {
      expect(
        topicMap.has(lesson.topicId),
        `Lesson ${lesson.lessonId} references non-existent topicId ${lesson.topicId}`,
      ).toBe(true);

      const parentTopic = topicMap.get(lesson.topicId)!;
      expect(
        parentTopic.lessonIds,
        `Topic ${parentTopic.topicId} does not list lesson ${lesson.lessonId}`,
      ).toContain(lesson.lessonId);
    }
  });

  it("5. Every topic must belong to exactly one module", () => {
    const moduleMap = new Map(manifest.modules.map((m) => [m.moduleId, m]));

    for (const topic of manifest.topics) {
      expect(
        moduleMap.has(topic.moduleId),
        `Topic ${topic.topicId} references non-existent moduleId ${topic.moduleId}`,
      ).toBe(true);

      const parentModule = moduleMap.get(topic.moduleId)!;
      expect(
        parentModule.topicIds,
        `Module ${parentModule.moduleId} does not list topic ${topic.topicId}`,
      ).toContain(topic.topicId);
    }
  });

  it("6. Every module must belong to exactly one level/phase", () => {
    const levelMap = new Map(manifest.levels.map((l) => [l.levelId, l]));

    for (const mod of manifest.modules) {
      expect(
        levelMap.has(mod.levelId),
        `Module ${mod.moduleId} references non-existent levelId ${mod.levelId}`,
      ).toBe(true);

      const parentLevel = levelMap.get(mod.levelId)!;
      expect(
        parentLevel.moduleIds,
        `Level ${parentLevel.levelId} does not list module ${mod.moduleId}`,
      ).toContain(mod.moduleId);

      expect(mod.phaseId).toBe(parentLevel.phaseId);
    }
  });

  it("7. Every lesson's moduleId/topicId must match the manifest", () => {
    const lessonsDir = path.resolve(process.cwd(), "src/data/canonical/lessons-v1");

    for (const lessonRef of manifest.lessons) {
      const fullPath = path.join(lessonsDir, lessonRef.canonicalFilename);
      expect(fs.existsSync(fullPath), `Missing file ${lessonRef.canonicalFilename}`).toBe(true);

      const content = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
      expect(content.id).toBe(lessonRef.lessonId);
      expect(content.curriculum.moduleId).toBe(lessonRef.moduleId);
      expect(content.curriculum.topicId).toBe(lessonRef.topicId);
    }
  });

  it("8. Every canonical filename must be unique", () => {
    const filenames = manifest.lessons.map((l) => l.canonicalFilename);
    const uniqueFilenames = new Set(filenames);
    expect(filenames.length).toBe(uniqueFilenames.size);
  });

  it("9. Every prerequisite lesson must exist", () => {
    const lessonSet = new Set(manifest.lessons.map((l) => l.lessonId));
    const lessonsDir = path.resolve(process.cwd(), "src/data/canonical/lessons-v1");

    for (const lessonRef of manifest.lessons) {
      const fullPath = path.join(lessonsDir, lessonRef.canonicalFilename);
      const content = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
      const prereqs: string[] = content.curriculum.prerequisiteLessonIds || [];

      for (const prereqId of prereqs) {
        expect(
          lessonSet.has(prereqId),
          `Prerequisite "${prereqId}" referenced by "${lessonRef.lessonId}" does not exist in manifest`,
        ).toBe(true);
      }
    }
  });

  it("10. No prerequisite cycle may exist (strict DAG)", () => {
    const lessonsDir = path.resolve(process.cwd(), "src/data/canonical/lessons-v1");
    const adj = new Map<string, string[]>();

    for (const lessonRef of manifest.lessons) {
      const fullPath = path.join(lessonsDir, lessonRef.canonicalFilename);
      const content = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
      const prereqs: string[] = content.curriculum.prerequisiteLessonIds || [];
      adj.set(lessonRef.lessonId, prereqs);
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

    for (const lessonRef of manifest.lessons) {
      if (!visited.has(lessonRef.lessonId)) {
        dfs(lessonRef.lessonId);
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
    // Modules per level have deterministic positions
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
    expect(ordered).toEqual([
      "lesson-1-1-1",
      "lesson-1-1-2",
      "lesson-1-1-3",
      "lesson-1-1-4",
      "lesson-1-1-5",
      "lesson-1-1-6",
    ]);

    expect(canonicalManifest.getNextLessonId("lesson-1-1-1")).toBe("lesson-1-1-2");
    expect(canonicalManifest.getPreviousLessonId("lesson-1-1-2")).toBe("lesson-1-1-1");
    expect(canonicalManifest.getNextLessonId("lesson-1-1-6")).toBeUndefined();
    expect(canonicalManifest.getPreviousLessonId("lesson-1-1-1")).toBeUndefined();

    // Module & topic query methods
    const mod1Lessons = canonicalManifest.getLessonsForModule("module-1-1");
    expect(mod1Lessons).toHaveLength(6);

    const topic1Lessons = canonicalManifest.getLessonsForTopic("html-the-structure-of-the-web");
    expect(topic1Lessons).toHaveLength(5);

    const topic2Lessons = canonicalManifest.getLessonsForTopic("accessible-form-labels");
    expect(topic2Lessons).toHaveLength(1);
    expect(topic2Lessons[0].lessonId).toBe("lesson-1-1-6");
  });

  it("canonicalProvider queries curriculum-manifest.json for levels, modules, topics, and lessons", () => {
    const levels = canonicalProvider.getLevels();
    expect(levels).toHaveLength(6);
    expect(levels[0].id).toBe("level-0");
    expect(levels[1].id).toBe("level-1");

    const modules = canonicalProvider.getModules();
    expect(modules.length).toBeGreaterThanOrEqual(27);
    expect(modules.find((m) => m.id === "module-1-1")).toBeDefined();

    const topics = canonicalProvider.getTopics();
    expect(topics.find((t) => t.id === "html-the-structure-of-the-web")).toBeDefined();
    expect(topics.find((t) => t.id === "accessible-form-labels")).toBeDefined();

    const orderedLessons = canonicalProvider.getLessons();
    expect(orderedLessons).toHaveLength(6);
    expect(orderedLessons.map((l) => l.id)).toEqual([
      "lesson-1-1-1",
      "lesson-1-1-2",
      "lesson-1-1-3",
      "lesson-1-1-4",
      "lesson-1-1-5",
      "lesson-1-1-6",
    ]);

    // Navigation through canonicalProvider
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

    expect(canonicalProvider.isArchivedLesson("lesson-0-1-1")).toBe(true);
    expect(canonicalProvider.getArchivedLesson("lesson-0-1-1")).toBeDefined();

    // Not in active manifest
    expect(canonicalManifest.isCurriculumLesson("lesson-0-1-1")).toBe(false);
    expect(canonicalProvider.getLesson("lesson-0-1-1")).toBeUndefined();
  });
});
