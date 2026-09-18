import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "../RepositoryContext";
import { financeKeys } from "./queryKeys";

export function useSetPeriodOverride() {
  const repository = useRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fixedExpenseId, periodId, amountMinor }: { fixedExpenseId: string; periodId: string; amountMinor: number }) =>
      repository.setPeriodOverride(fixedExpenseId, periodId, amountMinor),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.periodOverrides(variables.periodId) });
    },
  });
}
