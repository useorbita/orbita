import { generateKeyBetween } from "fractional-indexing";

/** First key in a new sequence. */
export function firstKey() {
  return generateKeyBetween(null, null);
}

/** Key between two existing keys (either may be null for start/end of list). */
export function keyBetween(a: string | null, b: string | null) {
  return generateKeyBetween(a, b);
}

/** Key before an existing key. */
export function keyBefore(a: string) {
  return generateKeyBetween(null, a);
}

/** Key after an existing key. Null means first key of the list. */
export function keyAfter(a: string | null) {
  return generateKeyBetween(a, null);
}

/**
 * Re-index all items in a list by generating fresh sequential orderKeys.
 * Used as a fallback when keys get out of order after many reorderings.
 */
export function rekeyList(itemIds: string[]) {
  let prevKey: string | null = null;
  const updates: { id: string; orderKey: string }[] = [];

  for (const id of itemIds) {
    const newKey: string = prevKey === null ? firstKey() : keyAfter(prevKey);
    updates.push({ id, orderKey: newKey });
    prevKey = newKey;
  }

  return updates;
}
