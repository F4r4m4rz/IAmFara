import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { dirFor, useLocale } from "../../../i18n";
import { todayLocalDate } from "../domain/dates";
import { minorToMajor, parseAmountInput } from "../domain/money";
import { DateRange, FixedMonthlyExpense } from "../domain/types";
import { useMarkFixedExpensePaid } from "../queries/useMarkFixedExpensePaid";
import AmountInput from "./AmountInput";
import { useSheetClose } from "./useSheetClose";

export interface MarkAsPaidTarget {
  fixedExpense: FixedMonthlyExpense;
  expectedAmountMinor: number;
}

interface MarkAsPaidSheetProps {
  target: MarkAsPaidTarget | null;
  period: DateRange;
  onClose: () => void;
  onPaid: () => void;
}

/**
 * A small, purpose-built confirmation sheet — not the full QuickAddSheet.
 * The only decision here is "how much did this actually cost" (defaulting
 * to the expected amount); category/date/type aren't editable, since
 * they're fixed by the expense itself and by "paid today".
 */
export default function MarkAsPaidSheet({ target, period, onClose, onPaid }: MarkAsPaidSheetProps) {
  const { locale, t } = useLocale();
  const markFixedExpensePaid = useMarkFixedExpensePaid();

  const [amountInput, setAmountInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const amountRef = useRef<HTMLInputElement>(null);

  const { visible, requestClose } = useSheetClose(Boolean(target), onClose);

  useEffect(() => {
    if (!target) return;
    setAmountInput(String(minorToMajor(target.expectedAmountMinor)));
    setError(null);
    const raf = requestAnimationFrame(() => amountRef.current?.focus());
    return () => cancelAnimationFrame(raf);
  }, [target]);

  useEffect(() => {
    if (!target) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") requestClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [target, requestClose]);

  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (target) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    } else {
      previouslyFocusedRef.current?.focus();
    }
  }, [target]);

  if (!target) return null;

  const handleConfirm = async () => {
    const amountMinor = parseAmountInput(amountInput);
    if (amountMinor === null) {
      setError(t("finance.quickAdd.error.amount"));
      amountRef.current?.focus();
      return;
    }
    try {
      await markFixedExpensePaid.mutateAsync({
        fixedExpenseId: target.fixedExpense.id,
        period,
        amountMinor,
        date: todayLocalDate(),
      });
      onPaid();
      requestClose();
    } catch {
      setError(t("finance.quickAdd.error.saveFailed"));
    }
  };

  // Rendered via a portal straight onto document.body rather than in
  // place: unlike QuickAddSheet (mounted once at FinanceApp's top level),
  // this component is invoked from inside Dashboard — several levels deep
  // inside the app's own scrollable content container. `position: fixed`
  // is supposed to ignore all of that and pin to the true viewport
  // regardless of DOM nesting, but a portal removes any dependency on that
  // holding true across every ancestor (any transform/filter/etc. added
  // to something in between later would otherwise silently change this
  // sheet's containing block) — the standard, robust way to keep a modal
  // overlay's positioning independent of wherever it happens to be
  // invoked in the tree, rather than re-litigating every ancestor's CSS
  // each time this is touched.
  return createPortal(
    <div className="fixed inset-0 z-20 flex items-end justify-center">
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity motion-reduce:transition-none ${visible ? "opacity-100" : "opacity-0"}`}
        onClick={requestClose}
        aria-hidden="true"
      />
      <div
        dir={dirFor(locale)}
        role="dialog"
        aria-modal="true"
        aria-label={t("finance.fixedExpenses.markAsPaid")}
        className={`relative flex max-h-[85dvh] w-full max-w-lg flex-col overflow-y-auto rounded-t-2xl border-t border-finance-border bg-finance-surface px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 transition-transform duration-200 motion-reduce:transition-none ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <p className="mb-1 text-center text-sm text-finance-muted">{t("finance.fixedExpenses.markAsPaid")}</p>
        <h2 className="mb-4 text-center text-lg font-semibold text-finance-text">{target.fixedExpense.name}</h2>

        <AmountInput
          ref={amountRef}
          value={amountInput}
          onChange={setAmountInput}
          aria-invalid={Boolean(error)}
        />

        {error && (
          <p role="alert" className="mt-2 text-center text-sm text-finance-expense">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleConfirm}
          disabled={markFixedExpensePaid.isPending}
          className="mt-5 w-full rounded-xl bg-finance-accent py-3 text-center font-semibold text-white disabled:opacity-60"
        >
          {t("finance.fixedExpenses.confirmPaid")}
        </button>
      </div>
    </div>,
    document.body,
  );
}
