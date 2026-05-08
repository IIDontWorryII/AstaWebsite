import type { EventDTO } from "../../../shared/types";

export async function fetchEvents(): Promise<EventDTO[]> {
  const res = await fetch("/api/events");
  if (!res.ok) {
    throw new Error(`Failed to fetch events: ${res.status}`);
  }
  return (await res.json()) as EventDTO[];
}
