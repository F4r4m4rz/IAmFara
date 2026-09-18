import { useQuery } from "@tanstack/react-query";
import { useRepository } from "../RepositoryContext";
import { financeKeys } from "./queryKeys";

export function usePeriodOverrides(periodId: string) {
  const repository = useRepository();
  return useQuery({
    queryKey: financeKeys.periodOverrides(periodId),
    queryFn: () => repository.getPeriodOverrides(periodId),
  });
}
