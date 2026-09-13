/**
 * Contextual continue-label — previews the *verb* of the next activity
 * rather than a generic "Next", per
 * FORGE_LESSON_PLAYER_V2_EXPERIENCE_SPEC.md §2 and the Activity Coverage
 * phase's Reading-family requirement. A lookup, not generated text — falls
 * back to "Continue" for any role/type it doesn't recognize rather than
 * producing an awkward contextual label (explicitly permitted: "Do not
 * force contextual labels when they become awkward").
 */
const ROLE_TO_LABEL: Record<string, string> = {
  prediction: "Make a prediction",
  investigation: "Inspect the evidence",
  manipulation: "Try it",
  verification: "See it happen",
  reflection: "Reflect",
  transfer: "Apply it",
};

const TYPE_TO_LABEL: Record<string, string> = {
  "interactive-demo": "See it happen",
  "interactive-code": "Build it",
  "code-modification": "Build it",
  debug: "Inspect the evidence",
  prediction: "Make a prediction",
  "multiple-choice": "Make a prediction",
  "output-prediction": "Predict the output",
  "multi-select": "Choose your answers",
  ordering: "Put it in order",
  "fill-blank": "Fill it in",
  reflection: "Reflect",
  judgment: "Weigh the tradeoffs",
};

export function deriveContinueLabel(
  nextRole: string | undefined,
  nextType: string | undefined,
  fallback = "Continue",
): string {
  if (nextRole && ROLE_TO_LABEL[nextRole]) return ROLE_TO_LABEL[nextRole];
  if (nextType && TYPE_TO_LABEL[nextType]) return TYPE_TO_LABEL[nextType];
  return fallback;
}
