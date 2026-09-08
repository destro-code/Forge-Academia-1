import { describe, it, expect } from "vitest";
import { lintLessonV1Full } from "./lint-lesson-v1";
import { evaluateLessonQuality, generateLessonScaffold } from "./authoring-pipeline";
import { goldenLesson0CanonicalV1 } from "../golden-lesson-0-v1.test";
import { DIAGNOSTIC_CODES } from "./types";

describe("Step 5 — Lesson Authoring Pipeline & Quality Evaluator", () => {
  it("evaluates Golden Lesson 0 with high quality and certification pass", () => {
    const evaluation = evaluateLessonQuality(goldenLesson0CanonicalV1);

    expect(evaluation.passedCertification).toBe(true);
    expect(evaluation.overallScore).toBeGreaterThanOrEqual(90);
    expect(evaluation.dimensions.schemaCompliance).toBe(100);
    expect(evaluation.dimensions.evidenceRigor).toBe(100);
    expect(evaluation.dimensions.pedagogicalArc).toBe(100);
    expect(evaluation.dimensions.capabilityCoverage).toBe(100);
    expect(evaluation.lintResult.valid).toBe(true);
    expect(evaluation.lintResult.errors).toHaveLength(0);
  });

  it("detects and flags duplicate activity IDs in V1 lessons", () => {
    const invalidLesson = JSON.parse(JSON.stringify(goldenLesson0CanonicalV1));
    invalidLesson.activities[1].id = invalidLesson.activities[0].id;

    const result = lintLessonV1Full(invalidLesson);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === DIAGNOSTIC_CODES.DUPLICATE_ACTIVITY_ID)).toBe(true);
  });

  it("detects and flags uncataloged capability IDs", () => {
    const invalidLesson = JSON.parse(JSON.stringify(goldenLesson0CanonicalV1));
    invalidLesson.curriculum.capabilityIds.push("cap-made-up-nonexistent");

    const result = lintLessonV1Full(invalidLesson);
    expect(result.valid).toBe(false);
    expect(
      result.errors.some(
        (e) =>
          e.code === DIAGNOSTIC_CODES.BROKEN_SKILL_REFERENCE &&
          e.message.includes("cap-made-up-nonexistent"),
      ),
    ).toBe(true);
  });

  it("generates a schema-compliant lesson scaffold from capability ID", () => {
    const scaffold = generateLessonScaffold({
      id: "lesson-0-1-2",
      title: "The DOM Tree Inspector",
      description: "Inspect DOM node hierarchy and attributes.",
      phaseId: "phase-0",
      moduleId: "module-0-1",
      primaryCapabilityId: "cap-observe-browser-behavior",
    });

    expect(scaffold.id).toBe("lesson-0-1-2");
    expect(scaffold.curriculum.capabilityIds).toContain("cap-observe-browser-behavior");
    expect(scaffold.learning.primaryCapability.id).toBe("cap-observe-browser-behavior");
    expect(scaffold.activities.length).toBe(4);

    const evaluation = evaluateLessonQuality(scaffold);
    expect(evaluation.lintResult.errors).toHaveLength(0);
    expect(evaluation.passedCertification).toBe(true);
  });
});
