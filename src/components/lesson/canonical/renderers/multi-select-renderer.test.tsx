// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { MultiSelectRenderer } from "./multi-select-renderer";
import type { MultiSelectActivity } from "@/lib/curriculum/types";
import type { ActivityInteractionState } from "../types";

describe("MultiSelectRenderer Experience Redesign", () => {
  const mockActivity: MultiSelectActivity = {
    id: "act-test-observe",
    type: "multi-select",
    intent: "recognition",
    objectiveIds: ["obj-test"],
    content: {
      question: "Which of the following phenomena are directly observable in the network tab?",
      minSelections: 2,
      maxSelections: 3,
      options: [
        { id: "opt-1", text: "HTTP 500 status code returned by /api/save" },
        { id: "opt-2", text: "Response payload contains { error: 'Database timeout' }" },
        { id: "opt-3", text: "Database server ran out of memory" },
        { id: "opt-4", text: "Request latency exceeded 30 seconds" },
      ],
      explanation: "Observable evidence includes status codes, payloads, and measured latency.",
    },
    validation: {
      type: "multi-match",
      expected: ["opt-1", "opt-2", "opt-4"],
    },
  };

  const createInitialState = (
    overrides?: Partial<ActivityInteractionState<string[]>>,
  ): ActivityInteractionState<string[]> => ({
    status: "idle",
    response: [],
    attempts: 0,
    hintsRevealed: 0,
    startedAt: Date.now(),
    ...overrides,
  });

  const renderComponent = (
    activity = mockActivity,
    state = createInitialState(),
    onResponse = vi.fn(),
    onSubmit = vi.fn(),
    onRetry = vi.fn(),
    onContinue = vi.fn(),
  ) => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    let root: Root | null = null;

    act(() => {
      root = createRoot(container);
      root.render(
        <MultiSelectRenderer
          activity={activity}
          state={state}
          onResponse={onResponse}
          onSubmit={onSubmit}
          onRetry={onRetry}
          onContinue={onContinue}
        />,
      );
    });

    return {
      container,
      cleanup: () => {
        act(() => {
          root?.unmount();
        });
        container.remove();
      },
    };
  };

  it("renders dominant investigation question, eyebrow, and candidate items with option markers", () => {
    const { container, cleanup } = renderComponent();

    expect(container.textContent).toContain(
      "Which of the following phenomena are directly observable",
    );
    expect(container.textContent).toContain("Evidence Selection");
    expect(container.textContent).toContain("Select between 2 and 3 items.");

    // Option markers A, B, C, D
    const options = container.querySelectorAll('button[role="checkbox"]');
    expect(options.length).toBe(4);
    expect(container.textContent).toContain("HTTP 500 status code");
    expect(container.textContent).toContain("Response payload contains");
    expect(container.textContent).toContain("Database server ran out of memory");

    cleanup();
  });

  it("renders correct accessible semantics: role='group' and role='checkbox' with aria-checked", () => {
    const state = createInitialState({ response: ["opt-1", "opt-2"] });
    const { container, cleanup } = renderComponent(mockActivity, state);

    const group = container.querySelector('[role="group"]');
    expect(group).not.toBeNull();

    const option1 = container.querySelector("#option-act-test-observe-opt-1");
    const option3 = container.querySelector("#option-act-test-observe-opt-3");

    expect(option1?.getAttribute("aria-checked")).toBe("true");
    expect(option3?.getAttribute("aria-checked")).toBe("false");

    cleanup();
  });

  it("calls onResponse with added ID when unselected option is clicked", () => {
    const onResponse = vi.fn();
    const state = createInitialState({ response: ["opt-1"] });
    const { container, cleanup } = renderComponent(mockActivity, state, onResponse);

    const option2 = container.querySelector("#option-act-test-observe-opt-2") as HTMLButtonElement;
    act(() => {
      option2.click();
    });

    expect(onResponse).toHaveBeenCalledWith(["opt-1", "opt-2"]);
    cleanup();
  });

  it("calls onResponse removing ID when selected option is toggled off", () => {
    const onResponse = vi.fn();
    const state = createInitialState({ response: ["opt-1", "opt-2"] });
    const { container, cleanup } = renderComponent(mockActivity, state, onResponse);

    const option1 = container.querySelector("#option-act-test-observe-opt-1") as HTMLButtonElement;
    act(() => {
      option1.click();
    });

    expect(onResponse).toHaveBeenCalledWith(["opt-2"]);
    cleanup();
  });

  it("shows selection summary strip displaying committed set when items are selected", () => {
    const state = createInitialState({ response: ["opt-1", "opt-4"] });
    const { container, cleanup } = renderComponent(mockActivity, state);

    expect(container.textContent).toContain("Committed Set:");
    expect(container.textContent).toContain("A, D");
    expect(container.textContent).toContain("2 items selected");
    expect(container.textContent).toContain("Ready to evaluate");

    cleanup();
  });

  it("evaluates correctly: distinguishes Verified selections when correct", () => {
    const state = createInitialState({
      status: "correct",
      response: ["opt-1", "opt-2", "opt-4"],
      validationResult: {
        isValid: true,
        feedbackMessage: "All observable evidence correctly chosen!",
      },
    });
    const { container, cleanup } = renderComponent(mockActivity, state);

    expect(container.textContent).toContain("Verified");
    expect(container.textContent).toContain("All observable evidence correctly chosen!");

    cleanup();
  });

  it("evaluates with pedagogical set distinction when incorrect: Valid Member, Does Not Belong, Belonged in Set", () => {
    // opt-1 and opt-3 selected; expected are opt-1, opt-2, opt-4
    // opt-1: selected and expected -> Valid Member
    // opt-3: selected and not expected -> Does Not Belong
    // opt-2: not selected and expected -> Belonged in Set
    const state = createInitialState({
      status: "incorrect",
      response: ["opt-1", "opt-3"],
      validationResult: {
        isValid: false,
        feedbackMessage: "Some selections are not observable facts.",
      },
    });
    const { container, cleanup } = renderComponent(mockActivity, state);

    expect(container.textContent).toContain("Valid Member");
    expect(container.textContent).toContain("Does Not Belong");
    expect(container.textContent).toContain("Belonged in Set");
    expect(container.textContent).toContain("Some selections are not observable facts.");

    cleanup();
  });
});
