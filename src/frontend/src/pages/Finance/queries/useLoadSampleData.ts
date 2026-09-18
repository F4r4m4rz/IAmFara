import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addPeriods, currentPeriodId, periodDateRange } from "../domain/financialPeriod";
import { generateSampleFixedExpenses, generateSampleTransactions } from "../domain/sampleData";
import { useRepository } from "../RepositoryContext";
import { financeKeys } from "./queryKeys";

const PAID_LAST_PERIOD_COUNT = 2;

export function useLoadSampleData() {
  const repository = useRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await repository.importTransactions(generateSampleTransactions());

      const fixedExpenses = await Promise.all(generateSampleFixedExpenses().map((input) => repository.addFixedExpense(input)));

      // Mark a couple of them paid for the *previous* period only, so the
      // demo shows both realistic history and a populated "upcoming"
      // carousel for the current period rather than an already-empty one.
      const settings = await repository.getSettings();
      const previousPeriodId = addPeriods(currentPeriodId(settings.financialPeriodStartDay), -1);
      const previousPeriod = periodDateRange(previousPeriodId, settings.financialPeriodStartDay);
      await Promise.all(
        fixedExpenses
          .slice(0, PAID_LAST_PERIOD_COUNT)
          .map((expense) => repository.markFixedExpensePaid(expense.id, previousPeriod, expense.defaultAmountMinor, previousPeriod.fromDate)),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.allTransactions() });
      queryClient.invalidateQueries({ queryKey: financeKeys.allFixedExpenses() });
    },
  });
}
