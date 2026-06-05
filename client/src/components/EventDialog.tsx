// client/src/components/EventDialog.tsx
//
// Popup shown when an event poster/card is clicked. Left column: title,
// description, when/where/price. Right column: the full poster. Closes on
// the X button, a backdrop click, or Escape.

import { useEffect } from "react";
import { X } from "lucide-react";
import type { EventDTO } from "../../../shared/types";
import { formatEventDate } from "@/lib/events";

interface EventDialogProps {
  /** The event to show, or null when closed. */
  event: EventDTO | null;
  onClose: () => void;
}

export default function EventDialog({ event, onClose }: EventDialogProps) {
  // Close on Escape while open.
  useEffect(() => {
    if (!event) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
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
          </div>

          {/* Right: poster */}
          {event.imageUrl && (
            <div className="order-1 md:order-2">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full rounded-lg object-contain"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
