import { Trash2 } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { dirFor, useLocale } from "../../../i18n";
import { recordCategoryUsed } from "../data/recentCategories";
import { todayLocalDate } from "../domain/dates";
import { parseAmountInput, minorToMajor } from "../domain/money";
import { Transaction, TransactionType } from "../domain/types";
import { useAddTransaction } from "../queries/useAddTransaction";
import { useCategories } from "../queries/useCategories";
import { useDeleteTransaction } from "../queries/useDeleteTransaction";
import { useUpdateTransaction } from "../queries/useUpdateTransaction";
import AmountInput from "./AmountInput";
import CategoryPicker from "./CategoryPicker";

interface QuickAddSheetProps {
  open: boolean;
  /** null = adding a new transaction; a Transaction = editing that one. */
  editingTransaction: Transaction | null;
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}

export default function QuickAddSheet({ open, editingTransaction, onClose, onSaved, onDeleted }: QuickAddSheetProps) {
  const { locale, t } = useLocale();
  const { data: categories = [] } = useCategories();
  const addTransaction = useAddTransaction();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();

  const [type, setType] = useState<TransactionType>("expense");
  const [amountInput, setAmountInput] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [date, setDate] = useState(todayLocalDate());
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const amountRef = useRef<HTMLInputElement>(null);
  const errorId = useId();
  const isSaving = addTransaction.isPending || updateTransaction.isPending;

  // Reset (or pre-fill, for edit) every time the sheet opens, and auto-focus
  // the amount field — the whole point of "quick add" is that amount entry
  // starts immediately with no extra taps.
  useEffect(() => {
    if (!open) return;
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmountInput(String(minorToMajor(editingTransaction.amountMinor)));
      setCategoryId(editingTransaction.categoryId);
      setDate(editingTransaction.date);
      setNote(editingTransaction.note ?? "");
    } else {
      setType("expense");
      setAmountInput("");
      setCategoryId(null);
      setDate(todayLocalDate());
      setNote("");
    }
    setError(null);
    const raf = requestAnimationFrame(() => {
      setVisible(true);
      amountRef.current?.focus();
    });
    return () => {
      cancelAnimationFrame(raf);
      setVisible(false);
    };
  }, [open, editingTransaction]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const categoriesForType = categories.filter((c) => c.type === type);

  const handleSave = async () => {
    const amountMinor = parseAmountInput(amountInput);
    if (amountMinor === null) {
      setError(t("finance.quickAdd.error.amount"));
      amountRef.current?.focus();
      return;
    }
    if (!categoryId) {
      setError(t("finance.quickAdd.error.category"));
      return;
    }

    const input = { type, amountMinor, date, categoryId, note: note.trim() || undefined };
    try {
      if (editingTransaction) {
        await updateTransaction.mutateAsync({ id: editingTransaction.id, input });
      } else {
        await addTransaction.mutateAsync(input);
      }
      recordCategoryUsed(categoryId);
      onSaved();
      onClose();
    } catch {
      // A failure here must be visible, not a silently-unresponsive Save
      // button — surface it the same way as a validation error.
      setError(t("finance.quickAdd.error.saveFailed"));
    }
  };

  const handleDelete = async () => {
    if (!editingTransaction) return;
    if (!window.confirm(t("finance.quickAdd.confirmDelete"))) return;
    try {
      await deleteTransaction.mutateAsync(editingTransaction.id);
      onDeleted();
      onClose();
    } catch {
      setError(t("finance.quickAdd.error.saveFailed"));
    }
  };

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center">
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity ${visible ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        dir={dirFor(locale)}
        role="dialog"
        aria-modal="true"
        aria-label={t("finance.nav.addTransaction")}
        // max-h + overflow-y-auto matters specifically because the amount
        // field auto-focuses the instant this opens, which pops the mobile
        // keyboard immediately — without a scroll boundary here, the
        // keyboard can push the Save button (at the very bottom of this
        // panel) out of the reachable viewport on shorter phone screens.
        className={`relative flex max-h-[85dvh] w-full max-w-lg flex-col overflow-y-auto rounded-t-2xl border-t border-finance-border bg-finance-surface px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 transition-transform duration-200 ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mb-4 flex items-center gap-1">
          <div className="flex flex-1 justify-center gap-1 rounded-full bg-finance-bg p-1">
            {(["expense", "income"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setType(option);
                  setCategoryId(null);
                }}
                className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
                  type === option ? "bg-finance-accent text-white" : "text-finance-muted"
                }`}
              >
                {t(`finance.quickAdd.type.${option}`)}
              </button>
            ))}
          </div>
          {editingTransaction && (
            <button
              type="button"
              onClick={handleDelete}
              aria-label={t("finance.quickAdd.delete")}
              className="flex-shrink-0 rounded-full p-2.5 text-finance-expense hover:bg-finance-expense/10"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>

        <AmountInput
          ref={amountRef}
          value={amountInput}
          onChange={setAmountInput}
          aria-invalid={error === t("finance.quickAdd.error.amount")}
          aria-describedby={error ? errorId : undefined}
        />

        {error && (
          <p id={errorId} role="alert" className="mt-2 text-center text-sm text-finance-expense">
            {error}
          </p>
        )}

        <div className="mt-5">
          <CategoryPicker categories={categoriesForType} selectedId={categoryId} onSelect={setCategoryId} />
        </div>

        <div className="mt-4 flex gap-2">
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="flex-1 rounded-lg border border-finance-border bg-finance-bg px-3 py-2 text-sm text-finance-text outline-none focus:border-finance-accent"
          />
          <input
            type="text"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={t("finance.quickAdd.notePlaceholder")}
            className="flex-[2] rounded-lg border border-finance-border bg-finance-bg px-3 py-2 text-sm text-finance-text outline-none placeholder:text-finance-muted focus:border-finance-accent"
          />
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="mt-4 w-full rounded-xl bg-finance-accent py-3 text-center font-semibold text-white disabled:opacity-60"
        >
          {t("finance.quickAdd.save")}
        </button>
      </div>
    </div>
  );
}
