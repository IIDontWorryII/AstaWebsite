// client/src/components/SectionHeader.test.tsx

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SectionHeader from "./SectionHeader";

describe("SectionHeader", () => {
  it("renders the title (as h2 by default) and optional subtitle", () => {
    render(<SectionHeader title="Referate" subtitle="Unsere Aufgaben" />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Referate" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Unsere Aufgaben")).toBeInTheDocument();
  });

  it("omits the subtitle when not provided", () => {
    render(<SectionHeader title="Galerie" />);
    expect(
      screen.getByRole("heading", { name: "Galerie" }),
    ).toBeInTheDocument();
  });
});
