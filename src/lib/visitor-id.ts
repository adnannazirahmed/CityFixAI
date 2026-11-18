// Anonymous per-browser contributor id, stored in localStorage as `cityfix_user_id`.
// Browser-only; storage access is guarded because it can throw (private mode, blocked storage).

const USER_ID_KEY = 'cityfix_user_id';

/** The stored visitor id, or null if none (or storage is unavailable). */
export function readVisitorId(): string | null {
  try {
    return window.localStorage.getItem(USER_ID_KEY);
  } catch {
    return null;
  }
}

/** The stored visitor id, creating and storing one if needed. */
export function getOrCreateVisitorId(): string {
  const existing = readVisitorId();
  if (existing) return existing;
  const id = `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  try {
    window.localStorage.setItem(USER_ID_KEY, id);
  } catch {
    // Storage unavailable: use the id for this submission only.
  }
  return id;
}
