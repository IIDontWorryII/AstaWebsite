// client/src/lib/events.ts
//
// Pure helpers for working with events on the client. Shared by the Home
// page's EventsSection and the reusable <UpcomingEvents> component so the
// "pick the next N upcoming" + countdown logic lives in exactly one place.

import type { EventDTO } from "../../../shared/types";

/**
 * Return future events (optionally filtered to one category), soonest first,
 * capped at `limit`. `now` is injectable so callers can re-derive the list
 * as a ticking clock advances.
 */
export function selectUpcoming(
  events: EventDTO[],
  opts: { category?: string; limit?: number; now?: number } = {},
): EventDTO[] {
  const { category, limit, now = Date.now() } = opts;
  const list = events
    .filter((e) => (category ? e.categories.includes(category) : true))
    .filter((e) => new Date(e.startsAt).getTime() >= now)
    .sort(
      (a, b) =>
        new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    );
  return limit ? list.slice(0, limit) : list;
}

/** Human countdown like "noch 12 Tg 4 Std" / "noch 3 Std 20 Min". */
export function formatCountdown(ms: number): string {
  if (ms <= 0) return "Läuft";
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `noch ${days} Tg ${hours} Std`;
  if (hours > 0) return `noch ${hours} Std ${minutes} Min`;
  return `noch ${minutes} Min`;
}

/** Format an ISO timestamp as a German date + time, e.g. "30.05.2026, 18:00 Uhr". */
export function formatEventDate(iso: string): string {
  return (
    new Date(iso).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) + " Uhr"
  );
}
