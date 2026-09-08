import { describe, it, expect } from "vitest";
import { capabilityCatalog } from "./capabilities";
import { goldenLesson0CanonicalV1 } from "./golden-lesson-0-v1.test";

describe("Step 4 — Proven Learning Capabilities Engine", () => {
  it("loads canonical capabilities from catalog with full schema integrity", () => {
    const allCaps = capabilityCatalog.getAll();
    expect(allCaps.length).toBeGreaterThanOrEqual(9);

    allCaps.forEach((cap) => {
      expect(cap.id).toMatch(/^cap-/);
      expect(cap.phaseId).toMatch(/^phase-/);
      expect(cap.moduleId).toMatch(/^module-/);
      expect(cap.title.length).toBeGreaterThan(3);
      expect(cap.statement.length).toBeGreaterThan(10);
      expect(cap.depth.length).toBeGreaterThan(0);
      expect(cap.conceptIds.length).toBeGreaterThan(0);
      expect(cap.skillIds.length).toBeGreaterThan(0);
      expect(cap.evidenceTypes.length).toBeGreaterThan(0);
    });
  });

  it("verifies all capabilities referenced in Golden Lesson 0 exist in the catalog", () => {
    const gl0CapIds = goldenLesson0CanonicalV1.curriculum.capabilityIds;
    expect(gl0CapIds).toHaveLength(4);

    const check = capabilityCatalog.validateCapabilityReferences(gl0CapIds);
    expect(check.valid).toBe(true);
    expect(check.missingIds).toHaveLength(0);

    // Primary capability verification
    const primaryCap = capabilityCatalog.getById(
      goldenLesson0CanonicalV1.learning.primaryCapability.id,
    );
    expect(primaryCap).toBeDefined();
    expect(primaryCap?.id).toBe("cap-observe-browser-behavior");
    expect(primaryCap?.depth).toContain("debugging");
    expect(primaryCap?.depth).toContain("explanation");
    expect(primaryCap?.depth).toContain("transfer");
  });

  it("can filter capabilities by Phase and Module correctly", () => {
    const phase0Caps = capabilityCatalog.getByPhase("phase-0");
    expect(phase0Caps.length).toBeGreaterThanOrEqual(6);

    const module01Caps = capabilityCatalog.getByModule("module-0-1");
    expect(module01Caps.length).toBe(4);
    const modCapIds = module01Caps.map((c) => c.id);
    expect(modCapIds).toContain("cap-observe-browser-behavior");
    expect(modCapIds).toContain("cap-form-falsifiable-hypothesis");
    expect(modCapIds).toContain("cap-repair-event-defect");
    expect(modCapIds).toContain("cap-reconstruct-causal-chain");
  });

  it("identifies invalid capability references accurately", () => {
    const check = capabilityCatalog.validateCapabilityReferences([
      "cap-observe-browser-behavior",
      "cap-non-existent-1234",
    ]);
    expect(check.valid).toBe(false);
    expect(check.missingIds).toEqual(["cap-non-existent-1234"]);
  });
});
