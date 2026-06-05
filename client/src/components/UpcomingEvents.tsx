// client/src/components/UpcomingEvents.tsx
//
// Reusable "next N events" section with a live countdown. Fetches events
// from the API, optionally filters to one category/referat, keeps the
// soonest `limit` future events, and renders them as EventCards.
//
// Used on the Sport page (category="SPORT") and reusable on BaRACke, Home,
// etc. — pass a different category or omit it to show all events.

import { useEffect, useState } from "react";
import type { EventDTO } from "../../../shared/types";
import { fetchEvents } from "@/lib/api";
import { selectUpcoming } from "@/lib/events";
import EventCard from "@/components/EventCard";

interface UpcomingEventsProps {
  /** Filter to this category (EVENT_CATEGORIES value). Omit = all events. */
  category?: string;
  /** Max number of events to show. Default 3. */
  limit?: number;
  /** Section heading. Default "Bevorstehende Events". */
  title?: string;
  /** Optional click handler (e.g. to open the event popup). */
  onSelect?: (event: EventDTO) => void;
}

export default function UpcomingEvents({
  category,
  limit = 3,
  title = "Bevorstehende Events",
  onSelect,
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
          {upcoming.map((e) => (
            <EventCard key={e.id} event={e} now={now} onClick={onSelect} />
          ))}
        </div>
      )}
    </section>
  );
}
