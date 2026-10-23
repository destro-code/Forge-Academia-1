import categoriesData from "@/data/categories.json";
import learningPathsData from "@/data/learning-paths.json";
import modulesData from "@/data/modules.json";
import lessonsData from "@/data/lessons.json";
import projectsData from "@/data/projects.json";
import quizzesData from "@/data/quizzes.json";
import flashcardsData from "@/data/flashcards.json";
import achievementsData from "@/data/achievements.json";
import bugsData from "@/data/bugs.json";
import interviewData from "@/data/interview-questions.json";
import resourcesData from "@/data/resources.json";
import { canonicalProvider } from "../curriculum/canonical-provider";
import { canonicalManifestProvider } from "../curriculum/manifest";
import { adaptCanonicalLessonToLegacy } from "../curriculum/legacy-adapter";
import type {
  Category,
  LearningPath,
  Module,
  Topic,
  Lesson,
  Project,
  Quiz,
  Flashcard,
  Achievement,
  Bug,
  InterviewQuestion,
  Resource,
} from "../types";
import type { Level as CanonicalLevel } from "../curriculum/schema";

const MODULE_CATEGORY_MAP: Record<string, string> = {
  "module-0-1": "core-web",
  "module-0-2": "core-web",
  "module-1-1": "core-web",
  "module-1-2": "core-web",
  "module-1-3": "core-web",
  "module-1-4": "quality-perf",
  "module-2-1": "language-mastery",
  "module-2-2": "language-mastery",
  "module-2-3": "language-mastery",
  "module-2-4": "architecture",
  "module-2-5": "architecture",
  "module-3-1": "framework-mastery",
  "module-3-2": "framework-mastery",
  "module-3-3": "framework-mastery",
  "module-3-4": "framework-mastery",
  "module-4-1": "framework-mastery",
  "module-4-2": "architecture",
};

/**
 * ContentProvider — authoritative curriculum querying backed by curriculum-manifest.json.
 * Components read via hooks (see hooks/use-content.ts).
 */
export interface ContentProvider {
  categories(): Category[];
  getCategory(id: string): Category | undefined;
  learningPaths(): LearningPath[];
  getLearningPath(id: string): LearningPath | undefined;
  modules(): Module[];
  getModule(id: string): Module | undefined;
  topics(): Topic[];
  getTopic(id: string): Topic | undefined;
  lessons(): Lesson[];
  getLesson(id: string): Lesson | undefined;
  getCanonicalLesson?(id: string): import("../curriculum/types").CanonicalLesson | undefined;
  getLegacyLesson?(id: string): Lesson | undefined;
  levels?(): CanonicalLevel[];
  getLevel?(id: string): CanonicalLevel | undefined;
  projects(): Project[];
  getProject(id: string): Project | undefined;
  quizzes(): Quiz[];
  getQuiz(id: string): Quiz | undefined;
  flashcards(): Flashcard[];
  achievements(): Achievement[];
  bugs(): Bug[];
  getBug(id: string): Bug | undefined;
  interviewQuestions(): InterviewQuestion[];
  resources(): Resource[];
}

export const localContentProvider: ContentProvider = {
  categories: () => categoriesData as Category[],
  getCategory: (id: string) => (categoriesData as Category[]).find((c) => c.id === id),
  learningPaths: () => {
    const raw = learningPathsData as LearningPath[];
    return [...raw].sort((a, b) => {
      const orderA = "order" in a && typeof a.order === "number" ? a.order : 0;
      const orderB = "order" in b && typeof b.order === "number" ? b.order : 0;
      return orderA - orderB;
    });
  },
  getLearningPath: (id: string) => (learningPathsData as LearningPath[]).find((p) => p.id === id),
  modules: () => {
    const metaMap = new Map((modulesData as Module[]).map((m) => [m.id, m]));
    return canonicalManifestProvider
      .getModules()
      .filter((m) => canonicalManifestProvider.getAuthoredLessonsForModule(m.moduleId).length > 0)
      .map((m, idx) => {
        const meta = metaMap.get(m.moduleId);
        const authoredLessons = canonicalManifestProvider.getAuthoredLessonsForModule(m.moduleId);
        const topicCount = m.topicIds.filter(
          (tId) => canonicalManifestProvider.getAuthoredLessonsForTopic(tId).length > 0,
        ).length;
        const lessonCount = authoredLessons.length;
        const matchedPaths = (learningPathsData as LearningPath[])
          .filter((p) => p.moduleIds?.includes(m.moduleId))
          .map((p) => p.id);

        return {
          id: m.moduleId,
          title: m.title,
          description: meta?.description ?? `Module covering ${m.title}`,
          icon: meta?.icon ?? "BookOpen",
          difficulty: meta?.difficulty ?? "Beginner",
          topicCount: topicCount || 1,
          lessonCount,
          estimatedHours:
            meta?.estimatedHours ?? Math.max(1, Math.round(lessonCount * 0.25 * 10) / 10),
          progress: meta?.progress ?? 0,
          color: meta?.color ?? "chart-1",
          tags: meta?.tags ?? [],
          order: meta?.order ?? idx + 1,
          categoryId: meta?.categoryId ?? MODULE_CATEGORY_MAP[m.moduleId],
          pathIds: matchedPaths,
          prerequisites: meta?.prerequisites ?? [],
        };
      })
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  },
  getModule: (id: string) => localContentProvider.modules().find((m) => m.id === id),
  topics: () => {
    const metaMap = new Map((modulesData as Module[]).map((m) => [m.id, m]));
    return canonicalManifestProvider
      .getTopics()
      .filter((t) => canonicalManifestProvider.getAuthoredLessonsForTopic(t.topicId).length > 0)
      .map((t, idx) => {
        const modMeta = metaMap.get(t.moduleId);
        const authoredTopicLessons = canonicalManifestProvider.getAuthoredLessonsForTopic(
          t.topicId,
        );
        return {
          id: t.topicId,
          moduleId: t.moduleId,
          title: t.title,
          description: modMeta?.description ?? `Topic covering ${t.title}`,
          difficulty: modMeta?.difficulty ?? ("Beginner" as const),
          estimatedMinutes: Math.max(15, authoredTopicLessons.length * 15),
          interviewFrequency: "High" as const,
          prerequisites: [],
          next: [],
          related: [],
          order: modMeta?.order ?? idx + 1,
          lessonIds: authoredTopicLessons.map((l) => l.lessonId),
          categoryId: modMeta?.categoryId ?? MODULE_CATEGORY_MAP[t.moduleId],
        };
      })
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  },
  getTopic: (id: string) => localContentProvider.topics().find((t) => t.id === id),
  lessons: () => {
    return canonicalProvider.getLessons().map(adaptCanonicalLessonToLegacy);
  },
  getLesson: (id: string) => {
    const canonical = canonicalProvider.getCanonicalLesson(id);
    if (canonical) {
      return adaptCanonicalLessonToLegacy(canonical);
    }
    return undefined;
  },
  getCanonicalLesson: (id: string) => canonicalProvider.getCanonicalLesson(id),
  getLegacyLesson: (id: string) => (lessonsData as Lesson[]).find((l) => l.id === id),
  levels: () => {
    const activeModIds = new Set(
      canonicalManifestProvider
        .getModules()
        .filter((m) => m.lessonIds.length > 0)
        .map((m) => m.moduleId),
    );
    return canonicalManifestProvider
      .getLevels()
      .map((lvl) => ({
        id: lvl.levelId,
        title: lvl.title,
        description: lvl.title,
        order: lvl.position,
        moduleIds: lvl.moduleIds.filter((id) => activeModIds.has(id)),
      }))
      .filter((lvl) => lvl.moduleIds.length > 0);
  },
  getLevel: (id: string) =>
    localContentProvider.levels?.()?.find((lvl) => lvl.id === id || (lvl as any).phaseId === id),
  projects: () => {
    const raw = projectsData as Project[];
    return [...raw].sort((a, b) => {
      const orderA = "order" in a && typeof a.order === "number" ? a.order : 0;
      const orderB = "order" in b && typeof b.order === "number" ? b.order : 0;
      return orderA - orderB;
    });
  },
  getProject: (id: string) => (projectsData as Project[]).find((p) => p.id === id),
  quizzes: () => quizzesData as Quiz[],
  getQuiz: (id: string) => (quizzesData as Quiz[]).find((q) => q.id === id),
  flashcards: () => flashcardsData as Flashcard[],
  achievements: () => achievementsData as Achievement[],
  bugs: () => {
    const raw = bugsData as Bug[];
    return [...raw].sort((a, b) => {
      const orderA = "order" in a && typeof a.order === "number" ? a.order : 0;
      const orderB = "order" in b && typeof b.order === "number" ? b.order : 0;
      return orderA - orderB;
    });
  },
  getBug: (id: string) => (bugsData as Bug[]).find((b) => b.id === id),
  interviewQuestions: () => {
    const raw = interviewData as InterviewQuestion[];
    return [...raw].sort((a, b) => {
      const orderA = "order" in a && typeof a.order === "number" ? a.order : 0;
      const orderB = "order" in b && typeof b.order === "number" ? b.order : 0;
      return orderA - orderB;
    });
  },
  resources: () => resourcesData as Resource[],
};

export const contentProvider: ContentProvider = localContentProvider;

export { canonicalProvider } from "../curriculum/canonical-provider";
export { canonicalManifestProvider, canonicalManifest } from "../curriculum/manifest";
