import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "../RepositoryContext";
import { DateRange } from "../domain/types";
import { financeKeys } from "./queryKeys";

export function useMarkFixedExpenseUnpaid() {
  const repository = useRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fixedExpenseId, period }: { fixedExpenseId: string; period: DateRange }) =>
      repository.markFixedExpenseUnpaid(fixedExpenseId, period),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.allTransactions() });
    },
  });
}
