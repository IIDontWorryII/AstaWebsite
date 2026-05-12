import type { EventDTO, ProtocolDTO } from "../../../shared/types";

export async function fetchEvents(): Promise<EventDTO[]> {
  const res = await fetch("/api/events");
  if (!res.ok) {
    throw new Error(`Failed to fetch events: ${res.status}`);
  }
  return (await res.json()) as EventDTO[];
}

export async function fetchProtocols(gremium?: string): Promise<ProtocolDTO[]> {
  const qs = gremium ? `?${new URLSearchParams({ gremium }).toString()}` : "";
  const res = await fetch(`/api/protocols${qs}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch protocols: ${res.status}`);
  }
  return (await res.json()) as ProtocolDTO[];
}
