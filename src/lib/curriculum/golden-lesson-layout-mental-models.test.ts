// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from "vitest";
import { canonicalProvider } from "./canonical-provider";
import { validateCurriculumIntegrity, validateLesson } from "./schema";
import {
  evaluateActivityValidation,
  validateJudgmentStep,
} from "@/components/lesson/canonical/validation";
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

describe("Change 25 — Golden Lesson 2 POC (lesson-0-2-1): The Layout That Broke the Grid", () => {
  let lesson: CanonicalLesson;

  beforeEach(() => {
    const loaded = canonicalProvider.getLesson("lesson-0-2-1");
    if (!loaded) {
      throw new Error("Golden Lesson 2 (lesson-0-2-1) not found in canonicalProvider");
    }
    lesson = loaded;
  });

  describe("1. Canonical Lesson Creation & Provider Registration", () => {
    it("resolves Golden Lesson 2 from canonicalProvider by id 'lesson-0-2-1'", () => {
      expect(lesson).toBeDefined();
      expect(lesson.id).toBe("lesson-0-2-1");
    });

    it("matches schema specification and lesson metadata", () => {
      expect(lesson.title).toBe("The Layout That Broke the Grid");
      expect(lesson.topicId).toBe("flexbox-layout");
      expect(lesson.lessonType).toBe("instruction");
      expect(lesson.difficulty).toBe("Beginner");
      expect(lesson.estimatedMinutes).toBe(20);
      expect(lesson.schemaVersion).toBe("1.0.0");
      expect(lesson.prerequisites.lessonIds).toContain("lesson-0-1-1");
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

    it("maps all required layout concepts, skills, and objectives", () => {
      expect(lesson.conceptIds).toContain("concept-css-flexbox-layout");
      expect(lesson.conceptIds).toContain("concept-css-box-model");
      expect(lesson.conceptIds).toContain("concept-flex-container");
      expect(lesson.conceptIds).toContain("concept-flex-items");
      expect(lesson.conceptIds).toContain("concept-justify-align-distribution");

      expect(lesson.skillIds).toContain("skill-predict-flex-distribution");
      expect(lesson.skillIds).toContain("skill-implement-flexbox-alignments");
      expect(lesson.skillIds).toContain("skill-author-flexbox-rules");

      expect(lesson.objectives).toHaveLength(4);
      expect(lesson.objectives.map((o) => o.id)).toEqual([
        "obj-0-2-1-observe",
        "obj-0-2-1-predict",
        "obj-0-2-1-manipulate",
        "obj-0-2-1-explain",
      ]);
    });
  });

  describe("2. Sequence & Renderer Verification", () => {
    it("contains exactly the required 7-activity sequence", () => {
      expect(lesson.activities).toHaveLength(7);
      const sequence = lesson.activities.map((a) => a.type);
      expect(sequence).toEqual([
        "intro",
        "visual",
        "output-prediction",
        "interactive-code",
        "judgment",
        "reflection",
        "interactive-code",
      ]);
    });

    it("verifies exact activity IDs and intents", () => {
      const [a1, a2, a3, a4, a5, a6, a7] = lesson.activities;

      expect(a1.id).toBe("act-0-2-1-orientation");
      expect(a1.intent).toBe("orientation");

      expect(a2.id).toBe("act-0-2-1-observation");
      expect(a2.intent).toBe("recognition");

      expect(a3.id).toBe("act-0-2-1-prediction");
      expect(a3.intent).toBe("prediction");

      expect(a4.id).toBe("act-0-2-1-manipulation");
      expect(a4.intent).toBe("application");

      expect(a5.id).toBe("act-0-2-1-mechanism");
      expect(a5.intent).toBe("reflection");

      expect(a6.id).toBe("act-0-2-1-explanation");
      expect(a6.intent).toBe("reflection");

      expect(a7.id).toBe("act-0-2-1-transfer");
      expect(a7.intent).toBe("transfer");
    });

    it("renders all 7 activities via existing central registry renderActivity without new renderers", () => {
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

  describe("3. CSS Manipulation Runtime & Interactive Code Path", () => {
    it("manipulation activity uses existing CSS interactive-code format with HTML fixture and rule assertions", () => {
      const manip = lesson.activities.find((a) => a.id === "act-0-2-1-manipulation")!;
      expect(manip.type).toBe("interactive-code");
      const content = manip.content as any;
      expect(content.language).toBe("css");
      expect(content.htmlFixture).toContain('class="product-grid"');
      expect(content.starterCode).toContain(".product-grid");
      expect(content.starterCode).toContain(".product-card");
      expect(content.testCases).toHaveLength(4);

      // Verify test assertions test real CSS rules
      const assertions = content.testCases.map((tc: any) => tc.assertion);
      expect(assertions).toContain("rules['.product-grid']['display'] === 'flex'");
      expect(assertions).toContain("rules['.product-grid']['flex-wrap'] === 'wrap'");
      expect(assertions).toContain("rules['.product-grid']['gap'] === '16px'");
      expect(assertions).toContain("rules['.product-card']['box-sizing'] === 'border-box'");
    });

    it("validates solution code for manipulation activity satisfies test cases", () => {
      const manip = lesson.activities.find((a) => a.id === "act-0-2-1-manipulation")!;
      const content = manip.content as any;

      // Simulate the CSS rule parser that runtime uses
      const solutionRules = {
        ".product-grid": {
          width: "600px",
          border: "2px dashed #94a3b8",
          padding: "16px",
          display: "flex",
          "flex-wrap": "wrap",
          gap: "16px",
        },
        ".product-card": {
          width: "260px",
          padding: "16px",
          background: "#f8fafc",
          border: "1px solid #cbd5e1",
          "border-radius": "8px",
          "box-sizing": "border-box",
        },
      };

      for (const tc of content.testCases) {
        const fn = new Function("rules", `return (${tc.assertion});`);
        expect(fn(solutionRules)).toBe(true);
      }
    });
  });

  describe("4. Judgment Step Conformance & Validation", () => {
    it("conforms to validateJudgmentStep contract", () => {
      const judgment = lesson.activities.find((a) => a.id === "act-0-2-1-mechanism")!;
      expect(judgment.type).toBe("judgment");

      const check = validateJudgmentStep(judgment);
      expect(check.isValid).toBe(true);
      expect(check.errors).toHaveLength(0);
    });

    it("includes comprehensive model answer, rubric, and takeaways", () => {
      const judgment = lesson.activities.find((a) => a.id === "act-0-2-1-mechanism")!;
      const content = judgment.content as any;

      expect(content.modelAnswer.summary).toBeTruthy();
      expect(content.modelAnswer.detailedAnalysis).toBeTruthy();
      expect(content.modelAnswer.keyTradeoffs.length).toBeGreaterThan(0);
      expect(content.evaluationRubric.length).toBe(3);
      expect(content.takeaways.length).toBe(3);
    });

    it("evaluates learner judgment response with self-assessment rubric", () => {
      const judgment = lesson.activities.find((a) => a.id === "act-0-2-1-mechanism")!;
      const response = {
        learnerAnswer:
          "Under content-box, padding adds 32px to 260px making 294px per card. Two cards take 588px leaving only 12px. Border-box keeps each card at exactly 260px so two cards plus 16px gap take 536px, fitting inside 600px while the third wraps.",
        selfAssessment: {
          "crit-box-sizing": true,
          "crit-space-math": true,
          "crit-flex-wrap-role": true,
        },
      };

      const result = evaluateActivityValidation(judgment, response);
      expect(result.isValid).toBe(true);
    });
  });

  describe("5. Prediction, Reflection & Transfer Differentiation", () => {
    it("validates prediction activity via exact match", () => {
      const pred = lesson.activities.find((a) => a.id === "act-0-2-1-prediction")!;
      const expected = (pred.validation as any).expected;

      const correct = evaluateActivityValidation(pred, expected);
      expect(correct.isValid).toBe(true);

      const wrong = evaluateActivityValidation(
        pred,
        "The browser automatically wraps the third card to a new line to avoid overflowing.",
      );
      expect(wrong.isValid).toBe(false);
    });

    it("validates reflection activity requiring causal explanation", () => {
      const refl = lesson.activities.find((a) => a.id === "act-0-2-1-explanation")!;
      const content = refl.content as any;
      expect(content.minCharacters).toBe(60);

      const validText =
        "The browser checks available container width on the main axis. For each flex item, it computes total outer width. If remaining space on the row is smaller than the item and flex-wrap is wrap, the item wraps to row 2.";
      const valid = evaluateActivityValidation(refl, validText);
      expect(valid.isValid).toBe(true);

      const tooShort = "It wraps when no space.";
      const invalid = evaluateActivityValidation(refl, tooShort);
      expect(invalid.isValid).toBe(false);
    });

    it("verifies transfer activity is a genuinely distinct scenario from the product grid", () => {
      const manip = lesson.activities.find((a) => a.id === "act-0-2-1-manipulation")!;
      const transfer = lesson.activities.find((a) => a.id === "act-0-2-1-transfer")!;

      const manipContent = manip.content as any;
      const transferContent = transfer.content as any;

      // Scenario 1: Product card wrapping grid (multi-row flex-wrap with equal cards)
      expect(manipContent.title).toContain("Product Grid");
      expect(manipContent.starterCode).toContain(".product-grid");
      expect(manipContent.starterCode).toContain("flex-wrap");

      // Scenario 2: Two-column dashboard shell with asymmetric layout (fixed sidebar + flex-grow main)
      expect(transferContent.title).toContain("Sidebar & Main Content Layout");
      expect(transferContent.starterCode).toContain(".dashboard-shell");
      expect(transferContent.starterCode).toContain(".dashboard-sidebar");
      expect(transferContent.starterCode).toContain(".dashboard-main");
      expect(transferContent.htmlFixture).toContain('<aside class="dashboard-sidebar"');
      expect(transferContent.htmlFixture).toContain('<main class="dashboard-main"');

      // Transfer tests flex-shrink: 0 and flex-grow: 1, which were not tested in the first manipulation
      const transferAssertions = transferContent.testCases.map((tc: any) => tc.assertion);
      expect(transferAssertions).toContain("rules['.dashboard-sidebar']['flex-shrink'] === '0'");
      expect(transferAssertions).toContain("rules['.dashboard-main']['flex-grow'] === '1'");

      // Verify solution code for transfer activity
      const transferSolutionRules = {
        ".dashboard-shell": {
          width: "100%",
          "max-width": "900px",
          border: "1px solid #e2e8f0",
          padding: "24px",
          display: "flex",
          gap: "24px",
        },
        ".dashboard-sidebar": {
          padding: "16px",
          background: "#f1f5f9",
          "border-radius": "6px",
          width: "240px",
          "flex-shrink": "0",
        },
        ".dashboard-main": {
          padding: "16px",
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          "border-radius": "6px",
          "flex-grow": "1",
        },
      };

      for (const tc of transferContent.testCases) {
        const fn = new Function("rules", `return (${tc.assertion});`);
        expect(fn(transferSolutionRules)).toBe(true);
      }
    });
  });

  describe("6. End-to-End Progression & Evidence Engine Lifecycle", () => {
    it("executes full session lifecycle through all 7 activities and achieves completion", () => {
      let session = createLessonSession(lesson);
      session = startLessonSession(session);
      expect(session.status).toBe("in-progress");

      // 1. Intro
      session = engageSessionActivity(session, "act-0-2-1-orientation", undefined);
      session = completeSessionActivity(session, "act-0-2-1-orientation");

      // 2. Visual
      session = nextSessionActivity(session, lesson);
      session = engageSessionActivity(session, "act-0-2-1-observation", undefined);
      session = completeSessionActivity(session, "act-0-2-1-observation");

      // 3. Output Prediction
      session = nextSessionActivity(session, lesson);
      session = engageSessionActivity(session, "act-0-2-1-prediction", "opt-wrap");
      session = startActivityEvaluation(session, "act-0-2-1-prediction");
      session = resolveActivityEvaluation(session, "act-0-2-1-prediction", {
        isValid: true,
        score: 100,
        feedbackMessage: "Correct prediction",
      });
      session = completeSessionActivity(session, "act-0-2-1-prediction");

      // 4. Manipulation
      session = nextSessionActivity(session, lesson);
      session = engageSessionActivity(
        session,
        "act-0-2-1-manipulation",
        ".product-grid { display: flex; flex-wrap: wrap; }",
      );
      session = startActivityEvaluation(session, "act-0-2-1-manipulation");
      session = resolveActivityEvaluation(session, "act-0-2-1-manipulation", {
        isValid: true,
        score: 100,
        feedbackMessage: "Rules applied",
      });
      session = completeSessionActivity(session, "act-0-2-1-manipulation");

      // 5. Judgment
      session = nextSessionActivity(session, lesson);
      const judgmentResponse = {
        response:
          "The container width is 600px with 16px padding on each side, leaving 568px of content width. Each card has a fixed width of 260px. Two cards require 520px which fits, but three cards require 780px which exceeds 568px.",
        checkedCriteria: ["crit-0-2-1-box-budget", "crit-0-2-1-flex-wrap", "crit-0-2-1-root-cause"],
      };
      session = engageSessionActivity(session, "act-0-2-1-mechanism", judgmentResponse);
      session = startActivityEvaluation(session, "act-0-2-1-mechanism");
      session = resolveActivityEvaluation(session, "act-0-2-1-mechanism", {
        isValid: true,
        score: 100,
        feedbackMessage: "Judgment evaluated",
      });
      session = completeSessionActivity(session, "act-0-2-1-mechanism");

      // 6. Reflection
      session = nextSessionActivity(session, lesson);
      session = engageSessionActivity(
        session,
        "act-0-2-1-explanation",
        "The spatial budget was exceeded because container width minus padding was smaller than three cards. Enabling flex-wrap allows items to flow to a new line when horizontal space runs out.",
      );
      session = startActivityEvaluation(session, "act-0-2-1-explanation");
      session = resolveActivityEvaluation(session, "act-0-2-1-explanation", {
        isValid: true,
        score: 100,
        feedbackMessage: "Explanation received",
      });
      session = completeSessionActivity(session, "act-0-2-1-explanation");

      // 7. Transfer
      session = nextSessionActivity(session, lesson);
      session = engageSessionActivity(
        session,
        "act-0-2-1-transfer",
        ".dashboard { display: flex; flex-wrap: wrap; } .sidebar { flex: 0 0 240px; } .main-panel { flex: 1 1 400px; }",
      );
      session = startActivityEvaluation(session, "act-0-2-1-transfer");
      session = resolveActivityEvaluation(session, "act-0-2-1-transfer", {
        isValid: true,
        score: 100,
        feedbackMessage: "Transfer completed",
      });
      session = completeSessionActivity(session, "act-0-2-1-transfer");

      // Completion check
      const completionCheck = checkLessonCompletion(session, lesson);
      expect(completionCheck.canComplete).toBe(true);

      session = completeLessonSession(session, lesson);
      expect(session.status).toBe("completed");
      const progress = calculateSessionProgress(session);
      expect(progress.percentage).toBe(100);
      expect(progress.completedCount).toBe(7);

      // Evidence Engine Verification
      const evidence = generateLessonEvidenceTokens(lesson, session);
      expect(evidence.length).toBeGreaterThan(0);

      const satisfaction = evaluateLessonObjectivesSatisfaction(lesson, evidence);
      expect(satisfaction.allSatisfied).toBe(true);
      expect(satisfaction.satisfiedObjectivesCount).toBe(lesson.objectives.length);
    });
  });
});
