import { describe, it, expect } from "vitest";
import { checkCurriculumIntegrity, checkCorpusIntegrity } from "./curriculum-integrity";
import { goldenLesson0CanonicalV1 } from "../golden-lesson-v1";
import type { CanonicalLessonV1 } from "../types-v1";

function lessonStub(id: string, prerequisiteLessonIds: string[] = []): CanonicalLessonV1 {
  return {
    ...JSON.parse(JSON.stringify(goldenLesson0CanonicalV1)),
    id,
    curriculum: { ...goldenLesson0CanonicalV1.curriculum, prerequisiteLessonIds },
  };
}

describe("checkCurriculumIntegrity — single lesson", () => {
  it("passes the golden lesson's real phaseId/moduleId/conceptIds with no errors or warnings", () => {
    const diagnostics = checkCurriculumIntegrity(goldenLesson0CanonicalV1);
    expect(diagnostics.filter((d) => d.severity === "error")).toHaveLength(0);
    expect(diagnostics.filter((d) => d.severity === "warning")).toHaveLength(0);
  });

  it("flags an unknown phaseId as an error", () => {
    const lesson = { ...goldenLesson0CanonicalV1, curriculum: { ...goldenLesson0CanonicalV1.curriculum, phaseId: "phase-99" } };
    const diagnostics = checkCurriculumIntegrity(lesson);
    expect(diagnostics.some((d) => d.code === "BROKEN_PHASE_REFERENCE" && d.severity === "error")).toBe(true);
  });

  it("flags a self-referencing prerequisite", () => {
    const lesson = lessonStub("lesson-a", ["lesson-a"]);
    const diagnostics = checkCurriculumIntegrity(lesson);
    expect(diagnostics.some((d) => d.code === "BROKEN_LESSON_REFERENCE")).toBe(true);
  });
});

describe("checkCorpusIntegrity — multi-lesson graph checks", () => {
  it("detects a direct two-lesson cycle", () => {
    const a = lessonStub("lesson-a", ["lesson-b"]);
    const b = lessonStub("lesson-b", ["lesson-a"]);
    const diagnostics = checkCorpusIntegrity([a, b]);
    expect(diagnostics.filter((d) => d.code === "BROKEN_LESSON_REFERENCE")).toHaveLength(1); // deduped, not reported twice
  });

  it("detects a three-hop cycle (A → B → C → A) — the case the prior phase's two-hop check missed", () => {
    const a = lessonStub("lesson-a", ["lesson-b"]);
    const b = lessonStub("lesson-b", ["lesson-c"]);
    const c = lessonStub("lesson-c", ["lesson-a"]);
    const diagnostics = checkCorpusIntegrity([a, b, c]);
    expect(diagnostics.some((d) => d.code === "BROKEN_LESSON_REFERENCE" && d.message.includes("lesson-a") && d.message.includes("lesson-b") && d.message.includes("lesson-c"))).toBe(true);
  });

  it("detects a longer, five-hop cycle", () => {
    const lessons = ["l1", "l2", "l3", "l4", "l5"].map((id, i, arr) =>
      lessonStub(id, [arr[(i + 1) % arr.length]]),
    );
    const diagnostics = checkCorpusIntegrity(lessons);
    expect(diagnostics.some((d) => d.code === "BROKEN_LESSON_REFERENCE")).toBe(true);
  });

  it("does not false-positive on a valid, acyclic prerequisite chain", () => {
    const a = lessonStub("lesson-a", []);
    const b = lessonStub("lesson-b", ["lesson-a"]);
    const c = lessonStub("lesson-c", ["lesson-b"]);
    const diagnostics = checkCorpusIntegrity([a, b, c]);
    expect(diagnostics.filter((d) => d.code === "BROKEN_LESSON_REFERENCE")).toHaveLength(0);
  });

  it("detects duplicate lesson IDs", () => {
    const a = lessonStub("lesson-dup", []);
    const b = lessonStub("lesson-dup", []);
    const diagnostics = checkCorpusIntegrity([a, b]);
    expect(diagnostics.some((d) => d.code === "DUPLICATE_LESSON_ID")).toBe(true);
  });
});
