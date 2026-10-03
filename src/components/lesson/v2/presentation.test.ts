import { describe, it, expect } from "vitest";
import { resolvePresentationFamily } from "./presentation";
import { goldenLesson0CanonicalV1 } from "@/lib/curriculum/golden-lesson-v1";

describe("resolvePresentationFamily", () => {
  it("resolves every activity type the golden lesson actually uses", () => {
    const types = new Set(goldenLesson0CanonicalV1.activities.map((a) => a.type));
    for (const type of types) {
      expect(() => resolvePresentationFamily(type)).not.toThrow();
    }
  });

  it("maps interactive-demo to system, prediction to commitment, debug to investigation", () => {
    expect(resolvePresentationFamily("interactive-demo")).toBe("system");
    expect(resolvePresentationFamily("prediction")).toBe("commitment");
    expect(resolvePresentationFamily("debug")).toBe("investigation");
    expect(resolvePresentationFamily("interactive-code")).toBe("code-workspace");
    expect(resolvePresentationFamily("reflection")).toBe("reasoning");
    expect(resolvePresentationFamily("judgment")).toBe("reasoning");
  });

  it("resolves all 18 V1 activity types including code-modification", () => {
    const allTypes = [
      "intro",
      "explanation",
      "summary",
      "visual",
      "interactive-demo",
      "prediction",
      "output-prediction",
      "multiple-choice",
      "multi-select",
      "ordering",
      "fill-blank",
      "debug",
      "interactive-code",
      "code-modification",
      "reflection",
      "judgment",
      "completion",
      "replicate-this",
    ];
    for (const type of allTypes) {
      expect(() => resolvePresentationFamily(type)).not.toThrow();
    }
  });

  it("maps the newly implemented Selection/Assembly/Reading/Commitment/Code types correctly", () => {
    expect(resolvePresentationFamily("multi-select")).toBe("selection");
    expect(resolvePresentationFamily("ordering")).toBe("selection");
    expect(resolvePresentationFamily("fill-blank")).toBe("assembly");
    expect(resolvePresentationFamily("intro")).toBe("reading");
    expect(resolvePresentationFamily("explanation")).toBe("reading");
    expect(resolvePresentationFamily("summary")).toBe("reading");
    expect(resolvePresentationFamily("multiple-choice")).toBe("commitment");
    expect(resolvePresentationFamily("output-prediction")).toBe("commitment");
    expect(resolvePresentationFamily("code-modification")).toBe("code-workspace");
  });

  it("throws clearly for a completely unregistered type", () => {
    expect(() => resolvePresentationFamily("not-a-real-type")).toThrow(
      /no presentation entry registered/,
    );
  });
});
