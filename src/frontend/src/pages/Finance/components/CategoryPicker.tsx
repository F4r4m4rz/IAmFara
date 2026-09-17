import { useLocale } from "../../../i18n";
import { sortByRecency } from "../data/recentCategories";
import { Category } from "../domain/types";
import { iconForCategory } from "./categoryIcons";

export default function CategoryPicker({
  categories,
  selectedId,
  onSelect,
}: {
  categories: Category[];
  selectedId: string | null;
  onSelect: (categoryId: string) => void;
}) {
  const { t } = useLocale();
  const sorted = sortByRecency(categories);

  return (
    <div role="group" className="grid grid-cols-4 gap-2">
      {sorted.map((category) => {
        const Icon = iconForCategory(category.id);
        const label = category.labelKey ? t(category.labelKey) : category.name ?? "";
        const selected = category.id === selectedId;

        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.id)}
            aria-pressed={selected}
            className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center transition-colors ${
              selected
                ? "border-finance-accent bg-finance-accent/10 text-finance-accent"
                : "border-finance-border bg-finance-surface text-finance-muted hover:text-finance-text"
            }`}
          >
            <Icon size={20} />
            <span className="line-clamp-1 text-[11px] leading-tight">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
