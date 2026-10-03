/**
 * Canonical Lesson Schema V1 — Scalable Lesson Loader
 *
 * Production lesson content comes exclusively from:
 *   src/data/canonical/lessons-v1/*.json
 *
 * TypeScript golden lessons (e.g. goldenLesson0CanonicalV1 in golden-lesson-v1.ts)
 * are TEST FIXTURES ONLY and are never merged into the production lesson registry.
 *
 * Every discovered lesson file must satisfy:
 *  1. Canonical Lesson Schema V1 (safeValidateLessonV1)
 *  2. Filename identity (filename without .json must match lesson.id exactly)
 *  3. Unique lesson identity (duplicate lesson IDs fail loudly)
 */
import { safeValidateLessonV1 } from "../schema-v1";
import type { CanonicalLessonV1 } from "../types-v1";
import { CurriculumIdentityError, assertLessonCurriculumIdentity } from "../errors";

export { CurriculumIdentityError, assertLessonCurriculumIdentity };

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

    const { lessonId, filePath, filenameId, declaredId } = inferLessonIdAndPath(raw, providedPath);
    discoveredLessonIds.add(lessonId);
    if (filenameId) discoveredLessonIds.add(filenameId);

    // 1. Check for Duplicate Lesson ID
    if (seenLessonSources.has(lessonId)) {
      const priorSource = seenLessonSources.get(lessonId)!;
      const dupMessage = `Duplicate lesson ID detected: "${lessonId}" in "${filePath}" collides with "${priorSource}". Each lesson ID must be uniquely defined in exactly one file.`;

      if (shouldThrowOnDuplicate) {
        throw new DuplicateLessonIdError(lessonId, [priorSource, filePath]);
      }

      // Reject duplicate from registry and purge existing entry to avoid serving ambiguous content
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

    // 2. Check for Filename / lesson.id Mismatch
    const errors: string[] = [];
    if (filenameId && declaredId && filenameId !== declaredId) {
      errors.push(
        `Filename/ID mismatch: file "${filePath}" specifies filename ID "${filenameId}", but declares ID "${declaredId}". Filename and lesson.id must match exactly.`,
      );
    } else if (filenameId && !declaredId) {
      errors.push(
        `Filename/ID mismatch: file "${filePath}" implies lesson ID "${filenameId}", but lesson declares no valid ID.`,
      );
    }

    // 3. Check Canonical Schema
    const result = safeValidateLessonV1(raw);
    if (!result.success) {
      for (const issue of result.error.issues) {
        errors.push(`${issue.path.join(".") || "$"}: ${issue.message}`);
      }
    } else {
      // 4. Strict Curriculum Identity Validation (No silent fabrication)
      try {
        assertLessonCurriculumIdentity(result.data);
      } catch (idErr: unknown) {
        if (idErr instanceof CurriculumIdentityError) {
          if (options?.throwOnIdentityError ?? true) {
            throw idErr;
          }
          errors.push(idErr.message);
        } else {
          throw idErr;
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
 * Discovers all production JSON lessons under src/data/canonical/lessons-v1/*.json.
 * TypeScript golden fixtures are excluded from production discovery.
 */
const jsonLessonModules = import.meta.glob("/src/data/canonical/lessons-v1/*.json", {
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

  // Production loader validates and fails loudly if duplicate IDs or collisions exist
  const { registry, invalid, validationErrors, discoveredLessonIds } = buildV1LessonRegistry(
    sourcesWithMetadata,
    { throwOnDuplicate: true },
  );

  cachedRegistry = registry;
  cachedValidationErrors = validationErrors;
  cachedDiscoveredLessonIds = discoveredLessonIds;
  cachedInvalid = invalid;

  if (invalid.length > 0 && typeof console !== "undefined") {
    console.warn(
      `[v1-loader] ${invalid.length} V1 lesson source(s) failed schema validation and were excluded:`,
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
  const { registry, validationErrors, discoveredLessonIds } = getRegistryState();
  return (
    registry.has(lessonId) || validationErrors.has(lessonId) || discoveredLessonIds.has(lessonId)
  );
}

export function listV1LessonIds(): string[] {
  return Array.from(getRegistry().keys());
}

/** Test-only escape hatch to reset the module-level cache between test cases. */
export function __resetV1LessonRegistryCacheForTests(): void {
  reloadV1LessonRegistry();
}

export function getV1LessonLoadDiagnostics(): Array<{
  lessonId: string;
  filePath: string;
  source: unknown;
  errors: string[];
}> {
  return getRegistryState().invalid;
}
