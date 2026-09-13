/**
 * Lesson-level UI mode — derived from the current activity's authored V1
 * `role`, per FORGE_LESSON_PLAYER_V2_BLUEPRINT.md §5. A lookup, not an
 * engine: no interpretation of `emotionalJourney` text, no per-lesson
 * custom logic. Six values, each with a short list of roles that produce
 * it. An unrecognized role falls back to "studying" (the calmest mode)
 * rather than guessing something more dramatic.
 */
export type LessonMode = "studying" | "committing" | "investigating" | "building" | "reflecting" | "closing";

const ROLE_TO_MODE: Record<string, LessonMode> = {
  encounter: "studying",
  intro: "studying",
  explanation: "studying",
  summary: "studying",
  orientation: "studying",

  prediction: "committing",
  "multiple-choice": "committing",
  "multi-select": "committing",
  ordering: "committing",
  "fill-blank": "committing",
  "output-prediction": "committing",

  investigation: "investigating",
  debug: "investigating",

  fix: "building",
  manipulation: "building",
  "interactive-code": "building",
  "code-modification": "building",

  reflection: "reflecting",
  judgment: "reflecting",
  transfer: "reflecting",

  verification: "closing",
  completion: "closing",
};

/**
 * `role` is the preferred key (V1's own pedagogical label, e.g.
 * "encounter"/"investigation"/"fix"). `activityType` (the Layer 1-shaped
 * `type` string) is the fallback for activities without a distinct role,
 * or when only the adapted shape is available.
 */
export function deriveLessonMode(role: string | undefined, activityType: string | undefined): LessonMode {
  if (role && ROLE_TO_MODE[role]) return ROLE_TO_MODE[role];
  if (activityType && ROLE_TO_MODE[activityType]) return ROLE_TO_MODE[activityType];
  return "studying";
}
