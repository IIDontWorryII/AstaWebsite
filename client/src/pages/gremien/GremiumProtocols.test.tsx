// Tests the generic GremiumProtocols component: loading, loaded, error,
// and that the gremium prop is forwarded to fetchProtocols.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import GremiumProtocols from "./GremiumProtocols";

const mockFetchProtocols = vi.fn();

vi.mock("@/lib/api", () => ({
  fetchProtocols: (...args: unknown[]) => mockFetchProtocols(...args),
}));

beforeEach(() => {
  mockFetchProtocols.mockReset();
});

describe("GremiumProtocols", () => {
  it("shows loading then renders fetched protocols (gremium=ASTA)", async () => {
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

    render(<GremiumProtocols gremium="ASTA" />);

    expect(screen.getByText("Lädt…")).toBeInTheDocument();
    expect(
      await screen.findByText("AStA-Sitzung — Sommerfest-Planung"),
    ).toBeInTheDocument();
    expect(mockFetchProtocols).toHaveBeenCalledWith("ASTA");
  });

  it("forwards a different gremium prop (gremium=STUPA)", async () => {
    mockFetchProtocols.mockResolvedValueOnce([
      {
        id: "protocol-stupa-2026-03-20",
        gremium: "STUPA",
        title: "StuPa-Sitzung — Wahlordnung",
        meetingDate: "2026-03-20T00:00:00.000Z",
        fileUrl: "/uploads/protocols/stupa-2026-03-20.pdf",
        uploadedAt: "2026-03-20T00:00:00.000Z",
      },
    ]);

    render(<GremiumProtocols gremium="STUPA" />);

    expect(
      await screen.findByText("StuPa-Sitzung — Wahlordnung"),
    ).toBeInTheDocument();
    expect(mockFetchProtocols).toHaveBeenCalledWith("STUPA");
  });

  it("shows an error message when fetchProtocols rejects", async () => {
    mockFetchProtocols.mockRejectedValueOnce(new Error("network down"));

    render(<GremiumProtocols gremium="ASTA" />);

    await waitFor(() => {
      expect(screen.getByText(/Fehler: network down/)).toBeInTheDocument();
    });
  });
});
