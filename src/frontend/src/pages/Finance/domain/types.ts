export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  type: TransactionType;
  /** Integer count of the smallest currency unit (øre for NOK) — never a float. See domain/money.ts. */
  amountMinor: number;
  /** "YYYY-MM-DD" — the user's intended local calendar date. No time component, no timezone. */
  date: string;
  categoryId: string;
  note?: string;
  /** ISO 8601 timestamp — bookkeeping metadata, not calendar-date semantics. */
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  /** Stable slug for a default category (e.g. "groceries"), a uuid for a custom one. */
  id: string;
  type: TransactionType;
  /** i18n key for a default category's label; null means custom (use `name` instead). */
  labelKey: string | null;
  /** User-entered literal name for a custom category; null for defaults. */
  name: string | null;
  createdAt: string;
}

export interface TransactionFilter {
  /** "YYYY-MM" */
  month?: string;
  categoryId?: string;
  type?: TransactionType;
}

export type CreateTransactionInput = Omit<Transaction, "id" | "createdAt" | "updatedAt">;
export type UpdateTransactionInput = Partial<Omit<Transaction, "id" | "createdAt" | "updatedAt">>;

export type CreateCategoryInput = Pick<Category, "type" | "name">;
export type UpdateCategoryInput = Pick<Category, "name">;

/** Thrown by deleteCategory when a transaction still references it — see the repository interface. */
export class CategoryInUseError extends Error {
  constructor(public readonly categoryId: string, public readonly transactionCount: number) {
    super(`Category "${categoryId}" is referenced by ${transactionCount} transaction(s)`);
    this.name = "CategoryInUseError";
  }
}
