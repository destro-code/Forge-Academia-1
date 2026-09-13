// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MultiSelectSurface } from "./multi-select-surface";
import { OrderingSurface } from "./ordering-surface";
import { FillBlankSurface } from "./fill-blank-surface";

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

describe("MultiSelectSurface", () => {
  const content = {
    question: "Which apply?",
    options: [
      { id: "o1", text: "First" },
      { id: "o2", text: "Second" },
      { id: "o3", text: "Third" },
    ],
  };

  it("keeps prior selections visible (checked) as more are added, without revealing correctness", () => {
    const onResponse = vi.fn();
    const { container, cleanup } = renderComponent(
      <MultiSelectSurface title="t" content={content} status="active" response={["o1"]} onResponse={onResponse} />,
    );
    const checkboxes = container.querySelectorAll('input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
    expect(checkboxes[0].checked).toBe(true);
    expect(checkboxes[1].checked).toBe(false);
    expect(container.querySelector('[data-testid="comparison-panel"]')).toBeNull();

    act(() => checkboxes[1].dispatchEvent(new Event("change", { bubbles: true })));
    expect(onResponse).toHaveBeenCalledWith(["o1", "o2"]);
    cleanup();
  });

  it("locks selections and shows the comparison panel once resolved", () => {
    const { container, cleanup } = renderComponent(
      <MultiSelectSurface
        title="t"
        content={content}
        status="correct"
        response={["o1", "o2"]}
        onResponse={vi.fn()}
        validationResult={{ isValid: true, feedbackMessage: "That's the full set." }}
      />,
    );
    const fieldset = container.querySelector("fieldset") as HTMLFieldSetElement;
    expect(fieldset.disabled).toBe(true);
    const panel = container.querySelector('[data-testid="comparison-panel"]');
    expect(panel?.textContent).toContain("First");
    expect(panel?.textContent).toContain("Second");
    cleanup();
  });
});

describe("OrderingSurface", () => {
  const content = {
    prompt: "Put these in order",
    items: [
      { id: "i1", text: "Alpha" },
      { id: "i2", text: "Beta" },
      { id: "i3", text: "Gamma" },
    ],
  };

  it("preserves the learner's sequence and moving an item up/down updates the reported response", () => {
    const onResponse = vi.fn();
    const { container, cleanup } = renderComponent(
      <OrderingSurface title="t" content={content} status="active" response={["i1", "i2", "i3"]} onResponse={onResponse} />,
    );
    const items = container.querySelectorAll("li");
    expect(items[0].textContent).toContain("Alpha");

    const firstDownButton = items[0].querySelectorAll("button")[1];
    act(() => firstDownButton.dispatchEvent(new MouseEvent("click", { bubbles: true })));
    expect(onResponse).toHaveBeenCalledWith(["i2", "i1", "i3"]);
    cleanup();
  });

  it("disables the up button for the first item and the down button for the last (keyboard-operable, no drag required)", () => {
    const { container, cleanup } = renderComponent(
      <OrderingSurface title="t" content={content} status="active" response={["i1", "i2", "i3"]} onResponse={vi.fn()} />,
    );
    const items = container.querySelectorAll("li");
    const firstUp = items[0].querySelectorAll("button")[0] as HTMLButtonElement;
    const lastDown = items[2].querySelectorAll("button")[1] as HTMLButtonElement;
    expect(firstUp.disabled).toBe(true);
    expect(lastDown.disabled).toBe(true);
    cleanup();
  });
});

describe("FillBlankSurface", () => {
  const content = {
    prompt: "Complete the statement",
    template: "The {{part1}} calls {{part2}} when clicked.",
    blanks: [{ id: "part1" }, { id: "part2" }],
  };

  it("preserves the learner's typed attempt after an incorrect result (never cleared)", () => {
    const { container, cleanup } = renderComponent(
      <FillBlankSurface
        title="t"
        content={content}
        status="incorrect"
        response={{ part1: "listener", part2: "handler" }}
        onResponse={vi.fn()}
        validationResult={{ isValid: false, feedbackMessage: "Not quite." }}
      />,
    );
    const inputs = container.querySelectorAll("input") as NodeListOf<HTMLInputElement>;
    expect(inputs[0].value).toBe("listener");
    expect(inputs[1].value).toBe("handler");
    // inputs are disabled once resolved, but the values are still visible, not cleared
    expect(inputs[0].disabled).toBe(true);
    cleanup();
  });

  it("reports updated values while active and not yet resolved", () => {
    const onResponse = vi.fn();
    const { container, cleanup } = renderComponent(
      <FillBlankSurface title="t" content={content} status="active" response={{}} onResponse={onResponse} />,
    );
    const inputs = container.querySelectorAll("input") as NodeListOf<HTMLInputElement>;
    act(() => {
      inputs[0].value = "click";
      inputs[0].dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect(onResponse).toHaveBeenCalledWith({ part1: "click" });
    cleanup();
  });
});
