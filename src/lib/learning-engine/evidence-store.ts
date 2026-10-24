import { useState, useEffect } from "react";
import type { Lesson, Module, Project, ProgressState } from "@/lib/types";
import type { LessonSessionState } from "./types";

export type EvidenceStatus =
  | "not-started"
  | "in-progress"
  | "completed"
  | "self-reported"
  | "verified"
  | "needs-attention";

export type CapabilityStatus =
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
  sourceType: "lesson" | "project" | "interview";
  sourceId: string;
  status: CapabilityStatus;
  evidenceStatus: EvidenceStatus;
  summary: string;
  updatedAt: string;
}

export interface GuidedNextStepRecommendation {
  kind: "resume-lesson" | "review-weakness" | "verify-project" | "start-lesson";
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
    const totalSteps = session.totalActivities || Object.keys(session.activities || {}).length || 0;
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

export function recordCapabilityEvidence(record: Omit<CapabilityEvidenceRecord, "updatedAt">): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getCapabilityEvidenceRecords();
    const nextRecord: CapabilityEvidenceRecord = {
      ...record,
      updatedAt: new Date().toISOString(),
    };
    const filtered = existing.filter((r) => r.id !== record.id);
    const updated = [nextRecord, ...filtered].slice(0, 60);
    window.localStorage.setItem(CAPABILITY_EVIDENCE_KEY, JSON.stringify(updated));
    notifyEvidenceUpdated();
  } catch {
    // Ignore storage quota errors
  }
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

  // 1. Check if the learner has an unfinished lesson in progress with an exact step index > 0
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

  // 2. Check if a recent interview or capability record flagged a weakness ("needs-review")
  const evidenceRecords = getCapabilityEvidenceRecords();
  const flaggedRecord = evidenceRecords.find((r) => r.status === "needs-review");
  if (flaggedRecord) {
    const matchingLesson =
      lessons.find((l) => l.id === flaggedRecord.sourceId) || currentLesson;
    if (matchingLesson) {
      return {
        kind: "review-weakness",
        eyebrow: "Recommended Review · Needs Attention",
        title: `Strengthen: ${flaggedRecord.title}`,
        reason: `${flaggedRecord.summary} Reviewing this concept now will turn a fragile spot into verified confidence.`,
        estimatedMinutes: 5,
        ctaLabel: "Review & Verify Concept",
        to: "/lesson/$lessonId",
        params: { lessonId: matchingLesson.id },
        stepBadge: "Targeted Review",
      };
    }
  }

  // 3. Check if the learner has self-reported project tasks that haven't been verified in the Playground yet
  const verifiedMap = getVerifiedProjectTasks();
  const projectTasks = progress.projectTasks || {};
  for (const project of projects) {
    const allTasks = project.milestones.flatMap((m) => m.tasks || []);
    const selfReportedUnverified = allTasks.filter(
      (t) => projectTasks[`${project.id}:${t.id}`] && !verifiedMap[`${project.id}:${t.id}`],
    );
    if (selfReportedUnverified.length > 0) {
      return {
        kind: "verify-project",
        eyebrow: `Project Verification · ${project.title}`,
        title: `Verify ${selfReportedUnverified.length} Self-Reported Task${selfReportedUnverified.length > 1 ? "s" : ""} in Playground`,
        reason: `You checked off ${selfReportedUnverified.length} task${selfReportedUnverified.length > 1 ? "s" : ""} in "${project.title}" as self-reported. Run the automated verification check in the Playground to upgrade them to Verified evidence.`,
        estimatedMinutes: 4,
        ctaLabel: "Verify in Playground",
        to: "/playground",
        search: { projectId: project.id },
        stepBadge: "Self-Reported → Verified",
      };
    }
  }

  // 4. Default: Start the next sequential lesson in the learner's path
  const targetLesson = currentLesson ?? lessons[0];
  const lessonId = targetLesson?.id ?? "lesson-0-1-1";
  const lessonTitle = targetLesson?.title ?? "A Website Is a Conversation";
  const estimatedMinutes = targetLesson?.estimatedMinutes ?? 10;
  const isFirstLesson = lessonsCompleted.length === 0;

  return {
    kind: "start-lesson",
    eyebrow: isFirstLesson ? `First Step · ${moduleTitle}` : `Next Recommended Lesson · ${moduleTitle}`,
    title: lessonTitle,
    reason: isFirstLesson
      ? "Begin with the foundational mental model of how browsers and servers communicate—every concept is interactive and bite-sized."
      : `You completed ${lessonsCompleted.length} lesson${lessonsCompleted.length === 1 ? "" : "s"} so far. This lesson builds directly on your last verified capability in ${moduleTitle}.`,
    estimatedMinutes,
    ctaLabel: isFirstLesson ? `Start Lesson 1 (~${estimatedMinutes} min)` : `Start Lesson (~${estimatedMinutes} min)`,
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
