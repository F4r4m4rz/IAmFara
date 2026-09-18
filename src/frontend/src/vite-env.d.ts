/// <reference types="vite-plugin-pwa/react" />

/** Injected at build time by vite.config.ts's `define` — see resolveCommitSha() there. */
declare const __COMMIT_SHA__: string;

interface Navigator {
  /** iOS Safari only (non-standard) — true when launched from a home-screen icon. */
  standalone?: boolean;
}
