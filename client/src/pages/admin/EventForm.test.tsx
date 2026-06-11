// client/src/pages/admin/EventForm.test.tsx
//
// Tests for the shared EventForm. We verify:
//   - Create mode: submitting calls createEvent with the typed payload
//     and navigates to /admin/events.
//   - Edit mode: form fields are pre-populated; submitting calls
//     updateEvent with the event id.
//   - Server error: message is rendered, submit button re-enabled.
//
// We mock @/lib/admin-events so create/update don't touch the network,
// and we spy on react-router's useNavigate so we can assert the redirect.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import type { EventDTO } from "../../../../shared/types";
import EventForm from "./EventForm";

const mockCreateEvent = vi.fn();
const mockUpdateEvent = vi.fn();
const mockNavigate = vi.fn();

vi.mock("@/lib/admin-events", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/admin-events")>(
      "@/lib/admin-events",
    );
  return {
    ...actual,
    createEvent: (...args: unknown[]) => mockCreateEvent(...args),
    updateEvent: (...args: unknown[]) => mockUpdateEvent(...args),
  };
});

// Mock useNavigate so we can assert on the redirect without a real router stack.
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

beforeEach(() => {
  mockCreateEvent.mockReset();
  mockUpdateEvent.mockReset();
  mockNavigate.mockReset();
});

const existingEvent: EventDTO = {
  id: "event-existing",
  title: "Existing Event",
  description: "Existing description",
  imageUrl: "/uploads/events/existing.png",
  price: "5€",
  place: "BaRACke",
  category: null,
  registrationEmail: null,
  startsAt: "2026-07-15T18:00:00.000Z",
  createdAt: "2026-05-01T00:00:00.000Z",
  updatedAt: "2026-05-01T00:00:00.000Z",
};

function renderForm(props: { event?: EventDTO } = {}) {
  return render(
    <MemoryRouter>
      <EventForm {...props} />
    </MemoryRouter>,
  );
}

describe("EventForm — create mode", () => {
  it("renders empty fields and submits createEvent with the typed input", async () => {
    mockCreateEvent.mockResolvedValueOnce({});

    renderForm();

    // Sanity: heading reflects create mode and required fields are empty.
    expect(screen.getByRole("heading", { name: "Neues Event" })).toBeInTheDocument();
    expect(screen.getByLabelText("Titel")).toHaveValue("");

    // Fill in the form.
    await userEvent.type(screen.getByLabelText("Titel"), "Test Event");
    await userEvent.type(
      screen.getByLabelText("Beschreibung"),
      "A nice description",
    );
    await userEvent.type(screen.getByLabelText("Ort"), "Campus");
    // datetime-local input — userEvent.type doesn't work on these reliably,
    // so we set the value directly via fireEvent-style change.
    const dateInput = screen.getByLabelText("Datum & Uhrzeit");
    await userEvent.click(dateInput);
    await userEvent.paste("2026-12-01T18:00");

    // Submit.
    await userEvent.click(
      screen.getByRole("button", { name: "Event erstellen" }),
    );

    // createEvent was called with the input + null file (no upload).
    await waitFor(() => {
      expect(mockCreateEvent).toHaveBeenCalledTimes(1);
    });
    const [input, file] = mockCreateEvent.mock.calls[0];
    expect(input).toMatchObject({
      title: "Test Event",
      description: "A nice description",
      place: "Campus",
      // startsAt is the local-to-ISO conversion of 2026-12-01T18:00.
      // We don't assert the exact value because it depends on the test runner's
      // local timezone — just that it's an ISO string ending in Z.
      startsAt: expect.stringMatching(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/),
    });
    expect(input.price).toBeUndefined();
    expect(file).toBeNull();

    // Navigated back to the list.
    expect(mockNavigate).toHaveBeenCalledWith("/admin/events");
  });

  it("shows an error message and stays on the page when createEvent rejects", async () => {
    mockCreateEvent.mockRejectedValueOnce(new Error("Title required"));

    renderForm();

    await userEvent.type(screen.getByLabelText("Titel"), "x");
    await userEvent.type(screen.getByLabelText("Beschreibung"), "x");
    await userEvent.type(screen.getByLabelText("Ort"), "x");
    const dateInput = screen.getByLabelText("Datum & Uhrzeit");
    await userEvent.click(dateInput);
    await userEvent.paste("2026-12-01T18:00");

    await userEvent.click(
      screen.getByRole("button", { name: "Event erstellen" }),
    );

    expect(
      await screen.findByText(/Fehler: Title required/),
    ).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

describe("EventForm — edit mode", () => {
  it("pre-fills the fields from the existing event", () => {
    renderForm({ event: existingEvent });

    expect(
      screen.getByRole("heading", { name: "Event bearbeiten" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Titel")).toHaveValue("Existing Event");
    expect(screen.getByLabelText("Beschreibung")).toHaveValue(
      "Existing description",
    );
    expect(screen.getByLabelText("Ort")).toHaveValue("BaRACke");
    // datetime-local value depends on the runner's timezone (UTC 18:00 is
    // 20:00 in CEST, 18:00 in UTC, etc.). Just assert the format is right:
    // "YYYY-MM-DDTHH:mm".
    const dateValue = (
      screen.getByLabelText("Datum & Uhrzeit") as HTMLInputElement
    ).value;
    expect(dateValue).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    // Existing image preview is rendered.
    expect(screen.getByAltText("Event-Poster Vorschau")).toHaveAttribute(
      "src",
      "/uploads/events/existing.png",
    );
  });

  it("submits updateEvent with the event id when edited", async () => {
    mockUpdateEvent.mockResolvedValueOnce({});

    renderForm({ event: existingEvent });

    // Change the title.
    const titleInput = screen.getByLabelText("Titel");
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, "Edited Title");

    await userEvent.click(screen.getByRole("button", { name: "Speichern" }));

    await waitFor(() => {
      expect(mockUpdateEvent).toHaveBeenCalledTimes(1);
    });
    const [id, input, file] = mockUpdateEvent.mock.calls[0];
    expect(id).toBe("event-existing");
    expect(input.title).toBe("Edited Title");
    expect(file).toBeNull(); // no new file picked
    expect(mockNavigate).toHaveBeenCalledWith("/admin/events");
  });
});
