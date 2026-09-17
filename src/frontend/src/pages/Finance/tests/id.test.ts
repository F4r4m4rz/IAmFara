import { afterEach, describe, expect, it, vi } from "vitest";
import { generateId } from "../domain/id";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("generateId", () => {
  it("returns a non-empty string", () => {
    const id = generateId();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });

  it("returns unique values across many calls", () => {
    const ids = new Set(Array.from({ length: 1000 }, () => generateId()));
    expect(ids.size).toBe(1000);
  });

  it("falls back to a manual id when crypto.randomUUID is unavailable — the exact situation this app hit on a plain-HTTP host (no secure context)", () => {
    vi.stubGlobal("crypto", {});
    const id = generateId();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });

  it("fallback ids are also unique across many calls", () => {
    vi.stubGlobal("crypto", {});
    const ids = new Set(Array.from({ length: 500 }, () => generateId()));
    expect(ids.size).toBe(500);
  });
});
