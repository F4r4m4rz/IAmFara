import { describe, expect, it } from "vitest";
import { formatMoney, majorToMinor, minorToMajor, parseAmountInput } from "../domain/money";

describe("majorToMinor / minorToMajor", () => {
  it("converts major to minor units", () => {
    expect(majorToMinor(129.5)).toBe(12950);
    expect(majorToMinor(1)).toBe(100);
    expect(majorToMinor(0)).toBe(0);
  });

  it("rounds to the nearest minor unit to avoid float drift", () => {
    expect(majorToMinor(19.99)).toBe(1999);
    expect(majorToMinor(0.1 + 0.2)).toBe(30); // classic float trap: 0.1+0.2 = 0.30000000000000004
  });

  it("round-trips back to major units", () => {
    expect(minorToMajor(12950)).toBe(129.5);
  });
});

describe("formatMoney", () => {
  it("formats an integer minor-unit amount as currency", () => {
    const formatted = formatMoney(12950, "en");
    expect(formatted).toContain("129.50");
    expect(formatted).toContain("NOK");
  });

  it("forces Western (latn) digits for the Persian locale", () => {
    const formatted = formatMoney(12950, "fa");
    expect(formatted).toMatch(/[0-9]/);
    expect(formatted).not.toMatch(/[۰-۹]/); // no Extended Arabic-Indic digits
  });

  it("formats zero correctly", () => {
    expect(formatMoney(0, "en")).toContain("0.00");
  });

  it("formats negative amounts (e.g. a remaining shortfall)", () => {
    expect(formatMoney(-5000, "en")).toContain("50.00");
    expect(formatMoney(-5000, "en")).toMatch(/-|\(/); // some sign of negativity
  });
});

describe("parseAmountInput", () => {
  it("parses a plain integer amount", () => {
    expect(parseAmountInput("150")).toBe(15000);
  });

  it("parses a decimal amount with a period", () => {
    expect(parseAmountInput("129.50")).toBe(12950);
  });

  it("parses a decimal amount with a comma", () => {
    expect(parseAmountInput("129,50")).toBe(12950);
  });

  it("tolerates surrounding/internal whitespace", () => {
    expect(parseAmountInput("  1 250  ")).toBe(125000);
  });

  it("rejects empty input", () => {
    expect(parseAmountInput("")).toBeNull();
    expect(parseAmountInput("   ")).toBeNull();
  });

  it("rejects zero and negative amounts", () => {
    expect(parseAmountInput("0")).toBeNull();
    expect(parseAmountInput("-5")).toBeNull();
  });

  it("rejects non-numeric input", () => {
    expect(parseAmountInput("abc")).toBeNull();
    expect(parseAmountInput("12.5.6")).toBeNull();
  });

  it("rejects more than two decimal places", () => {
    expect(parseAmountInput("12.505")).toBeNull();
  });
});
