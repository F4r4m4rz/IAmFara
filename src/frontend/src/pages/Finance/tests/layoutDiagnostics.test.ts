import { describe, expect, it } from "vitest";
import { formatDiagnosticsText, LayoutDiagnosticsSnapshot } from "../domain/layoutDiagnostics";

function makeSnapshot(overrides: Partial<LayoutDiagnosticsSnapshot> = {}): LayoutDiagnosticsSnapshot {
  return {
    timestamp: "2026-09-18T00:00:00.000Z",
    buildSha: "abc1234",
    isSecureContext: true,
    navigatorStandalone: true,
    displayModeStandalone: true,
    windowInnerHeight: 844,
    documentClientHeight: 844,
    windowScrollY: 0,
    visualViewport: { height: 844, offsetTop: 0, pageTop: 0, scale: 1 },
    bottomNav: {
      rect: { top: 780, bottom: 844, height: 64 },
      computedPosition: "fixed",
      computedBottom: "0px",
      computedPaddingTop: "8px",
      computedPaddingBottom: "40px",
    },
    safeArea: { top: "47px", bottom: "34px" },
    metaTags: [{ name: "viewport", content: "width=device-width, initial-scale=1.0, viewport-fit=cover" }],
    serviceWorker: { activeScriptUrl: "https://iamfara.com/finance-sw.js", waitingScriptUrl: null },
    ...overrides,
  };
}

describe("formatDiagnosticsText", () => {
  it("includes every top-level field's value", () => {
    const text = formatDiagnosticsText(makeSnapshot());
    expect(text).toContain("buildSha: abc1234");
    expect(text).toContain("isSecureContext: true");
    expect(text).toContain("navigator.standalone: true");
    expect(text).toContain("display-mode standalone: true");
    expect(text).toContain("window.innerHeight: 844");
    expect(text).toContain("window.scrollY: 0");
    expect(text).toContain("visualViewport.height: 844");
    expect(text).toContain("safe-area-inset-top (measured): 47px");
    expect(text).toContain("safe-area-inset-bottom (measured): 34px");
    expect(text).toContain("service worker active: https://iamfara.com/finance-sw.js");
    expect(text).toContain("service worker waiting: none");
  });

  it("includes the bottom nav's rect and computed styles", () => {
    const text = formatDiagnosticsText(makeSnapshot());
    expect(text).toContain('bottomNav.rect: {"top":780,"bottom":844,"height":64}');
    expect(text).toContain("bottomNav computed position: fixed");
    expect(text).toContain("bottomNav computed paddingBottom: 40px");
  });

  it("lists every tracked meta tag", () => {
    const text = formatDiagnosticsText(
      makeSnapshot({
        metaTags: [
          { name: "viewport", content: "width=device-width" },
          { name: "apple-mobile-web-app-capable", content: "yes" },
        ],
      }),
    );
    expect(text).toContain("viewport: width=device-width");
    expect(text).toContain("apple-mobile-web-app-capable: yes");
  });

  it("surfaces an insecure context — the actual reason no service worker registers on an HTTP-only host like devtest", () => {
    const text = formatDiagnosticsText(
      makeSnapshot({
        isSecureContext: false,
        serviceWorker: { activeScriptUrl: null, waitingScriptUrl: null },
      }),
    );
    expect(text).toContain("isSecureContext: false");
    expect(text).toContain("service worker active: none");
  });

  it("handles a missing bottom nav element without throwing", () => {
    const text = formatDiagnosticsText(
      makeSnapshot({
        bottomNav: {
          rect: null,
          computedPosition: null,
          computedBottom: null,
          computedPaddingTop: null,
          computedPaddingBottom: null,
        },
      }),
    );
    expect(text).toContain("bottomNav.rect: not found in DOM");
    expect(text).toContain("bottomNav computed position: n/a");
  });

  it("handles an unavailable visualViewport without throwing", () => {
    const text = formatDiagnosticsText(makeSnapshot({ visualViewport: null }));
    expect(text).toContain("visualViewport: unavailable");
  });
});
