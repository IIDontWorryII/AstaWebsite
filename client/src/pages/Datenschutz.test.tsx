// client/src/pages/Datenschutz.test.tsx

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Datenschutz from "./Datenschutz";

describe("Datenschutz", () => {
  it("renders the privacy policy with the key sections", () => {
    render(
      <MemoryRouter>
        <Datenschutz />
      </MemoryRouter>,
    );
    // The h1 contains a soft hyphen (Datenschutz&shy;erklärung), so match loosely.
    expect(
      screen.getByRole("heading", { level: 1, name: /Datenschutz/ }),
    ).toBeInTheDocument();
    // Controller ("verantwortliche Stelle") section is present.
    expect(
      screen.getByRole("heading", { name: /verantwortlichen Stelle/i }),
    ).toBeInTheDocument();
    // Our actual hosting provider is named.
    expect(screen.getByText(/netcup GmbH/i)).toBeInTheDocument();
  });
});
