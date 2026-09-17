import { useLocale, T } from "../../../i18n";
import { CategoryTotal } from "../domain/calculations";
import { formatMoney } from "../domain/money";
import { Category } from "../domain/types";

/**
 * Hand-rolled SVG donut (no charting library — see the plan's confirmed
 * decision). Built from concentric stroke-dasharray arcs on a single
 * circle radius, one arc per category, rather than a library so it stays
 * tiny and RTL is a non-issue (percentages/labels are just normal DOM text
 * next to it, not baked into the SVG's own layout direction).
 */
const PALETTE = ["#6366f1", "#34d399", "#f59e0b", "#f87171", "#38bdf8", "#a78bfa", "#fb923c", "#4ade80"];
const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function CategoryBreakdownChart({
  breakdown,
  categories,
}: {
  breakdown: CategoryTotal[];
  categories: Category[];
}) {
  const { locale, t } = useLocale();
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const totalMinor = breakdown.reduce((sum, item) => sum + item.totalMinor, 0);

  if (breakdown.length === 0 || totalMinor === 0) {
    return <p className="text-center text-sm text-finance-muted"><T k="finance.dashboard.noExpenses" /></p>;
  }

  let cumulative = 0;

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 100 100" className="h-28 w-28 flex-shrink-0 -rotate-90" role="img" aria-hidden="true">
        {breakdown.map((item, index) => {
          const length = (item.totalMinor / totalMinor) * CIRCUMFERENCE;
          const dashoffset = -cumulative;
          cumulative += length;
          return (
            <circle
              key={item.categoryId}
              cx="50"
              cy="50"
              r={RADIUS}
              fill="none"
              stroke={PALETTE[index % PALETTE.length]}
              strokeWidth="14"
              strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
              strokeDashoffset={dashoffset}
            />
          );
        })}
      </svg>
      <ul className="min-w-0 flex-1 space-y-1.5">
        {breakdown.slice(0, 6).map((item, index) => {
          const category = categoryById.get(item.categoryId);
          const label = category ? (category.labelKey ? t(category.labelKey) : category.name) : item.categoryId;
          const percent = Math.round((item.totalMinor / totalMinor) * 100);
          return (
            <li key={item.categoryId} className="flex items-center gap-2 text-xs">
              <span
                className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                style={{ backgroundColor: PALETTE[index % PALETTE.length] }}
              />
              <span className="min-w-0 flex-1 truncate text-finance-text">{label}</span>
              <span dir="ltr" className="flex-shrink-0 text-finance-muted">
                {formatMoney(item.totalMinor, locale)}
              </span>
              <span className="w-8 flex-shrink-0 text-end text-finance-muted">{percent}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
