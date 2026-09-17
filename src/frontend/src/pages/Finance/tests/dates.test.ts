import { describe, expect, it } from "vitest";
import { addMonths, formatMonthLabel, monthKey, todayLocalDate } from "../domain/dates";

describe("todayLocalDate", () => {
  it("returns a YYYY-MM-DD string", () => {
    expect(todayLocalDate()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("monthKey", () => {
  it("extracts the YYYY-MM prefix from a date", () => {
    expect(monthKey("2026-09-17")).toBe("2026-09");
  });
});

describe("addMonths", () => {
  it("adds months within the same year", () => {
    expect(addMonths("2026-01", 2)).toBe("2026-03");
  });

  it("subtracts months within the same year", () => {
    expect(addMonths("2026-09", -3)).toBe("2026-06");
  });

  it("rolls forward across a year boundary", () => {
    expect(addMonths("2026-11", 3)).toBe("2027-02");
  });

  it("rolls backward across a year boundary", () => {
    expect(addMonths("2026-01", -1)).toBe("2025-12");
  });

  it("rolls backward across multiple year boundaries", () => {
    expect(addMonths("2026-01", -13)).toBe("2024-12");
  });

  it("is a no-op with delta 0", () => {
    expect(addMonths("2026-09", 0)).toBe("2026-09");
  });
});

describe("formatMonthLabel", () => {
  it("formats an English month label", () => {
    expect(formatMonthLabel("2026-09", "en")).toBe("September 2026");
  });

  it("formats a Persian-language month label using the Gregorian calendar and Western digits", () => {
    const label = formatMonthLabel("2026-09", "fa");
    // Must stay Gregorian (year 2026), not switch to the Solar Hijri year (~1405),
    // and must use Western digits — both explicit design decisions.
    expect(label).toContain("2026");
    expect(label).not.toMatch(/[۰-۹]/);
  });
});
