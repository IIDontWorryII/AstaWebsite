// client/src/components/EventCalendar.tsx
//
// A common month calendar: Monday-first weekday headers, a day number on
// each cell, weekend columns shaded, and event posters (2:3, filling the
// cell) on their day. Clicking a poster calls onSelect. Navigation is
// limited to one month back / forward from the current month.

import { useState } from "react";
import type { EventDTO } from "../../../shared/types";

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

/** Local-time day key, e.g. "2026-5-30" (year-monthIndex-day). */
function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

interface EventCalendarProps {
  events: EventDTO[];
  onSelect: (event: EventDTO) => void;
}

export default function EventCalendar({ events, onSelect }: EventCalendarProps) {
  const today = new Date();
  // Allowed range: one month back .. one month forward from the current month.
  const [offset, setOffset] = useState(0);

  const view = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const year = view.getFullYear();
  const month = view.getMonth();

  // Monday-first index of the 1st (0 = Monday … 6 = Sunday).
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

  // Group events by day for quick lookup.
  const eventsByDay = new Map<string, EventDTO[]>();
  for (const e of events) {
    const key = dayKey(new Date(e.startsAt));
    const arr = eventsByDay.get(key);
    if (arr) arr.push(e);
    else eventsByDay.set(key, [e]);
  }

  const cells = Array.from({ length: totalCells }, (_, i) => {
    const date = new Date(year, month, i - firstWeekday + 1);
    return { date, inMonth: date.getMonth() === month };
  });

  const monthLabel = view.toLocaleDateString("de-DE", {
    month: "long",
    year: "numeric",
  });

  const navBtn =
    "px-3 py-1 rounded border border-gray-300 text-sm font-medium hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer";

  return (
    <div>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          className={navBtn}
          disabled={offset <= -1}
          onClick={() => setOffset((o) => Math.max(-1, o - 1))}
          aria-label="Vorheriger Monat"
        >
          ←
        </button>
        <h2 className="text-xl font-bold capitalize">{monthLabel}</h2>
        <button
          type="button"
          className={navBtn}
          disabled={offset >= 1}
          onClick={() => setOffset((o) => Math.min(1, o + 1))}
          aria-label="Nächster Monat"
        >
          →
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-center text-sm font-semibold text-gray-600">
        {WEEKDAYS.map((w, i) => (
          <div key={w} className={i >= 5 ? "text-asta-red" : undefined}>
            {w}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 border-l border-t border-gray-200 mt-1">
        {cells.map(({ date, inMonth }, i) => {
          const weekend = i % 7 >= 5;
          const dayEvents = inMonth ? eventsByDay.get(dayKey(date)) ?? [] : [];
          const isToday = dayKey(date) === dayKey(today);
          return (
            <div
              key={i}
              className={`min-h-24 md:min-h-32 border-r border-b border-gray-200 p-1 ${
                weekend ? "bg-orange-50" : ""
              } ${!inMonth ? "bg-gray-50" : ""}`}
            >
              <div
                className={`text-xs font-medium ${
                  !inMonth ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <span
                  className={
                    isToday
                      ? "inline-flex items-center justify-center h-5 w-5 rounded-full bg-asta-red text-white"
                      : undefined
                  }
                >
                  {date.getDate()}
                </span>
              </div>

              <div className="mt-1 space-y-1">
                {dayEvents.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => onSelect(e)}
                    title={e.title}
                    className="block w-full cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    {e.imageUrl ? (
                      <img
                        src={e.imageUrl}
                        alt={e.title}
                        className="w-full aspect-[4/5] object-cover rounded"
                      />
                    ) : (
                      <div className="w-full aspect-[4/5] rounded bg-asta-red text-white text-[10px] leading-tight font-semibold p-1 flex items-center justify-center text-center">
                        {e.title}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
