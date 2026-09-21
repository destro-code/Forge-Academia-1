/**
 * Canonical Lesson Schema V1 — Scalable Lesson Loader
 *
 * Replaces the pattern used by `canonical-provider.ts` (a hand-maintained
 * static `import` per lesson file — see FORGE_LAYER2_DESTINATION_AUDIT.md
 * §1/§4, flagged there as not scaling past the 39 files it already has) with
 * a directory scan, so future JSON-authored V1 lessons never require a code
 * change here.
 *
 * Two sources are merged into one registry:
 *  1. JSON-authored lessons under src/data/canonical/lessons-v1/*.json,
 *     discovered via Vite's `import.meta.glob` — this is the path future
 *     generated lessons use.
 *  2. TypeScript-authored "golden" fixtures (currently just
 *     `goldenLesson0CanonicalV1`), registered explicitly in
 *     `golden-lesson-v1.ts` — kept out of the JSON scan because a .ts fixture
 *     can't be discovered by a JSON glob.
 *
 * Every lesson, regardless of source, is validated with `safeValidateLessonV1`
 * before being served — an invalid file never silently reaches the player.
 */
import { safeValidateLessonV1 } from "../schema-v1";
import type { CanonicalLessonV1 } from "../types-v1";
import { GOLDEN_LESSONS_V1 } from "../golden-lesson-v1";

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

function inferLessonIdAndPath(
  raw: unknown,
  providedPath?: string,
): { lessonId: string; filePath: string } {
  const defaultPath = providedPath || "src/data/canonical/lessons-v1/unknown.json";
  let inferredId = "";

  if (providedPath) {
    const fileName = providedPath.split("/").pop()?.replace(/\.json$/, "");
    if (fileName && fileName !== "unknown") {
      inferredId = fileName;
    }
  }

  if (typeof raw === "object" && raw !== null) {
    const record = raw as Record<string, unknown>;
    if (typeof record.id === "string" && record.id.trim().length > 0) {
      inferredId = record.id.trim();
    } else if (
      typeof record.identity === "object" &&
      record.identity !== null &&
      typeof (record.identity as Record<string, unknown>).id === "string"
    ) {
      inferredId = ((record.identity as Record<string, unknown>).id as string).trim();
    }
  }

  const finalId = inferredId || "unknown-lesson";
  const finalPath =
    providedPath ||
    (finalId !== "unknown-lesson"
      ? `src/data/canonical/lessons-v1/${finalId}.json`
      : defaultPath);

  return { lessonId: finalId, filePath: finalPath };
}

/**
 * Pure function (no glob/import dependency) so it's trivially unit-testable
 * with arbitrary in-memory fixtures, valid or deliberately malformed.
 */
export function buildV1LessonRegistry(
  rawSources: unknown[] | V1LessonSourceEntry[],
): {
  registry: Map<string, CanonicalLessonV1>;
  invalid: Array<{ lessonId: string; filePath: string; source: unknown; errors: string[] }>;
  validationErrors: Map<string, V1LessonValidationError>;
  discoveredLessonIds: Set<string>;
} {
  const registry = new Map<string, CanonicalLessonV1>();
  const invalid: Array<{ lessonId: string; filePath: string; source: unknown; errors: string[] }> =
    [];
  const validationErrors = new Map<string, V1LessonValidationError>();
  const discoveredLessonIds = new Set<string>();

  for (const item of rawSources) {
    const isEntry =
      typeof item === "object" && item !== null && "source" in item && ("filePath" in item || Object.keys(item).length <= 2);
    const raw = isEntry ? (item as V1LessonSourceEntry).source : item;
    const providedPath = isEntry ? (item as V1LessonSourceEntry).filePath : undefined;

    const { lessonId, filePath } = inferLessonIdAndPath(raw, providedPath);
    discoveredLessonIds.add(lessonId);

    const result = safeValidateLessonV1(raw);
    if (result.success) {
      registry.set(result.data.id, result.data);
      discoveredLessonIds.add(result.data.id);
    } else {
      const errors = result.error.issues.map(
        (issue) => `${issue.path.join(".") || "$"}: ${issue.message}`,
      );
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
    }
  }
  return { registry, invalid, validationErrors, discoveredLessonIds };
}

/**
 * `import.meta.glob` is a Vite build-time construct — every module found is
 * validated at load time via `buildV1LessonRegistry`. `eager: true` keeps
 * this synchronous, matching `canonical-provider.ts`'s existing convention
 * of a fully-loaded-at-import content registry rather than a lazy fetch.
 */
const jsonLessonModules = import.meta.glob("/src/data/canonical/lessons-v1/*.json", {
  eager: true,
  import: "default",
});

let cachedRegistry: Map<string, CanonicalLessonV1> | null = null;
let cachedValidationErrors: Map<string, V1LessonValidationError> | null = null;
let cachedDiscoveredLessonIds: Set<string> | null = null;
let cachedInvalid: Array<{ lessonId: string; filePath: string; source: unknown; errors: string[] }> =
  [];

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

  for (const golden of GOLDEN_LESSONS_V1) {
    sourcesWithMetadata.push({
      filePath: "src/lib/curriculum/golden-lesson-v1.ts",
      source: golden,
    });
  }

  for (const [rawPath, rawContent] of Object.entries(jsonLessonModules)) {
    const normalizedPath = rawPath.startsWith("/") ? rawPath.slice(1) : rawPath;
    sourcesWithMetadata.push({
      filePath: normalizedPath,
      source: rawContent,
    });
  }

  const { registry, invalid, validationErrors, discoveredLessonIds } =
    buildV1LessonRegistry(sourcesWithMetadata);

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

export function getLessonV1ValidationError(
  lessonId: string,
): V1LessonValidationError | undefined {
  const { validationErrors } = getRegistryState();
  return validationErrors.get(lessonId);
}

export function isV1LessonTarget(lessonId: string): boolean {
  const { registry, validationErrors, discoveredLessonIds } = getRegistryState();
  return (
    registry.has(lessonId) ||
    validationErrors.has(lessonId) ||
    discoveredLessonIds.has(lessonId)
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
