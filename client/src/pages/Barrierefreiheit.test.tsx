// client/src/pages/Barrierefreiheit.test.tsx

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Barrierefreiheit from "./Barrierefreiheit";

describe("Barrierefreiheit", () => {
  it("renders the accessibility statement with the required sections", () => {
    render(<Barrierefreiheit />);
    expect(
      screen.getByRole("heading", { name: "Erklärung zur Barrierefreiheit" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Durchsetzungsverfahren/ }),
    ).toBeInTheDocument();
    // Feedback contact is reachable.
    expect(
      screen.getByText("rac-asta-vorsitz@rheinahrcampus.de"),
    ).toBeInTheDocument();
  });
});
