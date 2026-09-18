import { useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

const THEME_COLOR = "#0b0f14";
const APPLE_TOUCH_ICON_HREF = "/finance-icons/apple-touch-icon.png";
const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000; // matches vite-plugin-pwa's own documented pattern

/**
 * Wires up PWA installability/offline support, and update detection, only
 * while the finance app is mounted. This is one shared SPA bundle serving
 * both the portfolio and the finance app, so a couple of notes on scoping:
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
 * - theme-color and the apple-touch-icon link have no such spec-level
 *   scoping, so they're added/removed here manually, only for the
 *   lifetime of this component, so neither leaks onto the portfolio's own
 *   pages. The apple-mobile-web-app-capable / status-bar-style meta tags
 *   used to be injected the same way here, but iOS needs those present in
 *   the *initial* HTML (before this effect ever runs) to reliably honor
 *   them when the page is added to the home screen — they're now baked
 *   into a dedicated expenses-demo.html at build time instead (see
 *   vite.config.ts's financeAppHtml plugin and Program.cs's route-scoped
 *   fallback), so adding them here too would just be a duplicate.
 *
 * The service worker itself is registered via vite-plugin-pwa's
 * virtual:pwa-register/react helper rather than a raw
 * navigator.serviceWorker.register() call — that's what surfaces
 * `needRefresh` when a new version has installed in the background, so
 * FinanceApp can show a "tap to refresh" prompt instead of the previous
 * silent-until-the-next-full-relaunch behavior.
 */
export function usePwaRegistration() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      // The browser only checks the service worker script for changes on
      // navigation/registration by default (at most once every ~24h in
      // most browsers) — polling registration.update() periodically means
      // a session left open for a long time still finds out about a new
      // deploy without needing a full close-and-reopen.
      if (!registration) return;
      setInterval(() => registration.update(), UPDATE_CHECK_INTERVAL_MS);
    },
    onRegisterError() {
      // Offline support/update-checking is a progressive enhancement (also
      // simply absent in `npm run dev`, since finance-sw.js only exists in
      // a production build) — a failed registration must never block the
      // app itself.
    },
  });

  useEffect(() => {
    // The finance app's own shell is a `fixed inset-0` element with its own
    // single scroll container (see FinanceApp.tsx) — html/body must not be
    // independently scrollable while it's mounted, or an iOS rubber-band
    // bounce on the *document* (not the app's own scroll container) can
    // drag the whole fixed shell along with it, which is what let the
    // header/bottom-nav drift out of position. Scoped to this component's
    // lifetime and restored on unmount so the portfolio's own pages (which
    // rely on normal document scrolling) are unaffected.
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

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

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      themeColorMeta.remove();
      appleTouchIcon.remove();
    };
  }, []);

  return { needRefresh, applyUpdate: () => updateServiceWorker() };
}
