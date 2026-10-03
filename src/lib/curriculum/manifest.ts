import curriculumManifestData from "../../data/canonical/curriculum-manifest.json";
import { canonicalProvider } from "./canonical-provider";
import { isCurriculumBuildMode } from "./curriculum-mode";
import type { CanonicalLesson } from "./types";

/**
 * Canonical Curriculum Manifest Boundary
 *
 * Defines the authoritative curriculum manifest that determines canonical lesson ordering,
 * module membership, navigation, progression, and completeness.
 *
 * The manifest determines identity and curriculum order:
 *   manifest -> identity/order -> lesson JSON -> content
 */

export interface CanonicalManifestLessonRef {
  lessonId: string;
  id: string; // Compatibility alias
  levelId: string;
  moduleId: string;
  phaseId: string;
  topicId: string;
  position: number;
  order: number; // Compatibility alias
  title: string;
  canonicalFilename: string;
}

export interface CanonicalManifestTopic {
  topicId: string;
  id: string; // Compatibility alias
  moduleId: string;
  title: string;
  position: number;
  order: number; // Compatibility alias
  lessonIds: string[];
}

export interface CanonicalManifestModule {
  moduleId: string;
  id: string; // Compatibility alias
  levelId: string;
  phaseId: string;
  title: string;
  position: number;
  order: number; // Compatibility alias
  topicIds: string[];
  lessonIds: string[];
}

export interface CanonicalManifestLevel {
  levelId: string;
  id: string; // Compatibility alias
  phaseId: string;
  title: string;
  position: number;
  order: number; // Compatibility alias
  moduleIds: string[];
}

export interface CanonicalCurriculumManifest {
  version: string;
  curriculumVersion: string;
  levels: CanonicalManifestLevel[];
  modules: CanonicalManifestModule[];
  topics: CanonicalManifestTopic[];
  lessons: CanonicalManifestLessonRef[];
  // Compatibility alias
  phases?: Array<{ id: string; title: string; moduleIds: string[] }>;
}

export interface ManifestValidationDiagnostic {
  type:
    | "missing-lesson"
    | "orphan-lesson"
    | "duplicate-id"
    | "invalid-module"
    | "invalid-topic"
    | "prerequisite-cycle"
    | "missing-prerequisite";
  severity: "error" | "warning";
  message: string;
  id?: string;
}

export interface ManifestValidationReport {
  valid: boolean;
  errors: ManifestValidationDiagnostic[];
  warnings: ManifestValidationDiagnostic[];
  totalDiscoveredLessons: number;
  totalManifestLessons: number;
}

/**
 * Normalizes manifest data into typed entities with compatibility accessors.
 */
function normalizeManifest(): CanonicalCurriculumManifest {
  const raw = curriculumManifestData;

  const levels: CanonicalManifestLevel[] = raw.levels.map((lvl) => ({
    levelId: lvl.levelId,
    id: lvl.levelId,
    phaseId: lvl.phaseId,
    title: lvl.title,
    position: lvl.position,
    order: lvl.position,
    moduleIds: lvl.moduleIds,
  }));

  const modules: CanonicalManifestModule[] = raw.modules.map((mod) => ({
    moduleId: mod.moduleId,
    id: mod.moduleId,
    levelId: mod.levelId,
    phaseId: mod.phaseId,
    title: mod.title,
    position: mod.position,
    order: mod.position,
    topicIds: mod.topicIds,
    lessonIds: mod.lessonIds,
  }));

  const topics: CanonicalManifestTopic[] = raw.topics.map((top) => ({
    topicId: top.topicId,
    id: top.topicId,
    moduleId: top.moduleId,
    title: top.title,
    position: top.position,
    order: top.position,
    lessonIds: top.lessonIds,
  }));

  const lessons: CanonicalManifestLessonRef[] = raw.lessons.map((les) => ({
    lessonId: les.lessonId,
    id: les.lessonId,
    levelId: les.levelId,
    moduleId: les.moduleId,
    phaseId: les.phaseId,
    topicId: les.topicId,
    position: les.position,
    order: les.position,
    title: les.title,
    canonicalFilename: les.canonicalFilename,
  }));

  return {
    version: raw.version,
    curriculumVersion: raw.curriculumVersion,
    levels,
    modules,
    topics,
    lessons,
    phases: levels.map((lvl) => ({
      id: lvl.phaseId,
      title: lvl.title,
      moduleIds: lvl.moduleIds,
    })),
  };
}

/**
 * Authoritative Canonical Curriculum Manifest Provider
 */
export class CanonicalManifestProvider {
  private manifest: CanonicalCurriculumManifest;
  private lessonsById = new Map<string, CanonicalManifestLessonRef>();
  private modulesById = new Map<string, CanonicalManifestModule>();
  private topicsById = new Map<string, CanonicalManifestTopic>();
  private levelsById = new Map<string, CanonicalManifestLevel>();

  constructor() {
    this.manifest = normalizeManifest();

    for (const les of this.manifest.lessons) {
      this.lessonsById.set(les.lessonId, les);
    }
    for (const mod of this.manifest.modules) {
      this.modulesById.set(mod.moduleId, mod);
    }
    for (const top of this.manifest.topics) {
      this.topicsById.set(top.topicId, top);
    }
    for (const lvl of this.manifest.levels) {
      this.levelsById.set(lvl.levelId, lvl);
      this.levelsById.set(lvl.phaseId, lvl);
    }
  }

  public getManifest(): CanonicalCurriculumManifest {
    return this.manifest;
  }

  public getLevels(): CanonicalManifestLevel[] {
    return [...this.manifest.levels].sort((a, b) => a.position - b.position);
  }

  public getLevel(levelOrPhaseId: string): CanonicalManifestLevel | undefined {
    return this.levelsById.get(levelOrPhaseId);
  }

  public getModules(): CanonicalManifestModule[] {
    return [...this.manifest.modules].sort((a, b) => a.position - b.position);
  }

  public getModule(moduleId: string): CanonicalManifestModule | undefined {
    return this.modulesById.get(moduleId);
  }

  public getModulesForLevel(levelOrPhaseId: string): CanonicalManifestModule[] {
    return this.manifest.modules
      .filter((m) => m.levelId === levelOrPhaseId || m.phaseId === levelOrPhaseId)
      .sort((a, b) => a.position - b.position);
  }

  public getTopics(): CanonicalManifestTopic[] {
    return [...this.manifest.topics].sort((a, b) => a.position - b.position);
  }

  public getTopic(topicId: string): CanonicalManifestTopic | undefined {
    return this.topicsById.get(topicId);
  }

  public getTopicsForModule(moduleId: string): CanonicalManifestTopic[] {
    return this.manifest.topics
      .filter((t) => t.moduleId === moduleId)
      .sort((a, b) => a.position - b.position);
  }

  public getLessons(): CanonicalManifestLessonRef[] {
    return [...this.manifest.lessons].sort((a, b) => a.position - b.position);
  }

  public getLesson(lessonId: string): CanonicalManifestLessonRef | undefined {
    return this.lessonsById.get(lessonId);
  }

  public getLessonsForModule(moduleId: string): CanonicalManifestLessonRef[] {
    return this.manifest.lessons
      .filter((l) => l.moduleId === moduleId)
      .sort((a, b) => a.position - b.position);
  }

  public getLessonsForTopic(topicId: string): CanonicalManifestLessonRef[] {
    return this.manifest.lessons
      .filter((l) => l.topicId === topicId)
      .sort((a, b) => a.position - b.position);
  }

  /**
   * Returns all canonical lesson IDs in authoritative global sequence from the manifest.
   */
  public getOrderedLessonIds(): string[] {
    return this.getLessons().map((l) => l.lessonId);
  }

  /**
   * Alias for getOrderedLessonIds
   */
  public getCanonicalLessonIds(): string[] {
    return this.getOrderedLessonIds();
  }

  /**
   * Returns all canonical lesson IDs belonging to a specific module in manifest order.
   */
  public getLessonIdsForModule(moduleId: string): string[] {
    return this.getLessonsForModule(moduleId).map((l) => l.lessonId);
  }

  /**
   * Returns all canonical lesson objects belonging to a specific module.
   */
  public getCanonicalLessonsForModule(moduleId: string): CanonicalLesson[] {
    return this.getLessonsForModule(moduleId)
      .map((ref) => canonicalProvider.getCanonicalLesson(ref.lessonId))
      .filter((l): l is CanonicalLesson => l !== undefined);
  }

  /**
   * Returns all canonical lesson IDs belonging to a specific topic in manifest order.
   */
  public getLessonIdsForTopic(topicId: string): string[] {
    return this.getLessonsForTopic(topicId).map((l) => l.lessonId);
  }

  /**
   * Returns all canonical lesson objects belonging to a specific topic.
   */
  public getCanonicalLessonsForTopic(topicId: string): CanonicalLesson[] {
    return this.getLessonsForTopic(topicId)
      .map((ref) => canonicalProvider.getCanonicalLesson(ref.lessonId))
      .filter((l): l is CanonicalLesson => l !== undefined);
  }

  /**
   * Checks whether a lesson ID belongs to the canonical curriculum manifest.
   */
  public isCurriculumLesson(lessonId: string): boolean {
    return this.lessonsById.has(lessonId);
  }

  /**
   * Returns the next canonical lesson ID in curriculum manifest sequence.
   */
  public getNextLessonId(currentLessonId: string): string | undefined {
    const ordered = this.getOrderedLessonIds();
    const index = ordered.indexOf(currentLessonId);
    if (index >= 0 && index < ordered.length - 1) {
      return ordered[index + 1];
    }
    return undefined;
  }

  /**
   * Returns the previous canonical lesson ID in curriculum manifest sequence.
   */
  public getPreviousLessonId(currentLessonId: string): string | undefined {
    const ordered = this.getOrderedLessonIds();
    const index = ordered.indexOf(currentLessonId);
    if (index > 0) {
      return ordered[index - 1];
    }
    return undefined;
  }

  /**
   * Returns the next canonical lesson object in curriculum manifest sequence.
   */
  public getNextCanonicalLesson(currentLessonId: string): CanonicalLesson | undefined {
    const nextId = this.getNextLessonId(currentLessonId);
    return nextId ? canonicalProvider.getCanonicalLesson(nextId) : undefined;
  }

  /**
   * Returns the previous canonical lesson object in curriculum manifest sequence.
   */
  public getPreviousCanonicalLesson(currentLessonId: string): CanonicalLesson | undefined {
    const prevId = this.getPreviousLessonId(currentLessonId);
    return prevId ? canonicalProvider.getCanonicalLesson(prevId) : undefined;
  }

  /**
   * Validates the integrity of the manifest hierarchy against dynamically discovered lesson files.
   */
  public validateManifestReferences(
    lessonsOverride?: CanonicalLesson[],
    options?: { allowPartial?: boolean },
  ): ManifestValidationReport {
    const errors: ManifestValidationDiagnostic[] = [];
    const warnings: ManifestValidationDiagnostic[] = [];

    const isPartial = options?.allowPartial ?? isCurriculumBuildMode();
    const lessons = lessonsOverride ?? canonicalProvider.getAllCanonicalLessons();
    const lessonIds = new Set(lessons.map((l) => l.id));

    // 1. Check for duplicate lesson IDs among discovered lessons
    const seenIds = new Set<string>();
    for (const les of lessons) {
      if (seenIds.has(les.id)) {
        errors.push({
          type: "duplicate-id",
          severity: "error",
          message: `Duplicate canonical lesson ID detected: "${les.id}"`,
          id: les.id,
        });
      }
      seenIds.add(les.id);
    }

    // 2. Validate module & topic references in lessons
    const validModuleIds = new Set(this.manifest.modules.map((m) => m.moduleId));
    const validTopicIds = new Set(this.manifest.topics.map((t) => t.topicId));

    for (const les of lessons) {
      const modId = (les as any).moduleId;
      if (modId && !validModuleIds.has(modId)) {
        errors.push({
          type: "invalid-module",
          severity: "error",
          message: `Lesson "${les.id}" references invalid moduleId "${modId}"`,
          id: les.id,
        });
      }

      if (les.topicId && !validTopicIds.has(les.topicId)) {
        errors.push({
          type: "invalid-topic",
          severity: "error",
          message: `Lesson "${les.id}" references invalid topicId "${les.topicId}"`,
          id: les.id,
        });
      }
    }

    // 3. Manifest references missing lesson
    for (const top of this.manifest.topics) {
      for (const expectedId of top.lessonIds) {
        if (!lessonIds.has(expectedId)) {
          if (isPartial) {
            warnings.push({
              type: "missing-lesson",
              severity: "warning",
              message: `Planned lesson "${expectedId}" in topic "${top.topicId}" has not yet been authored (Build Mode)`,
              id: expectedId,
            });
          } else {
            errors.push({
              type: "missing-lesson",
              severity: "error",
              message: `Manifest topic "${top.topicId}" references missing lesson "${expectedId}"`,
              id: expectedId,
            });
          }
        }
      }
    }

    // 4. Canonical file missing from manifest topic registration
    const manifestLessonIds = new Set(this.manifest.lessons.map((l) => l.lessonId));

    for (const les of lessons) {
      if (!manifestLessonIds.has(les.id)) {
        warnings.push({
          type: "orphan-lesson",
          severity: "warning",
          message: `Discovered canonical lesson "${les.id}" is not explicitly registered in curriculum manifest`,
          id: les.id,
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      totalDiscoveredLessons: lessons.length,
      totalManifestLessons: manifestLessonIds.size,
    };
  }
}

export const canonicalManifestProvider = new CanonicalManifestProvider();
export const canonicalManifest = canonicalManifestProvider;
