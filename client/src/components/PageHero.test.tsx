// client/src/components/PageHero.test.tsx

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PageHero from "./PageHero";

describe("PageHero", () => {
  it("renders the title as an h1 and the optional subtitle", () => {
    render(
      <PageHero image="/asta-hero.webp" title="AStA" subtitle="Vorstellung" />,
    );
    expect(
      screen.getByRole("heading", { level: 1, name: "AStA" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Vorstellung")).toBeInTheDocument();
  });

  it("renders without a subtitle when none is provided", () => {
    render(<PageHero image="/stupa-hero.webp" title="StuPa" />);
    expect(
      screen.getByRole("heading", { level: 1, name: "StuPa" }),
    ).toBeInTheDocument();
  });
});
