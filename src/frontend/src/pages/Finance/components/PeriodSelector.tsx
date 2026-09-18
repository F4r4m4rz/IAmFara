import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "../../../i18n";
import { addPeriods, currentPeriodId, formatPeriodLabel, formatPeriodRange } from "../domain/financialPeriod";

export default function PeriodSelector({
  period,
  startDay,
  onChange,
}: {
  period: string;
  startDay: number;
  onChange: (period: string) => void;
}) {
  const { locale, t } = useLocale();
  const isCurrentPeriod = period === currentPeriodId(startDay);

  return (
    <div className="flex items-center justify-between rounded-xl border border-finance-border bg-finance-surface px-3 py-2">
      <button
        type="button"
        onClick={() => onChange(addPeriods(period, -1))}
        aria-label={t("finance.dashboard.period.previous")}
        className="rounded-lg p-1.5 text-finance-muted hover:text-finance-text"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        type="button"
        onClick={() => onChange(currentPeriodId(startDay))}
        className="flex flex-col items-center disabled:text-finance-text"
        disabled={isCurrentPeriod}
      >
        <span className="text-sm font-medium" dir="ltr">
          {formatPeriodLabel(period, locale)}
        </span>
        <span className="text-xs text-finance-muted" dir="ltr">
          {formatPeriodRange(period, startDay, locale)}
        </span>
      </button>
      <button
        type="button"
        onClick={() => onChange(addPeriods(period, 1))}
        aria-label={t("finance.dashboard.period.next")}
        className="rounded-lg p-1.5 text-finance-muted hover:text-finance-text"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
