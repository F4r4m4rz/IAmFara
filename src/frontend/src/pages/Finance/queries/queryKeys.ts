import { TransactionFilter } from "../domain/types";

/**
 * Centralized so mutation hooks invalidate exactly the right queries.
 * `allTransactions` is the partial key every filtered `transactions(...)`
 * query key starts with — React Query's invalidation matches by prefix, so
 * invalidating `allTransactions()` refreshes every mounted transactions
 * query regardless of its filter, which is what "the dashboard must always
 * reflect the latest state after any change, from any screen" needs.
 */
export const financeKeys = {
  allTransactions: () => ["finance", "transactions"] as const,
  transactions: (filter?: TransactionFilter) => ["finance", "transactions", filter ?? {}] as const,
  categories: () => ["finance", "categories"] as const,
  settings: () => ["finance", "settings"] as const,
};
