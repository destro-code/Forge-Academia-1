import { describe, it, expect } from "vitest";
import { interpretExperience } from "./experience-interpreter";
import type { ExperienceContext, ExperienceInterpretation } from "./experience-types";
import type { CanonicalActivity, CanonicalLesson } from "@/lib/curriculum/types";
import type {
  ActivitySessionState,
  ActivityEvaluationResult,
  LessonSessionState,
} from "@/lib/learning-engine/types";
import goldenLessonRaw from "@/data/canonical/lessons/lesson-what-is-frontend-development.json";

const goldenLesson = goldenLessonRaw as unknown as CanonicalLesson;

function getActivity(id: string): CanonicalActivity {
  const activity = goldenLesson.activities.find((a) => a.id === id);
  if (!activity) {
    throw new Error(`Activity with id "${id}" not found in Golden Lesson`);
  }
  return activity;
}

describe("Forge Lesson Player — Experience Interpreter Unit Tests", () => {
  // --------------------------------------------------------------------------
  // TEST 1 — INTRO / DISCOVERY
  // --------------------------------------------------------------------------
  describe("Test 1 — Intro / Discovery (act-0-1-1-intro)", () => {
    it("interprets orientation intro as discover mode with spacious presentation", () => {
      const activity = getActivity("act-0-1-1-intro");
      const context: ExperienceContext = {
        lesson: goldenLesson,
        activity,
      };

      const interpretation = interpretExperience(context);

      expect(interpretation.mode).toBe("discover");
      expect(interpretation.focalSurface).toBe("presentation");
      expect(interpretation.spatialMode).toBe("focused");
      expect(interpretation.density).toBe("spacious");
      expect(interpretation.primaryAction.kind).toBe("continue");
      expect(interpretation.primaryAction.intent).toBe("advance");
      expect(interpretation.primaryAction.label).toBe("Explore");
      expect(interpretation.primaryAction.disabled).toBe(false);
      expect(interpretation.badgeText).toBe("Discovery");
    });
  });

  // --------------------------------------------------------------------------
  // TEST 2 — PREDICTION
  // --------------------------------------------------------------------------
  describe("Test 2 — Prediction (act-0-1-1-predict)", () => {
    it("interprets prediction activity with interaction focus and hypothesis prompt", () => {
      const activity = getActivity("act-0-1-1-predict");
      const context: ExperienceContext = {
        lesson: goldenLesson,
        activity,
      };

      const interpretation = interpretExperience(context);

      expect(interpretation.mode).toBe("predict");
      expect(interpretation.focalSurface).toBe("interaction");
      expect(interpretation.primaryAction.label).toBe("Make your prediction");
      expect(interpretation.primaryAction.intent).toBe("submit");
      expect(interpretation.badgeText).toBe("Prediction");
      expect(interpretation.tone).toBe("investigative");
    });

    it("does NOT become 'master' simply because it is evaluated successfully", () => {
      const activity = getActivity("act-0-1-1-predict");
      const passedEvaluation: ActivityEvaluationResult = {
        isValid: true,
        score: 1,
        feedbackMessage: "Exactly. You now have an expectation you can test.",
      };

      const passedState: ActivitySessionState = {
        activityId: activity.id,
        status: "passed",
        response: "opt-a",
        attempts: 1,
        hintsRevealed: 0,
        lastEvaluation: passedEvaluation,
        startedAt: 1000,
        evaluatedAt: 1100,
        completedAt: 1100,
      };

      const context: ExperienceContext = {
        lesson: goldenLesson,
        activity,
        activityState: passedState,
        evaluationResult: passedEvaluation,
      };

      const interpretation = interpretExperience(context);

      // Successful prediction moves to "understand" to reflect cognitive synthesis, NEVER "master"
      expect(interpretation.mode).toBe("understand");
      expect(interpretation.mode).not.toBe("master");
      expect(interpretation.primaryAction.kind).toBe("continue");
      expect(interpretation.primaryAction.intent).toBe("advance");
    });
  });

  // --------------------------------------------------------------------------
  // TEST 3 — INTERACTIVE MANIPULATION
  // --------------------------------------------------------------------------
  describe("Test 3 — Interactive Manipulation (act-0-1-1-manipulate)", () => {
    it("interprets interactive code manipulation as interact mode with editor focal surface", () => {
      const activity = getActivity("act-0-1-1-manipulate");
      const context: ExperienceContext = {
        lesson: goldenLesson,
        activity,
      };

      const interpretation = interpretExperience(context);

      expect(interpretation.mode).toBe("interact");
      expect(interpretation.focalSurface).toBe("editor");
      expect(interpretation.spatialMode).toBe("split");
      expect(interpretation.density).toBe("normal");
      expect(interpretation.primaryAction.label).toBe("Run");
      expect(interpretation.primaryAction.intent).toBe("submit");
      expect(interpretation.badgeText).toBe("Live System");
    });

    it("does not execute code during interpretation", () => {
      const activity = getActivity("act-0-1-1-manipulate");
      // Provide malformed or arbitrary response code in state
      const context: ExperienceContext = {
        lesson: goldenLesson,
        activity,
        activityState: {
          activityId: activity.id,
          status: "engaged",
          response: "<malformed-html><unclosed",
          attempts: 0,
          hintsRevealed: 0,
          startedAt: 1000,
        },
      };

      // Interpretation must succeed purely and deterministically without attempting execution
      const interpretation = interpretExperience(context);
      expect(interpretation.mode).toBe("interact");
      expect(interpretation.focalSurface).toBe("editor");
      expect(interpretation.primaryAction.label).toBe("Run");
    });
  });

  // --------------------------------------------------------------------------
  // TEST 4 — EXPLANATION / MENTAL MODEL
  // --------------------------------------------------------------------------
  describe("Test 4 — Explanation / Mental Model (act-0-1-1-model)", () => {
    it("interprets model activity as understand mode with model in supportingSurfaces", () => {
      const activity = getActivity("act-0-1-1-model");
      const context: ExperienceContext = {
        lesson: goldenLesson,
        activity,
      };

      const interpretation = interpretExperience(context);

      expect(interpretation.mode).toBe("understand");
      expect(interpretation.focalSurface).toBe("presentation");
      expect(interpretation.spatialMode).toBe("focused");
      expect(interpretation.density).toBe("spacious");
      expect(interpretation.supportingSurfaces).toContain("model");
      expect(interpretation.badgeText).toBe("Mental Model");
    });
  });

  // --------------------------------------------------------------------------
  // TEST 5 — APPLICATION
  // --------------------------------------------------------------------------
  describe("Test 5 — Application (act-0-1-1-choice)", () => {
    it("interprets application multiple-choice activity with submit action", () => {
      const activity = getActivity("act-0-1-1-choice");
      const context: ExperienceContext = {
        lesson: goldenLesson,
        activity,
      };

      const interpretation = interpretExperience(context);

      expect(interpretation.mode).toBe("practice");
      expect(interpretation.focalSurface).toBe("interaction");
      expect(interpretation.primaryAction.label).toBe("Check Answer");
      expect(interpretation.primaryAction.intent).toBe("submit");
      expect(interpretation.badgeText).toBe("Application");
      expect(interpretation.tone).toBe("rigorous");
    });
  });

  // --------------------------------------------------------------------------
  // TEST 6 — FAILED EVALUATION
  // --------------------------------------------------------------------------
  describe("Test 6 — Failed Evaluation", () => {
    it("transitions mode to 'debug' and requires retry upon evaluation failure", () => {
      const activity = getActivity("act-0-1-1-choice");
      const failedEvaluation: ActivityEvaluationResult = {
        isValid: false,
        score: 0,
        feedbackMessage:
          "Not yet. Pick the action most likely to give you evidence about the failure.",
      };

      const failedState: ActivitySessionState = {
        activityId: activity.id,
        status: "failed",
        response: "next-b",
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

      expect(interpretation.mode).toBe("debug");
      expect(interpretation.assistance.requiresRetry).toBe(true);
      expect(interpretation.primaryAction.kind).toBe("retry");
      expect(interpretation.primaryAction.intent).toBe("retry");
      expect(interpretation.primaryAction.label).toBe("Try again");
      expect(interpretation.primaryAction.disabled).toBe(false);
      expect(interpretation.supportingSurfaces).toContain("evaluation");
      expect(interpretation.badgeText).toBe("Investigation");
      expect(interpretation.tone).toBe("investigative");
    });

    it("does not mutate canonical activity or lesson on failure", () => {
      const activity = getActivity("act-0-1-1-choice");
      const activitySnapshot = JSON.stringify(activity);
      const lessonSnapshot = JSON.stringify(goldenLesson);

      const failedEvaluation: ActivityEvaluationResult = {
        isValid: false,
        score: 0,
      };

      const context: ExperienceContext = {
        lesson: goldenLesson,
        activity,
        activityState: {
          activityId: activity.id,
          status: "failed",
          response: "wrong",
          attempts: 1,
          hintsRevealed: 0,
          lastEvaluation: failedEvaluation,
          startedAt: 1000,
        },
        evaluationResult: failedEvaluation,
      };

      interpretExperience(context);

      expect(JSON.stringify(activity)).toBe(activitySnapshot);
      expect(JSON.stringify(goldenLesson)).toBe(lessonSnapshot);
    });
  });

  // --------------------------------------------------------------------------
  // TEST 7 — SUCCESSFUL EVALUATION
  // --------------------------------------------------------------------------
  describe("Test 7 — Successful Evaluation", () => {
    it("moves prediction from 'predict' to 'understand' when passed", () => {
      const activity = getActivity("act-0-1-1-predict");
      const successEval: ActivityEvaluationResult = { isValid: true };
      const context: ExperienceContext = {
        lesson: goldenLesson,
        activity,
        evaluationResult: successEval,
      };

      const interpretation = interpretExperience(context);
      expect(interpretation.mode).toBe("understand");
      expect(interpretation.mode).not.toBe("master");
    });

    it("does NOT automatically mark interactive or practice work as 'master'", () => {
      const manipulateActivity = getActivity("act-0-1-1-manipulate");
      const choiceActivity = getActivity("act-0-1-1-choice");
      const successEval: ActivityEvaluationResult = { isValid: true };

      const manipulateInterpretation = interpretExperience({
        lesson: goldenLesson,
        activity: manipulateActivity,
        evaluationResult: successEval,
      });

      const choiceInterpretation = interpretExperience({
        lesson: goldenLesson,
        activity: choiceActivity,
        evaluationResult: successEval,
      });

      // Passing an individual activity must NOT be confused with capability mastery
      expect(manipulateInterpretation.mode).toBe("interact");
      expect(manipulateInterpretation.mode).not.toBe("master");

      expect(choiceInterpretation.mode).toBe("practice");
      expect(choiceInterpretation.mode).not.toBe("master");
    });

    it("reserves 'master' strictly for completion activities", () => {
      const completionActivity = getActivity("act-0-1-1-completion");
      const successEval: ActivityEvaluationResult = { isValid: true };

      const completionInterpretation = interpretExperience({
        lesson: goldenLesson,
        activity: completionActivity,
        evaluationResult: successEval,
      });

      expect(completionInterpretation.mode).toBe("master");
      expect(completionInterpretation.badgeText).toBe("Mastery");
      expect(completionInterpretation.tone).toBe("celebratory");
    });
  });

  // --------------------------------------------------------------------------
  // TEST 8 — EVALUATING STATE
  // --------------------------------------------------------------------------
  describe("Test 8 — Evaluating State", () => {
    it("exposes disabled evaluating action when status is 'evaluating'", () => {
      const activity = getActivity("act-0-1-1-choice");
      const evaluatingState: ActivitySessionState = {
        activityId: activity.id,
        status: "evaluating",
        response: "next-a",
        attempts: 1,
        hintsRevealed: 0,
        startedAt: 1000,
        evaluatedAt: 1050,
      };

      const context: ExperienceContext = {
        lesson: goldenLesson,
        activity,
        activityState: evaluatingState,
      };

      const interpretation = interpretExperience(context);

      expect(interpretation.primaryAction.kind).toBe("evaluating");
      expect(interpretation.primaryAction.intent).toBe("submit");
      expect(interpretation.primaryAction.disabled).toBe(true);
      expect(interpretation.primaryAction.status).toBe("evaluating");
      expect(interpretation.primaryAction.label).toBe("Evaluating…");
    });
  });

  // --------------------------------------------------------------------------
  // TEST 9 — HINT PRESENTATION
  // --------------------------------------------------------------------------
  describe("Test 9 — Hint Presentation", () => {
    it("presents hints as available without exposing content when none are revealed", () => {
      const activity = getActivity("act-0-1-1-predict");
      const context: ExperienceContext = {
        lesson: goldenLesson,
        activity,
        activityState: {
          activityId: activity.id,
          status: "engaged",
          response: null,
          attempts: 0,
          hintsRevealed: 0,
          startedAt: 1000,
        },
      };

      const interpretation = interpretExperience(context);

      expect(interpretation.assistance.hasHints).toBe(true);
      expect(interpretation.assistance.hintsAvailable).toBe(2);
      expect(interpretation.assistance.hintsRevealed).toBe(0);
      expect(interpretation.assistance.activeHint).toBeUndefined();
      expect(interpretation.supportingSurfaces).not.toContain("hint");
    });

    it("reveals the first actual canonical hint when hintsRevealed is 1", () => {
      const activity = getActivity("act-0-1-1-predict");
      const context: ExperienceContext = {
        lesson: goldenLesson,
        activity,
        activityState: {
          activityId: activity.id,
          status: "engaged",
          response: null,
          attempts: 0,
          hintsRevealed: 1,
          startedAt: 1000,
        },
      };

      const interpretation = interpretExperience(context);

      expect(interpretation.assistance.hasHints).toBe(true);
      expect(interpretation.assistance.hintsRevealed).toBe(1);
      expect(interpretation.assistance.activeHint).toBe("Look at the status area.");
      expect(interpretation.supportingSurfaces).toContain("hint");
    });
  });

  // --------------------------------------------------------------------------
  // TEST 10 — MISCONCEPTION
  // --------------------------------------------------------------------------
  describe("Test 10 — Misconception", () => {
    /**
     * Note: In the canonical repository schema, misconception IDs can be supplied via
     * Context input (`context.matchedMisconception`) or embedded inside evaluation details
     * (`evaluationResult.details.misconception`).
     */
    it("exposes misconception surface and matchedMisconception when present in context", () => {
      const activity = getActivity("act-0-1-1-choice");
      const context: ExperienceContext = {
        lesson: goldenLesson,
        activity,
        matchedMisconception: "misc-frontend-direct-database",
      };

      const interpretation = interpretExperience(context);

      expect(interpretation.supportingSurfaces).toContain("misconception");
      expect(interpretation.assistance.matchedMisconception).toBe("misc-frontend-direct-database");
    });

    it("exposes misconception when present in evaluationResult details", () => {
      const activity = getActivity("act-0-1-1-choice");
      const evaluationWithMisconception: ActivityEvaluationResult = {
        isValid: false,
        score: 0,
        details: {
          misconception: "misc-triad-interchangeable",
        },
      };

      const context: ExperienceContext = {
        lesson: goldenLesson,
        activity,
        evaluationResult: evaluationWithMisconception,
      };

      const interpretation = interpretExperience(context);

      expect(interpretation.supportingSurfaces).toContain("misconception");
      expect(interpretation.assistance.matchedMisconception).toBe("misc-triad-interchangeable");
    });
  });

  // --------------------------------------------------------------------------
  // TEST 11 — CONSOLE SURFACE
  // --------------------------------------------------------------------------
  describe("Test 11 — Console Surface", () => {
    it("inspects actual Golden Lesson interactive-code activity and confirms console surface conditionality", () => {
      const manipulateActivity = getActivity("act-0-1-1-manipulate");

      // Inspect whether experience.output.console is enabled in the actual JSON definition
      const rawOutput = (manipulateActivity as { experience?: { output?: { console?: boolean } } })
        .experience?.output;
      const isConsoleEnabled = rawOutput?.console === true;

      const context: ExperienceContext = {
        lesson: goldenLesson,
        activity: manipulateActivity,
      };

      const interpretation = interpretExperience(context);

      if (isConsoleEnabled) {
        expect(interpretation.supportingSurfaces).toContain("console");
      } else {
        expect(interpretation.supportingSurfaces).not.toContain("console");
      }
      // Explicit assertion verifying the actual definition has console: false
      expect(isConsoleEnabled).toBe(false);
      expect(interpretation.supportingSurfaces).not.toContain("console");
    });

    it("includes console surface when activity explicitly enables console (act-0-1-1-debug)", () => {
      const debugActivity = getActivity("act-0-1-1-debug");
      const context: ExperienceContext = {
        lesson: goldenLesson,
        activity: debugActivity,
      };

      const interpretation = interpretExperience(context);
      expect(interpretation.supportingSurfaces).toContain("console");
    });
  });

  // --------------------------------------------------------------------------
  // TEST 12 — COMPLETION / MASTERY
  // --------------------------------------------------------------------------
  describe("Test 12 — Completion / Mastery (act-0-1-1-completion)", () => {
    it("interprets actual canonical completion activity as 'master' with appropriate action semantics", () => {
      const completionActivity = getActivity("act-0-1-1-completion");
      const context: ExperienceContext = {
        lesson: goldenLesson,
        activity: completionActivity,
      };

      const interpretation = interpretExperience(context);

      expect(interpretation.mode).toBe("master");
      expect(interpretation.focalSurface).toBe("presentation");
      expect(interpretation.spatialMode).toBe("focused");
      expect(interpretation.density).toBe("spacious");
      expect(interpretation.primaryAction.kind).toBe("continue");
      expect(interpretation.primaryAction.intent).toBe("advance");
      // Since it is the final activity in the lesson, the label is "Set the skill"
      expect(interpretation.primaryAction.label).toBe("Set the skill");
      expect(interpretation.primaryAction.disabled).toBe(false);
      expect(interpretation.badgeText).toBe("Mastery");
    });
  });

  // --------------------------------------------------------------------------
  // TEST 13 — DETERMINISM
  // --------------------------------------------------------------------------
  describe("Test 13 — Determinism", () => {
    it("produces deeply equal interpretations when called twice with identical input", () => {
      const activity = getActivity("act-0-1-1-predict");
      const context: ExperienceContext = {
        lesson: goldenLesson,
        activity,
        activityState: {
          activityId: activity.id,
          status: "engaged",
          response: "opt-a",
          attempts: 1,
          hintsRevealed: 1,
          startedAt: 1000,
        },
      };

      const result1 = interpretExperience(context);
      const result2 = interpretExperience(context);

      expect(result1).toEqual(result2);
    });
  });

  // --------------------------------------------------------------------------
  // TEST 14 — NO INPUT MUTATION
  // --------------------------------------------------------------------------
  describe("Test 14 — No Input Mutation", () => {
    it("does not mutate lesson, activity, activityState, lessonState, or evaluationResult", () => {
      const activity = getActivity("act-0-1-1-choice");
      const activityState: ActivitySessionState = {
        activityId: activity.id,
        status: "failed",
        response: "next-b",
        attempts: 2,
        hintsRevealed: 1,
        startedAt: 1000,
        evaluatedAt: 1100,
      };
      const lessonState: LessonSessionState = {
        sessionId: "session-test-1",
        lessonId: goldenLesson.id,
        status: "in-progress",
        currentActivityId: activity.id,
        currentActivityIndex: 4,
        totalActivities: goldenLesson.activities.length,
        activityOrder: goldenLesson.activities.map((a) => a.id),
        activities: { [activity.id]: activityState },
        completedActivityIds: [],
        startedAt: 1000,
        lastActiveAt: 1100,
      };
      const evaluationResult: ActivityEvaluationResult = {
        isValid: false,
        score: 0,
        feedbackMessage: "Try again.",
      };

      const context: ExperienceContext = {
        lesson: goldenLesson,
        activity,
        activityState,
        lessonState,
        evaluationResult,
        matchedMisconception: "misc-sample",
      };

      const contextSnapshot = structuredClone(context);

      interpretExperience(context);

      expect(context).toEqual(contextSnapshot);
    });
  });

  // --------------------------------------------------------------------------
  // TEST 15 — PRESENTATION-ONLY CONTRACT
  // --------------------------------------------------------------------------
  describe("Test 15 — Presentation-Only Contract", () => {
    it("returns strictly presentation metadata without executing code or causing side effects", () => {
      const activity = getActivity("act-0-1-1-manipulate");
      const context: ExperienceContext = {
        lesson: goldenLesson,
        activity,
      };

      const interpretation = interpretExperience(context);

      // Verify that all returned fields belong strictly to the presentation contract
      const allowedKeys = new Set<keyof ExperienceInterpretation>([
        "mode",
        "focalSurface",
        "supportingSurfaces",
        "spatialMode",
        "density",
        "primaryAction",
        "assistance",
        "headline",
        "prompt",
        "badgeText",
        "tone",
      ]);

      const returnedKeys = Object.keys(interpretation) as Array<keyof ExperienceInterpretation>;
      for (const key of returnedKeys) {
        expect(allowedKeys.has(key)).toBe(true);
      }

      // Verify interpreter is a synchronous pure function without side-effect promises
      expect(interpretation).not.toBeInstanceOf(Promise);
      expect(typeof interpretation.mode).toBe("string");
      expect(typeof interpretation.focalSurface).toBe("string");
      expect(Array.isArray(interpretation.supportingSurfaces)).toBe(true);
    });
  });
});
