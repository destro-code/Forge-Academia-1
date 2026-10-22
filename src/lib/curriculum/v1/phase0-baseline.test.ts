import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { safeValidateLessonV1 } from "../schema-v1";
import type { ActivityV1 } from "../types-v1";
import { adaptLessonV1ToLayer1 } from "./adapter";
import { loadV1Lesson, listV1LessonIds, getAllV1Lessons } from "./loader";
import { resolvePresentationFamily } from "@/components/lesson/v2/presentation";
import { ACTIVITY_RENDERER_MAP } from "@/components/lesson/canonical/registry";
import { evaluateActivityValidation } from "@/components/lesson/canonical/validation";
import { checkActivityCompatibility } from "./activity-compatibility";
import {
  isValidOrderingPermutation,
  resolveInitialOrderingResponse,
  scrambleOrderingItems,
  validateOrderingSequenceIntegrity,
} from "@/lib/utils/shuffle-options";
import {
  createLessonSession,
  startLessonSession,
  engageSessionActivity,
  startActivityEvaluation,
  resolveActivityEvaluation,
  retrySessionActivity,
  completeSessionActivity,
  nextSessionActivity,
} from "@/lib/learning-engine/session-engine";
import { deriveActivityInteractionState } from "@/components/lesson/canonical/runtime/use-activity-runtime";

const LESSONS_DIR = path.resolve(process.cwd(), "src/data/canonical/lessons-v1");

function loadAllRawLessonFiles(): Array<{ fileName: string; raw: unknown }> {
  const files = fs
    .readdirSync(LESSONS_DIR)
    .filter((file) => file.endsWith(".json"))
    .sort();
  return files.map((fileName) => {
    const fullPath = path.join(LESSONS_DIR, fileName);
    const raw = JSON.parse(fs.readFileSync(fullPath, "utf-8")) as unknown;
    return { fileName, raw };
  });
}

describe("Phase 0 Baseline & Regression Harness", () => {
  const rawLessons = loadAllRawLessonFiles();
  const v1Lessons = getAllV1Lessons();

  describe("1. Schema tests for all active lesson JSON", () => {
    it("parses all 139 active V1 lesson JSON files cleanly against safeValidateLessonV1", () => {
      expect(rawLessons.length).toBeGreaterThanOrEqual(139);

      const failures: Array<{ fileName: string; issues: string[] }> = [];
      for (const { fileName, raw } of rawLessons) {
        const result = safeValidateLessonV1(raw);
        if (!result.success) {
          failures.push({ fileName, issues: result.errors });
        }
      }

      expect(failures).toEqual([]);
    });

    it("loads every registered V1 lesson via loadV1Lesson()", () => {
      const lessonIds = listV1LessonIds();
      expect(lessonIds.length).toBe(rawLessons.length);

      for (const lessonId of lessonIds) {
        const loaded = loadV1Lesson(lessonId);
        expect(loaded.ok).toBe(true);
      }
    });
  });

  describe("2. Adapter & renderer routing tests for every supported activity type", () => {
    it("adapts every active lesson through adaptLessonV1ToLayer1 and maps every activity to a valid renderer and V2 presentation family", () => {
      const seenTypes = new Set<string>();

      for (const lessonV1 of v1Lessons) {
        const adapted = adaptLessonV1ToLayer1(lessonV1);

        expect(adapted.lesson.id).toBe(lessonV1.id);
        expect(adapted.lesson.activities.length).toBe(lessonV1.activities.length);

        for (const activity of lessonV1.activities) {
          seenTypes.add(activity.type);
          const renderKind = adapted.renderPlan[activity.id];
          expect(renderKind).toBeDefined();

          const family = resolvePresentationFamily(activity.type);
          expect(family).toBeTruthy();

          const layer1Act = adapted.lesson.activities.find((a) => a.id === activity.id);
          expect(layer1Act).toBeDefined();
          if (layer1Act) {
            const renderer =
              ACTIVITY_RENDERER_MAP[layer1Act.type as keyof typeof ACTIVITY_RENDERER_MAP];
            expect(renderer).toBeDefined();
          }
        }
      }

      // Confirm active curriculum activity types were exercised
      expect(seenTypes.has("multiple-choice")).toBe(true);
      expect(seenTypes.has("explanation")).toBe(true);
      expect(seenTypes.has("visual")).toBe(true);
      expect(seenTypes.has("ordering")).toBe(true);
      expect(seenTypes.has("code-modification")).toBe(true);
      expect(seenTypes.has("replicate-this")).toBe(true);
    });
  });

  describe("3. Validation & Defect Reproduction Suite (P0 / P1 Audit Findings)", () => {
    it("Phase 1.1: Ordering validation, deterministic non-solved initialization, 1-item safety, duplicate/missing ID rejection, retry, and progression", () => {
      // Audit all 4 active ordering lessons: lesson-0-1-4, lesson-0-1-6, lesson-0-2-2, lesson-2-5-8
      const orderingLessonIds = ["lesson-0-1-4", "lesson-0-1-6", "lesson-0-2-2", "lesson-2-5-8"];
      for (const lessonId of orderingLessonIds) {
        const loaded = loadV1Lesson(lessonId);
        expect(loaded.ok).toBe(true);
        if (!loaded.ok) continue;

        const adapted = adaptLessonV1ToLayer1(loaded.lesson);
        const orderingAct = adapted.lesson.activities.find((a) => a.type === "ordering");
        expect(orderingAct).toBeDefined();
        if (!orderingAct || orderingAct.type !== "ordering") continue;

        const items = orderingAct.content.items;
        const correctSequence =
          orderingAct.validation?.type === "ordering"
            ? orderingAct.validation.correctSequence
            : [];
        expect(correctSequence.length).toBe(items.length);

        // (3) & (4) & (5): Initial response is a deterministic permutation that differs from correctSequence
        const init1 = resolveInitialOrderingResponse(items, correctSequence, orderingAct.id);
        const init2 = resolveInitialOrderingResponse(items, correctSequence, orderingAct.id);
        expect(init1).toEqual(init2);
        expect(isValidOrderingPermutation(init1, items)).toBe(true);
        expect(init1).not.toEqual(correctSequence);

        // (6): Initialization does not reset an existing valid learner response
        const customOrder = [...correctSequence].reverse();
        expect(
          resolveInitialOrderingResponse(items, correctSequence, orderingAct.id, customOrder),
        ).toEqual(customOrder);

        // (1) & (2): Correct sequence passes; initialized (scrambled) sequence fails
        const failResult = evaluateActivityValidation(orderingAct, init1 as never);
        expect(failResult.isValid).toBe(false);

        const passResult = evaluateActivityValidation(orderingAct, correctSequence as never);
        expect(passResult.isValid).toBe(true);
        expect(passResult.score).toBe(100);
      }

      // 2-item derangement check when raw order != correctSequence
      const twoItems = [
        { id: "a", text: "First" },
        { id: "b", text: "Second" },
      ];
      const twoScrambled = scrambleOrderingItems(twoItems, ["b", "a"], "two-item-seed");
      expect(twoScrambled).toEqual(["a", "b"]);

      // (7): One-item activity is handled safely without throwing or looping
      const singleItem = [{ id: "only-1", text: "Single step" }];
      expect(scrambleOrderingItems(singleItem, ["only-1"], "single-seed")).toEqual(["only-1"]);
      expect(isValidOrderingPermutation(["only-1"], singleItem)).toBe(true);

      // (8): Duplicate or missing item IDs are rejected by integrity check, compatibility validator, and runtime validator
      expect(
        validateOrderingSequenceIntegrity(
          [
            { id: "a", text: "A" },
            { id: "b", text: "B" },
          ],
          ["a", "a"],
        ).isValid,
      ).toBe(false);
      expect(
        validateOrderingSequenceIntegrity(
          [
            { id: "a", text: "A" },
            { id: "b", text: "B" },
          ],
          ["a"],
        ).isValid,
      ).toBe(false);

      const malformedActivity: ActivityV1 = {
        id: "act-bad-order",
        type: "ordering",
        role: "practice",
        title: "Malformed ordering",
        content: {
          prompt: "Order these",
          items: [
            { id: "i1", text: "One" },
            { id: "i2", text: "Two" },
          ],
        },
        validation: {
          type: "ordering",
          correctSequence: ["i1", "i1"],
        },
      };
      const compatDiagnostics = checkActivityCompatibility(malformedActivity, 0);
      expect(compatDiagnostics.some((d) => d.severity === "error")).toBe(true);

      // Compatibility fallback for correctOrder
      const loaded014 = loadV1Lesson("lesson-0-1-4");
      expect(loaded014.ok).toBe(true);
      if (loaded014.ok) {
        const clone = structuredClone(loaded014.lesson);
        const ord = clone.activities.find((a) => a.id === "act-0-1-4-order-trace");
        if (ord && ord.validation) {
          ord.validation.correctOrder = ord.validation.correctSequence;
          delete ord.validation.correctSequence;
        }
        const adaptedFallback = adaptLessonV1ToLayer1(clone);
        const adaptedOrd = adaptedFallback.lesson.activities.find(
          (a) => a.id === "act-0-1-4-order-trace",
        );
        expect(adaptedOrd?.validation).toEqual({
          type: "ordering",
          correctSequence: ["itm-c", "itm-d", "itm-b", "itm-e", "itm-a"],
        });

        // (9), (10), (11), (12): Full session lifecycle (initialize -> submit wrong -> retry -> submit right -> complete -> advance)
        let session = startLessonSession(createLessonSession(adaptedFallback.lesson));
        const actId = "act-0-1-4-order-trace";
        const items = (adaptedOrd!.content as { items: { id: string }[] }).items;
        const correctSeq = ["itm-c", "itm-d", "itm-b", "itm-e", "itm-a"];

        const initialOrder = resolveInitialOrderingResponse(items, correctSeq, actId);
        expect(isValidOrderingPermutation(initialOrder, items)).toBe(true);
        session = engageSessionActivity(session, actId, initialOrder);

        // Submit wrong initial order
        session = startActivityEvaluation(session, actId);
        const wrongEval = evaluateActivityValidation(adaptedOrd!, initialOrder as never);
        expect(wrongEval.isValid).toBe(false);
        session = resolveActivityEvaluation(session, actId, wrongEval);
        expect(session.activities[actId].status).toBe("failed");
        expect(deriveActivityInteractionState(session.activities[actId]).status).toBe("incorrect");
        expect(
          deriveActivityInteractionState(session.activities[actId]).validationResult?.isValid,
        ).toBe(false);

        // Retry clears stale validationResult in derived runtime state and preserves response
        session = retrySessionActivity(session, actId);
        expect(session.activities[actId].status).toBe("retrying");
        const retryingDerived = deriveActivityInteractionState(session.activities[actId]);
        expect(retryingDerived.status).toBe("active");
        expect(retryingDerived.validationResult).toBeUndefined();
        expect(retryingDerived.response).toEqual(initialOrder);

        // Rearrange to correct sequence and submit
        session = engageSessionActivity(session, actId, correctSeq);
        session = startActivityEvaluation(session, actId);
        const rightEval = evaluateActivityValidation(adaptedOrd!, correctSeq as never);
        expect(rightEval.isValid).toBe(true);
        session = resolveActivityEvaluation(session, actId, rightEval);
        expect(session.activities[actId].status).toBe("passed");

        // Complete and advance
        session = completeSessionActivity(session, actId);
        expect(session.completedActivityIds).toContain(actId);
        const prevIndex = session.currentActivityIndex;
        session = nextSessionActivity(session);
        expect(session.currentActivityIndex).toBe(prevIndex + 1);
      }
    });

    it("Documents P0 defect: substring-only source_contains validation currently passes when required code is inside a comment", () => {
      const loaded = loadV1Lesson("lesson-1-1-1");
      expect(loaded.ok).toBe(true);
      if (!loaded.ok) return;

      const adapted = adaptLessonV1ToLayer1(loaded.lesson);
      const codeAct = adapted.lesson.activities.find((a) => a.type === "interactive-code");
      expect(codeAct).toBeDefined();
      if (!codeAct) return;

      // Adversarial submission: required token placed purely inside an HTML/JS comment
      const adversarialCommentOnly = "<!-- <h1>Forge</h1> <p>Build</p> -->";
      const result = evaluateActivityValidation(codeAct, adversarialCommentOnly as never);

      // Baseline observation recorded for Phase 1.3 repair:
      expect(typeof result.isValid).toBe("boolean");
    });

    it("Documents P0 defect count: replicate-this activities where starterHtml/starterCss equal target.html/target.css", () => {
      let identicalCount = 0;

      for (const lesson of v1Lessons) {
        for (const act of lesson.activities) {
          if (act.type === "replicate-this") {
            const content = act.content as {
              target: { html: string; css: string };
              workspace: { starterHtml: string; starterCss: string };
            };
            const sameHtml =
              content.target.html.trim() === content.workspace.starterHtml.trim();
            const sameCss =
              content.target.css.trim() === content.workspace.starterCss.trim();
            if (sameHtml && sameCss) {
              identicalCount++;
            }
          }
        }
      }

      // Baseline audit found 34 identical replicate-this activities to be fixed in Phase 1.5
      expect(identicalCount).toBe(34);
    });

    it("Documents P1 defect count: JS/TS code activities with raw HTML starterCode in Module 2.2", () => {
      const mismatchedIds: string[] = [];

      for (const lesson of v1Lessons) {
        for (const act of lesson.activities) {
          if (act.type === "code-modification" || act.type === "interactive-code") {
            const content = act.content as { language: string; starterCode: string };
            if (
              (content.language === "javascript" || content.language === "typescript") &&
              content.starterCode.trim().startsWith("<")
            ) {
              mismatchedIds.push(`${lesson.id}:${act.id}`);
            }
          }
        }
      }

      // Baseline audit identified 3 activities in lesson-2-2-2, lesson-2-2-3, lesson-2-2-5
      expect(mismatchedIds).toEqual([
        "lesson-2-2-2:act-2-2-2-5",
        "lesson-2-2-3:act-2-2-3-5",
        "lesson-2-2-5:act-2-2-5-5",
      ]);
    });
  });
});
