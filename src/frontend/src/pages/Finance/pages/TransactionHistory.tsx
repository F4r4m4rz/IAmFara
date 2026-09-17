import { useState } from "react";
import { dirFor, T, useLocale } from "../../../i18n";
import MonthSelector from "../components/MonthSelector";
import TransactionRow from "../components/TransactionRow";
import { currentMonthKey } from "../domain/dates";
import { Transaction, TransactionType } from "../domain/types";
import { useCategories } from "../queries/useCategories";
import { useTransactions } from "../queries/useTransactions";

const TYPE_FILTERS = ["all", "expense", "income"] as const;
type TypeFilter = (typeof TYPE_FILTERS)[number];

export default function TransactionHistory({
  onEditTransaction,
}: {
  onEditTransaction: (transaction: Transaction) => void;
}) {
  const { locale, t } = useLocale();
  const [month, setMonth] = useState(currentMonthKey());
  const [type, setType] = useState<TypeFilter>("all");
  const [categoryId, setCategoryId] = useState<string>("all");

  const { data: categories = [] } = useCategories();
  const { data: transactions = [] } = useTransactions({
    month,
    ...(type !== "all" && { type: type as TransactionType }),
    ...(categoryId !== "all" && { categoryId }),
  });

  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const categoryOptions = categories.filter((c) => type === "all" || c.type === type);

  return (
    <div dir={dirFor(locale)} className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-4 text-lg font-semibold">
        <T k="finance.transactions.heading" />
      </h1>

      <div className="mb-3">
        <MonthSelector month={month} onChange={setMonth} />
      </div>

      <div className="mb-4 flex gap-2">
        <div role="group" aria-label={t("finance.transactions.filter.typeGroupLabel")} className="flex flex-1 rounded-full bg-finance-surface p-1">
          {TYPE_FILTERS.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={type === option}
              onClick={() => {
                setType(option);
                setCategoryId("all");
              }}
              className={`flex-1 rounded-full py-1.5 text-xs font-medium transition-colors ${
                type === option ? "bg-finance-accent text-white" : "text-finance-muted"
              }`}
            >
              {t(`finance.transactions.filter.${option}`)}
            </button>
          ))}
        </div>
        <select
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          aria-label={t("finance.transactions.filter.allCategories")}
          className="rounded-full border border-finance-border bg-finance-surface px-3 text-xs text-finance-text outline-none focus:border-finance-accent"
        >
          <option value="all">{t("finance.transactions.filter.allCategories")}</option>
          {categoryOptions.map((category) => (
            <option key={category.id} value={category.id}>
              {category.labelKey ? t(category.labelKey) : category.name}
            </option>
          ))}
        </select>
      </div>

      {transactions.length === 0 ? (
        <p className="py-10 text-center text-sm text-finance-muted">
          <T k="finance.transactions.empty" />
        </p>
      ) : (
        <ul className="space-y-2">
          {transactions.map((transaction) => (
            <li key={transaction.id}>
              <TransactionRow
                transaction={transaction}
                category={categoryById.get(transaction.categoryId)}
                onClick={() => onEditTransaction(transaction)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
