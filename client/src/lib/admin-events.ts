// client/src/lib/admin-events.ts
//
// API client for the admin (EDITOR-only) event endpoints:
//   - createEvent / updateEvent: send multipart/form-data so the optional
//     image file can ride along with the text fields.
//   - deleteEvent: simple DELETE; returns nothing on success.
//
// Note: cookie auth is automatic via apiFetch's `credentials: "include"`.
// The browser sends the auth_token cookie on every request, so these
// functions don't need to deal with tokens at all.

import type { EventDTO } from "../../../shared/types";
import { apiFetch, jsonOrThrow } from "./api";
import { fetchEvents } from "./api";
import { compressImage } from "./image";

/** Plain text fields for create/update. Image is uploaded as a separate File. */
export interface EventFormInput {
  title: string;
  description: string;
  place: string;
  /** ISO 8601 string. UI uses datetime-local; convert with new Date(value).toISOString(). */
  startsAt: string;
  price?: string;
  /** One of EVENT_CATEGORIES' values, or "" for none. */
  category?: string;
}

/**
 * Build a FormData body from text fields + optional image file. FormData
 * is the in-browser way to construct a multipart/form-data request, which
 * is the format the server's multer middleware expects.
 */
async function buildFormData(
  input: Partial<EventFormInput>,
  image?: File | null,
): Promise<FormData> {
  const fd = new FormData();
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined && value !== null) fd.append(key, String(value));
  }
  // Downscale/compress large photos before they go on the wire.
  if (image) fd.append("image", await compressImage(image));
  return fd;
}

export async function createEvent(
  input: EventFormInput,
  image?: File | null,
): Promise<EventDTO> {
  // Important: when sending FormData, do NOT set Content-Type yourself.
  // The browser sets it (including the multipart boundary) automatically.
  // apiFetch only sets the JSON header when the body looks like a string.
  const res = await apiFetch("/api/events", {
    method: "POST",
    body: await buildFormData(input, image),
  });
  return jsonOrThrow<EventDTO>(res, "Failed to create event");
}

export async function updateEvent(
  id: string,
  input: Partial<EventFormInput>,
  image?: File | null,
): Promise<EventDTO> {
  const res = await apiFetch(`/api/events/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: await buildFormData(input, image),
  });
  return jsonOrThrow<EventDTO>(res, "Failed to update event");
}

/**
 * Fetch a single event by id. Returns null if not found.
 *
 * Implementation note: currently fetches the whole list and filters
 * client-side. Fine for small lists. When events grow into the hundreds,
 * add a real `GET /api/events/:id` backend route and swap this in — the
 * function signature stays the same.
 */
export async function fetchEventById(id: string): Promise<EventDTO | null> {
  const all = await fetchEvents();
  return all.find((e) => e.id === id) ?? null;
}

export async function deleteEvent(id: string): Promise<void> {
  const res = await apiFetch(`/api/events/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(`Failed to delete event: ${res.status}`);
  }
}
