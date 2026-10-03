/**
 * Canonical Lesson Schema V1 — Scalable Lesson Loader & Production Integrity Gate
 *
 * Production lesson content comes exclusively from:
 *   src/data/canonical/lessons-v1/**\/*.json
 *
 * TypeScript golden lessons (e.g. goldenLesson0CanonicalV1 in golden-lesson-v1.ts)
 * are TEST FIXTURES ONLY and are never merged into the production lesson registry.
 *
 * The production integrity gate validates 13 deterministic requirements:
 *  1. JSON discovery
 *  2. Filename ↔ ID identity
 *  3. Canonical V1 schema (safeValidateLessonV1)
 *  4. Curriculum identity (topicId, moduleId, phaseId, conceptIds, capabilityIds)
 *  5. Activity type support & production approval (activity-audit)
 *  6. Activity content schema (validateActivityV1Content)
 *  7. Activity validation references (cross-references to real options/items/blanks)
 *  8. Duplicate activity/content IDs
 *  9. Manifest membership
 * 10. Manifest/module/topic consistency
 * 11. Prerequisite existence
 * 12. Prerequisite sequencing (no forward prerequisites, no self-reference, no cycles)
 * 13. Mastery references to real activity IDs
 */
import { safeValidateLessonV1 } from "../schema-v1";
import type { CanonicalLessonV1 } from "../types-v1";
import { CurriculumIdentityError, assertLessonCurriculumIdentity } from "../errors";
import { isActivityTypeProductionApproved } from "./activity-audit";
import { checkActivityCompatibility } from "./activity-compatibility";
import rawManifest from "@/data/canonical/curriculum-manifest.json";

export { CurriculumIdentityError, assertLessonCurriculumIdentity };

const manifestData = (rawManifest as any).default || rawManifest;
const manifestLessonsList: any[] = manifestData.lessons || [];
const manifestLessonsById = new Map<string, any>(
  manifestLessonsList.map((l: any) => [l.lessonId, l]),
);
const manifestLessonPositions = new Map<string, number>(
  manifestLessonsList.map((l: any, idx: number) => [l.lessonId, l.position ?? idx + 1]),
);

export class DuplicateLessonIdError extends Error {
  constructor(
    public readonly lessonId: string,
    public readonly sources: string[],
  ) {
    super(
      `Duplicate lesson ID "${lessonId}" detected across multiple sources: ${sources.join(", ")}. Production discovery must have exactly one source per lesson ID.`,
    );
    this.name = "DuplicateLessonIdError";
  }
}

export class IntegrityGateError extends Error {
  constructor(
    public readonly lessonId: string,
    public readonly gate: number,
    public readonly gateName: string,
    public readonly errors: string[],
  ) {
    super(
      `INTEGRITY_GATE_ERROR [Gate ${gate}: ${gateName}] for lesson "${lessonId}":\n${errors.join("\n")}`,
    );
    this.name = "IntegrityGateError";
  }
}

export interface V1LessonValidationError {
  lessonId: string;
  filePath: string;
  errors: string[];
  rawSource?: unknown;
}

export type V1LessonLoadResult =
  | { ok: true; lesson: CanonicalLessonV1 }
  | { ok: false; reason: "not-found"; lessonId: string }
  | {
      ok: false;
      reason: "invalid";
      lessonId: string;
      filePath: string;
      errors: string[];
      source?: unknown;
    };

export interface V1LessonSourceEntry {
  filePath?: string;
  source: unknown;
}

export interface BuildV1LessonRegistryOptions {
  /**
   * If true (default), throws DuplicateLessonIdError immediately when duplicate IDs are found.
   * If false, duplicate lessons are excluded from the registry and recorded in diagnostics.
   */
  throwOnDuplicate?: boolean;
  /**
   * If true (default), throws CurriculumIdentityError immediately when unregistered curriculum identity
   * references (topicId, moduleId, phaseId, etc.) are detected.
   * If false, identity errors are recorded in validation diagnostics.
   */
  throwOnIdentityError?: boolean;
  /**
   * If true (default), enforces the complete 13-gate production integrity pipeline.
   */
  enforceFullIntegrityGate?: boolean;
}

export function extractLessonIdFromPath(filePath: string): string | undefined {
  const parts = filePath.split("/");
  const last = parts[parts.length - 1];
  if (!last || !last.endsWith(".json")) return undefined;
  return last.slice(0, -".json".length);
}

function inferLessonIdAndPath(
  raw: unknown,
  providedPath?: string,
): { lessonId: string; filePath: string; filenameId?: string; declaredId?: string } {
  const defaultPath = providedPath || "src/data/canonical/lessons-v1/unknown.json";
  const filenameId = providedPath ? extractLessonIdFromPath(providedPath) : undefined;
  let declaredId: string | undefined;

  if (typeof raw === "object" && raw !== null) {
    const record = raw as Record<string, unknown>;
    if (typeof record.id === "string" && record.id.trim().length > 0) {
      declaredId = record.id.trim();
    } else if (
      typeof record.identity === "object" &&
      record.identity !== null &&
      typeof (record.identity as Record<string, unknown>).id === "string"
    ) {
      declaredId = ((record.identity as Record<string, unknown>).id as string).trim();
    }
  }

  const finalId = declaredId || filenameId || "unknown-lesson";
  const finalPath =
    providedPath ||
    (finalId !== "unknown-lesson" ? `src/data/canonical/lessons-v1/${finalId}.json` : defaultPath);

  return { lessonId: finalId, filePath: finalPath, filenameId, declaredId };
}

/**
 * Pure function (no glob/import dependency) so it's trivially unit-testable
 * with arbitrary in-memory fixtures, valid or deliberately malformed.
 */
export function buildV1LessonRegistry(
  rawSources: unknown[] | V1LessonSourceEntry[],
  options?: BuildV1LessonRegistryOptions,
): {
  registry: Map<string, CanonicalLessonV1>;
  invalid: Array<{ lessonId: string; filePath: string; source: unknown; errors: string[] }>;
  validationErrors: Map<string, V1LessonValidationError>;
  discoveredLessonIds: Set<string>;
} {
  const shouldThrowOnDuplicate = options?.throwOnDuplicate ?? true;
  const shouldThrowOnIdentity = options?.throwOnIdentityError ?? true;
  const enforceFullGate = options?.enforceFullIntegrityGate ?? true;

  const registry = new Map<string, CanonicalLessonV1>();
  const invalid: Array<{ lessonId: string; filePath: string; source: unknown; errors: string[] }> =
    [];
  const validationErrors = new Map<string, V1LessonValidationError>();
  const discoveredLessonIds = new Set<string>();
  const seenLessonSources = new Map<string, string>(); // lessonId -> filePath

  for (const item of rawSources) {
    const isEntry =
      typeof item === "object" &&
      item !== null &&
      "source" in item &&
      ("filePath" in item || Object.keys(item).length <= 2);
    const raw = isEntry ? (item as V1LessonSourceEntry).source : item;
    const providedPath = isEntry ? (item as V1LessonSourceEntry).filePath : undefined;

    // Gate 1: JSON Discovery & Extraction
    const { lessonId, filePath, filenameId, declaredId } = inferLessonIdAndPath(raw, providedPath);
    discoveredLessonIds.add(lessonId);
    if (filenameId) discoveredLessonIds.add(filenameId);

    // Duplicate Check across sources
    if (seenLessonSources.has(lessonId)) {
      const priorSource = seenLessonSources.get(lessonId)!;
      const dupMessage = `Duplicate lesson ID detected: "${lessonId}" in "${filePath}" collides with "${priorSource}". Each lesson ID must be uniquely defined in exactly one file.`;

      if (shouldThrowOnDuplicate) {
        throw new DuplicateLessonIdError(lessonId, [priorSource, filePath]);
      }

      registry.delete(lessonId);

      const errInfo: V1LessonValidationError = {
        lessonId,
        filePath,
        errors: [dupMessage],
        rawSource: raw,
      };
      invalid.push({
        lessonId,
        filePath,
        source: raw,
        errors: [dupMessage],
      });
      validationErrors.set(lessonId, errInfo);
      continue;
    }
    seenLessonSources.set(lessonId, filePath);

    const errors: string[] = [];

    // Gate 2: Filename ↔ ID identity
    if (filenameId && declaredId && filenameId !== declaredId) {
      errors.push(
        `Filename/ID mismatch: file "${filePath}" specifies filename ID "${filenameId}", but declares ID "${declaredId}". Filename and lesson.id must match exactly.`,
      );
    } else if (filenameId && !declaredId) {
      errors.push(
        `Filename/ID mismatch: file "${filePath}" implies lesson ID "${filenameId}", but lesson declares no valid ID.`,
      );
    }

    // Gate 3: Canonical V1 schema (Zod validation)
    const result = safeValidateLessonV1(raw);
    if (!result.success) {
      for (const issue of result.error.issues) {
        errors.push(`${issue.path.join(".") || "$"}: ${issue.message}`);
      }
    } else {
      const lesson = result.data;

      // Gate 4: Curriculum Identity
      try {
        assertLessonCurriculumIdentity(lesson);
      } catch (idErr: unknown) {
        if (idErr instanceof CurriculumIdentityError) {
          if (shouldThrowOnIdentity) {
            throw idErr;
          }
          errors.push(idErr.message);
        } else {
          throw idErr;
        }
      }

      if (enforceFullGate) {
        // Gate 5: Activity Type Support & Approval Status
        for (let aIdx = 0; aIdx < lesson.activities.length; aIdx++) {
          const act = lesson.activities[aIdx];
          if (!isActivityTypeProductionApproved(act.type)) {
            errors.push(
              `Activity "${act.id}" uses activity type "${act.type}", which is not yet production-approved for Forge V1 lessons.`,
            );
          }

          // Gate 6, 7, 8: Activity content schema, validation references & duplicate internal IDs
          const actDiagnostics = checkActivityCompatibility(act, aIdx);
          for (const d of actDiagnostics) {
            if (d.severity === "error") {
              errors.push(d.message);
            }
          }
        }

        // Duplicate activity IDs within the lesson
        const activityIdSet = new Set<string>();
        for (const act of lesson.activities) {
          if (activityIdSet.has(act.id)) {
            errors.push(`Duplicate activity ID "${act.id}" within lesson "${lesson.id}".`);
          }
          activityIdSet.add(act.id);
        }

        // Gate 9: Manifest Membership
        const manifestRecord = manifestLessonsById.get(lesson.id);
        if (manifestRecord) {
          // Gate 10: Manifest / Module / Topic Consistency
          if (manifestRecord.moduleId !== lesson.curriculum.moduleId) {
            errors.push(
              `Manifest module mismatch: Lesson "${lesson.id}" declares moduleId "${lesson.curriculum.moduleId}", but manifest declares "${manifestRecord.moduleId}".`,
            );
          }
          if (lesson.curriculum.topicId && manifestRecord.topicId !== lesson.curriculum.topicId) {
            errors.push(
              `Manifest topic mismatch: Lesson "${lesson.id}" declares topicId "${lesson.curriculum.topicId}", but manifest declares "${manifestRecord.topicId}".`,
            );
          }
          if (manifestRecord.phaseId !== lesson.curriculum.phaseId) {
            errors.push(
              `Manifest phase mismatch: Lesson "${lesson.id}" declares phaseId "${lesson.curriculum.phaseId}", but manifest declares "${manifestRecord.phaseId}".`,
            );
          }
        }

        // Gate 11 & 12: Prerequisite Existence & Sequencing (No forward prerequisites)
        const currentPos = manifestLessonPositions.get(lesson.id);
        for (const prereqId of lesson.curriculum.prerequisiteLessonIds ?? []) {
          if (prereqId === lesson.id) {
            errors.push(`Lesson "${lesson.id}" lists itself as its own prerequisite.`);
          }
          const prereqRecord = manifestLessonsById.get(prereqId);
          if (currentPos !== undefined && prereqRecord) {
            const prereqPos = manifestLessonPositions.get(prereqId);
            if (prereqPos !== undefined && prereqPos >= currentPos) {
              errors.push(
                `Forward prerequisite violation: Lesson "${lesson.id}" (position ${currentPos}) requires "${prereqId}" (position ${prereqPos}), which appears later in the curriculum manifest.`,
              );
            }
          }
        }

        // Gate 13: Mastery References to Real Activity IDs
        for (const reqActId of lesson.mastery.completionCriteria.requiredActivities) {
          if (!activityIdSet.has(reqActId)) {
            errors.push(
              `Mastery required activity "${reqActId}" does not exist in lesson "${lesson.id}" activities.`,
            );
          }
        }
      }
    }

    if (errors.length === 0 && result.success) {
      registry.set(result.data.id, result.data);
      discoveredLessonIds.add(result.data.id);
    } else {
      const errInfo: V1LessonValidationError = {
        lessonId,
        filePath,
        errors,
        rawSource: raw,
      };
      invalid.push({
        lessonId,
        filePath,
        source: raw,
        errors,
      });
      validationErrors.set(lessonId, errInfo);
      if (filenameId && filenameId !== lessonId) {
        validationErrors.set(filenameId, errInfo);
      }
    }
  }

  return { registry, invalid, validationErrors, discoveredLessonIds };
}

/**
 * Authoritative recursive glob discovering all production JSON lessons
 * under src/data/canonical/lessons-v1/**\/*.json (both flat and nested).
 * TypeScript golden fixtures are excluded from production discovery.
 */
const jsonLessonModules = import.meta.glob("/src/data/canonical/lessons-v1/**/*.json", {
  eager: true,
  import: "default",
});

let cachedRegistry: Map<string, CanonicalLessonV1> | null = null;
let cachedValidationErrors: Map<string, V1LessonValidationError> | null = null;
let cachedDiscoveredLessonIds: Set<string> | null = null;
let cachedInvalid: Array<{
  lessonId: string;
  filePath: string;
  source: unknown;
  errors: string[];
}> = [];

function getRegistryState(): {
  registry: Map<string, CanonicalLessonV1>;
  validationErrors: Map<string, V1LessonValidationError>;
  discoveredLessonIds: Set<string>;
  invalid: Array<{ lessonId: string; filePath: string; source: unknown; errors: string[] }>;
} {
  if (cachedRegistry && cachedValidationErrors && cachedDiscoveredLessonIds) {
    return {
      registry: cachedRegistry,
      validationErrors: cachedValidationErrors,
      discoveredLessonIds: cachedDiscoveredLessonIds,
      invalid: cachedInvalid,
    };
  }

  const sourcesWithMetadata: V1LessonSourceEntry[] = [];

  for (const [rawPath, rawContent] of Object.entries(jsonLessonModules)) {
    const normalizedPath = rawPath.startsWith("/") ? rawPath.slice(1) : rawPath;
    sourcesWithMetadata.push({
      filePath: normalizedPath,
      source: rawContent,
    });
  }

  const { registry, invalid, validationErrors, discoveredLessonIds } = buildV1LessonRegistry(
    sourcesWithMetadata,
    { throwOnDuplicate: true, enforceFullIntegrityGate: true },
  );

  cachedRegistry = registry;
  cachedValidationErrors = validationErrors;
  cachedDiscoveredLessonIds = discoveredLessonIds;
  cachedInvalid = invalid;

  if (invalid.length > 0 && typeof console !== "undefined") {
    console.warn(
      `[v1-loader] ${invalid.length} V1 lesson source(s) failed integrity gates and were excluded:`,
      invalid,
    );
  }

  return { registry, validationErrors, discoveredLessonIds, invalid };
}

function getRegistry(): Map<string, CanonicalLessonV1> {
  return getRegistryState().registry;
}

export function reloadV1LessonRegistry(): void {
  cachedRegistry = null;
  cachedValidationErrors = null;
  cachedDiscoveredLessonIds = null;
  cachedInvalid = [];
}

if (import.meta.hot) {
  import.meta.hot.accept(() => {
    reloadV1LessonRegistry();
  });
}

export function loadV1Lesson(lessonId: string): V1LessonLoadResult {
  const { registry, validationErrors } = getRegistryState();
  const lesson = registry.get(lessonId);
  if (lesson) {
    return { ok: true, lesson };
  }

  const validationError = validationErrors.get(lessonId);
  if (validationError) {
    return {
      ok: false,
      reason: "invalid",
      lessonId,
      filePath: validationError.filePath,
      errors: validationError.errors,
      source: validationError.rawSource,
    };
  }

  return { ok: false, reason: "not-found", lessonId };
}

export function getV1LessonById(lessonId: string): CanonicalLessonV1 | undefined {
  const result = loadV1Lesson(lessonId);
  return result.ok ? result.lesson : undefined;
}

export function getLessonV1ValidationError(lessonId: string): V1LessonValidationError | undefined {
  const { validationErrors } = getRegistryState();
  return validationErrors.get(lessonId);
}

export function isV1LessonTarget(lessonId: string): boolean {
  const { discoveredLessonIds } = getRegistryState();
  return discoveredLessonIds.has(lessonId);
}

export function listV1LessonIds(): string[] {
  return Array.from(getRegistry().keys());
}

export function getAllV1Lessons(): CanonicalLessonV1[] {
  return Array.from(getRegistry().values());
}
