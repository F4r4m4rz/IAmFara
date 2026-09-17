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

  it("filters transactions by month, category, and type", async () => {
    const repo = createRepository();
    await repo.addTransaction({ type: "expense", amountMinor: 1000, date: "2026-09-01", categoryId: "groceries" });
    await repo.addTransaction({ type: "expense", amountMinor: 1000, date: "2026-10-01", categoryId: "groceries" });
    await repo.addTransaction({ type: "income", amountMinor: 500000, date: "2026-09-05", categoryId: "salary" });

    expect(await repo.getTransactions({ month: "2026-09" })).toHaveLength(2);
    expect(await repo.getTransactions({ categoryId: "salary" })).toHaveLength(1);
    expect(await repo.getTransactions({ type: "income" })).toHaveLength(1);
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
});
