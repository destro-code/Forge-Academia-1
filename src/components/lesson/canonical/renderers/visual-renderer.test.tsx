// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { VisualRenderer } from "./visual-renderer";
import type { VisualActivity } from "@/lib/curriculum/types";
import type { ActivityInteractionState } from "../types";

describe("VisualRenderer Canonical Learning Experience", () => {
  const mockState: ActivityInteractionState = {
    status: "idle",
    attempts: 0,
    startedAt: Date.now(),
    response: undefined,
    hintsRevealed: 0,
  };

  it("renders structured visualData.nodes ordered by visualData.connections and displays activity description", () => {
    // Exactly matches canonical act-0-1-1-causal-model from lesson-what-is-frontend-development.json
    const activity: VisualActivity = {
      id: "act-0-1-1-causal-model",
      intent: "understanding",
      objectiveIds: ["obj-0-1-1-diagnose"],
      type: "visual",
      content: {
        title: "Follow the Failure",
        visualType: "flowchart",
        description:
          "A simple causal chain showing how a click becomes JavaScript execution and how a missing function causes the expected interface update to fail.",
        visualData: {
          nodes: [
            { id: "click", label: "Click Save Changes" },
            { id: "event", label: "Browser handles the click" },
            { id: "call", label: "JavaScript tries saveChanges()" },
            { id: "missing", label: "saveChanges is not defined" },
            { id: "failure", label: "JavaScript execution fails" },
            { id: "visible", label: "Status never changes" },
          ],
          connections: [
            ["click", "event"],
            ["event", "call"],
            ["call", "missing"],
            ["missing", "failure"],
            ["failure", "visible"],
          ],
        },
      },
    };

    const container = document.createElement("div");
    document.body.appendChild(container);
    let root: Root | null = null;

    act(() => {
      root = createRoot(container);
      root.render(
        <VisualRenderer
          activity={activity}
          state={mockState}
          onResponse={vi.fn()}
          onContinue={vi.fn()}
        />,
      );
    });

    // 1. Title and description must both be rendered
    expect(container.textContent).toContain("Follow the Failure");
    expect(container.textContent).toContain(
      "A simple causal chain showing how a click becomes JavaScript execution",
    );

    // 2. All 6 nodes must be rendered as distinct flow steps
    expect(container.textContent).toContain("Click Save Changes");
    expect(container.textContent).toContain("Browser handles the click");
    expect(container.textContent).toContain("JavaScript tries saveChanges()");
    expect(container.textContent).toContain("saveChanges is not defined");
    expect(container.textContent).toContain("JavaScript execution fails");
    expect(container.textContent).toContain("Status never changes");

    // 3. Ordered list contains 6 items
    const listItems = container.querySelectorAll("ol li");
    expect(listItems.length).toBe(6);

    act(() => {
      root?.unmount();
    });
    container.remove();
  });

  it("splits flow steps using Unicode arrow '→' in description", () => {
    // Matches canonical act-123-visual from lesson-the-cascade-and-inheritance.json
    const activity: VisualActivity = {
      id: "act-123-visual",
      type: "visual",
      intent: "understanding",
      objectiveIds: ["OBJ-CAS-101", "OBJ-CAS-102"],
      content: {
        title: "The Cascade Tiebreaker Algorithm",
        visualType: "flowchart",
        description:
          "Conflict Resolution Order: 1. Importance (!important) → 2. Specificity (Inline > ID > Class > Tag) → 3. Source Order (Last declaration wins). Inheritance flows down text nodes.",
      },
    };

    const container = document.createElement("div");
    document.body.appendChild(container);
    let root: Root | null = null;

    act(() => {
      root = createRoot(container);
      root.render(
        <VisualRenderer
          activity={activity}
          state={mockState}
          onResponse={vi.fn()}
          onContinue={vi.fn()}
        />,
      );
    });

    expect(container.textContent).toContain("The Cascade Tiebreaker Algorithm");

    const listItems = container.querySelectorAll("ol li");
    expect(listItems.length).toBe(3);
    expect(listItems[0].textContent).toContain(
      "Conflict Resolution Order: 1. Importance (!important)",
    );
    expect(listItems[1].textContent).toContain("2. Specificity (Inline > ID > Class > Tag)");
    expect(listItems[2].textContent).toContain("3. Source Order (Last declaration wins)");

    act(() => {
      root?.unmount();
    });
    container.remove();
  });

  it("splits flow steps using ASCII arrow '->' in description", () => {
    const activity: VisualActivity = {
      id: "act-ascii-flow",
      type: "visual",
      intent: "understanding",
      objectiveIds: ["obj-test"],
      content: {
        title: "HTML Parsing Flow",
        visualType: "flowchart",
        description: "Fetch bytes -> Decode characters -> Tokenize -> Build DOM tree",
      },
    };

    const container = document.createElement("div");
    document.body.appendChild(container);
    let root: Root | null = null;

    act(() => {
      root = createRoot(container);
      root.render(
        <VisualRenderer
          activity={activity}
          state={mockState}
          onResponse={vi.fn()}
          onContinue={vi.fn()}
        />,
      );
    });

    const listItems = container.querySelectorAll("ol li");
    expect(listItems.length).toBe(4);
    expect(listItems[0].textContent).toContain("Fetch bytes");
    expect(listItems[1].textContent).toContain("Decode characters");
    expect(listItems[2].textContent).toContain("Tokenize");
    expect(listItems[3].textContent).toContain("Build DOM tree");

    act(() => {
      root?.unmount();
    });
    container.remove();
  });

  it("renders layers when visualData.layers is present", () => {
    const activity: VisualActivity = {
      id: "act-layers-test",
      type: "visual",
      intent: "recognition",
      objectiveIds: ["obj-test"],
      content: {
        title: "DOM Hierarchy",
        visualType: "hierarchy",
        description: "Observe the nesting levels.",
        visualData: {
          layers: [
            { name: "Container", role: "Bounded parent context", analogy: "Outer box" },
            { name: "Card", role: "Child item", analogy: "Inner item" },
          ],
        },
      },
    };

    const container = document.createElement("div");
    document.body.appendChild(container);
    let root: Root | null = null;

    act(() => {
      root = createRoot(container);
      root.render(
        <VisualRenderer
          activity={activity}
          state={mockState}
          onResponse={vi.fn()}
          onContinue={vi.fn()}
        />,
      );
    });

    expect(container.textContent).toContain("DOM Hierarchy");
    expect(container.textContent).toContain("Observe the nesting levels.");
    expect(container.textContent).toContain("Container");
    expect(container.textContent).toContain("Bounded parent context");
    expect(container.textContent).toContain("Card");
    expect(container.textContent).toContain("Child item");

    act(() => {
      root?.unmount();
    });
    container.remove();
  });

  it("renders fallback dashed container when no interactive, layers, or flow steps exist", () => {
    const activity: VisualActivity = {
      id: "act-fallback-test",
      type: "visual",
      intent: "understanding",
      objectiveIds: ["obj-test"],
      content: {
        title: "Conceptual Overview",
        visualType: "diagram",
        description: "A diagram explaining layout flow.",
      },
    };

    const container = document.createElement("div");
    document.body.appendChild(container);
    let root: Root | null = null;

    act(() => {
      root = createRoot(container);
      root.render(
        <VisualRenderer
          activity={activity}
          state={mockState}
          onResponse={vi.fn()}
          onContinue={vi.fn()}
        />,
      );
    });

    expect(container.textContent).toContain("Conceptual Overview");
    expect(container.textContent).toContain("A diagram explaining layout flow.");
    expect(container.querySelector("ol")).toBeNull();

    act(() => {
      root?.unmount();
    });
    container.remove();
  });
});
