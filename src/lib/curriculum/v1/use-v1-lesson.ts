import { useMemo } from "react";
import { getV1LessonById } from "./loader";

/**
 * Mirrors the existing `useCanonicalLesson` hook's shape
 * (`src/lib/hooks/use-content.ts`) so the route's resolver reads the same
 * way for all three layers.
 */
export function useV1Lesson(id: string | undefined) {
  return useMemo(() => (id ? getV1LessonById(id) : undefined), [id]);
}
