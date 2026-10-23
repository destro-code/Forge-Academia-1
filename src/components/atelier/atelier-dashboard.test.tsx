// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from "vitest";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import {
  ATELIER_CHAPTER_DEFINITIONS,
  buildAtelierChapterFolios,
  computeUtcCalendarWeekActiveDays,
  evaluateAtelierProjects,
} from "@/lib/curriculum/atelier-chapters";
import { localContentProvider } from "@/lib/providers/content-provider";
import { canonicalManifest } from "@/lib/curriculum/manifest";
import { LiveBlueprintStage } from "./live-blueprint-stage";
import { resolveTheme } from "@/lib/hooks/use-theme";

describe("Forge Academia Creative Atelier — Curriculum & Studio Verification", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("1. Partitions all 17 active curriculum modules exactly once across the 4 Chapter Folios", () => {
    const activeModules = localContentProvider.modules();
    expect(activeModules).toHaveLength(17);

    const assignedIds = ATELIER_CHAPTER_DEFINITIONS.flatMap((c) => c.moduleIds);
    expect(assignedIds).toHaveLength(17);
    expect(new Set(assignedIds).size).toBe(17);

    for (const mod of activeModules) {
      expect(assignedIds).toContain(mod.id);
    }

    const folios = buildAtelierChapterFolios(activeModules, [], "lesson-0-1-1");
    expect(folios).toHaveLength(4);
    expect(folios.map((f) => f.shortTitle)).toEqual([
      "HTML Basics",
      "CSS Magic",
      "JavaScript Adventure",
      "Build Real Projects",
    ]);

    // Verify every playable lesson in every folio is an authored lesson
    const authoredSet = new Set(
      canonicalManifest.getAuthoredLessons().map((l) => l.lessonId),
    );
    for (const folio of folios) {
      for (const mod of folio.modules) {
        for (const lesson of mod.authoredLessons) {
          expect(authoredSet.has(lesson.id)).toBe(true);
        }
      }
    }
  });

  it("2. Computes honest UTC calendar-week active days without fabricating sessions", () => {
    const refWednesday = new Date("2026-10-21T12:00:00.000Z"); // Wednesday
    const emptyWeek = computeUtcCalendarWeekActiveDays([], refWednesday);
    expect(emptyWeek.activeDaysCount).toBe(0);
    expect(emptyWeek.days).toHaveLength(7);

    const activeWeek = computeUtcCalendarWeekActiveDays(
      ["2026-10-19", "2026-10-21T09:30:00Z"],
      refWednesday,
    );
    expect(activeWeek.activeDaysCount).toBe(2);
    expect(activeWeek.days[0].isActive).toBe(true); // Monday 2026-10-19
    expect(activeWeek.days[2].isActive).toBe(true); // Wednesday 2026-10-21
    expect(activeWeek.days[2].isToday).toBe(true);
  });

  it("3. Evaluates honest project progress from real projectTasks and projectCriteria", () => {
    const projects = localContentProvider.projects();
    expect(projects.length).toBeGreaterThan(0);

    const zeroState = evaluateAtelierProjects(projects, {
      projectTasks: {},
      projectCriteria: {},
      projectReflections: {},
      projectPortfolioNotes: {},
      completedProjects: [],
    });
    expect(zeroState.hasAnyStartedProject).toBe(false);
    expect(zeroState.activeProject).toBeDefined();
    expect(zeroState.activeProject?.completionPercent).toBe(0);

    const firstProject = projects[0];
    const firstTask = firstProject.milestones[0]?.tasks[0];
    const firstCrit = firstProject.acceptanceCriteria[0];

    const startedState = evaluateAtelierProjects(projects, {
      projectTasks: firstTask ? { [`${firstProject.id}:${firstTask.id}`]: true } : {},
      projectCriteria: firstCrit ? { [`${firstProject.id}:${firstCrit.id}`]: true } : {},
      projectReflections: {},
      projectPortfolioNotes: {},
      completedProjects: [],
    });
    expect(startedState.hasAnyStartedProject).toBe(true);
    expect(startedState.activeProject?.project.id).toBe(firstProject.id);
    expect(startedState.activeProject?.completedTasks).toBe(1);
    expect(startedState.activeProject?.completedCriteria).toBe(1);
  });

  it("4. Supports interactive token switching, Explode Layers, and Reset Stage in LiveBlueprintStage", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(React.createElement(LiveBlueprintStage));
    });

    expect(container.textContent).toContain("Let's style that button!");
    expect(container.textContent).toContain("linear-gradient(45deg, #4F6BFF, #A7E3D1)");

    // Click "Explode Layers"
    const buttons = Array.from(container.querySelectorAll("button"));
    const explodeBtn = buttons.find((b) => b.textContent?.includes("Explode Layers"));
    expect(explodeBtn).toBeDefined();

    act(() => {
      explodeBtn?.click();
    });
    expect(container.querySelector('[data-testid="exploded-layers-view"]')).not.toBeNull();

    // Click "Reset Stage"
    const resetBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Reset Stage"),
    );
    act(() => {
      resetBtn?.click();
    });
    expect(container.querySelector('[data-testid="exploded-layers-view"]')).toBeNull();

    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it("5. Resolves light and dark theme preferences accurately", () => {
    expect(resolveTheme("light")).toBe("light");
    expect(resolveTheme("dark")).toBe("dark");
  });
});
