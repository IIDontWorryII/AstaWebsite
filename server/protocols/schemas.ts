// server/protocols/schemas.ts
//
// zod schemas for validating protocol input on POST/PUT /api/protocols.
//
// Multipart fields arrive as strings. The route handler converts
// meetingDate -> Date for Prisma. The PDF file is parsed separately by
// multer and shows up on req.file.

import { z } from "zod";
import { Gremium } from "@prisma/client";

/** Required fields for creating a protocol. The PDF is handled via multer. */
export const ProtocolCreateInput = z.object({
  // Validated against the Prisma `Gremium` enum (single source of truth):
  // a value outside the enum is rejected with 400 before it reaches the DB.
  gremium: z.nativeEnum(Gremium),
  title: z.string().min(1, "Title is required"),
  // Optional short summary. Empty string on update clears it (handled in route).
  description: z.string().optional(),
  // ISO 8601 timestamp. The client sends `new Date(value).toISOString()`.
  meetingDate: z.string().datetime("meetingDate must be an ISO 8601 timestamp"),
});

/** All fields optional for partial updates (PUT). */
export const ProtocolUpdateInput = ProtocolCreateInput.partial();
