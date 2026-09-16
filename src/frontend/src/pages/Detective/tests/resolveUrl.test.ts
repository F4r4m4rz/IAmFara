import { describe, expect, it } from "vitest";
import { normalizeUrl, resolveUrl } from "../fakeweb/resolveUrl";

describe("normalizeUrl", () => {
  it("strips protocol", () => {
    expect(normalizeUrl("https://northstar.net")).toBe("northstar.net");
    expect(normalizeUrl("http://northstar.net")).toBe("northstar.net");
  });

  it("strips a leading www.", () => {
    expect(normalizeUrl("www.northstar.net")).toBe("northstar.net");
  });

  it("strips a trailing slash", () => {
    expect(normalizeUrl("northstar.net/archive/2003/")).toBe("northstar.net/archive/2003");
  });

  it("lowercases and trims whitespace", () => {
    expect(normalizeUrl("  Northstar.NET/Archive/2003  ")).toBe("northstar.net/archive/2003");
  });

  it("combines all normalizations at once", () => {
    expect(normalizeUrl(" HTTPS://WWW.Northstar.net/Archive/2003/ ")).toBe("northstar.net/archive/2003");
  });
});

describe("resolveUrl", () => {
  const pages = {
    "northstar.net": { url: "northstar.net", label: "home" },
    "northstar.net/archive/2003": { url: "northstar.net/archive/2003", label: "archive" },
  };

  it("finds a page by its exact normalized url", () => {
    expect(resolveUrl("northstar.net", pages)?.label).toBe("home");
  });

  it("finds a page ignoring protocol/www/trailing-slash/case variation", () => {
    expect(resolveUrl("HTTPS://www.Northstar.net/Archive/2003/", pages)?.label).toBe("archive");
  });

  it("returns null for an unknown address", () => {
    expect(resolveUrl("example.com", pages)).toBeNull();
  });
});
