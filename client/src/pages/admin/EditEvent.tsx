// client/src/pages/admin/EditEvent.tsx
//
// Wrapper around EventForm in "edit" mode. Loads the event by URL param
// on mount, then renders the form pre-populated. Handles three states:
//   - loading  → spinner
//   - not found → "Event not found" message + back link
//   - found    → <EventForm event={event} />

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { EventDTO } from "../../../../shared/types";
import { fetchEventById } from "@/lib/admin-events";
import EventForm from "./EventForm";

export default function EditEvent() {
  // useParams reads the :id segment from the matched route path
  // ("/admin/events/:id/edit"). The type comes from the generic param.
  const { id } = useParams<{ id: string }>();

  const [event, setEvent] = useState<EventDTO | null | undefined>(undefined);
  // Three meanings:
  //   undefined → still loading
  //   null      → loaded, not found
  //   EventDTO  → loaded, found

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return; // shouldn't happen — route enforces the param
    fetchEventById(id)
      .then((e) => setEvent(e))
      .catch((err) => setError(err instanceof Error ? err.message : "Fehler"));
  }, [id]);

  if (error) {
    return (
      <section className="max-w-2xl mx-auto px-6 py-12">
        <p className="text-red-600">Fehler: {error}</p>
        <Link to="/admin/events" className="text-asta-red hover:underline">
          Zurück zur Liste
        </Link>
      </section>
    );
  }

  if (event === undefined) {
    return (
      <section className="max-w-2xl mx-auto px-6 py-12">
        <p className="text-gray-500">Lädt…</p>
      </section>
    );
  }

  if (event === null) {
    return (
      <section className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-4">Event nicht gefunden</h1>
        <Link to="/admin/events" className="text-asta-red hover:underline">
          Zurück zur Liste
        </Link>
      </section>
    );
  }

  return <EventForm event={event} />;
}
