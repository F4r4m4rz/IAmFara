import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "../RepositoryContext";
import { financeKeys } from "./queryKeys";

/** May reject with CategoryInUseError (see domain/types.ts) — callers should catch it. */
export function useDeleteCategory() {
  const repository = useRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => repository.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.categories() });
    },
  });
}
