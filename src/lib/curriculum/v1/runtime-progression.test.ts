// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { adaptLessonV1ToLayer1 } from "./adapter";
import { goldenLesson0CanonicalV1 } from "../golden-lesson-v1";
import {
  createLessonSession,
  startLessonSession,
  engageSessionActivity,
  completeSessionActivity,
  nextSessionActivity,
  checkLessonCompletion,
  completeLessonSession,
  reconcileSessionWithLesson,
} from "@/lib/learning-engine/session-engine";
import { LocalStorageSessionPersistenceAdapter } from "@/lib/learning-engine/local-storage-persistence";

describe("V1 golden lesson — runtime progression via the real session-engine (no React)", () => {
  const { lesson } = adaptLessonV1ToLayer1(goldenLesson0CanonicalV1);

  it("can progress through every activity in sequence and complete the lesson", () => {
    let session = startLessonSession(createLessonSession(lesson));
    expect(session.activityOrder).toHaveLength(lesson.activities.length);
    expect(session.currentActivityIndex).toBe(0);

    for (let i = 0; i < lesson.activities.length; i++) {
      const activityId = session.activityOrder[i];
      session = engageSessionActivity(session, activityId, { touched: true });
      session = completeSessionActivity(session, activityId, Date.now());
      if (i < lesson.activities.length - 1) {
        session = nextSessionActivity(session);
        expect(session.currentActivityIndex).toBe(i + 1);
      }
    }

    expect(session.completedActivityIds).toHaveLength(lesson.activities.length);
    const readiness = checkLessonCompletion(session, lesson);
    expect(readiness.canComplete).toBe(true);

    session = completeLessonSession(session, lesson);
    expect(session.status).toBe("completed");
  });
});

describe("V1 golden lesson — persistence and resume (real LocalStorageSessionPersistenceAdapter)", () => {
  const { lesson } = adaptLessonV1ToLayer1(goldenLesson0CanonicalV1);

  it("persists progress and resumes with completed activities intact", () => {
    const adapter = new LocalStorageSessionPersistenceAdapter("forge:test-session:");

    let session = startLessonSession(createLessonSession(lesson));
    const firstActivityId = session.activityOrder[0];
    session = engageSessionActivity(session, firstActivityId, { touched: true });
    session = completeSessionActivity(session, firstActivityId, Date.now());
    session = nextSessionActivity(session);

    adapter.save(session);

    // Simulate a reload: fresh load from storage, reconciled against the lesson.
    const restored = adapter.loadByLessonId(lesson.id);
    expect(restored).not.toBeNull();
    if (!restored) return;

    const resumed = startLessonSession(reconcileSessionWithLesson(restored, lesson));
    expect(resumed.completedActivityIds).toContain(firstActivityId);
    expect(resumed.currentActivityIndex).toBe(1);

    adapter.delete(resumed.sessionId);
    expect(adapter.loadByLessonId(lesson.id)).toBeNull();
  });
});
