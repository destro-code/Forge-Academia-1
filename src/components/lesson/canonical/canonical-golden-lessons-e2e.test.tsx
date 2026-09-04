// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { CanonicalLessonPlayer } from "./canonical-lesson-player";
import { canonicalProvider } from "@/lib/curriculum/canonical-provider";
import { InMemorySessionPersistenceAdapter } from "@/lib/learning-engine/persistence-port";
import { LocalStorageSessionPersistenceAdapter } from "@/lib/learning-engine/local-storage-persistence";
import { useProgressStore } from "@/lib/stores/use-progress-store";
import { renderActivity } from "./registry";
import { evaluateActivityValidation } from "./validation";
import type { CanonicalLesson } from "@/lib/curriculum/types";

// Helper to render CanonicalLessonPlayer in happy-dom test container
function renderPlayer(
  lesson: CanonicalLesson,
  props: {
    onComplete?: () => void;
    className?: string;
  } = {},
) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root: Root = createRoot(container);

  act(() => {
    root.render(
      React.createElement(CanonicalLessonPlayer, {
        lesson,
        onComplete: props.onComplete,
        className: props.className,
      }),
    );
  });

  return {
    container,
    root,
    rerender(updatedProps: typeof props = {}) {
      act(() => {
        root.render(
          React.createElement(CanonicalLessonPlayer, {
            lesson,
            onComplete: updatedProps.onComplete ?? props.onComplete,
            className: updatedProps.className ?? props.className,
          }),
        );
      });
    },
    unmount() {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}

// Action helper to advance non-interactive or completed activities
function advanceActivity(container: HTMLElement) {
  const buttons = Array.from(container.querySelectorAll("button"));
  const btn = buttons.find(
    (b) =>
      b.textContent?.includes("Start Learning") ||
      b.textContent?.includes("Continue") ||
      b.textContent?.includes("Complete Lesson") ||
      b.textContent?.includes("Proceed to Completion") ||
      b.textContent?.includes("Set the skill"),
  );
  if (!btn) {
    const allLabels = buttons.map((b) => b.textContent?.trim()).join(" | ");
    throw new Error(`Advance button not found in UI. Rendered buttons: [${allLabels}]`);
  }
  act(() => {
    btn.click();
  });
}

function findFiberWithProp(fiber: any, propName: string): any {
  if (!fiber) return null;
  if (fiber.memoizedProps && fiber.memoizedProps[propName]) {
    return fiber;
  }
  let child = fiber.child;
  while (child) {
    const found = findFiberWithProp(child, propName);
    if (found) return found;
    child = child.sibling;
  }
  return null;
}

// Action helper to submit interactive activity solutions
function submitActivity(container: HTMLElement) {
  const buttons = Array.from(container.querySelectorAll("button"));
  const btn = buttons.find(
    (b) =>
      b.textContent?.includes("Check Answer") ||
      b.textContent?.includes("Submit Fix") ||
      b.textContent?.includes("Submit Reflection"),
  );
  if (!btn) {
    const allLabels = buttons.map((b) => b.textContent?.trim()).join(" | ");
    throw new Error(`Submit button not found in UI. Rendered buttons: [${allLabels}]`);
  }
  act(() => {
    btn.click();
  });

  // If this triggered asynchronous runtime evaluation (status === 'evaluating'),
  // simulate the runtime sandbox completing validation and returning authoritative results.
  const playerEl = container.querySelector("[data-testid='canonical-lesson-player']");
  const fiberKey = playerEl
    ? Object.keys(playerEl).find((k) => k.startsWith("__reactFiber$"))
    : null;
  const rootFiber = fiberKey ? (playerEl as any)[fiberKey] : null;
  const activityViewFiber = findFiberWithProp(rootFiber, "onRuntimeValidation");

  if (activityViewFiber?.memoizedProps?.activityState?.status === "evaluating") {
    const { activity, onRuntimeValidation, activityState } = activityViewFiber.memoizedProps;
    const response =
      activityState.response ?? activity.content?.starterCode ?? activity.content?.buggyCode;
    const result = evaluateActivityValidation(activity, response);
    act(() => {
      onRuntimeValidation(result);
    });
  }
}

// Helper to trigger value changes on Input elements in React 19 test environment
function setInputValue(input: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto =
    input instanceof HTMLInputElement
      ? window.HTMLInputElement.prototype
      : window.HTMLTextAreaElement.prototype;
  const nativeSetter = Object.getOwnPropertyDescriptor(proto, "value")?.set;

  act(() => {
    const tracker = (input as any)._valueTracker;
    if (tracker) {
      tracker.setValue(value === "" ? "a" : "");
    }
    if (nativeSetter) {
      nativeSetter.call(input, value);
    } else {
      input.value = value;
    }
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));

    // Direct fallback for React synthetic props in happy-dom/vitest environment
    const reactKey = Object.keys(input).find(
      (k) => k.startsWith("__reactProps$") || k.startsWith("__reactEvents$"),
    );
    if (reactKey) {
      const props = (input as any)[reactKey];
      if (props?.onChange) {
        props.onChange({ target: { value } } as any);
      }
    }
  });
}

describe("GATE 6: Full-Stack End-to-End Verification of the 5 Golden Canonical Lessons", () => {
  beforeEach(() => {
    useProgressStore.getState().resetProgress();
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.clear();
    }
  });

  afterEach(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.clear();
    }
  });

  // -------------------------------------------------------------------------
  // GATE 6.1: Golden Lesson Resolution & Provider Wiring
  // -------------------------------------------------------------------------
  describe("Gate 6.1: Golden Lesson Resolution & Provider Integrity", () => {
    const goldenLessonIds = [
      "lesson-0-1-1",
      "lesson-1-1-2",
      "lesson-1-2-7",
      "lesson-1-3-1",
      "lesson-0-2-5",
    ];

    it("1. Resolves all 5 Golden Lessons cleanly via canonicalProvider.getLesson()", () => {
      for (const id of goldenLessonIds) {
        const lesson = canonicalProvider.getLesson(id);
        expect(lesson).toBeDefined();
        expect(lesson?.id).toBe(id);
        expect(lesson?.activities.length).toBeGreaterThan(0);
      }
    });

    it("2. Validates schema and native renderer binding for every activity in all 5 Golden Lessons", () => {
      for (const id of goldenLessonIds) {
        const lesson = canonicalProvider.getLesson(id)!;
        expect(lesson.schemaVersion).toBe("1.0.0");
        expect(lesson.objectives.length).toBeGreaterThan(0);

        for (const actItem of lesson.activities) {
          const element = renderActivity(actItem, { state: { status: "idle" } } as any);
          expect(element).toBeDefined();
        }
      }
    });
  });

  // -------------------------------------------------------------------------
  // GATE 6.2: Golden Lesson 0 — lesson-0-1-1 (The Button Has Betrayed You)
  // -------------------------------------------------------------------------
  describe("Gate 6.2: Golden Lesson 0 (lesson-0-1-1: The Button Has Betrayed You)", () => {
    let lesson: CanonicalLesson;

    beforeEach(() => {
      lesson = canonicalProvider.getLesson("lesson-0-1-1")!;
      expect(lesson).toBeDefined();
    });

    it("1. Mounts CanonicalLessonPlayer and renders header and initial activity (Intro)", () => {
      const player = renderPlayer(lesson);

      expect(player.container.textContent).toContain(lesson.title);
      expect(player.container.textContent).toContain("1 / 14"); // Activity 1 of 14
      expect(player.container.textContent).toContain("You have one job: save the changes");

      player.unmount();
    });

    it("2. Executes complete path: Navigation, Incorrect Quiz Attempt, Retry, Correct Submit, and Complete", () => {
      let completedCalled = false;
      const player = renderPlayer(lesson, {
        onComplete: () => {
          completedCalled = true;
        },
      });

      // Activity 1: Intro (act-0-1-1-intro) -> Continue
      expect(player.container.textContent).toContain("You have one job: save the changes");
      advanceActivity(player.container);

      // Activity 2: Visual (act-0-1-1-visual) -> Continue
      expect(player.container.textContent).toContain("ACCOUNT SETTINGS");
      advanceActivity(player.container);

      // Activity 3: Multiple Choice (act-0-1-1-predict)
      expect(player.container.textContent).toContain(
        "You click “Save Changes.” What should happen",
      );

      // Attempt 1: Click wrong option (opt-b: The browser should close the page)
      let buttons = Array.from(player.container.querySelectorAll("button"));
      const optClose = buttons.find((b) => b.textContent?.includes("browser should close"));
      expect(optClose).toBeDefined();
      act(() => {
        optClose?.click();
      });

      // Click Submit -> should fail
      submitActivity(player.container);

      // Click Try Again
      buttons = Array.from(player.container.querySelectorAll("button"));
      const retryBtn1 = buttons.find((b) => b.textContent?.includes("Try Again"));
      expect(retryBtn1).toBeDefined();
      act(() => {
        retryBtn1?.click();
      });

      // Attempt 2: Click correct option (opt-a: The status should indicate that the changes were saved)
      buttons = Array.from(player.container.querySelectorAll("button"));
      const optSaved = buttons.find((b) =>
        b.textContent?.includes("status should indicate that the changes were saved"),
      );
      expect(optSaved).toBeDefined();
      act(() => {
        optSaved?.click();
      });

      // Submit correct answer
      submitActivity(player.container);
      expect(player.container.textContent).toContain("Exactly. You now have an expectation");

      // Advance to Activity 4 (Multi-Select: act-0-1-1-observe)
      advanceActivity(player.container);

      // Activity 4: Multi-Select (act-0-1-1-observe)
      expect(player.container.textContent).toContain("which statements are directly observable?");

      // Attempt 1: Click 3 options including wrong one (obs-1, obs-2, obs-3)
      buttons = Array.from(player.container.querySelectorAll("button"));
      const obs1Init = buttons.find((b) => b.textContent?.includes("The button can be clicked"));
      expect(obs1Init).toBeDefined();
      act(() => {
        obs1Init?.click();
      });

      buttons = Array.from(player.container.querySelectorAll("button"));
      const obs2Init = buttons.find((b) =>
        b.textContent?.includes("status text did not visibly change"),
      );
      expect(obs2Init).toBeDefined();
      act(() => {
        obs2Init?.click();
      });

      buttons = Array.from(player.container.querySelectorAll("button"));
      const obs3Init = buttons.find((b) => b.textContent?.includes("definitely missing"));
      expect(obs3Init).toBeDefined();
      act(() => {
        obs3Init?.click();
      });

      // Submit -> fails with feedback
      submitActivity(player.container);
      expect(player.container.textContent).toContain("Careful. Some options are explanations");

      // Try Again -> preserves selections
      buttons = Array.from(player.container.querySelectorAll("button"));
      const retryBtn2 = buttons.find((b) => b.textContent?.includes("Try Again"));
      expect(retryBtn2).toBeDefined();
      act(() => {
        retryBtn2?.click();
      });

      // Uncheck wrong option obs-3 (preserved by retry contract) and select correct obs-4
      buttons = Array.from(player.container.querySelectorAll("button"));
      const obs3Deselect = buttons.find((b) => b.textContent?.includes("definitely missing"));
      expect(obs3Deselect).toBeDefined();
      act(() => {
        obs3Deselect?.click();
      });

      buttons = Array.from(player.container.querySelectorAll("button"));
      const obs4Select = buttons.find((b) =>
        b.textContent?.includes("browser did not produce the result"),
      );
      expect(obs4Select).toBeDefined();
      act(() => {
        obs4Select?.click();
      });

      // Submit Multi-Select -> passes
      submitActivity(player.container);
      expect(player.container.textContent).toContain("There it is. You separated what happened");

      // Advance to Activity 5 (Interactive Code: act-0-1-1-manipulate)
      advanceActivity(player.container);

      // Activity 5: Interactive Code (act-0-1-1-manipulate)
      expect(player.container.textContent).toContain("Open the Page");
      const codeAreaHtml = player.container.querySelector<HTMLTextAreaElement>(
        "[data-testid='code-editor-textarea'], textarea",
      );
      expect(codeAreaHtml).not.toBeNull();
      setInputValue(
        codeAreaHtml!,
        '<main>\n  <h1>ACCOUNT SETTINGS</h1>\n  <label>\n    Display name\n    <input value="Remi">\n  </label>\n  <button id="save-button">Save Changes</button>\n  <p id="status">Testing the page.</p>\n</main>',
      );

      submitActivity(player.container);
      advanceActivity(player.container);

      // Activity 6: Explanation (act-0-1-1-model)
      expect(player.container.textContent).toContain("The Page You See Is Not the Source File");
      advanceActivity(player.container);

      // Activity 7: Multiple Choice (act-0-1-1-choice)
      expect(player.container.textContent).toContain("What is the most useful next investigation?");
      buttons = Array.from(player.container.querySelectorAll("button"));
      const optInvestigate = buttons.find((b) =>
        b.textContent?.includes("Inspect the button and look for evidence"),
      );
      expect(optInvestigate).toBeDefined();
      act(() => {
        optInvestigate?.click();
      });
      submitActivity(player.container);
      advanceActivity(player.container);

      // Activity 8: Causal flowchart visual (act-0-1-1-causal-model)
      expect(player.container.textContent).toContain("Follow the Failure");
      advanceActivity(player.container);

      // Activity 9: Output Prediction (act-0-1-1-predict-output)
      expect(player.container.textContent).toContain(
        "What should the status element contain after this code runs?",
      );
      buttons = Array.from(player.container.querySelectorAll("button"));
      const optPredicted = buttons.find((b) => b.textContent?.includes("Changes saved."));
      expect(optPredicted).toBeDefined();
      act(() => {
        optPredicted?.click();
      });
      submitActivity(player.container);
      advanceActivity(player.container);

      // Activity 10: Debug (act-0-1-1-debug)
      expect(player.container.textContent).toContain("The Button Has Evidence");
      const debugArea = player.container.querySelector<HTMLTextAreaElement>(
        "[data-testid='code-editor-textarea'], textarea",
      );
      expect(debugArea).not.toBeNull();
      setInputValue(
        debugArea!,
        "const status = document.querySelector('#status');\n\nfunction handleSave() {\n  status.textContent = 'Changes saved.';\n}",
      );
      submitActivity(player.container);
      advanceActivity(player.container);

      // Activity 11: Reflection (act-0-1-1-explain)
      expect(player.container.textContent).toContain(
        "Explain what caused the visible failure, from the click through to the missing status update",
      );
      const reflectionArea = player.container.querySelector("textarea");
      expect(reflectionArea).not.toBeNull();
      setInputValue(
        reflectionArea!,
        "The user clicked the button which called the save handler, but saveChanges was not defined so JavaScript threw a runtime error and halted execution before updating the status element.",
      );
      submitActivity(player.container);
      advanceActivity(player.container);

      // Activity 12: Transfer Debug (act-0-1-1-transfer)
      expect(player.container.textContent).toContain("One More Button");
      const transferArea = player.container.querySelector<HTMLTextAreaElement>(
        "[data-testid='code-editor-textarea'], textarea",
      );
      expect(transferArea).not.toBeNull();
      setInputValue(
        transferArea!,
        "const list = document.querySelector('#items');\n\nfunction handleAdd() {\n  const item = document.createElement('li');\n  item.textContent = 'New item';\n  list.appendChild(item);\n}",
      );
      submitActivity(player.container);
      advanceActivity(player.container);

      // Activity 13: Summary (act-0-1-1-summary)
      expect(player.container.textContent).toContain("What You Actually Did");
      advanceActivity(player.container);

      // Activity 14: Completion (act-0-1-1-completion)
      expect(player.container.textContent).toContain("The Button Has Been Released From Custody");
      advanceActivity(player.container);

      // Verification of lesson completion & evidence state
      expect(completedCalled).toBe(true);
      expect(useProgressStore.getState().lessonsCompleted).toContain("lesson-0-1-1");

      player.unmount();
    });
  });

  // -------------------------------------------------------------------------
  // GATE 6.3: Golden Lesson 2 — lesson-1-1-2 (Elements, Tags, and Attributes)
  // -------------------------------------------------------------------------
  describe("Gate 6.3: Golden Lesson 2 (lesson-1-1-2: Elements, Tags, and Attributes)", () => {
    let lesson: CanonicalLesson;

    beforeEach(() => {
      lesson = canonicalProvider.getLesson("lesson-1-1-2")!;
      expect(lesson).toBeDefined();
    });

    it("1. Executes Ordering, Multiple Choice, and Interactive Code activities with validation", () => {
      let completedCalled = false;
      const player = renderPlayer(lesson, {
        onComplete: () => {
          completedCalled = true;
        },
      });

      // Walk through Intro (0), Explanation (1), Code Example (2)
      for (let i = 0; i < 3; i++) {
        advanceActivity(player.container);
      }

      // Activity 3: Ordering (act-112-ordering)
      expect(player.container.textContent).toContain("Assemble a valid HTML anchor");
      submitActivity(player.container);

      // Advance to Multiple Choice
      advanceActivity(player.container);

      // Activity 4: Multiple Choice (act-112-mc-nesting)
      expect(player.container.textContent).toContain("VALID HTML element nesting");

      const buttons = Array.from(player.container.querySelectorAll("button"));
      const validOpt = buttons.find((b) =>
        b.textContent?.includes("<p>Learn <strong>frontend</strong>"),
      );

      expect(validOpt).toBeDefined();
      act(() => {
        validOpt?.click();
      });

      // Submit Multiple Choice
      submitActivity(player.container);

      // Advance to Interactive Code
      advanceActivity(player.container);

      // Activity 5: Interactive Code (act-112-code-interactive)
      expect(player.container.textContent).toContain(
        "Complete the following two tasks in the HTML editor",
      );

      const codeArea = player.container.querySelector<HTMLTextAreaElement>(
        "[data-testid='code-editor-textarea'], textarea",
      );
      expect(codeArea).not.toBeNull();
      setInputValue(
        codeArea!,
        `<div class="card" id="profile-card">\n  <h2>Alex Morgan</h2>\n  <p>Role: <span class="badge">Developer</span></p>\n</div>`,
      );

      // Submit Interactive Code
      submitActivity(player.container);

      // Advance to Summary
      advanceActivity(player.container);

      // Activity 6: Summary
      expect(player.container.textContent).toContain("Lesson Summary & Element Anatomy Takeaways");
      advanceActivity(player.container);

      expect(completedCalled).toBe(true);
      expect(useProgressStore.getState().lessonsCompleted).toContain("lesson-1-1-2");

      player.unmount();
    });

    it("2. Verifies session state restoration across unmount using LocalStorageSessionPersistenceAdapter", () => {
      const adapter = new LocalStorageSessionPersistenceAdapter();

      // Mount session 1
      const player1 = renderPlayer(lesson);

      // Advance to Ordering (activity 3)
      for (let i = 0; i < 3; i++) {
        advanceActivity(player1.container);
      }

      expect(player1.container.textContent).toContain("Assemble a valid HTML anchor");

      // Unmount player 1
      player1.unmount();

      // Mount player 2 with same adapter (restores session state)
      const player2 = renderPlayer(lesson);

      // Player 2 should resume at Activity 3 (Ordering)
      expect(player2.container.textContent).toContain("Assemble a valid HTML anchor");

      player2.unmount();
    });
  });

  // -------------------------------------------------------------------------
  // GATE 6.4: Golden Lesson 3 — lesson-1-2-7 (Build a Layout with Flexbox)
  // -------------------------------------------------------------------------
  describe("Gate 6.4: Golden Lesson 3 (lesson-1-2-7: Build a Layout with Flexbox)", () => {
    let lesson: CanonicalLesson;

    beforeEach(() => {
      lesson = canonicalProvider.getLesson("lesson-1-2-7")!;
      expect(lesson).toBeDefined();
    });

    it("1. Executes Intro, Explanation, Visual, Output Prediction, Interactive Code & Summary activities", () => {
      let completedCalled = false;
      const player = renderPlayer(lesson, {
        onComplete: () => {
          completedCalled = true;
        },
      });

      // Advance past Intro (0), Explanation (1), and Visual (2)
      for (let i = 0; i < 3; i++) {
        advanceActivity(player.container);
      }

      // Activity 3: Output Prediction (act-127-output-prediction)
      expect(player.container.textContent).toContain("Predict the exact visual layout produced");
      const buttons = Array.from(player.container.querySelectorAll("button"));
      const correctOpt = buttons.find((b) =>
        b.textContent?.includes("Items are distributed evenly across the horizontal main axis"),
      );
      expect(correctOpt).toBeDefined();
      act(() => {
        correctOpt?.click();
      });

      submitActivity(player.container);

      // Advance to Interactive Code
      advanceActivity(player.container);

      // Activity 4: Interactive Code (act-127-interactive-code)
      expect(player.container.textContent).toContain("Interactive Code Challenge");

      const codeArea = player.container.querySelector<HTMLTextAreaElement>(
        "[data-testid='code-editor-textarea'], textarea",
      );
      expect(codeArea).not.toBeNull();
      setInputValue(
        codeArea!,
        `.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
  padding: 0 24px;
}
.modal-backdrop {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
}`,
      );

      // Submit interactive code
      submitActivity(player.container);

      // Advance to Summary
      advanceActivity(player.container);

      // Activity 5: Summary (act-127-summary)
      expect(player.container.textContent).toContain("Flexbox Layout Mastery");
      advanceActivity(player.container);

      expect(completedCalled).toBe(true);
      expect(useProgressStore.getState().lessonsCompleted).toContain("lesson-1-2-7");

      player.unmount();
    });
  });

  // -------------------------------------------------------------------------
  // GATE 6.5: Golden Lesson 4 — lesson-1-3-1 (Make Your Functions Return Useful Values)
  // -------------------------------------------------------------------------
  describe("Gate 6.5: Golden Lesson 4 (lesson-1-3-1: Make Your Functions Return Useful Values)", () => {
    let lesson: CanonicalLesson;

    beforeEach(() => {
      lesson = canonicalProvider.getLesson("lesson-1-3-1")!;
      expect(lesson).toBeDefined();
    });

    it("1. Executes Output Prediction, Interactive Code refactoring, Reflection, & Summary activities", () => {
      let completedCalled = false;
      const player = renderPlayer(lesson, {
        onComplete: () => {
          completedCalled = true;
        },
      });

      // Activity 0: Intro -> Start Learning
      expect(player.container.textContent).toContain("Make Your Functions Return Useful Values");
      advanceActivity(player.container);

      // Activity 1: Explanation -> Continue
      expect(player.container.textContent).toContain(
        "console.log() vs return: What Actually Happens",
      );
      advanceActivity(player.container);

      // Activity 2: Output Prediction (act-131-output-prediction)
      expect(player.container.textContent).toContain("What value is stored in receipt");
      const buttons = Array.from(player.container.querySelectorAll("button"));
      const optUndefined = buttons.find((b) => b.textContent?.includes("undefined"));
      expect(optUndefined).toBeDefined();
      act(() => {
        optUndefined?.click();
      });

      submitActivity(player.container);

      // Advance to Interactive Code
      advanceActivity(player.container);

      // Activity 3: Interactive Code (act-131-interactive-code)
      expect(player.container.textContent).toContain("Interactive Code Challenge");

      const codeArea = player.container.querySelector<HTMLTextAreaElement>(
        "[data-testid='code-editor-textarea'], textarea",
      );
      expect(codeArea).not.toBeNull();
      setInputValue(
        codeArea!,
        `function calculateDiscount(price, discountPercent) {
  const discountAmount = price * (discountPercent / 100);
  return price - discountAmount;
}

function formatFullName(firstName, lastName) {
  return \`\${firstName} \${lastName}\`;
}

function isAdult(age) {
  return age >= 18;
}`,
      );

      submitActivity(player.container);

      // Advance to Reflection
      advanceActivity(player.container);

      // Activity 4: Reflection (act-131-reflection)
      expect(player.container.textContent).toContain(
        "explain the fundamental difference between console.log() and return",
      );
      const textarea = player.container.querySelector("textarea");
      expect(textarea).not.toBeNull();
      if (textarea) {
        setInputValue(
          textarea,
          "console.log writes output to the developer console for debugging and evaluates to undefined, while return hands computed data back to callers for expression evaluation.",
        );
      }

      submitActivity(player.container);

      // Advance to Summary
      advanceActivity(player.container);

      // Activity 5: Summary (act-131-summary)
      expect(player.container.textContent).toContain("Function Return Value Mastery");
      advanceActivity(player.container);

      expect(completedCalled).toBe(true);
      expect(useProgressStore.getState().lessonsCompleted).toContain("lesson-1-3-1");

      player.unmount();
    });
  });

  // -------------------------------------------------------------------------
  // GATE 6.6: Golden Lesson 5 — lesson-0-2-5 (Fix the Broken Landing Page)
  // -------------------------------------------------------------------------
  describe("Gate 6.6: Golden Lesson 5 (lesson-0-2-5: Fix the Broken Landing Page)", () => {
    let lesson: CanonicalLesson;

    beforeEach(() => {
      lesson = canonicalProvider.getLesson("lesson-0-2-5")!;
      expect(lesson).toBeDefined();
    });

    it("1. Executes Debug HTML, Quiz CSS, Interactive Fix, Reflection & Completion activities", () => {
      let completedCalled = false;
      const player = renderPlayer(lesson, {
        onComplete: () => {
          completedCalled = true;
        },
      });

      // Advance past Intro (0)
      advanceActivity(player.container);

      // Activity 1: Debug HTML (act-025-debug-html)
      expect(player.container.textContent).toContain("Debug Lab Challenge");

      const codeArea1 = player.container.querySelector<HTMLTextAreaElement>(
        "[data-testid='code-editor-textarea'], textarea",
      );
      expect(codeArea1).not.toBeNull();
      setInputValue(
        codeArea1!,
        '<form class="newsletter-form"><input id="email-input" type="email" placeholder="engineer@example.com" /><button type="submit">Subscribe</button></form>',
      );

      submitActivity(player.container);

      // Advance to Quiz CSS
      advanceActivity(player.container);

      // Activity 2: Quiz CSS (act-025-quiz-css)
      expect(player.container.textContent).toContain("hero banner is invisible");
      const buttons = Array.from(player.container.querySelectorAll("button"));
      const optOpacity = buttons.find((b) =>
        b.textContent?.includes("Change opacity: 0 to opacity: 1"),
      );
      expect(optOpacity).toBeDefined();
      act(() => {
        optOpacity?.click();
      });

      submitActivity(player.container);

      // Advance to Interactive Fix
      advanceActivity(player.container);

      // Activity 3: Interactive Fix (act-025-interactive-fix)
      expect(player.container.textContent).toContain("Interactive Code Challenge");

      const codeArea3 = player.container.querySelector<HTMLTextAreaElement>(
        "[data-testid='code-editor-textarea'], textarea",
      );
      expect(codeArea3).not.toBeNull();
      setInputValue(
        codeArea3!,
        '<button id="submit-btn">Launch App</button>\n<p id="status"></p>\n<script>\n  const button = document.getElementById("submit-btn");\n  if (button) {\n    button.addEventListener("click", () => {\n      document.getElementById("status").textContent = "App Launched Successfully!";\n    });\n  }\n</script>',
      );

      submitActivity(player.container);

      // Advance to Reflection
      advanceActivity(player.container);

      // Activity 4: Reflection (act-025-reflection)
      expect(player.container.textContent).toContain("Describe the 3-step checklist");
      const textarea = player.container.querySelector("textarea");
      if (textarea) {
        setInputValue(
          textarea,
          "1. Check Console tab for uncaught exceptions. 2. Inspect the element in DevTools. 3. Verify event handler logic.",
        );
      }

      submitActivity(player.container);
      advanceActivity(player.container);

      // Activity 5: Completion (act-025-completion)
      expect(player.container.textContent).toContain("Challenge Complete!");
      advanceActivity(player.container);

      expect(completedCalled).toBe(true);
      expect(useProgressStore.getState().lessonsCompleted).toContain("lesson-0-2-5");

      player.unmount();
    });
  });

  // -------------------------------------------------------------------------
  // GATE 6.7: System Reliability, Navigation Ribbon & Edge Case Verification
  // -------------------------------------------------------------------------
  describe("Gate 6.7: System Reliability & Activity Navigation Edge Cases", () => {
    it("1. Supports arbitrary activity jumping via ribbon buttons without breaking state", () => {
      const lesson = canonicalProvider.getLesson("lesson-0-1-1")!;
      const player = renderPlayer(lesson);

      // Header should show 1 / 14
      expect(player.container.textContent).toContain("1 / 14");

      // Click activity 3 indicator in the movement rail (one tab per activity)
      const ribbonButtons = Array.from(
        player.container.querySelectorAll("header button[role='tab']"),
      );
      expect(ribbonButtons.length).toBe(14);

      act(() => {
        (ribbonButtons[2] as HTMLButtonElement).click(); // Activity 3 (Multiple Choice)
      });

      expect(player.container.textContent).toContain("3 / 14");
      expect(player.container.textContent).toContain(
        "You click “Save Changes.” What should happen",
      );

      player.unmount();
    });

    it("2. Handles hint revelation cleanly for activities with hint arrays", () => {
      const debugLesson = canonicalProvider.getLesson("lesson-0-2-5")!;
      const player = renderPlayer(debugLesson);

      // Jump to activity 2 (act-025-debug-html)
      const ribbonButtons = Array.from(
        player.container.querySelectorAll("header button[role='tab']"),
      );
      act(() => {
        (ribbonButtons[1] as HTMLButtonElement).click();
      });

      expect(player.container.textContent).toContain("Debug Lab Challenge");

      // Reveal hint button should be visible (2 hints remaining)
      const buttons = Array.from(player.container.querySelectorAll("button"));
      const hintBtn = buttons.find((b) => b.textContent?.includes("Hint (2)"));
      expect(hintBtn).toBeDefined();

      act(() => {
        hintBtn?.click();
      });

      // Hint count decremented to 1 and hint text visible
      expect(player.container.textContent).toContain("Hint (1)");
      expect(player.container.textContent).toContain("<input> is a void element");

      player.unmount();
    });
  });
});
