// client/src/components/EventCard.test.tsx
//
// EventCard is presentational. The favorite heart only appears when an
// onToggleFavorite handler is passed, and reflects/toggles isFavorite.

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { EventDTO } from "../../../shared/types";
import EventCard from "./EventCard";

const event: EventDTO = {
  id: "e1",
  title: "Party",
  description: "desc",
  imageUrl: null,
  price: null,
  place: "Campus",
  category: null,
  startsAt: new Date(Date.now() + 86_400_000).toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("EventCard", () => {
  it("renders no heart when onToggleFavorite is omitted", () => {
    render(<EventCard event={event} />);
    expect(
      screen.queryByRole("button", { name: /Merkliste/ }),
    ).not.toBeInTheDocument();
  });

  it("shows a heart reflecting isFavorite and toggles on click", async () => {
    const onToggle = vi.fn();
    render(<EventCard event={event} isFavorite onToggleFavorite={onToggle} />);

    const heart = screen.getByRole("button", {
      name: "Aus Merkliste entfernen",
    });
    expect(heart).toHaveAttribute("aria-pressed", "true");

    await userEvent.click(heart);
    expect(onToggle).toHaveBeenCalledWith(event);
  });
});
