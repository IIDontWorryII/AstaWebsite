// server/events/schemas.ts
//
// zod schemas for validating event input on POST/PUT /api/events.
// Multipart form fields arrive as strings (the multipart format is
// text-based), so all fields are typed as strings here — Prisma
// conversion (e.g. startsAt -> Date) happens in the route handler.

import { z } from "zod";

/** Required fields for creating an event. Image is handled separately via multer. */
export const EventCreateInput = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  place: z.string().min(1, "Place is required"),
  // ISO 8601 timestamp string — the client should send `new Date().toISOString()`.
  startsAt: z.string().datetime("startsAt must be an ISO 8601 timestamp"),
  price: z.string().optional(),
});

/**
 * All fields optional for partial updates. Each field that *is* present
 * must still pass its individual validator (e.g. non-empty title).
 */
export const EventUpdateInput = EventCreateInput.partial();

export type EventCreateInputT = z.infer<typeof EventCreateInput>;
export type EventUpdateInputT = z.infer<typeof EventUpdateInput>;
