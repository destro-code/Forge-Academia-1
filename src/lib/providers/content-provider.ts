import categoriesData from "@/data/categories.json";
import learningPathsData from "@/data/learning-paths.json";
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
    return canonicalManifestProvider
      .getModules()
      .map((m) => {
        const topicCount = m.topicIds.length;
        const lessonCount = m.lessonIds.length;
        return {
          id: m.moduleId,
          title: m.title,
          description: `Module covering ${m.title}`,
          order: m.position,
          topicCount,
          lessonCount,
          estimatedHours: Math.max(1, Math.round(lessonCount * 0.5 * 10) / 10),
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
