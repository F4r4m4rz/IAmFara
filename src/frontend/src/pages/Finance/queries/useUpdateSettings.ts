import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "../RepositoryContext";
import { FinanceSettings } from "../domain/types";
import { financeKeys } from "./queryKeys";

export function useUpdateSettings() {
  const repository = useRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Partial<FinanceSettings>) => repository.updateSettings(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.settings() });
    },
  });
}
