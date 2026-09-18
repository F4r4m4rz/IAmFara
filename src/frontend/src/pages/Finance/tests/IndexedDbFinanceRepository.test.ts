import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { FinanceDb } from "../data/db";
import { IndexedDbFinanceRepository } from "../data/IndexedDbFinanceRepository";
import { CategoryInUseError } from "../domain/types";

// A fresh, uniquely-named in-memory DB per test avoids state bleeding
// between tests (fake-indexeddb persists for the process lifetime otherwise).
function createRepository(): IndexedDbFinanceRepository {
  return new IndexedDbFinanceRepository(new FinanceDb(`test-${crypto.randomUUID()}`));
}

describe("IndexedDbFinanceRepository — categories", () => {
  it("seeds the default categories on first access", async () => {
    const repo = createRepository();
    const categories = await repo.getCategories();
    expect(categories.length).toBeGreaterThan(0);
    expect(categories.some((c) => c.id === "groceries")).toBe(true);
    expect(categories.some((c) => c.id === "salary")).toBe(true);
  });

  it("does not re-seed on a second access", async () => {
    const repo = createRepository();
    const first = await repo.getCategories();
    const second = await repo.getCategories();
    expect(second.length).toBe(first.length);
  });

  it("adds a custom category", async () => {
    const repo = createRepository();
    const category = await repo.addCategory({ type: "expense", name: "Custom Stuff" });
    expect(category.labelKey).toBeNull();
    expect(category.name).toBe("Custom Stuff");

    const categories = await repo.getCategories();
    expect(categories.find((c) => c.id === category.id)).toBeDefined();
  });

  it("renames a custom category", async () => {
    const repo = createRepository();
    const category = await repo.addCategory({ type: "expense", name: "Old Name" });
    const updated = await repo.updateCategory(category.id, { name: "New Name" });
    expect(updated.name).toBe("New Name");
  });

  it("refuses to rename a default category", async () => {
    const repo = createRepository();
    await expect(repo.updateCategory("groceries", { name: "Hacked" })).rejects.toThrow();
  });

  it("deletes an unreferenced category", async () => {
    const repo = createRepository();
    const category = await repo.addCategory({ type: "expense", name: "Unused" });
    await repo.deleteCategory(category.id);
    const categories = await repo.getCategories();
    expect(categories.find((c) => c.id === category.id)).toBeUndefined();
  });

  it("refuses to delete a category referenced by a transaction", async () => {
    const repo = createRepository();
    await repo.addTransaction({
      type: "expense",
      amountMinor: 1000,
      date: "2026-09-17",
      categoryId: "groceries",
    });

    await expect(repo.deleteCategory("groceries")).rejects.toBeInstanceOf(CategoryInUseError);

    // The category must still exist — the delete must not have partially applied.
    const categories = await repo.getCategories();
    expect(categories.find((c) => c.id === "groceries")).toBeDefined();
  });
});

describe("IndexedDbFinanceRepository — transactions", () => {
  it("adds and retrieves a transaction", async () => {
    const repo = createRepository();
    const created = await repo.addTransaction({
      type: "expense",
      amountMinor: 12950,
      date: "2026-09-17",
      categoryId: "groceries",
      note: "Weekly shop",
    });

    expect(created.id).toBeTruthy();
    expect(created.createdAt).toBeTruthy();

    const fetched = await repo.getTransaction(created.id);
    expect(fetched).toEqual(created);
  });

  it("returns null for a transaction that doesn't exist", async () => {
    const repo = createRepository();
    expect(await repo.getTransaction("nonexistent")).toBeNull();
  });

  it("updates a transaction and bumps updatedAt", async () => {
    const repo = createRepository();
    const created = await repo.addTransaction({
      type: "expense",
      amountMinor: 1000,
      date: "2026-09-17",
      categoryId: "groceries",
    });

    await new Promise((resolve) => setTimeout(resolve, 2));
    const updated = await repo.updateTransaction(created.id, { amountMinor: 2000 });

    expect(updated.amountMinor).toBe(2000);
    expect(updated.createdAt).toBe(created.createdAt);
    expect(new Date(updated.updatedAt).getTime()).toBeGreaterThan(new Date(created.updatedAt).getTime());
  });

  it("deletes a transaction", async () => {
    const repo = createRepository();
    const created = await repo.addTransaction({
      type: "expense",
      amountMinor: 1000,
      date: "2026-09-17",
      categoryId: "groceries",
    });
    await repo.deleteTransaction(created.id);
    expect(await repo.getTransaction(created.id)).toBeNull();
  });

  it("filters transactions by date range, category, and type", async () => {
    const repo = createRepository();
    await repo.addTransaction({ type: "expense", amountMinor: 1000, date: "2026-09-01", categoryId: "groceries" });
    await repo.addTransaction({ type: "expense", amountMinor: 1000, date: "2026-10-01", categoryId: "groceries" });
    await repo.addTransaction({ type: "income", amountMinor: 500000, date: "2026-09-05", categoryId: "salary" });

    expect(await repo.getTransactions({ fromDate: "2026-09-01", toDate: "2026-09-30" })).toHaveLength(2);
    expect(await repo.getTransactions({ categoryId: "salary" })).toHaveLength(1);
    expect(await repo.getTransactions({ type: "income" })).toHaveLength(1);
  });

  it("filters transactions by a date range spanning two calendar months", async () => {
    const repo = createRepository();
    await repo.addTransaction({ type: "expense", amountMinor: 1000, date: "2026-09-10", categoryId: "groceries" });
    await repo.addTransaction({ type: "expense", amountMinor: 1000, date: "2026-09-11", categoryId: "groceries" });
    await repo.addTransaction({ type: "expense", amountMinor: 1000, date: "2026-10-10", categoryId: "groceries" });
    await repo.addTransaction({ type: "expense", amountMinor: 1000, date: "2026-10-11", categoryId: "groceries" });

    expect(await repo.getTransactions({ fromDate: "2026-09-11", toDate: "2026-10-10" })).toHaveLength(2);
  });
});

describe("IndexedDbFinanceRepository — settings", () => {
  it("returns a default financialPeriodStartDay of 1 when never set", async () => {
    const repo = createRepository();
    expect(await repo.getSettings()).toEqual({ financialPeriodStartDay: 1 });
  });

  it("persists an updated setting and returns it from subsequent reads", async () => {
    const repo = createRepository();
    const updated = await repo.updateSettings({ financialPeriodStartDay: 11 });
    expect(updated).toEqual({ financialPeriodStartDay: 11 });
    expect(await repo.getSettings()).toEqual({ financialPeriodStartDay: 11 });
  });
});

describe("IndexedDbFinanceRepository — demo utilities", () => {
  it("resetAll clears transactions and restores default categories only", async () => {
    const repo = createRepository();
    await repo.addTransaction({ type: "expense", amountMinor: 1000, date: "2026-09-17", categoryId: "groceries" });
    await repo.addCategory({ type: "expense", name: "Custom" });

    await repo.resetAll();

    expect(await repo.getTransactions()).toHaveLength(0);
    const categories = await repo.getCategories();
    expect(categories.some((c) => c.name === "Custom")).toBe(false);
    expect(categories.some((c) => c.id === "groceries")).toBe(true);
  });

  it("restoreDefaultCategories backfills a deleted default without touching custom categories", async () => {
    const repo = createRepository();
    await repo.addCategory({ type: "expense", name: "Custom" });
    await repo.deleteCategory("groceries");

    await repo.restoreDefaultCategories();

    const categories = await repo.getCategories();
    expect(categories.some((c) => c.id === "groceries")).toBe(true);
    expect(categories.some((c) => c.name === "Custom")).toBe(true);
  });

  it("importTransactions bulk-persists generated transactions with fresh ids/timestamps", async () => {
    const repo = createRepository();
    await repo.importTransactions([
      { type: "expense", amountMinor: 1000, date: "2026-09-01", categoryId: "groceries" },
      { type: "income", amountMinor: 4000000, date: "2026-09-01", categoryId: "salary" },
    ]);

    const transactions = await repo.getTransactions();
    expect(transactions).toHaveLength(2);
    expect(new Set(transactions.map((t) => t.id)).size).toBe(2); // ids are unique
    expect(transactions.every((t) => t.createdAt && t.updatedAt)).toBe(true);
  });

  it("importTransactions adds to, rather than replaces, existing transactions", async () => {
    const repo = createRepository();
    await repo.addTransaction({ type: "expense", amountMinor: 500, date: "2026-09-01", categoryId: "groceries" });
    await repo.importTransactions([
      { type: "expense", amountMinor: 1000, date: "2026-09-02", categoryId: "groceries" },
    ]);

    expect(await repo.getTransactions()).toHaveLength(2);
  });

  it("resetAll also clears fixed expenses and period overrides", async () => {
    const repo = createRepository();
    const expense = await repo.addFixedExpense({ name: "Internet", categoryId: "house", defaultAmountMinor: 50000 });
    await repo.setPeriodOverride(expense.id, "2026-09", 60000);

    await repo.resetAll();

    expect(await repo.getFixedExpenses()).toHaveLength(0);
    expect(await repo.getPeriodOverrides("2026-09")).toHaveLength(0);
  });
});

describe("IndexedDbFinanceRepository — fixed expenses", () => {
  it("adds a fixed expense, active by default", async () => {
    const repo = createRepository();
    const expense = await repo.addFixedExpense({ name: "Electricity", categoryId: "house", defaultAmountMinor: 80000, dueDay: 15 });
    expect(expense.isActive).toBe(true);
    expect(expense.dueDay).toBe(15);

    const all = await repo.getFixedExpenses();
    expect(all.find((f) => f.id === expense.id)).toBeDefined();
  });

  it("updates a fixed expense and bumps updatedAt", async () => {
    const repo = createRepository();
    const expense = await repo.addFixedExpense({ name: "Electricity", categoryId: "house", defaultAmountMinor: 80000 });
    await new Promise((resolve) => setTimeout(resolve, 2));
    const updated = await repo.updateFixedExpense(expense.id, { defaultAmountMinor: 90000 });

    expect(updated.defaultAmountMinor).toBe(90000);
    expect(updated.name).toBe("Electricity");
    expect(new Date(updated.updatedAt).getTime()).toBeGreaterThan(new Date(expense.updatedAt).getTime());
  });

  it("archiving excludes a fixed expense from getFixedExpenses by default, but keeps it retrievable with includeInactive", async () => {
    const repo = createRepository();
    const expense = await repo.addFixedExpense({ name: "Old Subscription", categoryId: "entertainment", defaultAmountMinor: 10000 });
    await repo.archiveFixedExpense(expense.id);

    expect(await repo.getFixedExpenses()).toHaveLength(0);
    const withInactive = await repo.getFixedExpenses(true);
    expect(withInactive.find((f) => f.id === expense.id)?.isActive).toBe(false);
  });

  it("restoreFixedExpense reactivates an archived expense", async () => {
    const repo = createRepository();
    const expense = await repo.addFixedExpense({ name: "Gym", categoryId: "health", defaultAmountMinor: 5000 });
    await repo.archiveFixedExpense(expense.id);
    await repo.restoreFixedExpense(expense.id);

    expect((await repo.getFixedExpenses()).find((f) => f.id === expense.id)).toBeDefined();
  });
});

describe("IndexedDbFinanceRepository — period overrides", () => {
  it("sets and retrieves a period override", async () => {
    const repo = createRepository();
    const expense = await repo.addFixedExpense({ name: "Electricity", categoryId: "house", defaultAmountMinor: 80000 });
    await repo.setPeriodOverride(expense.id, "2026-09", 95000);

    const overrides = await repo.getPeriodOverrides("2026-09");
    expect(overrides).toEqual([{ fixedExpenseId: expense.id, periodId: "2026-09", amountMinor: 95000 }]);
  });

  it("setPeriodOverride replaces rather than duplicates an existing override for the same expense+period", async () => {
    const repo = createRepository();
    const expense = await repo.addFixedExpense({ name: "Electricity", categoryId: "house", defaultAmountMinor: 80000 });
    await repo.setPeriodOverride(expense.id, "2026-09", 95000);
    await repo.setPeriodOverride(expense.id, "2026-09", 99000);

    const overrides = await repo.getPeriodOverrides("2026-09");
    expect(overrides).toHaveLength(1);
    expect(overrides[0].amountMinor).toBe(99000);
  });

  it("clearPeriodOverride removes it", async () => {
    const repo = createRepository();
    const expense = await repo.addFixedExpense({ name: "Electricity", categoryId: "house", defaultAmountMinor: 80000 });
    await repo.setPeriodOverride(expense.id, "2026-09", 95000);
    await repo.clearPeriodOverride(expense.id, "2026-09");

    expect(await repo.getPeriodOverrides("2026-09")).toHaveLength(0);
  });
});

describe("IndexedDbFinanceRepository — mark fixed expense paid/unpaid", () => {
  const PERIOD = { fromDate: "2026-09-01", toDate: "2026-09-30" };

  it("creates a real expense transaction linked to the fixed expense", async () => {
    const repo = createRepository();
    const expense = await repo.addFixedExpense({ name: "Electricity", categoryId: "house", defaultAmountMinor: 80000 });

    const transaction = await repo.markFixedExpensePaid(expense.id, PERIOD, 82000, "2026-09-15");

    expect(transaction.type).toBe("expense");
    expect(transaction.amountMinor).toBe(82000);
    expect(transaction.categoryId).toBe("house");
    expect(transaction.fixedExpenseId).toBe(expense.id);

    const transactions = await repo.getTransactions();
    expect(transactions.find((t) => t.id === transaction.id)).toBeDefined();
  });

  it("is idempotent — a second call for the same period returns the existing transaction instead of duplicating it", async () => {
    const repo = createRepository();
    const expense = await repo.addFixedExpense({ name: "Electricity", categoryId: "house", defaultAmountMinor: 80000 });

    const first = await repo.markFixedExpensePaid(expense.id, PERIOD, 82000, "2026-09-15");
    const second = await repo.markFixedExpensePaid(expense.id, PERIOD, 99999, "2026-09-16");

    expect(second.id).toBe(first.id);
    expect(await repo.getTransactions()).toHaveLength(1);
  });

  it("markFixedExpenseUnpaid deletes the linked transaction, allowing a fresh mark-as-paid afterward", async () => {
    const repo = createRepository();
    const expense = await repo.addFixedExpense({ name: "Electricity", categoryId: "house", defaultAmountMinor: 80000 });
    await repo.markFixedExpensePaid(expense.id, PERIOD, 82000, "2026-09-15");

    await repo.markFixedExpenseUnpaid(expense.id, PERIOD);
    expect(await repo.getTransactions()).toHaveLength(0);

    const repaid = await repo.markFixedExpensePaid(expense.id, PERIOD, 85000, "2026-09-16");
    expect(repaid.amountMinor).toBe(85000);
    expect(await repo.getTransactions()).toHaveLength(1);
  });

  it("markFixedExpenseUnpaid is a no-op when nothing is paid for that period", async () => {
    const repo = createRepository();
    const expense = await repo.addFixedExpense({ name: "Electricity", categoryId: "house", defaultAmountMinor: 80000 });
    await expect(repo.markFixedExpenseUnpaid(expense.id, PERIOD)).resolves.toBeUndefined();
  });

  it("does not treat a payment in a different period as paid for this one", async () => {
    const repo = createRepository();
    const expense = await repo.addFixedExpense({ name: "Electricity", categoryId: "house", defaultAmountMinor: 80000 });
    await repo.markFixedExpensePaid(expense.id, { fromDate: "2026-08-01", toDate: "2026-08-31" }, 80000, "2026-08-15");

    const secondPeriodResult = await repo.markFixedExpensePaid(expense.id, PERIOD, 82000, "2026-09-15");
    expect(secondPeriodResult.date).toBe("2026-09-15");
    expect(await repo.getTransactions()).toHaveLength(2);
  });
});
