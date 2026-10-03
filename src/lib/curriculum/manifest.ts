import curriculumHierarchyData from "../../data/canonical/curriculum-hierarchy.json";
import { canonicalProvider } from "./canonical-provider";
import { isCurriculumBuildMode } from "./curriculum-mode";
import type { CanonicalLesson } from "./types";

/**
 * Canonical Curriculum Manifest Boundary
 *
 * Defines the authoritative curriculum manifest that determines canonical lesson ordering,
 * module membership, navigation, progression, and completeness.
 */

export interface CanonicalManifestLessonRef {
  id: string;
  slug?: string;
  title: string;
  topicId?: string;
  moduleId: string;
  order: number;
}

export interface CanonicalManifestTopic {
  id: string;
  moduleId: string;
  title: string;
  order: number;
  lessonIds: string[];
}

export interface CanonicalManifestModule {
  id: string;
  phaseId: string;
  title: string;
  topicIds: string[];
  lessonIds?: string[];
}

export interface CanonicalCurriculumManifest {
  version: string;
  phases: Array<{ id: string; title: string; moduleIds: string[] }>;
  modules: CanonicalManifestModule[];
  topics: CanonicalManifestTopic[];
  lessons: CanonicalManifestLessonRef[];
}

export interface ManifestValidationDiagnostic {
  type: "missing-lesson" | "orphan-lesson" | "duplicate-id" | "invalid-module" | "invalid-topic";
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
 * Authoritative Canonical Curriculum Manifest Provider
 */
export class CanonicalManifestProvider {
  /**
   * Returns all canonical lesson IDs in authoritative global sequence.
   */
  public getOrderedLessonIds(): string[] {
    return canonicalProvider.getLessons().map((l) => l.id);
  }

  /**
   * Alias for getOrderedLessonIds
   */
  public getCanonicalLessonIds(): string[] {
    return this.getOrderedLessonIds();
  }

  /**
   * Returns all canonical lesson IDs belonging to a specific module.
   */
  public getLessonIdsForModule(moduleId: string): string[] {
    return canonicalProvider.getLessonsForModule(moduleId).map((l) => l.id);
  }

  /**
   * Returns all canonical lesson objects belonging to a specific module.
   */
  public getCanonicalLessonsForModule(moduleId: string): CanonicalLesson[] {
    return canonicalProvider.getLessonsForModule(moduleId);
  }

  /**
   * Returns all canonical lesson IDs belonging to a specific topic.
   */
  public getLessonIdsForTopic(topicId: string): string[] {
    return canonicalProvider.getLessonsForTopic(topicId).map((l) => l.id);
  }

  /**
   * Returns all canonical lesson objects belonging to a specific topic.
   */
  public getCanonicalLessonsForTopic(topicId: string): CanonicalLesson[] {
    return canonicalProvider.getLessonsForTopic(topicId);
  }

  /**
   * Checks whether a lesson ID belongs to the canonical curriculum.
   */
  public isCurriculumLesson(lessonId: string): boolean {
    return canonicalProvider.isCanonicalLesson(lessonId);
  }

  /**
   * Returns the next canonical lesson ID in curriculum sequence.
   */
  public getNextLessonId(currentLessonId: string): string | undefined {
    return canonicalProvider.getNextLesson(currentLessonId)?.id;
  }

  /**
   * Returns the previous canonical lesson ID in curriculum sequence.
   */
  public getPreviousLessonId(currentLessonId: string): string | undefined {
    return canonicalProvider.getPreviousLesson(currentLessonId)?.id;
  }

  /**
   * Returns the next canonical lesson object in curriculum sequence.
   */
  public getNextCanonicalLesson(currentLessonId: string): CanonicalLesson | undefined {
    return canonicalProvider.getNextLesson(currentLessonId);
  }

  /**
   * Returns the previous canonical lesson object in curriculum sequence.
   */
  public getPreviousCanonicalLesson(currentLessonId: string): CanonicalLesson | undefined {
    return canonicalProvider.getPreviousLesson(currentLessonId);
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
    const validModuleIds = new Set(curriculumHierarchyData.modules.map((m) => m.id));
    const allTopics = canonicalProvider.getTopics();
    const validTopicIds = new Set(allTopics.map((t) => t.id));

    for (const les of lessons) {
      if ((les as any).moduleId && !validModuleIds.has((les as any).moduleId)) {
        errors.push({
          type: "invalid-module",
          severity: "error",
          message: `Lesson "${les.id}" references invalid moduleId "${(les as any).moduleId}"`,
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
    // If a topic explicitly lists lessonIds in canonical topics metadata, verify whether the file exists.
    for (const top of allTopics) {
      if (top.lessonIds) {
        for (const expectedId of top.lessonIds) {
          if (!lessonIds.has(expectedId)) {
            if (isPartial) {
              warnings.push({
                type: "missing-lesson",
                severity: "warning",
                message: `Planned lesson "${expectedId}" in topic "${top.id}" has not yet been authored (Build Mode)`,
                id: expectedId,
              });
            } else {
              errors.push({
                type: "missing-lesson",
                severity: "error",
                message: `Manifest topic "${top.id}" references missing lesson "${expectedId}"`,
                id: expectedId,
              });
            }
          }
        }
      }
    }

    // 4. Canonical file missing from manifest topic registration
    const manifestLessonIds = new Set<string>();
    for (const top of allTopics) {
      if (top.lessonIds) {
        for (const id of top.lessonIds) {
          manifestLessonIds.add(id);
        }
      }
    }

    for (const les of lessons) {
      if (!manifestLessonIds.has(les.id)) {
        warnings.push({
          type: "orphan-lesson",
          severity: "warning",
          message: `Discovered canonical lesson "${les.id}" is not explicitly registered in topic lessonIds`,
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
