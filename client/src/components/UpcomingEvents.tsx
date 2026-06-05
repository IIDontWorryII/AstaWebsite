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
import { formatCountdown, formatEventDate, selectUpcoming } from "@/lib/events";

interface UpcomingEventsProps {
  /** Filter to this category (EVENT_CATEGORIES value). Omit = all events. */
  category?: string;
  /** Max number of events to show. Default 3. */
  limit?: number;
  /** Section heading. Default "Bevorstehende Events". */
  title?: string;
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

  const upcoming = selectUpcoming(events, { category, limit, now });

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
                    {formatEventDate(e.startsAt)}
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
