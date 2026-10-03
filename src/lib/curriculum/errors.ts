/**
 * Authoritative Curriculum Identity Error
 *
 * Strict error class and validator for preventing silent curriculum identity fabrication.
 * If a lesson references an unregistered topicId, moduleId, phaseId, capabilityId,
 * conceptId, or prerequisiteLessonId, this error fails loudly and explicitly identifies
 * the offending entity, parent context, and manifest file.
 */

import rawManifest from "../../data/canonical/curriculum-manifest.json";
import rawCapabilities from "../../data/canonical/capabilities.json";
import rawConcepts from "../../data/canonical/concepts.json";

export interface CurriculumIdentityErrorDetails {
  lessonId: string;
  topicId?: string;
  moduleId?: string;
  phaseId?: string;
  capabilityId?: string;
  conceptId?: string;
  prerequisiteLessonId?: string;
  manifestFile?: string;
  entityType?: "topic" | "module" | "phase" | "capability" | "concept" | "prerequisite";
}

export class CurriculumIdentityError extends Error {
  public readonly code = "CURRICULUM_IDENTITY_ERROR";
  public readonly lessonId: string;
  public readonly topicId?: string;
  public readonly moduleId?: string;
  public readonly phaseId?: string;
  public readonly capabilityId?: string;
  public readonly conceptId?: string;
  public readonly prerequisiteLessonId?: string;
  public readonly manifestFile: string;

  constructor(details: CurriculumIdentityErrorDetails, customMessage?: string) {
    const manifestFile = details.manifestFile || "curriculum-manifest.json";
    let message = customMessage;

    if (!message) {
      if (
        details.entityType === "topic" ||
        (!details.entityType &&
          details.topicId &&
          !details.moduleId &&
          !details.phaseId &&
          !details.capabilityId &&
          !details.conceptId &&
          !details.prerequisiteLessonId)
      ) {
        message = `CURRICULUM_IDENTITY_ERROR\n\nLesson ${details.lessonId} references topicId "${details.topicId}",\nbut topic "${details.topicId}" is not registered in ${manifestFile}.`;
      } else if (
        details.entityType === "module" ||
        (!details.entityType && details.moduleId && !details.topicId)
      ) {
        message = `CURRICULUM_IDENTITY_ERROR\n\nLesson ${details.lessonId} references moduleId "${details.moduleId}",\nbut module "${details.moduleId}" is not registered in ${manifestFile}.`;
      } else if (details.entityType === "phase" || (!details.entityType && details.phaseId)) {
        message = `CURRICULUM_IDENTITY_ERROR\n\nLesson ${details.lessonId} references phaseId "${details.phaseId}",\nbut phase "${details.phaseId}" is not registered in ${manifestFile}.`;
      } else if (
        details.entityType === "capability" ||
        (!details.entityType && details.capabilityId)
      ) {
        message = `CURRICULUM_IDENTITY_ERROR\n\nLesson ${details.lessonId} references capability "${details.capabilityId}",\nbut capability "${details.capabilityId}" is not registered in capabilities.json.`;
      } else if (details.entityType === "concept" || (!details.entityType && details.conceptId)) {
        message = `CURRICULUM_IDENTITY_ERROR\n\nLesson ${details.lessonId} references concept "${details.conceptId}",\nbut concept "${details.conceptId}" is not registered in concepts.json.`;
      } else if (
        details.entityType === "prerequisite" ||
        (!details.entityType && details.prerequisiteLessonId)
      ) {
        message = `CURRICULUM_IDENTITY_ERROR\n\nLesson ${details.lessonId} references prerequisite "${details.prerequisiteLessonId}",\nbut prerequisite "${details.prerequisiteLessonId}" is not registered in ${manifestFile}.`;
      } else if (details.topicId) {
        message = `CURRICULUM_IDENTITY_ERROR\n\nLesson ${details.lessonId} references topicId "${details.topicId}",\nbut topic "${details.topicId}" is not registered in ${manifestFile}.`;
      } else {
        message = `CURRICULUM_IDENTITY_ERROR\n\nLesson ${details.lessonId} has an invalid curriculum identity in ${manifestFile}.`;
      }
    }

    super(message);
    this.name = "CurriculumIdentityError";
    this.lessonId = details.lessonId;
    this.topicId = details.topicId;
    this.moduleId = details.moduleId;
    this.phaseId = details.phaseId;
    this.capabilityId = details.capabilityId;
    this.conceptId = details.conceptId;
    this.prerequisiteLessonId = details.prerequisiteLessonId;
    this.manifestFile = manifestFile;
  }
}

function getManifest() {
  const m = (rawManifest as any).default || rawManifest;
  return m;
}

function getRegisteredTopicIds(): Set<string> {
  const manifest = getManifest();
  const list = manifest.topics || [];
  return new Set(list.map((t: any) => t.topicId || t.id));
}

function getRegisteredModuleIds(): Set<string> {
  const manifest = getManifest();
  const list = manifest.modules || [];
  return new Set(list.map((m: any) => m.moduleId || m.id));
}

function getRegisteredPhaseIds(): Set<string> {
  const manifest = getManifest();
  const list = manifest.levels || [];
  return new Set(list.map((l: any) => l.phaseId || l.levelId || l.id));
}

function getRegisteredLessonIds(): Set<string> {
  const manifest = getManifest();
  const list = manifest.lessons || [];
  return new Set(list.map((l: any) => l.lessonId || l.id));
}

function getRegisteredCapabilityIds(): Set<string> {
  const data = (rawCapabilities as any).default || rawCapabilities;
  return new Set((data as Array<{ id: string }>).map((c) => c.id));
}

function getRegisteredConceptIds(): Set<string> {
  const data = (rawConcepts as any).default || rawConcepts;
  return new Set((data as Array<{ id: string }>).map((c) => c.id));
}

export interface LessonCurriculumIdentityInput {
  id: string;
  topicId?: string;
  moduleId?: string;
  phaseId?: string;
  curriculum?: {
    topicId?: string;
    moduleId?: string;
    phaseId?: string;
    capabilityIds?: string[];
    conceptIds?: string[];
    prerequisiteLessonIds?: string[];
  };
  learning?: {
    primaryCapability?: { id: string };
    secondaryCapabilities?: Array<{ id: string }>;
  };
}

/**
 * Asserts that a lesson's curriculum metadata strictly adheres to registered
 * entities in the authoritative curriculum manifest and reference catalogs.
 *
 * Throws CurriculumIdentityError immediately upon encountering any unregistered
 * topicId, moduleId, phaseId, capabilityId, conceptId, or prerequisiteLessonId.
 * No silent fabrication, title guessing, or fallback module attachment is permitted.
 */
export function assertLessonCurriculumIdentity(lesson: LessonCurriculumIdentityInput): void {
  const lessonId = lesson.id;
  const topicId = lesson.curriculum?.topicId || lesson.topicId;
  const moduleId = lesson.curriculum?.moduleId || lesson.moduleId;
  const phaseId = lesson.curriculum?.phaseId || lesson.phaseId;

  const validTopicIds = getRegisteredTopicIds();
  const validModuleIds = getRegisteredModuleIds();
  const validPhaseIds = getRegisteredPhaseIds();
  const validLessonIds = getRegisteredLessonIds();
  const validCapabilityIds = getRegisteredCapabilityIds();
  const validConceptIds = getRegisteredConceptIds();

  // 1. Topic ID validation
  if (topicId && !validTopicIds.has(topicId)) {
    throw new CurriculumIdentityError({
      lessonId,
      topicId,
      moduleId,
      manifestFile: "curriculum-manifest.json",
      entityType: "topic",
    });
  }

  // 2. Module ID validation
  if (moduleId && !validModuleIds.has(moduleId)) {
    throw new CurriculumIdentityError({
      lessonId,
      moduleId,
      topicId,
      manifestFile: "curriculum-manifest.json",
      entityType: "module",
    });
  }

  // 3. Phase ID validation
  if (phaseId && !validPhaseIds.has(phaseId)) {
    throw new CurriculumIdentityError({
      lessonId,
      phaseId,
      moduleId,
      manifestFile: "curriculum-manifest.json",
      entityType: "phase",
    });
  }

  // 4. Prerequisite lesson IDs validation
  const prereqs = lesson.curriculum?.prerequisiteLessonIds ?? [];
  for (const prereqId of prereqs) {
    if (prereqId && !validLessonIds.has(prereqId)) {
      throw new CurriculumIdentityError({
        lessonId,
        prerequisiteLessonId: prereqId,
        moduleId,
        topicId,
        manifestFile: "curriculum-manifest.json",
        entityType: "prerequisite",
      });
    }
  }

  // 5. Capability IDs validation
  const primaryCapId = lesson.learning?.primaryCapability?.id;
  if (primaryCapId && !validCapabilityIds.has(primaryCapId)) {
    throw new CurriculumIdentityError({
      lessonId,
      capabilityId: primaryCapId,
      moduleId,
      topicId,
      manifestFile: "curriculum-manifest.json",
      entityType: "capability",
    });
  }

  const secondaryCaps = lesson.learning?.secondaryCapabilities ?? [];
  for (const cap of secondaryCaps) {
    if (cap?.id && !validCapabilityIds.has(cap.id)) {
      throw new CurriculumIdentityError({
        lessonId,
        capabilityId: cap.id,
        moduleId,
        topicId,
        manifestFile: "curriculum-manifest.json",
        entityType: "capability",
      });
    }
  }

  const curriculumCapIds = lesson.curriculum?.capabilityIds ?? [];
  for (const capId of curriculumCapIds) {
    if (capId && !validCapabilityIds.has(capId)) {
      throw new CurriculumIdentityError({
        lessonId,
        capabilityId: capId,
        moduleId,
        topicId,
        manifestFile: "curriculum-manifest.json",
        entityType: "capability",
      });
    }
  }

  // 6. Concept IDs validation
  const conceptIds = lesson.curriculum?.conceptIds ?? [];
  for (const conceptId of conceptIds) {
    if (conceptId && !validConceptIds.has(conceptId)) {
      throw new CurriculumIdentityError({
        lessonId,
        conceptId,
        moduleId,
        topicId,
        manifestFile: "curriculum-manifest.json",
        entityType: "concept",
      });
    }
  }
}
