import { describe, expect, it } from "vitest";
import { categoryBreakdown, filterByCategory, filterByMonth, filterByType, monthlyTotals } from "../domain/calculations";
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

describe("filterByMonth", () => {
  it("keeps only transactions in the given month", () => {
    const transactions = [
      makeTransaction({ date: "2026-09-01" }),
      makeTransaction({ date: "2026-09-30" }),
      makeTransaction({ date: "2026-10-01" }),
      makeTransaction({ date: "2026-08-31" }),
    ];
    expect(filterByMonth(transactions, "2026-09")).toHaveLength(2);
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

describe("monthlyTotals", () => {
  it("sums income and expenses separately and computes remaining", () => {
    const transactions = [
      makeTransaction({ type: "income", amountMinor: 500000, date: "2026-09-01" }),
      makeTransaction({ type: "expense", amountMinor: 10000, date: "2026-09-05" }),
      makeTransaction({ type: "expense", amountMinor: 20000, date: "2026-09-10" }),
      makeTransaction({ type: "expense", amountMinor: 99999, date: "2026-10-01" }), // different month, excluded
    ];

    const totals = monthlyTotals(transactions, "2026-09");
    expect(totals.incomeMinor).toBe(500000);
    expect(totals.expenseMinor).toBe(30000);
    expect(totals.remainingMinor).toBe(470000);
  });

  it("returns zeros for a month with no transactions", () => {
    const totals = monthlyTotals([], "2026-09");
    expect(totals).toEqual({ incomeMinor: 0, expenseMinor: 0, remainingMinor: 0 });
  });

  it("allows remaining to go negative when expenses exceed income", () => {
    const transactions = [
      makeTransaction({ type: "income", amountMinor: 1000, date: "2026-09-01" }),
      makeTransaction({ type: "expense", amountMinor: 5000, date: "2026-09-02" }),
    ];
    expect(monthlyTotals(transactions, "2026-09").remainingMinor).toBe(-4000);
  });
});

describe("categoryBreakdown", () => {
  it("sums expenses per category for the given month, sorted largest first", () => {
    const transactions = [
      makeTransaction({ categoryId: "groceries", amountMinor: 5000, date: "2026-09-01" }),
      makeTransaction({ categoryId: "groceries", amountMinor: 3000, date: "2026-09-02" }),
      makeTransaction({ categoryId: "car", amountMinor: 20000, date: "2026-09-03" }),
      makeTransaction({ categoryId: "car", amountMinor: 1000, date: "2026-10-01" }), // different month
    ];

    const breakdown = categoryBreakdown(transactions, "2026-09");
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
    expect(categoryBreakdown(transactions, "2026-09")).toEqual([{ categoryId: "groceries", totalMinor: 5000 }]);
  });

  it("returns an empty array for a month with no expenses", () => {
    expect(categoryBreakdown([], "2026-09")).toEqual([]);
  });
});
