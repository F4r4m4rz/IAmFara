import {
  Category,
  CreateCategoryInput,
  CreateFixedExpenseInput,
  CreateTransactionInput,
  DateRange,
  FinanceSettings,
  FixedExpensePeriodOverride,
  FixedMonthlyExpense,
  Transaction,
  TransactionFilter,
  UpdateCategoryInput,
  UpdateFixedExpenseInput,
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

  /** Active (isActive) fixed expenses only, unless includeInactive — archived ones are never hard-deleted. */
  getFixedExpenses(includeInactive?: boolean): Promise<FixedMonthlyExpense[]>;
  addFixedExpense(input: CreateFixedExpenseInput): Promise<FixedMonthlyExpense>;
  updateFixedExpense(id: string, input: UpdateFixedExpenseInput): Promise<FixedMonthlyExpense>;
  archiveFixedExpense(id: string): Promise<void>;
  restoreFixedExpense(id: string): Promise<void>;

  getPeriodOverrides(periodId: string): Promise<FixedExpensePeriodOverride[]>;
  setPeriodOverride(fixedExpenseId: string, periodId: string, amountMinor: number): Promise<void>;
  clearPeriodOverride(fixedExpenseId: string, periodId: string): Promise<void>;

  /**
   * Creates the real Expense transaction for a fixed expense's payment in
   * the given period (linked via Transaction.fixedExpenseId) — idempotent:
   * calling this again for a period that already has a linked transaction
   * returns the existing one instead of creating a duplicate. `period` is
   * the target period's own date range (see domain/financialPeriod.ts's
   * periodDateRange), not an opaque period id — the repository has no
   * other way to know which transactions fall within it.
   */
  markFixedExpensePaid(fixedExpenseId: string, period: DateRange, amountMinor: number, date: string): Promise<Transaction>;
  /** Finds and deletes the transaction linked to this fixed expense within `period`, if any — the entire "undo" mechanism, see Transaction.fixedExpenseId. */
  markFixedExpenseUnpaid(fixedExpenseId: string, period: DateRange): Promise<void>;
}
