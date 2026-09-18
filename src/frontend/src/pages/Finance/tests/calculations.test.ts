import { describe, expect, it } from "vitest";
import { categoryBreakdown, filterByCategory, filterByDateRange, filterByType, periodTotals } from "../domain/calculations";
import { Transaction } from "../domain/types";

function makeTransaction(overrides: Partial<Transaction>): Transaction {
  return {
    id: crypto.randomUUID(),
    type: "expense",
    amountMinor: 1000,
    date: "2026-09-15",
    categoryId: "groceries",
    createdAt: "2026-09-15T10:00:00.000Z",
    updatedAt: "2026-09-15T10:00:00.000Z",
    ...overrides,
  };
}

describe("filterByDateRange", () => {
  it("keeps only transactions within the inclusive range, including a range spanning two calendar months", () => {
    const transactions = [
      makeTransaction({ date: "2026-09-10" }),
      makeTransaction({ date: "2026-09-11" }),
      makeTransaction({ date: "2026-10-10" }),
      makeTransaction({ date: "2026-10-11" }),
    ];
    expect(filterByDateRange(transactions, "2026-09-11", "2026-10-10")).toHaveLength(2);
  });
});

describe("filterByCategory", () => {
  it("keeps only transactions in the given category", () => {
    const transactions = [
      makeTransaction({ categoryId: "groceries" }),
      makeTransaction({ categoryId: "car" }),
    ];
    expect(filterByCategory(transactions, "car")).toHaveLength(1);
  });
});

describe("filterByType", () => {
  it("keeps only transactions of the given type", () => {
    const transactions = [
      makeTransaction({ type: "income" }),
      makeTransaction({ type: "expense" }),
      makeTransaction({ type: "expense" }),
    ];
    expect(filterByType(transactions, "expense")).toHaveLength(2);
  });
});

describe("periodTotals", () => {
  it("sums income and expenses separately and computes remaining", () => {
    const transactions = [
      makeTransaction({ type: "income", amountMinor: 500000, date: "2026-09-01" }),
      makeTransaction({ type: "expense", amountMinor: 10000, date: "2026-09-05" }),
      makeTransaction({ type: "expense", amountMinor: 20000, date: "2026-09-10" }),
      makeTransaction({ type: "expense", amountMinor: 99999, date: "2026-10-01" }), // outside range, excluded
    ];

    const totals = periodTotals(transactions, "2026-09-01", "2026-09-30");
    expect(totals.incomeMinor).toBe(500000);
    expect(totals.expenseMinor).toBe(30000);
    expect(totals.remainingMinor).toBe(470000);
  });

  it("returns zeros for a range with no transactions", () => {
    const totals = periodTotals([], "2026-09-01", "2026-09-30");
    expect(totals).toEqual({ incomeMinor: 0, expenseMinor: 0, remainingMinor: 0 });
  });

  it("allows remaining to go negative when expenses exceed income", () => {
    const transactions = [
      makeTransaction({ type: "income", amountMinor: 1000, date: "2026-09-01" }),
      makeTransaction({ type: "expense", amountMinor: 5000, date: "2026-09-02" }),
    ];
    expect(periodTotals(transactions, "2026-09-01", "2026-09-30").remainingMinor).toBe(-4000);
  });

  it("supports a range spanning two calendar months, as a financial period would", () => {
    const transactions = [
      makeTransaction({ type: "income", amountMinor: 500000, date: "2026-09-11" }),
      makeTransaction({ type: "expense", amountMinor: 10000, date: "2026-10-10" }),
      makeTransaction({ type: "expense", amountMinor: 99999, date: "2026-10-11" }), // outside range, excluded
    ];
    const totals = periodTotals(transactions, "2026-09-11", "2026-10-10");
    expect(totals.incomeMinor).toBe(500000);
    expect(totals.expenseMinor).toBe(10000);
  });
});

describe("categoryBreakdown", () => {
  it("sums expenses per category within the range, sorted largest first", () => {
    const transactions = [
      makeTransaction({ categoryId: "groceries", amountMinor: 5000, date: "2026-09-01" }),
      makeTransaction({ categoryId: "groceries", amountMinor: 3000, date: "2026-09-02" }),
      makeTransaction({ categoryId: "car", amountMinor: 20000, date: "2026-09-03" }),
      makeTransaction({ categoryId: "car", amountMinor: 1000, date: "2026-10-01" }), // outside range
    ];

    const breakdown = categoryBreakdown(transactions, "2026-09-01", "2026-09-30");
    expect(breakdown).toEqual([
      { categoryId: "car", totalMinor: 20000 },
      { categoryId: "groceries", totalMinor: 8000 },
    ]);
  });

  it("excludes income transactions", () => {
    const transactions = [
      makeTransaction({ type: "income", categoryId: "salary", amountMinor: 500000, date: "2026-09-01" }),
      makeTransaction({ type: "expense", categoryId: "groceries", amountMinor: 5000, date: "2026-09-02" }),
    ];
    expect(categoryBreakdown(transactions, "2026-09-01", "2026-09-30")).toEqual([
      { categoryId: "groceries", totalMinor: 5000 },
    ]);
  });

  it("returns an empty array for a range with no expenses", () => {
    expect(categoryBreakdown([], "2026-09-01", "2026-09-30")).toEqual([]);
  });
});
