// client/src/pages/Impressum.test.tsx

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Impressum from "./Impressum";

describe("Impressum", () => {
  it("renders the imprint with the required § 5 DDG details", () => {
    render(<Impressum />);
    expect(
      screen.getByRole("heading", { name: "Impressum" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Angaben gemäß § 5 DDG/)).toBeInTheDocument();
    expect(
      screen.getByText("rac-asta-vorsitz@rheinahrcampus.de"),
    ).toBeInTheDocument();
  });
});
