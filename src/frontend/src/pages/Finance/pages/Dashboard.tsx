import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { dirFor, T, useLocale } from "../../../i18n";
import { monthlyTotals } from "../domain/calculations";
import { addMonths, currentMonthKey, formatMonthLabel } from "../domain/dates";
import { formatMoney } from "../domain/money";
import DemoModeBadge from "../components/DemoModeBadge";
import { useCategories } from "../queries/useCategories";
import { useTransactions } from "../queries/useTransactions";

export default function Dashboard() {
  const { locale, t } = useLocale();
  const [month, setMonth] = useState(currentMonthKey());

  const { data: transactions = [] } = useTransactions({ month });
  const { data: categories = [] } = useCategories();

  const totals = monthlyTotals(transactions, month);
  const isCurrentMonth = month === currentMonthKey();

  return (
    <div dir={dirFor(locale)} className="mx-auto max-w-lg px-4 py-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-lg font-semibold">
          <T k="finance.dashboard.heading" />
        </h1>
        <DemoModeBadge />
      </div>

      <div className="mb-6 flex items-center justify-between rounded-xl border border-finance-border bg-finance-surface px-3 py-2">
        <button
          type="button"
          onClick={() => setMonth((m) => addMonths(m, -1))}
          aria-label={t("finance.dashboard.month.previous")}
          className="rounded-lg p-1.5 text-finance-muted hover:text-finance-text"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={() => setMonth(currentMonthKey())}
          className="text-sm font-medium disabled:text-finance-text"
          disabled={isCurrentMonth}
        >
          <span dir="ltr">{formatMonthLabel(month, locale)}</span>
        </button>
        <button
          type="button"
          onClick={() => setMonth((m) => addMonths(m, 1))}
          aria-label={t("finance.dashboard.month.next")}
          className="rounded-lg p-1.5 text-finance-muted hover:text-finance-text"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="mb-4 rounded-2xl border border-finance-border bg-finance-surfaceElevated p-5">
        <p className="text-xs text-finance-muted">
          <T k="finance.dashboard.remaining" />
        </p>
        <p className="mt-1 text-3xl font-bold tracking-tight" dir="ltr">
          {formatMoney(totals.remainingMinor, locale)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
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

      {/* Sanity check for this phase — proves the repository/seed/query
          pipeline actually works end to end. Replaced by real content
          (recent transactions, category breakdown) in later phases. */}
      <p className="mt-6 text-center text-xs text-finance-muted">
        {categories.length} categories loaded &middot; {transactions.length} transactions this month
      </p>
    </div>
  );
}
