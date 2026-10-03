import { useMemo } from "react";
import { useModules, useTopics, useLessons } from "@/lib/hooks/use-content";
import { useProgress } from "@/lib/hooks/use-progress";
import { canonicalManifest } from "@/lib/curriculum/manifest";
import { canonicalProvider } from "@/lib/curriculum/canonical-provider";
import { adaptCanonicalLessonToLegacy } from "@/lib/curriculum/legacy-adapter";
import type { Module, Topic, Lesson } from "@/lib/types";

/**
 * Returns the deterministically ordered global curriculum lesson queue
 * derived strictly from the authoritative curriculum manifest (curriculum-manifest.json).
 */
export function getOrderedCurriculumLessons(
  _modules?: Module[],
  _topics?: Topic[],
  _lessons?: Lesson[],
): Lesson[] {
  const manifestLessons = canonicalManifest.getLessons();
  return manifestLessons.map((ref) => {
    const canonical = canonicalProvider.getCanonicalLesson(ref.lessonId);
    if (canonical) {
      return adaptCanonicalLessonToLegacy(canonical);
    }
    return {
      id: ref.lessonId,
      title: ref.title,
      description: ref.title,
      moduleId: ref.moduleId,
      topicId: ref.topicId,
      order: ref.position,
      difficulty: "Beginner",
      estimatedMinutes: 15,
      type: "lesson",
      tags: [],
    } as unknown as Lesson;
  });
}

/**
 * Resolves the appropriate resume lesson for the global curriculum:
 * 1. If lastActiveLessonId is valid, belongs to the curriculum, and is NOT completed, use it.
 * 2. Otherwise, use the first incomplete lesson in the ordered curriculum manifest.
 * 3. If all lessons are completed, fallback to the first curriculum lesson for review.
 */
export function getCurriculumResumeLesson(
  orderedLessons?: Lesson[],
  lastActiveLessonId?: string | null,
  lessonsCompleted: string[] = [],
): Lesson | undefined {
  const lessons =
    orderedLessons && orderedLessons.length > 0 ? orderedLessons : getOrderedCurriculumLessons();

  if (lessons.length === 0) return undefined;

  if (lastActiveLessonId && canonicalManifest.isCurriculumLesson(lastActiveLessonId)) {
    const lastActive = lessons.find((l) => l.id === lastActiveLessonId);
    if (lastActive && !lessonsCompleted.includes(lastActive.id)) {
      return lastActive;
    }
  }

  const firstIncomplete = lessons.find((l) => !lessonsCompleted.includes(l.id));
  return firstIncomplete || lessons[0];
}

/**
 * React hook providing the active curriculum resume lesson and ordered queue.
 */
export function useCurriculumResume() {
  const modules = useModules();
  const topics = useTopics();
  const lessons = useLessons();
  const { lessonsCompleted, lastActiveLessonId } = useProgress();

  const orderedLessons = useMemo(() => {
    return getOrderedCurriculumLessons();
  }, []);

  const currentLesson = useMemo(() => {
    return getCurriculumResumeLesson(orderedLessons, lastActiveLessonId, lessonsCompleted);
  }, [orderedLessons, lastActiveLessonId, lessonsCompleted]);

  const completedCount = useMemo(() => {
    return orderedLessons.filter((l) => lessonsCompleted.includes(l.id)).length;
  }, [orderedLessons, lessonsCompleted]);

  const isCompleted = orderedLessons.length > 0 && completedCount === orderedLessons.length;
  const isReturningLearner = lessonsCompleted.length > 0 || !!lastActiveLessonId;

  return {
    modules,
    topics,
    lessons,
    orderedLessons,
    currentLesson,
    completedCount,
    totalLessons: orderedLessons.length,
    isCompleted,
    isReturningLearner,
  };
}
