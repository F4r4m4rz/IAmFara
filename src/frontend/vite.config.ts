import react from '@vitejs/plugin-react'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vitest/config'
import { VitePWA } from 'vite-plugin-pwa'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Installability/offline support is deliberately scoped to the finance
    // app (/expenses/demo) only, not the whole portfolio site. This is a
    // single shared SPA bundle/index.html, so the plugin still injects the
    // manifest <link> sitewide (no option to scope that injection itself —
    // see the comment in pages/Finance/usePwaRegistration.ts for why that's
    // still safe). injectRegister is disabled so the service worker is
    // instead registered manually, only while the finance app is mounted,
    // pinned to manifest.scope below.
    VitePWA({
      registerType: 'autoUpdate',
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
        navigateFallback: '/index.html',
      },
    }),
  ],
  build: {
    outDir: resolve(__dirname, '../backend/IAmFara.Web/wwwroot'),
    emptyOutDir: true,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
