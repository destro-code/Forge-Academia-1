import { describe, it, expect } from "vitest";
import { validateLessonV1, safeValidateLessonV1 } from "./schema-v1";
import { lintLessonV1 } from "./authoring/rules-v1";
import type { CanonicalLessonV1 } from "./types-v1";

export const goldenLesson0CanonicalV1: CanonicalLessonV1 = {
  id: "lesson-0-1-1",
  schemaVersion: "1.0.0",
  identity: {
    title: "The Button Has Betrayed You",
    description:
      "Your first Forge investigation starts with a button that refuses to do what you expect. Observe the failure, gather browser evidence, test a hypothesis, make a targeted fix, and verify what actually changed.",
    learnerFacing: true,
    role: "encounter",
    estimatedMinutes: 15,
    slug: "the-button-has-betrayed-you",
  },
  curriculum: {
    phaseId: "phase-0",
    moduleId: "module-0-1",
    topicId: "what-is-frontend-development",
    capabilityIds: [
      "cap-observe-browser-behavior",
      "cap-form-falsifiable-hypothesis",
      "cap-repair-event-defect",
      "cap-reconstruct-causal-chain",
    ],
    conceptIds: [
      "concept-debugging-workflow",
      "concept-web-platform-trio",
      "concept-web-architecture",
      "concept-client-server-split",
    ],
    prerequisiteLessonIds: [],
  },
  learning: {
    primaryCapability: {
      id: "cap-observe-browser-behavior",
      statement: "Distinguish directly observable browser behavior from unverified assumptions.",
    },
    secondaryCapabilities: [
      {
        id: "cap-form-falsifiable-hypothesis",
        statement: "Form a falsifiable hypothesis before inspecting system internals.",
      },
      {
        id: "cap-repair-event-defect",
        statement: "Apply a targeted fix to an unattached event handler and verify the outcome.",
      },
      {
        id: "cap-reconstruct-causal-chain",
        statement:
          "Explain frontend failure as a causal chain from user action to runtime execution.",
      },
    ],
    startingState: {
      knows: ["Webpages have buttons and inputs.", "Clicking a button usually saves data."],
      canDo: ["Click buttons", "Type text into inputs"],
      likelyMisconceptions: [
        "If a button does nothing, the JavaScript engine must have crashed or the CSS is broken.",
      ],
    },
    targetState: {
      canDo: [
        "Distinguish symptoms from causes in a non-responsive interface.",
        "Inspect event listeners and DOM tree state to locate missing handlers.",
        "Formulate and test a hypothesis before applying a fix.",
        "Verify fixes with active test inputs rather than passive assumption.",
      ],
    },
    targetMentalModel:
      "A webpage is an active state machine: user interaction triggers DOM events, which execute registered listeners that mutate state and request browser repaints.",
  },
  experience: {
    guidanceLevel: "guided",
    arc: [
      "encounter",
      "prediction",
      "failure",
      "observation",
      "investigation",
      "hypothesis",
      "fix",
      "verification",
      "explanation",
      "transfer",
      "reflection",
    ],
    emotionalJourney: [
      "curiosity",
      "slight confusion",
      "analytical focus",
      "insight",
      "confidence",
    ],
    startingState: "A rendered Account Settings interface with Save Changes button.",
    primaryInteraction: "account-settings-surface",
    expectedOutcome: "Learner fixes the unattached event handler and verifies the state change.",
  },
  activities: [
    {
      id: "act-0-1-1-encounter",
      type: "interactive-demo",
      role: "encounter",
      title: "The Silent Button",
      instruction: "Click 'Save Changes' on the rendered Account Settings surface.",
      content: {
        systemComponent: "AccountSettingsSystem",
        symptom: "No status update occurs when Save Changes is clicked.",
      },
      evidence: {
        types: ["recognition"],
        capabilityIds: ["cap-observe-browser-behavior"],
      },
    },
    {
      id: "act-0-1-1-prediction",
      role: "prediction",
      type: "prediction",
      title: "Commit to a Hypothesis",
      instruction: "Why did clicking Save Changes produce no visible response?",
      content: {
        options: [
          { id: "opt-no-listener", text: "The button element has no click listener attached." },
          { id: "opt-css-blocking", text: "The CSS z-index is blocking the click event." },
          { id: "opt-server-down", text: "The backend server crashed immediately." },
        ],
      },
      validation: {
        type: "single-choice",
        correctAnswer: "opt-no-listener",
      },
      evidence: {
        types: ["prediction"],
        capabilityIds: ["cap-form-falsifiable-hypothesis"],
      },
    },
    {
      id: "act-0-1-1-investigation",
      role: "investigation",
      type: "debug",
      title: "Mechanism Inspector",
      instruction: "Inspect the DOM elements and event listener bindings.",
      content: {
        targetElement: "button#save-button",
        inspectionFields: ["attributes", "eventListeners", "computedStyles"],
      },
      validation: {
        type: "state",
        expectedState: { inspectedElement: "button#save-button" },
      },
      evidence: {
        types: ["debugging"],
        capabilityIds: ["cap-observe-browser-behavior"],
      },
    },
    {
      id: "act-0-1-1-fix",
      role: "manipulation",
      type: "interactive-code",
      title: "Attach the Handler",
      instruction: "Wire up the click handler to call saveChanges() when the button is clicked.",
      content: {
        starterCode:
          "const btn = document.querySelector('#save-button');\n// Attach listener here\n",
        solutionCode:
          "const btn = document.querySelector('#save-button');\nbtn.addEventListener('click', saveChanges);\n",
      },
      validation: {
        type: "tests",
        testCases: [
          {
            description: "Button click triggers saveChanges",
            assertion: "window.__saveChangesCalled === true",
          },
        ],
      },
      evidence: {
        types: ["manipulation", "implementation"],
        capabilityIds: ["cap-repair-event-defect"],
      },
    },
    {
      id: "act-0-1-1-verification",
      role: "verification",
      type: "interactive-demo",
      title: "Verify the Interface",
      instruction:
        "Click 'Save Changes' again and confirm the status banner displays 'Changes saved!'.",
      content: {
        expectedStatus: "Changes saved!",
      },
      validation: {
        type: "state",
        expectedState: { verified: true },
      },
      evidence: {
        types: ["judgment"],
        capabilityIds: ["cap-repair-event-defect"],
      },
    },
    {
      id: "act-0-1-1-explanation",
      role: "reflection",
      type: "reflection",
      title: "Causal Explanation",
      instruction:
        "Explain why observing symptom first avoided unnecessary server or CSS debugging.",
      content: {
        prompt: "Reconstruct the causal chain from click to execution.",
      },
      evidence: {
        types: ["explanation"],
        capabilityIds: ["cap-reconstruct-causal-chain"],
      },
    },
    {
      id: "act-0-1-1-transfer",
      role: "transfer",
      type: "judgment",
      title: "Transfer Challenge",
      instruction:
        "In a new form with a Submit button that does not submit, what is your first diagnostic action?",
      content: {
        scenario: "A form fails to submit when Enter is pressed inside an input field.",
      },
      validation: {
        type: "single-choice",
        correctAnswer: "inspect-submit-event",
      },
      evidence: {
        types: ["transfer"],
        capabilityIds: ["cap-observe-browser-behavior"],
      },
    },
  ],
  mastery: {
    requiredEvidence: [
      "recognition",
      "prediction",
      "debugging",
      "manipulation",
      "implementation",
      "judgment",
      "explanation",
      "transfer",
    ],
    completionCriteria: {
      requiredActivities: [
        "act-0-1-1-encounter",
        "act-0-1-1-prediction",
        "act-0-1-1-investigation",
        "act-0-1-1-fix",
        "act-0-1-1-verification",
        "act-0-1-1-explanation",
        "act-0-1-1-transfer",
      ],
      minimumScore: 80,
    },
    masteryCriteria: {
      minimumDemonstrations: 1,
      requiresTransfer: true,
      threshold: 85,
    },
  },
  relationships: {
    prerequisites: [],
    reinforces: [],
    extends: ["lesson-0-1-2"],
    applies: [],
    challenges: [],
    debugs: ["concept-debugging-workflow", "concept-dom-events"],
    revisits: [],
    transfers: ["lesson-0-1-3"],
  },
  runtime: {
    required: true,
    environment: "browser",
  },
  accessibility: {
    requirements: [
      "Focus indicator on all interactive controls.",
      "Aria-live announcements for status messages.",
    ],
    keyboardNavigation: true,
    colorContrastCompliant: true,
  },
};

describe("Golden Lesson 0 (The Broken Button) — North-Star Certification", () => {
  it("validates strictly against Canonical Lesson Schema V1", () => {
    const result = safeValidateLessonV1(goldenLesson0CanonicalV1);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe("lesson-0-1-1");
      expect(result.data.curriculum.phaseId).toBe("phase-0");
      expect(result.data.learning.primaryCapability.id).toBe("cap-observe-browser-behavior");
      expect(result.data.activities.length).toBe(7);
    }
  });

  it("passes all authoring linter rules without diagnostic errors", () => {
    const diagnostics = lintLessonV1(goldenLesson0CanonicalV1);
    const errors = diagnostics.filter((d) => d.severity === "error");
    expect(errors).toHaveLength(0);
  });

  it("satisfies the complete pedagogical arc (encounter -> prediction -> investigation -> fix -> verification -> explanation -> transfer)", () => {
    const activityRoles = goldenLesson0CanonicalV1.activities.map((a) => a.role);
    expect(activityRoles).toEqual([
      "encounter",
      "prediction",
      "investigation",
      "manipulation",
      "verification",
      "reflection",
      "transfer",
    ]);
  });

  it("produces all required evidence types for mastery verification", () => {
    const producedTypes = new Set(
      goldenLesson0CanonicalV1.activities.flatMap((a) => a.evidence?.types || []),
    );
    goldenLesson0CanonicalV1.mastery.requiredEvidence.forEach((reqType) => {
      expect(producedTypes.has(reqType)).toBe(true);
    });
  });
});
