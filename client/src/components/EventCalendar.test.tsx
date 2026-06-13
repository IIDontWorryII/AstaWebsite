// client/src/components/EventCalendar.test.tsx
//
// The month grid: weekday headers, an event poster on its day, and the
// ±1-month navigation bounds.

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { EventDTO } from "../../../shared/types";
import EventCalendar from "./EventCalendar";

const today = new Date();

const event: EventDTO = {
  id: "cal",
  title: "Kalender Event",
  description: "desc",
  imageUrl: "/cal.jpg",
  price: null,
  place: "Campus",
  categories: [],
  registrationEmail: null,
  startsAt: new Date(today.getFullYear(), today.getMonth(), 15, 18, 0).toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("EventCalendar", () => {
  it("renders weekday headers and the event poster on its day", () => {
    render(<EventCalendar events={[event]} onSelect={vi.fn()} />);
    expect(screen.getByText("Mo")).toBeInTheDocument();
    expect(screen.getByText("So")).toBeInTheDocument();
    expect(screen.getByAltText("Kalender Event")).toBeInTheDocument();
  });

  it("calls onSelect when a poster is clicked", async () => {
    const onSelect = vi.fn();
    render(<EventCalendar events={[event]} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole("button", { name: "Kalender Event" }));
    expect(onSelect).toHaveBeenCalledWith(event);
  });

  it("limits navigation to one month back and forward", async () => {
    render(<EventCalendar events={[]} onSelect={vi.fn()} />);
    const prev = screen.getByRole("button", { name: "Vorheriger Monat" });
    const next = screen.getByRole("button", { name: "Nächster Monat" });

    // Both enabled at the current month.
    expect(prev).toBeEnabled();
    expect(next).toBeEnabled();

    // One step back → prev hits its bound and disables.
    await userEvent.click(prev);
    expect(prev).toBeDisabled();

    // Back to current, then two steps forward → next disables at +1.
    await userEvent.click(next);
    await userEvent.click(next);
    expect(next).toBeDisabled();
  });
});
