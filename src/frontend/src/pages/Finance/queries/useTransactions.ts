import { useQuery } from "@tanstack/react-query";
import { useRepository } from "../RepositoryContext";
import { TransactionFilter } from "../domain/types";
import { financeKeys } from "./queryKeys";

export function useTransactions(filter?: TransactionFilter) {
  const repository = useRepository();
  return useQuery({
    queryKey: financeKeys.transactions(filter),
    queryFn: () => repository.getTransactions(filter),
  });
}
