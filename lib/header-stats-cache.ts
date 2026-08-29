export interface HeaderStats {
  /** Owner of the cached values; a different id discards them. */
  userId: string | null;
  streak: number | null;
  level: number | null;
  isAdmin: boolean;
}

const EMPTY: HeaderStats = {
  userId: null,
  streak: null,
  level: null,
  isAdmin: false,
};

let cache: HeaderStats = EMPTY;

/**
 * Last known header values, held outside React so they survive the remount that every
 * navigation causes: `<Header />` is rendered per page rather than in a shared layout,
 * so its state restarted at null and the streak flashed a placeholder until the API
 * answered (#42).
 *
 * In-memory and per tab on purpose - a full reload starts empty and shows the dash,
 * which is honest, instead of resurrecting a number that may be stale.
 *
 * ponytail: a module variable, not a React context. A context needs a component that
 * outlives the navigation, and that is exactly what is missing here; adding a route
 * group for it is the larger refactoring tracked as option B in #42.
 */
export function readHeaderStats(): HeaderStats {
  return cache;
}

/**
 * Merges `patch` into the cache. A `userId` that differs from the cached one drops the
 * previous values first, so signing in as someone else never inherits their numbers.
 */
export function writeHeaderStats(userId: string, patch: Partial<Omit<HeaderStats, "userId">>): void {
  const base = cache.userId === userId ? cache : EMPTY;
  cache = { ...base, ...patch, userId };
}

/** Called on sign-out. */
export function clearHeaderStats(): void {
  cache = EMPTY;
}
