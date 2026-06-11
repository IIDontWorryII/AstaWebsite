// client/src/components/PageHero.test.tsx

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PageHero from "./PageHero";

describe("PageHero", () => {
  it("shows the logo and keeps the title as an accessible heading", () => {
    render(<PageHero image="/asta-hero.webp" logo="/asta-logo.png" title="AStA" />);
    // The page still has an h1 even when a logo is shown.
    expect(screen.getByRole("heading", { level: 1, name: "AStA" })).toBeInTheDocument();
    // Logo uses the title as its alt text.
    expect(screen.getByAltText("AStA")).toBeInTheDocument();
  });

  it("renders the title as a visible heading when there's no logo", () => {
    render(<PageHero image="/stupa-hero.webp" title="StuPa" subtitle="Parlament" />);
    expect(
      screen.getByRole("heading", { level: 1, name: "StuPa" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Parlament")).toBeInTheDocument();
  });
});
