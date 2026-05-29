// server/vitest.config.ts
//
// Vitest configuration. The only thing we need to override here is the
// setup file, which seeds dummy R2 env vars before any test module loads.

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["./test/setup.ts"],
  },
});
