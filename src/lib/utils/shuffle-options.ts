/**
 * Deterministic Anti-Gaming Option Shuffler & Ordering Derangement Engine
 *
 * Ensures that:
 * 1. Multiple-choice & prediction options are deterministically shuffled per
 *    activity + attempt so "Option A" is never predictably the right answer.
 * 2. Ordering tasks are pre-scrambled on initial load (guaranteed derangement
 *    away from `correctSequence`) so learners never see an already-solved list.
 */

function hashSeed(seed: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function createSeededRandom(seed: string): () => number {
  let state = hashSeed(seed) || 1;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministically shuffles an array of options based on `seedKey` (e.g.
 * `${activityId}:attempt-${attempts}`).
 */
export function shuffleOptionsDeterministic<T>(
  options: readonly T[],
  seedKey: string,
): T[] {
  if (options.length <= 1) return [...options];

  const rand = createSeededRandom(seedKey);
  const copy = [...options];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  // In many authored lessons, index 0 (`opt-a`) is the correct answer.
  // If index 0 stayed at index 0 and hashSeed is even, rotate it to a non-zero slot
  // so the first option isn't disproportionately the winner.
  if (copy[0] === options[0] && copy.length >= 3) {
    const targetIdx = 1 + (hashSeed(`${seedKey}:shift`) % (copy.length - 1));
    [copy[0], copy[targetIdx]] = [copy[targetIdx], copy[0]];
  }

  return copy;
}

function arraysEqual(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/**
 * Validates that an ordering activity's items and target sequence (if provided)
 * have unique non-empty item IDs and form a strict bijection (no duplicate or
 * missing item IDs).
 */
export function validateOrderingSequenceIntegrity(
  items: readonly { id: string }[],
  correctSequence?: readonly string[],
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const itemIds = new Set<string>();

  for (const item of items) {
    if (!item || typeof item.id !== "string" || item.id.trim().length === 0) {
      errors.push("Ordering item is missing a valid non-empty string id.");
      continue;
    }
    if (itemIds.has(item.id)) {
      errors.push(`Duplicate item id "${item.id}" in ordering content.items.`);
    }
    itemIds.add(item.id);
  }

  if (correctSequence !== undefined) {
    const seenSeq = new Set<string>();
    for (const seqId of correctSequence) {
      if (typeof seqId !== "string" || seqId.trim().length === 0) {
        errors.push("Ordering sequence contains an empty or non-string item id.");
        continue;
      }
      if (seenSeq.has(seqId)) {
        errors.push(`Duplicate item id "${seqId}" in ordering target sequence.`);
      }
      seenSeq.add(seqId);
      if (!itemIds.has(seqId)) {
        errors.push(
          `Ordering target sequence references unknown item id "${seqId}" not present in content.items.`,
        );
      }
    }

    for (const itemId of itemIds) {
      if (!seenSeq.has(itemId)) {
        errors.push(
          `Ordering target sequence is missing item id "${itemId}" declared in content.items.`,
        );
      }
    }
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Checks whether a candidate learner response is a valid permutation of all
 * item IDs in the activity (exact length, no duplicates, all IDs recognized).
 */
export function isValidOrderingPermutation(
  response: unknown,
  items: readonly { id: string }[],
): response is string[] {
  if (!Array.isArray(response) || response.length !== items.length) {
    return false;
  }
  if (items.length === 0) {
    return false;
  }
  const expectedIds = new Set(items.map((item) => item.id));
  if (expectedIds.size !== items.length) {
    return false;
  }
  const seen = new Set<string>();
  for (const entry of response) {
    if (typeof entry !== "string" || !expectedIds.has(entry) || seen.has(entry)) {
      return false;
    }
    seen.add(entry);
  }
  return seen.size === expectedIds.size;
}

/**
 * Produces a scrambled sequence of item IDs that is guaranteed NEVER to equal
 * the winning `correctSequence` (or the raw authored order when no sequence is
 * supplied) whenever 2+ distinct items exist.
 * Handles 0-item and 1-item lists safely without throwing.
 */
export function scrambleOrderingItems<T extends { id: string }>(
  items: readonly T[],
  correctSequence?: readonly string[],
  seedKey = "ordering",
): string[] {
  const rawIds = items.map((item) => item.id);
  if (rawIds.length <= 1) return [...rawIds];

  const distinctIds = new Set(rawIds);
  if (distinctIds.size <= 1) return [...rawIds];

  const targetWinningOrder =
    correctSequence && correctSequence.length === rawIds.length
      ? correctSequence
      : rawIds;

  // Try deterministic shuffle passes first
  for (let attempt = 0; attempt < 8; attempt++) {
    const candidate = shuffleOptionsDeterministic(
      rawIds,
      `${seedKey}:scramble:${attempt}`,
    );
    if (!arraysEqual(candidate, targetWinningOrder)) {
      return candidate;
    }
  }

  // Fallback guaranteed derangement: rotate the winning order by 1 position
  const rotated = [...targetWinningOrder.slice(1), targetWinningOrder[0]];
  if (!arraysEqual(rotated, targetWinningOrder)) {
    return rotated;
  }

  // Final safeguard: swap index 0 with the first distinct element
  const swapped = [...targetWinningOrder];
  const swapIdx = swapped.findIndex((id) => id !== swapped[0]);
  if (swapIdx > 0) {
    [swapped[0], swapped[swapIdx]] = [swapped[swapIdx], swapped[0]];
  }
  return swapped;
}

/**
 * Resolves the learner-facing ordering sequence for an activity attempt:
 * - Preserves `existingResponse` if it is already a valid permutation of `items`
 *   (so rerenders, session updates, or retries never wipe learner work).
 * - Otherwise initializes a deterministic derangement away from `correctSequence`.
 */
export function resolveInitialOrderingResponse<T extends { id: string }>(
  items: readonly T[],
  correctSequence?: readonly string[],
  seedKey = "ordering",
  existingResponse?: unknown,
): string[] {
  if (isValidOrderingPermutation(existingResponse, items)) {
    return existingResponse;
  }
  return scrambleOrderingItems(items, correctSequence, seedKey);
}
