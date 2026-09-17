import { defaultCategories } from "./defaultCategories";
import { FinanceDb } from "./db";
import { FinanceRepository } from "./FinanceRepository";
import {
  CategoryInUseError,
  Category,
  CreateCategoryInput,
  CreateTransactionInput,
  Transaction,
  TransactionFilter,
  UpdateCategoryInput,
  UpdateTransactionInput,
} from "../domain/types";

export class IndexedDbFinanceRepository implements FinanceRepository {
  private readonly seeded: Promise<void>;

  constructor(private readonly db: FinanceDb = new FinanceDb()) {
    this.seeded = this.ensureSeeded();
  }

  private async ensureSeeded(): Promise<void> {
    const count = await this.db.categories.count();
    if (count === 0) {
      await this.db.categories.bulkAdd(defaultCategories(new Date().toISOString()));
    }
  }

  async getTransactions(filter?: TransactionFilter): Promise<Transaction[]> {
    await this.seeded;
    let transactions = await this.db.transactions.toArray();

    if (filter?.month) {
      const month = filter.month;
      transactions = transactions.filter((t) => t.date.startsWith(month));
    }
    if (filter?.categoryId) {
      transactions = transactions.filter((t) => t.categoryId === filter.categoryId);
    }
    if (filter?.type) {
      transactions = transactions.filter((t) => t.type === filter.type);
    }

    return transactions.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt.localeCompare(a.createdAt)));
  }

  async getTransaction(id: string): Promise<Transaction | null> {
    await this.seeded;
    return (await this.db.transactions.get(id)) ?? null;
  }

  async addTransaction(input: CreateTransactionInput): Promise<Transaction> {
    await this.seeded;
    const now = new Date().toISOString();
    const transaction: Transaction = { ...input, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    await this.db.transactions.add(transaction);
    return transaction;
  }

  async updateTransaction(id: string, input: UpdateTransactionInput): Promise<Transaction> {
    await this.seeded;
    const existing = await this.db.transactions.get(id);
    if (!existing) throw new Error(`Transaction "${id}" not found`);

    const updated: Transaction = { ...existing, ...input, updatedAt: new Date().toISOString() };
    await this.db.transactions.put(updated);
    return updated;
  }

  async deleteTransaction(id: string): Promise<void> {
    await this.seeded;
    await this.db.transactions.delete(id);
  }

  async getCategories(): Promise<Category[]> {
    await this.seeded;
    return this.db.categories.toArray();
  }

  async addCategory(input: CreateCategoryInput): Promise<Category> {
    await this.seeded;
    const category: Category = {
      id: crypto.randomUUID(),
      type: input.type,
      labelKey: null,
      name: input.name,
      createdAt: new Date().toISOString(),
    };
    await this.db.categories.add(category);
    return category;
  }

  async updateCategory(id: string, input: UpdateCategoryInput): Promise<Category> {
    await this.seeded;
    const existing = await this.db.categories.get(id);
    if (!existing) throw new Error(`Category "${id}" not found`);
    // Default categories are translated via labelKey and aren't user-renamable;
    // the Categories screen only offers a rename control for custom ones, this
    // is just a defensive backstop against calling the repository directly.
    if (existing.labelKey !== null) throw new Error("Cannot rename a default category");

    const updated: Category = { ...existing, name: input.name };
    await this.db.categories.put(updated);
    return updated;
  }

  async deleteCategory(id: string): Promise<void> {
    await this.seeded;
    const referencingCount = await this.db.transactions.where("categoryId").equals(id).count();
    if (referencingCount > 0) throw new CategoryInUseError(id, referencingCount);
    await this.db.categories.delete(id);
  }

  async resetAll(): Promise<void> {
    await this.seeded;
    await this.db.transactions.clear();
    await this.db.categories.clear();
    await this.db.categories.bulkAdd(defaultCategories(new Date().toISOString()));
  }

  async restoreDefaultCategories(): Promise<void> {
    await this.seeded;
    const existingIds = new Set((await this.db.categories.toArray()).map((c) => c.id));
    const missing = defaultCategories(new Date().toISOString()).filter((c) => !existingIds.has(c.id));
    if (missing.length > 0) await this.db.categories.bulkAdd(missing);
  }

  async importTransactions(inputs: CreateTransactionInput[]): Promise<void> {
    await this.seeded;
    const now = new Date().toISOString();
    const transactions: Transaction[] = inputs.map((input) => ({
      ...input,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    }));
    await this.db.transactions.bulkAdd(transactions);
  }
}
