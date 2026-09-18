import { CheckCircle2, Plus, Wallet } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { dirFor, T, useLocale } from "../../../i18n";
import CategoryBreakdownChart from "../components/CategoryBreakdownChart";
import DemoModeBadge from "../components/DemoModeBadge";
import EmptyState from "../components/EmptyState";
import FixedExpenseCarousel from "../components/FixedExpenseCarousel";
import FixedExpenseProgress from "../components/FixedExpenseProgress";
import ForecastSummary from "../components/ForecastSummary";
import IncomeExpenseBar from "../components/IncomeExpenseBar";
import MarkAsPaidSheet, { MarkAsPaidTarget } from "../components/MarkAsPaidSheet";
import PeriodSelector from "../components/PeriodSelector";
import TransactionRow from "../components/TransactionRow";
import { categoryBreakdown } from "../domain/calculations";
import { fixedExpensesForPeriod, forecastSummary } from "../domain/fixedExpenses";
import { currentPeriodId, periodDateRange } from "../domain/financialPeriod";
import { Transaction } from "../domain/types";
import { useCategories } from "../queries/useCategories";
import { useFixedExpenses } from "../queries/useFixedExpenses";
import { usePeriodOverrides } from "../queries/usePeriodOverrides";
import { useSettings } from "../queries/useSettings";
import { useTransactions } from "../queries/useTransactions";

const RECENT_COUNT = 5;

export default function Dashboard({
  onAddTransaction,
  onEditTransaction,
  showToast,
}: {
  onAddTransaction: () => void;
  onEditTransaction: (transaction: Transaction) => void;
  showToast: (message: string) => void;
}) {
  const { locale, t } = useLocale();
  const { data: settings } = useSettings();
  const startDay = settings?.financialPeriodStartDay ?? 1;
  // null = "follow the current period" (recomputed every render, so it
  // corrects itself once the real startDay loads); a string = the user
  // explicitly navigated away from "now".
  const [periodOverride, setPeriodOverride] = useState<string | null>(null);
  const period = periodOverride ?? currentPeriodId(startDay);
  const { fromDate, toDate } = periodDateRange(period, startDay);

  const { data: transactions = [] } = useTransactions({ fromDate, toDate });
  const { data: categories = [] } = useCategories();
  const { data: fixedExpenses = [] } = useFixedExpenses();
  const { data: overrides = [] } = usePeriodOverrides(period);

  const breakdown = categoryBreakdown(transactions, fromDate, toDate);
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const hasTransactions = transactions.length > 0;

  const fixedExpenseStatuses = fixedExpensesForPeriod(fixedExpenses, overrides, transactions, fromDate, toDate);
  const forecast = forecastSummary(transactions, fixedExpenseStatuses, fromDate, toDate);
  const upcomingFixedExpenses = fixedExpenseStatuses.filter((s) => !s.isPaid);
  const paidCount = fixedExpenseStatuses.length - upcomingFixedExpenses.length;

  const [markingPaid, setMarkingPaid] = useState<MarkAsPaidTarget | null>(null);

  return (
    <div dir={dirFor(locale)} className="mx-auto max-w-lg px-4 py-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-lg font-semibold">
          <T k="finance.dashboard.heading" />
        </h1>
        <DemoModeBadge />
      </div>

      <div className="mb-6">
        <PeriodSelector period={period} startDay={startDay} onChange={setPeriodOverride} />
      </div>

      <ForecastSummary forecast={forecast} />

      {fixedExpenseStatuses.length > 0 && (
        <div className="mb-4">
          <FixedExpenseProgress
            paidCount={paidCount}
            totalCount={fixedExpenseStatuses.length}
            remainingMinor={forecast.upcomingFixedMinor}
          />
          {upcomingFixedExpenses.length > 0 ? (
            <FixedExpenseCarousel
              items={upcomingFixedExpenses}
              categoryById={categoryById}
              onMarkPaid={(status) => setMarkingPaid({ fixedExpense: status.fixedExpense, expectedAmountMinor: status.expectedAmountMinor })}
            />
          ) : (
            <EmptyState icon={CheckCircle2} title={t("finance.fixedExpenses.allPaid")} />
          )}
        </div>
      )}

      {!hasTransactions ? (
        <EmptyState
          icon={Wallet}
          title={t("finance.dashboard.empty")}
          action={
            <button
              type="button"
              onClick={onAddTransaction}
              className="flex items-center gap-1.5 rounded-full bg-finance-accent px-4 py-2 text-sm font-medium text-white"
            >
              <Plus size={16} />
              {t("finance.nav.addTransaction")}
            </button>
          }
        />
      ) : (
        <>
          <div className="mb-4 rounded-2xl border border-finance-border bg-finance-surface p-4">
            <IncomeExpenseBar incomeMinor={forecast.incomeMinor} expenseMinor={forecast.paidExpenseMinor} />
          </div>

          <div className="mb-4 rounded-2xl border border-finance-border bg-finance-surface p-4">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-finance-muted">
              <T k="finance.dashboard.byCategory" />
            </h2>
            <CategoryBreakdownChart breakdown={breakdown} categories={categories} />
          </div>

          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-finance-muted">
            <T k="finance.dashboard.recent" />
          </h2>
          <ul className="space-y-2">
            {transactions.slice(0, RECENT_COUNT).map((transaction) => (
              <li key={transaction.id}>
                <TransactionRow
                  transaction={transaction}
                  category={categoryById.get(transaction.categoryId)}
                  onClick={() => onEditTransaction(transaction)}
                />
              </li>
            ))}
          </ul>

          <Link to="/expenses/demo/transactions" className="mt-4 block text-center text-sm text-finance-accentText">
            <T k="finance.dashboard.viewTransactions" />
          </Link>
        </>
      )}

      <MarkAsPaidSheet
        target={markingPaid}
        period={{ fromDate, toDate }}
        onClose={() => setMarkingPaid(null)}
        onPaid={() => showToast(t("finance.fixedExpenses.markedPaid"))}
      />
    </div>
  );
}
