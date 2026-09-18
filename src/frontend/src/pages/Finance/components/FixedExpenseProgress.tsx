import { useLocale } from "../../../i18n";
import { formatMoney } from "../domain/money";

export default function FixedExpenseProgress({
  paidCount,
  totalCount,
  remainingMinor,
}: {
  paidCount: number;
  totalCount: number;
  remainingMinor: number;
}) {
  const { locale, t } = useLocale();
  const progress = totalCount === 0 ? 1 : paidCount / totalCount;

  return (
    <div className="mb-2">
      <div className="flex items-center justify-between text-xs text-finance-muted">
        <span>{t("finance.fixedExpenses.progress", { paid: paidCount, total: totalCount })}</span>
        <span dir="ltr">
          {formatMoney(remainingMinor, locale)} {t("finance.fixedExpenses.remaining")}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-finance-border">
        <div
          className="h-full rounded-full bg-finance-accent transition-[width] motion-reduce:transition-none"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
    </div>
  );
}
