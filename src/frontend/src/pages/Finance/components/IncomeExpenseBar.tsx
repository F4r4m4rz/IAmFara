import { Locale, useLocale } from "../../../i18n";
import { formatMoney } from "../domain/money";

function Row({
  label,
  amountMinor,
  max,
  colorClass,
  locale,
}: {
  label: string;
  amountMinor: number;
  max: number;
  colorClass: string;
  locale: Locale;
}) {
  const percent = Math.min(100, (amountMinor / max) * 100);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-finance-muted">{label}</span>
        <span dir="ltr" className="text-finance-text">
          {formatMoney(amountMinor, locale)}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-finance-bg">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default function IncomeExpenseBar({ incomeMinor, expenseMinor }: { incomeMinor: number; expenseMinor: number }) {
  const { locale, t } = useLocale();
  const max = Math.max(incomeMinor, expenseMinor, 1);

  return (
    <div className="space-y-3">
      <Row label={t("finance.dashboard.income")} amountMinor={incomeMinor} max={max} colorClass="bg-finance-income" locale={locale} />
      <Row label={t("finance.dashboard.expenses")} amountMinor={expenseMinor} max={max} colorClass="bg-finance-expense" locale={locale} />
    </div>
  );
}
