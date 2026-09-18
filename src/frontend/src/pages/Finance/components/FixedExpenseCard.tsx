import { useLocale } from "../../../i18n";
import { FixedExpenseForPeriod } from "../domain/fixedExpenses";
import { formatMoney } from "../domain/money";
import { Category } from "../domain/types";
import { iconForCategory } from "./categoryIcons";

export default function FixedExpenseCard({
  status,
  category,
  onMarkPaid,
}: {
  status: FixedExpenseForPeriod;
  category?: Category;
  onMarkPaid: () => void;
}) {
  const { locale, t } = useLocale();
  const Icon = iconForCategory(status.fixedExpense.categoryId);
  const categoryLabel = category ? (category.labelKey ? t(category.labelKey) : category.name ?? "") : "";

  return (
    <div className="flex h-full w-60 flex-shrink-0 flex-col justify-between rounded-2xl border border-finance-border bg-finance-surface p-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-finance-bg text-finance-muted">
            <Icon size={16} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-finance-text">{status.fixedExpense.name}</p>
            {categoryLabel && <p className="truncate text-xs text-finance-muted">{categoryLabel}</p>}
          </div>
        </div>
        <p className="mt-3 text-2xl font-bold tracking-tight" dir="ltr">
          {formatMoney(status.expectedAmountMinor, locale)}
        </p>
        {status.fixedExpense.dueDay && (
          <p className="mt-1 text-xs text-finance-muted">
            {t("finance.fixedExpenses.dueDayShort", { day: status.fixedExpense.dueDay })}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onMarkPaid}
        className="mt-4 w-full rounded-lg bg-finance-accent py-2 text-sm font-medium text-white"
      >
        {t("finance.fixedExpenses.markAsPaid")}
      </button>
    </div>
  );
}
