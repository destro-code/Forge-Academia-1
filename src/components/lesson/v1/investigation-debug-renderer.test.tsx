// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { InvestigationDebugRenderer } from "./investigation-debug-renderer";
import { goldenLesson0CanonicalV1 } from "@/lib/curriculum/golden-lesson-v1";
import type { DebugContentV1 } from "@/lib/curriculum/v1/content-schemas";

function renderComponent(element: React.ReactElement) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root: Root = createRoot(container);
  act(() => {
    root.render(element);
  });
  return {
    container,
    cleanup() {
      act(() => root.unmount());
      container.remove();
    },
  };
}

const investigationActivity = goldenLesson0CanonicalV1.activities.find(
  (a) => a.id === "act-0-1-1-investigation",
);
if (!investigationActivity) throw new Error("fixture missing investigation activity");
const content = investigationActivity.content as DebugContentV1;

describe("InvestigationDebugRenderer — V1 investigation semantics", () => {
  it("does not reveal the fix or a diagnosis — only the declared inspection fields, and only after inspecting", () => {
    const { container, cleanup } = renderComponent(
      <InvestigationDebugRenderer
        title={investigationActivity.title}
        instruction={investigationActivity.instruction}
        content={content}
        state={{ status: "idle", response: undefined }}
        onResponse={vi.fn()}
      />,
    );

    // Before inspecting: no evidence surface, no fix/solution text anywhere.
    expect(container.querySelector('[data-testid="evidence-surface"]')).toBeNull();
    expect(container.textContent).not.toContain("addEventListener");
    expect(container.textContent).not.toContain("bug"); // no premature diagnosis language
    cleanup();
  });

  it("reveals only the declared inspection fields as evidence after the learner inspects, and reports the response", () => {
    const onResponse = vi.fn();
    const { container, cleanup } = renderComponent(
      <InvestigationDebugRenderer
        title={investigationActivity.title}
        instruction={investigationActivity.instruction}
        content={content}
        state={{ status: "idle", response: undefined }}
        onResponse={onResponse}
      />,
    );

    const inspectButton = container.querySelector("button");
    expect(inspectButton).not.toBeNull();
    act(() => {
      inspectButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onResponse).toHaveBeenCalledWith({ inspectedElement: "button#save-button" });
    const evidence = container.querySelector('[data-testid="evidence-surface"]');
    expect(evidence).not.toBeNull();
    for (const field of content.inspectionFields) {
      expect(evidence?.textContent).toContain(field);
    }
    cleanup();
  });

  it("does not let a readOnly instance report a new response", () => {
    const onResponse = vi.fn();
    const { container, cleanup } = renderComponent(
      <InvestigationDebugRenderer
        title={investigationActivity.title}
        instruction={investigationActivity.instruction}
        content={content}
        state={{ status: "idle", response: undefined }}
        onResponse={onResponse}
        readOnly
      />,
    );
    const inspectButton = container.querySelector("button") as HTMLButtonElement | null;
    expect(inspectButton?.disabled).toBe(true);
    cleanup();
  });
});
