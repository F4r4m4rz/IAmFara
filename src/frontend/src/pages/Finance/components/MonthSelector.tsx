import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "../../../i18n";
import { addMonths, currentMonthKey, formatMonthLabel } from "../domain/dates";

export default function MonthSelector({ month, onChange }: { month: string; onChange: (month: string) => void }) {
  const { locale, t } = useLocale();
  const isCurrentMonth = month === currentMonthKey();

  return (
    <div className="flex items-center justify-between rounded-xl border border-finance-border bg-finance-surface px-3 py-2">
      <button
        type="button"
        onClick={() => onChange(addMonths(month, -1))}
        aria-label={t("finance.dashboard.month.previous")}
        className="rounded-lg p-1.5 text-finance-muted hover:text-finance-text"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        type="button"
        onClick={() => onChange(currentMonthKey())}
        className="text-sm font-medium disabled:text-finance-text"
        disabled={isCurrentMonth}
      >
        <span dir="ltr">{formatMonthLabel(month, locale)}</span>
      </button>
      <button
        type="button"
        onClick={() => onChange(addMonths(month, 1))}
        aria-label={t("finance.dashboard.month.next")}
        className="rounded-lg p-1.5 text-finance-muted hover:text-finance-text"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
