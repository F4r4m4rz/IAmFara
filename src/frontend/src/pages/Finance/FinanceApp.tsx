import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { dirFor, useLocale } from "../../i18n";
import BottomNav from "./components/BottomNav";
import QuickAddSheet from "./components/QuickAddSheet";
import Toast from "./components/Toast";
import { IndexedDbFinanceRepository } from "./data/IndexedDbFinanceRepository";
import { Transaction } from "./domain/types";
import Categories from "./pages/Categories";
import Dashboard from "./pages/Dashboard";
import FixedExpenses from "./pages/FixedExpenses";
import Settings from "./pages/Settings";
import TransactionHistory from "./pages/TransactionHistory";
import { RepositoryProvider } from "./RepositoryContext";
import { usePwaRegistration } from "./usePwaRegistration";

/**
 * Top-level route for the finance demo (`/expenses/demo`). Deliberately not
 * wrapped in the portfolio's <Layout> (see App.tsx) — this renders its own
 * full-viewport shell with a bottom nav, so it feels like its own app
 * rather than a section of the portfolio.
 */
export default function FinanceApp() {
  const { locale, t } = useLocale();
  usePwaRegistration();
  // Created once per mount, not at module scope — avoids holding a Dexie
  // connection open for the lifetime of the whole site when the user has
  // never visited the finance app.
  const [queryClient] = useState(() => new QueryClient());
  const [repository] = useState(() => new IndexedDbFinanceRepository());

  // null sheetOpen + null editingTransaction = closed. editingTransaction
  // set = edit mode; sheetOpen true with editingTransaction null = add mode.
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-dismisses the success toast — deliberately not a dialog the user
  // has to acknowledge (see Toast.tsx).
  useEffect(() => {
    if (!toastMessage) return;
    const timeout = setTimeout(() => setToastMessage(null), 1800);
    return () => clearTimeout(timeout);
  }, [toastMessage]);

  const closeSheet = () => {
    setSheetOpen(false);
    setEditingTransaction(null);
  };
  const openAdd = () => setSheetOpen(true);
  const openEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setSheetOpen(true);
  };
  const showToast = (message: string) => setToastMessage(message);

  return (
    <QueryClientProvider client={queryClient}>
      <RepositoryProvider repository={repository}>
        <div
          dir={dirFor(locale)}
          className="relative flex h-screen w-screen flex-col bg-finance-bg font-sans text-finance-text"
        >
          <div className="flex-1 overflow-y-auto">
            <Routes>
              <Route index element={<Dashboard onAddTransaction={openAdd} onEditTransaction={openEdit} showToast={showToast} />} />
              <Route path="transactions" element={<TransactionHistory onEditTransaction={openEdit} />} />
              <Route path="categories" element={<Categories />} />
              <Route path="fixed-expenses" element={<FixedExpenses showToast={showToast} />} />
              <Route path="settings" element={<Settings showToast={showToast} />} />
            </Routes>
          </div>
          <BottomNav onAdd={openAdd} />

          <QuickAddSheet
            open={sheetOpen}
            editingTransaction={editingTransaction}
            onClose={closeSheet}
            onSaved={() => showToast(t("finance.quickAdd.saved"))}
            onDeleted={() => showToast(t("finance.quickAdd.deleted"))}
          />
          {toastMessage && <Toast message={toastMessage} />}
        </div>
      </RepositoryProvider>
    </QueryClientProvider>
  );
}
