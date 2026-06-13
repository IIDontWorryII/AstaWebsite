// client/src/components/GalleryCarousel.test.tsx

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { PageSectionDTO } from "../../../shared/types";
import GalleryCarousel from "./GalleryCarousel";

function gallery(id: string, imageUrl: string | null): PageSectionDTO {
  return {
    id,
    order: 0,
    kind: "GALLERY",
    subtitle: null,
    body: null,
    imageUrl,
    caption: null,
    email: null,
  };
}

describe("GalleryCarousel", () => {
  it("renders only items with an image", () => {
    render(
      <GalleryCarousel
        items={[gallery("a", "/1.jpg"), gallery("b", null)]}
      />,
    );
    expect(screen.getAllByRole("img")).toHaveLength(1);
  });

  it("opens the lightbox when a photo is clicked", async () => {
    render(<GalleryCarousel items={[gallery("a", "/1.jpg")]} />);
    // The thumbnail is a button; clicking it opens the full-screen image.
    await userEvent.click(screen.getAllByRole("button")[0]);
    expect(
      screen.getByRole("button", { name: "Schließen" }),
    ).toBeInTheDocument();
  });
});
