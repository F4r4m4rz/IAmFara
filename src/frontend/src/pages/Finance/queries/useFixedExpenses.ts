import { useQuery } from "@tanstack/react-query";
import { useRepository } from "../RepositoryContext";
import { financeKeys } from "./queryKeys";

export function useFixedExpenses(includeInactive = false) {
  const repository = useRepository();
  return useQuery({
    queryKey: financeKeys.fixedExpenses(includeInactive),
    queryFn: () => repository.getFixedExpenses(includeInactive),
  });
}
