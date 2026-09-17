import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "../RepositoryContext";
import { financeKeys } from "./queryKeys";

export function useResetAll() {
  const repository = useRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => repository.resetAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.allTransactions() });
      queryClient.invalidateQueries({ queryKey: financeKeys.categories() });
    },
  });
}
