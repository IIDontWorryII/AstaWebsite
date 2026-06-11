// client/src/components/EventDialog.test.tsx
//
// A11y contract (AW-28): the popup is a labelled modal dialog and closes on
// Escape. (Favorites context is unused here → useFavorites safe-defaults.)

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { EventDTO } from "../../../shared/types";
import EventDialog from "./EventDialog";

const event: EventDTO = {
  id: "e1",
  title: "Test Event",
  description: "desc",
  imageUrl: null,
  price: null,
  place: "Campus",
  category: null,
  registrationEmail: null,
  startsAt: "2026-06-30T16:00:00.000Z",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("EventDialog", () => {
  it("renders nothing when there is no event", () => {
    const { container } = render(
      <EventDialog event={null} onClose={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("is a labelled modal dialog and closes on Escape", () => {
    const onClose = vi.fn();
    render(<EventDialog event={event} onClose={onClose} />);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby", "event-dialog-title");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
