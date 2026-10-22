import { describe, expect, it } from "vitest";
import { canonicalManifest } from "@/lib/curriculum/manifest";
import { ATELIER_CHAPTERS, getAtelierModules, getUtcWeekActiveDays } from "@/lib/curriculum/atelier-chapters";

describe("Creative Atelier chapter curriculum", () => {
  it("partitions every active module into exactly one chapter", () => {
    const active = canonicalManifest.getModules()
      .filter((module) => module.lessonIds.length > 0)
      .map((module) => module.moduleId)
      .sort();
    const assigned = ATELIER_CHAPTERS.flatMap((chapter) => [...chapter.moduleIds]);
    const assignedUnique = [...new Set(assigned)].sort();

    expect(ATELIER_CHAPTERS).toHaveLength(4);
    expect(assigned).toHaveLength(active.length);
    expect(assignedUnique).toEqual(active);
  });

  it("does not lose authored or planned lesson references when grouping chapters", () => {
    const chapters = getAtelierModules();
    const authoredIds = chapters.flatMap((chapter) =>
      chapter.modules.flatMap((module) =>
        canonicalManifest.getAuthoredLessonsForModule(module.moduleId).map((lesson) => lesson.lessonId),
      ),
    );
    const plannedIds = chapters.flatMap((chapter) =>
      chapter.modules.flatMap((module) =>
        canonicalManifest.getLessonsForModule(module.moduleId)
          .filter((lesson) => lesson.authored === false)
          .map((lesson) => lesson.lessonId),
      ),
    );

    expect(new Set(authoredIds).size).toBe(authoredIds.length);
    expect(new Set(plannedIds).size).toBe(plannedIds.length);
    expect(authoredIds.length).toBe(canonicalManifest.getAuthoredLessons().filter((lesson) =>
      ATELIER_CHAPTERS.some((chapter) => chapter.moduleIds.some((id) => id === lesson.moduleId)),
    ).length);
    expect(chapters.flatMap((chapter) => chapter.modules).length).toBe(activeModuleCount());
  });

  it("counts unique activity dates in the Monday-to-Sunday UTC week", () => {
    expect(getUtcWeekActiveDays([
      "2026-10-19", "2026-10-19", "2026-10-20", "2026-10-25", "2026-10-26", "2026-10-32", "not-a-date",
    ], new Date("2026-10-22T12:00:00.000Z"))).toBe(3);
  });

  it("ignores activity dates outside the current UTC week", () => {
    expect(getUtcWeekActiveDays([
      "2026-10-18", "2026-10-26", "2026-11-01",
    ], new Date("2026-10-22T12:00:00.000Z"))).toBe(0);
  });
});

function activeModuleCount(): number {
  return canonicalManifest.getModules().filter((module) => module.lessonIds.length > 0).length;
}
