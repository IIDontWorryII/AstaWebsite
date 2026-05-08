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
      '/api': 'http://localhost:5000',
    },
  },
})
