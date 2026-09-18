import {
  Category,
  CreateCategoryInput,
  CreateTransactionInput,
  FinanceSettings,
  Transaction,
  TransactionFilter,
  UpdateCategoryInput,
  UpdateTransactionInput,
} from "../domain/types";

/**
 * The one seam between the UI and however data is actually persisted. V1
 * has exactly one implementation (IndexedDbFinanceRepository, backed by
 * Dexie) — a future private "real mode" would add an ApiFinanceRepository
 * satisfying the same interface (plain fetch() to /api/finance/..., this
 * app's existing convention — see Contact/analytics) and provide it via
 * RepositoryContext for that route only. No component ever imports Dexie
 * or fetch directly; they only ever call these methods.
 */
export interface FinanceRepository {
  getTransactions(filter?: TransactionFilter): Promise<Transaction[]>;
  getTransaction(id: string): Promise<Transaction | null>;
  addTransaction(input: CreateTransactionInput): Promise<Transaction>;
  updateTransaction(id: string, input: UpdateTransactionInput): Promise<Transaction>;
  deleteTransaction(id: string): Promise<void>;

  getCategories(): Promise<Category[]>;
  addCategory(input: CreateCategoryInput): Promise<Category>;
  updateCategory(id: string, input: UpdateCategoryInput): Promise<Category>;
  /** Throws CategoryInUseError (see domain/types.ts) if any transaction still references it. */
  deleteCategory(id: string): Promise<void>;

  /** Demo-only utilities — a future ApiFinanceRepository is free to not implement these meaningfully. */
  resetAll(): Promise<void>;
  restoreDefaultCategories(): Promise<void>;
  /** Bulk-persists generated sample transactions (see domain/sampleData.ts). */
  importTransactions(inputs: CreateTransactionInput[]): Promise<void>;

  /** Currently just the financial-period start day — see domain/types.ts. Returns defaults if never set. */
  getSettings(): Promise<FinanceSettings>;
  updateSettings(input: Partial<FinanceSettings>): Promise<FinanceSettings>;
}
