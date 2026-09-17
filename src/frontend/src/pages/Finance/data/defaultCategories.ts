import { Category } from "../domain/types";

/**
 * Seeded once on first launch (and by "restore default categories" in
 * Settings). Each `id` doubles as its i18n key under "finance.category.*"
 * in the translation dictionary — see i18n/index.tsx — which is what keeps
 * category identity stable/untranslated per the spec ("don't use
 * translated labels as domain identifiers").
 */
const EXPENSE_CATEGORY_IDS = [
  "groceries",
  "house",
  "car",
  "restaurant",
  "shopping",
  "child",
  "travel",
  "health",
  "entertainment",
  "other",
] as const;

const INCOME_CATEGORY_IDS = ["salary", "rental-income", "other-income"] as const;

export function defaultCategories(now: string): Category[] {
  const make = (id: string, type: "income" | "expense"): Category => ({
    id,
    type,
    labelKey: `finance.category.${id}`,
    name: null,
    createdAt: now,
  });

  return [
    ...EXPENSE_CATEGORY_IDS.map((id) => make(id, "expense")),
    ...INCOME_CATEGORY_IDS.map((id) => make(id, "income")),
  ];
}
