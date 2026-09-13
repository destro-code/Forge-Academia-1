import { describe, it, expect } from "vitest";
import { deriveContinueLabel } from "./continue-label";

describe("deriveContinueLabel", () => {
  it("prefers role over type when both are recognized", () => {
    expect(deriveContinueLabel("prediction", "multiple-choice")).toBe("Make a prediction");
    expect(deriveContinueLabel("investigation", "debug")).toBe("Inspect the evidence");
    expect(deriveContinueLabel("manipulation", "interactive-code")).toBe("Try it");
  });

  it("falls back to type when role is missing or unrecognized", () => {
    expect(deriveContinueLabel(undefined, "interactive-code")).toBe("Build it");
    expect(deriveContinueLabel("some-unknown-role", "ordering")).toBe("Put it in order");
  });

  it("falls back to the default 'Continue' when neither is recognized", () => {
    expect(deriveContinueLabel(undefined, undefined)).toBe("Continue");
    expect(deriveContinueLabel("unknown", "unknown")).toBe("Continue");
  });

  it("accepts a custom fallback", () => {
    expect(deriveContinueLabel(undefined, undefined, "Complete lesson")).toBe("Complete lesson");
  });
});
