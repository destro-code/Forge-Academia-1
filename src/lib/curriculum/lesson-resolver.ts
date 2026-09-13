/**
 * Three-layer lesson resolver — decides which lesson architecture renders
 * a given `/learn/:lessonId`.
 *
 * Priority: V1 canonical (Layer 2) > Layer 1 canonical > legacy.
 *
 * Kept as a small, pure function (no React, no router) so it's unit-testable
 * without mounting the route. `src/routes/lesson.$lessonId.tsx` calls this
 * with whatever each layer's existing lookup already returned — it does not
 * duplicate any of those lookups itself.
 */

export type LessonLayer = "v1" | "layer1" | "legacy" | "not-found";

export function resolveLessonLayer(input: {
  v1Lesson: unknown | undefined;
  layer1Lesson: unknown | undefined;
  legacyLesson: unknown | undefined;
}): LessonLayer {
  if (input.v1Lesson) return "v1";
  if (input.layer1Lesson) return "layer1";
  if (input.legacyLesson) return "legacy";
  return "not-found";
}
