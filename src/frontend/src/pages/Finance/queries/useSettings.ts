import { useQuery } from "@tanstack/react-query";
import { useRepository } from "../RepositoryContext";
import { financeKeys } from "./queryKeys";

export function useSettings() {
  const repository = useRepository();
  return useQuery({
    queryKey: financeKeys.settings(),
    queryFn: () => repository.getSettings(),
  });
}
