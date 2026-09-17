import { T } from "../../../i18n";

/** Subtle, not intrusive — a small pill, not a banner or a dialog. */
export default function DemoModeBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-finance-border bg-finance-surface px-2.5 py-1 text-[11px] text-finance-muted">
      <span className="h-1.5 w-1.5 rounded-full bg-finance-accent" />
      <T k="finance.demoMode.badge" />
    </span>
  );
}
