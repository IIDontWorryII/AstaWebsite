// server/auth/tokens.ts
//
// Sign and verify JWT auth tokens. The token carries the user's id and role,
// signed with JWT_SECRET so we can trust it on later requests without
// re-querying the database. Used by login (AW-14) and the auth middleware (AW-16).

import jwt from "jsonwebtoken";
import type { UserRole } from "../../shared/types.js";

// Read the secret once at module load. If it's missing we cannot sign or
// verify anything, so crash immediately with a clear error rather than
// failing on the first login attempt.
const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error(
    "JWT_SECRET is not set. Did you copy server/.env.example to server/.env?",
  );
}
const JWT_SECRET: string = secret;

const TOKEN_LIFETIME = "24h";

/** The data we put inside every auth token. Keep this small and non-sensitive. */
export interface TokenPayload {
  /** User id (the "subject" of the token). */
  sub: string;
  /** User role at the time the token was issued. */
  role: UserRole;
}

/**
 * Sign a token for the given user. The returned string is opaque to the
 * client — it stores it (as an HTTP-only cookie in AW-15) and sends it back
 * with each request. Token expires after TOKEN_LIFETIME.
 */
export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_LIFETIME });
}

/**
 * Verify a token's signature and expiry, returning the original payload.
 * Throws if the token is forged, malformed, or expired — callers should
 * catch and respond 401.
 */
export function verifyToken(token: string): TokenPayload {
  // jwt.verify returns `string | JwtPayload` in its base typing because a
  // JWT *can* technically be a plain string. Ours is always an object, so
  // cast to our known shape after the signature check has succeeded.
  const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload & {
    iat: number;
    exp: number;
  };
  return { sub: decoded.sub, role: decoded.role };
}
