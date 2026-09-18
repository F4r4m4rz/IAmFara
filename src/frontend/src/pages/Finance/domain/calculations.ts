import { Transaction, TransactionType } from "./types";

/**
 * Pure financial calculations — no React/DOM dependency, framework-free by
 * design (matching the "engine" precedent from SlidingPuzzle/Internet
 * Detective), so it's directly unit-testable and stays identical once a
 * real backend exists: every function here only ever takes `Transaction[]`
 * as input, never touches the repository. Date-range based (inclusive
 * "YYYY-MM-DD" bounds) rather than calendar-month based, so callers can
 * pass any financial period's boundaries — see domain/financialPeriod.ts,
 * which is the only place that knows what a "period" actually is.
 */

export interface PeriodTotals {
  incomeMinor: number;
  expenseMinor: number;
  remainingMinor: number;
}

export function filterByDateRange(transactions: readonly Transaction[], fromDate: string, toDate: string): Transaction[] {
  return transactions.filter((t) => t.date >= fromDate && t.date <= toDate);
}

export function filterByCategory(transactions: readonly Transaction[], categoryId: string): Transaction[] {
  return transactions.filter((t) => t.categoryId === categoryId);
}

export function filterByType(transactions: readonly Transaction[], type: TransactionType): Transaction[] {
  return transactions.filter((t) => t.type === type);
}

export function periodTotals(transactions: readonly Transaction[], fromDate: string, toDate: string): PeriodTotals {
  const inRange = filterByDateRange(transactions, fromDate, toDate);
  const incomeMinor = inRange.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amountMinor, 0);
  const expenseMinor = inRange.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amountMinor, 0);
  return { incomeMinor, expenseMinor, remainingMinor: incomeMinor - expenseMinor };
}

export interface CategoryTotal {
  categoryId: string;
  totalMinor: number;
}

/** Expense totals per category within a date range, sorted largest first. */
export function categoryBreakdown(transactions: readonly Transaction[], fromDate: string, toDate: string): CategoryTotal[] {
  const inRange = filterByDateRange(transactions, fromDate, toDate).filter((t) => t.type === "expense");
  const totals = new Map<string, number>();
  for (const t of inRange) {
    totals.set(t.categoryId, (totals.get(t.categoryId) ?? 0) + t.amountMinor);
  }
  return Array.from(totals.entries())
    .map(([categoryId, totalMinor]) => ({ categoryId, totalMinor }))
    .sort((a, b) => b.totalMinor - a.totalMinor);
}
