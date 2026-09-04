// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from "vitest";
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { CanonicalActivityView } from "../canonical-activity-view";
import type { CanonicalActivity, CanonicalLesson } from "@/lib/curriculum/types";
import type { ActivitySessionState, LessonSessionState } from "@/lib/learning-engine/types";
import type { ExperienceComposition, ExperienceInterpretation } from "./experience-types";
import goldenLessonRaw from "@/data/canonical/lessons/lesson-what-is-frontend-development.json";

const goldenLesson = goldenLessonRaw as unknown as CanonicalLesson;

function getActivity(id: string): CanonicalActivity {
  const activity = goldenLesson.activities.find((a) => a.id === id);
  if (!activity) {
    throw new Error(`Activity with id "${id}" not found in Golden Lesson`);
  }
  return activity;
}

interface RenderActivityViewOptions {
  activity: CanonicalActivity;
  activityState?: ActivitySessionState;
  lesson?: CanonicalLesson;
  lessonState?: LessonSessionState;
  onResponseChange?: (response: unknown) => void;
  onSubmit?: () => void;
  onComplete?: () => void;
  onRequestEvaluation?: () => void;
  onExperienceCompositionChange?: (composition: ExperienceComposition) => void;
  onExperienceInterpretationChange?: (interpretation: ExperienceInterpretation) => void;
}

function renderView(options: RenderActivityViewOptions) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root: Root = createRoot(container);

  act(() => {
    root.render(
      <CanonicalActivityView
        activity={options.activity}
        activityState={options.activityState}
        lesson={options.lesson ?? goldenLesson}
        lessonState={options.lessonState}
        onResponseChange={options.onResponseChange}
        onSubmit={options.onSubmit}
        onComplete={options.onComplete}
        onRequestEvaluation={options.onRequestEvaluation}
        onExperienceCompositionChange={options.onExperienceCompositionChange}
        onExperienceInterpretationChange={options.onExperienceInterpretationChange}
      />,
    );
  });

  return {
    container,
    root,
    cleanup() {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}

describe("Sprint 1 — Change 5: Minimal Experience Layer Integration", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  // --------------------------------------------------------------------------
  // TEST A — Golden Lesson intro
  // --------------------------------------------------------------------------
  it("Test A: Golden Lesson intro (act-0-1-1-intro) derives mode=discover, focalSurface=presentation", () => {
    const activity = getActivity("act-0-1-1-intro");
    let capturedComposition: ExperienceComposition | undefined;
    let capturedInterpretation: ExperienceInterpretation | undefined;

    const { container, cleanup } = renderView({
      activity,
      lesson: goldenLesson,
      onExperienceCompositionChange: (comp) => {
        capturedComposition = comp;
      },
      onExperienceInterpretationChange: (interp) => {
        capturedInterpretation = interp;
      },
    });

    try {
      // Direct presentation metadata verification
      expect(capturedInterpretation).toBeDefined();
      expect(capturedInterpretation?.mode).toBe("discover");
      expect(capturedInterpretation?.focalSurface).toBe("presentation");

      expect(capturedComposition).toBeDefined();
      expect(capturedComposition?.mode).toBe("discover");
      expect(capturedComposition?.focalSurface).toBe("presentation");
      expect(capturedComposition?.spatialMode).toBe("focused");
      expect(capturedComposition?.density).toBe("spacious");

      // Presentation wrapper metadata verification
      const viewElement = container.querySelector('[data-testid="canonical-activity-view"]');
      expect(viewElement).not.toBeNull();
      expect(viewElement?.getAttribute("data-experience-mode")).toBe("discover");
      expect(viewElement?.getAttribute("data-focal-surface")).toBe("presentation");
      expect(viewElement?.getAttribute("data-spatial-mode")).toBe("focused");
      expect(viewElement?.getAttribute("data-density")).toBe("spacious");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // TEST B — Prediction
  // --------------------------------------------------------------------------
  it("Test B: prediction (act-0-1-1-predict) derives mode=predict, focalSurface=interaction", () => {
    const activity = getActivity("act-0-1-1-predict");
    let capturedComposition: ExperienceComposition | undefined;

    const { container, cleanup } = renderView({
      activity,
      lesson: goldenLesson,
      onExperienceCompositionChange: (comp) => {
        capturedComposition = comp;
      },
    });

    try {
      expect(capturedComposition).toBeDefined();
      expect(capturedComposition?.mode).toBe("predict");
      expect(capturedComposition?.focalSurface).toBe("interaction");
      expect(capturedComposition?.primaryAction.intent).toBe("submit");

      const viewElement = container.querySelector('[data-testid="canonical-activity-view"]');
      expect(viewElement?.getAttribute("data-experience-mode")).toBe("predict");
      expect(viewElement?.getAttribute("data-focal-surface")).toBe("interaction");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // TEST C — Interactive manipulation
  // --------------------------------------------------------------------------
  it("Test C: interactive manipulation (act-0-1-1-manipulate) derives mode=interact, focalSurface=editor, spatialMode=split", () => {
    const activity = getActivity("act-0-1-1-manipulate");
    let capturedComposition: ExperienceComposition | undefined;

    const { container, cleanup } = renderView({
      activity,
      lesson: goldenLesson,
      onExperienceCompositionChange: (comp) => {
        capturedComposition = comp;
      },
    });

    try {
      expect(capturedComposition).toBeDefined();
      expect(capturedComposition?.mode).toBe("interact");
      expect(capturedComposition?.focalSurface).toBe("editor");
      expect(capturedComposition?.spatialMode).toBe("split");

      const viewElement = container.querySelector('[data-testid="canonical-activity-view"]');
      expect(viewElement?.getAttribute("data-experience-mode")).toBe("interact");
      expect(viewElement?.getAttribute("data-focal-surface")).toBe("editor");
      expect(viewElement?.getAttribute("data-spatial-mode")).toBe("split");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // TEST D — Failed evaluation
  // --------------------------------------------------------------------------
  it("Test D: failed evaluation derives mode=debug, evaluation surface present, primary action=retry", () => {
    const activity = getActivity("act-0-1-1-predict");
    const failedState: ActivitySessionState = {
      activityId: activity.id,
      status: "failed",
      attempts: 1,
      hintsRevealed: 0,
      lastActiveAt: Date.now(),
      lastEvaluation: {
        activityId: activity.id,
        isValid: false,
        score: 0,
        completed: false,
        feedbackMessage: "The predicted output does not match the actual rendering.",
        evaluatedAt: Date.now(),
      },
    };

    let capturedComposition: ExperienceComposition | undefined;

    const { container, cleanup } = renderView({
      activity,
      activityState: failedState,
      lesson: goldenLesson,
      onExperienceCompositionChange: (comp) => {
        capturedComposition = comp;
      },
    });

    try {
      expect(capturedComposition).toBeDefined();
      expect(capturedComposition?.mode).toBe("debug");

      // Evaluation surface is present
      const evalSurface = capturedComposition?.surfaces.find((s) => s.surface === "evaluation");
      expect(evalSurface).toBeDefined();

      // Primary action is retry
      expect(capturedComposition?.primaryAction.intent).toBe("retry");
      expect(capturedComposition?.primaryAction.kind).toBe("retry");

      // Container metadata reflects debug mode
      const viewElement = container.querySelector('[data-testid="canonical-activity-view"]');
      expect(viewElement?.getAttribute("data-experience-mode")).toBe("debug");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // TEST E — No execution side effects
  // --------------------------------------------------------------------------
  it("Test E: deriving interpretation and composition does NOT execute code, submit, progress, or mutate state", () => {
    const activity = getActivity("act-0-1-1-predict");
    const initialActivityState: ActivitySessionState = {
      activityId: activity.id,
      status: "in-progress",
      attempts: 0,
      hintsRevealed: 0,
      lastActiveAt: 1000,
    };
    // Deep freeze or snapshot the state
    const stateSnapshot = JSON.stringify(initialActivityState);

    const onSubmitMock = vi.fn();
    const onCompleteMock = vi.fn();
    const onRequestEvalMock = vi.fn();

    const { cleanup } = renderView({
      activity,
      activityState: initialActivityState,
      lesson: goldenLesson,
      onSubmit: onSubmitMock,
      onComplete: onCompleteMock,
      onRequestEvaluation: onRequestEvalMock,
    });

    try {
      // Must not trigger submission or progression simply by rendering/deriving
      expect(onSubmitMock).not.toHaveBeenCalled();
      expect(onCompleteMock).not.toHaveBeenCalled();
      expect(onRequestEvalMock).not.toHaveBeenCalled();

      // Must not mutate activity state object
      expect(JSON.stringify(initialActivityState)).toBe(stateSnapshot);
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // TEST F — Canonical rendering remains intact
  // --------------------------------------------------------------------------
  it("Test F: canonical renderer is still called with runtime state and callbacks; not replaced by composition", () => {
    const activity = getActivity("act-0-1-1-intro");
    const onResponseChangeMock = vi.fn();

    const { container, cleanup } = renderView({
      activity,
      lesson: goldenLesson,
      onResponseChange: onResponseChangeMock,
    });

    try {
      // The container has the canonical activity view wrapper with metadata
      const viewElement = container.querySelector('[data-testid="canonical-activity-view"]');
      expect(viewElement).not.toBeNull();

      // The canonical Intro renderer is rendered inside (containing text / header from the intro content)
      expect(container.textContent).toContain("The Button Has Betrayed You");

      // Verify that another activity type (choice) also renders its options cleanly
      cleanup();

      const choiceActivity = getActivity("act-0-1-1-choice");
      const { container: choiceContainer, cleanup: choiceCleanup } = renderView({
        activity: choiceActivity,
        lesson: goldenLesson,
        onResponseChange: onResponseChangeMock,
      });

      try {
        const choiceView = choiceContainer.querySelector('[data-testid="canonical-activity-view"]');
        expect(choiceView).not.toBeNull();
        expect(choiceView?.getAttribute("data-experience-mode")).toBe("practice");

        // The multiple-choice renderer options are rendered in DOM
        const options = choiceContainer.querySelectorAll(
          "input[type='radio'], [role='radio'], button",
        );
        expect(options.length).toBeGreaterThan(0);
      } finally {
        choiceCleanup();
      }
    } finally {
      cleanup();
    }
  });
});
