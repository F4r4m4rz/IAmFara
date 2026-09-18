import { useLocale } from "../../../i18n";
import { ForecastSummary as ForecastSummaryData } from "../domain/fixedExpenses";
import { formatMoney } from "../domain/money";

function StatCell({ label, value, tone }: { label: string; value: string; tone: "income" | "expense" | "muted" }) {
  const toneClass = tone === "income" ? "text-finance-income" : tone === "expense" ? "text-finance-expense" : "text-finance-text";
  return (
    <div className="rounded-xl border border-finance-border bg-finance-surface p-3">
      <p className="text-[11px] text-finance-muted">{label}</p>
      <p className={`mt-1 text-sm font-semibold ${toneClass}`} dir="ltr">
        {value}
      </p>
    </div>
  );
}

/**
 * The Dashboard's headline numbers, with a deliberate hierarchy: Expected
 * remaining (the forecast — the feature's whole point, "how much do we
 * actually have left once what's still coming is accounted for") is the
 * biggest figure; Current balance (the undisputed actual number) is
 * secondary; Income/Paid expenses/Upcoming fixed are small supporting
 * figures. Actual vs Forecast is labeled explicitly on both of the first
 * two, not left implicit.
 */
export default function ForecastSummary({ forecast }: { forecast: ForecastSummaryData }) {
  const { locale, t } = useLocale();

  return (
    <div className="mb-4 space-y-3">
      <div className="rounded-2xl border border-finance-border bg-finance-surfaceElevated p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-finance-accentText">
          {t("finance.dashboard.forecast.label")}
        </p>
        <p className="mt-0.5 text-xs text-finance-muted">{t("finance.dashboard.expectedRemaining")}</p>
        <p className="mt-1 text-3xl font-bold tracking-tight" dir="ltr">
          {formatMoney(forecast.expectedRemainingMinor, locale)}
        </p>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-finance-border bg-finance-surface px-4 py-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-finance-muted">
            {t("finance.dashboard.actual.label")}
          </p>
          <p className="text-xs text-finance-muted">{t("finance.dashboard.currentBalance")}</p>
        </div>
        <p className="text-lg font-semibold" dir="ltr">
          {formatMoney(forecast.currentBalanceMinor, locale)}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatCell label={t("finance.dashboard.income")} value={formatMoney(forecast.incomeMinor, locale)} tone="income" />
        <StatCell
          label={t("finance.dashboard.paidExpenses")}
          value={formatMoney(forecast.paidExpenseMinor, locale)}
          tone="expense"
        />
        <StatCell
          label={t("finance.dashboard.upcomingFixed")}
          value={formatMoney(forecast.upcomingFixedMinor, locale)}
          tone="muted"
        />
      </div>
    </div>
  );
}
