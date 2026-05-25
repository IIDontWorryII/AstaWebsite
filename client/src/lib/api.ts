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
  if (init.body && !headers.has("Content-Type")) {
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
    let msg = `${label} failed: ${res.status}`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) msg = body.error;
    } catch {
      // body wasn't JSON; keep the default message
    }
    throw new Error(msg);
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
