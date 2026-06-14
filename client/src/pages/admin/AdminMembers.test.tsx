// client/src/pages/admin/AdminMembers.test.tsx
//
// The Mitglieder tool reads the three gremien pages and lists their member
// sections per tab. We mock the pages API so no network is hit.

import { beforeEach, describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import type { PageDTO, PageSectionDTO } from "../../../../shared/types";
import AdminMembers from "./AdminMembers";

const mockFetchPage = vi.fn();
vi.mock("@/lib/pages", async () => {
  const actual = await vi.importActual<typeof import("@/lib/pages")>(
    "@/lib/pages",
  );
  return {
    ...actual,
    fetchPage: (slug: string) => mockFetchPage(slug),
  };
});

function section(over: Partial<PageSectionDTO>): PageSectionDTO {
  return {
    id: Math.random().toString(36).slice(2),
    order: 0,
    kind: "MEMBER",
    subtitle: null,
    body: null,
    imageUrl: null,
    caption: null,
    email: null,
    ...over,
  };
}

function page(slug: string, sections: PageSectionDTO[]): PageDTO {
  return { id: slug, slug, title: slug, intro: null, heroImageUrl: null, sections };
}

const PAGES: Record<string, PageDTO> = {
  asta: page("asta", [
    section({ kind: "REFERAT", subtitle: "Kultur", caption: "Anna Schulz" }),
  ]),
  stupa: page("stupa", [
    section({ kind: "MEMBER", subtitle: "Präsident", caption: "Tim Meyer" }),
  ]),
  fachschaften: page("fachschaften", [
    section({ kind: "FREEFORM", subtitle: "FS MIT" }),
    section({ kind: "FREEFORM", subtitle: "FS WiSo" }),
    section({ kind: "MEMBER", subtitle: "FS MIT", caption: "Mia Mit" }),
    section({ kind: "MEMBER", subtitle: "FS WiSo", caption: "Willi WiSo" }),
  ]),
};

beforeEach(() => {
  mockFetchPage.mockReset();
  mockFetchPage.mockImplementation((slug: string) =>
    Promise.resolve(PAGES[slug]),
  );
});

function renderTool() {
  return render(
    <MemoryRouter>
      <AdminMembers />
    </MemoryRouter>,
  );
}

describe("AdminMembers", () => {
  it("shows AStA referate on the default tab", async () => {
    renderTool();
    expect(await screen.findByText("Kultur")).toBeInTheDocument();
    expect(screen.getByText("Anna Schulz")).toBeInTheDocument();
  });

  it("switches to the StuPa tab", async () => {
    renderTool();
    await screen.findByText("Kultur");
    await userEvent.click(screen.getByRole("button", { name: "StuPa" }));
    expect(await screen.findByText("Tim Meyer")).toBeInTheDocument();
  });

  it("filters Fachschaft members by faculty", async () => {
    renderTool();
    await screen.findByText("Kultur");
    await userEvent.click(screen.getByRole("button", { name: "Fachschaften" }));

    // Both faculties shown under "Alle".
    expect(await screen.findByText("Mia Mit")).toBeInTheDocument();
    expect(screen.getByText("Willi WiSo")).toBeInTheDocument();

    // Narrow to FS WiSo → the MIT member disappears.
    await userEvent.click(screen.getByRole("button", { name: "FS WiSo" }));
    await waitFor(() =>
      expect(screen.queryByText("Mia Mit")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Willi WiSo")).toBeInTheDocument();
  });
});
