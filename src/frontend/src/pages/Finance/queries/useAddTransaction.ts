import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "../RepositoryContext";
import { CreateTransactionInput } from "../domain/types";
import { financeKeys } from "./queryKeys";

export function useAddTransaction() {
  const repository = useRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTransactionInput) => repository.addTransaction(input),
    onSuccess: () => {
      // Invalidates every mounted transactions query regardless of its
      // filter (see queryKeys.ts) — this is what keeps the dashboard in
      // sync immediately after a save from the quick-add sheet.
      queryClient.invalidateQueries({ queryKey: financeKeys.allTransactions() });
    },
  });
}
