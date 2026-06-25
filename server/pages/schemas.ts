// server/pages/schemas.ts
//
// zod schemas for the Gremium-page admin routes.
//
// Multipart form fields arrive as strings; the route handler does the
// number/enum/null coercion before talking to Prisma.

import { z } from "zod";

/** PageSectionKind mirrors the Prisma enum. Used by Add Section. */
export const PageSectionKind = z.enum([
  "INFO",
  "REFERAT",
  "MITGLIEDER",
  "FREEFORM",
  "MEMBER",
  "MENU",
  "GALLERY",
  "STEP",
  "FAQ",
]);
export type PageSectionKindT = z.infer<typeof PageSectionKind>;

/**
 * Partial update for an existing section. Every field is optional —
 * the route only writes the fields that are present.
 *
 * Empty strings on optional fields are interpreted as "clear this field"
 * by the route (set to null in the DB). That lets admin forms send "" to
 * remove a caption / email / subtitle without needing a separate "delete"
 * action per field.
 */
export const PageSectionUpdateInput = z.object({
  subtitle: z.string().optional(),
  body: z.string().min(1).optional(),
  caption: z.string().optional(),
  email: z.string().optional(),
  // Multipart flag. "true" means "remove the current image" (set imageUrl
  // to null and delete it from R2). Ignored when a new image file is also
  // uploaded — a new upload always wins.
  removeImage: z.string().optional(),
});

export type PageSectionUpdateInputT = z.infer<typeof PageSectionUpdateInput>;

/**
 * Input for POST /api/admin/pages/:slug/sections — create a brand-new
 * section. kind is required so we know how to render it. All other
 * fields are optional and can be filled in by editing the section
 * afterwards.
 */
export const PageSectionCreateInput = z.object({
  kind: PageSectionKind,
  subtitle: z.string().optional(),
  body: z.string().optional(),
  caption: z.string().optional(),
  email: z.string().optional(),
});

export type PageSectionCreateInputT = z.infer<typeof PageSectionCreateInput>;
