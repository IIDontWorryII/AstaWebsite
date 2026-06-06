// server/protocols/dto.ts
//
// Map a Prisma Protocol row to the ProtocolDTO wire shape. Single source
// of truth for Date -> ISO string conversion, used by GET (list) and
// POST/PUT (return updated row).

import type { Protocol as PrismaProtocol } from "@prisma/client";
import type { ProtocolDTO } from "../../shared/types.js";

export function toProtocolDTO(p: PrismaProtocol): ProtocolDTO {
  return {
    id: p.id,
    gremium: p.gremium,
    title: p.title,
    description: p.description,
    meetingDate: p.meetingDate.toISOString(),
    fileUrl: p.fileUrl,
    uploadedAt: p.uploadedAt.toISOString(),
  };
}
