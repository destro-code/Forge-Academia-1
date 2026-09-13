import { describe, it, expect } from "vitest";
import { validateLessonV1, safeValidateLessonV1 } from "./schema-v1";
import { lintLessonV1 } from "./authoring/rules-v1";
import { goldenLesson0CanonicalV1 } from "./golden-lesson-v1";
describe("Golden Lesson 0 (The Broken Button) — North-Star Certification", () => {
  it("validates strictly against Canonical Lesson Schema V1", () => {
    const result = safeValidateLessonV1(goldenLesson0CanonicalV1);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe("lesson-0-1-1");
      expect(result.data.curriculum.phaseId).toBe("phase-0");
      expect(result.data.learning.primaryCapability.id).toBe("cap-observe-browser-behavior");
      expect(result.data.activities.length).toBe(7);
    }
  });

  it("passes all authoring linter rules without diagnostic errors", () => {
    const diagnostics = lintLessonV1(goldenLesson0CanonicalV1);
    const errors = diagnostics.filter((d) => d.severity === "error");
    expect(errors).toHaveLength(0);
  });

  it("satisfies the complete pedagogical arc (encounter -> prediction -> investigation -> fix -> verification -> explanation -> transfer)", () => {
    const activityRoles = goldenLesson0CanonicalV1.activities.map((a) => a.role);
    expect(activityRoles).toEqual([
      "encounter",
      "prediction",
      "investigation",
      "manipulation",
      "verification",
      "reflection",
      "transfer",
    ]);
  });

  it("produces all required evidence types for mastery verification", () => {
    const producedTypes = new Set(
      goldenLesson0CanonicalV1.activities.flatMap((a) => a.evidence?.types || []),
    );
    goldenLesson0CanonicalV1.mastery.requiredEvidence.forEach((reqType) => {
      expect(producedTypes.has(reqType)).toBe(true);
    });
  });

  it("certifies that canonical JSON lesson-0-1-1 loaded by CanonicalProvider passes V1 capability and linting contracts", async () => {
    const { canonicalProvider } = await import("./canonical-provider");
    const { lintLesson } = await import("./authoring/lint-lesson");

    const jsonLesson = canonicalProvider.getLesson("lesson-0-1-1");
    expect(jsonLesson).toBeDefined();
    if (!jsonLesson) return;

    expect(jsonLesson.phaseId).toBe("phase-0");
    expect(jsonLesson.moduleId).toBe("module-0-1");
    expect(jsonLesson.capabilityGroupId).toBe("capgroup-0-1-1");
    expect(jsonLesson.capabilityIds).toContain("cap-observe-browser-behavior");
    expect(jsonLesson.capabilityIds).toContain("cap-form-falsifiable-hypothesis");
    expect(jsonLesson.capabilityIds).toContain("cap-repair-event-defect");
    expect(jsonLesson.capabilityIds).toContain("cap-reconstruct-causal-chain");
    expect(jsonLesson.primaryCapability?.id).toBe("cap-observe-browser-behavior");

    const lintResult = lintLesson(jsonLesson);
    expect(lintResult.errors).toHaveLength(0);
    expect(lintResult.valid).toBe(true);
  });
});
