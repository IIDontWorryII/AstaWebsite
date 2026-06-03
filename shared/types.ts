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
export type UserRole = "USER" | "EDITOR";

/** Shape of a user as exposed by the API (no password hash). */
export interface PublicUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string; // ISO 8601
}

/**
 * Successful auth response (signup, login, /me).
 * The token lives in an httpOnly cookie, not in the body.
 */
export interface AuthResponse {
  user: PublicUser;
}

/** Response shape for GET /api/health. */
export interface HealthResponse {
  status: "ok";
  version: string;
}

export interface EventDTO {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  price: string | null;
  place: string;
  startsAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProtocolDTO {
  id: string;
  gremium: string;
  title: string;
  meetingDate: string;
  fileUrl: string;
  uploadedAt: string;
}

/**
 * Kinds of section a Gremium page can hold. Mirrors the Prisma enum.
 * - INFO       — page intro: image + body paragraph. Singleton per page.
 * - REFERAT    — a Referat card (ASTA-specific): photo + role + holder + body + email.
 * - MITGLIEDER — image + body (STUPA's bulk member-list block).
 * - FREEFORM   — subtitle + body (Fachschaften's MIT/WiSo sections).
 * - MEMBER     — individual member portrait: photo + role + name + optional bio.
 *                Used by STUPA for Präsident / Vizepräsident.
 * - MENU       — a single menu image (one page of the Getränkekarte).
 *                Image-only + optional caption. Multi-instance (BaRACke).
 * - GALLERY    — a single gallery photo. Image-only + optional caption.
 *                Multi-instance, rendered as a grid (BaRACke).
 */
export type PageSectionKind =
  | "INFO"
  | "REFERAT"
  | "MITGLIEDER"
  | "FREEFORM"
  | "MEMBER"
  | "MENU"
  | "GALLERY";

/** A single section inside a Gremium page. */
export interface PageSectionDTO {
  id: string;
  order: number;
  kind: PageSectionKind;
  subtitle: string | null;
  body: string | null;
  imageUrl: string | null;
  caption: string | null;
  email: string | null;
}

/** A Gremium page (asta, stupa, fachschaften) with all its sections. */
export interface PageDTO {
  id: string;
  slug: string;
  title: string;
  intro: string | null;
  sections: PageSectionDTO[];
}
