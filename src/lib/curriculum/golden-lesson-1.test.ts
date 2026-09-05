import { describe, it, expect, beforeEach } from "vitest";
import { canonicalProvider } from "./canonical-provider";
import { validateCurriculumIntegrity } from "./schema";
import { evaluateActivityValidation } from "@/components/lesson/canonical/validation";
import { renderActivity } from "@/components/lesson/canonical/registry";
import {
  createLessonSession,
  startLessonSession,
  engageSessionActivity,
  startActivityEvaluation,
  resolveActivityEvaluation,
  completeSessionActivity,
  nextSessionActivity,
  checkLessonCompletion,
  completeLessonSession,
  calculateSessionProgress,
} from "@/lib/learning-engine/session-engine";
import {
  generateLessonEvidenceTokens,
  evaluateLessonObjectivesSatisfaction,
} from "@/lib/learning-engine/evidence-engine";
import { InMemorySessionPersistenceAdapter } from "@/lib/learning-engine/persistence-port";
import type { CanonicalLesson, CanonicalActivity } from "./types";

describe("Phase 5.2 — Golden Lesson 1 (lesson-0-1-1): What Is Frontend Development? / The Button Has Betrayed You", () => {
  let lesson: CanonicalLesson;

  beforeEach(() => {
    const loaded = canonicalProvider.getLesson("lesson-0-1-1");
    if (!loaded) {
      throw new Error("Golden Lesson 1 (lesson-0-1-1) not found in canonicalProvider");
    }
    lesson = loaded;
  });

  describe("1. Lesson Metadata & Curriculum Schema Verification", () => {
    it("has valid schema and exact metadata matching specification", () => {
      expect(lesson.id).toBe("lesson-0-1-1");
      expect(lesson.topicId).toBe("what-is-frontend-development");
      expect(lesson.title).toBe("The Button Has Betrayed You");
      expect(lesson.difficulty).toBe("Beginner");
      expect(lesson.lessonType).toBe("instruction");
      expect(lesson.estimatedMinutes).toBe(15);
      expect(lesson.schemaVersion).toBe("1.0.0");
    });

    it("verifies full curriculum relational integrity with zero errors", () => {
      const integrity = validateCurriculumIntegrity({
        academy: canonicalProvider.getAcademy(),
        levels: canonicalProvider.getLevels(),
        modules: canonicalProvider.getModules(),
        topics: canonicalProvider.getTopics(),
        concepts: canonicalProvider.getConcepts(),
        skills: canonicalProvider.getSkills(),
        misconceptions: canonicalProvider.getMisconceptions(),
        lessons: [lesson],
      });

      expect(integrity.valid).toBe(true);
      expect(integrity.errors).toHaveLength(0);
    });

    it("maps all required concepts and skills", () => {
      expect(lesson.conceptIds).toContain("concept-debugging-workflow");
      expect(lesson.conceptIds).toContain("concept-web-platform-trio");
      expect(lesson.conceptIds).toContain("concept-web-architecture");
      expect(lesson.conceptIds).toContain("concept-client-server-split");

      expect(lesson.skillIds).toContain("skill-diagnose-symptom-root-causes");
      expect(lesson.skillIds).toContain("skill-formulate-debugging-hypothesis");
      expect(lesson.skillIds).toContain("skill-repair-multi-file-defects");
    });

    it("defines the 4 core objectives with explicit mapping", () => {
      expect(lesson.objectives).toHaveLength(4);
      const [obj1, obj2, obj3, obj4] = lesson.objectives;

      expect(obj1.id).toBe("obj-0-1-1-observe");
      expect(obj1.conceptIds).toContain("concept-debugging-workflow");
      expect(obj1.skillIds).toContain("skill-diagnose-symptom-root-causes");

      expect(obj2.id).toBe("obj-0-1-1-investigate");
      expect(obj2.conceptIds).toContain("concept-debugging-workflow");
      expect(obj2.skillIds).toContain("skill-formulate-debugging-hypothesis");

      expect(obj3.id).toBe("obj-0-1-1-diagnose");
      expect(obj3.conceptIds).toContain("concept-debugging-workflow");
      expect(obj3.skillIds).toContain("skill-diagnose-symptom-root-causes");

      expect(obj4.id).toBe("obj-0-1-1-explain");
      expect(obj4.conceptIds).toContain("concept-debugging-workflow");
      expect(obj4.skillIds).toContain("skill-formulate-debugging-hypothesis");
    });

    it("contains exactly 14 activities in the prescribed order", () => {
      expect(lesson.activities).toHaveLength(14);

      const activityIds = lesson.activities.map((a) => a.id);
      expect(activityIds).toEqual([
        "act-0-1-1-intro",
        "act-0-1-1-visual",
        "act-0-1-1-predict",
        "act-0-1-1-observe",
        "act-0-1-1-manipulate",
        "act-0-1-1-model",
        "act-0-1-1-choice",
        "act-0-1-1-causal-model",
        "act-0-1-1-predict-output",
        "act-0-1-1-debug",
        "act-0-1-1-explain",
        "act-0-1-1-transfer",
        "act-0-1-1-summary",
        "act-0-1-1-completion",
      ]);
    });

    it("has complete completion rules requiring all activities and evidence mapping", () => {
      expect(lesson.completion).toBeDefined();
      expect(lesson.completion?.requiredActivityIds).toEqual([
        "act-0-1-1-predict",
        "act-0-1-1-observe",
        "act-0-1-1-manipulate",
        "act-0-1-1-choice",
        "act-0-1-1-debug",
        "act-0-1-1-explain",
        "act-0-1-1-transfer",
      ]);
      expect(lesson.completion?.minimumScore).toBe(70);
      expect(lesson.completion?.evidenceRequirements).toHaveLength(4);
    });
  });

  describe("2. Activity Validation Evaluation Contract", () => {
    it("validates multiple-choice (act-0-1-1-choice)", () => {
      const choiceActivity = lesson.activities.find(
        (a) => a.id === "act-0-1-1-choice",
      ) as CanonicalActivity;
      expect(choiceActivity).toBeDefined();

      const correctResult = evaluateActivityValidation(choiceActivity, "next-a");
      expect(correctResult.isValid).toBe(true);

      const incorrectResult = evaluateActivityValidation(choiceActivity, "next-b");
      expect(incorrectResult.isValid).toBe(false);
    });

    it("validates multiple-choice (act-0-1-1-predict)", () => {
      const predictActivity = lesson.activities.find(
        (a) => a.id === "act-0-1-1-predict",
      ) as CanonicalActivity;
      expect(predictActivity).toBeDefined();

      const correctResult = evaluateActivityValidation(predictActivity, "opt-a");
      expect(correctResult.isValid).toBe(true);

      const incorrectResult = evaluateActivityValidation(predictActivity, "opt-b");
      expect(incorrectResult.isValid).toBe(false);
    });

    it("validates reflection (act-0-1-1-explain)", () => {
      const explainActivity = lesson.activities.find(
        (a) => a.id === "act-0-1-1-explain",
      ) as CanonicalActivity;
      expect(explainActivity).toBeDefined();

      const validText =
        "When clicked, the button calls a click handler that throws a TypeError because the target element was not found in the DOM.";
      const validResult = evaluateActivityValidation(explainActivity, validText);
      expect(validResult.isValid).toBe(true);
    });
  });

  describe("3. Central Activity Renderer Resolution", () => {
    it("renders all activities via renderActivity without error", () => {
      lesson.activities.forEach((activity) => {
        const rendered = renderActivity(activity, {
          state: {
            activityId: activity.id,
            status: "idle",
            response: null,
            attempts: 0,
            hintsRevealed: 0,
          },
          onResponse: () => {},
          onSubmit: () => {},
          onRetry: () => {},
          onContinue: () => {},
          onRevealHint: () => {},
        });

        expect(rendered).toBeDefined();
      });
    });
  });

  describe("4. End-to-End Learning Engine Progression & Completion Lifecycle", () => {
    it("progresses through activities, records evidence, and achieves lesson completion", () => {
      const persistence = new InMemorySessionPersistenceAdapter();
      const userId = "learner-user-fe101";

      let session = createLessonSession(lesson, userId);
      session = startLessonSession(session);
      persistence.save(session);

      expect(session.status).toBe("in-progress");
      expect(session.currentActivityId).toBe("act-0-1-1-intro");

      for (const activity of lesson.activities) {
        if (activity.type === "multiple-choice") {
          const opt = activity.id === "act-0-1-1-predict" ? "opt-a" : "next-a";
          session = engageSessionActivity(session, activity.id, opt);
          session = startActivityEvaluation(session, activity.id);
          const evalResult = evaluateActivityValidation(activity, opt);
          session = resolveActivityEvaluation(session, activity.id, evalResult);
        } else if (activity.type === "multi-select") {
          const expected = (activity.validation as { expected?: string[] })?.expected || [
            "symptom-no-update",
            "symptom-console-error",
          ];
          session = engageSessionActivity(session, activity.id, expected);
          session = startActivityEvaluation(session, activity.id);
          const evalResult = evaluateActivityValidation(activity, expected);
          session = resolveActivityEvaluation(session, activity.id, evalResult);
        } else if (activity.type === "output-prediction") {
          const opt = (activity.validation as { expected?: string })?.expected || "Changes saved.";
          session = engageSessionActivity(session, activity.id, opt);
          session = startActivityEvaluation(session, activity.id);
          const evalResult = evaluateActivityValidation(activity, opt);
          session = resolveActivityEvaluation(session, activity.id, evalResult);
        } else if (activity.type === "interactive-code" || activity.type === "debug") {
          session = engageSessionActivity(session, activity.id, "code response");
          session = startActivityEvaluation(session, activity.id);
          const evalResult = { isValid: true, score: 100 };
          session = resolveActivityEvaluation(session, activity.id, evalResult);
        } else if (activity.type === "reflection") {
          const text =
            "A thorough reflection explaining the chain of browser events and causal debugging steps.";
          session = engageSessionActivity(session, activity.id, text);
          session = startActivityEvaluation(session, activity.id);
          const evalResult = evaluateActivityValidation(activity, text);
          session = resolveActivityEvaluation(session, activity.id, evalResult);
        }

        session = completeSessionActivity(session, activity.id);
        if (activity.id !== lesson.activities[lesson.activities.length - 1].id) {
          session = nextSessionActivity(session, lesson);
        }
      }

      const progress = calculateSessionProgress(session);
      expect(progress.percentage).toBe(100);

      const completionCheck = checkLessonCompletion(session, lesson);
      expect(completionCheck.canComplete).toBe(true);

      session = completeLessonSession(session, lesson);
      expect(session.status).toBe("completed");

      const evidenceTokens = generateLessonEvidenceTokens(lesson, session);
      expect(evidenceTokens.length).toBeGreaterThanOrEqual(4);

      const satisfaction = evaluateLessonObjectivesSatisfaction(lesson, evidenceTokens);
      expect(satisfaction.allSatisfied).toBe(true);
    });
  });
});
