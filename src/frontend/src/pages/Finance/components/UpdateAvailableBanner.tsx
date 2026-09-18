import { RefreshCw } from "lucide-react";
import { useLocale } from "../../../i18n";

/**
 * Shown when usePwaRegistration() detects a new service worker has
 * installed and is ready to take over — deliberately a persistent, tappable
 * banner rather than the auto-dismissing Toast, since this needs the user
 * to actually act on it (or it'll just apply on the next relaunch anyway).
 */
export default function UpdateAvailableBanner({ onRefresh }: { onRefresh: () => void }) {
  const { t } = useLocale();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-30 flex justify-center px-4">
      <button
        type="button"
        onClick={onRefresh}
        className="animate-pop-in pointer-events-auto flex items-center gap-2 rounded-full bg-finance-accent px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-finance-accent/30"
      >
        <RefreshCw size={15} />
        {t("finance.update.available")}
      </button>
    </div>
  );
}
