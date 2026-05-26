// client/src/lib/api.ts
//
// Frontend API client. All requests go through `apiFetch` which:
//   - Sends cookies on every request (`credentials: "include"`), so the
//     browser automatically attaches the auth cookie set by /api/login.
//   - Sets JSON Content-Type when a body is provided.
//
// Add new endpoints below as small named functions returning typed promises.

import type { EventDTO, ProtocolDTO } from "../../../shared/types";

/**
 * `fetch` wrapper that always sends cookies and JSON-encodes bodies.
 * Throws on non-2xx responses with the server's `error` message if present.
 */
async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);

  // Set Content-Type: application/json for string bodies. For FormData
  // (file uploads) we MUST NOT set Content-Type ourselves — the browser
  // generates the correct "multipart/form-data; boundary=..." value when
  // it sees a FormData body. Setting JSON here strips the boundary, and
  // Express's json middleware then tries to parse the bytes as JSON and
  // rejects anything over its 100KB default with a 413.
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;
  if (init.body && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(input, {
    ...init,
    credentials: "include",
    headers,
  });
  return res;
}

async function jsonOrThrow<T>(res: Response, label: string): Promise<T> {
  if (!res.ok) {
    // Try in order of preference:
    //   1. JSON with an `error` field (our convention)            → "Title required"
    //   2. JSON with no error field, fall back to text body       → raw text
    //   3. JSON parse failed, fall back to res.statusText         → "Payload Too Large"
    //   4. Last resort: status code                               → "413"
    // The label is always prefixed so the user sees what action failed.
    //
    // We have to clone() the response before .json() because reading a
    // Response body is a one-time operation — clone gives us a second
    // copy to fall back to if json parsing fails or returns no error field.
    let msg = res.statusText || String(res.status);
    try {
      const cloned = res.clone();
      const body = (await res.json()) as { error?: string };
      if (body.error) {
        msg = body.error;
      } else {
        const text = await cloned.text();
        if (text.trim()) msg = text.trim();
      }
    } catch {
      try {
        const text = await res.text();
        if (text.trim()) msg = text.trim();
      } catch {
        // Body unreadable — keep the statusText fallback.
      }
    }
    throw new Error(`${label}: ${msg}`);
  }
  return (await res.json()) as T;
}

export async function fetchEvents(): Promise<EventDTO[]> {
  const res = await apiFetch("/api/events");
  return jsonOrThrow<EventDTO[]>(res, "Failed to fetch events");
}

export async function fetchProtocols(gremium?: string): Promise<ProtocolDTO[]> {
  const qs = gremium ? `?${new URLSearchParams({ gremium }).toString()}` : "";
  const res = await apiFetch(`/api/protocols${qs}`);
  return jsonOrThrow<ProtocolDTO[]>(res, "Failed to fetch protocols");
}

// Re-export so future auth API functions (signup, login, logout, me) can
// import the helpers without a separate file.
export { apiFetch, jsonOrThrow };
