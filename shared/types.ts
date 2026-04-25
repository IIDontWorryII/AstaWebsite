// Shared domain types — imported by both client (React) and server (Express).
// Keep this file dependency-free: no imports from 'react', 'express', or any runtime library.
// Only plain TypeScript types and pure constants belong here.

/**
 * A user's role. Determines what they're allowed to do.
 *
 * - USER   — Default on signup. Read-only. Can view protocols (which require login).
 * - EDITOR — Can create/edit events, pages, members, protocols, Getränkekarte,
 *            sport files. Can also promote/demote other users.
 */
export type UserRole = 'USER' | 'EDITOR'

/** Shape of a user as exposed by the API (no password hash). */
export interface PublicUser {
  id: string
  email: string
  displayName: string
  role: UserRole
  createdAt: string // ISO 8601
}

/** Response shape for GET /api/health. */
export interface HealthResponse {
  status: 'ok'
  version: string
}
