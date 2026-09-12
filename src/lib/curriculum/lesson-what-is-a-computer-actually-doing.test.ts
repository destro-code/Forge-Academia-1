// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from "vitest";
import { canonicalProvider } from "./canonical-provider";
import { canonicalLessonSchema } from "./schema";
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

describe("Phase 1 Mission 1 Lesson 1: What Is a Computer Actually Doing?", () => {
  let lesson: CanonicalLesson;

  beforeEach(() => {
    const loaded = canonicalProvider.getLesson("lesson-what-is-a-computer-actually-doing");
    if (!loaded) {
      throw new Error(
        "Lesson (lesson-what-is-a-computer-actually-doing) not found in canonicalProvider",
      );
    }
    lesson = loaded;
  });

  describe("1. Lesson Metadata & Curriculum Schema Verification", () => {
    it("has valid schema and exact metadata matching approved specification", () => {
      expect(lesson.id).toBe("lesson-what-is-a-computer-actually-doing");
      expect(lesson.title).toBe("What Is a Computer Actually Doing?");
      expect(lesson.difficulty).toBe("Beginner");
      expect(lesson.lessonType).toBe("instruction");
      expect(lesson.estimatedMinutes).toBe(12);
      expect(lesson.schemaVersion).toBe("1.0.0");
      expect(lesson.phaseId).toBe("phase-1");
      expect(lesson.moduleId).toBe("module-0-1");
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

    it("maps required concepts, skills, and primary capability", () => {
      expect(lesson.conceptIds).toContain("concept-input-processing-output");
      expect(lesson.conceptIds).toContain("concept-data-transformation");
      expect(lesson.conceptIds).toContain("concept-data-persistence-storage");

      expect(lesson.skillIds).toContain("skill-trace-ipo-pipeline");
      expect(lesson.skillIds).toContain("skill-classify-pipeline-stages");
      expect(lesson.skillIds).toContain("skill-distinguish-transient-vs-persistent");

      expect(lesson.primaryCapability.id).toBe("cap-trace-ipo");
      expect(lesson.primaryCapability.statement).toContain("Explain how a computer works");
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

  describe("3. Approved Learner Journey & Primitive Registration", () => {
    it("verifies computer-pipeline visual primitive is registered", () => {
      const Component = getInteractiveVisual("computer-pipeline");
      expect(Component).toBeDefined();
    });

    it("verifies exact 11-activity sequence adhering strictly to approved lesson journey", () => {
      expect(lesson.activities).toHaveLength(11);

      const [act1, act2, act3, act4, act5, act6, act7, act8, act9, act10, act11] =
        lesson.activities;

      // 1. Welcome
      expect(act1.id).toBe("act-1-welcome");
      expect(act1.type).toBe("intro");
      expect(act1.intent).toBe("orientation");

      // 2. Concrete calculator experience (2 + 3 = 5)
      expect(act2.id).toBe("act-2-calculator-action");
      expect(act2.type).toBe("visual");
      expect((act2.content as any).interactive?.kind).toBe("computer-pipeline");
      expect((act2.content as any).interactive?.config?.mode).toBe("calculator");

      // 3. Input check
      expect(act3.id).toBe("act-3-input-prediction");
      expect(act3.type).toBe("multiple-choice");
      expect(act3.validation?.type).toBe("exact-match");

      // 4. Instructions & Software
      expect(act4.id).toBe("act-4-software-instructions");
      expect(act4.type).toBe("explanation");
      expect((act4.content as any).text).toContain("is simply a set of instructions");

      // 5. Output check
      expect(act5.id).toBe("act-5-output-check");
      expect(act5.type).toBe("multiple-choice");

      // 6. Universal pipeline trace (Input -> Instructions -> Output)
      expect(act6.id).toBe("act-6-universal-pattern");
      expect(act6.type).toBe("visual");
      expect((act6.content as any).interactive?.config?.mode).toBe("trace");

      // 7. Everyday transfer: Opening a photo
      expect(act7.id).toBe("act-7-everyday-transfer");
      expect(act7.type).toBe("ordering");
      expect(act7.validation?.type).toBe("ordering");

      // 8. Storage bridge
      expect(act8.id).toBe("act-8-storage-bridge");
      expect(act8.type).toBe("explanation");
      expect((act8.content as any).text).toContain("Computers can store information");

      // 9. Practice: Volume button
      expect(act9.id).toBe("act-9-practice-volume");
      expect(act9.type).toBe("multiple-choice");

      // 10. Transfer check: Next song button
      expect(act10.id).toBe("act-10-music-assessment");
      expect(act10.type).toBe("ordering");

      // 11. Final thought
      expect(act11.id).toBe("act-11-final-thought");
      expect(act11.type).toBe("summary");
      expect(act11.intent).toBe("reflection");
    });
  });

  describe("4. Learning Engine Session Progression & Evidence Generation", () => {
    it("simulates full completion across all 11 activities and satisfies all objectives", () => {
      let session = createLessonSession(lesson, "test-user-lesson-1");
      session = startLessonSession(session);

      expect(session.status).toBe("in-progress");
      expect(session.currentActivityIndex).toBe(0);

      // Act 1: Welcome (intro)
      session = completeSessionActivity(session, "act-1-welcome");
      session = nextSessionActivity(session, lesson);

      // Act 2: Calculator action (visual)
      session = completeSessionActivity(session, "act-2-calculator-action");
      session = nextSessionActivity(session, lesson);

      // Act 3: Input check (multiple-choice)
      session = engageSessionActivity(session, "act-3-input-prediction", "opt-input-info");
      session = startActivityEvaluation(session, "act-3-input-prediction");
      const eval3 = evaluateActivityValidation(lesson.activities[2], "opt-input-info");
      expect(eval3.isValid).toBe(true);
      session = resolveActivityEvaluation(session, "act-3-input-prediction", eval3);
      session = completeSessionActivity(session, "act-3-input-prediction");
      session = nextSessionActivity(session, lesson);

      // Act 4: Software instructions (explanation)
      session = completeSessionActivity(session, "act-4-software-instructions");
      session = nextSessionActivity(session, lesson);

      // Act 5: Output check (multiple-choice)
      session = engageSessionActivity(session, "act-5-output-check", "opt-output-5");
      session = startActivityEvaluation(session, "act-5-output-check");
      const eval5 = evaluateActivityValidation(lesson.activities[4], "opt-output-5");
      expect(eval5.isValid).toBe(true);
      session = resolveActivityEvaluation(session, "act-5-output-check", eval5);
      session = completeSessionActivity(session, "act-5-output-check");
      session = nextSessionActivity(session, lesson);

      // Act 6: Universal pattern (visual)
      session = completeSessionActivity(session, "act-6-universal-pattern");
      session = nextSessionActivity(session, lesson);

      // Act 7: Photo ordering (ordering)
      const photoOrder = ["item-photo-input", "item-photo-instructions", "item-photo-output"];
      session = engageSessionActivity(session, "act-7-everyday-transfer", photoOrder);
      session = startActivityEvaluation(session, "act-7-everyday-transfer");
      const eval7 = evaluateActivityValidation(lesson.activities[6], photoOrder);
      expect(eval7.isValid).toBe(true);
      session = resolveActivityEvaluation(session, "act-7-everyday-transfer", eval7);
      session = completeSessionActivity(session, "act-7-everyday-transfer");
      session = nextSessionActivity(session, lesson);

      // Act 8: Storage bridge (explanation)
      session = completeSessionActivity(session, "act-8-storage-bridge");
      session = nextSessionActivity(session, lesson);

      // Act 9: Volume button (multiple-choice)
      session = engageSessionActivity(session, "act-9-practice-volume", "opt-vol-speaker");
      session = startActivityEvaluation(session, "act-9-practice-volume");
      const eval9 = evaluateActivityValidation(lesson.activities[8], "opt-vol-speaker");
      expect(eval9.isValid).toBe(true);
      session = resolveActivityEvaluation(session, "act-9-practice-volume", eval9);
      session = completeSessionActivity(session, "act-9-practice-volume");
      session = nextSessionActivity(session, lesson);

      // Act 10: Music ordering (ordering)
      const musicOrder = ["item-music-input", "item-music-instructions", "item-music-output"];
      session = engageSessionActivity(session, "act-10-music-assessment", musicOrder);
      session = startActivityEvaluation(session, "act-10-music-assessment");
      const eval10 = evaluateActivityValidation(lesson.activities[9], musicOrder);
      expect(eval10.isValid).toBe(true);
      session = resolveActivityEvaluation(session, "act-10-music-assessment", eval10);
      session = completeSessionActivity(session, "act-10-music-assessment");
      session = nextSessionActivity(session, lesson);

      // Act 11: Final thought (summary)
      session = completeSessionActivity(session, "act-11-final-thought");

      // Verify completion
      const check = checkLessonCompletion(session, lesson);
      expect(check.canComplete).toBe(true);

      session = completeLessonSession(session, lesson);
      expect(session.status).toBe("completed");

      const progress = calculateSessionProgress(session);
      expect(progress.percentage).toBe(100);

      // Verify evidence tokens
      const tokens = generateLessonEvidenceTokens(lesson, session);
      expect(tokens.length).toBeGreaterThanOrEqual(11);

      const satisfaction = evaluateLessonObjectivesSatisfaction(lesson, tokens);
      expect(satisfaction.allSatisfied).toBe(true);
    });
  });
});
