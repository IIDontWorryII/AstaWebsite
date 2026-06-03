// client/src/components/UpcomingEvents.tsx
//
// Reusable "next N events" section with a live countdown. Fetches events
// from the API, optionally filters to one category/referat, keeps the
// soonest `limit` future events, and renders cards that tick down.
//
// Used on the Sport page (category="SPORT") and reusable on BaRACke,
// Home, etc. — pass a different category or omit it to show all events.

import { useEffect, useState } from "react";
import type { EventDTO } from "../../../shared/types";
import { fetchEvents } from "@/lib/api";

interface UpcomingEventsProps {
  /** Filter to this category (EVENT_CATEGORIES value). Omit = all events. */
  category?: string;
  /** Max number of events to show. Default 3. */
  limit?: number;
  /** Section heading. Default "Bevorstehende Events". */
  title?: string;
}

/** Human countdown like "noch 12 Tg 4 Std" / "noch 3 Std 20 Min". */
function formatCountdown(ms: number): string {
  if (ms <= 0) return "Läuft";
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `noch ${days} Tg ${hours} Std`;
  if (hours > 0) return `noch ${hours} Std ${minutes} Min`;
  return `noch ${minutes} Min`;
}

export default function UpcomingEvents({
  category,
  limit = 3,
  title = "Bevorstehende Events",
}: UpcomingEventsProps) {
  const [events, setEvents] = useState<EventDTO[]>([]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    fetchEvents()
      .then(setEvents)
      .catch(() => setEvents([]));
  }, []);

  // Re-render once a minute so the countdown stays current.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const upcoming = events
    .filter((e) => (category ? e.category === category : true))
    .filter((e) => new Date(e.startsAt).getTime() >= now)
    .sort(
      (a, b) =>
        new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    )
    .slice(0, limit);

  return (
    <section id="events" className="scroll-mt-20">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>

      {upcoming.length === 0 ? (
        <p className="text-gray-500">Zur Zeit sind keine Events geplant.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {upcoming.map((e) => {
            const ms = new Date(e.startsAt).getTime() - now;
            return (
              <article
                key={e.id}
                className="border border-gray-200 rounded-2xl overflow-hidden flex flex-col"
              >
                {e.imageUrl && (
                  <img
                    src={e.imageUrl}
                    alt={e.title}
                    className="aspect-[4/3] w-full object-cover"
                  />
                )}
                <div className="p-4 flex flex-col gap-1">
                  <h3 className="font-semibold">{e.title}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(e.startsAt).toLocaleDateString("de-DE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    Uhr
                  </p>
                  <span className="mt-2 inline-block self-start rounded-full bg-asta-red/10 text-asta-red text-xs font-semibold px-3 py-1">
                    {formatCountdown(ms)}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
