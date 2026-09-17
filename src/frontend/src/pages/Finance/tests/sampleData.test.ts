import { describe, expect, it } from "vitest";
import { generateSampleTransactions } from "../domain/sampleData";

// A tiny deterministic LCG, same convention as the sliding-puzzle tests'
// seededRandom — keeps this test reproducible instead of flaky.
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

const VALID_CATEGORY_IDS = new Set([
  "salary",
  "rental-income",
  "groceries",
  "house",
  "car",
  "restaurant",
  "shopping",
  "child",
  "travel",
  "health",
  "entertainment",
]);

describe("generateSampleTransactions", () => {
  it("generates a non-trivial number of transactions", () => {
    const transactions = generateSampleTransactions(3, seededRandom(1));
    expect(transactions.length).toBeGreaterThan(10);
  });

  it("only uses default category ids", () => {
    const transactions = generateSampleTransactions(3, seededRandom(2));
    for (const t of transactions) {
      expect(VALID_CATEGORY_IDS.has(t.categoryId)).toBe(true);
    }
  });

  it("generates positive integer amounts", () => {
    const transactions = generateSampleTransactions(3, seededRandom(3));
    for (const t of transactions) {
      expect(Number.isInteger(t.amountMinor)).toBe(true);
      expect(t.amountMinor).toBeGreaterThan(0);
    }
  });

  it("generates dates as valid YYYY-MM-DD strings", () => {
    const transactions = generateSampleTransactions(3, seededRandom(4));
    for (const t of transactions) {
      expect(t.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("spans the requested number of months back, including the current month", () => {
    const transactions = generateSampleTransactions(3, seededRandom(5));
    const months = new Set(transactions.map((t) => t.date.slice(0, 7)));
    expect(months.size).toBeGreaterThanOrEqual(2); // at least some spread across months
  });

  it("never dates a current-month transaction in the future", () => {
    const transactions = generateSampleTransactions(3, seededRandom(6));
    const todayIso = new Date().toISOString().slice(0, 10);
    const currentMonth = todayIso.slice(0, 7);
    const currentMonthTransactions = transactions.filter((t) => t.date.startsWith(currentMonth));
    for (const t of currentMonthTransactions) {
      expect(t.date <= todayIso).toBe(true);
    }
  });

  it("always includes at least one salary transaction per month (minCount 1)", () => {
    const transactions = generateSampleTransactions(2, seededRandom(7));
    const salaryCount = transactions.filter((t) => t.categoryId === "salary").length;
    expect(salaryCount).toBe(3); // 3 months (0, 1, 2 back), one salary each
  });

  it("is deterministic for a given seed", () => {
    const a = generateSampleTransactions(3, seededRandom(42));
    const b = generateSampleTransactions(3, seededRandom(42));
    expect(a).toEqual(b);
  });
});
