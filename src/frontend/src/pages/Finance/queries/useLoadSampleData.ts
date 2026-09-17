import { useMutation, useQueryClient } from "@tanstack/react-query";
import { generateSampleTransactions } from "../domain/sampleData";
import { useRepository } from "../RepositoryContext";
import { financeKeys } from "./queryKeys";

export function useLoadSampleData() {
  const repository = useRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => repository.importTransactions(generateSampleTransactions()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.allTransactions() });
    },
  });
}
