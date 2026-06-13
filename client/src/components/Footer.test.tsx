// client/src/components/Footer.test.tsx
//
// Footer now reads auth state (useAuth) for the "Konto" block, so we mock
// the hook — useAuth throws outside an AuthProvider.

import { beforeEach, describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Footer from "./Footer";

const mockUseAuth = vi.fn();
vi.mock("@/auth/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

beforeEach(() => {
  // Default: logged out, not loading.
  mockUseAuth.mockReturnValue({ user: null, loading: false });
});

function renderFooter() {
  render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>,
  );
}

describe("Footer", () => {
  it("links to the legal pages", () => {
    renderFooter();
    expect(
      screen.getByRole("link", { name: "Barrierefreiheit" }),
    ).toHaveAttribute("href", "/barrierefreiheit");
    expect(screen.getByRole("link", { name: "Impressum" })).toHaveAttribute(
      "href",
      "/impressum",
    );
    expect(screen.getByRole("link", { name: "Datenschutz" })).toHaveAttribute(
      "href",
      "/datenschutz",
    );
  });

  it("shows Login and Registrieren when logged out", () => {
    renderFooter();
    expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(screen.getByRole("link", { name: "Registrieren" })).toHaveAttribute(
      "href",
      "/signup",
    );
  });

  it("shows a profile link (and no login) when logged in", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "u1", role: "USER" },
      loading: false,
    });
    renderFooter();
    expect(screen.getByRole("link", { name: "Mein Profil" })).toHaveAttribute(
      "href",
      "/profile",
    );
    expect(screen.queryByRole("link", { name: "Login" })).not.toBeInTheDocument();
  });

  it("links the Gremien video out to YouTube in a new tab", () => {
    renderFooter();
    const link = screen.getByRole("link", {
      name: /Video zu den studentischen Gremien auf YouTube ansehen/,
    });
    expect(link).toHaveAttribute(
      "href",
      "https://www.youtube.com/watch?v=IzE7e7AfZXs",
    );
    expect(link).toHaveAttribute("target", "_blank");
  });
});
