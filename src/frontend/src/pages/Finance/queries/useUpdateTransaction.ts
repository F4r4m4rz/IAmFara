import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "../RepositoryContext";
import { UpdateTransactionInput } from "../domain/types";
import { financeKeys } from "./queryKeys";

export function useUpdateTransaction() {
  const repository = useRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTransactionInput }) =>
      repository.updateTransaction(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.allTransactions() });
    },
  });
}
