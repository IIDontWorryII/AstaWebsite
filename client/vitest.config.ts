import path from 'node:path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Vitest reads this file when running tests.
// Kept separate from vite.config.ts to avoid type conflicts between Vitest's
// bundled Vite and the project's Vite. Plugins/aliases needed at test time
// must be duplicated here. (Tailwind isn't needed for tests.)
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
})
