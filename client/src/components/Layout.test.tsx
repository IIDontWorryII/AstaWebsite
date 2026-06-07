// client/src/components/Layout.test.tsx
//
// A11y (AW-28): the layout exposes a skip link to a focusable <main> landmark.

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";

// Header reads useAuth; mock it so we don't need an AuthProvider here.
vi.mock("@/auth/AuthContext", () => ({
  useAuth: () => ({ user: null, loading: false }),
}));

describe("Layout", () => {
  it("renders a skip link pointing at the main landmark", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<p>Seiteninhalt</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    const skip = screen.getByRole("link", { name: "Zum Inhalt springen" });
    expect(skip).toHaveAttribute("href", "#main");

    const main = document.getElementById("main");
    expect(main).not.toBeNull();
    expect(main?.tagName).toBe("MAIN");
  });
});
