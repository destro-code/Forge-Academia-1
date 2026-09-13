/**
 * Presentation family registry — maps all 17 V1 activity types onto the 10
 * presentation families from FORGE_LESSON_PLAYER_V2_BLUEPRINT.md §4, and
 * declares an honest support status per type:
 *
 *  - "implemented": a dedicated v2 surface component exists and is wired up.
 *  - "shared-primitive": the family exists conceptually and shares a
 *    primitive with an implemented sibling, but no v2 surface component has
 *    actually been built for this specific type yet.
 *  - "not-yet-supported": no v2 treatment exists at all.
 *
 * Per the task's explicit instruction ("unsupported activity types must
 * fail clearly during development rather than silently rendering an
 * incorrect experience"), `resolvePresentationFamily` throws for
 * "not-yet-supported" types rather than falling back to something generic.
 */

export type PresentationFamily =
  | "reading"
  | "seeing"
  | "system"
  | "commitment"
  | "selection"
  | "assembly"
  | "investigation"
  | "code-workspace"
  | "reasoning"
  | "closure";

export type SupportStatus = "implemented" | "shared-primitive" | "not-yet-supported";

interface PresentationEntry {
  family: PresentationFamily;
  status: SupportStatus;
}

/**
 * Keyed by V1 activity `type` (the authored type, not the Layer-1-adapted
 * one) — matches the 17-type union in `types-v1.ts`.
 */
export const PRESENTATION_REGISTRY: Record<string, PresentationEntry> = {
  intro: { family: "reading", status: "shared-primitive" },
  explanation: { family: "reading", status: "shared-primitive" },
  summary: { family: "reading", status: "shared-primitive" },

  visual: { family: "seeing", status: "shared-primitive" },
  "interactive-demo": { family: "system", status: "implemented" },

  prediction: { family: "commitment", status: "implemented" },
  "output-prediction": { family: "commitment", status: "shared-primitive" },
  "multiple-choice": { family: "commitment", status: "shared-primitive" },

  "multi-select": { family: "selection", status: "not-yet-supported" },
  ordering: { family: "selection", status: "not-yet-supported" },

  "fill-blank": { family: "assembly", status: "not-yet-supported" },

  debug: { family: "investigation", status: "implemented" },

  "interactive-code": { family: "code-workspace", status: "implemented" },
  "code-modification": { family: "code-workspace", status: "shared-primitive" },

  reflection: { family: "reasoning", status: "implemented" },
  judgment: { family: "reasoning", status: "implemented" }, // via the acknowledgment fallback — see reasoning-surface.tsx doc

  completion: { family: "closure", status: "implemented" },
};

export function resolvePresentationFamily(activityType: string): PresentationFamily {
  const entry = PRESENTATION_REGISTRY[activityType];
  if (!entry) {
    throw new Error(
      `resolvePresentationFamily: no presentation entry registered for V1 activity type "${activityType}".`,
    );
  }
  if (entry.status === "not-yet-supported") {
    throw new Error(
      `resolvePresentationFamily: activity type "${activityType}" is registered as the "${entry.family}" family ` +
        `but has no implementation yet — see FORGE_LESSON_PLAYER_V2_BLUEPRINT.md §4. Refusing to render rather ` +
        `than falling back to a generic surface.`,
    );
  }
  return entry.family;
}
