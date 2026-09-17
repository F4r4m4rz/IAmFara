import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "../RepositoryContext";
import { financeKeys } from "./queryKeys";

export function useRestoreDefaultCategories() {
  const repository = useRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => repository.restoreDefaultCategories(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.categories() });
    },
  });
}
