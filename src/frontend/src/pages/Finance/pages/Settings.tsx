import { LucideIcon, RotateCcw, Sparkles, Trash2 } from "lucide-react";
import { dirFor, T, useLocale } from "../../../i18n";
import DemoModeBadge from "../components/DemoModeBadge";
import { useLoadSampleData } from "../queries/useLoadSampleData";
import { useResetAll } from "../queries/useResetAll";
import { useRestoreDefaultCategories } from "../queries/useRestoreDefaultCategories";

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
