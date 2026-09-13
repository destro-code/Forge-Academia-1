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

  it("throws clearly for a not-yet-supported type instead of falling back silently", () => {
    expect(() => resolvePresentationFamily("ordering")).toThrow(/not-yet-supported|no implementation/);
    expect(() => resolvePresentationFamily("fill-blank")).toThrow();
    expect(() => resolvePresentationFamily("multi-select")).toThrow();
  });

  it("throws clearly for a completely unregistered type", () => {
    expect(() => resolvePresentationFamily("not-a-real-type")).toThrow(/no presentation entry registered/);
  });
});
