// client/src/pages/admin/AdminEvents.tsx
//
// EDITOR-only list view for managing events. Shows all events with
// "Bearbeiten" links and "Löschen" buttons. Delete confirmation goes
// through an AlertDialog so destructive clicks need a deliberate "Yes".
//
// State machine:
//   - loading: events haven't arrived yet (loading=true OR events===null)
//   - error:   getMe rejection or fetch failure
//   - data:    array of events; possibly empty (show "Keine Events" hint)
//
// After a successful delete we re-fetch the list. Simpler than splicing
// the deleted event out of local state, and guarantees we don't drift
// from the server (e.g. if a second admin deleted something concurrently).

import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { EventDTO } from "../../../../shared/types";
import { fetchEvents } from "@/lib/api";
import { deleteEvent } from "@/lib/admin-events";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdminEvents() {
  const [events, setEvents] = useState<EventDTO[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Stable reference so we can call this from both useEffect and the
  // delete handler without redeclaring the logic.
  const loadEvents = useCallback(() => {
    setError(null);
    setEvents(null);
    fetchEvents()
      .then(setEvents)
      .catch((e) => setError(e instanceof Error ? e.message : "Fehler"));
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  async function handleDelete(id: string) {
    try {
      await deleteEvent(id);
      // Re-fetch to get the fresh server state.
      loadEvents();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Löschen fehlgeschlagen");
    }
  }

  return (
    <section className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Events verwalten</h1>
        <Button
          render={<Link to="/admin/events/new" />}
          nativeButton={false}
          size="lg"
        >
          Neues Event
        </Button>
      </div>

      {error && (
        <p className="text-red-600 mb-4" role="alert">
          Fehler: {error}
        </p>
      )}

      {events === null ? (
        <p className="text-gray-500">Lädt…</p>
      ) : events.length === 0 ? (
        <p className="text-gray-500">
          Noch keine Events. Klicke „Neues Event“ um das erste anzulegen.
        </p>
      ) : (
        <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
          {events.map((event) => (
            <li
              key={event.id}
              className="flex items-center justify-between gap-4 p-4"
            >
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold truncate">{event.title}</h2>
                <p className="text-sm text-gray-600">
                  {new Date(event.startsAt).toLocaleString("de-DE", {
                    dateStyle: "long",
                    timeStyle: "short",
                  })}{" "}
                  · {event.place}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  render={<Link to={`/admin/events/${event.id}/edit`} />}
                  nativeButton={false}
                  variant="outline"
                  size="sm"
                >
                  Bearbeiten
                </Button>

                {/* AlertDialog confirms the destructive action. The actual
                    deletion runs in onClick of AlertDialogAction. */}
                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <Button
                        variant="destructive"
                        size="sm"
                        className="cursor-pointer"
                      >
                        Löschen
                      </Button>
                    }
                  />
                  <AlertDialogContent>
                    <AlertDialogTitle>Event löschen?</AlertDialogTitle>
                    <AlertDialogDescription>
                      „{event.title}“ wird unwiderruflich gelöscht. Auch das
                      Bild wird vom Server entfernt.
                    </AlertDialogDescription>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(event.id)}>
                        Ja, löschen
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
