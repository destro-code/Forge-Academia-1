import { canonicalManifest } from "@/lib/curriculum/manifest";
import { canonicalProvider } from "@/lib/curriculum/canonical-provider";
import { adaptCanonicalLessonToLegacy } from "@/lib/curriculum/legacy-adapter";
import type { Lesson, Module, Project, ProgressState } from "@/lib/types";

export type AtelierChapterId =
  | "chapter-html-foundations"
  | "chapter-css-magic"
  | "chapter-js-adventure"
  | "chapter-react-projects";

export type AtelierChapterAccent = "mint" | "cobalt" | "butter" | "lilac";

export interface AtelierPlayableLesson {
  id: string;
  title: string;
  description: string;
  moduleId: string;
  topicId: string;
  position: number;
  estimatedMinutes: number;
  difficulty: string;
  status: "completed" | "active" | "available";
}

export interface AtelierChapterModule {
  id: string;
  title: string;
  description: string;
  order: number;
  manifestLessonCount: number;
  authoredLessons: AtelierPlayableLesson[];
  completedCount: number;
  totalAuthoredCount: number;
  progressPercent: number;
  status: "completed" | "active" | "available";
}

export interface AtelierChapterFolio {
  id: AtelierChapterId;
  numberLabel: string;
  shortTitle: string;
  title: string;
  subtitle: string;
  accent: AtelierChapterAccent;
  moduleIds: readonly string[];
  modules: AtelierChapterModule[];
  completedLessonsCount: number;
  totalAuthoredLessonsCount: number;
  totalManifestLessonsCount: number;
  progressPercent: number;
  status: "completed" | "current" | "available";
  estimatedHours: number;
}

export const ATELIER_CHAPTER_DEFINITIONS: readonly {
  id: AtelierChapterId;
  numberLabel: string;
  shortTitle: string;
  title: string;
  subtitle: string;
  accent: AtelierChapterAccent;
  moduleIds: readonly string[];
}[] = [
  {
    id: "chapter-html-foundations",
    numberLabel: "01",
    shortTitle: "HTML Basics",
    title: "HTML & Web Foundations",
    subtitle: "How the web works, semantic document structure, forms, and accessible foundations.",
    accent: "mint",
    moduleIds: ["module-0-1", "module-0-2", "module-1-1"],
  },
  {
    id: "chapter-css-magic",
    numberLabel: "02",
    shortTitle: "CSS Magic",
    title: "CSS Magic & Layout Craft",
    subtitle: "Box model mastery, Flexbox, CSS Grid, responsive architecture, and visual polish.",
    accent: "cobalt",
    moduleIds: ["module-1-2", "module-1-3", "module-1-4"],
  },
  {
    id: "chapter-js-adventure",
    numberLabel: "03",
    shortTitle: "JavaScript Adventure",
    title: "JavaScript & TypeScript Adventure",
    subtitle: "Closures, DOM alchemy, async event loops, state patterns, and TypeScript safety.",
    accent: "butter",
    moduleIds: ["module-2-1", "module-2-2", "module-2-3", "module-2-4", "module-2-5"],
  },
  {
    id: "chapter-react-projects",
    numberLabel: "04",
    shortTitle: "Build Real Projects",
    title: "React & Application Architecture",
    subtitle: "Components, hooks, data fetching, design systems, testing, and production apps.",
    accent: "lilac",
    moduleIds: [
      "module-3-1",
      "module-3-2",
      "module-3-3",
      "module-3-4",
      "module-4-1",
      "module-4-2",
    ],
  },
] as const;

export function resolvePlayableLessonsForModule(
  moduleId: string,
  completedSet: ReadonlySet<string>,
  activeLessonId?: string,
): AtelierPlayableLesson[] {
  const authoredRefs = canonicalManifest.getAuthoredLessonsForModule(moduleId);
  return authoredRefs.map((ref) => {
    const canonical = canonicalProvider.getCanonicalLesson(ref.lessonId);
    const legacy: Partial<Lesson> | undefined = canonical
      ? adaptCanonicalLessonToLegacy(canonical)
      : undefined;

    const isDone = completedSet.has(ref.lessonId);
    const isCurrent = ref.lessonId === activeLessonId;

    return {
      id: ref.lessonId,
      title: legacy?.title || ref.title,
      description:
        legacy?.description ||
        `Interactive studio lesson exploring ${ref.title.toLowerCase()}.`,
      moduleId: ref.moduleId,
      topicId: ref.topicId,
      position: ref.position,
      estimatedMinutes: legacy?.estimatedMinutes ?? 15,
      difficulty: legacy?.difficulty ?? "Beginner",
      status: isDone ? "completed" : isCurrent ? "active" : "available",
    };
  });
}

export function buildAtelierChapterFolios(
  allModules: readonly Module[],
  lessonsCompleted: readonly string[],
  activeLessonId?: string,
): AtelierChapterFolio[] {
  const completedSet = new Set(lessonsCompleted);
  const moduleMap = new Map(allModules.map((m) => [m.id, m]));

  return ATELIER_CHAPTER_DEFINITIONS.map((def) => {
    let chapterCompleted = 0;
    let chapterTotalAuthored = 0;
    let chapterTotalManifest = 0;
    let chapterHours = 0;
    let containsActiveLesson = false;

    const chapterModules: AtelierChapterModule[] = def.moduleIds.map((modId, idx) => {
      const modMeta = moduleMap.get(modId);
      const manifestLessons = canonicalManifest.getLessonsForModule(modId);
      const authoredLessons = resolvePlayableLessonsForModule(modId, completedSet, activeLessonId);
      const completedInMod = authoredLessons.filter((l) => l.status === "completed").length;
      const totalAuthored = authoredLessons.length;
      const hasActive = authoredLessons.some((l) => l.id === activeLessonId);

      if (hasActive) {
        containsActiveLesson = true;
      }

      chapterCompleted += completedInMod;
      chapterTotalAuthored += totalAuthored;
      chapterTotalManifest += manifestLessons.length;
      chapterHours += modMeta?.estimatedHours ?? Math.max(1, Math.round(totalAuthored * 0.25));

      const progressPercent =
        totalAuthored > 0 ? Math.round((completedInMod / totalAuthored) * 100) : 0;

      const status: AtelierChapterModule["status"] =
        totalAuthored > 0 && completedInMod === totalAuthored
          ? "completed"
          : hasActive || completedInMod > 0
            ? "active"
            : "available";

      return {
        id: modId,
        title: modMeta?.title ?? modId,
        description: modMeta?.description ?? `Interactive studio module ${modId}`,
        order: modMeta?.order ?? idx + 1,
        manifestLessonCount: manifestLessons.length,
        authoredLessons,
        completedCount: completedInMod,
        totalAuthoredCount: totalAuthored,
        progressPercent,
        status,
      };
    });

    const progressPercent =
      chapterTotalAuthored > 0
        ? Math.round((chapterCompleted / chapterTotalAuthored) * 100)
        : 0;

    const status: AtelierChapterFolio["status"] =
      chapterTotalAuthored > 0 && chapterCompleted === chapterTotalAuthored
        ? "completed"
        : containsActiveLesson || chapterCompleted > 0
          ? "current"
          : "available";

    return {
      id: def.id,
      numberLabel: def.numberLabel,
      shortTitle: def.shortTitle,
      title: def.title,
      subtitle: def.subtitle,
      accent: def.accent,
      moduleIds: def.moduleIds,
      modules: chapterModules,
      completedLessonsCount: chapterCompleted,
      totalAuthoredLessonsCount: chapterTotalAuthored,
      totalManifestLessonsCount: chapterTotalManifest,
      progressPercent,
      status,
      estimatedHours: Math.round(chapterHours * 10) / 10,
    };
  });
}

export function findChapterIdForModule(moduleId?: string): AtelierChapterId {
  if (!moduleId) return "chapter-html-foundations";
  const found = ATELIER_CHAPTER_DEFINITIONS.find((ch) => ch.moduleIds.includes(moduleId));
  return found ? found.id : "chapter-html-foundations";
}

export interface UtcWeekDayActivity {
  isoDate: string;
  label: string;
  shortLabel: string;
  isActive: boolean;
  isToday: boolean;
}

/**
 * Computes Monday..Sunday of the current UTC calendar week and marks which days
 * appear in `activityDates` (YYYY-MM-DD prefix). Never fabricates activity counts.
 */
export function computeUtcCalendarWeekActiveDays(
  activityDates: readonly string[] = [],
  referenceDate: Date = new Date(),
): {
  days: UtcWeekDayActivity[];
  activeDaysCount: number;
} {
  const dateSet = new Set(
    (activityDates || []).filter(Boolean).map((d) => String(d).slice(0, 10)),
  );

  const todayIso = referenceDate.toISOString().slice(0, 10);
  const utcDay = referenceDate.getUTCDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const diffToMonday = utcDay === 0 ? -6 : 1 - utcDay;

  const mondayUtc = new Date(
    Date.UTC(
      referenceDate.getUTCFullYear(),
      referenceDate.getUTCMonth(),
      referenceDate.getUTCDate() + diffToMonday,
    ),
  );

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const shortNames = ["M", "T", "W", "T", "F", "S", "S"];

  const days: UtcWeekDayActivity[] = dayNames.map((label, idx) => {
    const d = new Date(mondayUtc);
    d.setUTCDate(mondayUtc.getUTCDate() + idx);
    const isoDate = d.toISOString().slice(0, 10);
    return {
      isoDate,
      label,
      shortLabel: shortNames[idx],
      isActive: dateSet.has(isoDate),
      isToday: isoDate === todayIso,
    };
  });

  const activeDaysCount = days.filter((d) => d.isActive).length;
  return { days, activeDaysCount };
}

export interface EvaluatedAtelierProject {
  project: Project;
  completedTasks: number;
  totalTasks: number;
  completedCriteria: number;
  totalCriteria: number;
  hasReflectionsOrNotes: boolean;
  isCompleted: boolean;
  isStarted: boolean;
  completionPercent: number;
}

/**
 * Evaluates real project task & acceptance-criteria progress from ProgressState
 * without inventing fake percentages or unverified module relationships.
 */
export function evaluateAtelierProjects(
  projects: readonly Project[],
  progress: Pick<
    ProgressState,
    | "projectTasks"
    | "projectCriteria"
    | "projectReflections"
    | "projectPortfolioNotes"
    | "completedProjects"
  >,
): {
  evaluatedProjects: EvaluatedAtelierProject[];
  activeProject: EvaluatedAtelierProject | undefined;
  hasAnyStartedProject: boolean;
} {
  const projectTasks = progress.projectTasks ?? {};
  const projectCriteria = progress.projectCriteria ?? {};
  const projectReflections = progress.projectReflections ?? {};
  const projectPortfolioNotes = progress.projectPortfolioNotes ?? {};
  const completedProjectsSet = new Set(progress.completedProjects ?? []);

  const evaluatedProjects: EvaluatedAtelierProject[] = projects.map((project) => {
    const allTasks = (project.milestones ?? []).flatMap((m) => m.tasks ?? []);
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(
      (task) => projectTasks[`${project.id}:${task.id}`] === true,
    ).length;

    const allCriteria = project.acceptanceCriteria ?? [];
    const totalCriteria = allCriteria.length;
    const completedCriteria = allCriteria.filter(
      (criterion) => projectCriteria[`${project.id}:${criterion.id}`] === true,
    ).length;

    const hasReflection = Object.entries(projectReflections).some(
      ([key, val]) => key.startsWith(`${project.id}:`) && Boolean(val?.trim()),
    );
    const hasNote = Boolean(projectPortfolioNotes[project.id]?.trim());
    const hasReflectionsOrNotes = hasReflection || hasNote;

    const totalItems = totalTasks + totalCriteria;
    const completedItems = completedTasks + completedCriteria;
    const isExplicitlyCompleted = completedProjectsSet.has(project.id);
    const isCompleted =
      isExplicitlyCompleted || (totalItems > 0 && completedItems === totalItems);
    const isStarted =
      isCompleted || completedItems > 0 || hasReflectionsOrNotes;

    const completionPercent = isCompleted
      ? 100
      : totalItems > 0
        ? Math.round((completedItems / totalItems) * 100)
        : 0;

    return {
      project,
      completedTasks,
      totalTasks,
      completedCriteria,
      totalCriteria,
      hasReflectionsOrNotes,
      isCompleted,
      isStarted,
      completionPercent,
    };
  });

  const inProgress = evaluatedProjects.find((p) => p.isStarted && !p.isCompleted);
  const mostRecentCompleted = evaluatedProjects.find((p) => p.isCompleted);
  const starterBeginner =
    evaluatedProjects.find((p) => p.project.difficulty === "Beginner") ??
    evaluatedProjects[0];

  const activeProject = inProgress ?? mostRecentCompleted ?? starterBeginner;
  const hasAnyStartedProject = evaluatedProjects.some((p) => p.isStarted);

  return {
    evaluatedProjects,
    activeProject,
    hasAnyStartedProject,
  };
}
