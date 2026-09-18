/**
 * Gathers real, live values for the ?debugLayout=1 diagnostic panel
 * (components/DebugLayoutPanel.tsx) — built to actually settle the
 * installed-iOS-PWA bottom-nav layout bug with evidence instead of another
 * guess, since this environment has no device to check it on directly.
 * Everything here reads the DOM/browser APIs as they exist *right now*;
 * none of it is cached or assumed stable across a resize/scroll/keyboard
 * event, which is exactly the class of bug being investigated.
 */

export const BOTTOM_NAV_ID = "finance-bottom-nav";
export const SAFE_AREA_TOP_PROBE_ID = "finance-safe-area-top-probe";
export const SAFE_AREA_BOTTOM_PROBE_ID = "finance-safe-area-bottom-probe";

export interface VisualViewportSnapshot {
  height: number;
  offsetTop: number;
  pageTop: number;
  scale: number;
}

export interface BottomNavSnapshot {
  rect: { top: number; bottom: number; height: number } | null;
  computedPosition: string | null;
  computedBottom: string | null;
  computedPaddingTop: string | null;
  computedPaddingBottom: string | null;
}

export interface SafeAreaSnapshot {
  /** The computed padding of a hidden probe element whose padding is set to env(safe-area-inset-*) — the only way to read that value out into JS. */
  top: string;
  bottom: string;
}

export interface MetaTagSnapshot {
  name: string;
  content: string;
}

export interface ServiceWorkerSnapshot {
  activeScriptUrl: string | null;
  waitingScriptUrl: string | null;
}

export interface LayoutDiagnosticsSnapshot {
  timestamp: string;
  buildSha: string;
  /** Service workers (and so the update-available banner) require a secure context — false here on an HTTP-only host (e.g. devtest) fully explains an absent/never-updating service worker without guessing. */
  isSecureContext: boolean;
  navigatorStandalone: boolean | null;
  displayModeStandalone: boolean;
  windowInnerHeight: number;
  documentClientHeight: number;
  windowScrollY: number;
  visualViewport: VisualViewportSnapshot | null;
  bottomNav: BottomNavSnapshot;
  safeArea: SafeAreaSnapshot;
  metaTags: MetaTagSnapshot[];
  serviceWorker: ServiceWorkerSnapshot;
}

function readBottomNav(): BottomNavSnapshot {
  const nav = document.getElementById(BOTTOM_NAV_ID);
  if (!nav) {
    return {
      rect: null,
      computedPosition: null,
      computedBottom: null,
      computedPaddingTop: null,
      computedPaddingBottom: null,
    };
  }
  const rect = nav.getBoundingClientRect();
  const computed = getComputedStyle(nav);
  return {
    rect: { top: rect.top, bottom: rect.bottom, height: rect.height },
    computedPosition: computed.position,
    computedBottom: computed.bottom,
    computedPaddingTop: computed.paddingTop,
    computedPaddingBottom: computed.paddingBottom,
  };
}

function readSafeArea(): SafeAreaSnapshot {
  const topProbe = document.getElementById(SAFE_AREA_TOP_PROBE_ID);
  const bottomProbe = document.getElementById(SAFE_AREA_BOTTOM_PROBE_ID);
  return {
    top: topProbe ? getComputedStyle(topProbe).paddingTop : "probe not mounted",
    bottom: bottomProbe ? getComputedStyle(bottomProbe).paddingBottom : "probe not mounted",
  };
}

// Deliberately narrow: only the tags actually relevant to iOS PWA display
// behavior, not every meta tag on the page (og:, description, etc.).
const TRACKED_META_SELECTOR = 'meta[name="viewport"], meta[name^="apple-"], meta[name="theme-color"]';

function readMetaTags(): MetaTagSnapshot[] {
  return Array.from(document.querySelectorAll<HTMLMetaElement>(TRACKED_META_SELECTOR)).map((el) => ({
    name: el.getAttribute("name") ?? "",
    content: el.getAttribute("content") ?? "",
  }));
}

function readVisualViewport(): VisualViewportSnapshot | null {
  const vv = window.visualViewport;
  if (!vv) return null;
  return { height: vv.height, offsetTop: vv.offsetTop, pageTop: vv.pageTop, scale: vv.scale };
}

/** Everything readable synchronously — pair with gatherServiceWorkerSnapshot(), which is inherently async, and merge the two. */
export function gatherLayoutDiagnostics(): Omit<LayoutDiagnosticsSnapshot, "serviceWorker"> {
  return {
    timestamp: new Date().toISOString(),
    buildSha: __COMMIT_SHA__,
    isSecureContext: window.isSecureContext,
    navigatorStandalone: typeof navigator.standalone === "boolean" ? navigator.standalone : null,
    displayModeStandalone: window.matchMedia("(display-mode: standalone)").matches,
    windowInnerHeight: window.innerHeight,
    documentClientHeight: document.documentElement.clientHeight,
    windowScrollY: window.scrollY,
    visualViewport: readVisualViewport(),
    bottomNav: readBottomNav(),
    safeArea: readSafeArea(),
    metaTags: readMetaTags(),
  };
}

export async function gatherServiceWorkerSnapshot(): Promise<ServiceWorkerSnapshot> {
  if (!("serviceWorker" in navigator)) return { activeScriptUrl: null, waitingScriptUrl: null };
  try {
    const registration = await navigator.serviceWorker.getRegistration("/expenses/demo/");
    return {
      activeScriptUrl: registration?.active?.scriptURL ?? null,
      waitingScriptUrl: registration?.waiting?.scriptURL ?? null,
    };
  } catch {
    return { activeScriptUrl: null, waitingScriptUrl: null };
  }
}

/** The only part of this module meaningfully unit-testable without a real DOM/browser — everything above is a thin, direct read of one. */
export function formatDiagnosticsText(snapshot: LayoutDiagnosticsSnapshot): string {
  const lines: string[] = [
    `timestamp: ${snapshot.timestamp}`,
    `buildSha: ${snapshot.buildSha}`,
    `isSecureContext: ${snapshot.isSecureContext}`,
    `navigator.standalone: ${snapshot.navigatorStandalone}`,
    `display-mode standalone: ${snapshot.displayModeStandalone}`,
    `window.innerHeight: ${snapshot.windowInnerHeight}`,
    `document.documentElement.clientHeight: ${snapshot.documentClientHeight}`,
    `window.scrollY: ${snapshot.windowScrollY}`,
  ];

  if (snapshot.visualViewport) {
    lines.push(
      `visualViewport.height: ${snapshot.visualViewport.height}`,
      `visualViewport.offsetTop: ${snapshot.visualViewport.offsetTop}`,
      `visualViewport.pageTop: ${snapshot.visualViewport.pageTop}`,
      `visualViewport.scale: ${snapshot.visualViewport.scale}`,
    );
  } else {
    lines.push("visualViewport: unavailable");
  }

  lines.push(
    `bottomNav.rect: ${snapshot.bottomNav.rect ? JSON.stringify(snapshot.bottomNav.rect) : "not found in DOM"}`,
    `bottomNav computed position: ${snapshot.bottomNav.computedPosition ?? "n/a"}`,
    `bottomNav computed bottom: ${snapshot.bottomNav.computedBottom ?? "n/a"}`,
    `bottomNav computed paddingTop: ${snapshot.bottomNav.computedPaddingTop ?? "n/a"}`,
    `bottomNav computed paddingBottom: ${snapshot.bottomNav.computedPaddingBottom ?? "n/a"}`,
    `safe-area-inset-top (measured): ${snapshot.safeArea.top}`,
    `safe-area-inset-bottom (measured): ${snapshot.safeArea.bottom}`,
    "meta tags:",
    ...snapshot.metaTags.map((m) => `  ${m.name}: ${m.content}`),
    `service worker active: ${snapshot.serviceWorker.activeScriptUrl ?? "none"}`,
    `service worker waiting: ${snapshot.serviceWorker.waitingScriptUrl ?? "none"}`,
  );

  return lines.join("\n");
}
