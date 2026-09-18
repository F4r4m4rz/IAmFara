import { LayoutDashboard, List, Plus, Settings as SettingsIcon, Tag } from "lucide-react";
import { NavLink } from "react-router-dom";
import { T, useLocale } from "../../../i18n";

const BASE = "/expenses/demo";

const TABS = [
  { to: BASE, end: true, icon: LayoutDashboard, labelKey: "finance.nav.dashboard" },
  { to: `${BASE}/transactions`, end: false, icon: List, labelKey: "finance.nav.transactions" },
  // The "+" tab sits visually between these two — see the central button below.
  { to: `${BASE}/categories`, end: false, icon: Tag, labelKey: "finance.nav.categories" },
  { to: `${BASE}/settings`, end: false, icon: SettingsIcon, labelKey: "finance.nav.settings" },
];

export default function BottomNav({ onAdd }: { onAdd: () => void }) {
  const { t } = useLocale();

  return (
    // Its own `fixed` element — not a flex child inside another `fixed`
    // ancestor (see FinanceApp.tsx) — so its background is what extends to
    // the true screen edge, with env(safe-area-inset-bottom) applied
    // exactly once, inside that background via padding.
    //
    // `bottom` is a *negative* env(safe-area-inset-bottom) rather than 0:
    // in an installed iOS standalone PWA, `bottom: 0` on a fixed element
    // appears to already resolve above the home-indicator safe area (iOS
    // reserving that strip for itself the way it does for the swipe-up
    // gesture zone), not at the true bottom edge — on top of this
    // padding-bottom already reserving the same distance for the nav's
    // own content to clear it, that left an empty gap between the nav and
    // the screen's actual bottom equal to roughly the inset. Shifting the
    // box down by that same amount closes it, so the background — not a
    // gap — is what actually touches the true edge. Unlike padding, this
    // shift does not need to hold content clear of anything, so it isn't
    // needed at all where env() is 0 (Android/desktop/regular Safari
    // tabs), and is inert there.
    <nav className="fixed inset-x-0 bottom-[calc(-1*env(safe-area-inset-bottom))] z-10 flex items-center justify-around border-t border-finance-border bg-finance-surface px-2 pb-[calc(0.375rem+env(safe-area-inset-bottom))] pt-2">
      {TABS.slice(0, 2).map((tab) => (
        <NavTab key={tab.to} {...tab} />
      ))}

      <button
        type="button"
        onClick={onAdd}
        aria-label={t("finance.nav.addTransaction")}
        className="-mt-8 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-finance-accent text-white shadow-lg shadow-finance-accent/30 transition-transform active:scale-95"
      >
        <Plus size={26} />
      </button>

      {TABS.slice(2).map((tab) => (
        <NavTab key={tab.to} {...tab} />
      ))}
    </nav>
  );
}

function NavTab({ to, end, icon: Icon, labelKey }: (typeof TABS)[number]) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-xs ${
          isActive ? "text-finance-accentText" : "text-finance-muted"
        }`
      }
    >
      <Icon size={20} />
      <T k={labelKey} />
    </NavLink>
  );
}
