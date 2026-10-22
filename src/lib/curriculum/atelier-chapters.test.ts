import { describe, expect, it } from "vitest";
import { auditAtelierChapterPartition, getAtelierChapters, getUtcWeekActiveDays } from "@/lib/curriculum/atelier-chapters";
import { canonicalManifest } from "@/lib/curriculum/manifest";

describe("Creative Atelier chapter data", () => {
  it("assigns every active module to exactly one chapter", () => {
    const report = auditAtelierChapterPartition();
    expect(report.valid).toBe(true);
    expect(report.activeModuleIds).toHaveLength(17);
    expect(report.assignedModuleIds).toHaveLength(17);
    expect(report.duplicateModuleIds).toEqual([]);
    expect(report.missingModuleIds).toEqual([]);
    expect(report.unknownModuleIds).toEqual([]);
  });

  it("uses authored lessons for completion math and exposes planned lessons separately", () => {
    const chapters = getAtelierChapters([]);
    expect(chapters).toHaveLength(4);
    expect(chapters.reduce((sum, chapter) => sum + chapter.totalAuthoredLessons, 0)).toBe(
      canonicalManifest.getAuthoredLessons().filter((lesson) =>
        auditAtelierChapterPartition().assignedModuleIds.includes(lesson.moduleId),
      ).length,
    );
    expect(chapters.every((chapter) => chapter.completionPercent === 0)).toBe(true);
    expect(chapters.reduce((sum, chapter) => sum + chapter.plannedLessons.length, 0)).toBeGreaterThan(0);
    expect(chapters.every((chapter) =>
      chapter.authoredLessons.every((lesson) => lesson.authored !== false),
    )).toBe(true);
  });

  it("calculates unique active days in the current UTC week", () => {
    const now = new Date("2026-10-22T12:00:00.000Z"); // Thursday
    expect(
      getUtcWeekActiveDays(
        [
          "2026-10-19",
          "2026-10-19",
          "2026-10-20",
          "2026-10-25",
          "2026-10-26",
          "not-a-date",
        ],
        now,
      ),
    ).toBe(3);
  });
});
