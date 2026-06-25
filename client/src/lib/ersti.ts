// client/src/lib/ersti.ts
//
// API client for the Ersti-Info "Fristen & Termine" singleton (date ranges +
// the two Prüfungstermine PDFs). The STEP/FAQ content of the page is fetched
// via the normal page API (lib/pages) since they're PageSections.

import type { ErstiInfoDTO } from "../../../shared/types";
import { apiFetch, jsonOrThrow } from "./api";

export async function fetchErsti(): Promise<ErstiInfoDTO> {
  const res = await apiFetch("/api/ersti");
  return jsonOrThrow<ErstiInfoDTO>(res, "Failed to fetch Ersti info");
}

export interface ErstiUpdateInput {
  pruefungsanmeldung?: string;
  klausurenphase?: string;
}

/**
 * Update the Fristen texts and/or the two PDFs. Empty-string text fields clear
 * them server-side; pass a File to upload, or removeMit/removeWiso to clear an
 * existing PDF.
 */
export async function updateErsti(
  input: ErstiUpdateInput,
  mit?: File | null,
  wiso?: File | null,
  removeMit?: boolean,
  removeWiso?: boolean,
): Promise<ErstiInfoDTO> {
  const fd = new FormData();
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) fd.append(key, value);
  }
  if (mit) fd.append("mit", mit);
  else if (removeMit) fd.append("removeMit", "true");
  if (wiso) fd.append("wiso", wiso);
  else if (removeWiso) fd.append("removeWiso", "true");

  const res = await apiFetch("/api/admin/ersti", { method: "PUT", body: fd });
  return jsonOrThrow<ErstiInfoDTO>(res, "Failed to save Ersti info");
}
