// client/src/pages/Eventkalender.tsx
import { useEffect, useState } from "react";
import type { EventDTO } from "../../../shared/types";
import { fetchEvents } from "@/lib/api";

export default function Eventkalender() {
  const [events, setEvents] = useState<EventDTO[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents()
      .then(setEvents)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold">Eventkalender</h1>

      {error ? (
        <p className="mt-8 text-red-600">Fehler: {error}</p>
      ) : events === null ? (
        <p className="mt-8 text-gray-500">Lädt…</p>
      ) : (
        <ul className="mt-8 space-y-6">
        {events.map((e) => (
          <li key={e.id} className="border-b pb-4">
            <h2 className="text-xl font-semibold">{e.title}</h2>
            <p className="text-gray-600">{e.place}</p>
            <p className="text-gray-500 text-sm">
              {new Date(e.startsAt).toLocaleString("de-DE", {
                dateStyle: "long",
                timeStyle: "short",
              })}
            </p>
            <p className="mt-2">{e.description}</p>
          </li>
        ))}
        </ul>
      )}
    </section>
  );
}
