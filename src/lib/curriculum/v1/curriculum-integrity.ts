/**
 * Curriculum Integrity Validator
 *
 * Validates phase/module/concept/prerequisite references against the ONE
 * authoritative curriculum hierarchy: `curriculum-hierarchy.json` (see
 * FORGE_CURRICULUM_IDENTITY_REPORT.md for how it was built and why it
 * supersedes the prior phase's separate `phases.json`). Resolves what the
 * prior phase left as an "info, unknown relationship" diagnostic into a
 * real, deterministic check: module→phase membership is now validated the
 * same way phase and module existence already were.
 */
import type { CanonicalLessonV1 } from "../types-v1";
import type { CurriculumDiagnostic } from "../authoring/types";
import { DIAGNOSTIC_CODES } from "../authoring/types";
import { createDiagnostic } from "../authoring/diagnostics";
import curriculumHierarchy from "@/data/canonical/curriculum-hierarchy.json";
import conceptsData from "@/data/canonical/concepts.json";

const KNOWN_PHASE_IDS = new Set(curriculumHierarchy.phases.map((p) => p.id));
const MODULE_PHASE_BY_ID = new Map(curriculumHierarchy.modules.map((m) => [m.id, m.phaseId]));
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
        `Lesson references phaseId "${phaseId}", which does not exist in the authoritative curriculum hierarchy (phase-0 through phase-5).`,
        "curriculum.phaseId",
        { lessonId, suggestion: "Use one of phase-0 through phase-5 — see src/data/canonical/curriculum-hierarchy.json." },
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
          { lessonId, suggestion: "Check src/data/canonical/curriculum-hierarchy.json for the correct module ID." },
        ),
      );
    } else if (phaseId && actualPhaseIdForModule !== phaseId) {
      // The relationship IS now deterministic — this used to be an "info,
      // unknown" diagnostic; it's a real blocking error now.
      diagnostics.push(
        createDiagnostic(
          DIAGNOSTIC_CODES.BROKEN_MODULE_REFERENCE,
          "error",
          `Lesson declares phaseId "${phaseId}", but moduleId "${moduleId}" actually belongs to "${actualPhaseIdForModule}".`,
          "curriculum.moduleId",
          { lessonId, suggestion: `Set phaseId to "${actualPhaseIdForModule}", or use a module that actually belongs to "${phaseId}".` },
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
