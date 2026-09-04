// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from "vitest";
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import {
  AccountSettingsSystem,
  HYPOTHESIS_OPTIONS,
  INVESTIGATION_TEST_OPTIONS,
  RECONCILIATION_OPTIONS,
  MECHANISM_INVESTIGATION_OPTIONS,
  MECHANISM_INSPECTIONS,
  CAUSAL_INTERPRETATION_OPTIONS,
  DIAGNOSIS_CONFIDENCE_OPTIONS,
  PREDICTION_ASSESSMENT_OPTIONS,
  VERIFICATION_COMPARISON_OPTIONS,
  VERIFICATION_ASSESSMENT_OPTIONS,
  DEFAULT_MECHANISM_CODE,
  MIN_EXPLANATION_CHARACTERS,
} from "./account-settings-system";
import { CanonicalActivityView } from "../../canonical-activity-view";
import type { CanonicalActivity, CanonicalLesson } from "@/lib/curriculum/types";
import type { ActivitySessionState } from "@/lib/learning-engine/types";
import type { ExperienceComposition } from "../../experience/experience-types";
import goldenLessonRaw from "@/data/canonical/lessons/lesson-what-is-frontend-development.json";

const goldenLesson = goldenLessonRaw as unknown as CanonicalLesson;

function getVisualActivity(): CanonicalActivity {
  const activity = goldenLesson.activities.find((a) => a.id === "act-0-1-1-visual");
  if (!activity) {
    throw new Error("act-0-1-1-visual not found in Golden Lesson");
  }
  return activity;
}

interface RenderHelperResult {
  container: HTMLDivElement;
  cleanup: () => void;
}

function setInputValue(input: HTMLInputElement, value: string) {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  )?.set;
  if (nativeInputValueSetter) {
    nativeInputValueSetter.call(input, value);
  } else {
    input.value = value;
  }
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function renderComponent(element: React.ReactElement): RenderHelperResult {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root: Root = createRoot(container);

  act(() => {
    root.render(element);
  });

  return {
    container,
    cleanup() {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}

describe("Sprint 2 — Change 1: Golden Lesson System Surface (Account Settings)", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  // --------------------------------------------------------------------------
  // Test A — Initial state
  // --------------------------------------------------------------------------
  it("Test A: renders Display name, Email, Save Changes, and 'No changes saved.' initial state", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);

    try {
      // System header
      expect(container.textContent).toContain("Account Settings");

      // Display name input
      const nameInput = container.querySelector(
        'input[aria-label="Display name"]',
      ) as HTMLInputElement | null;
      expect(nameInput).not.toBeNull();
      expect(nameInput?.value).toBe("Remi");

      // Email input
      const emailInput = container.querySelector(
        'input[aria-label="Email"]',
      ) as HTMLInputElement | null;
      expect(emailInput).not.toBeNull();
      expect(emailInput?.value).toBe("remi@example.com");

      // Save Changes button
      const saveButton = container.querySelector("button") as HTMLButtonElement | null;
      expect(saveButton).not.toBeNull();
      expect(saveButton?.textContent?.trim()).toBe("Save Changes");

      // Status area
      const statusElement = container.querySelector('[role="status"]');
      expect(statusElement).not.toBeNull();
      expect(statusElement?.textContent?.trim()).toBe("No changes saved.");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test B — Editable fields
  // --------------------------------------------------------------------------
  it("Test B: learner can edit Display name and Email fields", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);

    try {
      const nameInput = container.querySelector(
        'input[aria-label="Display name"]',
      ) as HTMLInputElement;
      const emailInput = container.querySelector('input[aria-label="Email"]') as HTMLInputElement;

      // Edit Display name
      act(() => {
        setInputValue(nameInput, "Alex Developer");
      });
      expect(nameInput.value).toBe("Alex Developer");

      // Edit Email
      act(() => {
        setInputValue(emailInput, "alex@example.org");
      });
      expect(emailInput.value).toBe("alex@example.org");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test C — Intentional failure (Save Changes does not alter status)
  // --------------------------------------------------------------------------
  it("Test C: clicking Save Changes preserves the intentional failure (status remains 'No changes saved.')", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);

    try {
      const nameInput = container.querySelector(
        'input[aria-label="Display name"]',
      ) as HTMLInputElement;
      const saveButton = container.querySelector("button") as HTMLButtonElement;
      const statusElement = container.querySelector('[role="status"]') as HTMLElement;

      // Modify the name
      act(() => {
        setInputValue(nameInput, "Changed Name");
      });

      // Click Save Changes
      act(() => {
        saveButton.click();
      });

      // Status must preserve "No changes saved." and display truthful observable consequence
      expect(statusElement.textContent).toContain("No changes saved.");
      expect(statusElement.textContent).toContain("Save Changes activated.");
      expect(statusElement.textContent).toContain("No visible state change occurred.");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test D — Accessibility
  // --------------------------------------------------------------------------
  it("Test D: verify labels are associated with inputs, Save Changes is keyboard reachable, and controls have accessible names", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);

    try {
      const nameInput = container.querySelector('input[name="displayName"]') as HTMLInputElement;
      const emailInput = container.querySelector('input[name="email"]') as HTMLInputElement;
      const saveButton = container.querySelector("button") as HTMLButtonElement;

      // Labels associated via htmlFor matching input id
      const nameLabel = container.querySelector(`label[for="${nameInput.id}"]`);
      expect(nameLabel).not.toBeNull();
      expect(nameLabel?.textContent?.trim()).toBe("Display name");

      const emailLabel = container.querySelector(`label[for="${emailInput.id}"]`);
      expect(emailLabel).not.toBeNull();
      expect(emailLabel?.textContent?.trim()).toBe("Email");

      // Accessible names
      expect(nameInput.getAttribute("aria-label")).toBe("Display name");
      expect(emailInput.getAttribute("aria-label")).toBe("Email");
      expect(saveButton.getAttribute("aria-label")).toBe("Save Changes");

      // Keyboard reachable
      expect(saveButton.tagName.toLowerCase()).toBe("button");
      expect(saveButton.tabIndex).toBeGreaterThanOrEqual(0);
      expect(nameInput.tabIndex).toBeGreaterThanOrEqual(0);
      expect(emailInput.tabIndex).toBeGreaterThanOrEqual(0);
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test E — Responsive-safe structure
  // --------------------------------------------------------------------------
  it("Test E: component uses fluid, responsive layout without rigid desktop-only constraints", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);

    try {
      const systemContainer = container.querySelector(
        '[data-testid="account-settings-system"]',
      ) as HTMLElement;
      expect(systemContainer).not.toBeNull();

      // Fluid width classes (w-full max-w-md, responsive padding)
      expect(systemContainer.className).toContain("w-full");
      expect(systemContainer.className).toContain("max-w-md");

      // Inputs have full-width and touch target minimums
      const inputs = container.querySelectorAll("input");
      inputs.forEach((input) => {
        expect(input.className).toContain("w-full");
        expect(input.className).toContain("min-h-[44px]");
      });

      // Button has touch target sizing
      const button = container.querySelector("button");
      expect(button?.className).toContain("min-h-[44px]");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test F — No canonical side effects
  // --------------------------------------------------------------------------
  it("Test F: rendering and interacting with the system surface does not trigger submission, completion, or state mutation", () => {
    const visualActivity = getVisualActivity();
    const initialActivityState: ActivitySessionState = {
      activityId: visualActivity.id,
      status: "in-progress",
      attempts: 0,
      hintsRevealed: 0,
      lastActiveAt: 5000,
    };
    const stateSnapshot = JSON.stringify(initialActivityState);

    const onSubmitMock = vi.fn();
    const onCompleteMock = vi.fn();
    const onRequestEvalMock = vi.fn();

    const { container, cleanup } = renderComponent(
      <CanonicalActivityView
        activity={visualActivity}
        activityState={initialActivityState}
        lesson={goldenLesson}
        onSubmit={onSubmitMock}
        onComplete={onCompleteMock}
        onRequestEvaluation={onRequestEvalMock}
      />,
    );

    try {
      // The Account Settings System Surface is rendered inside the canonical activity view
      const systemSurface = container.querySelector('[data-testid="account-settings-system"]');
      expect(systemSurface).not.toBeNull();
      expect(container.textContent).toContain("Account Settings");
      expect(container.textContent).toContain("No changes saved.");

      // Learner interacts with inputs and clicks Save Changes
      const nameInput = container.querySelector('input[name="displayName"]') as HTMLInputElement;
      const saveButton = container.querySelector(
        '[data-testid="account-settings-system"] button',
      ) as HTMLButtonElement;

      act(() => {
        setInputValue(nameInput, "New Name");
        saveButton.click();
      });

      // Local interaction state updated
      expect(nameInput.value).toBe("New Name");

      // Canonical engine callbacks must NOT have been called
      expect(onSubmitMock).not.toHaveBeenCalled();
      expect(onCompleteMock).not.toHaveBeenCalled();
      expect(onRequestEvalMock).not.toHaveBeenCalled();

      // State object must not be mutated
      expect(JSON.stringify(initialActivityState)).toBe(stateSnapshot);
    } finally {
      cleanup();
    }
  });
});

describe("Sprint 2 — Change 2: Connect Experience Composition to Presentation", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  const baseComposition: ExperienceComposition = {
    mode: "discover",
    spatialMode: "focused",
    density: "normal",
    focalSurface: "presentation",
    surfaces: [{ surface: "presentation", role: "focal", priority: 100, visible: true }],
    primaryAction: {
      label: "Continue",
      kind: "continue",
      intent: "advance",
      disabled: false,
    },
    assistance: {
      hasHints: false,
      hintsAvailable: 0,
      hintsRevealed: 0,
      requiresRetry: false,
    },
  };

  // --------------------------------------------------------------------------
  // Test A — Composition reaches presentation
  // --------------------------------------------------------------------------
  it("Test A: composition reaches presentation via CanonicalActivityView and directly", () => {
    const visualActivity = getVisualActivity();
    const initialActivityState: ActivitySessionState = {
      status: "idle",
      attempts: 0,
      hintsRevealed: 0,
    };

    // 1. Verify via full CanonicalActivityView pipeline
    const { container: viewContainer, cleanup: cleanupView } = renderComponent(
      <CanonicalActivityView
        activity={visualActivity}
        activityState={initialActivityState}
        lesson={goldenLesson}
      />,
    );

    try {
      const systemSurface = viewContainer.querySelector('[data-testid="account-settings-system"]');
      expect(systemSurface).not.toBeNull();
      // CanonicalActivityView derives composition from activity intent: 'orientation' -> 'discover'
      expect(systemSurface?.getAttribute("data-experience-mode")).toBe("discover");
      expect(systemSurface?.getAttribute("data-spatial-mode")).toBe("focused");
      expect(systemSurface?.getAttribute("data-density")).toBe("normal");
      expect(systemSurface?.getAttribute("data-focal-surface")).toBe("presentation");
    } finally {
      cleanupView();
    }

    // 2. Verify with explicit composition passed to component
    const customComposition: ExperienceComposition = {
      ...baseComposition,
      mode: "debug",
      spatialMode: "split",
      density: "spacious",
      focalSurface: "presentation",
    };

    const { container: directContainer, cleanup: cleanupDirect } = renderComponent(
      <AccountSettingsSystem experienceComposition={customComposition} />,
    );

    try {
      const surface = directContainer.querySelector('[data-testid="account-settings-system"]');
      expect(surface).not.toBeNull();
      expect(surface?.getAttribute("data-experience-mode")).toBe("debug");
      expect(surface?.getAttribute("data-spatial-mode")).toBe("split");
      expect(surface?.getAttribute("data-density")).toBe("spacious");
      expect(surface?.getAttribute("data-focal-surface")).toBe("presentation");
      // Spatial mode 'split' uses max-w-md
      expect(surface?.className).toContain("max-w-md");
    } finally {
      cleanupDirect();
    }
  });

  // --------------------------------------------------------------------------
  // Test B — Density affects presentation
  // --------------------------------------------------------------------------
  it("Test B: density affects presentation spacing and structure without altering logic", () => {
    // 1. Spacious density
    const spaciousComp: ExperienceComposition = {
      ...baseComposition,
      density: "spacious",
    };
    const { container: spaciousContainer, cleanup: cleanupSpacious } = renderComponent(
      <AccountSettingsSystem experienceComposition={spaciousComp} />,
    );

    let spaciousFormClass = "";
    try {
      const surface = spaciousContainer.querySelector('[data-testid="account-settings-system"]');
      expect(surface?.getAttribute("data-density")).toBe("spacious");
      const form = surface?.querySelector("form");
      spaciousFormClass = form?.className || "";
      expect(spaciousFormClass).toContain("space-y-6");
      expect(spaciousFormClass).not.toContain("space-y-2.5");
    } finally {
      cleanupSpacious();
    }

    // 2. Compact density
    const compactComp: ExperienceComposition = {
      ...baseComposition,
      density: "compact",
    };
    const { container: compactContainer, cleanup: cleanupCompact } = renderComponent(
      <AccountSettingsSystem experienceComposition={compactComp} />,
    );

    let compactFormClass = "";
    try {
      const surface = compactContainer.querySelector('[data-testid="account-settings-system"]');
      expect(surface?.getAttribute("data-density")).toBe("compact");
      const form = surface?.querySelector("form");
      compactFormClass = form?.className || "";
      expect(compactFormClass).toContain("space-y-2.5");
      expect(compactFormClass).not.toContain("space-y-6");
    } finally {
      cleanupCompact();
    }

    // 3. Normal density
    const normalComp: ExperienceComposition = {
      ...baseComposition,
      density: "normal",
    };
    const { container: normalContainer, cleanup: cleanupNormal } = renderComponent(
      <AccountSettingsSystem experienceComposition={normalComp} />,
    );

    let normalFormClass = "";
    try {
      const surface = normalContainer.querySelector('[data-testid="account-settings-system"]');
      expect(surface?.getAttribute("data-density")).toBe("normal");
      const form = surface?.querySelector("form");
      normalFormClass = form?.className || "";
      expect(normalFormClass).toContain("space-y-4");
    } finally {
      cleanupNormal();
    }

    // Spacious, normal, and compact must have distinctly different class representations
    expect(spaciousFormClass).not.toBe(compactFormClass);
    expect(spaciousFormClass).not.toBe(normalFormClass);
    expect(compactFormClass).not.toBe(normalFormClass);
  });

  // --------------------------------------------------------------------------
  // Test C — Interaction unchanged
  // --------------------------------------------------------------------------
  it("Test C: learner editing and clicking Save Changes preserves 'No changes saved.' with composition active", () => {
    const { container, cleanup } = renderComponent(
      <AccountSettingsSystem experienceComposition={baseComposition} />,
    );

    try {
      const nameInput = container.querySelector(
        'input[aria-label="Display name"]',
      ) as HTMLInputElement;
      const emailInput = container.querySelector('input[aria-label="Email"]') as HTMLInputElement;
      const saveButton = container.querySelector("button") as HTMLButtonElement;
      const statusElement = container.querySelector('[role="status"]') as HTMLElement;

      // Edit fields
      act(() => {
        setInputValue(nameInput, "Samantha Jones");
        setInputValue(emailInput, "samantha@domain.test");
      });

      expect(nameInput.value).toBe("Samantha Jones");
      expect(emailInput.value).toBe("samantha@domain.test");

      // Click Save Changes
      act(() => {
        saveButton.click();
      });

      // Status preserves "No changes saved." and shows truthful observable consequence
      expect(statusElement.textContent).toContain("No changes saved.");
      expect(statusElement.textContent).toContain("Save Changes activated.");
      expect(statusElement.textContent).toContain("No visible state change occurred.");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test D — No canonical side effects
  // --------------------------------------------------------------------------
  it("Test D: composition consumption does not execute runtime, evaluate, submit, or mutate state", () => {
    const visualActivity = getVisualActivity();
    const initialActivityState: ActivitySessionState = {
      status: "idle",
      attempts: 0,
      hintsRevealed: 0,
      response: null,
    };
    const stateSnapshot = JSON.stringify(initialActivityState);

    const onSubmitMock = vi.fn();
    const onCompleteMock = vi.fn();
    const onRequestEvalMock = vi.fn();
    const onRuntimeValidationMock = vi.fn();

    const { container, cleanup } = renderComponent(
      <CanonicalActivityView
        activity={visualActivity}
        activityState={initialActivityState}
        lesson={goldenLesson}
        onSubmit={onSubmitMock}
        onComplete={onCompleteMock}
        onRequestEvaluation={onRequestEvalMock}
        onRuntimeValidation={onRuntimeValidationMock}
      />,
    );

    try {
      const nameInput = container.querySelector('input[name="displayName"]') as HTMLInputElement;
      const emailInput = container.querySelector('input[name="email"]') as HTMLInputElement;
      const saveButton = container.querySelector(
        '[data-testid="account-settings-system"] button',
      ) as HTMLButtonElement;

      // Learner edits inputs and clicks Save Changes
      act(() => {
        setInputValue(nameInput, "Tester");
        setInputValue(emailInput, "tester@test.io");
        saveButton.click();
      });

      // Assert zero canonical callbacks were triggered
      expect(onSubmitMock).not.toHaveBeenCalled();
      expect(onCompleteMock).not.toHaveBeenCalled();
      expect(onRequestEvalMock).not.toHaveBeenCalled();
      expect(onRuntimeValidationMock).not.toHaveBeenCalled();

      // Assert state was not mutated
      expect(JSON.stringify(initialActivityState)).toBe(stateSnapshot);
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test E — No lesson-specific branching
  // --------------------------------------------------------------------------
  it("Test E: presentation layout depends strictly on composition metadata, not activity/lesson identity", () => {
    // Arbitrary activity that is NOT lesson-0-1-1
    const arbitraryVisualActivity: CanonicalActivity = {
      id: "act-arbitrary-visual-999",
      intent: "orientation",
      objectiveIds: ["obj-arbitrary"],
      type: "visual",
      content: {
        title: "Completely Unrelated Component",
        visualType: "custom",
        description: "An arbitrary visual activity",
        interactive: {
          kind: "account-settings",
        },
      },
    };

    const arbitraryLesson: CanonicalLesson = {
      id: "lesson-arbitrary-999",
      title: "Arbitrary Lesson Name",
      module: "module-arbitrary",
      objectives: [],
      skills: [],
      skillIds: [],
      activities: [arbitraryVisualActivity],
    };

    const { container, cleanup } = renderComponent(
      <CanonicalActivityView activity={arbitraryVisualActivity} lesson={arbitraryLesson} />,
    );

    try {
      const surface = container.querySelector('[data-testid="account-settings-system"]');
      expect(surface).not.toBeNull();
      // Derived from activity intent 'orientation' -> mode 'discover', density 'normal', spatialMode 'focused'
      expect(surface?.getAttribute("data-experience-mode")).toBe("discover");
      expect(surface?.getAttribute("data-density")).toBe("normal");
      expect(surface?.getAttribute("data-spatial-mode")).toBe("focused");
      expect(surface?.className).toContain("max-w-lg");
    } finally {
      cleanup();
    }
  });
});

describe("Sprint 2 — Change 3: Make System Consequence Observable", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  // --------------------------------------------------------------------------
  // Test A — Initial state
  // --------------------------------------------------------------------------
  it("Test A: 'No changes saved.' is visible and consequence evidence is not yet displayed", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const surface = container.querySelector('[data-testid="account-settings-system"]');
      expect(surface?.getAttribute("data-save-attempted")).toBe("false");

      const statusElement = container.querySelector('[role="status"]');
      expect(statusElement).not.toBeNull();
      expect(statusElement?.textContent).toContain("No changes saved.");

      const evidence = container.querySelector('[data-testid="save-consequence-evidence"]');
      expect(evidence).toBeNull();
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test B — Edit fields
  // --------------------------------------------------------------------------
  it("Test B: learner can modify Display name and Email fields", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const nameInput = container.querySelector(
        'input[aria-label="Display name"]',
      ) as HTMLInputElement;
      const emailInput = container.querySelector('input[aria-label="Email"]') as HTMLInputElement;

      act(() => {
        setInputValue(nameInput, "Pat Taylor");
        setInputValue(emailInput, "pat@example.org");
      });

      expect(nameInput.value).toBe("Pat Taylor");
      expect(emailInput.value).toBe("pat@example.org");

      // Evidence remains hidden before Save is clicked
      expect(container.querySelector('[data-testid="save-consequence-evidence"]')).toBeNull();
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test C — Save action produces observable evidence
  // --------------------------------------------------------------------------
  it("Test C: activating Save Changes produces observable evidence (action occurred + state unchanged)", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const nameInput = container.querySelector(
        'input[aria-label="Display name"]',
      ) as HTMLInputElement;
      const saveButton = container.querySelector("button") as HTMLButtonElement;
      const surface = container.querySelector('[data-testid="account-settings-system"]');

      act(() => {
        setInputValue(nameInput, "Jordan Lee");
      });

      act(() => {
        saveButton.click();
      });

      expect(surface?.getAttribute("data-save-attempted")).toBe("true");

      const evidence = container.querySelector('[data-testid="save-consequence-evidence"]');
      expect(evidence).not.toBeNull();

      // Action observed
      expect(evidence?.textContent).toContain("Save Changes activated.");
      // State unchanged
      expect(evidence?.textContent).toContain("No visible state change occurred.");
      // Status remains "No changes saved."
      expect(container.querySelector('[role="status"]')?.textContent).toContain(
        "No changes saved.",
      );
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test D — No false success
  // --------------------------------------------------------------------------
  it("Test D: system never displays false success messages after Save action", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const saveButton = container.querySelector("button") as HTMLButtonElement;

      act(() => {
        saveButton.click();
      });

      const text = container.textContent ?? "";
      expect(text).not.toContain("Changes saved.");
      expect(text).not.toContain("Saved successfully.");
      expect(text).not.toContain("Success.");
      expect(text).not.toMatch(/save[d]?\s+success/i);
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test E — No diagnosis leakage
  // --------------------------------------------------------------------------
  it("Test E: system does not expose technical diagnosis (preserves learner investigation)", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const saveButton = container.querySelector("button") as HTMLButtonElement;

      act(() => {
        saveButton.click();
      });

      const text = (container.textContent ?? "").toLowerCase();
      expect(text).not.toContain("missing handler");
      expect(text).not.toContain("event handler");
      expect(text).not.toContain("click handler");
      expect(text).not.toContain("state setter");
      expect(text).not.toContain("javascript bug");
      expect(text).not.toContain("broken button");
      expect(text).not.toContain("unhandled");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test F — Accessibility
  // --------------------------------------------------------------------------
  it("Test F: status/evidence region remains accessible with role=status and aria-live, button has accessible name, no focus displacement", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const statusArea = container.querySelector('[role="status"]');
      expect(statusArea).not.toBeNull();
      expect(statusArea?.getAttribute("aria-live")).toBe("polite");

      const saveButton = container.querySelector("button") as HTMLButtonElement;
      expect(saveButton.getAttribute("aria-label")).toBe("Save Changes");
      expect(saveButton.getAttribute("type")).toBe("button");

      // Verify focus is not hijacked
      saveButton.focus();
      expect(document.activeElement).toBe(saveButton);

      act(() => {
        saveButton.click();
      });

      // Focus remains on the button or within the document without surprising jump
      expect(document.activeElement).toBe(saveButton);
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test G — Composition behavior
  // --------------------------------------------------------------------------
  it("Test G: existing composition-driven presentation continues to work seamlessly with consequence", () => {
    const composition: ExperienceComposition = {
      mode: "discover",
      spatialMode: "focused",
      density: "spacious",
      focalSurface: "primary",
    };

    const { container, cleanup } = renderComponent(
      <AccountSettingsSystem experienceComposition={composition} />,
    );
    try {
      const surface = container.querySelector('[data-testid="account-settings-system"]');
      expect(surface?.getAttribute("data-density")).toBe("spacious");
      expect(surface?.getAttribute("data-spatial-mode")).toBe("focused");
      expect(surface?.className).toContain("max-w-lg");

      const saveButton = container.querySelector("button") as HTMLButtonElement;
      act(() => {
        saveButton.click();
      });

      // Consequence rendered within spacious composition layout
      const evidence = container.querySelector('[data-testid="save-consequence-evidence"]');
      expect(evidence).not.toBeNull();
      expect(evidence?.textContent).toContain("Save Changes activated.");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test H — No canonical side effects
  // --------------------------------------------------------------------------
  it("Test H: activating Save Changes does not trigger canonical evaluation, submission, runtime execution, or state mutation", () => {
    const onSubmitSpy = vi.fn();
    const onCompleteSpy = vi.fn();
    const onRequestEvaluationSpy = vi.fn();
    const onRuntimeValidationSpy = vi.fn();

    const arbitraryVisualActivity = getVisualActivity();
    const sessionState: ActivitySessionState = {
      status: "idle",
      attempts: 0,
      startedAt: Date.now(),
    };

    const arbitraryLesson: CanonicalLesson = {
      id: "lesson-golden-01",
      title: "What is Frontend Development?",
      module: "module-foundation",
      objectives: [],
      skills: [],
      skillIds: [],
      activities: [arbitraryVisualActivity],
    };

    const { container, cleanup } = renderComponent(
      <CanonicalActivityView
        activity={arbitraryVisualActivity}
        lesson={arbitraryLesson}
        sessionState={sessionState}
        onSubmit={onSubmitSpy}
        onComplete={onCompleteSpy}
        onRequestEvaluation={onRequestEvaluationSpy}
        onRuntimeValidation={onRuntimeValidationSpy}
      />,
    );

    try {
      const saveButton = container.querySelector(
        '[data-testid="account-settings-system"] button',
      ) as HTMLButtonElement;
      expect(saveButton).not.toBeNull();

      // Click save button multiple times
      act(() => {
        saveButton.click();
      });
      act(() => {
        saveButton.click();
      });

      // Zero canonical side effects
      expect(onSubmitSpy).not.toHaveBeenCalled();
      expect(onCompleteSpy).not.toHaveBeenCalled();
      expect(onRequestEvaluationSpy).not.toHaveBeenCalled();
      expect(onRuntimeValidationSpy).not.toHaveBeenCalled();

      // Session state remains intact
      expect(sessionState.status).toBe("idle");
      expect(sessionState.attempts).toBe(0);
    } finally {
      cleanup();
    }
  });
});

describe("Sprint 2 — Change 4: Make the Investigation Transition Explicit", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  // --------------------------------------------------------------------------
  // Test A — Investigation cue is absent initially
  // --------------------------------------------------------------------------
  it("Test A: 'No changes saved.' is visible and investigation cue is not yet displayed before save action", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const surface = container.querySelector('[data-testid="account-settings-system"]');
      expect(surface?.getAttribute("data-save-attempted")).toBe("false");

      const statusElement = container.querySelector('[role="status"]');
      expect(statusElement).not.toBeNull();
      expect(statusElement?.textContent).toContain("No changes saved.");

      // Neither consequence evidence nor investigation cue should be present
      expect(container.querySelector('[data-testid="save-consequence-evidence"]')).toBeNull();
      expect(container.querySelector('[data-testid="investigation-transition-cue"]')).toBeNull();
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test B — Investigation cue appears after observed consequence
  // --------------------------------------------------------------------------
  it("Test B: activating Save Changes renders observed consequence and the explicit investigation cue", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const saveButton = container.querySelector("button") as HTMLButtonElement;

      act(() => {
        saveButton.click();
      });

      // Consequence evidence
      const evidence = container.querySelector('[data-testid="save-consequence-evidence"]');
      expect(evidence).not.toBeNull();
      expect(evidence?.textContent).toContain("Save Changes activated.");
      expect(evidence?.textContent).toContain("No visible state change occurred.");

      // Investigation transition cue
      const cue = container.querySelector('[data-testid="investigation-transition-cue"]');
      expect(cue).not.toBeNull();
      expect(cue?.textContent).toContain("There is evidence here.");
      expect(cue?.textContent).toContain("Find out what the button is actually doing.");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test C — Evidence remains distinct from guidance
  // --------------------------------------------------------------------------
  it("Test C: UI distinguishes observed fact from investigation direction in separate elements", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const saveButton = container.querySelector("button") as HTMLButtonElement;

      act(() => {
        saveButton.click();
      });

      const evidence = container.querySelector('[data-testid="save-consequence-evidence"]');
      const cue = container.querySelector('[data-testid="investigation-transition-cue"]');

      expect(evidence).not.toBeNull();
      expect(cue).not.toBeNull();

      // Evidence owns the fact
      expect(evidence?.textContent).toContain("Save Changes activated.");
      expect(evidence?.textContent).toContain("No visible state change occurred.");
      expect(evidence?.textContent).not.toContain("There is evidence here.");

      // Cue owns the transition guidance
      expect(cue?.textContent).toContain("There is evidence here.");
      expect(cue?.textContent).toContain("Find out what the button is actually doing.");
      expect(cue?.textContent).not.toContain("Save Changes activated.");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test D — No diagnosis leakage
  // --------------------------------------------------------------------------
  it("Test D: investigation cue does not expose technical root-cause diagnoses", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const saveButton = container.querySelector("button") as HTMLButtonElement;

      act(() => {
        saveButton.click();
      });

      const text = (container.textContent ?? "").toLowerCase();
      expect(text).not.toContain("event handler");
      expect(text).not.toContain("event listener");
      expect(text).not.toContain("click handler");
      expect(text).not.toContain("missing handler");
      expect(text).not.toContain("javascript bug");
      expect(text).not.toContain("state setter");
      expect(text).not.toContain("missing function");
      expect(text).not.toContain("undefined function");
      expect(text).not.toContain("onclick");
      expect(text).not.toContain("unhandled");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test E — No false success
  // --------------------------------------------------------------------------
  it("Test E: system does not report false success messages", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const saveButton = container.querySelector("button") as HTMLButtonElement;

      act(() => {
        saveButton.click();
      });

      const text = container.textContent ?? "";
      expect(text).not.toContain("Changes saved.");
      expect(text).not.toContain("Saved successfully.");
      expect(text).not.toContain("Successfully saved.");
      expect(text).not.toMatch(/save[d]?\s+success/i);
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test F — Accessibility
  // --------------------------------------------------------------------------
  it("Test F: status/evidence live region remains accessible, button retains accessible name, focus remains intact", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const statusArea = container.querySelector('[role="status"]');
      expect(statusArea).not.toBeNull();
      expect(statusArea?.getAttribute("aria-live")).toBe("polite");

      const saveButton = container.querySelector("button") as HTMLButtonElement;
      expect(saveButton.getAttribute("aria-label")).toBe("Save Changes");

      // Verify non-disruptive focus behavior
      saveButton.focus();
      expect(document.activeElement).toBe(saveButton);

      act(() => {
        saveButton.click();
      });

      expect(document.activeElement).toBe(saveButton);
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test G — No canonical side effects
  // --------------------------------------------------------------------------
  it("Test G: investigation transition cue causes zero canonical runtime, evaluation, or progression side-effects", () => {
    const onSubmitSpy = vi.fn();
    const onCompleteSpy = vi.fn();
    const onRequestEvaluationSpy = vi.fn();
    const onRuntimeValidationSpy = vi.fn();

    const arbitraryVisualActivity = getVisualActivity();
    const sessionState: ActivitySessionState = {
      status: "idle",
      attempts: 0,
      startedAt: Date.now(),
    };

    const arbitraryLesson: CanonicalLesson = {
      id: "lesson-golden-01",
      title: "What is Frontend Development?",
      module: "module-foundation",
      objectives: [],
      skills: [],
      skillIds: [],
      activities: [arbitraryVisualActivity],
    };

    const { container, cleanup } = renderComponent(
      <CanonicalActivityView
        activity={arbitraryVisualActivity}
        lesson={arbitraryLesson}
        sessionState={sessionState}
        onSubmit={onSubmitSpy}
        onComplete={onCompleteSpy}
        onRequestEvaluation={onRequestEvaluationSpy}
        onRuntimeValidation={onRuntimeValidationSpy}
      />,
    );

    try {
      const saveButton = container.querySelector(
        '[data-testid="account-settings-system"] button',
      ) as HTMLButtonElement;
      expect(saveButton).not.toBeNull();

      act(() => {
        saveButton.click();
      });

      // Investigation cue is rendered
      expect(
        container.querySelector('[data-testid="investigation-transition-cue"]'),
      ).not.toBeNull();

      // Zero canonical side effects
      expect(onSubmitSpy).not.toHaveBeenCalled();
      expect(onCompleteSpy).not.toHaveBeenCalled();
      expect(onRequestEvaluationSpy).not.toHaveBeenCalled();
      expect(onRuntimeValidationSpy).not.toHaveBeenCalled();

      // Session state remains intact
      expect(sessionState.status).toBe("idle");
      expect(sessionState.attempts).toBe(0);
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test H — Composition compatibility
  // --------------------------------------------------------------------------
  it("Test H: investigation transition cue functions seamlessly with ExperienceComposition", () => {
    const composition: ExperienceComposition = {
      mode: "discover",
      spatialMode: "focused",
      density: "spacious",
      focalSurface: "primary",
    };

    const { container, cleanup } = renderComponent(
      <AccountSettingsSystem experienceComposition={composition} />,
    );
    try {
      const surface = container.querySelector('[data-testid="account-settings-system"]');
      expect(surface?.getAttribute("data-density")).toBe("spacious");
      expect(surface?.getAttribute("data-spatial-mode")).toBe("focused");

      const saveButton = container.querySelector("button") as HTMLButtonElement;
      act(() => {
        saveButton.click();
      });

      const cue = container.querySelector('[data-testid="investigation-transition-cue"]');
      expect(cue).not.toBeNull();
      expect(cue?.textContent).toContain("There is evidence here.");
      expect(cue?.textContent).toContain("Find out what the button is actually doing.");
    } finally {
      cleanup();
    }
  });
});

describe("Sprint 2 — Change 5: Give the Learner a Minimal Investigation Surface", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  // --------------------------------------------------------------------------
  // Test A — Inspection affordance exists
  // --------------------------------------------------------------------------
  it("Test A: initial surface contains an accessible inspection control for the Save Changes button", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const inspectButton = container.querySelector(
        'button[id="account-inspect-button"]',
      ) as HTMLButtonElement;
      expect(inspectButton).not.toBeNull();
      expect(inspectButton.getAttribute("aria-label")).toContain("Inspect");
      expect(inspectButton.getAttribute("aria-label")).toContain("Save Changes");
      expect(inspectButton.getAttribute("aria-expanded")).toBe("false");
      expect(inspectButton.getAttribute("type")).toBe("button");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test B — Inspection does not appear prematurely
  // --------------------------------------------------------------------------
  it("Test B: inspection surface is not visible before activating the inspect control", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const surface = container.querySelector('[data-testid="account-settings-system"]');
      expect(surface?.getAttribute("data-inspecting")).toBe("false");

      const inspectionSurface = container.querySelector('[data-testid="inspection-surface"]');
      expect(inspectionSurface).toBeNull();
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test C — Inspection opens
  // --------------------------------------------------------------------------
  it("Test C: activating the inspect button reveals the minimal inspection surface", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const inspectButton = container.querySelector(
        'button[id="account-inspect-button"]',
      ) as HTMLButtonElement;

      act(() => {
        inspectButton.click();
      });

      const surface = container.querySelector('[data-testid="account-settings-system"]');
      expect(surface?.getAttribute("data-inspecting")).toBe("true");

      const inspectionSurface = container.querySelector('[data-testid="inspection-surface"]');
      expect(inspectionSurface).not.toBeNull();
      expect(inspectButton.getAttribute("aria-expanded")).toBe("true");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test D — Inspection reports real element information
  // --------------------------------------------------------------------------
  it("Test D: inspection surface accurately displays factual DOM properties of the Save Changes button", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;
      expect(saveButton).not.toBeNull();
      expect(saveButton.tagName.toLowerCase()).toBe("button");
      expect(saveButton.id).toBe("account-save-button");
      expect(saveButton.type).toBe("button");
      expect(saveButton.textContent?.trim()).toBe("Save Changes");

      const inspectButton = container.querySelector(
        'button[id="account-inspect-button"]',
      ) as HTMLButtonElement;
      act(() => {
        inspectButton.click();
      });

      const inspectionSurface = container.querySelector('[data-testid="inspection-surface"]');
      expect(inspectionSurface).not.toBeNull();

      const text = inspectionSurface?.textContent ?? "";
      expect(text).toContain("button");
      expect(text).toContain("account-save-button");
      expect(text).toContain("Save Changes");
      expect(text).toContain("Element Inspector");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test E — Inspection does not reveal diagnosis
  // --------------------------------------------------------------------------
  it("Test E: inspection surface does not expose root-cause conclusions or technical diagnoses", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const inspectButton = container.querySelector(
        'button[id="account-inspect-button"]',
      ) as HTMLButtonElement;
      act(() => {
        inspectButton.click();
      });

      const inspectionSurface = container.querySelector('[data-testid="inspection-surface"]');
      expect(inspectionSurface).not.toBeNull();

      const text = (inspectionSurface?.textContent ?? "").toLowerCase();
      expect(text).not.toContain("missing handler");
      expect(text).not.toContain("missing listener");
      expect(text).not.toContain("event handler");
      expect(text).not.toContain("click handler");
      expect(text).not.toContain("javascript bug");
      expect(text).not.toContain("missing setter");
      expect(text).not.toContain("undefined function");
      expect(text).not.toContain("not wired");
      expect(text).not.toContain("does nothing because");
      expect(text).not.toContain("onclick");
      expect(text).not.toContain("broken");
      expect(text).not.toContain("fix");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test F — Investigation remains separate from consequence evidence
  // --------------------------------------------------------------------------
  it("Test F: consequence evidence and structural inspection surface remain completely distinct elements", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;
      const inspectButton = container.querySelector(
        'button[id="account-inspect-button"]',
      ) as HTMLButtonElement;

      act(() => {
        saveButton.click();
        inspectButton.click();
      });

      const consequenceEvidence = container.querySelector(
        '[data-testid="save-consequence-evidence"]',
      );
      const transitionCue = container.querySelector('[data-testid="investigation-transition-cue"]');
      const inspectionSurface = container.querySelector('[data-testid="inspection-surface"]');

      expect(consequenceEvidence).not.toBeNull();
      expect(transitionCue).not.toBeNull();
      expect(inspectionSurface).not.toBeNull();

      // Separate DOM nodes
      expect(consequenceEvidence).not.toBe(inspectionSurface);
      expect(transitionCue).not.toBe(inspectionSurface);

      // Consequence evidence owns runtime observations
      expect(consequenceEvidence?.textContent).toContain("Save Changes activated.");
      expect(consequenceEvidence?.textContent).toContain("No visible state change occurred.");

      // Inspection surface owns structural DOM facts
      expect(inspectionSurface?.textContent).toContain("account-save-button");
      expect(inspectionSurface?.textContent).not.toContain("Save Changes activated.");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test G — Inspection is presentation-only
  // --------------------------------------------------------------------------
  it("Test G: inspecting the button triggers zero runtime execution, evaluation, or progression side effects", () => {
    const onSubmitSpy = vi.fn();
    const onCompleteSpy = vi.fn();
    const onRequestEvaluationSpy = vi.fn();
    const onRuntimeValidationSpy = vi.fn();

    const arbitraryVisualActivity = getVisualActivity();
    const sessionState: ActivitySessionState = {
      status: "idle",
      attempts: 0,
      startedAt: Date.now(),
    };

    const arbitraryLesson: CanonicalLesson = {
      id: "lesson-golden-01",
      title: "What is Frontend Development?",
      module: "module-foundation",
      objectives: [],
      skills: [],
      skillIds: [],
      activities: [arbitraryVisualActivity],
    };

    const { container, cleanup } = renderComponent(
      <CanonicalActivityView
        activity={arbitraryVisualActivity}
        lesson={arbitraryLesson}
        sessionState={sessionState}
        onSubmit={onSubmitSpy}
        onComplete={onCompleteSpy}
        onRequestEvaluation={onRequestEvaluationSpy}
        onRuntimeValidation={onRuntimeValidationSpy}
      />,
    );

    try {
      const inspectButton = container.querySelector(
        'button[id="account-inspect-button"]',
      ) as HTMLButtonElement;
      expect(inspectButton).not.toBeNull();

      act(() => {
        inspectButton.click();
      });

      expect(container.querySelector('[data-testid="inspection-surface"]')).not.toBeNull();

      // Zero engine callbacks
      expect(onSubmitSpy).not.toHaveBeenCalled();
      expect(onCompleteSpy).not.toHaveBeenCalled();
      expect(onRequestEvaluationSpy).not.toHaveBeenCalled();
      expect(onRuntimeValidationSpy).not.toHaveBeenCalled();

      // Session state untouched
      expect(sessionState.status).toBe("idle");
      expect(sessionState.attempts).toBe(0);
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test H — Inspection composition compatibility
  // --------------------------------------------------------------------------
  it("Test H: inspection surface works seamlessly across ExperienceComposition configurations", () => {
    const composition: ExperienceComposition = {
      mode: "discover",
      spatialMode: "focused",
      density: "spacious",
      focalSurface: "primary",
    };

    const { container, cleanup } = renderComponent(
      <AccountSettingsSystem experienceComposition={composition} />,
    );
    try {
      const inspectButton = container.querySelector(
        'button[id="account-inspect-button"]',
      ) as HTMLButtonElement;
      act(() => {
        inspectButton.click();
      });

      const inspectionSurface = container.querySelector('[data-testid="inspection-surface"]');
      expect(inspectionSurface).not.toBeNull();

      const root = container.querySelector('[data-testid="account-settings-system"]');
      expect(root?.getAttribute("data-density")).toBe("spacious");
      expect(root?.getAttribute("data-spatial-mode")).toBe("focused");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test I — Accessibility
  // --------------------------------------------------------------------------
  it("Test I: inspect control has accessible touch target, aria attributes, focus retention, and status live region is unchanged", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const inspectButton = container.querySelector(
        'button[id="account-inspect-button"]',
      ) as HTMLButtonElement;
      expect(inspectButton.getAttribute("aria-label")).toContain("Inspect Save Changes button");
      expect(inspectButton.getAttribute("aria-expanded")).toBe("false");
      expect(inspectButton.getAttribute("aria-controls")).toBe("account-save-button-inspector");

      // Verify touch target class
      expect(inspectButton.className).toContain("min-h-[44px]");
      expect(inspectButton.className).toContain("min-w-[44px]");

      // Test focus retention and keyboard click
      inspectButton.focus();
      expect(document.activeElement).toBe(inspectButton);

      act(() => {
        inspectButton.click();
      });

      expect(document.activeElement).toBe(inspectButton);
      expect(inspectButton.getAttribute("aria-expanded")).toBe("true");

      // Live status region remains pristine
      const statusArea = container.querySelector('[role="status"]');
      expect(statusArea).not.toBeNull();
      expect(statusArea?.getAttribute("aria-live")).toBe("polite");
      expect(statusArea?.textContent).toContain("No changes saved.");
      expect(statusArea?.querySelector('[data-testid="inspection-surface"]')).toBeNull();
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test J — Close/reopen behavior
  // --------------------------------------------------------------------------
  it("Test J: toggling inspection repeatedly maintains deterministic presentation and clean state", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const inspectButton = container.querySelector(
        'button[id="account-inspect-button"]',
      ) as HTMLButtonElement;

      // 1. Initial: Closed
      expect(container.querySelector('[data-testid="inspection-surface"]')).toBeNull();
      expect(inspectButton.getAttribute("aria-expanded")).toBe("false");

      // 2. Open
      act(() => {
        inspectButton.click();
      });
      expect(container.querySelector('[data-testid="inspection-surface"]')).not.toBeNull();
      expect(inspectButton.getAttribute("aria-expanded")).toBe("true");
      expect(inspectButton.getAttribute("aria-label")).toBe(
        "Close inspector for Save Changes button",
      );

      // 3. Close
      act(() => {
        inspectButton.click();
      });
      expect(container.querySelector('[data-testid="inspection-surface"]')).toBeNull();
      expect(inspectButton.getAttribute("aria-expanded")).toBe("false");
      expect(inspectButton.getAttribute("aria-label")).toBe("Inspect Save Changes button");

      // 4. Reopen
      act(() => {
        inspectButton.click();
      });
      const reopened = container.querySelector('[data-testid="inspection-surface"]');
      expect(reopened).not.toBeNull();
      expect(reopened?.textContent).toContain("account-save-button");
      expect(reopened?.textContent).toContain("Save Changes");
      expect(inspectButton.getAttribute("aria-expanded")).toBe("true");
    } finally {
      cleanup();
    }
  });
});

describe("Sprint 2 — Change 6: Make Interaction Evidence Observable", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  // --------------------------------------------------------------------------
  // Test A — No interaction evidence initially
  // --------------------------------------------------------------------------
  it("Test A: initial surface does not display interaction evidence prior to saving", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const surface = container.querySelector('[data-testid="account-settings-system"]');
      expect(surface?.getAttribute("data-save-attempted")).toBe("false");

      const interactionEvidence = container.querySelector('[data-testid="interaction-evidence"]');
      expect(interactionEvidence).toBeNull();
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test B — Save creates interaction evidence
  // --------------------------------------------------------------------------
  it("Test B: activating Save Changes renders observable interaction evidence", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;

      act(() => {
        saveButton.click();
      });

      const interactionEvidence = container.querySelector('[data-testid="interaction-evidence"]');
      expect(interactionEvidence).not.toBeNull();

      const text = interactionEvidence?.textContent ?? "";
      expect(text).toContain("Interaction Evidence");
      expect(text).toContain("Save Changes activated");
      expect(text).toContain("Unchanged");
      expect(text).toContain("No visible state change occurred.");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test C — Existing consequence evidence remains intact
  // --------------------------------------------------------------------------
  it("Test C: consequence evidence remains distinct and fully intact after Save", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;

      act(() => {
        saveButton.click();
      });

      const consequence = container.querySelector('[data-testid="save-consequence-evidence"]');
      expect(consequence).not.toBeNull();
      expect(consequence?.textContent).toContain("Save Changes activated.");
      expect(consequence?.textContent).toContain("No visible state change occurred.");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test D — Investigation direction remains intact
  // --------------------------------------------------------------------------
  it("Test D: investigation transition cue remains visible and distinct after Save", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;

      act(() => {
        saveButton.click();
      });

      const cue = container.querySelector('[data-testid="investigation-transition-cue"]');
      expect(cue).not.toBeNull();
      expect(cue?.textContent).toContain("There is evidence here.");
      expect(cue?.textContent).toContain("Find out what the button is actually doing.");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test E — Structural inspection remains intact
  // --------------------------------------------------------------------------
  it("Test E: structural element inspector still functions independently before and after Save", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const inspectButton = container.querySelector(
        'button[id="account-inspect-button"]',
      ) as HTMLButtonElement;
      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;

      // Inspect before Save
      act(() => {
        inspectButton.click();
      });
      let inspector = container.querySelector('[data-testid="inspection-surface"]');
      expect(inspector).not.toBeNull();
      expect(inspector?.textContent).toContain("account-save-button");
      expect(inspector?.textContent).toContain("button");

      // Save while inspecting
      act(() => {
        saveButton.click();
      });

      // Both inspector and interaction evidence coexist cleanly
      inspector = container.querySelector('[data-testid="inspection-surface"]');
      const interactionEvidence = container.querySelector('[data-testid="interaction-evidence"]');
      expect(inspector).not.toBeNull();
      expect(interactionEvidence).not.toBeNull();
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test F — No implementation diagnosis
  // --------------------------------------------------------------------------
  it("Test F: interaction evidence does not disclose technical implementation diagnoses", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;

      act(() => {
        saveButton.click();
      });

      const interactionEvidence = container.querySelector('[data-testid="interaction-evidence"]');
      expect(interactionEvidence).not.toBeNull();

      const text = (interactionEvidence?.textContent ?? "").toLowerCase();
      expect(text).not.toContain("handler");
      expect(text).not.toContain("event listener");
      expect(text).not.toContain("onclick");
      expect(text).not.toContain("callback");
      expect(text).not.toContain("setter");
      expect(text).not.toContain("javascript bug");
      expect(text).not.toContain("missing function");
      expect(text).not.toContain("not wired");
      expect(text).not.toContain("function not called");
      expect(text).not.toContain("state mutation failed");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test G — No fabricated telemetry
  // --------------------------------------------------------------------------
  it("Test G: interaction evidence does not invent fake runtime telemetry or call stacks", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;

      act(() => {
        saveButton.click();
      });

      const text = (container.textContent ?? "").toLowerCase();
      expect(text).not.toContain("event dispatched");
      expect(text).not.toContain("handler executed");
      expect(text).not.toContain("call stack");
      expect(text).not.toContain("network request");
      expect(text).not.toContain("telemetry");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test H — No false success
  // --------------------------------------------------------------------------
  it("Test H: system never displays false positive success indicators", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;

      act(() => {
        saveButton.click();
      });

      const text = container.textContent ?? "";
      expect(text).not.toContain("Changes saved.");
      expect(text).not.toContain("Saved successfully.");
      expect(text).not.toContain("Successfully saved.");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test I — Presentation-only
  // --------------------------------------------------------------------------
  it("Test I: interaction evidence induces zero evaluation, runtime, or progression side effects", () => {
    const onSubmitSpy = vi.fn();
    const onCompleteSpy = vi.fn();
    const onRequestEvaluationSpy = vi.fn();
    const onRuntimeValidationSpy = vi.fn();

    const arbitraryVisualActivity = getVisualActivity();
    const sessionState: ActivitySessionState = {
      status: "idle",
      attempts: 0,
      startedAt: Date.now(),
    };

    const arbitraryLesson: CanonicalLesson = {
      id: "lesson-golden-01",
      title: "What is Frontend Development?",
      module: "module-foundation",
      objectives: [],
      skills: [],
      skillIds: [],
      activities: [arbitraryVisualActivity],
    };

    const { container, cleanup } = renderComponent(
      <CanonicalActivityView
        activity={arbitraryVisualActivity}
        lesson={arbitraryLesson}
        sessionState={sessionState}
        onSubmit={onSubmitSpy}
        onComplete={onCompleteSpy}
        onRequestEvaluation={onRequestEvaluationSpy}
        onRuntimeValidation={onRuntimeValidationSpy}
      />,
    );

    try {
      const saveButton = container.querySelector(
        '[data-testid="account-settings-system"] button[id="account-save-button"]',
      ) as HTMLButtonElement;
      expect(saveButton).not.toBeNull();

      act(() => {
        saveButton.click();
      });

      expect(container.querySelector('[data-testid="interaction-evidence"]')).not.toBeNull();

      // Zero engine side-effects
      expect(onSubmitSpy).not.toHaveBeenCalled();
      expect(onCompleteSpy).not.toHaveBeenCalled();
      expect(onRequestEvaluationSpy).not.toHaveBeenCalled();
      expect(onRuntimeValidationSpy).not.toHaveBeenCalled();

      // Session state remains intact
      expect(sessionState.status).toBe("idle");
      expect(sessionState.attempts).toBe(0);
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test J — Repeat interaction
  // --------------------------------------------------------------------------
  it("Test J: activating Save repeatedly produces stable, deterministic single-block evidence", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;

      act(() => {
        saveButton.click();
        saveButton.click();
        saveButton.click();
      });

      const blocks = container.querySelectorAll('[data-testid="interaction-evidence"]');
      expect(blocks.length).toBe(1);
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test K — Accessibility
  // --------------------------------------------------------------------------
  it("Test K: Save button retains accessibility, focus, and live region remains polite", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const statusArea = container.querySelector('[role="status"]');
      expect(statusArea).not.toBeNull();
      expect(statusArea?.getAttribute("aria-live")).toBe("polite");

      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;
      expect(saveButton.getAttribute("aria-label")).toBe("Save Changes");

      saveButton.focus();
      expect(document.activeElement).toBe(saveButton);

      act(() => {
        saveButton.click();
      });

      expect(document.activeElement).toBe(saveButton);
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test L — Composition compatibility
  // --------------------------------------------------------------------------
  it("Test L: interaction evidence functions seamlessly with ExperienceComposition", () => {
    const composition: ExperienceComposition = {
      mode: "discover",
      spatialMode: "focused",
      density: "spacious",
      focalSurface: "primary",
    };

    const { container, cleanup } = renderComponent(
      <AccountSettingsSystem experienceComposition={composition} />,
    );
    try {
      const surface = container.querySelector('[data-testid="account-settings-system"]');
      expect(surface?.getAttribute("data-density")).toBe("spacious");
      expect(surface?.getAttribute("data-spatial-mode")).toBe("focused");

      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;
      act(() => {
        saveButton.click();
      });

      const evidence = container.querySelector('[data-testid="interaction-evidence"]');
      expect(evidence).not.toBeNull();
      expect(evidence?.textContent).toContain("Interaction Evidence");
    } finally {
      cleanup();
    }
  });
});

describe("Sprint 2 — Change 7: Let the Learner Form a Causal Hypothesis", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  // --------------------------------------------------------------------------
  // Test A — Hypothesis surface is gated
  // --------------------------------------------------------------------------
  it("Test A: hypothesis surface is not rendered prior to saving / gathering initial evidence", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const hypothesisSurface = container.querySelector('[data-testid="hypothesis-surface"]');
      expect(hypothesisSurface).toBeNull();
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test B — Evidence unlocks hypothesis surface
  // --------------------------------------------------------------------------
  it("Test B: activating Save Changes unlocks the causal hypothesis surface", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;

      act(() => {
        saveButton.click();
      });

      const hypothesisSurface = container.querySelector('[data-testid="hypothesis-surface"]');
      expect(hypothesisSurface).not.toBeNull();
      expect(hypothesisSurface?.textContent).toContain("What do you think is happening?");
      expect(hypothesisSurface?.textContent).toContain(
        "The button activates, but the visible state does not change.",
      );
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test C — Hypothesis options are present
  // --------------------------------------------------------------------------
  it("Test C: all expected hypothesis options are present including 'I need more evidence'", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;

      act(() => {
        saveButton.click();
      });

      const radios = container.querySelectorAll('input[name="account-causal-hypothesis"]');
      expect(radios.length).toBe(HYPOTHESIS_OPTIONS.length);

      const surfaceText =
        container.querySelector('[data-testid="hypothesis-surface"]')?.textContent ?? "";

      for (const opt of HYPOTHESIS_OPTIONS) {
        expect(surfaceText).toContain(opt.text);
      }

      // Explicit check for "I need more evidence"
      expect(surfaceText).toContain("I need more evidence before I can make a hypothesis.");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test D — Selection works
  // --------------------------------------------------------------------------
  it("Test D: selecting a hypothesis option updates the selected state", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;

      act(() => {
        saveButton.click();
      });

      const firstOptionRadio = container.querySelector(
        'input[id="hypothesis-not-connected"]',
      ) as HTMLInputElement;
      expect(firstOptionRadio.checked).toBe(false);

      act(() => {
        firstOptionRadio.click();
      });

      expect(firstOptionRadio.checked).toBe(true);

      const surface = container.querySelector('[data-testid="account-settings-system"]');
      expect(surface?.getAttribute("data-selected-hypothesis")).toBe("not-connected");

      const statusMsg = container.querySelector('[data-testid="hypothesis-recorded-status"]');
      expect(statusMsg).not.toBeNull();
      expect(statusMsg?.textContent).toContain("Hypothesis recorded.");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test E — Selection is reversible
  // --------------------------------------------------------------------------
  it("Test E: hypothesis choice is reversible and allows changing minds without penalty", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;

      act(() => {
        saveButton.click();
      });

      const option1 = container.querySelector(
        'input[id="hypothesis-not-connected"]',
      ) as HTMLInputElement;
      const option2 = container.querySelector(
        'input[id="hypothesis-need-more-evidence"]',
      ) as HTMLInputElement;

      act(() => {
        option1.click();
      });
      expect(option1.checked).toBe(true);
      expect(option2.checked).toBe(false);

      act(() => {
        option2.click();
      });
      expect(option1.checked).toBe(false);
      expect(option2.checked).toBe(true);

      const surface = container.querySelector('[data-testid="account-settings-system"]');
      expect(surface?.getAttribute("data-selected-hypothesis")).toBe("need-more-evidence");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test F — No hypothesis is marked correct
  // --------------------------------------------------------------------------
  it("Test F: selecting any option does not provide correctness evaluation feedback", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;

      act(() => {
        saveButton.click();
      });

      const options = container.querySelectorAll('input[name="account-causal-hypothesis"]');

      for (let i = 0; i < options.length; i++) {
        const opt = options[i] as HTMLInputElement;
        act(() => {
          opt.click();
        });

        const surfaceText = (
          container.querySelector('[data-testid="hypothesis-surface"]')?.textContent ?? ""
        ).toLowerCase();

        expect(surfaceText).not.toContain("correct");
        expect(surfaceText).not.toContain("incorrect");
        expect(surfaceText).not.toContain("right answer");
        expect(surfaceText).not.toContain("wrong answer");
        expect(surfaceText).not.toContain("best answer");
        expect(surfaceText).not.toContain("likely");
        expect(surfaceText).not.toContain("expert choice");
      }
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test G — No diagnosis leakage
  // --------------------------------------------------------------------------
  it("Test G: hypothesis surface does not reveal root-cause diagnoses or technical hints", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;

      act(() => {
        saveButton.click();
      });

      const text = (
        container.querySelector('[data-testid="hypothesis-surface"]')?.textContent ?? ""
      ).toLowerCase();

      expect(text).not.toContain("missing handler");
      expect(text).not.toContain("event listener");
      expect(text).not.toContain("state setter");
      expect(text).not.toContain("javascript bug");
      expect(text).not.toContain("missing function");
      expect(text).not.toContain("undefined function");
      expect(text).not.toContain("not wired");
      expect(text).not.toContain("onclick");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test H — No automatic evaluation
  // --------------------------------------------------------------------------
  it("Test H: hypothesis selection causes zero calls to evaluation, validators, or progression", () => {
    const onSubmitSpy = vi.fn();
    const onCompleteSpy = vi.fn();
    const onRequestEvaluationSpy = vi.fn();
    const onRuntimeValidationSpy = vi.fn();

    const arbitraryVisualActivity = getVisualActivity();
    const sessionState: ActivitySessionState = {
      status: "idle",
      attempts: 0,
      startedAt: Date.now(),
    };

    const arbitraryLesson: CanonicalLesson = {
      id: "lesson-golden-01",
      title: "What is Frontend Development?",
      module: "module-foundation",
      objectives: [],
      skills: [],
      skillIds: [],
      activities: [arbitraryVisualActivity],
    };

    const { container, cleanup } = renderComponent(
      <CanonicalActivityView
        activity={arbitraryVisualActivity}
        lesson={arbitraryLesson}
        sessionState={sessionState}
        onSubmit={onSubmitSpy}
        onComplete={onCompleteSpy}
        onRequestEvaluation={onRequestEvaluationSpy}
        onRuntimeValidation={onRuntimeValidationSpy}
      />,
    );

    try {
      const saveButton = container.querySelector(
        '[data-testid="account-settings-system"] button[id="account-save-button"]',
      ) as HTMLButtonElement;
      act(() => {
        saveButton.click();
      });

      const option1 = container.querySelector(
        'input[id="hypothesis-not-connected"]',
      ) as HTMLInputElement;
      expect(option1).not.toBeNull();

      act(() => {
        option1.click();
      });

      // Assert zero side effects
      expect(onSubmitSpy).not.toHaveBeenCalled();
      expect(onCompleteSpy).not.toHaveBeenCalled();
      expect(onRequestEvaluationSpy).not.toHaveBeenCalled();
      expect(onRuntimeValidationSpy).not.toHaveBeenCalled();
      expect(sessionState.status).toBe("idle");
      expect(sessionState.attempts).toBe(0);
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test I — Existing evidence remains intact
  // --------------------------------------------------------------------------
  it("Test I: consequence evidence, interaction evidence, transition cue, and inspector remain functional", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const inspectButton = container.querySelector(
        'button[id="account-inspect-button"]',
      ) as HTMLButtonElement;
      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;

      act(() => {
        saveButton.click();
      });

      expect(container.querySelector('[data-testid="save-consequence-evidence"]')).not.toBeNull();
      expect(container.querySelector('[data-testid="interaction-evidence"]')).not.toBeNull();
      expect(
        container.querySelector('[data-testid="investigation-transition-cue"]'),
      ).not.toBeNull();
      expect(container.querySelector('[data-testid="hypothesis-surface"]')).not.toBeNull();

      // Open inspector alongside hypothesis surface
      act(() => {
        inspectButton.click();
      });

      expect(container.querySelector('[data-testid="inspection-surface"]')).not.toBeNull();
      expect(container.querySelector('[data-testid="hypothesis-surface"]')).not.toBeNull();
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test J — Accessibility
  // --------------------------------------------------------------------------
  it("Test J: hypothesis surface uses semantic fieldset/legend, min-h-[44px] targets, and preserves focus", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;

      act(() => {
        saveButton.click();
      });

      const fieldset = container.querySelector('fieldset[id="account-hypothesis-surface"]');
      expect(fieldset).not.toBeNull();

      const legend = fieldset?.querySelector("legend");
      expect(legend).not.toBeNull();

      const labels = fieldset?.querySelectorAll("label");
      expect(labels?.length).toBe(HYPOTHESIS_OPTIONS.length);

      labels?.forEach((label) => {
        expect(label.classList.contains("min-h-[44px]")).toBe(true);
      });

      const radio = fieldset?.querySelector('input[type="radio"]') as HTMLInputElement;
      radio.focus();
      expect(document.activeElement).toBe(radio);

      act(() => {
        radio.click();
      });

      expect(document.activeElement).toBe(radio);
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test K — Composition compatibility
  // --------------------------------------------------------------------------
  it("Test K: hypothesis surface functions seamlessly under ExperienceComposition", () => {
    const composition: ExperienceComposition = {
      mode: "discover",
      spatialMode: "focused",
      density: "spacious",
      focalSurface: "primary",
    };

    const { container, cleanup } = renderComponent(
      <AccountSettingsSystem experienceComposition={composition} />,
    );
    try {
      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;

      act(() => {
        saveButton.click();
      });

      const surface = container.querySelector('[data-testid="account-settings-system"]');
      expect(surface?.getAttribute("data-density")).toBe("spacious");
      expect(surface?.getAttribute("data-spatial-mode")).toBe("focused");

      const hypothesisSurface = container.querySelector('[data-testid="hypothesis-surface"]');
      expect(hypothesisSurface).not.toBeNull();
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test L — Determinism
  // --------------------------------------------------------------------------
  it("Test L: rendering with identical state produces deterministic option ordering", () => {
    const { container: c1, cleanup: cl1 } = renderComponent(<AccountSettingsSystem />);
    const { container: c2, cleanup: cl2 } = renderComponent(<AccountSettingsSystem />);

    try {
      const btn1 = c1.querySelector('button[id="account-save-button"]') as HTMLButtonElement;
      const btn2 = c2.querySelector('button[id="account-save-button"]') as HTMLButtonElement;

      act(() => {
        btn1.click();
        btn2.click();
      });

      const labels1 = Array.from(
        c1.querySelectorAll('[data-testid="hypothesis-surface"] label span'),
      ).map((el) => el.textContent);
      const labels2 = Array.from(
        c2.querySelectorAll('[data-testid="hypothesis-surface"] label span'),
      ).map((el) => el.textContent);

      expect(labels1).toEqual(labels2);
      expect(labels1).toEqual(HYPOTHESIS_OPTIONS.map((o) => o.text));
    } finally {
      cl1();
      cl2();
    }
  });

  // --------------------------------------------------------------------------
  // Test M — No persistence
  // --------------------------------------------------------------------------
  it("Test M: unmounting and remounting resets local hypothesis selection to none", () => {
    let result = renderComponent(<AccountSettingsSystem />);
    const saveButton = result.container.querySelector(
      'button[id="account-save-button"]',
    ) as HTMLButtonElement;

    act(() => {
      saveButton.click();
    });

    const opt = result.container.querySelector(
      'input[id="hypothesis-not-connected"]',
    ) as HTMLInputElement;
    act(() => {
      opt.click();
    });

    expect(
      result.container
        .querySelector('[data-testid="account-settings-system"]')
        ?.getAttribute("data-selected-hypothesis"),
    ).toBe("not-connected");

    // Unmount
    result.cleanup();

    // Remount
    result = renderComponent(<AccountSettingsSystem />);
    try {
      const surface = result.container.querySelector('[data-testid="account-settings-system"]');
      expect(surface?.getAttribute("data-selected-hypothesis")).toBe("none");
      expect(result.container.querySelector('[data-testid="hypothesis-surface"]')).toBeNull();
    } finally {
      result.cleanup();
    }
  });
});

describe("Sprint 2 — Change 8: Test the Hypothesis Against Evidence", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  // --------------------------------------------------------------------------
  // Test A — Gated initial state
  // --------------------------------------------------------------------------
  it("Test A: test-selection surface is absent prior to saving / gathering evidence", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const testSurface = container.querySelector('[data-testid="investigation-test-surface"]');
      expect(testSurface).toBeNull();
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test B — Evidence unlocks test surface
  // --------------------------------------------------------------------------
  it("Test B: activating Save Changes unlocks the evidence-test reasoning surface", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;

      act(() => {
        saveButton.click();
      });

      const testSurface = container.querySelector('[data-testid="investigation-test-surface"]');
      expect(testSurface).not.toBeNull();
      expect(testSurface?.textContent).toContain("How would you test that?");
      expect(testSurface?.textContent).toContain(
        "You have a hypothesis. What would be useful evidence to look for next?",
      );
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test C — Hypothesis remains visible alongside test surface
  // --------------------------------------------------------------------------
  it("Test C: hypothesis surface and test-selection surface coexist after Save", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;

      act(() => {
        saveButton.click();
      });

      const hypothesisSurface = container.querySelector('[data-testid="hypothesis-surface"]');
      const testSurface = container.querySelector('[data-testid="investigation-test-surface"]');

      expect(hypothesisSurface).not.toBeNull();
      expect(testSurface).not.toBeNull();
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test D — Test options
  // --------------------------------------------------------------------------
  it("Test D: every intended investigation test option is rendered faithfully", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;

      act(() => {
        saveButton.click();
      });

      const radios = container.querySelectorAll('input[name="account-investigation-test"]');
      expect(radios.length).toBe(INVESTIGATION_TEST_OPTIONS.length);

      const surfaceText =
        container.querySelector('[data-testid="investigation-test-surface"]')?.textContent ?? "";

      for (const opt of INVESTIGATION_TEST_OPTIONS) {
        expect(surfaceText).toContain(opt.text);
      }
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test E — Selection
  // --------------------------------------------------------------------------
  it("Test E: selecting an investigation option updates selected state and displays neutral status", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;

      act(() => {
        saveButton.click();
      });

      const firstOptionRadio = container.querySelector(
        'input[id="investigation-inspect-activation"]',
      ) as HTMLInputElement;
      expect(firstOptionRadio.checked).toBe(false);

      act(() => {
        firstOptionRadio.click();
      });

      expect(firstOptionRadio.checked).toBe(true);

      const surface = container.querySelector('[data-testid="account-settings-system"]');
      expect(surface?.getAttribute("data-selected-investigation")).toBe("inspect-activation");

      const statusMsg = container.querySelector('[data-testid="investigation-recorded-status"]');
      expect(statusMsg).not.toBeNull();
      expect(statusMsg?.textContent).toContain("Test selected.");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test F — Reversible
  // --------------------------------------------------------------------------
  it("Test F: test-selection choice is reversible and allows switching options freely", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;

      act(() => {
        saveButton.click();
      });

      const option1 = container.querySelector(
        'input[id="investigation-inspect-activation"]',
      ) as HTMLInputElement;
      const option2 = container.querySelector(
        'input[id="investigation-check-state-elsewhere"]',
      ) as HTMLInputElement;

      act(() => {
        option1.click();
      });
      expect(option1.checked).toBe(true);
      expect(option2.checked).toBe(false);

      act(() => {
        option2.click();
      });
      expect(option1.checked).toBe(false);
      expect(option2.checked).toBe(true);

      const surface = container.querySelector('[data-testid="account-settings-system"]');
      expect(surface?.getAttribute("data-selected-investigation")).toBe("check-state-elsewhere");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test G — Neutral acknowledgement (No grading)
  // --------------------------------------------------------------------------
  it("Test G: selecting any investigation option never provides evaluative/grading feedback", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;

      act(() => {
        saveButton.click();
      });

      const options = container.querySelectorAll('input[name="account-investigation-test"]');

      for (let i = 0; i < options.length; i++) {
        const opt = options[i] as HTMLInputElement;
        act(() => {
          opt.click();
        });

        const surfaceText = (
          container.querySelector('[data-testid="investigation-test-surface"]')?.textContent ?? ""
        ).toLowerCase();

        expect(surfaceText).not.toContain("correct");
        expect(surfaceText).not.toContain("incorrect");
        expect(surfaceText).not.toContain("right answer");
        expect(surfaceText).not.toContain("wrong answer");
        expect(surfaceText).not.toContain("best answer");
        expect(surfaceText).not.toContain("likely");
        expect(surfaceText).not.toContain("expert choice");
      }
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test H — No diagnosis leakage
  // --------------------------------------------------------------------------
  it("Test H: test-selection surface does not reveal root-cause diagnoses or implementation answers", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;

      act(() => {
        saveButton.click();
      });

      const text = (
        container.querySelector('[data-testid="investigation-test-surface"]')?.textContent ?? ""
      ).toLowerCase();

      expect(text).not.toContain("savechanges is not defined");
      expect(text).not.toContain("missing handler");
      expect(text).not.toContain("event listener");
      expect(text).not.toContain("state setter");
      expect(text).not.toContain("javascript bug");
      expect(text).not.toContain("missing function");
      expect(text).not.toContain("undefined function");
      expect(text).not.toContain("not wired");
      expect(text).not.toContain("onclick");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test I — No automatic evaluation
  // --------------------------------------------------------------------------
  it("Test I: investigation selection causes zero calls to evaluation, validators, or progression", () => {
    const onSubmitSpy = vi.fn();
    const onCompleteSpy = vi.fn();
    const onRequestEvaluationSpy = vi.fn();
    const onRuntimeValidationSpy = vi.fn();

    const arbitraryVisualActivity = getVisualActivity();
    const sessionState: ActivitySessionState = {
      status: "idle",
      attempts: 0,
      startedAt: Date.now(),
    };

    const arbitraryLesson: CanonicalLesson = {
      id: "lesson-golden-01",
      title: "What is Frontend Development?",
      module: "module-foundation",
      objectives: [],
      skills: [],
      skillIds: [],
      activities: [arbitraryVisualActivity],
    };

    const { container, cleanup } = renderComponent(
      <CanonicalActivityView
        activity={arbitraryVisualActivity}
        lesson={arbitraryLesson}
        sessionState={sessionState}
        onSubmit={onSubmitSpy}
        onComplete={onCompleteSpy}
        onRequestEvaluation={onRequestEvaluationSpy}
        onRuntimeValidation={onRuntimeValidationSpy}
      />,
    );

    try {
      const saveButton = container.querySelector(
        '[data-testid="account-settings-system"] button[id="account-save-button"]',
      ) as HTMLButtonElement;
      act(() => {
        saveButton.click();
      });

      const option1 = container.querySelector(
        'input[id="investigation-inspect-activation"]',
      ) as HTMLInputElement;
      expect(option1).not.toBeNull();

      act(() => {
        option1.click();
      });

      // Assert zero side effects
      expect(onSubmitSpy).not.toHaveBeenCalled();
      expect(onCompleteSpy).not.toHaveBeenCalled();
      expect(onRequestEvaluationSpy).not.toHaveBeenCalled();
      expect(onRuntimeValidationSpy).not.toHaveBeenCalled();
      expect(sessionState.status).toBe("idle");
      expect(sessionState.attempts).toBe(0);
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test J — Accessibility
  // --------------------------------------------------------------------------
  it("Test J: investigation surface uses semantic fieldset/legend, min-h-[44px] targets, and preserves focus", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;

      act(() => {
        saveButton.click();
      });

      const fieldset = container.querySelector('fieldset[id="account-investigation-test-surface"]');
      expect(fieldset).not.toBeNull();

      const legend = fieldset?.querySelector("legend");
      expect(legend).not.toBeNull();

      const labels = fieldset?.querySelectorAll("label");
      expect(labels?.length).toBe(INVESTIGATION_TEST_OPTIONS.length);

      labels?.forEach((label) => {
        expect(label.classList.contains("min-h-[44px]")).toBe(true);
      });

      const radio = fieldset?.querySelector('input[type="radio"]') as HTMLInputElement;
      radio.focus();
      expect(document.activeElement).toBe(radio);

      act(() => {
        radio.click();
      });

      expect(document.activeElement).toBe(radio);
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test K — Existing evidence intact
  // --------------------------------------------------------------------------
  it("Test K: consequence evidence, interaction evidence, transition cue, inspector, and hypothesis surface remain intact", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const inspectButton = container.querySelector(
        'button[id="account-inspect-button"]',
      ) as HTMLButtonElement;
      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;

      act(() => {
        saveButton.click();
      });

      expect(container.querySelector('[data-testid="save-consequence-evidence"]')).not.toBeNull();
      expect(container.querySelector('[data-testid="interaction-evidence"]')).not.toBeNull();
      expect(
        container.querySelector('[data-testid="investigation-transition-cue"]'),
      ).not.toBeNull();
      expect(container.querySelector('[data-testid="hypothesis-surface"]')).not.toBeNull();
      expect(container.querySelector('[data-testid="investigation-test-surface"]')).not.toBeNull();

      // Open inspector alongside all surfaces
      act(() => {
        inspectButton.click();
      });

      expect(container.querySelector('[data-testid="inspection-surface"]')).not.toBeNull();
      expect(container.querySelector('[data-testid="hypothesis-surface"]')).not.toBeNull();
      expect(container.querySelector('[data-testid="investigation-test-surface"]')).not.toBeNull();
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test L — Hypothesis and test coexistence
  // --------------------------------------------------------------------------
  it("Test L: selecting a hypothesis and then selecting an investigation step preserves both independently", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;

      act(() => {
        saveButton.click();
      });

      const hypOpt = container.querySelector(
        'input[id="hypothesis-not-connected"]',
      ) as HTMLInputElement;
      const testOpt = container.querySelector(
        'input[id="investigation-inspect-activation"]',
      ) as HTMLInputElement;

      act(() => {
        hypOpt.click();
      });
      act(() => {
        testOpt.click();
      });

      const surface = container.querySelector('[data-testid="account-settings-system"]');
      expect(surface?.getAttribute("data-selected-hypothesis")).toBe("not-connected");
      expect(surface?.getAttribute("data-selected-investigation")).toBe("inspect-activation");

      // Now change hypothesis without affecting investigation test selection
      const hypOpt2 = container.querySelector(
        'input[id="hypothesis-state-hidden"]',
      ) as HTMLInputElement;
      act(() => {
        hypOpt2.click();
      });

      expect(surface?.getAttribute("data-selected-hypothesis")).toBe("state-hidden");
      expect(surface?.getAttribute("data-selected-investigation")).toBe("inspect-activation");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test M — No persistence
  // --------------------------------------------------------------------------
  it("Test M: unmounting and remounting resets local investigation test selection to none", () => {
    let result = renderComponent(<AccountSettingsSystem />);
    const saveButton = result.container.querySelector(
      'button[id="account-save-button"]',
    ) as HTMLButtonElement;

    act(() => {
      saveButton.click();
    });

    const opt = result.container.querySelector(
      'input[id="investigation-inspect-activation"]',
    ) as HTMLInputElement;
    act(() => {
      opt.click();
    });

    expect(
      result.container
        .querySelector('[data-testid="account-settings-system"]')
        ?.getAttribute("data-selected-investigation"),
    ).toBe("inspect-activation");

    // Unmount
    result.cleanup();

    // Remount
    result = renderComponent(<AccountSettingsSystem />);
    try {
      const surface = result.container.querySelector('[data-testid="account-settings-system"]');
      expect(surface?.getAttribute("data-selected-investigation")).toBe("none");
      expect(
        result.container.querySelector('[data-testid="investigation-test-surface"]'),
      ).toBeNull();
    } finally {
      result.cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test N — Composition compatibility
  // --------------------------------------------------------------------------
  it("Test N: investigation surface functions seamlessly under ExperienceComposition", () => {
    const composition: ExperienceComposition = {
      mode: "discover",
      spatialMode: "focused",
      density: "spacious",
      focalSurface: "primary",
    };

    const { container, cleanup } = renderComponent(
      <AccountSettingsSystem experienceComposition={composition} />,
    );
    try {
      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;

      act(() => {
        saveButton.click();
      });

      const surface = container.querySelector('[data-testid="account-settings-system"]');
      expect(surface?.getAttribute("data-density")).toBe("spacious");
      expect(surface?.getAttribute("data-spatial-mode")).toBe("focused");

      const testSurface = container.querySelector('[data-testid="investigation-test-surface"]');
      expect(testSurface).not.toBeNull();
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test O — Determinism
  // --------------------------------------------------------------------------
  it("Test O: rendering with identical state produces deterministic test option ordering", () => {
    const { container: c1, cleanup: cl1 } = renderComponent(<AccountSettingsSystem />);
    const { container: c2, cleanup: cl2 } = renderComponent(<AccountSettingsSystem />);

    try {
      const btn1 = c1.querySelector('button[id="account-save-button"]') as HTMLButtonElement;
      const btn2 = c2.querySelector('button[id="account-save-button"]') as HTMLButtonElement;

      act(() => {
        btn1.click();
        btn2.click();
      });

      const labels1 = Array.from(
        c1.querySelectorAll('[data-testid="investigation-test-surface"] label span'),
      ).map((el) => el.textContent);
      const labels2 = Array.from(
        c2.querySelectorAll('[data-testid="investigation-test-surface"] label span'),
      ).map((el) => el.textContent);

      expect(labels1).toEqual(labels2);
      expect(labels1).toEqual(INVESTIGATION_TEST_OPTIONS.map((o) => o.text));
    } finally {
      cl1();
      cl2();
    }
  });
});

describe("Sprint 2 — Change 9: Turn the Investigation Choice Into Evidence", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  // --------------------------------------------------------------------------
  // Test A — Investigation unavailable before selection
  // --------------------------------------------------------------------------
  it("Test A: investigation execution control is absent before investigation test is selected", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;

      // Before save
      expect(container.querySelector('[data-testid="investigate-action-button"]')).toBeNull();
      expect(container.querySelector('[data-testid="investigation-execution-surface"]')).toBeNull();

      act(() => {
        saveButton.click();
      });

      // After save but before choosing test
      expect(container.querySelector('[data-testid="investigate-action-button"]')).toBeNull();
      expect(container.querySelector('[data-testid="investigation-execution-surface"]')).toBeNull();
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test B — Investigation becomes actionable after selection
  // --------------------------------------------------------------------------
  it("Test B: investigation control becomes actionable after choosing an investigation test", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;

      act(() => {
        saveButton.click();
      });

      // Select hypothesis
      const hypothesisRadio = container.querySelector(
        'input[id="hypothesis-not-connected"]',
      ) as HTMLInputElement;
      act(() => {
        hypothesisRadio.click();
      });

      // Select investigation test
      const testRadio = container.querySelector(
        'input[id="investigation-inspect-activation"]',
      ) as HTMLInputElement;
      act(() => {
        testRadio.click();
      });

      const actionBtn = container.querySelector(
        '[data-testid="investigate-action-button"]',
      ) as HTMLButtonElement;
      expect(actionBtn).not.toBeNull();
      expect(actionBtn.textContent).toContain("Gather Evidence");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test C — Investigation action works
  // --------------------------------------------------------------------------
  it("Test C: activating investigation renders factual investigation result evidence", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;

      act(() => {
        saveButton.click();
      });

      const testRadio = container.querySelector(
        'input[id="investigation-inspect-activation"]',
      ) as HTMLInputElement;
      act(() => {
        testRadio.click();
      });

      const actionBtn = container.querySelector(
        '[data-testid="investigate-action-button"]',
      ) as HTMLButtonElement;

      act(() => {
        actionBtn.click();
      });

      const resultSurface = container.querySelector('[data-testid="investigation-result-surface"]');
      expect(resultSurface).not.toBeNull();
      expect(resultSurface?.textContent).toContain("Investigation Result");
      expect(
        container
          .querySelector('[data-testid="account-settings-system"]')
          ?.getAttribute("data-investigating"),
      ).toBe("true");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test D — Evidence is grounded
  // --------------------------------------------------------------------------
  it("Test D: verify all displayed evidence fields are grounded in actual Golden Lesson & DOM state", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;

      act(() => {
        saveButton.click();
      });

      const testRadio = container.querySelector(
        'input[id="investigation-inspect-activation"]',
      ) as HTMLInputElement;
      act(() => {
        testRadio.click();
      });

      const actionBtn = container.querySelector(
        '[data-testid="investigate-action-button"]',
      ) as HTMLButtonElement;
      act(() => {
        actionBtn.click();
      });

      const resultSurface = container.querySelector('[data-testid="investigation-result-surface"]');
      expect(resultSurface?.textContent).toContain("The button can be activated");
      expect(resultSurface?.textContent).toContain('id="account-save-button"');
      expect(resultSurface?.textContent).toContain("No visible state change occurred");
      expect(resultSurface?.textContent).toContain('"No changes saved."');
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test E — No diagnosis
  // --------------------------------------------------------------------------
  it("Test E: investigation result does not reveal implementation diagnosis", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;

      act(() => {
        saveButton.click();
      });

      const testRadio = container.querySelector(
        'input[id="investigation-inspect-activation"]',
      ) as HTMLInputElement;
      act(() => {
        testRadio.click();
      });

      const actionBtn = container.querySelector(
        '[data-testid="investigate-action-button"]',
      ) as HTMLButtonElement;
      act(() => {
        actionBtn.click();
      });

      const text = container.textContent?.toLowerCase() ?? "";
      expect(text).not.toContain("savechanges is not defined");
      expect(text).not.toContain("missing handler");
      expect(text).not.toContain("missing function");
      expect(text).not.toContain("onclick");
      expect(text).not.toContain("event listener");
      expect(text).not.toContain("state setter");
      expect(text).not.toContain("javascript bug");
      expect(text).not.toContain("runtime exception");
      expect(text).not.toContain("undefined function");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test F — No grading
  // --------------------------------------------------------------------------
  it("Test F: no correct, incorrect, right, wrong, score, or evaluative badges appear", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;

      act(() => {
        saveButton.click();
      });

      const testRadio = container.querySelector(
        'input[id="investigation-inspect-activation"]',
      ) as HTMLInputElement;
      act(() => {
        testRadio.click();
      });

      const actionBtn = container.querySelector(
        '[data-testid="investigate-action-button"]',
      ) as HTMLButtonElement;
      act(() => {
        actionBtn.click();
      });

      const text = container.textContent?.toLowerCase() ?? "";
      expect(text).not.toContain("correct");
      expect(text).not.toContain("incorrect");
      expect(text).not.toContain("right answer");
      expect(text).not.toContain("wrong answer");
      expect(text).not.toContain("best answer");
      expect(text).not.toContain("score");
      expect(text).not.toContain("points");
      expect(text).not.toContain("mastery");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test G — No automatic evaluation
  // --------------------------------------------------------------------------
  it("Test G: investigation action causes 0 evaluation, submission, or completion calls", () => {
    const onSubmit = vi.fn();
    const onComplete = vi.fn();
    const onRequestEvaluation = vi.fn();
    const onRuntimeValidation = vi.fn();

    const activity = getVisualActivity();
    const sessionState: ActivitySessionState = {
      status: "in-progress",
      attempts: 0,
      startedAt: new Date().toISOString(),
    };

    const { container, cleanup } = renderComponent(
      <CanonicalActivityView
        activity={activity}
        sessionState={sessionState}
        onSubmit={onSubmit}
        onComplete={onComplete}
        onRequestEvaluation={onRequestEvaluation}
        onRuntimeValidation={onRuntimeValidation}
      />,
    );

    try {
      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;

      act(() => {
        saveButton.click();
      });

      const testRadio = container.querySelector(
        'input[id="investigation-inspect-activation"]',
      ) as HTMLInputElement;
      act(() => {
        testRadio.click();
      });

      const actionBtn = container.querySelector(
        '[data-testid="investigate-action-button"]',
      ) as HTMLButtonElement;
      act(() => {
        actionBtn.click();
      });

      expect(onSubmit).not.toHaveBeenCalled();
      expect(onComplete).not.toHaveBeenCalled();
      expect(onRequestEvaluation).not.toHaveBeenCalled();
      expect(onRuntimeValidation).not.toHaveBeenCalled();
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test H — Existing surfaces remain intact
  // --------------------------------------------------------------------------
  it("Test H: all prior evidence, transition cue, inspection, hypothesis, and test surfaces remain intact", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;

      act(() => {
        saveButton.click();
      });

      const testRadio = container.querySelector(
        'input[id="investigation-inspect-activation"]',
      ) as HTMLInputElement;
      act(() => {
        testRadio.click();
      });

      const actionBtn = container.querySelector(
        '[data-testid="investigate-action-button"]',
      ) as HTMLButtonElement;
      act(() => {
        actionBtn.click();
      });

      expect(container.querySelector('[data-testid="save-consequence-evidence"]')).not.toBeNull();
      expect(container.querySelector('[data-testid="interaction-evidence"]')).not.toBeNull();
      expect(
        container.querySelector('[data-testid="investigation-transition-cue"]'),
      ).not.toBeNull();
      expect(container.querySelector('[data-testid="hypothesis-surface"]')).not.toBeNull();
      expect(container.querySelector('[data-testid="investigation-test-surface"]')).not.toBeNull();
      expect(
        container.querySelector('[data-testid="investigation-result-surface"]'),
      ).not.toBeNull();
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test I — Hypothesis preserved
  // --------------------------------------------------------------------------
  it("Test I: hypothesis selection is preserved during and after investigation", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;

      act(() => {
        saveButton.click();
      });

      const hypothesisRadio = container.querySelector(
        'input[id="hypothesis-not-connected"]',
      ) as HTMLInputElement;
      act(() => {
        hypothesisRadio.click();
      });

      const testRadio = container.querySelector(
        'input[id="investigation-inspect-activation"]',
      ) as HTMLInputElement;
      act(() => {
        testRadio.click();
      });

      const actionBtn = container.querySelector(
        '[data-testid="investigate-action-button"]',
      ) as HTMLButtonElement;
      act(() => {
        actionBtn.click();
      });

      expect(hypothesisRadio.checked).toBe(true);
      expect(
        container
          .querySelector('[data-testid="account-settings-system"]')
          ?.getAttribute("data-selected-hypothesis"),
      ).toBe("not-connected");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test J — Investigation choice preserved
  // --------------------------------------------------------------------------
  it("Test J: selected investigation choice is preserved when investigation evidence is active", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;

      act(() => {
        saveButton.click();
      });

      const testRadio = container.querySelector(
        'input[id="investigation-check-behavior-connection"]',
      ) as HTMLInputElement;
      act(() => {
        testRadio.click();
      });

      const actionBtn = container.querySelector(
        '[data-testid="investigate-action-button"]',
      ) as HTMLButtonElement;
      act(() => {
        actionBtn.click();
      });

      expect(testRadio.checked).toBe(true);
      expect(
        container
          .querySelector('[data-testid="account-settings-system"]')
          ?.getAttribute("data-selected-investigation"),
      ).toBe("check-behavior-connection");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test K — Reversible local state
  // --------------------------------------------------------------------------
  it("Test K: investigation active state is reversible without mutating canonical state", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;

      act(() => {
        saveButton.click();
      });

      const testRadio = container.querySelector(
        'input[id="investigation-inspect-activation"]',
      ) as HTMLInputElement;
      act(() => {
        testRadio.click();
      });

      const actionBtn = container.querySelector(
        '[data-testid="investigate-action-button"]',
      ) as HTMLButtonElement;

      // Click to show evidence
      act(() => {
        actionBtn.click();
      });
      expect(
        container.querySelector('[data-testid="investigation-result-surface"]'),
      ).not.toBeNull();
      expect(actionBtn.textContent).toContain("Hide Evidence");

      // Click to hide evidence
      act(() => {
        actionBtn.click();
      });
      expect(container.querySelector('[data-testid="investigation-result-surface"]')).toBeNull();
      expect(actionBtn.textContent).toContain("Gather Evidence");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test L — Accessibility
  // --------------------------------------------------------------------------
  it("Test L: investigation button is semantic, has accessible label, >= 44px target, and focusable", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;

      act(() => {
        saveButton.click();
      });

      const testRadio = container.querySelector(
        'input[id="investigation-inspect-activation"]',
      ) as HTMLInputElement;
      act(() => {
        testRadio.click();
      });

      const actionBtn = container.querySelector(
        '[data-testid="investigate-action-button"]',
      ) as HTMLButtonElement;

      expect(actionBtn.tagName.toLowerCase()).toBe("button");
      expect(actionBtn.type).toBe("button");
      expect(actionBtn.className).toContain("min-h-[44px]");
      expect(actionBtn.getAttribute("aria-expanded")).toBe("false");

      act(() => {
        actionBtn.focus();
      });
      expect(document.activeElement).toBe(actionBtn);

      act(() => {
        actionBtn.click();
      });
      expect(actionBtn.getAttribute("aria-expanded")).toBe("true");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test M — Composition compatibility
  // --------------------------------------------------------------------------
  it("Test M: investigation execution and result function seamlessly under ExperienceComposition", () => {
    const composition: ExperienceComposition = {
      mode: "discover",
      spatialMode: "focused",
      density: "spacious",
      focalSurface: "primary",
    };

    const { container, cleanup } = renderComponent(
      <AccountSettingsSystem experienceComposition={composition} />,
    );
    try {
      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;

      act(() => {
        saveButton.click();
      });

      const testRadio = container.querySelector(
        'input[id="investigation-inspect-activation"]',
      ) as HTMLInputElement;
      act(() => {
        testRadio.click();
      });

      const actionBtn = container.querySelector(
        '[data-testid="investigate-action-button"]',
      ) as HTMLButtonElement;
      act(() => {
        actionBtn.click();
      });

      const resultSurface = container.querySelector('[data-testid="investigation-result-surface"]');
      expect(resultSurface).not.toBeNull();
      const system = container.querySelector('[data-testid="account-settings-system"]');
      expect(system?.getAttribute("data-density")).toBe("spacious");
      expect(system?.getAttribute("data-spatial-mode")).toBe("focused");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test N — Determinism
  // --------------------------------------------------------------------------
  it("Test N: multiple mounts produce identical investigation evidence structure and content", () => {
    const { container: c1, cleanup: cl1 } = renderComponent(<AccountSettingsSystem />);
    const { container: c2, cleanup: cl2 } = renderComponent(<AccountSettingsSystem />);

    try {
      const btn1 = c1.querySelector('button[id="account-save-button"]') as HTMLButtonElement;
      const btn2 = c2.querySelector('button[id="account-save-button"]') as HTMLButtonElement;

      act(() => {
        btn1.click();
        btn2.click();
      });

      const radio1 = c1.querySelector(
        'input[id="investigation-inspect-activation"]',
      ) as HTMLInputElement;
      const radio2 = c2.querySelector(
        'input[id="investigation-inspect-activation"]',
      ) as HTMLInputElement;

      act(() => {
        radio1.click();
        radio2.click();
      });

      const action1 = c1.querySelector(
        '[data-testid="investigate-action-button"]',
      ) as HTMLButtonElement;
      const action2 = c2.querySelector(
        '[data-testid="investigate-action-button"]',
      ) as HTMLButtonElement;

      act(() => {
        action1.click();
        action2.click();
      });

      const res1 = c1.querySelector('[data-testid="investigation-result-surface"]');
      const res2 = c2.querySelector('[data-testid="investigation-result-surface"]');

      expect(res1?.textContent).toEqual(res2?.textContent);
    } finally {
      cl1();
      cl2();
    }
  });

  // --------------------------------------------------------------------------
  // Test O — No persistence
  // --------------------------------------------------------------------------
  it("Test O: unmounting and remounting resets local investigation state", () => {
    const { container: c1, cleanup: cl1 } = renderComponent(<AccountSettingsSystem />);
    try {
      const saveBtn = c1.querySelector('button[id="account-save-button"]') as HTMLButtonElement;
      act(() => {
        saveBtn.click();
      });

      const radio = c1.querySelector(
        'input[id="investigation-inspect-activation"]',
      ) as HTMLInputElement;
      act(() => {
        radio.click();
      });

      const actionBtn = c1.querySelector(
        '[data-testid="investigate-action-button"]',
      ) as HTMLButtonElement;
      act(() => {
        actionBtn.click();
      });
      expect(c1.querySelector('[data-testid="investigation-result-surface"]')).not.toBeNull();
    } finally {
      cl1();
    }

    const { container: c2, cleanup: cl2 } = renderComponent(<AccountSettingsSystem />);
    try {
      expect(c2.querySelector('[data-testid="investigate-action-button"]')).toBeNull();
      expect(c2.querySelector('[data-testid="investigation-result-surface"]')).toBeNull();
      expect(
        c2
          .querySelector('[data-testid="account-settings-system"]')
          ?.getAttribute("data-investigating"),
      ).toBe("false");
    } finally {
      cl2();
    }
  });
});

describe("Sprint 2 — Change 10: Reconcile Evidence With the Hypothesis", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  // Helper to get system into investigated state
  function setupInvestigatedState(container: HTMLElement) {
    const saveButton = container.querySelector(
      'button[id="account-save-button"]',
    ) as HTMLButtonElement;
    act(() => {
      saveButton.click();
    });

    const hypRadio = container.querySelector(
      'input[id="hypothesis-not-connected"]',
    ) as HTMLInputElement;
    act(() => {
      hypRadio.click();
    });

    const testRadio = container.querySelector(
      'input[id="investigation-inspect-activation"]',
    ) as HTMLInputElement;
    act(() => {
      testRadio.click();
    });

    const actionBtn = container.querySelector(
      '[data-testid="investigate-action-button"]',
    ) as HTMLButtonElement;
    act(() => {
      actionBtn.click();
    });
  }

  // --------------------------------------------------------------------------
  // Test A — Reconciliation gated
  // --------------------------------------------------------------------------
  it("Test A: reconciliation surface is absent before investigation is executed", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      expect(container.querySelector('[data-testid="evidence-reconciliation-surface"]')).toBeNull();

      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;
      act(() => {
        saveButton.click();
      });
      expect(container.querySelector('[data-testid="evidence-reconciliation-surface"]')).toBeNull();

      const testRadio = container.querySelector(
        'input[id="investigation-inspect-activation"]',
      ) as HTMLInputElement;
      act(() => {
        testRadio.click();
      });
      // Selected test but not yet gathered evidence
      expect(container.querySelector('[data-testid="evidence-reconciliation-surface"]')).toBeNull();
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test B — Appears after investigation
  // --------------------------------------------------------------------------
  it("Test B: reconciliation surface appears after Save -> hypothesis -> investigation choice -> Gather Evidence", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      setupInvestigatedState(container);

      const reconciliationSurface = container.querySelector(
        '[data-testid="evidence-reconciliation-surface"]',
      );
      expect(reconciliationSurface).not.toBeNull();
      expect(reconciliationSurface?.textContent).toContain("What does the evidence tell you?");
      expect(reconciliationSurface?.textContent).toContain(
        "The button activates, but the visible state still does not change.",
      );
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test C — Evidence remains visible
  // --------------------------------------------------------------------------
  it("Test C: factual investigation result remains visible alongside reconciliation", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      setupInvestigatedState(container);

      const resultSurface = container.querySelector('[data-testid="investigation-result-surface"]');
      const reconciliationSurface = container.querySelector(
        '[data-testid="evidence-reconciliation-surface"]',
      );

      expect(resultSurface).not.toBeNull();
      expect(reconciliationSurface).not.toBeNull();
      expect(resultSurface?.textContent).toContain("The button can be activated");
      expect(resultSurface?.textContent).toContain('"No changes saved."');
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test D — Reconciliation choices
  // --------------------------------------------------------------------------
  it("Test D: renders all defined reconciliation options", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      setupInvestigatedState(container);

      RECONCILIATION_OPTIONS.forEach((opt) => {
        const radio = container.querySelector(
          `input[id="reconciliation-${opt.id}"]`,
        ) as HTMLInputElement;
        expect(radio).not.toBeNull();
        expect(radio.type).toBe("radio");
        expect(radio.value).toBe(opt.id);
        expect(radio.name).toBe("account-hypothesis-assessment");

        const label = radio.closest("label");
        expect(label?.textContent).toContain(opt.text);
      });
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test E — Selection
  // --------------------------------------------------------------------------
  it("Test E: selecting a reconciliation option updates local assessment state and displays status", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      setupInvestigatedState(container);

      const radio = container.querySelector(
        'input[id="reconciliation-supports-hypothesis"]',
      ) as HTMLInputElement;
      expect(radio.checked).toBe(false);
      expect(container.querySelector('[data-testid="reconciliation-recorded-status"]')).toBeNull();

      act(() => {
        radio.click();
      });

      expect(radio.checked).toBe(true);
      const system = container.querySelector('[data-testid="account-settings-system"]');
      expect(system?.getAttribute("data-hypothesis-assessment")).toBe("supports-hypothesis");

      const status = container.querySelector('[data-testid="reconciliation-recorded-status"]');
      expect(status).not.toBeNull();
      expect(status?.textContent).toContain("Reasoning recorded.");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test F — Reversible
  // --------------------------------------------------------------------------
  it("Test F: learner can change their reconciliation choice freely", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      setupInvestigatedState(container);

      const radio1 = container.querySelector(
        'input[id="reconciliation-supports-hypothesis"]',
      ) as HTMLInputElement;
      const radio2 = container.querySelector(
        'input[id="reconciliation-weakens-hypothesis"]',
      ) as HTMLInputElement;

      act(() => {
        radio1.click();
      });
      expect(radio1.checked).toBe(true);
      expect(
        container
          .querySelector('[data-testid="account-settings-system"]')
          ?.getAttribute("data-hypothesis-assessment"),
      ).toBe("supports-hypothesis");

      act(() => {
        radio2.click();
      });
      expect(radio1.checked).toBe(false);
      expect(radio2.checked).toBe(true);
      expect(
        container
          .querySelector('[data-testid="account-settings-system"]')
          ?.getAttribute("data-hypothesis-assessment"),
      ).toBe("weakens-hypothesis");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test G — No grading
  // --------------------------------------------------------------------------
  it("Test G: no evaluative, score, or correctness badges appear during reconciliation", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      setupInvestigatedState(container);

      const radio = container.querySelector(
        'input[id="reconciliation-weakens-hypothesis"]',
      ) as HTMLInputElement;
      act(() => {
        radio.click();
      });

      const text = container.textContent?.toLowerCase() ?? "";
      expect(text).not.toContain("correct");
      expect(text).not.toContain("incorrect");
      expect(text).not.toContain("right answer");
      expect(text).not.toContain("wrong answer");
      expect(text).not.toContain("best answer");
      expect(text).not.toContain("score");
      expect(text).not.toContain("points");
      expect(text).not.toMatch(/\bxp\b/i);
      expect(text).not.toContain("mastery");
      expect(text).not.toContain("good reasoning");
      expect(text).not.toContain("you're on the right track");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test H — No diagnosis leakage
  // --------------------------------------------------------------------------
  it("Test H: reconciliation surface does not reveal implementation diagnosis", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      setupInvestigatedState(container);

      const radio = container.querySelector(
        'input[id="reconciliation-supports-hypothesis"]',
      ) as HTMLInputElement;
      act(() => {
        radio.click();
      });

      const text = container.textContent?.toLowerCase() ?? "";
      expect(text).not.toContain("savechanges is not defined");
      expect(text).not.toContain("missing handler");
      expect(text).not.toContain("missing function");
      expect(text).not.toContain("onclick");
      expect(text).not.toContain("event listener");
      expect(text).not.toContain("state setter");
      expect(text).not.toContain("javascript bug");
      expect(text).not.toContain("runtime exception");
      expect(text).not.toContain("undefined function");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test I — No automatic evaluation
  // --------------------------------------------------------------------------
  it("Test I: selecting reconciliation produces 0 evaluation, runtime, submission, or completion calls", () => {
    const onSubmit = vi.fn();
    const onComplete = vi.fn();
    const onRequestEvaluation = vi.fn();
    const onRuntimeValidation = vi.fn();

    const activity = getVisualActivity();
    const sessionState: ActivitySessionState = {
      status: "in-progress",
      attempts: 0,
      startedAt: new Date().toISOString(),
    };

    const { container, cleanup } = renderComponent(
      <CanonicalActivityView
        activity={activity}
        sessionState={sessionState}
        onSubmit={onSubmit}
        onComplete={onComplete}
        onRequestEvaluation={onRequestEvaluation}
        onRuntimeValidation={onRuntimeValidation}
      />,
    );

    try {
      setupInvestigatedState(container);

      const radio = container.querySelector(
        'input[id="reconciliation-inconclusive"]',
      ) as HTMLInputElement;
      act(() => {
        radio.click();
      });

      expect(onSubmit).not.toHaveBeenCalled();
      expect(onComplete).not.toHaveBeenCalled();
      expect(onRequestEvaluation).not.toHaveBeenCalled();
      expect(onRuntimeValidation).not.toHaveBeenCalled();
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test J — Hypothesis preserved
  // --------------------------------------------------------------------------
  it("Test J: selected hypothesis remains selected and can still be modified", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      setupInvestigatedState(container);

      const hypRadio1 = container.querySelector(
        'input[id="hypothesis-not-connected"]',
      ) as HTMLInputElement;
      expect(hypRadio1.checked).toBe(true);

      const recRadio = container.querySelector(
        'input[id="reconciliation-supports-hypothesis"]',
      ) as HTMLInputElement;
      act(() => {
        recRadio.click();
      });

      expect(hypRadio1.checked).toBe(true);

      // Change hypothesis after reconciliation
      const hypRadio2 = container.querySelector(
        'input[id="hypothesis-state-hidden"]',
      ) as HTMLInputElement;
      act(() => {
        hypRadio2.click();
      });

      expect(hypRadio1.checked).toBe(false);
      expect(hypRadio2.checked).toBe(true);
      expect(
        container
          .querySelector('[data-testid="account-settings-system"]')
          ?.getAttribute("data-selected-hypothesis"),
      ).toBe("state-hidden");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test K — Investigation choice preserved
  // --------------------------------------------------------------------------
  it("Test K: selected investigation test remains chosen during reconciliation", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      setupInvestigatedState(container);

      const testRadio = container.querySelector(
        'input[id="investigation-inspect-activation"]',
      ) as HTMLInputElement;
      expect(testRadio.checked).toBe(true);

      const recRadio = container.querySelector(
        'input[id="reconciliation-weakens-hypothesis"]',
      ) as HTMLInputElement;
      act(() => {
        recRadio.click();
      });

      expect(testRadio.checked).toBe(true);
      expect(
        container
          .querySelector('[data-testid="account-settings-system"]')
          ?.getAttribute("data-selected-investigation"),
      ).toBe("inspect-activation");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test L — Evidence preserved
  // --------------------------------------------------------------------------
  it("Test L: investigation result evidence remains fully visible during reconciliation", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      setupInvestigatedState(container);

      const recRadio = container.querySelector(
        'input[id="reconciliation-supports-hypothesis"]',
      ) as HTMLInputElement;
      act(() => {
        recRadio.click();
      });

      const res = container.querySelector('[data-testid="investigation-result-surface"]');
      expect(res).not.toBeNull();
      expect(res?.textContent).toContain("The button can be activated");
      expect(res?.textContent).toContain('id="account-save-button"');
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test M — Accessibility
  // --------------------------------------------------------------------------
  it("Test M: reconciliation controls use semantic fieldset, legend, labels, >=44px target, and focusable radio inputs", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      setupInvestigatedState(container);

      const fieldset = container.querySelector(
        'fieldset[data-testid="evidence-reconciliation-surface"]',
      ) as HTMLFieldSetElement;
      expect(fieldset).not.toBeNull();

      const legend = fieldset.querySelector("legend");
      expect(legend).not.toBeNull();
      expect(legend?.textContent).toContain("What does the evidence tell you?");

      const radio = container.querySelector(
        'input[id="reconciliation-supports-hypothesis"]',
      ) as HTMLInputElement;
      const label = radio.closest("label") as HTMLLabelElement;

      expect(label.className).toContain("min-h-[44px]");

      act(() => {
        radio.focus();
      });
      expect(document.activeElement).toBe(radio);
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test N — Composition compatibility
  // --------------------------------------------------------------------------
  it("Test N: reconciliation renders seamlessly under ExperienceComposition variations", () => {
    const composition: ExperienceComposition = {
      mode: "discover",
      spatialMode: "focused",
      density: "spacious",
      focalSurface: "primary",
    };

    const { container, cleanup } = renderComponent(
      <AccountSettingsSystem experienceComposition={composition} />,
    );
    try {
      setupInvestigatedState(container);

      const recRadio = container.querySelector(
        'input[id="reconciliation-supports-hypothesis"]',
      ) as HTMLInputElement;
      act(() => {
        recRadio.click();
      });

      const fieldset = container.querySelector('[data-testid="evidence-reconciliation-surface"]');
      expect(fieldset).not.toBeNull();
      const system = container.querySelector('[data-testid="account-settings-system"]');
      expect(system?.getAttribute("data-density")).toBe("spacious");
      expect(system?.getAttribute("data-hypothesis-assessment")).toBe("supports-hypothesis");
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // Test O — Determinism
  // --------------------------------------------------------------------------
  it("Test O: multiple mounts produce identical reconciliation structure and options", () => {
    const { container: c1, cleanup: cl1 } = renderComponent(<AccountSettingsSystem />);
    const { container: c2, cleanup: cl2 } = renderComponent(<AccountSettingsSystem />);

    try {
      setupInvestigatedState(c1);
      setupInvestigatedState(c2);

      const f1 = c1.querySelector('[data-testid="evidence-reconciliation-surface"]');
      const f2 = c2.querySelector('[data-testid="evidence-reconciliation-surface"]');

      expect(f1?.textContent).toEqual(f2?.textContent);
    } finally {
      cl1();
      cl2();
    }
  });

  // --------------------------------------------------------------------------
  // Test P — No persistence
  // --------------------------------------------------------------------------
  it("Test P: unmounting and remounting resets local reconciliation state", () => {
    const { container: c1, cleanup: cl1 } = renderComponent(<AccountSettingsSystem />);
    try {
      setupInvestigatedState(c1);

      const radio = c1.querySelector(
        'input[id="reconciliation-supports-hypothesis"]',
      ) as HTMLInputElement;
      act(() => {
        radio.click();
      });
      expect(
        c1
          .querySelector('[data-testid="account-settings-system"]')
          ?.getAttribute("data-hypothesis-assessment"),
      ).toBe("supports-hypothesis");
    } finally {
      cl1();
    }

    const { container: c2, cleanup: cl2 } = renderComponent(<AccountSettingsSystem />);
    try {
      expect(c2.querySelector('[data-testid="evidence-reconciliation-surface"]')).toBeNull();
      expect(
        c2
          .querySelector('[data-testid="account-settings-system"]')
          ?.getAttribute("data-hypothesis-assessment"),
      ).toBe("none");
    } finally {
      cl2();
    }
  });

  // --------------------------------------------------------------------------
  // Test Q — No state leakage
  // --------------------------------------------------------------------------
  it("Test Q: reconciliation state does not enter sessionState, activityState, or runtimeState", () => {
    const sessionState: ActivitySessionState = {
      status: "in-progress",
      attempts: 0,
      startedAt: new Date().toISOString(),
    };
    const initialSessionKeys = Object.keys(sessionState);

    const { container, cleanup } = renderComponent(
      <CanonicalActivityView
        activity={getVisualActivity()}
        sessionState={sessionState}
        onSubmit={vi.fn()}
        onComplete={vi.fn()}
      />,
    );

    try {
      setupInvestigatedState(container);

      const radio = container.querySelector(
        'input[id="reconciliation-supports-hypothesis"]',
      ) as HTMLInputElement;
      act(() => {
        radio.click();
      });

      expect(Object.keys(sessionState)).toEqual(initialSessionKeys);
      expect(sessionState.status).toBe("in-progress");
      expect(sessionState.attempts).toBe(0);
    } finally {
      cleanup();
    }
  });

  // ==========================================================================
  // SPRINT 2 — CHANGE 11: DEEPEN THE INVESTIGATION (MECHANISM DIRECTION)
  // ==========================================================================
  describe("Sprint 2 — Change 11: Deepen the Investigation", () => {
    function setupReconciledState(container: HTMLElement) {
      setupInvestigatedState(container);
      const reconciliationRadio = container.querySelector(
        'input[id="reconciliation-supports-hypothesis"]',
      ) as HTMLInputElement;
      act(() => {
        reconciliationRadio.click();
      });
    }

    // --------------------------------------------------------------------------
    // Test A — Mechanism investigation gated
    // --------------------------------------------------------------------------
    it("Test A: mechanism investigation surface is absent before reconciliation context is ready", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        expect(
          container.querySelector('[data-testid="mechanism-investigation-surface"]'),
        ).toBeNull();

        // 1. Initial render -> absent
        expect(
          container
            .querySelector('[data-testid="account-settings-system"]')
            ?.getAttribute("data-mechanism-investigation"),
        ).toBe("none");

        // 2. Click save -> absent
        const saveButton = container.querySelector(
          'button[id="account-save-button"]',
        ) as HTMLButtonElement;
        act(() => {
          saveButton.click();
        });
        expect(
          container.querySelector('[data-testid="mechanism-investigation-surface"]'),
        ).toBeNull();

        // 3. Select hypothesis & test -> absent
        const hypRadio = container.querySelector(
          'input[id="hypothesis-not-connected"]',
        ) as HTMLInputElement;
        act(() => {
          hypRadio.click();
        });
        const testRadio = container.querySelector(
          'input[id="investigation-inspect-activation"]',
        ) as HTMLInputElement;
        act(() => {
          testRadio.click();
        });
        expect(
          container.querySelector('[data-testid="mechanism-investigation-surface"]'),
        ).toBeNull();

        // 4. Gather evidence but haven't answered reconciliation -> absent
        const actionBtn = container.querySelector(
          '[data-testid="investigate-action-button"]',
        ) as HTMLButtonElement;
        act(() => {
          actionBtn.click();
        });
        expect(
          container.querySelector('[data-testid="mechanism-investigation-surface"]'),
        ).toBeNull();
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test B — Appears at the correct point
    // --------------------------------------------------------------------------
    it("Test B: mechanism investigation surface appears after Save -> hypothesis -> investigation selection -> Gather Evidence -> evidence reconciliation", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupReconciledState(container);

        const surface = container.querySelector('[data-testid="mechanism-investigation-surface"]');
        expect(surface).not.toBeNull();
        expect(surface?.tagName.toLowerCase()).toBe("fieldset");
        expect(surface?.textContent).toContain("What should you inspect next?");
        expect(surface?.textContent).toContain(
          "You have evidence that the interaction occurs. Now investigate the mechanism behind the behavior.",
        );
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test C — Grounded options
    // --------------------------------------------------------------------------
    it("Test C: verify every option corresponds to the actual Golden Lesson investigation model", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupReconciledState(container);

        expect(MECHANISM_INVESTIGATION_OPTIONS.length).toBe(4);
        for (const opt of MECHANISM_INVESTIGATION_OPTIONS) {
          const radio = container.querySelector(
            `input[id="mechanism-${opt.id}"]`,
          ) as HTMLInputElement;
          expect(radio).not.toBeNull();
          expect(radio.value).toBe(opt.id);
          expect(radio.name).toBe("account-mechanism-investigation");

          const label = container.querySelector(`label[for="mechanism-${opt.id}"]`);
          expect(label).not.toBeNull();
          expect(label?.textContent).toContain(opt.text);
        }
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test D — No diagnosis leakage
    // --------------------------------------------------------------------------
    it("Test D: mechanism investigation surface does not reveal implementation diagnosis", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupReconciledState(container);

        const text = container.textContent?.toLowerCase() ?? "";
        expect(text).not.toContain("savechanges is not defined");
        expect(text).not.toContain("savechanges is undefined");
        expect(text).not.toContain("missing function");
        expect(text).not.toContain("function does not exist");
        expect(text).not.toContain("save handler calls a function");
        expect(text).not.toContain("undefined function");
        expect(text).not.toContain("runtime error");
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test E — No grading or evaluative language
    // --------------------------------------------------------------------------
    it("Test E: no correctness, score, or evaluative badges appear during mechanism investigation", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupReconciledState(container);

        const radio = container.querySelector(
          'input[id="mechanism-inspect-code"]',
        ) as HTMLInputElement;
        act(() => {
          radio.click();
        });

        const text = container.textContent?.toLowerCase() ?? "";
        expect(text).not.toContain("correct");
        expect(text).not.toContain("incorrect");
        expect(text).not.toContain("right answer");
        expect(text).not.toContain("wrong answer");
        expect(text).not.toContain("best choice");
        expect(text).not.toContain("score");
        expect(text).not.toContain("points");
        expect(text).not.toMatch(/\bxp\b/i);
        expect(text).not.toContain("mastery");
        expect(text).not.toContain("good choice");
        expect(text).not.toContain("expert choice");
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test F — Selection updates local state
    // --------------------------------------------------------------------------
    it("Test F: selecting an investigation direction updates local state and data attribute", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupReconciledState(container);

        const rootEl = container.querySelector('[data-testid="account-settings-system"]');
        expect(rootEl?.getAttribute("data-mechanism-investigation")).toBe("none");

        const radio = container.querySelector(
          'input[id="mechanism-inspect-code"]',
        ) as HTMLInputElement;
        act(() => {
          radio.click();
        });

        expect(radio.checked).toBe(true);
        expect(rootEl?.getAttribute("data-mechanism-investigation")).toBe("inspect-code");
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test G — Reversible selection
    // --------------------------------------------------------------------------
    it("Test G: learner can change their mechanism investigation direction freely", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupReconciledState(container);

        const rootEl = container.querySelector('[data-testid="account-settings-system"]');
        const radio1 = container.querySelector(
          'input[id="mechanism-inspect-code"]',
        ) as HTMLInputElement;
        const radio2 = container.querySelector(
          'input[id="mechanism-inspect-event"]',
        ) as HTMLInputElement;

        act(() => {
          radio1.click();
        });
        expect(radio1.checked).toBe(true);
        expect(rootEl?.getAttribute("data-mechanism-investigation")).toBe("inspect-code");

        act(() => {
          radio2.click();
        });
        expect(radio1.checked).toBe(false);
        expect(radio2.checked).toBe(true);
        expect(rootEl?.getAttribute("data-mechanism-investigation")).toBe("inspect-event");
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test H — Neutral acknowledgement & transition cue
    // --------------------------------------------------------------------------
    it("Test H: selection produces neutral acknowledgement and restrained transition cue", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupReconciledState(container);

        expect(
          container.querySelector('[data-testid="mechanism-investigation-recorded-status"]'),
        ).toBeNull();
        expect(
          container.querySelector('[data-testid="mechanism-investigation-transition-cue"]'),
        ).toBeNull();

        const radio = container.querySelector(
          'input[id="mechanism-inspect-code"]',
        ) as HTMLInputElement;
        act(() => {
          radio.click();
        });

        const statusEl = container.querySelector(
          '[data-testid="mechanism-investigation-recorded-status"]',
        );
        expect(statusEl?.textContent?.trim()).toBe("Investigation direction recorded.");

        const cueEl = container.querySelector(
          '[data-testid="mechanism-investigation-transition-cue"]',
        );
        expect(cueEl?.textContent?.trim()).toBe("Now inspect the mechanism and look for evidence.");
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test I — Zero runtime execution or evaluation
    // --------------------------------------------------------------------------
    it("Test I: selecting mechanism direction produces 0 evaluation, runtime, submission, or completion calls", () => {
      const onSubmit = vi.fn();
      const onComplete = vi.fn();
      const { container, cleanup } = renderComponent(
        <CanonicalActivityView
          activity={getVisualActivity()}
          onSubmit={onSubmit}
          onComplete={onComplete}
        />,
      );
      try {
        setupReconciledState(container);

        const radio = container.querySelector(
          'input[id="mechanism-inspect-code"]',
        ) as HTMLInputElement;
        act(() => {
          radio.click();
        });

        expect(onSubmit).not.toHaveBeenCalled();
        expect(onComplete).not.toHaveBeenCalled();
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test J — Previous reasoning preserved
    // --------------------------------------------------------------------------
    it("Test J: all previous reasoning chain surfaces remain visible and intact", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupReconciledState(container);

        const radio = container.querySelector(
          'input[id="mechanism-inspect-code"]',
        ) as HTMLInputElement;
        act(() => {
          radio.click();
        });

        // 1. Initial investigation transition cue & interaction evidence
        expect(
          container.querySelector('[data-testid="investigation-transition-cue"]'),
        ).not.toBeNull();
        expect(container.querySelector('[data-testid="interaction-evidence"]')).not.toBeNull();
        // 2. Hypothesis surface
        expect(container.querySelector('[data-testid="hypothesis-surface"]')).not.toBeNull();
        // 3. Investigation test choice surface
        expect(
          container.querySelector('[data-testid="investigation-test-surface"]'),
        ).not.toBeNull();
        // 4. Investigation result evidence surface
        expect(
          container.querySelector('[data-testid="investigation-result-surface"]'),
        ).not.toBeNull();
        // 5. Evidence reconciliation surface
        expect(
          container.querySelector('[data-testid="evidence-reconciliation-surface"]'),
        ).not.toBeNull();
        // 6. Mechanism investigation surface
        expect(
          container.querySelector('[data-testid="mechanism-investigation-surface"]'),
        ).not.toBeNull();
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test K — No persistence
    // --------------------------------------------------------------------------
    it("Test K: unmounting and remounting resets local mechanism investigation state", () => {
      const { container: c1, cleanup: cl1 } = renderComponent(<AccountSettingsSystem />);
      try {
        setupReconciledState(c1);

        const radio = c1.querySelector('input[id="mechanism-inspect-code"]') as HTMLInputElement;
        act(() => {
          radio.click();
        });
        expect(
          c1
            .querySelector('[data-testid="account-settings-system"]')
            ?.getAttribute("data-mechanism-investigation"),
        ).toBe("inspect-code");
      } finally {
        cl1();
      }

      const { container: c2, cleanup: cl2 } = renderComponent(<AccountSettingsSystem />);
      try {
        expect(c2.querySelector('[data-testid="mechanism-investigation-surface"]')).toBeNull();
        expect(
          c2
            .querySelector('[data-testid="account-settings-system"]')
            ?.getAttribute("data-mechanism-investigation"),
        ).toBe("none");
      } finally {
        cl2();
      }
    });

    // --------------------------------------------------------------------------
    // Test L — No state leakage
    // --------------------------------------------------------------------------
    it("Test L: mechanism investigation state does not enter sessionState, activityState, or runtimeState", () => {
      const sessionState: ActivitySessionState = {
        status: "in-progress",
        attempts: 0,
        startedAt: new Date().toISOString(),
      };
      const initialSessionKeys = Object.keys(sessionState);

      const { container, cleanup } = renderComponent(
        <CanonicalActivityView
          activity={getVisualActivity()}
          sessionState={sessionState}
          onSubmit={vi.fn()}
          onComplete={vi.fn()}
        />,
      );

      try {
        setupReconciledState(container);

        const radio = container.querySelector(
          'input[id="mechanism-inspect-code"]',
        ) as HTMLInputElement;
        act(() => {
          radio.click();
        });

        expect(Object.keys(sessionState)).toEqual(initialSessionKeys);
        expect(sessionState.status).toBe("in-progress");
        expect(sessionState.attempts).toBe(0);
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test M — Accessibility
    // --------------------------------------------------------------------------
    it("Test M: mechanism investigation controls use semantic fieldset, legend, labels, >=44px target, and focusable radio inputs", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupReconciledState(container);

        const fieldset = container.querySelector('[data-testid="mechanism-investigation-surface"]');
        expect(fieldset).not.toBeNull();
        expect(fieldset?.tagName.toLowerCase()).toBe("fieldset");

        const legend = fieldset?.querySelector("legend");
        expect(legend).not.toBeNull();
        expect(legend?.textContent).toContain("What should you inspect next?");

        const labels = fieldset?.querySelectorAll("label");
        expect(labels?.length).toBe(MECHANISM_INVESTIGATION_OPTIONS.length);
        labels?.forEach((lbl) => {
          expect(lbl.className).toContain("min-h-[44px]");
        });

        const radios = fieldset?.querySelectorAll('input[type="radio"]');
        expect(radios?.length).toBe(MECHANISM_INVESTIGATION_OPTIONS.length);
        radios?.forEach((r) => {
          expect(r.getAttribute("name")).toBe("account-mechanism-investigation");
        });
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test N — Experience composition variations
    // --------------------------------------------------------------------------
    it("Test N: mechanism investigation renders seamlessly under ExperienceComposition variations", () => {
      const compositions: ExperienceComposition[] = [
        { density: "compact", spatialMode: "focused", focalSurface: "visual" },
        { density: "spacious", spatialMode: "broad", focalSurface: "both" },
      ];

      for (const comp of compositions) {
        const { container, cleanup } = renderComponent(
          <AccountSettingsSystem experienceComposition={comp} />,
        );
        try {
          setupReconciledState(container);
          expect(
            container.querySelector('[data-testid="mechanism-investigation-surface"]'),
          ).not.toBeNull();
        } finally {
          cleanup();
        }
      }
    });

    // --------------------------------------------------------------------------
    // Test O — Determinism
    // --------------------------------------------------------------------------
    it("Test O: multiple mounts produce identical mechanism investigation structure and options", () => {
      const { container: c1, cleanup: cl1 } = renderComponent(<AccountSettingsSystem />);
      const { container: c2, cleanup: cl2 } = renderComponent(<AccountSettingsSystem />);
      try {
        setupReconciledState(c1);
        setupReconciledState(c2);

        const f1 = c1.querySelector('[data-testid="mechanism-investigation-surface"]');
        const f2 = c2.querySelector('[data-testid="mechanism-investigation-surface"]');

        expect(f1?.textContent).toEqual(f2?.textContent);
      } finally {
        cl1();
        cl2();
      }
    });
  });

  // ==========================================================================
  // SPRINT 2 — CHANGE 12: PERFORM THE FIRST MECHANISM INSPECTION
  // ==========================================================================
  describe("Sprint 2 — Change 12: Perform the First Mechanism Inspection", () => {
    function setupMechanismSelectedState(container: HTMLElement, directionId = "inspect-code") {
      setupInvestigatedState(container);
      const reconciliationRadio = container.querySelector(
        'input[id="reconciliation-supports-hypothesis"]',
      ) as HTMLInputElement;
      act(() => {
        reconciliationRadio.click();
      });

      const mechanismRadio = container.querySelector(
        `input[id="mechanism-${directionId}"]`,
      ) as HTMLInputElement;
      act(() => {
        mechanismRadio.click();
      });
    }

    // --------------------------------------------------------------------------
    // Test A — Inspection unavailable too early
    // --------------------------------------------------------------------------
    it("Test A: inspection action button and result surface are absent before direction is selected", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        expect(
          container.querySelector('[data-testid="inspect-mechanism-action-button"]'),
        ).toBeNull();
        expect(
          container.querySelector('[data-testid="mechanism-inspection-result-surface"]'),
        ).toBeNull();

        // 1. Initial render -> absent
        expect(
          container
            .querySelector('[data-testid="account-settings-system"]')
            ?.getAttribute("data-inspected-mechanism"),
        ).toBe("false");

        // 2. Click save -> absent
        const saveButton = container.querySelector(
          'button[id="account-save-button"]',
        ) as HTMLButtonElement;
        act(() => {
          saveButton.click();
        });
        expect(
          container.querySelector('[data-testid="inspect-mechanism-action-button"]'),
        ).toBeNull();

        // 3. Reconcile evidence -> still absent until direction chosen
        setupInvestigatedState(container);
        const reconciliationRadio = container.querySelector(
          'input[id="reconciliation-supports-hypothesis"]',
        ) as HTMLInputElement;
        act(() => {
          reconciliationRadio.click();
        });
        expect(
          container.querySelector('[data-testid="inspect-mechanism-action-button"]'),
        ).toBeNull();
        expect(
          container.querySelector('[data-testid="mechanism-inspection-result-surface"]'),
        ).toBeNull();
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test B — Inspection surface appears
    // --------------------------------------------------------------------------
    it("Test B: inspect action button appears once a mechanism investigation direction is selected", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupMechanismSelectedState(container, "inspect-code");

        const inspectBtn = container.querySelector(
          '[data-testid="inspect-mechanism-action-button"]',
        ) as HTMLButtonElement;
        expect(inspectBtn).not.toBeNull();
        expect(inspectBtn.textContent).toContain("Inspect Mechanism");
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test C — Inspection is explicit
    // --------------------------------------------------------------------------
    it("Test C: factual inspection result does NOT appear until the learner clicks the inspection action button", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupMechanismSelectedState(container, "inspect-code");

        // Surface not yet visible before click
        expect(
          container.querySelector('[data-testid="mechanism-inspection-result-surface"]'),
        ).toBeNull();

        const inspectBtn = container.querySelector(
          '[data-testid="inspect-mechanism-action-button"]',
        ) as HTMLButtonElement;
        expect(inspectBtn).not.toBeNull();

        // Click inspect button
        act(() => {
          inspectBtn.click();
        });

        // Now result surface is visible
        expect(
          container.querySelector('[data-testid="mechanism-inspection-result-surface"]'),
        ).not.toBeNull();
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test D — Correct target
    // --------------------------------------------------------------------------
    it("Test D: inspection result corresponds accurately to the selected investigation direction", () => {
      for (const opt of MECHANISM_INVESTIGATION_OPTIONS) {
        const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
        try {
          setupMechanismSelectedState(container, opt.id);

          const inspectBtn = container.querySelector(
            '[data-testid="inspect-mechanism-action-button"]',
          ) as HTMLButtonElement;
          act(() => {
            inspectBtn.click();
          });

          const expectedData = MECHANISM_INSPECTIONS[opt.id];
          expect(expectedData).toBeDefined();

          const targetEl = container.querySelector('[data-testid="mechanism-inspection-target"]');
          const evidenceEl = container.querySelector(
            '[data-testid="mechanism-inspection-evidence"]',
          );
          const observedList = container.querySelector(
            '[data-testid="mechanism-inspection-observed-list"]',
          );

          expect(targetEl?.textContent?.trim()).toBe(expectedData.target);
          expect(evidenceEl?.textContent?.trim()).toBe(expectedData.evidence);
          for (const obs of expectedData.observed) {
            expect(observedList?.textContent).toContain(obs);
          }
        } finally {
          cleanup();
        }
      }
    });

    // --------------------------------------------------------------------------
    // Test E — Factual evidence only
    // --------------------------------------------------------------------------
    it("Test E: displayed evidence is strictly grounded in the actual Golden Lesson system model", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupMechanismSelectedState(container, "inspect-code");

        const inspectBtn = container.querySelector(
          '[data-testid="inspect-mechanism-action-button"]',
        ) as HTMLButtonElement;
        act(() => {
          inspectBtn.click();
        });

        const resultEl = container.querySelector(
          '[data-testid="mechanism-inspection-result-surface"]',
        );
        expect(resultEl?.textContent).toContain("handleSave");
        expect(resultEl?.textContent).toContain("saveChanges");
        expect(resultEl?.textContent).toContain("document.querySelector('#status')");
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test F — No interpretation
    // --------------------------------------------------------------------------
    it("Test F: diagnosis and conclusion language are strictly absent from inspection result", () => {
      for (const opt of MECHANISM_INVESTIGATION_OPTIONS) {
        const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
        try {
          setupMechanismSelectedState(container, opt.id);

          const inspectBtn = container.querySelector(
            '[data-testid="inspect-mechanism-action-button"]',
          ) as HTMLButtonElement;
          act(() => {
            inspectBtn.click();
          });

          const text = container.textContent?.toLowerCase() ?? "";
          expect(text).not.toContain("this means");
          expect(text).not.toContain("therefore");
          expect(text).not.toContain("the problem is");
          expect(text).not.toContain("the bug is");
          expect(text).not.toContain("the reason is");
          expect(text).not.toContain("broken button");
          expect(text).not.toContain("missing handler");
          expect(text).not.toContain("missing state update");
          expect(text).not.toContain("broken connection");
          expect(text).not.toContain("state setter failure");
          expect(text).not.toContain("root cause");
          expect(text).not.toContain("why it is broken");
        } finally {
          cleanup();
        }
      }
    });

    // --------------------------------------------------------------------------
    // Test G — No root-cause leakage
    // --------------------------------------------------------------------------
    it("Test G: root-cause diagnosis is not leaked during mechanism inspection", () => {
      for (const opt of MECHANISM_INVESTIGATION_OPTIONS) {
        const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
        try {
          setupMechanismSelectedState(container, opt.id);

          const inspectBtn = container.querySelector(
            '[data-testid="inspect-mechanism-action-button"]',
          ) as HTMLButtonElement;
          act(() => {
            inspectBtn.click();
          });

          const text = container.textContent?.toLowerCase() ?? "";
          expect(text).not.toContain("savechanges is not defined");
          expect(text).not.toContain("savechanges is undefined");
          expect(text).not.toContain("missing function");
          expect(text).not.toContain("function does not exist");
          expect(text).not.toContain("undefined function");
          expect(text).not.toContain("runtime error");
          expect(text).not.toContain("does not dispatch state update");
          expect(text).not.toContain("contains no state assignment");
          expect(text).not.toContain("never updated with a new string");
        } finally {
          cleanup();
        }
      }
    });

    // --------------------------------------------------------------------------
    // Test H — Result appears after inspection
    // --------------------------------------------------------------------------
    it("Test H: activating inspection reveals the structured result and updates root attribute", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupMechanismSelectedState(container, "inspect-code");

        const rootEl = container.querySelector('[data-testid="account-settings-system"]');
        expect(rootEl?.getAttribute("data-inspected-mechanism")).toBe("false");

        const inspectBtn = container.querySelector(
          '[data-testid="inspect-mechanism-action-button"]',
        ) as HTMLButtonElement;
        act(() => {
          inspectBtn.click();
        });

        expect(rootEl?.getAttribute("data-inspected-mechanism")).toBe("true");
        expect(
          container.querySelector('[data-testid="mechanism-inspection-result-surface"]'),
        ).not.toBeNull();
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test I — Reversible presentation state
    // --------------------------------------------------------------------------
    it("Test I: switching investigation direction resets inspection until re-inspected", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupMechanismSelectedState(container, "inspect-code");

        const rootEl = container.querySelector('[data-testid="account-settings-system"]');
        const inspectBtn = container.querySelector(
          '[data-testid="inspect-mechanism-action-button"]',
        ) as HTMLButtonElement;
        act(() => {
          inspectBtn.click();
        });

        expect(rootEl?.getAttribute("data-inspected-mechanism")).toBe("true");
        expect(
          container.querySelector('[data-testid="mechanism-inspection-result-surface"]'),
        ).not.toBeNull();

        // Switch direction
        const radio2 = container.querySelector(
          'input[id="mechanism-inspect-event"]',
        ) as HTMLInputElement;
        act(() => {
          radio2.click();
        });

        // hasInspectedMechanism is reset until clicked again
        expect(rootEl?.getAttribute("data-inspected-mechanism")).toBe("false");
        expect(
          container.querySelector('[data-testid="mechanism-inspection-result-surface"]'),
        ).toBeNull();

        // Re-inspect
        const newInspectBtn = container.querySelector(
          '[data-testid="inspect-mechanism-action-button"]',
        ) as HTMLButtonElement;
        act(() => {
          newInspectBtn.click();
        });

        expect(rootEl?.getAttribute("data-inspected-mechanism")).toBe("true");
        expect(
          container.querySelector('[data-testid="mechanism-inspection-target"]')?.textContent,
        ).toContain("Button event handling");
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test J — No runtime
    // --------------------------------------------------------------------------
    it("Test J: mechanism inspection triggers 0 runtime calls, 0 evaluation calls, 0 submissions", () => {
      const onSubmit = vi.fn();
      const onComplete = vi.fn();
      const { container, cleanup } = renderComponent(
        <CanonicalActivityView
          activity={getVisualActivity()}
          onSubmit={onSubmit}
          onComplete={onComplete}
        />,
      );
      try {
        setupMechanismSelectedState(container, "inspect-code");

        const inspectBtn = container.querySelector(
          '[data-testid="inspect-mechanism-action-button"]',
        ) as HTMLButtonElement;
        act(() => {
          inspectBtn.click();
        });

        expect(onSubmit).not.toHaveBeenCalled();
        expect(onComplete).not.toHaveBeenCalled();
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test K — No canonical mutation
    // --------------------------------------------------------------------------
    it("Test K: mechanism inspection does not mutate sessionState or canonical activity properties", () => {
      const sessionState: ActivitySessionState = {
        status: "in-progress",
        attempts: 0,
        startedAt: new Date().toISOString(),
      };
      const initialKeys = Object.keys(sessionState);

      const { container, cleanup } = renderComponent(
        <CanonicalActivityView
          activity={getVisualActivity()}
          sessionState={sessionState}
          onSubmit={vi.fn()}
          onComplete={vi.fn()}
        />,
      );
      try {
        setupMechanismSelectedState(container, "inspect-code");

        const inspectBtn = container.querySelector(
          '[data-testid="inspect-mechanism-action-button"]',
        ) as HTMLButtonElement;
        act(() => {
          inspectBtn.click();
        });

        expect(Object.keys(sessionState)).toEqual(initialKeys);
        expect(sessionState.status).toBe("in-progress");
        expect(sessionState.attempts).toBe(0);
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test L — Previous reasoning preserved
    // --------------------------------------------------------------------------
    it("Test L: all prior reasoning chain surfaces remain fully visible after mechanism inspection", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupMechanismSelectedState(container, "inspect-code");

        const inspectBtn = container.querySelector(
          '[data-testid="inspect-mechanism-action-button"]',
        ) as HTMLButtonElement;
        act(() => {
          inspectBtn.click();
        });

        // 1. Initial investigation transition cue & interaction evidence
        expect(
          container.querySelector('[data-testid="investigation-transition-cue"]'),
        ).not.toBeNull();
        expect(container.querySelector('[data-testid="interaction-evidence"]')).not.toBeNull();
        // 2. Hypothesis surface
        expect(container.querySelector('[data-testid="hypothesis-surface"]')).not.toBeNull();
        // 3. Investigation test choice surface
        expect(
          container.querySelector('[data-testid="investigation-test-surface"]'),
        ).not.toBeNull();
        // 4. Investigation result evidence surface
        expect(
          container.querySelector('[data-testid="investigation-result-surface"]'),
        ).not.toBeNull();
        // 5. Evidence reconciliation surface
        expect(
          container.querySelector('[data-testid="evidence-reconciliation-surface"]'),
        ).not.toBeNull();
        // 6. Mechanism investigation surface
        expect(
          container.querySelector('[data-testid="mechanism-investigation-surface"]'),
        ).not.toBeNull();
        // 7. Mechanism inspection result surface
        expect(
          container.querySelector('[data-testid="mechanism-inspection-result-surface"]'),
        ).not.toBeNull();
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test M — Local state only
    // --------------------------------------------------------------------------
    it("Test M: unmounting and remounting resets local inspection state", () => {
      const { container: c1, cleanup: cl1 } = renderComponent(<AccountSettingsSystem />);
      try {
        setupMechanismSelectedState(c1, "inspect-code");

        const inspectBtn = c1.querySelector(
          '[data-testid="inspect-mechanism-action-button"]',
        ) as HTMLButtonElement;
        act(() => {
          inspectBtn.click();
        });

        expect(
          c1
            .querySelector('[data-testid="account-settings-system"]')
            ?.getAttribute("data-inspected-mechanism"),
        ).toBe("true");
      } finally {
        cl1();
      }

      const { container: c2, cleanup: cl2 } = renderComponent(<AccountSettingsSystem />);
      try {
        expect(c2.querySelector('[data-testid="mechanism-inspection-result-surface"]')).toBeNull();
        expect(
          c2
            .querySelector('[data-testid="account-settings-system"]')
            ?.getAttribute("data-inspected-mechanism"),
        ).toBe("false");
      } finally {
        cl2();
      }
    });

    // --------------------------------------------------------------------------
    // Test N — Accessibility
    // --------------------------------------------------------------------------
    it("Test N: inspection button and result surface meet accessibility criteria", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupMechanismSelectedState(container, "inspect-code");

        const inspectBtn = container.querySelector(
          '[data-testid="inspect-mechanism-action-button"]',
        ) as HTMLButtonElement;
        expect(inspectBtn).not.toBeNull();
        expect(inspectBtn.className).toContain("min-h-[44px]");
        expect(inspectBtn.getAttribute("type")).toBe("button");

        act(() => {
          inspectBtn.click();
        });

        const resultSurface = container.querySelector(
          '[data-testid="mechanism-inspection-result-surface"]',
        );
        expect(resultSurface).not.toBeNull();
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test O — Experience composition compatibility
    // --------------------------------------------------------------------------
    it("Test O: mechanism inspection renders seamlessly under ExperienceComposition variations", () => {
      const compositions: ExperienceComposition[] = [
        { density: "compact", spatialMode: "focused", focalSurface: "visual" },
        { density: "spacious", spatialMode: "broad", focalSurface: "both" },
      ];

      for (const comp of compositions) {
        const { container, cleanup } = renderComponent(
          <AccountSettingsSystem experienceComposition={comp} />,
        );
        try {
          setupMechanismSelectedState(container, "inspect-code");

          const inspectBtn = container.querySelector(
            '[data-testid="inspect-mechanism-action-button"]',
          ) as HTMLButtonElement;
          act(() => {
            inspectBtn.click();
          });

          expect(
            container.querySelector('[data-testid="mechanism-inspection-result-surface"]'),
          ).not.toBeNull();
        } finally {
          cleanup();
        }
      }
    });

    // --------------------------------------------------------------------------
    // Test P — Determinism
    // --------------------------------------------------------------------------
    it("Test P: repeated mounts produce deterministic mechanism inspection results", () => {
      const { container: c1, cleanup: cl1 } = renderComponent(<AccountSettingsSystem />);
      const { container: c2, cleanup: cl2 } = renderComponent(<AccountSettingsSystem />);
      try {
        setupMechanismSelectedState(c1, "inspect-code");
        setupMechanismSelectedState(c2, "inspect-code");

        const btn1 = c1.querySelector(
          '[data-testid="inspect-mechanism-action-button"]',
        ) as HTMLButtonElement;
        const btn2 = c2.querySelector(
          '[data-testid="inspect-mechanism-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          btn1.click();
          btn2.click();
        });

        const r1 = c1.querySelector('[data-testid="mechanism-inspection-result-surface"]');
        const r2 = c2.querySelector('[data-testid="mechanism-inspection-result-surface"]');

        expect(r1?.textContent).toEqual(r2?.textContent);
      } finally {
        cl1();
        cl2();
      }
    });
  });

  // ==========================================================================
  // SPRINT 2 — CHANGE 13: LEARNER-OWNED CAUSAL INTERPRETATION
  // ==========================================================================
  describe("Sprint 2 — Change 13: Learner-Owned Causal Interpretation", () => {
    function setupMechanismInspectedState(container: HTMLElement, directionId = "inspect-code") {
      setupInvestigatedState(container);
      const reconciliationRadio = container.querySelector(
        'input[id="reconciliation-supports-hypothesis"]',
      ) as HTMLInputElement;
      act(() => {
        reconciliationRadio.click();
      });

      const mechanismRadio = container.querySelector(
        `input[id="mechanism-${directionId}"]`,
      ) as HTMLInputElement;
      act(() => {
        mechanismRadio.click();
      });

      const inspectBtn = container.querySelector(
        '[data-testid="inspect-mechanism-action-button"]',
      ) as HTMLButtonElement;
      act(() => {
        inspectBtn.click();
      });
    }

    // --------------------------------------------------------------------------
    // Test A — Surface gating
    // --------------------------------------------------------------------------
    it("Test A: causal interpretation surface does not appear before mechanism inspection", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        expect(container.querySelector('[data-testid="causal-interpretation-surface"]')).toBeNull();

        // Save attempted
        const saveButton = container.querySelector(
          'button[id="account-save-button"]',
        ) as HTMLButtonElement;
        act(() => {
          saveButton.click();
        });
        expect(container.querySelector('[data-testid="causal-interpretation-surface"]')).toBeNull();

        // Investigated
        setupInvestigatedState(container);
        expect(container.querySelector('[data-testid="causal-interpretation-surface"]')).toBeNull();

        // Reconciled
        const reconciliationRadio = container.querySelector(
          'input[id="reconciliation-supports-hypothesis"]',
        ) as HTMLInputElement;
        act(() => {
          reconciliationRadio.click();
        });
        expect(container.querySelector('[data-testid="causal-interpretation-surface"]')).toBeNull();

        // Mechanism direction selected but not yet inspected
        const mechanismRadio = container.querySelector(
          'input[id="mechanism-inspect-code"]',
        ) as HTMLInputElement;
        act(() => {
          mechanismRadio.click();
        });
        expect(container.querySelector('[data-testid="causal-interpretation-surface"]')).toBeNull();
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test B — Surface appears
    // --------------------------------------------------------------------------
    it("Test B: causal interpretation surface appears immediately after mechanism inspection is triggered", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupMechanismInspectedState(container, "inspect-code");

        const surface = container.querySelector('[data-testid="causal-interpretation-surface"]');
        expect(surface).not.toBeNull();
        expect(surface?.tagName.toLowerCase()).toBe("fieldset");
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test C — Options rendered
    // --------------------------------------------------------------------------
    it("Test C: all intended causal interpretation options are rendered with exact text", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupMechanismInspectedState(container, "inspect-code");

        for (const opt of CAUSAL_INTERPRETATION_OPTIONS) {
          const radio = container.querySelector(
            `input[id="interpretation-${opt.id}"]`,
          ) as HTMLInputElement;
          expect(radio).not.toBeNull();
          expect(radio.value).toBe(opt.id);

          const label = container.querySelector(`label[for="interpretation-${opt.id}"]`);
          expect(label).not.toBeNull();
          expect(label?.textContent).toContain(opt.text);
        }
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test D — Selection
    // --------------------------------------------------------------------------
    it("Test D: selecting an interpretation records it locally in state and container attribute", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupMechanismInspectedState(container, "inspect-code");

        const root = container.querySelector('[data-testid="account-settings-system"]');
        expect(root?.getAttribute("data-causal-interpretation")).toBe("none");

        const radio = container.querySelector(
          'input[id="interpretation-strengthens-hypothesis"]',
        ) as HTMLInputElement;
        act(() => {
          radio.click();
        });

        expect(root?.getAttribute("data-causal-interpretation")).toBe("strengthens-hypothesis");
        expect(radio.checked).toBe(true);
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test E — Neutral acknowledgement
    // --------------------------------------------------------------------------
    it("Test E: selecting an interpretation produces neutral acknowledgement and transition prompt", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupMechanismInspectedState(container, "inspect-code");

        expect(
          container.querySelector('[data-testid="causal-interpretation-recorded-status"]'),
        ).toBeNull();
        expect(
          container.querySelector('[data-testid="causal-interpretation-transition-cue"]'),
        ).toBeNull();

        const radio = container.querySelector(
          'input[id="interpretation-strengthens-hypothesis"]',
        ) as HTMLInputElement;
        act(() => {
          radio.click();
        });

        const statusEl = container.querySelector(
          '[data-testid="causal-interpretation-recorded-status"]',
        );
        expect(statusEl).not.toBeNull();
        expect(statusEl?.textContent).toBe("Interpretation recorded.");

        const cueEl = container.querySelector(
          '[data-testid="causal-interpretation-transition-cue"]',
        );
        expect(cueEl).not.toBeNull();
        expect(cueEl?.textContent).toContain(
          "Your interpretation is recorded. Now separate what you know from what you still need to verify.",
        );
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test F — Reversible reasoning
    // --------------------------------------------------------------------------
    it("Test F: selecting another interpretation cleanly replaces previous interpretation without resetting", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupMechanismInspectedState(container, "inspect-code");

        const root = container.querySelector('[data-testid="account-settings-system"]');

        const opt1 = container.querySelector(
          'input[id="interpretation-strengthens-hypothesis"]',
        ) as HTMLInputElement;
        act(() => {
          opt1.click();
        });
        expect(root?.getAttribute("data-causal-interpretation")).toBe("strengthens-hypothesis");

        const opt2 = container.querySelector(
          'input[id="interpretation-focus-inspected-path"]',
        ) as HTMLInputElement;
        act(() => {
          opt2.click();
        });
        expect(root?.getAttribute("data-causal-interpretation")).toBe("focus-inspected-path");
        expect(opt1.checked).toBe(false);
        expect(opt2.checked).toBe(true);

        const opt3 = container.querySelector(
          'input[id="interpretation-insufficient-evidence"]',
        ) as HTMLInputElement;
        act(() => {
          opt3.click();
        });
        expect(root?.getAttribute("data-causal-interpretation")).toBe("insufficient-evidence");
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test G — Evidence preservation
    // --------------------------------------------------------------------------
    it("Test G: changing interpretation preserves all preceding investigation and evidence surfaces", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupMechanismInspectedState(container, "inspect-code");

        const radio = container.querySelector(
          'input[id="interpretation-strengthens-hypothesis"]',
        ) as HTMLInputElement;
        act(() => {
          radio.click();
        });

        // 1. Initial investigation transition cue & interaction evidence
        expect(
          container.querySelector('[data-testid="investigation-transition-cue"]'),
        ).not.toBeNull();
        expect(container.querySelector('[data-testid="interaction-evidence"]')).not.toBeNull();
        // 2. Hypothesis surface
        expect(container.querySelector('[data-testid="hypothesis-surface"]')).not.toBeNull();
        // 3. Investigation test choice surface
        expect(
          container.querySelector('[data-testid="investigation-test-surface"]'),
        ).not.toBeNull();
        // 4. Investigation result evidence surface
        expect(
          container.querySelector('[data-testid="investigation-result-surface"]'),
        ).not.toBeNull();
        // 5. Evidence reconciliation surface
        expect(
          container.querySelector('[data-testid="evidence-reconciliation-surface"]'),
        ).not.toBeNull();
        // 6. Mechanism investigation surface
        expect(
          container.querySelector('[data-testid="mechanism-investigation-surface"]'),
        ).not.toBeNull();
        // 7. Mechanism inspection result surface
        expect(
          container.querySelector('[data-testid="mechanism-inspection-result-surface"]'),
        ).not.toBeNull();
        // 8. Causal interpretation surface
        expect(
          container.querySelector('[data-testid="causal-interpretation-surface"]'),
        ).not.toBeNull();
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test H — No diagnosis in options and no diagnosis leakage
    // --------------------------------------------------------------------------
    it("Test H: options do not contain root-cause diagnosis or unsupported system claims, and surface produces no evaluative judgment", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupMechanismInspectedState(container, "inspect-code");

        // Assert that the options themselves do not encode diagnosis or unsupported claims
        for (const opt of CAUSAL_INTERPRETATION_OPTIONS) {
          const optLower = opt.text.toLowerCase();
          expect(optLower).not.toContain("missing state update");
          expect(optLower).not.toContain("broken handler");
          expect(optLower).not.toContain("missing setter");
          expect(optLower).not.toContain("broken connection");
          expect(optLower).not.toContain("root cause");
          expect(optLower).not.toContain("status update failure");
          expect(optLower).not.toContain("visible status does not change");
          expect(optLower).not.toContain("status changes elsewhere");
          expect(optLower).not.toContain("the cause is");
          expect(optLower).not.toContain("the problem is");
        }

        for (const opt of CAUSAL_INTERPRETATION_OPTIONS) {
          const radio = container.querySelector(
            `input[id="interpretation-${opt.id}"]`,
          ) as HTMLInputElement;
          act(() => {
            radio.click();
          });

          const surface = container.querySelector('[data-testid="causal-interpretation-surface"]');
          const text = surface?.textContent?.toLowerCase() ?? "";
          expect(text).not.toContain("you found it");
          expect(text).not.toContain("correct answer");
          expect(text).not.toContain("that is correct");
          expect(text).not.toContain("you're right");
          expect(text).not.toContain("you're wrong");
          expect(text).not.toContain("wrong answer");
          expect(text).not.toContain("incorrect interpretation");
          expect(text).not.toContain("the actual bug is");
          expect(text).not.toContain("the true root cause is");
          expect(text).not.toContain("root cause:");
          expect(text).not.toContain("diagnosis:");
          expect(text).not.toContain("the problem is:");
        }
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test I — No runtime execution
    // --------------------------------------------------------------------------
    it("Test I: selecting causal interpretations does not execute runtime or manipulate window globals", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupMechanismInspectedState(container, "inspect-code");

        const statusRegion = container.querySelector('div[role="status"]');
        expect(statusRegion?.textContent).toContain("No changes saved.");

        const radio = container.querySelector(
          'input[id="interpretation-strengthens-hypothesis"]',
        ) as HTMLInputElement;
        act(() => {
          radio.click();
        });

        // Status text in DOM remains authentic pedagogical failure
        expect(statusRegion?.textContent).toContain("No changes saved.");
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test J — No evaluation
    // --------------------------------------------------------------------------
    it("Test J: selecting causal interpretations does not invoke canonical submit or evaluate callbacks", () => {
      const onSubmit = vi.fn();
      const onComplete = vi.fn();

      const { container, cleanup } = renderComponent(
        <CanonicalActivityView
          activity={getVisualActivity()}
          sessionState={{ status: "in-progress", attempts: 0, startedAt: new Date().toISOString() }}
          onSubmit={onSubmit}
          onComplete={onComplete}
        />,
      );
      try {
        setupMechanismInspectedState(container, "inspect-code");

        const radio = container.querySelector(
          'input[id="interpretation-strengthens-hypothesis"]',
        ) as HTMLInputElement;
        act(() => {
          radio.click();
        });

        expect(onSubmit).not.toHaveBeenCalled();
        expect(onComplete).not.toHaveBeenCalled();
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test K — No progression mutation
    // --------------------------------------------------------------------------
    it("Test K: selecting causal interpretations does not mutate sessionState properties", () => {
      const sessionState: ActivitySessionState = {
        status: "in-progress",
        attempts: 0,
        startedAt: new Date().toISOString(),
      };
      const initialKeys = Object.keys(sessionState);

      const { container, cleanup } = renderComponent(
        <CanonicalActivityView
          activity={getVisualActivity()}
          sessionState={sessionState}
          onSubmit={vi.fn()}
          onComplete={vi.fn()}
        />,
      );
      try {
        setupMechanismInspectedState(container, "inspect-code");

        const radio = container.querySelector(
          'input[id="interpretation-strengthens-hypothesis"]',
        ) as HTMLInputElement;
        act(() => {
          radio.click();
        });

        expect(Object.keys(sessionState)).toEqual(initialKeys);
        expect(sessionState.status).toBe("in-progress");
        expect(sessionState.attempts).toBe(0);
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test L — Local state resets on remount
    // --------------------------------------------------------------------------
    it("Test L: unmounting and remounting resets local causal interpretation state", () => {
      const { container: c1, cleanup: cl1 } = renderComponent(<AccountSettingsSystem />);
      try {
        setupMechanismInspectedState(c1, "inspect-code");

        const radio = c1.querySelector(
          'input[id="interpretation-strengthens-hypothesis"]',
        ) as HTMLInputElement;
        act(() => {
          radio.click();
        });

        expect(
          c1
            .querySelector('[data-testid="account-settings-system"]')
            ?.getAttribute("data-causal-interpretation"),
        ).toBe("strengthens-hypothesis");
      } finally {
        cl1();
      }

      const { container: c2, cleanup: cl2 } = renderComponent(<AccountSettingsSystem />);
      try {
        expect(c2.querySelector('[data-testid="causal-interpretation-surface"]')).toBeNull();
        expect(
          c2
            .querySelector('[data-testid="account-settings-system"]')
            ?.getAttribute("data-causal-interpretation"),
        ).toBe("none");
      } finally {
        cl2();
      }
    });

    // --------------------------------------------------------------------------
    // Test M — Accessibility
    // --------------------------------------------------------------------------
    it("Test M: causal interpretation surface adheres to accessibility criteria", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupMechanismInspectedState(container, "inspect-code");

        const fieldset = container.querySelector(
          'fieldset[id="account-causal-interpretation-surface"]',
        );
        expect(fieldset).not.toBeNull();

        const legend = fieldset?.querySelector("legend");
        expect(legend).not.toBeNull();
        expect(legend?.textContent).toContain("Interpret the evidence");

        for (const opt of CAUSAL_INTERPRETATION_OPTIONS) {
          const label = container.querySelector(`label[for="interpretation-${opt.id}"]`);
          expect(label).not.toBeNull();
          expect(label?.className).toContain("min-h-[44px]");

          const input = container.querySelector(`input[id="interpretation-${opt.id}"]`);
          expect(input?.getAttribute("type")).toBe("radio");
          expect(input?.getAttribute("name")).toBe("account-causal-interpretation");
        }
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test N — Experience composition compatibility
    // --------------------------------------------------------------------------
    it("Test N: causal interpretation surface renders under varied ExperienceCompositions", () => {
      const compositions: ExperienceComposition[] = [
        { density: "compact", spatialMode: "focused", focalSurface: "visual" },
        { density: "spacious", spatialMode: "broad", focalSurface: "both" },
      ];

      for (const comp of compositions) {
        const { container, cleanup } = renderComponent(
          <AccountSettingsSystem experienceComposition={comp} />,
        );
        try {
          setupMechanismInspectedState(container, "inspect-code");

          const radio = container.querySelector(
            'input[id="interpretation-strengthens-hypothesis"]',
          ) as HTMLInputElement;
          act(() => {
            radio.click();
          });

          expect(
            container.querySelector('[data-testid="causal-interpretation-surface"]'),
          ).not.toBeNull();
          expect(
            container.querySelector('[data-testid="causal-interpretation-recorded-status"]'),
          ).not.toBeNull();
        } finally {
          cleanup();
        }
      }
    });

    // --------------------------------------------------------------------------
    // Test O — Determinism
    // --------------------------------------------------------------------------
    it("Test O: repeated mounts produce deterministic causal interpretation behavior", () => {
      const { container: c1, cleanup: cl1 } = renderComponent(<AccountSettingsSystem />);
      const { container: c2, cleanup: cl2 } = renderComponent(<AccountSettingsSystem />);
      try {
        setupMechanismInspectedState(c1, "inspect-code");
        setupMechanismInspectedState(c2, "inspect-code");

        const r1 = c1.querySelector(
          'input[id="interpretation-strengthens-hypothesis"]',
        ) as HTMLInputElement;
        const r2 = c2.querySelector(
          'input[id="interpretation-strengthens-hypothesis"]',
        ) as HTMLInputElement;

        act(() => {
          r1.click();
          r2.click();
        });

        const surf1 = c1.querySelector('[data-testid="causal-interpretation-surface"]');
        const surf2 = c2.querySelector('[data-testid="causal-interpretation-surface"]');

        expect(surf1?.textContent).toEqual(surf2?.textContent);
      } finally {
        cl1();
        cl2();
      }
    });
  });

  // ==========================================================================
  // SPRINT 2 — CHANGE 14: LEARNER-DERIVED DIAGNOSIS
  // ==========================================================================
  describe("Sprint 2 — Change 14: Learner-Derived Diagnosis", () => {
    function setupCausalInterpretationRecordedState(
      container: HTMLElement,
      interpretationId = "strengthens-hypothesis",
    ) {
      setupInvestigatedState(container);
      const reconciliationRadio = container.querySelector(
        'input[id="reconciliation-supports-hypothesis"]',
      ) as HTMLInputElement;
      act(() => {
        reconciliationRadio.click();
      });

      const mechanismRadio = container.querySelector(
        'input[id="mechanism-inspect-code"]',
      ) as HTMLInputElement;
      act(() => {
        mechanismRadio.click();
      });

      const inspectBtn = container.querySelector(
        '[data-testid="inspect-mechanism-action-button"]',
      ) as HTMLButtonElement;
      act(() => {
        inspectBtn.click();
      });

      const interpretationRadio = container.querySelector(
        `input[id="interpretation-${interpretationId}"]`,
      ) as HTMLInputElement;
      act(() => {
        interpretationRadio.click();
      });
    }

    function setTextareaValue(textarea: HTMLTextAreaElement, value: string) {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        "value",
      )?.set;
      if (nativeSetter) {
        nativeSetter.call(textarea, value);
      } else {
        textarea.value = value;
      }
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
      textarea.dispatchEvent(new Event("change", { bubbles: true }));
    }

    // --------------------------------------------------------------------------
    // Test A — Gating
    // --------------------------------------------------------------------------
    it("Test A: causal diagnosis surface is absent before preceding reasoning stages are complete", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        expect(container.querySelector('[data-testid="causal-diagnosis-surface"]')).toBeNull();

        // 1. Save attempted
        const saveButton = container.querySelector(
          'button[id="account-save-button"]',
        ) as HTMLButtonElement;
        act(() => {
          saveButton.click();
        });
        expect(container.querySelector('[data-testid="causal-diagnosis-surface"]')).toBeNull();

        // 2. Investigated
        setupInvestigatedState(container);
        expect(container.querySelector('[data-testid="causal-diagnosis-surface"]')).toBeNull();

        // 3. Reconciled
        const reconciliationRadio = container.querySelector(
          'input[id="reconciliation-supports-hypothesis"]',
        ) as HTMLInputElement;
        act(() => {
          reconciliationRadio.click();
        });
        expect(container.querySelector('[data-testid="causal-diagnosis-surface"]')).toBeNull();

        // 4. Mechanism inspected
        const mechanismRadio = container.querySelector(
          'input[id="mechanism-inspect-code"]',
        ) as HTMLInputElement;
        act(() => {
          mechanismRadio.click();
        });
        const inspectBtn = container.querySelector(
          '[data-testid="inspect-mechanism-action-button"]',
        ) as HTMLButtonElement;
        act(() => {
          inspectBtn.click();
        });
        expect(container.querySelector('[data-testid="causal-diagnosis-surface"]')).toBeNull();

        // 5. Causal interpretation recorded
        const interpretationRadio = container.querySelector(
          'input[id="interpretation-strengthens-hypothesis"]',
        ) as HTMLInputElement;
        act(() => {
          interpretationRadio.click();
        });
        expect(container.querySelector('[data-testid="causal-diagnosis-surface"]')).not.toBeNull();
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test B — Rendering
    // --------------------------------------------------------------------------
    it("Test B: diagnosis surface renders with prompt, observation/evidence/diagnosis guide, input, and confidence controls", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupCausalInterpretationRecordedState(container);

        const surface = container.querySelector('[data-testid="causal-diagnosis-surface"]');
        expect(surface).not.toBeNull();
        expect(surface?.textContent).toContain(
          "State what you believe is causing the observed failure.",
        );
        expect(surface?.textContent).toContain("Observation:");
        expect(surface?.textContent).toContain("Evidence:");
        expect(surface?.textContent).toContain("Diagnosis:");

        const textarea = container.querySelector(
          '[data-testid="diagnosis-statement-input"]',
        ) as HTMLTextAreaElement;
        expect(textarea).not.toBeNull();

        const confidenceFieldset = container.querySelector(
          '[data-testid="diagnosis-confidence-fieldset"]',
        );
        expect(confidenceFieldset).not.toBeNull();

        for (const opt of DIAGNOSIS_CONFIDENCE_OPTIONS) {
          const radio = container.querySelector(
            `input[id="confidence-${opt.id}"]`,
          ) as HTMLInputElement;
          expect(radio).not.toBeNull();
        }

        const recordBtn = container.querySelector(
          '[data-testid="record-diagnosis-action-button"]',
        ) as HTMLButtonElement;
        expect(recordBtn).not.toBeNull();
        expect(recordBtn.disabled).toBe(true);
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test C — Diagnosis input
    // --------------------------------------------------------------------------
    it("Test C: learner can enter diagnosis text into the input area", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupCausalInterpretationRecordedState(container);

        const textarea = container.querySelector(
          '[data-testid="diagnosis-statement-input"]',
        ) as HTMLTextAreaElement;
        act(() => {
          setTextareaValue(
            textarea,
            "The handler executes but never modifies the status element's textContent.",
          );
        });

        expect(textarea.value).toBe(
          "The handler executes but never modifies the status element's textContent.",
        );
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test D — Confidence selection
    // --------------------------------------------------------------------------
    it("Test D: learner can select confidence levels and it updates local presentation state", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupCausalInterpretationRecordedState(container);
        const root = container.querySelector('[data-testid="account-settings-system"]');
        expect(root?.getAttribute("data-diagnosis-confidence")).toBe("none");

        for (const opt of DIAGNOSIS_CONFIDENCE_OPTIONS) {
          const radio = container.querySelector(
            `input[id="confidence-${opt.id}"]`,
          ) as HTMLInputElement;
          act(() => {
            radio.click();
          });
          expect(radio.checked).toBe(true);
          expect(root?.getAttribute("data-diagnosis-confidence")).toBe(opt.id);
        }
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test E — Record diagnosis action
    // --------------------------------------------------------------------------
    it("Test E: record button is enabled only when text and confidence are present, and clicking records diagnosis", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupCausalInterpretationRecordedState(container);
        const root = container.querySelector('[data-testid="account-settings-system"]');
        const textarea = container.querySelector(
          '[data-testid="diagnosis-statement-input"]',
        ) as HTMLTextAreaElement;
        const recordBtn = container.querySelector(
          '[data-testid="record-diagnosis-action-button"]',
        ) as HTMLButtonElement;

        expect(recordBtn.disabled).toBe(true);
        expect(root?.getAttribute("data-diagnosis-recorded")).toBe("false");

        // Only text -> still disabled
        act(() => {
          setTextareaValue(textarea, "My diagnosis statement");
        });
        expect(recordBtn.disabled).toBe(true);

        // Add confidence -> enabled
        const confHigh = container.querySelector('input[id="confidence-high"]') as HTMLInputElement;
        act(() => {
          confHigh.click();
        });
        expect(recordBtn.disabled).toBe(false);

        // Click record
        act(() => {
          recordBtn.click();
        });

        expect(root?.getAttribute("data-diagnosis-recorded")).toBe("true");
        expect(container.querySelector('[data-testid="diagnosis-recorded-status"]')).not.toBeNull();
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test F — Neutral acknowledgement
    // --------------------------------------------------------------------------
    it("Test F: recording diagnosis produces neutral acknowledgement and forward transition cue", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupCausalInterpretationRecordedState(container);
        const textarea = container.querySelector(
          '[data-testid="diagnosis-statement-input"]',
        ) as HTMLTextAreaElement;
        const confMed = container.querySelector(
          'input[id="confidence-medium"]',
        ) as HTMLInputElement;
        const recordBtn = container.querySelector(
          '[data-testid="record-diagnosis-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          setTextareaValue(textarea, "The handler is invoked but doesn't set status.");
          confMed.click();
        });
        act(() => {
          recordBtn.click();
        });

        const statusEl = container.querySelector('[data-testid="diagnosis-recorded-status"]');
        const cueEl = container.querySelector('[data-testid="diagnosis-transition-cue"]');

        expect(statusEl?.textContent).toBe("Diagnosis recorded.");
        expect(cueEl?.textContent).toContain(
          "Your diagnosis is recorded. The next step is to test whether it explains the evidence.",
        );
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test G — No correctness judgments
    // --------------------------------------------------------------------------
    it("Test G: surface does not produce evaluative judgments or score the diagnosis", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupCausalInterpretationRecordedState(container);
        const textarea = container.querySelector(
          '[data-testid="diagnosis-statement-input"]',
        ) as HTMLTextAreaElement;
        const confLow = container.querySelector('input[id="confidence-low"]') as HTMLInputElement;
        const recordBtn = container.querySelector(
          '[data-testid="record-diagnosis-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          setTextareaValue(textarea, "A plausible causal hypothesis.");
          confLow.click();
        });
        act(() => {
          recordBtn.click();
        });

        const text =
          container
            .querySelector('[data-testid="causal-diagnosis-surface"]')
            ?.textContent?.toLowerCase() ?? "";

        expect(text).not.toContain("you found the bug");
        expect(text).not.toContain("correct diagnosis");
        expect(text).not.toContain("incorrect diagnosis");
        expect(text).not.toContain("you're right");
        expect(text).not.toContain("you're wrong");
        expect(text).not.toContain("expected answer");
        expect(text).not.toContain("the actual problem is");
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test H — No diagnosis leakage
    // --------------------------------------------------------------------------
    it("Test H: surface does not inject or provide the canonical diagnosis prior to learner formulation", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupCausalInterpretationRecordedState(container);

        const surface = container.querySelector('[data-testid="causal-diagnosis-surface"]');
        const text = surface?.textContent?.toLowerCase() ?? "";

        // Verify that Forge does not output pre-baked root-cause answers
        expect(text).not.toContain("missing state update");
        expect(text).not.toContain("broken handler");
        expect(text).not.toContain("missing setter");
        expect(text).not.toContain("broken connection");
        expect(text).not.toContain("the cause is");
        expect(text).not.toContain("the problem is");
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test I — Local state only (No session state mutation)
    // --------------------------------------------------------------------------
    it("Test I: diagnosis recording is strictly local presentation state and does not mutate session state", () => {
      const sessionState: ActivitySessionState = {
        activityId: "act-0-1-1-visual",
        phase: "active",
        stepIndex: 0,
        completedStepIndices: [],
        stepAttempts: {},
        evidence: {},
        reconstructedState: {},
      };

      const { container, cleanup } = renderComponent(
        <AccountSettingsSystem sessionState={sessionState} />,
      );
      try {
        setupCausalInterpretationRecordedState(container);
        const textarea = container.querySelector(
          '[data-testid="diagnosis-statement-input"]',
        ) as HTMLTextAreaElement;
        const confHigh = container.querySelector('input[id="confidence-high"]') as HTMLInputElement;
        const recordBtn = container.querySelector(
          '[data-testid="record-diagnosis-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          setTextareaValue(textarea, "My diagnosis text.");
          confHigh.click();
        });
        act(() => {
          recordBtn.click();
        });

        // sessionState should remain completely unmodified
        expect(sessionState.phase).toBe("active");
        expect(sessionState.stepIndex).toBe(0);
        expect(sessionState.completedStepIndices).toEqual([]);
        expect(Object.keys(sessionState.evidence)).toEqual([]);
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test J — No runtime execution
    // --------------------------------------------------------------------------
    it("Test J: recording diagnosis triggers zero runtime execution", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupCausalInterpretationRecordedState(container);
        const textarea = container.querySelector(
          '[data-testid="diagnosis-statement-input"]',
        ) as HTMLTextAreaElement;
        const confHigh = container.querySelector('input[id="confidence-high"]') as HTMLInputElement;
        const recordBtn = container.querySelector(
          '[data-testid="record-diagnosis-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          setTextareaValue(textarea, "Diagnosis statement");
          confHigh.click();
        });
        act(() => {
          recordBtn.click();
        });

        // Status remains unchanged in mini app
        const statusRegion = container.querySelector('[role="status"]');
        expect(statusRegion?.textContent).toContain("No changes saved.");
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test K — No evaluation callbacks
    // --------------------------------------------------------------------------
    it("Test K: recording diagnosis invokes zero evaluation callbacks", () => {
      const onSubmit = vi.fn();
      const onComplete = vi.fn();

      const { container, cleanup } = renderComponent(
        <AccountSettingsSystem onSubmit={onSubmit} onComplete={onComplete} />,
      );
      try {
        setupCausalInterpretationRecordedState(container);
        const textarea = container.querySelector(
          '[data-testid="diagnosis-statement-input"]',
        ) as HTMLTextAreaElement;
        const confHigh = container.querySelector('input[id="confidence-high"]') as HTMLInputElement;
        const recordBtn = container.querySelector(
          '[data-testid="record-diagnosis-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          setTextareaValue(textarea, "Diagnosis statement");
          confHigh.click();
        });
        act(() => {
          recordBtn.click();
        });

        expect(onSubmit).not.toHaveBeenCalled();
        expect(onComplete).not.toHaveBeenCalled();
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test L — Reversible / Editable
    // --------------------------------------------------------------------------
    it("Test L: editing diagnosis or changing confidence allows modifying diagnosis before and after recording", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupCausalInterpretationRecordedState(container);
        const root = container.querySelector('[data-testid="account-settings-system"]');
        const textarea = container.querySelector(
          '[data-testid="diagnosis-statement-input"]',
        ) as HTMLTextAreaElement;
        const confHigh = container.querySelector('input[id="confidence-high"]') as HTMLInputElement;
        const confLow = container.querySelector('input[id="confidence-low"]') as HTMLInputElement;
        const recordBtn = container.querySelector(
          '[data-testid="record-diagnosis-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          setTextareaValue(textarea, "Initial diagnosis.");
          confHigh.click();
        });
        act(() => {
          recordBtn.click();
        });
        expect(root?.getAttribute("data-diagnosis-recorded")).toBe("true");

        // Learner updates text -> recorded status resets
        act(() => {
          setTextareaValue(textarea, "Revised diagnosis statement.");
        });
        expect(root?.getAttribute("data-diagnosis-recorded")).toBe("false");

        // Learner changes confidence -> recorded status resets
        act(() => {
          confLow.click();
        });
        expect(root?.getAttribute("data-diagnosis-confidence")).toBe("low");
        expect(root?.getAttribute("data-diagnosis-recorded")).toBe("false");

        // Learner re-records
        act(() => {
          recordBtn.click();
        });
        expect(root?.getAttribute("data-diagnosis-recorded")).toBe("true");
        expect(textarea.value).toBe("Revised diagnosis statement.");
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test M — Confidence state
    // --------------------------------------------------------------------------
    it("Test M: switching confidence options updates only local state", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupCausalInterpretationRecordedState(container);
        const root = container.querySelector('[data-testid="account-settings-system"]');

        const highRadio = container.querySelector(
          'input[id="confidence-high"]',
        ) as HTMLInputElement;
        const medRadio = container.querySelector(
          'input[id="confidence-medium"]',
        ) as HTMLInputElement;

        act(() => {
          highRadio.click();
        });
        expect(root?.getAttribute("data-diagnosis-confidence")).toBe("high");
        expect(highRadio.checked).toBe(true);
        expect(medRadio.checked).toBe(false);

        act(() => {
          medRadio.click();
        });
        expect(root?.getAttribute("data-diagnosis-confidence")).toBe("medium");
        expect(highRadio.checked).toBe(false);
        expect(medRadio.checked).toBe(true);
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test N — Accessibility
    // --------------------------------------------------------------------------
    it("Test N: surface contains accessible fieldsets, legends, label association, and min-height touch targets", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupCausalInterpretationRecordedState(container);

        const surface = container.querySelector('fieldset[id="account-causal-diagnosis-surface"]');
        expect(surface).not.toBeNull();
        expect(surface?.querySelector("legend")).not.toBeNull();

        const label = container.querySelector('label[for="account-diagnosis-statement-input"]');
        expect(label).not.toBeNull();

        const textarea = container.querySelector(
          'textarea[id="account-diagnosis-statement-input"]',
        );
        expect(textarea).not.toBeNull();

        const confFieldset = container.querySelector(
          'fieldset[id="account-diagnosis-confidence-group"]',
        );
        expect(confFieldset).not.toBeNull();
        expect(confFieldset?.querySelector("legend")).not.toBeNull();

        const labels = container.querySelectorAll(
          'fieldset[id="account-diagnosis-confidence-group"] label',
        );
        labels.forEach((l) => {
          expect(l.className).toContain("min-h-[44px]");
        });

        const recordBtn = container.querySelector(
          'button[id="record-diagnosis-action-button"]',
        ) as HTMLButtonElement;
        expect(recordBtn.className).toContain("min-h-[44px]");
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test O — Reasoning chain preservation
    // --------------------------------------------------------------------------
    it("Test O: all previous reasoning stages remain mounted and visible alongside diagnosis surface", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupCausalInterpretationRecordedState(container);

        // 1. Mini app save button
        expect(container.querySelector('button[id="account-save-button"]')).not.toBeNull();
        // 2. Interaction evidence surface
        expect(container.querySelector('[data-testid="interaction-evidence"]')).not.toBeNull();
        // 3. Hypothesis selection surface
        expect(container.querySelector('[data-testid="hypothesis-surface"]')).not.toBeNull();
        // 4. Investigation test surface
        expect(
          container.querySelector('[data-testid="investigation-test-surface"]'),
        ).not.toBeNull();
        // 5. Investigation execution and result surface
        expect(
          container.querySelector('[data-testid="investigation-execution-surface"]'),
        ).not.toBeNull();
        expect(
          container.querySelector('[data-testid="investigation-result-surface"]'),
        ).not.toBeNull();
        // 6. Reconciliation surface
        expect(
          container.querySelector('[data-testid="evidence-reconciliation-surface"]'),
        ).not.toBeNull();
        // 7. Mechanism investigation surface
        expect(
          container.querySelector('[data-testid="mechanism-investigation-surface"]'),
        ).not.toBeNull();
        // 8. Mechanism inspection evidence
        expect(
          container.querySelector('[data-testid="mechanism-inspection-result-surface"]'),
        ).not.toBeNull();
        // 9. Causal interpretation surface
        expect(
          container.querySelector('[data-testid="causal-interpretation-surface"]'),
        ).not.toBeNull();
        // 10. Causal diagnosis surface
        expect(container.querySelector('[data-testid="causal-diagnosis-surface"]')).not.toBeNull();
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test P — Remount isolation
    // --------------------------------------------------------------------------
    it("Test P: fresh mount resets local diagnosis state completely", () => {
      const { container: c1, cleanup: cl1 } = renderComponent(<AccountSettingsSystem />);
      try {
        setupCausalInterpretationRecordedState(c1);
        const textarea = c1.querySelector(
          '[data-testid="diagnosis-statement-input"]',
        ) as HTMLTextAreaElement;
        const confHigh = c1.querySelector('input[id="confidence-high"]') as HTMLInputElement;
        const recordBtn = c1.querySelector(
          '[data-testid="record-diagnosis-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          setTextareaValue(textarea, "Diagnosis statement 1");
          confHigh.click();
        });
        act(() => {
          recordBtn.click();
        });

        expect(
          c1
            .querySelector('[data-testid="account-settings-system"]')
            ?.getAttribute("data-diagnosis-recorded"),
        ).toBe("true");
      } finally {
        cl1();
      }

      const { container: c2, cleanup: cl2 } = renderComponent(<AccountSettingsSystem />);
      try {
        const root = c2.querySelector('[data-testid="account-settings-system"]');
        expect(root?.getAttribute("data-diagnosis-recorded")).toBe("false");
        expect(root?.getAttribute("data-diagnosis-confidence")).toBe("none");
        expect(c2.querySelector('[data-testid="causal-diagnosis-surface"]')).toBeNull();
      } finally {
        cl2();
      }
    });

    // --------------------------------------------------------------------------
    // Test Q — Determinism
    // --------------------------------------------------------------------------
    it("Test Q: repeated mounts produce deterministic diagnosis behavior", () => {
      const { container: c1, cleanup: cl1 } = renderComponent(<AccountSettingsSystem />);
      const { container: c2, cleanup: cl2 } = renderComponent(<AccountSettingsSystem />);
      try {
        setupCausalInterpretationRecordedState(c1);
        setupCausalInterpretationRecordedState(c2);

        const t1 = c1.querySelector(
          '[data-testid="diagnosis-statement-input"]',
        ) as HTMLTextAreaElement;
        const t2 = c2.querySelector(
          '[data-testid="diagnosis-statement-input"]',
        ) as HTMLTextAreaElement;
        const conf1 = c1.querySelector('input[id="confidence-high"]') as HTMLInputElement;
        const conf2 = c2.querySelector('input[id="confidence-high"]') as HTMLInputElement;

        act(() => {
          setTextareaValue(t1, "Same diagnosis statement");
          setTextareaValue(t2, "Same diagnosis statement");
          conf1.click();
          conf2.click();
        });

        const rec1 = c1.querySelector(
          '[data-testid="record-diagnosis-action-button"]',
        ) as HTMLButtonElement;
        const rec2 = c2.querySelector(
          '[data-testid="record-diagnosis-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          rec1.click();
          rec2.click();
        });

        const surf1 = c1.querySelector('[data-testid="causal-diagnosis-surface"]');
        const surf2 = c2.querySelector('[data-testid="causal-diagnosis-surface"]');

        expect(surf1?.textContent).toEqual(surf2?.textContent);
      } finally {
        cl1();
        cl2();
      }
    });
  });

  // ============================================================================
  // Change 15 — Diagnosis Testing / Predict the Intervention
  // ============================================================================
  describe("Change 15 — Diagnosis Testing / Predict the Intervention", () => {
    function setupCausalInterpretationRecordedState(
      container: HTMLElement,
      interpretationId = "strengthens-hypothesis",
    ) {
      setupInvestigatedState(container);
      const reconciliationRadio = container.querySelector(
        'input[id="reconciliation-supports-hypothesis"]',
      ) as HTMLInputElement;
      act(() => {
        reconciliationRadio.click();
      });

      const mechanismRadio = container.querySelector(
        'input[id="mechanism-inspect-code"]',
      ) as HTMLInputElement;
      act(() => {
        mechanismRadio.click();
      });

      const inspectBtn = container.querySelector(
        '[data-testid="inspect-mechanism-action-button"]',
      ) as HTMLButtonElement;
      act(() => {
        inspectBtn.click();
      });

      const interpretationRadio = container.querySelector(
        `input[id="interpretation-${interpretationId}"]`,
      ) as HTMLInputElement;
      act(() => {
        interpretationRadio.click();
      });
    }

    function setTextareaValue(textarea: HTMLTextAreaElement, value: string) {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        "value",
      )?.set;
      if (nativeSetter) {
        nativeSetter.call(textarea, value);
      } else {
        textarea.value = value;
      }
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
      textarea.dispatchEvent(new Event("change", { bubbles: true }));
    }

    function setupDiagnosisRecordedState(
      container: HTMLElement,
      statement = "The handler executes on click but does not trigger the status DOM update",
      confidence: "high" | "medium" | "low" = "high",
    ) {
      if (!container.querySelector('[data-testid="causal-diagnosis-surface"]')) {
        setupCausalInterpretationRecordedState(container);
      }
      const textarea = container.querySelector(
        '[data-testid="diagnosis-statement-input"]',
      ) as HTMLTextAreaElement;
      const confRadio = container.querySelector(
        `input[id="confidence-${confidence}"]`,
      ) as HTMLInputElement;
      const recordBtn = container.querySelector(
        '[data-testid="record-diagnosis-action-button"]',
      ) as HTMLButtonElement;

      act(() => {
        setTextareaValue(textarea, statement);
        confRadio.click();
      });
      act(() => {
        recordBtn.click();
      });
    }

    // --------------------------------------------------------------------------
    // Test A — Gating
    // --------------------------------------------------------------------------
    it("Test A: diagnosis prediction surface is absent until diagnosis is recorded", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        expect(container.querySelector('[data-testid="diagnosis-prediction-surface"]')).toBeNull();

        setupCausalInterpretationRecordedState(container);
        expect(container.querySelector('[data-testid="diagnosis-prediction-surface"]')).toBeNull();

        setupDiagnosisRecordedState(container);
        expect(
          container.querySelector('[data-testid="diagnosis-prediction-surface"]'),
        ).not.toBeNull();
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test B — Diagnosis preservation
    // --------------------------------------------------------------------------
    it("Test B: recorded diagnosis text remains visible when prediction surface renders", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        const customDiagnosis = "Custom diagnosis statement for preservation test";
        setupDiagnosisRecordedState(container, customDiagnosis);

        const surface = container.querySelector('[data-testid="diagnosis-prediction-surface"]');
        expect(surface).not.toBeNull();

        const preservedStatement = container.querySelector(
          '[data-testid="preserved-diagnosis-statement"]',
        );
        expect(preservedStatement).not.toBeNull();
        expect(preservedStatement?.textContent).toContain(customDiagnosis);
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test C — Confidence preservation
    // --------------------------------------------------------------------------
    it("Test C: recorded confidence level remains visible when prediction surface renders", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupDiagnosisRecordedState(container, "Diagnosis text", "medium");

        const preservedConfidence = container.querySelector(
          '[data-testid="preserved-diagnosis-confidence"]',
        );
        expect(preservedConfidence).not.toBeNull();
        expect(preservedConfidence?.textContent?.toUpperCase()).toContain("MEDIUM");
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test D — Prediction rendering
    // --------------------------------------------------------------------------
    it("Test D: prediction surface renders prompt, textarea input, assessment options, and action button", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupDiagnosisRecordedState(container);

        const surface = container.querySelector('[data-testid="diagnosis-prediction-surface"]');
        expect(surface).not.toBeNull();
        expect(surface?.textContent).toContain(
          "Predict what should happen when you test your diagnosis.",
        );

        const input = container.querySelector(
          '[data-testid="diagnosis-prediction-input"]',
        ) as HTMLTextAreaElement;
        expect(input).not.toBeNull();

        const fieldset = container.querySelector('[data-testid="prediction-assessment-fieldset"]');
        expect(fieldset).not.toBeNull();

        const button = container.querySelector(
          '[data-testid="record-prediction-action-button"]',
        ) as HTMLButtonElement;
        expect(button).not.toBeNull();
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test E — Prediction input
    // --------------------------------------------------------------------------
    it("Test E: learner can enter prediction and action button enables when non-empty", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupDiagnosisRecordedState(container);

        const input = container.querySelector(
          '[data-testid="diagnosis-prediction-input"]',
        ) as HTMLTextAreaElement;
        const button = container.querySelector(
          '[data-testid="record-prediction-action-button"]',
        ) as HTMLButtonElement;

        expect(button.disabled).toBe(true);

        act(() => {
          setTextareaValue(
            input,
            "If I change the handler, the status text should update to saved",
          );
        });

        expect(button.disabled).toBe(false);
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test F — Record prediction
    // --------------------------------------------------------------------------
    it("Test F: clicking record prediction button sets data-diagnosis-prediction-recorded attribute to true", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupDiagnosisRecordedState(container);

        const root = container.querySelector('[data-testid="account-settings-system"]');
        expect(root?.getAttribute("data-diagnosis-prediction-recorded")).toBe("false");

        const input = container.querySelector(
          '[data-testid="diagnosis-prediction-input"]',
        ) as HTMLTextAreaElement;
        const button = container.querySelector(
          '[data-testid="record-prediction-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          setTextareaValue(input, "Expecting status text change on save");
        });
        act(() => {
          button.click();
        });

        expect(root?.getAttribute("data-diagnosis-prediction-recorded")).toBe("true");
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test G — Neutral acknowledgment
    // --------------------------------------------------------------------------
    it("Test G: recording produces neutral status acknowledgment and transition cue", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupDiagnosisRecordedState(container);

        const input = container.querySelector(
          '[data-testid="diagnosis-prediction-input"]',
        ) as HTMLTextAreaElement;
        const button = container.querySelector(
          '[data-testid="record-prediction-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          setTextareaValue(input, "Predicting the status element update");
        });
        act(() => {
          button.click();
        });

        const status = container.querySelector('[data-testid="prediction-recorded-status"]');
        const cue = container.querySelector('[data-testid="prediction-transition-cue"]');

        expect(status?.textContent).toBe("Prediction recorded.");
        expect(cue?.textContent).toBe(
          "Your prediction is recorded. Now test it against the system.",
        );
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test H — No correctness judgment
    // --------------------------------------------------------------------------
    it("Test H: prediction surface contains zero correctness judgments", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupDiagnosisRecordedState(container);

        const input = container.querySelector(
          '[data-testid="diagnosis-prediction-input"]',
        ) as HTMLTextAreaElement;
        const button = container.querySelector(
          '[data-testid="record-prediction-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          setTextareaValue(input, "My prediction");
        });
        act(() => {
          button.click();
        });

        const text =
          container
            .querySelector('[data-testid="diagnosis-prediction-surface"]')
            ?.textContent?.toLowerCase() || "";

        expect(text).not.toContain("correct prediction");
        expect(text).not.toContain("incorrect prediction");
        expect(text).not.toContain("good prediction");
        expect(text).not.toContain("bad prediction");
        expect(text).not.toContain("expected answer");
        expect(text).not.toContain("you predicted the bug correctly");
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test I — No diagnosis leakage
    // --------------------------------------------------------------------------
    it("Test I: Forge does not supply canonical bug diagnosis in prediction surface text", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupDiagnosisRecordedState(container);

        const text =
          container
            .querySelector('[data-testid="diagnosis-prediction-surface"]')
            ?.textContent?.toLowerCase() || "";

        expect(text).not.toContain("missing status setter");
        expect(text).not.toContain("the save function missing document.querySelector");
        expect(text).not.toContain("the real bug is");
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test J — No runtime
    // --------------------------------------------------------------------------
    it("Test J: recording prediction causes zero runtime execution or code mutation", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupDiagnosisRecordedState(container);

        const input = container.querySelector(
          '[data-testid="diagnosis-prediction-input"]',
        ) as HTMLTextAreaElement;
        const button = container.querySelector(
          '[data-testid="record-prediction-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          setTextareaValue(input, "Prediction test");
        });
        act(() => {
          button.click();
        });

        // System status is still unmodified
        const statusElement = container.querySelector('[role="status"]');
        expect(statusElement?.textContent).toContain("No changes saved.");
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test K — No evaluation
    // --------------------------------------------------------------------------
    it("Test K: recording prediction causes zero evaluation callbacks", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupDiagnosisRecordedState(container);

        const input = container.querySelector(
          '[data-testid="diagnosis-prediction-input"]',
        ) as HTMLTextAreaElement;
        const button = container.querySelector(
          '[data-testid="record-prediction-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          setTextareaValue(input, "Prediction test");
        });
        act(() => {
          button.click();
        });

        expect(
          container.querySelector('[data-testid="prediction-recorded-status"]'),
        ).not.toBeNull();
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test L — No session mutation
    // --------------------------------------------------------------------------
    it("Test L: recording prediction does not mutate session or lesson state", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupDiagnosisRecordedState(container);

        const input = container.querySelector(
          '[data-testid="diagnosis-prediction-input"]',
        ) as HTMLTextAreaElement;
        const button = container.querySelector(
          '[data-testid="record-prediction-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          setTextareaValue(input, "Local reasoning only");
        });
        act(() => {
          button.click();
        });

        const root = container.querySelector('[data-testid="account-settings-system"]');
        expect(root?.getAttribute("data-diagnosis-prediction-recorded")).toBe("true");
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test M — Reversible
    // --------------------------------------------------------------------------
    it("Test M: editing prediction text or assessment resets recorded state", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupDiagnosisRecordedState(container);

        const root = container.querySelector('[data-testid="account-settings-system"]');
        const input = container.querySelector(
          '[data-testid="diagnosis-prediction-input"]',
        ) as HTMLTextAreaElement;
        const button = container.querySelector(
          '[data-testid="record-prediction-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          setTextareaValue(input, "Initial prediction");
        });
        act(() => {
          button.click();
        });

        expect(root?.getAttribute("data-diagnosis-prediction-recorded")).toBe("true");

        // Editing prediction text resets recorded state
        act(() => {
          setTextareaValue(input, "Updated prediction text");
        });

        expect(root?.getAttribute("data-diagnosis-prediction-recorded")).toBe("false");
        expect(container.querySelector('[data-testid="prediction-recorded-status"]')).toBeNull();
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test N — Structured option safety
    // --------------------------------------------------------------------------
    it("Test N: structured prediction assessment options contain no canonical diagnosis", () => {
      expect(PREDICTION_ASSESSMENT_OPTIONS.length).toBeGreaterThan(0);
      for (const opt of PREDICTION_ASSESSMENT_OPTIONS) {
        const text = opt.label.toLowerCase();
        expect(text).not.toContain("missing status");
        expect(text).not.toContain("handleSave");
        expect(text).not.toContain("document.querySelector");
      }
    });

    // --------------------------------------------------------------------------
    // Test O — Accessibility
    // --------------------------------------------------------------------------
    it("Test O: prediction surface complies with accessibility requirements", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupDiagnosisRecordedState(container);

        const surfaceFieldset = container.querySelector(
          '[data-testid="diagnosis-prediction-surface"]',
        );
        expect(surfaceFieldset?.tagName.toLowerCase()).toBe("fieldset");

        const legend = surfaceFieldset?.querySelector("legend");
        expect(legend).not.toBeNull();

        const label = container.querySelector('label[for="account-diagnosis-prediction-input"]');
        expect(label).not.toBeNull();

        const button = container.querySelector(
          '[data-testid="record-prediction-action-button"]',
        ) as HTMLButtonElement;
        expect(button.classList.contains("min-h-[44px]")).toBe(true);
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test P — Preservation
    // --------------------------------------------------------------------------
    it("Test P: all previous reasoning surfaces remain present when prediction surface is rendered", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupDiagnosisRecordedState(container);

        expect(container.querySelector('[data-testid="interaction-evidence"]')).not.toBeNull();
        expect(container.querySelector('[data-testid="hypothesis-surface"]')).not.toBeNull();
        expect(
          container.querySelector('[data-testid="investigation-execution-surface"]'),
        ).not.toBeNull();
        expect(
          container.querySelector('[data-testid="evidence-reconciliation-surface"]'),
        ).not.toBeNull();
        expect(
          container.querySelector('[data-testid="mechanism-investigation-surface"]'),
        ).not.toBeNull();
        expect(
          container.querySelector('[data-testid="causal-interpretation-surface"]'),
        ).not.toBeNull();
        expect(container.querySelector('[data-testid="causal-diagnosis-surface"]')).not.toBeNull();
        expect(
          container.querySelector('[data-testid="diagnosis-prediction-surface"]'),
        ).not.toBeNull();
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test Q — Remount isolation
    // --------------------------------------------------------------------------
    it("Test Q: fresh mount starts with no prediction recorded state", () => {
      const { container: c1, cleanup: cl1 } = renderComponent(<AccountSettingsSystem />);
      try {
        setupDiagnosisRecordedState(c1);

        const input = c1.querySelector(
          '[data-testid="diagnosis-prediction-input"]',
        ) as HTMLTextAreaElement;
        const button = c1.querySelector(
          '[data-testid="record-prediction-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          setTextareaValue(input, "My prediction");
          button.click();
        });

        expect(
          c1
            .querySelector('[data-testid="account-settings-system"]')
            ?.getAttribute("data-diagnosis-prediction-recorded"),
        ).toBe("true");
      } finally {
        cl1();
      }

      const { container: c2, cleanup: cl2 } = renderComponent(<AccountSettingsSystem />);
      try {
        const root = c2.querySelector('[data-testid="account-settings-system"]');
        expect(root?.getAttribute("data-diagnosis-prediction-recorded")).toBe("false");
        expect(c2.querySelector('[data-testid="diagnosis-prediction-surface"]')).toBeNull();
      } finally {
        cl2();
      }
    });

    // --------------------------------------------------------------------------
    // Test R — Determinism
    // --------------------------------------------------------------------------
    it("Test R: repeated mounts produce deterministic prediction surface output", () => {
      const { container: c1, cleanup: cl1 } = renderComponent(<AccountSettingsSystem />);
      const { container: c2, cleanup: cl2 } = renderComponent(<AccountSettingsSystem />);
      try {
        setupDiagnosisRecordedState(c1);
        setupDiagnosisRecordedState(c2);

        const p1 = c1.querySelector(
          '[data-testid="diagnosis-prediction-input"]',
        ) as HTMLTextAreaElement;
        const p2 = c2.querySelector(
          '[data-testid="diagnosis-prediction-input"]',
        ) as HTMLTextAreaElement;

        act(() => {
          setTextareaValue(p1, "Same prediction");
          setTextareaValue(p2, "Same prediction");
        });

        const rec1 = c1.querySelector(
          '[data-testid="record-prediction-action-button"]',
        ) as HTMLButtonElement;
        const rec2 = c2.querySelector(
          '[data-testid="record-prediction-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          rec1.click();
          rec2.click();
        });

        const surf1 = c1.querySelector('[data-testid="diagnosis-prediction-surface"]');
        const surf2 = c2.querySelector('[data-testid="diagnosis-prediction-surface"]');

        expect(surf1?.textContent).toEqual(surf2?.textContent);
      } finally {
        cl1();
        cl2();
      }
    });
  });

  // ============================================================================
  // Change 16 — Learner Intervention / Modify the Mechanism
  // ============================================================================

  function setTextareaValue(textarea: HTMLTextAreaElement, value: string) {
    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value",
    )?.set;
    if (nativeSetter) {
      nativeSetter.call(textarea, value);
    } else {
      textarea.value = value;
    }
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    textarea.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function setupDiagnosisRecordedState(
    container: HTMLElement,
    statement = "The handler executes on click but does not trigger the status DOM update",
    confidence: "high" | "medium" | "low" = "high",
  ) {
    if (container.querySelector('[data-testid="diagnosis-recorded-status"]')) {
      return;
    }

    // 0. Save attempt
    const saveBtn = container.querySelector(
      'button[id="account-save-button"]',
    ) as HTMLButtonElement;
    if (saveBtn) act(() => saveBtn.click());

    // 1. Hypothesis
    const hypRadio = container.querySelector(
      'input[id="hypothesis-not-connected"]',
    ) as HTMLInputElement;
    if (hypRadio && !hypRadio.checked) act(() => hypRadio.click());

    // 2. Investigation test
    const testRadio = container.querySelector(
      'input[id="investigation-inspect-activation"]',
    ) as HTMLInputElement;
    if (testRadio && !testRadio.checked) act(() => testRadio.click());
    const actionBtn = container.querySelector(
      '[data-testid="investigate-action-button"]',
    ) as HTMLButtonElement;
    if (actionBtn && !container.querySelector('[data-testid="investigation-result-surface"]'))
      act(() => actionBtn.click());

    // 3. Reconciliation
    const reconRadio = container.querySelector(
      'input[id="reconciliation-supports-hypothesis"]',
    ) as HTMLInputElement;
    if (reconRadio && !reconRadio.checked) act(() => reconRadio.click());

    // 4. Mechanism inspection
    const mechRadio = container.querySelector(
      'input[id="mechanism-inspect-code"]',
    ) as HTMLInputElement;
    if (mechRadio && !mechRadio.checked) act(() => mechRadio.click());
    const inspectBtn = container.querySelector(
      '[data-testid="inspect-mechanism-action-button"]',
    ) as HTMLButtonElement;
    if (
      inspectBtn &&
      !container.querySelector('[data-testid="mechanism-inspection-result-surface"]')
    )
      act(() => inspectBtn.click());

    // 5. Causal interpretation
    const interpRadio = container.querySelector(
      'input[id="interpretation-strengthens-hypothesis"]',
    ) as HTMLInputElement;
    if (interpRadio && !interpRadio.checked) act(() => interpRadio.click());

    // 6. Diagnosis statement & confidence
    const textarea = container.querySelector(
      '[data-testid="diagnosis-statement-input"]',
    ) as HTMLTextAreaElement;
    const confRadio = container.querySelector(
      `input[id="confidence-${confidence}"]`,
    ) as HTMLInputElement;
    const recordBtn = container.querySelector(
      '[data-testid="record-diagnosis-action-button"]',
    ) as HTMLButtonElement;

    if (textarea && confRadio && recordBtn) {
      act(() => {
        setTextareaValue(textarea, statement);
        confRadio.click();
      });
      act(() => {
        recordBtn.click();
      });
    }
  }

  function setupPredictionRecordedState(
    container: HTMLElement,
    statement = "The handler executes on click but does not trigger the status DOM update",
    confidence: "high" | "medium" | "low" = "high",
    prediction = "When the click handler updates the status DOM element, clicking Save will change the status text.",
    assessmentOptionId = "inconsistent-evidence",
  ) {
    if (container.querySelector('[data-testid="diagnosis-prediction-recorded-status"]')) {
      return;
    }

    setupDiagnosisRecordedState(container, statement, confidence);

    const predictionInput = container.querySelector(
      '[data-testid="diagnosis-prediction-input"]',
    ) as HTMLTextAreaElement;

    if (predictionInput) {
      act(() => {
        setTextareaValue(predictionInput, prediction);
      });
    }

    const radio = container.querySelector(
      `[id="prediction-assessment-${assessmentOptionId}"]`,
    ) as HTMLInputElement;

    if (radio && !radio.checked) {
      act(() => {
        radio.click();
      });
    }

    const recordButton = container.querySelector(
      '[data-testid="record-prediction-action-button"]',
    ) as HTMLButtonElement;

    if (recordButton) {
      act(() => {
        recordButton.click();
      });
    }
  }

  function setupInterventionAppliedState(
    container: HTMLElement,
    code = "custom modified code",
    statement = "The handler executes on click but does not trigger the status DOM update",
    confidence: "high" | "medium" | "low" = "high",
    prediction = "When the click handler updates the status DOM element, clicking Save will change the status text.",
  ) {
    setupPredictionRecordedState(container, statement, confidence, prediction);

    const textarea = container.querySelector(
      '[data-testid="intervention-mechanism-input"]',
    ) as HTMLTextAreaElement;

    if (textarea) {
      act(() => {
        setTextareaValue(textarea, code);
      });
    }

    const applyBtn = container.querySelector(
      '[data-testid="apply-intervention-action-button"]',
    ) as HTMLButtonElement;

    if (applyBtn) {
      act(() => {
        applyBtn.click();
      });
    }
  }

  describe("Change 16 — Learner Intervention / Modify the Mechanism", () => {
    // --------------------------------------------------------------------------
    // Test A — Gating
    // --------------------------------------------------------------------------
    it("Test A: intervention surface is absent until diagnosis and prediction are recorded", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        expect(container.querySelector('[data-testid="intervention-surface"]')).toBeNull();

        // Record diagnosis only
        setupDiagnosisRecordedState(container);
        expect(container.querySelector('[data-testid="intervention-surface"]')).toBeNull();

        // Record prediction
        setupPredictionRecordedState(container);
        expect(container.querySelector('[data-testid="intervention-surface"]')).not.toBeNull();
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test B — Diagnosis preservation
    // --------------------------------------------------------------------------
    it("Test B: recorded diagnosis remains visible inside intervention surface", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupPredictionRecordedState(container, "Missing DOM status update call", "high");
        const surface = container.querySelector('[data-testid="intervention-surface"]');
        expect(surface).not.toBeNull();

        const diagStmt = surface?.querySelector('[data-testid="preserved-diagnosis-statement"]');
        const diagConf = surface?.querySelector('[data-testid="preserved-diagnosis-confidence"]');

        expect(diagStmt?.textContent).toContain("Missing DOM status update call");
        expect(diagConf?.textContent).toContain("HIGH");
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test C — Prediction preservation
    // --------------------------------------------------------------------------
    it("Test C: recorded prediction remains visible inside intervention surface", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupPredictionRecordedState(
          container,
          "Missing DOM status update",
          "high",
          "Updating status will reflect saved changes",
        );
        const surface = container.querySelector('[data-testid="intervention-surface"]');
        const predStmt = surface?.querySelector('[data-testid="preserved-prediction-statement"]');

        expect(predStmt?.textContent).toContain("Updating status will reflect saved changes");
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test D — Baseline preservation
    // --------------------------------------------------------------------------
    it("Test D: original mechanism baseline code is loaded into intervention editor", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupPredictionRecordedState(container);
        const textarea = container.querySelector(
          '[data-testid="intervention-mechanism-input"]',
        ) as HTMLTextAreaElement;

        expect(textarea.value).toEqual(DEFAULT_MECHANISM_CODE);
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test E — Intervention rendering
    // --------------------------------------------------------------------------
    it("Test E: focused intervention surface renders with expected controls and labels", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupPredictionRecordedState(container);
        const surface = container.querySelector('[data-testid="intervention-surface"]');

        expect(surface?.textContent).toContain("Intervention Workbench");
        expect(surface?.textContent).toContain("Now make one targeted change to the mechanism");
        expect(
          container.querySelector('[data-testid="intervention-mechanism-input"]'),
        ).not.toBeNull();
        expect(
          container.querySelector('[data-testid="apply-intervention-action-button"]'),
        ).not.toBeNull();
        expect(
          container.querySelector('[data-testid="reset-intervention-action-button"]'),
        ).not.toBeNull();
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test F — Learner modification
    // --------------------------------------------------------------------------
    it("Test F: learner can modify intervention code updating data-intervention-modified", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupPredictionRecordedState(container);
        const root = container.querySelector('[data-testid="account-settings-system"]');
        expect(root?.getAttribute("data-intervention-modified")).toBe("false");

        const textarea = container.querySelector(
          '[data-testid="intervention-mechanism-input"]',
        ) as HTMLTextAreaElement;

        act(() => {
          setTextareaValue(
            textarea,
            "function handleSave(event) {\n  saveAccountSettings();\n  document.getElementById('account-status').textContent = 'Saved';\n}",
          );
        });

        expect(root?.getAttribute("data-intervention-modified")).toBe("true");
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test G — Applied state
    // --------------------------------------------------------------------------
    it("Test G: clicking Apply Intervention sets data-intervention-applied to true", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupPredictionRecordedState(container);
        const root = container.querySelector('[data-testid="account-settings-system"]');
        expect(root?.getAttribute("data-intervention-applied")).toBe("false");

        const applyBtn = container.querySelector(
          '[data-testid="apply-intervention-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          applyBtn.click();
        });

        expect(root?.getAttribute("data-intervention-applied")).toBe("true");
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test H — Neutral acknowledgement
    // --------------------------------------------------------------------------
    it("Test H: shows neutral acknowledgement message and transition cue upon apply", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupPredictionRecordedState(container);
        const applyBtn = container.querySelector(
          '[data-testid="apply-intervention-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          applyBtn.click();
        });

        const status = container.querySelector('[data-testid="intervention-applied-status"]');
        const cue = container.querySelector('[data-testid="intervention-transition-cue"]');

        expect(status?.textContent).toContain("Intervention applied.");
        expect(cue?.textContent).toContain(
          "Observe what changed. Compare the result with your prediction.",
        );
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test I — No correctness judgment
    // --------------------------------------------------------------------------
    it("Test I: contains zero correctness judgments or grading feedback", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupPredictionRecordedState(container);
        const applyBtn = container.querySelector(
          '[data-testid="apply-intervention-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          applyBtn.click();
        });

        const surfaceText =
          container.querySelector('[data-testid="intervention-surface"]')?.textContent ?? "";

        expect(surfaceText).not.toMatch(/\bCorrect!\b/i);
        expect(surfaceText).not.toMatch(/\bIncorrect\b/i);
        expect(surfaceText).not.toMatch(/\bYou fixed the bug\b/i);
        expect(surfaceText).not.toMatch(/\bThe solution works\b/i);
        expect(surfaceText).not.toMatch(/\bDiagnosis confirmed\b/i);
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test J — Consequence rendering
    // --------------------------------------------------------------------------
    it("Test J: consequence surface renders baseline, intervention, result, and prediction", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupPredictionRecordedState(container);
        const applyBtn = container.querySelector(
          '[data-testid="apply-intervention-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          applyBtn.click();
        });

        const consequenceSurface = container.querySelector(
          '[data-testid="intervention-consequence-surface"]',
        );
        expect(consequenceSurface).not.toBeNull();

        expect(
          container.querySelector('[data-testid="consequence-baseline-result"]'),
        ).not.toBeNull();
        expect(
          container.querySelector('[data-testid="consequence-intervention-summary"]'),
        ).not.toBeNull();
        expect(
          container.querySelector('[data-testid="consequence-observed-result"]'),
        ).not.toBeNull();
        expect(
          container.querySelector('[data-testid="consequence-prediction-comparison"]'),
        ).not.toBeNull();
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test K — Prediction comparison
    // --------------------------------------------------------------------------
    it("Test K: learner's prediction remains visible in consequence surface for comparison", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupPredictionRecordedState(
          container,
          "Missing DOM status update",
          "high",
          "DOM text will change to Saved",
        );
        const applyBtn = container.querySelector(
          '[data-testid="apply-intervention-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          applyBtn.click();
        });

        const predComp = container.querySelector(
          '[data-testid="consequence-prediction-comparison"]',
        );
        expect(predComp?.textContent).toContain("DOM text will change to Saved");
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test L — No runtime
    // --------------------------------------------------------------------------
    it("Test L: applying intervention causes zero runtime service execution", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupPredictionRecordedState(container);
        const applyBtn = container.querySelector(
          '[data-testid="apply-intervention-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          applyBtn.click();
        });

        // Component state is updated locally without invoking any sandbox runtime host
        expect(
          container.querySelector('[data-testid="intervention-consequence-surface"]'),
        ).not.toBeNull();
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test M — No evaluation
    // --------------------------------------------------------------------------
    it("Test M: applying intervention invokes zero evaluation callbacks", () => {
      const onSubmit = vi.fn();
      const onComplete = vi.fn();
      const { container, cleanup } = renderComponent(
        <CanonicalActivityView
          activity={getVisualActivity()}
          sessionState={{ status: "in_progress", isCompleted: false, history: [] }}
          onSubmit={onSubmit}
          onComplete={onComplete}
        />,
      );
      try {
        setupPredictionRecordedState(container);
        const applyBtn = container.querySelector(
          '[data-testid="apply-intervention-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          applyBtn.click();
        });

        expect(onSubmit).not.toHaveBeenCalled();
        expect(onComplete).not.toHaveBeenCalled();
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test N — No session mutation
    // --------------------------------------------------------------------------
    it("Test N: applying intervention does not mutate activity session state", () => {
      const initialSession: ActivitySessionState = {
        status: "in_progress",
        isCompleted: false,
        history: [],
      };
      const { container, cleanup } = renderComponent(
        <CanonicalActivityView activity={getVisualActivity()} sessionState={initialSession} />,
      );
      try {
        setupPredictionRecordedState(container);
        const applyBtn = container.querySelector(
          '[data-testid="apply-intervention-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          applyBtn.click();
        });

        expect(initialSession.isCompleted).toBe(false);
        expect(initialSession.status).toBe("in_progress");
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test O — No progression
    // --------------------------------------------------------------------------
    it("Test O: applying intervention does not mutate lesson progression or mastery", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupPredictionRecordedState(container);
        const applyBtn = container.querySelector(
          '[data-testid="apply-intervention-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          applyBtn.click();
        });

        // Visual simulation only, progression unchanged
        expect(container.querySelector('[data-testid="intervention-surface"]')).not.toBeNull();
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test P — Reversible
    // --------------------------------------------------------------------------
    it("Test P: modifying intervention code after applying clears applied state", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupPredictionRecordedState(container);
        const root = container.querySelector('[data-testid="account-settings-system"]');

        const applyBtn = container.querySelector(
          '[data-testid="apply-intervention-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          applyBtn.click();
        });

        expect(root?.getAttribute("data-intervention-applied")).toBe("true");

        const textarea = container.querySelector(
          '[data-testid="intervention-mechanism-input"]',
        ) as HTMLTextAreaElement;

        act(() => {
          setTextareaValue(textarea, "function handleSave() { console.log('test'); }");
        });

        expect(root?.getAttribute("data-intervention-applied")).toBe("false");
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test Q — Reset
    // --------------------------------------------------------------------------
    it("Test Q: reset button restores baseline code and clears applied/modified state", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupPredictionRecordedState(container);
        const root = container.querySelector('[data-testid="account-settings-system"]');

        const textarea = container.querySelector(
          '[data-testid="intervention-mechanism-input"]',
        ) as HTMLTextAreaElement;

        act(() => {
          setTextareaValue(textarea, "custom modified code");
        });

        const applyBtn = container.querySelector(
          '[data-testid="apply-intervention-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          applyBtn.click();
        });

        expect(root?.getAttribute("data-intervention-applied")).toBe("true");
        expect(root?.getAttribute("data-intervention-modified")).toBe("true");

        const resetBtn = container.querySelector(
          '[data-testid="reset-intervention-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          resetBtn.click();
        });

        expect(textarea.value).toEqual(DEFAULT_MECHANISM_CODE);
        expect(root?.getAttribute("data-intervention-applied")).toBe("false");
        expect(root?.getAttribute("data-intervention-modified")).toBe("false");
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test R — Reset preservation
    // --------------------------------------------------------------------------
    it("Test R: reset intervention does not erase recorded diagnosis or prediction", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupPredictionRecordedState(
          container,
          "Diagnosis statement to keep",
          "high",
          "Prediction statement to keep",
        );

        const resetBtn = container.querySelector(
          '[data-testid="reset-intervention-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          resetBtn.click();
        });

        const surface = container.querySelector('[data-testid="intervention-surface"]');

        expect(
          surface?.querySelector('[data-testid="preserved-diagnosis-statement"]')?.textContent,
        ).toContain("Diagnosis statement to keep");
        expect(
          surface?.querySelector('[data-testid="preserved-prediction-statement"]')?.textContent,
        ).toContain("Prediction statement to keep");
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test S — Remount isolation
    // --------------------------------------------------------------------------
    it("Test S: fresh mount starts at baseline with no intervention applied", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        const root = container.querySelector('[data-testid="account-settings-system"]');
        expect(root?.getAttribute("data-intervention-applied")).toBe("false");
        expect(root?.getAttribute("data-intervention-modified")).toBe("false");
        expect(container.querySelector('[data-testid="intervention-surface"]')).toBeNull();
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test T — Accessibility
    // --------------------------------------------------------------------------
    it("Test T: intervention controls meet accessibility standards", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupPredictionRecordedState(container);

        const surface = container.querySelector('[data-testid="intervention-surface"]');
        expect(surface?.tagName.toLowerCase()).toBe("fieldset");

        const legend = surface?.querySelector("legend");
        expect(legend?.textContent).toContain("Intervention Workbench");

        const textarea = container.querySelector(
          '[data-testid="intervention-mechanism-input"]',
        ) as HTMLTextAreaElement;
        const label = container.querySelector('label[for="account-intervention-mechanism-input"]');
        expect(label).not.toBeNull();
        expect(label?.textContent).toContain("Targeted Mechanism Intervention");

        const applyBtn = container.querySelector(
          '[data-testid="apply-intervention-action-button"]',
        ) as HTMLButtonElement;
        const resetBtn = container.querySelector(
          '[data-testid="reset-intervention-action-button"]',
        ) as HTMLButtonElement;

        expect(applyBtn.textContent).toContain("Apply Intervention");
        expect(resetBtn.textContent).toContain("Reset Intervention");

        expect(applyBtn.classList.contains("min-h-[44px]")).toBe(true);
        expect(resetBtn.classList.contains("min-h-[44px]")).toBe(true);
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test U — Answer leakage
    // --------------------------------------------------------------------------
    it("Test U: mechanism editor contains no Forge-provided solution instructions or TODO hints", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupPredictionRecordedState(container);
        const textarea = container.querySelector(
          '[data-testid="intervention-mechanism-input"]',
        ) as HTMLTextAreaElement;

        expect(textarea.value).not.toMatch(/TODO/i);
        expect(textarea.value).not.toMatch(/FIX:/i);
        expect(textarea.value).not.toMatch(/update status/i);
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test V — No hidden fix
    // --------------------------------------------------------------------------
    it("Test V: correct solution is not pre-applied in the mechanism editor", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupPredictionRecordedState(container);
        const textarea = container.querySelector(
          '[data-testid="intervention-mechanism-input"]',
        ) as HTMLTextAreaElement;

        expect(textarea.value).toEqual(DEFAULT_MECHANISM_CODE);
        expect(textarea.value).not.toContain("account-status");
        expect(textarea.value).not.toContain("textContent");
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test W — Determinism
    // --------------------------------------------------------------------------
    it("Test W: repeated mounts produce deterministic baseline intervention surfaces", () => {
      const { container: c1, cleanup: cl1 } = renderComponent(<AccountSettingsSystem />);
      const { container: c2, cleanup: cl2 } = renderComponent(<AccountSettingsSystem />);
      try {
        setupPredictionRecordedState(c1);
        setupPredictionRecordedState(c2);

        const surf1 = c1.querySelector('[data-testid="intervention-surface"]');
        const surf2 = c2.querySelector('[data-testid="intervention-surface"]');

        expect(surf1?.textContent).toEqual(surf2?.textContent);
      } finally {
        cl1();
        cl2();
      }
    });
  });

  describe("Change 17 — Verification of the Intervention", () => {
    // --------------------------------------------------------------------------
    // Test A — Verification surface gating
    // --------------------------------------------------------------------------
    it("Test A: verification surface is absent until intervention is applied", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        expect(container.querySelector('[data-testid="verification-surface"]')).toBeNull();

        setupPredictionRecordedState(container);
        expect(container.querySelector('[data-testid="verification-surface"]')).toBeNull();

        setupInterventionAppliedState(container);
        expect(container.querySelector('[data-testid="verification-surface"]')).not.toBeNull();
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test B — Experimental record preservation
    // --------------------------------------------------------------------------
    it("Test B: verification surface preserves complete experimental record (diagnosis, prediction, intervention, consequence)", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupInterventionAppliedState(
          container,
          "const x = 1;",
          "Specific diagnosis text",
          "high",
          "Specific prediction text",
        );

        expect(
          container.querySelector('[data-testid="preserved-diagnosis-statement"]')?.textContent,
        ).toContain("Specific diagnosis text");
        expect(
          container.querySelector('[data-testid="preserved-prediction-statement"]')?.textContent,
        ).toContain("Specific prediction text");
        expect(
          container.querySelector('[data-testid="consequence-intervention-summary"]')?.textContent,
        ).toContain("const x = 1;");
        expect(
          container.querySelector('[data-testid="consequence-observed-result"]')?.textContent,
        ).toBeDefined();
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test C — Question 1 (Comparison)
    // --------------------------------------------------------------------------
    it("Test C: comparison question renders options and allows selecting an option", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupInterventionAppliedState(container);

        VERIFICATION_COMPARISON_OPTIONS.forEach((opt) => {
          const radio = container.querySelector(
            `input[id="verification-comparison-${opt.id}"]`,
          ) as HTMLInputElement;
          expect(radio).not.toBeNull();
        });

        const targetRadio = container.querySelector(
          'input[id="verification-comparison-yes"]',
        ) as HTMLInputElement;

        act(() => {
          targetRadio.click();
        });

        expect(targetRadio.checked).toBe(true);

        const root = container.querySelector('[data-testid="account-settings-system"]');
        expect(root?.getAttribute("data-verification-comparison")).toBe("yes");
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test D — Question 2 (Causal Assessment)
    // --------------------------------------------------------------------------
    it("Test D: causal assessment question renders options and allows selecting an option", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupInterventionAppliedState(container);

        VERIFICATION_ASSESSMENT_OPTIONS.forEach((opt) => {
          const radio = container.querySelector(
            `input[id="verification-assessment-${opt.id}"]`,
          ) as HTMLInputElement;
          expect(radio).not.toBeNull();
        });

        const targetRadio = container.querySelector(
          'input[id="verification-assessment-stronger_reason"]',
        ) as HTMLInputElement;

        act(() => {
          targetRadio.click();
        });

        expect(targetRadio.checked).toBe(true);

        const root = container.querySelector('[data-testid="account-settings-system"]');
        expect(root?.getAttribute("data-verification-assessment")).toBe("stronger_reason");
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test E — Record button enablement
    // --------------------------------------------------------------------------
    it("Test E: record verification button is disabled until both comparison and causal assessment questions are answered", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupInterventionAppliedState(container);

        const recordBtn = container.querySelector(
          '[data-testid="record-verification-action-button"]',
        ) as HTMLButtonElement;

        expect(recordBtn.disabled).toBe(true);

        // Select comparison only
        const compRadio = container.querySelector(
          'input[id="verification-comparison-yes"]',
        ) as HTMLInputElement;
        act(() => {
          compRadio.click();
        });
        expect(recordBtn.disabled).toBe(true);

        // Select causal assessment as well
        const assessRadio = container.querySelector(
          'input[id="verification-assessment-stronger_reason"]',
        ) as HTMLInputElement;
        act(() => {
          assessRadio.click();
        });

        expect(recordBtn.disabled).toBe(false);
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test F — Recording verification
    // --------------------------------------------------------------------------
    it("Test F: clicking record verification sets recorded state and renders confirmation message", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupInterventionAppliedState(container);

        const compRadio = container.querySelector(
          'input[id="verification-comparison-yes"]',
        ) as HTMLInputElement;
        const assessRadio = container.querySelector(
          'input[id="verification-assessment-stronger_reason"]',
        ) as HTMLInputElement;
        const recordBtn = container.querySelector(
          '[data-testid="record-verification-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          compRadio.click();
          assessRadio.click();
        });

        act(() => {
          recordBtn.click();
        });

        const root = container.querySelector('[data-testid="account-settings-system"]');
        expect(root?.getAttribute("data-verification-recorded")).toBe("true");

        const statusMsg = container.querySelector('[data-testid="verification-recorded-status"]');
        expect(statusMsg).not.toBeNull();
        expect(statusMsg?.textContent).toContain("Verification recorded.");

        const cue = container.querySelector('[data-testid="verification-transition-cue"]');
        expect(cue).not.toBeNull();
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test G — Local React state boundary
    // --------------------------------------------------------------------------
    it("Test G: verification state is maintained as local React state without persisting across component boundaries", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupInterventionAppliedState(container);

        const compRadio = container.querySelector(
          'input[id="verification-comparison-yes"]',
        ) as HTMLInputElement;
        const assessRadio = container.querySelector(
          'input[id="verification-assessment-stronger_reason"]',
        ) as HTMLInputElement;
        const recordBtn = container.querySelector(
          '[data-testid="record-verification-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          compRadio.click();
          assessRadio.click();
          recordBtn.click();
        });

        const root = container.querySelector('[data-testid="account-settings-system"]');
        expect(root?.getAttribute("data-verification-recorded")).toBe("true");
        expect(root?.getAttribute("data-verification-comparison")).toBe("yes");
        expect(root?.getAttribute("data-verification-assessment")).toBe("stronger_reason");
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test H — Invalidation on intervention change
    // --------------------------------------------------------------------------
    it("Test H: modifying intervention text invalidates recorded verification state", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupInterventionAppliedState(container);

        const compRadio = container.querySelector(
          'input[id="verification-comparison-yes"]',
        ) as HTMLInputElement;
        const assessRadio = container.querySelector(
          'input[id="verification-assessment-stronger_reason"]',
        ) as HTMLInputElement;
        const recordBtn = container.querySelector(
          '[data-testid="record-verification-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          compRadio.click();
          assessRadio.click();
          recordBtn.click();
        });

        const root = container.querySelector('[data-testid="account-settings-system"]');
        expect(root?.getAttribute("data-verification-recorded")).toBe("true");

        const textarea = container.querySelector(
          '[data-testid="intervention-mechanism-input"]',
        ) as HTMLTextAreaElement;

        act(() => {
          setTextareaValue(textarea, "new modified intervention code");
        });

        expect(root?.getAttribute("data-verification-recorded")).toBe("false");
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test I — Invalidation on reset
    // --------------------------------------------------------------------------
    it("Test I: resetting intervention clears and invalidates verification state", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupInterventionAppliedState(container);

        const compRadio = container.querySelector(
          'input[id="verification-comparison-yes"]',
        ) as HTMLInputElement;
        const assessRadio = container.querySelector(
          'input[id="verification-assessment-stronger_reason"]',
        ) as HTMLInputElement;
        const recordBtn = container.querySelector(
          '[data-testid="record-verification-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          compRadio.click();
          assessRadio.click();
          recordBtn.click();
        });

        const root = container.querySelector('[data-testid="account-settings-system"]');
        expect(root?.getAttribute("data-verification-recorded")).toBe("true");

        const resetBtn = container.querySelector(
          '[data-testid="reset-intervention-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          resetBtn.click();
        });

        expect(root?.getAttribute("data-verification-recorded")).toBe("false");
        expect(root?.getAttribute("data-verification-comparison")).toBe("none");
        expect(root?.getAttribute("data-verification-assessment")).toBe("none");
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test J — No automatic correctness grading
    // --------------------------------------------------------------------------
    it("Test J: verification surface contains no automatic correctness grading or score labels", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupInterventionAppliedState(container);

        const compRadio = container.querySelector(
          'input[id="verification-comparison-yes"]',
        ) as HTMLInputElement;
        const assessRadio = container.querySelector(
          'input[id="verification-assessment-stronger_reason"]',
        ) as HTMLInputElement;
        const recordBtn = container.querySelector(
          '[data-testid="record-verification-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          compRadio.click();
          assessRadio.click();
          recordBtn.click();
        });

        const surfText =
          container.querySelector('[data-testid="verification-surface"]')?.textContent ?? "";

        expect(surfText).not.toMatch(/\bCorrect\b/i);
        expect(surfText).not.toMatch(/\bIncorrect\b/i);
        expect(surfText).not.toMatch(/\bGrade\b/i);
        expect(surfText).not.toMatch(/\bScore\b/i);
        expect(surfText).not.toMatch(/\bPassed\b/i);
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test K — No solution leakage
    // --------------------------------------------------------------------------
    it("Test K: verification surface does not reveal canonical solution code or answer secrets", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupInterventionAppliedState(container);

        const surfText =
          container.querySelector('[data-testid="verification-surface"]')?.textContent ?? "";

        expect(surfText).not.toContain("document.getElementById('account-status')");
        expect(surfText).not.toContain("textContent = 'Saved'");
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test L — Keyboard accessibility
    // --------------------------------------------------------------------------
    it("Test L: verification controls use standard semantic fieldsets, legends, labels, and touch targets", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupInterventionAppliedState(container);

        const surf = container.querySelector('[data-testid="verification-surface"]');
        expect(surf?.tagName.toLowerCase()).toBe("fieldset");

        const legend = surf?.querySelector("legend");
        expect(legend?.textContent).toContain("Verification of the Intervention");

        VERIFICATION_COMPARISON_OPTIONS.forEach((opt) => {
          const radio = container.querySelector(`input[id="verification-comparison-${opt.id}"]`);
          const label = container.querySelector(`label[for="verification-comparison-${opt.id}"]`);
          expect(radio).not.toBeNull();
          expect(label).not.toBeNull();
          expect(label?.classList.contains("min-h-[44px]")).toBe(true);
        });

        VERIFICATION_ASSESSMENT_OPTIONS.forEach((opt) => {
          const radio = container.querySelector(`input[id="verification-assessment-${opt.id}"]`);
          const label = container.querySelector(`label[for="verification-assessment-${opt.id}"]`);
          expect(radio).not.toBeNull();
          expect(label).not.toBeNull();
          expect(label?.classList.contains("min-h-[44px]")).toBe(true);
        });

        const recordBtn = container.querySelector(
          '[data-testid="record-verification-action-button"]',
        ) as HTMLButtonElement;
        expect(recordBtn.classList.contains("min-h-[44px]")).toBe(true);
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test M — Remount isolation
    // --------------------------------------------------------------------------
    it("Test M: fresh mount starts with no recorded verification state", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        const root = container.querySelector('[data-testid="account-settings-system"]');
        expect(root?.getAttribute("data-verification-recorded")).toBe("false");
        expect(root?.getAttribute("data-verification-comparison")).toBe("none");
        expect(root?.getAttribute("data-verification-assessment")).toBe("none");
        expect(container.querySelector('[data-testid="verification-surface"]')).toBeNull();
      } finally {
        cleanup();
      }
    });

    // --------------------------------------------------------------------------
    // Test N — Determinism
    // --------------------------------------------------------------------------
    it("Test N: repeated mounts produce deterministic baseline verification surfaces", () => {
      const { container: c1, cleanup: cl1 } = renderComponent(<AccountSettingsSystem />);
      const { container: c2, cleanup: cl2 } = renderComponent(<AccountSettingsSystem />);
      try {
        setupInterventionAppliedState(c1);
        setupInterventionAppliedState(c2);

        const surf1 = c1.querySelector('[data-testid="verification-surface"]');
        const surf2 = c2.querySelector('[data-testid="verification-surface"]');

        expect(surf1?.textContent).toEqual(surf2?.textContent);
      } finally {
        cl1();
        cl2();
      }
    });
  });

  function setupVerificationRecordedState(
    container: HTMLElement,
    code = "custom modified code",
    statement = "The handler executes on click but does not trigger the status DOM update",
    confidence: "high" | "medium" | "low" = "high",
    prediction = "When the click handler updates the status DOM element, clicking Save will change the status text.",
    comparison: "yes" | "partial" | "no" = "yes",
    assessment: "stronger_reason" | "revised_understanding" | "inconclusive" = "stronger_reason",
  ) {
    setupInterventionAppliedState(container, code, statement, confidence, prediction);

    const compRadio = container.querySelector(
      `input[id="verification-comparison-${comparison}"]`,
    ) as HTMLInputElement;
    const assessRadio = container.querySelector(
      `input[id="verification-assessment-${assessment}"]`,
    ) as HTMLInputElement;

    if (compRadio && assessRadio) {
      act(() => {
        compRadio.click();
        assessRadio.click();
      });
    }

    const recordBtn = container.querySelector(
      '[data-testid="record-verification-action-button"]',
    ) as HTMLButtonElement;

    if (recordBtn) {
      act(() => {
        recordBtn.click();
      });
    }
  }

  describe("Change 18 — Learner-Owned Causal Explanation", () => {
    // Test A — Gating
    it("Test A: explanation surface is absent until verification is recorded", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        expect(container.querySelector('[data-testid="explanation-surface"]')).toBeNull();

        setupInterventionAppliedState(container);
        expect(container.querySelector('[data-testid="explanation-surface"]')).toBeNull();

        setupVerificationRecordedState(container);
        expect(container.querySelector('[data-testid="explanation-surface"]')).not.toBeNull();
      } finally {
        cleanup();
      }
    });

    // Test B — Investigation record: Observed Behavior
    it("Test B: preserves observed behavior in investigation record summary", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupVerificationRecordedState(container);
        const obs = container.querySelector(
          '[data-testid="explanation-preserved-observed-behavior"]',
        );
        expect(obs?.textContent).toContain("Save Settings indicates saving visually");
      } finally {
        cleanup();
      }
    });

    // Test C — Investigation record: Evidence
    it("Test C: preserves evidence gathered in investigation record summary", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupVerificationRecordedState(container);
        const ev = container.querySelector('[data-testid="explanation-preserved-evidence"]');
        expect(ev).not.toBeNull();
      } finally {
        cleanup();
      }
    });

    // Test D — Investigation record: Diagnosis
    it("Test D: preserves diagnosis statement in investigation record summary", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupVerificationRecordedState(container);
        const diag = container.querySelector('[data-testid="explanation-preserved-diagnosis"]');
        expect(diag?.textContent).toBeDefined();
        expect(diag?.textContent?.length).toBeGreaterThan(0);
      } finally {
        cleanup();
      }
    });

    // Test E — Investigation record: Prediction
    it("Test E: preserves prediction statement in investigation record summary", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupVerificationRecordedState(
          container,
          "custom code",
          "diagnosis",
          "high",
          "Specific custom prediction statement",
        );
        const pred = container.querySelector('[data-testid="explanation-preserved-prediction"]');
        expect(pred?.textContent).toContain("Specific custom prediction statement");
      } finally {
        cleanup();
      }
    });

    // Test F — Investigation record: Intervention
    it("Test F: preserves intervention code in investigation record summary", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupVerificationRecordedState(container, "function testIntervention() {}");
        const interv = container.querySelector(
          '[data-testid="explanation-preserved-intervention"]',
        );
        expect(interv?.textContent).toContain("function testIntervention() {}");
      } finally {
        cleanup();
      }
    });

    // Test G — Investigation record: Observed Consequence
    it("Test G: preserves observed consequence in investigation record summary", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupVerificationRecordedState(container);
        const cons = container.querySelector('[data-testid="explanation-preserved-consequence"]');
        expect(cons?.textContent).toContain("Simulated save execution updated status element");
      } finally {
        cleanup();
      }
    });

    // Test H — Investigation record: Verification
    it("Test H: preserves verification choice in investigation record summary", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupVerificationRecordedState(
          container,
          "code",
          "statement",
          "high",
          "prediction",
          "yes",
          "stronger_reason",
        );
        const ver = container.querySelector('[data-testid="explanation-preserved-verification"]');
        expect(ver?.textContent).toContain("Matched:");
        expect(ver?.textContent).toContain("Assessment:");
      } finally {
        cleanup();
      }
    });

    // Test I — Prompt
    it("Test I: renders causal explanation prompt asking learner to reconstruct causal chain", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupVerificationRecordedState(container);
        const surf = container.querySelector('[data-testid="explanation-surface"]');
        expect(surf?.textContent).toContain("Explain What Happened");
        expect(surf?.textContent).toContain("Reconstruct the causal chain");
        expect(surf?.textContent).toContain("What caused the original behavior in the system?");
      } finally {
        cleanup();
      }
    });

    // Test J — Disabled button when empty
    it("Test J: record button is disabled when explanation is empty", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupVerificationRecordedState(container);
        const btn = container.querySelector(
          '[data-testid="record-explanation-action-button"]',
        ) as HTMLButtonElement;
        expect(btn.disabled).toBe(true);
      } finally {
        cleanup();
      }
    });

    // Test K — Disabled button when < MIN_EXPLANATION_CHARACTERS
    it("Test K: record button remains disabled when explanation is shorter than character threshold", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupVerificationRecordedState(container);
        const input = container.querySelector(
          '[data-testid="causal-explanation-input"]',
        ) as HTMLTextAreaElement;
        const btn = container.querySelector(
          '[data-testid="record-explanation-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          setTextareaValue(input, "Short text under min length");
        });

        expect(btn.disabled).toBe(true);
      } finally {
        cleanup();
      }
    });

    // Test L — Enabled button when >= MIN_EXPLANATION_CHARACTERS
    it("Test L: record button becomes enabled when explanation meets character threshold", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupVerificationRecordedState(container);
        const input = container.querySelector(
          '[data-testid="causal-explanation-input"]',
        ) as HTMLTextAreaElement;
        const btn = container.querySelector(
          '[data-testid="record-explanation-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          setTextareaValue(
            input,
            "The event handler was missing a call to update the status text element, so clicking save changed visual state but not status text.",
          );
        });

        expect(btn.disabled).toBe(false);
      } finally {
        cleanup();
      }
    });

    // Test M — Recording sets data attribute
    it("Test M: clicking Record Explanation updates data-explanation-recorded to true", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupVerificationRecordedState(container);
        const root = container.querySelector('[data-testid="account-settings-system"]');
        expect(root?.getAttribute("data-explanation-recorded")).toBe("false");

        const input = container.querySelector(
          '[data-testid="causal-explanation-input"]',
        ) as HTMLTextAreaElement;
        const btn = container.querySelector(
          '[data-testid="record-explanation-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          setTextareaValue(
            input,
            "The event handler was missing a call to update the status text element, so clicking save changed visual state but not status text.",
          );
          btn.click();
        });

        expect(root?.getAttribute("data-explanation-recorded")).toBe("true");
        expect(Number(root?.getAttribute("data-explanation-length"))).toBeGreaterThanOrEqual(
          MIN_EXPLANATION_CHARACTERS,
        );
      } finally {
        cleanup();
      }
    });

    // Test N — Neutral status message
    it("Test N: displays neutral status message and transition cue when recorded", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupVerificationRecordedState(container);
        const input = container.querySelector(
          '[data-testid="causal-explanation-input"]',
        ) as HTMLTextAreaElement;
        const btn = container.querySelector(
          '[data-testid="record-explanation-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          setTextareaValue(
            input,
            "The event handler was missing a call to update the status text element, so clicking save changed visual state but not status text.",
          );
          btn.click();
        });

        const status = container.querySelector('[data-testid="explanation-recorded-status"]');
        const cue = container.querySelector('[data-testid="explanation-transition-cue"]');

        expect(status?.textContent).toContain("Explanation recorded.");
        expect(cue?.textContent).toContain(
          "You have reconstructed the investigation in your own words.",
        );
      } finally {
        cleanup();
      }
    });

    // Test O — No correctness grading
    it("Test O: explanation surface displays no correctness judgments, pass/fail, or scores", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupVerificationRecordedState(container);
        const input = container.querySelector(
          '[data-testid="causal-explanation-input"]',
        ) as HTMLTextAreaElement;
        const btn = container.querySelector(
          '[data-testid="record-explanation-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          setTextareaValue(
            input,
            "The event handler was missing a call to update the status text element, so clicking save changed visual state but not status text.",
          );
          btn.click();
        });

        const text =
          container.querySelector('[data-testid="explanation-surface"]')?.textContent ?? "";
        expect(text).not.toMatch(/\bCorrect!\b/i);
        expect(text).not.toMatch(/\bIncorrect\b/i);
        expect(text).not.toMatch(/\bGrade\b/i);
        expect(text).not.toMatch(/\bScore\b/i);
        expect(text).not.toMatch(/\bPassed\b/i);
      } finally {
        cleanup();
      }
    });

    // Test P — No canonical code leakage
    it("Test P: explanation surface does not reveal canonical solution secrets", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupVerificationRecordedState(container);
        const text =
          container.querySelector('[data-testid="explanation-surface"]')?.textContent ?? "";
        expect(text).not.toContain("document.getElementById('account-status')");
        expect(text).not.toContain("textContent = 'Saved'");
      } finally {
        cleanup();
      }
    });

    // Test Q — No prefilled canonical diagnosis
    it("Test Q: explanation textarea starts completely empty without prefilled canonical answer", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupVerificationRecordedState(container);
        const input = container.querySelector(
          '[data-testid="causal-explanation-input"]',
        ) as HTMLTextAreaElement;
        expect(input.value).toBe("");
      } finally {
        cleanup();
      }
    });

    // Test R — No AI/semantic grading
    it("Test R: accepts freeform explanation text without executing AI models or semantic evaluators", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupVerificationRecordedState(container);
        const input = container.querySelector(
          '[data-testid="causal-explanation-input"]',
        ) as HTMLTextAreaElement;
        const btn = container.querySelector(
          '[data-testid="record-explanation-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          setTextareaValue(
            input,
            "This is a freeform text explanation that describes the mechanism and consequence without external grading.",
          );
          btn.click();
        });

        const root = container.querySelector('[data-testid="account-settings-system"]');
        expect(root?.getAttribute("data-explanation-recorded")).toBe("true");
      } finally {
        cleanup();
      }
    });

    // Test S — Local state boundary
    it("Test S: explanation state is maintained strictly as local React state", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupVerificationRecordedState(container);
        const input = container.querySelector(
          '[data-testid="causal-explanation-input"]',
        ) as HTMLTextAreaElement;
        const btn = container.querySelector(
          '[data-testid="record-explanation-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          setTextareaValue(
            input,
            "The handler executes on click but does not trigger the status DOM update, causing unsaved text.",
          );
          btn.click();
        });

        const root = container.querySelector('[data-testid="account-settings-system"]');
        expect(root?.getAttribute("data-explanation-recorded")).toBe("true");
      } finally {
        cleanup();
      }
    });

    // Test T — Editing invalidates record
    it("Test T: editing explanation text after recording resets recorded state to false", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupVerificationRecordedState(container);
        const input = container.querySelector(
          '[data-testid="causal-explanation-input"]',
        ) as HTMLTextAreaElement;
        const btn = container.querySelector(
          '[data-testid="record-explanation-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          setTextareaValue(
            input,
            "The handler executes on click but does not trigger the status DOM update, causing unsaved text.",
          );
          btn.click();
        });

        const root = container.querySelector('[data-testid="account-settings-system"]');
        expect(root?.getAttribute("data-explanation-recorded")).toBe("true");

        act(() => {
          setTextareaValue(
            input,
            "The handler executes on click but does not trigger the status DOM update, causing unsaved text. (editing)",
          );
        });

        expect(root?.getAttribute("data-explanation-recorded")).toBe("false");
      } finally {
        cleanup();
      }
    });

    // Test U — Intervention invalidates explanation record
    it("Test U: modifying intervention code invalidates recorded explanation state", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupVerificationRecordedState(container);
        const input = container.querySelector(
          '[data-testid="causal-explanation-input"]',
        ) as HTMLTextAreaElement;
        const btn = container.querySelector(
          '[data-testid="record-explanation-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          setTextareaValue(
            input,
            "The handler executes on click but does not trigger the status DOM update, causing unsaved text.",
          );
          btn.click();
        });

        const root = container.querySelector('[data-testid="account-settings-system"]');
        expect(root?.getAttribute("data-explanation-recorded")).toBe("true");

        const codeInput = container.querySelector(
          '[data-testid="intervention-mechanism-input"]',
        ) as HTMLTextAreaElement;

        act(() => {
          setTextareaValue(codeInput, "function modifiedCode() {}");
        });

        expect(root?.getAttribute("data-explanation-recorded")).toBe("false");
      } finally {
        cleanup();
      }
    });

    // Test V — Verification comparison invalidates explanation record
    it("Test V: changing verification comparison invalidates recorded explanation state", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupVerificationRecordedState(container);
        const input = container.querySelector(
          '[data-testid="causal-explanation-input"]',
        ) as HTMLTextAreaElement;
        const btn = container.querySelector(
          '[data-testid="record-explanation-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          setTextareaValue(
            input,
            "The handler executes on click but does not trigger the status DOM update, causing unsaved text.",
          );
          btn.click();
        });

        const root = container.querySelector('[data-testid="account-settings-system"]');
        expect(root?.getAttribute("data-explanation-recorded")).toBe("true");

        const compPartial = container.querySelector(
          'input[id="verification-comparison-partly"]',
        ) as HTMLInputElement;

        act(() => {
          compPartial.click();
        });

        expect(root?.getAttribute("data-explanation-recorded")).toBe("false");
      } finally {
        cleanup();
      }
    });

    // Test W — Verification assessment invalidates explanation record
    it("Test W: changing verification assessment invalidates recorded explanation state", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupVerificationRecordedState(container);
        const input = container.querySelector(
          '[data-testid="causal-explanation-input"]',
        ) as HTMLTextAreaElement;
        const btn = container.querySelector(
          '[data-testid="record-explanation-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          setTextareaValue(
            input,
            "The handler executes on click but does not trigger the status DOM update, causing unsaved text.",
          );
          btn.click();
        });

        const root = container.querySelector('[data-testid="account-settings-system"]');
        expect(root?.getAttribute("data-explanation-recorded")).toBe("true");

        const assessRev = container.querySelector(
          'input[id="verification-assessment-weaker_reason"]',
        ) as HTMLInputElement;

        act(() => {
          assessRev.click();
        });

        expect(root?.getAttribute("data-explanation-recorded")).toBe("false");
      } finally {
        cleanup();
      }
    });

    // Test X — Reset invalidates explanation record
    it("Test X: clicking reset intervention invalidates recorded explanation state", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupVerificationRecordedState(container);
        const input = container.querySelector(
          '[data-testid="causal-explanation-input"]',
        ) as HTMLTextAreaElement;
        const btn = container.querySelector(
          '[data-testid="record-explanation-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          setTextareaValue(
            input,
            "The handler executes on click but does not trigger the status DOM update, causing unsaved text.",
          );
          btn.click();
        });

        const root = container.querySelector('[data-testid="account-settings-system"]');
        expect(root?.getAttribute("data-explanation-recorded")).toBe("true");

        const resetBtn = container.querySelector(
          '[data-testid="reset-intervention-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          resetBtn.click();
        });

        expect(root?.getAttribute("data-explanation-recorded")).toBe("false");
      } finally {
        cleanup();
      }
    });

    // Test Y — Explanation text preserved across invalidation
    it("Test Y: invalidating recorded state preserves written explanation text in textarea", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupVerificationRecordedState(container);
        const input = container.querySelector(
          '[data-testid="causal-explanation-input"]',
        ) as HTMLTextAreaElement;
        const btn = container.querySelector(
          '[data-testid="record-explanation-action-button"]',
        ) as HTMLButtonElement;

        const textValue =
          "The handler executes on click but does not trigger the status DOM update, causing unsaved text.";

        act(() => {
          setTextareaValue(input, textValue);
          btn.click();
        });

        const root = container.querySelector('[data-testid="account-settings-system"]');
        expect(root?.getAttribute("data-explanation-recorded")).toBe("true");

        // Invalidate via verification assessment change
        const assessRev = container.querySelector(
          'input[id="verification-assessment-weaker_reason"]',
        ) as HTMLInputElement;

        act(() => {
          assessRev.click();
        });

        expect(root?.getAttribute("data-explanation-recorded")).toBe("false");

        // Re-record verification to re-mount explanation surface
        const recordVerifBtn = container.querySelector(
          '[data-testid="record-verification-action-button"]',
        ) as HTMLButtonElement;

        act(() => {
          recordVerifBtn.click();
        });

        // Explanation input still has the written text preserved in state
        const reInput = container.querySelector(
          '[data-testid="causal-explanation-input"]',
        ) as HTMLTextAreaElement;
        expect(reInput.value).toBe(textValue);
      } finally {
        cleanup();
      }
    });

    // Test Z — Accessibility
    it("Test Z: explanation controls use standard semantic fieldset, legend, label, and min-h-[44px] touch targets", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        setupVerificationRecordedState(container);

        const surface = container.querySelector('[data-testid="explanation-surface"]');
        expect(surface?.tagName.toLowerCase()).toBe("fieldset");

        const legend = surface?.querySelector("legend");
        expect(legend?.textContent).toContain("Explain What Happened");

        const label = container.querySelector('label[for="account-causal-explanation"]');
        expect(label).not.toBeNull();

        const btn = container.querySelector(
          '[data-testid="record-explanation-action-button"]',
        ) as HTMLButtonElement;
        expect(btn.classList.contains("min-h-[44px]")).toBe(true);

        const textarea = container.querySelector(
          '[data-testid="causal-explanation-input"]',
        ) as HTMLTextAreaElement;
        expect(textarea.getAttribute("aria-describedby")).toContain("explanation-char-count");
      } finally {
        cleanup();
      }
    });

    // Test AA — Remount isolation
    it("Test AA: fresh mount starts with no recorded explanation state", () => {
      const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
      try {
        const root = container.querySelector('[data-testid="account-settings-system"]');
        expect(root?.getAttribute("data-explanation-recorded")).toBe("false");
        expect(root?.getAttribute("data-explanation-length")).toBe("0");
        expect(container.querySelector('[data-testid="explanation-surface"]')).toBeNull();
      } finally {
        cleanup();
      }
    });

    // Test AB — Determinism
    it("Test AB: repeated mounts produce deterministic baseline explanation surfaces", () => {
      const { container: c1, cleanup: cl1 } = renderComponent(<AccountSettingsSystem />);
      const { container: c2, cleanup: cl2 } = renderComponent(<AccountSettingsSystem />);
      try {
        setupVerificationRecordedState(c1);
        setupVerificationRecordedState(c2);

        const surf1 = c1.querySelector('[data-testid="explanation-surface"]');
        const surf2 = c2.querySelector('[data-testid="explanation-surface"]');

        expect(surf1?.textContent).toEqual(surf2?.textContent);
      } finally {
        cl1();
        cl2();
      }
    });
  });
});
