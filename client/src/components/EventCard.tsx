// client/src/components/EventCard.tsx
//
// Presentational event card shared by the Home "upcoming events" block, the
// Sport page, and the calendar search results — so they all look identical.
// Shows the poster, title, date and a countdown badge (or "Vorbei" once the
// event is in the past). Pass `onClick` to make the card open something
// (e.g. the popup). Pass `onToggleFavorite` to show a heart toggle overlay.

import { Heart } from "lucide-react";
import type { EventDTO } from "../../../shared/types";
import { formatCountdown, formatEventDate } from "@/lib/events";

interface EventCardProps {
  event: EventDTO;
  /** Current time in ms; pass a ticking value to keep the countdown live. */
  now?: number;
  /** When provided, clicking the card calls this. */
  onClick?: (event: EventDTO) => void;
  /** Whether this event is currently favorited (controls the heart fill). */
  isFavorite?: boolean;
  /** When provided, a heart toggle is rendered over the poster. */
  onToggleFavorite?: (event: EventDTO) => void;
}

export default function EventCard({
  event,
  now = Date.now(),
  onClick,
  isFavorite = false,
  onToggleFavorite,
}: EventCardProps) {
  const ms = new Date(event.startsAt).getTime() - now;
  const expired = ms <= 0;

  const base =
    "border border-gray-200 rounded-2xl overflow-hidden flex flex-col bg-white text-left w-full";
  const interactive = onClick
    ? " hover:shadow-md transition-shadow cursor-pointer"
    : "";

  const inner = (
    <>
      {event.imageUrl ? (
        <img
          src={event.imageUrl}
          alt={event.title}
          loading="lazy"
          decoding="async"
          className="aspect-[4/5] w-full object-contain bg-gray-100"
        />
      ) : (
        // Decorative placeholder when there's no poster (title shows below).
        <div className="aspect-[4/5] w-full bg-asta-red/10" aria-hidden="true" />
      )}
      <div className="p-4">
        <h3 className="font-semibold">{event.title}</h3>
        <p className="text-sm text-gray-600 mt-1">
          {formatEventDate(event.startsAt)}
        </p>
        <span
          className={`mt-2 inline-block rounded-full text-xs font-semibold px-3 py-1 ${
            expired
              ? "bg-gray-200 text-gray-600"
              : "bg-asta-red/10 text-asta-red"
          }`}
        >
          {expired ? "Vorbei" : formatCountdown(ms)}
        </span>
      </div>
    </>
  );

  const card = onClick ? (
    <button type="button" onClick={() => onClick(event)} className={base + interactive}>
      {inner}
    </button>
  ) : (
    <article className={base}>{inner}</article>
  );

  // No favorite toggle → return the card directly (keeps the DOM minimal).
  if (!onToggleFavorite) return card;

  // With a favorite toggle, wrap so the heart can sit over the poster as a
  // sibling button (avoids invalid nested <button>s).
  return (
    <div className="relative">
      {card}
      <button
        type="button"
        onClick={() => onToggleFavorite(event)}
        aria-label={
          isFavorite ? "Aus Merkliste entfernen" : "Zur Merkliste hinzufügen"
        }
        aria-pressed={isFavorite}
        className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/90 hover:bg-white shadow cursor-pointer"
      >
        <Heart
          className={`h-5 w-5 ${
            isFavorite ? "fill-asta-red text-asta-red" : "text-gray-600"
          }`}
        />
      </button>
    </div>
  );
}
