import { apiFetch } from "../auth/authClient";
import {
  Category,
  CategoryInUseError,
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
import { FinanceRepository } from "./FinanceRepository";

/**
 * Real-mode implementation of FinanceRepository, backed by the Phase 7
 * Finance HTTP API (/api/households/{householdId}/...) — see
 * IAmFara.Web/Contracts/FinanceModels.cs on the backend, whose DTOs mirror
 * this file's domain/types.ts field-for-field, so most of this is a plain
 * passthrough. Scoped to a single household for its whole lifetime; a
 * household switch means constructing a new instance.
 */
export class ApiFinanceRepository implements FinanceRepository {
  constructor(private readonly householdId: string) {}

  private url(path: string): string {
    return `/api/households/${this.householdId}${path}`;
  }

  private async json<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await apiFetch(this.url(path), init);
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error((body as { error?: string } | null)?.error ?? `Request to ${path} failed (${response.status}).`);
    }
    return response.json() as Promise<T>;
  }

  async getTransactions(filter?: TransactionFilter): Promise<Transaction[]> {
    const params = new URLSearchParams();
    if (filter?.fromDate) params.set("fromDate", filter.fromDate);
    if (filter?.toDate) params.set("toDate", filter.toDate);
    if (filter?.categoryId) params.set("categoryId", filter.categoryId);
    if (filter?.type) params.set("type", filter.type);
    const query = params.size > 0 ? `?${params.toString()}` : "";
    return this.json(`/transactions${query}`);
  }

  async getTransaction(id: string): Promise<Transaction | null> {
    const response = await apiFetch(this.url(`/transactions/${id}`));
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Failed to load transaction ${id}.`);
    return response.json();
  }

  addTransaction(input: CreateTransactionInput): Promise<Transaction> {
    return this.json("/transactions", { method: "POST", body: JSON.stringify(input) });
  }

  updateTransaction(id: string, input: UpdateTransactionInput): Promise<Transaction> {
    return this.json(`/transactions/${id}`, { method: "PATCH", body: JSON.stringify(input) });
  }

  async deleteTransaction(id: string): Promise<void> {
    await this.json(`/transactions/${id}`, { method: "DELETE" });
  }

  getCategories(): Promise<Category[]> {
    return this.json("/categories");
  }

  addCategory(input: CreateCategoryInput): Promise<Category> {
    return this.json("/categories", { method: "POST", body: JSON.stringify(input) });
  }

  updateCategory(id: string, input: UpdateCategoryInput): Promise<Category> {
    return this.json(`/categories/${id}`, { method: "PATCH", body: JSON.stringify(input) });
  }

  async deleteCategory(id: string): Promise<void> {
    const response = await apiFetch(this.url(`/categories/${id}`), { method: "DELETE" });
    if (response.status === 409) {
      const body = (await response.json()) as { categoryId: string; transactionCount: number };
      throw new CategoryInUseError(body.categoryId, body.transactionCount);
    }
    if (!response.ok) throw new Error(`Failed to delete category ${id}.`);
  }

  // Demo-only utilities — the frontend's own FinanceRepository interface
  // documents that a real ApiFinanceRepository is free to skip these, and
  // the backend's Finance HTTP API deliberately doesn't implement them either.
  async resetAll(): Promise<void> {
    throw new Error("Not supported in real mode.");
  }

  async restoreDefaultCategories(): Promise<void> {
    throw new Error("Not supported in real mode.");
  }

  async importTransactions(): Promise<void> {
    throw new Error("Not supported in real mode.");
  }

  getSettings(): Promise<FinanceSettings> {
    return this.json("/settings");
  }

  updateSettings(input: Partial<FinanceSettings>): Promise<FinanceSettings> {
    return this.json("/settings", { method: "PATCH", body: JSON.stringify(input) });
  }

  getFixedExpenses(includeInactive?: boolean): Promise<FixedMonthlyExpense[]> {
    return this.json(`/fixed-expenses?includeInactive=${includeInactive ? "true" : "false"}`);
  }

  addFixedExpense(input: CreateFixedExpenseInput): Promise<FixedMonthlyExpense> {
    return this.json("/fixed-expenses", { method: "POST", body: JSON.stringify(input) });
  }

  updateFixedExpense(id: string, input: UpdateFixedExpenseInput): Promise<FixedMonthlyExpense> {
    return this.json(`/fixed-expenses/${id}`, { method: "PATCH", body: JSON.stringify(input) });
  }

  async archiveFixedExpense(id: string): Promise<void> {
    await this.json(`/fixed-expenses/${id}/archive`, { method: "POST" });
  }

  async restoreFixedExpense(id: string): Promise<void> {
    await this.json(`/fixed-expenses/${id}/restore`, { method: "POST" });
  }

  getPeriodOverrides(periodId: string): Promise<FixedExpensePeriodOverride[]> {
    return this.json(`/period-overrides?periodId=${encodeURIComponent(periodId)}`);
  }

  async setPeriodOverride(fixedExpenseId: string, periodId: string, amountMinor: number): Promise<void> {
    await this.json(`/fixed-expenses/${fixedExpenseId}/period-overrides/${encodeURIComponent(periodId)}`, {
      method: "PUT",
      body: JSON.stringify({ amountMinor }),
    });
  }

  async clearPeriodOverride(fixedExpenseId: string, periodId: string): Promise<void> {
    await this.json(`/fixed-expenses/${fixedExpenseId}/period-overrides/${encodeURIComponent(periodId)}`, { method: "DELETE" });
  }

  markFixedExpensePaid(fixedExpenseId: string, period: DateRange, amountMinor: number, date: string): Promise<Transaction> {
    return this.json(`/fixed-expenses/${fixedExpenseId}/mark-paid`, {
      method: "POST",
      body: JSON.stringify({ fromDate: period.fromDate, toDate: period.toDate, amountMinor, date }),
    });
  }

  async markFixedExpenseUnpaid(fixedExpenseId: string, period: DateRange): Promise<void> {
    await this.json(`/fixed-expenses/${fixedExpenseId}/mark-unpaid`, {
      method: "POST",
      body: JSON.stringify({ fromDate: period.fromDate, toDate: period.toDate }),
    });
  }
}
