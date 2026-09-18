import { Archive, Check, Pencil, Plus, RotateCcw, X } from "lucide-react";
import { useEffect, useState } from "react";
import { dirFor, T, useLocale } from "../../../i18n";
import CategoryPicker from "../components/CategoryPicker";
import { iconForCategory } from "../components/categoryIcons";
import PeriodSelector from "../components/PeriodSelector";
import { findPaidTransaction } from "../domain/fixedExpenses";
import { currentPeriodId, periodDateRange } from "../domain/financialPeriod";
import { formatMoney, minorToMajor, parseAmountInput } from "../domain/money";
import { Category, FixedExpensePeriodOverride, FixedMonthlyExpense } from "../domain/types";
import { useAddFixedExpense } from "../queries/useAddFixedExpense";
import { useArchiveFixedExpense } from "../queries/useArchiveFixedExpense";
import { useCategories } from "../queries/useCategories";
import { useClearPeriodOverride } from "../queries/useClearPeriodOverride";
import { useFixedExpenses } from "../queries/useFixedExpenses";
import { useMarkFixedExpenseUnpaid } from "../queries/useMarkFixedExpenseUnpaid";
import { usePeriodOverrides } from "../queries/usePeriodOverrides";
import { useSetPeriodOverride } from "../queries/useSetPeriodOverride";
import { useSettings } from "../queries/useSettings";
import { useTransactions } from "../queries/useTransactions";
import { useUpdateFixedExpense } from "../queries/useUpdateFixedExpense";

interface FixedExpenseFormValues {
  name: string;
  categoryId: string;
  defaultAmountMinor: number;
  dueDay?: number;
}

function FixedExpenseForm({
  categories,
  initial,
  onSave,
  onCancel,
}: {
  categories: Category[];
  initial?: FixedMonthlyExpense;
  onSave: (values: FixedExpenseFormValues) => Promise<unknown>;
  onCancel: () => void;
}) {
  const { t } = useLocale();
  const [name, setName] = useState(initial?.name ?? "");
  const [categoryId, setCategoryId] = useState<string | null>(initial?.categoryId ?? null);
  const [amountInput, setAmountInput] = useState(initial ? String(minorToMajor(initial.defaultAmountMinor)) : "");
  const [dueDayInput, setDueDayInput] = useState(initial?.dueDay ? String(initial.dueDay) : "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError(t("finance.fixedExpenses.error.name"));
      return;
    }
    if (!categoryId) {
      setError(t("finance.quickAdd.error.category"));
      return;
    }
    const defaultAmountMinor = parseAmountInput(amountInput);
    if (defaultAmountMinor === null) {
      setError(t("finance.quickAdd.error.amount"));
      return;
    }
    let dueDay: number | undefined;
    if (dueDayInput.trim() !== "") {
      const parsed = Number.parseInt(dueDayInput, 10);
      if (!Number.isInteger(parsed) || parsed < 1 || parsed > 31) {
        setError(t("finance.fixedExpenses.error.dueDay"));
        return;
      }
      dueDay = parsed;
    }

    setError(null);
    setSaving(true);
    try {
      await onSave({ name: trimmedName, categoryId, defaultAmountMinor, dueDay });
    } catch {
      setError(t("finance.quickAdd.error.saveFailed"));
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-finance-accent bg-finance-surface p-3">
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        autoFocus
        placeholder={t("finance.fixedExpenses.namePlaceholder")}
        aria-label={t("finance.fixedExpenses.namePlaceholder")}
        className="mb-3 w-full rounded-lg border border-finance-border bg-finance-bg px-3 py-2 text-sm text-finance-text outline-none focus:border-finance-accent"
      />

      <div className="mb-3">
        <CategoryPicker categories={categories} selectedId={categoryId} onSelect={setCategoryId} />
      </div>

      <div className="mb-3 flex items-center gap-2">
        <span dir="ltr" className="text-sm text-finance-muted">
          {t("finance.quickAdd.amountLabel")}
        </span>
        <input
          type="text"
          inputMode="decimal"
          dir="ltr"
          value={amountInput}
          onChange={(event) => setAmountInput(event.target.value)}
          placeholder="0"
          aria-label={t("finance.quickAdd.amountLabel")}
          className="w-28 rounded-lg border border-finance-border bg-finance-bg px-3 py-2 text-sm text-finance-text outline-none focus:border-finance-accent"
        />
      </div>

      <input
        type="number"
        min={1}
        max={31}
        inputMode="numeric"
        value={dueDayInput}
        onChange={(event) => setDueDayInput(event.target.value)}
        placeholder={t("finance.fixedExpenses.dueDayPlaceholder")}
        aria-label={t("finance.fixedExpenses.dueDayPlaceholder")}
        className="mb-3 w-full rounded-lg border border-finance-border bg-finance-bg px-3 py-2 text-sm text-finance-text outline-none focus:border-finance-accent"
      />

      {error && (
        <p role="alert" className="mb-3 text-sm text-finance-expense">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex-1 rounded-lg bg-finance-accent py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {t("finance.categories.save")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-finance-border py-2 text-sm text-finance-muted"
        >
          {t("finance.categories.cancel")}
        </button>
      </div>
    </div>
  );
}

function FixedExpenseListItem({
  expense,
  categories,
  override,
  isPaid,
  period,
  periodId,
  onArchive,
  onUnmarkPaid,
}: {
  expense: FixedMonthlyExpense;
  categories: Category[];
  override?: FixedExpensePeriodOverride;
  isPaid: boolean;
  period: { fromDate: string; toDate: string };
  periodId: string;
  onArchive: () => void;
  onUnmarkPaid: () => void;
}) {
  const { locale, t } = useLocale();
  const updateFixedExpense = useUpdateFixedExpense();
  const setPeriodOverride = useSetPeriodOverride();
  const clearPeriodOverride = useClearPeriodOverride();

  const [editing, setEditing] = useState(false);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const expectedAmountMinor = override?.amountMinor ?? expense.defaultAmountMinor;
  const [overrideInput, setOverrideInput] = useState(String(minorToMajor(expectedAmountMinor)));

  // Re-sync when the displayed period (or its override) changes elsewhere —
  // this field otherwise keeps showing the previous period's amount after
  // the user navigates via PeriodSelector, since this component instance
  // persists across that navigation (same key).
  useEffect(() => {
    setOverrideInput(String(minorToMajor(expectedAmountMinor)));
  }, [expectedAmountMinor]);

  const Icon = iconForCategory(expense.categoryId);

  if (editing) {
    return (
      <li>
        <FixedExpenseForm
          categories={categories}
          initial={expense}
          onSave={async (values) => {
            await updateFixedExpense.mutateAsync({ id: expense.id, input: values });
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </li>
    );
  }

  const handleSetOverride = async () => {
    const amountMinor = parseAmountInput(overrideInput);
    if (amountMinor === null) return;
    await setPeriodOverride.mutateAsync({ fixedExpenseId: expense.id, periodId, amountMinor });
    setOverrideOpen(false);
  };

  const handleClearOverride = async () => {
    await clearPeriodOverride.mutateAsync({ fixedExpenseId: expense.id, periodId });
    setOverrideInput(String(minorToMajor(expense.defaultAmountMinor)));
    setOverrideOpen(false);
  };

  return (
    <li className="rounded-xl border border-finance-border bg-finance-surface p-3">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-finance-bg text-finance-muted">
          <Icon size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-finance-text">{expense.name}</p>
          <p className="text-xs text-finance-muted">
            <span dir="ltr">{formatMoney(expectedAmountMinor, locale)}</span>
            {override && ` · ${t("finance.fixedExpenses.overridden")}`}
            {expense.dueDay ? ` · ${t("finance.fixedExpenses.dueDayShort", { day: expense.dueDay })}` : ""}
          </p>
        </div>
        <span
          className={`flex-shrink-0 rounded-full px-2 py-1 text-[11px] font-medium ${
            isPaid ? "bg-finance-income/15 text-finance-income" : "bg-finance-bg text-finance-muted"
          }`}
        >
          {isPaid ? t("finance.fixedExpenses.status.paid") : t("finance.fixedExpenses.status.upcoming")}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        {isPaid && (
          <button type="button" onClick={onUnmarkPaid} className="text-xs text-finance-muted hover:text-finance-text">
            {t("finance.fixedExpenses.unmarkPaid")}
          </button>
        )}
        <button
          type="button"
          onClick={() => setOverrideOpen((open) => !open)}
          className="text-xs text-finance-muted hover:text-finance-text"
        >
          {t("finance.fixedExpenses.overrideAmount")}
        </button>
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label={t("finance.fixedExpenses.edit")}
          className="text-finance-muted hover:text-finance-text"
        >
          <Pencil size={14} />
        </button>
        <button
          type="button"
          onClick={onArchive}
          aria-label={t("finance.fixedExpenses.archive")}
          className="text-finance-muted hover:text-finance-expense"
        >
          <Archive size={14} />
        </button>
      </div>

      {overrideOpen && (
        <div className="mt-2 flex items-center gap-2">
          <input
            type="text"
            inputMode="decimal"
            dir="ltr"
            value={overrideInput}
            onChange={(event) => setOverrideInput(event.target.value)}
            aria-label={t("finance.fixedExpenses.overrideAmount")}
            className="w-24 rounded-lg border border-finance-border bg-finance-bg px-2 py-1 text-sm text-finance-text outline-none focus:border-finance-accent"
          />
          <button type="button" onClick={handleSetOverride} aria-label={t("finance.categories.save")} className="text-finance-income">
            <Check size={16} />
          </button>
          {override && (
            <button
              type="button"
              onClick={handleClearOverride}
              aria-label={t("finance.fixedExpenses.clearOverride")}
              className="text-finance-muted"
            >
              <RotateCcw size={14} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setOverrideOpen(false)}
            aria-label={t("finance.categories.cancel")}
            className="text-finance-muted"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </li>
  );
}

export default function FixedExpenses({ showToast }: { showToast: (message: string) => void }) {
  const { locale, t } = useLocale();
  const { data: settings } = useSettings();
  const startDay = settings?.financialPeriodStartDay ?? 1;
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const periodId = selectedPeriod ?? currentPeriodId(startDay);
  const period = periodDateRange(periodId, startDay);

  const { data: categories = [] } = useCategories();
  const expenseCategories = categories.filter((c) => c.type === "expense");
  const { data: fixedExpenses = [] } = useFixedExpenses();
  const { data: overrides = [] } = usePeriodOverrides(periodId);
  const { data: transactions = [] } = useTransactions({ fromDate: period.fromDate, toDate: period.toDate });

  const addFixedExpense = useAddFixedExpense();
  const archiveFixedExpense = useArchiveFixedExpense();
  const markFixedExpenseUnpaid = useMarkFixedExpenseUnpaid();
  const [addOpen, setAddOpen] = useState(false);

  const overrideByExpenseId = new Map(overrides.map((o) => [o.fixedExpenseId, o]));

  const handleArchive = async (expense: FixedMonthlyExpense) => {
    if (!window.confirm(t("finance.fixedExpenses.confirmArchive", { name: expense.name }))) return;
    await archiveFixedExpense.mutateAsync(expense.id);
    showToast(t("finance.fixedExpenses.archived"));
  };

  const handleUnmarkPaid = async (expense: FixedMonthlyExpense) => {
    await markFixedExpenseUnpaid.mutateAsync({ fixedExpenseId: expense.id, period });
    showToast(t("finance.fixedExpenses.unmarkedPaid"));
  };

  return (
    <div dir={dirFor(locale)} className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-4 text-lg font-semibold">
        <T k="finance.fixedExpenses.heading" />
      </h1>

      <div className="mb-4">
        <PeriodSelector period={periodId} startDay={startDay} onChange={setSelectedPeriod} />
      </div>

      {fixedExpenses.length === 0 && !addOpen ? (
        <p className="py-6 text-center text-sm text-finance-muted">
          <T k="finance.fixedExpenses.empty" />
        </p>
      ) : (
        <ul className="mb-3 space-y-2">
          {fixedExpenses.map((expense) => {
            const paidTransaction = findPaidTransaction(transactions, expense.id, period.fromDate, period.toDate);
            return (
              <FixedExpenseListItem
                key={expense.id}
                expense={expense}
                categories={expenseCategories}
                override={overrideByExpenseId.get(expense.id)}
                isPaid={Boolean(paidTransaction)}
                period={period}
                periodId={periodId}
                onArchive={() => handleArchive(expense)}
                onUnmarkPaid={() => handleUnmarkPaid(expense)}
              />
            );
          })}
        </ul>
      )}

      {addOpen ? (
        <FixedExpenseForm
          categories={expenseCategories}
          onSave={async (values) => {
            await addFixedExpense.mutateAsync(values);
            showToast(t("finance.fixedExpenses.added"));
            setAddOpen(false);
          }}
          onCancel={() => setAddOpen(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-finance-border px-3 py-2 text-sm text-finance-muted hover:text-finance-text"
        >
          <Plus size={16} />
          {t("finance.fixedExpenses.add")}
        </button>
      )}
    </div>
  );
}
