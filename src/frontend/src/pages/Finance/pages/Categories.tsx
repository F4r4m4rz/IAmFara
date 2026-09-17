import { dirFor, T, useLocale } from "../../../i18n";
import { useCategories } from "../queries/useCategories";

/** Placeholder listing — add/rename/delete land in a later phase. */
export default function Categories() {
  const { locale, t } = useLocale();
  const { data: categories = [] } = useCategories();

  return (
    <div dir={dirFor(locale)} className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-4 text-lg font-semibold">
        <T k="finance.categories.heading" />
      </h1>
      <ul className="space-y-1.5">
        {categories.map((category) => (
          <li
            key={category.id}
            className="rounded-lg border border-finance-border bg-finance-surface px-3 py-2 text-sm"
          >
            {category.labelKey ? t(category.labelKey) : category.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
