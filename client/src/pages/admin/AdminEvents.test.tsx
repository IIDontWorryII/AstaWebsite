// client/src/pages/admin/AdminEvents.test.tsx
//
// Tests for the admin events list page: renders the list, shows the
// empty state, and runs the delete flow (AlertDialog confirmation +
// re-fetch after success).
//
// We mock both the read API (fetchEvents) and the delete API
// (deleteEvent) so tests don't hit the network or the database.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import type { EventDTO } from "../../../../shared/types";
import AdminEvents from "./AdminEvents";

const mockFetchEvents = vi.fn();
const mockDeleteEvent = vi.fn();

// `fetchEvents` lives in `@/lib/api`; `deleteEvent` lives in `@/lib/admin-events`.
// We mock both modules so we can drive the page without real HTTP requests.
vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    fetchEvents: (...args: unknown[]) => mockFetchEvents(...args),
  };
});

vi.mock("@/lib/admin-events", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/admin-events")>(
      "@/lib/admin-events",
    );
  return {
    ...actual,
    deleteEvent: (...args: unknown[]) => mockDeleteEvent(...args),
  };
});

beforeEach(() => {
  mockFetchEvents.mockReset();
  mockDeleteEvent.mockReset();
});

const baseEvent: EventDTO = {
  id: "event-1",
  title: "Sommerfest",
  description: "Open-air party",
  imageUrl: null,
  price: null,
  place: "Campus",
  startsAt: "2026-07-15T18:00:00.000Z",
  createdAt: "2026-05-01T00:00:00.000Z",
  updatedAt: "2026-05-01T00:00:00.000Z",
};

function renderPage() {
  // MemoryRouter wraps the page so the in-component <Link>s render correctly.
  // No need for AuthProvider — AdminEvents itself doesn't read auth state
  // (RequireEditor handles the gate at the App.tsx level).
  return render(
    <MemoryRouter initialEntries={["/admin/events"]}>
      <AdminEvents />
    </MemoryRouter>,
  );
}

describe("AdminEvents", () => {
  it("shows the loading state then renders the fetched events", async () => {
    mockFetchEvents.mockResolvedValueOnce([baseEvent]);

    renderPage();

    expect(screen.getByText("Lädt…")).toBeInTheDocument();
    expect(await screen.findByText("Sommerfest")).toBeInTheDocument();
  });

  it("shows an empty state when there are no events", async () => {
    mockFetchEvents.mockResolvedValueOnce([]);

    renderPage();

    // The hint text starts with "Noch keine Events." — match a substring.
    expect(await screen.findByText(/Noch keine Events/)).toBeInTheDocument();
  });

  it("runs the delete flow: confirms via dialog, calls deleteEvent, re-fetches the list", async () => {
    // First call → returns the event; second call (after delete) → empty list.
    mockFetchEvents
      .mockResolvedValueOnce([baseEvent])
      .mockResolvedValueOnce([]);
    mockDeleteEvent.mockResolvedValueOnce(undefined);

    renderPage();

    // Wait for the event to render.
    expect(await screen.findByText("Sommerfest")).toBeInTheDocument();

    // Open the AlertDialog by clicking Löschen on the row.
    await userEvent.click(screen.getByRole("button", { name: "Löschen" }));

    // Dialog content appears.
    expect(await screen.findByText("Event löschen?")).toBeInTheDocument();

    // Confirm.
    await userEvent.click(screen.getByRole("button", { name: "Ja, löschen" }));

    // deleteEvent was called with the right id.
    await waitFor(() => {
      expect(mockDeleteEvent).toHaveBeenCalledWith("event-1");
    });

    // The page re-fetched (now returning empty), so the empty state appears.
    await waitFor(() => {
      expect(screen.getByText(/Noch keine Events/)).toBeInTheDocument();
    });
  });

  it("shows an error message when fetchEvents rejects", async () => {
    mockFetchEvents.mockRejectedValueOnce(new Error("network down"));

    renderPage();

    expect(
      await screen.findByText(/Fehler: network down/),
    ).toBeInTheDocument();
  });
});
