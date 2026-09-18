import { Locale } from "../../../i18n";
import { addMonths, formatMonthLabel, todayLocalDate } from "./dates";

/**
 * A financial period is identified the same way a calendar month is — a
 * "YYYY-MM" id — but naming the month its *start date* falls in, not the
 * month containing most of its days. E.g. with startDay=11, the period
 * "2026-09" runs 2026-09-11 to 2026-10-10 and is labeled "September",
 * matching how a household actually talks about "this month's" bills even
 * though the period spans two calendar months.
 *
 * This id scheme is what lets period *navigation* reuse addMonths/
 * formatMonthLabel unchanged — moving to the next period is always "next
 * month's id", regardless of startDay; only the actual date *range* within
 * a period depends on startDay (see periodDateRange/dateToPeriodId below).
 * Every screen re-derives its period boundaries from these pure functions
 * rather than storing one anywhere, which is what makes changing the
 * start-day setting safe — nothing needs migrating, everything just
 * recomputes on the next render.
 */

function daysInMonth(year: number, monthNum: number): number {
  return new Date(year, monthNum, 0).getDate();
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Clamps a configured start day (1-31) to the last valid day of a given month — e.g. 31 in February becomes 28 (or 29). */
export function clampDayToMonth(day: number, year: number, monthNum: number): number {
  return Math.min(day, daysInMonth(year, monthNum));
}

/** The first calendar date ("YYYY-MM-DD") of the financial period identified by `periodId` ("YYYY-MM"). */
export function periodStartDate(periodId: string, startDay: number): string {
  const [year, monthNum] = periodId.split("-").map(Number);
  const day = clampDayToMonth(startDay, year, monthNum);
  return `${year}-${pad(monthNum)}-${pad(day)}`;
}

/** The last calendar date ("YYYY-MM-DD") of the financial period — the day before the next period's start. */
export function periodEndDate(periodId: string, startDay: number): string {
  const nextStart = periodStartDate(addMonths(periodId, 1), startDay);
  const [year, monthNum, day] = nextStart.split("-").map(Number);
  // Date normalizes day 0 to the last day of the previous month — exactly
  // "the day before nextStart" without any manual month-length handling.
  const prev = new Date(year, monthNum - 1, day - 1);
  return `${prev.getFullYear()}-${pad(prev.getMonth() + 1)}-${pad(prev.getDate())}`;
}

export function periodDateRange(periodId: string, startDay: number): { fromDate: string; toDate: string } {
  return { fromDate: periodStartDate(periodId, startDay), toDate: periodEndDate(periodId, startDay) };
}

/** Which financial period a given "YYYY-MM-DD" date belongs to. */
export function dateToPeriodId(date: string, startDay: number): string {
  const [year, monthNum, day] = date.split("-").map(Number);
  const clampedStart = clampDayToMonth(startDay, year, monthNum);
  const thisMonthId = `${year}-${pad(monthNum)}`;
  return day >= clampedStart ? thisMonthId : addMonths(thisMonthId, -1);
}

export function currentPeriodId(startDay: number): string {
  return dateToPeriodId(todayLocalDate(), startDay);
}

/** Shifts a period id by `delta` periods — identical to addMonths since periods are keyed by their start month. */
export const addPeriods = addMonths;

/** A locale-appropriate "Month YYYY"-style label for the period (e.g. "September 2026"). */
export function formatPeriodLabel(periodId: string, locale: Locale): string {
  return formatMonthLabel(periodId, locale);
}

/** A compact "11 Sep – 10 Oct" range label for the period, in the given locale. */
export function formatPeriodRange(periodId: string, startDay: number, locale: Locale): string {
  const { fromDate, toDate } = periodDateRange(periodId, startDay);
  const formatter = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    calendar: "gregory",
    numberingSystem: "latn",
  });
  const format = (date: string) => {
    const [y, m, d] = date.split("-").map(Number);
    return formatter.format(new Date(y, m - 1, d));
  };
  return `${format(fromDate)} – ${format(toDate)}`;
}
