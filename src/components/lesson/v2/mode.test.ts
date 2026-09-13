import { describe, it, expect } from "vitest";
import { deriveLessonMode } from "./mode";

describe("deriveLessonMode", () => {
  it("maps every golden-lesson role to its intended mode", () => {
    expect(deriveLessonMode("encounter", "visual")).toBe("studying");
    expect(deriveLessonMode("prediction", "multiple-choice")).toBe("committing");
    expect(deriveLessonMode("investigation", "debug")).toBe("investigating");
    expect(deriveLessonMode("manipulation", "interactive-code")).toBe("building");
    expect(deriveLessonMode("verification", "visual")).toBe("closing");
    expect(deriveLessonMode("reflection", "reflection")).toBe("reflecting");
    expect(deriveLessonMode("transfer", "reflection")).toBe("reflecting");
  });

  it("falls back to the activity type when role is missing", () => {
    expect(deriveLessonMode(undefined, "debug")).toBe("investigating");
  });

  it("falls back to studying for a fully unrecognized role and type", () => {
    expect(deriveLessonMode("some-future-role", "some-future-type")).toBe("studying");
  });
});
