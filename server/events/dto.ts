// server/events/dto.ts
//
// Single source of truth for converting a Prisma Event row into the
// EventDTO wire shape. Used by GET (list) and POST/PUT (return updated row).
//
// Centralizing the Date -> ISO string conversion here means new routes
// can't accidentally diverge from the shape declared in shared/types.ts.

import type { Event as PrismaEvent } from "@prisma/client";
import type { EventDTO } from "../../shared/types.js";

export function toEventDTO(e: PrismaEvent): EventDTO {
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    imageUrl: e.imageUrl,
    price: e.price,
    place: e.place,
    categories: e.categories,
    registrationEmail: e.registrationEmail,
    startsAt: e.startsAt.toISOString(),
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  };
}
