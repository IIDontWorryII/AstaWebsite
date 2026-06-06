// client/src/lib/calendar.ts
//
// Build calendar entries from events — an .ics file (Apple/Outlook/Google
// all import it) and a Google Calendar "add event" link. Pure functions plus
// a small browser download helper. No backend involved.
//
// Events have no end time, so we assume a default duration.

import type { EventDTO } from "../../../shared/types";

const DEFAULT_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours

/** ISO timestamp → iCal UTC stamp, e.g. "2026-06-30T16:00:00.000Z" → "20260630T160000Z". */
function toICSDate(iso: string): string {
  return new Date(iso)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

/** Escape text per RFC 5545 (backslash, semicolon, comma, newlines). */
function escapeICS(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** A safe-ish file name from an event title. */
export function icsFilename(event: EventDTO): string {
  const slug =
    event.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "event";
  return `${slug}.ics`;
}

function vevent(event: EventDTO): string[] {
  const start = toICSDate(event.startsAt);
  const end = toICSDate(
    new Date(new Date(event.startsAt).getTime() + DEFAULT_DURATION_MS).toISOString(),
  );
  const stamp = toICSDate(new Date().toISOString());
  return [
    "BEGIN:VEVENT",
    `UID:${event.id}@asta-remagen`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeICS(event.title)}`,
    ...(event.description ? [`DESCRIPTION:${escapeICS(event.description)}`] : []),
    `LOCATION:${escapeICS(event.place)}`,
    "END:VEVENT",
  ];
}

function wrapCalendar(veventLines: string[]): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AStA Remagen//Eventkalender//DE",
    ...veventLines,
    "END:VCALENDAR",
  ].join("\r\n");
}

/** A one-event .ics document. */
export function eventToICS(event: EventDTO): string {
  return wrapCalendar(vevent(event));
}

/** A multi-event .ics document (e.g. all favorited events). */
export function eventsToICS(events: EventDTO[]): string {
  return wrapCalendar(events.flatMap(vevent));
}

/** "Add to Google Calendar" template URL for a single event. */
export function googleCalendarUrl(event: EventDTO): string {
  const start = toICSDate(event.startsAt);
  const end = toICSDate(
    new Date(new Date(event.startsAt).getTime() + DEFAULT_DURATION_MS).toISOString(),
  );
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${start}/${end}`,
    details: event.description ?? "",
    location: event.place,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Trigger a browser download of `content` as `filename`. */
export function downloadICS(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
