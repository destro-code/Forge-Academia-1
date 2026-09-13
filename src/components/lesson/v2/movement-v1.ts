import { MOVEMENTS, movementForActivityType, type Movement } from "@/components/lesson/canonical/lesson-movements";
import type { ActivityType } from "@/lib/curriculum/types";

/**
 * Extends the existing movement system (`lesson-movements.ts`) to V1's
 * `role` vocabulary, per FORGE_LESSON_PLAYER_V2_BLUEPRINT.md §8's resolved
 * decision: share existing hues rather than grow past 8 movements.
 *
 * `transfer` shares `prove`'s hue (both are "show what you know" beats);
 * `manipulation` shares `forge`'s hue (both are hands-on construction);
 * `investigation` also shares `forge` — the blueprint's "hot" energy tier
 * for debugging is `forge`'s own energy already, so no new tier is needed.
 */
const V1_ROLE_TO_MOVEMENT: Record<string, keyof typeof MOVEMENTS> = {
  encounter: "see",
  prediction: "predict",
  investigation: "forge",
  manipulation: "forge",
  verification: "prove",
  reflection: "reflect",
  transfer: "prove",
  completion: "temper",
};

export function movementForV1Role(role: string | undefined, fallbackActivityType: ActivityType): Movement {
  if (role && V1_ROLE_TO_MOVEMENT[role]) {
    return MOVEMENTS[V1_ROLE_TO_MOVEMENT[role]];
  }
  return movementForActivityType(fallbackActivityType);
}
