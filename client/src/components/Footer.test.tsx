// client/src/components/Footer.test.tsx

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Footer from "./Footer";

describe("Footer", () => {
  it("links to the legal pages", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("link", { name: "Barrierefreiheit" }),
    ).toHaveAttribute("href", "/barrierefreiheit");
    expect(screen.getByRole("link", { name: "Impressum" })).toHaveAttribute(
      "href",
      "/impressum",
    );
    expect(screen.getByRole("link", { name: "Datenschutz" })).toHaveAttribute(
      "href",
      "/datenschutz",
    );
  });
});
