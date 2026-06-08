// client/src/pages/Datenschutz.test.tsx

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Datenschutz from "./Datenschutz";

describe("Datenschutz", () => {
  it("renders the privacy policy with controller and rights sections", () => {
    // Wrapped in a router because the page links to /impressum.
    render(
      <MemoryRouter>
        <Datenschutz />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: "Datenschutzerklärung" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Verantwortlicher/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Deine Rechte/ }),
    ).toBeInTheDocument();
  });
});
