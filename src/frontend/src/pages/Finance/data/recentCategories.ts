/**
 * Tracks recently-used category ids so the quick-add category grid can put
 * them first — a UI convenience preference, not financial application
 * data, so localStorage is the right tool here (same reasoning as the
 * existing locale preference in i18n/index.tsx), not IndexedDB.
 */
const STORAGE_KEY = "iamfara:finance:recentCategories";
const MAX_RECENT = 6;

export function getRecentCategoryIds(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function recordCategoryUsed(categoryId: string): void {
  try {
    const existing = getRecentCategoryIds().filter((id) => id !== categoryId);
    const updated = [categoryId, ...existing].slice(0, MAX_RECENT);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Losing the recency preference isn't worth failing the save over.
  }
}

/** Sorts categories by recency (most-recent-first), then leaves the rest in their given order. */
export function sortByRecency<T extends { id: string }>(categories: T[]): T[] {
  const recentIds = getRecentCategoryIds();
  const byId = new Map(categories.map((c) => [c.id, c]));
  const recent = recentIds.map((id) => byId.get(id)).filter((c): c is T => c !== undefined);
  const recentIdSet = new Set(recent.map((c) => c.id));
  const rest = categories.filter((c) => !recentIdSet.has(c.id));
  return [...recent, ...rest];
}
