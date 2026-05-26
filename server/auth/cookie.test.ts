// server/auth/cookie.test.ts
//
// Verifies that cookieOptions() returns env-appropriate values:
//   - dev:  secure=false (so cookies work on http://localhost)
//   - prod: secure=true  (so cookies only travel over HTTPS)
//
// We use vi.stubEnv() to flip NODE_ENV per test. cookieOptions() reads
// process.env on each call, so the stub takes effect immediately — no
// re-import or process restart needed. afterEach undoes the stubs so
// other test files run with the real environment.

import { afterEach, describe, expect, it, vi } from "vitest";
import { cookieOptions, COOKIE_NAME } from "./cookie.js";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("COOKIE_NAME", () => {
  it("is the constant we expect (do not rename without coordinating)", () => {
    // This test exists as a tripwire: COOKIE_NAME is referenced by name in
    // tests, the /api/me route, and any future middleware. If someone
    // renames the cookie, this test breaks and forces them to acknowledge
    // it (the rename also invalidates every issued cookie in the wild).
    expect(COOKIE_NAME).toBe("auth_token");
  });
});

describe("cookieOptions()", () => {
  it("returns httpOnly=true regardless of environment", () => {
    // httpOnly is non-negotiable — the JS-can't-read-it property is the
    // whole reason we chose cookies over localStorage. Verify it stays on
    // in both modes.
    vi.stubEnv("NODE_ENV", "development");
    expect(cookieOptions().httpOnly).toBe(true);

    vi.stubEnv("NODE_ENV", "production");
    expect(cookieOptions().httpOnly).toBe(true);
  });

  it("returns sameSite='lax' regardless of environment", () => {
    // sameSite is our CSRF defense — also non-negotiable across envs.
    vi.stubEnv("NODE_ENV", "development");
    expect(cookieOptions().sameSite).toBe("lax");

    vi.stubEnv("NODE_ENV", "production");
    expect(cookieOptions().sameSite).toBe("lax");
  });

  it("returns secure=false in development (so http://localhost works)", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(cookieOptions().secure).toBe(false);
  });

  it("returns secure=true in production (HTTPS-only)", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(cookieOptions().secure).toBe(true);
  });

  it("treats anything that isn't 'production' as development (secure=false)", () => {
    // Some envs use "staging", "test", or leave NODE_ENV unset entirely.
    // We treat anything that isn't the literal string "production" as
    // non-prod and keep secure=false. This is the conservative choice:
    // mis-typed env vars don't accidentally enable strict mode.
    vi.stubEnv("NODE_ENV", "staging");
    expect(cookieOptions().secure).toBe(false);

    vi.stubEnv("NODE_ENV", "");
    expect(cookieOptions().secure).toBe(false);
  });

  it("returns a 24-hour maxAge matching the JWT lifetime", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(cookieOptions().maxAge).toBe(24 * 60 * 60 * 1000);
  });
});
