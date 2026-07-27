// client/src/pages/admin/gremien/AdminGremiumPage.test.tsx
//
// Tests for the admin Gremium page: loading/error states, render of fetched
// sections, and the inline edit flow (type in place → save bar → list update).
//
// We mock @/lib/pages so the page doesn't hit the network.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import type { PageDTO, PageSectionDTO } from "../../../../../shared/types";
import AdminGremiumPage from "./AdminGremiumPage";

const mockFetchPage = vi.fn();
const mockUpdateSection = vi.fn();
const mockDeleteSection = vi.fn();
const mockMoveSection = vi.fn();
const mockAddReferatSection = vi.fn();

// The section body is edited with the rich-text editor (a contenteditable
// ProseMirror widget). Swap it for a plain <textarea> honouring the same
// value/onChange/ariaLabel contract so getByLabelText("Text") + fireEvent.change
// still drive the real inline-edit logic.
vi.mock("@/components/RichTextEditor", () => ({
  default: ({
    value,
    onChange,
    ariaLabel,
  }: {
    value: string;
    onChange: (v: string) => void;
    ariaLabel?: string;
  }) => (
    <textarea
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
  isEmptyHtml: (html: string) =>
    html.replace(/<[^>]*>/g, "").replace(/\s|&nbsp;/g, "") === "",
}));

vi.mock("@/lib/pages", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/pages")>("@/lib/pages");
  return {
    ...actual,
    fetchPage: (...args: unknown[]) => mockFetchPage(...args),
    updateSection: (...args: unknown[]) => mockUpdateSection(...args),
    deleteSection: (...args: unknown[]) => mockDeleteSection(...args),
    moveSection: (...args: unknown[]) => mockMoveSection(...args),
    addReferatSection: (...args: unknown[]) => mockAddReferatSection(...args),
  };
});

beforeEach(() => {
  mockFetchPage.mockReset();
  mockUpdateSection.mockReset();
  mockDeleteSection.mockReset();
  mockMoveSection.mockReset();
  mockAddReferatSection.mockReset();
});

const referatSection: PageSectionDTO = {
  id: "section-vorsitz",
  order: 1,
  kind: "REFERAT",
  subtitle: "Vorsitz",
  body: "Der Vorsitzende koordiniert die Arbeit des AStA.",
  imageUrl: "/referate/alpay.jpg",
  caption: "Alpay Aydin",
  email: "rac-asta-vorsitz@rheinahrcampus.de",
};

const infoSection: PageSectionDTO = {
  id: "section-info",
  order: 0,
  kind: "INFO",
  subtitle: null,
  body: "Der Allgemeine Studierendenausschuss…",
  imageUrl: "/asta-team.jpg",
  caption: null,
  email: null,
};

const astaPage: PageDTO = {
  id: "page-asta",
  slug: "asta",
  title: "AStA",
  heroImageUrl: null,
  sections: [infoSection, referatSection],
};

function renderAt(path = "/admin/gremien/asta") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/admin/gremien/:slug" element={<AdminGremiumPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("AdminGremiumPage", () => {
  it("shows loading then renders the fetched sections", async () => {
    mockFetchPage.mockResolvedValueOnce(astaPage);

    renderAt();

    expect(screen.getByText("Lädt…")).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "AStA bearbeiten" }),
    ).toBeInTheDocument();
    expect(mockFetchPage).toHaveBeenCalledWith("asta");
    // The INFO body renders directly in the inline editor.
    expect(screen.getByLabelText("Text")).toHaveValue(
      "Der Allgemeine Studierendenausschuss…",
    );
  });

  it("shows an error message when fetchPage rejects", async () => {
    mockFetchPage.mockRejectedValueOnce(new Error("network down"));

    renderAt();

    expect(
      await screen.findByText(/Fehler: network down/),
    ).toBeInTheDocument();
  });

  it("edits text inline and reveals a save bar (no drawer/pencil)", async () => {
    mockFetchPage.mockResolvedValueOnce(astaPage);

    renderAt();
    await screen.findByRole("heading", { name: "AStA bearbeiten" });

    // No pencil/drawer affordance anymore.
    expect(screen.queryByTitle("Bearbeiten")).not.toBeInTheDocument();

    const body = screen.getByLabelText("Text") as HTMLTextAreaElement;
    expect(body).toHaveValue("Der Allgemeine Studierendenausschuss…");
    // Nothing changed yet → no save bar.
    expect(
      screen.queryByRole("button", { name: "Speichern" }),
    ).not.toBeInTheDocument();

    fireEvent.change(body, { target: { value: "Neuer Text" } });

    // Editing in place reveals the per-section save bar.
    expect(
      screen.getByRole("button", { name: "Speichern" }),
    ).toBeInTheDocument();
  });

  it("saves an inline edit via updateSection and updates the rendered list", async () => {
    mockFetchPage.mockResolvedValueOnce(astaPage);

    const updated: PageSectionDTO = {
      ...infoSection,
      body: "Updated info text for the page.",
    };
    mockUpdateSection.mockResolvedValueOnce(updated);

    renderAt();
    await screen.findByRole("heading", { name: "AStA bearbeiten" });

    // Edit the INFO body in place and save.
    const body = screen.getByLabelText("Text") as HTMLTextAreaElement;
    fireEvent.change(body, {
      target: { value: "Updated info text for the page." },
    });

    await userEvent.click(screen.getByRole("button", { name: "Speichern" }));

    await waitFor(() => {
      expect(mockUpdateSection).toHaveBeenCalledTimes(1);
    });
    const [id, input, file] = mockUpdateSection.mock.calls[0];
    expect(id).toBe(infoSection.id);
    expect(input.body).toBe("Updated info text for the page.");
    expect(file).toBeNull();

    // After save, the inline editor reflects the saved value and the save bar
    // disappears (no longer dirty).
    await waitFor(() => {
      expect(screen.getByLabelText("Text")).toHaveValue(
        "Updated info text for the page.",
      );
    });
    expect(
      screen.queryByRole("button", { name: "Speichern" }),
    ).not.toBeInTheDocument();
  });

  it("hides REFERAT and MEMBER sections (managed in the Mitglieder tool)", async () => {
    const memberSection: PageSectionDTO = {
      ...referatSection,
      id: "section-member",
      kind: "MEMBER",
      subtitle: "Präsident",
      caption: "Max Mustermann",
      body: null,
    };
    mockFetchPage.mockResolvedValueOnce({
      ...astaPage,
      sections: [infoSection, referatSection, memberSection],
    });

    renderAt();
    await screen.findByRole("heading", { name: "AStA bearbeiten" });

    // The REFERAT ("Vorsitz") and MEMBER ("Max Mustermann") sections are not
    // rendered; only the INFO section is editable here → exactly one inline
    // body editor.
    expect(screen.queryByText("Vorsitz")).not.toBeInTheDocument();
    expect(screen.queryByText("Max Mustermann")).not.toBeInTheDocument();
    expect(screen.getAllByLabelText("Text")).toHaveLength(1);

    // And there is no "add Referat/Mitglied" button on this page anymore.
    expect(
      screen.queryByRole("button", { name: /Referat hinzufügen/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Mitglied hinzufügen/i }),
    ).not.toBeInTheDocument();
  });
});
