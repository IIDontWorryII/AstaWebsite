// client/src/pages/Eventkalender.test.tsx
//
// Calendar page: default month-calendar view, search-mode toggle, and the
// event popup. Events are mocked with dates relative to "now" so the test is
// deterministic regardless of when it runs.

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { EventDTO } from "../../../shared/types";
import Eventkalender from "./Eventkalender";

const mockFetchEvents = vi.fn();
vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return { ...actual, fetchEvents: (...a: unknown[]) => mockFetchEvents(...a) };
});

const today = new Date();
const DAY = 86_400_000;

function makeEvent(over: Partial<EventDTO>): EventDTO {
  return {
    id: "e",
    title: "Event",
    description: "desc",
    imageUrl: null,
    price: null,
    place: "Campus",
    category: null,
    registrationEmail: null,
    startsAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...over,
  };
}

// A poster sitting on the 15th of the current month (always in view).
const calEvent = makeEvent({
  id: "cal",
  title: "Kalender Event",
  imageUrl: "/cal.jpg",
  price: "5€",
  place: "Campus",
  startsAt: new Date(today.getFullYear(), today.getMonth(), 15, 18, 0).toISOString(),
});

// A guaranteed-future event for the search/active-results test.
const futureEvent = makeEvent({
  id: "future",
  title: "Zukunft Fest",
  startsAt: new Date(Date.now() + 5 * DAY).toISOString(),
});

beforeEach(() => {
  mockFetchEvents.mockReset();
  mockFetchEvents.mockResolvedValue([calEvent, futureEvent]);
});

describe("Eventkalender", () => {
  it("renders the hero and a month calendar with weekday headers and the event poster", async () => {
    render(<Eventkalender />);

    expect(
      screen.getByText(/Veranstaltungen des AStA Remagen/),
    ).toBeInTheDocument();

    // Weekday headers (calendar mode).
    expect(await screen.findByText("Mo")).toBeInTheDocument();
    expect(screen.getByText("So")).toBeInTheDocument();
    // The poster renders on its day.
    expect(screen.getByAltText("Kalender Event")).toBeInTheDocument();
  });

  it("switches to a results list when searching and back when closed", async () => {
    const user = userEvent.setup();
    render(<Eventkalender />);
    await screen.findByText("Mo");

    await user.type(screen.getByLabelText("Event suchen"), "Zukunft");

    // Calendar gone, result card shown.
    await waitFor(() =>
      expect(screen.queryByText("Mo")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Zukunft Fest")).toBeInTheDocument();

    // Close search → calendar returns.
    await user.click(screen.getByRole("button", { name: /Suche schließen/ }));
    expect(await screen.findByText("Mo")).toBeInTheDocument();
  });

  it("opens the event popup when a poster is clicked", async () => {
    const user = userEvent.setup();
    render(<Eventkalender />);
    await screen.findByText("Mo");

    await user.click(screen.getByRole("button", { name: "Kalender Event" }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Kalender Event")).toBeInTheDocument();
    expect(within(dialog).getByText("Campus")).toBeInTheDocument();
    expect(within(dialog).getByText("5€")).toBeInTheDocument();
    // Add-to-calendar options are present.
    expect(
      within(dialog).getByRole("button", { name: /Zum Kalender/ }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole("link", { name: "Google Kalender" }),
    ).toBeInTheDocument();
  });
});
