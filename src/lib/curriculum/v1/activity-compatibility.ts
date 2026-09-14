/**
 * Activity Compatibility Validator
 *
 * Answers the question the authoring pipeline is missing today: *can this
 * authored activity actually be rendered by the current V2 player?* Checks
 * the full chain per FORGE_LESSON_PLAYER_V2_AUTHORING_PIPELINE_REPORT.md
 * §5:
 *
 *   activity.type → content schema exists? → adapter exists? →
 *   validation config internally consistent (references real option/blank/item IDs)?
 *
 * Deliberately does NOT duplicate `content-schemas.ts` (reuses
 * `V1_CONTENT_SCHEMAS`/`validateActivityV1Content` as-is) or `adapter.ts`
 * (reuses the exported `V1_SUPPORTED_ACTIVITY_TYPES` set rather than
 * re-deriving support from the switch statement). This file adds exactly
 * one new thing neither of those already did: validation-config
 * cross-reference checking (does `correctAnswer`/`correctSequence`/blank
 * IDs actually point at something that exists in the same activity's
 * content?), which is authoring-integrity, not content-shape or
 * render-capability — a genuinely missing third check, not a duplicate of
 * either existing one.
 */
import type { ActivityV1, CanonicalLessonV1 } from "../types-v1";
import { validateActivityV1Content } from "./content-schemas";
import { V1_SUPPORTED_ACTIVITY_TYPES } from "./adapter";
import type { CurriculumDiagnostic } from "../authoring/types";
import { DIAGNOSTIC_CODES } from "../authoring/types";
import { createDiagnostic } from "../authoring/diagnostics";

/** Activity types that are supported (renderable) but have no dedicated Zod content schema yet — see content-schemas.ts's own doc note. Content-shape checking is skipped for these, not treated as a failure. */
const SUPPORTED_WITHOUT_CONTENT_SCHEMA = new Set(["visual", "reflection", "judgment", "completion"]);

function optionIds(content: unknown): Set<string> | undefined {
  const c = content as { options?: { id: string }[] } | undefined;
  return c?.options ? new Set(c.options.map((o) => o.id)) : undefined;
}

/**
 * Checks that an activity's `validation` config references IDs that
 * actually exist in its own `content` — the exact "correctAnswer
 * references option 'A', but no option with id 'A' exists" case from the
 * task's own example.
 */
function checkValidationReferences(activity: ActivityV1, path: string): CurriculumDiagnostic[] {
  const diagnostics: CurriculumDiagnostic[] = [];
  const validation = activity.validation as Record<string, unknown> | undefined;
  if (!validation) return diagnostics;

  const ids = optionIds(activity.content);
  if (ids) {
    const correctAnswer = validation.correctAnswer;
    if (typeof correctAnswer === "string" && !ids.has(correctAnswer)) {
      diagnostics.push(
        createDiagnostic(
          DIAGNOSTIC_CODES.INVALID_ACTIVITY_VALIDATION,
          "error",
          `Activity "${activity.id}" (${activity.type}): validation.correctAnswer references option "${correctAnswer}", but no option with that id exists.`,
          `${path}.validation.correctAnswer`,
          {
            lessonId: undefined,
            activityId: activity.id,
            suggestion: `Add an option with id "${correctAnswer}" to content.options, or change correctAnswer to one of: ${Array.from(ids).join(", ")}.`,
          },
        ),
      );
    }
    const expectedArray = validation.expected;
    if (Array.isArray(expectedArray)) {
      for (const id of expectedArray) {
        if (typeof id === "string" && !ids.has(id)) {
          diagnostics.push(
            createDiagnostic(
              DIAGNOSTIC_CODES.INVALID_ACTIVITY_VALIDATION,
              "error",
              `Activity "${activity.id}" (${activity.type}): validation.expected references option "${id}", but no option with that id exists.`,
              `${path}.validation.expected`,
              { activityId: activity.id, suggestion: `Add an option with id "${id}" or remove it from validation.expected.` },
            ),
          );
        }
      }
    }
  }

  // ordering: correctSequence must reference real item IDs, exactly once each
  if (activity.type === "ordering") {
    const content = activity.content as { items?: { id: string }[] } | undefined;
    const itemIds = new Set((content?.items ?? []).map((i) => i.id));
    const correctSequence = validation.correctSequence;
    if (Array.isArray(correctSequence)) {
      for (const id of correctSequence) {
        if (typeof id === "string" && !itemIds.has(id)) {
          diagnostics.push(
            createDiagnostic(
              DIAGNOSTIC_CODES.INVALID_ACTIVITY_VALIDATION,
              "error",
              `Activity "${activity.id}" (ordering): validation.correctSequence references item "${id}", but no item with that id exists in content.items.`,
              `${path}.validation.correctSequence`,
              { activityId: activity.id, suggestion: `Add an item with id "${id}" to content.items, or remove it from correctSequence.` },
            ),
          );
        }
      }
    }
  }

  // fill-blank: template's {{blankId}} tokens must match content.blanks IDs exactly
  if (activity.type === "fill-blank") {
    const content = activity.content as { template?: string; blanks?: { id: string }[] } | undefined;
    const declaredIds = new Set((content?.blanks ?? []).map((b) => b.id));
    const tokenIds = new Set(Array.from((content?.template ?? "").matchAll(/\{\{(.+?)\}\}/g)).map((m) => m[1]));
    for (const id of tokenIds) {
      if (!declaredIds.has(id)) {
        diagnostics.push(
          createDiagnostic(
            DIAGNOSTIC_CODES.INVALID_ACTIVITY_VALIDATION,
            "error",
            `Activity "${activity.id}" (fill-blank): template references blank "{{${id}}}", but content.blanks has no entry with id "${id}".`,
            `${path}.content.template`,
            { activityId: activity.id, suggestion: `Add { "id": "${id}" } to content.blanks, or fix the token in the template.` },
          ),
        );
      }
    }
    for (const id of declaredIds) {
      if (!tokenIds.has(id)) {
        diagnostics.push(
          createDiagnostic(
            DIAGNOSTIC_CODES.INVALID_ACTIVITY_VALIDATION,
            "warning",
            `Activity "${activity.id}" (fill-blank): content.blanks declares "${id}", but the template never references it with "{{${id}}}".`,
            `${path}.content.blanks`,
            { activityId: activity.id, suggestion: `Add "{{${id}}}" to the template, or remove the unused blank.` },
          ),
        );
      }
    }
  }

  return diagnostics;
}

/** Checks for duplicate option/item/blank IDs within a single activity's content — DUPLICATE_OPTION_ID etc. were declared in the diagnostic taxonomy but unused by any V1 check until now. */
function checkDuplicateContentIds(activity: ActivityV1, path: string): CurriculumDiagnostic[] {
  const diagnostics: CurriculumDiagnostic[] = [];
  const content = activity.content as Record<string, unknown> | undefined;

  const checkList = (list: unknown, code: string, label: string) => {
    if (!Array.isArray(list)) return;
    const seen = new Set<string>();
    for (const item of list) {
      const id = (item as { id?: string })?.id;
      if (typeof id !== "string") continue;
      if (seen.has(id)) {
        diagnostics.push(
          createDiagnostic(
            code,
            "error",
            `Activity "${activity.id}" (${activity.type}): duplicate ${label} id "${id}".`,
            `${path}.content`,
            { activityId: activity.id, suggestion: `Give each ${label} a unique id.` },
          ),
        );
      }
      seen.add(id);
    }
  };

  checkList(content?.options, DIAGNOSTIC_CODES.DUPLICATE_OPTION_ID, "option");
  checkList(content?.items, DIAGNOSTIC_CODES.DUPLICATE_ITEM_ID, "item");
  checkList(content?.blanks, DIAGNOSTIC_CODES.DUPLICATE_BLANK_ID, "blank");

  return diagnostics;
}

/**
 * The full per-activity compatibility check: type support, content shape,
 * duplicate IDs, and validation-config cross-references.
 */
export function checkActivityCompatibility(activity: ActivityV1, index: number): CurriculumDiagnostic[] {
  const diagnostics: CurriculumDiagnostic[] = [];
  const path = `activities[${index}]`;

  if (!V1_SUPPORTED_ACTIVITY_TYPES.has(activity.type)) {
    diagnostics.push(
      createDiagnostic(
        DIAGNOSTIC_CODES.UNKNOWN_ACTIVITY_TYPE,
        "error",
        `Activity type "${activity.type}" is not currently supported by Forge V2.`,
        `${path}.type`,
        {
          activityId: activity.id,
          suggestion:
            activity.type === "code-modification"
              ? "code-modification has no adapter or renderer yet — use interactive-code instead, or wait for it to be implemented."
              : "Use one of the 16 currently supported activity types.",
        },
      ),
    );
    return diagnostics; // no point checking content/validation for a type the player can't render at all
  }

  if (!SUPPORTED_WITHOUT_CONTENT_SCHEMA.has(activity.type)) {
    const contentResult = validateActivityV1Content(activity);
    if (!contentResult.isValid) {
      for (const error of contentResult.errors) {
        diagnostics.push(
          createDiagnostic(
            DIAGNOSTIC_CODES.INVALID_ACTIVITY_FIELD,
            "error",
            `Activity "${activity.id}" (${activity.type}): ${error}`,
            `${path}.content`,
            { activityId: activity.id },
          ),
        );
      }
    }
  }

  diagnostics.push(...checkDuplicateContentIds(activity, path));
  diagnostics.push(...checkValidationReferences(activity, path));

  return diagnostics;
}

export function checkLessonActivityCompatibility(lesson: CanonicalLessonV1): CurriculumDiagnostic[] {
  if (!Array.isArray(lesson.activities)) return [];
  return lesson.activities.flatMap((activity, index) => checkActivityCompatibility(activity, index));
}
