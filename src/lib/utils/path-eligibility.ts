import learningPathsData from "@/data/learning-paths.json";
import topicsData from "@/data/topics.json";
import lessonsData from "@/data/lessons.json";
import quizzesData from "@/data/quizzes.json";
import projectsData from "@/data/projects.json";
import { getVerifiedProjectTasks } from "@/lib/learning-engine/evidence-store";
import type { QuizResultRecord, QuizQuestion, LearningPath, Project } from "@/lib/types";

export interface PathEligibilityResult {
  path: LearningPath | null;
  pathModuleIds: string[];
  pathTopics: typeof topicsData;
  pathLessons: typeof lessonsData;
  pathQuizzes: typeof quizzesData;
  completedLessonsCount: number;
  totalLessonsCount: number;
  passedQuizzesCount: number;
  totalQuizzesCount: number;
  verifiedProjectTasksCount: number;
  requiredVerifiedTasksCount: number;
  isLessonsComplete: boolean;
  isQuizzesComplete: boolean;
  isProjectVerificationComplete: boolean;
  isEligible: boolean;
  assessmentQuestions: QuizQuestion[];
}

export function checkPathEligibility(
  pathId: string,
  lessonsCompleted: string[] = [],
  quizResults: QuizResultRecord[] = [],
  verifiedProjectTasks: Record<string, string> = getVerifiedProjectTasks(),
): PathEligibilityResult {
  const path = (learningPathsData as LearningPath[]).find((p) => p.id === pathId) || null;
  if (!path) {
    return {
      path: null,
      pathModuleIds: [],
      pathTopics: [],
      pathLessons: [],
      pathQuizzes: [],
      completedLessonsCount: 0,
      totalLessonsCount: 0,
      passedQuizzesCount: 0,
      totalQuizzesCount: 0,
      verifiedProjectTasksCount: 0,
      requiredVerifiedTasksCount: 1,
      isLessonsComplete: false,
      isQuizzesComplete: false,
      isProjectVerificationComplete: false,
      isEligible: false,
      assessmentQuestions: [],
    };
  }

  const pathModuleIds = path.moduleIds || [];
  const pathTopics = topicsData.filter((t) => pathModuleIds.includes(t.moduleId));
  const pathTopicIds = new Set(pathTopics.map((t) => t.id));

  const pathLessons = lessonsData.filter(
    (l) => pathModuleIds.includes(l.moduleId) || pathTopicIds.has(l.topicId),
  );

  const pathQuizzes = quizzesData.filter((q) => q.topicId && pathTopicIds.has(q.topicId));

  const completedLessonsCount = pathLessons.filter((l) => lessonsCompleted.includes(l.id)).length;
  const isLessonsComplete =
    pathLessons.length > 0 ? completedLessonsCount === pathLessons.length : true;

  const passedQuizzesCount = pathQuizzes.filter((q) =>
    quizResults.some((r) => (r.quizId === q.id || r.topicId === q.topicId) && r.scorePercent >= 70),
  ).length;

  const isQuizzesComplete =
    pathQuizzes.length > 0 ? passedQuizzesCount === pathQuizzes.length : true;

  const allProjects = projectsData as Project[];
  const pathProjects = allProjects.filter(
    (p) => !p.moduleId || pathModuleIds.includes(p.moduleId),
  );
  const targetProjects = pathProjects.length > 0 ? pathProjects : allProjects;
  const verifiedProjectTasksCount = targetProjects.reduce((acc, proj) => {
    const tasks = proj.milestones.flatMap((m) => m.tasks || []);
    return (
      acc +
      tasks.filter((t) => Boolean(verifiedProjectTasks[`${proj.id}:${t.id}`])).length
    );
  }, 0);
  const requiredVerifiedTasksCount = 1;
  const isProjectVerificationComplete =
    verifiedProjectTasksCount >= requiredVerifiedTasksCount;

  const isEligible =
    isLessonsComplete && isQuizzesComplete && isProjectVerificationComplete;

  const assessmentQuestions = pathQuizzes.flatMap((q) => (q.questions || []) as QuizQuestion[]);

  return {
    path,
    pathModuleIds,
    pathTopics,
    pathLessons,
    pathQuizzes,
    completedLessonsCount,
    totalLessonsCount: pathLessons.length,
    passedQuizzesCount,
    totalQuizzesCount: pathQuizzes.length,
    verifiedProjectTasksCount,
    requiredVerifiedTasksCount,
    isLessonsComplete,
    isQuizzesComplete,
    isProjectVerificationComplete,
    isEligible,
    assessmentQuestions,
  };
}

