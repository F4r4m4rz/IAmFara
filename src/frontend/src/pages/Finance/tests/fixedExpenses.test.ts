import { describe, expect, it } from "vitest";
import { findPaidTransaction, fixedExpensesForPeriod, forecastSummary } from "../domain/fixedExpenses";
import { FixedMonthlyExpense, Transaction } from "../domain/types";

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

function makeFixedExpense(overrides: Partial<FixedMonthlyExpense>): FixedMonthlyExpense {
  return {
    id: crypto.randomUUID(),
    name: "Electricity",
    categoryId: "house",
    defaultAmountMinor: 80000,
    isActive: true,
    createdAt: "2026-09-01T10:00:00.000Z",
    updatedAt: "2026-09-01T10:00:00.000Z",
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

describe("fixedExpensesForPeriod", () => {
  it("uses the default amount and marks upcoming when nothing is paid or overridden", () => {
    const expense = makeFixedExpense({ defaultAmountMinor: 80000 });
    const statuses = fixedExpensesForPeriod([expense], [], [], "2026-09-01", "2026-09-30");
    expect(statuses).toEqual([
      { fixedExpense: expense, expectedAmountMinor: 80000, isPaid: false, paidTransaction: undefined },
    ]);
  });

  it("uses the period override amount when one exists", () => {
    const expense = makeFixedExpense({ defaultAmountMinor: 80000 });
    const statuses = fixedExpensesForPeriod(
      [expense],
      [{ fixedExpenseId: expense.id, periodId: "2026-09", amountMinor: 95000 }],
      [],
      "2026-09-01",
      "2026-09-30",
    );
    expect(statuses[0].expectedAmountMinor).toBe(95000);
  });

  it("marks paid when a linked transaction exists in range and surfaces it", () => {
    const expense = makeFixedExpense({});
    const transaction = makeTransaction({ fixedExpenseId: expense.id, date: "2026-09-10" });
    const statuses = fixedExpensesForPeriod([expense], [], [transaction], "2026-09-01", "2026-09-30");
    expect(statuses[0].isPaid).toBe(true);
    expect(statuses[0].paidTransaction).toEqual(transaction);
  });
});

describe("forecastSummary", () => {
  it("computes actual vs forecast figures without double-counting a paid fixed expense", () => {
    const paidExpense = makeFixedExpense({ name: "Electricity", defaultAmountMinor: 80000 });
    const upcomingExpense = makeFixedExpense({ name: "Internet", defaultAmountMinor: 50000 });
    const paidTransaction = makeTransaction({
      fixedExpenseId: paidExpense.id,
      type: "expense",
      amountMinor: 82000, // actual paid amount can differ slightly from the expected default
      date: "2026-09-10",
    });
    const income = makeTransaction({ type: "income", amountMinor: 500000, date: "2026-09-01", categoryId: "salary" });
    const transactions = [income, paidTransaction];

    const statuses = fixedExpensesForPeriod(
      [paidExpense, upcomingExpense],
      [],
      transactions,
      "2026-09-01",
      "2026-09-30",
    );
    const forecast = forecastSummary(transactions, statuses, "2026-09-01", "2026-09-30");

    expect(forecast.incomeMinor).toBe(500000);
    expect(forecast.paidExpenseMinor).toBe(82000); // the real transaction amount, not the expected default
    expect(forecast.upcomingFixedMinor).toBe(50000); // only the unpaid one
    expect(forecast.currentBalanceMinor).toBe(500000 - 82000);
    expect(forecast.expectedRemainingMinor).toBe(500000 - 82000 - 50000);
  });

  it("returns zeros/equal balances when there are no transactions or fixed expenses", () => {
    const forecast = forecastSummary([], [], "2026-09-01", "2026-09-30");
    expect(forecast).toEqual({
      incomeMinor: 0,
      paidExpenseMinor: 0,
      upcomingFixedMinor: 0,
      currentBalanceMinor: 0,
      expectedRemainingMinor: 0,
    });
  });
});
