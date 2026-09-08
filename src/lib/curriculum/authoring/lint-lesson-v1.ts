/**
 * Comprehensive Canonical Lesson Schema V1 Authoring Linter
 */

import { safeValidateLessonV1 } from "../schema-v1";
import type { CanonicalLessonV1, ActivityV1 } from "../types-v1";
import { capabilityCatalog } from "../capabilities";
import type { CurriculumContext, CurriculumLintResult, CurriculumDiagnostic } from "./types";
import { DIAGNOSTIC_CODES } from "./types";
import { buildLintResult, createDiagnostic } from "./diagnostics";
import { lintLessonV1 as lintRulesV1, PASSIVE_ROLES_V1 } from "./rules-v1";

export function checkLessonV1Ids(lesson: CanonicalLessonV1): CurriculumDiagnostic[] {
  const diagnostics: CurriculumDiagnostic[] = [];
  const activityIds = new Set<string>();

  if (Array.isArray(lesson.activities)) {
    lesson.activities.forEach((act, idx) => {
      if (!act.id) return;
      if (activityIds.has(act.id)) {
        diagnostics.push(
          createDiagnostic(
            DIAGNOSTIC_CODES.DUPLICATE_ACTIVITY_ID,
            "error",
            `Duplicate activity ID '${act.id}' found at index ${idx}.`,
            `activities[${idx}].id`,
            { lessonId: lesson.id, activityId: act.id },
          ),
        );
      }
      activityIds.add(act.id);
    });
  }

  return diagnostics;
}

export function checkLessonV1CapabilityCatalog(lesson: CanonicalLessonV1): CurriculumDiagnostic[] {
  const diagnostics: CurriculumDiagnostic[] = [];
  const lessonId = lesson.id;
  const capabilityIds = lesson.curriculum?.capabilityIds || [];

  const check = capabilityCatalog.validateCapabilityReferences(capabilityIds);
  if (!check.valid) {
    check.missingIds.forEach((missingId) => {
      diagnostics.push(
        createDiagnostic(
          DIAGNOSTIC_CODES.BROKEN_SKILL_REFERENCE,
          "error",
          `Referenced capability '${missingId}' does not exist in canonical capability catalog.`,
          "curriculum.capabilityIds",
          { lessonId },
        ),
      );
    });
  }

  return diagnostics;
}

export function checkLessonV1PedagogyQuality(lesson: CanonicalLessonV1): CurriculumDiagnostic[] {
  const diagnostics: CurriculumDiagnostic[] = [];
  const lessonId = lesson.id;

  if (!Array.isArray(lesson.activities) || lesson.activities.length === 0) {
    return diagnostics;
  }

  const activeCount = lesson.activities.filter((a) => !PASSIVE_ROLES_V1.has(a.role)).length;
  if (activeCount === 0) {
    diagnostics.push(
      createDiagnostic(
        DIAGNOSTIC_CODES.PASSIVE_LESSON_WARNING,
        "warning",
        "Lesson has no active interaction or debugging activities (100% passive).",
        "activities",
        { lessonId },
      ),
    );
  }

  // Check hint scaffolding monotonicity
  lesson.activities.forEach((act, idx) => {
    if (Array.isArray(act.hints) && act.hints.length > 1) {
      for (let i = 1; i < act.hints.length; i++) {
        if (act.hints[i].level <= act.hints[i - 1].level) {
          diagnostics.push(
            createDiagnostic(
              DIAGNOSTIC_CODES.INVALID_ACTIVITY_FIELD,
              "warning",
              `Activity '${act.id}' has non-monotonic hint levels at hint index ${i}.`,
              `activities[${idx}].hints[${i}]`,
              { lessonId, activityId: act.id },
            ),
          );
        }
      }
    }
  });

  return diagnostics;
}

export function lintLessonV1Full(
  rawLesson: unknown,
  _context?: CurriculumContext,
): CurriculumLintResult {
  const diagnostics: CurriculumDiagnostic[] = [];

  if (!rawLesson || typeof rawLesson !== "object") {
    diagnostics.push(
      createDiagnostic(
        DIAGNOSTIC_CODES.INVALID_ACTIVITY_FIELD,
        "error",
        "Lesson must be a non-null JSON object.",
        "$",
      ),
    );
    return buildLintResult(diagnostics);
  }

  // 1. Zod Schema V1 Validation
  const parseResult = safeValidateLessonV1(rawLesson);
  if (!parseResult.success) {
    for (const issue of parseResult.error.issues) {
      const pathStr = issue.path.join(".") || "$";
      diagnostics.push(
        createDiagnostic(
          DIAGNOSTIC_CODES.INVALID_ACTIVITY_FIELD,
          "error",
          `Schema V1 validation failed at ${pathStr}: ${issue.message}`,
          pathStr,
          { lessonId: (rawLesson as any).id },
        ),
      );
    }
  }

  const lesson = rawLesson as CanonicalLessonV1;

  // 2. ID integrity
  diagnostics.push(...checkLessonV1Ids(lesson));

  // 3. Capability Catalog integrity
  diagnostics.push(...checkLessonV1CapabilityCatalog(lesson));

  // 4. Schema V1 Authoring rules
  diagnostics.push(...lintRulesV1(lesson));

  // 5. Pedagogical Quality checks
  diagnostics.push(...checkLessonV1PedagogyQuality(lesson));

  return buildLintResult(diagnostics);
}
