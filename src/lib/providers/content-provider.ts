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
  "module-1-4": "core-web",
  "module-2-1": "core-web",
  "module-4-4": "core-web",
  "module-1-3": "language-mastery",
  "module-2-2": "language-mastery",
  "module-2-5": "language-mastery",
  "module-3-1": "framework-mastery",
  "module-3-2": "framework-mastery",
  "module-3-3": "framework-mastery",
  "module-3-4": "framework-mastery",
  "module-4-1": "framework-mastery",
  "module-4-2": "framework-mastery",
  "module-5-2": "framework-mastery",
  "module-5-6": "framework-mastery",
  "module-2-3": "architecture",
  "module-2-4": "architecture",
  "module-5-1": "architecture",
  "module-5-5": "architecture",
  "module-4-3": "quality-perf",
  "module-4-5": "quality-perf",
  "module-4-6": "quality-perf",
  "module-5-3": "quality-perf",
  "module-5-4": "career-interview",
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
      .map((m) => {
        const meta = metaMap.get(m.moduleId);
        const topicCount = m.topicIds.length;
        const lessonCount = m.lessonIds.length;
        const matchedPaths = (learningPathsData as LearningPath[])
          .filter((p) => p.moduleIds?.includes(m.moduleId))
          .map((p) => p.id);

        return {
          id: m.moduleId,
          title: m.title,
          description: meta?.description ?? `Module covering ${m.title}`,
          icon: meta?.icon ?? "BookOpen",
          difficulty: meta?.difficulty ?? "Beginner",
          topicCount: topicCount || meta?.topicCount || 0,
          lessonCount: lessonCount || meta?.lessonCount || 0,
          estimatedHours:
            meta?.estimatedHours ?? Math.max(1, Math.round(lessonCount * 0.5 * 10) / 10),
          progress: meta?.progress ?? 0,
          color: meta?.color ?? "chart-1",
          tags: meta?.tags ?? [],
          order: m.position,
          categoryId: meta?.categoryId ?? MODULE_CATEGORY_MAP[m.moduleId],
          pathIds: matchedPaths,
          prerequisites: meta?.prerequisites ?? [],
        };
      })
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  },
  getModule: (id: string) => localContentProvider.modules().find((m) => m.id === id),
  topics: () => {
    return canonicalManifestProvider
      .getTopics()
      .map((t) => ({
        id: t.topicId,
        moduleId: t.moduleId,
        title: t.title,
        description: `Topic covering ${t.title}`,
        difficulty: "Beginner" as const,
        estimatedMinutes: Math.max(15, (t.lessonIds?.length ?? 1) * 15),
        interviewFrequency: "Medium" as const,
        prerequisites: [],
        next: [],
        related: [],
        order: t.position,
        lessonIds: t.lessonIds,
        categoryId: MODULE_CATEGORY_MAP[t.moduleId],
      }))
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
    return canonicalManifestProvider.getLevels().map((lvl) => ({
      id: lvl.levelId,
      title: lvl.title,
      description: lvl.title,
      order: lvl.position,
      moduleIds: lvl.moduleIds,
    }));
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
