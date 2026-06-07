// client/src/components/EventsSection.tsx
//
// Home-page block: the next 3 upcoming events (live, with countdown) on the
// left, and the 3 most recent Sitzungsprotokolle (live) in the sidebar.
// Both used to be hardcoded — now they come from the API.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { EventDTO, ProtocolDTO } from "../../../shared/types";
import { fetchEvents, fetchProtocols } from "@/lib/api";
import { selectUpcoming } from "@/lib/events";
import { useFavorites } from "@/auth/FavoritesContext";
import EventCard from "@/components/EventCard";
import EventDialog from "@/components/EventDialog";

export default function EventsSection() {
  const [events, setEvents] = useState<EventDTO[]>([]);
  const [protocols, setProtocols] = useState<ProtocolDTO[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const [selected, setSelected] = useState<EventDTO | null>(null);
  const favorites = useFavorites();

  useEffect(() => {
    // Both lists are best-effort — failures shouldn't blank the homepage.
    fetchEvents()
      .then(setEvents)
      .catch(() => setEvents([]));
    fetchProtocols()
      .then(setProtocols)
      .catch(() => setProtocols([]));
  }, []);

  // Tick once a minute so the countdown stays current.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const upcoming = selectUpcoming(events, { limit: 3, now });
  // fetchProtocols returns newest first; take the latest 3.
  const recentProtocols = protocols.slice(0, 3);

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* One outer 4-col grid holds heading, cards, AND sidebar.
            - Heading: row 1 cols 1-3 (col 4 of row 1 stays empty)
            - Cards:   row 2 cols 1-3
            - Sidebar: row 2 col 4
            CSS Grid stretches row 2 → sidebar height = cards height. */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-x-8 gap-y-0">
          {/* Heading row — spans 3 cols so right edge aligns with card 3 */}
          <div className="lg:col-span-3 flex items-end justify-between mb-6">
            <h2 className="text-3xl font-bold">Bevorstehende Events</h2>
            <Link
              to="/eventkalender"
              className="text-asta-red hover:text-asta-red-dark font-medium"
            >
              Alle Events anzeigen →
            </Link>
          </div>

          {/* Cards row — 3-up grid spanning cols 1-3 */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcoming.length === 0 ? (
              <p className="text-gray-500">Zur Zeit sind keine Events geplant.</p>
            ) : (
              upcoming.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  now={now}
                  onClick={setSelected}
                  isFavorite={favorites.isFavorite(event.id)}
                  onToggleFavorite={
                    favorites.enabled
                      ? () => favorites.toggle(event.id)
                      : undefined
                  }
                />
              ))
            )}
          </div>

          {/* Sidebar: spans 1 column, naturally same height as cards row */}
          <aside className="lg:col-span-1 bg-gray-100 rounded-2xl p-6 flex flex-col">
            <h3 className="text-xl font-bold mb-4">Sitzungsprotokolle</h3>
            {recentProtocols.length === 0 ? (
              <p className="text-sm text-gray-500">Keine Protokolle vorhanden.</p>
            ) : (
              <ul className="space-y-3 flex-1">
                {recentProtocols.map((p) => (
                  <li key={p.id}>
                    <a
                      href={p.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white rounded-lg p-3 flex items-center justify-between gap-2 hover:bg-asta-red hover:text-white"
                    >
                      <span>
                        <span className="block text-sm">{p.title}</span>
                        {p.description && (
                          <span className="block text-xs opacity-70">
                            {p.description}
                          </span>
                        )}
                      </span>
                      <span aria-hidden>↓</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      </div>

      <EventDialog event={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
