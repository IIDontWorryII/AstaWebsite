// server/protocols/schemas.ts
//
// zod schemas for validating protocol input on POST/PUT /api/protocols.
//
// Multipart fields arrive as strings. The route handler converts
// meetingDate -> Date for Prisma. The PDF file is parsed separately by
// multer and shows up on req.file.

import { z } from "zod";

/** Required fields for creating a protocol. The PDF is handled via multer. */
export const ProtocolCreateInput = z.object({
  // Free-form string for now. Common values: "ASTA", "STUPA", "FS-MIT".
  // We could tighten to an enum later once Fachschaften pages are wired
  // up and the full set of valid values is known.
  gremium: z.string().min(1, "Gremium is required"),
  title: z.string().min(1, "Title is required"),
  // ISO 8601 timestamp. The client sends `new Date(value).toISOString()`.
  meetingDate: z.string().datetime("meetingDate must be an ISO 8601 timestamp"),
});

/** All fields optional for partial updates (PUT). */
export const ProtocolUpdateInput = ProtocolCreateInput.partial();
