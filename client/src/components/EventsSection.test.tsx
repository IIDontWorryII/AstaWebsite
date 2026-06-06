// client/src/components/EventsSection.test.tsx
//
// Verifies the Home events block renders LIVE data: upcoming events (future
// only, with a countdown) and the latest protocols, plus the "Alle Events"
// link. We mock @/lib/api so no network is hit.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { EventDTO, ProtocolDTO } from "../../../shared/types";
import EventsSection from "./EventsSection";

const mockFetchEvents = vi.fn();
const mockFetchProtocols = vi.fn();

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    fetchEvents: (...a: unknown[]) => mockFetchEvents(...a),
    fetchProtocols: (...a: unknown[]) => mockFetchProtocols(...a),
  };
});

const DAY = 86_400_000;
function iso(offsetMs: number): string {
  return new Date(Date.now() + offsetMs).toISOString();
}

function makeEvent(over: Partial<EventDTO>): EventDTO {
  return {
    id: "e1",
    title: "Test Event",
    description: "d",
    imageUrl: null,
    price: null,
    place: "Campus",
    category: null,
    startsAt: iso(3 * DAY),
    createdAt: iso(-DAY),
    updatedAt: iso(-DAY),
    ...over,
  };
}

const protocol: ProtocolDTO = {
  id: "p1",
  gremium: "ASTA",
  title: "AStA-Sitzung Protokoll",
  description: null,
  meetingDate: iso(-DAY),
  fileUrl: "https://example.com/p1.pdf",
  uploadedAt: iso(-DAY),
};

beforeEach(() => {
  mockFetchEvents.mockReset();
  mockFetchProtocols.mockReset();
});

function renderSection() {
  return render(
    <MemoryRouter>
      <EventsSection />
    </MemoryRouter>,
  );
}

describe("EventsSection", () => {
  it("shows upcoming events with a countdown, hides past ones, and lists protocols", async () => {
    mockFetchEvents.mockResolvedValueOnce([
      makeEvent({ id: "future", title: "Future Party", startsAt: iso(2 * DAY) }),
      makeEvent({ id: "past", title: "Past Party", startsAt: iso(-2 * DAY) }),
    ]);
    mockFetchProtocols.mockResolvedValueOnce([protocol]);

    renderSection();

    expect(await screen.findByText("Future Party")).toBeInTheDocument();
    // Past event is filtered out.
    expect(screen.queryByText("Past Party")).not.toBeInTheDocument();
    // Countdown badge rendered.
    expect(screen.getByText(/noch \d/)).toBeInTheDocument();
    // Protocol shows up with a download link to its file.
    const link = await screen.findByText("AStA-Sitzung Protokoll");
    expect(link.closest("a")).toHaveAttribute(
      "href",
      "https://example.com/p1.pdf",
    );
  });

  it("shows empty-state copy when there is no data", async () => {
    mockFetchEvents.mockResolvedValueOnce([]);
    mockFetchProtocols.mockResolvedValueOnce([]);

    renderSection();

    expect(
      await screen.findByText("Zur Zeit sind keine Events geplant."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Keine Protokolle vorhanden."),
    ).toBeInTheDocument();
  });
});
