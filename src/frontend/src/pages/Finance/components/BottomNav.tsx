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
    // Its own `fixed; bottom: 0` element — not a flex child inside another
    // `fixed` ancestor (see FinanceApp.tsx) — so its background extends to
    // the true screen edge, with env(safe-area-inset-bottom) applied
    // exactly once, inside that background via padding. (A prior attempt
    // shifted `bottom` to a negative env() offset instead, on the theory
    // that standalone mode pre-reserves the home-indicator strip on its
    // own — that's backwards: an installed iOS PWA's content genuinely
    // covers the full physical screen, and env(safe-area-inset-bottom) is
    // the *only* signal reserving room for the indicator, confirmed
    // against a real shipping PWA that hit and fixed this same bug. `bottom:
    // 0` is correct.)
    //
    // env(safe-area-inset-bottom) is wrapped in min(34px, …): a
    // documented WebKit quirk lets this value read inflated on an
    // installed PWA's cold launch, before settling to the device's real
    // inset shortly after — 34px is the actual inset on every current
    // Face-ID iPhone in portrait, so capping there discards only the
    // erroneous inflated reading, never the real one.
    <nav className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-around border-t border-finance-border bg-finance-surface px-2 pb-[calc(0.375rem+min(34px,env(safe-area-inset-bottom)))] pt-2">
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
