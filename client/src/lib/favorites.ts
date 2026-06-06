// client/src/lib/favorites.ts
//
// API client for the user's favorited events ("Merkliste"). All endpoints
// require auth (the cookie travels automatically via apiFetch).

import type { EventDTO } from "../../../shared/types";
import { apiFetch, jsonOrThrow } from "./api";

export async function fetchFavorites(): Promise<EventDTO[]> {
  const res = await apiFetch("/api/me/favorites");
  return jsonOrThrow<EventDTO[]>(res, "Failed to fetch favorites");
}

export async function addFavorite(eventId: string): Promise<void> {
  const res = await apiFetch(
    `/api/me/favorites/${encodeURIComponent(eventId)}`,
    { method: "POST" },
  );
  if (!res.ok) throw new Error(`Failed to add favorite: ${res.status}`);
}

export async function removeFavorite(eventId: string): Promise<void> {
  const res = await apiFetch(
    `/api/me/favorites/${encodeURIComponent(eventId)}`,
    { method: "DELETE" },
  );
  if (!res.ok) throw new Error(`Failed to remove favorite: ${res.status}`);
}
