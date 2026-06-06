// client/src/lib/calendar.test.ts

import { describe, it, expect } from "vitest";
import type { EventDTO } from "../../../shared/types";
import {
  eventToICS,
  eventsToICS,
  googleCalendarUrl,
  icsFilename,
} from "./calendar";

const event: EventDTO = {
  id: "e1",
  title: "Sommer, Fest",
  description: "Party; bring friends",
  imageUrl: null,
  price: "5€",
  place: "Campus",
  category: null,
  startsAt: "2026-06-30T16:00:00.000Z",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("calendar", () => {
  it("builds a single-event ICS with the key fields", () => {
    const ics = eventToICS(event);
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("DTSTART:20260630T160000Z");
    expect(ics).toContain("DTEND:20260630T180000Z"); // default +2h
    expect(ics).toContain("SUMMARY:Sommer\\, Fest"); // comma escaped
    expect(ics).toContain("LOCATION:Campus");
    expect(ics).toContain("END:VCALENDAR");
  });

  it("escapes semicolons in the description", () => {
    expect(eventToICS(event)).toContain("DESCRIPTION:Party\\; bring friends");
  });

  it("builds a multi-event ICS with one VEVENT per event", () => {
    const ics = eventsToICS([event, { ...event, id: "e2", title: "Zwei" }]);
    expect(ics.match(/BEGIN:VEVENT/g)?.length).toBe(2);
  });

  it("builds a Google Calendar URL with dates and text", () => {
    const url = googleCalendarUrl(event);
    expect(url).toContain("calendar.google.com");
    expect(url).toContain("dates=20260630T160000Z%2F20260630T180000Z");
    expect(url).toContain("text=Sommer%2C+Fest");
  });

  it("derives a slug filename from the title", () => {
    expect(icsFilename(event)).toBe("sommer-fest.ics");
  });
});
