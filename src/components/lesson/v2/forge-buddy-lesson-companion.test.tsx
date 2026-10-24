// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
  ForgeBuddyLessonCompanion,
  resolveForgeBuddyEvent,
  type ForgeBuddyLessonCompanionProps,
} from "./forge-buddy-lesson-companion";
import { LessonExperience } from "./lesson-experience";
import { goldenLesson0CanonicalV1 } from "@/lib/curriculum/golden-lesson-v1";

function renderComponent(element: React.ReactElement) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root: Root = createRoot(container);
  act(() => root.render(element));
  return {
    container,
    rerender(nextElement: React.ReactElement) {
      act(() => root.render(nextElement));
    },
    cleanup() {
      act(() => root.unmount());
      container.remove();
    },
  };
}

const baseProps: ForgeBuddyLessonCompanionProps = {
  lessonId: "lesson-0-1",
  lessonTitle: "Why Nothing Happened When You Clicked",
  moduleTitle: "Browser Mechanics",
  lessonSummary: "Trace how DOM events wire handlers to elements.",
  stepIndex: 0,
  totalSteps: 5,
  stepTitle: "Predict the Click Outcome",
  activityType: "prediction",
  stepKind: "prediction",
  isInteractive: true,
  status: "idle",
  attempts: 0,
  hints: [
    "Inspect whether addEventListener was ever called on the button.",
    "Check the selector passed to querySelector.",
  ],
  hintsAvailable: 2,
  hintsRevealed: 0,
};

describe("ForgeBuddyLessonCompanion & resolveForgeBuddyEvent", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("1. does not appear on initial lesson load and renders no pill, card, or placeholder", () => {
    const { container, cleanup } = renderComponent(<ForgeBuddyLessonCompanion {...baseProps} />);

    expect(resolveForgeBuddyEvent(baseProps)).toBeNull();
    expect(container.querySelector('[data-testid="forge-buddy-companion"]')).toBeNull();
    expect(container.querySelector('[data-testid="forge-buddy-companion-pill"]')).toBeNull();
    expect(container.textContent).toBe("");
    cleanup();
  });

  it("2. remains hidden during ordinary lesson navigation across steps", () => {
    const { container, rerender, cleanup } = renderComponent(
      <ForgeBuddyLessonCompanion {...baseProps} stepIndex={0} status="idle" />,
    );
    expect(container.querySelector('[data-testid="forge-buddy-companion"]')).toBeNull();

    rerender(
      <ForgeBuddyLessonCompanion
        {...baseProps}
        stepIndex={1}
        stepTitle="Read the System State"
        isInteractive={false}
        status="idle"
      />,
    );
    expect(container.querySelector('[data-testid="forge-buddy-companion"]')).toBeNull();
    expect(container.querySelector('[data-testid="forge-buddy-companion-pill"]')).toBeNull();

    rerender(
      <ForgeBuddyLessonCompanion
        {...baseProps}
        stepIndex={2}
        stepTitle="Completed Step"
        isInteractive={true}
        status="completed"
        isCompleted={true}
      />,
    );
    expect(container.querySelector('[data-testid="forge-buddy-companion"]')).toBeNull();
    cleanup();
  });

  it("3. does not open Forge Buddy after an ordinary correct answer, showing activity feedback only", () => {
    const { container, cleanup } = renderComponent(
      <LessonExperience lesson={goldenLesson0CanonicalV1} />,
    );

    // Initial lesson load (step 0): no Buddy pill or card
    expect(container.querySelector('[data-testid="forge-buddy-companion"]')).toBeNull();
    expect(container.querySelector('[data-testid="forge-buddy-companion-pill"]')).toBeNull();

    // Navigate from step 0 (encounter) to step 1 (prediction) via MovementRail
    const railTabs = Array.from(container.querySelectorAll('[role="tab"]')) as HTMLButtonElement[];
    expect(railTabs.length).toBeGreaterThan(1);
    act(() => {
      railTabs[1].click();
    });

    // After ordinary navigation to step 1: Buddy remains hidden
    expect(container.querySelector('[data-testid="forge-buddy-companion"]')).toBeNull();
    expect(container.querySelector('[data-testid="forge-buddy-companion-pill"]')).toBeNull();

    // Select the correct prediction radio option ("opt-no-listener") on step 1
    const correctRadio = container.querySelector(
      'input[type="radio"][value="opt-no-listener"]',
    ) as HTMLInputElement | null;
    expect(correctRadio).not.toBeNull();
    act(() => {
      correctRadio!.click();
    });

    const checkBtn = Array.from(container.querySelectorAll("button")).find((btn) =>
      btn.textContent?.includes("Check Answer"),
    );
    expect(checkBtn).toBeDefined();
    act(() => {
      checkBtn!.click();
    });

    // Activity's own comparison feedback is shown
    const comparisonPanel = container.querySelector('[data-testid="comparison-panel"]');
    expect(comparisonPanel).not.toBeNull();

    // Forge Buddy remains hidden on an ordinary correct answer
    expect(container.querySelector('[data-testid="forge-buddy-companion"]')).toBeNull();
    expect(container.querySelector('[data-testid="forge-buddy-companion-pill"]')).toBeNull();
    cleanup();
  });

  it("4. shows a contextual speech bubble when the learner answers incorrectly with a misconception, and stays hidden when no activity-specific hint/misconception exists", () => {
    const { container, rerender, cleanup } = renderComponent(
      <ForgeBuddyLessonCompanion
        {...baseProps}
        status="incorrect"
        attempts={1}
        misconceptionNote="A <button> element does not fire custom logic unless a click listener is attached."
        onRevealHint={vi.fn()}
      />,
    );

    const buddy = container.querySelector('[data-testid="forge-buddy-companion"]');
    expect(buddy).not.toBeNull();
    expect(buddy?.getAttribute("data-buddy-event")).toBe("wrong-answer");
    expect(buddy?.textContent).toContain(
      "A <button> element does not fire custom logic unless a click listener is attached.",
    );
    expect(container.querySelector('[data-testid="forge-buddy-reveal-hint"]')).not.toBeNull();

    // When an activity has no explicit hints or misconceptionNote (e.g. Lesson 0-1-2 MCQs),
    // it must NOT hallucinate or fall back to unrelated lesson/module mentor-bank tips.
    rerender(
      <ForgeBuddyLessonCompanion
        {...baseProps}
        lessonId="lesson-0-1-2"
        lessonTitle="The Browser Has a Job"
        status="incorrect"
        attempts={1}
        hints={[]}
        hintsAvailable={0}
        misconceptionNote={undefined}
        hintText={undefined}
        stepError={null}
      />,
    );
    expect(container.querySelector('[data-testid="forge-buddy-companion"]')).toBeNull();
    cleanup();
  });

  it("5. shows Forge Buddy with a relevant, appropriately limited hint when help or a hint is explicitly requested", () => {
    const { container, cleanup } = renderComponent(
      <ForgeBuddyLessonCompanion
        {...baseProps}
        status="idle"
        hintsRevealed={1}
        onRevealHint={vi.fn()}
      />,
    );

    const buddy = container.querySelector('[data-testid="forge-buddy-companion"]');
    expect(buddy).not.toBeNull();
    expect(buddy?.getAttribute("data-buddy-event")).toBe("explicit-hint");
    expect(buddy?.textContent).toContain("Forge Buddy Hint · 1/2");
    expect(buddy?.textContent).toContain(
      "Inspect whether addEventListener was ever called on the button.",
    );
    // Second hint is not revealed until requested
    expect(buddy?.textContent).not.toContain("Check the selector passed to querySelector.");
    cleanup();
  });

  it("6. celebrates a milestone only after the milestone has actually been verified", () => {
    const { container, rerender, cleanup } = renderComponent(
      <ForgeBuddyLessonCompanion
        {...baseProps}
        status="correct"
        isCompleted={true}
        milestoneVerified={false}
      />,
    );

    // Unverified completion must not open Buddy
    expect(container.querySelector('[data-testid="forge-buddy-companion"]')).toBeNull();

    // Verified milestone allows the celebration bubble
    rerender(
      <ForgeBuddyLessonCompanion
        {...baseProps}
        status="correct"
        isCompleted={true}
        milestoneVerified={true}
        milestoneTitle="Event Listener Wiring"
        milestoneMessage="All acceptance checks passed for Event Listener Wiring."
      />,
    );

    const buddy = container.querySelector('[data-testid="forge-buddy-companion"]');
    expect(buddy).not.toBeNull();
    expect(buddy?.getAttribute("data-buddy-event")).toBe("milestone-verified");
    expect(buddy?.textContent).toContain("All acceptance checks passed for Event Listener Wiring.");
    cleanup();
  });

  it("7. allows dismissing the contextual bubble and does not reopen on unrelated rerenders", () => {
    const onDismiss = vi.fn();
    const { container, rerender, cleanup } = renderComponent(
      <ForgeBuddyLessonCompanion
        {...baseProps}
        status="incorrect"
        attempts={1}
        onDismiss={onDismiss}
      />,
    );

    expect(container.querySelector('[data-testid="forge-buddy-companion"]')).not.toBeNull();

    const dismissBtn = container.querySelector(
      '[data-testid="forge-buddy-dismiss"]',
    ) as HTMLButtonElement | null;
    expect(dismissBtn).not.toBeNull();

    act(() => {
      dismissBtn!.click();
    });

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(container.querySelector('[data-testid="forge-buddy-companion"]')).toBeNull();
    expect(container.querySelector('[data-testid="forge-buddy-companion-pill"]')).toBeNull();

    // Unrelated rerenders with same qualifying event state must NOT reopen Buddy
    rerender(
      <ForgeBuddyLessonCompanion
        {...baseProps}
        lessonSummary="Updated summary on rerender"
        status="incorrect"
        attempts={1}
        onDismiss={onDismiss}
      />,
    );
    expect(container.querySelector('[data-testid="forge-buddy-companion"]')).toBeNull();

    // A genuinely new qualifying event (e.g. 2nd wrong attempt) IS allowed to appear
    rerender(
      <ForgeBuddyLessonCompanion
        {...baseProps}
        status="incorrect"
        attempts={2}
        onDismiss={onDismiss}
      />,
    );
    expect(container.querySelector('[data-testid="forge-buddy-companion"]')).not.toBeNull();
    cleanup();
  });

  it("8. never shows Forge Buddy during a timed interview even if wrong answer, hint, or milestone flags are set", () => {
    const { container, rerender, cleanup } = renderComponent(
      <ForgeBuddyLessonCompanion
        {...baseProps}
        isTimedInterview={true}
        status="incorrect"
        attempts={2}
        hintsRevealed={1}
      />,
    );

    expect(container.querySelector('[data-testid="forge-buddy-companion"]')).toBeNull();
    expect(container.querySelector('[data-testid="forge-buddy-companion-pill"]')).toBeNull();

    rerender(
      <ForgeBuddyLessonCompanion
        {...baseProps}
        isTimedInterview={true}
        milestoneVerified={true}
        milestoneTitle="Timed Check"
      />,
    );
    expect(container.querySelector('[data-testid="forge-buddy-companion"]')).toBeNull();
    cleanup();
  });
});
