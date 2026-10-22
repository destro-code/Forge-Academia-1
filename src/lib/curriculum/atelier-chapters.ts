import { canonicalManifest, type CanonicalManifestLessonRef, type CanonicalManifestModule } from "@/lib/curriculum/manifest";

export type AtelierChapterId = "foundations" | "css-craft" | "javascript" | "react-architecture";
export type AtelierAccent = "mint" | "cobalt" | "butter" | "lilac";

export interface AtelierChapterDefinition {
  id: AtelierChapterId;
  number: "01" | "02" | "03" | "04";
  title: string;
  shortTitle: string;
  subtitle: string;
  accent: AtelierAccent;
  moduleIds: readonly string[];
}

export interface AtelierChapter extends AtelierChapterDefinition {
  modules: CanonicalManifestModule[];
  authoredLessons: CanonicalManifestLessonRef[];
  plannedLessons: CanonicalManifestLessonRef[];
  completedLessonCount: number;
  totalAuthoredLessons: number;
  completionPercent: number;
}

export const ATELIER_CHAPTER_DEFINITIONS: readonly AtelierChapterDefinition[] = [
  {
    id: "foundations",
    number: "01",
    title: "HTML & Web Foundations",
    shortTitle: "Foundations",
    subtitle: "Understand the web. Build its bones.",
    accent: "mint",
    moduleIds: ["module-0-1", "module-0-2", "module-1-1"],
  },
  {
    id: "css-craft",
    number: "02",
    title: "CSS Magic & Layout Craft",
    shortTitle: "CSS Craft",
    subtitle: "Turn structure into an intentional interface.",
    accent: "cobalt",
    moduleIds: ["module-1-2", "module-1-3", "module-1-4"],
  },
  {
    id: "javascript",
    number: "03",
    title: "JavaScript & TypeScript Adventure",
    shortTitle: "JavaScript",
    subtitle: "Give interfaces logic, data, and behavior.",
    accent: "butter",
    moduleIds: ["module-2-1", "module-2-2", "module-2-3", "module-2-4", "module-2-5"],
  },
  {
    id: "react-architecture",
    number: "04",
    title: "React & Application Architecture",
    shortTitle: "React & Systems",
    subtitle: "Compose interfaces into dependable applications.",
    accent: "lilac",
    moduleIds: ["module-3-1", "module-3-2", "module-3-3", "module-3-4", "module-4-1", "module-4-2"],
  },
] as const;

export function getAtelierChapters(completedLessonIds: readonly string[] = []): AtelierChapter[] {
  const activeModules = canonicalManifest.getModules().filter((module) => module.lessonIds.length > 0);
  const completed = new Set(completedLessonIds);

  return ATELIER_CHAPTER_DEFINITIONS.map((definition) => {
    const modules = definition.moduleIds
      .map((id) => activeModules.find((module) => module.moduleId === id))
      .filter((module): module is CanonicalManifestModule => module !== undefined)
      .sort((a, b) => a.position - b.position);

    const allModuleLessons = modules.flatMap((module) =>
      canonicalManifest.getLessonsForModule(module.moduleId),
    );
    const authoredLessons = allModuleLessons.filter((lesson) => lesson.authored !== false);
    const plannedLessons = allModuleLessons.filter((lesson) => lesson.authored === false);
    const completedLessonCount = authoredLessons.filter((lesson) => completed.has(lesson.lessonId)).length;

    return {
      ...definition,
      modules,
      authoredLessons,
      plannedLessons,
      completedLessonCount,
      totalAuthoredLessons: authoredLessons.length,
      completionPercent: authoredLessons.length
        ? Math.round((completedLessonCount / authoredLessons.length) * 100)
        : 0,
    };
  });
}

export function getAtelierChapterForModule(moduleId: string | undefined): AtelierChapterDefinition | undefined {
  if (!moduleId) return undefined;
  return ATELIER_CHAPTER_DEFINITIONS.find((chapter) => chapter.moduleIds.includes(moduleId));
}

export interface AtelierChapterPartitionReport {
  valid: boolean;
  activeModuleIds: string[];
  assignedModuleIds: string[];
  duplicateModuleIds: string[];
  missingModuleIds: string[];
  unknownModuleIds: string[];
}

export function auditAtelierChapterPartition(): AtelierChapterPartitionReport {
  const activeModuleIds = canonicalManifest
    .getModules()
    .filter((module) => module.lessonIds.length > 0)
    .map((module) => module.moduleId);
  const assignedModuleIds = ATELIER_CHAPTER_DEFINITIONS.flatMap((chapter) => [...chapter.moduleIds]);
  const counts = new Map<string, number>();

  assignedModuleIds.forEach((id) => counts.set(id, (counts.get(id) ?? 0) + 1));
  const duplicateModuleIds = [...counts.entries()].filter(([, count]) => count > 1).map(([id]) => id);
  const activeSet = new Set(activeModuleIds);
  const assignedSet = new Set(assignedModuleIds);

  const missingModuleIds = activeModuleIds.filter((id) => !assignedSet.has(id));
  const unknownModuleIds = assignedModuleIds.filter((id) => !activeSet.has(id));

  return {
    valid: duplicateModuleIds.length === 0 && missingModuleIds.length === 0 && unknownModuleIds.length === 0,
    activeModuleIds,
    assignedModuleIds,
    duplicateModuleIds,
    missingModuleIds,
    unknownModuleIds,
  };
}

/** Counts unique UTC date strings in the Monday-to-Monday UTC week containing now. */
export function getUtcWeekActiveDays(activityDates: readonly string[] = [], now: Date = new Date()): number {
  const dayStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const mondayOffset = (now.getUTCDay() + 6) % 7;
  const weekStart = dayStart - mondayOffset * 24 * 60 * 60 * 1000;
  const weekEnd = weekStart + 7 * 24 * 60 * 60 * 1000;
  const dates = new Set<string>();

  for (const value of activityDates) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) continue;
    const timestamp = Date.parse(value + "T00:00:00.000Z");
    if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== value) continue;
    if (timestamp >= weekStart && timestamp < weekEnd) dates.add(value);
  }
  return dates.size;
}
