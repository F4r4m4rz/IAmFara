import { Locale } from "../../../i18n";

/**
 * All date handling here works on plain "YYYY-MM-DD"/"YYYY-MM" strings, not
 * `Date` objects — a transaction date is the user's intended local calendar
 * date, and string operations can't accidentally shift it across a
 * timezone boundary the way `Date`/UTC conversions can. `Date` is only ever
 * constructed transiently, for display formatting, from values already
 * known to be local-safe (see `formatMonthLabel`/`addMonths` below).
 */

/** Today's date as "YYYY-MM-DD", in the browser's local timezone. */
export function todayLocalDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Shifts a "YYYY-MM" month key by `delta` months (negative goes back). */
export function addMonths(month: string, delta: number): string {
  const [year, monthNum] = month.split("-").map(Number);
  const zeroBased = monthNum - 1 + delta;
  const newYear = year + Math.floor(zeroBased / 12);
  const newMonth = ((zeroBased % 12) + 12) % 12;
  return `${newYear}-${String(newMonth + 1).padStart(2, "0")}`;
}

/** A locale-appropriate "Month YYYY" label (e.g. "September 2026" / Persian-language month names for "fa"). */
export function formatMonthLabel(month: string, locale: Locale): string {
  const [year, monthNum] = month.split("-").map(Number);
  // new Date(year, monthIndex, 1) is constructed in local time — no UTC/ISO
  // parsing involved, so this can't drift across a day/month boundary.
  const date = new Date(year, monthNum - 1, 1);
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    // Persian ("fa") ICU locales default to the Solar Hijri calendar, which
    // would show a different year/month than the Gregorian dates actually
    // stored — forcing "gregory" keeps the *language* Persian while keeping
    // the calendar consistent with the stored "YYYY-MM-DD" values.
    calendar: "gregory",
    numberingSystem: "latn",
  }).format(date);
}
