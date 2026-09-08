import { describe, expect, it } from "vitest";
import {
  assertValidLessonExperienceDefinition,
  validateLessonExperienceDefinition,
} from "./definition-validator";
import {
  applyValidationResult,
  completeCurrentExperience,
  createLessonExperienceState,
  getCurrentExperience,
  goToNextExperience,
  isExperienceComplete,
  recordInteraction,
  recordRunExecuted,
  respondToExperience,
  retryExperience,
} from "./engine";
import { GOLDEN_JAVASCRIPT_LESSON } from "./golden-javascript-lesson";

describe("Golden JavaScript Lesson Experience", () => {
  describe("Architecture & Contract Validation", () => {
    it("passes strict definition validation without any schema issues", () => {
      const issues = validateLessonExperienceDefinition(GOLDEN_JAVASCRIPT_LESSON);
      expect(issues).toEqual([]);
      expect(() => assertValidLessonExperienceDefinition(GOLDEN_JAVASCRIPT_LESSON)).not.toThrow();
    });

    it("incorporates all 7 canonical experience kinds in the intended pedagogical sequence", () => {
      const kinds = GOLDEN_JAVASCRIPT_LESSON.experiences.map((exp) => exp.kind);
      expect(kinds).toEqual([
        "hook",
        "visual",
        "prediction",
        "sandbox-experiment",
        "explanation",
        "challenge",
        "mastery-check",
      ]);
    });

    it("ensures every experience moment has unique id, clear purpose, title, and valid completion contract", () => {
      const ids = new Set<string>();
      for (const exp of GOLDEN_JAVASCRIPT_LESSON.experiences) {
        expect(exp.id).toBeTruthy();
        expect(ids.has(exp.id)).toBe(false);
        ids.add(exp.id);

        expect(exp.purpose).toBeTruthy();
        expect(exp.purpose.length).toBeGreaterThan(15);
        expect(exp.title).toBeTruthy();
        expect(exp.completion).toBeDefined();
      }
    });

    it("verifies visual model targetIds match its declared frames", () => {
      const visual = GOLDEN_JAVASCRIPT_LESSON.experiences.find((e) => e.kind === "visual")!;
      expect(visual.completion.rule).toBe("interact-all");
      if (visual.completion.rule === "interact-all") {
        const frameIds = (visual as any).content.frames.map((f: any) => f.id);
        expect(visual.completion.targetIds).toEqual(frameIds);
        expect(visual.completion.targetIds.length).toBe(4);
      }
    });

    it("verifies prediction and mastery check have unambiguous single-choice answers", () => {
      const prediction = GOLDEN_JAVASCRIPT_LESSON.experiences.find((e) => e.kind === "prediction")!;
      if (prediction.kind === "prediction") {
        const { options, correctOptionId } = prediction.content;
        expect(options.some((o) => o.id === correctOptionId)).toBe(true);
      }

      const mastery = GOLDEN_JAVASCRIPT_LESSON.experiences.find((e) => e.kind === "mastery-check")!;
      if (mastery.kind === "mastery-check") {
        const { options, correctOptionId } = mastery.content;
        expect(options.some((o) => o.id === correctOptionId)).toBe(true);
      }
    });
  });

  describe("End-to-End Learner Journey through the Engine", () => {
    it("walks a learner through the entire 7-stage experience to full completion", () => {
      let state = createLessonExperienceState(GOLDEN_JAVASCRIPT_LESSON);
      expect(state.currentIndex).toBe(0);
      expect(state.completedIds).toEqual([]);

      // 1. Hook (Orient)
      const hook = getCurrentExperience(GOLDEN_JAVASCRIPT_LESSON, state)!;
      expect(hook.kind).toBe("hook");
      expect(isExperienceComplete(hook, state.experienceState[hook.id])).toBe(true);
      state = completeCurrentExperience(GOLDEN_JAVASCRIPT_LESSON, state);
      state = goToNextExperience(GOLDEN_JAVASCRIPT_LESSON, state);
      expect(state.currentIndex).toBe(1);

      // 2. Visual Model (Observe)
      const visual = getCurrentExperience(GOLDEN_JAVASCRIPT_LESSON, state)!;
      expect(visual.kind).toBe("visual");
      // Advancing before completing visual frames is blocked:
      expect(goToNextExperience(GOLDEN_JAVASCRIPT_LESSON, state).currentIndex).toBe(1);
      const targetIds = [
        "frame-primitives",
        "frame-heap-alloc",
        "frame-pointer-copy",
        "frame-remote-mutation",
      ];
      for (const targetId of targetIds) {
        state = recordInteraction(state, visual.id, targetId);
      }
      expect(isExperienceComplete(visual, state.experienceState[visual.id])).toBe(true);
      state = completeCurrentExperience(GOLDEN_JAVASCRIPT_LESSON, state);
      state = goToNextExperience(GOLDEN_JAVASCRIPT_LESSON, state);
      expect(state.currentIndex).toBe(2);

      // 3. Prediction (Commit hypothesis)
      const prediction = getCurrentExperience(GOLDEN_JAVASCRIPT_LESSON, state)!;
      expect(prediction.kind).toBe("prediction");
      // Incorrect answer fails and doesn't satisfy completion
      state = respondToExperience(state, prediction.id, "opt-85");
      state = applyValidationResult(state, prediction.id, { isValid: false });
      expect(isExperienceComplete(prediction, state.experienceState[prediction.id])).toBe(false);
      // Retry and correct answer passes
      state = retryExperience(state, prediction.id);
      state = respondToExperience(state, prediction.id, "opt-100");
      state = applyValidationResult(state, prediction.id, { isValid: true });
      expect(isExperienceComplete(prediction, state.experienceState[prediction.id])).toBe(true);
      state = completeCurrentExperience(GOLDEN_JAVASCRIPT_LESSON, state);
      state = goToNextExperience(GOLDEN_JAVASCRIPT_LESSON, state);
      expect(state.currentIndex).toBe(3);

      // 4. Sandbox Experiment (Active exploration)
      const experiment = getCurrentExperience(GOLDEN_JAVASCRIPT_LESSON, state)!;
      expect(experiment.kind).toBe("sandbox-experiment");
      expect(isExperienceComplete(experiment, state.experienceState[experiment.id])).toBe(false);
      state = recordRunExecuted(state, experiment.id);
      expect(isExperienceComplete(experiment, state.experienceState[experiment.id])).toBe(true);
      state = completeCurrentExperience(GOLDEN_JAVASCRIPT_LESSON, state);
      state = goToNextExperience(GOLDEN_JAVASCRIPT_LESSON, state);
      expect(state.currentIndex).toBe(4);

      // 5. Explanation (Consolidate mechanics)
      const explanation = getCurrentExperience(GOLDEN_JAVASCRIPT_LESSON, state)!;
      expect(explanation.kind).toBe("explanation");
      state = completeCurrentExperience(GOLDEN_JAVASCRIPT_LESSON, state);
      expect(isExperienceComplete(explanation, state.experienceState[explanation.id])).toBe(true);
      state = goToNextExperience(GOLDEN_JAVASCRIPT_LESSON, state);
      expect(state.currentIndex).toBe(5);

      // 6. Challenge (Apply knowledge)
      const challenge = getCurrentExperience(GOLDEN_JAVASCRIPT_LESSON, state)!;
      expect(challenge.kind).toBe("challenge");
      // Erroneous submission fails
      state = applyValidationResult(state, challenge.id, {
        isValid: false,
        message: "Original object was mutated",
      });
      expect(isExperienceComplete(challenge, state.experienceState[challenge.id])).toBe(false);
      // Validated solution passes
      state = applyValidationResult(state, challenge.id, { isValid: true });
      expect(isExperienceComplete(challenge, state.experienceState[challenge.id])).toBe(true);
      state = completeCurrentExperience(GOLDEN_JAVASCRIPT_LESSON, state);
      state = goToNextExperience(GOLDEN_JAVASCRIPT_LESSON, state);
      expect(state.currentIndex).toBe(6);

      // 7. Mastery Check (Transfer)
      const mastery = getCurrentExperience(GOLDEN_JAVASCRIPT_LESSON, state)!;
      expect(mastery.kind).toBe("mastery-check");
      state = respondToExperience(state, mastery.id, "opt-ada-light");
      state = applyValidationResult(state, mastery.id, { isValid: true });
      expect(isExperienceComplete(mastery, state.experienceState[mastery.id])).toBe(true);
      state = completeCurrentExperience(GOLDEN_JAVASCRIPT_LESSON, state);

      // Verify all 7 experiences completed
      expect(state.completedIds).toHaveLength(7);
      expect(state.completedIds).toEqual(GOLDEN_JAVASCRIPT_LESSON.experiences.map((e) => e.id));
    });
  });

  describe("Challenge Test Case Logic Verification", () => {
    const challenge = GOLDEN_JAVASCRIPT_LESSON.experiences.find((e) => e.kind === "challenge")!;
    const testCases = (challenge as any).content.testCases as Array<{
      id: string;
      description: string;
      expression: string;
    }>;

    it("verifies the buggy starter code fails the non-mutation test case", () => {
      // Starter code mutates cartItem directly
      function buggyApplyDiscount(cartItem: any, discountAmount: number) {
        cartItem.price = cartItem.price - discountAmount;
        cartItem.discounted = true;
        return cartItem;
      }

      // Check test 3: non-mutation
      const original = { id: "item-2", name: "Mouse", price: 50 };
      const result = buggyApplyDiscount(original, 10);
      const passedNonMutation =
        original.price === 50 && (original as any).discounted === undefined && result !== original;

      expect(passedNonMutation).toBe(false); // Fails because it mutated original!
    });

    it("verifies the refactored immutable solution passes all test cases", () => {
      // Clean refactored solution: returns a new object without mutating input
      function safeApplyDiscount(cartItem: any, discountAmount: number) {
        return {
          ...cartItem,
          price: cartItem.price - discountAmount,
          discounted: true,
        };
      }

      // Test 1: returns discounted price
      expect(safeApplyDiscount({ id: "item-1", name: "Keyboard", price: 100 }, 20).price).toBe(80);

      // Test 2: sets discounted flag
      expect(safeApplyDiscount({ id: "item-1", name: "Keyboard", price: 100 }, 20).discounted).toBe(
        true,
      );

      // Test 3: does not mutate original
      const original = { id: "item-2", name: "Mouse", price: 50 };
      const result = safeApplyDiscount(original, 10);
      expect(original.price).toBe(50);
      expect((original as any).discounted).toBeUndefined();
      expect(result).not.toBe(original);

      // Test 4: preserves other properties
      const itemWithExtras = { id: "item-3", name: "Monitor", price: 300, stock: 5 };
      const resWithExtras = safeApplyDiscount(itemWithExtras, 50);
      expect(resWithExtras.id).toBe("item-3");
      expect(resWithExtras.name).toBe("Monitor");
      expect(resWithExtras.stock).toBe(5);
    });
  });
});
