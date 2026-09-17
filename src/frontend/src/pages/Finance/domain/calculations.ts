import { monthKey } from "./dates";
import { Transaction, TransactionType } from "./types";

/**
 * Pure financial calculations — no React/DOM dependency, framework-free by
 * design (matching the "engine" precedent from SlidingPuzzle/Internet
 * Detective), so it's directly unit-testable and stays identical once a
 * real backend exists: every function here only ever takes `Transaction[]`
 * as input, never touches the repository.
 */

export interface MonthlyTotals {
  incomeMinor: number;
  expenseMinor: number;
  remainingMinor: number;
}

export function filterByMonth(transactions: readonly Transaction[], month: string): Transaction[] {
  return transactions.filter((t) => monthKey(t.date) === month);
}

export function filterByCategory(transactions: readonly Transaction[], categoryId: string): Transaction[] {
  return transactions.filter((t) => t.categoryId === categoryId);
}

export function filterByType(transactions: readonly Transaction[], type: TransactionType): Transaction[] {
  return transactions.filter((t) => t.type === type);
}

export function monthlyTotals(transactions: readonly Transaction[], month: string): MonthlyTotals {
  const inMonth = filterByMonth(transactions, month);
  const incomeMinor = inMonth.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amountMinor, 0);
  const expenseMinor = inMonth.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amountMinor, 0);
  return { incomeMinor, expenseMinor, remainingMinor: incomeMinor - expenseMinor };
}

export interface CategoryTotal {
  categoryId: string;
  totalMinor: number;
}

/** Expense totals per category for a given month, sorted largest first. */
export function categoryBreakdown(transactions: readonly Transaction[], month: string): CategoryTotal[] {
  const inMonth = filterByMonth(transactions, month).filter((t) => t.type === "expense");
  const totals = new Map<string, number>();
  for (const t of inMonth) {
    totals.set(t.categoryId, (totals.get(t.categoryId) ?? 0) + t.amountMinor);
  }
  return Array.from(totals.entries())
    .map(([categoryId, totalMinor]) => ({ categoryId, totalMinor }))
    .sort((a, b) => b.totalMinor - a.totalMinor);
}
