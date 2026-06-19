// client/src/components/MenuCarousel.test.tsx

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { PageSectionDTO } from "../../../shared/types";
import MenuCarousel from "./MenuCarousel";

function page(id: string, imageUrl: string | null): PageSectionDTO {
  return {
    id,
    order: 0,
    kind: "MENU",
    subtitle: null,
    body: null,
    imageUrl,
    caption: null,
    email: null,
  };
}

describe("MenuCarousel", () => {
  it("renders nothing when there are no pages with an image", () => {
    const { container } = render(<MenuCarousel sections={[page("a", null)]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the first page and a download link, no arrows for a single page", () => {
    render(<MenuCarousel sections={[page("a", "/menu1.jpg")]} label="Getränkekarte" />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "/menu1.jpg");
    expect(screen.getByRole("link", { name: /Herunterladen/ })).toHaveAttribute(
      "href",
      "/menu1.jpg",
    );
    expect(
      screen.queryByRole("button", { name: "Nächste Seite" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Seite/)).not.toBeInTheDocument();
  });

  it("pages through multiple images with the arrows and updates the counter + download", async () => {
    render(
      <MenuCarousel
        sections={[page("a", "/menu1.jpg"), page("b", "/menu2.jpg")]}
        label="Getränkekarte"
      />,
    );

    expect(screen.getByText("Seite 1 / 2")).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute("src", "/menu1.jpg");

    await userEvent.click(screen.getByRole("button", { name: "Nächste Seite" }));

    expect(screen.getByText("Seite 2 / 2")).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute("src", "/menu2.jpg");
    expect(screen.getByRole("link", { name: /Herunterladen/ })).toHaveAttribute(
      "href",
      "/menu2.jpg",
    );

    // Wraps back to the first page.
    await userEvent.click(screen.getByRole("button", { name: "Nächste Seite" }));
    expect(screen.getByText("Seite 1 / 2")).toBeInTheDocument();
  });

  it("opens the lightbox when the page image is clicked", async () => {
    render(<MenuCarousel sections={[page("a", "/menu1.jpg")]} />);
    await userEvent.click(screen.getByRole("button", { name: "Vergrößern" }));
    expect(
      screen.getByRole("button", { name: "Schließen" }),
    ).toBeInTheDocument();
  });
});
