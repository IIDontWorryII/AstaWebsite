// server/ersti/dto.ts

import type { ErstiInfo } from "@prisma/client";
import type { ErstiInfoDTO } from "../../shared/types.js";

/** Map the ErstiInfo row (or null when never set) to its public DTO. */
export function toErstiInfoDTO(row: ErstiInfo | null): ErstiInfoDTO {
  return {
    pruefungsanmeldung: row?.pruefungsanmeldung ?? null,
    klausurenphase: row?.klausurenphase ?? null,
    pruefungstermineMitUrl: row?.pruefungstermineMitUrl ?? null,
    pruefungstermineWisoUrl: row?.pruefungstermineWisoUrl ?? null,
  };
}
