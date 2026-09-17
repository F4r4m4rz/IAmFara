import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { dirFor, useLocale } from "../../i18n";
import BottomNav from "./components/BottomNav";
import QuickAddSheet from "./components/QuickAddSheet";
import Toast from "./components/Toast";
import { IndexedDbFinanceRepository } from "./data/IndexedDbFinanceRepository";
import Categories from "./pages/Categories";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import TransactionHistory from "./pages/TransactionHistory";
import { RepositoryProvider } from "./RepositoryContext";

/**
 * Top-level route for the finance demo (`/expenses/demo`). Deliberately not
 * wrapped in the portfolio's <Layout> (see App.tsx) — this renders its own
 * full-viewport shell with a bottom nav, so it feels like its own app
 * rather than a section of the portfolio.
 */
export default function FinanceApp() {
  const { locale, t } = useLocale();
  // Created once per mount, not at module scope — avoids holding a Dexie
  // connection open for the lifetime of the whole site when the user has
  // never visited the finance app.
  const [queryClient] = useState(() => new QueryClient());
  const [repository] = useState(() => new IndexedDbFinanceRepository());

  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-dismisses the success toast — deliberately not a dialog the user
  // has to acknowledge (see Toast.tsx).
  useEffect(() => {
    if (!toastMessage) return;
    const timeout = setTimeout(() => setToastMessage(null), 1800);
    return () => clearTimeout(timeout);
  }, [toastMessage]);

  return (
    <QueryClientProvider client={queryClient}>
      <RepositoryProvider repository={repository}>
        <div
          dir={dirFor(locale)}
          className="relative flex h-screen w-screen flex-col bg-finance-bg font-sans text-finance-text"
        >
          <div className="flex-1 overflow-y-auto">
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="transactions" element={<TransactionHistory />} />
              <Route path="categories" element={<Categories />} />
              <Route path="settings" element={<Settings />} />
            </Routes>
          </div>
          <BottomNav onAdd={() => setQuickAddOpen(true)} />

          <QuickAddSheet
            open={quickAddOpen}
            onClose={() => setQuickAddOpen(false)}
            onSaved={() => setToastMessage(t("finance.quickAdd.saved"))}
          />
          {toastMessage && <Toast message={toastMessage} />}
        </div>
      </RepositoryProvider>
    </QueryClientProvider>
  );
}
