// client/src/components/EventDialog.tsx
//
// Popup shown when an event poster/card is clicked. Left column: title,
// description, when/where/price. Right column: the full poster. Closes on
// the X button, a backdrop click, or Escape.

import { useEffect, useRef } from "react";
import { Heart, X } from "lucide-react";
import type { EventDTO } from "../../../shared/types";
import { formatEventDate } from "@/lib/events";
import { useFavorites } from "@/auth/FavoritesContext";
import {
  downloadICS,
  eventToICS,
  googleCalendarUrl,
  icsFilename,
} from "@/lib/calendar";

interface EventDialogProps {
  /** The event to show, or null when closed. */
  event: EventDTO | null;
  onClose: () => void;
}

export default function EventDialog({ event, onClose }: EventDialogProps) {
  const favorites = useFavorites();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // While open: close on Escape, move focus into the dialog, and restore
  // focus to the trigger element when it closes (a11y — AW-28).
  useEffect(() => {
    if (!event) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const raf = requestAnimationFrame(() => closeButtonRef.current?.focus());

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      previouslyFocused.current?.focus?.();
    };
  }, [event, onClose]);

  if (!event) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-dialog-title"
        // Stop clicks inside the panel from bubbling to the backdrop.
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
      >
        <button
          type="button"
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="Schließen"
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-gray-100 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid md:grid-cols-2 gap-6 p-6">
          {/* Left: details */}
          <div className="order-2 md:order-1">
            <h2 id="event-dialog-title" className="text-2xl font-bold mb-3">
              {event.title}
            </h2>

            {favorites.enabled && (
              <button
                type="button"
                onClick={() => favorites.toggle(event.id)}
                aria-pressed={favorites.isFavorite(event.id)}
                className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full border border-gray-300 text-sm font-medium hover:bg-gray-50 cursor-pointer"
              >
                <Heart
                  className={`h-4 w-4 ${
                    favorites.isFavorite(event.id)
                      ? "fill-asta-red text-asta-red"
                      : "text-gray-600"
                  }`}
                />
                {favorites.isFavorite(event.id) ? "Gemerkt" : "Merken"}
              </button>
            )}

            <p className="text-gray-700 whitespace-pre-line mb-4">
              {event.description}
            </p>
            <dl className="text-sm space-y-1">
              <div>
                <dt className="inline font-semibold">Wann: </dt>
                <dd className="inline">{formatEventDate(event.startsAt)}</dd>
              </div>
              <div>
                <dt className="inline font-semibold">Wo: </dt>
                <dd className="inline">{event.place}</dd>
              </div>
              <div>
                <dt className="inline font-semibold">Preis: </dt>
                <dd className="inline">{event.price?.trim() || "Frei"}</dd>
              </div>
            </dl>

            {/* Add to calendar. */}
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                type="button"
                onClick={() => downloadICS(icsFilename(event), eventToICS(event))}
                className="px-3 py-1.5 rounded-full border border-gray-300 text-sm font-medium hover:bg-gray-50 cursor-pointer"
              >
                📅 Zum Kalender (.ics)
              </button>
              <a
                href={googleCalendarUrl(event)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-full border border-gray-300 text-sm font-medium hover:bg-gray-50"
              >
                Google Kalender
              </a>
            </div>
          </div>

          {/* Right: poster + (optional) registration button under it. */}
          {(event.imageUrl || event.registrationEmail) && (
            <div className="order-1 md:order-2">
              {event.imageUrl && (
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full aspect-[4/5] rounded-lg object-contain bg-gray-100"
                />
              )}
              {event.registrationEmail && (
                <a
                  href={`mailto:${event.registrationEmail}?subject=${encodeURIComponent(
                    `${event.title} Anmeldung`,
                  )}`}
                  className="mt-3 block w-full text-center rounded-lg bg-asta-red text-white font-semibold px-4 py-2.5 hover:bg-asta-red-dark"
                >
                  Sich anmelden
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
