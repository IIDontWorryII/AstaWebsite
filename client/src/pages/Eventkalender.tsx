// client/src/pages/Eventkalender.tsx
//
// Two modes:
//   - default: a month calendar (EventCalendar) with event posters.
//   - search:  when the user types a query or sets a filter, the calendar is
//     replaced by a tight wall of EventCards. "✕ Suche schließen" resets and
//     returns to the calendar.
// Clicking any poster/card opens the event popup (EventDialog).

import { useEffect, useMemo, useState } from "react";
import type { EventDTO } from "../../../shared/types";
import { EVENT_CATEGORIES } from "../../../shared/types";
import { fetchEvents } from "@/lib/api";
import { useFavorites } from "@/auth/FavoritesContext";
import EventCalendar from "@/components/EventCalendar";
import EventCard from "@/components/EventCard";
import EventDialog from "@/components/EventDialog";
import PageHero from "@/components/PageHero";

const MONTHS = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

/** An event counts as free when it has no price or says frei/kostenlos/0. */
function isFree(price: string | null): boolean {
  if (!price || !price.trim()) return true;
  return /frei|kostenlos|gratis|^0\s*€?$/i.test(price.trim());
}

export default function Eventkalender() {
  const [events, setEvents] = useState<EventDTO[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<EventDTO | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const favorites = useFavorites();

  // Filters.
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [place, setPlace] = useState("");
  const [month, setMonth] = useState(""); // "" = all, else month index as string
  const [price, setPrice] = useState(""); // "", "free", "paid"
  const [status, setStatus] = useState<"active" | "expired">("active");
  // Lets the user open the results list (all active events) by pressing
  // Enter even with no query/filters set.
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    fetchEvents()
      .then(setEvents)
      .catch((e) => setError(e instanceof Error ? e.message : "Fehler"));
  }, []);

  // Keep countdowns on the result cards fresh.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Distinct places for the place filter.
  const places = useMemo(
    () => [...new Set((events ?? []).map((e) => e.place))].sort(),
    [events],
  );

  // Search mode is on as soon as the user narrows anything (status counts:
  // switching to "expired" is an explicit search intent).
  const searchActive =
    searchOpen ||
    query.trim() !== "" ||
    category !== "" ||
    place !== "" ||
    month !== "" ||
    price !== "" ||
    status !== "active";

  const results = useMemo(() => {
    if (!events) return [];
    const q = query.trim().toLowerCase();
    return events
      .filter((e) =>
        status === "active"
          ? new Date(e.startsAt).getTime() >= now
          : new Date(e.startsAt).getTime() < now,
      )
      .filter((e) => (q ? e.title.toLowerCase().includes(q) : true))
      .filter((e) => (category ? e.category === category : true))
      .filter((e) => (place ? e.place === place : true))
      .filter((e) =>
        month ? new Date(e.startsAt).getMonth() === Number(month) : true,
      )
      .filter((e) =>
        price === "free"
          ? isFree(e.price)
          : price === "paid"
            ? !isFree(e.price)
            : true,
      )
      .sort(
        (a, b) =>
          new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
      );
  }, [events, query, category, place, month, price, status, now]);

  function resetSearch() {
    setQuery("");
    setCategory("");
    setPlace("");
    setMonth("");
    setPrice("");
    setStatus("active");
    setSearchOpen(false);
  }

  const selectClass =
    "border border-gray-300 rounded px-3 py-2 text-sm bg-white";

  return (
    <div>
      {/* Hero */}
      <PageHero
        image="/eventcalender-hero.jpg"
        title="Eventcalender"
        subtitle="Entdecke folgende Veranstaltungen des AStA Remagen"
        compact
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search + filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              // Enter opens the results list (all active events when empty).
              if (e.key === "Enter") {
                e.preventDefault();
                setSearchOpen(true);
              }
            }}
            placeholder="Event suchen…"
            aria-label="Event suchen"
            className="flex-1 min-w-48 border border-gray-300 rounded px-3 py-2 text-sm"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Referat"
            className={selectClass}
          >
            <option value="">Alle Referate</option>
            {EVENT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          <select
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            aria-label="Ort"
            className={selectClass}
          >
            <option value="">Alle Orte</option>
            {places.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            aria-label="Monat"
            className={selectClass}
          >
            <option value="">Alle Monate</option>
            {MONTHS.map((m, i) => (
              <option key={m} value={i}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            aria-label="Preis"
            className={selectClass}
          >
            <option value="">Alle Preise</option>
            <option value="free">Kostenlos</option>
            <option value="paid">Kostenpflichtig</option>
          </select>

          {/* Active / expired toggle */}
          <div className="inline-flex rounded border border-gray-300 overflow-hidden text-sm">
            <button
              type="button"
              onClick={() => setStatus("active")}
              className={`px-3 py-2 cursor-pointer ${
                status === "active" ? "bg-asta-red text-white" : "bg-white"
              }`}
            >
              Aktiv
            </button>
            <button
              type="button"
              onClick={() => setStatus("expired")}
              className={`px-3 py-2 cursor-pointer ${
                status === "expired" ? "bg-asta-red text-white" : "bg-white"
              }`}
            >
              Vergangen
            </button>
          </div>

          {searchActive && (
            <button
              type="button"
              onClick={resetSearch}
              className="px-3 py-2 text-sm font-medium text-asta-red hover:underline cursor-pointer"
            >
              ✕ Suche schließen
            </button>
          )}
        </div>

        {/* Body */}
        {error ? (
          <p className="text-red-600">Fehler: {error}</p>
        ) : events === null ? (
          <p className="text-gray-500">Lädt…</p>
        ) : searchActive ? (
          // Search results — a tight wall of cards.
          results.length === 0 ? (
            <p className="text-gray-500">Keine Events gefunden.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {results.map((e) => (
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
          )
        ) : (
          <EventCalendar events={events} onSelect={setSelected} />
        )}
      </div>

      <EventDialog event={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
