// client/src/pages/Barrierefreiheit.test.tsx

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Barrierefreiheit from "./Barrierefreiheit";

describe("Barrierefreiheit", () => {
  it("renders the voluntary accessibility statement with a feedback contact", () => {
    render(<Barrierefreiheit />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Barrierefreiheit" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Barrieren melden/ }),
    ).toBeInTheDocument();
    // Feedback contact is reachable.
    expect(
      screen.getByText("rac-asta-vorsitz@rheinahrcampus.de"),
    ).toBeInTheDocument();
  });
});
