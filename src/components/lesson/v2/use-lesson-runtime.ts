import { useCallback } from "react";
import { useLessonSession } from "@/lib/learning-engine/use-lesson-session";
import { useProgress } from "@/lib/hooks/use-progress";
import type { CanonicalLesson } from "@/lib/curriculum/types";

/**
 * `useLessonRuntime` — the player/runtime boundary named in
 * FORGE_LESSON_PLAYER_V2_BLUEPRINT.md §1. It is intentionally a thin
 * pass-through over the exact `useLessonSession` hook the vertical slice
 * proved works with an adapted V1 lesson — no new runtime behavior is
 * introduced here. `LessonExperience` and every v2 surface component are
 * only allowed to reach the learning engine through this hook's return
 * value; nothing below it calls `session-engine.ts`/`evidence-engine.ts`
 * directly, matching the same discipline the adapter enforced in the
 * vertical slice.
 */
export function useLessonRuntime(lesson: CanonicalLesson, onLessonComplete?: () => void) {
  const { completeLesson: completeGlobalProgress } = useProgress();

  const handleComplete = useCallback(() => {
    completeGlobalProgress(lesson.id);
    onLessonComplete?.();
  }, [completeGlobalProgress, lesson.id, onLessonComplete]);

  return useLessonSession(lesson, { onComplete: handleComplete, skills: [], misconceptions: [] });
}
