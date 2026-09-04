import { describe, expect, it } from "vitest";
import { canonicalProvider } from "./canonical-provider";
import { validateCurriculumIntegrity, validateLesson } from "./schema";
import { renderActivity } from "@/components/lesson/canonical/registry";
import { createLessonSession, startLessonSession, completeSessionActivity, nextSessionActivity } from "@/lib/learning-engine/session-engine";
import type { CanonicalLesson } from "./types";

describe("Golden Lesson 0-1-1 — The Button Has Betrayed You", () => {
  const lesson = canonicalProvider.getLesson("lesson-0-1-1") as CanonicalLesson;
  const ids = ["act-011-encounter", "act-011-predict", "act-011-failure", "act-011-observation", "act-011-manipulation", "act-011-model", "act-011-investigation", "act-011-evidence", "act-011-hypothesis", "act-011-fix", "act-011-verify", "act-011-explain", "act-011-transfer", "act-011-summary", "act-011-completion"];

  it("has the authored metadata and valid schema", () => {
    expect(lesson.title).toBe("The Button Has Betrayed You");
    expect(lesson.activities.map((a) => a.id)).toEqual(ids);
    expect(validateLesson(lesson)).toBeDefined();
    expect(validateCurriculumIntegrity({ academy: canonicalProvider.getAcademy(), levels: canonicalProvider.getLevels(), modules: canonicalProvider.getModules(), topics: canonicalProvider.getTopics(), concepts: canonicalProvider.getConcepts(), skills: canonicalProvider.getSkills(), misconceptions: canonicalProvider.getMisconceptions(), lessons: [lesson] }).valid).toBe(true);
  });

  it("resolves every activity through the canonical registry", () => {
    for (const activity of lesson.activities) {
      expect(renderActivity(activity, { state: { activityId: activity.id, status: "idle", response: null, attempts: 0, hintsRevealed: 0 }, onResponse: () => {}, onSubmit: () => {}, onRetry: () => {}, onContinue: () => {}, onRevealHint: () => {} })).toBeDefined();
    }
  });

  it("progresses through the complete authored journey", () => {
    let session = startLessonSession(createLessonSession(lesson, "golden-lesson-test"));
    for (const id of ids.slice(0, -1)) {
      session = completeSessionActivity(session, id);
      session = nextSessionActivity(session, lesson);
    }
    expect(session.currentActivityId).toBe(ids.at(-1));
    expect(session.activityOrder).toEqual(ids);
  });
});
