import { describe, it, expect } from "vitest";
import { interpretExperience } from "./experience-interpreter";
import { composeExperience } from "./experience-composer";
import type {
  ExperienceContext,
  ExperienceInterpretation,
  ExperienceComposition,
  SupportingSurface,
} from "./experience-types";
import type { CanonicalActivity, CanonicalLesson } from "@/lib/curriculum/types";
import type { ActivitySessionState, ActivityEvaluationResult } from "@/lib/learning-engine/types";
import goldenLessonRaw from "@/data/canonical/lessons/lesson-what-is-frontend-development.json";

const goldenLesson = goldenLessonRaw as unknown as CanonicalLesson;

function getActivity(id: string): CanonicalActivity {
  const activity = goldenLesson.activities.find((a) => a.id === id);
  if (!activity) {
    throw new Error(`Activity with id "${id}" not found in Golden Lesson`);
  }
  return activity;
}

describe("Forge Lesson Player — Experience Composer Unit Tests", () => {
  // --------------------------------------------------------------------------
  // TEST A — INTRO
  // --------------------------------------------------------------------------
  describe("Test A — Intro (act-0-1-1-intro)", () => {
    it("composes orientation intro with presentation surface commanding highest priority", () => {
      const activity = getActivity("act-0-1-1-intro");
      const context: ExperienceContext = {
        lesson: goldenLesson,
        activity,
      };

      const interpretation = interpretExperience(context);
      const composition = composeExperience(interpretation);

      expect(composition.mode).toBe("discover");
      expect(composition.focalSurface).toBe("presentation");
      expect(composition.spatialMode).toBe("focused");
      expect(composition.density).toBe("spacious");

      // Focal surface must be visible and have the highest priority (100)
      const presentationPlacement = composition.surfaces.find((s) => s.surface === "presentation");
      expect(presentationPlacement).toBeDefined();
      expect(presentationPlacement?.role).toBe("focal");
      expect(presentationPlacement?.visible).toBe(true);
      expect(presentationPlacement?.priority).toBe(100);

      // Verify it is strictly higher than any other surface priority
      for (const surface of composition.surfaces) {
        if (surface.surface !== "presentation") {
          expect(surface.priority).toBeLessThan(100);
        }
      }

      expect(composition.surfaces[0].surface).toBe("presentation");
    });
  });

  // --------------------------------------------------------------------------
  // TEST B — PREDICTION
  // --------------------------------------------------------------------------
  describe("Test B — Prediction (act-0-1-1-predict)", () => {
    it("composes prediction activity preserving interaction focal surface and action metadata", () => {
      const activity = getActivity("act-0-1-1-predict");
      const context: ExperienceContext = {
        lesson: goldenLesson,
        activity,
      };

      const interpretation = interpretExperience(context);
      const composition = composeExperience(interpretation);

      expect(composition.mode).toBe("predict");
      expect(composition.focalSurface).toBe("interaction");

      const interactionPlacement = composition.surfaces.find((s) => s.surface === "interaction");
      expect(interactionPlacement).toBeDefined();
      expect(interactionPlacement?.role).toBe("focal");
      expect(interactionPlacement?.visible).toBe(true);
      expect(interactionPlacement?.priority).toBe(100);

      // Primary action must be strictly preserved
      expect(composition.primaryAction).toEqual(interpretation.primaryAction);
      expect(composition.primaryAction.label).toBe("Make your prediction");
      expect(composition.primaryAction.intent).toBe("submit");
      expect(composition.primaryAction.kind).toBe("primary");
    });
  });

  // --------------------------------------------------------------------------
  // TEST C — INTERACTIVE MANIPULATION
  // --------------------------------------------------------------------------
  describe("Test C — Interactive Manipulation (act-0-1-1-manipulate)", () => {
    it("composes interactive manipulation with editor surface and split spatial mode", () => {
      const activity = getActivity("act-0-1-1-manipulate");
      const context: ExperienceContext = {
        lesson: goldenLesson,
        activity,
      };

      const interpretation = interpretExperience(context);
      const composition = composeExperience(interpretation);

      expect(composition.mode).toBe("interact");
      expect(composition.focalSurface).toBe("editor");
      expect(composition.spatialMode).toBe("split");

      const editorPlacement = composition.surfaces.find((s) => s.surface === "editor");
      expect(editorPlacement).toBeDefined();
      expect(editorPlacement?.role).toBe("focal");
      expect(editorPlacement?.visible).toBe(true);
      expect(editorPlacement?.priority).toBe(100);

      // In act-0-1-1-manipulate, console is not enabled in the definition,
      // so it must NOT appear in the composition surfaces
      expect(interpretation.supportingSurfaces).not.toContain("console");
      const consolePlacement = composition.surfaces.find((s) => s.surface === "console");
      expect(consolePlacement).toBeUndefined();
    });
  });

  // --------------------------------------------------------------------------
  // TEST D — FAILED EVALUATION
  // --------------------------------------------------------------------------
  describe("Test D — Failed Evaluation", () => {
    it("composes debug experience with evaluation surface and preserved retry action", () => {
      const activity = getActivity("act-0-1-1-choice");
      const failedEvaluation: ActivityEvaluationResult = {
        isValid: false,
        score: 0,
        feedbackMessage: "Check the failure boundary.",
      };

      const failedState: ActivitySessionState = {
        activityId: activity.id,
        status: "failed",
        response: "opt-wrong",
        attempts: 1,
        hintsRevealed: 0,
        lastEvaluation: failedEvaluation,
        startedAt: 1000,
        evaluatedAt: 1100,
      };

      const context: ExperienceContext = {
        lesson: goldenLesson,
        activity,
        activityState: failedState,
        evaluationResult: failedEvaluation,
      };

      const interpretation = interpretExperience(context);
      const composition = composeExperience(interpretation);

      expect(composition.mode).toBe("debug");

      const evaluationPlacement = composition.surfaces.find((s) => s.surface === "evaluation");
      expect(evaluationPlacement).toBeDefined();
      expect(evaluationPlacement?.role).toBe("supporting");
      expect(evaluationPlacement?.visible).toBe(true);
      expect(evaluationPlacement?.priority).toBe(90);

      // Primary retry action preserved exactly
      expect(composition.primaryAction).toEqual(interpretation.primaryAction);
      expect(composition.primaryAction.kind).toBe("retry");
      expect(composition.primaryAction.intent).toBe("retry");
      expect(composition.primaryAction.label).toBe("Try again");
      expect(composition.assistance.requiresRetry).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // TEST E — SUPPORTING SURFACE ORDERING
  // --------------------------------------------------------------------------
  describe("Test E — Supporting Surface Ordering", () => {
    it("orders surfaces deterministically according to hierarchical priority regardless of input order", () => {
      // Deliberately unordered supporting surfaces with 'inspector' omitted
      const mockInterpretation: ExperienceInterpretation = {
        mode: "debug",
        focalSurface: "editor",
        supportingSurfaces: ["model", "hint", "evaluation", "misconception", "console"],
        spatialMode: "split",
        density: "normal",
        primaryAction: {
          label: "Run",
          kind: "primary",
          intent: "submit",
          disabled: false,
        },
        assistance: {
          hasHints: true,
          hintsAvailable: 2,
          hintsRevealed: 1,
          requiresRetry: true,
        },
      };

      const composition = composeExperience(mockInterpretation);

      // Exact expected deterministic order:
      // 1. focal surface (editor: 100)
      // 2. evaluation (90)
      // 3. misconception (80)
      // 4. console (60)
      // 5. hint (50)
      // 6. model (40)
      // (inspector was absent, so it must be omitted)
      const surfaceNames = composition.surfaces.map((s) => s.surface);
      expect(surfaceNames).toEqual([
        "editor",
        "evaluation",
        "misconception",
        "console",
        "hint",
        "model",
      ]);

      const priorities = composition.surfaces.map((s) => s.priority);
      expect(priorities).toEqual([100, 90, 80, 60, 50, 40]);

      // All included surfaces are marked visible
      for (const surface of composition.surfaces) {
        expect(surface.visible).toBe(true);
      }

      // Ensure inspector was not included
      expect(surfaceNames).not.toContain("inspector");
    });
  });

  // --------------------------------------------------------------------------
  // TEST F — NO INPUT MUTATION
  // --------------------------------------------------------------------------
  describe("Test F — No Input Mutation", () => {
    it("does not mutate the input ExperienceInterpretation object or its arrays", () => {
      const activity = getActivity("act-0-1-1-choice");
      const context: ExperienceContext = {
        lesson: goldenLesson,
        activity,
        matchedMisconception: "misc-sample",
      };

      const interpretation = interpretExperience(context);
      const interpretationSnapshot = structuredClone(interpretation);

      composeExperience(interpretation);

      expect(interpretation).toEqual(interpretationSnapshot);
    });
  });

  // --------------------------------------------------------------------------
  // TEST G — DETERMINISM
  // --------------------------------------------------------------------------
  describe("Test G — Determinism", () => {
    it("produces deeply equal compositions when called repeatedly with identical input", () => {
      const activity = getActivity("act-0-1-1-predict");
      const context: ExperienceContext = {
        lesson: goldenLesson,
        activity,
      };

      const interpretation = interpretExperience(context);

      const result1 = composeExperience(interpretation);
      const result2 = composeExperience(interpretation);

      expect(result1).toEqual(result2);
    });
  });

  // --------------------------------------------------------------------------
  // TEST H — PRESENTATION-ONLY
  // --------------------------------------------------------------------------
  describe("Test H — Presentation-Only Contract", () => {
    it("produces strictly presentation metadata without runtime, evaluation, or state authorities", () => {
      const activity = getActivity("act-0-1-1-manipulate");
      const context: ExperienceContext = {
        lesson: goldenLesson,
        activity,
      };

      const interpretation = interpretExperience(context);
      const composition = composeExperience(interpretation);

      // Allowed fields in ExperienceComposition
      const allowedKeys = new Set<keyof ExperienceComposition>([
        "mode",
        "spatialMode",
        "density",
        "focalSurface",
        "surfaces",
        "primaryAction",
        "assistance",
        "headline",
        "prompt",
        "badgeText",
        "tone",
      ]);

      const compositionKeys = Object.keys(composition) as Array<keyof ExperienceComposition>;
      for (const key of compositionKeys) {
        expect(allowedKeys.has(key)).toBe(true);
      }

      // Explicitly check for absence of forbidden runtime/progression fields
      const forbiddenFields = [
        "runtime",
        "execution",
        "score",
        "scoreAuthority",
        "lessonCompletion",
        "progression",
        "evidence",
        "masteryState",
        "persistence",
        "database",
        "storage",
        "handleSubmit",
        "onSubmit",
      ];

      for (const field of forbiddenFields) {
        expect(composition).not.toHaveProperty(field);
      }
    });
  });

  // --------------------------------------------------------------------------
  // GOLDEN LESSON VERIFICATION
  // --------------------------------------------------------------------------
  describe("Golden Lesson Activity Coverage", () => {
    const requiredGoldenActivities = [
      "act-0-1-1-intro",
      "act-0-1-1-predict",
      "act-0-1-1-manipulate",
      "act-0-1-1-choice",
    ];

    for (const activityId of requiredGoldenActivities) {
      it(`composes canonical activity "${activityId}" deterministically from Golden Lesson`, () => {
        const activity = getActivity(activityId);
        const interpretation = interpretExperience({
          lesson: goldenLesson,
          activity,
        });
        const composition = composeExperience(interpretation);

        expect(composition).toBeDefined();
        expect(composition.surfaces.length).toBeGreaterThanOrEqual(1);
        expect(composition.surfaces[0].role).toBe("focal");
        expect(composition.surfaces[0].priority).toBe(100);
        expect(composition.surfaces[0].visible).toBe(true);
        expect(composition.primaryAction).toBeDefined();
      });
    }
  });
});
