// client/src/lib/admin-protocols.ts
//
// API client for the admin (EDITOR-only) protocol endpoints. Mirrors
// admin-events.ts: multipart for create/update so the PDF rides along
// with the text fields, simple DELETE for remove.

import type { ProtocolDTO } from "../../../shared/types";
import { apiFetch, jsonOrThrow, fetchProtocols } from "./api";

/** Plain text fields for create/update. PDF uploaded as a separate File. */
export interface ProtocolFormInput {
  gremium: string;
  title: string;
  /** ISO 8601 string. UI uses datetime-local; convert with new Date(value).toISOString(). */
  meetingDate: string;
}

/** Build a FormData body. Same pattern as admin-events.ts buildFormData. */
function buildFormData(
  input: Partial<ProtocolFormInput>,
  file?: File | null,
): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined && value !== null) fd.append(key, String(value));
  }
  if (file) fd.append("file", file);
  return fd;
}

export async function createProtocol(
  input: ProtocolFormInput,
  file: File,
): Promise<ProtocolDTO> {
  // PDF is required on create (server returns 400 if missing).
  const res = await apiFetch("/api/protocols", {
    method: "POST",
    body: buildFormData(input, file),
  });
  return jsonOrThrow<ProtocolDTO>(res, "Failed to create protocol");
}

export async function updateProtocol(
  id: string,
  input: Partial<ProtocolFormInput>,
  file?: File | null,
): Promise<ProtocolDTO> {
  const res = await apiFetch(`/api/protocols/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: buildFormData(input, file),
  });
  return jsonOrThrow<ProtocolDTO>(res, "Failed to update protocol");
}

export async function deleteProtocol(id: string): Promise<void> {
  const res = await apiFetch(`/api/protocols/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(`Failed to delete protocol: ${res.status}`);
  }
}

/**
 * Fetch all protocols (no gremium filter) for the admin list. Currently
 * loads all in one request — fine for typical volumes. If protocols
 * outgrow this, add pagination on the API and update here.
 */
export async function fetchAllProtocols(): Promise<ProtocolDTO[]> {
  return fetchProtocols();
}

/**
 * Fetch a single protocol by id. Same trade-off note as fetchEventById:
 * currently fetches all and filters; swap for a real GET /:id later.
 */
export async function fetchProtocolById(
  id: string,
): Promise<ProtocolDTO | null> {
  const all = await fetchProtocols();
  return all.find((p) => p.id === id) ?? null;
}
