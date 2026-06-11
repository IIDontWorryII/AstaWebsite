// client/src/components/GremiumBadge.test.tsx

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import GremiumBadge from "./GremiumBadge";

describe("GremiumBadge", () => {
  it("renders AStA in red", () => {
    render(<GremiumBadge gremium="ASTA" />);
    expect(screen.getByText("ASTA")).toHaveClass("bg-asta-red");
  });

  it("renders StuPa in blue", () => {
    render(<GremiumBadge gremium="STUPA" />);
    expect(screen.getByText("STUPA")).toHaveClass("bg-blue-600");
  });

  it("falls back to grey for unknown gremien", () => {
    render(<GremiumBadge gremium="FS-MIT" />);
    expect(screen.getByText("FS-MIT")).toHaveClass("bg-gray-300");
  });
});
