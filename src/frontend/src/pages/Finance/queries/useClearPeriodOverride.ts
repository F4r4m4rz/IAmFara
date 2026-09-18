import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "../RepositoryContext";
import { financeKeys } from "./queryKeys";

export function useClearPeriodOverride() {
  const repository = useRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fixedExpenseId, periodId }: { fixedExpenseId: string; periodId: string }) =>
      repository.clearPeriodOverride(fixedExpenseId, periodId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.periodOverrides(variables.periodId) });
    },
  });
}
