// Tests AstaProtocols' loading, loaded, and error states with a mocked API.
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import AstaProtocols from "./AstaProtocols";

const mockFetchProtocols = vi.fn();

vi.mock("@/lib/api", () => ({
  fetchProtocols: (...args: unknown[]) => mockFetchProtocols(...args),
}));

describe("AstaProtocols", () => {
  it("shows loading then renders fetched protocols and calls fetchProtocols with 'ASTA'", async () => {
    mockFetchProtocols.mockResolvedValueOnce([
      {
        id: "protocol-asta-2026-04-15",
        gremium: "ASTA",
        title: "AStA-Sitzung — Sommerfest-Planung",
        meetingDate: "2026-04-15T00:00:00.000Z",
        fileUrl: "/uploads/protocols/asta-2026-04-15.pdf",
        uploadedAt: "2026-04-15T00:00:00.000Z",
      },
    ]);

    render(<AstaProtocols />);

    // Loading state appears immediately
    expect(screen.getByText("Lädt…")).toBeInTheDocument();

    // Title of the fetched protocol shows up after fetch resolves
    expect(
      await screen.findByText("AStA-Sitzung — Sommerfest-Planung"),
    ).toBeInTheDocument();

    // Called with the ASTA filter
    expect(mockFetchProtocols).toHaveBeenCalledWith("ASTA");
  });

  it("shows an error message when fetchProtocols rejects", async () => {
    mockFetchProtocols.mockRejectedValueOnce(new Error("network down"));

    render(<AstaProtocols />);

    await waitFor(() => {
      expect(screen.getByText(/Fehler: network down/)).toBeInTheDocument();
    });
  });
});
