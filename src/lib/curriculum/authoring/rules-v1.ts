/**
 * Authoring Linter Rules for Canonical Lesson Schema V1
 * Enforces strict pedagogical and architectural contracts defined in docs/FORGE_LESSON_SCHEMA_V1.md
 */

import type { CanonicalLessonV1, ActivityV1 } from "../types-v1";
import type { CurriculumDiagnostic } from "./types";
import { DIAGNOSTIC_CODES } from "./types";
import { createDiagnostic } from "./diagnostics";

export const PASSIVE_ROLES_V1 = new Set(["encounter", "explanation", "reflection", "discovery"]);

export function checkLessonV1Structure(lesson: CanonicalLessonV1): CurriculumDiagnostic[] {
  const diagnostics: CurriculumDiagnostic[] = [];
  const lessonId = lesson.id;

  if (!lesson.id || typeof lesson.id !== "string" || lesson.id.trim() === "") {
    diagnostics.push(
      createDiagnostic(
        DIAGNOSTIC_CODES.INVALID_ACTIVITY_FIELD,
        "error",
        "Lesson ID must be a non-empty string.",
        "id",
      ),
    );
  }

  if (!lesson.identity?.title || lesson.identity.title.trim() === "") {
    diagnostics.push(
      createDiagnostic(
        DIAGNOSTIC_CODES.INVALID_ACTIVITY_FIELD,
        "error",
        "Lesson identity must include a valid title.",
        "identity.title",
        { lessonId },
      ),
    );
  }

  if (!lesson.curriculum?.phaseId) {
    diagnostics.push(
      createDiagnostic(
        DIAGNOSTIC_CODES.INVALID_ACTIVITY_FIELD,
        "error",
        "Lesson curriculum must declare a phaseId (e.g. 'phase-0').",
        "curriculum.phaseId",
        { lessonId },
      ),
    );
  }

  if (!lesson.curriculum?.moduleId) {
    diagnostics.push(
      createDiagnostic(
        DIAGNOSTIC_CODES.INVALID_ACTIVITY_FIELD,
        "error",
        "Lesson curriculum must declare a moduleId (e.g. 'module-0-1').",
        "curriculum.moduleId",
        { lessonId },
      ),
    );
  }

  if (!Array.isArray(lesson.activities) || lesson.activities.length === 0) {
    diagnostics.push(
      createDiagnostic(
        DIAGNOSTIC_CODES.INVALID_ACTIVITY_FIELD,
        "error",
        "Lesson must contain a non-empty 'activities' array.",
        "activities",
        { lessonId },
      ),
    );
  }

  return diagnostics;
}

export function checkLessonV1CapabilityContract(lesson: CanonicalLessonV1): CurriculumDiagnostic[] {
  const diagnostics: CurriculumDiagnostic[] = [];
  const lessonId = lesson.id;

  const declaredCapabilityIds = new Set(lesson.curriculum?.capabilityIds || []);
  const primaryCapId = lesson.learning?.primaryCapability?.id;

  if (!primaryCapId) {
    diagnostics.push(
      createDiagnostic(
        DIAGNOSTIC_CODES.INVALID_ACTIVITY_FIELD,
        "error",
        "Lesson learning section must specify a primaryCapability with an id.",
        "learning.primaryCapability",
        { lessonId },
      ),
    );
  } else if (!declaredCapabilityIds.has(primaryCapId)) {
    diagnostics.push(
      createDiagnostic(
        DIAGNOSTIC_CODES.INVALID_ACTIVITY_FIELD,
        "error",
        `Primary capability '${primaryCapId}' is not listed in curriculum.capabilityIds.`,
        "curriculum.capabilityIds",
        { lessonId },
      ),
    );
  }

  return diagnostics;
}

export function checkLessonV1EvidenceIntegrity(lesson: CanonicalLessonV1): CurriculumDiagnostic[] {
  const diagnostics: CurriculumDiagnostic[] = [];
  const lessonId = lesson.id;
  const declaredCapIds = new Set(lesson.curriculum?.capabilityIds || []);
  const producedEvidenceTypes = new Set<string>();

  if (!Array.isArray(lesson.activities)) return diagnostics;

  lesson.activities.forEach((act, idx) => {
    const actPath = `activities[${idx}]`;

    // Record evidence types whenever declared
    if (act.evidence && Array.isArray(act.evidence.types)) {
      act.evidence.types.forEach((t) => producedEvidenceTypes.add(t));
    }

    // Active activities must declare evidence
    if (!PASSIVE_ROLES_V1.has(act.role)) {
      if (!act.evidence || !Array.isArray(act.evidence.types) || act.evidence.types.length === 0) {
        diagnostics.push(
          createDiagnostic(
            DIAGNOSTIC_CODES.INVALID_ACTIVITY_FIELD,
            "error",
            `Activity '${act.id}' with role '${act.role}' must declare explicit evidence types.`,
            `${actPath}.evidence`,
            { lessonId, activityId: act.id },
          ),
        );
      }

      if (
        !act.evidence ||
        !Array.isArray(act.evidence.capabilityIds) ||
        act.evidence.capabilityIds.length === 0
      ) {
        diagnostics.push(
          createDiagnostic(
            DIAGNOSTIC_CODES.INVALID_ACTIVITY_FIELD,
            "error",
            `Activity '${act.id}' with role '${act.role}' must declare associated capabilityIds in evidence.`,
            `${actPath}.evidence.capabilityIds`,
            { lessonId, activityId: act.id },
          ),
        );
      } else {
        act.evidence.capabilityIds.forEach((cId) => {
          if (!declaredCapIds.has(cId)) {
            diagnostics.push(
              createDiagnostic(
                DIAGNOSTIC_CODES.INVALID_ACTIVITY_FIELD,
                "warning",
                `Activity '${act.id}' references undeclared capabilityId '${cId}'.`,
                `${actPath}.evidence.capabilityIds`,
                { lessonId, activityId: act.id },
              ),
            );
          }
        });
      }
    }
  });

  // Verify mastery required evidence against produced evidence
  if (Array.isArray(lesson.mastery?.requiredEvidence)) {
    lesson.mastery.requiredEvidence.forEach((reqType) => {
      if (!producedEvidenceTypes.has(reqType)) {
        diagnostics.push(
          createDiagnostic(
            DIAGNOSTIC_CODES.INVALID_ACTIVITY_FIELD,
            "error",
            `Mastery requires evidence type '${reqType}', but no activity produces this evidence type.`,
            "mastery.requiredEvidence",
            { lessonId },
          ),
        );
      }
    });
  }

  return diagnostics;
}

export function checkLessonV1ExperienceArc(lesson: CanonicalLessonV1): CurriculumDiagnostic[] {
  const diagnostics: CurriculumDiagnostic[] = [];
  const lessonId = lesson.id;

  if (
    !lesson.experience?.arc ||
    !Array.isArray(lesson.experience.arc) ||
    lesson.experience.arc.length === 0
  ) {
    diagnostics.push(
      createDiagnostic(
        DIAGNOSTIC_CODES.INVALID_ACTIVITY_FIELD,
        "error",
        "Lesson experience must specify an arc array of learning stages.",
        "experience.arc",
        { lessonId },
      ),
    );
  }

  return diagnostics;
}

export function lintLessonV1(lesson: CanonicalLessonV1): CurriculumDiagnostic[] {
  return [
    ...checkLessonV1Structure(lesson),
    ...checkLessonV1CapabilityContract(lesson),
    ...checkLessonV1EvidenceIntegrity(lesson),
    ...checkLessonV1ExperienceArc(lesson),
  ];
}
