import { describe, expect, it } from "vitest";
import { findPaidTransaction } from "../domain/fixedExpenses";
import { Transaction } from "../domain/types";

function makeTransaction(overrides: Partial<Transaction>): Transaction {
  return {
    id: crypto.randomUUID(),
    type: "expense",
    amountMinor: 1000,
    date: "2026-09-15",
    categoryId: "house",
    createdAt: "2026-09-15T10:00:00.000Z",
    updatedAt: "2026-09-15T10:00:00.000Z",
    ...overrides,
  };
}

describe("findPaidTransaction", () => {
  it("finds a transaction linked to the fixed expense within the date range", () => {
    const transactions = [
      makeTransaction({ fixedExpenseId: "electricity", date: "2026-09-20" }),
      makeTransaction({ fixedExpenseId: "internet", date: "2026-09-20" }),
    ];
    const found = findPaidTransaction(transactions, "electricity", "2026-09-01", "2026-09-30");
    expect(found?.fixedExpenseId).toBe("electricity");
  });

  it("returns undefined when no linked transaction exists in range", () => {
    const transactions = [makeTransaction({ fixedExpenseId: "electricity", date: "2026-08-20" })];
    expect(findPaidTransaction(transactions, "electricity", "2026-09-01", "2026-09-30")).toBeUndefined();
  });

  it("ignores transactions with no fixedExpenseId at all", () => {
    const transactions = [makeTransaction({ date: "2026-09-20" })];
    expect(findPaidTransaction(transactions, "electricity", "2026-09-01", "2026-09-30")).toBeUndefined();
  });

  it("ignores a linked transaction whose date falls outside the range", () => {
    const transactions = [makeTransaction({ fixedExpenseId: "electricity", date: "2026-10-01" })];
    expect(findPaidTransaction(transactions, "electricity", "2026-09-01", "2026-09-30")).toBeUndefined();
  });

  it("treats the range bounds as inclusive", () => {
    const transactions = [makeTransaction({ fixedExpenseId: "electricity", date: "2026-09-30" })];
    expect(findPaidTransaction(transactions, "electricity", "2026-09-01", "2026-09-30")).toBeDefined();
  });
});
