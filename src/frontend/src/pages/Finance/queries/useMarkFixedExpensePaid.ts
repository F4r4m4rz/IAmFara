import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "../RepositoryContext";
import { DateRange } from "../domain/types";
import { financeKeys } from "./queryKeys";

export function useMarkFixedExpensePaid() {
  const repository = useRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      fixedExpenseId,
      period,
      amountMinor,
      date,
    }: {
      fixedExpenseId: string;
      period: DateRange;
      amountMinor: number;
      date: string;
    }) => repository.markFixedExpensePaid(fixedExpenseId, period, amountMinor, date),
    onSuccess: () => {
      // Paid/upcoming status is derived from transactions at read time (see
      // domain/fixedExpenses.ts), not stored on the fixed expense itself —
      // invalidating transactions is what makes a mark-paid show up.
      queryClient.invalidateQueries({ queryKey: financeKeys.allTransactions() });
    },
  });
}
