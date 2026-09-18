import { Transaction } from "./types";

/**
 * A fixed monthly expense has no stored "paid/upcoming" status anywhere —
 * it's derived by checking whether a transaction generated for it (see
 * Transaction.fixedExpenseId) falls within the given period's date range.
 * Always recomputed from the current financial-period-start-day setting,
 * never cached against a stale period boundary — this is what keeps
 * changing that setting safe (see domain/financialPeriod.ts) and what
 * makes "mark as unpaid" just "delete this transaction", with nothing else
 * to desync.
 */
export function findPaidTransaction(
  transactions: readonly Transaction[],
  fixedExpenseId: string,
  fromDate: string,
  toDate: string,
): Transaction | undefined {
  return transactions.find((t) => t.fixedExpenseId === fixedExpenseId && t.date >= fromDate && t.date <= toDate);
}
