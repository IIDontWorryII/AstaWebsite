// client/src/pages/admin/AdminProtocols.test.tsx
//
// Tests for the admin protocols list page. Mirrors AdminEvents.test.tsx:
// loading/data/empty/error states + the delete-via-AlertDialog flow.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import type { ProtocolDTO } from "../../../../shared/types";
import AdminProtocols from "./AdminProtocols";

const mockFetchAllProtocols = vi.fn();
const mockDeleteProtocol = vi.fn();

vi.mock("@/lib/admin-protocols", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/admin-protocols")>(
      "@/lib/admin-protocols",
    );
  return {
    ...actual,
    fetchAllProtocols: (...args: unknown[]) => mockFetchAllProtocols(...args),
    deleteProtocol: (...args: unknown[]) => mockDeleteProtocol(...args),
  };
});

beforeEach(() => {
  mockFetchAllProtocols.mockReset();
  mockDeleteProtocol.mockReset();
});

const baseProtocol: ProtocolDTO = {
  id: "protocol-1",
  gremium: "ASTA",
  title: "Sommerfest-Planung",
  description: null,
  meetingDate: "2026-04-15T00:00:00.000Z",
  fileUrl: "/uploads/protocols/abc.pdf",
  uploadedAt: "2026-04-16T10:00:00.000Z",
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/admin/protocols"]}>
      <AdminProtocols />
    </MemoryRouter>,
  );
}

describe("AdminProtocols", () => {
  it("shows the loading state then renders the fetched protocols", async () => {
    mockFetchAllProtocols.mockResolvedValueOnce([baseProtocol]);

    renderPage();

    expect(screen.getByText("Lädt…")).toBeInTheDocument();
    expect(await screen.findByText("Sommerfest-Planung")).toBeInTheDocument();
    // Gremium badge rendered.
    expect(screen.getByText("ASTA")).toBeInTheDocument();
  });

  it("shows an empty state when there are no protocols", async () => {
    mockFetchAllProtocols.mockResolvedValueOnce([]);

    renderPage();

    expect(
      await screen.findByText(/Noch keine Protokolle/),
    ).toBeInTheDocument();
  });

  it("runs the delete flow via AlertDialog and re-fetches the list", async () => {
    mockFetchAllProtocols
      .mockResolvedValueOnce([baseProtocol])
      .mockResolvedValueOnce([]);
    mockDeleteProtocol.mockResolvedValueOnce(undefined);

    renderPage();

    expect(await screen.findByText("Sommerfest-Planung")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Löschen" }));
    expect(await screen.findByText("Protokoll löschen?")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Ja, löschen" }));

    await waitFor(() => {
      expect(mockDeleteProtocol).toHaveBeenCalledWith("protocol-1");
    });
    await waitFor(() => {
      expect(screen.getByText(/Noch keine Protokolle/)).toBeInTheDocument();
    });
  });

  it("shows an error message when fetchAllProtocols rejects", async () => {
    mockFetchAllProtocols.mockRejectedValueOnce(new Error("network down"));

    renderPage();

    expect(
      await screen.findByText(/Fehler: network down/),
    ).toBeInTheDocument();
  });
});
