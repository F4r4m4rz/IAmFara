import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "../RepositoryContext";
import { financeKeys } from "./queryKeys";

export function useArchiveFixedExpense() {
  const repository = useRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => repository.archiveFixedExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.allFixedExpenses() });
    },
  });
}
