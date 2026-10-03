import { describe, it, expect } from "vitest";
import { canonicalManifest } from "../manifest";
import { canonicalProvider } from "../canonical-provider";
import { localContentProvider } from "../../providers/content-provider";
import {
  getOrderedCurriculumLessons,
  getCurriculumResumeLesson,
} from "../../utils/curriculum-order";
import { getTopicProgress, getModuleProgress } from "../../hooks/use-curriculum";
import { resolveLessonLayer } from "../lesson-resolver";
import { CurriculumIdentityError, assertLessonCurriculumIdentity } from "../errors";
import { checkCurriculumIntegrity } from "./curriculum-integrity";
import { buildV1LessonRegistry } from "./loader";

describe("Learner Application Runtime Curriculum Integration", () => {
  const orderedIds = canonicalManifest.getOrderedLessonIds();

  it("1. first lesson has no previous lesson", () => {
    const firstLessonId = orderedIds[0];
    expect(firstLessonId).toBe("lesson-0-1-1");

    const prevId = canonicalManifest.getPreviousLessonId(firstLessonId);
    expect(prevId).toBeUndefined();

    // Module queue check for the first lesson's module
    const firstLessonRef = canonicalManifest.getLesson(firstLessonId)!;
    const moduleLessons = canonicalManifest.getLessonsForModule(firstLessonRef.moduleId);
    const modIndex = moduleLessons.findIndex((l) => l.lessonId === firstLessonId);
    expect(modIndex).toBe(0);
    const prevInMod = modIndex > 0 ? moduleLessons[modIndex - 1] : undefined;
    expect(prevInMod).toBeUndefined();
  });

  it("2. last lesson has no next lesson", () => {
    const lastLessonId = orderedIds[orderedIds.length - 1];
    expect(lastLessonId).toBe("lesson-1-1-6");

    const nextId = canonicalManifest.getNextLessonId(lastLessonId);
    expect(nextId).toBeUndefined();

    // Module queue check for the last lesson's module
    const lastLessonRef = canonicalManifest.getLesson(lastLessonId)!;
    const moduleLessons = canonicalManifest.getLessonsForModule(lastLessonRef.moduleId);
    const modIndex = moduleLessons.findIndex((l) => l.lessonId === lastLessonId);
    expect(modIndex).toBe(moduleLessons.length - 1);
    const nextInMod = modIndex < moduleLessons.length - 1 ? moduleLessons[modIndex + 1] : undefined;
    expect(nextInMod).toBeUndefined();
  });

  it("3. lesson N points to N+1", () => {
    for (let i = 0; i < orderedIds.length - 1; i++) {
      const currentId = orderedIds[i];
      const expectedNextId = orderedIds[i + 1];

      expect(canonicalManifest.getNextLessonId(currentId)).toBe(expectedNextId);
      expect(canonicalManifest.getPreviousLessonId(expectedNextId)).toBe(currentId);
    }
  });

  it("4. module queue contains exactly the manifest lessons", () => {
    const manifest = canonicalManifest.getManifest();

    for (const mod of manifest.modules) {
      const moduleLessons = canonicalManifest.getLessonsForModule(mod.moduleId);
      const moduleLessonIds = moduleLessons.map((l) => l.lessonId);

      expect(moduleLessonIds).toEqual(mod.lessonIds);

      // Verify position order
      for (let i = 0; i < moduleLessons.length - 1; i++) {
        expect(moduleLessons[i].position).toBeLessThan(moduleLessons[i + 1].position);
      }
    }
  });

  it("5. progress denominator matches manifest", () => {
    const manifestLessons = canonicalManifest.getLessons();
    expect(manifestLessons.length).toBe(7);

    // Module progress denominator
    const mod1ProgressEmpty = getModuleProgress("module-1-1", []);
    expect(mod1ProgressEmpty).toBe(0);

    const mod1ProgressHalf = getModuleProgress("module-1-1", [
      "lesson-1-1-1",
      "lesson-1-1-2",
      "lesson-1-1-3",
    ]);
    expect(mod1ProgressHalf).toBe(50); // 3 of 6 = 50%

    const mod1ProgressFull = getModuleProgress("module-1-1", [
      "lesson-1-1-1",
      "lesson-1-1-2",
      "lesson-1-1-3",
      "lesson-1-1-4",
      "lesson-1-1-5",
      "lesson-1-1-6",
    ]);
    expect(mod1ProgressFull).toBe(100);

    // Topic progress denominator
    const top1Progress = getTopicProgress("html-the-structure-of-the-web", [
      "lesson-1-1-1",
      "lesson-1-1-2",
    ]);
    expect(top1Progress).toBe(40); // 2 of 5 = 40%
  });

  it("6. resume can select a V1 lesson", () => {
    const ordered = getOrderedCurriculumLessons();
    expect(ordered.map((l) => l.id)).toEqual(orderedIds);

    // Initial learner state -> selects first V1 lesson
    const initialResume = getCurriculumResumeLesson(ordered, null, []);
    expect(initialResume?.id).toBe("lesson-0-1-1");

    // Returning learner with lesson-0-1-1 completed -> selects lesson-1-1-1
    const resumeStep2 = getCurriculumResumeLesson(ordered, null, ["lesson-0-1-1"]);
    expect(resumeStep2?.id).toBe("lesson-1-1-1");

    // Last active incomplete lesson takes priority
    const resumeActive = getCurriculumResumeLesson(ordered, "lesson-1-1-4", [
      "lesson-0-1-1",
      "lesson-1-1-1",
      "lesson-1-1-2",
    ]);
    expect(resumeActive?.id).toBe("lesson-1-1-4");

    // Completed all lessons -> reviews first lesson
    const resumeReview = getCurriculumResumeLesson(ordered, null, orderedIds);
    expect(resumeReview?.id).toBe("lesson-0-1-1");
  });

  it("7. an invalid lesson ID does not fall back to legacy in production", () => {
    const resolved = resolveLessonLayer({
      lessonId: "invalid-lesson-999",
      v1Lesson: undefined,
      isV1Target: false,
      layer1Lesson: undefined,
      legacyLesson: undefined,
      curriculumMode: "production",
    });

    expect(resolved).toBe("not-found");
    expect(canonicalManifest.isCurriculumLesson("invalid-lesson-999")).toBe(false);
    expect(localContentProvider.getLesson("invalid-lesson-999")).toBeUndefined();
    expect(canonicalProvider.getLesson("invalid-lesson-999")).toBeUndefined();
  });

  it("8. an archived lesson does not appear in learner progression", () => {
    // Archived lesson-0-1-2 is preserved in archive, not active learner progression
    expect(canonicalProvider.isArchivedLesson("lesson-0-1-2")).toBe(true);
    expect(canonicalManifest.isCurriculumLesson("lesson-0-1-2")).toBe(false);

    // Not in active manifest ordering
    expect(canonicalManifest.getOrderedLessonIds()).not.toContain("lesson-0-1-2");
    expect(canonicalProvider.getLessons().map((l) => l.id)).not.toContain("lesson-0-1-2");
    expect(localContentProvider.lessons().map((l) => l.id)).not.toContain("lesson-0-1-2");
    expect(getOrderedCurriculumLessons().map((l) => l.id)).not.toContain("lesson-0-1-2");

    // Cannot resume into archived lesson
    const resume = getCurriculumResumeLesson(undefined, "lesson-0-1-2", []);
    expect(resume?.id).toBe("lesson-0-1-1");
  });
});

describe("Strict Curriculum Identity & Anti-Fabrication Invariants", () => {
  it("fails loudly when a lesson references an unregistered topicId", () => {
    expect(() => {
      assertLessonCurriculumIdentity({
        id: "lesson-2-4-3",
        curriculum: {
          moduleId: "module-1-1",
          phaseId: "phase-1",
          topicId: "foo-bar",
        },
      });
    }).toThrow(CurriculumIdentityError);

    try {
      assertLessonCurriculumIdentity({
        id: "lesson-2-4-3",
        curriculum: {
          moduleId: "module-1-1",
          phaseId: "phase-1",
          topicId: "foo-bar",
        },
      });
      expect.unreachable();
    } catch (err) {
      expect(err).toBeInstanceOf(CurriculumIdentityError);
      const identityError = err as CurriculumIdentityError;
      expect(identityError.message).toContain("CURRICULUM_IDENTITY_ERROR");
      expect(identityError.message).toContain("lesson-2-4-3");
      expect(identityError.message).toContain('references topicId "foo-bar"');
      expect(identityError.message).toContain(
        'but topic "foo-bar" is not registered in curriculum-manifest.json',
      );
      expect(identityError.topicId).toBe("foo-bar");
      expect(identityError.moduleId).toBe("module-1-1");
      expect(identityError.manifestFile).toBe("curriculum-manifest.json");
    }
  });

  it("fails loudly when a lesson references an unregistered moduleId", () => {
    expect(() => {
      assertLessonCurriculumIdentity({
        id: "lesson-2-4-3",
        curriculum: {
          moduleId: "module-99-99",
          phaseId: "phase-1",
        },
      });
    }).toThrow(CurriculumIdentityError);
  });

  it("fails loudly when a lesson references an unregistered phaseId", () => {
    expect(() => {
      assertLessonCurriculumIdentity({
        id: "lesson-2-4-3",
        curriculum: {
          phaseId: "phase-99",
        },
      });
    }).toThrow(CurriculumIdentityError);
  });

  it("fails loudly when a lesson references an unregistered capabilityId", () => {
    expect(() => {
      assertLessonCurriculumIdentity({
        id: "lesson-2-4-3",
        learning: {
          primaryCapability: {
            id: "cap-non-existent",
          },
        },
      });
    }).toThrow(CurriculumIdentityError);
  });

  it("fails loudly when a lesson references an unregistered conceptId", () => {
    expect(() => {
      assertLessonCurriculumIdentity({
        id: "lesson-2-4-3",
        curriculum: {
          conceptIds: ["concept-non-existent"],
        },
      });
    }).toThrow(CurriculumIdentityError);
  });

  it("fails loudly when a lesson references an unregistered prerequisiteLessonId", () => {
    expect(() => {
      assertLessonCurriculumIdentity({
        id: "lesson-2-4-3",
        curriculum: {
          prerequisiteLessonIds: ["lesson-99-99-99"],
        },
      });
    }).toThrow(CurriculumIdentityError);
  });

  it("integrity checker flags unregistered topic as blocking error", () => {
    const invalidLesson = {
      id: "lesson-2-4-3",
      schemaVersion: "1.0.0" as const,
      identity: {
        title: "Test",
        description: "Test",
        learnerFacing: true,
        role: "encounter" as const,
        estimatedMinutes: 5,
        slug: "test",
      },
      curriculum: {
        phaseId: "phase-1",
        moduleId: "module-1-1",
        topicId: "invalid-topic-xyz",
        capabilityIds: ["cap-inspect-dom-hierarchy"],
        conceptIds: ["concept-html-element-anatomy"],
        prerequisiteLessonIds: [],
      },
      learning: {
        primaryCapability: {
          id: "cap-inspect-dom-hierarchy",
          statement: "Test",
        },
        secondaryCapabilities: [],
        startingState: { knows: [], canDo: [], likelyMisconceptions: [] },
        targetState: { knows: [], canDo: [], resolvedMisconceptions: [] },
      },
      experience: {
        guidanceLevel: "guided" as const,
        arc: ["encounter" as const],
        emotionalJourney: ["curiosity" as const],
        startingState: "Ready",
        primaryInteraction: "explore",
        expectedOutcome: "Done",
      },
      activities: [],
      mastery: {
        requiredEvidence: ["recognition" as const],
        completionCriteria: { requiredActivities: [], minimumScore: 80 },
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
      runtime: { required: false, environment: "browser" as const },
      accessibility: {
        requirements: ["Keyboard"],
        keyboardNavigation: true,
        colorContrastCompliant: true,
      },
    };

    const diagnostics = checkCurriculumIntegrity(invalidLesson);
    expect(
      diagnostics.some((d) => d.code === "BROKEN_TOPIC_REFERENCE" && d.severity === "error"),
    ).toBe(true);
  });
});
