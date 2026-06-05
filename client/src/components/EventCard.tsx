// client/src/components/EventCard.tsx
//
// Presentational event card shared by the Home "upcoming events" block, the
// Sport page, and the calendar search results — so they all look identical.
// Shows the poster, title, date and a countdown badge (or "Vorbei" once the
// event is in the past). Pass `onClick` to make it an interactive button
// (e.g. to open the event popup); omit it for a static card.

import type { EventDTO } from "../../../shared/types";
import { formatCountdown, formatEventDate } from "@/lib/events";

interface EventCardProps {
  event: EventDTO;
  /** Current time in ms; pass a ticking value to keep the countdown live. */
  now?: number;
  /** When provided, the card becomes a button calling this on click. */
  onClick?: (event: EventDTO) => void;
}

export default function EventCard({
  event,
  now = Date.now(),
  onClick,
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
          className="aspect-[4/5] w-full object-cover"
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

  if (onClick) {
    return (
      <button type="button" onClick={() => onClick(event)} className={base + interactive}>
        {inner}
      </button>
    );
  }
  return <article className={base}>{inner}</article>;
}
