// server/auth/passwords.ts
//
// Hash plaintext passwords for storage and verify candidates against stored
// hashes. Bcrypt at cost factor 10. Used by the signup and login flows.

import bcrypt from "bcryptjs";

const COST = 10;

/**
 * Hash a plaintext password for storage. Uses bcrypt with the module's
 * COST factor. The returned string includes the salt, so no separate
 * salt column is needed.
 */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, COST);
}

/**
 * Verify a plaintext password against a stored bcrypt hash. Returns true
 * if they match, false otherwise. Resistant to timing attacks (bcrypt's
 * compare is constant-time).
 */
export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
