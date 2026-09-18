import { useEffect, useRef, useState } from "react";
import {
  formatDiagnosticsText,
  gatherLayoutDiagnostics,
  gatherServiceWorkerSnapshot,
  LayoutDiagnosticsSnapshot,
  SAFE_AREA_BOTTOM_PROBE_ID,
  SAFE_AREA_TOP_PROBE_ID,
} from "../domain/layoutDiagnostics";

const COPIED_MESSAGE_MS = 1500;

/**
 * Opt-in diagnostic overlay (?debugLayout=1, see FinanceApp.tsx) built to
 * actually settle the installed-iOS-PWA bottom-nav layout bug with real,
 * live values instead of another guess from an environment with no device
 * to check it on. Deliberately positioned and styled independently of the
 * app's own layout primitives (plain `fixed`, no reliance on the app
 * shell/safe-area classes under investigation), so it stays legible
 * regardless of whatever the bug turns out to be.
 */
export default function DebugLayoutPanel() {
  const [snapshot, setSnapshot] = useState<LayoutDiagnosticsSnapshot | null>(null);
  const [copied, setCopied] = useState(false);
  const rafRef = useRef<number | null>(null);
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    let cancelled = false;

    const refresh = () => {
      const sync = gatherLayoutDiagnostics();
      gatherServiceWorkerSnapshot().then((serviceWorker) => {
        if (!cancelled) setSnapshot({ ...sync, serviceWorker });
      });
    };

    // Scroll fires far more often than the underlying values actually
    // change — coalesce to one gather per frame so this doesn't itself
    // become a source of jank on the real device it's meant to debug.
    const scheduleRefresh = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        refresh();
      });
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") refresh();
    };

    refresh();
    window.addEventListener("resize", scheduleRefresh);
    window.addEventListener("scroll", scheduleRefresh, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.visualViewport?.addEventListener("resize", scheduleRefresh);
    window.visualViewport?.addEventListener("scroll", scheduleRefresh);

    return () => {
      cancelled = true;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", scheduleRefresh);
      window.removeEventListener("scroll", scheduleRefresh);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.visualViewport?.removeEventListener("resize", scheduleRefresh);
      window.visualViewport?.removeEventListener("scroll", scheduleRefresh);
    };
  }, []);

  useEffect(() => () => clearTimeout(copiedTimeoutRef.current), []);

  const handleCopy = async () => {
    if (!snapshot) return;
    try {
      await navigator.clipboard.writeText(formatDiagnosticsText(snapshot));
      setCopied(true);
      copiedTimeoutRef.current = setTimeout(() => setCopied(false), COPIED_MESSAGE_MS);
    } catch {
      // Clipboard API can be unavailable/denied — the panel's text is
      // still fully readable/selectable by hand, so this isn't fatal.
    }
  };

  return (
    <>
      {/* Hidden probes: getComputedStyle is the only way to read an env()
          value out into JS. Exist purely to be measured — never visible,
          never affecting layout. */}
      <div
        id={SAFE_AREA_TOP_PROBE_ID}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          paddingTop: "env(safe-area-inset-top)",
          visibility: "hidden",
          pointerEvents: "none",
        }}
      />
      <div
        id={SAFE_AREA_BOTTOM_PROBE_ID}
        aria-hidden="true"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: 0,
          height: 0,
          paddingBottom: "env(safe-area-inset-bottom)",
          visibility: "hidden",
          pointerEvents: "none",
        }}
      />

      <div
        role="region"
        aria-label="Layout diagnostics"
        style={{ position: "fixed", insetInline: 8, top: 8, zIndex: 2147483647, maxHeight: "70dvh" }}
        className="overflow-y-auto rounded-xl border border-lime-400/40 bg-black/90 p-3 font-mono text-[11px] leading-relaxed text-lime-300 shadow-2xl"
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="font-semibold text-white">Layout diagnostics</span>
          <button
            type="button"
            onClick={handleCopy}
            className="flex-shrink-0 rounded-md bg-lime-300/20 px-2 py-1 text-[11px] font-medium text-lime-200"
          >
            {copied ? "Copied!" : "Copy Diagnostics"}
          </button>
        </div>
        {snapshot ? (
          <pre className="whitespace-pre-wrap break-all">{formatDiagnosticsText(snapshot)}</pre>
        ) : (
          <p>Gathering…</p>
        )}
      </div>
    </>
  );
}
