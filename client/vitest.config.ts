import path from 'node:path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Vitest reads this file when running tests.
// Kept separate from vite.config.ts to avoid type conflicts between Vitest's
// bundled Vite and the project's Vite. Plugins/aliases needed at test time
// must be duplicated here. (Tailwind isn't needed for tests.)
//
// The `as never` cast is needed because @vitejs/plugin-react resolves
// Vite's types from the project's installed Vite, while vitest/config
// resolves them from its own vendored Vite. The shapes are runtime-
// compatible — only the TS types differ.
export default defineConfig({
  plugins: [react() as never],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    // These are integration-style tests (userEvent + jsdom + the headless
    // ProseMirror editor), which are heavy enough that the default 5s budget
    // is occasionally exceeded under parallel load. 15s gives slow runs room.
    testTimeout: 15000,
  },
})
