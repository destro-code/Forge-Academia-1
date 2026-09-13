// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { CommitmentSurface } from "./commitment-surface";
import { goldenLesson0CanonicalV1 } from "@/lib/curriculum/golden-lesson-v1";
import type { PredictionContentV1 } from "@/lib/curriculum/v1/content-schemas";

function renderComponent(element: React.ReactElement) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root: Root = createRoot(container);
  act(() => root.render(element));
  return {
    container,
    cleanup() {
      act(() => root.unmount());
      container.remove();
    },
  };
}

const predictionActivity = goldenLesson0CanonicalV1.activities.find((a) => a.id === "act-0-1-1-prediction");
if (!predictionActivity) throw new Error("fixture missing prediction activity");
const content = predictionActivity.content as PredictionContentV1;

describe("CommitmentSurface", () => {
  it("keeps the selected option visible and does not show a comparison panel before submission", () => {
    const { container, cleanup } = renderComponent(
      <CommitmentSurface
        title={predictionActivity.title}
        instruction={predictionActivity.instruction}
        content={content}
        status="active"
        response="opt-no-listener"
        onResponse={vi.fn()}
      />,
    );
    expect(container.querySelector('[data-testid="comparison-panel"]')).toBeNull();
    expect(container.textContent).toContain(content.options[0].text);
    cleanup();
  });

  it("shows the comparison panel with the learner's own prediction still visible after a correct result", () => {
    const { container, cleanup } = renderComponent(
      <CommitmentSurface
        title={predictionActivity.title}
        instruction={predictionActivity.instruction}
        content={content}
        status="correct"
        response="opt-no-listener"
        onResponse={vi.fn()}
        validationResult={{ isValid: true, feedbackMessage: "Exactly — no listener was attached." }}
      />,
    );
    const panel = container.querySelector('[data-testid="comparison-panel"]');
    expect(panel).not.toBeNull();
    expect(panel?.textContent).toContain("no click listener attached");
    expect(panel?.textContent).toContain("Exactly");
    // The original chosen option remains visible in the (now read-only) prediction surface too.
    expect(container.textContent).toContain(content.options[0].text);
    cleanup();
  });

  it("uses the warning tone for an incorrect result, not a raw failure look", () => {
    const { container, cleanup } = renderComponent(
      <CommitmentSurface
        title={predictionActivity.title}
        instruction={predictionActivity.instruction}
        content={content}
        status="incorrect"
        response="opt-css-blocking"
        onResponse={vi.fn()}
        validationResult={{ isValid: false, feedbackMessage: "The listener really is missing." }}
      />,
    );
    const panel = container.querySelector('[data-testid="comparison-panel"]');
    expect(panel?.className).toContain("lesson-warning");
    cleanup();
  });
});
