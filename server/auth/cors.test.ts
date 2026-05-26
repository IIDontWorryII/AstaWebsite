// server/auth/cors.test.ts
//
// Verifies corsOptions() returns the right policy per environment:
//   - dev:  origin: true     (allow any)
//   - prod with CORS_ORIGIN: origin: <parsed allowlist>
//   - prod without CORS_ORIGIN: throws (fail-fast on misconfig)

import { afterEach, describe, expect, it, vi } from "vitest";
import { corsOptions } from "./cors.js";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("corsOptions()", () => {
  it("allows any origin in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    const opts = corsOptions();
    expect(opts.origin).toBe(true);
    expect(opts.credentials).toBe(true);
  });

  it("returns the parsed allowlist in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv(
      "CORS_ORIGIN",
      "https://asta-remagen.de,https://www.asta-remagen.de",
    );

    const opts = corsOptions();
    expect(opts.origin).toEqual([
      "https://asta-remagen.de",
      "https://www.asta-remagen.de",
    ]);
    expect(opts.credentials).toBe(true);
  });

  it("trims whitespace and drops empty entries", () => {
    // Real env files often have stray spaces or a trailing comma. The
    // parser should tolerate both rather than silently producing bogus
    // allowed origins like " https://..." or "".
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("CORS_ORIGIN", " https://a.de , https://b.de , ");

    const opts = corsOptions();
    expect(opts.origin).toEqual(["https://a.de", "https://b.de"]);
  });

  it("throws on startup when CORS_ORIGIN is missing in production", () => {
    // The whole point of this test: silently defaulting to "allow any"
    // in prod would be a security regression. Verify we crash loudly
    // instead. (`delete` cleanly removes the var; stubEnv with "" is
    // different — it sets the var to an empty string.)
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("CORS_ORIGIN", "");

    expect(() => corsOptions()).toThrow(/CORS_ORIGIN is not set/);
  });
});
