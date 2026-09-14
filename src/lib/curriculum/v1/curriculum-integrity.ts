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
      // Known module ID, but modules.json (level-numbered, e.g.
      // "module-0-1" = Level 0's first module) and phases.json
      // (phase-numbered, phase-0..phase-9, per FORGE_PHASE_MAP_V1.md) are
      // two genuinely disconnected identity models — FORGE_MODULE_MAP_V1.md
      // defines its own phase-scoped modules using a different ID format
      // entirely ("Module 0.1", not "module-0-1"). There is no source in
      // this repo that lets a validator answer "does this module belong to
      // this phase" — inventing that link here would be fabricating a
      // relationship no one has actually authored. Resolving this for real
      // requires a curriculum-authoring decision (e.g. renumbering
      // modules.json to be phase-scoped) that's outside this validation
      // pass's scope — reported as info, not silently assumed either way.
      diagnostics.push(
        createDiagnostic(
          DIAGNOSTIC_CODES.BROKEN_MODULE_REFERENCE,
          "info",
          `moduleId "${moduleId}" exists in modules.json, and phaseId "${phaseId ?? "(missing)"}" exists in phases.json, but no source in this repo establishes whether they belong together — modules.json is level-numbered, phases.json is phase-numbered, and they are not currently linked. See FORGE_LESSON_PLAYER_V2_VALIDATION_HARDENING_REPORT.md §4.`,
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
 * Batch-level check across a whole corpus: duplicate lesson IDs, and a
 * DFS-based cycle detection over the prerequisite graph that catches
 * cycles of any length (A→B→C→A, not just direct two-hop cycles — the
 * two-hop-only version from the prior phase is superseded by this). This
 * is ordinary graph-integrity validation, not adaptive scheduling: a
 * single DFS pass per lesson, iterative (not recursive) to avoid stack
 * depth concerns on a pathological input, bounded by corpus size.
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

  const prereqsById = new Map(lessons.map((l) => [l.id, Array.from(new Set(l.curriculum?.prerequisiteLessonIds ?? []))]));
  const reportedCycles = new Set<string>(); // dedupe: a 3-cycle A→B→C→A would otherwise be reported once starting from A, again from B, again from C

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
          { lessonId: lesson.id, suggestion: "Break the cycle by removing one prerequisite link along this chain." },
        ),
      );
    }
  }

  return diagnostics;
}

/** Iterative DFS (explicit stack, not recursion) from `startId` over the prerequisite graph. Returns the cycle's node path if `startId` is part of one reachable from itself, else undefined. */
function findCycleFrom(startId: string, prereqsById: Map<string, string[]>): string[] | undefined {
  const stack: Array<{ id: string; path: string[] }> = [{ id: startId, path: [startId] }];
  const visitedFromStart = new Set<string>();

  while (stack.length > 0) {
    const { id, path } = stack.pop()!;
    for (const prereqId of prereqsById.get(id) ?? []) {
      if (prereqId === startId) {
        return path; // found a path back to the start — that's the cycle
      }
      const visitKey = prereqId;
      if (visitedFromStart.has(visitKey)) continue; // avoid re-exploring the same node twice within this one search
      visitedFromStart.add(visitKey);
      stack.push({ id: prereqId, path: [...path, prereqId] });
    }
  }
  return undefined;
}
