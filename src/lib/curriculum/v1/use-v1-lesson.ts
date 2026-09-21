import { useMemo, useState, useCallback } from "react";
import {
  getV1LessonById,
  getLessonV1ValidationError,
  isV1LessonTarget,
  reloadV1LessonRegistry,
  type V1LessonValidationError,
} from "./loader";
import type { CanonicalLessonV1 } from "../types-v1";

/**
 * Mirrors the existing `useCanonicalLesson` hook's shape
 * (`src/lib/hooks/use-content.ts`) so the route's resolver reads the same
 * way for all three layers.
 */
export function useV1Lesson(id: string | undefined) {
  return useMemo(() => (id ? getV1LessonById(id) : undefined), [id]);
}

export interface UseV1LessonLoadResult {
  lesson: CanonicalLessonV1 | undefined;
  error: V1LessonValidationError | undefined;
  isV1Target: boolean;
  reload: () => void;
}

export function useV1LessonLoad(id: string | undefined): UseV1LessonLoadResult {
  const [version, setVersion] = useState(0);

  const reload = useCallback(() => {
    reloadV1LessonRegistry();
    setVersion((v) => v + 1);
  }, []);

  return useMemo(() => {
    if (!id) {
      return {
        lesson: undefined,
        error: undefined,
        isV1Target: false,
        reload,
      };
    }
    const isTarget = isV1LessonTarget(id);
    const lesson = getV1LessonById(id);
    const error = getLessonV1ValidationError(id);

    return {
      lesson,
      error,
      isV1Target: isTarget,
      reload,
    };
  }, [id, version, reload]);
}

