// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { CanonicalLessonPlayer } from "./canonical-lesson-player";
import { canonicalProvider } from "@/lib/curriculum/canonical-provider";

describe("Golden Lesson 0-1-1 canonical player", () => {
  it("renders the authored debugging journey without legacy content", () => {
    const lesson = canonicalProvider.getLesson("lesson-0-1-1")!;
    const container = document.createElement("div");
    const root = createRoot(container);
    root.render(<CanonicalLessonPlayer lesson={lesson} />);
    expect(container.textContent).toContain("The Button Has Betrayed You");
    expect(container.textContent).toContain("Account settings, apparently saved");
    expect(container.textContent).toContain("1 / 15");
    expect(container.textContent).not.toContain("The Frontend Triad");
    root.unmount();
  });
});
