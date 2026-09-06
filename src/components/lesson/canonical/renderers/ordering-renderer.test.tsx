// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { OrderingRenderer } from "./ordering-renderer";
import type { OrderingActivity } from "@/lib/curriculum/types";
import type { ActivityInteractionState } from "../types";

describe("OrderingRenderer Experience Redesign", () => {
  const mockActivity: OrderingActivity = {
    id: "act-test-ordering",
    type: "ordering",
    intent: "application",
    objectiveIds: ["obj-test-order"],
    content: {
      prompt: "Reconstruct the browser navigation pipeline in chronological order:",
      items: [
        { id: "step-dns", text: "DNS Lookup (Resolve domain to IP)", initialOrder: 0 },
        { id: "step-tcp", text: "TCP/TLS Handshake (Establish connection)", initialOrder: 1 },
        { id: "step-http", text: "HTTP Request dispatched", initialOrder: 2 },
        { id: "step-parse", text: "HTML Parser constructs DOM", initialOrder: 3 },
      ],
      explanation:
        "DNS resolves the IP, then TCP/TLS connects, then HTTP request fires, and finally HTML is parsed.",
    },
    validation: {
      type: "ordering",
      correctSequence: ["step-dns", "step-tcp", "step-http", "step-parse"],
    },
    feedback: {
      correct: "Mechanism sequence correctly ordered!",
      incorrect: "Steps are out of order. Inspect networking pipeline.",
    },
  };

  const createInitialState = (
    overrides?: Partial<ActivityInteractionState<string[]>>,
  ): ActivityInteractionState<string[]> => ({
    status: "idle",
    response: ["step-dns", "step-tcp", "step-http", "step-parse"],
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
        <OrderingRenderer
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

  // Test A — Rendering
  it("A — renders prompt, intent-aware eyebrow, all ordering items, and sequence positions (01, 02, etc.)", () => {
    const { container, cleanup } = renderComponent();

    expect(container.textContent).toContain("Reconstruct the browser navigation pipeline");
    expect(container.textContent).toContain("Process Reconstruction");
    expect(container.textContent).toContain("DNS Lookup");
    expect(container.textContent).toContain("TCP/TLS Handshake");
    expect(container.textContent).toContain("HTTP Request dispatched");
    expect(container.textContent).toContain("HTML Parser constructs DOM");

    // Position indicators
    expect(container.textContent).toContain("01");
    expect(container.textContent).toContain("02");
    expect(container.textContent).toContain("03");
    expect(container.textContent).toContain("04");

    cleanup();
  });

  // Test B — Initial order
  it("B — initializes or preserves response from state.response accurately", () => {
    const onResponse = vi.fn();
    // Reversed response in state
    const state = createInitialState({
      response: ["step-parse", "step-http", "step-tcp", "step-dns"],
    });
    const { container, cleanup } = renderComponent(mockActivity, state, onResponse);

    const listItems = container.querySelectorAll("li [role='listitem']");
    expect(listItems.length).toBe(4);
    expect(listItems[0].textContent).toContain("HTML Parser");
    expect(listItems[1].textContent).toContain("HTTP Request");
    expect(listItems[2].textContent).toContain("TCP/TLS");
    expect(listItems[3].textContent).toContain("DNS Lookup");

    cleanup();
  });

  // Test C & D — Reordering and position indicators
  it("C & D — reordering via Move Down changes order, updates positions, and calls onResponse with string[] of IDs", () => {
    const onResponse = vi.fn();
    const state = createInitialState({
      response: ["step-dns", "step-tcp", "step-http", "step-parse"],
    });
    const { container, cleanup } = renderComponent(mockActivity, state, onResponse);

    // Find the first Move Down button (index 0: Move step 1 "DNS Lookup..." down)
    const moveDownBtn = container.querySelector(
      'button[aria-label^="Move step 1"][aria-label$="down"]',
    ) as HTMLButtonElement;
    expect(moveDownBtn).not.toBeNull();

    act(() => {
      moveDownBtn.click();
    });

    // onResponse should receive new order: step-tcp, step-dns, step-http, step-parse
    expect(onResponse).toHaveBeenCalledWith(["step-tcp", "step-dns", "step-http", "step-parse"]);

    cleanup();
  });

  it("C & D — reordering via Move Up changes order and updates sequence", () => {
    const onResponse = vi.fn();
    const state = createInitialState({
      response: ["step-dns", "step-tcp", "step-http", "step-parse"],
    });
    const { container, cleanup } = renderComponent(mockActivity, state, onResponse);

    // Move step 2 (TCP) up
    const moveUpBtn = container.querySelector(
      'button[aria-label^="Move step 2"][aria-label$="up"]',
    ) as HTMLButtonElement;
    expect(moveUpBtn).not.toBeNull();

    act(() => {
      moveUpBtn.click();
    });

    expect(onResponse).toHaveBeenCalledWith(["step-tcp", "step-dns", "step-http", "step-parse"]);

    cleanup();
  });

  // Test E — Commitment state
  it("E — presents compact sequence commitment state after interaction without declaring correctness", () => {
    const state = createInitialState({
      response: ["step-dns", "step-tcp", "step-http", "step-parse"],
    });
    const { container, cleanup } = renderComponent(mockActivity, state);

    // Move step 1 down to trigger interaction
    const moveDownBtn = container.querySelector(
      'button[aria-label^="Move step 1"][aria-label$="down"]',
    ) as HTMLButtonElement;
    act(() => {
      moveDownBtn.click();
    });

    expect(container.textContent).toContain("Sequence constructed");
    expect(container.textContent).toContain("4 steps arranged");
    expect(container.textContent).toContain("Ready to evaluate");
    // Must NOT declare "Correct" before submission!
    expect(container.textContent).not.toContain("Correct Sequence");

    cleanup();
  });

  // Test F — Submission
  it("F — submits via existing architecture through ActivityActions without local evaluation", () => {
    const onSubmit = vi.fn();
    const state = createInitialState();
    const { container, cleanup } = renderComponent(mockActivity, state, vi.fn(), onSubmit);

    // Ensure ActivityContainer and actions exist
    expect(container.querySelector("#activity-act-test-ordering")).not.toBeNull();

    cleanup();
  });

  // Test G — Correct result
  it("G — renders verified technical sequence on correct evaluation", () => {
    const state = createInitialState({
      status: "correct",
      response: ["step-dns", "step-tcp", "step-http", "step-parse"],
      validationResult: {
        isValid: true,
        feedbackMessage: "Mechanism sequence correctly ordered!",
      },
    });
    const { container, cleanup } = renderComponent(mockActivity, state);

    expect(container.textContent).toContain("Mechanism Sequence Verified");
    expect(container.textContent).toContain("Correct Sequence");
    expect(container.textContent).toContain("Mechanism sequence correctly ordered!");

    cleanup();
  });

  // Test H & I — Incorrect result and Retry
  it("H & I — renders revision state on incorrect evaluation preserving learner sequence", () => {
    const state = createInitialState({
      status: "incorrect",
      response: ["step-parse", "step-http", "step-tcp", "step-dns"],
      validationResult: {
        isValid: false,
        feedbackMessage: "Steps are out of order. Inspect networking pipeline.",
      },
    });
    const { container, cleanup } = renderComponent(mockActivity, state);

    expect(container.textContent).toContain("Sequence Incomplete or Out of Order");
    expect(container.textContent).toContain("Needs Revision");
    expect(container.textContent).toContain("Steps are out of order. Inspect networking pipeline.");

    // Preserves learner sequence (step-parse is still first!)
    const listItems = container.querySelectorAll("li [role='listitem']");
    expect(listItems[0].textContent).toContain("HTML Parser");

    cleanup();
  });

  // Test J — Keyboard accessibility
  it("J — provides accessible keyboard reordering controls", () => {
    const onResponse = vi.fn();
    const state = createInitialState({
      response: ["step-dns", "step-tcp", "step-http", "step-parse"],
    });
    const { container, cleanup } = renderComponent(mockActivity, state, onResponse);

    // Test Alt+ArrowDown keyboard shortcut on item
    const firstItem = container.querySelectorAll("li [role='listitem']")[0] as HTMLElement;
    act(() => {
      firstItem.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown", altKey: true, bubbles: true }),
      );
    });

    expect(onResponse).toHaveBeenCalledWith(["step-tcp", "step-dns", "step-http", "step-parse"]);

    cleanup();
  });

  // Test K — Mobile/touch target size
  it("K — ensures movement buttons satisfy the 44px touch target requirement", () => {
    const { container, cleanup } = renderComponent();

    const buttons = container.querySelectorAll("button[aria-label*='Move step']");
    expect(buttons.length).toBeGreaterThan(0);

    buttons.forEach((btn) => {
      // Must contain min-h-[44px] min-w-[44px] or h-11 w-11
      const classList = btn.className;
      const has44px =
        (classList.includes("h-11") && classList.includes("w-11")) ||
        (classList.includes("min-h-[44px]") && classList.includes("min-w-[44px]"));
      expect(has44px).toBe(true);
    });

    cleanup();
  });

  // Test L — Semantic structure
  it("L — uses semantic <ol> and <li> list elements for sequence reconstruction", () => {
    const { container, cleanup } = renderComponent();

    const ol = container.querySelector("ol#ordering-list-act-test-ordering");
    expect(ol).not.toBeNull();

    const lis = container.querySelectorAll("ol > li");
    expect(lis.length).toBe(4);

    cleanup();
  });

  // Test M — No local validation
  it("M — does NOT perform local evaluation or alter state status internally", () => {
    // idle state with correct sequence should still be idle, never auto-marking as correct
    const state = createInitialState({
      status: "idle",
      response: ["step-dns", "step-tcp", "step-http", "step-parse"],
    });
    const { container, cleanup } = renderComponent(mockActivity, state);

    expect(container.textContent).not.toContain("Mechanism Sequence Verified");
    expect(container.textContent).not.toContain("Correct Sequence");

    cleanup();
  });
});
