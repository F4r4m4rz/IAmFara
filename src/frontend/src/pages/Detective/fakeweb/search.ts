import { FakeSearchEntry, FakeSearchResult } from "./types";

const SEARCH_HOST = "search.local";

/** Builds the pseudo-URL used to represent "search.local searched for X". */
export function buildSearchUrl(query: string): string {
  return `${SEARCH_HOST}?q=${encodeURIComponent(query)}`;
}

/**
 * Extracts the query from a normalized address, or null if this isn't a
 * search.local address at all (vs. "" for search.local with no query yet).
 */
export function parseSearchQuery(normalizedUrl: string): string | null {
  if (normalizedUrl !== SEARCH_HOST && !normalizedUrl.startsWith(`${SEARCH_HOST}?`)) return null;
  const match = normalizedUrl.match(/\?q=(.*)$/);
  return match ? decodeURIComponent(match[1]) : "";
}

/**
 * Matches a player-typed query against search.local's index. A query
 * matches an entry if it contains any of that entry's keywords — deliberately
 * forgiving (substring, case-insensitive) so this reads as a real search
 * engine rather than a "guess the exact phrase" puzzle. Pure function, no
 * React/DOM, unit-testable on its own.
 */
export function searchFakeWeb(query: string, entries: FakeSearchEntry[]): FakeSearchResult[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];

  const results: FakeSearchResult[] = [];
  for (const entry of entries) {
    const matches = entry.keywords.some((keyword) => normalizedQuery.includes(keyword));
    if (matches) results.push(...entry.results);
  }
  return results;
}
