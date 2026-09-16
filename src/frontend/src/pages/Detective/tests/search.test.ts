import { describe, expect, it } from "vitest";
import { buildSearchUrl, parseSearchQuery, searchFakeWeb } from "../fakeweb/search";
import { FakeSearchEntry } from "../fakeweb/types";

const ENTRIES: FakeSearchEntry[] = [
  {
    keywords: ["northstar", "archive 2003"],
    results: [{ title: "Northstar Archive", url: "northstar.net", snippet: "..." }],
  },
  {
    keywords: ["archive"],
    results: [
      { title: "Northstar Archive", url: "northstar.net", snippet: "..." },
      { title: "CloudVault", url: "cloudvault.local", snippet: "..." },
    ],
  },
];

describe("searchFakeWeb", () => {
  it("matches a query containing an entry's keyword", () => {
    const results = searchFakeWeb("northstar", ENTRIES);
    expect(results.map((r) => r.url)).toContain("northstar.net");
  });

  it("is case-insensitive and trims whitespace", () => {
    const results = searchFakeWeb("  NORTHSTAR  ", ENTRIES);
    expect(results.length).toBeGreaterThan(0);
  });

  it("matches on a multi-word keyword phrase as a substring", () => {
    const results = searchFakeWeb("looking for archive 2003 photos", ENTRIES);
    expect(results.map((r) => r.url)).toContain("northstar.net");
  });

  it("accumulates results from every matching entry", () => {
    // "archive" alone matches the second entry only ("northstar" isn't in the query)
    const results = searchFakeWeb("archive", ENTRIES);
    expect(results.map((r) => r.url)).toEqual(["northstar.net", "cloudvault.local"]);
  });

  it("returns an empty array for an empty query", () => {
    expect(searchFakeWeb("   ", ENTRIES)).toEqual([]);
  });

  it("returns an empty array when nothing matches", () => {
    expect(searchFakeWeb("completely unrelated term", ENTRIES)).toEqual([]);
  });
});

describe("buildSearchUrl / parseSearchQuery round-trip", () => {
  it("round-trips a simple query", () => {
    expect(parseSearchQuery(buildSearchUrl("northstar"))).toBe("northstar");
  });

  it("round-trips a query with spaces and special characters", () => {
    const query = "archive 2003 & photos?";
    expect(parseSearchQuery(buildSearchUrl(query))).toBe(query);
  });

  it("treats bare search.local (no query yet) as an empty query, not null", () => {
    expect(parseSearchQuery("search.local")).toBe("");
  });

  it("returns null for a non-search.local address", () => {
    expect(parseSearchQuery("northstar.net")).toBeNull();
  });
});
