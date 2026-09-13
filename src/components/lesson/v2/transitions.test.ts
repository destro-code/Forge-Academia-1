import { describe, it, expect } from "vitest";
import { resolveTransition } from "./transitions";
import { goldenLesson0CanonicalV1 } from "@/lib/curriculum/golden-lesson-v1";

describe("resolveTransition", () => {
  it("resolves every consecutive role pair in the golden lesson to a non-default transition where one is authored", () => {
    const roles = goldenLesson0CanonicalV1.activities.map((a) => a.role);
    // encounter, encounter, prediction, investigation, manipulation, verification, reflection, transfer
    expect(resolveTransition(roles[1], roles[2])).toBe("settle"); // encounter -> prediction
    expect(resolveTransition(roles[2], roles[3])).toBe("shift-mode"); // prediction -> investigation
    expect(resolveTransition(roles[3], roles[4])).toBe("carry-evidence"); // investigation -> manipulation
    expect(resolveTransition(roles[4], roles[5])).toBe("resolve"); // manipulation -> verification
  });

  it("defaults to plain for an unauthored pair", () => {
    expect(resolveTransition("encounter", "encounter")).toBe("plain");
  });

  it("defaults to plain when either role is missing", () => {
    expect(resolveTransition(undefined, "prediction")).toBe("plain");
    expect(resolveTransition("encounter", undefined)).toBe("plain");
  });
});
