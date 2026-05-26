// server/auth/middleware.ts
//
// Auth middleware for protecting routes:
//   - requireAuth   — must be logged in (any role). Attaches req.user.
//   - requireEditor — must be logged in AND role === "EDITOR".
//
// Status code convention:
//   401 Unauthorized = "I don't know who you are" (no/bad/expired cookie)
//   403 Forbidden    = "I know you, but you can't do this" (wrong role)
//
// Freshness trade-off: these middlewares trust the JWT's claims (sub, role)
// without re-querying the database. This makes every authenticated request
// a microsecond instead of a DB roundtrip. The cost: if a user is deleted
// or demoted from EDITOR to USER, their existing token remains valid until
// it expires (up to 24h). To force-logout immediately, rotate JWT_SECRET
// — that invalidates every issued token at once.

import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "../../shared/types.js";
import { COOKIE_NAME } from "./cookie.js";
import { verifyToken } from "./tokens.js";

// ─── Type extension ─────────────────────────────────────────────────────
//
// Express's Request type doesn't know about `req.user`. This `declare
// module` block tells TypeScript "add a `user?` field to Request globally."
// Any handler that imports nothing from here still sees the field — that's
// the point of a global declaration.
//
// `user` is optional (?) because unauthenticated requests don't have it.
// Inside a handler that runs *after* requireAuth, you can safely read
// req.user (it's guaranteed to be set), but TS still wants a null-check
// unless you assert. Most handlers do `const user = req.user!` or destructure.
declare module "express" {
  interface Request {
    user?: {
      id: string;
      role: UserRole;
    };
  }
}

/**
 * Read the auth cookie, verify the JWT, attach { id, role } to req.user.
 * Returns 401 on missing/invalid/expired cookie. Call next() on success.
 *
 * Usage:
 *   app.get("/api/protected", requireAuth, (req, res) => {
 *     // req.user is { id, role } here
 *   });
 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  try {
    // verifyToken throws on bad signature, malformed token, or expiry.
    // All three failures collapse to the same generic 401 — never leak
    // *why* the token was rejected (timing-attack defense).
    const payload = verifyToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    res.status(401).json({ error: "Not authenticated" });
  }
}

/**
 * Like requireAuth, but additionally requires role === "EDITOR".
 * Returns 401 if not logged in, 403 if logged in as the wrong role.
 *
 * Usage:
 *   app.post("/api/events", requireEditor, async (req, res) => { ... });
 */
export function requireEditor(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // First-pass auth check: same logic as requireAuth, inlined so we can
  // distinguish the 401 (no auth) from the 403 (wrong role) below.
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  if (payload.role !== "EDITOR") {
    res.status(403).json({ error: "Editor role required" });
    return;
  }

  req.user = { id: payload.sub, role: payload.role };
  next();
}
