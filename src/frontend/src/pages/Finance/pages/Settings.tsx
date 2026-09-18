import { LucideIcon, Repeat, RotateCcw, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { dirFor, T, useLocale } from "../../../i18n";
import DemoModeBadge from "../components/DemoModeBadge";
import { currentPeriodId, formatPeriodRange } from "../domain/financialPeriod";
import { useLoadSampleData } from "../queries/useLoadSampleData";
import { useResetAll } from "../queries/useResetAll";
import { useRestoreDefaultCategories } from "../queries/useRestoreDefaultCategories";
import { useSettings } from "../queries/useSettings";
import { useUpdateSettings } from "../queries/useUpdateSettings";

function SettingsButton({
  icon: Icon,
  label,
  onClick,
  pending,
  danger,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  pending: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className={`flex w-full items-center gap-3 rounded-xl border bg-finance-surface px-4 py-3 text-start text-sm disabled:opacity-60 ${
        danger ? "border-finance-expense/40 text-finance-expense" : "border-finance-border text-finance-text"
      }`}
    >
      <Icon size={17} />
      {label}
    </button>
  );
}

function LanguageSetting() {
  const { locale, setLocale, t } = useLocale();

  return (
    <section className="mt-6">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-finance-muted">
        <T k="finance.settings.language.heading" />
      </h2>
      <div
        role="group"
        aria-label={t("finance.settings.language.heading")}
        className="flex rounded-xl bg-finance-surface p-1"
      >
        <button
          type="button"
          aria-pressed={locale === "en"}
          onClick={() => setLocale("en")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            locale === "en" ? "bg-finance-accent text-white" : "text-finance-muted"
          }`}
        >
          English
        </button>
        <button
          type="button"
          aria-pressed={locale === "fa"}
          onClick={() => setLocale("fa")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            locale === "fa" ? "bg-finance-accent text-white" : "text-finance-muted"
          }`}
        >
          فارسی
        </button>
      </div>
    </section>
  );
}

function FinancialPeriodSetting() {
  const { locale } = useLocale();
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();
  const startDay = settings?.financialPeriodStartDay ?? 1;
  const [inputValue, setInputValue] = useState(String(startDay));

  // Keep the field in sync if the stored value changes from elsewhere
  // (e.g. loaded on a different tab), but don't fight the user's typing.
  useEffect(() => {
    setInputValue(String(startDay));
  }, [startDay]);

  const commit = (raw: string) => {
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 31) {
      setInputValue(String(startDay));
      return;
    }
    if (parsed !== startDay) updateSettings.mutate({ financialPeriodStartDay: parsed });
  };

  return (
    <section className="mt-6">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-finance-muted">
        <T k="finance.settings.financialPeriod.heading" />
      </h2>
      <div className="rounded-xl border border-finance-border bg-finance-surface px-4 py-3">
        <label htmlFor="financial-period-start-day" className="block text-sm text-finance-text">
          <T k="finance.settings.financialPeriod.startsOn" />
        </label>
        <div className="mt-2 flex items-center gap-2">
          <input
            id="financial-period-start-day"
            type="number"
            min={1}
            max={31}
            inputMode="numeric"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onBlur={(event) => commit(event.target.value)}
            className="w-20 rounded-lg border border-finance-border bg-finance-bg px-3 py-2 text-base sm:text-sm text-finance-text outline-none focus:border-finance-accent"
          />
          <span className="text-xs text-finance-muted">
            <T k="finance.settings.financialPeriod.dayOfMonth" />
          </span>
        </div>
        <p className="mt-2 text-xs text-finance-muted" dir="ltr">
          {formatPeriodRange(currentPeriodId(startDay), startDay, locale)}
        </p>
      </div>
    </section>
  );
}

export default function Settings({ showToast }: { showToast: (message: string) => void }) {
  const { locale, t } = useLocale();
  const loadSampleData = useLoadSampleData();
  const resetAll = useResetAll();
  const restoreDefaultCategories = useRestoreDefaultCategories();

  const handleLoadSampleData = async () => {
    await loadSampleData.mutateAsync();
    showToast(t("finance.settings.sampleDataLoaded"));
  };

  const handleReset = async () => {
    if (!window.confirm(t("finance.settings.confirmReset"))) return;
    await resetAll.mutateAsync();
    showToast(t("finance.settings.resetDone"));
  };

  const handleRestoreDefaults = async () => {
    await restoreDefaultCategories.mutateAsync();
    showToast(t("finance.settings.categoriesRestored"));
  };

  return (
    <div dir={dirFor(locale)} className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-4 text-lg font-semibold">
        <T k="finance.settings.heading" />
      </h1>

      <DemoModeBadge />

      <LanguageSetting />

      <FinancialPeriodSetting />

      <section className="mt-6">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-finance-muted">
          <T k="finance.settings.fixedExpensesSection" />
        </h2>
        <Link
          to="/expenses/demo/fixed-expenses"
          className="flex w-full items-center gap-3 rounded-xl border border-finance-border bg-finance-surface px-4 py-3 text-start text-sm text-finance-text"
        >
          <Repeat size={17} />
          <T k="finance.settings.manageFixedExpenses" />
        </Link>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-finance-muted">
          <T k="finance.settings.demoData" />
        </h2>
        <div className="space-y-2">
          <SettingsButton
            icon={Sparkles}
            label={t("finance.settings.loadSampleData")}
            onClick={handleLoadSampleData}
            pending={loadSampleData.isPending}
          />
          <SettingsButton
            icon={RotateCcw}
            label={t("finance.settings.restoreDefaultCategories")}
            onClick={handleRestoreDefaults}
            pending={restoreDefaultCategories.isPending}
          />
          <SettingsButton
            icon={Trash2}
            label={t("finance.settings.resetDemo")}
            onClick={handleReset}
            pending={resetAll.isPending}
            danger
          />
        </div>
        <p className="mt-3 text-xs text-finance-muted">
          <T k="finance.settings.demoDataHint" />
        </p>
      </section>
    </div>
  );
}
