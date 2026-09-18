import { describe, expect, it } from "vitest";
import {
  addPeriods,
  clampDayToMonth,
  currentPeriodId,
  dateToPeriodId,
  formatPeriodRange,
  periodDateRange,
  periodEndDate,
  periodStartDate,
} from "../domain/financialPeriod";

describe("clampDayToMonth", () => {
  it("keeps a day that fits within the month", () => {
    expect(clampDayToMonth(11, 2026, 9)).toBe(11);
  });

  it("clamps to the last valid day when the month is shorter (Feb, non-leap year)", () => {
    expect(clampDayToMonth(31, 2026, 2)).toBe(28);
  });

  it("clamps correctly in a leap year", () => {
    expect(clampDayToMonth(31, 2028, 2)).toBe(29);
  });
});

describe("periodStartDate / periodEndDate / periodDateRange", () => {
  it("matches the spec's own example: startDay=11 -> 11 Sep to 10 Oct", () => {
    expect(periodStartDate("2026-09", 11)).toBe("2026-09-11");
    expect(periodEndDate("2026-09", 11)).toBe("2026-10-10");
    expect(periodDateRange("2026-09", 11)).toEqual({ fromDate: "2026-09-11", toDate: "2026-10-10" });
  });

  it("collapses to plain calendar-month boundaries when startDay=1", () => {
    expect(periodDateRange("2026-09", 1)).toEqual({ fromDate: "2026-09-01", toDate: "2026-09-30" });
    expect(periodDateRange("2026-02", 1)).toEqual({ fromDate: "2026-02-01", toDate: "2026-02-28" });
  });

  it("clamps the start day at both ends of a period spanning a short month", () => {
    // startDay=31: January's clamped start is 31 itself, February's clamps to 28 (2026 is not a leap year).
    expect(periodDateRange("2026-01", 31)).toEqual({ fromDate: "2026-01-31", toDate: "2026-02-27" });
  });

  it("produces contiguous, non-overlapping ranges across period boundaries", () => {
    const startDay = 11;
    const sep = periodDateRange("2026-09", startDay);
    const oct = periodDateRange("2026-10", startDay);
    expect(sep.toDate).toBe("2026-10-10");
    expect(oct.fromDate).toBe("2026-10-11");
  });
});

describe("dateToPeriodId", () => {
  it("assigns a date on or after the start day to that month's period", () => {
    expect(dateToPeriodId("2026-09-11", 11)).toBe("2026-09");
    expect(dateToPeriodId("2026-09-30", 11)).toBe("2026-09");
  });

  it("assigns a date before the start day to the previous month's period", () => {
    expect(dateToPeriodId("2026-09-10", 11)).toBe("2026-08");
    expect(dateToPeriodId("2026-10-01", 11)).toBe("2026-09");
  });

  it("always returns the date's own calendar month when startDay=1", () => {
    expect(dateToPeriodId("2026-09-01", 1)).toBe("2026-09");
    expect(dateToPeriodId("2026-09-30", 1)).toBe("2026-09");
  });

  it("handles the Feb 31 clamp: late-Feb dates still belong to the January-started period", () => {
    expect(dateToPeriodId("2026-02-27", 31)).toBe("2026-01");
    expect(dateToPeriodId("2026-02-28", 31)).toBe("2026-02");
  });
});

describe("currentPeriodId", () => {
  it("returns a well-formed YYYY-MM id", () => {
    expect(currentPeriodId(1)).toMatch(/^\d{4}-\d{2}$/);
  });
});

describe("addPeriods", () => {
  it("shifts forward and backward by whole periods, independent of startDay", () => {
    expect(addPeriods("2026-09", 1)).toBe("2026-10");
    expect(addPeriods("2026-09", -1)).toBe("2026-08");
    expect(addPeriods("2026-12", 1)).toBe("2027-01");
  });
});

describe("formatPeriodRange", () => {
  it("formats a compact day-month range in English", () => {
    expect(formatPeriodRange("2026-09", 11, "en")).toBe("Sep 11 – Oct 10");
  });
});
