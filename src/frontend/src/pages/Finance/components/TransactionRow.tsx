import { useLocale } from "../../../i18n";
import { Category, Transaction } from "../domain/types";
import { formatMoney } from "../domain/money";
import { iconForCategory } from "./categoryIcons";

export default function TransactionRow({
  transaction,
  category,
  onClick,
}: {
  transaction: Transaction;
  category: Category | undefined;
  onClick?: () => void;
}) {
  const { locale, t } = useLocale();
  const Icon = iconForCategory(transaction.categoryId);
  const categoryLabel = category ? (category.labelKey ? t(category.labelKey) : category.name) : transaction.categoryId;
  const sign = transaction.type === "income" ? "+" : "-";
  const amountColor = transaction.type === "income" ? "text-finance-income" : "text-finance-text";

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border border-finance-border bg-finance-surface px-3 py-2.5 text-start"
    >
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-finance-bg text-finance-muted">
        <Icon size={16} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm text-finance-text">{categoryLabel}</span>
        {transaction.note && <span className="block truncate text-xs text-finance-muted">{transaction.note}</span>}
      </span>
      <span className="flex-shrink-0 text-end">
        <span dir="ltr" className={`block text-sm font-semibold tabular-nums ${amountColor}`}>
          {sign}
          {formatMoney(transaction.amountMinor, locale)}
        </span>
        <span dir="ltr" className="block text-xs text-finance-muted">
          {transaction.date}
        </span>
      </span>
    </button>
  );
}
