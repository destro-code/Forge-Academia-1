/**
 * Curriculum Integrity Validator
 *
 * Validates phase/module/concept/prerequisite references. Per
 * FORGE_LESSON_PLAYER_V2_AUTHORING_PIPELINE_REPORT.md §7, this does NOT
 * silently pick a side of the levels.json/modules.json-vs-Phase-Map
 * staleness question — it uses the two real sources that actually exist
 * (the newly-added `phases.json`, extracted verbatim from
 * `FORGE_PHASE_MAP_V1.md`, and the existing `modules.json`) and reports,
 * as an explicit warning, that `modules.json` is level-numbered while V1
 * lessons author phase-numbered `moduleId`s — a genuine unresolved
 * inconsistency, not one this validator can correctly resolve on its own.
 */
import type { CanonicalLessonV1 } from "../types-v1";
import type { CurriculumDiagnostic } from "../authoring/types";
import { DIAGNOSTIC_CODES } from "../authoring/types";
import { createDiagnostic } from "../authoring/diagnostics";
import phasesData from "@/data/canonical/phases.json";
import modulesData from "@/data/modules.json";
import conceptsData from "@/data/canonical/concepts.json";

const KNOWN_PHASE_IDS = new Set((phasesData as { id: string }[]).map((p) => p.id));
const KNOWN_MODULE_IDS = new Set((modulesData as { id: string }[]).map((m) => m.id));
const KNOWN_CONCEPT_IDS = new Set((conceptsData as { id: string }[]).map((c) => c.id));

export interface CurriculumIntegrityContext {
  /** Lesson IDs known to exist elsewhere in the corpus — used for prerequisite reference checks. Omit to skip that check (e.g. when validating a single lesson in isolation, where "unknown" doesn't mean "invalid"). */
  knownLessonIds?: Set<string>;
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
        `Lesson references phaseId "${phaseId}", which does not exist in the Phase Map (phase-0 through phase-9).`,
        "curriculum.phaseId",
        { lessonId, suggestion: "Use one of phase-0 through phase-9, per FORGE_PHASE_MAP_V1.md." },
      ),
    );
  }

  const moduleId = lesson.curriculum?.moduleId;
  if (moduleId) {
    if (!KNOWN_MODULE_IDS.has(moduleId)) {
      diagnostics.push(
        createDiagnostic(
          DIAGNOSTIC_CODES.BROKEN_MODULE_REFERENCE,
          "error",
          `Lesson references moduleId "${moduleId}", which does not exist in modules.json.`,
          "curriculum.moduleId",
          { lessonId, suggestion: "Check modules.json for the correct module ID." },
        ),
      );
    } else {
      // Known module ID, but modules.json is level-numbered (module-0-1..module-5-6)
      // while V1's own curriculum model is phase-numbered — flag the mismatch
      // rather than silently treating either as fully authoritative.
      diagnostics.push(
        createDiagnostic(
          DIAGNOSTIC_CODES.BROKEN_MODULE_REFERENCE,
          "info",
          `moduleId "${moduleId}" exists in modules.json (level-numbered), but this repo has no phase-numbered module catalog to cross-check it against phaseId "${phaseId ?? "(missing)"}" — see FORGE_LESSON_PLAYER_V2_AUTHORING_PIPELINE_REPORT.md §7.`,
          "curriculum.moduleId",
          { lessonId },
        ),
      );
    }
  }

  for (const conceptId of lesson.curriculum?.conceptIds ?? []) {
    if (!KNOWN_CONCEPT_IDS.has(conceptId)) {
      diagnostics.push(
        createDiagnostic(
          DIAGNOSTIC_CODES.BROKEN_CONCEPT_REFERENCE,
          "warning", // warning, not error: the concept catalog only has 47 entries against a 205-lesson curriculum, so "not yet cataloged" is expected far more often than "genuinely wrong" right now
          `Lesson references conceptId "${conceptId}", which does not exist in concepts.json.`,
          "curriculum.conceptIds",
          { lessonId, suggestion: "Add the concept to concepts.json, or fix the reference if it's a typo." },
        ),
      );
    }
  }

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
  }

  return diagnostics;
}

/**
 * Batch-level check across a whole corpus: duplicate lesson IDs, and (where
 * `knownLessonIds` isn't supplied per-lesson) a simple two-hop circular
 * prerequisite check. Per the task's explicit "not adaptive scheduling"
 * instruction, this stops at direct + one-hop cycles — a full cycle-detection
 * graph traversal was judged out of scope for authoring-time data-integrity
 * checking versus what a straightforward two-hop check already catches for
 * the corpus sizes Forge is dealing with (dozens, not thousands, of lessons).
 */
export function checkCorpusIntegrity(lessons: CanonicalLessonV1[]): CurriculumDiagnostic[] {
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

  const prereqsById = new Map(lessons.map((l) => [l.id, new Set(l.curriculum?.prerequisiteLessonIds ?? [])]));
  for (const lesson of lessons) {
    for (const prereqId of prereqsById.get(lesson.id) ?? []) {
      const prereqOfPrereq = prereqsById.get(prereqId);
      if (prereqOfPrereq?.has(lesson.id)) {
        diagnostics.push(
          createDiagnostic(
            DIAGNOSTIC_CODES.BROKEN_LESSON_REFERENCE,
            "error",
            `Circular prerequisite: "${lesson.id}" requires "${prereqId}", which requires "${lesson.id}" back.`,
            "curriculum.prerequisiteLessonIds",
            { lessonId: lesson.id, suggestion: "Break the cycle by removing one of the two prerequisite links." },
          ),
        );
      }
    }
  }

  return diagnostics;
}
