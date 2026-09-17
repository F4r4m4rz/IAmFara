import { useEffect, useId, useRef, useState } from "react";
import { dirFor, useLocale } from "../../../i18n";
import { recordCategoryUsed } from "../data/recentCategories";
import { parseAmountInput } from "../domain/money";
import { TransactionType } from "../domain/types";
import { todayLocalDate } from "../domain/dates";
import { useAddTransaction } from "../queries/useAddTransaction";
import { useCategories } from "../queries/useCategories";
import AmountInput from "./AmountInput";
import CategoryPicker from "./CategoryPicker";

interface QuickAddSheetProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function QuickAddSheet({ open, onClose, onSaved }: QuickAddSheetProps) {
  const { locale, t } = useLocale();
  const { data: categories = [] } = useCategories();
  const addTransaction = useAddTransaction();

  const [type, setType] = useState<TransactionType>("expense");
  const [amountInput, setAmountInput] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [date, setDate] = useState(todayLocalDate());
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const amountRef = useRef<HTMLInputElement>(null);
  const errorId = useId();

  // Reset to a clean, fast-path state every time the sheet opens, and
  // auto-focus the amount field — the whole point of "quick add" is that
  // amount entry starts immediately with no extra taps.
  useEffect(() => {
    if (!open) return;
    setType("expense");
    setAmountInput("");
    setCategoryId(null);
    setDate(todayLocalDate());
    setNote("");
    setError(null);
    const raf = requestAnimationFrame(() => {
      setVisible(true);
      amountRef.current?.focus();
    });
    return () => {
      cancelAnimationFrame(raf);
      setVisible(false);
    };
  }, [open]);

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

    await addTransaction.mutateAsync({
      type,
      amountMinor,
      date,
      categoryId,
      note: note.trim() || undefined,
    });
    recordCategoryUsed(categoryId);
    onSaved();
    onClose();
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
        className={`relative w-full max-w-lg rounded-t-2xl border-t border-finance-border bg-finance-surface px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 transition-transform duration-200 ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mb-4 flex justify-center gap-1 rounded-full bg-finance-bg p-1">
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
          disabled={addTransaction.isPending}
          className="mt-4 w-full rounded-xl bg-finance-accent py-3 text-center font-semibold text-white disabled:opacity-60"
        >
          {t("finance.quickAdd.save")}
        </button>
      </div>
    </div>
  );
}
