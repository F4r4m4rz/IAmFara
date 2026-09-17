import { useState } from "react";
import { Link } from "react-router-dom";
import { dirFor, T, useLocale } from "../../../i18n";
import { monthlyTotals } from "../domain/calculations";
import { currentMonthKey } from "../domain/dates";
import { formatMoney } from "../domain/money";
import DemoModeBadge from "../components/DemoModeBadge";
import MonthSelector from "../components/MonthSelector";
import { useTransactions } from "../queries/useTransactions";

export default function Dashboard() {
  const { locale } = useLocale();
  const [month, setMonth] = useState(currentMonthKey());

  const { data: transactions = [] } = useTransactions({ month });
  const totals = monthlyTotals(transactions, month);

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

      <Link to="/expenses/demo/transactions" className="mt-6 block text-center text-sm text-finance-accent">
        <T k="finance.dashboard.viewTransactions" />
      </Link>
    </div>
  );
}
