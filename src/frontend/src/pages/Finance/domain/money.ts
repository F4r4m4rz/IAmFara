import { Locale } from "../../../i18n";

/**
 * Single currency constant for V1 — isolated here so formatting/calculation
 * code never hard-codes "NOK" inline, and adding more currencies later only
 * touches this file.
 */
export const CURRENCY = "NOK";

const MINOR_UNITS_PER_MAJOR = 100;

/**
 * Money is always stored/calculated as an integer count of the smallest
 * currency unit (øre) — never a float — so repeated addition/subtraction
 * across many transactions can't accumulate floating-point drift. Only
 * `formatMoney` ever converts back to a major-unit display string.
 */
export function formatMoney(amountMinor: number, locale: Locale): string {
  const major = amountMinor / MINOR_UNITS_PER_MAJOR;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: CURRENCY,
    // Forces Western digits for both locales — Persian would otherwise
    // silently render Arabic-Indic digits, which V1 deliberately doesn't
    // support (see the plan's money/dates section).
    numberingSystem: "latn",
  }).format(major);
}

export function majorToMinor(majorAmount: number): number {
  return Math.round(majorAmount * MINOR_UNITS_PER_MAJOR);
}

export function minorToMajor(amountMinor: number): number {
  return amountMinor / MINOR_UNITS_PER_MAJOR;
}

/**
 * Parses a user-typed amount (quick-add's amount field) into minor units,
 * or null if it isn't a valid positive amount. Accepts either "." or ","
 * as the decimal separator so it doesn't fight a Norwegian user's habits,
 * and tolerates surrounding whitespace and a thousands-separator space.
 */
export function parseAmountInput(raw: string): number | null {
  const cleaned = raw.trim().replace(/\s/g, "").replace(",", ".");
  if (cleaned === "") return null;
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;

  const major = Number.parseFloat(cleaned);
  if (!Number.isFinite(major) || major <= 0) return null;

  return majorToMinor(major);
}
