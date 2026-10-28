import { useState, useEffect } from "react";
import type { Lesson, Module, Project, ProgressState, Topic } from "@/lib/types";
import type { LessonSessionState } from "./types";

export type EvidenceStatus =
  | "not-started"
  | "in-progress"
  | "completed"
  | "self-reported"
  | "verified"
  | "needs-attention";

export type CapabilityStatus =
  | "not-started"
  | "in-progress"
  | "demonstrated"
  | "mastered"
  | "needs-review";

export interface LessonStepResumeInfo {
  lessonId: string;
  status: "not-started" | "in-progress" | "completed";
  currentStepIndex: number;
  totalSteps: number;
  completedStepCount: number;
  verifiedStepCount: number;
  needsAttentionStepIds: string[];
  updatedAt?: string;
}

export interface CapabilityEvidenceRecord {
  id: string;
  title: string;
  sourceType: "lesson" | "project" | "interview" | "quiz" | "debug-lab";
  sourceId: string;
  topicId?: string;
  moduleId?: string;
  remediationLessonId?: string;
  status: CapabilityStatus;
  evidenceStatus: EvidenceStatus;
  summary: string;
  updatedAt: string;
}

export interface TopicCapabilitySummary {
  topicId: string;
  status: CapabilityStatus;
  evidenceStatus: EvidenceStatus;
  verifiedCount: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
  hasConflictingOrFragileEvidence: boolean;
  latestReason: string;
}

export interface GuidedNextStepRecommendation {
  kind:
    | "resume-lesson"
    | "review-weakness"
    | "verify-project"
    | "start-lesson"
    | "practice-interview";
  eyebrow: string;
  title: string;
  reason: string;
  estimatedMinutes: number;
  ctaLabel: string;
  to: string;
  params?: Record<string, string>;
  search?: Record<string, string>;
  stepBadge?: string;
}

const VERIFIED_PROJECT_TASKS_KEY = "forge_verified_project_tasks_v1";
const CAPABILITY_EVIDENCE_KEY = "forge_capability_evidence_v1";
const SESSION_STORAGE_PREFIX = "forge_lesson_session_";
const EVIDENCE_CHANGE_EVENT = "forge-evidence-updated";

function notifyEvidenceUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(EVIDENCE_CHANGE_EVENT));
  }
}

/**
 * Reads the persisted LessonSessionState from LocalStorage for a given lessonId
 * so the Dashboard, Module view, and Resume cards know the exact step index.
 */
export function getLessonStepResumeInfo(
  lessonId: string,
  lessonsCompleted: string[] = [],
): LessonStepResumeInfo {
  const isMarkedComplete = lessonsCompleted.includes(lessonId);

  if (typeof window === "undefined") {
    return {
      lessonId,
      status: isMarkedComplete ? "completed" : "not-started",
      currentStepIndex: 0,
      totalSteps: 0,
      completedStepCount: 0,
      verifiedStepCount: 0,
      needsAttentionStepIds: [],
    };
  }

  try {
    const raw = window.localStorage.getItem(`${SESSION_STORAGE_PREFIX}${lessonId}`);
    if (!raw) {
      return {
        lessonId,
        status: isMarkedComplete ? "completed" : "not-started",
        currentStepIndex: 0,
        totalSteps: 0,
        completedStepCount: 0,
        verifiedStepCount: 0,
        needsAttentionStepIds: [],
      };
    }

    const session = JSON.parse(raw) as LessonSessionState;
    const totalSteps =
      session.totalActivities || Object.keys(session.activities || {}).length || 0;
    const completedStepCount = session.completedActivityIds?.length ?? 0;
    const currentStepIndex = Math.min(
      Math.max(0, session.currentActivityIndex ?? 0),
      Math.max(0, totalSteps - 1),
    );

    let verifiedStepCount = 0;
    const needsAttentionStepIds: string[] = [];

    Object.values(session.activities || {}).forEach((act) => {
      if (act.status === "passed" || (act.status === "completed" && act.attempts > 0)) {
        verifiedStepCount += 1;
      }
      if (act.status === "failed" || (act.attempts >= 2 && act.status !== "passed")) {
        needsAttentionStepIds.push(act.activityId);
      }
    });

    const isInProgress =
      !isMarkedComplete &&
      session.status !== "completed" &&
      (currentStepIndex > 0 || completedStepCount > 0);

    return {
      lessonId,
      status:
        isMarkedComplete || session.status === "completed"
          ? "completed"
          : isInProgress
            ? "in-progress"
            : "not-started",
      currentStepIndex,
      totalSteps,
      completedStepCount,
      verifiedStepCount,
      needsAttentionStepIds,
      updatedAt: session.updatedAt,
    };
  } catch {
    return {
      lessonId,
      status: isMarkedComplete ? "completed" : "not-started",
      currentStepIndex: 0,
      totalSteps: 0,
      completedStepCount: 0,
      verifiedStepCount: 0,
      needsAttentionStepIds: [],
    };
  }
}

/**
 * Returns map of verified project tasks (`${projectId}:${taskId}` -> timestamp)
 * proven via runnable checks in the Playground.
 */
export function getVerifiedProjectTasks(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(VERIFIED_PROJECT_TASKS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export function markProjectTasksVerified(projectId: string, taskIds: string[]): void {
  if (typeof window === "undefined") return;
  try {
    const current = getVerifiedProjectTasks();
    const now = new Date().toISOString();
    taskIds.forEach((taskId) => {
      current[`${projectId}:${taskId}`] = now;
    });
    window.localStorage.setItem(VERIFIED_PROJECT_TASKS_KEY, JSON.stringify(current));
    notifyEvidenceUpdated();
  } catch {
    // Ignore storage quota errors
  }
}

export function unmarkProjectTasksVerified(projectId: string, taskIds: string[]): void {
  if (typeof window === "undefined") return;
  try {
    const current = getVerifiedProjectTasks();
    taskIds.forEach((taskId) => {
      delete current[`${projectId}:${taskId}`];
    });
    window.localStorage.setItem(VERIFIED_PROJECT_TASKS_KEY, JSON.stringify(current));
    notifyEvidenceUpdated();
  } catch {
    // Ignore storage quota errors
  }
}

export function clearVerifiedProjectTasks(projectId?: string): void {
  if (typeof window === "undefined") return;
  try {
    if (!projectId) {
      window.localStorage.removeItem(VERIFIED_PROJECT_TASKS_KEY);
    } else {
      const current = getVerifiedProjectTasks();
      Object.keys(current).forEach((key) => {
        if (key.startsWith(`${projectId}:`)) {
          delete current[key];
        }
      });
      window.localStorage.setItem(VERIFIED_PROJECT_TASKS_KEY, JSON.stringify(current));
    }
    notifyEvidenceUpdated();
  } catch {
    // Ignore storage errors
  }
}

export function getTaskEvidenceStatus(
  projectId: string,
  taskId: string,
  projectTasks: Record<string, boolean> = {},
  verifiedTasks: Record<string, string> = getVerifiedProjectTasks(),
): EvidenceStatus {
  const key = `${projectId}:${taskId}`;
  if (verifiedTasks[key]) return "verified";
  if (projectTasks[key]) return "self-reported";
  return "not-started";
}

export function getCapabilityEvidenceRecords(): CapabilityEvidenceRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CAPABILITY_EVIDENCE_KEY);
    return raw ? (JSON.parse(raw) as CapabilityEvidenceRecord[]) : [];
  } catch {
    return [];
  }
}

export function recordCapabilityEvidence(
  record: Omit<CapabilityEvidenceRecord, "updatedAt"> & { updatedAt?: string },
): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getCapabilityEvidenceRecords();
    const nextRecord: CapabilityEvidenceRecord = {
      ...record,
      updatedAt: record.updatedAt || new Date().toISOString(),
    };
    const filtered = existing.filter((r) => r.id !== record.id);
    const updated = [nextRecord, ...filtered].slice(0, 80);
    window.localStorage.setItem(CAPABILITY_EVIDENCE_KEY, JSON.stringify(updated));
    notifyEvidenceUpdated();
  } catch {
    // Ignore storage quota errors
  }
}

export function clearCapabilityEvidenceRecords(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CAPABILITY_EVIDENCE_KEY);
    notifyEvidenceUpdated();
  } catch {
    // Ignore storage errors
  }
}

/**
 * Computes aggregated topic capability statuses while preventing stale or conflicting
 * evidence from producing misleading mastery claims.
 * Rule:
 * - If any recent evidence record for the topic/lesson has `status === "needs-review"` or
 *   `evidenceStatus === "needs-attention"` that is newer than the latest verified check,
 *   the topic cannot be claimed as "mastered" and is flagged as `needs-review`.
 * - Self-reported or lesson-completed alone never equals "mastered" without verified checks.
 */
export function getAggregatedTopicCapabilityStatuses(params: {
  topics: Pick<Topic, "id" | "title" | "moduleId">[];
  lessons: Pick<Lesson, "id" | "topicId" | "moduleId" | "title">[];
  progress: Partial<ProgressState>;
}): Record<string, TopicCapabilitySummary> {
  const { topics, lessons, progress } = params;
  const lessonsCompleted = progress.lessonsCompleted || [];
  const quizResults = progress.quizResults || [];
  const evidenceRecords = getCapabilityEvidenceRecords();

  const result: Record<string, TopicCapabilitySummary> = {};

  for (const topic of topics) {
    const topicLessons = lessons.filter((l) => l.topicId === topic.id);
    const topicLessonIds = new Set(topicLessons.map((l) => l.id));
    const completedLessonsCount = topicLessons.filter((l) =>
      lessonsCompleted.includes(l.id),
    ).length;

    const matchingEvidence = evidenceRecords.filter(
      (r) =>
        r.topicId === topic.id ||
        r.sourceId === topic.id ||
        topicLessonIds.has(r.sourceId) ||
        (r.remediationLessonId && topicLessonIds.has(r.remediationLessonId)),
    );

    const latestNeedsReview = matchingEvidence.find(
      (r) => r.status === "needs-review" || r.evidenceStatus === "needs-attention",
    );
    const latestVerified = matchingEvidence.find((r) => r.evidenceStatus === "verified");

    const hasNewerFailure =
      latestNeedsReview &&
      (!latestVerified ||
        new Date(latestNeedsReview.updatedAt).getTime() >=
          new Date(latestVerified.updatedAt).getTime());

    const topicQuizzes = quizResults.filter((q) => q.topicId === topic.id);
    const latestQuiz =
      topicQuizzes.length > 0 ? topicQuizzes[topicQuizzes.length - 1] : undefined;
    const failedLatestQuiz = latestQuiz !== undefined && latestQuiz.scorePercent < 70;
    const passedLatestQuiz = latestQuiz !== undefined && latestQuiz.scorePercent >= 80;

    const verifiedCount =
      matchingEvidence.filter((r) => r.evidenceStatus === "verified").length +
      (passedLatestQuiz ? 1 : 0);

    if (hasNewerFailure || failedLatestQuiz) {
      result[topic.id] = {
        topicId: topic.id,
        status: "needs-review",
        evidenceStatus: "needs-attention",
        verifiedCount,
        completedLessonsCount,
        totalLessonsCount: topicLessons.length,
        hasConflictingOrFragileEvidence: true,
        latestReason:
          latestNeedsReview?.summary ||
          `Recent quiz score (${latestQuiz?.scorePercent ?? 0}%) indicates this topic needs review.`,
      };
      continue;
    }

    const allLessonsDone =
      topicLessons.length > 0 && completedLessonsCount === topicLessons.length;

    if (allLessonsDone && verifiedCount >= 2) {
      result[topic.id] = {
        topicId: topic.id,
        status: "mastered",
        evidenceStatus: "verified",
        verifiedCount,
        completedLessonsCount,
        totalLessonsCount: topicLessons.length,
        hasConflictingOrFragileEvidence: false,
        latestReason:
          latestVerified?.summary ||
          "All topic lessons completed and verified across multiple checks.",
      };
    } else if (verifiedCount >= 1) {
      result[topic.id] = {
        topicId: topic.id,
        status: "demonstrated",
        evidenceStatus: "verified",
        verifiedCount,
        completedLessonsCount,
        totalLessonsCount: topicLessons.length,
        hasConflictingOrFragileEvidence: false,
        latestReason:
          latestVerified?.summary || "Verified through interactive check or quiz.",
      };
    } else if (completedLessonsCount > 0 || matchingEvidence.length > 0) {
      result[topic.id] = {
        topicId: topic.id,
        status: "in-progress",
        evidenceStatus: allLessonsDone ? "completed" : "in-progress",
        verifiedCount: 0,
        completedLessonsCount,
        totalLessonsCount: topicLessons.length,
        hasConflictingOrFragileEvidence: false,
        latestReason: allLessonsDone
          ? "Lessons completed, but capability has not yet been verified by a quiz or sandbox check."
          : `${completedLessonsCount} of ${topicLessons.length} lessons completed.`,
      };
    } else {
      result[topic.id] = {
        topicId: topic.id,
        status: "not-started",
        evidenceStatus: "not-started",
        verifiedCount: 0,
        completedLessonsCount: 0,
        totalLessonsCount: topicLessons.length,
        hasConflictingOrFragileEvidence: false,
        latestReason: "Not started yet.",
      };
    }
  }

  return result;
}

/**
 * Computes the single primary "Your Next Step" recommendation with an honest,
 * evidence-backed explanation of WHY it is recommended.
 */
export function computeGuidedNextStep(params: {
  currentLesson: Lesson | undefined;
  activeModule: Module | undefined;
  lessons: Lesson[];
  projects: Project[];
  progress: ProgressState;
}): GuidedNextStepRecommendation {
  const { currentLesson, activeModule, lessons, projects, progress } = params;
  const lessonsCompleted = progress.lessonsCompleted || [];
  const moduleTitle = activeModule?.title ?? "Web Foundations";

  // 1. Check if a recent capability record flagged a weakness ("needs-review")
  // Struggling learners receive targeted remediation rather than being pushed forward blindly.
  const evidenceRecords = getCapabilityEvidenceRecords();
  const flaggedRecord = evidenceRecords.find(
    (r) => r.status === "needs-review" || r.evidenceStatus === "needs-attention",
  );
  if (flaggedRecord) {
    const matchingLesson =
      (flaggedRecord.remediationLessonId
        ? lessons.find((l) => l.id === flaggedRecord.remediationLessonId)
        : undefined) ||
      lessons.find((l) => l.id === flaggedRecord.sourceId) ||
      (flaggedRecord.topicId
        ? lessons.find((l) => l.topicId === flaggedRecord.topicId)
        : undefined) ||
      (flaggedRecord.moduleId
        ? lessons.find((l) => l.moduleId === flaggedRecord.moduleId)
        : undefined) ||
      currentLesson ||
      lessons[0];

    if (matchingLesson) {
      return {
        kind: "review-weakness",
        eyebrow: "Recommended Remediation · Needs Review",
        title: `Strengthen: ${flaggedRecord.title}`,
        reason: `${flaggedRecord.summary} Reviewing "${matchingLesson.title}" now will turn a fragile spot into verified confidence before moving ahead.`,
        estimatedMinutes: 5,
        ctaLabel: "Review & Verify Concept",
        to: "/lesson/$lessonId",
        params: { lessonId: matchingLesson.id },
        stepBadge: "Targeted Review",
      };
    }
  }

  // 2. Check if the learner has an unfinished lesson in progress with an exact step index > 0
  if (currentLesson) {
    const resumeInfo = getLessonStepResumeInfo(currentLesson.id, lessonsCompleted);
    if (resumeInfo.status === "in-progress" && resumeInfo.totalSteps > 0) {
      const currentStepNum = resumeInfo.currentStepIndex + 1;
      const remainingSteps = Math.max(1, resumeInfo.totalSteps - resumeInfo.completedStepCount);
      const estRemainingMin = Math.max(2, Math.round(remainingSteps * 1.2));

      return {
        kind: "resume-lesson",
        eyebrow: `Continue Lesson · Step ${currentStepNum} of ${resumeInfo.totalSteps}`,
        title: currentLesson.title,
        reason:
          resumeInfo.needsAttentionStepIds.length > 0
            ? `You are on Step ${currentStepNum} of ${resumeInfo.totalSteps} in ${moduleTitle}, and 1 concept check was flagged for extra practice. Finish the remaining ${remainingSteps} steps to verify this capability.`
            : `You paused on Step ${currentStepNum} of ${resumeInfo.totalSteps} (${resumeInfo.completedStepCount} steps completed). Pick up at the exact step where you left off.`,
        estimatedMinutes: estRemainingMin,
        ctaLabel: `Resume at Step ${currentStepNum} of ${resumeInfo.totalSteps}`,
        to: "/lesson/$lessonId",
        params: { lessonId: currentLesson.id },
        stepBadge: `Step ${currentStepNum}/${resumeInfo.totalSteps}`,
      };
    }
  }

  // 3. Check if the learner has self-reported project tasks that haven't been verified in the Project Studio yet
  const verifiedMap = getVerifiedProjectTasks();
  const projectTasks = progress.projectTasks || {};
  for (const project of projects) {
    for (const milestone of project.milestones) {
      const selfReportedUnverified = (milestone.tasks || []).filter(
        (t) => projectTasks[`${project.id}:${t.id}`] && !verifiedMap[`${project.id}:${t.id}`],
      );
      if (selfReportedUnverified.length > 0) {
        return {
          kind: "verify-project",
          eyebrow: `Project Verification · ${project.title}`,
          title: `Verify ${selfReportedUnverified.length} Self-Reported Task${selfReportedUnverified.length > 1 ? "s" : ""} in Project Studio`,
          reason: `You checked off ${selfReportedUnverified.length} task${selfReportedUnverified.length > 1 ? "s" : ""} in "${milestone.title}" as self-reported. Run the automated acceptance check in the Project Studio to upgrade them to Verified evidence.`,
          estimatedMinutes: 4,
          ctaLabel: "Verify in Project Studio",
          to: "/projects/$projectId",
          params: { projectId: project.id },
          search: { milestoneId: milestone.id },
          stepBadge: "Self-Reported → Verified",
        };
      }
    }
  }

  // 4. If all lessons are completed, guide the learner to verify a project milestone or take an interview loop
  const allLessonsCompleted =
    lessons.length > 0 && lessons.every((l) => lessonsCompleted.includes(l.id));
  if (allLessonsCompleted) {
    const nextUnverifiedProject = projects.find((p) =>
      p.milestones.some((m) => (m.tasks || []).some((t) => !verifiedMap[`${p.id}:${t.id}`])),
    );
    if (nextUnverifiedProject) {
      const targetMilestone =
        nextUnverifiedProject.milestones.find((m) =>
          (m.tasks || []).some((t) => !verifiedMap[`${nextUnverifiedProject.id}:${t.id}`]),
        ) || nextUnverifiedProject.milestones[0];

      return {
        kind: "verify-project",
        eyebrow: `Capstone Verification · ${nextUnverifiedProject.title}`,
        title: `Build & Verify: ${targetMilestone?.title ?? nextUnverifiedProject.title}`,
        reason:
          "You have completed the curriculum lessons. Prove your applied engineering capability by passing the sandbox acceptance checks for this project milestone.",
        estimatedMinutes: 15,
        ctaLabel: "Open Project Studio",
        to: "/projects/$projectId",
        params: { projectId: nextUnverifiedProject.id },
        search: {
          ...(targetMilestone ? { milestoneId: targetMilestone.id } : {}),
        },
        stepBadge: "Project Verification",
      };
    }

    return {
      kind: "practice-interview",
      eyebrow: "Interview Readiness · Final Stage",
      title: "Defend Your Architecture in a Timed Mock Interview",
      reason:
        "You have completed the lessons and verified your project milestones. Put your communication and problem-solving under realistic interview conditions.",
      estimatedMinutes: 15,
      ctaLabel: "Start Mock Interview",
      to: "/interview",
      stepBadge: "Interview Loop",
    };
  }

  // 5. Default: Start the next sequential uncompleted lesson in the learner's path
  const nextUncompletedLesson =
    (currentLesson && !lessonsCompleted.includes(currentLesson.id)
      ? currentLesson
      : lessons.find((l) => !lessonsCompleted.includes(l.id))) ??
    currentLesson ??
    lessons[0];

  const lessonId = nextUncompletedLesson?.id ?? "lesson-0-1-1";
  const lessonTitle = nextUncompletedLesson?.title ?? "A Website Is a Conversation";
  const estimatedMinutes = nextUncompletedLesson?.estimatedMinutes ?? 10;
  const isFirstLesson = lessonsCompleted.length === 0;

  return {
    kind: "start-lesson",
    eyebrow: isFirstLesson
      ? `First Step · ${moduleTitle}`
      : `Next Recommended Lesson · ${moduleTitle}`,
    title: lessonTitle,
    reason: isFirstLesson
      ? "Begin with the foundational mental model of how browsers and servers communicate—every concept is interactive and bite-sized."
      : `You completed ${lessonsCompleted.length} lesson${lessonsCompleted.length === 1 ? "" : "s"} so far. This lesson builds directly on your last verified capability in ${moduleTitle}.`,
    estimatedMinutes,
    ctaLabel: isFirstLesson
      ? `Start Lesson 1 (~${estimatedMinutes} min)`
      : `Start Lesson (~${estimatedMinutes} min)`,
    to: "/lesson/$lessonId",
    params: { lessonId },
    stepBadge: isFirstLesson ? "Lesson 1" : "Next in Path",
  };
}

/**
 * Reactive hook to subscribe to learner evidence & step resume updates.
 */
export function useLearnerEvidenceVersion(): number {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const handler = () => setVersion((v) => v + 1);
    window.addEventListener(EVIDENCE_CHANGE_EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVIDENCE_CHANGE_EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return version;
}
