import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "../RepositoryContext";
import { CreateFixedExpenseInput } from "../domain/types";
import { financeKeys } from "./queryKeys";

export function useAddFixedExpense() {
  const repository = useRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateFixedExpenseInput) => repository.addFixedExpense(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.allFixedExpenses() });
    },
  });
}
