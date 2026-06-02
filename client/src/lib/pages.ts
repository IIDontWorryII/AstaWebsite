// client/src/lib/pages.ts
//
// API client for Gremium pages (asta / stupa / fachschaften and later
// baracke / sport). The admin endpoints live alongside so admin pages can
// share the same module.

import type { PageDTO, PageSectionDTO } from "../../../shared/types";
import { apiFetch, jsonOrThrow } from "./api";
import { compressImage } from "./image";

export async function fetchPage(slug: string): Promise<PageDTO> {
  const res = await apiFetch(`/api/pages/${encodeURIComponent(slug)}`);
  return jsonOrThrow<PageDTO>(res, "Failed to fetch page");
}

/** Fields the admin can change on an existing section. */
export interface SectionUpdateInput {
  subtitle?: string;
  body?: string;
  caption?: string;
  email?: string;
}

/**
 * Update a section. Multipart so an optional new image can ride along.
 * Empty-string text fields are interpreted by the server as "clear this
 * field" — pass `""` to remove an existing subtitle / caption / email.
 *
 * `removeImage: true` clears the current image (set null + delete from R2).
 * A new `image` upload always takes precedence over removeImage.
 */
export async function updateSection(
  id: string,
  input: SectionUpdateInput,
  image?: File | null,
  removeImage?: boolean,
): Promise<PageSectionDTO> {
  const fd = new FormData();
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) fd.append(key, value);
  }
  if (image) fd.append("image", await compressImage(image));
  else if (removeImage) fd.append("removeImage", "true");

  const res = await apiFetch(`/api/admin/sections/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: fd,
  });
  return jsonOrThrow<PageSectionDTO>(res, "Failed to save section");
}

/**
 * Add a new section to a page. The server only allows multi-instance
 * kinds (REFERAT, MEMBER) — INFO/MITGLIEDER/FREEFORM are singletons.
 */
export async function addReferatSection(
  pageSlug: string,
  initial: { subtitle?: string; body?: string; caption?: string; email?: string } = {},
): Promise<PageSectionDTO> {
  const res = await apiFetch(
    `/api/admin/pages/${encodeURIComponent(pageSlug)}/sections`,
    {
      method: "POST",
      body: JSON.stringify({ kind: "REFERAT", ...initial }),
    },
  );
  return jsonOrThrow<PageSectionDTO>(res, "Failed to add section");
}

export async function addMemberSection(
  pageSlug: string,
  initial: { subtitle?: string; body?: string; caption?: string } = {},
): Promise<PageSectionDTO> {
  const res = await apiFetch(
    `/api/admin/pages/${encodeURIComponent(pageSlug)}/sections`,
    {
      method: "POST",
      body: JSON.stringify({ kind: "MEMBER", ...initial }),
    },
  );
  return jsonOrThrow<PageSectionDTO>(res, "Failed to add section");
}

export async function deleteSection(id: string): Promise<void> {
  const res = await apiFetch(`/api/admin/sections/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(`Failed to delete section: ${res.status}`);
  }
}

/**
 * Move a section up or down by one position. Returns the new ordered list
 * of sections so the caller can refresh its render without a separate fetch.
 */
export async function moveSection(
  id: string,
  direction: "up" | "down",
): Promise<PageSectionDTO[]> {
  const res = await apiFetch(
    `/api/admin/sections/${encodeURIComponent(id)}/move`,
    {
      method: "POST",
      body: JSON.stringify({ direction }),
    },
  );
  return jsonOrThrow<PageSectionDTO[]>(res, "Failed to move section");
}
