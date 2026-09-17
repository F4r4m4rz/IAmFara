import { useQuery } from "@tanstack/react-query";
import { useRepository } from "../RepositoryContext";
import { financeKeys } from "./queryKeys";

export function useCategories() {
  const repository = useRepository();
  return useQuery({
    queryKey: financeKeys.categories(),
    queryFn: () => repository.getCategories(),
  });
}
