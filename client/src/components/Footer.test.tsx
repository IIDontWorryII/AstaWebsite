// client/src/components/Footer.test.tsx

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Footer from "./Footer";

describe("Footer", () => {
  it("links to the Barrierefreiheitserklärung", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );
    const link = screen.getByRole("link", { name: "Barrierefreiheit" });
    expect(link).toHaveAttribute("href", "/barrierefreiheit");
  });
});
