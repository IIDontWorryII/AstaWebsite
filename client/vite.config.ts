import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Keep in sync with tsconfig.json / tsconfig.app.json paths
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Forward /api/* requests to the backend during dev.
      // Frontend code uses relative URLs (fetch("/api/events")) so it works
      // identically in dev and prod (where frontend + backend share an origin).
      //
      // Explicit options (instead of the shorthand string form) so we can:
      //   - changeOrigin: rewrite the Host header to localhost:5000 so the
      //     backend sees the real target, not the Vite origin.
      //   - configure: hook into the http-proxy lifecycle to log any
      //     proxy-level errors (helps diagnose mystery 5xx/413 responses
      //     that don't come from our Express routes).
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.error('[vite-proxy] /api error:', err.message)
          })
        },
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
