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

export type V1LessonLoadResult =
  | { ok: true; lesson: CanonicalLessonV1 }
  | { ok: false; reason: "not-found"; lessonId: string }
  | { ok: false; reason: "invalid"; lessonId: string; errors: string[] };

/**
 * Pure function (no glob/import dependency) so it's trivially unit-testable
 * with arbitrary in-memory fixtures, valid or deliberately malformed.
 */
export function buildV1LessonRegistry(
  rawSources: unknown[],
): { registry: Map<string, CanonicalLessonV1>; invalid: Array<{ source: unknown; errors: string[] }> } {
  const registry = new Map<string, CanonicalLessonV1>();
  const invalid: Array<{ source: unknown; errors: string[] }> = [];

  for (const raw of rawSources) {
    const result = safeValidateLessonV1(raw);
    if (result.success) {
      registry.set(result.data.id, result.data);
    } else {
      invalid.push({
        source: raw,
        errors: result.error.issues.map((issue) => `${issue.path.join(".") || "$"}: ${issue.message}`),
      });
    }
  }
  return { registry, invalid };
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
let cachedInvalid: Array<{ source: unknown; errors: string[] }> = [];

function getRegistry(): Map<string, CanonicalLessonV1> {
  if (cachedRegistry) return cachedRegistry;
  const jsonSources = Object.values(jsonLessonModules);
  const { registry, invalid } = buildV1LessonRegistry([...GOLDEN_LESSONS_V1, ...jsonSources]);
  cachedRegistry = registry;
  cachedInvalid = invalid;
  if (invalid.length > 0 && typeof console !== "undefined") {
    // Surfaced, not swallowed — an author should see this immediately rather
    // than discover a silently-skipped lesson later.
    console.warn(
      `[v1-loader] ${invalid.length} V1 lesson source(s) failed schema validation and were excluded:`,
      invalid,
    );
  }
  return registry;
}

export function loadV1Lesson(lessonId: string): V1LessonLoadResult {
  const registry = getRegistry();
  const lesson = registry.get(lessonId);
  if (!lesson) {
    return { ok: false, reason: "not-found", lessonId };
  }
  return { ok: true, lesson };
}

export function getV1LessonById(lessonId: string): CanonicalLessonV1 | undefined {
  const result = loadV1Lesson(lessonId);
  return result.ok ? result.lesson : undefined;
}

export function listV1LessonIds(): string[] {
  return Array.from(getRegistry().keys());
}

/** Test-only escape hatch to reset the module-level cache between test cases. */
export function __resetV1LessonRegistryCacheForTests(): void {
  cachedRegistry = null;
  cachedInvalid = [];
}

export function getV1LessonLoadDiagnostics(): Array<{ source: unknown; errors: string[] }> {
  getRegistry();
  return cachedInvalid;
}
