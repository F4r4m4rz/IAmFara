import { useEffect } from "react";

const SW_URL = "/finance-sw.js";
const SCOPE = "/expenses/demo/";
const THEME_COLOR = "#0b0f14";
const APPLE_TOUCH_ICON_HREF = "/finance-icons/apple-touch-icon.png";

/**
 * Wires up PWA installability/offline support only while the finance app
 * is mounted. This is one shared SPA bundle serving both the portfolio and
 * the finance app, so a couple of notes on scoping:
 *
 * - The manifest `<link>` itself is injected sitewide by vite-plugin-pwa
 *   at build time (its `injectRegister: false` option only suppresses the
 *   service-worker registration script, not the manifest link — there's
 *   no separate toggle for that). This isn't the leak it sounds like: the
 *   manifest's own `scope`/`start_url` are set to /expenses/demo/, and per
 *   the Web App Manifest spec browsers only consider a page installable
 *   under a manifest whose scope actually contains that page — so the
 *   portfolio's other pages stay non-installable via this manifest despite
 *   the tag being present. Not worth fighting the plugin's HTML injection
 *   to remove a tag that's already functionally inert elsewhere.
 * - Everything below (theme-color, the service worker registration, the
 *   iOS-specific tags) has no such spec-level scoping, so all of it is
 *   added/removed here manually, only for the lifetime of this component,
 *   so none of it leaks onto the portfolio's own pages.
 */
export function usePwaRegistration() {
  useEffect(() => {
    const themeColorMeta = document.createElement("meta");
    themeColorMeta.name = "theme-color";
    themeColorMeta.content = THEME_COLOR;
    document.head.appendChild(themeColorMeta);

    // iOS Safari has never reliably read the web manifest for home-screen
    // install metadata — these tags are the documented way to get a proper
    // icon and standalone (no browser chrome) launch there.
    const appleTouchIcon = document.createElement("link");
    appleTouchIcon.rel = "apple-touch-icon";
    appleTouchIcon.href = APPLE_TOUCH_ICON_HREF;
    document.head.appendChild(appleTouchIcon);

    const appleCapableMeta = document.createElement("meta");
    appleCapableMeta.name = "apple-mobile-web-app-capable";
    appleCapableMeta.content = "yes";
    document.head.appendChild(appleCapableMeta);

    const appleStatusBarMeta = document.createElement("meta");
    appleStatusBarMeta.name = "apple-mobile-web-app-status-bar-style";
    appleStatusBarMeta.content = "black-translucent";
    document.head.appendChild(appleStatusBarMeta);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register(SW_URL, { scope: SCOPE }).catch(() => {
        // Offline support is a progressive enhancement (also simply absent
        // in `npm run dev`, since finance-sw.js only exists in a
        // production build) — a failed registration must never block the
        // app itself.
      });
    }

    return () => {
      themeColorMeta.remove();
      appleTouchIcon.remove();
      appleCapableMeta.remove();
      appleStatusBarMeta.remove();
    };
  }, []);
}
