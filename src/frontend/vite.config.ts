import { execSync } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'
import react from '@vitejs/plugin-react'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { defineConfig, Plugin } from 'vitest/config'
import { VitePWA } from 'vite-plugin-pwa'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// CI (GitHub Actions) always has this set; falls back to the local
// working tree's HEAD for `npm run build` run by hand, and finally to a
// clearly-labeled placeholder if git itself isn't available. Surfaced in
// the finance app's debug-layout panel (?debugLayout=1) specifically so
// "is the installed PWA actually running what I just deployed" is a
// answerable-in-one-glance question instead of a guess.
function resolveCommitSha(): string {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA
  try {
    return execSync('git rev-parse HEAD', { cwd: __dirname }).toString().trim()
  } catch {
    return 'unknown'
  }
}

const APPLE_META_TAGS = [
  '<meta name="apple-mobile-web-app-capable" content="yes">',
  '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">',
].join('\n    ')

/**
 * The finance app (/expenses/demo) needs iOS's proprietary
 * apple-mobile-web-app-* meta tags present in the *initial* HTML — before
 * React runs — for iOS to reliably pick them up when the page is added to
 * the home screen. They can't just be added to the shared index.html
 * unconditionally: that tag affects *any* page added to the home screen,
 * and the portfolio's own pages (Home, Projects, ...) should keep
 * launching in normal Safari chrome, not standalone, when added.
 *
 * So this emits a second static HTML file — a copy of the built
 * index.html with those two tags injected — that both ASP.NET (see
 * Program.cs's route-scoped MapFallbackToFile) and this same config's
 * workbox.navigateFallback below serve specifically for /expenses/demo
 * routes, online and offline alike. One artifact, so the two can't drift
 * out of sync with each other.
 *
 * Runs in writeBundle (after index.html's own asset references and vite-
 * plugin-pwa's manifest-link injection are already finalized) rather than
 * closeBundle, so the file exists on disk before vite-plugin-pwa's own
 * closeBundle-phase precache-manifest generation scans the output
 * directory — Rollup always finishes every plugin's writeBundle before
 * any plugin's closeBundle runs, which is what that ordering depends on.
 */
function financeAppHtml(): Plugin {
  return {
    name: 'finance-app-html',
    apply: 'build',
    writeBundle() {
      const outDir = resolve(__dirname, '../backend/IAmFara.Web/wwwroot')
      const html = readFileSync(resolve(outDir, 'index.html'), 'utf-8')
      const withAppleMeta = html.replace('</head>', `\n    ${APPLE_META_TAGS}\n  </head>`)
      writeFileSync(resolve(outDir, 'expenses-demo.html'), withAppleMeta)
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __COMMIT_SHA__: JSON.stringify(resolveCommitSha()),
  },
  plugins: [
    react(),
    financeAppHtml(),
    // Installability/offline support is deliberately scoped to the finance
    // app (/expenses/demo) only, not the whole portfolio site. This is a
    // single shared SPA bundle/index.html, so the plugin still injects the
    // manifest <link> sitewide (no option to scope that injection itself —
    // see the comment in pages/Finance/usePwaRegistration.ts for why that's
    // still safe). injectRegister is disabled so the service worker is
    // instead registered manually, only while the finance app is mounted,
    // pinned to manifest.scope below.
    VitePWA({
      // 'prompt' rather than 'autoUpdate': the generated register helper
      // (virtual:pwa-register/react, used in usePwaRegistration.ts) only
      // calls onNeedRefresh and waits for the app to call
      // updateServiceWorker() itself — with 'autoUpdate' it reloads the
      // page automatically as soon as a new version is found, which would
      // yank the page out from under whatever the user is doing instead of
      // the "tap to refresh" prompt this is meant to show.
      registerType: 'prompt',
      injectRegister: false,
      filename: 'finance-sw.js',
      manifestFilename: 'finance-manifest.webmanifest',
      includeAssets: ['finance-icons/*.png'],
      manifest: {
        name: 'Finance Tracker (Demo)',
        short_name: 'Finance',
        description: 'A household finance and expense tracker — demo mode, data stays on this device.',
        start_url: '/expenses/demo/',
        scope: '/expenses/demo/',
        display: 'standalone',
        background_color: '#0b0f14',
        theme_color: '#0b0f14',
        icons: [
          { src: '/finance-icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/finance-icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        // No route-based code-splitting exists yet, so the "app shell" is
        // just this one bundle/stylesheet/HTML — caching it offline for
        // the finance app doesn't meaningfully cache anything extra for
        // the rest of the site, since nothing else is served from this SW
        // (registration scope keeps it from intercepting other routes).
        globPatterns: ['**/*.{js,css,html}'],
        // This SW's registration scope (manifest.scope above) already
        // confines it to /expenses/demo/, so this is only ever consulted
        // for navigations already within that scope — no path-conditional
        // logic needed here, unlike Program.cs's routing, which serves
        // every path on the site. Points at the finance-app-specific HTML
        // (see the financeAppHtml plugin above) so an offline launch gets
        // the same apple-mobile-web-app-* tags an online one does.
        navigateFallback: '/expenses-demo.html',
      },
    }),
  ],
  build: {
    outDir: resolve(__dirname, '../backend/IAmFara.Web/wwwroot'),
    emptyOutDir: true,
  },
  server: {
    // Dev-only: production serves the built SPA and the API from the same
    // ASP.NET Core origin (see build.outDir above), so this has no bearing
    // on prod. Lets `npm run dev` talk to a locally running backend as if
    // they were same-origin. Targets the "https" launch profile (7142), not
    // "http" (5020) — the auth/antiforgery cookies are Secure-only, so they
    // simply aren't set at all over a plain-HTTP backend. secure: false
    // accepts the backend's self-signed local dev cert.
    proxy: {
      '/api': {
        target: 'https://localhost:7142',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
