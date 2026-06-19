// client/src/components/UpcomingEvents.tsx
//
// Reusable "next N events" section with a live countdown. Fetches events
// from the API, optionally filters to one category/referat, keeps the
// soonest `limit` future events, and renders them as EventCards. Clicking a
// card opens the event popup; the heart toggles the favorite.
//
// Used on the Sport and BaRACke pages (and reusable elsewhere) — self
// contained, so a page just drops in <UpcomingEvents category="…" />.

import { useEffect, useState } from "react";
import type { EventDTO } from "../../../shared/types";
import { fetchEvents } from "@/lib/api";
import { selectUpcoming } from "@/lib/events";
import { useFavorites } from "@/auth/FavoritesContext";
import EventCard from "@/components/EventCard";
import EventDialog from "@/components/EventDialog";
import SectionHeader from "@/components/SectionHeader";

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
  const [selected, setSelected] = useState<EventDTO | null>(null);
  const favorites = useFavorites();

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
    <div>
      <SectionHeader title={title} />

      {upcoming.length === 0 ? (
        <p className="text-gray-500">Zur Zeit sind keine Events geplant.</p>
      ) : (
        // Cap the width so each card matches the smaller home-page cards
        // instead of stretching to a full third of the page.
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
          {upcoming.map((e) => (
            <EventCard
              key={e.id}
              event={e}
              now={now}
              onClick={setSelected}
              isFavorite={favorites.isFavorite(e.id)}
              onToggleFavorite={
                favorites.enabled ? () => favorites.toggle(e.id) : undefined
              }
            />
          ))}
        </div>
      )}

      <EventDialog event={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
