import categoriesData from "@/data/categories.json";
import learningPathsData from "@/data/learning-paths.json";
import modulesData from "@/data/modules.json";
import topicsData from "@/data/topics.json";
import lessonsData from "@/data/lessons.json";
import canonicalTopicsData from "@/data/canonical/topics.json";
import projectsData from "@/data/projects.json";
import quizzesData from "@/data/quizzes.json";
import flashcardsData from "@/data/flashcards.json";
import achievementsData from "@/data/achievements.json";
import bugsData from "@/data/bugs.json";
import interviewData from "@/data/interview-questions.json";
import resourcesData from "@/data/resources.json";
import { canonicalProvider } from "../curriculum/canonical-provider";
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
 * ContentProvider — abstracts where lesson data comes from.
 * Combines canonical authoritative curriculum with unmigrated legacy content.
 * Canonical entities take absolute precedence.
 * Components should read via hooks (see hooks/use-content.ts).
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
    const rawModules = modulesData as Module[];
    const currentTopics = localContentProvider.topics();
    const currentLessons = localContentProvider.lessons();

    const processed = rawModules.map((m) => {
      const moduleTopics = currentTopics.filter((t) => t.moduleId === m.id);
      const moduleTopicIds = new Set(moduleTopics.map((t) => t.id));
      const moduleLessons = currentLessons.filter(
        (l) => moduleTopicIds.has(l.topicId) || l.moduleId === m.id,
      );

      const topicCount = moduleTopics.length;
      const lessonCount = moduleLessons.length;
      const totalMinutes = moduleTopics.reduce((acc, t) => acc + (t.estimatedMinutes || 30), 0);
      const estimatedHours = Math.max(1, Math.round((totalMinutes / 60) * 10) / 10);

      return {
        ...m,
        topicCount,
        lessonCount,
        estimatedHours,
      };
    });

    return processed.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  },
  getModule: (id: string) => localContentProvider.modules().find((m) => m.id === id),
  topics: () => {
    const rawTopics = topicsData as Topic[];
    const canonicalTopics = canonicalTopicsData as Array<{
      id: string;
      title: string;
      description?: string;
      moduleId: string;
      order?: number;
      lessonIds?: string[];
    }>;

    const canonicalMap = new Map<string, Topic>();
    for (const ct of canonicalTopics) {
      const legacyMatch = rawTopics.find((t) => t.id === ct.id);
      canonicalMap.set(ct.id, {
        id: ct.id,
        moduleId: ct.moduleId,
        title: ct.title,
        description: ct.description || legacyMatch?.description || `Topic covering ${ct.title}`,
        difficulty: legacyMatch?.difficulty || "Beginner",
        estimatedMinutes: legacyMatch?.estimatedMinutes || 15,
        interviewFrequency: legacyMatch?.interviewFrequency || "Medium",
        prerequisites: legacyMatch?.prerequisites || [],
        next: legacyMatch?.next || [],
        related: legacyMatch?.related || [],
        order: ct.order ?? legacyMatch?.order ?? 1,
        categoryId: legacyMatch?.categoryId,
      });
    }

    const merged: Topic[] = [];
    const processedIds = new Set<string>();

    for (const raw of rawTopics) {
      if (canonicalMap.has(raw.id)) {
        merged.push(canonicalMap.get(raw.id)!);
        processedIds.add(raw.id);
      } else {
        merged.push(raw);
        processedIds.add(raw.id);
      }
    }

    for (const [id, adapted] of canonicalMap.entries()) {
      if (!processedIds.has(id)) {
        merged.push(adapted);
        processedIds.add(id);
      }
    }

    return merged.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  },
  getTopic: (id: string) => localContentProvider.topics().find((t) => t.id === id),
  lessons: () => {
    const rawLessons = lessonsData as Lesson[];
    const goldenLessons = canonicalProvider.getGoldenLessons();
    const canonicalMap = new Map<string, Lesson>();
    for (const golden of goldenLessons) {
      canonicalMap.set(golden.id, adaptCanonicalLessonToLegacy(golden));
    }

    const merged: Lesson[] = [];
    const processedIds = new Set<string>();

    for (const raw of rawLessons) {
      if (canonicalMap.has(raw.id)) {
        merged.push(canonicalMap.get(raw.id)!);
        processedIds.add(raw.id);
      } else {
        merged.push(raw);
        processedIds.add(raw.id);
      }
    }

    for (const [id, adapted] of canonicalMap.entries()) {
      if (!processedIds.has(id)) {
        merged.push(adapted);
        processedIds.add(id);
      }
    }

    return merged.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  },
  getLesson: (id: string) => {
    const canonical = canonicalProvider.getCanonicalLesson(id);
    if (canonical) {
      return adaptCanonicalLessonToLegacy(canonical);
    }
    return (lessonsData as Lesson[]).find((l) => l.id === id);
  },
  levels: () => canonicalProvider.getLevels(),
  getLevel: (id: string) => canonicalProvider.getLevel(id),
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
