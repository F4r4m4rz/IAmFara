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
    <nav className="relative flex items-center justify-around border-t border-finance-border bg-finance-surface px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
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
