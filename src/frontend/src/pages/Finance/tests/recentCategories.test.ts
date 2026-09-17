import { beforeEach, describe, expect, it } from "vitest";

// Vitest's configured test environment is "node" (see vite.config.ts) — no
// window/localStorage exists there, unlike a real browser. This minimal
// polyfill is test-only setup, not a change to how the module behaves in
// the browser, where window.localStorage is always real.
const store = new Map<string, string>();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).window = {
  localStorage: {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
    clear: () => store.clear(),
  },
};

import { getRecentCategoryIds, recordCategoryUsed, sortByRecency } from "../data/recentCategories";

beforeEach(() => {
  window.localStorage.clear();
});

describe("recordCategoryUsed / getRecentCategoryIds", () => {
  it("starts empty", () => {
    expect(getRecentCategoryIds()).toEqual([]);
  });

  it("records a used category as most recent", () => {
    recordCategoryUsed("groceries");
    expect(getRecentCategoryIds()).toEqual(["groceries"]);
  });

  it("moves a re-used category back to the front instead of duplicating it", () => {
    recordCategoryUsed("groceries");
    recordCategoryUsed("car");
    recordCategoryUsed("groceries");
    expect(getRecentCategoryIds()).toEqual(["groceries", "car"]);
  });

  it("caps the recent list at 6 entries", () => {
    for (const id of ["a", "b", "c", "d", "e", "f", "g"]) recordCategoryUsed(id);
    const recent = getRecentCategoryIds();
    expect(recent).toHaveLength(6);
    expect(recent[0]).toBe("g");
    expect(recent).not.toContain("a"); // oldest, evicted
  });
});

describe("sortByRecency", () => {
  const categories = [
    { id: "groceries", label: "Groceries" },
    { id: "car", label: "Car" },
    { id: "house", label: "House" },
  ];

  it("puts recently-used categories first, most-recent first", () => {
    recordCategoryUsed("house");
    recordCategoryUsed("groceries");
    const sorted = sortByRecency(categories);
    expect(sorted.map((c) => c.id)).toEqual(["groceries", "house", "car"]);
  });

  it("leaves order unchanged when nothing has been used yet", () => {
    expect(sortByRecency(categories).map((c) => c.id)).toEqual(["groceries", "car", "house"]);
  });

  it("ignores a recent id that isn't in the given category list", () => {
    recordCategoryUsed("nonexistent-category");
    expect(sortByRecency(categories).map((c) => c.id)).toEqual(["groceries", "car", "house"]);
  });
});
