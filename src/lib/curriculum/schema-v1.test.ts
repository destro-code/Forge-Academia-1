import { describe, it, expect } from "vitest";
import {
  validateLessonV1,
  safeValidateLessonV1,
  validateActivityV1,
  canonicalLessonV1Schema,
} from "./schema-v1";
import type { CanonicalLessonV1 } from "./types-v1";
import { lintLessonV1 } from "./authoring/rules-v1";

const validSampleLessonV1: CanonicalLessonV1 = {
  id: "lesson-0-1-1",
  schemaVersion: "1.0.0",
  identity: {
    title: "The Button Has Betrayed You",
    description: "Investigate a button that refuses to behave as expected.",
    learnerFacing: true,
    role: "debugging",
    estimatedMinutes: 15,
  },
  curriculum: {
    phaseId: "phase-0",
    moduleId: "module-0-1",
    capabilityIds: ["cap-observe-browser-behavior", "cap-form-falsifiable-hypothesis"],
    conceptIds: ["concept-browser-runtime", "concept-dom-events"],
    prerequisiteLessonIds: [],
  },
  learning: {
    primaryCapability: {
      id: "cap-observe-browser-behavior",
      statement: "Distinguish observable symptoms from unverified assumptions in browser behavior.",
    },
    secondaryCapabilities: [
      {
        id: "cap-form-falsifiable-hypothesis",
        statement: "Form a falsifiable hypothesis before inspecting system internals.",
      },
    ],
    startingState: {
      knows: ["Webpages have buttons."],
      canDo: ["Click interactive elements."],
      likelyMisconceptions: ["If a button does nothing, JavaScript must have crashed."],
    },
    targetState: {
      canDo: [
        "Identify observable symptoms.",
        "Gather relevant browser evidence.",
        "Form a plausible hypothesis.",
        "Verify the outcome against expectations.",
      ],
    },
    targetMentalModel:
      "Browser interaction is a multi-stage flow: DOM event -> listener -> state -> paint.",
  },
  experience: {
    guidanceLevel: "guided",
    arc: [
      "encounter",
      "prediction",
      "failure",
      "observation",
      "investigation",
      "fix",
      "verification",
      "reflection",
    ],
    emotionalJourney: ["curiosity", "confusion", "investigation", "discovery", "confidence"],
  },
  activities: [
    {
      id: "activity-0-1-1-01",
      type: "interactive-demo",
      role: "encounter",
      title: "The Silent Button",
      instruction: "Click the Save Changes button and observe what happens.",
      content: {
        componentId: "account-settings-surface",
      },
      evidence: {
        types: ["recognition"],
        capabilityIds: ["cap-observe-browser-behavior"],
      },
    },
    {
      id: "activity-0-1-1-02",
      type: "prediction",
      role: "prediction",
      title: "Form Your Hypothesis",
      instruction: "What do you predict is the cause of the silence?",
      content: {
        prompt: "Why did clicking the button produce no visible change?",
      },
      validation: {
        type: "single-choice",
        correctAnswer: "option-event-unattached",
      },
      evidence: {
        types: ["prediction"],
        capabilityIds: ["cap-form-falsifiable-hypothesis"],
      },
    },
    {
      id: "activity-0-1-1-03",
      type: "debug",
      role: "debugging",
      title: "Inspect the Listener",
      instruction: "Open the event listener inspector and identify the disconnected handler.",
      content: {
        inspectorTarget: "btn-save",
      },
      validation: {
        type: "state",
        expectedState: { inspected: true },
      },
      evidence: {
        types: ["debugging"],
        capabilityIds: ["cap-observe-browser-behavior"],
      },
    },
    {
      id: "activity-0-1-1-04",
      type: "reflection",
      role: "reflection",
      title: "Synthesize the Finding",
      instruction: "Explain how observable symptoms differed from your initial assumption.",
      content: {
        prompt:
          "Reflect on the difference between a broken script vs an unattached event listener.",
      },
      evidence: {
        types: ["explanation"],
        capabilityIds: ["cap-observe-browser-behavior"],
      },
    },
  ],
  mastery: {
    requiredEvidence: ["recognition", "prediction", "debugging", "explanation"],
    completionCriteria: {
      requiredActivities: [
        "activity-0-1-1-01",
        "activity-0-1-1-02",
        "activity-0-1-1-03",
        "activity-0-1-1-04",
      ],
    },
    masteryCriteria: {
      minimumDemonstrations: 1,
      requiresTransfer: false,
    },
  },
  relationships: {
    prerequisites: [],
    reinforces: [],
    extends: [],
    applies: [],
    challenges: [],
    debugs: ["concept-dom-events"],
    revisits: [],
    transfers: [],
  },
  runtime: {
    required: false,
    environment: null,
  },
  accessibility: {
    requirements: ["Screen reader accessible form controls.", "Keyboard focus rings compliant."],
  },
};

describe("Canonical Lesson Schema V1 Validator", () => {
  it("successfully parses a valid Canonical V1 Lesson fixture", () => {
    const validated = validateLessonV1(validSampleLessonV1);
    expect(validated.id).toBe("lesson-0-1-1");
    expect(validated.curriculum.phaseId).toBe("phase-0");
    expect(validated.curriculum.moduleId).toBe("module-0-1");
    expect(validated.learning.primaryCapability.id).toBe("cap-observe-browser-behavior");
    expect(validated.activities.length).toBe(4);
    expect(validated.mastery.requiredEvidence).toContain("prediction");
  });

  it("fails validation if required top-level sections are missing", () => {
    const invalidLesson = {
      id: "lesson-invalid",
      schemaVersion: "1.0.0",
      // missing identity, curriculum, learning, experience, etc.
    };

    const result = safeValidateLessonV1(invalidLesson);
    expect(result.success).toBe(false);
    if (!result.success) {
      const errorPaths = result.error.errors.map((e) => e.path.join("."));
      expect(errorPaths).toContain("identity");
      expect(errorPaths).toContain("curriculum");
      expect(errorPaths).toContain("learning");
      expect(errorPaths).toContain("experience");
      expect(errorPaths).toContain("activities");
    }
  });

  it("fails validation if curriculum is missing phaseId or capabilityIds", () => {
    const invalidLesson = {
      ...validSampleLessonV1,
      curriculum: {
        moduleId: "module-0-1",
        capabilityIds: [],
        conceptIds: [],
        prerequisiteLessonIds: [],
      },
    };

    const result = safeValidateLessonV1(invalidLesson);
    expect(result.success).toBe(false);
  });

  it("fails validation if activities array is empty", () => {
    const invalidLesson = {
      ...validSampleLessonV1,
      activities: [],
    };

    const result = safeValidateLessonV1(invalidLesson);
    expect(result.success).toBe(false);
  });
});

describe("Canonical Schema V1 Authoring Linter Rules", () => {
  it("passes linting for a fully compliant Canonical V1 Lesson", () => {
    const diagnostics = lintLessonV1(validSampleLessonV1);
    const errors = diagnostics.filter((d) => d.severity === "error");
    expect(errors).toHaveLength(0);
  });

  it("detects when primary capability is not included in curriculum.capabilityIds", () => {
    const badLesson: CanonicalLessonV1 = {
      ...validSampleLessonV1,
      learning: {
        ...validSampleLessonV1.learning,
        primaryCapability: {
          id: "cap-unregistered",
          statement: "Some unregistered capability",
        },
      },
    };

    const diagnostics = lintLessonV1(badLesson);
    const capErrors = diagnostics.filter((d) =>
      d.message.includes("Primary capability 'cap-unregistered' is not listed"),
    );
    expect(capErrors.length).toBeGreaterThan(0);
  });

  it("detects when an active activity lacks required evidence declaration", () => {
    const badLesson: CanonicalLessonV1 = {
      ...validSampleLessonV1,
      activities: [
        {
          ...validSampleLessonV1.activities[1], // prediction activity
          evidence: undefined,
        },
      ],
    };

    const diagnostics = lintLessonV1(badLesson);
    const evidenceErrors = diagnostics.filter((d) =>
      d.message.includes("must declare explicit evidence types"),
    );
    expect(evidenceErrors.length).toBeGreaterThan(0);
  });

  it("detects when mastery requires evidence not produced by any activity", () => {
    const badLesson: CanonicalLessonV1 = {
      ...validSampleLessonV1,
      mastery: {
        ...validSampleLessonV1.mastery,
        requiredEvidence: ["transfer"], // None of the activities produce transfer
      },
    };

    const diagnostics = lintLessonV1(badLesson);
    const masteryErrors = diagnostics.filter((d) =>
      d.message.includes(
        "Mastery requires evidence type 'transfer', but no activity produces this evidence type",
      ),
    );
    expect(masteryErrors.length).toBeGreaterThan(0);
  });
});
