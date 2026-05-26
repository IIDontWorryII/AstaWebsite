// server/auth/cors.ts
//
// CORS (Cross-Origin Resource Sharing) configuration. Defines which
// websites are allowed to send credentialed requests to our API.
//
// Why this matters: combined with `credentials: true`, a loose CORS
// policy would let any website send authenticated requests using the
// user's auth cookie. We deliberately keep the allowlist tight in
// production and only relax it during local development.

import type { CorsOptions } from "cors";

/**
 * Compute CORS options based on environment:
 *
 *   - Development (NODE_ENV !== "production"):
 *       origin: true   (reflect any origin — Vite proxy + Postman + curl
 *                       all work without configuration)
 *
 *   - Production with CORS_ORIGIN set (comma-separated list):
 *       origin: <allowlist>   (only listed origins receive
 *                              Access-Control-Allow-Origin)
 *
 *   - Production without CORS_ORIGIN:
 *       THROWS at startup.    (fail fast — silently shipping a wide-open
 *                              CORS policy would be a security regression)
 *
 * Example env:
 *   CORS_ORIGIN=https://asta-remagen.de,https://www.asta-remagen.de
 */
export function corsOptions(): CorsOptions {
  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    return { origin: true, credentials: true };
  }

  const raw = process.env.CORS_ORIGIN;
  if (!raw) {
    throw new Error(
      "CORS_ORIGIN is not set. In production this must be a comma-separated " +
        "list of allowed origins, e.g. https://asta-remagen.de",
    );
  }

  // Trim whitespace around commas, drop empty entries (e.g. trailing comma).
  const allowlist = raw
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  return { origin: allowlist, credentials: true };
}
