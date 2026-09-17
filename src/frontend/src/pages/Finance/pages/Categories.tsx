import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { dirFor, T, useLocale } from "../../../i18n";
import { iconForCategory } from "../components/categoryIcons";
import { CategoryInUseError, Category, TransactionType } from "../domain/types";
import { useAddCategory } from "../queries/useAddCategory";
import { useCategories } from "../queries/useCategories";
import { useDeleteCategory } from "../queries/useDeleteCategory";
import { useUpdateCategory } from "../queries/useUpdateCategory";

function CategoryListItem({ category, onDelete }: { category: Category; onDelete: (id: string) => void }) {
  const { t } = useLocale();
  const updateCategory = useUpdateCategory();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(category.name ?? "");

  const isCustom = category.labelKey === null;
  const label = category.labelKey ? t(category.labelKey) : category.name ?? "";
  const Icon = iconForCategory(category.id);

  if (editing) {
    return (
      <li className="flex items-center gap-2 rounded-xl border border-finance-accent bg-finance-surface px-3 py-2">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          autoFocus
          className="min-w-0 flex-1 bg-transparent text-sm text-finance-text outline-none"
        />
        <button
          type="button"
          aria-label={t("finance.categories.save")}
          onClick={async () => {
            const name = value.trim();
            if (name) await updateCategory.mutateAsync({ id: category.id, input: { name } });
            setEditing(false);
          }}
          className="text-finance-income"
        >
          <Check size={17} />
        </button>
        <button
          type="button"
          aria-label={t("finance.categories.cancel")}
          onClick={() => {
            setValue(category.name ?? "");
            setEditing(false);
          }}
          className="text-finance-muted"
        >
          <X size={17} />
        </button>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-3 rounded-xl border border-finance-border bg-finance-surface px-3 py-2">
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-finance-bg text-finance-muted">
        <Icon size={16} />
      </span>
      <span className="flex-1 truncate text-sm text-finance-text">{label}</span>
      {isCustom && (
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label={t("finance.categories.rename")}
          className="text-finance-muted hover:text-finance-text"
        >
          <Pencil size={15} />
        </button>
      )}
      <button
        type="button"
        onClick={() => onDelete(category.id)}
        aria-label={t("finance.categories.delete")}
        className="text-finance-muted hover:text-finance-expense"
      >
        <Trash2 size={15} />
      </button>
    </li>
  );
}

function AddCategoryForm({ onAdd }: { onAdd: (name: string) => Promise<unknown> }) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-finance-border px-3 py-2 text-sm text-finance-muted hover:text-finance-text"
      >
        <Plus size={16} />
        <T k="finance.categories.add" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-finance-accent bg-finance-surface px-3 py-2">
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        autoFocus
        placeholder={t("finance.categories.namePlaceholder")}
        className="min-w-0 flex-1 bg-transparent text-sm text-finance-text outline-none placeholder:text-finance-muted"
      />
      <button
        type="button"
        aria-label={t("finance.categories.save")}
        onClick={async () => {
          const name = value.trim();
          if (name) await onAdd(name);
          setValue("");
          setOpen(false);
        }}
        className="text-finance-income"
      >
        <Check size={17} />
      </button>
      <button
        type="button"
        aria-label={t("finance.categories.cancel")}
        onClick={() => {
          setValue("");
          setOpen(false);
        }}
        className="text-finance-muted"
      >
        <X size={17} />
      </button>
    </div>
  );
}

function CategorySection({
  type,
  categories,
  onDelete,
  onAdd,
}: {
  type: TransactionType;
  categories: Category[];
  onDelete: (id: string) => void;
  onAdd: (name: string) => Promise<unknown>;
}) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-finance-muted">
        <T k={`finance.quickAdd.type.${type}`} />
      </h2>
      <ul className="mb-2 space-y-2">
        {categories.map((category) => (
          <CategoryListItem key={category.id} category={category} onDelete={onDelete} />
        ))}
      </ul>
      <AddCategoryForm onAdd={onAdd} />
    </section>
  );
}

export default function Categories() {
  const { locale, t } = useLocale();
  const { data: categories = [] } = useCategories();
  const addCategory = useAddCategory();
  const deleteCategory = useDeleteCategory();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const expenseCategories = categories.filter((c) => c.type === "expense");
  const incomeCategories = categories.filter((c) => c.type === "income");

  const handleDelete = async (id: string) => {
    setDeleteError(null);
    if (!window.confirm(t("finance.categories.confirmDelete"))) return;
    try {
      await deleteCategory.mutateAsync(id);
    } catch (err) {
      if (err instanceof CategoryInUseError) {
        setDeleteError(t("finance.categories.error.inUse", { count: err.transactionCount }));
      } else {
        throw err;
      }
    }
  };

  return (
    <div dir={dirFor(locale)} className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-4 text-lg font-semibold">
        <T k="finance.categories.heading" />
      </h1>

      {deleteError && (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-finance-expense/40 bg-finance-expense/10 px-3 py-2 text-sm text-finance-expense"
        >
          {deleteError}
        </p>
      )}

      <CategorySection
        type="expense"
        categories={expenseCategories}
        onDelete={handleDelete}
        onAdd={(name) => addCategory.mutateAsync({ type: "expense", name })}
      />
      <CategorySection
        type="income"
        categories={incomeCategories}
        onDelete={handleDelete}
        onAdd={(name) => addCategory.mutateAsync({ type: "income", name })}
      />
    </div>
  );
}
