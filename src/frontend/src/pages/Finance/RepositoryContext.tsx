import { createContext, ReactNode, useContext } from "react";
import { FinanceRepository } from "./data/FinanceRepository";

const RepositoryContext = createContext<FinanceRepository | null>(null);

/**
 * The seam a future private "real mode" route would use to provide an
 * ApiFinanceRepository instead — every screen/hook in this feature gets its
 * repository from here, never by importing IndexedDbFinanceRepository
 * directly, so swapping the implementation touches this one provider, not
 * the UI.
 */
export function RepositoryProvider({
  repository,
  children,
}: {
  repository: FinanceRepository;
  children: ReactNode;
}) {
  return <RepositoryContext.Provider value={repository}>{children}</RepositoryContext.Provider>;
}

export function useRepository(): FinanceRepository {
  const repository = useContext(RepositoryContext);
  if (!repository) throw new Error("useRepository must be used within a RepositoryProvider");
  return repository;
}
