/**
 * Transition-feel lookup: (from-role, to-role) → a named transition kind the
 * lesson shell uses to decide *how* one activity hands off to the next.
 * Explicitly NOT an arc engine — no interpretation of authored text, just a
 * small authored table with a safe default.
 *
 * Per FORGE_LESSON_PLAYER_V2_BLUEPRINT.md §8 (flagged as an open decision):
 * this table is seeded only with the pairs the golden lesson actually
 * produces. It needs to grow from real content in 2–3 more lessons before
 * it can be considered a general-purpose table — treat every entry here as
 * provisional, not load-bearing product design.
 */
export type TransitionKind =
  | "settle" // brief stillness — let a commitment land before moving on
  | "shift-mode" // the workspace itself changes (e.g. into investigation)
  | "carry-evidence" // prior evidence/context visibly carries forward
  | "resolve" // a success beat — the one more expressive transition per lesson
  | "plain"; // default — no special handling

const SEED_TABLE: Record<string, TransitionKind> = {
  "encounter->prediction": "settle",
  "prediction->investigation": "shift-mode",
  "investigation->manipulation": "carry-evidence",
  "manipulation->verification": "resolve",
  "verification->reflection": "plain",
  "reflection->transfer": "plain",
};

export function resolveTransition(fromRole: string | undefined, toRole: string | undefined): TransitionKind {
  if (!fromRole || !toRole) return "plain";
  return SEED_TABLE[`${fromRole}->${toRole}`] ?? "plain";
}
