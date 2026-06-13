// server/events/schemas.ts
//
// zod schemas for validating event input on POST/PUT /api/events.
// Multipart form fields arrive as strings (the multipart format is
// text-based), so all fields are typed as strings here — Prisma
// conversion (e.g. startsAt -> Date) happens in the route handler.

import { z } from "zod";
import { EVENT_CATEGORIES } from "../../shared/types.js";

/** Allowed category values, derived from the shared single source of truth. */
const CATEGORY_VALUES = EVENT_CATEGORIES.map((c) => c.value) as [
  string,
  ...string[],
];

/**
 * Referate tags. Multipart form fields are text, so the client sends the
 * selection as a JSON array string (e.g. '["SPORT","EVENT"]'). We parse that
 * here, tolerate an empty string / missing field (→ []), then validate every
 * entry against the allowed values.
 */
const categoriesField = z.preprocess((val) => {
  if (val === undefined || val === null) return undefined;
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (trimmed === "") return [];
    try {
      return JSON.parse(trimmed);
    } catch {
      return val; // let the validator reject it with a clear error
    }
  }
  return val;
}, z.array(z.enum(CATEGORY_VALUES)).optional());

/** Required fields for creating an event. Image is handled separately via multer. */
export const EventCreateInput = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  place: z.string().min(1, "Place is required"),
  // ISO 8601 timestamp string — the client should send `new Date().toISOString()`.
  startsAt: z.string().datetime("startsAt must be an ISO 8601 timestamp"),
  price: z.string().optional(),
  // Optional referat/group tags. Omitted/empty → undefined (treated as []).
  categories: categoriesField,
  // Optional registration email. Empty string clears it.
  registrationEmail: z.string().email().optional().or(z.literal("")),
});

/**
 * All fields optional for partial updates. Each field that *is* present
 * must still pass its individual validator (e.g. non-empty title).
 */
export const EventUpdateInput = EventCreateInput.partial();

export type EventCreateInputT = z.infer<typeof EventCreateInput>;
export type EventUpdateInputT = z.infer<typeof EventUpdateInput>;
