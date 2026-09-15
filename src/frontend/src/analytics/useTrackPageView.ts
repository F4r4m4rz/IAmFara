import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Records one page view per route change. React Router only reaches the
 * server on the very first document load, so every subsequent client-side
 * navigation needs this same-origin beacon to be counted. Fire-and-forget by
 * design: a failed or blocked call must never affect the page itself.
 */
export function useTrackPageView() {
  const location = useLocation();

  useEffect(() => {
    const body = JSON.stringify({ path: location.pathname });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/analytics/visit",
        new Blob([body], { type: "application/json" }),
      );
      return;
    }

    fetch("/api/analytics/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {
      // Page views are non-critical telemetry; nothing to recover here.
    });
  }, [location.pathname]);
}
