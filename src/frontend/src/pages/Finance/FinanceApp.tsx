import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Route, Routes, useSearchParams } from "react-router-dom";
import { dirFor, useLocale } from "../../i18n";
import BottomNav from "./components/BottomNav";
import DebugLayoutPanel from "./components/DebugLayoutPanel";
import QuickAddSheet from "./components/QuickAddSheet";
import Toast from "./components/Toast";
import UpdateAvailableBanner from "./components/UpdateAvailableBanner";
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
  const { needRefresh, applyUpdate } = usePwaRegistration();
  const [searchParams] = useSearchParams();
  const debugLayout = searchParams.get("debugLayout") === "1";
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
          // A plain, non-positioned wrapper — just carries dir/colors/font
          // for everything inside. Both real children below are their own
          // independent `fixed` elements (see the content div and
          // BottomNav.tsx) rather than this being a `fixed` flex container
          // with BottomNav as a flex child relying on its parent's box edge
          // for its position: nesting a "flush with the bottom" flex item
          // inside an already-`fixed` ancestor is exactly the pattern where
          // iOS can apply its own safe-area adjustment to the *fixed*
          // element on top of an explicit env(safe-area-inset-bottom)
          // already in that element's own padding, double-counting it. A
          // bottom nav that's directly `fixed; bottom: 0` itself — not a
          // flex child of another fixed box — is the standard, unambiguous
          // way every production app-shell avoids that. See
          // usePwaRegistration.ts for the matching html/body overflow lock.
          className="bg-finance-bg font-sans text-finance-text"
        >
          {/* pt: clears the status bar (index.html's viewport-fit=cover
              makes this render edge-to-edge under it). pb: generously
              clears BottomNav's own height (padding + icon/label row +
              the FAB protruding above it) plus the home-indicator safe
              area, so the last card's content — including a "Mark as
              paid" button — can always scroll fully clear of the nav. */}
          <div className="fixed inset-0 overflow-y-auto pt-[env(safe-area-inset-top)] pb-[calc(6rem+env(safe-area-inset-bottom))]">
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
          {needRefresh && <UpdateAvailableBanner onRefresh={applyUpdate} />}
          {debugLayout && <DebugLayoutPanel />}
        </div>
      </RepositoryProvider>
    </QueryClientProvider>
  );
}
