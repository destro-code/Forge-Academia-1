import { describe, it, expect } from "vitest";
import { canonicalManifest } from "../manifest";
import {
  buildV1LessonRegistry,
  extractLessonIdFromPath,
  DuplicateLessonIdError,
  getAllV1Lessons,
  listV1LessonIds,
} from "./loader";
import {
  checkCurriculumIntegrity,
  checkCorpusIntegrity,
  checkPrerequisiteSequencing,
} from "./curriculum-integrity";
import { checkActivityCompatibility } from "./activity-compatibility";
import { ACTIVITY_TYPE_AUDIT, PRODUCTION_APPROVED_ACTIVITY_TYPES } from "./activity-audit";
import { safeValidateLessonV1 } from "../schema-v1";
import type { CanonicalLessonV1, ActivityV1 } from "../types-v1";

describe("Authoritative Curriculum Manifest & Discovery Audit", () => {
  it("manifest contains 6 levels and 27 modules with Next.js in Level 4", () => {
    const levels = canonicalManifest.getLevels();
    expect(levels).toHaveLength(6);

    const modules = canonicalManifest.getModules();
    expect(modules).toHaveLength(27);

    const level4Modules = canonicalManifest.getModulesForLevel("level-4");
    expect(level4Modules.some((m) => m.moduleId === "module-4-6")).toBe(true);
    const nextjsModule = canonicalManifest.getModule("module-4-6");
    expect(nextjsModule?.title).toContain("Next.js");
  });

  it("first lesson in manifest has the new approved Module 0.1 identity: a-website-is-a-conversation", () => {
    const lessons = canonicalManifest.getLessons();
    expect(lessons[0].lessonId).toBe("lesson-0-1-1");
    expect(lessons[0].topicId).toBe("a-website-is-a-conversation");
    expect(lessons[0].moduleId).toBe("module-0-1");
    expect(lessons[0].phaseId).toBe("phase-0");
    expect(lessons[0].position).toBe(1);

    const topic = canonicalManifest.getTopic("a-website-is-a-conversation");
    expect(topic).toBeDefined();
    expect(topic?.moduleId).toBe("module-0-1");
    expect(topic?.lessonIds).toContain("lesson-0-1-1");
  });

  it("O(1) position lookup returns correct sequence without indexOf scans", () => {
    expect(canonicalManifest.getLessonPosition("lesson-0-1-1")).toBe(1);
    expect(canonicalManifest.getLessonPosition("lesson-1-1-1")).toBe(2);
    expect(canonicalManifest.getPreviousLessonId("lesson-0-1-1")).toBeUndefined();
    expect(canonicalManifest.getNextLessonId("lesson-0-1-1")).toBe("lesson-1-1-1");
  });

  it("recursive discovery extracts lesson IDs correctly from flat and nested paths", () => {
    expect(extractLessonIdFromPath("src/data/canonical/lessons-v1/lesson-1-1-1.json")).toBe(
      "lesson-1-1-1",
    );
    expect(
      extractLessonIdFromPath("src/data/canonical/lessons-v1/module-1-1/lesson-1-1-1.json"),
    ).toBe("lesson-1-1-1");
    expect(extractLessonIdFromPath("invalid-path.txt")).toBeUndefined();
  });

  it("all discovered production lessons validate against schema, identity, and manifest", () => {
    const productionLessons = getAllV1Lessons();
    const productionIds = listV1LessonIds();

    expect(productionLessons.length).toBeGreaterThanOrEqual(1);

    for (const lesson of productionLessons) {
      // 1. Filename / ID consistency
      expect(productionIds).toContain(lesson.id);

      // 2. Canonical V1 Zod schema validation
      const schemaCheck = safeValidateLessonV1(lesson);
      expect(schemaCheck.success).toBe(true);

      // 3. Manifest registration
      expect(canonicalManifest.isCurriculumLesson(lesson.id)).toBe(true);
      const manifestRef = canonicalManifest.getLesson(lesson.id);
      expect(manifestRef?.moduleId).toBe(lesson.curriculum.moduleId);
      expect(manifestRef?.phaseId).toBe(lesson.curriculum.phaseId);

      // 4. Curriculum integrity (topics, modules, concepts, prereqs)
      const diagnostics = checkCurriculumIntegrity(lesson);
      const errors = diagnostics.filter((d) => d.severity === "error");
      expect(errors).toHaveLength(0);
    }
  });

  it("planned-but-unauthored lessons are distinguishable and do not count as production lessons", () => {
    const allManifestLessons = canonicalManifest.getLessons();
    const productionIds = new Set(listV1LessonIds());

    const plannedUnauthored = allManifestLessons.filter(
      (l) => l.authored === false || !productionIds.has(l.lessonId),
    );
    expect(plannedUnauthored.length).toBeGreaterThan(0);
    expect(plannedUnauthored.some((l) => l.lessonId === "lesson-0-1-1")).toBe(true);
  });
});

describe("Adversarial Scale Curriculum Engine (200+ Lessons & Edge Cases)", () => {
  it("rejects forward prerequisites where prerequisite appears later in manifest order", () => {
    const manifestOrder = new Map([
      ["lesson-1", 1],
      ["lesson-2", 2],
      ["lesson-3", 3],
      ["lesson-200", 200],
    ]);

    const forwardPrereqLesson: CanonicalLessonV1 = {
      id: "lesson-2",
      schemaVersion: "1.0.0",
      identity: {
        title: "Lesson 2",
        description: "Test",
        learnerFacing: true,
        role: "encounter",
        estimatedMinutes: 10,
        slug: "lesson-2",
      },
      curriculum: {
        phaseId: "phase-1",
        moduleId: "module-1-1",
        topicId: "html-the-structure-of-the-web",
        capabilityIds: ["cap-inspect-dom-hierarchy"],
        conceptIds: ["concept-html-element-anatomy"],
        prerequisiteLessonIds: ["lesson-200"], // Appears at position 200 > 2
      },
      learning: {
        primaryCapability: { id: "cap-inspect-dom-hierarchy", statement: "Test" },
        secondaryCapabilities: [],
        startingState: { knows: [], canDo: [], likelyMisconceptions: [] },
        targetState: { knows: [], canDo: [], resolvedMisconceptions: [] },
      },
      experience: {
        guidanceLevel: "guided",
        arc: ["encounter"],
        emotionalJourney: ["curiosity"],
        startingState: "Ready",
        primaryInteraction: "explore",
        expectedOutcome: "Done",
      },
      activities: [
        {
          id: "act-1",
          role: "encounter",
          type: "intro",
          title: "Intro",
          instruction: "Read",
          content: { title: "T", hook: "H", context: "C", goals: ["G"] },
        },
      ],
      mastery: {
        requiredEvidence: ["recognition"],
        completionCriteria: { requiredActivities: ["act-1"], minimumScore: 80 },
        masteryCriteria: { minimumDemonstrations: 1, requiresTransfer: false, threshold: 80 },
      },
      relationships: {
        prerequisites: [],
        reinforces: [],
        extends: [],
        applies: [],
        challenges: [],
        debugs: [],
        revisits: [],
        transfers: [],
      },
      runtime: { required: false, environment: "browser" },
      accessibility: {
        requirements: ["Keyboard navigable"],
        keyboardNavigation: true,
        colorContrastCompliant: true,
      },
    };

    const diagnostics = checkPrerequisiteSequencing([forwardPrereqLesson], manifestOrder);
    expect(diagnostics.some((d) => d.message.includes("Forward prerequisite violation"))).toBe(
      true,
    );
  });

  it("detects circular prerequisite chains of arbitrary lengths across 200+ lessons", () => {
    const dummyLessons: CanonicalLessonV1[] = Array.from({ length: 200 }, (_, i) => ({
      id: `lesson-${i + 1}`,
      schemaVersion: "1.0.0",
      identity: {
        title: `Lesson ${i + 1}`,
        description: "Test",
        learnerFacing: true,
        role: "encounter",
        estimatedMinutes: 5,
        slug: `lesson-${i + 1}`,
      },
      curriculum: {
        phaseId: "phase-1",
        moduleId: "module-1-1",
        topicId: "html-the-structure-of-the-web",
        capabilityIds: ["cap-inspect-dom-hierarchy"],
        conceptIds: ["concept-html-element-anatomy"],
        prerequisiteLessonIds: i === 0 ? ["lesson-200"] : [`lesson-${i}`], // Creates 200-node circular loop
      },
      learning: {
        primaryCapability: { id: "cap-inspect-dom-hierarchy", statement: "Test" },
        secondaryCapabilities: [],
        startingState: { knows: [], canDo: [], likelyMisconceptions: [] },
        targetState: { knows: [], canDo: [], resolvedMisconceptions: [] },
      },
      experience: {
        guidanceLevel: "guided",
        arc: ["encounter"],
        emotionalJourney: ["curiosity"],
        startingState: "Ready",
        primaryInteraction: "explore",
        expectedOutcome: "Done",
      },
      activities: [
        {
          id: `act-${i + 1}`,
          role: "encounter",
          type: "intro",
          title: "Intro",
          instruction: "Read",
          content: { title: "T", hook: "H", context: "C", goals: ["G"] },
        },
      ],
      mastery: {
        requiredEvidence: ["recognition"],
        completionCriteria: { requiredActivities: [`act-${i + 1}`], minimumScore: 80 },
        masteryCriteria: { minimumDemonstrations: 1, requiresTransfer: false, threshold: 80 },
      },
      relationships: {
        prerequisites: [],
        reinforces: [],
        extends: [],
        applies: [],
        challenges: [],
        debugs: [],
        revisits: [],
        transfers: [],
      },
      runtime: { required: false, environment: "browser" },
      accessibility: {
        requirements: ["Keyboard"],
        keyboardNavigation: true,
        colorContrastCompliant: true,
      },
    }));

    const diagnostics = checkCorpusIntegrity(dummyLessons);
    expect(
      diagnostics.some((d) => d.message.includes("Circular prerequisite chain detected")),
    ).toBe(true);
  });

  it("rejects duplicate lesson IDs across separate source files loudly", () => {
    const rawSources = [
      {
        filePath: "src/data/canonical/lessons-v1/lesson-1-1-1.json",
        source: { id: "lesson-1-1-1" },
      },
      {
        filePath: "src/data/canonical/lessons-v1/nested/lesson-1-1-1.json",
        source: { id: "lesson-1-1-1" },
      },
    ];

    expect(() => buildV1LessonRegistry(rawSources, { throwOnDuplicate: true })).toThrow(
      DuplicateLessonIdError,
    );
  });

  it("rejects filename and ID mismatches in the production registry gate", () => {
    const rawSources = [
      {
        filePath: "src/data/canonical/lessons-v1/lesson-9-9-9.json",
        source: {
          id: "lesson-declared-differently",
          schemaVersion: "1.0.0",
        },
      },
    ];

    const { invalid, validationErrors } = buildV1LessonRegistry(rawSources, {
      throwOnDuplicate: false,
    });
    expect(invalid.length).toBe(1);
    expect(validationErrors.get("lesson-9-9-9")?.errors[0]).toContain("Filename/ID mismatch");
  });

  it("rejects unregistered topics and invalid capabilities with CurriculumIdentityError", () => {
    const lessonWithFakeTopic = {
      id: "lesson-test-fake",
      schemaVersion: "1.0.0",
      identity: {
        title: "Test",
        description: "Test",
        learnerFacing: true,
        role: "encounter",
        estimatedMinutes: 5,
        slug: "test-fake",
      },
      curriculum: {
        phaseId: "phase-1",
        moduleId: "module-1-1",
        topicId: "nonexistent-fake-topic",
        capabilityIds: ["cap-inspect-dom-hierarchy"],
        conceptIds: ["concept-html-element-anatomy"],
        prerequisiteLessonIds: [],
      },
      learning: {
        primaryCapability: { id: "cap-inspect-dom-hierarchy", statement: "Test" },
        secondaryCapabilities: [],
        startingState: { knows: [], canDo: [], likelyMisconceptions: [] },
        targetState: { canDo: ["Inspect DOM hierarchy"] },
      },
      experience: {
        guidanceLevel: "guided",
        arc: ["encounter"],
        emotionalJourney: ["curiosity"],
        startingState: "Ready",
        primaryInteraction: "explore",
        expectedOutcome: "Done",
      },
      activities: [
        {
          id: "act-1",
          role: "encounter",
          type: "intro",
          title: "Intro",
          instruction: "Read",
          content: { title: "T", hook: "H", context: "C", goals: ["G"] },
        },
      ],
      mastery: {
        requiredEvidence: ["recognition"],
        completionCriteria: { requiredActivities: ["act-1"], minimumScore: 80 },
        masteryCriteria: { minimumDemonstrations: 1, requiresTransfer: false, threshold: 80 },
      },
      relationships: {
        prerequisites: [],
        reinforces: [],
        extends: [],
        applies: [],
        challenges: [],
        debugs: [],
        revisits: [],
        transfers: [],
      },
      runtime: { required: false, environment: "browser" },
      accessibility: {
        requirements: ["Keyboard"],
        keyboardNavigation: true,
        colorContrastCompliant: true,
      },
    };

    expect(() => {
      buildV1LessonRegistry(
        [
          {
            filePath: "src/data/canonical/lessons-v1/lesson-test-fake.json",
            source: lessonWithFakeTopic,
          },
        ],
        { throwOnIdentityError: true },
      );
    }).toThrow(/CURRICULUM_IDENTITY_ERROR/);
  });

  it("rejects invalid activity validation references to nonexistent options or blanks", () => {
    const invalidActivity: ActivityV1 = {
      id: "act-broken-option",
      role: "prediction",
      type: "prediction",
      title: "Broken Option",
      instruction: "Choose",
      content: {
        options: [
          { id: "opt-real-1", text: "A" },
          { id: "opt-real-2", text: "B" },
        ],
      },
      validation: {
        type: "single-choice",
        correctAnswer: "opt-phantom", // Option does not exist!
      },
    };

    const diagnostics = checkActivityCompatibility(invalidActivity, 0);
    expect(diagnostics.some((d) => d.message.includes('references option "opt-phantom"'))).toBe(
      true,
    );
  });

  it("verifies that all 18 activity types are documented and audit status is enforced", () => {
    expect(Object.keys(ACTIVITY_TYPE_AUDIT)).toHaveLength(18);
    expect(PRODUCTION_APPROVED_ACTIVITY_TYPES.size).toBe(18);
    for (const [type, record] of Object.entries(ACTIVITY_TYPE_AUDIT)) {
      expect(record.type).toBe(type);
      expect(record.status).toBeDefined();
    }
  });
});
