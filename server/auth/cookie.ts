// server/auth/cookie.ts
//
// Auth cookie configuration and helpers. Centralized here (rather than
// inline in app.ts) so the security model lives in one place and the
// helpers can be reused if more routes ever need to set/clear the cookie.
//
// ─── Security model ─────────────────────────────────────────────────────
//
//   The auth cookie carries a signed JWT. To keep it safe we rely on
//   four cookie attributes plus one CORS rule (configured in app.ts):
//
//     httpOnly: true        JS in the browser cannot read the cookie.
//                           If your site ever has an XSS bug, the
//                           attacker still can't exfiltrate the token.
//
//     secure: true (prod)   Browser only sends the cookie over HTTPS.
//                           In dev (no HTTPS) this is false.
//
//     sameSite: "lax"       Cookie is not sent on cross-origin POST/PUT/
//                           DELETE requests. This is our CSRF defense:
//                           attacker.com cannot trigger a credentialed
//                           state-changing request to our API by tricking
//                           a logged-in user into visiting their page.
//                           "lax" still allows top-level GET navigation
//                           (so login redirects work).
//
//     maxAge: 24h           Cookie expires 24h after issue. Matches the
//                           JWT's exp claim (server/auth/tokens.ts).
//                           NOT rolling — the clock does not reset on
//                           activity. If anyone wants "stay logged in
//                           while active", change setAuthCookie to be
//                           called on every authenticated request.
//
//   CSRF tokens: deliberately not implemented. sameSite=lax covers the
//   relevant attack vectors for this app (login/signup/logout are the
//   only mutating endpoints today; an attacker triggering a forged POST
//   to /logout would just log a user out — annoying, not data theft).
//   Revisit if/when we add transactional features (payments, etc.).

import type { CookieOptions, Response } from "express";

/** Cookie name used everywhere — change here and grep updates the rest. */
export const COOKIE_NAME = "auth_token";

/** 24h in milliseconds — matches TOKEN_LIFETIME in auth/tokens.ts. */
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Returns cookie options for the current environment. Recomputed on each
 * call (rather than frozen at module load) so tests can flip NODE_ENV
 * and verify the production branch without restarting the process.
 *
 * The microsecond cost per call is negligible — we set cookies twice per
 * user session (login + logout), not per request.
 */
export function cookieOptions(): CookieOptions {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    // In production: browser will refuse to send this cookie over plain
    // HTTP, so an eavesdropper on the network cannot steal it. In dev
    // we run on http://localhost, so we leave it off — otherwise the
    // cookie wouldn't be sent at all and login would silently break.
    secure: isProduction,
    sameSite: "lax",
    maxAge: ONE_DAY_MS,
    path: "/",
  };
}

/** Set the auth cookie on a response. Called by signup and login. */
export function setAuthCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, cookieOptions());
}

/**
 * Clear the auth cookie on a response. Called by logout.
 *
 * Important: pass the SAME options here as when setting. Browsers match
 * cookies by (name + path + domain), and clearing only works if all three
 * match the original Set-Cookie. Reusing cookieOptions() guarantees that.
 */
export function clearAuthCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, cookieOptions());
}
