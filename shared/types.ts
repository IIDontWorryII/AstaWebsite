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
  /** URL of the user's uploaded avatar, or null if none set. */
  avatarUrl: string | null;
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

/**
 * The groups/referate an event can belong to. `value` is stored in the DB
 * and used for filtering; `label` is shown in the UI. Add new referate here
 * — no DB migration needed (the column is a free string).
 */
export const EVENT_CATEGORIES = [
  { value: "BARACKE", label: "BaRACke" },
  { value: "EVENT", label: "Event" },
  { value: "SPORT", label: "Sport" },
  { value: "FS_WISO", label: "FS WiSo" },
  { value: "FS_MIT", label: "FS MIT" },
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number]["value"];

export interface EventDTO {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  price: string | null;
  place: string;
  /**
   * Referate/groups this event belongs to (EVENT_CATEGORIES values). An event
   * can be organized by several Referate at once, so this is a list. Empty
   * array = untagged.
   */
  categories: string[];
  /** Email to register for the event, or null if no registration needed. */
  registrationEmail: string | null;
  startsAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProtocolDTO {
  id: string;
  gremium: string;
  title: string;
  /** Optional short summary of what the meeting covered. */
  description: string | null;
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
  | "GALLERY"
  // Ersti-Info page (slug "ersti"):
  // - STEP — an "Erste Schritte" checklist item (text in `body`).
  // - FAQ  — a question/answer pair (`subtitle` = question, `body` = answer).
  | "STEP"
  | "FAQ";

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

/**
 * The "Fristen & Termine" block on the Ersti-Info page. A singleton — the only
 * per-semester data on that page. Date ranges are free text (the Hochschule
 * publishes them late and reformats them); the two PDFs are uploaded files.
 */
export interface ErstiInfoDTO {
  pruefungsanmeldung: string | null;
  klausurenphase: string | null;
  pruefungstermineMitUrl: string | null;
  pruefungstermineWisoUrl: string | null;
}

/** A Gremium page (asta, stupa, fachschaften) with all its sections. */
export interface PageDTO {
  id: string;
  slug: string;
  title: string;
  intro: string | null;
  /** Hero background image URL, or null to use the page's bundled default. */
  heroImageUrl: string | null;
  sections: PageSectionDTO[];
}
