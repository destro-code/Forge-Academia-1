// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from "vitest";
import { canonicalProvider } from "./canonical-provider";
import { validateCurriculumIntegrity, canonicalLessonSchema } from "./schema";
import { lintLesson } from "./authoring/lint-lesson";
import { getInteractiveVisual } from "@/components/lesson/canonical/renderers/visuals";
import { evaluateActivityValidation } from "@/components/lesson/canonical/validation";
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
import type { CanonicalLesson } from "./types";

describe("Phase 0 — Golden Lesson 1 (lesson-your-computer-is-not-magic): Your Computer Is Not Magic", () => {
  let lesson: CanonicalLesson;

  beforeEach(() => {
    const loaded = canonicalProvider.getLesson("lesson-your-computer-is-not-magic");
    if (!loaded) {
      throw new Error(
        "Lesson 1 (lesson-your-computer-is-not-magic) not found in canonicalProvider",
      );
    }
    lesson = loaded;
  });

  describe("1. Lesson Metadata & Curriculum Schema Verification", () => {
    it("has valid schema and exact metadata matching specification", () => {
      expect(lesson.id).toBe("lesson-your-computer-is-not-magic");
      expect(lesson.title).toBe("Your Computer Is Not Magic");
      expect(lesson.difficulty).toBe("Beginner");
      expect(lesson.lessonType).toBe("instruction");
      expect(lesson.estimatedMinutes).toBe(15);
      expect(lesson.schemaVersion).toBe("1.0.0");
      expect(lesson.phaseId).toBe("phase-0");
      expect(lesson.moduleId).toBe("module-0-1");
      expect(lesson.capabilityGroupId).toBe("capgroup-0-1-1");
    });

    it("verifies Zod schema parsing succeeds unconditionally", () => {
      const parsed = canonicalLessonSchema.safeParse(lesson);
      expect(parsed.success).toBe(true);
    });

    it("verifies full curriculum relational integrity with zero errors in canonicalProvider", () => {
      const integrity = canonicalProvider.validateAllContent();
      expect(integrity.valid).toBe(true);
      expect(integrity.errors).toHaveLength(0);
    });

    it("maps all 3 required concepts, 3 skills, and capabilities", () => {
      expect(lesson.conceptIds).toContain("concept-input-processing-output");
      expect(lesson.conceptIds).toContain("concept-data-transformation");
      expect(lesson.conceptIds).toContain("concept-data-persistence-storage");

      expect(lesson.skillIds).toContain("skill-trace-ipo-pipeline");
      expect(lesson.skillIds).toContain("skill-classify-pipeline-stages");
      expect(lesson.skillIds).toContain("skill-distinguish-transient-vs-persistent");

      expect(lesson.capabilityIds).toContain("cap-trace-ipo");
      expect(lesson.capabilityIds).toContain("cap-classify-pipeline-roles");
      expect(lesson.capabilityIds).toContain("cap-reason-storage-need");

      expect(lesson.primaryCapability.id).toBe("cap-trace-ipo");
      expect(lesson.secondaryCapabilities).toHaveLength(2);
    });
  });

  describe("2. Authoring Linter Validation", () => {
    it("passes authoring linter with zero errors", () => {
      const lintResult = lintLesson(lesson);
      if (!lintResult.valid) {
        console.error("LINT ERRORS:", JSON.stringify(lintResult.errors, null, 2));
      }
      expect(lintResult.valid).toBe(true);
      expect(lintResult.errors).toHaveLength(0);
    });
  });

  describe("3. Visual Primitive Registration & Interactive Activities", () => {
    it("verifies computer-pipeline visual primitive is registered", () => {
      const Component = getInteractiveVisual("computer-pipeline");
      expect(Component).toBeDefined();
    });

    it("verifies activity sequence and types", () => {
      expect(lesson.activities).toHaveLength(7);

      const [act1, act2, act3, act4, act5, act6, act7] = lesson.activities;

      expect(act1.id).toBe("act-1-button-mystery");
      expect(act1.type).toBe("multiple-choice");
      expect(act1.intent).toBe("prediction");

      expect(act2.id).toBe("act-2-pipeline-trace");
      expect(act2.type).toBe("visual");
      expect((act2.content as any).interactive?.kind).toBe("computer-pipeline");
      expect((act2.content as any).interactive?.config?.mode).toBe("trace");

      expect(act3.id).toBe("act-3-pipeline-manipulate");
      expect(act3.type).toBe("visual");
      expect((act3.content as any).interactive?.kind).toBe("computer-pipeline");
      expect((act3.content as any).interactive?.config?.mode).toBe("mapping");

      expect(act4.id).toBe("act-4-storage-explanation");
      expect(act4.type).toBe("explanation");
      expect(act4.intent).toBe("understanding");

      expect(act5.id).toBe("act-5-message-pipeline-ordering");
      expect(act5.type).toBe("ordering");
      expect(act5.intent).toBe("application");

      expect(act6.id).toBe("act-6-photo-transfer");
      expect(act6.type).toBe("multiple-choice");
      expect(act6.intent).toBe("transfer");

      expect(act7.id).toBe("act-7-machine-demystified-summary");
      expect(act7.type).toBe("summary");
      expect(act7.intent).toBe("reflection");
    });
  });

  describe("4. Learning Engine Session Progression & Evidence Generation", () => {
    it("simulates full completion across all 7 activities and satisfies all objectives", () => {
      let session = createLessonSession(lesson, "test-user-1");
      session = startLessonSession(session);

      expect(session.status).toBe("in-progress");
      expect(session.currentActivityIndex).toBe(0);

      // Act 1: Prediction (Multiple Choice)
      session = engageSessionActivity(session, "act-1-button-mystery", "opt-button-signal");
      session = startActivityEvaluation(session, "act-1-button-mystery");
      const eval1 = evaluateActivityValidation(lesson.activities[0], "opt-button-signal");
      session = resolveActivityEvaluation(session, "act-1-button-mystery", eval1);
      session = completeSessionActivity(session, "act-1-button-mystery");
      session = nextSessionActivity(session, lesson);

      // Act 2: Visual Pipeline Trace
      session = completeSessionActivity(session, "act-2-pipeline-trace");
      session = nextSessionActivity(session, lesson);

      // Act 3: Visual Pipeline Manipulate
      session = completeSessionActivity(session, "act-3-pipeline-manipulate");
      session = nextSessionActivity(session, lesson);

      // Act 4: Storage Explanation
      session = completeSessionActivity(session, "act-4-storage-explanation");
      session = nextSessionActivity(session, lesson);

      // Act 5: Ordering (Application)
      const orderingSeq = ["item-input", "item-processing", "item-storage", "item-output"];
      session = engageSessionActivity(session, "act-5-message-pipeline-ordering", orderingSeq);
      session = startActivityEvaluation(session, "act-5-message-pipeline-ordering");
      const eval5 = evaluateActivityValidation(lesson.activities[4], orderingSeq);
      session = resolveActivityEvaluation(session, "act-5-message-pipeline-ordering", eval5);
      session = completeSessionActivity(session, "act-5-message-pipeline-ordering");
      session = nextSessionActivity(session, lesson);

      // Act 6: Multiple Choice (Transfer)
      session = engageSessionActivity(session, "act-6-photo-transfer", "opt-stored-on-shutter");
      session = startActivityEvaluation(session, "act-6-photo-transfer");
      const eval6 = evaluateActivityValidation(lesson.activities[5], "opt-stored-on-shutter");
      session = resolveActivityEvaluation(session, "act-6-photo-transfer", eval6);
      session = completeSessionActivity(session, "act-6-photo-transfer");
      session = nextSessionActivity(session, lesson);

      // Act 7: Summary
      session = completeSessionActivity(session, "act-7-machine-demystified-summary");

      const check = checkLessonCompletion(session, lesson);
      expect(check.canComplete).toBe(true);

      session = completeLessonSession(session, lesson);
      expect(session.status).toBe("completed");

      const progress = calculateSessionProgress(session);
      expect(progress.percentage).toBe(100);

      // Evidence generation
      const tokens = generateLessonEvidenceTokens(lesson, session);
      expect(tokens.length).toBeGreaterThanOrEqual(7);

      const satisfaction = evaluateLessonObjectivesSatisfaction(lesson, tokens);
      expect(satisfaction.allSatisfied).toBe(true);
    });
  });
});
