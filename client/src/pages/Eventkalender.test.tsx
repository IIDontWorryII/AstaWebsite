// Tests Eventkalender's loading and loaded states with a mocked API.
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Eventkalender from "./Eventkalender";

vi.mock("@/lib/api", () => ({
  fetchEvents: vi.fn().mockResolvedValue([
    {
      id: "event-sound-of-summer",
      title: "Sound of summer",
      description: "Campus Party",
      place: "Rheinahrcampus",
      startsAt: "2026-05-30T18:00:00",
    },
  ]),
}));

describe("Eventkalender", () => {
  it("shows loading then renders fetched events", async () => {
    render(<Eventkalender />);
    expect(screen.getByText("Lädt…")).toBeInTheDocument();
    expect(await screen.findByText("Sound of summer")).toBeInTheDocument();
  });
});
