// client/src/pages/ErstiInfo.test.tsx

import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import type { ErstiInfoDTO, PageDTO } from "../../../shared/types";
import ErstiInfo from "./ErstiInfo";

const mockFetchPage = vi.fn();
const mockFetchErsti = vi.fn();

vi.mock("@/lib/pages", () => ({
  fetchPage: (...args: unknown[]) => mockFetchPage(...args),
}));
vi.mock("@/lib/ersti", () => ({
  fetchErsti: (...args: unknown[]) => mockFetchErsti(...args),
}));

const page: PageDTO = {
  id: "page-ersti",
  slug: "ersti",
  title: "Ersti-Info",
  intro: null,
  heroImageUrl: null,
  sections: [
    { id: "step-1", order: 0, kind: "STEP", subtitle: null, body: "Uni-Account aktivieren", imageUrl: null, caption: null, email: null },
    { id: "step-2", order: 1, kind: "STEP", subtitle: null, body: "eduroam einrichten", imageUrl: null, caption: null, email: null },
    { id: "faq-1", order: 2, kind: "FAQ", subtitle: "Wie melde ich mich für Prüfungen an?", body: "<p>Über das ICMS.</p>", imageUrl: null, caption: null, email: null },
  ],
};

const fristen: ErstiInfoDTO = {
  pruefungsanmeldung: "01.–15.06.2026",
  klausurenphase: null,
  pruefungstermineMitUrl: null,
  pruefungstermineWisoUrl: null,
};

function renderPage() {
  return render(
    <MemoryRouter>
      <ErstiInfo />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.clear();
  mockFetchPage.mockReset().mockResolvedValue(page);
  mockFetchErsti.mockReset().mockResolvedValue(fristen);
});

describe("ErstiInfo", () => {
  it("renders the hero heading and the static launchpad links", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { level: 1, name: "Ersti-Info" }),
    ).toBeInTheDocument();
    const olat = screen.getByRole("link", { name: /OLAT/ });
    expect(olat).toHaveAttribute("href", "https://olat.vcrp.de/dmz/");
    expect(olat).toHaveAttribute("target", "_blank");
  });

  it("links internal help cards to the existing pages", () => {
    renderPage();
    expect(
      screen.getByRole("link", { name: /Fachschaften MIT & WiSo/ }),
    ).toHaveAttribute("href", "/gremien/fachschaften");
  });

  it("renders the editor-managed steps, FAQ and Fristen from the API", async () => {
    renderPage();
    expect(await screen.findByText("Uni-Account aktivieren")).toBeInTheDocument();
    expect(screen.getByText("eduroam einrichten")).toBeInTheDocument();
    expect(
      screen.getByText("Wie melde ich mich für Prüfungen an?"),
    ).toBeInTheDocument();
    expect(screen.getByText("01.–15.06.2026")).toBeInTheDocument();
    // Empty Klausurenphase shows the fallback.
    expect(screen.getByText("Wird noch bekannt gegeben.")).toBeInTheDocument();
  });

  it("toggles a step checkbox and persists it (by section id) to localStorage", async () => {
    renderPage();
    await screen.findByText("Uni-Account aktivieren");
    const firstBox = screen.getAllByRole("checkbox")[0];
    expect(firstBox).not.toBeChecked();

    await userEvent.click(firstBox);

    expect(firstBox).toBeChecked();
    expect(localStorage.getItem("ersti-erste-schritte-done")).toContain("step-1");
  });
});
