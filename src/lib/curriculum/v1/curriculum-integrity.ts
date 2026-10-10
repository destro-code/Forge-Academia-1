/**
 * Curriculum Integrity Validator
 *
 * Validates phase/module/concept/prerequisite references and sequencing against the ONE
 * authoritative curriculum hierarchy: `curriculum-manifest.json`.
 */
import type { CanonicalLessonV1 } from "../types-v1";
import type { CurriculumDiagnostic } from "../authoring/types";
import { DIAGNOSTIC_CODES } from "../authoring/types";
import { createDiagnostic } from "../authoring/diagnostics";
import curriculumManifest from "@/data/canonical/curriculum-manifest.json";
import conceptsData from "@/data/canonical/concepts.json";
import { CurriculumIdentityError, assertLessonCurriculumIdentity } from "../errors";

export { CurriculumIdentityError, assertLessonCurriculumIdentity };

const KNOWN_PHASE_IDS = new Set(curriculumManifest.levels.map((p) => p.phaseId));
const MODULE_PHASE_BY_ID = new Map(curriculumManifest.modules.map((m) => [m.moduleId, m.phaseId]));
const KNOWN_TOPIC_IDS = new Set(curriculumManifest.topics.map((t) => t.topicId));
const TOPIC_MODULE_BY_ID = new Map(curriculumManifest.topics.map((t) => [t.topicId, t.moduleId]));
const KNOWN_CONCEPT_IDS = new Set((conceptsData as { id: string }[]).map((c) => c.id));
const LESSON_POSITION_BY_ID = new Map(
  curriculumManifest.lessons.map((l, idx) => [l.lessonId, l.position ?? idx + 1]),
);

export interface CurriculumIntegrityContext {
  /** Lesson IDs known to exist elsewhere in the corpus — used for prerequisite reference checks. */
  knownLessonIds?: Set<string>;
  /** Map of lesson ID to manifest position for prerequisite sequencing checks. */
  manifestLessonOrder?: Map<string, number>;
}

export function checkCurriculumIntegrity(
  lesson: CanonicalLessonV1,
  context: CurriculumIntegrityContext = {},
): CurriculumDiagnostic[] {
  const diagnostics: CurriculumDiagnostic[] = [];
  const lessonId = lesson.id;

  const phaseId = lesson.curriculum?.phaseId;
  if (phaseId && !KNOWN_PHASE_IDS.has(phaseId)) {
    diagnostics.push(
      createDiagnostic(
        DIAGNOSTIC_CODES.BROKEN_PHASE_REFERENCE,
        "error",
        `Lesson references phaseId "${phaseId}", which does not exist in the authoritative curriculum hierarchy (phase-0 through phase-5).`,
        "curriculum.phaseId",
        {
          lessonId,
          suggestion:
            "Use one of phase-0 through phase-5 — see src/data/canonical/curriculum-manifest.json.",
        },
      ),
    );
  }

  const moduleId = lesson.curriculum?.moduleId;
  if (moduleId) {
    const actualPhaseIdForModule = MODULE_PHASE_BY_ID.get(moduleId);
    if (actualPhaseIdForModule === undefined) {
      diagnostics.push(
        createDiagnostic(
          DIAGNOSTIC_CODES.BROKEN_MODULE_REFERENCE,
          "error",
          `Lesson references moduleId "${moduleId}", which does not exist in the authoritative curriculum hierarchy.`,
          "curriculum.moduleId",
          {
            lessonId,
            suggestion:
              "Check src/data/canonical/curriculum-manifest.json for the correct module ID.",
          },
        ),
      );
    } else if (phaseId && actualPhaseIdForModule !== phaseId) {
      diagnostics.push(
        createDiagnostic(
          DIAGNOSTIC_CODES.BROKEN_MODULE_REFERENCE,
          "error",
          `Lesson declares phaseId "${phaseId}", but moduleId "${moduleId}" actually belongs to "${actualPhaseIdForModule}".`,
          "curriculum.moduleId",
          {
            lessonId,
            suggestion: `Set phaseId to "${actualPhaseIdForModule}", or use a module that actually belongs to "${phaseId}".`,
          },
        ),
      );
    }
  }

  const topicId = lesson.curriculum?.topicId;
  if (topicId) {
    if (!KNOWN_TOPIC_IDS.has(topicId)) {
      diagnostics.push(
        createDiagnostic(
          DIAGNOSTIC_CODES.BROKEN_TOPIC_REFERENCE,
          "error",
          `CURRICULUM_IDENTITY_ERROR\n\nLesson ${lessonId} references topicId "${topicId}",\nbut topic "${topicId}" is not registered in curriculum-manifest.json.`,
          "curriculum.topicId",
          {
            lessonId,
            suggestion:
              "Check src/data/canonical/curriculum-manifest.json for registered topic IDs.",
          },
        ),
      );
    } else if (moduleId) {
      const actualModuleIdForTopic = TOPIC_MODULE_BY_ID.get(topicId);
      if (actualModuleIdForTopic && actualModuleIdForTopic !== moduleId) {
        diagnostics.push(
          createDiagnostic(
            DIAGNOSTIC_CODES.BROKEN_TOPIC_REFERENCE,
            "error",
            `CURRICULUM_IDENTITY_ERROR\n\nLesson declares moduleId "${moduleId}", but topic "${topicId}" actually belongs to "${actualModuleIdForTopic}".`,
            "curriculum.topicId",
            {
              lessonId,
              suggestion: `Set moduleId to "${actualModuleIdForTopic}", or use a topic belonging to "${moduleId}".`,
            },
          ),
        );
      }
    }
  }

  for (const conceptId of lesson.curriculum?.conceptIds ?? []) {
    if (!KNOWN_CONCEPT_IDS.has(conceptId)) {
      diagnostics.push(
        createDiagnostic(
          DIAGNOSTIC_CODES.BROKEN_CONCEPT_REFERENCE,
          "warning",
          `Lesson references conceptId "${conceptId}", which does not exist in concepts.json.`,
          "curriculum.conceptIds",
          {
            lessonId,
            suggestion: "Add the concept to concepts.json, or fix the reference if it's a typo.",
          },
        ),
      );
    }
  }

  const positionMap = context.manifestLessonOrder ?? LESSON_POSITION_BY_ID;
  const currentPos = positionMap.get(lessonId);

  const prerequisiteIds = lesson.curriculum?.prerequisiteLessonIds ?? [];
  for (const prereqId of prerequisiteIds) {
    if (prereqId === lessonId) {
      diagnostics.push(
        createDiagnostic(
          DIAGNOSTIC_CODES.BROKEN_LESSON_REFERENCE,
          "error",
          `Lesson "${lessonId}" lists itself as its own prerequisite.`,
          "curriculum.prerequisiteLessonIds",
          { lessonId, suggestion: "Remove the self-reference." },
        ),
      );
    } else if (context.knownLessonIds && !context.knownLessonIds.has(prereqId)) {
      diagnostics.push(
        createDiagnostic(
          DIAGNOSTIC_CODES.BROKEN_LESSON_REFERENCE,
          "error",
          `Lesson references prerequisite "${prereqId}", which does not exist in the known lesson corpus.`,
          "curriculum.prerequisiteLessonIds",
          { lessonId, suggestion: "Check the lesson ID, or author the prerequisite lesson first." },
        ),
      );
    }

    // Forward prerequisite check: Prerequisite must appear before dependent lesson in manifest order
    if (currentPos !== undefined) {
      const prereqPos = positionMap.get(prereqId);
      if (prereqPos !== undefined && prereqPos >= currentPos) {
        diagnostics.push(
          createDiagnostic(
            DIAGNOSTIC_CODES.BROKEN_LESSON_REFERENCE,
            "error",
            `Forward prerequisite violation: Lesson "${lessonId}" (position ${currentPos}) requires "${prereqId}" (position ${prereqPos}), which appears later in the curriculum manifest.`,
            "curriculum.prerequisiteLessonIds",
            {
              lessonId,
              suggestion:
                "Prerequisites must precede dependent lessons in authoritative manifest order.",
            },
          ),
        );
      }
    }
  }

  return diagnostics;
}

/**
 * Validates prerequisite sequencing across an array of lessons against authoritative manifest order.
 */
export function checkPrerequisiteSequencing(
  lessons: CanonicalLessonV1[],
  manifestLessonOrder?: Map<string, number>,
): CurriculumDiagnostic[] {
  const positionMap = manifestLessonOrder ?? LESSON_POSITION_BY_ID;
  const diagnostics: CurriculumDiagnostic[] = [];

  for (const lesson of lessons) {
    const currentPos = positionMap.get(lesson.id);
    if (currentPos === undefined) continue;

    for (const prereqId of lesson.curriculum?.prerequisiteLessonIds ?? []) {
      const prereqPos = positionMap.get(prereqId);
      if (prereqPos !== undefined && prereqPos >= currentPos) {
        diagnostics.push(
          createDiagnostic(
            DIAGNOSTIC_CODES.BROKEN_LESSON_REFERENCE,
            "error",
            `Forward prerequisite violation: Lesson "${lesson.id}" (position ${currentPos}) requires "${prereqId}" (position ${prereqPos}), which appears later in the curriculum manifest.`,
            "curriculum.prerequisiteLessonIds",
            {
              lessonId: lesson.id,
              suggestion:
                "Prerequisites must precede dependent lessons in authoritative manifest order.",
            },
          ),
        );
      }
    }
  }

  return diagnostics;
}

/**
 * Batch-level check across a whole corpus: duplicate lesson IDs, forward prerequisites,
 * and a DFS-based cycle detection over the prerequisite graph.
 */
export function checkCorpusIntegrity(
  lessons: CanonicalLessonV1[],
  manifestLessonOrder?: Map<string, number>,
): CurriculumDiagnostic[] {
  const diagnostics: CurriculumDiagnostic[] = [];
  const seenIds = new Map<string, number>();

  lessons.forEach((lesson, index) => {
    if (seenIds.has(lesson.id)) {
      diagnostics.push(
        createDiagnostic(
          DIAGNOSTIC_CODES.DUPLICATE_LESSON_ID,
          "error",
          `Lesson ID "${lesson.id}" is used by more than one lesson (indices ${seenIds.get(lesson.id)} and ${index}).`,
          "id",
          { lessonId: lesson.id, suggestion: "Lesson IDs must be unique across the whole corpus." },
        ),
      );
    }
    seenIds.set(lesson.id, index);
  });

  // Check forward prerequisite violations
  diagnostics.push(...checkPrerequisiteSequencing(lessons, manifestLessonOrder));

  const prereqsById = new Map(
    lessons.map((l) => [l.id, Array.from(new Set(l.curriculum?.prerequisiteLessonIds ?? []))]),
  );
  const reportedCycles = new Set<string>();

  for (const lesson of lessons) {
    const cyclePath = findCycleFrom(lesson.id, prereqsById);
    if (cyclePath) {
      const canonicalKey = [...cyclePath].sort().join(">");
      if (reportedCycles.has(canonicalKey)) continue;
      reportedCycles.add(canonicalKey);
      diagnostics.push(
        createDiagnostic(
          DIAGNOSTIC_CODES.BROKEN_LESSON_REFERENCE,
          "error",
          `Circular prerequisite chain detected: ${cyclePath.join(" → ")} → ${cyclePath[0]}.`,
          "curriculum.prerequisiteLessonIds",
          {
            lessonId: lesson.id,
            suggestion: "Break the cycle by removing one prerequisite link along this chain.",
          },
        ),
      );
    }
  }

  return diagnostics;
}

/** Iterative DFS (explicit stack, not recursion) from `startId` over the prerequisite graph. */
function findCycleFrom(startId: string, prereqsById: Map<string, string[]>): string[] | undefined {
  const stack: Array<{ id: string; path: string[] }> = [{ id: startId, path: [startId] }];
  const visitedFromStart = new Set<string>();

  while (stack.length > 0) {
    const { id, path } = stack.pop()!;
    for (const prereqId of prereqsById.get(id) ?? []) {
      if (prereqId === startId) {
        return path;
      }
      const visitKey = prereqId;
      if (visitedFromStart.has(visitKey)) continue;
      visitedFromStart.add(visitKey);
      stack.push({ id: prereqId, path: [...path, prereqId] });
    }
  }
  return undefined;
}

export interface BidirectionalDiscoveredEntry {
  lessonId: string;
  filePath: string;
  lesson?: CanonicalLessonV1;
  isValid: boolean;
  errors: string[];
}

export interface BidirectionalIntegrityReport {
  valid: boolean;
  errors: string[];
  totalManifestLessons: number;
  plannedCount: number;
  authoredManifestCount: number;
  discoveredJsonCount: number;
  productionRegistryCount: number;
  authoredMissingJson: string[];
  jsonMissingFromManifest: string[];
  jsonRejectedByGate: string[];
  manifestFlagMismatches: string[];
}

export function checkBidirectionalManifestIntegrity(
  manifest: {
    lessons: Array<{
      lessonId: string;
      authored?: boolean;
      moduleId: string;
      topicId?: string;
      phaseId: string;
    }>;
  },
  discoveredEntries: BidirectionalDiscoveredEntry[],
): BidirectionalIntegrityReport {
  const errors: string[] = [];
  const manifestLessons = manifest.lessons || [];
  const manifestLessonMap = new Map(manifestLessons.map((l) => [l.lessonId, l]));

  const plannedLessonIds = manifestLessons
    .filter((l) => l.authored === false)
    .map((l) => l.lessonId);
  const authoredManifestIds = manifestLessons
    .filter((l) => l.authored !== false)
    .map((l) => l.lessonId);

  const discoveredMap = new Map<string, BidirectionalDiscoveredEntry>();
  for (const entry of discoveredEntries) {
    discoveredMap.set(entry.lessonId, entry);
  }

  const authoredMissingJson: string[] = [];
  const jsonMissingFromManifest: string[] = [];
  const jsonRejectedByGate: string[] = [];
  const manifestFlagMismatches: string[] = [];

  // 1. Check every manifest lesson marked authored=true
  for (const manifestLesson of manifestLessons) {
    const isAuthored = manifestLesson.authored !== false;
    const discovered = discoveredMap.get(manifestLesson.lessonId);

    if (isAuthored) {
      if (!discovered) {
        authoredMissingJson.push(manifestLesson.lessonId);
        errors.push(
          `Manifest lesson "${manifestLesson.lessonId}" is marked authored=true, but production JSON file is missing.`,
        );
      } else if (!discovered.isValid || (discovered.errors && discovered.errors.length > 0)) {
        jsonRejectedByGate.push(manifestLesson.lessonId);
        errors.push(
          `Manifest lesson "${manifestLesson.lessonId}" is marked authored=true, but production file failed validation: ${discovered.errors.join("; ")}`,
        );
      }
    } else {
      // authored === false
      if (discovered && discovered.isValid) {
        manifestFlagMismatches.push(manifestLesson.lessonId);
        errors.push(
          `Manifest lesson "${manifestLesson.lessonId}" is marked authored=false, but a valid production JSON file exists at "${discovered.filePath}". Update manifest to authored=true.`,
        );
      }
    }
  }

  // 2. Check every discovered JSON file
  for (const discovered of discoveredEntries) {
    const manifestLesson = manifestLessonMap.get(discovered.lessonId);
    if (!manifestLesson) {
      jsonMissingFromManifest.push(discovered.lessonId);
      errors.push(
        `Discovered production JSON lesson "${discovered.lessonId}" at "${discovered.filePath}" is missing from authoritative manifest.`,
      );
    } else if (discovered.lesson) {
      // Filename check: extract from path
      const parts = discovered.filePath.split("/");
      const filename = parts[parts.length - 1];
      if (filename && filename.endsWith(".json")) {
        const fileBase = filename.slice(0, -5);
        if (fileBase !== discovered.lesson.id) {
          errors.push(
            `Filename mismatch: file "${discovered.filePath}" has base name "${fileBase}", but lesson declares ID "${discovered.lesson.id}".`,
          );
        }
      }

      // Manifest consistency
      if (manifestLesson.moduleId !== discovered.lesson.curriculum.moduleId) {
        errors.push(
          `Module mismatch for "${discovered.lessonId}": manifest="${manifestLesson.moduleId}", lesson="${discovered.lesson.curriculum.moduleId}".`,
        );
      }
      if (
        manifestLesson.topicId &&
        discovered.lesson.curriculum.topicId &&
        manifestLesson.topicId !== discovered.lesson.curriculum.topicId
      ) {
        errors.push(
          `Topic mismatch for "${discovered.lessonId}": manifest="${manifestLesson.topicId}", lesson="${discovered.lesson.curriculum.topicId}".`,
        );
      }
      if (manifestLesson.phaseId !== discovered.lesson.curriculum.phaseId) {
        errors.push(
          `Phase mismatch for "${discovered.lessonId}": manifest="${manifestLesson.phaseId}", lesson="${discovered.lesson.curriculum.phaseId}".`,
        );
      }
    }
  }

  const validProductionEntries = discoveredEntries.filter(
    (e) => e.isValid && manifestLessonMap.get(e.lessonId)?.authored !== false,
  );

  return {
    valid: errors.length === 0,
    errors,
    totalManifestLessons: manifestLessons.length,
    plannedCount: plannedLessonIds.length,
    authoredManifestCount: authoredManifestIds.length,
    discoveredJsonCount: discoveredEntries.length,
    productionRegistryCount: validProductionEntries.length,
    authoredMissingJson,
    jsonMissingFromManifest,
    jsonRejectedByGate,
    manifestFlagMismatches,
  };
}
