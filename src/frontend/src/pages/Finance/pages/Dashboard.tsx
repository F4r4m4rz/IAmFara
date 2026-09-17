import { Plus, Wallet } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { dirFor, T, useLocale } from "../../../i18n";
import CategoryBreakdownChart from "../components/CategoryBreakdownChart";
import DemoModeBadge from "../components/DemoModeBadge";
import EmptyState from "../components/EmptyState";
import IncomeExpenseBar from "../components/IncomeExpenseBar";
import MonthSelector from "../components/MonthSelector";
import TransactionRow from "../components/TransactionRow";
import { categoryBreakdown, monthlyTotals } from "../domain/calculations";
import { currentMonthKey } from "../domain/dates";
import { formatMoney } from "../domain/money";
import { Transaction } from "../domain/types";
import { useCategories } from "../queries/useCategories";
import { useTransactions } from "../queries/useTransactions";

const RECENT_COUNT = 5;

export default function Dashboard({
  onAddTransaction,
  onEditTransaction,
}: {
  onAddTransaction: () => void;
  onEditTransaction: (transaction: Transaction) => void;
}) {
  const { locale, t } = useLocale();
  const [month, setMonth] = useState(currentMonthKey());

  const { data: transactions = [] } = useTransactions({ month });
  const { data: categories = [] } = useCategories();

  const totals = monthlyTotals(transactions, month);
  const breakdown = categoryBreakdown(transactions, month);
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const hasTransactions = transactions.length > 0;

  return (
    <div dir={dirFor(locale)} className="mx-auto max-w-lg px-4 py-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-lg font-semibold">
          <T k="finance.dashboard.heading" />
        </h1>
        <DemoModeBadge />
      </div>

      <div className="mb-6">
        <MonthSelector month={month} onChange={setMonth} />
      </div>

      <div className="mb-4 rounded-2xl border border-finance-border bg-finance-surfaceElevated p-5">
        <p className="text-xs text-finance-muted">
          <T k="finance.dashboard.remaining" />
        </p>
        <p className="mt-1 text-3xl font-bold tracking-tight" dir="ltr">
          {formatMoney(totals.remainingMinor, locale)}
        </p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-finance-border bg-finance-surface p-4">
          <p className="text-xs text-finance-muted">
            <T k="finance.dashboard.income" />
          </p>
          <p className="mt-1 text-xl font-semibold text-finance-income" dir="ltr">
            {formatMoney(totals.incomeMinor, locale)}
          </p>
        </div>
        <div className="rounded-2xl border border-finance-border bg-finance-surface p-4">
          <p className="text-xs text-finance-muted">
            <T k="finance.dashboard.expenses" />
          </p>
          <p className="mt-1 text-xl font-semibold text-finance-expense" dir="ltr">
            {formatMoney(totals.expenseMinor, locale)}
          </p>
        </div>
      </div>

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
            <IncomeExpenseBar incomeMinor={totals.incomeMinor} expenseMinor={totals.expenseMinor} />
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
    </div>
  );
}
