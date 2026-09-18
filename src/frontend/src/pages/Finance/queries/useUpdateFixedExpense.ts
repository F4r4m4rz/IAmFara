import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "../RepositoryContext";
import { UpdateFixedExpenseInput } from "../domain/types";
import { financeKeys } from "./queryKeys";

export function useUpdateFixedExpense() {
  const repository = useRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateFixedExpenseInput }) => repository.updateFixedExpense(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.allFixedExpenses() });
    },
  });
}
